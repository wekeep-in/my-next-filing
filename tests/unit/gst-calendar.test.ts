import { test } from 'vitest'
import recoveryV3 from '../fixtures/recovery-v3.json' with { type: 'json' }
import workspaceV4 from '../fixtures/workspace-v4.json' with { type: 'json' }
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ReviewAreas } from '../../src/routes/plan/agenda.tsx'
import {
  canCompleteObligation,
  evaluate,
  parseProfile,
} from '../../src/evaluation/index.ts'
import type { GstCalendarProfile, Profile } from '../../src/evaluation/index.ts'
import { TAX_YEAR, currentRules } from '../../src/rules/index.ts'
import {
  assessQuestionnaire,
  blankGstCalendarFields,
  completeDraft,
  draftFromProfile,
  exampleProfile,
  statesAndUnionTerritories,
} from '../../src/routes/check/model.ts'
import {
  clearInactiveDraft,
  sessionFromProfile,
} from '../../src/routes/check/session.ts'
import {
  parseRecoveryDraft,
  recoveryFromSession,
} from '../../src/recovery-draft/index.ts'
import {
  WORKSPACE_KEY,
  deriveWorkspaceView,
  loadSavedWorkspace,
  saveSavedWorkspace,
} from '../../src/workspace/index.ts'
import { TestStorage } from '../helpers/storage'
import { completionLabel } from '../../src/routes/plan/model.ts'

const today = '2026-09-08'
const now = new Date(`${today}T12:00:00+05:30`)
const calendar: GstCalendarProfile = {
  registeredFrom: '2025-10-15',
  continuous: 'yes',
  cadences: ['monthly', 'monthly', 'monthly', 'monthly'],
  exportRoute: 'none',
  lutConfirmed: null,
  firstExportDate: null,
}
const registered = (
  changes: Partial<GstCalendarProfile> = {},
  state = 'Maharashtra',
): Profile => ({
  ...exampleProfile,
  gst: {
    kind: 'registered',
    status: 'one-normal',
    state,
    calendar: { ...calendar, ...changes },
  },
})
const resultFor = (profile = registered(), rules = currentRules) => {
  const parsed = parseProfile(profile)
  assert.ok(parsed.valid)
  const result = evaluate(parsed.profile, now, rules)
  assert.ok(result.kind === 'supported')
  return result
}
const gstActions = (result: ReturnType<typeof resultFor>) =>
  result.obligations.filter(({ kind }) => kind.startsWith('gst-'))

const qrmp = {
  ...calendar,
  cadences: ['qrmp', 'qrmp', 'qrmp', 'qrmp'] as const,
}

const foreign: Profile['clients'] = {
  kind: 'mixed',
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
}
const exporter: Profile = {
  ...registered({
    exportRoute: 'lut',
    lutConfirmed: 'yes',
    firstExportDate: '2026-04-15',
  }),
  clients: foreign,
}

test('keeps renewed GST and LUT coverage past September and preserves saved completions', () => {
  const before = resultFor(exporter)
  const completed = before.obligations.find(({ kind }) => kind === 'gst-lut')!
  const storage = new TestStorage()
  const saved = saveSavedWorkspace(
    storage,
    null,
    {
      noticeVersion: 2,
      consentDecidedAt: now.toISOString(),
      activeTaxYear: TAX_YEAR,
      priorYears: [],
      active: {
        profile: exporter,
        ruleDatasetId: currentRules.id,
        completions: [
          { obligationId: completed.id, completedOn: '2026-04-14' },
        ],
      },
    },
    now,
  )
  assert.ok(saved.kind === 'saved')
  const raw = storage.getItem(WORKSPACE_KEY)
  for (const date of ['2026-10-01T12:00:00+05:30', '2026-10-31T18:29:59Z']) {
    const refreshed = evaluate(exporter, new Date(date), currentRules)
    assert.ok(refreshed.kind === 'supported')
    assert.equal(refreshed.coverage.gst.kind, 'available')
    assert.equal(refreshed.coverage.lut.kind, 'available')
    assert.deepEqual(refreshed.tax, before.tax)
    assert.deepEqual(
      gstActions(refreshed).map(({ id, dueDate }) => ({ id, dueDate })),
      gstActions(before).map(({ id, dueDate }) => ({ id, dueDate })),
    )
    assert.ok(
      gstActions(refreshed).every(
        ({ kind, verifiedOn, expiresOn, operativeDueDate }) =>
          verifiedOn === (kind === 'gst-lut' ? '2026-09-07' : '2026-09-08') &&
          expiresOn === '2026-10-31' &&
          operativeDueDate === null,
      ),
    )
    assert.equal(
      deriveWorkspaceView(saved.workspace, { [TAX_YEAR]: refreshed })
        .completedCount,
      1,
    )
  }
  const expired = evaluate(
    exporter,
    new Date('2026-10-31T18:30:00Z'),
    currentRules,
  )
  assert.ok(expired.kind === 'supported')
  assert.equal(expired.coverage.gst.kind, 'unavailable')
  assert.equal(expired.coverage.lut.kind, 'unavailable')
  assert.equal(gstActions(expired).length, 0)
  assert.deepEqual(expired.tax, before.tax)
  assert.equal(storage.getItem(WORKSPACE_KEY), raw)
  const restored = loadSavedWorkspace(
    storage,
    new Date('2026-11-01T12:00:00+05:30'),
  )
  assert.ok(restored.kind === 'ready')
  assert.deepEqual(
    restored.workspace.active?.completions,
    saved.workspace.active?.completions,
  )
})

