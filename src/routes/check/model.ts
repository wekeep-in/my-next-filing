import type {
  Activity,
  Profile,
  ProfileGroup,
  ProfileInputError,
  TriState,
  UnsupportedFact,
} from '../../evaluation/index.ts'
import { parseProfile } from '../../evaluation/index.ts'
import { TAX_YEAR } from '../../rules/index.ts'

type DraftChoice = '' | TriState
export type DraftPath = '' | 'specified-profession' | 'eligible-business'
export type DraftClientKind = '' | 'domestic' | 'foreign' | 'mixed' | 'not-sure'
export type DraftDelivery = '' | 'direct' | 'platform' | 'both' | 'not-sure'
export type DraftGstKind = '' | 'unregistered' | 'registered' | 'not-sure'
export type DraftGstStatus = '' | 'one-normal' | 'other' | 'not-sure'
export type DraftAmountKey =
  | 'grossReceipts'
  | 'cashReceipts'
  | 'declaredProfit'
  | 'qualifyingReceipts'
  | 'otherReceipts'
  | 'taxableBankInterest'
  | 'tds'
  | 'tcs'
  | 'advanceTaxPaid'
  | 'aggregateTurnover'

export type Draft = {
  readonly personKind: '' | 'individual' | 'not-individual' | 'not-sure'
  readonly adult: DraftChoice
  readonly residence:
    | ''
    | 'resident-ordinarily-resident'
    | 'resident-not-ordinarily-resident'
    | 'non-resident'
    | 'not-sure'
  readonly taxRegime: '' | 'new' | 'old' | 'not-sure'
  readonly onePractice: DraftChoice
  readonly setupInIndia: DraftChoice
  readonly workInIndia: DraftChoice
  readonly hasPartner: DraftChoice
  readonly hasEmployee: DraftChoice
  readonly hasForeignOperation: DraftChoice
  readonly hasClientWorkSubcontractor: DraftChoice
  readonly contractorBoundary: '' | 'none' | 'incidental-domestic' | 'not-sure'
  readonly activity: Activity | ''
  readonly path: DraftPath
  readonly pathConfirmed: DraftChoice
  readonly notGoodsCarriage: DraftChoice
  readonly notAgencyCommissionBrokerage: DraftChoice
  readonly noChapterViiiCDeduction: DraftChoice
  readonly fiveYearExclusion: '' | 'none' | 'applies' | 'not-sure'
  readonly amounts: Record<DraftAmountKey, string>
  readonly clientKind: DraftClientKind
  readonly delivery: DraftDelivery
  readonly platformOwnAccount: DraftChoice
  readonly platformRecipientIdentifiable: DraftChoice
  readonly platformGrossBeforeFees: DraftChoice
  readonly platformIncomeCharacter: DraftChoice
  readonly platformForeignFeeGstTreatment:
    | ''
    | 'not-applicable'
    | 'known'
    | 'not-sure'
  readonly platformNoRecipientReverseCharge: DraftChoice
  readonly foreignWorkInIndia: DraftChoice
  readonly foreignRecipientIdentifiable: DraftChoice
  readonly foreignOwnAccount: DraftChoice
  readonly foreignPlaceOfSupply: DraftChoice
  readonly foreignSameEstablishment: DraftChoice
  readonly foreignPaymentRoute:
    | ''
    | 'convertible-foreign-exchange'
    | 'rbi-permitted-rupee'
    | 'not-sure'
  readonly foreignSettledToIndianBank: DraftChoice
  readonly foreignAccountExposure: '' | 'none' | 'possible' | 'not-sure'
  readonly foreignOperation: DraftChoice
  readonly foreignTax: DraftChoice
  readonly foreignTreatyRelief: DraftChoice
  readonly foreignReceiptsResolved: DraftChoice
  readonly foreignCurrencyResolved: DraftChoice
  readonly ageSixtyOrOlder: DraftChoice
  readonly otherAnnualReturnTrigger: DraftChoice
  readonly unsupportedCertainty: '' | 'none' | 'selected' | 'not-sure'
  readonly unsupportedFacts: readonly UnsupportedFact[]
  readonly gstKind: DraftGstKind
  readonly gstStatus: DraftGstStatus
  readonly gstState: string
  readonly turnoverComplete: DraftChoice
  readonly compulsoryRegistration: DraftChoice
  readonly thresholdLiabilityDate: string
}

