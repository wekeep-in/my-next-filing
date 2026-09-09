import { expect, test } from 'vitest'
import { evaluate, parseProfile, screenProfile } from '../../src/evaluation'
import type { Profile } from '../../src/evaluation'
import { TAX_YEAR, currentRules } from '../../src/rules'
import {
  assessQuestionnaire,
  draftFromProfile,
  exampleProfile,
} from '../../src/routes/check/model'
import { WORKSPACE_KEY, loadSavedWorkspace } from '../../src/workspace'
import { parseRecoveryDraft } from '../../src/recovery-draft'
import { TestStorage } from '../helpers/storage'
import workspaceV9 from '../fixtures/workspace-v9.json' with { type: 'json' }
import recoveryV8 from '../fixtures/recovery-v8.json' with { type: 'json' }

const today = '2026-09-08'
const now = new Date(`${today}T12:00:00+05:30`)
function ordinary(income: number): Profile {
  return {
    ...exampleProfile,
    incomePath: {
      kind: 'eligible-business',
      confirmed: 'yes',
      grossReceipts: income,
      qualifyingReceipts: income,
      otherReceipts: 0,
      cashReceipts: 0,
      declaredProfit: income,
      notSpecifiedProfession: 'yes',
      notGoodsCarriage: 'yes',
      notAgencyCommissionBrokerage: 'yes',
      noChapterViiiCDeduction: 'yes',
      fiveYearExclusion: 'none',
    },
    otherIncome: {
      ...exampleProfile.otherIncome,
      taxableBankInterest: 0,
      tds: 0,
      tcs: 0,
    },
  }
}
function supported(profile: Profile, rules = currentRules) {
  expect(parseProfile(profile).valid).toBe(true)
  const result = evaluate(profile, now, rules)
  expect(result.kind).toBe('supported')
  if (result.kind !== 'supported')
    throw Error('Expected supported synthetic ordinary income')
  return result
}

test.each([
  { income: 4_999_990, final: 1_123_200, surcharge: null },
  { income: 5_000_000, final: 1_123_200, surcharge: null },
  { income: 5_000_004, final: 1_123_200, surcharge: null },
  {
    income: 5_000_005,
    final: 1_123_210,
    surcharge: { before: 108_000.3, relief: 107_993.3, net: 7 },
  },
  {
    income: 5_100_000,
    final: 1_227_200,
    surcharge: { before: 111_000, relief: 41_000, net: 70_000 },
  },
  {
    income: 5_161_190,
    final: 1_290_840,
    surcharge: { before: 112_835.7, relief: 2.7, net: 112_833 },
  },
  {
    income: 5_161_200,
    final: 1_290_840,
    surcharge: { before: 112_836, relief: 0, net: 112_836 },
  },
  {
    income: 5_200_000,
    final: 1_304_160,
    surcharge: { before: 114_000, relief: 0, net: 114_000 },
  },
  {
    income: 6_000_000,
    final: 1_578_720,
    surcharge: { before: 138_000, relief: 0, net: 138_000 },
  },
  {
    income: 10_000_000,
    final: 2_951_520,
    surcharge: { before: 258_000, relief: 0, net: 258_000 },
  },
])(
  'computes surcharge relief and cess at ordinary income $income',
  ({ income, final, surcharge }) => {
    const result = supported(ordinary(income))
    expect(result.tax.finalAmount).toBe(final)
    expect(result.tax.marginalRelief).toBe(0)
    if (!surcharge) expect(result.tax.surcharge).toBeNull()
    else {
      expect(result.tax.surcharge?.beforeRelief).toBeCloseTo(surcharge.before)
      expect(result.tax.surcharge?.marginalRelief).toBeCloseTo(surcharge.relief)
      expect(result.tax.surcharge?.amount).toBeCloseTo(surcharge.net)
      expect(result.tax.surcharge?.taxAtThreshold).toBe(1_080_000)
    }
  },
)

test('applies actual TDS TCS and advance payments once after surcharge and cess', () => {
  const base = ordinary(6_000_000)
  const paid = {
    ...base,
    otherIncome: {
      ...base.otherIncome,
      tds: 1_000_000,
      tcs: 100_000,
      advanceTaxPaid: 300_000,
    },
  }
  expect(supported(paid).tax).toMatchObject({
    grossTax: 1_578_720,
    cess: 60_720,
    estimatedAdvanceTaxLiability: 478_720,
    finalAmount: 178_720,
    outcome: 'payable',
  })
  expect(
    supported({
      ...paid,
      otherIncome: { ...paid.otherIncome, advanceTaxPaid: 700_000 },
    }).tax,
  ).toMatchObject({ finalAmount: 221_280, outcome: 'refund' })
  expect(
    supported(paid).obligations.find(({ kind }) => kind === 'advance-tax')
      ?.dueDate,
  ).toBe('2027-03-15')
})

