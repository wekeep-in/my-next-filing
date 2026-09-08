import { expect, test } from 'vitest'
import { evaluate, parseProfile, screenProfile } from '../../src/evaluation'
import type { AdditionalIncomeAmounts, Profile } from '../../src/evaluation'
import { TAX_YEAR, currentRules } from '../../src/rules'
import {
  additionalIncomeKeys,
  assessQuestionnaire,
  completeDraft,
  draftFromProfile,
  exampleProfile,
} from '../../src/routes/check/model'
import {
  questionnaireReducer,
  sessionFromProfile,
} from '../../src/routes/check/session'
import { parseRecoveryDraft } from '../../src/recovery-draft'
import {
  WORKSPACE_KEY,
  loadSavedWorkspace,
  saveSavedWorkspace,
} from '../../src/workspace'
import { TestStorage } from '../helpers/storage'
import recoveryV3 from '../fixtures/recovery-v3.json' with { type: 'json' }
import workspaceV4 from '../fixtures/workspace-v4.json' with { type: 'json' }

const now = new Date('2026-09-08T12:00:00+05:30')
const today = '2026-09-08'
const zero: AdditionalIncomeAmounts = {
  dividends: 0,
  mutualFundDistributions: 0,
  postOfficeInterest: 0,
  incomeTaxRefundInterest: 0,
}
const withIncome = (
  amounts: Partial<AdditionalIncomeAmounts> = {},
): Profile => ({
  ...exampleProfile,
  otherIncome: {
    ...exampleProfile.otherIncome,
    additionalIncome: {
      kind: 'domestic',
      confirmed: 'yes',
      ...zero,
      ...amounts,
    },
  },
})
function supported(profile: Profile, rules = currentRules) {
  const result = evaluate(profile, now, rules)
  expect(result.kind).toBe('supported')
  if (result.kind !== 'supported')
    throw Error('Expected supported synthetic profile')
  return result
}

test.each(additionalIncomeKeys)(
  'includes %s once without changing practice income or GST',
  (field) => {
    const result = supported(withIncome({ [field]: 10_000 }))
    expect(result.tax.roundedTotalIncome).toBe(1_420_000)
    expect(result.tax.finalAmount).toBe(56_720)
    expect(result.tax.presumptive.usedIncome).toBe(1_400_000)
    expect(result.coverage.gst).toEqual(supported(exampleProfile).coverage.gst)
  },
)

test('combines all four records and counts actual TDS once', () => {
  const profile = withIncome({
    dividends: 30_000,
    mutualFundDistributions: 20_000,
    postOfficeInterest: 15_000,
    incomeTaxRefundInterest: 5_000,
  })
  const result = supported(profile)
  expect(result.tax.roundedTotalIncome).toBe(1_480_000)
  expect(result.tax.grossTax).toBe(106_080)
  expect(result.tax.finalAmount).toBe(66_080)
  const credited = supported({
    ...profile,
    otherIncome: { ...profile.otherIncome, tds: 110_000 },
  })
  expect(credited.tax.roundedTotalIncome).toBe(1_480_000)
  expect(credited.tax.outcome).toBe('refund')
  expect(credited.tax.finalAmount).toBe(3_920)
  expect(
    result.obligations.find(({ kind }) => kind === 'advance-tax')?.dueDate,
  ).toBe('2027-03-15')
})

test.each([
  [990_000, 1_200_000, 0],
  [990_010, 1_200_010, 10],
])(
  'applies rebate and marginal relief to additional income %i',
  (dividends, total, balance) => {
    const profile = withIncome({ dividends })
    const result = supported({
      ...profile,
      incomePath: {
        ...profile.incomePath,
        grossReceipts: 400_000,
        declaredProfit: 200_000,
      },
      otherIncome: { ...profile.otherIncome, tds: 0 },
    })
    expect(result.tax.roundedTotalIncome).toBe(total)
    expect(result.tax.finalAmount).toBe(balance)
  },
)

test('enforces the combined income ceiling and safe additional-income sum', () => {
  expect(
    evaluate(withIncome({ dividends: 3_590_000 }), now, currentRules).kind,
  ).toBe('supported')
  expect(
    evaluate(withIncome({ dividends: 3_590_010 }), now, currentRules).kind,
  ).toBe('unsupported')
  expect(
    parseProfile(
      withIncome({
        dividends: Number.MAX_SAFE_INTEGER,
        mutualFundDistributions: 1,
      }),
    ).valid,
  ).toBe(false)
})

test.each([
  undefined,
  { kind: 'none', dividends: 10 },
  { kind: 'domestic', confirmed: 'yes', ...zero, dividends: -1 },
  { kind: 'domestic', confirmed: 'yes', ...zero, postOfficeInterest: 1.5 },
])('rejects malformed additional income %#', (additionalIncome) => {
  expect(
    parseProfile({
      ...exampleProfile,
      otherIncome: { ...exampleProfile.otherIncome, additionalIncome },
    }).valid,
  ).toBe(false)
})

