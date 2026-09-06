import { useLayoutEffect, useReducer, useRef, useState } from 'react'
import { test } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import type { RenderHookResult } from 'vitest-browser-react'
import { useRecoveryLifecycle } from '../../src/recovery-draft/lifecycle'
import { RECOVERY_KEY, recoveryFromSession } from '../../src/recovery-draft'
import { exampleProfile, isBlankDraft } from '../../src/routes/check/model'
import {
  questionnaireReducer,
  sessionFromProfile,
} from '../../src/routes/check/session'
import type { QuestionnaireState } from '../../src/routes/check/session'
import { TAX_YEAR, currentRules } from '../../src/rules'
import { WORKSPACE_KEY, saveSavedWorkspace } from '../../src/workspace'
import { TestStorage } from '../helpers/storage'

type Lifecycle = ReturnType<typeof useRecoveryLifecycle>
type Snapshot = {
  readonly lifecycle: Lifecycle
  readonly session: QuestionnaireState
  readonly selected: boolean
}
type Scenario = {
  readonly initial?: QuestionnaireState
  readonly exampleReturn?: QuestionnaireState
  readonly initialized?: boolean
  readonly exampleMode?: boolean
  readonly beforeEffects?: (lifecycle: Lifecycle) => void
}
const now = new Date('2026-09-05T12:00:00+05:30')
const personal = sessionFromProfile(
  exampleProfile,
  { kind: 'personal' },
  '2026-09-05',
)

function useRecoveryScenario({
  initial = personal,
  exampleReturn = null,
  initialized = true,
  exampleMode = false,
  beforeEffects,
  storage,
  notice,
}: Scenario & {
  readonly storage: Parameters<typeof useRecoveryLifecycle>[1]
  readonly notice: (value: string) => void
}) {
  const [session, dispatch] = useReducer(questionnaireReducer, initial)
  const [selected, selectWorkspace] = useState(false)
  const started = useRef(false)
  const lifecycle = useRecoveryLifecycle(
    {
      session,
      exampleReturn,
      initialized,
      exampleMode,
      workspaceSelected: selected,
      dispatch,
      selectWorkspace,
      onNotice: notice,
      onChange: (change) => {
        if (change.kind === 'session-committed') {
          dispatch({ type: 'clear' })
          selectWorkspace(true)
        } else if (change.kind === 'workspace-removed') selectWorkspace(false)
        else if (change.kind === 'restored')
          dispatch({ type: 'restore', session: change.session })
        else if (
          change.kind === 'removed' &&
          change.intent.kind === 'delete-all'
        )
          dispatch({ type: 'clear' })
        else if (
          change.kind === 'removed' &&
          change.intent.kind === 'start-over'
        )
          dispatch({ type: 'start-over' })
      },
    },
    storage,
  )
  useLayoutEffect(() => {
    if (!started.current) {
      started.current = true
      beforeEffects?.(lifecycle)
    }
  })

  return { lifecycle, session, selected }
}

function setupRecovery() {
  const local = new TestStorage()
  const tab = new TestStorage()
  const storage = (area: 'localStorage' | 'sessionStorage') =>
    area === 'localStorage' ? local : tab
  const notices: string[] = []
  const notice = (value: string) => {
    notices.push(value)
  }
  let mounted: RenderHookResult<Snapshot, Scenario> | undefined
  const current = () => mounted!.result.current
  const check = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message)
  }
  const render = async (scenario: Scenario = {}, fresh = true) => {
    if (mounted && !fresh) {
      await mounted.rerender(scenario)
      return
    }
    await mounted?.unmount()
    mounted = await renderHook(
      (initial: Scenario = {}) =>
        useRecoveryScenario({ ...initial, storage, notice }),
      { initialProps: scenario },
    )
  }
  const run = async (action: (lifecycle: Lifecycle) => void) => {
    await mounted!.act(() => action(current().lifecycle))
  }
  const seed = () => {
    tab.readsFail = false
    tab.writesFail = false
    tab.removal = 'normal'
    tab.setItem(
      RECOVERY_KEY,
      JSON.stringify(recoveryFromSession(personal, TAX_YEAR)),
    )
    tab.writes = 0
  }
  const saved = saveSavedWorkspace(
    local,
    null,
    {
      noticeVersion: 2,
      consentDecidedAt: now.toISOString(),
      activeTaxYear: TAX_YEAR,
      active: {
        profile: exampleProfile,
        completions: [],
        ruleDatasetId: currentRules.id,
      },
      priorYears: [],
    },
    now,
  )
  if (saved.kind !== 'saved')
    throw new Error('Could not prepare synthetic workspace')
  const workspace = saved.workspace
  return { local, tab, notices, current, check, render, run, seed, workspace }
}

test('keeps deletion intact before pending and later Effects', async () => {
  const { seed, render, workspace, check, tab, local, current } =
    setupRecovery()
  seed()
  await render({
    beforeEffects: (lifecycle) => {
      lifecycle.deleteAll(workspace.revision)
    },
  })
  check(
    tab.getItem(RECOVERY_KEY) === null && local.getItem(WORKSPACE_KEY) === null,
    'Delete both keys before a pending Effect runs',
  )
  check(
    tab.writes === 0 && current().session === null,
    'A stale Effect must never recreate deleted answers',
  )
  await render({}, false)
  check(tab.writes === 0, 'Later rendering must keep full deletion intact')
})

