import { parseProfile } from '../evaluation/index.ts'
import type {
  EvaluationResult,
  Obligation,
  Profile,
} from '../evaluation/index.ts'
import { TAX_YEAR } from '../rules/index.ts'
import type { DateOnly, TaxYear } from '../rules/index.ts'

export const WORKSPACE_KEY = 'my-next-filing:workspace'
export const STORAGE_NOTICE_VERSION = 1 as const

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
  readonly schemaVersion: 1
  readonly revision: number
  readonly noticeVersion: 1
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
  | { readonly kind: 'deleted' }
  | { readonly kind: 'absent' }
  | { readonly kind: 'conflict'; readonly reason: 'stored-value-changed' }
  | { readonly kind: 'unavailable'; readonly reason: 'storage-unavailable' }

export type EvaluatedYear = {
  readonly taxYear: TaxYear
  readonly evaluation: EvaluationResult
}

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
    /^(?:advance-tax|annual-return|gst-registration):(Tax Year \d{4}-\d{2})$/.exec(
      value,
    )
  if (!match) return false
  return isTaxYear(match[1]) && (!taxYear || match[1] === taxYear)
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

function validPriorRecord(value: unknown, today: DateOnly) {
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
    value.schemaVersion !== 1 ||
    !isSafeInteger(value.revision) ||
    value.noticeVersion !== STORAGE_NOTICE_VERSION ||
    !isIsoTimestamp(value.consentDecidedAt) ||
    !isTaxYear(value.activeTaxYear) ||
    !Array.isArray(value.priorYears) ||
    !isIsoTimestamp(value.updatedAt)
  )
    return null
  if (
    value.active !== null &&
    !validSavedRecord(value.active, value.activeTaxYear, today)
  )
    return null
  if (value.active === null && value.priorYears.length === 0) return null
  const years = new Set<string>([value.activeTaxYear])
  for (const prior of value.priorYears) {
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

function todayInIndia(now = new Date()): DateOnly {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}` as DateOnly
}

function readWorkspace(storage: Storage, today: DateOnly) {
  const raw = storage.getItem(WORKSPACE_KEY)
  if (raw === null) return { kind: 'absent' as const }
  try {
    const workspace = decodeWorkspace(JSON.parse(raw) as unknown, today)
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
    const result = readWorkspace(storage, todayInIndia(now))
    return result.kind === 'ready'
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
): SavedWorkspace {
  return {
    schemaVersion: 1,
    revision,
    noticeVersion: STORAGE_NOTICE_VERSION,
    consentDecidedAt: draft.consentDecidedAt,
    activeTaxYear: draft.activeTaxYear,
    active: draft.active,
    priorYears: draft.priorYears,
    updatedAt: new Date().toISOString(),
  }
}

export function saveSavedWorkspace(
  storage: Storage,
  expectedRevision: number | null,
  draft: SavedWorkspaceDraft,
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
    const today = todayInIndia()
    const current = readWorkspace(storage, today)
    if (current.kind === 'invalid')
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
    )
    if (!decodeWorkspace(next, today))
      return { kind: 'invalid', reason: 'workspace-invalid' }
    const latest = readWorkspace(storage, today)
    if (latest.kind === 'invalid')
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
): StorageDeleteResult {
  try {
    const raw = storage.getItem(WORKSPACE_KEY)
    if (raw === null) return { kind: 'absent' }
    let current: SavedWorkspace | null = null
    try {
      current = decodeWorkspace(JSON.parse(raw) as unknown, todayInIndia())
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
    storage.removeItem(WORKSPACE_KEY)
    if (storage.getItem(WORKSPACE_KEY) !== null)
      return { kind: 'unavailable', reason: 'storage-unavailable' }
    return { kind: 'deleted' }
  } catch {
    return { kind: 'unavailable', reason: 'storage-unavailable' }
  }
}

function isEvaluatedYearList(
  value: readonly EvaluatedYear[] | Readonly<Record<string, EvaluationResult>>,
): value is readonly EvaluatedYear[] {
  return Array.isArray(value)
}

function evaluationFor(
  year: TaxYear,
  evaluations:
    | readonly EvaluatedYear[]
    | Readonly<Record<string, EvaluationResult>>,
) {
  if (isEvaluatedYearList(evaluations))
    return (
      evaluations.find((candidate) => candidate.taxYear === year)?.evaluation ??
      null
    )
  return evaluations[year] ?? null
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
  if (!evaluation || evaluation.kind !== 'supported') {
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
            ? 'Current Rules need review before this record can be matched.'
            : 'The current result cannot reproduce this Completion record.',
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
    const needsPaymentReconciliation =
      obligation.kind === 'advance-tax' &&
      obligation.amountDue !== null &&
      obligation.amountDue > 0
    if (completion && !needsPaymentReconciliation)
      completed.push({ kind: 'complete', record: completion, obligation })
    else openObligations.push(obligation)
  }
  const needsReview = record.completions
    .filter(
      (completion) =>
        !obligations.some(
          (obligation) => obligation.id === completion.obligationId,
        ) ||
        (obligations.find(
          (obligation) => obligation.id === completion.obligationId,
        )?.kind === 'advance-tax' &&
          (obligations.find(
            (obligation) => obligation.id === completion.obligationId,
          )?.amountDue ?? 0) > 0),
    )
    .map((completion) => ({
      kind: 'needs-review' as const,
      record: completion,
      reason:
        'The current Obligation or its payment reconciliation no longer matches this declaration.',
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
  evaluations:
    | readonly EvaluatedYear[]
    | Readonly<Record<string, EvaluationResult>>,
  currentIndiaDate: DateOnly,
): WorkspaceView {
  void currentIndiaDate
  const yearViews: WorkspaceYearView[] = []
  if (savedWorkspace) {
    const activeEvaluation = savedWorkspace.active
      ? evaluationFor(savedWorkspace.active.profile.taxYear, evaluations)
      : null
    if (savedWorkspace.active)
      yearViews.push(
        currentYearView(savedWorkspace.active, 'active', activeEvaluation),
      )
    for (const prior of savedWorkspace.priorYears)
      yearViews.push(
        currentYearView(
          prior,
          prior.state,
          evaluationFor(prior.taxYear, evaluations),
        ),
      )
  } else {
    const evaluatedYears = isEvaluatedYearList(evaluations)
      ? evaluations
      : Object.entries(evaluations).map(([taxYear, evaluation]) => ({
          taxYear: taxYear as TaxYear,
          evaluation,
        }))
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
