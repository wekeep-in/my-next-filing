import { indiaDate } from '@/lib/india-date'
import { canCompleteObligation, parseProfile } from '@/evaluation'
import type { EvaluationResult, Obligation, Profile } from '@/evaluation'
import { TAX_YEAR } from '@/rules'
import type { DateOnly, TaxYear } from '@/rules'

export const WORKSPACE_KEY = 'my-next-filing:workspace'
export const STORAGE_NOTICE_VERSION = 2 as const

export type CompletionRecord = {
  readonly obligationId: string
  readonly completedOn: DateOnly
}

export type ActiveSavedRecord = {
  readonly ruleDatasetId: string
  readonly profile: Profile
  readonly completions: readonly CompletionRecord[]
}

export type OpenPriorYearRecord = {
  readonly taxYear: TaxYear
  readonly state: 'open'
  readonly ruleDatasetId: string
  readonly profile: Profile
  readonly completions: readonly CompletionRecord[]
}

export type ArchivedPriorYearRecord = {
  readonly taxYear: TaxYear
  readonly state: 'archived'
  readonly ruleDatasetId: string
  readonly profile: Profile
  readonly completions: readonly CompletionRecord[]
  readonly archiveDate: DateOnly
}

export type PriorYearRecord = OpenPriorYearRecord | ArchivedPriorYearRecord

export type SavedWorkspace = {
  readonly schemaVersion: 7
  readonly revision: number
  readonly noticeVersion: 2
  readonly consentDecidedAt: string
  readonly activeTaxYear: TaxYear
  readonly active: ActiveSavedRecord | null
  readonly priorYears: readonly PriorYearRecord[]
  readonly updatedAt: string
}

export type SavedWorkspaceDraft = Omit<
  SavedWorkspace,
  'schemaVersion' | 'revision' | 'updatedAt'
>

export type LoadSavedWorkspaceResult =
  | {
      readonly kind:
        | 'legacy'
        | 'legacy-removal-failed'
        | 'legacy-removal-unverified'
    }
  | { readonly kind: 'absent' }
  | { readonly kind: 'ready'; readonly workspace: SavedWorkspace }
  | { readonly kind: 'invalid'; readonly reason: 'saved-data-invalid' }
  | { readonly kind: 'unavailable'; readonly reason: 'storage-unavailable' }

export type StorageWriteResult =
  | { readonly kind: 'saved'; readonly workspace: SavedWorkspace }
  | { readonly kind: 'conflict'; readonly reason: 'stored-value-changed' }
  | { readonly kind: 'invalid'; readonly reason: 'workspace-invalid' }
  | { readonly kind: 'unavailable'; readonly reason: 'storage-unavailable' }

export type StorageDeleteResult =
  | { readonly kind: 'deletion-failed' | 'deletion-unverified' }
  | { readonly kind: 'deleted' }
  | { readonly kind: 'absent' }
  | { readonly kind: 'conflict'; readonly reason: 'stored-value-changed' }
  | { readonly kind: 'unavailable'; readonly reason: 'storage-unavailable' }

export type CompletionMatch = {
  readonly kind: 'complete'
  readonly record: CompletionRecord
  readonly obligation: Obligation
}

export type NeedsReviewRecord = {
  readonly kind: 'needs-review'
  readonly record: CompletionRecord
  readonly reason: string
  readonly obligation: Obligation | null
}

export type WorkspaceYearView = {
  readonly taxYear: TaxYear
  readonly state: 'active' | 'open' | 'archived'
  readonly evaluation: EvaluationResult | null
  readonly openObligations: readonly Obligation[]
  readonly completed: readonly CompletionMatch[]
  readonly needsReview: readonly NeedsReviewRecord[]
}

export type WorkspaceOpenObligation = {
  readonly taxYear: TaxYear
  readonly obligation: Obligation
}

