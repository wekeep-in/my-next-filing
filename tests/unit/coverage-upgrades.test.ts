import { expect, test } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ReviewAreas } from '../../src/routes/plan/agenda'
import { evaluate, parseProfile } from '../../src/evaluation'
import type {
  BroughtForwardLosses,
  PlatformFacts,
  Profile,
} from '../../src/evaluation'
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
import workspaceV10 from '../fixtures/workspace-v10.json' with { type: 'json' }
import recoveryV9 from '../fixtures/recovery-v9.json' with { type: 'json' }

const today = '2026-09-08'
const now = new Date(`${today}T12:00:00+05:30`)
const platform: PlatformFacts = {
  ownAccount: 'yes',
  recipientIdentifiable: 'yes',
  grossBeforeFees: 'yes',
  notEmploymentCommissionBrokerageRoyaltyLicensingAgency: 'yes',
  foreignFeeGstTreatment: 'known',
  reverseCharge: 'none',
  rcmLiabilityDate: null,
}
function withPlatform(changes: Partial<PlatformFacts>): Profile {
  return {
    ...exampleProfile,
    clients: {
      ...exampleProfile.clients,
      delivery: 'platform',
      platform: { ...platform, ...changes },
    },
  }
}
function supported(value: Profile, rules = currentRules) {
  expect(parseProfile(value).valid).toBe(true)
  const result = evaluate(value, now, rules)
  expect(result.kind).toBe('supported')
  if (result.kind !== 'supported')
    throw Error('Expected supported synthetic upgrade profile')
  return result
}
function losses(broughtForwardLosses: BroughtForwardLosses): Profile {
  return {
    ...exampleProfile,
    incomePath: {
      ...exampleProfile.incomePath,
      grossReceipts: 1_000_000,
      declaredProfit: 1_000_000,
    },
    otherIncome: {
      ...exampleProfile.otherIncome,
      taxableBankInterest: 0,
      tds: 0,
      tcs: 0,
      broughtForwardLosses,
      equityGains: {
        kind: 'domestic',
        confirmed: 'yes',
        shortTermGains: 200_000,
        shortTermLosses: 50_000,
        longTermGains: 300_000,
        longTermLosses: 75_000,
      },
    },
  }
}
const prior: BroughtForwardLosses = {
  kind: 'eligible',
  confirmed: 'yes',
  years: [
    { originYear: 2020, shortTerm: 100_000, longTerm: 250_000 },
    { originYear: 2018, shortTerm: 100_000, longTerm: 25_000 },
  ],
}

test.each([
  { reverseCharge: 'not-sure' },
  { foreignFeeGstTreatment: 'not-sure' },
] as const)(
  'keeps tax and withholds favorable GST conclusions for unresolved platform treatment %j',
  (changes) => {
    const value = withPlatform(changes)
    const result = supported(value)
    expect(result.tax).toEqual(supported(exampleProfile).tax)
    expect(result.coverage.gst).toMatchObject({
      kind: 'unavailable',
      code: 'platform-gst-review',
    })
    expect(
      result.obligations.some(({ kind }) => kind === 'gst-registration'),
    ).toBe(false)
    const assessment = assessQuestionnaire(
      { draft: draftFromProfile(value) },
      'clients',
      today,
    )
    expect(assessment.progression.kind).not.toBe('blocked')
    expect(
      assessment.coverage[
        'reverseCharge' in changes
          ? 'platformReverseCharge'
          : 'platformForeignFeeGstTreatment'
      ],
    ).toContain('GST')
  },
)

test('confirmed platform RCM requires registration below turnover and uses its own liability date', () => {
  const value = withPlatform({
    reverseCharge: 'due',
    rcmLiabilityDate: '2026-08-15',
  })
  const result = supported(value)
  expect(result.coverage.gst).toMatchObject({
    kind: 'available',
    value: { status: 'reverse-charge', registrationRequired: true },
  })
  expect(
    result.obligations.find(({ kind }) => kind === 'gst-registration'),
  ).toMatchObject({
    dueDate: '2026-09-14',
    ruleIds: [
      'platform-rcm-registration',
      'gst-registration-threshold',
      'gst-registration-window',
    ],
  })
  expect(result.tax).toEqual(supported(exampleProfile).tax)
  const unknownDate = supported(withPlatform({ reverseCharge: 'due' }))
  expect(unknownDate.coverage.gst.kind).toBe('available')
  expect(
    unknownDate.obligations.some(({ kind }) => kind === 'gst-registration'),
  ).toBe(false)
  expect(
    unknownDate.reviewActions.some(({ id }) => id === 'platform-rcm-date'),
  ).toBe(true)
  expect(
    parseProfile(
      withPlatform({ reverseCharge: 'none', rcmLiabilityDate: '2026-08-15' }),
    ).valid,
  ).toBe(false)
  expect(
    parseProfile(
      withPlatform({ reverseCharge: 'due', rcmLiabilityDate: '2026-03-31' }),
    ).valid,
  ).toBe(false)
})

