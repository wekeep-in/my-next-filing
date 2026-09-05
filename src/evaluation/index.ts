import { indiaDate } from '@/lib/india-date'
import { TAX_YEAR, currentRules, validateRules } from '@/rules'
import type {
  AnnualReturnRules,
  CommonIncomeTaxRules,
  DateOnly,
  ForeignGuidanceRules,
  IncomePathRules,
  RuleDataset,
  TaxYear,
} from '@/rules'

export type TriState = 'yes' | 'no' | 'not-sure'

export type ProfileGroup =
  | 'tax-year'
  | 'activity'
  | 'receipts'
  | 'clients'
  | 'other-income'
  | 'gst'
  | 'review'

export type Activity =
  | 'software-development'
  | 'technical-consultancy'
  | 'design'
  | 'writing-content'
  | 'marketing-advertising'
  | 'other-digital-service'
  | 'not-sure'

const unsupportedFactLabels = {
  salary: 'Salary income',
  houseProperty: 'House-property income',
  dividendsOrGifts: 'Dividend or gift income',
  capitalGains: 'Capital gains',
  cryptoLotteryGaming: 'Crypto, lottery, or gaming income',
  agriculturalIncome: 'Agricultural income',
  unrelatedForeignIncome: 'Unrelated foreign-source income',
  foreignAssets: 'A foreign asset or financial interest',
  foreignTaxOrRelief: 'Foreign tax or foreign-tax relief',
  deductionsLossesOrSpecialRate:
    'A deduction, loss, or special-rate item this version does not cover',
  disputedCredit: 'A disputed TDS or TCS credit',
  anotherBusinessOrProfession: 'Another business or profession',
  employeesOrDeductorDuties: 'Employees or deductor filing duties',
  auditRequirement: 'An audit requirement under tax law or another law',
  surchargeCase: 'A surcharge case',
  goodsSales: 'Goods sales',
  agencyCommissionBrokerage: 'Agency, commission, or brokerage income',
  royaltyOrLicensing: 'Royalty or licensing income',
  otherUnsupportedFacts: 'Another income or tax situation not listed',
  unsupportedFactsNotSure: 'Unsupported situations not confirmed',
} as const

export type UnsupportedFact = keyof typeof unsupportedFactLabels

export type SpecifiedProfessionalPath = {
  readonly kind: 'specified-profession'
  readonly confirmed: TriState
  readonly grossReceipts: number
  readonly cashReceipts: number
  readonly declaredProfit: number
}

export type EligibleBusinessPath = {
  readonly kind: 'eligible-business'
  readonly confirmed: TriState
  readonly grossReceipts: number
  readonly qualifyingReceipts: number
  readonly otherReceipts: number
  readonly cashReceipts: number
  readonly declaredProfit: number
  readonly notSpecifiedProfession: TriState
  readonly notGoodsCarriage: TriState
  readonly notAgencyCommissionBrokerage: TriState
  readonly noChapterViiiCDeduction: TriState
  readonly fiveYearExclusion: 'none' | 'applies' | 'not-sure'
}

export type IncomePath = SpecifiedProfessionalPath | EligibleBusinessPath

export type PlatformFacts = {
  readonly ownAccount: TriState
  readonly recipientIdentifiable: TriState
  readonly grossBeforeFees: TriState
  readonly notEmploymentCommissionBrokerageRoyaltyLicensingAgency: TriState
  readonly foreignFeeGstTreatment: 'not-applicable' | 'known' | 'not-sure'
  readonly noRecipientReverseCharge: TriState
}

export type ForeignFacts = {
  readonly workPerformedInIndia: TriState
  readonly recipientIdentifiable: TriState
  readonly ownAccount: TriState
  readonly ordinaryPlaceOfSupply: TriState
  readonly sameEstablishment: TriState
  readonly paymentRoute:
    | 'convertible-foreign-exchange'
    | 'rbi-permitted-rupee'
    | 'not-sure'
  readonly settledToIndianBank: TriState
  readonly accountExposure: 'none' | 'possible' | 'not-sure'
  readonly foreignOperation: TriState
  readonly foreignTax: TriState
  readonly treatyRelief: TriState
  readonly receiptsResolved: TriState
  readonly currencyResolved: TriState
}

export type ClientProfile = {
  readonly kind: 'domestic' | 'foreign' | 'mixed' | 'not-sure'
  readonly delivery: 'direct' | 'platform' | 'both' | 'not-sure'
  readonly platform: PlatformFacts | null
  readonly foreign: ForeignFacts | null
}

export type UnregisteredGst = {
  readonly kind: 'unregistered'
  readonly state: string
  readonly aggregateTurnover: number
  readonly turnoverComplete: TriState
  readonly compulsoryRegistration: TriState
  readonly thresholdLiabilityDate: DateOnly | null
}

export type RegisteredGst = {
  readonly kind: 'registered'
  readonly status: 'one-normal' | 'other' | 'not-sure'
  readonly state: string | null
}

export type GstProfile = UnregisteredGst | RegisteredGst

export type Profile = {
  readonly taxYear: TaxYear
  readonly person: {
    readonly kind: 'individual' | 'not-individual' | 'not-sure'
    readonly adult: TriState
    readonly residence:
      | 'resident-ordinarily-resident'
      | 'resident-not-ordinarily-resident'
      | 'non-resident'
      | 'not-sure'
  }
  readonly taxRegime: 'new' | 'old' | 'not-sure'
  readonly practice: {
    readonly onePractice: TriState
    readonly setupInIndia: TriState
    readonly workInIndia: TriState
    readonly hasPartner: TriState
    readonly hasEmployee: TriState
    readonly hasForeignOperation: TriState
    readonly hasClientWorkSubcontractor: TriState
    readonly contractorBoundary: 'none' | 'incidental-domestic' | 'not-sure'
  }
  readonly activity: Activity
  readonly incomePath: IncomePath
  readonly clients: ClientProfile
  readonly otherIncome: {
    readonly taxableBankInterest: number
    readonly tds: number
    readonly tcs: number
    readonly advanceTaxPaid: number
    readonly ageSixtyOrOlder: TriState
    readonly otherAnnualReturnTrigger: TriState
  }
  readonly gst: GstProfile
  readonly unsupportedFacts: readonly UnsupportedFact[]
}

export type ProfileInputError = {
  readonly code: 'missing' | 'unknown-field' | 'invalid' | 'inconsistent'
  readonly path: string
  readonly group: ProfileGroup
  readonly message: string
}

export type ParseProfileResult =
  | { readonly valid: true; readonly kind: 'valid'; readonly profile: Profile }
  | {
      readonly valid: false
      readonly kind: 'invalid'
      readonly errors: readonly ProfileInputError[]
    }

export type DeadlineStatus = 'upcoming' | 'due-today' | 'deadline-passed'

export type ObligationKind =
  | 'advance-tax'
  | 'annual-return'
  | 'gst-registration'

export type Obligation = {
  readonly id: string
  readonly kind: ObligationKind
  readonly title: string
  readonly taxYear: TaxYear
  readonly normalDueDate: DateOnly
  readonly operativeDueDate: DateOnly | null
  readonly extensionSourceId: string | null
  readonly dueDate: DateOnly
  readonly deadlineStatus: DeadlineStatus
  readonly reasons: readonly string[]
  readonly consequence: string
  readonly amountDue: number | null
  readonly ruleIds: readonly string[]
  readonly statutorySourceIds: readonly string[]
  readonly tutorialSourceId: string | null
  readonly verifiedOn: DateOnly
  readonly expiresOn: DateOnly
}

export type ReviewAction = {
  readonly id: string
  readonly title: string
  readonly area: 'annual-return' | 'gst' | 'foreign-guidance' | 'advance-tax'
  readonly correctionGroup: ProfileGroup
  readonly reason: string
  readonly sourceIds: readonly string[]
}

export type CoverageUnavailable = {
  readonly kind: 'unavailable'
  readonly code: string
  readonly area: 'annual-return' | 'gst' | 'foreign-guidance'
  readonly reason: string
  readonly guidance: string
  readonly sourceIds: readonly string[]
}

export type CoverageAvailable<T> = {
  readonly kind: 'available'
  readonly value: T
  readonly sourceIds: readonly string[]
}

export type Coverage<T> = CoverageAvailable<T> | CoverageUnavailable

export type AnnualReturnConclusion = {
  readonly required: boolean
  readonly triggers: readonly string[]
  readonly normalDueDate: DateOnly
  readonly operativeDueDate: DateOnly | null
  readonly dueDate: DateOnly
  readonly formGuidance: 'unavailable'
}