export type WorkspaceView = {
  readonly years: readonly WorkspaceYearView[]
  readonly openObligations: readonly WorkspaceOpenObligation[]
  readonly completedCount: number
  readonly openCount: number
  readonly next: WorkspaceOpenObligation | null
  readonly attention:
    | { readonly kind: 'next'; readonly item: WorkspaceOpenObligation }
    | { readonly kind: 'rules-review'; readonly taxYear: TaxYear }
    | { readonly kind: 'none' }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const exactKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).length === keys.length &&
  Object.keys(value).every((key) => keys.includes(key))

const isDate = (value: unknown): value is DateOnly => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toISOString().slice(0, 10) === value
}

const isTaxYear = (value: unknown): value is TaxYear => {
  if (typeof value !== 'string') return false
  const match = /^Tax Year (\d{4})-(\d{2})$/.exec(value)
  if (!match) return false
  return Number(match[2]) === (Number(match[1]) + 1) % 100
}

const isSafeInteger = (value: unknown) =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

const isIsoTimestamp = (value: unknown) =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
  !Number.isNaN(Date.parse(value))

const isCompletionId = (value: unknown, taxYear?: TaxYear): value is string => {
  if (typeof value !== 'string') return false
  const match =
    /^(?:advance-tax|annual-return|gst-registration|gst-lut):(Tax Year \d{4}-\d{2})$/.exec(
      value,
    )
  if (match) return isTaxYear(match[1]) && (!taxYear || match[1] === taxYear)
  const period =
    /^(gst-gstr1|gst-gstr3b|gst-qrmp-payment):(Tax Year \d{4}-\d{2}):(\d{4}-\d{2}-\d{2}):(\d{4}-\d{2}-\d{2})$/.exec(
      value,
    )
  if (
    !period ||
    !isTaxYear(period[2]) ||
    (taxYear && period[2] !== taxYear) ||
    !isDate(period[3]) ||
    !isDate(period[4])
  )
    return false
  const year = Number(period[2].slice(9, 13))
  const start = new Date(`${period[3]}T00:00:00Z`)
  const end = new Date(`${period[4]}T00:00:00Z`)
  const months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    end.getUTCMonth() -
    start.getUTCMonth()
  const monthEnd = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0),
  )
    .toISOString()
    .slice(0, 10)
  return (
    period[3] >= `${year}-04-01` &&
    period[4] <= `${year + 1}-03-31` &&
    start.getUTCDate() === 1 &&
    period[4] === monthEnd &&
    (months === 0 ||
      (months === 2 &&
        start.getUTCMonth() % 3 === 0 &&
        period[1] !== 'gst-qrmp-payment')) &&
    (period[1] !== 'gst-qrmp-payment' || start.getUTCMonth() % 3 !== 2)
  )
}

function validCompletions(value: unknown, today: DateOnly, taxYear: TaxYear) {
  if (!Array.isArray(value)) return false
  const ids = new Set<string>()
  return value.every((candidate) => {
    const id = isRecord(candidate) ? candidate.obligationId : null
    if (
      !isRecord(candidate) ||
      !exactKeys(candidate, ['obligationId', 'completedOn']) ||
      !isCompletionId(id, taxYear) ||
      !isDate(candidate.completedOn) ||
      candidate.completedOn > today ||
      ids.has(id)
    )
      return false
    ids.add(id)
    return true
  })
}

function validSavedRecord(value: unknown, taxYear: TaxYear, today: DateOnly) {
  if (
    !isRecord(value) ||
    !exactKeys(value, ['ruleDatasetId', 'profile', 'completions'])
  )
    return false
  if (!isRecord(value.profile)) return false
  const profile = parseProfile(value.profile)
  return (
    profile.valid &&
    profile.profile.person.adult === 'yes' &&
    profile.profile.taxYear === taxYear &&
    typeof value.ruleDatasetId === 'string' &&
    value.ruleDatasetId.length > 0 &&
    validCompletions(value.completions, today, taxYear)
  )
}