export type PatchDraft = (patch: Partial<Draft>, ...errorKeys: string[]) => void

const amountKeys: readonly DraftAmountKey[] = [
  'grossReceipts',
  'cashReceipts',
  'declaredProfit',
  'qualifyingReceipts',
  'otherReceipts',
  'taxableBankInterest',
  'tds',
  'tcs',
  'advanceTaxPaid',
  'aggregateTurnover',
]

export const statesAndUnionTerritories = [
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

export const activityOptions = [
  { value: 'software-development', label: 'Software development or IT' },
  { value: 'technical-consultancy', label: 'Technical consultancy' },
  { value: 'design', label: 'Design' },
  { value: 'writing-content', label: 'Writing or content' },
  { value: 'marketing-advertising', label: 'Marketing or advertising' },
  { value: 'other-digital-service', label: 'Another digital service' },
  { value: 'not-sure', label: 'Not sure' },
] as const

export const optionLabels: Readonly<Record<string, string>> = {
  yes: 'Yes',
  no: 'No',
  'not-sure': 'Not sure',
  individual: 'Individual',
  'not-individual': 'Not an individual',
  'resident-ordinarily-resident': 'Resident and ordinarily resident',
  'resident-not-ordinarily-resident': 'Resident but not ordinarily resident',
  'non-resident': 'Non-resident',
  none: 'None / does not apply',
  possible: 'Possible exposure',
  'one-normal': 'One active GSTIN as a normal taxpayer',
  other: 'Something else',
  selected: 'Yes, I selected them',
  'not-applicable': 'Not applicable',
  known: 'Known',
  incidental: 'Incidental domestic contractor',
  'incidental-domestic': 'Incidental domestic contractor',
  'convertible-foreign-exchange': 'Convertible foreign exchange',
  'rbi-permitted-rupee': 'RBI-permitted rupee route',
  new: 'New tax regime',
  old: 'Old tax regime',
  domestic: 'Domestic clients only',
  foreign: 'Foreign clients only',
  mixed: 'Domestic and foreign clients',
  direct: 'Direct clients',
  platform: 'Platform-mediated work',
  unregistered: 'No',
  registered: 'Yes',
  applies: 'It applies',
  'specified-profession': 'Specified professional path',
  'eligible-business': 'Eligible business path',
  'other-digital-service': 'Another digital service',
}

export const unsupportedFactLabels: Record<UnsupportedFact, string> = {
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
  otherUnsupportedFacts: 'Another income or tax situation not listed here',
  unsupportedFactsNotSure: 'Not sure whether any situation applies',
}

const blankAmounts = (): Record<DraftAmountKey, string> =>
  Object.fromEntries(amountKeys.map((key) => [key, ''])) as Record<
    DraftAmountKey,
    string
  >

export const blankDraft = (): Draft => ({
  personKind: '',
  adult: '',
  residence: '',
  taxRegime: '',
  onePractice: '',
  setupInIndia: '',
  workInIndia: '',
  hasPartner: '',
  hasEmployee: '',
  hasForeignOperation: '',
  hasClientWorkSubcontractor: '',
  contractorBoundary: '',
  activity: '',
  path: '',
  pathConfirmed: '',
  notGoodsCarriage: '',
  notAgencyCommissionBrokerage: '',
  noChapterViiiCDeduction: '',
  fiveYearExclusion: '',
  amounts: blankAmounts(),
  clientKind: '',
  delivery: '',
  platformOwnAccount: '',
  platformRecipientIdentifiable: '',
  platformGrossBeforeFees: '',
  platformIncomeCharacter: '',
  platformForeignFeeGstTreatment: '',
  platformNoRecipientReverseCharge: '',
  foreignWorkInIndia: '',
  foreignRecipientIdentifiable: '',
  foreignOwnAccount: '',
  foreignPlaceOfSupply: '',
  foreignSameEstablishment: '',
  foreignPaymentRoute: '',
  foreignSettledToIndianBank: '',
  foreignAccountExposure: '',
  foreignOperation: '',
  foreignTax: '',
  foreignTreatyRelief: '',
  foreignReceiptsResolved: '',
  foreignCurrencyResolved: '',
  ageSixtyOrOlder: '',
  otherAnnualReturnTrigger: '',
  unsupportedCertainty: '',
  unsupportedFacts: [],
  gstKind: '',
  gstStatus: '',
  gstState: '',
  turnoverComplete: '',
  compulsoryRegistration: '',
  thresholdLiabilityDate: '',
})

const choice = (value: TriState): DraftChoice => value

export function draftFromProfile(profile: Profile): Draft {
  const path = profile.incomePath
  const amounts = blankAmounts()
  amounts.grossReceipts = path.grossReceipts.toLocaleString('en-IN')
  amounts.cashReceipts = path.cashReceipts.toLocaleString('en-IN')
  amounts.declaredProfit = path.declaredProfit.toLocaleString('en-IN')
  amounts.taxableBankInterest =
    profile.otherIncome.taxableBankInterest.toLocaleString('en-IN')
  amounts.tds = profile.otherIncome.tds.toLocaleString('en-IN')
  amounts.tcs = profile.otherIncome.tcs.toLocaleString('en-IN')
  amounts.advanceTaxPaid =
    profile.otherIncome.advanceTaxPaid.toLocaleString('en-IN')
  if (profile.gst.kind === 'unregistered')
    amounts.aggregateTurnover =
      profile.gst.aggregateTurnover.toLocaleString('en-IN')
  const draft: Draft = {
    ...blankDraft(),
    personKind: profile.person.kind,
    adult: choice(profile.person.adult),
    residence: profile.person.residence,
    taxRegime: profile.taxRegime,
    onePractice: choice(profile.practice.onePractice),
    setupInIndia: choice(profile.practice.setupInIndia),
    workInIndia: choice(profile.practice.workInIndia),
    hasPartner: choice(profile.practice.hasPartner),
    hasEmployee: choice(profile.practice.hasEmployee),
    hasForeignOperation: choice(profile.practice.hasForeignOperation),
    hasClientWorkSubcontractor: choice(
      profile.practice.hasClientWorkSubcontractor,
    ),
    contractorBoundary: profile.practice.contractorBoundary,
    activity: profile.activity,
    path: path.kind,
    pathConfirmed: choice(path.confirmed),
    amounts,
    clientKind: profile.clients.kind,
    delivery: profile.clients.delivery,
    platformOwnAccount: profile.clients.platform
      ? choice(profile.clients.platform.ownAccount)
      : '',
    platformRecipientIdentifiable: profile.clients.platform
      ? choice(profile.clients.platform.recipientIdentifiable)
      : '',
    platformGrossBeforeFees: profile.clients.platform
      ? choice(profile.clients.platform.grossBeforeFees)
      : '',
    platformIncomeCharacter: profile.clients.platform
      ? choice(
          profile.clients.platform
            .notEmploymentCommissionBrokerageRoyaltyLicensingAgency,
        )
      : '',
    platformForeignFeeGstTreatment:
      profile.clients.platform?.foreignFeeGstTreatment ?? '',
    platformNoRecipientReverseCharge: profile.clients.platform
      ? choice(profile.clients.platform.noRecipientReverseCharge)
      : '',
    foreignWorkInIndia: profile.clients.foreign
      ? choice(profile.clients.foreign.workPerformedInIndia)
      : '',
    foreignRecipientIdentifiable: profile.clients.foreign
      ? choice(profile.clients.foreign.recipientIdentifiable)
      : '',
    foreignOwnAccount: profile.clients.foreign
      ? choice(profile.clients.foreign.ownAccount)
      : '',
    foreignPlaceOfSupply: profile.clients.foreign
      ? choice(profile.clients.foreign.ordinaryPlaceOfSupply)
      : '',
    foreignSameEstablishment: profile.clients.foreign
      ? choice(profile.clients.foreign.sameEstablishment)
      : '',
    foreignPaymentRoute: profile.clients.foreign?.paymentRoute ?? '',
    foreignSettledToIndianBank: profile.clients.foreign
      ? choice(profile.clients.foreign.settledToIndianBank)
      : '',
    foreignAccountExposure: profile.clients.foreign?.accountExposure ?? '',
    foreignOperation: profile.clients.foreign
      ? choice(profile.clients.foreign.foreignOperation)
      : '',
    foreignTax: profile.clients.foreign
      ? choice(profile.clients.foreign.foreignTax)
      : '',
    foreignTreatyRelief: profile.clients.foreign
      ? choice(profile.clients.foreign.treatyRelief)
      : '',
    foreignReceiptsResolved: profile.clients.foreign
      ? choice(profile.clients.foreign.receiptsResolved)
      : '',
    foreignCurrencyResolved: profile.clients.foreign
      ? choice(profile.clients.foreign.currencyResolved)
      : '',
    ageSixtyOrOlder: choice(profile.otherIncome.ageSixtyOrOlder),
    otherAnnualReturnTrigger: choice(
      profile.otherIncome.otherAnnualReturnTrigger,
    ),
    unsupportedCertainty: profile.unsupportedFacts.includes(
      'unsupportedFactsNotSure',
    )
      ? 'not-sure'
      : profile.unsupportedFacts.length
        ? 'selected'
        : 'none',
    unsupportedFacts: profile.unsupportedFacts.filter(
      (fact) => fact !== 'unsupportedFactsNotSure',
    ),
    gstKind: profile.gst.kind,
    gstStatus: profile.gst.kind === 'registered' ? profile.gst.status : '',
    gstState:
      profile.gst.kind === 'registered'
        ? (profile.gst.state ?? '')
        : profile.gst.state,
    turnoverComplete:
      profile.gst.kind === 'unregistered'
        ? choice(profile.gst.turnoverComplete)
        : '',
    compulsoryRegistration:
      profile.gst.kind === 'unregistered'
        ? choice(profile.gst.compulsoryRegistration)
        : '',
    thresholdLiabilityDate:
      profile.gst.kind === 'unregistered'
        ? (profile.gst.thresholdLiabilityDate ?? '')
        : '',
  }
  if (path.kind === 'eligible-business') {
    amounts.qualifyingReceipts = path.qualifyingReceipts.toLocaleString('en-IN')
    amounts.otherReceipts = path.otherReceipts.toLocaleString('en-IN')
    return {
      ...draft,
      notGoodsCarriage: choice(path.notGoodsCarriage),
      notAgencyCommissionBrokerage: choice(path.notAgencyCommissionBrokerage),
      noChapterViiiCDeduction: choice(path.noChapterViiiCDeduction),
      fiveYearExclusion: path.fiveYearExclusion,
    }
  }
  return draft
}

const exampleCandidate = {
  taxYear: TAX_YEAR,
  person: {
    kind: 'individual',
    adult: 'yes',
    residence: 'resident-ordinarily-resident',
  },
  taxRegime: 'new',
  practice: {
    onePractice: 'yes',
    setupInIndia: 'yes',
    workInIndia: 'yes',
    hasPartner: 'no',
    hasEmployee: 'no',
    hasForeignOperation: 'no',
    hasClientWorkSubcontractor: 'no',
    contractorBoundary: 'none',
  },
  activity: 'software-development',
  incomePath: {
    kind: 'specified-profession',
    confirmed: 'yes',
    grossReceipts: 1_900_000,
    cashReceipts: 0,
    declaredProfit: 1_400_000,
  },
  clients: {
    kind: 'domestic',
    delivery: 'direct',
    platform: null,
    foreign: null,
  },
  otherIncome: {
    taxableBankInterest: 10_000,
    tds: 40_000,
    tcs: 0,
    advanceTaxPaid: 0,
    ageSixtyOrOlder: 'no',
    otherAnnualReturnTrigger: 'no',
  },
  gst: {
    kind: 'unregistered',
    state: 'Maharashtra',
    aggregateTurnover: 1_910_000,
    turnoverComplete: 'yes',
    compulsoryRegistration: 'no',
    thresholdLiabilityDate: null,
  },
  unsupportedFacts: [],
}

const exampleParsed = parseProfile(exampleCandidate)
if (!exampleParsed.valid) throw new Error('The fictional example is invalid.')
export const exampleProfile = exampleParsed.profile

export function parseMoney(
  value: string,
): { value: number } | { error: string } {
  const trimmed = value.trim()
  if (!trimmed) return { error: 'Enter a whole-rupee amount.' }
  if (!/^(?:₹\s?)?[\d,]+$/.test(trimmed))
    return { error: 'Use a non-negative whole-rupee amount.' }
  const amount = Number(trimmed.replace(/^₹\s?/, '').replaceAll(',', ''))
  return Number.isSafeInteger(amount) && amount >= 0
    ? { value: amount }
    : { error: 'Use an amount within the supported whole-rupee range.' }
}

export function todayInIndia() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}
function requiredAmount(
  errors: Record<string, string>,
  draft: Draft,
  key: DraftAmountKey,
) {
  const parsed = parseMoney(draft.amounts[key])
  if ('error' in parsed) errors[key] = parsed.error
}

