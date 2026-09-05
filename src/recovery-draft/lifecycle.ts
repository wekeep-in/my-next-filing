import { useCallback, useEffect, useRef, useState } from 'react'
import { browserStorage, latestQuestionnaireDate } from '@/app-context'
import type { ProfileGroup } from '@/evaluation'
import { TAX_YEAR } from '@/rules'
import { restoreSession } from '@/routes/check/session'
import type {
  QuestionnaireDispatch,
  QuestionnaireSession,
  QuestionnaireState,
} from '@/routes/check/session'
import type { SavedWorkspace } from '@/workspace'
import {
  deleteBrowserData,
  deleteRecoveryDraft,
  loadRecoveryDraft,
  recoveryFromSession,
  saveRecoveryDraft,
} from '@/recovery-draft'
import type {
  LoadRecoveryDraftResult,
  RecoveryDeleteResult,
  RecoveryDraftEnvelope,
} from '@/recovery-draft'

type RecoveryState = LoadRecoveryDraftResult | { readonly kind: 'write-failed' }
type RecoveryNotice = 'recovery-saved' | 'invalid-recovery-removed'
type RecoveryRemoval =
  | { readonly kind: 'start-over' | 'cleanup' | 'discard-newer' }
  | { readonly kind: 'saved-edit'; readonly group: ProfileGroup }
  | { readonly kind: 'delete-all'; readonly expectedRevision: number | null }
type PendingRemoval =
  | (Exclude<RecoveryRemoval, { readonly kind: 'delete-all' }> & {
      readonly result: RecoveryDeleteResult
    })
  | {
      readonly kind: 'delete-all'
      readonly expectedRevision: number | null
      readonly workspaceRemoved: boolean
      readonly message: string
    }
type RecoveryChange =
  | { readonly kind: 'restored'; readonly session: QuestionnaireSession }
  | {
      readonly kind: 'workspace-saved' | 'session-committed'
      readonly workspace: SavedWorkspace
    }
  | { readonly kind: 'workspace-removed' | 'removal-cancelled' }
  | { readonly kind: 'removed'; readonly intent: RecoveryRemoval }

function restoredSession(value: RecoveryDraftEnvelope, now: Date) {
  return restoreSession(
    value.draft,
    value.origin === 'personal'
      ? { kind: 'personal' }
      : {
          kind: 'saved-edit',
          baseWorkspaceRevision: value.baseWorkspaceRevision!,
        },
    latestQuestionnaireDate(now),
  )
}