function validPriorRecord(
  value: unknown,
  today: DateOnly,
): value is PriorYearRecord {
  if (
    !isRecord(value) ||
    !isTaxYear(value.taxYear) ||
    typeof value.ruleDatasetId !== 'string' ||
    value.ruleDatasetId.length === 0 ||
    !isRecord(value.profile) ||
    !validCompletions(value.completions, today, value.taxYear)
  )
    return false
  const profile = parseProfile(value.profile)
  if (
    !profile.valid ||
    profile.profile.person.adult !== 'yes' ||
    profile.profile.taxYear !== value.taxYear
  )
    return false
  if (value.state === 'open')
    return exactKeys(value, [
      'taxYear',
      'state',
      'ruleDatasetId',
      'profile',
      'completions',
    ])
  return (
    value.state === 'archived' &&
    exactKeys(value, [
      'taxYear',
      'state',
      'ruleDatasetId',
      'profile',
      'completions',
      'archiveDate',
    ]) &&
    isDate(value.archiveDate) &&
    value.archiveDate <= today
  )
}

function decodeWorkspace(
  value: unknown,
  today: DateOnly,
): SavedWorkspace | null {
  if (isRecord(value) && value.schemaVersion === 6) {
    const migrateRecord = (record: unknown) => {
      if (
        !isRecord(record) ||
        !isRecord(record.profile) ||
        !isRecord(record.profile.otherIncome) ||
        Object.hasOwn(record.profile.otherIncome, 'equityGains') ||
        !Array.isArray(record.profile.unsupportedFacts)
      )
        return null
      const unknown = record.profile.unsupportedFacts.some((fact: unknown) =>
        [
          'capitalGains',
          'deductionsLossesOrSpecialRate',
          'otherUnsupportedFacts',
          'unsupportedFactsNotSure',
        ].includes(String(fact)),
      )
      return {
        ...record,
        profile: {
          ...record.profile,
          otherIncome: {
            ...record.profile.otherIncome,
            equityGains: { kind: unknown ? 'not-sure' : 'none' },
          },
        },
      }
    }
    if (!Array.isArray(value.priorYears)) return null
    const active = value.active === null ? null : migrateRecord(value.active)
    if (value.active !== null && active === null) return null
    return decodeWorkspace(
      {
        ...value,
        schemaVersion: 7,
        active,
        priorYears: value.priorYears.map(migrateRecord),
      },
      today,
    )
  }
  if (isRecord(value) && value.schemaVersion === 5) {
    const migrateRecord = (record: unknown) => {
      if (
        !isRecord(record) ||
        !isRecord(record.profile) ||
        !isRecord(record.profile.otherIncome) ||
        !isRecord(record.profile.otherIncome.salary)
      )
        return null
      const salary = record.profile.otherIncome.salary
      if (Object.hasOwn(salary, 'employerNps')) return null
      const facts = record.profile.unsupportedFacts
      const unknown =
        salary.confirmed !== 'yes' ||
        !Array.isArray(facts) ||
        facts.some((fact: unknown) =>
          [
            'salary',
            'deductionsLossesOrSpecialRate',
            'otherUnsupportedFacts',
            'unsupportedFactsNotSure',
          ].includes(String(fact)),
        )
      return {
        ...record,
        profile: {
          ...record.profile,
          otherIncome: {
            ...record.profile.otherIncome,
            salary:
              salary.kind === 'domestic'
                ? {
                    ...salary,
                    employerNps: { kind: unknown ? 'not-sure' : 'none' },
                  }
                : salary,
          },
        },
      }
    }
    if (!Array.isArray(value.priorYears)) return null
    const active = value.active === null ? null : migrateRecord(value.active)
    if (value.active !== null && active === null) return null
    return decodeWorkspace(
      {
        ...value,
        schemaVersion: 6,
        active,
        priorYears: value.priorYears.map(migrateRecord),
      },
      today,
    )
  }
  if (isRecord(value) && value.schemaVersion === 4) {
    const migrateRecord = (record: unknown) => {
      if (
        !isRecord(record) ||
        !isRecord(record.profile) ||
        !isRecord(record.profile.otherIncome) ||
        Object.hasOwn(record.profile.otherIncome, 'additionalIncome')
      )
        return null
      const facts = record.profile.unsupportedFacts
      const unknownIncome =
        Array.isArray(facts) &&
        facts.some((fact: unknown) =>
          [
            'dividendsOrGifts',
            'otherUnsupportedFacts',
            'unsupportedFactsNotSure',
          ].includes(String(fact)),
        )
      return {
        ...record,
        profile: {
          ...record.profile,
          otherIncome: {
            ...record.profile.otherIncome,
            additionalIncome: { kind: unknownIncome ? 'not-sure' : 'none' },
          },
        },
      }
    }
    if (!Array.isArray(value.priorYears)) return null
    const active = value.active === null ? null : migrateRecord(value.active)
    if (value.active !== null && active === null) return null
    return decodeWorkspace(
      {
        ...value,
        schemaVersion: 5,
        active,
        priorYears: value.priorYears.map(migrateRecord),
      },
      today,
    )
  }
  if (isRecord(value) && value.schemaVersion === 3) {
    const migrateRecord = (record: unknown) => {
      if (
        !isRecord(record) ||
        !isRecord(record.profile) ||
        !isRecord(record.profile.gst) ||
        Object.hasOwn(record.profile.gst, 'calendar') ||
        !Array.isArray(record.completions) ||
        record.completions.some(
          (item) =>
            !isRecord(item) ||
            typeof item.obligationId !== 'string' ||
            !/^(advance-tax|annual-return|gst-registration):Tax Year \d{4}-\d{2}$/.test(
              item.obligationId,
            ),
        )
      )
        return null
      return {
        ...record,
        profile: {
          ...record.profile,
          gst:
            record.profile.gst.kind === 'registered'
              ? { ...record.profile.gst, calendar: null }
              : record.profile.gst,
        },
      }
    }
    if (!Array.isArray(value.priorYears)) return null
    const active = value.active === null ? null : migrateRecord(value.active)
    if (value.active !== null && active === null) return null
    return decodeWorkspace(
      {
        ...value,
        schemaVersion: 4,
        active,
        priorYears: value.priorYears.map(migrateRecord),
      },
      today,
    )
  }
  if (isRecord(value) && value.schemaVersion === 2) {
    const migrateRecord = (record: unknown) => {
      if (record === null) return null
      if (
        !isRecord(record) ||
        !isRecord(record.profile) ||
        !isRecord(record.profile.otherIncome) ||
        Object.hasOwn(record.profile.otherIncome, 'salary')
      )
        return null
      return {
        ...record,
        profile: {
          ...record.profile,
          otherIncome: {
            ...record.profile.otherIncome,
            salary: {
              kind:
                Array.isArray(record.profile.unsupportedFacts) &&
                record.profile.unsupportedFacts.includes('salary')
                  ? 'not-sure'
                  : 'none',
            },
          },
        },
      }
    }
    if (!Array.isArray(value.priorYears)) return null
    const active = migrateRecord(value.active)
    if (value.active !== null && active === null) return null
    return decodeWorkspace(
      {
        ...value,
        schemaVersion: 3,
        active,
        priorYears: value.priorYears.map(migrateRecord),
      },
      today,
    )
  }
  if (
    !isRecord(value) ||
    !exactKeys(value, [
      'schemaVersion',
      'revision',
      'noticeVersion',
      'consentDecidedAt',
      'activeTaxYear',
      'active',
      'priorYears',
      'updatedAt',
    ]) ||
    value.schemaVersion !== 7 ||
    !isSafeInteger(value.revision) ||
    value.noticeVersion !== STORAGE_NOTICE_VERSION ||
    !isIsoTimestamp(value.consentDecidedAt) ||
    !isTaxYear(value.activeTaxYear) ||
    !Array.isArray(value.priorYears) ||
    !isIsoTimestamp(value.updatedAt)
  )
    return null
  const priorYears: unknown[] = value.priorYears
  if (
    value.active !== null &&
    !validSavedRecord(value.active, value.activeTaxYear, today)
  )
    return null
  if (value.active === null && priorYears.length === 0) return null
  const years = new Set<string>([value.activeTaxYear])
  for (const prior of priorYears) {
    if (!validPriorRecord(prior, today) || years.has(prior.taxYear)) return null
    years.add(prior.taxYear)
  }
  const updatedAt = value.updatedAt
  const consentDecidedAt = value.consentDecidedAt
  if (
    typeof updatedAt !== 'string' ||
    typeof consentDecidedAt !== 'string' ||
    updatedAt.slice(0, 10) > today ||
    consentDecidedAt.slice(0, 10) > today ||
    Date.parse(updatedAt) < Date.parse(consentDecidedAt)
  )
    return null
  return value as SavedWorkspace
}

