import type { MouseEvent } from 'react'
import { browserStorage, latestQuestionnaireDate } from '@/app-context'
import type { AppOutletContext } from '@/app-context'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import { cn } from 'cn'
import {
  Outlet,
  createBrowserRouter,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { ExternalLink } from '@/components/external-link'
import { TopBar } from '@/components/top-bar'
import { Button } from '@/components/ui/button'
import { TAX_YEAR } from '@/rules'
import type { ProfileGroup } from '@/evaluation'
import {
  WORKSPACE_KEY,
  deleteLegacyWorkspace,
  loadSavedWorkspace,
} from '@/workspace'
import type { LoadSavedWorkspaceResult, SavedWorkspace } from '@/workspace'
import {
  canSynchronizeRecovery,
  deleteBrowserData,
  deleteRecoveryDraft,
  loadRecoveryDraft,
  recoveryFromSession,
  saveRecoveryDraft,
} from '@/recovery-draft'
import type {
  LoadRecoveryDraftResult,
  RecoveryDeleteResult,
} from '@/recovery-draft'
import {
  blankDraft,
  exampleProfile,
  firstIncompleteGroup,
  isBlankDraft,
  questionnaireGroupFromPath,
} from '@/routes/check/model'
import {
  questionnaireReducer,
  restoreSession,
  sessionFromProfile,
} from '@/routes/check/session'
import type {
  QuestionnaireDispatch,
  QuestionnaireSession,
  QuestionnaireState,
} from '@/routes/check/session'
import { CheckGroup, CheckIndex, CheckRoute } from '@/routes/check'
import { LandingRoute } from '@/routes/landing'
import { NotFoundRoute } from '@/routes/not-found'
import { PlanRoute } from '@/routes/plan'
import { usePageTransition } from '@/lib/page-transition'

type Notice =
  | 'recovery-saved'
  | 'invalid-recovery-removed'
  | 'legacy-deleted'
  | 'all-deleted'
const noticeCopy: Record<Notice, string> = {
  'recovery-saved':
    'Your answers will stay available if you refresh this tab. Closing the tab may remove them.',
  'invalid-recovery-removed':
    "Your previous answers couldn't be restored and were removed from this tab. Start again below.",
  'legacy-deleted':
    'Your previously saved answers and completion dates were removed because this version uses a new workspace.',
  'all-deleted':
    'Your saved answers and completion dates were removed from this browser. Your in-progress answers were removed from this tab.',
}
type RecoveryState = LoadRecoveryDraftResult | { readonly kind: 'write-failed' }
type Removal =
  | {
      readonly kind: 'saved-edit'
      readonly group: ProfileGroup
      readonly result: RecoveryDeleteResult
    }
  | {
      readonly kind: 'start-over' | 'cleanup' | 'discard-newer'
      readonly result: RecoveryDeleteResult
    }
  | {
      readonly kind: 'delete-all'
      readonly expectedRevision: number | null
      readonly workspaceRemoved: boolean
      readonly message: string
    }
type Confirmation =
  | { readonly kind: 'start-over' }
  | {
      readonly kind: 'saved-edit'
      readonly group: ProfileGroup
    }

function AppFrame() {
  const location = useLocation()
  const navigate = useNavigate()
  const content = usePageTransition()
  const [session, rawDispatch] = useReducer(questionnaireReducer, null)
  const [savedWorkspace, setSavedWorkspace] =
    useState<LoadSavedWorkspaceResult>({ kind: 'absent' })
  const [recovery, setRecovery] = useState<RecoveryState>({ kind: 'absent' })
  const [workspaceSelected, rawSelectWorkspace] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [removal, setRemoval] = useState<Removal | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [exampleReturn, setExampleReturn] =
    useState<QuestionnaireSession | null>(null)
  const initializedOnce = useRef(false)
  const recoveryNoticeShown = useRef(false)
  const legacyNoticeShown = useRef(false)
  const synchronizationPaused = useRef(false)
  const sessionVersion = useRef(0)
  const renderVersion = sessionVersion.current
  const dispatch = useCallback<QuestionnaireDispatch>((event) => {
    // Only session replacement cancels pending Recovery Effects; field no-ops need no render.
    if (
      event.type === 'clear' ||
      event.type === 'start' ||
      event.type === 'start-over' ||
      event.type === 'restore'
    )
      sessionVersion.current++
    rawDispatch(event)
  }, [])
  const setWorkspaceSelected = useCallback((selected: boolean) => {
    sessionVersion.current++
    rawSelectWorkspace(selected)
  }, [])
  const dialog = useRef<HTMLDialogElement>(null)
  const confirmationTrigger = useRef<HTMLElement | null>(null)
  const showConfirmation = (next: Confirmation, trigger?: HTMLElement) => {
    confirmationTrigger.current =
      trigger ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null)
    setConfirmation(next)
  }

  const refreshSavedWorkspace = useCallback(() => {
    const storage = browserStorage('localStorage')
    let loaded: LoadSavedWorkspaceResult = storage
      ? loadSavedWorkspace(storage, new Date())
      : { kind: 'unavailable', reason: 'storage-unavailable' }
    if (storage && loaded.kind === 'legacy') {
      const removed = deleteLegacyWorkspace(storage)
      if (removed.kind === 'legacy-deleted' && !legacyNoticeShown.current) {
        legacyNoticeShown.current = true
        setNotice('legacy-deleted')
      }
      loaded =
        removed.kind === 'legacy-removal-failed' ||
        removed.kind === 'legacy-removal-unverified'
          ? { kind: removed.kind }
          : removed.kind === 'unavailable'
            ? { kind: 'unavailable', reason: 'storage-unavailable' }
            : loadSavedWorkspace(storage, new Date())
    }
    setSavedWorkspace(loaded)
    return loaded
  }, [])

  const cleanupRecovery = useCallback(
    (kind: 'start-over' | 'cleanup' | 'discard-newer'): boolean => {
      sessionVersion.current++
      synchronizationPaused.current = true
      const storage = browserStorage('sessionStorage')
      const result: RecoveryDeleteResult = storage
        ? deleteRecoveryDraft(storage)
        : { kind: 'unavailable' }
      if (result.kind !== 'deleted' && result.kind !== 'absent') {
        setRemoval({ kind, result })
        return false
      }
      setRecovery({ kind: 'absent' })
      setRemoval(null)
      synchronizationPaused.current = false
      if (kind === 'discard-newer') {
        setExampleReturn(null)
        dispatch({ type: 'clear' })
        setWorkspaceSelected(true)
        refreshSavedWorkspace()
        void navigate('/plan', { replace: true })
      }
      if (kind === 'start-over') {
        setExampleReturn(null)
        setWorkspaceSelected(false)
        setDeleted(false)
        dispatch({ type: 'start-over' })
        synchronizationPaused.current = false
        void navigate('/check/tax-year', { replace: true })
      }
      return true
    },
    [dispatch, navigate, refreshSavedWorkspace, setWorkspaceSelected],
  )

  useLayoutEffect(() => {
    if (initializedOnce.current) return
    initializedOnce.current = true
    const now = new Date()
    const workspace = refreshSavedWorkspace()
    const storage = browserStorage('sessionStorage')
    const loaded: LoadRecoveryDraftResult = storage
      ? loadRecoveryDraft(storage, TAX_YEAR)
      : { kind: 'unavailable' }
    setRecovery(loaded)
    let restored: QuestionnaireState = null
    if (loaded.kind === 'ready') {
      restored = restoreSession(
        loaded.value.draft,
        loaded.value.origin === 'personal'
          ? { kind: 'personal' }
          : {
              kind: 'saved-edit',
              baseWorkspaceRevision: loaded.value.baseWorkspaceRevision!,
            },
        latestQuestionnaireDate(now),
      )
      if (
        restored.kind === 'complete' &&
        workspace.kind === 'ready' &&
        JSON.stringify(restored.profile) ===
          JSON.stringify(workspace.workspace.active?.profile)
      ) {
        restored = null
        // oxlint-disable-next-line react/set-state-in-effect -- Restoration reports verified storage cleanup before the first paint.
        cleanupRecovery('cleanup')
      }
    } else if (loaded.kind === 'invalid-removed')
      setNotice('invalid-recovery-removed')
    if (
      !restored &&
      (location.pathname === '/check' ||
        location.pathname === '/check/' ||
        questionnaireGroupFromPath(location.pathname))
    )
      restored = {
        kind: 'editing',
        origin: { kind: 'personal' },
        draft: blankDraft(),
        validationGroup: null,
      }
    dispatch({ type: 'restore', session: restored })
    setInitialized(true)
  }, [cleanupRecovery, dispatch, location.pathname, refreshSavedWorkspace])

  const synchronizeRecovery = useCallback(() => {
    if (
      renderVersion !== sessionVersion.current ||
      synchronizationPaused.current ||
      !canSynchronizeRecovery(
        session,
        initialized,
        workspaceSelected,
        removal !== null,
      )
    )
      return
    const storage = browserStorage('sessionStorage')
    if (!storage) {
      // oxlint-disable-next-line react/set-state-in-effect -- Report an unavailable browser store from its synchronization Effect.
      setRecovery({ kind: 'unavailable' })
      return
    }
    const loaded = loadRecoveryDraft(storage, TAX_YEAR)
    if (
      loaded.kind === 'invalid-removal-failed' ||
      loaded.kind === 'deletion-unverified' ||
      loaded.kind === 'unavailable'
    ) {
      setRecovery(loaded)
      return
    }
    if (loaded.kind === 'invalid-removed') setNotice('invalid-recovery-removed')
    const envelope = recoveryFromSession(session, TAX_YEAR)
    if (!envelope) return
    const result = saveRecoveryDraft(storage, envelope)
    if (result.kind === 'saved' || result.kind === 'unchanged') {
      setRecovery({ kind: 'ready', value: result.value })
      if (result.kind === 'saved' && !recoveryNoticeShown.current) {
        recoveryNoticeShown.current = true
        setNotice('recovery-saved')
      }
    } else setRecovery({ kind: 'write-failed' })
  }, [initialized, removal, renderVersion, session, workspaceSelected])
  const retryRecovery = () => {
    const storage = browserStorage('sessionStorage')
    const loaded: LoadRecoveryDraftResult = storage
      ? loadRecoveryDraft(storage, TAX_YEAR)
      : { kind: 'unavailable' }
    setRecovery(loaded)
    if (loaded.kind === 'invalid-removed') setNotice('invalid-recovery-removed')
    if (
      loaded.kind === 'ready' &&
      (!session || (session.origin.kind === 'example' && !exampleReturn))
    ) {
      const restored = restoreSession(
        loaded.value.draft,
        loaded.value.origin === 'personal'
          ? { kind: 'personal' }
          : {
              kind: 'saved-edit',
              baseWorkspaceRevision: loaded.value.baseWorkspaceRevision!,
            },
        latestQuestionnaireDate(new Date()),
      )
      if (session?.origin.kind === 'example') setExampleReturn(restored)
      else dispatch({ type: 'restore', session: restored })
    }
    const personal =
      session?.origin.kind === 'example' ? exampleReturn : session
    if (
      personal &&
      !canSynchronizeRecovery(
        session,
        initialized,
        workspaceSelected,
        removal !== null,
      )
    ) {
      const expected = recoveryFromSession(personal, TAX_YEAR)
      if (
        (loaded.kind === 'ready' ||
          loaded.kind === 'absent' ||
          loaded.kind === 'invalid-removed') &&
        (loaded.kind !== 'ready' ||
          JSON.stringify(loaded.value) !== JSON.stringify(expected))
      )
        setRecovery({ kind: 'write-failed' })
    }
    synchronizeRecovery()
  }
  useEffect(synchronizeRecovery, [synchronizeRecovery])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [notice])
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === WORKSPACE_KEY || event.key === null)
        refreshSavedWorkspace()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refreshSavedWorkspace])
  useEffect(() => {
    const target = location.hash
      ? document.getElementById(location.hash.slice(1))
      : null
    if (target)
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      })
    else window.scrollTo(0, 0)
  }, [location.hash, location.pathname])
  useEffect(() => {
    const element = dialog.current
    if (!confirmation || !element) return
    element.showModal()
    element.querySelector<HTMLButtonElement>('[data-safe-action]')?.focus()
    return () => {
      element.close()
      if (confirmationTrigger.current?.isConnected)
        confirmationTrigger.current.focus()
    }
  }, [confirmation])

  const startPersonal = () => {
    if (session && !isBlankDraft(session.draft)) {
      showConfirmation({ kind: 'start-over' })
      return
    }
    synchronizationPaused.current = removal !== null
    setExampleReturn(null)
    setDeleted(false)
    setWorkspaceSelected(false)
    dispatch({ type: 'start-over' })
    void navigate('/check/tax-year')
  }
  const startExample = () => {
    if (session?.origin.kind !== 'example') setExampleReturn(session)
    setWorkspaceSelected(false)
    setDeleted(false)
    dispatch({
      type: 'restore',
      session: sessionFromProfile(
        exampleProfile,
        { kind: 'example' },
        latestQuestionnaireDate(new Date()),
      ),
    })
    void navigate('/check/tax-year')
  }
  const returnPersonal = () => {
    const returned =
      session?.origin.kind === 'example' ? exampleReturn : session
    setExampleReturn(null)
    setWorkspaceSelected(false)
    setDeleted(false)
    if (!returned) {
      synchronizationPaused.current = false
      dispatch({ type: 'start-over' })
      void navigate('/check/tax-year')
      return
    }
    dispatch({ type: 'restore', session: returned })
    void navigate(
      returned.kind === 'complete'
        ? '/plan'
        : `/check/${firstIncompleteGroup(returned.draft, latestQuestionnaireDate(new Date())) ?? 'review'}`,
    )
  }
  const openWorkspace = () => {
    if (session?.origin.kind === 'example') {
      dispatch({ type: 'restore', session: exampleReturn })
      setExampleReturn(null)
    }
    setWorkspaceSelected(true)
    setDeleted(false)
    void navigate('/plan')
  }
  const beginSavedEdit = (group: ProfileGroup, discardVerified = false) => {
    if (
      savedWorkspace.kind !== 'ready' ||
      !savedWorkspace.workspace.active ||
      (removal && !discardVerified)
    )
      return
    synchronizationPaused.current = false
    setExampleReturn(null)
    setWorkspaceSelected(false)
    const workspace = savedWorkspace.workspace
    dispatch({
      type: 'restore',
      session: sessionFromProfile(
        workspace.active!.profile,
        { kind: 'saved-edit', baseWorkspaceRevision: workspace.revision },
        latestQuestionnaireDate(new Date()),
      ),
    })
    void navigate(`/check/${group}`)
  }
  const discardForSavedEdit = (group: ProfileGroup) => {
    sessionVersion.current++
    synchronizationPaused.current = true
    const storage = browserStorage('sessionStorage')
    const result: RecoveryDeleteResult = storage
      ? deleteRecoveryDraft(storage)
      : { kind: 'unavailable' }
    if (result.kind !== 'deleted' && result.kind !== 'absent') {
      setRemoval({ kind: 'saved-edit', group, result })
      return
    }
    setRecovery({ kind: 'absent' })
    setRemoval(null)
    beginSavedEdit(group, true)
  }
  const editGroup = (group: ProfileGroup) => {
    if (workspaceSelected || !session) {
      if (session && !isBlankDraft(session.draft)) {
        showConfirmation({ kind: 'saved-edit', group })
        return
      }
      beginSavedEdit(group)
    } else {
      dispatch({ type: 'clear-validation' })
      void navigate(`/check/${group}`)
    }
  }
  const startOver = (event?: MouseEvent<HTMLElement>) => {
    if (session && !isBlankDraft(session.draft))
      showConfirmation({ kind: 'start-over' }, event?.currentTarget)
    else cleanupRecovery('start-over')
  }
  const workspaceSaved = (
    workspace: SavedWorkspace,
    commitSession: boolean,
  ) => {
    setSavedWorkspace({ kind: 'ready', workspace })
    if (commitSession) {
      synchronizationPaused.current = true
      dispatch({ type: 'clear' })
      setWorkspaceSelected(true)
      setExampleReturn(null)
      cleanupRecovery('cleanup')
    }
  }
  const deleteAll = (expectedRevision: number | null): boolean => {
    sessionVersion.current++
    synchronizationPaused.current = true
    const result = deleteBrowserData(
      browserStorage('localStorage'),
      browserStorage('sessionStorage'),
      expectedRevision,
      new Date(),
    )
    const workspaceResult = result.workspace
    if (result.kind === 'failed' || result.kind === 'unverified') {
      setRemoval({
        kind: 'delete-all',
        expectedRevision,
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
    setSavedWorkspace({ kind: 'absent' })
    setWorkspaceSelected(false)
    const recoveryResult = result.recovery
    if (result.kind === 'partial' && recoveryResult) {
      setRemoval({
        kind: 'delete-all',
        expectedRevision: null,
        workspaceRemoved: true,
        message:
          recoveryResult.kind === 'deletion-unverified'
            ? "Your saved workspace was removed. We couldn't check whether your in-progress answers were removed from this tab's storage. Your current answers are still here."
            : 'Your saved workspace was removed. Your in-progress answers could not be removed from this tab. Try deleting them again.',
      })
      return false
    }
    setRemoval(null)
    setRecovery({ kind: 'absent' })
    setExampleReturn(null)
    dispatch({ type: 'clear' })
    setWorkspaceSelected(false)
    setDeleted(true)
    setNotice('all-deleted')
    void navigate('/plan', { replace: true })
    return true
  }
  const retryRemoval = () => {
    if (removal?.kind === 'delete-all') deleteAll(removal.expectedRevision)
    else if (removal?.kind === 'saved-edit') discardForSavedEdit(removal.group)
    else if (removal) cleanupRecovery(removal.kind)
  }
  const cancelRemoval = () => {
    setRemoval(null)
    synchronizationPaused.current = false
    refreshSavedWorkspace()
  }
  const confirm = () => {
    if (confirmation?.kind === 'start-over') cleanupRecovery('start-over')
    else if (confirmation?.kind === 'saved-edit')
      discardForSavedEdit(confirmation.group)
    setConfirmation(null)
  }
  const context: AppOutletContext = {
    session,
    personalSession:
      session?.origin.kind === 'example' ? exampleReturn : session,
    dispatch,
    savedWorkspace,
    workspaceSelected,
    deleted,
    writesPaused: removal?.kind === 'delete-all',
    refreshSavedWorkspace,
    startPersonal,
    startExample,
    returnPersonal,
    openWorkspace,
    editGroup,
    startOver,
    discardSavedEdit: () => cleanupRecovery('discard-newer'),
    workspaceSaved,
    deleteAll,
  }
  const recoveryFailed =
    recovery.kind === 'unavailable' ||
    recovery.kind === 'write-failed' ||
    recovery.kind === 'invalid-removal-failed' ||
    recovery.kind === 'deletion-unverified'
  const workspaceFailed =
    savedWorkspace.kind !== 'ready' && savedWorkspace.kind !== 'absent'
  return (
    <div
      className={cn(
        'flex min-h-svh flex-col',
        location.pathname === '/' && 'app--landing',
        (location.pathname === '/check' ||
          location.pathname === '/check/' ||
          questionnaireGroupFromPath(location.pathname) !== null ||
          location.pathname === '/plan') &&
          'app--journey',
      )}
    >
      {notice && (
        <TopBar
          variant={
            notice === 'recovery-saved'
              ? 'info'
              : notice === 'all-deleted'
                ? 'success'
                : 'warning'
          }
        >
          {noticeCopy[notice]}
        </TopBar>
      )}
      {recoveryFailed && (
        <TopBar variant="warning">
          {recovery.kind === 'deletion-unverified'
            ? "We couldn't check whether your in-progress answers were removed from this tab's storage. Your current answers are still here. Try checking again."
            : "This browser couldn't store your answers for refresh recovery. Your answers are still here, but a refresh may remove them."}{' '}
          <Button variant="link" onClick={retryRecovery}>
            Retry refresh recovery
          </Button>
        </TopBar>
      )}
      {workspaceFailed && (
        <TopBar variant="warning">
          {savedWorkspace.kind === 'legacy-removal-unverified'
            ? "We couldn't check whether your previously saved answers and completion dates were removed. Saving is paused until we can check again."
            : savedWorkspace.kind === 'legacy' ||
                savedWorkspace.kind === 'legacy-removal-failed'
              ? 'Your previously saved data could not be removed. You can continue an estimate in this tab; saving is paused.'
              : 'Your saved workspace could not be restored. You can continue an estimate in this tab.'}{' '}
          <Button variant="link" onClick={refreshSavedWorkspace}>
            Check saved data again
          </Button>
        </TopBar>
      )}
      {removal && (
        <TopBar variant="destructive">
          {removal.kind === 'delete-all'
            ? removal.message
            : removal.result.kind === 'deletion-unverified'
              ? "We couldn't check whether your in-progress answers were removed from this tab's storage. Your current work is still available."
              : removal.kind === 'cleanup'
                ? 'Your workspace was saved, but its refresh copy could not be removed from this tab.'
                : 'Your in-progress answers could not be removed. Your current answers are still here.'}{' '}
          <Button variant="link" onClick={retryRemoval}>
            Retry deletion
          </Button>{' '}
          {removal.kind !== 'cleanup' && (
            <Button variant="link" onClick={cancelRemoval}>
              Keep remaining answers
            </Button>
          )}
        </TopBar>
      )}
      <main ref={content}>{initialized && <Outlet context={context} />}</main>
      {confirmation && (
        <dialog
          ref={dialog}
          className="app-confirmation"
          aria-labelledby="confirmation-title"
          aria-describedby="confirmation-description"
          onCancel={(event) => {
            event.preventDefault()
            setConfirmation(null)
          }}
        >
          <h2 id="confirmation-title">
            {confirmation.kind === 'start-over'
              ? 'Start over with blank answers?'
              : 'Discard your estimate and edit saved data?'}
          </h2>
          <p id="confirmation-description">
            This removes your in-progress answers from this tab. Your saved
            workspace and completion dates will not change. This cannot be
            undone.
          </p>
          <div className="button-row">
            <Button
              className="min-w-0 whitespace-normal max-[520px]:w-full"
              variant="destructive"
              onClick={confirm}
            >
              {confirmation.kind === 'start-over'
                ? 'Clear answers and start over'
                : 'Discard draft and edit saved data'}
            </Button>
            <Button
              className="min-w-0 whitespace-normal max-[520px]:w-full"
              variant="outline"
              data-safe-action
              onClick={() => setConfirmation(null)}
            >
              Keep my answers
            </Button>
          </div>
        </dialog>
      )}
      <footer className="site-footer">
        <p>
          © 2026 <ExternalLink href="https://wekeep.in">WeKeep</ExternalLink>.
          All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <AppFrame />,
    children: [
      { index: true, element: <LandingRoute /> },
      {
        path: '/check',
        caseSensitive: true,
        element: <CheckRoute />,
        children: [
          { index: true, element: <CheckIndex /> },
          {
            path: 'tax-year',
            caseSensitive: true,
            element: <CheckGroup group="tax-year" />,
          },
          {
            path: 'activity',
            caseSensitive: true,
            element: <CheckGroup group="activity" />,
          },
          {
            path: 'receipts',
            caseSensitive: true,
            element: <CheckGroup group="receipts" />,
          },
          {
            path: 'clients',
            caseSensitive: true,
            element: <CheckGroup group="clients" />,
          },
          {
            path: 'other-income',
            caseSensitive: true,
            element: <CheckGroup group="other-income" />,
          },
          {
            path: 'gst',
            caseSensitive: true,
            element: <CheckGroup group="gst" />,
          },
          {
            path: 'review',
            caseSensitive: true,
            element: <CheckGroup group="review" />,
          },
          { path: '*', element: <NotFoundRoute /> },
        ],
      },
      { path: '/plan', element: <PlanRoute /> },
      { path: '*', element: <NotFoundRoute /> },
    ],
  },
])
