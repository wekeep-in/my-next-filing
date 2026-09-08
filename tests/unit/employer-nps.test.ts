import { expect, test } from 'vitest'
import type { EmployerNps, Profile } from '../../src/evaluation'
import { evaluate, parseProfile } from '../../src/evaluation'
import { TAX_YEAR, currentRules } from '../../src/rules'
import {
  assessQuestionnaire,
  completeDraft,
  draftFromProfile,
  exampleProfile,
} from '../../src/routes/check/model'
import {
  questionnaireReducer,
  sessionFromProfile,
} from '../../src/routes/check/session'
import {
  parseRecoveryDraft,
  recoveryFromSession,
} from '../../src/recovery-draft'
import {
  WORKSPACE_KEY,
  loadSavedWorkspace,
  saveSavedWorkspace,
} from '../../src/workspace'
import { TestStorage } from '../helpers/storage'
import workspaceV5 from '../fixtures/workspace-v5.json' with { type: 'json' }
import recoveryV4 from '../fixtures/recovery-v4.json' with { type: 'json' }

const today = '2026-09-08'
const now = new Date(`${today}T12:00:00+05:30`)
function withNps(
  grossSalary = 1_275_000,
  contribution = 140_000,
  eligibleSalary = 1_000_000,
): Profile {
  return {
    ...exampleProfile,
    incomePath: {
      ...exampleProfile.incomePath,
      grossReceipts: 400_000,
      declaredProfit: 200_000,
    },
    otherIncome: {
      ...exampleProfile.otherIncome,
      taxableBankInterest: 0,
      tds: 0,
      tcs: 0,
      salary: {
        kind: 'domestic',
        confirmed: 'yes',
        grossSalary,
        employerNps: {
          kind: 'contributions',
          confirmed: 'yes',
          employers: [{ contribution, eligibleSalary }],
        },
      },
    },
  }
}
function replaceNps(profile: Profile, employerNps: EmployerNps): Profile {
  if (profile.otherIncome.salary.kind !== 'domestic')
    throw Error('Expected synthetic salary')
  return {
    ...profile,
    otherIncome: {
      ...profile.otherIncome,
      salary: { ...profile.otherIncome.salary, employerNps },
    },
  }
}

test.each([
  [0, 0, 1_400_000, 93_600],
  [100_000, 100_000, 1_300_000, 78_000],
  [140_000, 140_000, 1_260_000, 62_400],
  [200_000, 140_000, 1_260_000, 62_400],
])(
  'deducts employer contribution %i with the 14 percent cap',
  (contribution, deduction, total, tax) => {
    const result = evaluate(withNps(1_275_000, contribution), now, currentRules)
    expect(result.kind).toBe('supported')
    if (result.kind !== 'supported') return
    expect(result.tax).toMatchObject({
      salary: {
        grossSalary: 1_275_000,
        standardDeduction: 75_000,
        taxableSalary: 1_200_000,
      },
      incomeBeforeNpsDeduction: 1_400_000,
      employerNpsContributions: contribution,
      employerNpsDeduction: deduction,
      roundedTotalIncome: total,
      finalAmount: tax,
    })
  },
)

test.each([
  [1_215_000, 1_200_000, 0],
  [1_215_010, 1_200_010, 10],
  [5_015_000, 5_000_000, 1_123_200],
  [10_015_000, 10_000_000, 2_951_520],
])(
  'uses post-deduction income at rebate and ceiling boundary %i',
  (salary, total, finalAmount) => {
    const result = evaluate(withNps(salary), now, currentRules)
    expect(result.kind).toBe('supported')
    if (result.kind !== 'supported') return
    expect(result.tax.roundedTotalIncome).toBe(total)
    expect(result.tax.finalAmount).toBe(finalAmount)
  },
)