test.each([
  { kind: 'not-sure' },
  { kind: 'domestic', confirmed: 'no', ...zero },
  { kind: 'domestic', confirmed: 'not-sure', ...zero },
] as const)(
  'withholds an estimate for unconfirmed additional income %#',
  (additionalIncome) => {
    expect(
      evaluate(
        {
          ...exampleProfile,
          otherIncome: { ...exampleProfile.otherIncome, additionalIncome },
        },
        now,
        currentRules,
      ).kind,
    ).toBe('unsupported')
  },
)

test.each(['gifts', 'unsupportedDividends', 'dividendsOrGifts'] as const)(
  'keeps %s outside this slice',
  (fact) => {
    expect(
      evaluate({ ...withIncome(), unsupportedFacts: [fact] }, now, currentRules)
        .kind,
    ).toBe('unsupported')
  },
)

test('requires sourced ordinary-income treatment', () => {
  const rules = {
    ...currentRules,
    sources: currentRules.sources.filter(
      ({ id }) => id !== 'domestic-investment-income-2026',
    ),
  }
  expect(evaluate(withIncome({ dividends: 1000 }), now, rules).kind).toBe(
    'stale-rules',
  )
})

test('round-trips the form and clears deselected amounts', () => {
  const profile = withIncome({ mutualFundDistributions: 12_345 })
  const session = sessionFromProfile(profile, { kind: 'personal' }, today)
  expect(completeDraft(session.draft, today)).toMatchObject({
    valid: true,
    profile,
  })
  const cleared = questionnaireReducer(session, {
    type: 'field-changed',
    field: 'hasAdditionalIncome',
    value: 'no',
  })
  expect(cleared?.draft.additionalIncomeConfirmed).toBe('')
  expect(
    additionalIncomeKeys.map((key) => cleared?.draft.amounts[key]),
  ).toEqual(['', '', '', ''])
  const incomplete = {
    ...session.draft,
    amounts: { ...session.draft.amounts, postOfficeInterest: '' },
  }
  expect(
    assessQuestionnaire({ draft: incomplete }, 'other-income', today)
      .progression.kind,
  ).toBe('blocked')
})

// Captured from 4c5b4d1 before this schema changed; do not regenerate from today's Profile.
test('migrates the published workspace without deleting amounts or completion dates', () => {
  const storage = new TestStorage()
  const raw = JSON.stringify(workspaceV4)
  storage.setItem(WORKSPACE_KEY, raw)
  const loaded = loadSavedWorkspace(storage, now)
  expect(loaded.kind).toBe('ready')
  if (loaded.kind !== 'ready' || !loaded.workspace.active)
    throw Error('Fixture did not migrate')
  expect(loaded.workspace.schemaVersion).toBe(10)
  expect(loaded.workspace.active.profile.otherIncome.additionalIncome).toEqual({
    kind: 'none',
  })
  expect(loaded.workspace.active.completions).toEqual(
    workspaceV4.active.completions,
  )
  expect(loaded.workspace.active.profile.otherIncome.taxableBankInterest).toBe(
    10_000,
  )
  expect(storage.getItem(WORKSPACE_KEY)).toBe(raw)
  const rewritten = saveSavedWorkspace(
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
  expect(rewritten.kind).toBe('saved')
})

test('restores historical Recovery answers but requires the new income answer', () => {
  const recovery = parseRecoveryDraft(recoveryV3, TAX_YEAR)
  expect(recovery).not.toBeNull()
  if (!recovery) throw Error('Fixture did not migrate')
  expect(recovery.schemaVersion).toBe(9)
  expect(recovery.draft.hasAdditionalIncome).toBe('')
  expect(recovery.draft.amounts.grossReceipts).toBe(
    recoveryV3.draft.amounts.grossReceipts,
  )
  expect(completeDraft(recovery.draft, today).valid).toBe(false)
  expect(
    parseRecoveryDraft({ ...recovery, schemaVersion: 3 }, TAX_YEAR),
  ).toBeNull()
})

const lowIncome: Profile = {
  ...exampleProfile,
  incomePath: {
    ...exampleProfile.incomePath,
    grossReceipts: 100_000,
    declaredProfit: 50_000,
  },
  otherIncome: {
    ...exampleProfile.otherIncome,
    taxableBankInterest: 0,
    tds: 0,
    otherAnnualReturnTrigger: 'not-sure',
    ageSixtyOrOlder: 'not-sure',
  },
}
test.each([
  {
    label: 'income',
    profile: {
      ...exampleProfile,
      otherIncome: {
        ...exampleProfile.otherIncome,
        otherAnnualReturnTrigger: 'not-sure',
        ageSixtyOrOlder: 'not-sure',
      },
    },
  },
  {
    label: 'higher credit threshold',
    profile: {
      ...lowIncome,
      otherIncome: { ...lowIncome.otherIncome, tds: 50_000 },
    },
  },
  {
    label: 'confirmed other trigger',
    profile: {
      ...lowIncome,
      otherIncome: {
        ...lowIncome.otherIncome,
        otherAnnualReturnTrigger: 'yes',
      },
    },
  },
] as const)(
  'retains filing established by $label when another trigger is uncertain',
  ({ profile }) => {
    const result = supported(profile)
    expect(result.coverage.annualReturn).toMatchObject({
      kind: 'available',
      value: { required: true },
    })
    expect(
      result.obligations.find(({ kind }) => kind === 'annual-return')?.dueDate,
    ).toBe('2027-08-31')
    expect(
      result.reviewActions.some(({ area }) => area === 'annual-return'),
    ).toBe(false)
    expect(
      screenProfile(profile, now, currentRules).coverage.some(({ code }) =>
        code.startsWith('annual-return'),
      ),
    ).toBe(false)
  },
)

test.each([25_000, 49_999])(
  'does not cite the lower credit threshold for unknown age at %i',
  (tds) => {
    const result = supported({
      ...lowIncome,
      otherIncome: {
        ...lowIncome.otherIncome,
        tds,
        otherAnnualReturnTrigger: 'no',
      },
    })
    expect(result.coverage.annualReturn.kind).toBe('unavailable')
    expect(
      result.obligations.some(({ kind }) => kind === 'annual-return'),
    ).toBe(false)
    const knownIncome = supported({
      ...exampleProfile,
      otherIncome: {
        ...exampleProfile.otherIncome,
        tds,
        ageSixtyOrOlder: 'not-sure',
      },
    })
    expect(knownIncome.coverage.annualReturn).toMatchObject({
      kind: 'available',
    })
    if (knownIncome.coverage.annualReturn.kind === 'available')
      expect(
        knownIncome.coverage.annualReturn.value.triggers.some((reason) =>
          reason.includes('TDS'),
        ),
      ).toBe(false)
  },
)

test('retains the receipt trigger on the eligible-business path', () => {
  const profile: Profile = {
    ...lowIncome,
    incomePath: {
      kind: 'eligible-business',
      confirmed: 'yes',
      grossReceipts: 6_100_000,
      qualifyingReceipts: 6_100_000,
      otherReceipts: 0,
      cashReceipts: 0,
      declaredProfit: 366_000,
      notSpecifiedProfession: 'yes',
      notGoodsCarriage: 'yes',
      notAgencyCommissionBrokerage: 'yes',
      noChapterViiiCDeduction: 'yes',
      fiveYearExclusion: 'none',
    },
  }
  expect(supported(profile).coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { required: true },
  })
})