test('derives monthly periods and withholds expired calendar rules', () => {
  const monthly = resultFor()
  const expiredCalendar = evaluate(
    registered(),
    new Date('2026-11-01T12:00:00+05:30'),
    currentRules,
  )
  assert.ok(expiredCalendar.kind === 'supported')
  assert.equal(expiredCalendar.coverage.gst.kind, 'unavailable')
  if (expiredCalendar.coverage.gst.kind === 'unavailable') {
    assert.equal(expiredCalendar.coverage.gst.code, 'gst-calendar-rules')
    assert.match(
      expiredCalendar.coverage.gst.reason,
      /until we update our rules/,
    )
    assert.doesNotMatch(expiredCalendar.coverage.gst.guidance, /agenda|Confirm/)
  }
  const expiryDay = evaluate(
    registered(),
    new Date('2026-10-31T12:00:00+05:30'),
    currentRules,
  )
  assert.ok(expiryDay.kind === 'supported')
  assert.equal(expiryDay.coverage.gst.kind, 'available')
  assert.equal(gstActions(monthly).length, 24)
  assert.equal(monthly.coverage.gst.kind, 'available')
  assert.equal(monthly.coverage.lut.kind, 'available')
  assert.equal(gstActions(monthly)[0].dueDate, '2026-05-11')
  assert.equal(gstActions(monthly).at(-1)?.dueDate, '2027-04-20')
  assert.ok(
    gstActions(monthly).every(
      ({ amountDue, title, id, completionNotBefore }) =>
        amountDue === null &&
        /20(26|27)/.test(title) &&
        id.includes(TAX_YEAR) &&
        completionNotBefore,
    ),
  )
  assert.equal(
    new Set(monthly.obligations.map(({ id }) => id)).size,
    monthly.obligations.length,
  )
  const unregistered = resultFor(exampleProfile)
  assert.deepEqual(monthly.tax, unregistered.tax)
  assert.equal(
    gstActions(resultFor(registered({ registeredFrom: '2026-08-15' }))).length,
    16,
  )
  assert.equal(
    gstActions(resultFor(registered({ registeredFrom: '2026-07-01' }))).length,
    18,
  )
  assert.equal(
    gstActions(resultFor(registered({ registeredFrom: '2026-04-01' }))).length,
    24,
  )
  const nil = registered()
  const nilIncome: Profile = {
    ...nil,
    incomePath: {
      ...nil.incomePath,
      grossReceipts: 0,
      declaredProfit: 0,
      cashReceipts: 0,
    },
  }
  assert.equal(
    gstActions(resultFor(nilIncome)).length,
    24,
    'No business does not erase normal-taxpayer filings',
  )
})

