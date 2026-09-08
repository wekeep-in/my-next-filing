import { expect, test } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Profile } from '../../src/evaluation'
import { evaluate, parseProfile, screenProfile } from '../../src/evaluation'
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
  RECOVERY_KEY,
  loadRecoveryDraft,
  parseRecoveryDraft,
  recoveryFromSession,
} from '../../src/recovery-draft'
import {
  WORKSPACE_KEY,
  loadSavedWorkspace,
  saveSavedWorkspace,
} from '../../src/workspace'
import { TestStorage } from '../helpers/storage'
import { TaxSummary } from '../../src/routes/plan/cards'
import workspaceV7 from '../fixtures/workspace-v7.json' with { type: 'json' }
import recoveryV6 from '../fixtures/recovery-v6.json' with { type: 'json' }

const today = '2026-09-08'
const now = new Date(`${today}T12:00:00+05:30`)
function portfolio(
  shortTermGains = 200_000,
  shortTermLosses = 50_000,
  longTermGains = 300_000,
  longTermLosses = 75_000,
  ordinary = 1_000_000,
): Profile {
  return {
    ...exampleProfile,
    incomePath: {
      ...exampleProfile.incomePath,
      grossReceipts: ordinary,
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
        shortTermLosses,
        longTermGains,
        longTermLosses,
      },
    },
  }
}
function supported(value: Profile, rules = currentRules) {
  const result = evaluate(value, now, rules)
  expect(result.kind).toBe('supported')
  if (result.kind !== 'supported')
    throw Error('Expected supported synthetic loss portfolio')
  return result
}

test.each([
  {
    name: 'positive net gains in both categories',
    input: [200_000, 50_000, 300_000, 75_000],
    net: [150_000, 225_000],
    applied: [50_000, 0, 75_000],
    unused: [0, 0],
    tax: 85_800,
  },
  {
    name: 'short-term loss crossing to long-term gains',
    input: [50_000, 200_000, 300_000, 100_000],
    net: [0, 50_000],
    applied: [50_000, 150_000, 100_000],
    unused: [0, 0],
    tax: 0,
  },
  {
    name: 'long-term loss cannot shelter short-term gains',
    input: [100_000, 0, 50_000, 200_000],
    net: [100_000, 0],
    applied: [0, 0, 50_000],
    unused: [0, 150_000],
    tax: 20_800,
  },
  {
    name: 'both loss categories remain unused',
    input: [10_000, 50_000, 20_000, 40_000],
    net: [0, 0],
    applied: [10_000, 0, 20_000],
    unused: [40_000, 20_000],
    tax: 0,
  },
  {
    name: 'long-term loss exhausts long-term gains first',
    input: [200_000, 50_000, 300_000, 400_000],
    net: [150_000, 0],
    applied: [50_000, 0, 300_000],
    unused: [0, 100_000],
    tax: 31_200,
  },
  {
    name: 'short-term losses also absorb long-term gains within the tax threshold',
    input: [0, 150_000, 200_000, 0],
    net: [0, 50_000],
    applied: [0, 150_000, 0],
    unused: [0, 0],
    tax: 0,
  },
  {
    name: 'pure losses without any profitable sale',
    input: [0, 75_000, 0, 50_000],
    net: [0, 0],
    applied: [0, 0, 0],
    unused: [75_000, 50_000],
    tax: 0,
  },
] as const)(
  'handles $name without offsetting ordinary income',
  ({ input, net, applied, unused, tax }) => {
    const result = supported(portfolio(...input))
    expect(result.tax.equityGains).toMatchObject({
      shortTermGains: input[0],
      shortTermLosses: input[1],
      longTermGains: input[2],
      longTermLosses: input[3],
      netShortTermGains: net[0],
      netLongTermGains: net[1],
      shortTermLossAgainstShortTerm: applied[0],
      shortTermLossAgainstLongTerm: applied[1],
      longTermLossAgainstLongTerm: applied[2],
      unusedShortTermLoss: unused[0],
      unusedLongTermLoss: unused[1],
    })
    expect(result.tax.ordinaryIncome).toBe(1_000_000)
    expect(result.tax.finalAmount).toBe(tax)
  },
)

