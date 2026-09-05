import {
  RECOVERY_KEY,
  canSynchronizeRecovery,
  deleteBrowserData,
  deleteRecoveryDraft,
  loadRecoveryDraft,
  parseRecoveryDraft,
  recoveryFromSession,
  saveRecoveryDraft,
} from '../src/recovery-draft/index.ts'
import {
  derivePlanModel,
  preparePayment,
  selectPlanSource,
  sessionMatchesWorkspace,
  updateCompletionRecords,
} from '../src/routes/plan/model.ts'
import {
  WORKSPACE_KEY,
  deleteLegacyWorkspace,
  deleteSavedWorkspace,
  loadSavedWorkspace,
  saveSavedWorkspace,
} from '../src/workspace/index.ts'
import type { SavedWorkspaceDraft } from '../src/workspace/index.ts'
import { TAX_YEAR, currentRules } from '../src/rules/index.ts'
import type {
  QuestionnaireEvent,
  QuestionnaireSession,
} from '../src/routes/check/session.ts'
import {
  clearInactiveDraft,
  questionnaireErrors,
  questionnaireReducer,
  restoreSession,
  sessionFromProfile,
} from '../src/routes/check/session.ts'
import assert from 'node:assert/strict'
import { createMemoryRouter } from 'react-router-dom'
import { formatAmountEdit } from '../src/components/amount-input.tsx'
import { indiaDate } from '../src/lib/india-date.ts'
import { shouldAnimatePage } from '../src/lib/page-transition.ts'
import {
  blankDraft,
  canOpenGroup,
  completeDraft,
  draftFromProfile,
  exampleProfile,
  firstIncompleteGroup,
  hasForeignClients,
  hasPlatformWork,
  isBlankDraft,
  isBusinessPath,
  isUnregisteredGst,
  questionnaireGroupFromPath,
  questionnaireGroups,
  validateDraftGroup,
} from '../src/routes/check/model.ts'

const today = '2026-09-05'
const navigationRouter = createMemoryRouter([{ path: '*' }])
const initialLocation = navigationRouter.state.location
assert.equal(
  shouldAnimatePage(initialLocation, initialLocation, true, false),
  false,
)
await navigationRouter.navigate('/plan')
const planLocation = navigationRouter.state.location
assert.equal(
  shouldAnimatePage(initialLocation, planLocation, true, false),
  true,
)
await navigationRouter.navigate('/plan')
const workspaceLocation = navigationRouter.state.location
assert.equal(
  shouldAnimatePage(planLocation, workspaceLocation, true, false),
  true,
)
assert.equal(
  shouldAnimatePage(planLocation, workspaceLocation, false, false),
  false,
)
assert.equal(
  shouldAnimatePage(planLocation, workspaceLocation, true, true),
  false,
)
await navigationRouter.navigate(-1)
assert.equal(
  shouldAnimatePage(
    workspaceLocation,
    navigationRouter.state.location,
    true,
    false,
  ),
  true,
)
await navigationRouter.navigate(1)
assert.equal(
  shouldAnimatePage(planLocation, navigationRouter.state.location, true, false),
  true,
)
await navigationRouter.navigate('/plan#details')
assert.equal(
  shouldAnimatePage(
    workspaceLocation,
    navigationRouter.state.location,
    true,
    false,
  ),
  false,
)
navigationRouter.dispose()