export function creditTriggerMayApply(draft: Draft) {
  const tds = parseMoney(draft.amounts.tds)
  const tcs = parseMoney(draft.amounts.tcs)
  return 'value' in tds && 'value' in tcs && tds.value + tcs.value >= 25_000
}

export function candidateFromDraft(draft: Draft) {
  const errors: Record<string, string> = {}
  const amountValues = Object.fromEntries(
    amountKeys.map((key) => [key, 0]),
  ) as Record<DraftAmountKey, number>
  const requiredKeys = [
    ...(draft.path === 'eligible-business'
      ? amountKeys.slice(0, 5)
      : amountKeys.slice(0, 3)),
    ...amountKeys.slice(5, 9),
    ...(draft.gstKind === 'unregistered' ? ['aggregateTurnover' as const] : []),
  ]
  for (const key of requiredKeys) {
    const parsed = parseMoney(draft.amounts[key])
    amountValues[key] = 'value' in parsed ? parsed.value : 0
  }
  const path =
    draft.path === 'eligible-business'
      ? {
          kind: 'eligible-business',
          confirmed: draft.pathConfirmed || 'not-sure',
          grossReceipts: amountValues.grossReceipts,
          qualifyingReceipts: amountValues.qualifyingReceipts,
          otherReceipts: amountValues.otherReceipts,
          cashReceipts: amountValues.cashReceipts,
          declaredProfit: amountValues.declaredProfit,
          notSpecifiedProfession: draft.pathConfirmed || 'not-sure',
          notGoodsCarriage: draft.notGoodsCarriage || 'not-sure',
          notAgencyCommissionBrokerage:
            draft.notAgencyCommissionBrokerage || 'not-sure',
          noChapterViiiCDeduction: draft.noChapterViiiCDeduction || 'not-sure',
          fiveYearExclusion: draft.fiveYearExclusion || 'not-sure',
        }
      : {
          kind: 'specified-profession',
          confirmed: draft.pathConfirmed || 'not-sure',
          grossReceipts: amountValues.grossReceipts,
          cashReceipts: amountValues.cashReceipts,
          declaredProfit: amountValues.declaredProfit,
        }
  const foreignSelected =
    draft.clientKind === 'foreign' || draft.clientKind === 'mixed'
  const platformSelected =
    draft.delivery === 'platform' || draft.delivery === 'both'
  const value = {
    taxYear: TAX_YEAR,
    person: {
      kind: draft.personKind || 'not-sure',
      adult: draft.adult || 'not-sure',
      residence: draft.residence || 'not-sure',
    },
    taxRegime: draft.taxRegime || 'not-sure',
    practice: {
      onePractice: draft.onePractice || 'not-sure',
      setupInIndia: draft.setupInIndia || 'not-sure',
      workInIndia: draft.workInIndia || 'not-sure',
      hasPartner: draft.hasPartner || 'not-sure',
      hasEmployee: draft.hasEmployee || 'not-sure',
      hasForeignOperation: draft.hasForeignOperation || 'not-sure',
      hasClientWorkSubcontractor:
        draft.hasClientWorkSubcontractor || 'not-sure',
      contractorBoundary: draft.contractorBoundary || 'not-sure',
    },
    activity: draft.activity || 'not-sure',
    incomePath: path,
    clients: {
      kind: draft.clientKind || 'not-sure',
      delivery: draft.delivery || 'not-sure',
      platform: platformSelected
        ? {
            ownAccount: draft.platformOwnAccount || 'not-sure',
            recipientIdentifiable:
              draft.platformRecipientIdentifiable || 'not-sure',
            grossBeforeFees: draft.platformGrossBeforeFees || 'not-sure',
            notEmploymentCommissionBrokerageRoyaltyLicensingAgency:
              draft.platformIncomeCharacter || 'not-sure',
            foreignFeeGstTreatment:
              draft.platformForeignFeeGstTreatment || 'not-sure',
            noRecipientReverseCharge:
              draft.platformNoRecipientReverseCharge || 'not-sure',
          }
        : null,
      foreign: foreignSelected
        ? {
            workPerformedInIndia: draft.foreignWorkInIndia || 'not-sure',
            recipientIdentifiable:
              draft.foreignRecipientIdentifiable || 'not-sure',
            ownAccount: draft.foreignOwnAccount || 'not-sure',
            ordinaryPlaceOfSupply: draft.foreignPlaceOfSupply || 'not-sure',
            sameEstablishment: draft.foreignSameEstablishment || 'not-sure',
            paymentRoute: draft.foreignPaymentRoute || 'not-sure',
            settledToIndianBank: draft.foreignSettledToIndianBank || 'not-sure',
            accountExposure: draft.foreignAccountExposure || 'not-sure',
            foreignOperation: draft.foreignOperation || 'not-sure',
            foreignTax: draft.foreignTax || 'not-sure',
            treatyRelief: draft.foreignTreatyRelief || 'not-sure',
            receiptsResolved: draft.foreignReceiptsResolved || 'not-sure',
            currencyResolved: draft.foreignCurrencyResolved || 'not-sure',
          }
        : null,
    },
    otherIncome: {
      taxableBankInterest: amountValues.taxableBankInterest,
      tds: amountValues.tds,
      tcs: amountValues.tcs,
      advanceTaxPaid: amountValues.advanceTaxPaid,
      ageSixtyOrOlder: draft.ageSixtyOrOlder || 'not-sure',
      otherAnnualReturnTrigger: draft.otherAnnualReturnTrigger || 'not-sure',
    },
    gst:
      draft.gstKind === 'registered'
        ? {
            kind: 'registered',
            status: draft.gstStatus || 'not-sure',
            state:
              draft.gstStatus === 'one-normal' ? draft.gstState || null : null,
          }
        : draft.gstKind === 'not-sure'
          ? { kind: 'registered', status: 'not-sure', state: null }
          : {
              kind: 'unregistered',
              state: draft.gstState,
              aggregateTurnover: amountValues.aggregateTurnover,
              turnoverComplete: draft.turnoverComplete || 'not-sure',
              compulsoryRegistration:
                draft.compulsoryRegistration || 'not-sure',
              thresholdLiabilityDate: draft.thresholdLiabilityDate || null,
            },
    unsupportedFacts:
      draft.unsupportedCertainty === 'not-sure'
        ? ['unsupportedFactsNotSure']
        : draft.unsupportedFacts,
  }
  for (const key of requiredKeys) {
    const parsed = parseMoney(draft.amounts[key])
    if ('error' in parsed) errors[key] = parsed.error
  }
  if (!draft.path) errors.path = 'Choose the income path used in your records.'
  if (!draft.clientKind) errors.clientKind = 'Choose a client branch.'
  if (!draft.gstKind)
    errors.gstKind = 'Choose whether you have ever had a GSTIN.'
  return { value, errors }
}
export function groupStep(group: ProfileGroup) {
  return {
    'tax-year': 0,
    activity: 1,
    receipts: 2,
    clients: 3,
    'other-income': 4,
    gst: 5,
    review: 6,
  }[group]
}

