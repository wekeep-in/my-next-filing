import { test } from 'vitest'
import recoveryV3 from '../fixtures/recovery-v3.json' with { type: 'json' }
import workspaceV4 from '../fixtures/workspace-v4.json' with { type: 'json' }
import assert from 'node:assert/strict'
import { evaluate, parseProfile } from '../../src/evaluation/index.ts'
import { TAX_YEAR, currentRules } from '../../src/rules/index.ts'
import {
  assessQuestionnaire,
  completeDraft,
  draftFromProfile,
  exampleProfile,
} from '../../src/routes/check/model.ts'
import {
  questionnaireReducer,
  sessionFromProfile,
} from '../../src/routes/check/session.ts'
import {
  parseRecoveryDraft,
  recoveryFromSession,
} from '../../src/recovery-draft/index.ts'
import {
  WORKSPACE_KEY,
  loadSavedWorkspace,
  saveSavedWorkspace,
} from '../../src/workspace/index.ts'
import { TestStorage } from '../helpers/storage'

const today = '2026-09-08'
const now = new Date(`${today}T12:00:00+05:30`)
const withSalary = (grossSalary: number) => ({
  ...exampleProfile,
  incomePath: {
    ...exampleProfile.incomePath,
    grossReceipts: 400_000,
    declaredProfit: 200_000,
  },
  otherIncome: {
    ...exampleProfile.otherIncome,
    salary: {
      kind: 'domestic' as const,
      confirmed: 'yes' as const,
      grossSalary,
      employerNps: { kind: 'none' as const },
    },
    taxableBankInterest: 0,
    tds: 0,
  },
})

// The salary-head deduction is capped once; it never reduces practice income.

const salaryProfile = withSalary(1_275_000)

test('caps the salary deduction without reducing practice income', () => {
  for (const [gross, deduction, taxable] of [
    [0, 0, 0],
    [50_000, 50_000, 0],
    [75_000, 75_000, 0],
    [75_001, 75_000, 1],
    [1_000_000, 75_000, 925_000],
  ]) {
    const result = evaluate(withSalary(gross), now, currentRules)
    assert.ok(result.kind === 'supported')
    assert.deepEqual(result.tax.salary, {
      grossSalary: gross,
      standardDeduction: deduction,
      taxableSalary: taxable,
    })
    assert.equal(result.tax.presumptive.usedIncome, 200_000)
  }
})

test('calculates salary at rebate and relief boundaries', () => {
  for (const [gross, total, amount] of [
    [1_075_000, 1_200_000, 0],
    [1_075_010, 1_200_010, 10],
    [1_275_000, 1_400_000, 93_600],
  ]) {
    const result = evaluate(withSalary(gross), now, currentRules)
    assert.ok(result.kind === 'supported')
    assert.equal(result.tax.roundedTotalIncome, total)
    assert.equal(result.tax.finalAmount, amount)
  }
})

test('enforces return and supported-income boundaries', () => {
  for (const [gross, required] of [
    [275_000, false],
    [275_010, true],
  ] as const) {
    const result = evaluate(withSalary(gross), now, currentRules)
    assert.ok(
      result.kind === 'supported' &&
        result.coverage.annualReturn.kind === 'available',
    )
    assert.equal(result.coverage.annualReturn.value.required, required)
  }
  assert.equal(
    evaluate(withSalary(4_875_000), now, currentRules).kind,
    'supported',
  )
  assert.equal(
    evaluate(withSalary(4_875_010), now, currentRules).kind,
    'unsupported',
  )
})