test('supports professional profit plus salary rental and dividends without changing the practice or GST', () => {
  const profile: Profile = {
    ...exampleProfile,
    incomePath: {
      ...exampleProfile.incomePath,
      grossReceipts: 4_000_000,
      declaredProfit: 3_000_000,
    },
    otherIncome: {
      ...exampleProfile.otherIncome,
      taxableBankInterest: 0,
      tds: 0,
      salary: {
        kind: 'domestic',
        confirmed: 'yes',
        grossSalary: 2_075_000,
        employerNps: {
          kind: 'contributions',
          confirmed: 'yes',
          employers: [{ eligibleSalary: 1_000_000, contribution: 140_000 }],
        },
      },
      rentalIncome: {
        kind: 'domestic',
        confirmed: 'yes',
        gstConfirmed: 'yes',
        rentalAnnualValue: 300_000,
        rentalMunicipalTaxes: 0,
        rentalInterest: 0,
      },
      additionalIncome: {
        kind: 'domestic',
        confirmed: 'yes',
        dividends: 30_000,
        mutualFundDistributions: 0,
        postOfficeInterest: 0,
        incomeTaxRefundInterest: 0,
      },
    },
  }
  const result = supported(profile)
  expect(result.tax).toMatchObject({
    incomeBeforeNpsDeduction: 5_240_000,
    employerNpsDeduction: 140_000,
    roundedTotalIncome: 5_100_000,
    finalAmount: 1_227_200,
  })
  expect(result.coverage.gst).toEqual(supported(exampleProfile).coverage.gst)
  expect(result.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { required: true, formGuidance: 'unavailable' },
  })
})

