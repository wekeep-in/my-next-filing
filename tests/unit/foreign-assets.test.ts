import { expect, test } from 'vitest'
import { evaluate, parseProfile, screenProfile } from '../../src/evaluation'
import type { ForeignAssets, Profile } from '../../src/evaluation'
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
import workspaceV9 from '../fixtures/workspace-v9.json' with { type: 'json' }
import recoveryV8 from '../fixtures/recovery-v8.json' with { type: 'json' }

const today = '2026-09-08'
const now = new Date(`${today}T12:00:00+05:30`)
function profile(
  foreignAssets: ForeignAssets = { kind: 'held', incomeConfirmed: 'yes' },
): Profile {
  return {
    ...exampleProfile,
    otherIncome: { ...exampleProfile.otherIncome, foreignAssets },
  }
}
function lowIncome(foreignAssets: ForeignAssets): Profile {
  return {
    ...profile(foreignAssets),
    incomePath: {
      ...exampleProfile.incomePath,
      grossReceipts: 0,
      declaredProfit: 0,
    },
    otherIncome: {
      ...profile(foreignAssets).otherIncome,
      taxableBankInterest: 0,
      tds: 0,
      tcs: 0,
    },
  }
}
function foreignClient(
  foreignAssets: ForeignAssets = { kind: 'held', incomeConfirmed: 'yes' },
): Profile {
  return {
    ...profile(foreignAssets),
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
        accountExposure: 'possible',
        foreignOperation: 'no',
        foreignTax: 'no',
        treatyRelief: 'no',
        receiptsResolved: 'yes',
        currencyResolved: 'yes',
      },
    },
  }
}
function supported(input: Profile, rules = currentRules) {
  expect(parseProfile(input).valid).toBe(true)
  const result = evaluate(input, now, rules)
  expect(result.kind).toBe('supported')
  if (result.kind !== 'supported')
    throw Error('Expected supported synthetic foreign-asset profile')
  return result
}

test('established assets preserve the tax estimate and add visible disclosure guidance', () => {
  const result = supported(profile())
  expect(result.tax).toEqual(supported(exampleProfile).tax)
  expect(result.tax.finalAmount).toBe(55_160)
  expect(result.coverage.gst).toEqual(supported(exampleProfile).coverage.gst)
  expect(result.coverage.foreignGuidance).toMatchObject({
    kind: 'available',
    value: { status: 'assets-disclosure' },
  })
  if (result.coverage.foreignGuidance.kind === 'available') {
    expect(result.coverage.foreignGuidance.value.message).toContain('ITR-4')
    expect(result.coverage.foreignGuidance.value.message).not.toContain(
      'October 2026',
    )
  }
})

test('foreign assets require a return at nil income and nil tax without a balance threshold', () => {
  const result = supported(lowIncome({ kind: 'held', incomeConfirmed: 'yes' }))
  expect(result.tax.roundedTotalIncome).toBe(0)
  expect(result.tax.finalAmount).toBe(0)
  expect(result.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { required: true, formGuidance: 'unavailable' },
  })
  expect(result.obligations).toHaveLength(1)
  expect(result.obligations[0]).toMatchObject({
    kind: 'annual-return',
    id: `annual-return:${TAX_YEAR}`,
    dueDate: '2027-08-31',
    amountDue: null,
  })
  expect(result.obligations[0].ruleIds).toContain(
    'foreign-asset-return-trigger',
  )
  expect(result.obligations[0].statutorySourceIds).toContain(
    'foreign-assets-act-2026',
  )
})

test('uncertain asset classification preserves tax and established filing but cannot establish no filing', () => {
  const assets = { kind: 'possible', incomeConfirmed: 'yes' } as const
  const high = supported(profile(assets))
  expect(high.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { required: true },
  })
  expect(high.coverage.foreignGuidance.kind).toBe('unavailable')
  const low = supported(lowIncome(assets))
  expect(low.coverage.annualReturn).toMatchObject({
    kind: 'unavailable',
    code: 'annual-return-foreign-assets-uncertain',
  })
  expect(low.obligations.some(({ kind }) => kind === 'annual-return')).toBe(
    false,
  )
  expect(
    screenProfile(lowIncome(assets), now, currentRules).coverage.some(
      ({ code }) => code === 'annual-return-foreign-assets-uncertain',
    ),
  ).toBe(true)
  expect(
    supported(lowIncome({ kind: 'none' })).coverage.annualReturn,
  ).toMatchObject({ kind: 'available', value: { required: false } })
})

test.each(['no', 'not-sure'] as const)(
  'unconfirmed income effects stop calculation for %s',
  (incomeConfirmed) => {
    for (const kind of ['held', 'possible'] as const) {
      const result = evaluate(
        profile({ kind, incomeConfirmed }),
        now,
        currentRules,
      )
      expect(result.kind).toBe('unsupported')
      expect(result).not.toHaveProperty('tax')
    }
  },
)