for (const [raw, expected] of [
  ['1000', '1,000'],
  ['100000', '1,00,000'],
  ['12345678', '1,23,45,678'],
  ['₹ 123456', '1,23,456'],
  ['00010', '10'],
  ['0', '0'],
  ['', ''],
  ['12.50', '12.50'],
  ['-1000', '-1000'],
  ['1e6', '1e6'],
  ['9007199254740992', '9007199254740992'],
]) {
  assert.deepEqual(formatAmountEdit(raw, raw.length), {
    value: expected,
    caret: expected.length,
  })
}
assert.deepEqual(formatAmountEdit('192,345', 2), {
  value: '1,92,345',
  caret: 3,
})
assert.deepEqual(formatAmountEdit('1234', 1, 'deleteContentBackward'), {
  value: '1,234',
  caret: 1,
})
assert.deepEqual(formatAmountEdit('1234', 1, 'deleteContentForward'), {
  value: '1,234',
  caret: 2,
})
assert.equal(indiaDate(new Date('2026-09-04T18:29:59Z')), '2026-09-04')
assert.equal(indiaDate(new Date('2026-09-04T18:30:00Z')), today)
assert.equal(indiaDate(new Date('2026-12-31T18:30:00Z')), '2027-01-01')
assert.equal(isBlankDraft(blankDraft()), true)
assert.equal(firstIncompleteGroup(blankDraft(), today), 'tax-year')
assert.equal(canOpenGroup(blankDraft(), 'review', today), false)
const exampleDraft = draftFromProfile(exampleProfile)
assert.equal(isBlankDraft(exampleDraft), false)
assert.equal(firstIncompleteGroup(exampleDraft, today), null)
assert.equal(canOpenGroup(exampleDraft, 'review', today), true)
const completedExample = completeDraft(exampleDraft, today)
assert.ok(completedExample.valid)
assert.deepEqual(completedExample.profile, exampleProfile)
assert.equal(completeDraft(blankDraft(), today).valid, false)
for (const { id } of questionnaireGroups) {
  assert.deepEqual(validateDraftGroup(exampleDraft, id, today), [])
  if (id !== 'review')
    assert.ok(
      validateDraftGroup(blankDraft(), id, today).every(
        (error) => error.group === id,
      ),
    )
}
assert.equal(
  completeDraft(
    {
      ...exampleDraft,
      amounts: { ...exampleDraft.amounts, cashReceipts: '2000000' },
    },
    today,
  ).valid,
  false,
)
assert.equal(
  completeDraft({ ...exampleDraft, personKind: 'not-individual' }, today).valid,
  true,
)
assert.equal(
  isBusinessPath({ ...exampleDraft, path: 'eligible-business' }),
  true,
)
for (const delivery of ['platform', 'both', 'direct', 'not-sure'] as const)
  assert.equal(
    hasPlatformWork({ ...exampleDraft, delivery }),
    delivery === 'platform' || delivery === 'both',
  )
for (const clientKind of ['foreign', 'mixed', 'domestic', 'not-sure'] as const)
  assert.equal(
    hasForeignClients({ ...exampleDraft, clientKind }),
    clientKind === 'foreign' || clientKind === 'mixed',
  )
assert.equal(isUnregisteredGst(exampleDraft), true)
assert.equal(
  isUnregisteredGst({ ...exampleDraft, gstKind: 'registered' }),
  false,
)

const personal: QuestionnaireSession = {
  kind: 'editing',
  origin: { kind: 'personal' },
  draft: exampleDraft,
  validationGroup: null,
}
const withHidden = {
  ...exampleDraft,
  path: 'eligible-business' as const,
  notGoodsCarriage: 'yes' as const,
  clientKind: 'mixed' as const,
  delivery: 'both' as const,
  platformOwnAccount: 'yes' as const,
  foreignWorkInIndia: 'yes' as const,
  amounts: {
    ...exampleDraft.amounts,
    qualifyingReceipts: '1900000',
    otherReceipts: '0',
  },
}
const cascades: readonly {
  event: QuestionnaireEvent
  field: string
  value: unknown
}[] = [
  {
    event: { type: 'path-changed', value: 'specified-profession' },
    field: 'pathConfirmed',
    value: '',
  },
  {
    event: { type: 'delivery-changed', value: 'direct' },
    field: 'platformOwnAccount',
    value: '',
  },
  {
    event: { type: 'clientKind-changed', value: 'domestic' },
    field: 'foreignWorkInIndia',
    value: '',
  },
  {
    event: { type: 'gstKind-changed', value: 'registered' },
    field: 'turnoverComplete',
    value: '',
  },
  {
    event: { type: 'gstStatus-changed', value: 'other' },
    field: 'gstStatus',
    value: '',
  },
  {
    event: { type: 'hasClientWorkSubcontractor-changed', value: 'yes' },
    field: 'contractorBoundary',
    value: '',
  },
  {
    event: { type: 'unsupportedCertainty-changed', value: 'none' },
    field: 'unsupportedFacts',
    value: [],
  },
  {
    event: { type: 'amount-changed', field: 'tds', value: '0' },
    field: 'ageSixtyOrOlder',
    value: '',
  },
]
for (const { event, field, value } of cascades) {
  const before: QuestionnaireSession = { ...personal, draft: withHidden }
  const snapshot: string = JSON.stringify(before)
  const after = questionnaireReducer(before, event)
  assert.ok(after)
  assert.deepEqual(Reflect.get(after.draft, field), value)
  assert.equal(JSON.stringify(before), snapshot)
  assert.deepEqual(questionnaireReducer(after, event), after)
}
const changedPath = questionnaireReducer(
  { ...personal, draft: withHidden },
  { type: 'path-changed', value: 'specified-profession' },
)
assert.ok(changedPath)
for (const key of [
  'grossReceipts',
  'cashReceipts',
  'declaredProfit',
  'qualifyingReceipts',
  'otherReceipts',
] as const)
  assert.equal(changedPath.draft.amounts[key], '')