test('registered return dates survive platform uncertainty and confirmed RCM adds cash-payment guidance', () => {
  for (const reverseCharge of ['due', 'not-sure'] as const) {
    const value: Profile = {
      ...withPlatform({ reverseCharge }),
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
    const result = supported(value)
    expect(
      result.obligations.filter(({ kind }) =>
        ['gst-gstr1', 'gst-gstr3b'].includes(kind),
      ),
    ).toHaveLength(24)
    expect(result.coverage.gst.kind).toBe(
      reverseCharge === 'due' ? 'available' : 'unavailable',
    )
    expect(
      result.reviewActions.some(
        ({ id }) =>
          id ===
          (reverseCharge === 'due'
            ? 'platform-rcm-payment'
            : 'platform-gst-review'),
      ),
    ).toBe(true)
  }
})

test('platform GST evidence fails independently while unresolved income remains a core blocker', () => {
  const rules = {
    ...currentRules,
    sources: currentRules.sources.filter(({ id }) => id !== 'gst-act-2017'),
  }
  expect(
    supported(withPlatform({ reverseCharge: 'due' }), rules).coverage.gst.kind,
  ).toBe('unavailable')
  for (const changes of [
    { grossBeforeFees: 'not-sure' },
    { notEmploymentCommissionBrokerageRoyaltyLicensingAgency: 'no' },
  ] as const) {
    const result = evaluate(withPlatform(changes), now, currentRules)
    expect(result.kind).toBe('unsupported')
    expect(result).not.toHaveProperty('tax')
  }
})

test('uses current losses then oldest eligible balances without renewing unused losses', () => {
  const value = losses(prior)
  const result = supported(value)
  expect(result.tax).toMatchObject({
    finalAmount: 0,
    ordinaryIncome: 1_000_000,
    equityGains: {
      netShortTermGains: 0,
      netLongTermGains: 0,
      unusedShortTermLoss: 0,
      unusedLongTermLoss: 0,
    },
  })
  expect(result.tax.broughtForwardLosses).toEqual([
    {
      originYear: 2018,
      shortTerm: 100_000,
      longTerm: 25_000,
      shortTermUsedAgainstShortTerm: 100_000,
      shortTermUsedAgainstLongTerm: 0,
      longTermUsed: 25_000,
      shortTermRemaining: 0,
      longTermRemaining: 0,
      lastUsableYear: 2026,
    },
    {
      originYear: 2020,
      shortTerm: 100_000,
      longTerm: 250_000,
      shortTermUsedAgainstShortTerm: 50_000,
      shortTermUsedAgainstLongTerm: 0,
      longTermUsed: 200_000,
      shortTermRemaining: 50_000,
      longTermRemaining: 50_000,
      lastUsableYear: 2028,
    },
  ])
  expect(result.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { lossCarryForward: null },
  })
  expect(value.otherIncome.broughtForwardLosses).toEqual(prior)
})

test('prior LT cannot offset ST and prior ST is used before the LT annual threshold', () => {
  for (const [
    shortTermGains,
    longTermGains,
    shortTerm,
    longTerm,
    finalAmount,
  ] of [
    [100_000, 0, 0, 200_000, 20_800],
    [0, 100_000, 100_000, 0, 0],
  ]) {
    const base = losses({
      kind: 'eligible',
      confirmed: 'yes',
      years: [{ originYear: 2025, shortTerm, longTerm }],
    })
    const result = supported({
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
    })
    expect(result.tax.finalAmount).toBe(finalAmount)
    expect(result.tax.broughtForwardLosses[0]?.longTermRemaining).toBe(longTerm)
    expect(result.tax.broughtForwardLosses[0]?.shortTermRemaining).toBe(0)
  }
})