test('stops above the taxable ceiling and calculates a fractional percentage before rounding', () => {
  expect(evaluate(withNps(10_015_010), now, currentRules).kind).toBe(
    'unsupported',
  )
  const result = evaluate(
    withNps(1_275_000, 200_000, 1_000_001),
    now,
    currentRules,
  )
  expect(result.kind).toBe('supported')
  if (result.kind !== 'supported') return
  expect(result.tax.employerNpsDeduction).toBeCloseTo(140_000.14)
  expect(result.tax.roundedTotalIncome).toBe(1_260_000)
})

test('limits NPS to combined income rather than salary after standard deduction', () => {
  const profile = withNps(70_000, 8_000, 60_000)
  const result = evaluate(
    {
      ...profile,
      incomePath: {
        ...profile.incomePath,
        grossReceipts: 10_000,
        declaredProfit: 5_000,
      },
    },
    now,
    currentRules,
  )
  expect(result.kind).toBe('supported')
  if (result.kind !== 'supported') return
  expect(result.tax).toMatchObject({
    incomeBeforeNpsDeduction: 5_000,
    employerNpsDeduction: 5_000,
    roundedTotalIncome: 0,
  })
})

test('preserves the annual-return trigger before the NPS deduction in evaluation and screening', () => {
  const profile = withNps(295_000, 30_000, 250_000)
  const unknown = {
    ...profile,
    otherIncome: {
      ...profile.otherIncome,
      otherAnnualReturnTrigger: 'not-sure' as const,
    },
  }
  const result = evaluate(unknown, now, currentRules)
  expect(result.kind).toBe('supported')
  if (result.kind !== 'supported') return
  expect(result.tax).toMatchObject({
    incomeBeforeNpsDeduction: 420_000,
    roundedTotalIncome: 390_000,
    finalAmount: 0,
  })
  expect(result.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { required: true },
  })
  expect(
    result.obligations.find((o) => o.kind === 'annual-return')?.dueDate,
  ).toBe('2027-08-31')
  const assessment = assessQuestionnaire(
    { draft: draftFromProfile(unknown) },
    'other-income',
    today,
  )
  expect(assessment.progression.kind).toBe('next')
  expect(JSON.stringify(assessment)).not.toContain(
    'annual-return-trigger-uncertain',
  )
})

test('combines separate employers once and withholds unresolved cross-employer limits', () => {
  const profile = replaceNps(withNps(1_140_000), {
    kind: 'contributions',
    confirmed: 'yes',
    employers: [
      { contribution: 70_000, eligibleSalary: 500_000 },
      { contribution: 70_000, eligibleSalary: 500_000 },
    ],
  })
  const result = evaluate(profile, now, currentRules)
  expect(result.kind).toBe('supported')
  if (result.kind !== 'supported') return
  expect(result.tax).toMatchObject({
    employerNpsDeduction: 140_000,
    roundedTotalIncome: 1_125_000,
    salary: { standardDeduction: 75_000 },
  })
  const overCap = replaceNps(profile, {
    kind: 'contributions',
    confirmed: 'yes',
    employers: [
      { contribution: 100_000, eligibleSalary: 500_000 },
      { contribution: 40_000, eligibleSalary: 500_000 },
    ],
  })
  expect(evaluate(overCap, now, currentRules).kind).toBe('unsupported')
  expect(
    assessQuestionnaire(
      { draft: draftFromProfile(overCap) },
      'other-income',
      today,
    ).progression.kind,
  ).toBe('blocked')
})

test('keeps NPS separate from presumptive paths, GST and credits', () => {
  const profile = withNps()
  const result = evaluate(profile, now, currentRules)
  const absent = evaluate(
    replaceNps(profile, { kind: 'none' }),
    now,
    currentRules,
  )
  const business = evaluate(
    {
      ...profile,
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
      otherIncome: { ...profile.otherIncome, tds: 70_000 },
    },
    now,
    currentRules,
  )
  expect(result.kind).toBe('supported')
  expect(absent.kind).toBe('supported')
  expect(business.kind).toBe('supported')
  if (
    result.kind !== 'supported' ||
    absent.kind !== 'supported' ||
    business.kind !== 'supported'
  )
    return
  expect(result.tax.presumptive).toEqual(absent.tax.presumptive)
  expect(result.coverage.gst).toEqual(absent.coverage.gst)
  expect(business.tax).toMatchObject({
    employerNpsDeduction: 140_000,
    roundedTotalIncome: 1_260_000,
    outcome: 'refund',
    finalAmount: 7_600,
  })
  expect(
    result.obligations.find((o) => o.kind === 'advance-tax')?.dueDate,
  ).toBe('2027-03-15')
})