test('uses the post-set-off categories for basic exemption and keeps unresolved mixed cases blocked', () => {
  const resolved = portfolio(50_000, 75_000, 300_000, 0, 300_000)
  const result = supported(resolved)
  expect(result.tax).toMatchObject({
    roundedTotalIncome: 575_000,
    finalAmount: 6_500,
    equityGains: {
      netShortTermGains: 0,
      netLongTermGains: 275_000,
      basicExemptionUsed: 100_000,
      longTermThresholdUsed: 125_000,
      taxableShortTermGains: 0,
      taxableLongTermGains: 50_000,
    },
  })
  expect(screenProfile(resolved, now, currentRules).facts).toEqual([])
  expect(
    assessQuestionnaire(
      { draft: draftFromProfile(resolved) },
      'other-income',
      today,
    ).progression.kind,
  ).toBe('next')
  const blocked = portfolio(50_000, 25_000, 300_000, 0, 300_000)
  const evaluation = evaluate(blocked, now, currentRules)
  expect(evaluation.kind).toBe('unsupported')
  if (evaluation.kind !== 'unsupported')
    throw Error('Expected mixed exemption review')
  expect(
    evaluation.facts.some(
      ({ code }) => code === 'equity-basic-exemption-allocation',
    ),
  ).toBe(true)
})

test('keeps NPS salary dividends and GST independent from capital losses', () => {
  const base = portfolio(10_000, 50_000, 20_000, 40_000, 200_000)
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
    },
  }
  const result = supported(value)
  expect(result.tax).toMatchObject({
    incomeBeforeNpsDeduction: 1_070_000,
    employerNpsDeduction: 70_000,
    roundedTotalIncome: 1_000_000,
    ordinaryIncome: 1_000_000,
  })
  expect(result.coverage.gst).toEqual(
    supported({
      ...value,
      otherIncome: { ...value.otherIncome, equityGains: { kind: 'none' } },
    }).coverage.gst,
  )
})

test('applies losses on the eligible-business path and counts actual credits once', () => {
  const base = portfolio(200_000, 50_000, 300_000, 75_000, 600_000)
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
    otherIncome: {
      ...base.otherIncome,
      tds: 30_000,
      tcs: 5_000,
      advanceTaxPaid: 20_000,
    },
  }
  const result = supported(value)
  expect(result.tax).toMatchObject({
    path: 'eligible-business',
    ordinaryIncome: 600_000,
    roundedTotalIncome: 975_000,
    rebate: 10_000,
    grossTax: 44_200,
    outcome: 'refund',
    finalAmount: 10_800,
  })
  expect(result.coverage.gst).toEqual(supported(base).coverage.gst)
})

test('rejects well-formed portfolios whose expanded instrument or loss conditions are not confirmed', () => {
  const base = portfolio()
  for (const confirmed of ['no', 'not-sure'] as const) {
    const value = {
      ...base,
      otherIncome: {
        ...base.otherIncome,
        equityGains: { ...base.otherIncome.equityGains, confirmed },
      },
    }
    const parsed = parseProfile(value)
    expect(parsed.valid).toBe(true)
    if (!parsed.valid) throw Error('Expected well-formed scope confirmation')
    const result = evaluate(parsed.profile, now, currentRules)
    expect(result.kind).toBe('unsupported')
    if (result.kind !== 'unsupported') throw Error('Expected separate review')
    expect(result.facts.some(({ code }) => code === 'equity-gains-scope')).toBe(
      true,
    )
  }
})

test('uses gains after loss adjustment for the income ceiling and rebate', () => {
  expect(
    supported(portfolio(6_000_000, 2_000_000, 0, 0)).tax.roundedTotalIncome,
  ).toBe(5_000_000)
  expect(
    evaluate(portfolio(6_000_010, 2_000_000, 0, 0), now, currentRules).kind,
  ).toBe('unsupported')
  const rebate = supported(portfolio(300_000, 100_000, 0, 0))
  expect(rebate.tax).toMatchObject({
    roundedTotalIncome: 1_200_000,
    rebate: 40_000,
    finalAmount: 41_600,
  })
})