test('keeps salary independent from practice GST and credits', () => {
  const result = evaluate(salaryProfile, now, currentRules)
  assert.ok(result.kind === 'supported')
  assert.deepEqual(
    result.obligations
      .filter(({ kind }) => kind !== 'gst-registration')
      .map(({ dueDate }) => dueDate),
    ['2027-03-15', '2027-08-31'],
  )
  const noSalary = evaluate(
    {
      ...salaryProfile,
      otherIncome: { ...salaryProfile.otherIncome, salary: { kind: 'none' } },
    },
    now,
    currentRules,
  )
  assert.ok(noSalary.kind === 'supported')
  assert.deepEqual(result.tax.presumptive, noSalary.tax.presumptive)
  assert.deepEqual(result.coverage.gst, noSalary.coverage.gst)
  const business = evaluate(
    {
      ...salaryProfile,
      incomePath: {
        kind: 'eligible-business',
        confirmed: 'yes',
        grossReceipts: 400_000,
        qualifyingReceipts: 400_000,
        otherReceipts: 0,
        cashReceipts: 0,
        declaredProfit: 200_000,
        notSpecifiedProfession: 'yes',
        notGoodsCarriage: 'yes',
        notAgencyCommissionBrokerage: 'yes',
        noChapterViiiCDeduction: 'yes',
        fiveYearExclusion: 'none',
      },
    },
    now,
    currentRules,
  )
  assert.ok(business.kind === 'supported')
  assert.equal(business.tax.finalAmount, result.tax.finalAmount)
  assert.deepEqual(
    business.obligations.map(({ dueDate }) => dueDate),
    result.obligations.map(({ dueDate }) => dueDate),
  )
  const credited = evaluate(
    {
      ...salaryProfile,
      otherIncome: { ...salaryProfile.otherIncome, tds: 100_000 },
    },
    now,
    currentRules,
  )
  assert.ok(credited.kind === 'supported')
  assert.equal(credited.tax.roundedTotalIncome, 1_400_000)
  assert.equal(credited.tax.outcome, 'refund')
  assert.equal(credited.tax.finalAmount, 6_400)
})

test('rejects malformed salary amounts and branches', () => {
  for (const salary of [
    undefined,
    { kind: 'none', grossSalary: 1 },
    { kind: 'domestic', confirmed: 'yes' },
    { kind: 'domestic', confirmed: 'yes', grossSalary: -1 },
    { kind: 'domestic', confirmed: 'yes', grossSalary: 1.5 },
    {
      kind: 'domestic',
      confirmed: 'yes',
      grossSalary: Number.MAX_SAFE_INTEGER + 1,
    },
  ])
    assert.equal(
      parseProfile({
        ...salaryProfile,
        otherIncome: { ...salaryProfile.otherIncome, salary },
      }).valid,
      false,
    )
})

test('stops uncertain or unconfirmed salary calculations', () => {
  for (const salary of [
    { kind: 'not-sure' },
    {
      kind: 'domestic',
      confirmed: 'no',
      grossSalary: 1_000_000,
      employerNps: { kind: 'none' },
    },
    {
      kind: 'domestic',
      confirmed: 'not-sure',
      grossSalary: 1_000_000,
      employerNps: { kind: 'none' },
    },
  ] as const)
    assert.equal(
      evaluate(
        {
          ...salaryProfile,
          otherIncome: { ...salaryProfile.otherIncome, salary },
        },
        now,
        currentRules,
      ).kind,
      'unsupported',
    )
})