test('keeps negative and stale annual-return conclusions conservative', () => {
  expect(
    supported({
      ...lowIncome,
      otherIncome: { ...lowIncome.otherIncome, otherAnnualReturnTrigger: 'no' },
    }).coverage.annualReturn,
  ).toMatchObject({ kind: 'available', value: { required: false } })
  const rules = structuredClone(currentRules)
  Object.assign(rules.groups.annualReturn, { expiresOn: '2026-09-05' })
  expect(supported(exampleProfile, rules).coverage.annualReturn.kind).toBe(
    'unavailable',
  )
})

test('retains an exceeded GST threshold with date review and no invented deadline', () => {
  const profile: Profile = {
    ...exampleProfile,
    gst: {
      kind: 'unregistered',
      state: 'Maharashtra',
      aggregateTurnover: 2_000_001,
      turnoverComplete: 'yes',
      compulsoryRegistration: 'no',
      thresholdLiabilityDate: null,
    },
  }
  const result = supported(profile)
  expect(result.coverage.gst).toMatchObject({
    kind: 'available',
    value: { status: 'above', registrationRequired: true },
  })
  expect(
    result.reviewActions.some(({ id }) => id === 'gst-liability-date'),
  ).toBe(true)
  expect(
    result.obligations.some(({ kind }) => kind === 'gst-registration'),
  ).toBe(false)
  expect(
    assessQuestionnaire({ draft: draftFromProfile(profile) }, 'gst', today)
      .coverage.thresholdLiabilityDate,
  ).toContain('exceeds')
  if (profile.gst.kind !== 'unregistered')
    throw Error('Expected synthetic unregistered profile')
  expect(
    supported({
      ...profile,
      gst: { ...profile.gst, thresholdLiabilityDate: '2026-09-01' },
    }).obligations.find(({ kind }) => kind === 'gst-registration')?.dueDate,
  ).toBe('2026-10-01')
  expect(
    supported({
      ...profile,
      gst: { ...profile.gst, thresholdLiabilityDate: '2026-09-09' },
    }).coverage.gst.kind,
  ).toBe('unavailable')
  expect(
    supported({
      ...profile,
      gst: { ...profile.gst, compulsoryRegistration: 'not-sure' },
    }).coverage.gst.kind,
  ).toBe('unavailable')
})