test('derives quarterly dates for every state and handles unknown quarters', () => {
  const earlyStates = new Set([
    'Chhattisgarh',
    'Madhya Pradesh',
    'Gujarat',
    'Maharashtra',
    'Karnataka',
    'Goa',
    'Kerala',
    'Tamil Nadu',
    'Telangana',
    'Andhra Pradesh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Puducherry',
    'Andaman and Nicobar Islands',
    'Lakshadweep',
  ])
  for (const state of statesAndUnionTerritories) {
    const result = resultFor(registered(qrmp, state))
    assert.equal(gstActions(result).length, 16)
    assert.equal(
      result.obligations.find(({ kind }) => kind === 'gst-gstr3b')?.dueDate,
      earlyStates.has(state) ? '2026-07-22' : '2026-07-24',
    )
    assert.equal(
      result.obligations.filter(({ kind }) => kind === 'gst-qrmp-payment')
        .length,
      8,
    )
    assert.equal(
      result.obligations.find(({ kind }) => kind === 'gst-gstr1')?.dueDate,
      '2026-07-13',
    )
    assert.equal(
      result.obligations.find(({ kind }) => kind === 'gst-qrmp-payment')
        ?.dueDate,
      '2026-05-25',
    )
  }
  const partial = resultFor(
    registered({ cadences: ['monthly', 'qrmp', 'not-sure', 'monthly'] }),
  )
  assert.equal(partial.coverage.gst.kind, 'unavailable')
  assert.equal(gstActions(partial).length, 16)
  assert.ok(partial.reviewActions.some(({ id }) => id === 'gst-quarter-2'))
  const midQuarter = resultFor(
    registered({ ...qrmp, registeredFrom: '2026-08-15' }),
  )
  assert.equal(
    gstActions(midQuarter).length,
    8,
    'An unconfirmed new QRMP election after its window must not invent that quarter',
  )
  assert.equal(
    gstActions(resultFor(registered({ ...qrmp, registeredFrom: '2026-04-15' })))
      .length,
    16,
  )
  for (const changes of [
    { registeredFrom: null },
    { registeredFrom: '2026-10-01' as const },
    { continuous: 'no' as const },
    { continuous: 'not-sure' as const },
  ]) {
    const result = resultFor(registered(changes))
    assert.equal(result.coverage.gst.kind, 'unavailable')
    assert.equal(gstActions(result).length, 0)
  }
  for (const status of ['other', 'not-sure'] as const) {
    const result = resultFor({
      ...exampleProfile,
      gst: { kind: 'registered', status, state: null, calendar: null },
    })
    assert.equal(result.coverage.gst.kind, 'unavailable')
  }
})

test('derives LUT dates and renders independent expiry guidance', () => {
  const exportResult = resultFor(exporter)
  const expiredExport = evaluate(
    exporter,
    new Date('2026-11-01T12:00:00+05:30'),
    currentRules,
  )
  assert.ok(
    expiredExport.kind === 'supported' &&
      expiredExport.coverage.lut.kind === 'unavailable',
  )
  assert.equal(
    expiredExport.obligations.filter(({ kind }) => kind.startsWith('gst-'))
      .length,
    0,
  )
  assert.doesNotMatch(
    expiredExport.coverage.lut.reason + expiredExport.coverage.lut.guidance,
    /return dates.*available|agenda/i,
  )
  const expiredMarkup = renderToStaticMarkup(
    createElement(ReviewAreas, {
      evaluation: expiredExport,
      onReview: () => {},
    }),
  )
  assert.equal((expiredMarkup.match(/Open GST portal/g) ?? []).length, 2)
  assert.doesNotMatch(expiredMarkup, /Review tax and GST answers/)
  const lut = exportResult.obligations.find(({ kind }) => kind === 'gst-lut')!
  assert.equal(lut.dueDate, '2026-04-15')
  assert.equal(lut.id, `gst-lut:${TAX_YEAR}`)
  assert.equal(gstActions(exportResult).length, 25)
  assert.equal(exportResult.coverage.lut.kind, 'available')
  assert.equal(canCompleteObligation(lut, '2025-10-14'), false)
  assert.equal(canCompleteObligation(lut, '2026-04-14'), true)
  for (const changes of [
    { firstExportDate: null },
    { lutConfirmed: 'no' as const },
    { lutConfirmed: 'not-sure' as const },
    { registeredFrom: '2026-05-01' as const },
  ]) {
    assert.ok(exporter.gst.kind === 'registered' && exporter.gst.calendar)
    const result = resultFor({
      ...exporter,
      gst: {
        ...exporter.gst,
        calendar: { ...exporter.gst.calendar, ...changes },
      },
    })
    assert.equal(result.coverage.lut.kind, 'unavailable')
    assert.equal(result.coverage.gst.kind, 'available')
    assert.ok(!result.obligations.some(({ kind }) => kind === 'gst-lut'))
  }
  assert.equal(
    resultFor(
      registered({
        exportRoute: 'lut',
        lutConfirmed: 'yes',
        firstExportDate: '2026-04-15',
      }),
    ).coverage.lut.kind,
    'unavailable',
    'LUT cannot bypass the foreign-client confirmations',
  )
  for (const exportRoute of ['none', 'igst', 'other', 'not-sure'] as const) {
    const result = resultFor(registered({ exportRoute }))
    assert.equal(result.coverage.gst.kind, 'available')
    assert.equal(gstActions(result).length, 24)
    assert.equal(
      result.coverage.lut.kind,
      exportRoute === 'none' || exportRoute === 'igst'
        ? 'available'
        : 'unavailable',
    )
  }
})

