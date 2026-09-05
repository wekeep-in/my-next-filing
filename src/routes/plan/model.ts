import { evaluate, parseProfile } from '@/evaluation'
import type { EvaluationResult, Obligation, Profile } from '@/evaluation'
import type { RuleDataset } from '@/rules'
import type { QuestionnaireState } from '@/routes/check/session'
import { parseMoney } from '@/routes/check/model'
import { deriveWorkspaceView } from '@/workspace'
import type {
  CompletionRecord,
  LoadSavedWorkspaceResult,
  SavedWorkspace,
  WorkspaceView,
} from '@/workspace'

type CompleteSession = Extract<
  NonNullable<QuestionnaireState>,
  { readonly kind: 'complete' }
>
export type PlanSource =
  | { readonly kind: 'missing' }
  | { readonly kind: 'deleted' }
  | { readonly kind: 'transient'; readonly session: CompleteSession }
  | { readonly kind: 'workspace'; readonly workspace: SavedWorkspace }
  | {
      readonly kind: 'saved-data-unavailable'
      readonly reason: Exclude<
        LoadSavedWorkspaceResult['kind'],
        'ready' | 'absent'
      >
    }

export function sessionMatchesWorkspace(
  session: QuestionnaireState,
  workspace: LoadSavedWorkspaceResult,
): boolean {
  return (
    session?.kind === 'complete' &&
    session.origin.kind !== 'example' &&
    workspace.kind === 'ready' &&
    workspace.workspace.active?.completions.length === 0 &&
    workspace.workspace.priorYears.length === 0 &&
    JSON.stringify(session.profile) ===
      JSON.stringify(workspace.workspace.active.profile)
  )
}

export function selectPlanSource(
  session: QuestionnaireState,
  workspace: LoadSavedWorkspaceResult,
  selected: boolean,
  deleted: boolean,
): PlanSource {
  if (session?.origin.kind === 'example')
    return session.kind === 'complete'
      ? { kind: 'transient', session }
      : { kind: 'missing' }
  if (!selected && session)
    return session.kind === 'complete'
      ? { kind: 'transient', session }
      : { kind: 'missing' }
  if (workspace.kind === 'ready')
    return { kind: 'workspace', workspace: workspace.workspace }
  if (workspace.kind !== 'absent')
    return { kind: 'saved-data-unavailable', reason: workspace.kind }
  return { kind: deleted ? 'deleted' : 'missing' }
}

type MissingPlanModel = { readonly kind: 'missing' }
type DeletedPlanModel = { readonly kind: 'deleted' }
type SavedDataUnavailablePlanModel = Extract<
  PlanSource,
  { readonly kind: 'saved-data-unavailable' }
>
type StalePlanModel = {
  readonly kind: 'stale'
  readonly profile: Profile
  readonly evaluation: Extract<
    EvaluationResult,
    { readonly kind: 'stale-rules' }
  >
}
type UnsupportedPlanModel = {
  readonly kind: 'unsupported'
  readonly profile: Profile
  readonly evaluation: Extract<
    EvaluationResult,
    { readonly kind: 'unsupported' }
  >
}
export type SupportedPlanModel = {
  readonly kind: 'supported'
  readonly profile: Profile
  readonly evaluation: Extract<EvaluationResult, { readonly kind: 'supported' }>
  readonly workspaceView: WorkspaceView
  readonly next: Obligation | null
  readonly completions: readonly CompletionRecord[]
  readonly saved: boolean
  readonly example: boolean
  readonly canSave: boolean
  readonly canSaveChanges: boolean
}
export type PlanModel =
  | MissingPlanModel
  | DeletedPlanModel
  | SavedDataUnavailablePlanModel
  | StalePlanModel
  | UnsupportedPlanModel
  | SupportedPlanModel

export function derivePlanModel(
  source: PlanSource,
  now: Date,
  rules: RuleDataset,
  workspace: LoadSavedWorkspaceResult,
): PlanModel {
  if (
    source.kind === 'missing' ||
    source.kind === 'deleted' ||
    source.kind === 'saved-data-unavailable'
  )
    return source
  const profile =
    source.kind === 'transient'
      ? source.session.profile
      : source.workspace.active?.profile
  if (!profile) return { kind: 'missing' }
  const evaluation = evaluate(profile, now, rules)
  if (evaluation.kind === 'stale-rules')
    return { kind: 'stale', profile, evaluation }
  if (evaluation.kind === 'unsupported')
    return { kind: 'unsupported', profile, evaluation }
  const saved = source.kind === 'workspace'
  const example =
    source.kind === 'transient' && source.session.origin.kind === 'example'
  const evaluations: Record<string, EvaluationResult> = {
    [profile.taxYear]: evaluation,
  }
  if (source.kind === 'workspace') {
    for (const year of source.workspace.priorYears)
      if (year.state === 'open')
        evaluations[year.taxYear] = evaluate(year.profile, now, rules)
  }
  const workspaceView = deriveWorkspaceView(
    source.kind === 'workspace' ? source.workspace : null,
    evaluations,
  )
  return {
    kind: 'supported',
    profile,
    evaluation,
    workspaceView,
    next: workspaceView.next?.obligation ?? null,
    completions:
      source.kind === 'workspace'
        ? (source.workspace.active?.completions ?? [])
        : [],
    saved,
    example,
    canSave:
      !example &&
      source.kind === 'transient' &&
      source.session.origin.kind === 'personal' &&
      workspace.kind === 'absent',
    canSaveChanges:
      source.kind === 'transient' &&
      source.session.origin.kind === 'saved-edit' &&
      workspace.kind === 'ready' &&
      source.session.origin.baseWorkspaceRevision ===
        workspace.workspace.revision,
  }
}

export function preparePayment(
  profile: Profile,
  raw: string,
  now: Date,
  rules: RuleDataset,
):
  | { readonly kind: 'valid'; readonly profile: Profile }
  | { readonly kind: 'invalid' | 'unsupported' | 'stale' } {
  const amount = parseMoney(raw)
  if ('error' in amount) return { kind: 'invalid' }
  const parsed = parseProfile({
    ...profile,
    otherIncome: { ...profile.otherIncome, advanceTaxPaid: amount.value },
  })
  if (!parsed.valid) return { kind: 'invalid' }
  const result = evaluate(parsed.profile, now, rules)
  return result.kind === 'supported'
    ? { kind: 'valid', profile: parsed.profile }
    : { kind: result.kind === 'stale-rules' ? 'stale' : 'unsupported' }
}

export function updateCompletionRecords(
  records: readonly CompletionRecord[],
  obligationId: string,
  completedOn: CompletionRecord['completedOn'] | null,
): readonly CompletionRecord[] {
  const remaining = records.filter(
    (record) => record.obligationId !== obligationId,
  )
  return completedOn === null
    ? remaining
    : [...remaining, { obligationId, completedOn }]
}