export function useRecoveryLifecycle(
  {
    session,
    exampleReturn,
    exampleMode,
    workspaceSelected,
    initialized,
    dispatch: rawDispatch,
    selectWorkspace: rawSelectWorkspace,
    onNotice,
    onChange,
  }: {
    readonly session: QuestionnaireState
    readonly exampleReturn: QuestionnaireState
    readonly exampleMode: boolean
    readonly workspaceSelected: boolean
    readonly initialized: boolean
    readonly dispatch: QuestionnaireDispatch
    readonly selectWorkspace: (selected: boolean) => void
    readonly onNotice: (notice: RecoveryNotice) => void
    readonly onChange: (change: RecoveryChange) => void
  },
  storage = browserStorage,
) {
  const [state, setState] = useState<RecoveryState>({ kind: 'absent' })
  const [removal, setRemoval] = useState<PendingRemoval | null>(null)
  const noticeShown = useRef(false)
  // Pending intent pauses writes synchronously, before React commits state updates.
  const pending = useRef<RecoveryRemoval | null>(null)
  const generation = useRef(0)
  const renderGeneration = generation.current
  const dispatch = useCallback<QuestionnaireDispatch>(
    (event) => {
      // Field no-ops must not invalidate an Effect without scheduling a render.
      if (
        event.type === 'clear' ||
        event.type === 'start' ||
        event.type === 'start-over' ||
        event.type === 'restore'
      )
        generation.current++
      rawDispatch(event)
    },
    [rawDispatch],
  )
  const selectWorkspace = useCallback(
    (selected: boolean) => {
      generation.current++
      rawSelectWorkspace(selected)
    },
    [rawSelectWorkspace],
  )
  const inspect = useCallback(() => {
    const store = storage('sessionStorage')
    const loaded: LoadRecoveryDraftResult = store
      ? loadRecoveryDraft(store, TAX_YEAR)
      : { kind: 'unavailable' }
    setState(loaded)
    if (loaded.kind === 'invalid-removed') onNotice('invalid-recovery-removed')
    return loaded
  }, [onNotice, storage])
  const restore = useCallback(
    (now: Date) => {
      const loaded = inspect()
      return loaded.kind === 'ready' ? restoredSession(loaded.value, now) : null
    },
    [inspect],
  )
  const active =
    initialized &&
    !exampleMode &&
    !workspaceSelected &&
    session !== null &&
    session.origin.kind !== 'example'
  const synchronize = useCallback(() => {
    if (renderGeneration !== generation.current || pending.current || !active)
      return
    const loaded = inspect()
    if (
      loaded.kind === 'invalid-removal-failed' ||
      loaded.kind === 'deletion-unverified' ||
      loaded.kind === 'unavailable'
    )
      return
    const envelope = recoveryFromSession(session, TAX_YEAR)
    if (!envelope) return
    const store = storage('sessionStorage')
    const result = store
      ? saveRecoveryDraft(store, envelope)
      : { kind: 'unavailable' as const }
    if (result.kind === 'saved' || result.kind === 'unchanged') {
      // oxlint-disable-next-line react/set-state-in-effect -- Report the verified outcome of synchronizing with browser storage.
      setState({ kind: 'ready', value: result.value })
      if (result.kind === 'saved' && !noticeShown.current) {
        noticeShown.current = true
        onNotice('recovery-saved')
      }
    } else setState({ kind: 'write-failed' })
  }, [active, inspect, onNotice, renderGeneration, session, storage])
  useEffect(synchronize, [synchronize])

  const retry = () => {
    const loaded = inspect()
    const personal =
      session?.origin.kind === 'example' ? exampleReturn : session
    if (loaded.kind === 'ready' && !personal && !pending.current) {
      generation.current++
      onChange({
        kind: 'restored',
        session: restoredSession(loaded.value, new Date()),
      })
    }
    if (personal && (!active || pending.current)) {
      const expected = recoveryFromSession(personal, TAX_YEAR)
      if (
        (loaded.kind === 'ready' ||
          loaded.kind === 'absent' ||
          loaded.kind === 'invalid-removed') &&
        (loaded.kind !== 'ready' ||
          JSON.stringify(loaded.value) !== JSON.stringify(expected))
      )
        setState({ kind: 'write-failed' })
    }
    synchronize()
  }

  const remove = (intent: RecoveryRemoval): boolean => {
    generation.current++
    pending.current = intent
    if (intent.kind === 'delete-all') {
      const result = deleteBrowserData(
        storage('localStorage'),
        storage('sessionStorage'),
        intent.expectedRevision,
        new Date(),
      )
      const workspaceResult = result.workspace
      if (result.kind === 'failed' || result.kind === 'unverified') {
        setRemoval({
          ...intent,
          workspaceRemoved: false,
          message:
            workspaceResult.kind === 'deletion-unverified'
              ? "We couldn't check whether your saved answers and completion dates were removed. Your current work is still available in this tab. Try checking again."
              : workspaceResult.kind === 'conflict'
                ? 'Your saved data changed in another tab. Keep the remaining answers and review the saved workspace before deleting it.'
                : 'Saved data could not be removed. Your current answers are still here.',
        })
        return false
      }
      onChange({ kind: 'workspace-removed' })
      if (result.kind === 'partial') {
        pending.current = { kind: 'delete-all', expectedRevision: null }
        setRemoval({
          ...pending.current,
          workspaceRemoved: true,
          message:
            result.recovery.kind === 'deletion-unverified'
              ? "Your saved workspace was removed. We couldn't check whether your in-progress answers were removed from this tab's storage. Your current answers are still here."
              : 'Your saved workspace was removed. Your in-progress answers could not be removed from this tab. Try deleting them again.',
        })
        return false
      }
    } else {
      const store = storage('sessionStorage')
      const result: RecoveryDeleteResult = store
        ? deleteRecoveryDraft(store)
        : { kind: 'unavailable' }
      if (result.kind !== 'deleted' && result.kind !== 'absent') {
        setRemoval({ ...intent, result })
        return false
      }
    }
    setState({ kind: 'absent' })
    setRemoval(null)
    onChange({ kind: 'removed', intent })
    pending.current = null
    return true
  }
  const workspaceSaved = (
    workspace: SavedWorkspace,
    commitSession: boolean,
  ) => {
    if (!commitSession) {
      onChange({ kind: 'workspace-saved', workspace })
      return
    }
    generation.current++
    pending.current = { kind: 'cleanup' }
    // Clear the committed session before cleanup can fail or a pending Effect can run.
    onChange({ kind: 'session-committed', workspace })
    remove(pending.current)
  }
  const cancelRemoval = () => {
    if (!pending.current || pending.current.kind === 'cleanup') return
    generation.current++
    pending.current = null
    setRemoval(null)
    onChange({ kind: 'removal-cancelled' })
  }
  return {
    state,
    removal,
    writesPaused: removal?.kind === 'delete-all',
    dispatch,
    selectWorkspace,
    restore,
    retry,
    remove,
    workspaceSaved,
    deleteAll: (expectedRevision: number | null) =>
      remove({ kind: 'delete-all', expectedRevision }),
    retryRemoval: () => {
      if (pending.current) remove(pending.current)
    },
    cancelRemoval,
  }
}