test('withholds each unavailable rule group independently', () => {
  const exportResult = resultFor(exporter)
  for (const group of ['gstCalendar', 'lut'] as const) {
    const rules = structuredClone(currentRules)
    Object.assign(rules.groups[group], {
      expiresOn: '2026-09-05',
      verifiedOn: '2026-09-04',
    })
    const result = resultFor(exporter, rules)
    assert.equal(
      result.coverage.gst.kind,
      group === 'gstCalendar' ? 'unavailable' : 'available',
    )
    assert.equal(
      result.coverage.lut.kind,
      group === 'lut' ? 'unavailable' : 'available',
    )
    assert.deepEqual(result.tax, exportResult.tax)
    const missing = structuredClone(currentRules)
    Reflect.deleteProperty(missing.groups, group)
    assert.equal(
      resultFor(exporter, missing).coverage[group === 'lut' ? 'lut' : 'gst']
        .kind,
      'unavailable',
    )
  }
  const badRules = structuredClone(currentRules)
  Object.assign(badRules.groups.gstCalendar.values, { monthlyGstr1Day: 12 })
  assert.equal(resultFor(exporter, badRules).coverage.gst.kind, 'unavailable')
  const missingLutSource = {
    ...currentRules,
    sources: currentRules.sources.filter(
      ({ id }) => id !== 'gst-notification-37-2017',
    ),
  }
  assert.equal(
    resultFor(exporter, missingLutSource).coverage.lut.kind,
    'unavailable',
  )
})

test('rejects malformed calendar and export facts', () => {
  for (const changes of [
    { cadences: ['monthly'] },
    { cadences: ['monthly', 'weekly', 'monthly', 'monthly'] },
    { registeredFrom: '2026-02-30' },
    { registeredFrom: '2017-06-30' },
    { firstExportDate: '2027-04-01' },
    { exportRoute: 'none', lutConfirmed: 'yes' },
  ])
    assert.equal(
      parseProfile({
        ...exporter,
        gst: { ...exporter.gst, calendar: { ...calendar, ...changes } },
      }).valid,
      false,
    )
})

test('clears inactive calendar facts and migrates Recovery', () => {
  const draft = draftFromProfile(exporter)
  const complete = completeDraft(draft, today)
  assert.ok(complete.valid)
  assert.deepEqual(complete.profile, exporter)
  assert.equal(
    assessQuestionnaire(
      {
        draft: {
          ...draft,
          gstQuarter3: 'not-sure',
          gstLutConfirmed: 'not-sure',
        },
      },
      'gst',
      today,
    ).progression.kind,
    'next',
  )
  assert.equal(
    assessQuestionnaire({ draft: { ...draft, gstQuarter3: '' } }, 'gst', today)
      .progression.kind,
    'blocked',
  )
  assert.equal(
    clearInactiveDraft({ ...draft, gstKind: 'unregistered' }).gstRegisteredFrom,
    '',
  )
  assert.equal(
    clearInactiveDraft({ ...draft, gstExportRoute: 'igst' }).gstFirstExportDate,
    '',
  )
  assert.equal(
    clearInactiveDraft({ ...draft, gstRegisteredFrom: '2026-08-15' })
      .gstQuarter1,
    '',
  )
  const recovery = recoveryFromSession(
    sessionFromProfile(exporter, { kind: 'personal' }, today),
    TAX_YEAR,
  )!
  assert.deepEqual(parseRecoveryDraft(recovery, TAX_YEAR), recovery)
  const oldDraft = {
    ...structuredClone(recoveryV3.draft),
    gstKind: 'registered',
    gstStatus: 'one-normal',
    gstState: 'Maharashtra',
    amounts: { ...recoveryV3.draft.amounts, aggregateTurnover: '' },
    turnoverComplete: '',
    compulsoryRegistration: '',
    thresholdLiabilityDate: '',
  }
  for (const key of Object.keys(blankGstCalendarFields))
    Reflect.deleteProperty(oldDraft, key)
  const migrated = parseRecoveryDraft(
    { ...recovery, schemaVersion: 2, draft: oldDraft },
    TAX_YEAR,
  )
  assert.ok(migrated)
  assert.equal(migrated.draft.gstQuarter1, '')
  assert.equal(completeDraft(migrated.draft, today).valid, false)
})