test('keeps zero-loss amounts equivalent and applies whole-income rounding after set-off', () => {
  expect(supported(portfolio(100_000, 0, 200_000, 0)).tax.finalAmount).toBe(
    72_150,
  )
  expect(supported(portfolio(16, 1, 0, 0, 399_990)).tax).toMatchObject({
    roundedTotalIncome: 400_010,
    equityGains: {
      netShortTermGains: 15,
      shortTermLossAgainstShortTerm: 1,
      taxableShortTermGains: 10,
    },
  })
})

test('preserves carry-forward guidance and a conditional dated return action below all ordinary filing triggers', () => {
  const base = portfolio(10_000, 50_000, 20_000, 40_000, 100_000)
  const value: Profile = {
    ...base,
    otherIncome: {
      ...base.otherIncome,
      otherAnnualReturnTrigger: 'not-sure',
      ageSixtyOrOlder: 'not-sure',
    },
  }
  const result = supported(value)
  expect(result.tax.finalAmount).toBe(0)
  expect(result.tax.roundedTotalIncome).toBe(100_000)
  expect(result.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: {
      required: true,
      dueDate: '2027-08-31',
      formGuidance: 'unavailable',
      lossCarryForward: { maximumYears: 8 },
    },
  })
  const action = result.obligations.find(({ kind }) => kind === 'annual-return')
  expect(action).toMatchObject({
    id: `annual-return:${TAX_YEAR}`,
    title: 'File a return to claim capital-loss carry-forward',
    amountDue: null,
  })
  expect(action?.reasons[0]).toContain('To claim carry-forward')
  expect(action?.consequence).toContain('determination of the loss')
  expect(action?.ruleIds).toContain('capital-loss-carry-forward')
  expect(
    screenProfile(value, now, currentRules).coverage.some(({ code }) =>
      code.startsWith('annual-return'),
    ),
  ).toBe(false)
  expect(result.obligations.some(({ kind }) => kind === 'advance-tax')).toBe(
    false,
  )
})

test('retains the existing annual return when losses are fully used and no carry-forward remains', () => {
  const result = supported(portfolio(200_000, 50_000, 300_000, 75_000))
  expect(result.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { lossCarryForward: null },
  })
  expect(
    result.obligations.find(({ kind }) => kind === 'annual-return')?.title,
  ).toBe('File the annual income-tax return')
})

test('withholds only filing guidance when its carry-forward evidence is missing or stale', () => {
  const base = portfolio(0, 100_000, 0, 200_000, 100_000)
  const expected = supported(base).tax
  for (const mutation of ['stale', 'provenance', 'years'] as const) {
    const rules = structuredClone(currentRules)
    if (mutation === 'stale')
      Object.assign(rules.groups.annualReturn, { expiresOn: '2026-09-07' })
    if (mutation === 'provenance')
      Object.assign(rules.groups.annualReturn, {
        provenance: rules.groups.annualReturn.provenance.filter(
          ({ ruleId }) => ruleId !== 'capital-loss-carry-forward',
        ),
      })
    if (mutation === 'years')
      Object.assign(rules.groups.annualReturn.values, {
        capitalLossCarryForwardYears: 9,
      })
    const result = supported(base, rules)
    expect(result.tax).toEqual(expected)
    expect(result.coverage.annualReturn.kind).toBe('unavailable')
    expect(
      result.obligations.some(({ kind }) => kind === 'annual-return'),
    ).toBe(false)
  }
  const core = structuredClone(currentRules)
  Object.assign(core.groups.commonIncomeTax, {
    provenance: core.groups.commonIncomeTax.provenance.filter(
      ({ ruleId }) => ruleId !== 'equity-current-year-loss-set-off',
    ),
  })
  expect(evaluate(base, now, core).kind).toBe('stale-rules')
})