function readWorkspace(storage: Storage, today: DateOnly) {
  const raw = storage.getItem(WORKSPACE_KEY)
  if (raw === null) return { kind: 'absent' as const }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (isRecord(parsed) && parsed.schemaVersion === 1)
      return { kind: 'legacy' as const }
    const workspace = decodeWorkspace(parsed, today)
    return workspace
      ? { kind: 'ready' as const, workspace }
      : { kind: 'invalid' as const }
  } catch {
    return { kind: 'invalid' as const }
  }
}

export function loadSavedWorkspace(
  storage: Storage,
  now = new Date(),
): LoadSavedWorkspaceResult {
  try {
    const result = readWorkspace(storage, indiaDate(now))
    return result.kind === 'ready' || result.kind === 'legacy'
      ? result
      : result.kind === 'invalid'
        ? { kind: 'invalid', reason: 'saved-data-invalid' }
        : { kind: 'absent' }
  } catch {
    return { kind: 'unavailable', reason: 'storage-unavailable' }
  }
}

function withRevision(
  draft: SavedWorkspaceDraft,
  revision: number,
  now: Date,
): SavedWorkspace {
  return {
    schemaVersion: 7,
    revision,
    noticeVersion: STORAGE_NOTICE_VERSION,
    consentDecidedAt: draft.consentDecidedAt,
    activeTaxYear: draft.activeTaxYear,
    active: draft.active,
    priorYears: draft.priorYears,
    updatedAt: now.toISOString(),
  }
}