const registered = {
  ...personal,
  draft: {
    ...exampleDraft,
    gstKind: 'registered' as const,
    gstStatus: 'one-normal' as const,
  },
}
assert.equal(
  questionnaireReducer(registered, {
    type: 'gstStatus-changed',
    value: 'other',
  })?.draft.gstState,
  '',
)
assert.equal(
  questionnaireReducer(personal, {
    type: 'field-changed',
    field: 'adult',
    value: 'yes',
  }),
  personal,
)
assert.equal(
  questionnaireReducer(null, {
    type: 'field-changed',
    field: 'adult',
    value: 'no',
  }),
  null,
)
assert.equal(
  questionnaireReducer(personal, {
    type: 'field-changed',
    field: 'adult',
    value: 'no',
  })?.draft.adult,
  'no',
)
const toggled = questionnaireReducer(personal, {
  type: 'unsupported-fact-toggled',
  fact: 'salary',
  checked: true,
})
assert.deepEqual(toggled?.draft.unsupportedFacts, ['salary'])
assert.deepEqual(
  questionnaireReducer(toggled, {
    type: 'unsupported-fact-toggled',
    fact: 'salary',
    checked: true,
  })?.draft.unsupportedFacts,
  ['salary'],
)
assert.equal(
  questionnaireReducer(toggled, {
    type: 'unsupported-fact-toggled',
    fact: 'salary',
    checked: false,
  })?.draft.unsupportedCertainty,
  '',
)
assert.equal(
  questionnaireReducer(toggled, {
    type: 'unsupportedCertainty-changed',
    value: 'not-sure',
  })?.draft.unsupportedFacts.length,
  0,
)
const started = questionnaireReducer(null, {
  type: 'start',
  origin: { kind: 'personal' },
})
assert.ok(started)
assert.equal(isBlankDraft(started.draft), true)
assert.deepEqual(questionnaireErrors(started, today), [])
const exposed = questionnaireReducer(started, {
  type: 'expose-validation',
  group: 'tax-year',
})
assert.ok(questionnaireErrors(exposed, today).length)
assert.deepEqual(
  questionnaireErrors(
    questionnaireReducer(exposed, { type: 'clear-validation' }),
    today,
  ),
  [],
)
assert.equal(
  questionnaireReducer(started, {
    type: 'complete',
    latestThresholdDate: today,
  })?.kind,
  'editing',
)
const complete = questionnaireReducer(personal, {
  type: 'complete',
  latestThresholdDate: today,
})
assert.equal(complete?.kind, 'complete')
assert.deepEqual(
  questionnaireReducer(null, { type: 'restore', session: complete }),
  complete,
)
assert.equal(questionnaireReducer(complete, { type: 'clear' }), null)
assert.equal(
  questionnaireReducer(complete, { type: 'start-over' })?.kind,
  'editing',
)
assert.equal(
  questionnaireReducer(
    { ...personal, origin: { kind: 'saved-edit', baseWorkspaceRevision: 7 } },
    { type: 'continue-unsaved' },
  )?.origin.kind,
  'personal',
)
assert.equal(
  restoreSession(blankDraft(), { kind: 'personal' }, today).kind,
  'editing',
)
assert.equal(
  sessionFromProfile(exampleProfile, { kind: 'example' }, today).origin.kind,
  'example',
)
const paidProfile = {
  ...exampleProfile,
  otherIncome: { ...exampleProfile.otherIncome, advanceTaxPaid: 1000 },
}
const paid = questionnaireReducer(complete, {
  type: 'payment-replaced',
  profile: paidProfile,
  latestThresholdDate: today,
})
assert.ok(paid?.kind === 'complete')
const recoveredPayment = completeDraft(paid.draft, today)
assert.ok(recoveredPayment.valid)
assert.deepEqual(recoveredPayment.profile, paid.profile)
assert.equal(paid.draft.amounts.advanceTaxPaid, '1,000')
assert.equal(
  questionnaireReducer(complete, {
    type: 'payment-replaced',
    profile: { ...paidProfile, person: { ...paidProfile.person, adult: 'no' } },
    latestThresholdDate: today,
  }),
  complete,
)
assert.deepEqual(
  clearInactiveDraft(clearInactiveDraft(withHidden)),
  clearInactiveDraft(withHidden),
)

