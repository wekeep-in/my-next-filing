import type {
  Activity,
  AdditionalIncomeAmounts,
  GstCadence,
  GstExportRoute,
  Profile,
  ProfileGroup,
  ProfileInputError,
  RentalIncomeAmounts,
  TriState,
  UnsupportedFact,
} from '@/evaluation'
import { gstQuarterPeriods, parseProfile, screenProfile } from '@/evaluation'
import { TAX_YEAR, currentRules } from '@/rules'

type DraftChoice = '' | TriState
export type DraftPath = '' | 'specified-profession' | 'eligible-business'
export type DraftClientKind = '' | 'domestic' | 'foreign' | 'mixed' | 'not-sure'
export type DraftDelivery = '' | 'direct' | 'platform' | 'both' | 'not-sure'
export type DraftGstKind = '' | 'unregistered' | 'registered' | 'not-sure'
export type DraftGstStatus = '' | 'one-normal' | 'other' | 'not-sure'
export type DraftAmountKey =
  | 'shortTermGains'
  | 'longTermGains'
  | 'shortTermLosses'
  | 'longTermLosses'
  | keyof RentalIncomeAmounts
  | keyof AdditionalIncomeAmounts
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
  | 'grossSalary'

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
  readonly hasSalary: DraftChoice
  readonly salaryConfirmed: DraftChoice
  readonly hasEmployerNps: DraftChoice
  readonly employerNpsConfirmed: DraftChoice
  readonly employerNpsEmployers: readonly {
    readonly contribution: string
    readonly eligibleSalary: string
  }[]
  readonly hasEquityGains: DraftChoice
  readonly equityGainsConfirmed: DraftChoice
  readonly hasForeignAssets: DraftChoice
  readonly assetIncomeConfirmed: DraftChoice
  readonly hasRentalIncome: DraftChoice
  readonly rentalIncomeConfirmed: DraftChoice
  readonly rentalGstConfirmed: DraftChoice
  readonly hasAdditionalIncome: DraftChoice
  readonly additionalIncomeConfirmed: DraftChoice
  readonly ageSixtyOrOlder: DraftChoice
  readonly otherAnnualReturnTrigger: DraftChoice
  readonly unsupportedCertainty: '' | 'none' | 'selected' | 'not-sure'
  readonly unsupportedFacts: readonly UnsupportedFact[]
  readonly gstKind: DraftGstKind
  readonly gstStatus: DraftGstStatus
  readonly gstState: string
  readonly gstRegisteredFrom: string
  readonly gstContinuous: DraftChoice
  readonly gstQuarter1: '' | GstCadence
  readonly gstQuarter2: '' | GstCadence
  readonly gstQuarter3: '' | GstCadence
  readonly gstQuarter4: '' | GstCadence
  readonly gstExportRoute: '' | GstExportRoute
  readonly gstLutConfirmed: DraftChoice
  readonly gstFirstExportDate: string
  readonly turnoverComplete: DraftChoice
  readonly compulsoryRegistration: DraftChoice
  readonly thresholdLiabilityDate: string
}

export const equityGainFields = [
  { key: 'shortTermGains', label: 'Short-term equity gains' },
  { key: 'longTermGains', label: 'Long-term equity gains' },
  { key: 'shortTermLosses', label: 'Current-year short-term equity losses' },
  { key: 'longTermLosses', label: 'Current-year long-term equity losses' },
] as const
export const equityGainKeys = equityGainFields.map(({ key }) => key)

export const rentalIncomeFields = [
  { key: 'rentalAnnualValue', label: 'Annual value before municipal taxes' },
  { key: 'rentalMunicipalTaxes', label: 'Municipal taxes paid by you' },
  { key: 'rentalInterest', label: 'Eligible interest on the property loan' },
] as const satisfies readonly {
  readonly key: keyof RentalIncomeAmounts
  readonly label: string
}[]
export const rentalIncomeKeys = rentalIncomeFields.map(({ key }) => key)

export const additionalIncomeFields = [
  { key: 'dividends', label: 'Indian-company dividends' },
  { key: 'mutualFundDistributions', label: 'Indian mutual-fund distributions' },
  { key: 'postOfficeInterest', label: 'Taxable post-office interest' },
  { key: 'incomeTaxRefundInterest', label: 'Income-tax refund interest' },
] as const satisfies readonly {
  readonly key: keyof AdditionalIncomeAmounts
  readonly label: string
}[]
export const additionalIncomeKeys = additionalIncomeFields.map(({ key }) => key)

