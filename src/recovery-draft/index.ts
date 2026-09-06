import { deleteSavedWorkspace } from '@/workspace'
import type { StorageDeleteResult } from '@/workspace'
import { TAX_YEAR } from '@/rules'
import type { TaxYear } from '@/rules'
import type { Draft } from '@/routes/check/model'
import {
  activityOptions,
  additionalIncomeKeys,
  amountKeys,
  blankDraft,
  blankGstCalendarFields,
  statesAndUnionTerritories,
  unsupportedFactLabels,
} from '@/routes/check/model'
import type { QuestionnaireState } from '@/routes/check/session'
import { clearInactiveDraft } from '@/routes/check/session'

export const RECOVERY_KEY = 'my-next-filing:recovery-draft'
export type RecoveryDraftEnvelope = {
  readonly schemaVersion: 4
  readonly taxYear: TaxYear
  readonly origin: 'personal' | 'saved-edit'
  readonly baseWorkspaceRevision: number | null
  readonly draft: Draft
}
const triState = ['', 'yes', 'no', 'not-sure'] as const
const choices = {
  personKind: ['', 'individual', 'not-individual', 'not-sure'],
  adult: triState,
  residence: [
    '',
    'resident-ordinarily-resident',
    'resident-not-ordinarily-resident',
    'non-resident',
    'not-sure',
  ],
  taxRegime: ['', 'new', 'old', 'not-sure'],
  onePractice: triState,
  setupInIndia: triState,
  workInIndia: triState,
  hasPartner: triState,
  hasEmployee: triState,
  hasForeignOperation: triState,
  hasClientWorkSubcontractor: triState,
  contractorBoundary: ['', 'none', 'incidental-domestic', 'not-sure'],
  activity: ['', ...activityOptions.map(({ value }) => value)],
  path: ['', 'specified-profession', 'eligible-business'],
  pathConfirmed: triState,
  notGoodsCarriage: triState,
  notAgencyCommissionBrokerage: triState,
  noChapterViiiCDeduction: triState,
  fiveYearExclusion: ['', 'none', 'applies', 'not-sure'],
  clientKind: ['', 'domestic', 'foreign', 'mixed', 'not-sure'],
  delivery: ['', 'direct', 'platform', 'both', 'not-sure'],
  platformOwnAccount: triState,
  platformRecipientIdentifiable: triState,
  platformGrossBeforeFees: triState,
  platformIncomeCharacter: triState,
  platformForeignFeeGstTreatment: ['', 'not-applicable', 'known', 'not-sure'],
  platformNoRecipientReverseCharge: triState,
  foreignWorkInIndia: triState,
  foreignRecipientIdentifiable: triState,
  foreignOwnAccount: triState,
  foreignPlaceOfSupply: triState,
  foreignSameEstablishment: triState,
  foreignPaymentRoute: [
    '',
    'convertible-foreign-exchange',
    'rbi-permitted-rupee',
    'not-sure',
  ],
  foreignSettledToIndianBank: triState,
  foreignAccountExposure: ['', 'none', 'possible', 'not-sure'],
  foreignOperation: triState,
  foreignTax: triState,
  foreignTreatyRelief: triState,
  foreignReceiptsResolved: triState,
  foreignCurrencyResolved: triState,
  hasSalary: triState,
  salaryConfirmed: triState,
  hasAdditionalIncome: triState,
  additionalIncomeConfirmed: triState,
  ageSixtyOrOlder: triState,
  otherAnnualReturnTrigger: triState,
  unsupportedCertainty: ['', 'none', 'selected', 'not-sure'],
  gstKind: ['', 'unregistered', 'registered', 'not-sure'],
  gstStatus: ['', 'one-normal', 'other', 'not-sure'],
  gstState: ['', ...statesAndUnionTerritories],
  gstContinuous: triState,
  gstQuarter1: ['', 'monthly', 'qrmp', 'not-sure'],
  gstQuarter2: ['', 'monthly', 'qrmp', 'not-sure'],
  gstQuarter3: ['', 'monthly', 'qrmp', 'not-sure'],
  gstQuarter4: ['', 'monthly', 'qrmp', 'not-sure'],
  gstExportRoute: ['', 'none', 'lut', 'igst', 'other', 'not-sure'],
  gstLutConfirmed: triState,
  turnoverComplete: triState,
  compulsoryRegistration: triState,
} satisfies {
  readonly [
    K in Exclude<
      keyof Draft,
      | 'amounts'
      | 'unsupportedFacts'
      | 'thresholdLiabilityDate'
      | 'gstRegisteredFrom'
      | 'gstFirstExportDate'
    >
  ]: readonly Draft[K][]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const exactKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key))