class TestStorage implements Storage {
  private readonly values = new Map<string, string>()
  readsFail = false
  writesFail = false
  removal: 'normal' | 'fail' | 'throw-after' | 'unverified' = 'normal'
  writes = 0
  get length() {
    return this.values.size
  }
  clear() {
    assert.fail('Storage must never be cleared')
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }
  getItem(key: string) {
    if (this.readsFail) throw new Error('unavailable')
    return this.values.get(key) ?? null
  }
  setItem(key: string, value: string) {
    if (this.writesFail) throw new Error('quota')
    this.writes++
    this.values.set(key, value)
  }
  removeItem(key: string) {
    if (this.removal === 'fail') throw new Error('denied')
    this.values.delete(key)
    if (this.removal === 'unverified') this.readsFail = true
    if (this.removal === 'throw-after') throw new Error('removed')
  }
}
const recovery = recoveryFromSession(personal, TAX_YEAR)
assert.ok(recovery)
assert.deepEqual(parseRecoveryDraft(recovery, TAX_YEAR), recovery)
const recoveryStore = new TestStorage()
recoveryStore.setItem('unrelated', 'keep')
assert.equal(loadRecoveryDraft(recoveryStore, TAX_YEAR).kind, 'absent')
assert.equal(saveRecoveryDraft(recoveryStore, recovery).kind, 'saved')
const writes = recoveryStore.writes
assert.equal(saveRecoveryDraft(recoveryStore, recovery).kind, 'unchanged')
assert.equal(recoveryStore.writes, writes)
assert.deepEqual(loadRecoveryDraft(recoveryStore, TAX_YEAR), {
  kind: 'ready',
  value: recovery,
})
assert.equal(deleteRecoveryDraft(recoveryStore).kind, 'deleted')
assert.equal(deleteRecoveryDraft(recoveryStore).kind, 'absent')
assert.equal(recoveryStore.getItem('unrelated'), 'keep')
for (const invalid of [
  null,
  [],
  {},
  { ...recovery, route: '/plan' },
  { ...recovery, schemaVersion: 2 },
  { ...recovery, taxYear: 'Tax Year 2025-26' },
  { ...recovery, origin: 'example' },
  { ...recovery, baseWorkspaceRevision: 0 },
  { ...recovery, origin: 'saved-edit', baseWorkspaceRevision: -1 },
  {
    ...recovery,
    origin: 'saved-edit',
    baseWorkspaceRevision: Number.MAX_SAFE_INTEGER + 1,
  },
  { ...recovery, draft: { ...exampleDraft, extra: true } },
  { ...recovery, draft: { ...exampleDraft, adult: 'maybe' } },
  { ...recovery, draft: { ...exampleDraft, platformOwnAccount: 'yes' } },
  {
    ...recovery,
    draft: { ...exampleDraft, thresholdLiabilityDate: 'tomorrow' },
  },
  {
    ...recovery,
    draft: {
      ...exampleDraft,
      amounts: { ...exampleDraft.amounts, tds: '0'.repeat(33) },
    },
  },
  {
    ...recovery,
    draft: {
      ...exampleDraft,
      unsupportedCertainty: 'selected',
      unsupportedFacts: ['salary', 'salary'],
    },
  },
  {
    ...recovery,
    draft: {
      ...exampleDraft,
      unsupportedCertainty: 'selected',
      unsupportedFacts: ['unknown'],
    },
  },
])
  assert.equal(parseRecoveryDraft(invalid, TAX_YEAR), null)