test('reconciles calendar Completions and migrates workspace schema three', () => {
  const monthly = resultFor()
  const storage = new TestStorage()
  const first = gstActions(monthly)[0]
  assert.equal(completionLabel(first.id), 'GSTR-1 for April 2026')
  assert.equal(
    completionLabel(`gst-gstr3b:${TAX_YEAR}:2026-04-01:2026-06-30`),
    'GSTR-3B for April–June 2026',
  )
  assert.equal(
    completionLabel(`gst-qrmp-payment:${TAX_YEAR}:2027-01-01:2027-01-31`),
    'GST payment review for January 2027',
  )
  assert.equal(completionLabel(`gst-lut:${TAX_YEAR}`), 'LUT for 2026-27')
  assert.equal(canCompleteObligation(first, '2026-04-30'), false)
  assert.equal(canCompleteObligation(first, '2026-05-01'), true)
  const saved = saveSavedWorkspace(
    storage,
    null,
    {
      noticeVersion: 2,
      consentDecidedAt: now.toISOString(),
      activeTaxYear: TAX_YEAR,
      priorYears: [],
      active: {
        profile: registered(),
        ruleDatasetId: currentRules.id,
        completions: [{ obligationId: first.id, completedOn: '2026-05-11' }],
      },
    },
    now,
  )
  assert.ok(saved.kind === 'saved')
  assert.equal(loadSavedWorkspace(storage, now).kind, 'ready')
  assert.equal(
    deriveWorkspaceView(saved.workspace, { [TAX_YEAR]: monthly })
      .completedCount,
    1,
  )
  assert.equal(
    deriveWorkspaceView(saved.workspace, {
      [TAX_YEAR]: resultFor(registered(qrmp)),
    }).years[0].needsReview.length,
    1,
  )
  const premature = {
    ...saved.workspace,
    active: {
      ...saved.workspace.active!,
      completions: [
        { obligationId: first.id, completedOn: '2026-04-15' as const },
      ],
    },
  }
  assert.equal(
    deriveWorkspaceView(premature, { [TAX_YEAR]: monthly }).years[0].needsReview
      .length,
    1,
  )
  for (const obligationId of [
    `gst-gstr1:${TAX_YEAR}:2026-04-01:2026-05-31`,
    `gst-gstr3b:${TAX_YEAR}:2026-05-01:2026-07-31`,
    `gst-qrmp-payment:${TAX_YEAR}:2026-06-01:2026-06-30`,
    `gst-lut:Tax Year 2025-26`,
  ]) {
    storage.setItem(
      WORKSPACE_KEY,
      JSON.stringify({
        ...saved.workspace,
        active: {
          ...saved.workspace.active,
          completions: [{ obligationId, completedOn: today }],
        },
      }),
    )
    assert.equal(loadSavedWorkspace(storage, now).kind, 'invalid')
  }
  const oldProfile = {
    ...structuredClone(workspaceV4.active.profile),
    gst: { kind: 'registered', status: 'one-normal', state: 'Maharashtra' },
  }
  const raw = JSON.stringify({
    ...saved.workspace,
    schemaVersion: 3,
    active: {
      ...saved.workspace.active,
      profile: oldProfile,
      completions: [
        { obligationId: `annual-return:${TAX_YEAR}`, completedOn: today },
      ],
    },
  })
  storage.setItem(WORKSPACE_KEY, raw)
  const restored = loadSavedWorkspace(storage, now)
  assert.ok(
    restored.kind === 'ready' &&
      restored.workspace.active?.profile.gst.kind === 'registered',
  )
  assert.equal(restored.workspace.active.profile.gst.calendar, null)
  assert.equal(restored.workspace.active.completions.length, 1)
  assert.equal(storage.getItem(WORKSPACE_KEY), raw)
  assert.equal(
    resultFor(restored.workspace.active.profile).coverage.gst.kind,
    'unavailable',
  )
})