export type GstConclusion = {
  readonly status: 'below' | 'at' | 'above'
  readonly threshold: number
  readonly difference: number
  readonly state: string
  readonly registrationRequired: boolean
}

export type ForeignGuidanceConclusion = {
  readonly status: 'no-foreign-receipts' | 'reviewed-note'
  readonly message: string
}

export type TaxEstimate = {
  readonly path: IncomePath['kind']
  readonly presumptive: {
    readonly grossReceipts: number
    readonly declaredProfit: number
    readonly minimumIncome: number
    readonly usedIncome: number
    readonly qualifyingReceipts: number | null
    readonly otherReceipts: number | null
  }
  readonly taxableBankInterest: number
  readonly roundedTotalIncome: number
  readonly slabTax: number
  readonly rebate: number
  readonly marginalRelief: number
  readonly taxAfterRelief: number
  readonly cess: number
  readonly grossTax: number
  readonly tds: number
  readonly tcs: number
  readonly estimatedAdvanceTaxLiability: number
  readonly advanceTaxPaid: number
  readonly outcome: 'payable' | 'refund' | 'settled'
  readonly finalAmount: number
}

export type SupportedResult = {
  readonly kind: 'supported'
  readonly tax: TaxEstimate
  readonly coverage: {
    readonly annualReturn: Coverage<AnnualReturnConclusion>
    readonly gst: Coverage<GstConclusion>
    readonly foreignGuidance: Coverage<ForeignGuidanceConclusion>
  }
  readonly obligations: readonly Obligation[]
  readonly reviewActions: readonly ReviewAction[]
  readonly assumptions: readonly string[]
  readonly explanations: readonly string[]
  readonly sourceIds: readonly string[]
}

export type UnsupportedResult = {
  readonly kind: 'unsupported'
  readonly facts: readonly {
    readonly code: string
    readonly area: 'profile' | 'income-tax' | 'annual-return' | 'gst'
    readonly correctionGroup: ProfileGroup
    readonly label: string
    readonly reason: string
    readonly sourceIds: readonly string[]
  }[]
  readonly sourceIds: readonly string[]
}

export type StaleRulesResult = {
  readonly kind: 'stale-rules'
  readonly expiresOn: DateOnly | null
  readonly errors: readonly string[]
  readonly affectedGroups: readonly string[]
  readonly sourceIds: readonly string[]
}

export type EvaluationResult =
  | SupportedResult
  | UnsupportedResult
  | StaleRulesResult

const triStates = ['yes', 'no', 'not-sure'] as const
const activities = [
  'software-development',
  'technical-consultancy',
  'design',
  'writing-content',
  'marketing-advertising',
  'other-digital-service',
  'not-sure',
] as const
const unsupportedFacts = Object.keys(unsupportedFactLabels) as UnsupportedFact[]
const isUnsupportedFact = (value: unknown): value is UnsupportedFact =>
  typeof value === 'string' &&
  unsupportedFacts.includes(value as UnsupportedFact)
const knownStates = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const

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

const isSafeAmount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

const tri = (value: unknown): value is TriState =>
  triStates.includes(value as TriState)

const addError = (
  errors: ProfileInputError[],
  code: ProfileInputError['code'],
  path: string,
  group: ProfileGroup,
  message: string,
) => errors.push({ code, path, group, message })

function checkObject(
  value: unknown,
  keys: readonly string[],
  path: string,
  group: ProfileGroup,
  errors: ProfileInputError[],
) {
  if (!isRecord(value)) {
    addError(errors, 'invalid', path, group, 'This group has an invalid shape.')
    return null
  }
  if (!exactKeys(value, keys))
    addError(
      errors,
      'unknown-field',
      path,
      group,
      'This group has unknown or missing fields.',
    )
  return value
}

function readTri(
  value: Record<string, unknown>,
  key: string,
  path: string,
  group: ProfileGroup,
  errors: ProfileInputError[],
): TriState {
  const result = value[key]
  if (!tri(result)) {
    addError(
      errors,
      'invalid',
      `${path}.${key}`,
      group,
      'Choose Yes, No, or Not sure.',
    )
    return 'not-sure'
  }
  return result
}

function readAmount(
  value: Record<string, unknown>,
  key: string,
  path: string,
  group: ProfileGroup,
  errors: ProfileInputError[],
): number {
  const result = value[key]
  if (!isSafeAmount(result)) {
    addError(
      errors,
      'invalid',
      `${path}.${key}`,
      group,
      'Use a non-negative whole-rupee amount.',
    )
    return 0
  }
  return result
}

function readText<T extends string>(
  value: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
  path: string,
  group: ProfileGroup,
  errors: ProfileInputError[],
): T {
  const result = value[key]
  if (typeof result !== 'string' || !allowed.includes(result as T)) {
    addError(
      errors,
      'invalid',
      `${path}.${key}`,
      group,
      'Choose a supported answer.',
    )
    return allowed[0]
  }
  return result as T
}

function parsePlatform(
  value: unknown,
  path: string,
  group: ProfileGroup,
  errors: ProfileInputError[],
): PlatformFacts | null {
  if (value === null) return null
  const record = checkObject(
    value,
    [
      'ownAccount',
      'recipientIdentifiable',
      'grossBeforeFees',
      'notEmploymentCommissionBrokerageRoyaltyLicensingAgency',
      'foreignFeeGstTreatment',
      'noRecipientReverseCharge',
    ],
    path,
    group,
    errors,
  )
  if (!record) return null
  const foreignFeeGstTreatment = readText(
    record,
    'foreignFeeGstTreatment',
    ['not-applicable', 'known', 'not-sure'],
    path,
    group,
    errors,
  )
  return {
    ownAccount: readTri(record, 'ownAccount', path, group, errors),
    recipientIdentifiable: readTri(
      record,
      'recipientIdentifiable',
      path,
      group,
      errors,
    ),
    grossBeforeFees: readTri(record, 'grossBeforeFees', path, group, errors),
    notEmploymentCommissionBrokerageRoyaltyLicensingAgency: readTri(
      record,
      'notEmploymentCommissionBrokerageRoyaltyLicensingAgency',
      path,
      group,
      errors,
    ),
    foreignFeeGstTreatment,
    noRecipientReverseCharge: readTri(
      record,
      'noRecipientReverseCharge',
      path,
      group,
      errors,
    ),
  }
}

function parseForeign(
  value: unknown,
  path: string,
  group: ProfileGroup,
  errors: ProfileInputError[],
): ForeignFacts | null {
  if (value === null) return null
  const record = checkObject(
    value,
    [
      'workPerformedInIndia',
      'recipientIdentifiable',
      'ownAccount',
      'ordinaryPlaceOfSupply',
      'sameEstablishment',
      'paymentRoute',
      'settledToIndianBank',
      'accountExposure',
      'foreignOperation',
      'foreignTax',
      'treatyRelief',
      'receiptsResolved',
      'currencyResolved',
    ],
    path,
    group,
    errors,
  )
  if (!record) return null
  return {
    workPerformedInIndia: readTri(
      record,
      'workPerformedInIndia',
      path,
      group,
      errors,
    ),
    recipientIdentifiable: readTri(
      record,
      'recipientIdentifiable',
      path,
      group,
      errors,
    ),
    ownAccount: readTri(record, 'ownAccount', path, group, errors),
    ordinaryPlaceOfSupply: readTri(
      record,
      'ordinaryPlaceOfSupply',
      path,
      group,
      errors,
    ),
    sameEstablishment: readTri(
      record,
      'sameEstablishment',
      path,
      group,
      errors,
    ),
    paymentRoute: readText(
      record,
      'paymentRoute',
      ['convertible-foreign-exchange', 'rbi-permitted-rupee', 'not-sure'],
      path,
      group,
      errors,
    ),
    settledToIndianBank: readTri(
      record,
      'settledToIndianBank',
      path,
      group,
      errors,
    ),
    accountExposure: readText(
      record,
      'accountExposure',
      ['none', 'possible', 'not-sure'],
      path,
      group,
      errors,
    ),
    foreignOperation: readTri(record, 'foreignOperation', path, group, errors),
    foreignTax: readTri(record, 'foreignTax', path, group, errors),
    treatyRelief: readTri(record, 'treatyRelief', path, group, errors),
    receiptsResolved: readTri(record, 'receiptsResolved', path, group, errors),
    currencyResolved: readTri(record, 'currencyResolved', path, group, errors),
  }
}

