import { expect, test } from 'vitest'
import { evaluate, parseProfile, screenProfile } from '../../src/evaluation'
import type { Profile } from '../../src/evaluation'
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
import workspaceV6 from '../fixtures/workspace-v6.json' with { type: 'json' }
import recoveryV5 from '../fixtures/recovery-v5.json' with { type: 'json' }

const today = '2026-09-08'
const now = new Date(`${today}T12:00:00+05:30`)

test('places unsafe combined credits on a visible field even when equity gains are absent', () => {
  const value: Profile = {
    ...exampleProfile,
    otherIncome: {
      ...exampleProfile.otherIncome,
      tds: Number.MAX_SAFE_INTEGER,
      tcs: 1,
    },
  }
  expect(parseProfile(value).valid).toBe(false)
  const assessment = assessQuestionnaire(
    { draft: draftFromProfile(value) },
    'other-income',
    today,
  )
  expect(assessment.errors.tds).toContain('combined tax credits')
})

test('supports equity gains on the eligible-business path without changing its receipts or GST', () => {
  const base = profile(600_000)
  const value: Profile = {
    ...base,
    incomePath: {
      kind: 'eligible-business',
      confirmed: 'yes',
      grossReceipts: 10_000_000,
      qualifyingReceipts: 10_000_000,
      otherReceipts: 0,
      cashReceipts: 0,
      declaredProfit: 600_000,
      notSpecifiedProfession: 'yes',
      notGoodsCarriage: 'yes',
      notAgencyCommissionBrokerage: 'yes',
      noChapterViiiCDeduction: 'yes',
      fiveYearExclusion: 'none',
    },
  }
  const result = supported(value)
  expect(result.tax.finalAmount).toBe(30_550)
  expect(result.tax.presumptive.usedIncome).toBe(600_000)
  expect(result.coverage.gst).toEqual(supported(base).coverage.gst)
})

function profile(
  ordinary = 1_000_000,
  shortTermGains = 100_000,
  longTermGains = 200_000,
): Profile {
  return {
    ...exampleProfile,
    incomePath: {
      ...exampleProfile.incomePath,
      grossReceipts: ordinary * 2,
      declaredProfit: ordinary,
    },
    otherIncome: {
      ...exampleProfile.otherIncome,
      taxableBankInterest: 0,
      tds: 0,
      tcs: 0,
      equityGains: {
        kind: 'domestic',
        confirmed: 'yes',
        shortTermGains,
        longTermGains,
        shortTermLosses: 0,
        longTermLosses: 0,
      },
    },
  }
}
function supported(value: Profile, rules = currentRules) {
  const result = evaluate(value, now, rules)
  expect(result.kind).toBe('supported')
  if (result.kind !== 'supported')
    throw Error('Expected supported synthetic equity profile')
  return result
}

test.each([
  [1_000_000, 100_000, 200_000, 40_000, 20_000, 9_375, 0, 0, 72_150],
  [900_000, 100_000, 0, 30_000, 20_000, 0, 30_000, 0, 20_800],
  [300_000, 200_000, 0, 0, 20_000, 0, 0, 0, 20_800],
  [300_000, 0, 300_000, 0, 0, 9_375, 0, 0, 9_750],
  [1_100_000, 110_000, 0, 50_000, 22_000, 0, 0, 50_000, 22_880],
  [1_200_000, 10_000, 0, 60_000, 2_000, 0, 0, 52_000, 10_400],
  [0, 0, 525_000, 0, 0, 0, 0, 0, 0],
  [400_000, 100_000, 200_000, 0, 20_000, 9_375, 0, 0, 30_550],
])(
  'taxes ordinary %i, short-term %i and long-term %i separately',
  (
    ordinary,
    short,
    long,
    slabTax,
    shortTermTax,
    longTermTax,
    rebate,
    marginalRelief,
    finalAmount,
  ) => {
    const result = supported(profile(ordinary, short, long))
    expect(result.tax).toMatchObject({
      slabTax,
      rebate,
      marginalRelief,
      finalAmount,
      equityGains: { shortTermTax, longTermTax },
    })
    expect(result.tax.taxAfterRelief).toBeGreaterThanOrEqual(
      shortTermTax + longTermTax,
    )
  },
)

test.each([
  [124_999, 0],
  [125_000, 0],
  [125_001, 0.125],
  [125_005, 0.625],
])('uses the long-term threshold once for gains %i', (gains, tax) => {
  expect(
    supported(profile(800_000, 0, gains)).tax.equityGains?.longTermTax,
  ).toBe(tax)
})

test('rounds combined income once and keeps the threshold in filing and rebate income', () => {
  const result = supported(profile(399_990, 15, 0))
  expect(result.tax).toMatchObject({
    roundedTotalIncome: 400_010,
    ordinaryIncome: 399_995,
    equityGains: { shortTermTax: 2, basicExemptionUsed: 5 },
  })
  const filing = supported(profile(300_000, 0, 125_000))
  expect(filing.tax.finalAmount).toBe(0)
  expect(filing.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { required: true },
  })
  expect(supported(profile(1_200_000, 0, 125_000)).tax.rebate).toBe(0)
})