export function saveSavedWorkspace(
  storage: Storage,
  expectedRevision: number | null,
  draft: SavedWorkspaceDraft,
  now = new Date(),
): StorageWriteResult {
  try {
    if (
      !isRecord(draft) ||
      !exactKeys(draft, [
        'noticeVersion',
        'consentDecidedAt',
        'activeTaxYear',
        'active',
        'priorYears',
      ])
    )
      return { kind: 'invalid', reason: 'workspace-invalid' }
    const today = indiaDate(now)
    const current = readWorkspace(storage, today)
    if (current.kind === 'invalid' || current.kind === 'legacy')
      return { kind: 'invalid', reason: 'workspace-invalid' }
    if (
      current.kind === 'absent'
        ? expectedRevision !== null
        : expectedRevision !== current.workspace.revision
    )
      return { kind: 'conflict', reason: 'stored-value-changed' }
    const next = withRevision(
      draft,
      expectedRevision === null ? 0 : expectedRevision + 1,
      now,
    )
    if (!decodeWorkspace(next, today))
      return { kind: 'invalid', reason: 'workspace-invalid' }
    const latest = readWorkspace(storage, today)
    if (latest.kind === 'invalid' || latest.kind === 'legacy')
      return { kind: 'invalid', reason: 'workspace-invalid' }
    if (
      latest.kind === 'absent'
        ? expectedRevision !== null
        : expectedRevision !== latest.workspace.revision
    )
      return { kind: 'conflict', reason: 'stored-value-changed' }
    storage.setItem(WORKSPACE_KEY, JSON.stringify(next))
    if (storage.getItem(WORKSPACE_KEY) !== JSON.stringify(next))
      return { kind: 'unavailable', reason: 'storage-unavailable' }
    return { kind: 'saved', workspace: next }
  } catch {
    return { kind: 'unavailable', reason: 'storage-unavailable' }
  }
}