test('prior balances without current gains remain visible without creating a fresh loss filing trigger', () => {
  const base = losses(prior)
  const value: Profile = {
    ...base,
    incomePath: { ...base.incomePath, grossReceipts: 0, declaredProfit: 0 },
    otherIncome: { ...base.otherIncome, equityGains: { kind: 'none' } },
  }
  const result = supported(value)
  expect(result.tax.broughtForwardLosses[0]?.shortTermRemaining).toBe(100_000)
  expect(result.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { required: false, lossCarryForward: null },
  })
})

test('rejects malformed loss ledgers and withholds unconfirmed or expired balances', () => {
  const row = { originYear: 2025, shortTerm: 100, longTerm: 0 }
  for (const years of [
    [],
    [row, row],
    [{ ...row, originYear: 2026 }],
    [{ ...row, shortTerm: -1 }],
    [{ ...row, longTerm: 1.5 }],
    [{ ...row, shortTerm: Number.MAX_SAFE_INTEGER, longTerm: 1 }],
    [{ ...row, extra: 1 }],
    Array.from({ length: 9 }, (_, i) => ({ ...row, originYear: 2025 - i })),
  ]) {
    const base = losses(prior)
    expect(
      parseProfile({
        ...base,
        otherIncome: {
          ...base.otherIncome,
          broughtForwardLosses: { kind: 'eligible', confirmed: 'yes', years },
        },
      }).valid,
    ).toBe(false)
  }
  for (const branch of [
    { kind: 'not-sure' },
    { kind: 'eligible', confirmed: 'no', years: [row] },
    {
      kind: 'eligible',
      confirmed: 'yes',
      years: [{ ...row, originYear: 2017 }],
    },
  ] as const) {
    expect(evaluate(losses(branch), now, currentRules).kind).toBe('unsupported')
  }
  expect(
    supported(
      losses({
        kind: 'eligible',
        confirmed: 'yes',
        years: [{ ...row, originYear: 2018 }],
      }),
    ).tax.broughtForwardLosses[0]?.lastUsableYear,
  ).toBe(2026)
})

test('loss answers roundtrip and deselection clears confirmation and rows', () => {
  const state = sessionFromProfile(losses(prior), { kind: 'personal' }, today)
  expect(completeDraft(state.draft, today)).toMatchObject({
    valid: true,
    profile: { otherIncome: { broughtForwardLosses: prior } },
  })
  expect(
    parseRecoveryDraft(recoveryFromSession(state, TAX_YEAR), TAX_YEAR)?.draft,
  ).toEqual(state.draft)
  const cleared = questionnaireReducer(state, {
    type: 'field-changed',
    field: 'hasBroughtForwardLosses',
    value: 'no',
  })
  expect(cleared?.draft).toMatchObject({
    hasBroughtForwardLosses: 'no',
    broughtForwardLossesConfirmed: '',
    broughtForwardYears: [],
  })
  const missing = {
    ...state.draft,
    broughtForwardYears: [{ originYear: '2025', shortTerm: '', longTerm: '0' }],
  }
  expect(
    assessQuestionnaire({ draft: missing }, 'other-income', today).progression
      .kind,
  ).toBe('blocked')
})