export function parseProfile(value: unknown): ParseProfileResult {
  const errors: ProfileInputError[] = []
  const root = checkObject(
    value,
    [
      'taxYear',
      'person',
      'taxRegime',
      'practice',
      'activity',
      'incomePath',
      'clients',
      'otherIncome',
      'gst',
      'unsupportedFacts',
    ],
    'profile',
    'review',
    errors,
  )
  if (!root) return { valid: false, kind: 'invalid', errors }
  const taxYear = isTaxYear(root.taxYear) ? root.taxYear : TAX_YEAR
  if (taxYear !== root.taxYear)
    addError(
      errors,
      'invalid',
      'taxYear',
      'tax-year',
      'Choose a complete Tax Year.',
    )

  const personRecord = checkObject(
    root.person,
    ['kind', 'adult', 'residence'],
    'person',
    'tax-year',
    errors,
  )
  const person = {
    kind: personRecord
      ? readText(
          personRecord,
          'kind',
          ['individual', 'not-individual', 'not-sure'],
          'person',
          'tax-year',
          errors,
        )
      : ('not-sure' as const),
    adult: personRecord
      ? readTri(personRecord, 'adult', 'person', 'tax-year', errors)
      : ('not-sure' as const),
    residence: personRecord
      ? readText(
          personRecord,
          'residence',
          [
            'resident-ordinarily-resident',
            'resident-not-ordinarily-resident',
            'non-resident',
            'not-sure',
          ],
          'person',
          'tax-year',
          errors,
        )
      : ('not-sure' as const),
  }

  const taxRegime = readText(
    root,
    'taxRegime',
    ['new', 'old', 'not-sure'],
    'profile',
    'tax-year',
    errors,
  )
  const practiceRecord = checkObject(
    root.practice,
    [
      'onePractice',
      'setupInIndia',
      'workInIndia',
      'hasPartner',
      'hasEmployee',
      'hasForeignOperation',
      'hasClientWorkSubcontractor',
      'contractorBoundary',
    ],
    'practice',
    'tax-year',
    errors,
  )
  const practice = {
    onePractice: practiceRecord
      ? readTri(practiceRecord, 'onePractice', 'practice', 'tax-year', errors)
      : ('not-sure' as const),
    setupInIndia: practiceRecord
      ? readTri(practiceRecord, 'setupInIndia', 'practice', 'tax-year', errors)
      : ('not-sure' as const),
    workInIndia: practiceRecord
      ? readTri(practiceRecord, 'workInIndia', 'practice', 'tax-year', errors)
      : ('not-sure' as const),
    hasPartner: practiceRecord
      ? readTri(practiceRecord, 'hasPartner', 'practice', 'tax-year', errors)
      : ('not-sure' as const),
    hasEmployee: practiceRecord
      ? readTri(practiceRecord, 'hasEmployee', 'practice', 'tax-year', errors)
      : ('not-sure' as const),
    hasForeignOperation: practiceRecord
      ? readTri(
          practiceRecord,
          'hasForeignOperation',
          'practice',
          'tax-year',
          errors,
        )
      : ('not-sure' as const),
    hasClientWorkSubcontractor: practiceRecord
      ? readTri(
          practiceRecord,
          'hasClientWorkSubcontractor',
          'practice',
          'tax-year',
          errors,
        )
      : ('not-sure' as const),
    contractorBoundary: practiceRecord
      ? readText(
          practiceRecord,
          'contractorBoundary',
          ['none', 'incidental-domestic', 'not-sure'],
          'practice',
          'tax-year',
          errors,
        )
      : ('not-sure' as const),
  }

  const activity = readText(
    root,
    'activity',
    activities,
    'profile',
    'activity',
    errors,
  )
  const pathRecord = isRecord(root.incomePath) ? root.incomePath : null
  if (!pathRecord)
    addError(
      errors,
      'invalid',
      'incomePath',
      'activity',
      'Choose one complete income path.',
    )
  const pathKind =
    pathRecord &&
    (pathRecord.kind === 'eligible-business' ||
      pathRecord.kind === 'specified-profession')
      ? pathRecord.kind
      : 'specified-profession'
  if (!pathRecord || pathRecord.kind !== pathKind)
    addError(
      errors,
      'invalid',
      'incomePath.kind',
      'activity',
      'Choose a supported income path.',
    )
  let incomePath: IncomePath
  if (pathKind === 'eligible-business') {
    const record =
      checkObject(
        pathRecord,
        [
          'kind',
          'confirmed',
          'grossReceipts',
          'qualifyingReceipts',
          'otherReceipts',
          'cashReceipts',
          'declaredProfit',
          'notSpecifiedProfession',
          'notGoodsCarriage',
          'notAgencyCommissionBrokerage',
          'noChapterViiiCDeduction',
          'fiveYearExclusion',
        ],
        'incomePath',
        'receipts',
        errors,
      ) ?? {}
    const fiveYearExclusion = readText(
      record,
      'fiveYearExclusion',
      ['none', 'applies', 'not-sure'],
      'incomePath',
      'receipts',
      errors,
    )
    incomePath = {
      kind: 'eligible-business',
      confirmed: readTri(record, 'confirmed', 'incomePath', 'receipts', errors),
      grossReceipts: readAmount(
        record,
        'grossReceipts',
        'incomePath',
        'receipts',
        errors,
      ),
      qualifyingReceipts: readAmount(
        record,
        'qualifyingReceipts',
        'incomePath',
        'receipts',
        errors,
      ),
      otherReceipts: readAmount(
        record,
        'otherReceipts',
        'incomePath',
        'receipts',
        errors,
      ),
      cashReceipts: readAmount(
        record,
        'cashReceipts',
        'incomePath',
        'receipts',
        errors,
      ),
      declaredProfit: readAmount(
        record,
        'declaredProfit',
        'incomePath',
        'receipts',
        errors,
      ),
      notSpecifiedProfession: readTri(
        record,
        'notSpecifiedProfession',
        'incomePath',
        'receipts',
        errors,
      ),
      notGoodsCarriage: readTri(
        record,
        'notGoodsCarriage',
        'incomePath',
        'receipts',
        errors,
      ),
      notAgencyCommissionBrokerage: readTri(
        record,
        'notAgencyCommissionBrokerage',
        'incomePath',
        'receipts',
        errors,
      ),
      noChapterViiiCDeduction: readTri(
        record,
        'noChapterViiiCDeduction',
        'incomePath',
        'receipts',
        errors,
      ),
      fiveYearExclusion,
    }
  } else {
    const record =
      checkObject(
        pathRecord,
        [
          'kind',
          'confirmed',
          'grossReceipts',
          'cashReceipts',
          'declaredProfit',
        ],
        'incomePath',
        'receipts',
        errors,
      ) ?? {}
    incomePath = {
      kind: 'specified-profession',
      confirmed: readTri(record, 'confirmed', 'incomePath', 'receipts', errors),
      grossReceipts: readAmount(
        record,
        'grossReceipts',
        'incomePath',
        'receipts',
        errors,
      ),
      cashReceipts: readAmount(
        record,
        'cashReceipts',
        'incomePath',
        'receipts',
        errors,
      ),
      declaredProfit: readAmount(
        record,
        'declaredProfit',
        'incomePath',
        'receipts',
        errors,
      ),
    }
  }

  const clientsRecord = checkObject(
    root.clients,
    ['kind', 'delivery', 'platform', 'foreign'],
    'clients',
    'clients',
    errors,
  )
  const clientKind = clientsRecord
    ? readText(
        clientsRecord,
        'kind',
        ['domestic', 'foreign', 'mixed', 'not-sure'],
        'clients',
        'clients',
        errors,
      )
    : ('not-sure' as const)
  const delivery = clientsRecord
    ? readText(
        clientsRecord,
        'delivery',
        ['direct', 'platform', 'both', 'not-sure'],
        'clients',
        'clients',
        errors,
      )
    : ('not-sure' as const)
  const clients = {
    kind: clientKind,
    delivery,
    platform: clientsRecord
      ? parsePlatform(
          clientsRecord.platform,
          'clients.platform',
          'clients',
          errors,
        )
      : null,
    foreign: clientsRecord
      ? parseForeign(
          clientsRecord.foreign,
          'clients.foreign',
          'clients',
          errors,
        )
      : null,
  }

  const otherRecord = checkObject(
    root.otherIncome,
    [
      'taxableBankInterest',
      'tds',
      'tcs',
      'advanceTaxPaid',
      'ageSixtyOrOlder',
      'otherAnnualReturnTrigger',
    ],
    'otherIncome',
    'other-income',
    errors,
  )
  const otherIncome = {
    taxableBankInterest: otherRecord
      ? readAmount(
          otherRecord,
          'taxableBankInterest',
          'otherIncome',
          'other-income',
          errors,
        )
      : 0,
    tds: otherRecord
      ? readAmount(otherRecord, 'tds', 'otherIncome', 'other-income', errors)
      : 0,
    tcs: otherRecord
      ? readAmount(otherRecord, 'tcs', 'otherIncome', 'other-income', errors)
      : 0,
    advanceTaxPaid: otherRecord
      ? readAmount(
          otherRecord,
          'advanceTaxPaid',
          'otherIncome',
          'other-income',
          errors,
        )
      : 0,
    ageSixtyOrOlder: otherRecord
      ? readTri(
          otherRecord,
          'ageSixtyOrOlder',
          'otherIncome',
          'other-income',
          errors,
        )
      : ('not-sure' as const),
    otherAnnualReturnTrigger: otherRecord
      ? readTri(
          otherRecord,
          'otherAnnualReturnTrigger',
          'otherIncome',
          'other-income',
          errors,
        )
      : ('not-sure' as const),
  }

  const gstRecord = isRecord(root.gst) ? root.gst : null
  if (!gstRecord)
    addError(errors, 'invalid', 'gst', 'gst', 'Choose a complete GST branch.')
  const gstKind =
    gstRecord &&
    (gstRecord.kind === 'registered' || gstRecord.kind === 'unregistered')
      ? gstRecord.kind
      : 'unregistered'
  let gst: GstProfile
  if (gstKind === 'registered') {
    const record =
      checkObject(
        gstRecord,
        ['kind', 'status', 'state'],
        'gst',
        'gst',
        errors,
      ) ?? {}
    const status = readText(
      record,
      'status',
      ['one-normal', 'other', 'not-sure'],
      'gst',
      'gst',
      errors,
    )
    const state =
      record.state === null || typeof record.state === 'string'
        ? record.state
        : null
    if (record.state !== null && typeof record.state !== 'string')
      addError(
        errors,
        'invalid',
        'gst.state',
        'gst',
        'Choose a state or leave it blank.',
      )
    if (
      status === 'one-normal' &&
      (state === null ||
        !knownStates.includes(state as (typeof knownStates)[number]))
    )
      addError(
        errors,
        'invalid',
        'gst.state',
        'gst',
        'Choose a state for the active normal-taxpayer registration.',
      )
    gst = { kind: 'registered', status, state }
  } else {
    const record =
      checkObject(
        gstRecord,
        [
          'kind',
          'state',
          'aggregateTurnover',
          'turnoverComplete',
          'compulsoryRegistration',
          'thresholdLiabilityDate',
        ],
        'gst',
        'gst',
        errors,
      ) ?? {}
    const state =
      typeof record.state === 'string' &&
      knownStates.includes(record.state as (typeof knownStates)[number])
        ? record.state
        : ''
    if (!state)
      addError(
        errors,
        'invalid',
        'gst.state',
        'gst',
        'Choose a state or Union territory.',
      )
    const thresholdDate =
      record.thresholdLiabilityDate === null ||
      isDate(record.thresholdLiabilityDate)
        ? record.thresholdLiabilityDate
        : null
    if (
      record.thresholdLiabilityDate !== null &&
      !isDate(record.thresholdLiabilityDate)
    )
      addError(
        errors,
        'invalid',
        'gst.thresholdLiabilityDate',
        'gst',
        'Use a valid Tax Year date.',
      )
    if (
      thresholdDate !== null &&
      (thresholdDate < currentRules.effectiveStart ||
        thresholdDate > currentRules.effectiveEnd)
    )
      addError(
        errors,
        'invalid',
        'gst.thresholdLiabilityDate',
        'gst',
        `Use a date within ${TAX_YEAR}.`,
      )
    gst = {
      kind: 'unregistered',
      state,
      aggregateTurnover: readAmount(
        record,
        'aggregateTurnover',
        'gst',
        'gst',
        errors,
      ),
      turnoverComplete: readTri(
        record,
        'turnoverComplete',
        'gst',
        'gst',
        errors,
      ),
      compulsoryRegistration: readTri(
        record,
        'compulsoryRegistration',
        'gst',
        'gst',
        errors,
      ),
      thresholdLiabilityDate: thresholdDate,
    }
  }

  const declaredFacts: unknown[] | null = Array.isArray(root.unsupportedFacts)
    ? root.unsupportedFacts
    : null
  const facts: UnsupportedFact[] = []
  if (declaredFacts === null || !declaredFacts.every(isUnsupportedFact)) {
    addError(
      errors,
      'invalid',
      'unsupportedFacts',
      'review',
      'Use only the listed unsupported-fact codes.',
    )
  } else {
    const seen = new Set<string>()
    for (const fact of declaredFacts) {
      if (seen.has(fact))
        addError(
          errors,
          'inconsistent',
          'unsupportedFacts',
          'review',
          'Do not repeat an unsupported-fact code.',
        )
      seen.add(fact)
      facts.push(fact)
    }
  }

  if (
    incomePath.kind === 'eligible-business' &&
    incomePath.qualifyingReceipts + incomePath.otherReceipts !==
      incomePath.grossReceipts
  )
    addError(
      errors,
      'inconsistent',
      'incomePath',
      'receipts',
      'The payment split must equal gross receipts.',
    )
  if (incomePath.cashReceipts > incomePath.grossReceipts)
    addError(
      errors,
      'inconsistent',
      'incomePath.cashReceipts',
      'receipts',
      'Cash receipts cannot exceed gross receipts.',
    )
  const usesPlatform =
    clients.delivery === 'platform' || clients.delivery === 'both'
  if (usesPlatform && clients.platform === null)
    addError(
      errors,
      'inconsistent',
      'clients.platform',
      'clients',
      'Platform facts are required when any work uses a platform.',
    )
  if (!usesPlatform && clients.platform !== null)
    addError(
      errors,
      'inconsistent',
      'clients.platform',
      'clients',
      'Platform facts do not belong to direct work.',
    )
  if (
    (clients.kind === 'foreign' || clients.kind === 'mixed') &&
    clients.foreign === null
  )
    addError(
      errors,
      'inconsistent',
      'clients.foreign',
      'clients',
      'Foreign-client facts are required for this branch.',
    )
  if (clients.kind === 'domestic' && clients.foreign !== null)
    addError(
      errors,
      'inconsistent',
      'clients.foreign',
      'clients',
      'Foreign-client facts do not belong to domestic-only work.',
    )
  if (
    gst.kind === 'registered' &&
    gst.state !== null &&
    !knownStates.includes(gst.state as (typeof knownStates)[number])
  )
    addError(
      errors,
      'invalid',
      'gst.state',
      'gst',
      'Choose a state or Union territory.',
    )

  const profile: Profile = {
    taxYear,
    person,
    taxRegime,
    practice,
    activity,
    incomePath,
    clients,
    otherIncome,
    gst,
    unsupportedFacts: facts,
  }
  return errors.length > 0
    ? { valid: false, kind: 'invalid', errors }
    : { valid: true, kind: 'valid', profile }
}