assert.equal(
  parseRecoveryDraft(
    {
      get schemaVersion() {
        throw new Error('getter')
      },
    },
    TAX_YEAR,
  ),
  null,
)
assert.ok(
  parseRecoveryDraft(
    { ...recovery, origin: 'saved-edit', baseWorkspaceRevision: 0 },
    TAX_YEAR,
  ),
)
const blankRecovery = recoveryFromSession(started, TAX_YEAR)
assert.ok(blankRecovery)
assert.ok(parseRecoveryDraft(blankRecovery, TAX_YEAR))
for (const raw of ['{', JSON.stringify({ ...recovery, schemaVersion: 99 })]) {
  recoveryStore.setItem(RECOVERY_KEY, raw)
  assert.equal(
    loadRecoveryDraft(recoveryStore, TAX_YEAR).kind,
    'invalid-removed',
  )
  assert.equal(recoveryStore.getItem(RECOVERY_KEY), null)
}
recoveryStore.setItem(RECOVERY_KEY, '{')
recoveryStore.removal = 'fail'
assert.equal(
  loadRecoveryDraft(recoveryStore, TAX_YEAR).kind,
  'invalid-removal-failed',
)
assert.equal(deleteRecoveryDraft(recoveryStore).kind, 'deletion-failed')
assert.equal(saveRecoveryDraft(recoveryStore, recovery).kind, 'invalid')
recoveryStore.removal = 'unverified'
assert.equal(deleteRecoveryDraft(recoveryStore).kind, 'deletion-unverified')
assert.equal(loadRecoveryDraft(recoveryStore, TAX_YEAR).kind, 'unavailable')
assert.equal(deleteRecoveryDraft(recoveryStore).kind, 'unavailable')
assert.equal(saveRecoveryDraft(recoveryStore, recovery).kind, 'unavailable')
recoveryStore.readsFail = false
assert.equal(deleteRecoveryDraft(recoveryStore).kind, 'absent')
recoveryStore.writesFail = true
assert.equal(saveRecoveryDraft(recoveryStore, recovery).kind, 'unavailable')
recoveryStore.writesFail = false
assert.equal(saveRecoveryDraft(recoveryStore, recovery).kind, 'saved')
recoveryStore.removal = 'throw-after'
assert.equal(deleteRecoveryDraft(recoveryStore).kind, 'deleted')
assert.equal(
  recoveryFromSession(
    sessionFromProfile(exampleProfile, { kind: 'example' }, today),
    TAX_YEAR,
  ),
  null,
)
assert.equal(recoveryFromSession(null, TAX_YEAR), null)
assert.equal(canSynchronizeRecovery(personal, true, false, false), true)
for (const [initialized, selected, pending] of [
  [false, false, false],
  [true, true, false],
  [true, false, true],
])
  assert.equal(
    canSynchronizeRecovery(personal, initialized, selected, pending),
    false,
  )
assert.equal(canSynchronizeRecovery(null, true, false, false), false)
assert.equal(
  canSynchronizeRecovery(
    sessionFromProfile(exampleProfile, { kind: 'example' }, today),
    true,
    false,
    false,
  ),
  false,
)