export function deleteSavedWorkspace(
  storage: Storage,
  expectedRevision: number | null,
  now = new Date(),
): StorageDeleteResult {
  try {
    const raw = storage.getItem(WORKSPACE_KEY)
    if (raw === null) return { kind: 'absent' }
    let current: SavedWorkspace | null = null
    try {
      current = decodeWorkspace(JSON.parse(raw) as unknown, indiaDate(now))
    } catch {
      current = null
    }
    if (current && expectedRevision !== current.revision)
      return { kind: 'conflict', reason: 'stored-value-changed' }
    if (!current && expectedRevision !== null)
      return { kind: 'conflict', reason: 'stored-value-changed' }
    const latestRaw = storage.getItem(WORKSPACE_KEY)
    if (latestRaw !== raw)
      return { kind: 'conflict', reason: 'stored-value-changed' }
    return removeWorkspaceValue(storage, raw)
  } catch {
    return { kind: 'unavailable', reason: 'storage-unavailable' }
  }
}

function removeWorkspaceValue(
  storage: Storage,
  raw: string,
): StorageDeleteResult {
  try {
    storage.removeItem(WORKSPACE_KEY)
  } catch {
    /* Inspect the actual removal outcome. */
  }
  try {
    const remaining = storage.getItem(WORKSPACE_KEY)
    if (remaining === null) return { kind: 'deleted' }
    return remaining === raw
      ? { kind: 'deletion-failed' }
      : { kind: 'conflict', reason: 'stored-value-changed' }
  } catch {
    return { kind: 'deletion-unverified' }
  }
}

export type LegacyDeleteResult = {
  readonly kind:
    | 'legacy-deleted'
    | 'absent'
    | 'legacy-removal-failed'
    | 'legacy-removal-unverified'
    | 'conflict'
    | 'unavailable'
}

export function deleteLegacyWorkspace(storage: Storage): LegacyDeleteResult {
  try {
    const raw = storage.getItem(WORKSPACE_KEY)
    if (raw === null) return { kind: 'absent' }
    let value: unknown
    try {
      value = JSON.parse(raw) as unknown
    } catch {
      return { kind: 'conflict' }
    }
    if (
      !isRecord(value) ||
      value.schemaVersion !== 1 ||
      storage.getItem(WORKSPACE_KEY) !== raw
    )
      return { kind: 'conflict' }
    const result = removeWorkspaceValue(storage, raw)
    switch (result.kind) {
      case 'deleted':
        return { kind: 'legacy-deleted' }
      case 'absent':
        return { kind: 'absent' }
      case 'deletion-failed':
        return { kind: 'legacy-removal-failed' }
      case 'deletion-unverified':
        return { kind: 'legacy-removal-unverified' }
      case 'conflict':
        return { kind: 'conflict' }
      case 'unavailable':
        return { kind: 'unavailable' }
    }
  } catch {
    return { kind: 'unavailable' }
  }
}

function catalogOrder(kind: Obligation['kind']) {
  return kind === 'advance-tax' ? 0 : kind === 'annual-return' ? 1 : 2
}