function roundMoney(amount: number, unit: number) {
  const remainder = amount % unit
  return amount - remainder + (remainder >= unit / 2 ? unit : 0)
}

function percentage(amount: number, rate: number) {
  return (amount * Math.round(rate * 100)) / 100
}

function addDays(date: DateOnly, days: number): DateOnly {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10) as DateOnly
}

function deadlineStatus(today: DateOnly, dueDate: DateOnly): DeadlineStatus {
  return today < dueDate
    ? 'upcoming'
    : today === dueDate
      ? 'due-today'
      : 'deadline-passed'
}

function sourceIdsForRules(value: unknown): readonly string[] {
  if (!isRecord(value) || !Array.isArray(value.sources)) return []
  return value.sources.flatMap((source) =>
    isRecord(source) &&
    source.kind === 'statutory' &&
    typeof source.id === 'string'
      ? [source.id]
      : [],
  )
}

function sourceIdsForGroup(
  rules: RuleDataset,
  group: keyof RuleDataset['groups'],
): readonly string[] {
  const candidate = rules.groups[group]
  return candidate && Array.isArray(candidate.provenance)
    ? [
        ...new Set(
          candidate.provenance.flatMap((reference) =>
            isRecord(reference) && typeof reference.sourceId === 'string'
              ? [reference.sourceId]
              : [],
          ),
        ),
      ]
    : []
}

function unsupported(
  code: string,
  area: UnsupportedResult['facts'][number]['area'],
  correctionGroup: ProfileGroup,
  label: string,
  reason: string,
  sourceIds: readonly string[],
): UnsupportedResult['facts'][number] {
  return { code, area, correctionGroup, label, reason, sourceIds }
}

