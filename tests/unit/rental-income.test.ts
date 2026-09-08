import { expect, test } from 'vitest'
import { evaluate, parseProfile, screenProfile } from '../../src/evaluation'
import type { Profile, RentalIncome } from '../../src/evaluation'
import { TAX_YEAR, currentRules } from '../../src/rules'
import {
  assessQuestionnaire,
  completeDraft,
  draftFromProfile,
  exampleProfile,
  rentalIncomeKeys,
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
import workspaceV8 from '../fixtures/workspace-v8.json' with { type: 'json' }
import recoveryV7 from '../fixtures/recovery-v7.json' with { type: 'json' }

const today = '2026-09-08'
const now = new Date(`${today}T12:00:00+05:30`)
const rent = {
  kind: 'domestic',
  confirmed: 'yes',
  gstConfirmed: 'yes',
  rentalAnnualValue: 300_000,
  rentalMunicipalTaxes: 20_000,
  rentalInterest: 100_000,
} as const
function profile(rentalIncome: RentalIncome = rent): Profile {
  return {
    ...exampleProfile,
    otherIncome: { ...exampleProfile.otherIncome, rentalIncome },
  }
}
function supported(value: Profile, rules = currentRules) {
  expect(parseProfile(value).valid).toBe(true)
  const result = evaluate(value, now, rules)
  expect(result.kind).toBe('supported')
  if (result.kind !== 'supported')
    throw Error('Expected supported synthetic rental profile')
  return result
}

test('deducts property expenses once and combines income credits and the presumptive payment date', () => {
  const result = supported(profile())
  expect(result.tax.rentalIncome).toEqual({
    rentalAnnualValue: 300_000,
    rentalMunicipalTaxes: 20_000,
    rentalInterest: 100_000,
    netAnnualValue: 280_000,
    standardDeduction: 84_000,
    taxableIncome: 96_000,
  })
  expect(result.tax).toMatchObject({
    roundedTotalIncome: 1_506_000,
    slabTax: 105_900,
    cess: 4_236,
    finalAmount: 70_140,
  })
  expect(
    result.obligations.find(({ kind }) => kind === 'advance-tax')?.dueDate,
  ).toBe('2027-03-15')
  expect(result.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { required: true, formGuidance: 'unavailable' },
  })
  expect(result.tax.presumptive).toEqual(
    supported(exampleProfile).tax.presumptive,
  )
  expect(result.coverage.gst).toEqual(supported(exampleProfile).coverage.gst)
})

test.each([
  { value: 100, taxes: 0, interest: 70, taxable: 0, rounded: 1_410_000 },
  { value: 100, taxes: 100, interest: 0, taxable: 0, rounded: 1_410_000 },
  { value: 101, taxes: 0, interest: 0, taxable: 70.7, rounded: 1_410_070 },
  { value: 0, taxes: 0, interest: 0, taxable: 0, rounded: 1_410_000 },
])(
  'preserves the zero and fractional property boundary $value/$taxes/$interest',
  ({ value, taxes, interest, taxable, rounded }) => {
    const result = supported(
      profile({
        ...rent,
        rentalAnnualValue: value,
        rentalMunicipalTaxes: taxes,
        rentalInterest: interest,
      }),
    )
    expect(result.tax.rentalIncome?.taxableIncome).toBeCloseTo(taxable)
    expect(result.tax.roundedTotalIncome).toBe(rounded)
  },
)