test('preserves the full income ceiling and does not treat the long-term threshold as exempt income', () => {
  const base = profile(1_000_000, 0, 4_000_000)
  expect(supported(base).tax.roundedTotalIncome).toBe(5_000_000)
  expect(
    evaluate(profile(1_000_000, 0, 4_000_010), now, currentRules).kind,
  ).toBe('unsupported')
})

test('withholds ambiguous mixed basic exemption in evaluator and questionnaire but permits either category alone', () => {
  const mixed = profile(300_000)
  const result = evaluate(mixed, now, currentRules)
  expect(result.kind).toBe('unsupported')
  if (result.kind !== 'unsupported') throw Error('Expected mixed-gain review')
  expect(
    result.facts.some(
      ({ code }) => code === 'equity-basic-exemption-allocation',
    ),
  ).toBe(true)
  expect(
    screenProfile(mixed, now, currentRules).facts.some(
      ({ code }) => code === 'equity-basic-exemption-allocation',
    ),
  ).toBe(true)
  const assessment = assessQuestionnaire(
    { draft: draftFromProfile(mixed) },
    'other-income',
    today,
  )
  expect(assessment.warnings.equityGainsConfirmed).toContain('both short-term')
  expect(supported(profile(300_000, 200_000, 0)).tax.finalAmount).toBe(20_800)
})

test('limits NPS to ordinary income and retains gains and the pre-deduction filing trigger', () => {
  const base = profile(0, 600_000, 0)
  const result = supported({
    ...base,
    otherIncome: {
      ...base.otherIncome,
      salary: {
        kind: 'domestic',
        confirmed: 'yes',
        grossSalary: 70_000,
        employerNps: {
          kind: 'contributions',
          confirmed: 'yes',
          employers: [{ contribution: 7_000, eligibleSalary: 50_000 }],
        },
      },
    },
  })
  expect(result.tax).toMatchObject({
    employerNpsDeduction: 0,
    incomeBeforeNpsDeduction: 600_000,
    roundedTotalIncome: 600_000,
    finalAmount: 41_600,
  })
  expect(result.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { required: true },
  })
})

test('combines salary dividends NPS and both gain categories with actual credits and independent GST', () => {
  const base = profile(200_000)
  const value: Profile = {
    ...base,
    otherIncome: {
      ...base.otherIncome,
      salary: {
        kind: 'domestic',
        confirmed: 'yes',
        grossSalary: 875_000,
        employerNps: {
          kind: 'contributions',
          confirmed: 'yes',
          employers: [{ contribution: 70_000, eligibleSalary: 500_000 }],
        },
      },
      additionalIncome: {
        kind: 'domestic',
        confirmed: 'yes',
        dividends: 70_000,
        mutualFundDistributions: 0,
        postOfficeInterest: 0,
        incomeTaxRefundInterest: 0,
      },
      tds: 50_000,
      tcs: 5_000,
      advanceTaxPaid: 20_000,
    },
  }
  const result = supported(value)
  expect(result.tax).toMatchObject({
    incomeBeforeNpsDeduction: 1_370_000,
    employerNpsDeduction: 70_000,
    ordinaryIncome: 1_000_000,
    roundedTotalIncome: 1_300_000,
    grossTax: 72_150,
    finalAmount: 2_850,
    outcome: 'refund',
  })
  expect(result.coverage.gst).toEqual(supported(exampleProfile).coverage.gst)
  expect(
    result.obligations.find(({ kind }) => kind === 'advance-tax')?.dueDate,
  ).toBe('2027-03-15')
  expect(result.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { formGuidance: 'unavailable' },
  })
})

test.each([
  undefined,
  null,
  { kind: 'none', shortTermGains: 1 },
  { kind: 'foreign' },
  { kind: 'domestic', confirmed: 'yes', shortTermGains: -1, longTermGains: 0 },
  { kind: 'domestic', confirmed: 'yes', shortTermGains: 1.5, longTermGains: 0 },
  { kind: 'domestic', confirmed: 'yes', shortTermGains: '1', longTermGains: 0 },
  { kind: 'domestic', confirmed: 'yes', shortTermGains: 1 },
  {
    kind: 'domestic',
    confirmed: 'yes',
    shortTermGains: Number.MAX_SAFE_INTEGER,
    longTermGains: 1,
  },
])('rejects malformed equity branch %#', (equityGains) => {
  expect(
    parseProfile({
      ...exampleProfile,
      otherIncome: { ...exampleProfile.otherIncome, equityGains },
    }).valid,
  ).toBe(false)
})