const workspaceStore = new TestStorage()
const workspaceInput: SavedWorkspaceDraft = {
  noticeVersion: 2,
  consentDecidedAt: '2026-09-01T00:00:00.000Z',
  activeTaxYear: TAX_YEAR,
  active: {
    profile: exampleProfile,
    completions: [],
    ruleDatasetId: currentRules.id,
  },
  priorYears: [],
}
const legacyRaw = JSON.stringify({
  schemaVersion: 1,
  revision: 0,
  noticeVersion: 1,
  consentDecidedAt: '2026-09-01T00:00:00.000Z',
  activeTaxYear: TAX_YEAR,
  active: {
    profile: exampleProfile,
    completions: [
      {
        obligationId: 'annual-return:Tax Year 2026-27',
        completedOn: '2026-09-03',
      },
    ],
    ruleDatasetId: currentRules.id,
  },
  priorYears: [],
  updatedAt: '2026-09-03T06:30:00.000Z',
})
workspaceStore.setItem('unrelated', 'keep')
workspaceStore.setItem(WORKSPACE_KEY, legacyRaw)
assert.equal(loadSavedWorkspace(workspaceStore).kind, 'legacy')
assert.equal(
  saveSavedWorkspace(workspaceStore, 0, workspaceInput).kind,
  'invalid',
)
workspaceStore.removal = 'fail'
assert.equal(
  deleteLegacyWorkspace(workspaceStore).kind,
  'legacy-removal-failed',
)
assert.equal(workspaceStore.getItem(WORKSPACE_KEY), legacyRaw)
workspaceStore.removal = 'unverified'
assert.equal(
  deleteLegacyWorkspace(workspaceStore).kind,
  'legacy-removal-unverified',
)
workspaceStore.readsFail = false
assert.equal(deleteLegacyWorkspace(workspaceStore).kind, 'absent')
workspaceStore.removal = 'normal'
for (let encounter = 0; encounter < 2; encounter++) {
  workspaceStore.setItem(WORKSPACE_KEY, legacyRaw)
  assert.equal(deleteLegacyWorkspace(workspaceStore).kind, 'legacy-deleted')
}
const savedV2 = saveSavedWorkspace(workspaceStore, null, workspaceInput)
assert.ok(savedV2.kind === 'saved')
assert.equal(savedV2.workspace.schemaVersion, 2)
assert.equal(savedV2.workspace.noticeVersion, 2)
assert.equal(deleteLegacyWorkspace(workspaceStore).kind, 'conflict')
assert.equal(loadSavedWorkspace(workspaceStore).kind, 'ready')
assert.equal(
  saveSavedWorkspace(workspaceStore, null, workspaceInput).kind,
  'conflict',
)
workspaceStore.removal = 'unverified'
assert.equal(
  deleteSavedWorkspace(workspaceStore, savedV2.workspace.revision).kind,
  'deletion-unverified',
)
workspaceStore.readsFail = false
assert.equal(deleteSavedWorkspace(workspaceStore, null).kind, 'absent')
assert.equal(workspaceStore.getItem('unrelated'), 'keep')
workspaceStore.setItem(WORKSPACE_KEY, JSON.stringify({ schemaVersion: 99 }))
assert.equal(loadSavedWorkspace(workspaceStore).kind, 'invalid')
assert.equal(deleteLegacyWorkspace(workspaceStore).kind, 'conflict')