test('renders unused-loss guidance before the collapsed breakdown and withholds stale filing claims', () => {
  const value = portfolio(0, 40_000, 0, 20_000, 100_000)
  const result = supported(value)
  const markup = renderToStaticMarkup(
    createElement(TaxSummary, {
      tax: result.tax,
      annualReturn: result.coverage.annualReturn,
    }),
  )
  expect(markup.indexOf('Unused capital losses')).toBeLessThan(
    markup.indexOf('How this estimate was calculated'),
  )
  expect(markup).toContain('31 August 2027')
  expect(markup).toContain('8 tax years immediately following')
  const rules = structuredClone(currentRules)
  Object.assign(rules.groups.annualReturn, { expiresOn: '2026-09-07' })
  const stale = supported(value, rules)
  const staleMarkup = renderToStaticMarkup(
    createElement(TaxSummary, {
      tax: stale.tax,
      annualReturn: stale.coverage.annualReturn,
    }),
  )
  expect(staleMarkup).toContain('Unused capital losses')
  expect(staleMarkup).toContain('zero capital-gains tax does not establish')
  expect(staleMarkup).not.toContain('31 August 2027')
  expect(staleMarkup).not.toContain('8 tax years immediately following')
})

test.each([
  -1,
  1.25,
  '100',
  Number.NaN,
  Number.POSITIVE_INFINITY,
  Number.MAX_SAFE_INTEGER + 1,
])('rejects invalid loss amount %s', (loss) => {
  const value = portfolio()
  expect(
    parseProfile({
      ...value,
      otherIncome: {
        ...value.otherIncome,
        equityGains: {
          ...value.otherIncome.equityGains,
          shortTermLosses: loss,
        },
      },
    }).valid,
  ).toBe(false)
})

test('rejects unsafe loss sums missing fields unknown fields and inactive loss amounts', () => {
  expect(parseProfile(portfolio(0, Number.MAX_SAFE_INTEGER, 0, 1)).valid).toBe(
    false,
  )
  for (const changes of [
    { kind: 'none', shortTermLosses: 0 },
    { kind: 'domestic', confirmed: 'yes', shortTermGains: 1, longTermGains: 0 },
    {
      kind: 'domestic',
      confirmed: 'yes',
      shortTermGains: 1,
      longTermGains: 0,
      shortTermLosses: 0,
      longTermLosses: 0,
      broughtForwardLoss: 1,
    },
  ])
    expect(
      parseProfile({
        ...exampleProfile,
        otherIncome: { ...exampleProfile.otherIncome, equityGains: changes },
      }).valid,
    ).toBe(false)
})

test.each([
  'deductionsLossesOrSpecialRate',
  'capitalGains',
  'foreignAssets',
  'unrelatedForeignIncome',
  'otherUnsupportedFacts',
] as const)('keeps explicit unsupported fact %s blocked', (fact) => {
  expect(
    evaluate({ ...portfolio(), unsupportedFacts: [fact] }, now, currentRules)
      .kind,
  ).toBe('unsupported')
})

test('round-trips four buckets and clears all amounts on deselection', () => {
  const value = portfolio()
  const state = sessionFromProfile(value, { kind: 'personal' }, today)
  expect(completeDraft(state.draft, today)).toMatchObject({
    valid: true,
    profile: { otherIncome: { equityGains: value.otherIncome.equityGains } },
  })
  const recovery = recoveryFromSession(state, TAX_YEAR)
  expect(
    parseRecoveryDraft(recovery, TAX_YEAR)?.draft.amounts.shortTermLosses,
  ).toBe('50,000')
  const cleared = questionnaireReducer(state, {
    type: 'field-changed',
    field: 'hasEquityGains',
    value: 'no',
  })
  expect(cleared?.draft).toMatchObject({
    equityGainsConfirmed: '',
    amounts: {
      shortTermGains: '',
      longTermGains: '',
      shortTermLosses: '',
      longTermLosses: '',
    },
  })
})