function calculateSlabTax(totalIncome: number, rules: CommonIncomeTaxRules) {
  let lower = 0
  let tax = 0
  for (const slab of rules.slabs) {
    const upper = slab.upper ?? totalIncome
    tax += percentage(
      Math.max(0, Math.min(totalIncome, upper) - lower),
      slab.rate,
    )
    if (totalIncome <= upper) break
    lower = upper
  }
  return tax
}

function calculateTax(
  profile: Profile,
  pathRules: IncomePathRules,
  taxRules: CommonIncomeTaxRules,
): TaxEstimate {
  const path = profile.incomePath
  const minimumIncome =
    path.kind === 'specified-profession'
      ? percentage(path.grossReceipts, pathRules.professionMinimumProfitRate)
      : percentage(
          path.qualifyingReceipts,
          pathRules.businessQualifyingReceiptRate,
        ) + percentage(path.otherReceipts, pathRules.businessOtherReceiptRate)
  const usedIncome = Math.max(minimumIncome, path.declaredProfit)
  const roundedTotalIncome = roundMoney(
    usedIncome + profile.otherIncome.taxableBankInterest,
    taxRules.roundingUnit,
  )
  const slabTax = calculateSlabTax(roundedTotalIncome, taxRules)
  const rebate =
    roundedTotalIncome <= taxRules.rebateLimit
      ? Math.min(slabTax, taxRules.rebateMaximum)
      : 0
  const marginalRelief =
    roundedTotalIncome > taxRules.marginalReliefLimit &&
    slabTax > roundedTotalIncome - taxRules.marginalReliefLimit
      ? slabTax - (roundedTotalIncome - taxRules.marginalReliefLimit)
      : 0
  const taxAfterRelief = slabTax - rebate - marginalRelief
  const cess = percentage(taxAfterRelief, taxRules.cessRate)
  const grossTax = taxAfterRelief + cess
  const credits = profile.otherIncome.tds + profile.otherIncome.tcs
  const beforeAdvancePaid = grossTax - credits
  const finalBalance = beforeAdvancePaid - profile.otherIncome.advanceTaxPaid
  const finalAmount = roundMoney(Math.abs(finalBalance), taxRules.roundingUnit)
  return {
    path: path.kind,
    presumptive: {
      grossReceipts: path.grossReceipts,
      declaredProfit: path.declaredProfit,
      minimumIncome,
      usedIncome,
      qualifyingReceipts:
        path.kind === 'eligible-business' ? path.qualifyingReceipts : null,
      otherReceipts:
        path.kind === 'eligible-business' ? path.otherReceipts : null,
    },
    taxableBankInterest: profile.otherIncome.taxableBankInterest,
    roundedTotalIncome,
    slabTax,
    rebate,
    marginalRelief,
    taxAfterRelief,
    cess,
    grossTax,
    tds: profile.otherIncome.tds,
    tcs: profile.otherIncome.tcs,
    estimatedAdvanceTaxLiability: roundMoney(
      Math.max(0, beforeAdvancePaid),
      taxRules.roundingUnit,
    ),
    advanceTaxPaid: profile.otherIncome.advanceTaxPaid,
    outcome:
      finalAmount === 0 ? 'settled' : finalBalance < 0 ? 'refund' : 'payable',
    finalAmount,
  }
}

function factForSharedProfile(profile: Profile, sourceIds: readonly string[]) {
  const facts: UnsupportedResult['facts'][number][] = []
  const shared: readonly [boolean, string, ProfileGroup, string, string][] = [
    [
      profile.taxYear === TAX_YEAR,
      'tax-year',
      'tax-year',
      'Tax Year',
      `This version evaluates ${TAX_YEAR} only.`,
    ],
    [
      profile.person.kind === 'individual',
      'person-kind',
      'tax-year',
      'Individual',
      'This version supports individuals only.',
    ],
    [
      profile.person.adult === 'yes',
      'adult',
      'tax-year',
      'Adult user',
      'Saving and this supported calculation are for adults who confirm this fact.',
    ],
    [
      profile.person.residence === 'resident-ordinarily-resident',
      'residence',
      'tax-year',
      'Resident and ordinarily resident',
      'RNOR and non-resident rules are outside this version.',
    ],
    [
      profile.taxRegime === 'new',
      'tax-regime',
      'tax-year',
      'New tax regime',
      'This version uses the new-regime Rules only.',
    ],
    [
      profile.practice.onePractice === 'yes',
      'one-practice',
      'tax-year',
      'One self-employed practice',
      'The calculation covers one practice only.',
    ],
    [
      profile.practice.setupInIndia === 'yes',
      'practice-location',
      'tax-year',
      'Practice set up in India',
      'The supported practice must be set up and managed in India.',
    ],
    [
      profile.practice.workInIndia === 'yes',
      'work-location',
      'tax-year',
      'All work performed in India',
      'Work outside India can change the applicable tax and return treatment.',
    ],
    [
      profile.practice.hasPartner === 'no',
      'partner',
      'tax-year',
      'No partner',
      'Partnership income is outside this version.',
    ],
    [
      profile.practice.hasEmployee === 'no',
      'employee',
      'tax-year',
      'No employee',
      'Payroll and deductor duties are outside this version.',
    ],
    [
      profile.practice.hasForeignOperation === 'no',
      'foreign-operation',
      'tax-year',
      'No foreign operation',
      'A foreign operation can change the calculation and return treatment.',
    ],
    [
      profile.practice.hasClientWorkSubcontractor === 'no',
      'client-work-subcontractor',
      'tax-year',
      'No client-work subcontractor',
      'The supported boundary excludes subcontracted client delivery.',
    ],
    [
      profile.practice.hasClientWorkSubcontractor !== 'no' ||
        profile.practice.contractorBoundary !== 'not-sure',
      'contractor-boundary',
      'tax-year',
      'Contractor boundary',
      'Uncertainty about a contractor who may create another duty stops the calculation.',
    ],
    [
      profile.activity !== 'not-sure',
      'activity',
      'activity',
      'Activity',
      'Choose the activity label that best describes the practice.',
    ],
  ]
  for (const [condition, code, group, label, reason] of shared)
    if (!condition)
      facts.push(unsupported(code, 'profile', group, label, reason, sourceIds))
  return facts
}

function factForPath(
  profile: Profile,
  rules: IncomePathRules,
  sourceIds: readonly string[],
) {
  const facts: UnsupportedResult['facts'][number][] = []
  const path = profile.incomePath
  if (path.confirmed !== 'yes')
    facts.push(
      unsupported(
        'income-path-confirmation',
        'income-tax',
        'activity',
        'Income path confirmation',
        'Choose the presumptive path used in your records. Not sure cannot produce an estimate.',
        sourceIds,
      ),
    )
  if (path.kind === 'specified-profession') {
    const cashRate =
      path.grossReceipts === 0 ? 0 : path.cashReceipts / path.grossReceipts
    const limit =
      cashRate > rules.professionCashReceiptRate
        ? rules.professionStandardReceiptLimit
        : rules.professionLowCashReceiptLimit
    if (path.confirmed !== 'yes') return facts
    if (
      path.declaredProfit <
      percentage(path.grossReceipts, rules.professionMinimumProfitRate)
    )
      facts.push(
        unsupported(
          'profession-profit-floor',
          'income-tax',
          'receipts',
          'Declared professional profit',
          'The supported professional path needs profit of at least 50% of gross receipts.',
          sourceIds,
        ),
      )
    if (path.grossReceipts > limit)
      facts.push(
        unsupported(
          'profession-receipt-limit',
          'income-tax',
          'receipts',
          'Professional receipts',
          `This path supports receipts up to ₹${limit.toLocaleString('en-IN')} for the declared cash-receipt level.`,
          sourceIds,
        ),
      )
  } else {
    const minimum =
      percentage(path.qualifyingReceipts, rules.businessQualifyingReceiptRate) +
      percentage(path.otherReceipts, rules.businessOtherReceiptRate)
    const conditions: readonly [boolean, string, string, string][] = [
      [
        path.notSpecifiedProfession === 'yes',
        'business-not-profession',
        'Specified profession excluded',
        'Confirm this whole practice is an eligible business, not a specified profession.',
      ],
      [
        path.notGoodsCarriage === 'yes',
        'business-not-goods',
        'Goods carriage excluded',
        'Goods carriage is outside this business path.',
      ],
      [
        path.notAgencyCommissionBrokerage === 'yes',
        'business-not-agency',
        'Agency, commission, and brokerage excluded',
        'Agency, commission, and brokerage receipts are outside this path.',
      ],
      [
        path.noChapterViiiCDeduction === 'yes',
        'business-no-deduction',
        'Chapter VIII-C deduction excluded',
        'This path does not calculate a Chapter VIII-C deduction.',
      ],
      [
        path.fiveYearExclusion === 'none',
        'business-five-year-exclusion',
        'Five-year exclusion',
        'The five-year presumptive-method exclusion must not apply.',
      ],
    ]
    for (const [condition, code, label, reason] of conditions)
      if (!condition)
        facts.push(
          unsupported(code, 'income-tax', 'activity', label, reason, sourceIds),
        )
    const cashRate =
      path.grossReceipts === 0 ? 0 : path.cashReceipts / path.grossReceipts
    const limit =
      cashRate > rules.businessCashReceiptRate
        ? rules.businessStandardReceiptLimit
        : rules.businessLowCashReceiptLimit
    if (path.grossReceipts > limit)
      facts.push(
        unsupported(
          'business-receipt-limit',
          'income-tax',
          'receipts',
          'Business receipts',
          `This path supports receipts up to ₹${limit.toLocaleString('en-IN')} for the declared cash-receipt level.`,
          sourceIds,
        ),
      )
    if (path.declaredProfit < minimum)
      facts.push(
        unsupported(
          'business-profit-floor',
          'income-tax',
          'receipts',
          'Declared business profit',
          'The supported business path needs profit of at least 6% of qualifying receipts plus 8% of other receipts.',
          sourceIds,
        ),
      )
  }
  return facts
}