test.each([
  undefined,
  { kind: 'none', contribution: 0 },
  { kind: 'contributions', confirmed: 'yes', employers: [] },
  ...[-1, 1.5, Number.MAX_SAFE_INTEGER + 1, '1000'].map((contribution) => ({
    kind: 'contributions',
    confirmed: 'yes',
    employers: [{ contribution, eligibleSalary: 1_000_000 }],
  })),
  {
    kind: 'contributions',
    confirmed: 'yes',
    employers: [
      {
        contribution: 100_000,
        eligibleSalary: 1_000_000,
        name: 'Synthetic employer',
      },
    ],
  },
  {
    kind: 'contributions',
    confirmed: 'yes',
    employers: [{ contribution: Number.MAX_SAFE_INTEGER, eligibleSalary: 1 }],
  },
])('rejects malformed NPS branch %#', (employerNps) => {
  const profile = withNps()
  expect(
    parseProfile({
      ...profile,
      otherIncome: {
        ...profile.otherIncome,
        salary: { ...profile.otherIncome.salary, employerNps },
      },
    }).valid,
  ).toBe(false)
})

test('rejects salary contradictions and withholds uncertain or excess fund cases', () => {
  expect(parseProfile(withNps(1_000_000)).valid).toBe(false)
  for (const employerNps of [
    { kind: 'not-sure' },
    ...['no', 'not-sure'].map((confirmed) => ({
      kind: 'contributions',
      confirmed,
      employers: [{ contribution: 140_000, eligibleSalary: 1_000_000 }],
    })),
  ] as const) {
    const profile = withNps()
    const parsed = parseProfile({
      ...profile,
      otherIncome: {
        ...profile.otherIncome,
        salary: { ...profile.otherIncome.salary, employerNps },
      },
    })
    expect(parsed.valid).toBe(true)
    if (parsed.valid)
      expect(evaluate(parsed.profile, now, currentRules).kind).toBe(
        'unsupported',
      )
  }
  expect(evaluate(withNps(1_750_000, 750_000), now, currentRules).kind).toBe(
    'supported',
  )
  expect(evaluate(withNps(1_750_001, 750_001), now, currentRules).kind).toBe(
    'unsupported',
  )
})

test('fails closed for missing incorrect future or expired NPS authority', () => {
  for (const values of [
    { employerNpsRate: undefined },
    { employerNpsRate: 0.1 },
    { employerRetirementFundLimit: 750_001 },
  ]) {
    const rules = structuredClone(currentRules)
    Object.assign(rules.groups.commonIncomeTax.values, values)
    expect(evaluate(withNps(), now, rules).kind).toBe('stale-rules')
  }
  const missing = structuredClone(currentRules)
  Object.assign(missing.groups.commonIncomeTax, {
    provenance: missing.groups.commonIncomeTax.provenance.filter(
      (p) => p.ruleId !== 'employer-nps-deduction',
    ),
  })
  expect(evaluate(withNps(), now, missing).kind).toBe('stale-rules')
  const expired = structuredClone(currentRules)
  Object.assign(expired.groups.commonIncomeTax, { expiresOn: '2026-09-07' })
  expect(
    evaluate(withNps(), new Date('2026-09-08T12:00:00+05:30'), expired).kind,
  ).toBe('stale-rules')
  expect(
    evaluate(withNps(), new Date('2026-09-06T12:00:00+05:30'), currentRules)
      .kind,
  ).toBe('stale-rules')
})