test('migrates captured workspace without deleting gains consent revisions or completions', () => {
  const storage = new TestStorage()
  const raw = JSON.stringify(workspaceV7)
  storage.setItem(WORKSPACE_KEY, raw)
  const loaded = loadSavedWorkspace(storage, now)
  expect(loaded.kind).toBe('ready')
  if (loaded.kind !== 'ready')
    throw Error('Expected captured workspace to migrate')
  expect(loaded.workspace).toMatchObject({
    schemaVersion: 10,
    revision: workspaceV7.revision,
    consentDecidedAt: workspaceV7.consentDecidedAt,
    active: {
      completions: workspaceV7.active.completions,
      profile: {
        otherIncome: {
          equityGains: {
            kind: 'domestic',
            confirmed: 'yes',
            shortTermGains: 100_000,
            longTermGains: 200_000,
            shortTermLosses: 0,
            longTermLosses: 0,
          },
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
      active: loaded.workspace.active,
      priorYears: loaded.workspace.priorYears,
    },
    now,
  )
  expect(saved.kind).toBe('saved')
  const mixed = structuredClone(workspaceV7)
  Object.assign(mixed.active.profile.otherIncome.equityGains, {
    shortTermLosses: 0,
  })
  storage.setItem(WORKSPACE_KEY, JSON.stringify(mixed))
  expect(loadSavedWorkspace(storage, now).kind).toBe('invalid')
})

test('preserves legacy loss exclusions and requires the expanded Recovery answers', () => {
  const storage = new TestStorage()
  storage.setItem(
    WORKSPACE_KEY,
    JSON.stringify({
      ...workspaceV7,
      active: {
        ...workspaceV7.active,
        profile: {
          ...workspaceV7.active.profile,
          unsupportedFacts: ['deductionsLossesOrSpecialRate'],
        },
      },
    }),
  )
  const saved = loadSavedWorkspace(storage, now)
  expect(saved.kind).toBe('ready')
  if (saved.kind !== 'ready' || !saved.workspace.active)
    throw Error('Expected retained workspace')
  expect(saved.workspace.active.profile.otherIncome.equityGains).toMatchObject({
    confirmed: 'not-sure',
    shortTermGains: 100_000,
  })
  expect(evaluate(saved.workspace.active.profile, now, currentRules).kind).toBe(
    'unsupported',
  )
  const recovery = parseRecoveryDraft(recoveryV6, TAX_YEAR)
  expect(recovery).toMatchObject({
    schemaVersion: 9,
    draft: {
      hasEquityGains: 'yes',
      equityGainsConfirmed: '',
      amounts: {
        shortTermGains: '1,00,000',
        longTermGains: '2,00,000',
        shortTermLosses: '',
        longTermLosses: '',
      },
    },
  })
  if (!recovery) throw Error('Expected captured Recovery')
  expect(completeDraft(recovery.draft, today).valid).toBe(false)
  expect(
    parseRecoveryDraft({ ...recovery, schemaVersion: 6 }, TAX_YEAR),
  ).toBeNull()
  const tab = new TestStorage()
  tab.setItem(RECOVERY_KEY, JSON.stringify(recoveryV6))
  expect(loadRecoveryDraft(tab, TAX_YEAR).kind).toBe('ready')
})

test('migrates prior-year records and does not reuse a historical No to a gains-only Recovery question', () => {
  const storage = new TestStorage()
  const priorYears = ['Tax Year 2025-26', 'Tax Year 2024-25'].map(
    (taxYear, index) => ({
      ...workspaceV7.active,
      taxYear,
      state: index === 0 ? 'open' : 'archived',
      profile: { ...workspaceV7.active.profile, taxYear },
      completions: [],
      ...(index === 1 ? { archiveDate: '2026-09-01' } : {}),
    }),
  )
  storage.setItem(WORKSPACE_KEY, JSON.stringify({ ...workspaceV7, priorYears }))
  const result = loadSavedWorkspace(storage, now)
  expect(result.kind).toBe('ready')
  if (result.kind !== 'ready') throw Error('Expected historical prior years')
  expect(result.workspace.priorYears.map(({ state }) => state)).toEqual([
    'open',
    'archived',
  ])
  for (const record of result.workspace.priorYears)
    expect(record.profile.otherIncome.equityGains).toMatchObject({
      shortTermGains: 100_000,
      shortTermLosses: 0,
      longTermLosses: 0,
    })
  const noGains = {
    ...recoveryV6,
    draft: {
      ...recoveryV6.draft,
      hasEquityGains: 'no',
      equityGainsConfirmed: '',
      amounts: {
        ...recoveryV6.draft.amounts,
        shortTermGains: '',
        longTermGains: '',
      },
    },
  }
  expect(parseRecoveryDraft(noGains, TAX_YEAR)).toMatchObject({
    draft: {
      hasEquityGains: '',
      equityGainsConfirmed: '',
      amounts: { shortTermLosses: '', longTermLosses: '' },
    },
  })
})
