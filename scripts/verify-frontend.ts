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
import { indiaDate } from '../src/lib/india-date.ts'
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
  questionnaireGroups,
  validateDraftGroup,
} from '../src/routes/check/model.ts'

const today = '2026-09-05'
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
process.stdout.write('Frontend verification passed.\n')
