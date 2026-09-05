import type { Profile, ProfileGroup, UnsupportedFact } from '@/evaluation'
import type { Draft, DraftAmountKey, DraftError } from '@/routes/check/model'
import {
  amountKeys,
  blankDraft,
  completeDraft,
  creditTriggerMayApply,
  draftFromProfile,
  hasForeignClients,
  hasPlatformWork,
  isBusinessPath,
  isUnregisteredGst,
  validateDraftGroup,
} from '@/routes/check/model'

export type DraftOrigin =
  | { readonly kind: 'personal' }
  | { readonly kind: 'example' }
  | { readonly kind: 'saved-edit'; readonly baseWorkspaceRevision: number }

export type QuestionnaireSession =
  | {
      readonly kind: 'editing'
      readonly origin: DraftOrigin
      readonly draft: Draft
      readonly validationGroup: ProfileGroup | null
    }
  | {
      readonly kind: 'complete'
      readonly origin: DraftOrigin
      readonly draft: Draft
      readonly profile: Profile
    }
export type QuestionnaireState = QuestionnaireSession | null

type CascadeField =
  | 'path'
  | 'delivery'
  | 'clientKind'
  | 'gstKind'
  | 'gstStatus'
  | 'hasClientWorkSubcontractor'
  | 'unsupportedCertainty'
type IndependentField = Exclude<
  keyof Draft,
  CascadeField | 'amounts' | 'unsupportedFacts'
>
type FieldEvent = {
  [K in IndependentField]: {
    readonly type: 'field-changed'
    readonly field: K
    readonly value: Draft[K]
  }
}[IndependentField]
type CascadeEvent = {
  [K in CascadeField]: {
    readonly type: `${K}-changed`
    readonly value: Draft[K]
  }
}[CascadeField]
export type QuestionnaireEvent =
  | FieldEvent
  | CascadeEvent
  | {
      readonly type: 'amount-changed'
      readonly field: DraftAmountKey
      readonly value: string
    }
  | {
      readonly type: 'unsupported-fact-toggled'
      readonly fact: UnsupportedFact
      readonly checked: boolean
    }
  | {
      readonly type: 'start'
      readonly origin: DraftOrigin
      readonly draft?: Draft
    }
  | { readonly type: 'restore'; readonly session: QuestionnaireState }
  | { readonly type: 'continue-unsaved' }
  | { readonly type: 'start-over' }
  | { readonly type: 'clear' }
  | { readonly type: 'expose-validation'; readonly group: ProfileGroup }
  | { readonly type: 'clear-validation' }
  | { readonly type: 'complete'; readonly latestThresholdDate: string }
  | {
      readonly type: 'payment-replaced'
      readonly profile: Profile
      readonly latestThresholdDate: string
    }
export type QuestionnaireDispatch = (event: QuestionnaireEvent) => void

// Keep hidden answers out of both live sessions and Recovery envelopes.
export function clearInactiveDraft(draft: Draft): Draft {
  const next = { ...draft, amounts: { ...draft.amounts } }
  if (!draft.path) {
    next.pathConfirmed = ''
    for (const key of amountKeys.slice(0, 5)) next.amounts[key] = ''
  }
  if (!isBusinessPath(draft)) {
    next.notGoodsCarriage = ''
    next.notAgencyCommissionBrokerage = ''
    next.noChapterViiiCDeduction = ''
    next.fiveYearExclusion = ''
    next.amounts.qualifyingReceipts = ''
    next.amounts.otherReceipts = ''
  }
  for (const key of Object.keys(next) as (keyof Draft)[]) {
    if (
      (!hasPlatformWork(draft) && key.startsWith('platform')) ||
      (!hasForeignClients(draft) && key.startsWith('foreign'))
    ) {
      // All platform/foreign fields in Draft are string choices.
      Object.assign(next, { [key]: '' })
    }
  }
  if (draft.hasClientWorkSubcontractor !== 'no') next.contractorBoundary = ''
  if (!creditTriggerMayApply(draft)) next.ageSixtyOrOlder = ''
  if (draft.unsupportedCertainty !== 'selected') next.unsupportedFacts = []
  if (!isUnregisteredGst(draft)) {
    next.amounts.aggregateTurnover = ''
    next.turnoverComplete = ''
    next.compulsoryRegistration = ''
    next.thresholdLiabilityDate = ''
  }
  if (draft.gstKind !== 'registered') next.gstStatus = ''
  if (
    !isUnregisteredGst(draft) &&
    (draft.gstKind !== 'registered' || draft.gstStatus !== 'one-normal')
  )
    next.gstState = ''
  return next
}

export function restoreSession(
  draft: Draft,
  origin: DraftOrigin,
  latestThresholdDate: string,
): QuestionnaireSession {
  const cleaned = clearInactiveDraft(draft)
  const completed = completeDraft(cleaned, latestThresholdDate)
  return completed.valid
    ? { kind: 'complete', origin, draft: cleaned, profile: completed.profile }
    : { kind: 'editing', origin, draft: cleaned, validationGroup: null }
}