test('replaces old answers with only a new blank draft', async () => {
  const { seed, render, check, current, tab } = setupRecovery()
  seed()
  await render({
    beforeEffects: (lifecycle) => {
      lifecycle.remove({ kind: 'start-over' })
    },
  })
  check(
    Boolean(current().session && isBlankDraft(current().session!.draft)),
    'Start over must replace the old session',
  )
  check(
    tab.writes === 1,
    'Only the new blank Draft may be written after Start over',
  )
})

test('restores before synchronization without rewriting identical drafts', async () => {
  const { seed, render, check, tab, current, run } = setupRecovery()
  seed()
  await render({ initialized: false })
  check(
    tab.writes === 0 && current().lifecycle.state.kind === 'absent',
    'Initial storage inspection must precede synchronization',
  )
  await run((lifecycle) => {
    const restored = lifecycle.restore(now)
    check(
      restored?.kind === 'complete',
      'Restoration must freshly parse a complete Draft',
    )
    lifecycle.dispatch({ type: 'restore', session: restored })
  })
  await render({}, false)
  check(
    tab.writes === 0 && current().lifecycle.state.kind === 'ready',
    'An identical restored Draft must not be rewritten',
  )
})

test('pauses Recovery for examples and selected workspaces', async () => {
  const { seed, tab, render, check } = setupRecovery()
  for (const scenario of [
    { exampleMode: true },
    {
      initial: sessionFromProfile(
        exampleProfile,
        { kind: 'example' },
        '2026-09-05',
      ),
      exampleReturn: personal,
    },
    {
      beforeEffects: (lifecycle: Lifecycle) => lifecycle.selectWorkspace(true),
    },
  ]) {
    seed()
    tab.removeItem(RECOVERY_KEY)
    await render(scenario)
    check(
      tab.writes === 0,
      'Examples and explicit Saved-workspace selection must pause Recovery',
    )
  }
})

test('does not let a no-op event cancel a required Recovery write', async () => {
  const { seed, tab, render, check, run, notices } = setupRecovery()
  seed()
  tab.removeItem(RECOVERY_KEY)
  await render({
    beforeEffects: (lifecycle) =>
      lifecycle.dispatch({ type: 'clear-validation' }),
  })
  check(
    tab.writes === 1,
    'A no-op field event must not cancel a required Recovery write',
  )
  await run((lifecycle) => lifecycle.retry())
  check(tab.writes === 1, 'An unchanged retry must not rewrite Recovery')
  check(
    notices.filter((value) => value === 'recovery-saved').length === 1,
    'Show one first-write notice per mounted lifecycle',
  )
  seed()
  tab.removeItem(RECOVERY_KEY)
  await render()
  check(
    notices.filter((value) => value === 'recovery-saved').length === 2,
    'A new mounted lifecycle has its own first-write notice',
  )
})

test('preserves unrelated work and retries cleanup after committing a draft', async () => {
  const { seed, render, tab, run, workspace, check, current } = setupRecovery()
  seed()
  await render()
  const unrelated = tab.getItem(RECOVERY_KEY)
  await run((lifecycle) => lifecycle.workspaceSaved(workspace, false))
  check(
    current().session === personal && tab.getItem(RECOVERY_KEY) === unrelated,
    'Workspace-only mutations must preserve unrelated answers and Recovery',
  )
  tab.removal = 'fail'
  await run((lifecycle) => lifecycle.workspaceSaved(workspace, true))
  check(
    current().session === null && current().selected,
    'A verified Draft commit must clear its session before cleanup',
  )
  check(
    current().lifecycle.removal?.kind === 'cleanup',
    'Failed cleanup must retain its retry',
  )
  await run((lifecycle) => lifecycle.retry())
  check(
    current().session === null,
    'Recovery inspection must not restore a committed session during cleanup',
  )
  await run((lifecycle) => lifecycle.cancelRemoval())
  check(
    current().lifecycle.removal?.kind === 'cleanup',
    'Committed cleanup cannot be cancelled',
  )
  tab.removal = 'normal'
  await run((lifecycle) => lifecycle.retryRemoval())
  await render({}, false)
  check(
    tab.getItem(RECOVERY_KEY) === null && tab.writes === 0,
    'Cleanup retry and later Effects must not recreate committed answers',
  )
})

test('keeps partial and unverified deletion retryable without recreating answers', async () => {
  const { seed, local, workspace, render, tab, run, check, current } =
    setupRecovery()
  for (const failure of ['fail', 'unverified'] as const) {
    seed()
    local.setItem(WORKSPACE_KEY, JSON.stringify(workspace))
    await render()
    tab.removal = failure
    await run((lifecycle) => {
      lifecycle.deleteAll(workspace.revision)
    })
    check(
      local.getItem(WORKSPACE_KEY) === null && current().session === personal,
      'Partial deletion must preserve in-memory answers after workspace removal',
    )
    check(
      current().lifecycle.writesPaused,
      'Partial deletion must pause workspace writes',
    )
    await run((lifecycle) =>
      lifecycle.dispatch({
        type: 'amount-changed',
        field: 'declaredProfit',
        value: '700000',
      }),
    )
    check(tab.writes === 0, 'Edits during pending removal must stay in memory')
    tab.readsFail = false
    tab.removal = 'normal'
    await run((lifecycle) => lifecycle.retryRemoval())
    await render({}, false)
    check(
      current().session === null && current().lifecycle.removal === null,
      'Retry must finish without a workspace key',
    )
    check(
      tab.getItem(RECOVERY_KEY) === null && tab.writes === 0,
      'A partial-deletion retry must leave Recovery absent',
    )
  }
})