test('known holdings resolve possible platform exposure without classifying a provider or changing receipts', () => {
  const known = supported(foreignClient())
  expect(known.coverage.foreignGuidance.kind).toBe('available')
  if (known.coverage.foreignGuidance.kind === 'available') {
    expect(known.coverage.foreignGuidance.value.message).toContain('ITR-4')
    expect(known.coverage.foreignGuidance.value.message).toContain(
      '1 October 2026',
    )
  }
  const unresolved = supported(foreignClient({ kind: 'none' }))
  expect(unresolved.tax).toEqual(known.tax)
  expect(unresolved.coverage.foreignGuidance.kind).toBe('unavailable')
})

test.each([
  'foreignTax',
  'treatyRelief',
  'foreignOperation',
  'currencyResolved',
  'receiptsResolved',
  'settledToIndianBank',
] as const)('the asset branch cannot bypass %s', (field) => {
  const base = foreignClient()
  if (!base.clients.foreign) throw Error('Expected synthetic foreign clients')
  const result = evaluate(
    {
      ...base,
      clients: {
        ...base.clients,
        foreign: {
          ...base.clients.foreign,
          [field]: [
            'currencyResolved',
            'receiptsResolved',
            'settledToIndianBank',
          ].includes(field)
            ? 'no'
            : 'yes',
        },
      },
    },
    now,
    currentRules,
  )
  expect(result.kind).toBe('unsupported')
})

test('stale disclosure guidance preserves filing and tax while a profile with no foreign facts needs no guidance', () => {
  const rules = structuredClone(currentRules)
  Object.assign(rules.groups.foreignGuidance, { expiresOn: '2026-09-07' })
  const result = supported(
    lowIncome({ kind: 'held', incomeConfirmed: 'yes' }),
    rules,
  )
  expect(result.coverage.foreignGuidance.kind).toBe('unavailable')
  expect(result.coverage.annualReturn).toMatchObject({
    kind: 'available',
    value: { required: true },
  })
  expect(
    supported(exampleProfile, rules).coverage.foreignGuidance,
  ).toMatchObject({
    kind: 'available',
    value: { status: 'no-foreign-receipts' },
  })
})

test('stale annual-return authority withholds the filing conclusion without removing independent asset guidance', () => {
  const rules = structuredClone(currentRules)
  Object.assign(rules.groups.annualReturn, { expiresOn: '2026-09-07' })
  const result = supported(
    lowIncome({ kind: 'held', incomeConfirmed: 'yes' }),
    rules,
  )
  expect(result.coverage.annualReturn.kind).toBe('unavailable')
  expect(result.obligations.some(({ kind }) => kind === 'annual-return')).toBe(
    false,
  )
  expect(result.coverage.foreignGuidance.kind).toBe('available')
})

test('missing statutory scope stops core evaluation while missing return-form guidance withholds only that area', () => {
  const core = {
    ...currentRules,
    sources: currentRules.sources.filter(
      ({ id }) => id !== 'foreign-assets-act-2026',
    ),
  }
  expect(evaluate(profile(), now, core).kind).toBe('stale-rules')
  const guidance = {
    ...currentRules,
    sources: currentRules.sources.filter(
      ({ id }) => id !== 'foreign-assets-returns-2026',
    ),
  }
  const result = supported(profile(), guidance)
  expect(result.coverage.foreignGuidance.kind).toBe('unavailable')
  expect(result.coverage.annualReturn.kind).toBe('available')
})

test.each([
  undefined,
  { kind: 'held' },
  { kind: 'none', incomeConfirmed: 'yes' },
  { kind: 'held', incomeConfirmed: 'yes', balance: 100 },
  { kind: 'other', incomeConfirmed: 'yes' },
])('rejects malformed asset branches', (foreignAssets) => {
  expect(
    parseProfile({
      ...profile(),
      otherIncome: { ...profile().otherIncome, foreignAssets },
    }).valid,
  ).toBe(false)
})

test('asset answers survive domestic-client normalization, Recovery, and clear when deselected', () => {
  const state = sessionFromProfile(profile(), { kind: 'personal' }, today)
  expect(completeDraft(state.draft, today)).toMatchObject({
    valid: true,
    profile: profile(),
  })
  expect(
    parseRecoveryDraft(recoveryFromSession(state, TAX_YEAR), TAX_YEAR)?.draft,
  ).toMatchObject({ hasForeignAssets: 'yes', assetIncomeConfirmed: 'yes' })
  const uncertain = draftFromProfile(
    profile({ kind: 'possible', incomeConfirmed: 'yes' }),
  )
  const assessment = assessQuestionnaire(
    { draft: uncertain },
    'other-income',
    today,
  )
  expect(assessment.progression.kind).not.toBe('blocked')
  expect(assessment.coverage.hasForeignAssets).toContain('classification')
  expect(
    completeDraft({ ...uncertain, assetIncomeConfirmed: '' }, today).valid,
  ).toBe(false)
  const cleared = questionnaireReducer(state, {
    type: 'field-changed',
    field: 'hasForeignAssets',
    value: 'no',
  })
  expect(cleared?.draft.assetIncomeConfirmed).toBe('')
})