export function questionnaireErrors(
  state: QuestionnaireState,
  latestThresholdDate: string,
): readonly DraftError[] {
  if (state?.kind !== 'editing' || !state.validationGroup) return []
  const errors = validateDraftGroup(
    state.draft,
    state.validationGroup,
    latestThresholdDate,
  )
  if (errors.length) return errors
  const completed = completeDraft(state.draft, latestThresholdDate)
  return completed.valid
    ? []
    : completed.errors.filter(({ group }) => group === state.validationGroup)
}

export function questionnaireReducer(
  state: QuestionnaireState,
  event: QuestionnaireEvent,
): QuestionnaireState {
  if (event.type === 'start')
    return {
      kind: 'editing',
      origin: event.origin,
      draft: clearInactiveDraft(event.draft ?? blankDraft()),
      validationGroup: null,
    }
  if (event.type === 'restore') return event.session
  if (event.type === 'clear') return null
  if (event.type === 'start-over')
    return {
      kind: 'editing',
      origin: { kind: 'personal' },
      draft: blankDraft(),
      validationGroup: null,
    }
  if (!state) return state
  if (event.type === 'continue-unsaved')
    return { ...state, origin: { kind: 'personal' } }
  if (event.type === 'expose-validation')
    return {
      kind: 'editing',
      origin: state.origin,
      draft: state.draft,
      validationGroup: event.group,
    }
  if (event.type === 'clear-validation')
    return state.kind === 'editing'
      ? { ...state, validationGroup: null }
      : state
  if (event.type === 'complete') {
    const result = completeDraft(state.draft, event.latestThresholdDate)
    return result.valid
      ? {
          kind: 'complete',
          origin: state.origin,
          draft: state.draft,
          profile: result.profile,
        }
      : {
          kind: 'editing',
          origin: state.origin,
          draft: state.draft,
          validationGroup: result.errors[0]?.group ?? 'review',
        }
  }
  if (event.type === 'payment-replaced') {
    if (state.kind !== 'complete') return state
    const draft = {
      ...state.draft,
      amounts: {
        ...state.draft.amounts,
        advanceTaxPaid:
          event.profile.otherIncome.advanceTaxPaid.toLocaleString('en-IN'),
      },
    }
    const result = completeDraft(draft, event.latestThresholdDate)
    if (
      !result.valid ||
      JSON.stringify(result.profile) !== JSON.stringify(event.profile)
    )
      return state
    return { ...state, draft, profile: result.profile }
  }
  const draft = state.draft
  let next: Draft
  switch (event.type) {
    case 'field-changed':
      if (draft[event.field] === event.value) return state
      next = { ...draft, [event.field]: event.value }
      break
    case 'amount-changed':
      if (draft.amounts[event.field] === event.value) return state
      next = {
        ...draft,
        amounts: { ...draft.amounts, [event.field]: event.value },
      }
      break
    case 'path-changed':
      if (draft.path === event.value) return state
      next = {
        ...draft,
        path: event.value,
        pathConfirmed: '',
        notGoodsCarriage: '',
        notAgencyCommissionBrokerage: '',
        noChapterViiiCDeduction: '',
        fiveYearExclusion: '',
        amounts: {
          ...draft.amounts,
          grossReceipts: '',
          cashReceipts: '',
          declaredProfit: '',
          qualifyingReceipts: '',
          otherReceipts: '',
        },
      }
      break
    case 'gstKind-changed':
      if (draft.gstKind === event.value) return state
      next = {
        ...draft,
        gstKind: event.value,
        gstStatus: '',
        gstState: '',
        turnoverComplete: '',
        compulsoryRegistration: '',
        thresholdLiabilityDate: '',
        amounts: { ...draft.amounts, aggregateTurnover: '' },
      }
      break
    case 'delivery-changed':
      next = { ...draft, delivery: event.value }
      break
    case 'clientKind-changed':
      next = { ...draft, clientKind: event.value }
      break
    case 'gstStatus-changed':
      next = { ...draft, gstStatus: event.value }
      break
    case 'hasClientWorkSubcontractor-changed':
      next = { ...draft, hasClientWorkSubcontractor: event.value }
      break
    case 'unsupportedCertainty-changed':
      next = { ...draft, unsupportedCertainty: event.value }
      break
    case 'unsupported-fact-toggled': {
      const unsupportedFacts = event.checked
        ? [...new Set([...draft.unsupportedFacts, event.fact])]
        : draft.unsupportedFacts.filter((fact) => fact !== event.fact)
      next = {
        ...draft,
        unsupportedFacts,
        unsupportedCertainty: unsupportedFacts.length ? 'selected' : '',
      }
      break
    }
    default: {
      const unreachable: never = event
      return unreachable
    }
  }
  const cleaned = clearInactiveDraft(next)
  if (JSON.stringify(cleaned) === JSON.stringify(draft)) return state
  return {
    kind: 'editing',
    origin: state.origin,
    draft: cleaned,
    validationGroup: state.kind === 'editing' ? state.validationGroup : null,
  }
}

export function sessionFromProfile(
  profile: Profile,
  origin: DraftOrigin,
  latestThresholdDate: string,
) {
  return restoreSession(draftFromProfile(profile), origin, latestThresholdDate)
}