test('round-trips NPS and clears hidden rows and confirmations', () => {
  const profile = withNps()
  const draft = draftFromProfile(profile)
  expect(completeDraft(draft, today)).toMatchObject({ valid: true, profile })
  const session = sessionFromProfile(profile, { kind: 'personal' }, today)
  const recovery = recoveryFromSession(session, TAX_YEAR)
  expect(parseRecoveryDraft(recovery, TAX_YEAR)).toEqual(recovery)
  for (const field of ['hasSalary', 'hasEmployerNps'] as const) {
    const cleared = questionnaireReducer(session, {
      type: 'field-changed',
      field,
      value: 'no',
    })
    expect(cleared?.draft).toMatchObject({
      employerNpsConfirmed: '',
      employerNpsEmployers: [],
    })
  }
  for (const changed of [
    { ...draft, hasEmployerNps: '' as const },
    { ...draft, employerNpsConfirmed: '' as const },
    {
      ...draft,
      employerNpsEmployers: [{ contribution: '', eligibleSalary: '1000000' }],
    },
  ])
    expect(
      assessQuestionnaire({ draft: changed }, 'other-income', today).progression
        .kind,
    ).toBe('blocked')
})

test('migrates captured salary workspaces in memory and preserves consent and completions on save', () => {
  const storage = new TestStorage()
  const raw = JSON.stringify(workspaceV5)
  storage.setItem(WORKSPACE_KEY, raw)
  const loaded = loadSavedWorkspace(storage, now)
  expect(loaded.kind).toBe('ready')
  if (loaded.kind !== 'ready') return
  expect(storage.getItem(WORKSPACE_KEY)).toBe(raw)
  expect(loaded.workspace).toMatchObject({
    schemaVersion: 11,
    consentDecidedAt: workspaceV5.consentDecidedAt,
    active: {
      completions: workspaceV5.active.completions,
      profile: {
        otherIncome: {
          salary: { grossSalary: 1_000_000, employerNps: { kind: 'none' } },
        },
      },
    },
  })
  const saved = saveSavedWorkspace(
    storage,
    loaded.workspace.revision,
    {
      noticeVersion: loaded.workspace.noticeVersion,
      consentDecidedAt: loaded.workspace.consentDecidedAt,
      activeTaxYear: loaded.workspace.activeTaxYear,
      active: loaded.workspace.active,
      priorYears: loaded.workspace.priorYears,
    },
    now,
  )
  expect(saved.kind).toBe('saved')
  if (saved.kind === 'saved')
    expect(saved.workspace.revision).toBe(workspaceV5.revision + 1)
  const mixed = structuredClone(workspaceV5)
  Object.assign(mixed.active.profile.otherIncome.salary, {
    employerNps: { kind: 'none' },
  })
  storage.setItem(WORKSPACE_KEY, JSON.stringify(mixed))
  expect(loadSavedWorkspace(storage, now).kind).toBe('invalid')
})

test('restores captured Recovery with NPS unanswered and rejects mixed schemas and hidden rows', () => {
  const migrated = parseRecoveryDraft(recoveryV4, TAX_YEAR)
  expect(migrated).toMatchObject({
    schemaVersion: 10,
    draft: {
      hasSalary: 'yes',
      hasEmployerNps: '',
      employerNpsConfirmed: '',
      employerNpsEmployers: [],
      amounts: { grossSalary: '10,00,000' },
    },
  })
  expect(migrated).not.toBeNull()
  if (!migrated) return
  expect(completeDraft(migrated.draft, today).valid).toBe(false)
  expect(
    parseRecoveryDraft({ ...migrated, schemaVersion: 4 }, TAX_YEAR),
  ).toBeNull()
  expect(
    parseRecoveryDraft(
      {
        ...migrated,
        draft: {
          ...migrated.draft,
          employerNpsEmployers: [{ contribution: '1', eligibleSalary: '2' }],
        },
      },
      TAX_YEAR,
    ),
  ).toBeNull()
})