function currentYearView(
  record: ActiveSavedRecord | PriorYearRecord,
  state: WorkspaceYearView['state'],
  evaluation: EvaluationResult | null,
): WorkspaceYearView {
  if (state === 'archived')
    return {
      taxYear: record.profile.taxYear,
      state,
      evaluation: null,
      openObligations: [],
      completed: [],
      needsReview: [],
    }
  if (evaluation?.kind !== 'supported') {
    return {
      taxYear: record.profile.taxYear,
      state,
      evaluation,
      openObligations: [],
      completed: [],
      needsReview: record.completions.map((completion) => ({
        kind: 'needs-review',
        record: completion,
        reason:
          evaluation?.kind === 'stale-rules'
            ? 'The current tax rules must be reviewed before this date can be matched to an action.'
            : 'Your current plan no longer includes an action that matches this date.',
        obligation: null,
      })),
    }
  }
  const completionById = new Map(
    record.completions.map((completion) => [
      completion.obligationId,
      completion,
    ]),
  )
  const obligations = evaluation.obligations
  const completed: CompletionMatch[] = []
  const openObligations: Obligation[] = []
  for (const obligation of obligations) {
    const completion = completionById.get(obligation.id)
    if (completion && canCompleteObligation(obligation, completion.completedOn))
      completed.push({ kind: 'complete', record: completion, obligation })
    else openObligations.push(obligation)
  }
  const needsReview = record.completions
    .filter(
      (completion) =>
        !obligations.some(
          (obligation) => obligation.id === completion.obligationId,
        ) ||
        obligations.some(
          (obligation) =>
            obligation.id === completion.obligationId &&
            !canCompleteObligation(obligation, completion.completedOn),
        ),
    )
    .map((completion) => ({
      kind: 'needs-review' as const,
      record: completion,
      reason:
        'Your current plan no longer matches this completion date or the amount paid.',
      obligation:
        obligations.find(
          (obligation) => obligation.id === completion.obligationId,
        ) ?? null,
    }))
  return {
    taxYear: record.profile.taxYear,
    state,
    evaluation,
    openObligations,
    completed,
    needsReview,
  }
}

function sortOpen(a: WorkspaceOpenObligation, b: WorkspaceOpenObligation) {
  return (
    a.obligation.dueDate.localeCompare(b.obligation.dueDate) ||
    catalogOrder(a.obligation.kind) - catalogOrder(b.obligation.kind) ||
    a.taxYear.localeCompare(b.taxYear)
  )
}

export function deriveWorkspaceView(
  savedWorkspace: SavedWorkspace | null,
  evaluations: Readonly<Record<string, EvaluationResult>>,
): WorkspaceView {
  const yearViews: WorkspaceYearView[] = []
  if (savedWorkspace) {
    const activeEvaluation = savedWorkspace.active
      ? (evaluations[savedWorkspace.active.profile.taxYear] ?? null)
      : null
    if (savedWorkspace.active)
      yearViews.push(
        currentYearView(savedWorkspace.active, 'active', activeEvaluation),
      )
    for (const prior of savedWorkspace.priorYears)
      yearViews.push(
        currentYearView(prior, prior.state, evaluations[prior.taxYear] ?? null),
      )
  } else {
    const evaluatedYears = Object.entries(evaluations).map(
      ([taxYear, evaluation]) => ({
        taxYear: taxYear as TaxYear,
        evaluation,
      }),
    )
    for (const evaluated of evaluatedYears)
      yearViews.push({
        taxYear: evaluated.taxYear,
        state: 'active',
        evaluation: evaluated.evaluation,
        openObligations:
          evaluated.evaluation.kind === 'supported'
            ? evaluated.evaluation.obligations
            : [],
        completed: [],
        needsReview: [],
      })
  }
  const openObligations = yearViews
    .flatMap((year) =>
      year.openObligations.map((obligation) => ({
        taxYear: year.taxYear,
        obligation,
      })),
    )
    .sort(sortOpen)
  const staleYear = yearViews.find(
    (year) =>
      year.state !== 'archived' && year.evaluation?.kind === 'stale-rules',
  )
  const next = staleYear ? null : (openObligations[0] ?? null)
  return {
    years: yearViews,
    openObligations,
    completedCount: yearViews.reduce(
      (total, year) => total + year.completed.length,
      0,
    ),
    openCount: openObligations.length,
    next,
    attention: staleYear
      ? { kind: 'rules-review', taxYear: staleYear.taxYear }
      : next
        ? { kind: 'next', item: next }
        : { kind: 'none' },
  }
}

export { TAX_YEAR }