test('combines rental salary NPS dividends and equity without mixing income categories', () => {
  const result = supported({
    ...profile(),
    otherIncome: {
      ...profile().otherIncome,
      salary: {
        kind: 'domestic',
        confirmed: 'yes',
        grossSalary: 1_000_000,
        employerNps: {
          kind: 'contributions',
          confirmed: 'yes',
          employers: [{ eligibleSalary: 500_000, contribution: 70_000 }],
        },
      },
      additionalIncome: {
        kind: 'domestic',
        confirmed: 'yes',
        dividends: 30_000,
        mutualFundDistributions: 0,
        postOfficeInterest: 0,
        incomeTaxRefundInterest: 0,
      },
      equityGains: {
        kind: 'domestic',
        confirmed: 'yes',
        shortTermGains: 100_000,
        longTermGains: 200_000,
        shortTermLosses: 0,
        longTermLosses: 0,
      },
    },
  })
  expect(result.tax).toMatchObject({
    ordinaryIncome: 2_391_000,
    employerNpsDeduction: 70_000,
    roundedTotalIncome: 2_691_000,
    slabTax: 297_750,
    grossTax: 340_210,
    finalAmount: 300_210,
  })
})

test('supports rent on the eligible-business path and includes it before the NPS cap', () => {
  const result = supported({
    ...profile({
      ...rent,
      rentalAnnualValue: 1_000,
      rentalMunicipalTaxes: 0,
      rentalInterest: 0,
    }),
    incomePath: {
      kind: 'eligible-business',
      confirmed: 'yes',
      grossReceipts: 0,
      cashReceipts: 0,
      qualifyingReceipts: 0,
      otherReceipts: 0,
      declaredProfit: 0,
      notSpecifiedProfession: 'yes',
      notGoodsCarriage: 'yes',
      notAgencyCommissionBrokerage: 'yes',
      noChapterViiiCDeduction: 'yes',
      fiveYearExclusion: 'none',
    },
    otherIncome: {
      ...profile({
        ...rent,
        rentalAnnualValue: 1_000,
        rentalMunicipalTaxes: 0,
        rentalInterest: 0,
      }).otherIncome,
      taxableBankInterest: 0,
      salary: {
        kind: 'domestic',
        confirmed: 'yes',
        grossSalary: 10_000,
        employerNps: {
          kind: 'contributions',
          confirmed: 'yes',
          employers: [{ eligibleSalary: 8_000, contribution: 1_000 }],
        },
      },
    },
  })
  expect(result.tax).toMatchObject({
    incomeBeforeNpsDeduction: 700,
    employerNpsDeduction: 700,
    roundedTotalIncome: 0,
  })
})

test('rental income can establish filing and cross the rebate and high-income boundaries', () => {
  const low: Profile = {
    ...profile(),
    incomePath: {
      ...exampleProfile.incomePath,
      grossReceipts: 700_000,
      declaredProfit: 350_000,
    },
    otherIncome: {
      ...profile().otherIncome,
      taxableBankInterest: 0,
      tds: 0,
      otherAnnualReturnTrigger: 'not-sure',
    },
  }
  expect(supported(low).coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { required: true },
  })
  const atRebate = {
    ...low,
    incomePath: {
      ...low.incomePath,
      grossReceipts: 1_104_000,
      declaredProfit: 1_104_000,
    },
  }
  expect(supported(atRebate).tax).toMatchObject({
    roundedTotalIncome: 1_200_000,
    rebate: 60_000,
    finalAmount: 0,
  })
  const aboveRebate = {
    ...atRebate,
    incomePath: { ...atRebate.incomePath, declaredProfit: 1_104_010 },
  }
  expect(supported(aboveRebate).tax).toMatchObject({
    roundedTotalIncome: 1_200_010,
    rebate: 0,
    marginalRelief: 59_991.5,
    finalAmount: 10,
  })
  const high = {
    ...low,
    incomePath: {
      ...low.incomePath,
      grossReceipts: 4_904_000,
      declaredProfit: 4_904_000,
    },
  }
  expect(supported(high).tax.roundedTotalIncome).toBe(5_000_000)
  const stopped = evaluate(
    {
      ...high,
      otherIncome: {
        ...high.otherIncome,
        additionalIncome: {
          kind: 'domestic',
          confirmed: 'yes',
          dividends: 5_000_010,
          mutualFundDistributions: 0,
          postOfficeInterest: 0,
          incomeTaxRefundInterest: 0,
        },
      },
    },
    now,
    currentRules,
  )
  expect(stopped.kind).toBe('unsupported')
  if (stopped.kind === 'unsupported')
    expect(stopped.facts.some(({ code }) => code === 'income-ceiling')).toBe(
      true,
    )
})

