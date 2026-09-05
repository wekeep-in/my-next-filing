// With pnpm dev running, call in the browser console:
// await (await import('/scripts/verify-recovery.tsx')).verifyRecovery()
// The mounted test uses isolated in-memory stores, never the Application's keys.
import { useLayoutEffect, useReducer, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { useRecoveryLifecycle } from '../src/recovery-draft/lifecycle'
import { RECOVERY_KEY, recoveryFromSession } from '../src/recovery-draft'
import { exampleProfile, isBlankDraft } from '../src/routes/check/model'
import {
  questionnaireReducer,
  sessionFromProfile,
} from '../src/routes/check/session'
import type { QuestionnaireState } from '../src/routes/check/session'
import { TAX_YEAR, currentRules } from '../src/rules'
import { WORKSPACE_KEY, saveSavedWorkspace } from '../src/workspace'
import { TestStorage } from './test-storage'

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

function RecoveryFixture({
  initial = personal,
  exampleReturn = null,
  initialized = true,
  exampleMode = false,
  beforeEffects,
  storage,
  observe,
  notice,
}: Scenario & {
  readonly storage: Parameters<typeof useRecoveryLifecycle>[1]
  readonly observe: (snapshot: Snapshot) => void
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
    observe({ lifecycle, session, selected })
    if (!started.current) {
      started.current = true
      beforeEffects?.(lifecycle)
    }
  })
  return null
}

export async function verifyRecovery() {
  const local = new TestStorage()
  const tab = new TestStorage()
  const storage = (area: 'localStorage' | 'sessionStorage') =>
    area === 'localStorage' ? local : tab
  const notices: string[] = []
  const notice = (value: string) => {
    notices.push(value)
  }
  let snapshot: Snapshot
  const observe = (value: Snapshot) => {
    snapshot = value
  }
  const current = () => snapshot
  const check = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message)
  }
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  const wait = () => new Promise((resolve) => window.setTimeout(resolve, 40))
  let mount = 0
  const render = async (scenario: Scenario = {}, fresh = true) => {
    if (fresh) mount++
    flushSync(() =>
      root.render(
        <RecoveryFixture
          key={mount}
          {...scenario}
          storage={storage}
          observe={observe}
          notice={notice}
        />,
      ),
    )
    await wait()
  }
  const act = async (action: (lifecycle: Lifecycle) => void) => {
    flushSync(() => action(current().lifecycle))
    await wait()
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
  try {
    seed()
    await render({
      beforeEffects: (lifecycle) => {
        lifecycle.deleteAll(workspace.revision)
      },
    })
    check(
      tab.getItem(RECOVERY_KEY) === null &&
        local.getItem(WORKSPACE_KEY) === null,
      'Delete both keys before a pending Effect runs',
    )
    check(
      tab.writes === 0 && current().session === null,
      'A stale Effect must never recreate deleted answers',
    )
    await render({}, false)
    check(tab.writes === 0, 'Later rendering must keep full deletion intact')

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

    seed()
    await render({ initialized: false })
    check(
      tab.writes === 0 && current().lifecycle.state.kind === 'absent',
      'Initial storage inspection must precede synchronization',
    )
    await act((lifecycle) => {
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
        beforeEffects: (lifecycle: Lifecycle) =>
          lifecycle.selectWorkspace(true),
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
    await act((lifecycle) => lifecycle.retry())
    check(tab.writes === 1, 'An unchanged retry must not rewrite Recovery')

    seed()
    await render()
    const unrelated = tab.getItem(RECOVERY_KEY)
    await act((lifecycle) => lifecycle.workspaceSaved(workspace, false))
    check(
      current().session === personal && tab.getItem(RECOVERY_KEY) === unrelated,
      'Workspace-only mutations must preserve unrelated answers and Recovery',
    )
    tab.removal = 'fail'
    await act((lifecycle) => lifecycle.workspaceSaved(workspace, true))
    check(
      current().session === null && current().selected,
      'A verified Draft commit must clear its session before cleanup',
    )
    check(
      current().lifecycle.removal?.kind === 'cleanup',
      'Failed cleanup must retain its retry',
    )
    await act((lifecycle) => lifecycle.retry())
    check(
      current().session === null,
      'Recovery inspection must not restore a committed session during cleanup',
    )
    await act((lifecycle) => lifecycle.cancelRemoval())
    check(
      current().lifecycle.removal?.kind === 'cleanup',
      'Committed cleanup cannot be cancelled',
    )
    tab.removal = 'normal'
    await act((lifecycle) => lifecycle.retryRemoval())
    await render({}, false)
    check(
      tab.getItem(RECOVERY_KEY) === null && tab.writes === 0,
      'Cleanup retry and later Effects must not recreate committed answers',
    )

    for (const failure of ['fail', 'unverified'] as const) {
      seed()
      local.setItem(WORKSPACE_KEY, JSON.stringify(workspace))
      await render()
      tab.removal = failure
      await act((lifecycle) => {
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
      await act((lifecycle) =>
        lifecycle.dispatch({
          type: 'amount-changed',
          field: 'declaredProfit',
          value: '700000',
        }),
      )
      check(
        tab.writes === 0,
        'Edits during pending removal must stay in memory',
      )
      tab.readsFail = false
      tab.removal = 'normal'
      await act((lifecycle) => lifecycle.retryRemoval())
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
    check(
      notices.filter((value) => value === 'recovery-saved').length === 2,
      'Show one first-write notice per mounted lifecycle',
    )
    return 'Recovery lifecycle checks passed: restoration, pause, commit, deletion, retries, and stale Effects.'
  } finally {
    root.unmount()
    host.remove()
  }
}