export function parseRecoveryDraft(
  value: unknown,
  taxYear: TaxYear,
): RecoveryDraftEnvelope | null {
  try {
    if (isRecord(value) && value.schemaVersion === 3) {
      const draft = value.draft
      if (
        !isRecord(draft) ||
        !isRecord(draft.amounts) ||
        Object.hasOwn(draft, 'hasAdditionalIncome') ||
        Object.hasOwn(draft, 'additionalIncomeConfirmed') ||
        additionalIncomeKeys.some((key) =>
          Object.hasOwn(draft.amounts as object, key),
        )
      )
        return null
      return parseRecoveryDraft(
        {
          ...value,
          schemaVersion: 4,
          draft: {
            ...draft,
            hasAdditionalIncome: '',
            additionalIncomeConfirmed: '',
            amounts: {
              ...draft.amounts,
              ...Object.fromEntries(
                additionalIncomeKeys.map((key) => [key, '']),
              ),
            },
          },
        },
        taxYear,
      )
    }
    if (isRecord(value) && value.schemaVersion === 2) {
      if (
        !isRecord(value.draft) ||
        Object.keys(blankGstCalendarFields).some((key) =>
          Object.hasOwn(value.draft as object, key),
        )
      )
        return null
      return parseRecoveryDraft(
        {
          ...value,
          schemaVersion: 3,
          draft: { ...blankGstCalendarFields, ...value.draft },
        },
        taxYear,
      )
    }
    if (isRecord(value) && value.schemaVersion === 1) {
      const draft = value.draft
      if (
        !isRecord(draft) ||
        !isRecord(draft.amounts) ||
        Object.hasOwn(draft, 'hasSalary') ||
        Object.hasOwn(draft, 'salaryConfirmed') ||
        Object.hasOwn(draft.amounts, 'grossSalary')
      )
        return null
      return parseRecoveryDraft(
        {
          ...value,
          schemaVersion: 2,
          draft: {
            ...draft,
            hasSalary: '',
            salaryConfirmed: '',
            amounts: { ...draft.amounts, grossSalary: '' },
          },
        },
        taxYear,
      )
    }
    if (
      !isRecord(value) ||
      !exactKeys(value, [
        'schemaVersion',
        'taxYear',
        'origin',
        'baseWorkspaceRevision',
        'draft',
      ]) ||
      value.schemaVersion !== 4 ||
      value.taxYear !== taxYear
    )
      return null
    if (value.origin !== 'personal' && value.origin !== 'saved-edit')
      return null
    if (
      value.origin === 'personal'
        ? value.baseWorkspaceRevision !== null
        : typeof value.baseWorkspaceRevision !== 'number' ||
          !Number.isSafeInteger(value.baseWorkspaceRevision) ||
          value.baseWorkspaceRevision < 0
    )
      return null
    const draft = value.draft
    if (!isRecord(draft) || !exactKeys(draft, Object.keys(blankDraft())))
      return null
    for (const [key, allowed] of Object.entries(choices)) {
      if (
        typeof draft[key] !== 'string' ||
        !(allowed as readonly string[]).includes(draft[key])
      )
        return null
    }
    const amounts = draft.amounts
    if (
      !isRecord(amounts) ||
      !exactKeys(amounts, amountKeys) ||
      !amountKeys.every(
        (key) => typeof amounts[key] === 'string' && amounts[key].length <= 32,
      )
    )
      return null
    for (const key of [
      'thresholdLiabilityDate',
      'gstRegisteredFrom',
      'gstFirstExportDate',
    ])
      if (
        typeof draft[key] !== 'string' ||
        (draft[key] !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(draft[key]))
      )
        return null
    const facts = draft.unsupportedFacts
    if (
      !Array.isArray(facts) ||
      new Set(facts).size !== facts.length ||
      !facts.every(
        (fact: unknown) =>
          typeof fact === 'string' &&
          fact !== 'unsupportedFactsNotSure' &&
          Object.hasOwn(unsupportedFactLabels, fact),
      )
    )
      return null
    if ((draft.unsupportedCertainty === 'selected') !== facts.length > 0)
      return null
    const parsed = draft as Draft
    if (JSON.stringify(clearInactiveDraft(parsed)) !== JSON.stringify(parsed))
      return null
    return {
      schemaVersion: 4,
      taxYear,
      origin: value.origin,
      baseWorkspaceRevision: value.baseWorkspaceRevision as number | null,
      draft: parsed,
    }
  } catch {
    return null
  }
}

export type RecoveryDeleteResult = {
  readonly kind:
    | 'deleted'
    | 'absent'
    | 'deletion-failed'
    | 'deletion-unverified'
    | 'conflict'
    | 'unavailable'
}
export type LoadRecoveryDraftResult =
  | { readonly kind: 'ready'; readonly value: RecoveryDraftEnvelope }
  | {
      readonly kind:
        | 'absent'
        | 'invalid-removed'
        | 'invalid-removal-failed'
        | 'deletion-unverified'
        | 'unavailable'
    }