test.each(['no', 'not-sure'] as const)(
  'withholds the core estimate for %s rental scope and for a property loss',
  (confirmed) => {
    for (const rentalIncome of [
      { ...rent, confirmed },
      { ...rent, rentalInterest: 196_001 },
    ]) {
      const input = profile(rentalIncome)
      expect(parseProfile(input).valid).toBe(true)
      const result = evaluate(input, now, currentRules)
      expect(result.kind).toBe('unsupported')
      expect(result).not.toHaveProperty('tax')
      expect(
        screenProfile(input, now, currentRules).facts.length,
      ).toBeGreaterThan(0)
    }
  },
)

test.each([
  'rentalAnnualValue',
  'rentalMunicipalTaxes',
  'rentalInterest',
] as const)(
  'rejects malformed, missing and unsafe %s at the Profile boundary',
  (key) => {
    for (const amount of [
      -1,
      1.5,
      '100',
      undefined,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(
        parseProfile({
          ...profile(),
          otherIncome: {
            ...profile().otherIncome,
            rentalIncome: { ...rent, [key]: amount },
          },
        }).valid,
      ).toBe(false)
    }
  },
)

test('rejects inconsistent taxes hidden amounts unknown keys and unsafe combined income', () => {
  for (const rentalIncome of [
    { ...rent, rentalMunicipalTaxes: 300_001 },
    { kind: 'none', rentalAnnualValue: 0 },
    { ...rent, tenantName: 'Synthetic' },
    { ...rent, rentalAnnualValue: Number.MAX_SAFE_INTEGER },
  ])
    expect(
      parseProfile({
        ...profile(),
        otherIncome: { ...profile().otherIncome, rentalIncome },
      }).valid,
    ).toBe(false)
  expect(evaluate(profile({ kind: 'not-sure' }), now, currentRules).kind).toBe(
    'unsupported',
  )
})

test.each(['no', 'not-sure'] as const)(
  'preserves income but withholds unregistered GST conclusions for %s rental GST',
  (gstConfirmed) => {
    const input = profile({ ...rent, gstConfirmed })
    const result = supported(input)
    expect(result.tax.finalAmount).toBe(70_140)
    expect(result.coverage.gst).toMatchObject({
      kind: 'unavailable',
      code: 'rental-gst-review',
    })
    expect(result.obligations.some(({ kind }) => kind.startsWith('gst-'))).toBe(
      false,
    )
    expect(result.coverage.annualReturn.kind).toBe('available')
    const assessment = assessQuestionnaire(
      { draft: draftFromProfile(input) },
      'other-income',
      today,
    )
    expect(assessment.progression.kind).not.toBe('blocked')
    expect(assessment.coverage.rentalGstConfirmed).toContain('tenant')
  },
)

test('preserves an independent LUT while withholding registered return dates for rental review', () => {
  const input: Profile = {
    ...profile({ ...rent, gstConfirmed: 'not-sure' }),
    clients: {
      kind: 'foreign',
      delivery: 'direct',
      platform: null,
      foreign: {
        workPerformedInIndia: 'yes',
        recipientIdentifiable: 'yes',
        ownAccount: 'yes',
        ordinaryPlaceOfSupply: 'yes',
        sameEstablishment: 'no',
        paymentRoute: 'convertible-foreign-exchange',
        settledToIndianBank: 'yes',
        accountExposure: 'none',
        foreignOperation: 'no',
        foreignTax: 'no',
        treatyRelief: 'no',
        receiptsResolved: 'yes',
        currencyResolved: 'yes',
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
        exportRoute: 'lut',
        lutConfirmed: 'yes',
        firstExportDate: '2026-09-01',
      },
    },
  }
  const result = supported(input)
  expect(result.coverage.gst.kind).toBe('unavailable')
  expect(result.coverage.lut.kind).toBe('available')
  expect(
    result.obligations.some(({ kind }) =>
      ['gst-gstr1', 'gst-gstr3b', 'gst-qrmp-payment'].includes(kind),
    ),
  ).toBe(false)
  expect(result.obligations.some(({ kind }) => kind === 'gst-lut')).toBe(true)
  expect(
    assessQuestionnaire(
      { draft: draftFromProfile(input) },
      'other-income',
      today,
    ).coverage.rentalGstConfirmed,
  ).toContain('GST')
  const confirmed = supported({
    ...input,
    otherIncome: { ...input.otherIncome, rentalIncome: rent },
  })
  expect(confirmed.coverage.gst.kind).toBe('available')
  expect(confirmed.obligations.some(({ kind }) => kind === 'gst-gstr1')).toBe(
    true,
  )
})

test('rental source or rate failures stop tax while rental GST evidence failures remain independent', () => {
  for (const sourceId of [
    'domestic-rental-income-2026',
    'gst-residential-rent-exemption',
    'gst-residential-rent-tenants',
  ]) {
    const rules = {
      ...currentRules,
      sources: currentRules.sources.filter(({ id }) => id !== sourceId),
    }
    const result = evaluate(profile(), now, rules)
    if (sourceId === 'domestic-rental-income-2026')
      expect(result.kind).toBe('stale-rules')
    else {
      expect(result.kind).toBe('supported')
      if (result.kind === 'supported')
        expect(result.coverage.gst.kind).toBe('unavailable')
    }
  }
  const rules = structuredClone(currentRules)
  Object.assign(rules.groups.commonIncomeTax.values, {
    rentalStandardDeductionRate: 0.4,
  })
  expect(evaluate(profile(), now, rules).kind).toBe('stale-rules')
  Object.assign(rules.groups.commonIncomeTax.values, {
    rentalStandardDeductionRate: 0.3,
  })
  Object.assign(rules.groups.commonIncomeTax, { expiresOn: '2026-09-07' })
  expect(evaluate(profile(), now, rules).kind).toBe('stale-rules')
})

test('roundtrips rental answers, requires every amount and GST answer, and clears deselected fields', () => {
  const state = sessionFromProfile(profile(), { kind: 'personal' }, today)
  expect(completeDraft(state.draft, today)).toMatchObject({
    valid: true,
    profile: profile(),
  })
  const recovered = parseRecoveryDraft(
    recoveryFromSession(state, TAX_YEAR),
    TAX_YEAR,
  )
  expect(recovered?.draft.amounts.rentalAnnualValue).toBe('3,00,000')
  for (const key of rentalIncomeKeys) {
    const draft = {
      ...state.draft,
      amounts: { ...state.draft.amounts, [key]: '' },
    }
    expect(
      assessQuestionnaire({ draft }, 'other-income', today).progression.kind,
    ).toBe('blocked')
  }
  expect(
    completeDraft({ ...state.draft, rentalGstConfirmed: '' }, today).valid,
  ).toBe(false)
  const cleared = questionnaireReducer(state, {
    type: 'field-changed',
    field: 'hasRentalIncome',
    value: 'no',
  })
  expect(cleared?.draft).toMatchObject({
    rentalIncomeConfirmed: '',
    rentalGstConfirmed: '',
    amounts: {
      rentalAnnualValue: '',
      rentalMunicipalTaxes: '',
      rentalInterest: '',
    },
  })
})

test('migrates captured workspace 8 without writes or loss of consent amounts or completion records', () => {
  const storage = new TestStorage()
  const raw = JSON.stringify(workspaceV8)
  storage.setItem(WORKSPACE_KEY, raw)
  const loaded = loadSavedWorkspace(storage, now)
  expect(loaded.kind).toBe('ready')
  if (loaded.kind !== 'ready' || !loaded.workspace.active)
    throw Error('Historical workspace did not migrate')
  expect(loaded.workspace).toMatchObject({
    schemaVersion: 10,
    revision: workspaceV8.revision,
    consentDecidedAt: workspaceV8.consentDecidedAt,
    active: {
      completions: workspaceV8.active.completions,
      profile: {
        otherIncome: {
          rentalIncome: { kind: 'none' },
          taxableBankInterest:
            workspaceV8.active.profile.otherIncome.taxableBankInterest,
        },
      },
    },
  })
  expect(storage.getItem(WORKSPACE_KEY)).toBe(raw)
  const saved = saveSavedWorkspace(
    storage,
    loaded.workspace.revision,
    {
      noticeVersion: loaded.workspace.noticeVersion,
      consentDecidedAt: loaded.workspace.consentDecidedAt,
      activeTaxYear: loaded.workspace.activeTaxYear,
      priorYears: loaded.workspace.priorYears,
      active: { ...loaded.workspace.active, profile: profile() },
    },
    now,
  )
  expect(saved).toMatchObject({
    kind: 'saved',
    workspace: {
      schemaVersion: 10,
      active: {
        profile: { otherIncome: { rentalIncome: rent } },
        completions: workspaceV8.active.completions,
      },
    },
  })
  expect(loadSavedWorkspace(storage, now)).toMatchObject({
    kind: 'ready',
    workspace: { active: { profile: { otherIncome: { rentalIncome: rent } } } },
  })
})

test.each([
  'houseProperty',
  'deductionsLossesOrSpecialRate',
  'otherUnsupportedFacts',
  'unsupportedFactsNotSure',
])(
  'retains legacy %s exclusions without inferring rental eligibility',
  (fact) => {
    const storage = new TestStorage()
    storage.setItem(
      WORKSPACE_KEY,
      JSON.stringify({
        ...workspaceV8,
        active: {
          ...workspaceV8.active,
          profile: { ...workspaceV8.active.profile, unsupportedFacts: [fact] },
        },
      }),
    )
    const loaded = loadSavedWorkspace(storage, now)
    expect(loaded).toMatchObject({
      kind: 'ready',
      workspace: {
        active: {
          profile: {
            unsupportedFacts: [fact],
            otherIncome: { rentalIncome: { kind: 'not-sure' } },
          },
        },
      },
    })
    if (loaded.kind !== 'ready' || !loaded.workspace.active)
      throw Error('Expected retained historical Profile')
    expect(
      evaluate(loaded.workspace.active.profile, now, currentRules).kind,
    ).toBe('unsupported')
  },
)

test('requires a fresh rental answer from captured Recovery and rejects mixed schemas', () => {
  const recovered = parseRecoveryDraft(recoveryV7, TAX_YEAR)
  expect(recovered).toMatchObject({
    schemaVersion: 9,
    draft: {
      hasRentalIncome: '',
      rentalIncomeConfirmed: '',
      rentalGstConfirmed: '',
      amounts: {
        rentalAnnualValue: '',
        rentalMunicipalTaxes: '',
        rentalInterest: '',
        grossReceipts: recoveryV7.draft.amounts.grossReceipts,
      },
    },
  })
  if (!recovered) throw Error('Historical Recovery did not migrate')
  expect(completeDraft(recovered.draft, today).valid).toBe(false)
  expect(
    parseRecoveryDraft({ ...recovered, schemaVersion: 7 }, TAX_YEAR),
  ).toBeNull()
  const storage = new TestStorage()
  storage.setItem(
    WORKSPACE_KEY,
    JSON.stringify({
      ...workspaceV8,
      active: {
        ...workspaceV8.active,
        profile: {
          ...workspaceV8.active.profile,
          otherIncome: {
            ...workspaceV8.active.profile.otherIncome,
            rentalIncome: rent,
          },
        },
      },
    }),
  )
  expect(loadSavedWorkspace(storage, now).kind).toBe('invalid')
})