function factForClients(profile: Profile, sourceIds: readonly string[]) {
  const facts: UnsupportedResult['facts'][number][] = []
  const clients = profile.clients
  if (clients.kind === 'not-sure' || clients.delivery === 'not-sure') {
    facts.push(
      unsupported(
        'client-branch-uncertain',
        'income-tax',
        'clients',
        'Client branch',
        'Choose whether clients are domestic, foreign, or mixed and whether work is direct, platform-mediated, or both.',
        sourceIds,
      ),
    )
    return facts
  }
  if (
    (clients.delivery === 'platform' || clients.delivery === 'both') &&
    clients.platform
  ) {
    const platformConditions: readonly [boolean, string, string, string][] = [
      [
        clients.platform.ownAccount === 'yes',
        'platform-own-account',
        'Platform relationship',
        'The freelancer must supply the main service on their own account.',
      ],
      [
        clients.platform.recipientIdentifiable === 'yes',
        'platform-recipient',
        'Contractual recipient',
        'The contractual recipient must be identifiable in the records.',
      ],
      [
        clients.platform.grossBeforeFees === 'yes',
        'platform-gross',
        'Gross platform consideration',
        'Records must show gross customer consideration before platform fees and withholding.',
      ],
      [
        clients.platform
          .notEmploymentCommissionBrokerageRoyaltyLicensingAgency === 'yes',
        'platform-income-character',
        'Platform income character',
        'Employment, commission, brokerage, royalty, licensing, and agency receipts are outside this path.',
      ],
      [
        clients.platform.noRecipientReverseCharge === 'yes',
        'platform-reverse-charge',
        'Platform fee treatment',
        'The platform fee must not create an unsupported recipient-side reverse-charge duty.',
      ],
      [
        clients.platform.foreignFeeGstTreatment !== 'not-sure',
        'platform-fee-gst',
        'Foreign platform fee treatment',
        'Confirm the GST treatment of a foreign platform fee before using this result.',
      ],
    ]
    for (const [condition, code, label, reason] of platformConditions)
      if (!condition)
        facts.push(
          unsupported(code, 'income-tax', 'clients', label, reason, sourceIds),
        )
  }
  if (clients.kind === 'foreign' || clients.kind === 'mixed') {
    const foreign = clients.foreign
    if (!foreign) return facts
    const foreignConditions: readonly [boolean, string, string, string][] = [
      [
        foreign.workPerformedInIndia === 'yes',
        'foreign-work-location',
        'Foreign work location',
        'The supported cross-border path requires all income-producing work to remain in India.',
      ],
      [
        foreign.recipientIdentifiable === 'yes',
        'foreign-recipient',
        'Foreign recipient',
        'The overseas contractual recipient must be identifiable in the records.',
      ],
      [
        foreign.ownAccount === 'yes',
        'foreign-own-account',
        'Foreign own-account supply',
        'The freelancer must supply the main service on their own account.',
      ],
      [
        foreign.ordinaryPlaceOfSupply === 'yes',
        'foreign-place-of-supply',
        'Place of supply',
        'The ordinary cross-border place-of-supply rule must apply.',
      ],
      [
        foreign.sameEstablishment === 'no',
        'foreign-establishment',
        'Establishment relationship',
        'The supplier and recipient cannot be establishments of the same person.',
      ],
      [
        foreign.paymentRoute !== 'not-sure',
        'foreign-payment-route',
        'Payment route',
        'Confirm convertible foreign exchange or an RBI-permitted rupee route.',
      ],
      [
        foreign.settledToIndianBank === 'yes',
        'foreign-indian-settlement',
        'Indian settlement',
        'The covered path must settle through an authorised route to your own Indian bank account.',
      ],
      [
        foreign.foreignOperation === 'no',
        'foreign-operation',
        'Foreign operation',
        'A foreign operation is outside this calculation boundary.',
      ],
      [
        foreign.foreignTax === 'no',
        'foreign-tax',
        'Foreign tax',
        'Foreign tax and foreign-tax relief are outside this calculation.',
      ],
      [
        foreign.treatyRelief === 'no',
        'foreign-treaty-relief',
        'Treaty relief',
        'Treaty relief is outside this calculation.',
      ],
      [
        foreign.receiptsResolved === 'yes',
        'foreign-receipts-resolved',
        'Resolved annual receipts',
        'Confirm a complete annual rupee total using your regular accounting method.',
      ],
      [
        foreign.currencyResolved === 'yes',
        'foreign-currency-resolved',
        'Resolved currency effects',
        'Fees, withholding, refunds, chargebacks, receivables, and exchange effects must already be resolved.',
      ],
    ]
    for (const [condition, code, label, reason] of foreignConditions)
      if (!condition)
        facts.push(
          unsupported(code, 'income-tax', 'clients', label, reason, sourceIds),
        )
  }
  return facts
}

function coverageUnavailable(
  area: CoverageUnavailable['area'],
  code: string,
  reason: string,
  guidance: string,
  sourceIds: readonly string[],
): CoverageUnavailable {
  return { kind: 'unavailable', area, code, reason, guidance, sourceIds }
}

function reviewAction(
  id: string,
  title: string,
  area: ReviewAction['area'],
  correctionGroup: ProfileGroup,
  reason: string,
  sourceIds: readonly string[],
): ReviewAction {
  return { id, title, area, correctionGroup, reason, sourceIds }
}

type AnnualAreaResult = {
  readonly coverage: Coverage<AnnualReturnConclusion>
  readonly review: readonly ReviewAction[]
  readonly obligation: Obligation | null
}