test('supports positive net equity gains above fifty lakh without removing their annual threshold', () => {
  for (const [shortTermGains, longTermGains] of [
    [10, 0],
    [0, 10],
    [10, 10],
  ]) {
    const base = ordinary(5_000_000)
    const input: Profile = {
      ...base,
      otherIncome: {
        ...base.otherIncome,
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
    const result = supported(input)
    expect(result.tax.surcharge).not.toBeNull()
    expect(screenProfile(input, now, currentRules).facts).toEqual([])
  }
})

test('permits pure losses and fully offset gains in the ordinary band while preserving loss filing guidance', () => {
  const base = ordinary(5_100_000)
  const result = supported({
    ...base,
    otherIncome: {
      ...base.otherIncome,
      equityGains: {
        kind: 'domestic',
        confirmed: 'yes',
        shortTermGains: 100_000,
        longTermGains: 0,
        shortTermLosses: 150_000,
        longTermLosses: 0,
      },
    },
  })
  expect(result.tax.finalAmount).toBe(1_227_200)
  expect(result.tax.equityGains?.unusedShortTermLoss).toBe(50_000)
  expect(result.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { lossCarryForward: { maximumYears: 8 } },
  })
})

test('stops above the rounded one-crore ceiling and retains all legacy exclusions', () => {
  expect(supported(ordinary(10_000_004)).tax.roundedTotalIncome).toBe(
    10_000_000,
  )
  expect(evaluate(ordinary(10_000_005), now, currentRules).kind).toBe(
    'unsupported',
  )
  for (const fact of [
    'surchargeCase',
    'auditRequirement',
    'deductionsLossesOrSpecialRate',
  ] as const) {
    const input = { ...ordinary(5_100_000), unsupportedFacts: [fact] }
    expect(evaluate(input, now, currentRules).kind).toBe('unsupported')
    expect(
      assessQuestionnaire(
        { draft: draftFromProfile(input) },
        'other-income',
        today,
      ).warnings['unsupportedSituationAnswers-businessTax'],
    ).toBeTruthy()
  }
  expect(
    assessQuestionnaire(
      { draft: draftFromProfile(ordinary(5_100_000)) },
      'other-income',
      today,
    ).progression.kind,
  ).not.toBe('blocked')
})

test.each(['surchargeRate', 'surchargeThreshold', 'incomeCeiling'] as const)(
  'fails closed for an unreviewed %s',
  (field) => {
    const rules = structuredClone(currentRules)
    Object.assign(rules.groups.commonIncomeTax.values, { [field]: 1 })
    expect(evaluate(ordinary(5_100_000), now, rules).kind).toBe('stale-rules')
  },
)

test('requires surcharge provenance and preserves tax when only annual-return evidence expires', () => {
  const rules = structuredClone(currentRules)
  Object.assign(rules.groups.commonIncomeTax, {
    provenance: rules.groups.commonIncomeTax.provenance.filter(
      ({ ruleId }) => ruleId !== 'surcharge-marginal-relief',
    ),
  })
  expect(evaluate(ordinary(5_100_000), now, rules).kind).toBe('stale-rules')
  const annualStale = structuredClone(currentRules)
  Object.assign(annualStale.groups.annualReturn, { expiresOn: '2026-09-07' })
  expect(supported(ordinary(5_100_000), annualStale).tax.finalAmount).toBe(
    1_227_200,
  )
  expect(
    supported(ordinary(5_100_000), annualStale).coverage.annualReturn.kind,
  ).toBe('unavailable')
})

test('keeps historical workspace and Recovery data intact without a new schema', () => {
  const storage = new TestStorage()
  const raw = JSON.stringify(workspaceV9)
  storage.setItem(WORKSPACE_KEY, raw)
  const loaded = loadSavedWorkspace(storage, now)
  if (loaded.kind !== 'ready' || !loaded.workspace.active)
    throw Error('Expected historical workspace')
  expect(loaded.workspace.schemaVersion).toBe(11)
  expect(loaded.workspace.active.completions).toEqual(
    workspaceV9.active.completions,
  )
  expect(supported(loaded.workspace.active.profile).tax.finalAmount).toBe(
    55_160,
  )
  expect(storage.getItem(WORKSPACE_KEY)).toBe(raw)
  expect(parseRecoveryDraft(recoveryV8, TAX_YEAR)?.draft.amounts).toEqual(
    recoveryV8.draft.amounts,
  )
})

test('requires the registered-proprietor exemption source independently for GST', () => {
  const base = ordinary(5_100_000)
  const input: Profile = {
    ...base,
    otherIncome: {
      ...base.otherIncome,
      rentalIncome: {
        kind: 'domestic',
        confirmed: 'yes',
        gstConfirmed: 'yes',
        rentalAnnualValue: 0,
        rentalMunicipalTaxes: 0,
        rentalInterest: 0,
      },
    },
  }
  const missing = {
    ...currentRules,
    sources: currentRules.sources.filter(
      ({ id }) => id !== 'gst-residential-rent-proprietor',
    ),
  }
  const result = supported(input, missing)
  expect(result.tax.finalAmount).toBe(1_227_200)
  expect(result.coverage.gst.kind).toBe('unavailable')
  expect(result.coverage.annualReturn.kind).toBe('available')
  expect(supported(input).coverage.gst.kind).toBe('available')
})

test('the rental exemption preserves a registered calendar and source failure withholds its dates', () => {
  const input: Profile = {
    ...ordinary(5_100_000),
    otherIncome: {
      ...ordinary(5_100_000).otherIncome,
      rentalIncome: {
        kind: 'domestic',
        confirmed: 'yes',
        gstConfirmed: 'yes',
        rentalAnnualValue: 0,
        rentalMunicipalTaxes: 0,
        rentalInterest: 0,
      },
    },
    gst: {
      kind: 'registered',
      status: 'one-normal',
      state: 'Maharashtra',
      calendar: {
        registeredFrom: '2026-04-01',
        continuous: 'yes',
        cadences: ['monthly', 'monthly', 'monthly', 'monthly'],
        exportRoute: 'none',
        lutConfirmed: null,
        firstExportDate: null,
      },
    },
  }
  const result = supported(input)
  expect(result.coverage.gst.kind).toBe('available')
  expect(
    result.obligations.filter(({ kind }) => kind === 'gst-gstr1'),
  ).toHaveLength(12)
  const missing = {
    ...currentRules,
    sources: currentRules.sources.filter(
      ({ id }) => id !== 'gst-residential-rent-proprietor',
    ),
  }
  const withheld = supported(input, missing)
  expect(withheld.tax).toEqual(result.tax)
  expect(withheld.coverage.gst.kind).toBe('unavailable')
  expect(withheld.obligations.some(({ kind }) => kind === 'gst-gstr1')).toBe(
    false,
  )
  const uncertain = {
    ...input,
    otherIncome: {
      ...input.otherIncome,
      rentalIncome: {
        kind: 'domestic',
        confirmed: 'yes',
        gstConfirmed: 'not-sure',
        rentalAnnualValue: 0,
        rentalMunicipalTaxes: 0,
        rentalInterest: 0,
      } as const,
    },
  }
  expect(supported(uncertain).coverage.gst.kind).toBe('unavailable')
})

test.each([
  [6_000_000, 100, 0, 1_079_990, 1_578_740],
  [6_000_000, 0, 100, 1_079_970, 1_578_720],
  [4_900_000, 100_010, 0, 1_069_999, 1_112_810],
  [300_000, 0, 4_700_010, 559_375, 581_760],
  [3_000_000, 0, 2_000_010, 714_373.25, 742_960],
  [1_000_000, 0, 4_000_010, 524_375, 545_360],
  [0, 5_000_010, 0, 920_000, 956_810],
])(
  'compares the same mixed income at the surcharge threshold for %i ordinary / %i ST / %i LT',
  (income, shortTermGains, longTermGains, taxAtThreshold, finalAmount) => {
    const base = ordinary(income)
    const value: Profile = {
      ...base,
      otherIncome: {
        ...base.otherIncome,
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
    const result = supported(value)
    expect(result.tax.finalAmount).toBe(finalAmount)
    expect(result.tax.surcharge?.taxAtThreshold).toBeCloseTo(taxAtThreshold)
    expect(screenProfile(value, now, currentRules).facts).toEqual([])
  },
)