test('rejects unsafe combined income and withholds all uncertain and retained stop facts', () => {
  expect(
    parseProfile(profile(1_000_000, Number.MAX_SAFE_INTEGER, 0)).valid,
  ).toBe(false)
  for (const equityGains of [
    { kind: 'not-sure' },
    {
      kind: 'domestic',
      confirmed: 'not-sure',
      shortTermGains: 1,
      longTermGains: 0,
      shortTermLosses: 0,
      longTermLosses: 0,
    },
  ])
    expect(
      evaluate(
        {
          ...exampleProfile,
          otherIncome: { ...exampleProfile.otherIncome, equityGains },
        } as Profile,
        now,
        currentRules,
      ).kind,
    ).toBe('unsupported')
  for (const fact of [
    'capitalGains',
    'deductionsLossesOrSpecialRate',
    'foreignAssets',
    'cryptoLotteryGaming',
  ] as const)
    expect(
      evaluate({ ...profile(), unsupportedFacts: [fact] }, now, currentRules)
        .kind,
    ).toBe('unsupported')
})

test('fails closed for altered rates missing provenance and stale core authority', () => {
  const rate = structuredClone(currentRules)
  Object.assign(rate.groups.commonIncomeTax.values, {
    equityShortTermRate: 0.15,
  })
  const source = structuredClone(currentRules)
  Object.assign(source, {
    sources: source.sources.filter(
      ({ id }) => id !== 'domestic-equity-gains-2026',
    ),
  })
  const stale = structuredClone(currentRules)
  Object.assign(stale.groups.commonIncomeTax, { expiresOn: '2026-09-06' })
  for (const rules of [rate, source, stale])
    expect(evaluate(profile(), now, rules).kind).toBe('stale-rules')
})

test('round-trips equity answers and clears amounts and confirmation on deselection', () => {
  const original = profile()
  const state = sessionFromProfile(original, { kind: 'personal' }, today)
  expect(completeDraft(state.draft, today)).toMatchObject({
    valid: true,
    profile: { otherIncome: { equityGains: original.otherIncome.equityGains } },
  })
  expect(
    parseRecoveryDraft(recoveryFromSession(state, TAX_YEAR), TAX_YEAR)?.draft,
  ).toEqual(state.draft)
  const cleared = questionnaireReducer(state, {
    type: 'field-changed',
    field: 'hasEquityGains',
    value: 'no',
  })
  expect(cleared?.draft).toMatchObject({
    equityGainsConfirmed: '',
    amounts: { shortTermGains: '', longTermGains: '' },
  })
})

test('migrates captured workspaces without writing or changing consent and completions', () => {
  const storage = new TestStorage()
  const raw = JSON.stringify(workspaceV6)
  storage.setItem(WORKSPACE_KEY, raw)
  const result = loadSavedWorkspace(storage, now)
  expect(result.kind).toBe('ready')
  if (result.kind !== 'ready')
    throw Error('Expected migrated historical workspace')
  expect(result.workspace).toMatchObject({
    schemaVersion: 8,
    revision: workspaceV6.revision,
    consentDecidedAt: workspaceV6.consentDecidedAt,
    active: {
      completions: workspaceV6.active.completions,
      profile: { otherIncome: { equityGains: { kind: 'none' } } },
    },
  })
  expect(storage.getItem(WORKSPACE_KEY)).toBe(raw)
  expect(
    saveSavedWorkspace(
      storage,
      result.workspace.revision,
      {
        noticeVersion: result.workspace.noticeVersion,
        consentDecidedAt: result.workspace.consentDecidedAt,
        activeTaxYear: result.workspace.activeTaxYear,
        active: result.workspace.active,
        priorYears: result.workspace.priorYears,
      },
      now,
    ).kind,
  ).toBe('saved')
  const mixed = structuredClone(workspaceV6)
  Object.assign(mixed.active.profile.otherIncome, {
    equityGains: { kind: 'none' },
  })
  storage.setItem(WORKSPACE_KEY, JSON.stringify(mixed))
  expect(loadSavedWorkspace(storage, now).kind).toBe('invalid')
})

test('restores historical Recovery with equity unanswered and preserves legacy capital-gain stops', () => {
  const legacy = {
    ...recoveryV5,
    draft: {
      ...recoveryV5.draft,
      unsupportedFacts: ['capitalGains'],
      unsupportedCertainty: 'selected',
    },
  }
  const result = parseRecoveryDraft(legacy, TAX_YEAR)
  expect(result).toMatchObject({
    schemaVersion: 7,
    draft: {
      hasEquityGains: '',
      equityGainsConfirmed: '',
      unsupportedFacts: ['capitalGains'],
      amounts: { shortTermGains: '', longTermGains: '' },
    },
  })
  if (!result) throw Error('Expected historical Recovery')
  expect(completeDraft(result.draft, today).valid).toBe(false)
  expect(
    parseRecoveryDraft({ ...result, schemaVersion: 5 }, TAX_YEAR),
  ).toBeNull()
})