function calculateAnnualReturn(
  profile: Profile,
  tax: TaxEstimate,
  rules: AnnualReturnRules,
  today: DateOnly,
  verifiedOn: DateOnly,
  expiresOn: DateOnly,
  sourceIds: readonly string[],
): AnnualAreaResult {
  const triggers: string[] = []
  if (tax.roundedTotalIncome > rules.filingIncomeThreshold)
    triggers.push('Rounded total income is above ₹4,00,000.')
  if (
    profile.incomePath.kind === 'specified-profession' &&
    profile.incomePath.grossReceipts > rules.professionReceiptThreshold
  )
    triggers.push('Specified-profession gross receipts are above ₹10,00,000.')
  if (
    profile.incomePath.kind === 'eligible-business' &&
    profile.incomePath.grossReceipts > rules.businessReceiptThreshold
  )
    triggers.push('Eligible-business gross receipts are above ₹60,00,000.')
  const credits = profile.otherIncome.tds + profile.otherIncome.tcs
  const creditThreshold =
    profile.otherIncome.ageSixtyOrOlder === 'yes'
      ? rules.seniorTdsTcsThreshold
      : rules.tdsTcsThreshold
  if (credits >= creditThreshold)
    triggers.push(
      `Indian TDS and TCS credits are at least ₹${creditThreshold.toLocaleString('en-IN')}.`,
    )
  if (profile.otherIncome.otherAnnualReturnTrigger === 'yes')
    triggers.push(
      'You confirmed that another prescribed return trigger applies.',
    )
  const ageUncertain =
    credits >= rules.tdsTcsThreshold &&
    credits < rules.seniorTdsTcsThreshold &&
    profile.otherIncome.ageSixtyOrOlder === 'not-sure'
  if (
    profile.otherIncome.otherAnnualReturnTrigger === 'not-sure' ||
    ageUncertain
  ) {
    return {
      coverage: coverageUnavailable(
        'annual-return',
        profile.otherIncome.otherAnnualReturnTrigger === 'not-sure'
          ? 'annual-return-trigger-uncertain'
          : 'annual-return-age-uncertain',
        'My Next Filing cannot determine every annual-return trigger from these answers.',
        'Check the prescribed triggers and current return guidance before relying on this part of your plan.',
        sourceIds,
      ),
      review: [
        reviewAction(
          'annual-return-review',
          'Review annual-return triggers',
          'annual-return',
          'other-income',
          'Some annual-return facts need confirmation before a dated action can be shown.',
          sourceIds,
        ),
      ],
      obligation: null,
    }
  }
  const dueDate = rules.operativeDueDate ?? rules.normalDueDate
  const conclusion: AnnualReturnConclusion = {
    required: triggers.length > 0,
    triggers,
    normalDueDate: rules.normalDueDate,
    operativeDueDate: rules.operativeDueDate,
    dueDate,
    formGuidance: 'unavailable',
  }
  const obligation: Obligation | null =
    triggers.length === 0
      ? null
      : {
          id: `annual-return:${profile.taxYear}`,
          kind: 'annual-return',
          title: 'File the annual income-tax return',
          taxYear: profile.taxYear,
          normalDueDate: rules.normalDueDate,
          operativeDueDate: rules.operativeDueDate,
          extensionSourceId: rules.extensionSourceId,
          dueDate,
          deadlineStatus: deadlineStatus(today, dueDate),
          reasons: triggers,
          consequence:
            'A filing fee or other effect can apply after the deadline. My Next Filing does not calculate those amounts.',
          amountDue: null,
          ruleIds: [
            'annual-return-income-threshold',
            'annual-return-profession-threshold',
            'annual-return-business-threshold',
            'annual-return-tds-tcs-threshold',
            'annual-return-date',
          ],
          statutorySourceIds: sourceIds,
          tutorialSourceId: null,
          verifiedOn,
          expiresOn,
        }
  return {
    coverage: { kind: 'available', value: conclusion, sourceIds },
    review: [],
    obligation,
  }
}

type GstAreaResult = {
  readonly coverage: Coverage<GstConclusion>
  readonly review: readonly ReviewAction[]
  readonly obligation: Obligation | null
}

function calculateGst(
  profile: Profile,
  rules: RuleDataset,
  today: DateOnly,
  verifiedOn: DateOnly,
  expiresOn: DateOnly,
  sourceIds: readonly string[],
): GstAreaResult {
  if (profile.gst.kind === 'registered') {
    return {
      coverage: coverageUnavailable(
        'gst',
        'gst-return-calendar-deferred',
        'This first release does not calculate GST returns for registered users.',
        'Use the GST portal or a qualified adviser for registered-return dates.',
        sourceIds,
      ),
      review: [],
      obligation: null,
    }
  }
  if (
    profile.gst.turnoverComplete !== 'yes' ||
    profile.gst.compulsoryRegistration !== 'no'
  ) {
    return {
      coverage: coverageUnavailable(
        'gst',
        'gst-fact-uncertain',
        'The GST threshold conclusion needs complete turnover and compulsory-registration facts.',
        'Confirm these GST facts before relying on a registration conclusion.',
        sourceIds,
      ),
      review: [
        reviewAction(
          'gst-review',
          'Review GST registration facts',
          'gst',
          'gst',
          'A GST fact is unknown or may trigger registration independently of turnover.',
          sourceIds,
        ),
      ],
      obligation: null,
    }
  }
  const values = rules.groups.gstRegistration.values
  const threshold = values.lowerThresholdStates.includes(profile.gst.state)
    ? values.lowerThreshold
    : values.standardThreshold
  const difference = Math.abs(threshold - profile.gst.aggregateTurnover)
  const status: GstConclusion['status'] =
    profile.gst.aggregateTurnover < threshold
      ? 'below'
      : profile.gst.aggregateTurnover === threshold
        ? 'at'
        : 'above'
  if (
    status === 'above' &&
    (!profile.gst.thresholdLiabilityDate ||
      profile.gst.thresholdLiabilityDate > today)
  ) {
    return {
      coverage: coverageUnavailable(
        'gst',
        'gst-liability-date-uncertain',
        'Turnover is above the starting threshold but the liability date is not an established past date.',
        'Review the date when liability arose. My Next Filing does not invent a registration deadline.',
        sourceIds,
      ),
      review: [
        reviewAction(
          'gst-liability-date',
          'Confirm the GST liability date',
          'gst',
          'gst',
          'A registration date cannot be derived without the date on which liability arose.',
          sourceIds,
        ),
      ],
      obligation: null,
    }
  }
  const value: GstConclusion = {
    status,
    threshold,
    difference,
    state: profile.gst.state,
    registrationRequired: status === 'above',
  }
  const dueDate =
    status === 'above' && profile.gst.thresholdLiabilityDate
      ? addDays(
          profile.gst.thresholdLiabilityDate,
          values.registrationWindowDays,
        )
      : null
  const obligation: Obligation | null = dueDate
    ? {
        id: `gst-registration:${profile.taxYear}`,
        kind: 'gst-registration',
        title: 'Apply for GST registration',
        taxYear: profile.taxYear,
        normalDueDate: dueDate,
        operativeDueDate: null,
        extensionSourceId: null,
        dueDate,
        deadlineStatus: deadlineStatus(today, dueDate),
        reasons: [
          'Your declared GST aggregate turnover is above the starting threshold and the liability date is known.',
        ],
        consequence:
          'My Next Filing does not calculate GST payable, late fees, interest, or filing steps.',
        amountDue: null,
        ruleIds: [
          'gst-aggregate-turnover',
          'gst-registration-threshold',
          'gst-registration-window',
        ],
        statutorySourceIds: sourceIds,
        tutorialSourceId: null,
        verifiedOn,
        expiresOn,
      }
    : null
  return {
    coverage: { kind: 'available', value, sourceIds },
    review: [],
    obligation,
  }
}

function calculateForeignCoverage(
  profile: Profile,
  rules: ForeignGuidanceRules,
  sourceIds: readonly string[],
): Coverage<ForeignGuidanceConclusion> {
  if (profile.clients.kind === 'domestic')
    return {
      kind: 'available',
      value: {
        status: 'no-foreign-receipts',
        message:
          'No foreign-receipt guidance is needed for the domestic-only branch.',
      },
      sourceIds,
    }
  const foreign = profile.clients.foreign
  if (foreign?.accountExposure !== 'none')
    return {
      kind: 'unavailable',
      area: 'foreign-guidance',
      code: 'foreign-account-coverage',
      reason:
        'A possible foreign account, provider-held balance, wallet, or signing authority needs separate review.',
      guidance: rules.message,
      sourceIds,
    }
  return {
    kind: 'available',
    value: { status: 'reviewed-note', message: rules.message },
    sourceIds,
  }
}

function addUnique(values: readonly string[]) {
  return [...new Set(values)]
}