const planDate = new Date('2026-09-05T12:00:00+05:30')
const readyWorkspace = { kind: 'ready' as const, workspace: savedV2.workspace }
const planSession = sessionFromProfile(
  exampleProfile,
  { kind: 'personal' },
  today,
)
assert.ok(planSession.kind === 'complete')
assert.equal(sessionMatchesWorkspace(planSession, readyWorkspace), true)
assert.equal(sessionMatchesWorkspace(null, readyWorkspace), false)
assert.equal(sessionMatchesWorkspace(started, readyWorkspace), false)
assert.equal(sessionMatchesWorkspace(planSession, { kind: 'absent' }), false)
assert.equal(
  sessionMatchesWorkspace(
    { ...planSession, origin: { kind: 'example' } },
    readyWorkspace,
  ),
  false,
)
assert.equal(
  sessionMatchesWorkspace(
    {
      ...planSession,
      profile: {
        ...planSession.profile,
        otherIncome: {
          ...planSession.profile.otherIncome,
          advanceTaxPaid: 100,
        },
      },
    },
    readyWorkspace,
  ),
  false,
)
assert.equal(
  sessionMatchesWorkspace(planSession, {
    kind: 'ready',
    workspace: { ...savedV2.workspace, active: null },
  }),
  false,
)
assert.equal(
  sessionMatchesWorkspace(planSession, {
    kind: 'ready',
    workspace: {
      ...savedV2.workspace,
      active: {
        ...workspaceInput.active!,
        completions: [
          { obligationId: 'annual-return:2026-27', completedOn: today },
        ],
      },
    },
  }),
  false,
)
const transientSource = { kind: 'transient' as const, session: planSession }
assert.equal(
  selectPlanSource(planSession, readyWorkspace, false, false).kind,
  'transient',
)
assert.equal(
  selectPlanSource(planSession, readyWorkspace, true, false).kind,
  'workspace',
)
assert.equal(
  selectPlanSource(started, readyWorkspace, false, false).kind,
  'missing',
)
assert.equal(
  selectPlanSource(null, readyWorkspace, false, false).kind,
  'workspace',
)
assert.equal(
  selectPlanSource(null, { kind: 'absent' }, false, false).kind,
  'missing',
)
assert.equal(
  selectPlanSource(null, { kind: 'absent' }, false, true).kind,
  'deleted',
)
assert.equal(
  selectPlanSource(
    planSession,
    { kind: 'unavailable', reason: 'storage-unavailable' },
    false,
    false,
  ).kind,
  'transient',
)
for (const reason of [
  'invalid',
  'unavailable',
  'legacy',
  'legacy-removal-failed',
  'legacy-removal-unverified',
] as const)
  assert.equal(
    derivePlanModel(
      { kind: 'saved-data-unavailable', reason },
      planDate,
      currentRules,
      { kind: 'absent' },
    ).kind,
    'saved-data-unavailable',
  )