export function errorStep(key: string) {
  if (
    [
      'personKind',
      'adult',
      'residence',
      'taxRegime',
      'onePractice',
      'setupInIndia',
      'workInIndia',
      'hasPartner',
      'hasEmployee',
      'hasForeignOperation',
      'hasClientWorkSubcontractor',
      'contractorBoundary',
    ].includes(key)
  )
    return 0
  if (
    [
      'activity',
      'path',
      'pathConfirmed',
      'notGoodsCarriage',
      'notAgencyCommissionBrokerage',
      'noChapterViiiCDeduction',
      'fiveYearExclusion',
    ].includes(key)
  )
    return 1
  if (
    [
      'grossReceipts',
      'cashReceipts',
      'declaredProfit',
      'qualifyingReceipts',
      'otherReceipts',
    ].includes(key)
  )
    return 2
  if (
    key.startsWith('platform') ||
    key.startsWith('foreign') ||
    ['clientKind', 'delivery'].includes(key)
  )
    return 3
  if (
    [
      'taxableBankInterest',
      'tds',
      'tcs',
      'advanceTaxPaid',
      'ageSixtyOrOlder',
      'otherAnnualReturnTrigger',
      'unsupportedCertainty',
    ].includes(key)
  )
    return 4
  return 5
}

export function profileErrorKey(error: ProfileInputError) {
  const aliases: Record<string, string> = {
    kind:
      error.path === 'person.kind'
        ? 'personKind'
        : error.path === 'clients.kind'
          ? 'clientKind'
          : error.path === 'gst.kind'
            ? 'gstKind'
            : error.path === 'incomePath.kind'
              ? 'path'
              : 'review',
    platform: 'delivery',
    foreign: 'clientKind',
    person: 'personKind',
    practice: 'onePractice',
    incomePath: 'otherReceipts',
    otherIncome: 'otherAnnualReturnTrigger',
    gst: 'gstKind',
    unsupportedFacts: 'unsupportedCertainty',
  }
  const last = error.path.split('.').at(-1) ?? error.group
  return aliases[last] ?? last
}
export function validateDraftStep(
  draft: Draft,
  step: number,
  latestThresholdDate: string,
) {
  const nextErrors: Record<string, string> = {}
  if (step === 0) {
    if (!draft.personKind)
      nextErrors.personKind = 'Choose whether you are an individual.'
    if (!draft.adult) nextErrors.adult = 'Choose whether you are 18 or older.'
    if (!draft.residence)
      nextErrors.residence = 'Choose your Indian tax residence status.'
    if (!draft.taxRegime)
      nextErrors.taxRegime = 'Choose the tax regime you are using.'
    for (const [key, message] of [
      [
        'onePractice',
        'Choose whether you run one self-employed service practice.',
      ],
      [
        'setupInIndia',
        'Choose whether the practice is set up and managed in India.',
      ],
      ['workInIndia', 'Choose where you perform the work.'],
      ['hasPartner', 'Choose whether you have a business partner.'],
      ['hasEmployee', 'Choose whether you employ anyone.'],
      [
        'hasForeignOperation',
        'Choose whether the practice operates outside India.',
      ],
      [
        'hasClientWorkSubcontractor',
        'Choose whether a subcontractor helps deliver client work.',
      ],
    ] as const)
      if (!draft[key]) nextErrors[key] = message
    if (draft.hasClientWorkSubcontractor === 'no' && !draft.contractorBoundary)
      nextErrors.contractorBoundary =
        'Choose whether you use a support-only contractor in India.'
  }
  if (step === 1) {
    if (!draft.activity)
      nextErrors.activity = 'Choose the option that best describes your work.'
    if (!draft.path)
      nextErrors.path = 'Choose the tax method you use for this work.'
    if (draft.path && !draft.pathConfirmed)
      nextErrors.pathConfirmed =
        'Confirm the tax method for your whole practice.'
    if (draft.path === 'eligible-business') {
      const requiredFields: readonly [keyof Draft, string][] = [
        [
          'notGoodsCarriage',
          'Confirm that your practice provides services rather than transport goods.',
        ],
        [
          'notAgencyCommissionBrokerage',
          'Confirm that you provide services on your own account.',
        ],
        [
          'noChapterViiiCDeduction',
          'Choose whether you are claiming no Chapter VIII-C deduction.',
        ],
        [
          'fiveYearExclusion',
          'Choose whether the five-year exclusion applies to this method.',
        ],
      ]
      for (const [key, message] of requiredFields)
        if (!draft[key]) nextErrors[key] = message
    }
  }
  if (step === 2) {
    for (const key of draft.path === 'eligible-business'
      ? amountKeys.slice(0, 5)
      : amountKeys.slice(0, 3))
      requiredAmount(nextErrors, draft, key)
    const qualifying = parseMoney(draft.amounts.qualifyingReceipts)
    const gross = parseMoney(draft.amounts.grossReceipts)
    const otherReceipts = parseMoney(draft.amounts.otherReceipts)
    if (
      draft.path === 'eligible-business' &&
      'value' in qualifying &&
      'value' in gross &&
      qualifying.value > gross.value
    )
      nextErrors.qualifyingReceipts =
        'Qualifying receipts cannot exceed gross receipts.'
    if (
      draft.path === 'eligible-business' &&
      'value' in qualifying &&
      'value' in gross &&
      'value' in otherReceipts &&
      qualifying.value + otherReceipts.value !== gross.value
    )
      nextErrors.otherReceipts =
        'Qualifying and other receipts must add up to gross business receipts.'
  }
  if (step === 3) {
    if (!draft.clientKind)
      nextErrors.clientKind =
        'Choose whether clients are domestic, foreign, or mixed.'
    if (!draft.delivery)
      nextErrors.delivery =
        'Choose direct work, platform work, both, or Not sure.'
    if (draft.delivery === 'platform' || draft.delivery === 'both')
      for (const key of [
        'platformOwnAccount',
        'platformRecipientIdentifiable',
        'platformGrossBeforeFees',
        'platformIncomeCharacter',
        'platformNoRecipientReverseCharge',
      ] as const)
        if (!draft[key]) nextErrors[key] = 'Choose Yes, No, or Not sure.'
    if (
      (draft.delivery === 'platform' || draft.delivery === 'both') &&
      !draft.platformForeignFeeGstTreatment
    )
      nextErrors.platformForeignFeeGstTreatment =
        'Choose whether a foreign platform fee applies.'
    if (draft.clientKind === 'foreign' || draft.clientKind === 'mixed')
      for (const key of [
        'foreignWorkInIndia',
        'foreignRecipientIdentifiable',
        'foreignOwnAccount',
        'foreignPlaceOfSupply',
        'foreignSameEstablishment',
        'foreignSettledToIndianBank',
        'foreignOperation',
        'foreignTax',
        'foreignTreatyRelief',
        'foreignReceiptsResolved',
        'foreignCurrencyResolved',
      ] as const)
        if (!draft[key]) nextErrors[key] = 'Choose Yes, No, or Not sure.'
    if (
      (draft.clientKind === 'foreign' || draft.clientKind === 'mixed') &&
      !draft.foreignPaymentRoute
    )
      nextErrors.foreignPaymentRoute =
        'Choose a payment route, or choose Not sure.'
    if (
      (draft.clientKind === 'foreign' || draft.clientKind === 'mixed') &&
      !draft.foreignAccountExposure
    )
      nextErrors.foreignAccountExposure =
        'Choose whether these payments involve a foreign account or similar arrangement.'
  }
  if (step === 4) {
    for (const key of amountKeys.slice(5, 9))
      requiredAmount(nextErrors, draft, key)
    if (creditTriggerMayApply(draft) && !draft.ageSixtyOrOlder)
      nextErrors.ageSixtyOrOlder = 'Choose an age band for the return trigger.'
    if (!draft.otherAnnualReturnTrigger)
      nextErrors.otherAnnualReturnTrigger =
        'Choose whether another income-tax return trigger applies.'
    if (!draft.unsupportedCertainty)
      nextErrors.unsupportedCertainty =
        'Select any situations that apply, or choose None of these or Not sure.'
  }
  if (step === 5) {
    if (!draft.gstKind)
      nextErrors.gstKind = 'Choose whether you have ever had a GSTIN.'
    if (draft.gstKind === 'unregistered') {
      if (!draft.gstState)
        nextErrors.gstState = 'Choose a state or Union territory.'
      requiredAmount(nextErrors, draft, 'aggregateTurnover')
      if (!draft.turnoverComplete)
        nextErrors.turnoverComplete =
          'Choose whether this is your complete GST aggregate turnover.'
      if (!draft.compulsoryRegistration)
        nextErrors.compulsoryRegistration =
          'Choose whether another reason could require GST registration.'
      if (
        draft.thresholdLiabilityDate &&
        (draft.thresholdLiabilityDate < '2026-04-01' ||
          draft.thresholdLiabilityDate > latestThresholdDate)
      )
        nextErrors.thresholdLiabilityDate =
          'Choose a past or present date in 2026-27.'
    }
    if (draft.gstKind === 'registered') {
      if (!draft.gstStatus)
        nextErrors.gstStatus = 'Choose what describes your GST registration.'
      if (draft.gstStatus === 'one-normal' && !draft.gstState)
        nextErrors.gstState = 'Choose where your active GSTIN is registered.'
    }
  }
  return nextErrors
}
