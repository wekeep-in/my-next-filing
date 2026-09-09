import assert from 'node:assert/strict'
import { expect, test } from 'vitest'
import recoveryV10 from '../fixtures/recovery-v10.json' with { type: 'json' }
import { TAX_YEAR } from '../../src/rules'
import {
  parseRecoveryDraft,
  recoveryFromSession,
} from '../../src/recovery-draft'
import {
  assessQuestionnaire,
  blankDraft,
  completeDraft,
  exampleProfile,
} from '../../src/routes/check/model'
import {
  questionnaireReducer,
  sessionFromProfile,
} from '../../src/routes/check/session'

const today = '2026-09-08'
const personal = sessionFromProfile(exampleProfile, { kind: 'personal' }, today)

test('No sets credits to zero; Yes requires fresh amounts; uncertainty cannot produce a plan', () => {
  const none = questionnaireReducer(personal, {
    type: 'field-changed',
    field: 'hasTaxPaid',
    value: 'no',
  })
  assert.ok(none)
  expect(none.draft.amounts).toMatchObject({
    tds: '0',
    tcs: '0',
    advanceTaxPaid: '0',
  })
  expect(none.draft.ageSixtyOrOlder).toBe('')
  const completed = completeDraft(none.draft, today)
  assert.ok(completed.valid)
  expect(completed.profile.otherIncome).toMatchObject({
    tds: 0,
    tcs: 0,
    advanceTaxPaid: 0,
  })
  const yes = questionnaireReducer(none, {
    type: 'field-changed',
    field: 'hasTaxPaid',
    value: 'yes',
  })
  assert.ok(yes)
  expect(yes.draft.amounts).toMatchObject({
    tds: '',
    tcs: '',
    advanceTaxPaid: '',
  })
  expect(completeDraft(yes.draft, today).valid).toBe(false)
  const uncertain = questionnaireReducer(personal, {
    type: 'field-changed',
    field: 'hasTaxPaid',
    value: 'not-sure',
  })
  assert.ok(uncertain)
  expect(uncertain.draft.amounts).toMatchObject({
    tds: '',
    tcs: '',
    advanceTaxPaid: '',
  })
  expect(completeDraft(uncertain.draft, today).valid).toBe(false)
  expect(
    assessQuestionnaire(uncertain, 'other-income', today).progression,
  ).toEqual({ kind: 'next', group: 'clients' })
  expect(assessQuestionnaire(uncertain, 'gst', today).resumeGroup).toBe('gst')
  expect(
    assessQuestionnaire(uncertain, 'gst', today).progression,
  ).toMatchObject({ kind: 'blocked', issue: { field: 'hasTaxPaid' } })
  expect(
    parseRecoveryDraft(recoveryFromSession(uncertain, TAX_YEAR), TAX_YEAR)
      ?.draft.hasTaxPaid,
  ).toBe('not-sure')
  expect(blankDraft().hasTaxPaid).toBe('')
})

test('a plan payment update promotes a previous No while retaining known zero credits', () => {
  const draft = questionnaireReducer(personal, {
    type: 'field-changed',
    field: 'hasTaxPaid',
    value: 'no',
  })
  const completed = questionnaireReducer(draft, {
    type: 'complete',
    latestThresholdDate: today,
  })
  assert.ok(completed?.kind === 'complete')
  const updated = questionnaireReducer(completed, {
    type: 'payment-replaced',
    latestThresholdDate: today,
    profile: {
      ...completed.profile,
      otherIncome: { ...completed.profile.otherIncome, advanceTaxPaid: 1000 },
    },
  })
  assert.ok(updated)
  expect(updated.kind).toBe('complete')
  expect(updated.draft.hasTaxPaid).toBe('yes')
  expect(updated.draft.amounts).toMatchObject({
    tds: '0',
    tcs: '0',
    advanceTaxPaid: '1,000',
  })
})

for (const [tds, tcs, advanceTaxPaid, choice] of [
  ['40,000', '0', '0', 'yes'],
  ['0', '0', '0', 'no'],
  ['10', '', '0', 'yes'],
  ['0', '', '', ''],
  ['', '', '', ''],
] as const) {
  test(`migrates prior credit entries ${JSON.stringify([tds, tcs, advanceTaxPaid])} without assuming unknown amounts`, () => {
    const legacy = structuredClone(recoveryV10)
    Object.assign(legacy.draft.amounts, { tds, tcs, advanceTaxPaid })
    // The existing canonical draft excludes age when the credit trigger cannot apply.
    if (tds !== '40,000') legacy.draft.ageSixtyOrOlder = ''
    const restored = parseRecoveryDraft(legacy, TAX_YEAR)
    assert.ok(restored)
    expect(restored.schemaVersion).toBe(12)
    expect(restored.draft.hasTaxPaid).toBe(choice)
    expect(restored.draft.amounts).toMatchObject({ tds, tcs, advanceTaxPaid })
    expect(restored.origin).toBe(legacy.origin)
  })
}

test('rejects mixed versions and hidden tax amounts that contradict No or Not sure', () => {
  expect(
    parseRecoveryDraft(
      { ...recoveryV10, draft: { ...recoveryV10.draft, hasTaxPaid: 'yes' } },
      TAX_YEAR,
    ),
  ).toBeNull()
  const invalidProfile = sessionFromProfile(
    {
      ...exampleProfile,
      otherIncome: { ...exampleProfile.otherIncome, tds: -1 },
    },
    { kind: 'personal' },
    today,
  )
  expect(invalidProfile.draft.amounts.tds).toBe('-1')
  expect(completeDraft(invalidProfile.draft, today).valid).toBe(false)
  const envelope = recoveryFromSession(personal, TAX_YEAR)
  assert.ok(envelope)
  for (const hasTaxPaid of ['no', 'not-sure'] as const) {
    const contradictory = {
      ...envelope,
      draft: { ...envelope.draft, hasTaxPaid },
    }
    expect(parseRecoveryDraft(contradictory, TAX_YEAR)).toBeNull()
    expect(completeDraft(contradictory.draft, today).valid).toBe(false)
  }
})