assert.equal(
  derivePlanModel({ kind: 'missing' }, planDate, currentRules, {
    kind: 'absent',
  }).kind,
  'missing',
)
assert.equal(
  derivePlanModel({ kind: 'deleted' }, planDate, currentRules, {
    kind: 'absent',
  }).kind,
  'deleted',
)
const transientModel = derivePlanModel(
  transientSource,
  planDate,
  currentRules,
  { kind: 'absent' },
)
assert.ok(transientModel.kind === 'supported')
assert.equal(transientModel.canSave, true)
assert.equal(transientModel.saved, false)
assert.deepEqual(transientModel.completions, [])
const savedModel = derivePlanModel(
  { kind: 'workspace', workspace: savedV2.workspace },
  planDate,
  currentRules,
  readyWorkspace,
)
assert.ok(savedModel.kind === 'supported')
assert.equal(savedModel.saved, true)
assert.equal(savedModel.canSave, false)
const exampleSession = sessionFromProfile(
  exampleProfile,
  { kind: 'example' },
  today,
)
assert.ok(exampleSession.kind === 'complete')
assert.equal(
  selectPlanSource(exampleSession, readyWorkspace, true, false).kind,
  'transient',
)
const exampleModel = derivePlanModel(
  { kind: 'transient', session: exampleSession },
  planDate,
  currentRules,
  { kind: 'absent' },
)
assert.ok(exampleModel.kind === 'supported')
assert.equal(exampleModel.canSave, false)
assert.equal(exampleModel.example, true)
const editSession = sessionFromProfile(
  exampleProfile,
  { kind: 'saved-edit', baseWorkspaceRevision: 0 },
  today,
)
assert.ok(editSession.kind === 'complete')
const editModel = derivePlanModel(
  { kind: 'transient', session: editSession },
  planDate,
  currentRules,
  readyWorkspace,
)
assert.ok(editModel.kind === 'supported')
assert.equal(editModel.canSaveChanges, true)
const conflictModel = derivePlanModel(
  { kind: 'transient', session: editSession },
  planDate,
  currentRules,
  { kind: 'ready', workspace: { ...savedV2.workspace, revision: 1 } },
)
assert.ok(conflictModel.kind === 'supported')
assert.equal(conflictModel.canSaveChanges, false)
const unsupportedSession = sessionFromProfile(
  { ...exampleProfile, person: { ...exampleProfile.person, adult: 'no' } },
  { kind: 'personal' },
  today,
)
assert.ok(unsupportedSession.kind === 'complete')
assert.equal(
  derivePlanModel(
    { kind: 'transient', session: unsupportedSession },
    planDate,
    currentRules,
    { kind: 'absent' },
  ).kind,
  'unsupported',
)
assert.equal(
  derivePlanModel(transientSource, new Date('2030-01-01'), currentRules, {
    kind: 'absent',
  }).kind,
  'stale',
)
assert.equal(
  preparePayment(exampleProfile, '', planDate, currentRules).kind,
  'invalid',
)
assert.equal(
  preparePayment(exampleProfile, '1.5', planDate, currentRules).kind,
  'invalid',
)
assert.equal(
  preparePayment(exampleProfile, '1,000', planDate, currentRules).kind,
  'valid',
)
assert.equal(
  preparePayment(unsupportedSession.profile, '0', planDate, currentRules).kind,
  'unsupported',
)
assert.equal(
  preparePayment(exampleProfile, '0', new Date('2030-01-01'), currentRules)
    .kind,
  'stale',
)
const completionId = 'annual-return:Tax Year 2026-27'
const addedRecord = updateCompletionRecords([], completionId, '2026-09-05')
const replacedRecord = updateCompletionRecords(
  addedRecord,
  completionId,
  '2026-09-04',
)
assert.deepEqual(replacedRecord, [
  { obligationId: completionId, completedOn: '2026-09-04' },
])
assert.deepEqual(
  updateCompletionRecords(replacedRecord, completionId, null),
  [],
)
for (const { id } of questionnaireGroups) {
  assert.equal(questionnaireGroupFromPath(`/check/${id}`), id)
  assert.equal(questionnaireGroupFromPath(`/check/${id}/`), id)
}
assert.equal(questionnaireGroupFromPath('/check/unknown'), null)
assert.equal(questionnaireGroupFromPath('/check'), null)
const deleteLocal = new TestStorage()
const deleteSession = new TestStorage()
deleteLocal.setItem(WORKSPACE_KEY, JSON.stringify(savedV2.workspace))
deleteSession.setItem(RECOVERY_KEY, JSON.stringify(recovery))
deleteSession.setItem('unrelated', 'keep')
deleteLocal.removal = 'fail'
assert.equal(
  deleteBrowserData(deleteLocal, deleteSession, 0, planDate).kind,
  'failed',
)
assert.ok(deleteSession.getItem(RECOVERY_KEY))
deleteLocal.removal = 'unverified'
assert.equal(
  deleteBrowserData(deleteLocal, deleteSession, 0, planDate).kind,
  'unverified',
)
assert.ok(deleteSession.getItem(RECOVERY_KEY))
deleteLocal.readsFail = false
deleteSession.removal = 'fail'
assert.equal(
  deleteBrowserData(deleteLocal, deleteSession, null, planDate).kind,
  'partial',
)
assert.equal(deleteLocal.getItem(WORKSPACE_KEY), null)
assert.ok(deleteSession.getItem(RECOVERY_KEY))
deleteSession.removal = 'normal'
assert.equal(
  deleteBrowserData(deleteLocal, deleteSession, null, planDate).kind,
  'complete',
)
assert.equal(deleteSession.getItem('unrelated'), 'keep')
assert.equal(
  deleteBrowserData(null, deleteSession, null, planDate).kind,
  'failed',
)
assert.equal(
  deleteBrowserData(deleteLocal, null, null, planDate).kind,
  'partial',
)
process.stdout.write('Frontend verification passed.\n')