test('migrates captured workspace without overwriting original storage and preserves all existing data on save', () => {
  const storage = new TestStorage()
  const raw = JSON.stringify(workspaceV9)
  storage.setItem(WORKSPACE_KEY, raw)
  const loaded = loadSavedWorkspace(storage, now)
  expect(loaded.kind).toBe('ready')
  if (loaded.kind !== 'ready' || !loaded.workspace.active)
    throw Error('Historical workspace did not migrate')
  expect(loaded.workspace).toMatchObject({
    schemaVersion: 11,
    revision: workspaceV9.revision,
    consentDecidedAt: workspaceV9.consentDecidedAt,
    active: {
      completions: workspaceV9.active.completions,
      profile: {
        otherIncome: {
          foreignAssets: { kind: 'none' },
          rentalIncome: workspaceV9.active.profile.otherIncome.rentalIncome,
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
      schemaVersion: 11,
      active: {
        completions: workspaceV9.active.completions,
        profile: {
          otherIncome: {
            foreignAssets: { kind: 'held', incomeConfirmed: 'yes' },
          },
        },
      },
    },
  })
})

test('old possible client accounts retain an independent estimate with uncertainty rather than inferred absence', () => {
  const storage = new TestStorage()
  const foreign = foreignClient().clients
  storage.setItem(
    WORKSPACE_KEY,
    JSON.stringify({
      ...workspaceV9,
      active: {
        ...workspaceV9.active,
        profile: { ...workspaceV9.active.profile, clients: foreign },
      },
    }),
  )
  const loaded = loadSavedWorkspace(storage, now)
  if (loaded.kind !== 'ready' || !loaded.workspace.active)
    throw Error('Historical possible account did not migrate')
  expect(loaded.workspace.active.profile.otherIncome.foreignAssets).toEqual({
    kind: 'possible',
    incomeConfirmed: 'yes',
  })
  expect(
    supported(loaded.workspace.active.profile).coverage.foreignGuidance.kind,
  ).toBe('unavailable')
})

test.each([
  'foreignAssets',
  'salary',
  'capitalGains',
  'foreignTaxOrRelief',
  'unrelatedForeignIncome',
  'otherUnsupportedFacts',
  'unsupportedFactsNotSure',
])('preserves historical %s stop facts until explicitly reviewed', (fact) => {
  const storage = new TestStorage()
  storage.setItem(
    WORKSPACE_KEY,
    JSON.stringify({
      ...workspaceV9,
      active: {
        ...workspaceV9.active,
        profile: { ...workspaceV9.active.profile, unsupportedFacts: [fact] },
      },
    }),
  )
  const loaded = loadSavedWorkspace(storage, now)
  if (loaded.kind !== 'ready' || !loaded.workspace.active)
    throw Error('Historical exclusion did not migrate')
  expect(loaded.workspace.active.profile.otherIncome.foreignAssets).toEqual({
    kind: 'possible',
    incomeConfirmed: 'not-sure',
  })
  expect(loaded.workspace.active.profile.unsupportedFacts).toEqual([fact])
  expect(
    evaluate(loaded.workspace.active.profile, now, currentRules).kind,
  ).toBe('unsupported')
})

test('captured Recovery requires fresh asset answers and mixed schemas are rejected', () => {
  const recovered = parseRecoveryDraft(recoveryV8, TAX_YEAR)
  expect(recovered).toMatchObject({
    schemaVersion: 12,
    draft: {
      hasForeignAssets: '',
      assetIncomeConfirmed: '',
      amounts: recoveryV8.draft.amounts,
    },
  })
  if (!recovered) throw Error('Historical Recovery did not migrate')
  expect(completeDraft(recovered.draft, today).valid).toBe(false)
  expect(
    parseRecoveryDraft({ ...recovered, schemaVersion: 8 }, TAX_YEAR),
  ).toBeNull()
  const storage = new TestStorage()
  storage.setItem(
    WORKSPACE_KEY,
    JSON.stringify({
      ...workspaceV9,
      active: {
        ...workspaceV9.active,
        profile: {
          ...workspaceV9.active.profile,
          otherIncome: {
            ...workspaceV9.active.profile.otherIncome,
            foreignAssets: { kind: 'none' },
          },
        },
      },
    }),
  )
  expect(loadSavedWorkspace(storage, now).kind).toBe('invalid')
})