export function evaluate(
  profile: Profile,
  currentDate: Date,
  rules: RuleDataset,
): EvaluationResult {
  const ruleValidation = validateRules(rules, currentDate)
  if (!ruleValidation.valid)
    return {
      kind: 'stale-rules',
      expiresOn:
        isRecord(rules) && isDate(rules.expiresOn) ? rules.expiresOn : null,
      errors: ruleValidation.errors,
      affectedGroups: ['dataset'],
      sourceIds: sourceIdsForRules(rules),
    }
  const parsed = parseProfile(profile)
  if (!parsed.valid)
    return {
      kind: 'unsupported',
      facts: parsed.errors.map((error) =>
        unsupported(
          `invalid-profile:${error.code}`,
          'profile',
          error.group,
          'Profile input',
          error.message,
          [],
        ),
      ),
      sourceIds: [],
    }
  const current = parsed.profile
  const sourceIds = sourceIdsForRules(ruleValidation.data)
  const coreFacts = [
    ...factForSharedProfile(current, sourceIds),
    ...factForPath(
      current,
      ruleValidation.data.groups.incomePaths.values,
      sourceIds,
    ),
    ...factForClients(current, sourceIds),
  ]
  for (const fact of current.unsupportedFacts)
    coreFacts.push(
      unsupported(
        fact,
        'income-tax',
        'review',
        unsupportedFactLabels[fact],
        fact === 'unsupportedFactsNotSure'
          ? 'Confirm whether any listed situation applies before calculating your plan.'
          : 'This fact needs Rules that this version does not calculate.',
        sourceIds,
      ),
    )
  const minimumIncome =
    current.incomePath.kind === 'specified-profession'
      ? percentage(
          current.incomePath.grossReceipts,
          ruleValidation.data.groups.incomePaths.values
            .professionMinimumProfitRate,
        )
      : percentage(
          current.incomePath.qualifyingReceipts,
          ruleValidation.data.groups.incomePaths.values
            .businessQualifyingReceiptRate,
        ) +
        percentage(
          current.incomePath.otherReceipts,
          ruleValidation.data.groups.incomePaths.values
            .businessOtherReceiptRate,
        )
  const roundedIncome = roundMoney(
    Math.max(minimumIncome, current.incomePath.declaredProfit) +
      current.otherIncome.taxableBankInterest,
    ruleValidation.data.groups.commonIncomeTax.values.roundingUnit,
  )
  if (
    roundedIncome >
    ruleValidation.data.groups.commonIncomeTax.values.incomeCeiling
  )
    coreFacts.push(
      unsupported(
        'income-ceiling',
        'income-tax',
        'receipts',
        'Total income above ₹50 lakh',
        'This version stops before surcharge and broader high-income rules.',
        sourceIds,
      ),
    )
  if (coreFacts.length > 0)
    return {
      kind: 'unsupported',
      facts: coreFacts,
      sourceIds: addUnique(coreFacts.flatMap((fact) => fact.sourceIds)),
    }

  const data = ruleValidation.data
  const today = indiaDate(currentDate)
  const tax = calculateTax(
    current,
    data.groups.incomePaths.values,
    data.groups.commonIncomeTax.values,
  )
  const reviewActions: ReviewAction[] = []
  const obligations: Obligation[] = []
  const annualSources = sourceIdsForGroup(data, 'annualReturn')
  const gstSources = sourceIdsForGroup(data, 'gstRegistration')
  const foreignSources = sourceIdsForGroup(data, 'foreignGuidance')
  if (!ruleValidation.groups['advance-tax'].valid)
    reviewActions.push(
      reviewAction(
        'advance-tax-rules',
        'Check the advance-tax rules',
        'advance-tax',
        'other-income',
        'The advance-tax rules are unavailable, so no advance-tax date is shown.',
        sourceIdsForGroup(data, 'advanceTax'),
      ),
    )
  else if (
    tax.estimatedAdvanceTaxLiability >=
    data.groups.advanceTax.values.liabilityThreshold
  ) {
    const values = data.groups.advanceTax.values
    const dueDate = values.operativeDueDate ?? values.normalDueDate
    obligations.push({
      id: `advance-tax:${current.taxYear}`,
      kind: 'advance-tax',
      title: 'Pay advance tax',
      taxYear: current.taxYear,
      normalDueDate: values.normalDueDate,
      operativeDueDate: values.operativeDueDate,
      extensionSourceId: values.extensionSourceId,
      dueDate,
      deadlineStatus: deadlineStatus(today, dueDate),
      reasons: ['Estimated tax after Indian TDS and TCS is at least ₹10,000.'],
      consequence:
        'Interest can apply after this date. My Next Filing does not calculate interest or a government demand.',
      amountDue: tax.outcome === 'payable' ? tax.finalAmount : 0,
      ruleIds: ['advance-tax-threshold', 'advance-tax-date'],
      statutorySourceIds: sourceIdsForGroup(data, 'advanceTax'),
      tutorialSourceId: null,
      verifiedOn: data.groups.advanceTax.verifiedOn,
      expiresOn: data.groups.advanceTax.expiresOn,
    })
  }

  let annual: AnnualAreaResult
  if (!ruleValidation.groups['annual-return'].valid) {
    const sources = sourceIdsForGroup(data, 'annualReturn')
    annual = {
      coverage: coverageUnavailable(
        'annual-return',
        'annual-return-rules-stale',
        'The annual-return rules must be reviewed before this check can be shown.',
        'Your income-tax estimate remains available. Check the current official return guidance.',
        sources,
      ),
      review: [
        reviewAction(
          'annual-return-rules',
          'Check the annual-return rules',
          'annual-return',
          'other-income',
          'Annual-return dates and triggers are unavailable until the tax rules are reviewed.',
          sources,
        ),
      ],
      obligation: null,
    }
  } else
    annual = calculateAnnualReturn(
      current,
      tax,
      data.groups.annualReturn.values,
      today,
      data.groups.annualReturn.verifiedOn,
      data.groups.annualReturn.expiresOn,
      annualSources,
    )
  if (annual.obligation) obligations.push(annual.obligation)
  reviewActions.push(...annual.review)

  let gst: GstAreaResult
  if (!ruleValidation.groups['gst-registration'].valid) {
    const sources = sourceIdsForGroup(data, 'gstRegistration')
    gst = {
      coverage: coverageUnavailable(
        'gst',
        'gst-rules-stale',
        'The GST registration rules must be reviewed before this check can be shown.',
        'Your income-tax estimate remains available. Check the current GST registration guidance.',
        sources,
      ),
      review: [
        reviewAction(
          'gst-rules',
          'Check the GST registration rules',
          'gst',
          'gst',
          'GST registration guidance is unavailable until its rules and sources are reviewed.',
          sources,
        ),
      ],
      obligation: null,
    }
  } else
    gst = calculateGst(
      current,
      data,
      today,
      data.groups.gstRegistration.verifiedOn,
      data.groups.gstRegistration.expiresOn,
      gstSources,
    )
  if (gst) {
    if (gst.obligation) obligations.push(gst.obligation)
    reviewActions.push(...gst.review)
  }

  let foreignGuidance: Coverage<ForeignGuidanceConclusion>
  if (
    (current.clients.kind === 'foreign' || current.clients.kind === 'mixed') &&
    !ruleValidation.groups['foreign-guidance'].valid
  ) {
    const sources = sourceIdsForGroup(data, 'foreignGuidance')
    foreignGuidance = coverageUnavailable(
      'foreign-guidance',
      'foreign-guidance-rules-stale',
      'Foreign-receipt guidance needs review before it can be shown.',
      'The income-tax estimate remains available. Ask an authorised dealer or qualified adviser about cross-border steps.',
      sources,
    )
    reviewActions.push(
      reviewAction(
        'foreign-guidance-rules',
        'Review foreign-receipt guidance',
        'foreign-guidance',
        'clients',
        'The reviewed FEMA transition note is unavailable.',
        sources,
      ),
    )
  } else if (ruleValidation.groups['foreign-guidance'].valid) {
    foreignGuidance = calculateForeignCoverage(
      current,
      data.groups.foreignGuidance.values,
      foreignSources,
    )
    if (foreignGuidance.kind === 'unavailable')
      reviewActions.push(
        reviewAction(
          'foreign-account-guidance',
          'Review foreign-account facts',
          'foreign-guidance',
          'clients',
          foreignGuidance.reason,
          foreignSources,
        ),
      )
  } else
    foreignGuidance = coverageUnavailable(
      'foreign-guidance',
      'foreign-guidance-unneeded',
      'Foreign guidance is unavailable.',
      'No foreign receipt facts were selected.',
      [],
    )

  obligations.sort(
    (left, right) =>
      left.dueDate.localeCompare(right.dueDate) ||
      (left.kind === 'advance-tax'
        ? 0
        : left.kind === 'annual-return'
          ? 1
          : 2) -
        (right.kind === 'advance-tax'
          ? 0
          : right.kind === 'annual-return'
            ? 1
            : 2),
  )
  return {
    kind: 'supported',
    tax,
    coverage: {
      annualReturn: annual.coverage,
      gst:
        gst?.coverage ??
        coverageUnavailable(
          'gst',
          'gst-unavailable',
          'GST coverage is unavailable.',
          'Review current GST facts.',
          gstSources,
        ),
      foreignGuidance,
    },
    obligations,
    reviewActions,
    assumptions: [
      'This estimate is for one adult who is resident and ordinarily resident in India and runs one individual practice.',
      'The amounts you entered are complete, non-negative whole-rupee values from your tax records.',
      'This is a best-effort estimate. It does not calculate surcharge, deductions, losses, special-rate tax, foreign-tax relief, interest, fees, or penalties.',
    ],
    explanations: [
      current.incomePath.kind === 'specified-profession'
        ? 'Professional income uses the higher of declared profit and 50% of gross receipts.'
        : 'Business income uses the higher of declared profit and 6% of qualifying banking or online receipts plus 8% of other receipts.',
      'Total income is rounded to the nearest ₹10 before slab tax, relief, cess, and credits.',
    ],
    sourceIds: addUnique([
      ...sourceIdsForGroup(data, 'incomePaths'),
      ...sourceIdsForGroup(data, 'commonIncomeTax'),
      ...sourceIdsForGroup(data, 'advanceTax'),
      ...annualSources,
      ...gstSources,
      ...foreignSources,
    ]),
  }
}