export const amountKeys: readonly DraftAmountKey[] = [
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
  'grossSalary',
  ...additionalIncomeKeys,
  ...equityGainKeys,
  ...rentalIncomeKeys,
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
  'convertible-foreign-exchange':
    'Foreign currency that can be freely exchanged',
  'rbi-permitted-rupee': 'Rupees through an RBI-permitted route',
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
  salary:
    'Salary outside the supported conditions, such as foreign salary, pension, arrears, or employee shares',
  houseProperty:
    'House-property income outside the supported rental conditions',
  dividendsOrGifts: 'Dividends or gifts selected in an earlier version',
  gifts: 'Gift income',
  unsupportedDividends:
    'Dividends or distributions outside the supported conditions, such as foreign dividends or REIT payouts',
  capitalGains:
    'Capital gains outside the supported domestic equity conditions',
  cryptoLotteryGaming: 'Crypto, lottery, or gaming income',
  agriculturalIncome: 'Agricultural income',
  unrelatedForeignIncome:
    'Foreign income other than the freelance receipts entered here',
  foreignAssets: 'Foreign assets outside the supported conditions',
  foreignTaxOrRelief:
    'Tax owed or paid abroad, or a claim for foreign-tax relief',
  deductionsLossesOrSpecialRate:
    'Deductions other than the supported salary, employer NPS and rental deductions, losses outside the current-year domestic equity conditions, or other unsupported special-rate income',
  disputedCredit: 'A dispute about your TDS or TCS tax credit',
  anotherBusinessOrProfession:
    'A business or profession in addition to the freelance work entered here',
  employeesOrDeductorDuties:
    'Employees, or a requirement to deduct tax and file TDS returns',
  auditRequirement: 'A required audit under tax law or another law',
  surchargeCase: 'Surcharge outside the supported ordinary-income band',
  goodsSales: 'Income from selling goods',
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

export const blankGstCalendarFields = {
  gstRegisteredFrom: '',
  gstContinuous: '',
  gstQuarter1: '',
  gstQuarter2: '',
  gstQuarter3: '',
  gstQuarter4: '',
  gstExportRoute: '',
  gstLutConfirmed: '',
  gstFirstExportDate: '',
} as const
export const gstQuarterFields = [
  'gstQuarter1',
  'gstQuarter2',
  'gstQuarter3',
  'gstQuarter4',
] as const
export const gstQuarterQuestions = (draft: Draft) =>
  gstQuarterPeriods(TAX_YEAR)
    .map((quarter, index) => ({ ...quarter, field: gstQuarterFields[index] }))
    .filter(
      ({ end }) => !draft.gstRegisteredFrom || end >= draft.gstRegisteredFrom,
    )

export const blankDraft = (): Draft => ({
  ...blankGstCalendarFields,
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
  hasSalary: '',
  salaryConfirmed: '',
  hasEmployerNps: '',
  employerNpsConfirmed: '',
  employerNpsEmployers: [],
  hasEquityGains: '',
  equityGainsConfirmed: '',
  hasForeignAssets: '',
  assetIncomeConfirmed: '',
  hasRentalIncome: '',
  rentalIncomeConfirmed: '',
  rentalGstConfirmed: '',
  hasAdditionalIncome: '',
  additionalIncomeConfirmed: '',
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
  const calendar =
    profile.gst.kind === 'registered' ? profile.gst.calendar : null
  amounts.grossReceipts = path.grossReceipts.toLocaleString('en-IN')
  amounts.cashReceipts = path.cashReceipts.toLocaleString('en-IN')
  amounts.declaredProfit = path.declaredProfit.toLocaleString('en-IN')
  amounts.taxableBankInterest =
    profile.otherIncome.taxableBankInterest.toLocaleString('en-IN')
  amounts.tds = profile.otherIncome.tds.toLocaleString('en-IN')
  amounts.tcs = profile.otherIncome.tcs.toLocaleString('en-IN')
  amounts.advanceTaxPaid =
    profile.otherIncome.advanceTaxPaid.toLocaleString('en-IN')
  const salary = profile.otherIncome.salary
  const gains = profile.otherIncome.equityGains
  if (gains.kind === 'domestic')
    for (const key of equityGainKeys)
      amounts[key] = gains[key].toLocaleString('en-IN')
  const assets = profile.otherIncome.foreignAssets
  const rental = profile.otherIncome.rentalIncome
  if (rental.kind === 'domestic')
    for (const key of rentalIncomeKeys)
      amounts[key] = rental[key].toLocaleString('en-IN')
  const additional = profile.otherIncome.additionalIncome
  if (additional.kind === 'domestic')
    for (const key of additionalIncomeKeys)
      amounts[key] = additional[key].toLocaleString('en-IN')
  if (salary.kind === 'domestic')
    amounts.grossSalary = salary.grossSalary.toLocaleString('en-IN')
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
    hasSalary:
      salary.kind === 'none'
        ? 'no'
        : salary.kind === 'domestic'
          ? 'yes'
          : 'not-sure',
    salaryConfirmed: salary.kind === 'domestic' ? salary.confirmed : '',
    hasEmployerNps:
      salary.kind !== 'domestic'
        ? ''
        : salary.employerNps.kind === 'none'
          ? 'no'
          : salary.employerNps.kind === 'contributions'
            ? 'yes'
            : 'not-sure',
    employerNpsConfirmed:
      salary.kind === 'domestic' && salary.employerNps.kind === 'contributions'
        ? salary.employerNps.confirmed
        : '',
    employerNpsEmployers:
      salary.kind === 'domestic' && salary.employerNps.kind === 'contributions'
        ? salary.employerNps.employers.map((employer) => ({
            contribution: employer.contribution.toLocaleString('en-IN'),
            eligibleSalary: employer.eligibleSalary.toLocaleString('en-IN'),
          }))
        : [],
    hasEquityGains:
      gains.kind === 'none'
        ? 'no'
        : gains.kind === 'domestic'
          ? 'yes'
          : 'not-sure',
    equityGainsConfirmed: gains.kind === 'domestic' ? gains.confirmed : '',
    hasForeignAssets:
      assets.kind === 'held'
        ? 'yes'
        : assets.kind === 'none'
          ? 'no'
          : 'not-sure',
    assetIncomeConfirmed: assets.kind !== 'none' ? assets.incomeConfirmed : '',
    hasRentalIncome:
      rental.kind === 'domestic'
        ? 'yes'
        : rental.kind === 'none'
          ? 'no'
          : 'not-sure',
    rentalIncomeConfirmed: rental.kind === 'domestic' ? rental.confirmed : '',
    rentalGstConfirmed: rental.kind === 'domestic' ? rental.gstConfirmed : '',
    hasAdditionalIncome:
      additional.kind === 'none'
        ? 'no'
        : additional.kind === 'domestic'
          ? 'yes'
          : 'not-sure',
    additionalIncomeConfirmed:
      additional.kind === 'domestic' ? additional.confirmed : '',
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
    gstRegisteredFrom: calendar?.registeredFrom ?? '',
    gstContinuous: calendar?.continuous ?? '',
    gstQuarter1: calendar?.cadences[0] ?? '',
    gstQuarter2: calendar?.cadences[1] ?? '',
    gstQuarter3: calendar?.cadences[2] ?? '',
    gstQuarter4: calendar?.cadences[3] ?? '',
    gstExportRoute: calendar?.exportRoute ?? '',
    gstLutConfirmed: calendar?.lutConfirmed ?? '',
    gstFirstExportDate: calendar?.firstExportDate ?? '',
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
    salary: { kind: 'none' },
    equityGains: { kind: 'none' },
    additionalIncome: { kind: 'none' },
    rentalIncome: { kind: 'none' },
    foreignAssets: { kind: 'none' },
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
  if (!/^(?:₹\s?)?[\d,]+$/.test(trimmed) || !/\d/.test(trimmed))
    return { error: 'Use a non-negative whole-rupee amount.' }
  const amount = Number(trimmed.replace(/^₹\s?/, '').replaceAll(',', ''))
  return Number.isSafeInteger(amount) && amount >= 0
    ? { value: amount }
    : { error: 'Use an amount within the supported whole-rupee range.' }
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

function candidateFromDraft(draft: Draft) {
  const errors: Record<string, string> = {}
  const amountValues = Object.fromEntries(
    amountKeys.map((key) => [key, 0]),
  ) as Record<DraftAmountKey, number>
  const requiredKeys = [
    ...(isBusinessPath(draft)
      ? amountKeys.slice(0, 5)
      : amountKeys.slice(0, 3)),
    ...amountKeys.slice(5, 9),
    ...(draft.hasSalary === 'yes' ? ['grossSalary' as const] : []),
    ...(draft.hasAdditionalIncome === 'yes' ? additionalIncomeKeys : []),
    ...(draft.hasRentalIncome === 'yes' ? rentalIncomeKeys : []),
    ...(draft.hasEquityGains === 'yes' ? equityGainKeys : []),
    ...(isUnregisteredGst(draft) ? ['aggregateTurnover' as const] : []),
  ]
  for (const key of requiredKeys) {
    const parsed = parseMoney(draft.amounts[key])
    amountValues[key] = 'value' in parsed ? parsed.value : 0
  }
  const path = isBusinessPath(draft)
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
  const foreignSelected = hasForeignClients(draft)
  const platformSelected = hasPlatformWork(draft)
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
      foreignAssets:
        draft.hasForeignAssets === 'no'
          ? { kind: 'none' }
          : {
              kind: draft.hasForeignAssets === 'yes' ? 'held' : 'possible',
              incomeConfirmed: draft.assetIncomeConfirmed || 'not-sure',
            },
      rentalIncome:
        draft.hasRentalIncome === 'yes'
          ? {
              kind: 'domestic',
              confirmed: draft.rentalIncomeConfirmed || 'not-sure',
              gstConfirmed: draft.rentalGstConfirmed || 'not-sure',
              rentalAnnualValue: amountValues.rentalAnnualValue,
              rentalMunicipalTaxes: amountValues.rentalMunicipalTaxes,
              rentalInterest: amountValues.rentalInterest,
            }
          : { kind: draft.hasRentalIncome === 'no' ? 'none' : 'not-sure' },
      equityGains:
        draft.hasEquityGains === 'yes'
          ? {
              kind: 'domestic',
              confirmed: draft.equityGainsConfirmed || 'not-sure',
              shortTermGains: amountValues.shortTermGains,
              longTermGains: amountValues.longTermGains,
              shortTermLosses: amountValues.shortTermLosses,
              longTermLosses: amountValues.longTermLosses,
            }
          : { kind: draft.hasEquityGains === 'no' ? 'none' : 'not-sure' },
      additionalIncome:
        draft.hasAdditionalIncome === 'yes'
          ? {
              kind: 'domestic',
              confirmed: draft.additionalIncomeConfirmed || 'not-sure',
              dividends: amountValues.dividends,
              mutualFundDistributions: amountValues.mutualFundDistributions,
              postOfficeInterest: amountValues.postOfficeInterest,
              incomeTaxRefundInterest: amountValues.incomeTaxRefundInterest,
            }
          : { kind: draft.hasAdditionalIncome === 'no' ? 'none' : 'not-sure' },
      salary:
        draft.hasSalary === 'yes'
          ? {
              kind: 'domestic',
              confirmed: draft.salaryConfirmed || 'not-sure',
              grossSalary: amountValues.grossSalary,
              employerNps:
                draft.hasEmployerNps === 'yes'
                  ? {
                      kind: 'contributions',
                      confirmed: draft.employerNpsConfirmed || 'not-sure',
                      employers: draft.employerNpsEmployers.map((employer) => {
                        const contribution = parseMoney(employer.contribution)
                        const eligibleSalary = parseMoney(
                          employer.eligibleSalary,
                        )
                        return {
                          contribution:
                            'value' in contribution ? contribution.value : 0,
                          eligibleSalary:
                            'value' in eligibleSalary
                              ? eligibleSalary.value
                              : 0,
                        }
                      }),
                    }
                  : {
                      kind: draft.hasEmployerNps === 'no' ? 'none' : 'not-sure',
                    },
            }
          : { kind: draft.hasSalary === 'no' ? 'none' : 'not-sure' },
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
            calendar:
              draft.gstStatus === 'one-normal'
                ? {
                    registeredFrom: draft.gstRegisteredFrom || null,
                    continuous: draft.gstContinuous || 'not-sure',
                    cadences: gstQuarterFields.map(
                      (field) => draft[field] || 'not-sure',
                    ),
                    exportRoute: draft.gstExportRoute || 'not-sure',
                    lutConfirmed:
                      draft.gstExportRoute === 'lut'
                        ? draft.gstLutConfirmed || 'not-sure'
                        : null,
                    firstExportDate:
                      draft.gstExportRoute === 'lut'
                        ? draft.gstFirstExportDate || null
                        : null,
                  }
                : null,
          }
        : draft.gstKind === 'not-sure'
          ? {
              kind: 'registered',
              status: 'not-sure',
              state: null,
              calendar: null,
            }
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
export const questionnaireGroups = [
  { id: 'tax-year', label: 'You and your practice' },
  { id: 'activity', label: 'Your work and tax method' },
  { id: 'receipts', label: 'Receipts and profit' },
  { id: 'clients', label: 'Clients and payments' },
  { id: 'other-income', label: 'Other income and tax paid' },
  { id: 'gst', label: 'GST registration and filings' },
  { id: 'review', label: 'Review your answers' },
] as const satisfies readonly {
  readonly id: ProfileGroup
  readonly label: string
}[]

export function questionnaireGroupFromPath(path: string): ProfileGroup | null {
  const canonical = path.replace(/\/$/, '')
  return (
    questionnaireGroups.find(({ id }) => canonical === `/check/${id}`)?.id ??
    null
  )
}

export function groupStep(group: ProfileGroup) {
  return questionnaireGroups.findIndex(({ id }) => id === group)
}

export const isBusinessPath = (draft: Draft) =>
  draft.path === 'eligible-business'
export const hasPlatformWork = (draft: Draft) =>
  draft.delivery === 'platform' || draft.delivery === 'both'
export const hasForeignClients = (draft: Draft) =>
  draft.clientKind === 'foreign' || draft.clientKind === 'mixed'
export const isUnregisteredGst = (draft: Draft) =>
  draft.gstKind === 'unregistered'

export type DraftError = {
  readonly field: string
  readonly group: ProfileGroup
  readonly message: string
}

export const isBlankDraft = (draft: Draft) =>
  Object.entries(draft).every(([key, value]) =>
    key === 'amounts'
      ? Object.values(draft.amounts).every((amount) => amount === '')
      : Array.isArray(value)
        ? value.length === 0
        : value === '',
  )

export function firstIncompleteGroup(
  draft: Draft,
  latestThresholdDate: string,
): ProfileGroup | null {
  return (
    questionnaireGroups.find(
      ({ id }) =>
        id !== 'review' &&
        validateDraftGroup(draft, id, latestThresholdDate).length > 0,
    )?.id ?? null
  )
}

export function completeDraft(
  draft: Draft,
  latestThresholdDate: string,
):
  | { readonly valid: true; readonly profile: Profile }
  | { readonly valid: false; readonly errors: readonly DraftError[] } {
  const errors = questionnaireGroups.flatMap(({ id }) =>
    validateDraftGroup(draft, id, latestThresholdDate),
  )
  if (errors.length) return { valid: false, errors }
  const candidate = candidateFromDraft(draft)
  if (Object.keys(candidate.errors).length)
    return {
      valid: false,
      errors: Object.entries(candidate.errors).map(([field, message]) => ({
        field,
        group: questionnaireGroups[errorStep(field)].id,
        message,
      })),
    }
  const parsed = parseProfile(candidate.value)
  return parsed.valid
    ? parsed
    : {
        valid: false,
        errors: parsed.errors.map((error) => ({
          field: profileErrorKey(error),
          group: error.group,
          message: error.message,
        })),
      }
}

function errorStep(key: string) {
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
    return groupStep('tax-year')
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
    return groupStep('activity')
  if (
    [
      'grossReceipts',
      'cashReceipts',
      'declaredProfit',
      'qualifyingReceipts',
      'otherReceipts',
    ].includes(key)
  )
    return groupStep('receipts')
  if (
    key.startsWith('platform') ||
    key.startsWith('foreign') ||
    ['clientKind', 'delivery'].includes(key)
  )
    return groupStep('clients')
  if (
    key.startsWith('employerNps') ||
    [
      'taxableBankInterest',
      'hasSalary',
      'hasEmployerNps',
      'hasEquityGains',
      'equityGainsConfirmed',
      ...equityGainKeys,
      'hasForeignAssets',
      'assetIncomeConfirmed',
      'hasRentalIncome',
      'rentalIncomeConfirmed',
      'rentalGstConfirmed',
      ...rentalIncomeKeys,
      'hasAdditionalIncome',
      'additionalIncomeConfirmed',
      ...additionalIncomeKeys,
      'salaryConfirmed',
      'grossSalary',
      'tds',
      'tcs',
      'advanceTaxPaid',
      'ageSixtyOrOlder',
      'otherAnnualReturnTrigger',
      'unsupportedCertainty',
    ].includes(key)
  )
    return groupStep('other-income')
  return groupStep('gst')
}

function profileErrorKey(error: ProfileInputError) {
  if (error.path.startsWith('otherIncome.foreignAssets'))
    return error.path.endsWith('.incomeConfirmed')
      ? 'assetIncomeConfirmed'
      : 'hasForeignAssets'
  if (error.path.startsWith('otherIncome.rentalIncome')) {
    const last = error.path.split('.').at(-1) ?? ''
    return last === 'confirmed'
      ? 'rentalIncomeConfirmed'
      : last === 'gstConfirmed'
        ? 'rentalGstConfirmed'
        : rentalIncomeKeys.includes(last as keyof RentalIncomeAmounts)
          ? last
          : 'hasRentalIncome'
  }
  if (error.path.startsWith('otherIncome.salary.employerNps')) {
    if (error.path.includes('.employers'))
      return error.path.replace(
        'otherIncome.salary.employerNps.employers',
        'employerNpsEmployers',
      )
    return error.path.endsWith('.confirmed')
      ? 'employerNpsConfirmed'
      : 'hasEmployerNps'
  }
  if (error.path.startsWith('otherIncome.equityGains')) {
    const last = error.path.split('.').at(-1)
    return last === 'confirmed' || last === 'total'
      ? 'equityGainsConfirmed'
      : last === 'shortTermGains' ||
          last === 'longTermGains' ||
          last === 'shortTermLosses' ||
          last === 'longTermLosses'
        ? last
        : 'hasEquityGains'
  }
  if (error.path.startsWith('otherIncome.additionalIncome')) {
    const last = error.path.split('.').at(-1) ?? ''
    return last === 'confirmed'
      ? 'additionalIncomeConfirmed'
      : last === 'total'
        ? 'dividends'
        : additionalIncomeKeys.includes(last as keyof AdditionalIncomeAmounts)
          ? last
          : 'hasAdditionalIncome'
  }
  if (error.path.startsWith('gst.calendar')) {
    const aliases: Record<string, string> = {
      registeredFrom: 'gstRegisteredFrom',
      continuous: 'gstContinuous',
      exportRoute: 'gstExportRoute',
      lutConfirmed: 'gstLutConfirmed',
      firstExportDate: 'gstFirstExportDate',
    }
    const last = error.path.split('.').at(-1) ?? ''
    return (
      aliases[last] ??
      (error.path.includes('.cadences.')
        ? gstQuarterFields[Number(last)]
        : 'gstContinuous')
    )
  }
  if (error.path.startsWith('otherIncome.salary'))
    return error.path.endsWith('.grossSalary')
      ? 'grossSalary'
      : error.path.endsWith('.confirmed')
        ? 'salaryConfirmed'
        : 'hasSalary'
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
    total: 'taxableBankInterest',
    gst: 'gstKind',
    unsupportedFacts: 'unsupportedCertainty',
  }
  const last = error.path.split('.').at(-1) ?? error.group
  return aliases[last] ?? last
}
function validateDraftGroup(
  draft: Draft,
  group: ProfileGroup,
  latestThresholdDate: string,
) {
  const nextErrors: Record<string, string> = {}
  if (group === 'tax-year') {
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
  if (group === 'activity') {
    if (!draft.activity)
      nextErrors.activity = 'Choose the option that best describes your work.'
    if (!draft.path)
      nextErrors.path = 'Choose the tax method you use for this work.'
    if (draft.path && !draft.pathConfirmed)
      nextErrors.pathConfirmed =
        'Confirm the tax method for your whole practice.'
    if (isBusinessPath(draft)) {
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
  if (group === 'receipts') {
    for (const key of isBusinessPath(draft)
      ? amountKeys.slice(0, 5)
      : amountKeys.slice(0, 3))
      requiredAmount(nextErrors, draft, key)
    const qualifying = parseMoney(draft.amounts.qualifyingReceipts)
    const gross = parseMoney(draft.amounts.grossReceipts)
    const otherReceipts = parseMoney(draft.amounts.otherReceipts)
    if (
      isBusinessPath(draft) &&
      'value' in qualifying &&
      'value' in gross &&
      qualifying.value > gross.value
    )
      nextErrors.qualifyingReceipts =
        'Qualifying receipts cannot exceed gross receipts.'
    if (
      isBusinessPath(draft) &&
      'value' in qualifying &&
      'value' in gross &&
      'value' in otherReceipts &&
      qualifying.value + otherReceipts.value !== gross.value
    )
      nextErrors.otherReceipts =
        'Qualifying and other receipts must add up to gross business receipts.'
  }
  if (group === 'clients') {
    if (!draft.clientKind)
      nextErrors.clientKind =
        'Choose whether clients are domestic, foreign, or mixed.'
    if (!draft.delivery)
      nextErrors.delivery =
        'Choose direct work, platform work, both, or Not sure.'
    if (hasPlatformWork(draft))
      for (const key of [
        'platformOwnAccount',
        'platformRecipientIdentifiable',
        'platformGrossBeforeFees',
        'platformIncomeCharacter',
        'platformNoRecipientReverseCharge',
      ] as const)
        if (!draft[key]) nextErrors[key] = 'Choose Yes, No, or Not sure.'
    if (hasPlatformWork(draft) && !draft.platformForeignFeeGstTreatment)
      nextErrors.platformForeignFeeGstTreatment =
        'Choose whether a foreign platform fee applies.'
    if (hasForeignClients(draft))
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
    if (hasForeignClients(draft) && !draft.foreignPaymentRoute)
      nextErrors.foreignPaymentRoute =
        'Choose a payment route, or choose Not sure.'
    if (hasForeignClients(draft) && !draft.foreignAccountExposure)
      nextErrors.foreignAccountExposure =
        'Choose whether these payments involve a foreign account or similar arrangement.'
  }
  if (group === 'other-income') {
    if (!draft.hasForeignAssets)
      nextErrors.hasForeignAssets =
        'Choose whether you held foreign assets or had signing authority.'
    if (
      draft.hasForeignAssets &&
      draft.hasForeignAssets !== 'no' &&
      !draft.assetIncomeConfirmed
    )
      nextErrors.assetIncomeConfirmed =
        'Confirm the income effects of these arrangements, or choose Not sure.'
    if (!draft.hasRentalIncome)
      nextErrors.hasRentalIncome = 'Choose whether you have rental income.'
    if (draft.hasRentalIncome === 'yes') {
      if (!draft.rentalIncomeConfirmed)
        nextErrors.rentalIncomeConfirmed =
          'Confirm the property conditions, or choose Not sure.'
      if (!draft.rentalGstConfirmed)
        nextErrors.rentalGstConfirmed =
          'Choose whether the rental GST conditions apply.'
      for (const key of rentalIncomeKeys) requiredAmount(nextErrors, draft, key)
    }

    if (!draft.hasEquityGains)
      nextErrors.hasEquityGains =
        'Choose whether you have domestic equity gains or losses.'
    if (draft.hasEquityGains === 'yes') {
      if (!draft.equityGainsConfirmed)
        nextErrors.equityGainsConfirmed =
          'Confirm the equity conditions and annual gains, or choose Not sure.'
      for (const key of equityGainKeys) requiredAmount(nextErrors, draft, key)
    }
    if (!draft.hasAdditionalIncome)
      nextErrors.hasAdditionalIncome =
        'Choose whether you have dividends or additional interest.'
    if (draft.hasAdditionalIncome === 'yes') {
      if (!draft.additionalIncomeConfirmed)
        nextErrors.additionalIncomeConfirmed =
          'Confirm the income types and annual amounts, or choose Not sure.'
      for (const key of additionalIncomeKeys)
        requiredAmount(nextErrors, draft, key)
    }
    if (!draft.hasSalary)
      nextErrors.hasSalary = 'Choose whether you have salary income.'
    if (draft.hasSalary === 'yes') {
      if (!draft.salaryConfirmed)
        nextErrors.salaryConfirmed =
          'Confirm whether your salary meets these conditions.'
      requiredAmount(nextErrors, draft, 'grossSalary')
      if (!draft.hasEmployerNps)
        nextErrors.hasEmployerNps =
          'Choose whether your employers contribute to NPS.'
      if (draft.hasEmployerNps === 'yes') {
        if (!draft.employerNpsConfirmed)
          nextErrors.employerNpsConfirmed =
            'Confirm the NPS and retirement-fund conditions, or choose Not sure.'
        if (draft.employerNpsEmployers.length === 0)
          nextErrors.employerNpsEmployers =
            'Add the NPS amounts for at least one employer.'
        draft.employerNpsEmployers.forEach((employer, index) => {
          for (const key of ['contribution', 'eligibleSalary'] as const) {
            const parsed = parseMoney(employer[key])
            if ('error' in parsed)
              nextErrors[`employerNpsEmployers.${index}.${key}`] = parsed.error
          }
        })
      }
    }
    for (const key of amountKeys.slice(5, 9))
      requiredAmount(nextErrors, draft, key)
    if (creditTriggerMayApply(draft) && !draft.ageSixtyOrOlder)
      nextErrors.ageSixtyOrOlder = 'Choose an age band for the return trigger.'
    if (!draft.otherAnnualReturnTrigger)
      nextErrors.otherAnnualReturnTrigger =
        'Choose whether another income-tax return trigger applies.'
    if (!draft.unsupportedCertainty)
      nextErrors.unsupportedCertainty =
        "Select any situations that apply, or choose None of these apply or I'm not sure."
  }
  if (group === 'gst') {
    if (!draft.gstKind)
      nextErrors.gstKind = 'Choose whether you have ever had a GSTIN.'
    if (isUnregisteredGst(draft)) {
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
        (draft.thresholdLiabilityDate < currentRules.effectiveStart ||
          draft.thresholdLiabilityDate > latestThresholdDate)
      )
        nextErrors.thresholdLiabilityDate = `Choose a past or present date in ${TAX_YEAR}.`
    }
    if (draft.gstKind === 'registered') {
      if (!draft.gstStatus)
        nextErrors.gstStatus = 'Choose what describes your GST registration.'
      if (draft.gstStatus === 'one-normal' && !draft.gstState)
        nextErrors.gstState = 'Choose where your active GSTIN is registered.'
      if (draft.gstStatus === 'one-normal') {
        if (!draft.gstContinuous)
          nextErrors.gstContinuous =
            'Confirm the registration history and first filing period.'
        for (const { field } of gstQuarterQuestions(draft))
          if (!draft[field])
            nextErrors[field] =
              'Choose the portal-confirmed frequency, or Not sure.'
        if (!draft.gstExportRoute)
          nextErrors.gstExportRoute = 'Choose your export route, or Not sure.'
        if (draft.gstExportRoute === 'lut' && !draft.gstLutConfirmed)
          nextErrors.gstLutConfirmed =
            'Confirm LUT eligibility, or choose Not sure.'
        if (
          draft.gstRegisteredFrom &&
          (draft.gstRegisteredFrom < '2017-07-01' ||
            draft.gstRegisteredFrom > latestThresholdDate)
        )
          nextErrors.gstRegisteredFrom =
            'Choose a past or present effective registration date from 1 July 2017 onward.'
        if (
          draft.gstFirstExportDate &&
          (draft.gstFirstExportDate < currentRules.effectiveStart ||
            draft.gstFirstExportDate > currentRules.effectiveEnd)
        )
          nextErrors.gstFirstExportDate =
            'Choose the first export date in this Tax Year.'
      }
    }
  }
  return Object.entries(nextErrors).map(([field, message]): DraftError => ({
    field,
    group,
    message,
  }))
}

// Dependencies name the answers needed for a reason, not a second set of tax rules.
function draftFeedback(draft: Draft, latestDate: string) {
  const screening = screenProfile(
    candidateFromDraft(draft).value,
    new Date(`${latestDate}T12:00:00+05:30`),
    currentRules,
  )
  const hasAnswer = (field: string) =>
    amountKeys.includes(field as DraftAmountKey)
      ? 'value' in parseMoney(draft.amounts[field as DraftAmountKey])
      : Boolean(draft[field as keyof Draft])
  const receipts = isBusinessPath(draft)
    ? ['path', 'pathConfirmed', ...amountKeys.slice(0, 5)]
    : ['path', 'pathConfirmed', ...amountKeys.slice(0, 3)]
  const dependencies: Record<string, readonly string[]> = {
    'person-kind': ['personKind'],
    adult: ['adult'],
    residence: ['residence'],
    'tax-regime': ['taxRegime'],
    'one-practice': ['onePractice'],
    'practice-location': ['setupInIndia'],
    'work-location': ['workInIndia'],
    partner: ['hasPartner'],
    employee: ['hasEmployee'],
    'foreign-operation': ['hasForeignOperation'],
    'client-work-subcontractor': ['hasClientWorkSubcontractor'],
    'contractor-boundary': ['contractorBoundary'],
    activity: ['activity'],
    'income-path-confirmation': ['pathConfirmed'],
    'business-not-profession': ['pathConfirmed'],
    'business-not-goods': ['notGoodsCarriage'],
    'business-not-agency': ['notAgencyCommissionBrokerage'],
    'business-no-deduction': ['noChapterViiiCDeduction'],
    'business-five-year-exclusion': ['fiveYearExclusion'],
    'profession-profit-floor': [
      'pathConfirmed',
      'grossReceipts',
      'declaredProfit',
    ],
    'profession-receipt-limit': [
      'pathConfirmed',
      'grossReceipts',
      'cashReceipts',
    ],
    'business-profit-floor': [
      'qualifyingReceipts',
      'otherReceipts',
      'declaredProfit',
    ],
    'business-receipt-limit': ['grossReceipts', 'cashReceipts'],
    'income-ceiling': receipts,
    'salary-scope':
      draft.hasSalary === 'yes' ? ['salaryConfirmed'] : ['hasSalary'],
    'employer-nps-scope':
      draft.hasEmployerNps === 'yes'
        ? ['employerNpsConfirmed']
        : ['hasEmployerNps'],
    'employer-nps-allocation': ['employerNpsConfirmed'],
    'equity-gains-scope':
      draft.hasEquityGains === 'yes'
        ? ['equityGainsConfirmed']
        : ['hasEquityGains'],
    'equity-basic-exemption-allocation': [
      'equityGainsConfirmed',
      ...equityGainKeys,
      ...receipts,
    ],
    'foreign-assets-income-scope':
      draft.hasForeignAssets && draft.hasForeignAssets !== 'no'
        ? ['assetIncomeConfirmed']
        : ['hasForeignAssets'],
    'rental-income-scope':
      draft.hasRentalIncome === 'yes'
        ? ['rentalIncomeConfirmed']
        : ['hasRentalIncome'],
    'rental-income-loss': ['rentalIncomeConfirmed', ...rentalIncomeKeys],
    'additional-income-scope':
      draft.hasAdditionalIncome === 'yes'
        ? ['additionalIncomeConfirmed']
        : ['hasAdditionalIncome'],
    'client-branch-uncertain':
      draft.clientKind === 'not-sure'
        ? ['clientKind']
        : draft.delivery === 'not-sure'
          ? ['delivery']
          : [],
    'platform-own-account': ['platformOwnAccount'],
    'platform-recipient': ['platformRecipientIdentifiable'],
    'platform-gross': ['platformGrossBeforeFees'],
    'platform-income-character': ['platformIncomeCharacter'],
    'platform-reverse-charge': ['platformNoRecipientReverseCharge'],
    'platform-fee-gst': ['platformForeignFeeGstTreatment'],
    'foreign-work-location': ['foreignWorkInIndia'],
    'foreign-recipient': ['foreignRecipientIdentifiable'],
    'foreign-own-account': ['foreignOwnAccount'],
    'foreign-place-of-supply': ['foreignPlaceOfSupply'],
    'foreign-establishment': ['foreignSameEstablishment'],
    'foreign-payment-route': ['foreignPaymentRoute'],
    'foreign-indian-settlement': ['foreignSettledToIndianBank'],
    'foreign-tax': ['foreignTax'],
    'foreign-treaty-relief': ['foreignTreatyRelief'],
    'foreign-receipts-resolved': ['foreignReceiptsResolved'],
    'foreign-currency-resolved': ['foreignCurrencyResolved'],
  }
  const warnings: DraftError[] = []
  for (const fact of screening.facts) {
    const fields =
      fact.code === 'foreign-operation' && fact.correctionGroup === 'clients'
        ? ['foreignOperation']
        : (dependencies[fact.code] ??
          (fact.correctionGroup === 'review' ? ['unsupportedCertainty'] : []))
    if (!fields.length || !fields.every(hasAnswer)) continue
    let field = fields[0]
    if (fact.correctionGroup === 'receipts')
      field = fact.code.includes('receipt-limit')
        ? 'grossReceipts'
        : 'declaredProfit'
    if (
      fact.code === 'income-ceiling' &&
      fact.correctionGroup === 'other-income' &&
      (hasAnswer('grossSalary') || hasAnswer('taxableBankInterest'))
    )
      field =
        draft.hasSalary === 'yes' && hasAnswer('grossSalary')
          ? 'grossSalary'
          : 'taxableBankInterest'
    if (
      fact.code === 'income-ceiling' &&
      fact.correctionGroup === 'other-income' &&
      draft.hasAdditionalIncome === 'yes'
    ) {
      const extra = additionalIncomeKeys.find((key) => {
        const amount = parseMoney(draft.amounts[key])
        return 'value' in amount && amount.value > 0
      })
      if (extra) field = extra
    }
    if (
      fact.code === 'income-ceiling' &&
      fact.correctionGroup === 'other-income' &&
      draft.hasEquityGains === 'yes'
    ) {
      const positive = (['shortTermGains', 'longTermGains'] as const).find(
        (key) => {
          const amount = parseMoney(draft.amounts[key])
          return 'value' in amount && amount.value > 0
        },
      )
      if (positive) field = positive
    }
    if (
      fact.code === 'income-ceiling' &&
      fact.correctionGroup === 'other-income' &&
      draft.hasRentalIncome === 'yes'
    )
      field = 'rentalAnnualValue'
    if (fact.code === 'rental-income-loss') field = 'rentalInterest'
    if (fact.code === 'client-branch-uncertain')
      field = draft.clientKind === 'not-sure' ? 'clientKind' : 'delivery'
    warnings.push({
      field,
      group: questionnaireGroups[errorStep(field)].id,
      message: fact.reason,
    })
  }
  const errors = screening.errors.flatMap((error) => {
    const field = profileErrorKey(error)
    if (!hasAnswer(field)) return []
    if (field === 'cashReceipts' && !hasAnswer('grossReceipts')) return []
    if (
      field === 'otherReceipts' &&
      !['grossReceipts', 'qualifyingReceipts', 'otherReceipts'].every(hasAnswer)
    )
      return []
    return [{ field, group: error.group, message: error.message }]
  })
  const coverage: DraftError[] = []
  for (const notice of screening.coverage) {
    let field: string | undefined
    if (notice.code === 'rental-gst-review' && draft.rentalGstConfirmed)
      field = 'rentalGstConfirmed'
    if (draft.gstKind === 'registered') {
      if (notice.code === 'gst-calendar-rules') field = 'gstKind'
      if (
        notice.code === 'gst-calendar-scope' &&
        (draft.gstStatus !== 'one-normal' || draft.gstContinuous)
      )
        field = draft.gstStatus === 'one-normal' ? 'gstContinuous' : 'gstStatus'
      if (notice.code === 'gst-calendar-start' && draft.gstContinuous)
        field = 'gstRegisteredFrom'
      if (notice.code.startsWith('gst-quarter-')) {
        const quarterField = gstQuarterFields[Number(notice.code.slice(-1))]
        if (draft[quarterField]) field = quarterField
      }
      if (notice.code === 'gst-lut-rules') field = 'gstExportRoute'
      if (notice.code === 'gst-lut-facts' && draft.gstExportRoute)
        field =
          draft.gstExportRoute === 'lut' ? 'gstLutConfirmed' : 'gstExportRoute'
      if (notice.code === 'gst-lut-date' && draft.gstLutConfirmed)
        field = 'gstFirstExportDate'
    }
    if (notice.code === 'gst-fact-uncertain' && isUnregisteredGst(draft)) {
      if (draft.turnoverComplete && draft.turnoverComplete !== 'yes')
        field = 'turnoverComplete'
      else if (
        draft.compulsoryRegistration &&
        draft.compulsoryRegistration !== 'no'
      )
        field = 'compulsoryRegistration'
    }
    if (
      notice.code === 'gst-liability-date-uncertain' &&
      draft.gstState &&
      hasAnswer('aggregateTurnover') &&
      draft.turnoverComplete === 'yes' &&
      draft.compulsoryRegistration === 'no'
    )
      field = 'thresholdLiabilityDate'
    if (
      notice.code === 'foreign-account-coverage' &&
      hasForeignClients(draft) &&
      draft.foreignAccountExposure
    )
      field =
        draft.hasForeignAssets === 'not-sure'
          ? 'hasForeignAssets'
          : 'foreignAccountExposure'
    if (
      notice.code === 'foreign-account-coverage' &&
      draft.hasForeignAssets === 'not-sure'
    )
      field = 'hasForeignAssets'
    if (
      notice.code === 'annual-return-foreign-assets-uncertain' &&
      draft.hasForeignAssets
    )
      field =
        draft.hasForeignAssets === 'not-sure'
          ? 'hasForeignAssets'
          : 'foreignAccountExposure'
    if (
      notice.code === 'annual-return-trigger-uncertain' &&
      draft.otherAnnualReturnTrigger
    )
      field = 'otherAnnualReturnTrigger'
    if (
      notice.code === 'annual-return-age-uncertain' &&
      hasAnswer('tds') &&
      hasAnswer('tcs') &&
      draft.ageSixtyOrOlder
    )
      field = 'ageSixtyOrOlder'
    if (field)
      coverage.push({
        field,
        group: questionnaireGroups[errorStep(field)].id,
        message: notice.reason,
      })
  }
  return { warnings, errors, coverage, stale: screening.stale }
}

type QuestionnaireProgression =
  | { readonly kind: 'blocked'; readonly issue: DraftError | null }
  | { readonly kind: 'next'; readonly group: ProfileGroup }
  | { readonly kind: 'complete' }

const fieldMessages = (items: readonly DraftError[]) =>
  Object.fromEntries(items.map(({ field, message }) => [field, message]))

export function assessQuestionnaire(
  {
    draft,
    validationGroup,
  }: {
    readonly draft: Draft
    readonly validationGroup?: ProfileGroup | null
  },
  group: ProfileGroup,
  latestDate: string,
  touched: ReadonlySet<string> = new Set(),
) {
  const feedback = draftFeedback(draft, latestDate)
  const groups = questionnaireGroups.map(({ id }) => {
    const required = validateDraftGroup(draft, id, latestDate)
    return {
      id,
      required,
      blocking: [
        ...required,
        ...feedback.errors.filter((item) => item.group === id),
        ...feedback.warnings.filter((item) => item.group === id),
      ],
    }
  })
  const current = groups[groupStep(group)]
  const blocked = groups.find(
    ({ id, blocking }) => id !== 'review' && blocking.length > 0,
  )
  const availableGroups = groups
    .filter(({ id }) => !blocked || groupStep(id) <= groupStep(blocked.id))
    .map(({ id }) => id)
  const accessible = availableGroups.includes(group)
  const exposed = validationGroup ? groups[groupStep(validationGroup)] : null
  // Completion remains independent of supported scope, including during restoration.
  const completed =
    group === 'review' || (exposed && !exposed.required.length)
      ? completeDraft(draft, latestDate)
      : null
  const exposedErrors = exposed?.required.length
    ? exposed.required
    : completed && !completed.valid
      ? completed.errors.filter((item) => item.group === validationGroup)
      : []
  const errors = fieldMessages([
    ...exposedErrors,
    ...current.required.filter(
      ({ field }) =>
        touched.has(field) ||
        Boolean(
          field in draft.amounts
            ? draft.amounts[field as DraftAmountKey]
            : draft[field as keyof Draft],
        ),
    ),
    ...feedback.errors,
  ])
  const issue = (accessible ? current : blocked)?.blocking[0] ?? null
  let progression: QuestionnaireProgression = { kind: 'blocked', issue }
  if (accessible && !issue && !feedback.stale) {
    if (group !== 'review')
      progression = {
        kind: 'next',
        group: questionnaireGroups[groupStep(group) + 1].id,
      }
    else if (completed?.valid) progression = { kind: 'complete' }
    else progression = { kind: 'blocked', issue: completed?.errors[0] ?? null }
  }
  return {
    errors,
    warnings: fieldMessages(feedback.warnings),
    coverage: fieldMessages(feedback.coverage),
    stale: feedback.stale,
    availableGroups,
    redirectGroup: accessible ? null : (blocked?.id ?? null),
    resumeGroup:
      groups.find(({ required }) => required.length > 0)?.id ?? 'review',
    progression,
  }
}