test('stops calculation on invalid missing or expired salary rules', () => {
  for (const deduction of [
    undefined,
    -1,
    50_000,
    75_000.5,
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    const rules = structuredClone(currentRules)
    Object.assign(rules.groups.commonIncomeTax.values, {
      salaryStandardDeduction: deduction,
    })
    assert.equal(evaluate(salaryProfile, now, rules).kind, 'stale-rules')
  }
  const missingSource = {
    ...currentRules,
    sources: currentRules.sources.filter(
      ({ id }) => id !== 'domestic-salary-2026',
    ),
  }
  assert.equal(evaluate(salaryProfile, now, missingSource).kind, 'stale-rules')
  const expired = structuredClone(currentRules)
  Object.assign(expired.groups.commonIncomeTax, { expiresOn: '2026-09-06' })
  assert.equal(
    evaluate(salaryProfile, new Date('2026-09-08T12:00:00+05:30'), expired)
      .kind,
    'stale-rules',
  )
})

test('clears salary answers and migrates the original Recovery schema', () => {
  const draft = draftFromProfile(salaryProfile)
  const completed = completeDraft(draft, today)
  assert.ok(completed.valid)
  assert.deepEqual(completed.profile, salaryProfile)
  assert.equal(
    assessQuestionnaire({ draft }, 'other-income', today).progression.kind,
    'next',
  )
  for (const changed of [
    { ...draft, hasSalary: '' as const },
    { ...draft, hasSalary: 'not-sure' as const },
    { ...draft, salaryConfirmed: 'no' as const },
    { ...draft, amounts: { ...draft.amounts, grossSalary: '' } },
    draftFromProfile(withSalary(4_875_010)),
  ])
    assert.equal(
      assessQuestionnaire({ draft: changed }, 'other-income', today).progression
        .kind,
      'blocked',
    )
  const session = sessionFromProfile(salaryProfile, { kind: 'personal' }, today)
  const cleared = questionnaireReducer(session, {
    type: 'field-changed',
    field: 'hasSalary',
    value: 'no',
  })
  assert.equal(cleared?.draft.amounts.grossSalary, '')
  assert.equal(cleared?.draft.salaryConfirmed, '')
  const recovery = recoveryFromSession(session, TAX_YEAR)
  assert.ok(recovery)
  assert.deepEqual(parseRecoveryDraft(recovery, TAX_YEAR), recovery)
  const oldDraft = structuredClone(recoveryV3.draft)
  for (const key of Object.keys(oldDraft).filter(
    (field) =>
      field.startsWith('gst') &&
      !['gstKind', 'gstStatus', 'gstState'].includes(field),
  ))
    Reflect.deleteProperty(oldDraft, key)
  Reflect.deleteProperty(oldDraft, 'hasSalary')
  Reflect.deleteProperty(oldDraft, 'salaryConfirmed')
  Reflect.deleteProperty(oldDraft.amounts, 'grossSalary')
  const migrated = parseRecoveryDraft(
    { ...recovery, schemaVersion: 1, draft: oldDraft },
    TAX_YEAR,
  )
  assert.ok(migrated)
  assert.equal(migrated.draft.hasSalary, '')
  assert.equal(
    migrated.draft.amounts.grossReceipts,
    oldDraft.amounts.grossReceipts,
  )
  assert.equal(completeDraft(migrated.draft, today).valid, false)
  assert.equal(
    parseRecoveryDraft({ ...recovery, schemaVersion: 1 }, TAX_YEAR),
    null,
  )
})

test('migrates old workspaces in memory and preserves Completion records', () => {
  const storage = new TestStorage()
  const saved = saveSavedWorkspace(
    storage,
    null,
    {
      noticeVersion: 2,
      consentDecidedAt: now.toISOString(),
      activeTaxYear: TAX_YEAR,
      active: {
        profile: salaryProfile,
        ruleDatasetId: currentRules.id,
        completions: [
          { obligationId: `annual-return:${TAX_YEAR}`, completedOn: today },
        ],
      },
      priorYears: [],
    },
    now,
  )
  assert.ok(saved.kind === 'saved')
  assert.deepEqual(loadSavedWorkspace(storage, now), {
    kind: 'ready',
    workspace: saved.workspace,
  })
  const legacyProfile = structuredClone(workspaceV4.active.profile)
  Reflect.deleteProperty(legacyProfile.otherIncome, 'salary')
  const oldWorkspace = {
    ...saved.workspace,
    schemaVersion: 2,
    active: { ...saved.workspace.active!, profile: legacyProfile },
  }
  const raw = JSON.stringify(oldWorkspace)
  storage.setItem(WORKSPACE_KEY, raw)
  const restored = loadSavedWorkspace(storage, now)
  assert.ok(restored.kind === 'ready')
  assert.equal(restored.workspace.schemaVersion, 8)
  assert.deepEqual(restored.workspace.active?.profile.otherIncome.salary, {
    kind: 'none',
  })
  assert.deepEqual(
    restored.workspace.active?.completions,
    saved.workspace.active?.completions,
  )
  assert.equal(
    storage.getItem(WORKSPACE_KEY),
    raw,
    'Reading migrates in memory only',
  )
  const rewritten = saveSavedWorkspace(
    storage,
    restored.workspace.revision,
    {
      noticeVersion: 2,
      consentDecidedAt: now.toISOString(),
      activeTaxYear: TAX_YEAR,
      active: restored.workspace.active,
      priorYears: [],
    },
    now,
  )
  assert.ok(rewritten.kind === 'saved')
  assert.equal(rewritten.workspace.revision, restored.workspace.revision + 1)
  storage.setItem(
    WORKSPACE_KEY,
    JSON.stringify({
      ...oldWorkspace,
      active: { ...oldWorkspace.active, profile: salaryProfile },
    }),
  )
  assert.equal(
    loadSavedWorkspace(storage, now).kind,
    'invalid',
    'Version 2 cannot smuggle salary facts',
  )
})