test('captured workspace and Recovery migrate conservatively without writing on read', () => {
  const storage = new TestStorage()
  const raw = JSON.stringify(workspaceV10)
  storage.setItem(WORKSPACE_KEY, raw)
  const loaded = loadSavedWorkspace(storage, now)
  expect(loaded.kind).toBe('ready')
  if (loaded.kind !== 'ready') throw Error('Expected migrated workspace')
  expect(loaded.workspace).toMatchObject({
    schemaVersion: 11,
    revision: workspaceV10.revision,
    active: {
      completions: workspaceV10.active.completions,
      profile: { otherIncome: { broughtForwardLosses: { kind: 'none' } } },
    },
  })
  expect(storage.getItem(WORKSPACE_KEY)).toBe(raw)
  expect(storage.writes).toBe(1)
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
  expect(JSON.parse(storage.getItem(WORKSPACE_KEY)!) as unknown).toMatchObject({
    schemaVersion: 11,
  })
  const recovered = parseRecoveryDraft(recoveryV9, TAX_YEAR)
  expect(recovered).toMatchObject({
    schemaVersion: 10,
    draft: {
      hasBroughtForwardLosses: '',
      broughtForwardLossesConfirmed: '',
      broughtForwardYears: [],
    },
  })
  expect(
    parseRecoveryDraft(
      {
        ...recoveryV9,
        draft: { ...recoveryV9.draft, hasBroughtForwardLosses: 'no' },
      },
      TAX_YEAR,
    ),
  ).toBeNull()
  const {
    reverseCharge: _status,
    rcmLiabilityDate: _date,
    ...oldPlatform
  } = platform
  for (const noRecipientReverseCharge of ['yes', 'no', 'not-sure']) {
    const old = {
      ...workspaceV10,
      active: {
        ...workspaceV10.active,
        profile: {
          ...workspaceV10.active.profile,
          clients: {
            ...workspaceV10.active.profile.clients,
            delivery: 'platform',
            platform: { ...oldPlatform, noRecipientReverseCharge },
          },
          unsupportedFacts: ['deductionsLossesOrSpecialRate'],
        },
      },
    }
    storage.setItem(WORKSPACE_KEY, JSON.stringify(old))
    const migrated = loadSavedWorkspace(storage, now)
    expect(migrated.kind).toBe('ready')
    if (migrated.kind !== 'ready') throw Error('Expected migrated platform')
    expect(
      migrated.workspace.active?.profile.clients.platform?.reverseCharge,
    ).toBe(noRecipientReverseCharge === 'yes' ? 'none' : 'not-sure')
    expect(
      migrated.workspace.active?.profile.otherIncome.broughtForwardLosses.kind,
    ).toBe('not-sure')
    expect(migrated.workspace.active?.profile.unsupportedFacts).toEqual([
      'deductionsLossesOrSpecialRate',
    ])
  }
})

test('registration uses the earlier of turnover and RCM dates and withholds dates for unresolved competing triggers', () => {
  const base = withPlatform({
    reverseCharge: 'due',
    rcmLiabilityDate: '2026-08-15',
  })
  if (base.gst.kind !== 'unregistered')
    throw Error('Expected unregistered fixture')
  const value: Profile = {
    ...base,
    gst: {
      ...base.gst,
      aggregateTurnover: 3_000_000,
      thresholdLiabilityDate: '2026-07-01',
    },
  }
  expect(
    supported(value).obligations.find(({ kind }) => kind === 'gst-registration')
      ?.dueDate,
  ).toBe('2026-07-31')
  for (const gst of [
    { ...value.gst, thresholdLiabilityDate: null },
    { ...value.gst, compulsoryRegistration: 'not-sure' },
  ] as const) {
    const result = supported({ ...value, gst })
    expect(result.coverage.gst).toMatchObject({
      kind: 'available',
      value: { registrationRequired: true },
    })
    expect(
      result.obligations.some(({ kind }) => kind === 'gst-registration'),
    ).toBe(false)
  }
})

test('an incomplete calendar keeps the confirmed reverse-charge payment instruction visible', () => {
  const value: Profile = {
    ...withPlatform({ reverseCharge: 'due' }),
    gst: {
      kind: 'registered',
      status: 'one-normal',
      state: 'Maharashtra',
      calendar: {
        registeredFrom: '2026-04-01',
        continuous: 'yes',
        cadences: ['monthly', 'not-sure', 'monthly', 'monthly'],
        exportRoute: 'none',
        lutConfirmed: null,
        firstExportDate: null,
      },
    },
  }
  const evaluation = supported(value)
  expect(evaluation.coverage.gst.kind).toBe('unavailable')
  const markup = renderToStaticMarkup(
    createElement(ReviewAreas, { evaluation, onReview: () => undefined }),
  )
  expect(markup).toContain('Account for reverse-charge GST on platform fees')
  expect(markup).toContain('cash ledger')
  expect(
    evaluation.obligations.filter(({ kind }) =>
      ['gst-gstr1', 'gst-gstr3b'].includes(kind),
    ),
  ).toHaveLength(18)
  const rules = {
    ...currentRules,
    sources: currentRules.sources.filter(
      ({ id }) => id !== 'equity-computation-reference',
    ),
  }
  expect(evaluate(losses(prior), now, rules).kind).toBe('stale-rules')
})