export type RecoveryWriteResult =
  | {
      readonly kind: 'saved' | 'unchanged'
      readonly value: RecoveryDraftEnvelope
    }
  | { readonly kind: 'invalid' | 'unavailable' }

export function deleteRecoveryDraft(
  storage: Storage,
  expectedRaw?: string,
): RecoveryDeleteResult {
  try {
    const before = storage.getItem(RECOVERY_KEY)
    if (before === null) return { kind: 'absent' }
    if (expectedRaw !== undefined && before !== expectedRaw)
      return { kind: 'conflict' }
    if (storage.getItem(RECOVERY_KEY) !== before) return { kind: 'conflict' }
    try {
      storage.removeItem(RECOVERY_KEY)
    } catch {
      /* Readback determines whether removal happened. */
    }
    try {
      const after = storage.getItem(RECOVERY_KEY)
      return {
        kind:
          after === null
            ? 'deleted'
            : after === before
              ? 'deletion-failed'
              : 'conflict',
      }
    } catch {
      return { kind: 'deletion-unverified' }
    }
  } catch {
    return { kind: 'unavailable' }
  }
}

export function loadRecoveryDraft(
  storage: Storage,
  taxYear: TaxYear,
): LoadRecoveryDraftResult {
  try {
    const raw = storage.getItem(RECOVERY_KEY)
    if (raw === null) return { kind: 'absent' }
    let value: RecoveryDraftEnvelope | null = null
    try {
      value = parseRecoveryDraft(JSON.parse(raw) as unknown, taxYear)
    } catch {
      /* Invalid JSON follows exact-key removal. */
    }
    if (value) return { kind: 'ready', value }
    const removed = deleteRecoveryDraft(storage, raw)
    return {
      kind:
        removed.kind === 'deleted' || removed.kind === 'absent'
          ? 'invalid-removed'
          : removed.kind === 'deletion-unverified'
            ? 'deletion-unverified'
            : 'invalid-removal-failed',
    }
  } catch {
    return { kind: 'unavailable' }
  }
}

export function saveRecoveryDraft(
  storage: Storage,
  value: RecoveryDraftEnvelope,
): RecoveryWriteResult {
  const parsed = parseRecoveryDraft(value, TAX_YEAR)
  if (!parsed) return { kind: 'invalid' }
  try {
    const serialized = JSON.stringify(parsed)
    const current = storage.getItem(RECOVERY_KEY)
    if (current === serialized) return { kind: 'unchanged', value: parsed }
    if (current !== null) {
      try {
        if (!parseRecoveryDraft(JSON.parse(current) as unknown, value.taxYear))
          return { kind: 'invalid' }
      } catch {
        return { kind: 'invalid' }
      }
    }
    storage.setItem(RECOVERY_KEY, serialized)
    return storage.getItem(RECOVERY_KEY) === serialized
      ? { kind: 'saved', value: parsed }
      : { kind: 'unavailable' }
  } catch {
    return { kind: 'unavailable' }
  }
}

export function recoveryFromSession(
  session: QuestionnaireState,
  taxYear: TaxYear,
): RecoveryDraftEnvelope | null {
  if (!session || session.origin.kind === 'example') return null
  return {
    schemaVersion: 4,
    taxYear,
    origin: session.origin.kind,
    baseWorkspaceRevision:
      session.origin.kind === 'saved-edit'
        ? session.origin.baseWorkspaceRevision
        : null,
    draft: session.draft,
  }
}

export type BrowserDeleteResult =
  | {
      readonly kind: 'complete' | 'partial'
      readonly workspace: StorageDeleteResult
      readonly recovery: RecoveryDeleteResult
    }
  | {
      readonly kind: 'failed' | 'unverified'
      readonly workspace: StorageDeleteResult
      readonly recovery: null
    }

export function deleteBrowserData(
  local: Storage | null,
  session: Storage | null,
  expectedRevision: number | null,
  now: Date,
): BrowserDeleteResult {
  const workspace: StorageDeleteResult = local
    ? deleteSavedWorkspace(local, expectedRevision, now)
    : { kind: 'unavailable', reason: 'storage-unavailable' }
  if (workspace.kind !== 'deleted' && workspace.kind !== 'absent')
    return {
      kind: workspace.kind === 'deletion-unverified' ? 'unverified' : 'failed',
      workspace,
      recovery: null,
    }
  const recovery: RecoveryDeleteResult = session
    ? deleteRecoveryDraft(session)
    : { kind: 'unavailable' }
  return {
    kind:
      recovery.kind === 'deleted' || recovery.kind === 'absent'
        ? 'complete'
        : 'partial',
    workspace,
    recovery,
  }
}
