import { useEffect, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import type {
  Activity,
  Profile,
  ProfileInputError,
  ProfileGroup,
  TriState,
  UnsupportedFact,
} from '../evaluation/index.ts'
import { DatePicker, SelectControl } from '../form-controls.tsx'
import { parseProfile } from '../evaluation/index.ts'
import type { AppOutletContext } from '../app.tsx'
import {
  clearCurrentCheck,
  getCurrentCheck,
  setCurrentCheck,
} from '../current-check.ts'
import {
  JourneySidebar,
  calculationStep,
  questionnaireSteps,
} from '../journey-sidebar.tsx'
import { TAX_YEAR } from '../rules/index.ts'

type DraftChoice = '' | TriState
type DraftPath = '' | 'specified-profession' | 'eligible-business'
type DraftClientKind = '' | 'domestic' | 'foreign' | 'mixed' | 'not-sure'
type DraftDelivery = '' | 'direct' | 'platform' | 'not-sure'
type DraftGstKind = '' | 'unregistered' | 'registered' | 'not-sure'
type DraftGstStatus = '' | 'one-normal' | 'other' | 'not-sure'
type DraftAmountKey =
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

type Draft = {
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

const statesAndUnionTerritories = [
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

const unsupportedFactLabels: Record<UnsupportedFact, string> = {
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
  otherUnsupportedFacts: 'Another unsupported fact',
}

const blankAmounts = (): Record<DraftAmountKey, string> =>
  Object.fromEntries(amountKeys.map((key) => [key, ''])) as Record<
    DraftAmountKey,
    string
  >

const blankDraft = (): Draft => ({
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

function draftFromProfile(profile: Profile): Draft {
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
    unsupportedCertainty: profile.unsupportedFacts.length ? 'selected' : 'none',
    unsupportedFacts: profile.unsupportedFacts,
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
const exampleProfile = exampleParsed.profile

function parseMoney(value: string): { value: number } | { error: string } {
  const trimmed = value.trim()
  if (!trimmed) return { error: 'Enter a whole-rupee amount.' }
  if (!/^(?:₹\s?)?[\d,]+$/.test(trimmed))
    return { error: 'Use a non-negative whole-rupee amount.' }
  const amount = Number(trimmed.replace(/^₹\s?/, '').replaceAll(',', ''))
  return Number.isSafeInteger(amount) && amount >= 0
    ? { value: amount }
    : { error: 'Use an amount within the supported whole-rupee range.' }
}

function FieldError({
  id,
  error,
}: {
  readonly id: string
  readonly error?: string
}) {
  return error ? (
    <p className="field-error" id={id} role="alert">
      {error}
    </p>
  ) : null
}

function ChoiceField({
  id,
  label,
  help,
  value,
  options = ['yes', 'no', 'not-sure'],
  labels,
  error,
  onChange,
}: {
  readonly id: string
  readonly label: string
  readonly help?: string
  readonly value: string
  readonly options?: readonly string[]
  readonly labels?: Readonly<Record<string, string>>
  readonly error?: string
  readonly onChange: (value: string) => void
}) {
  const optionLabels: Record<string, string> = {
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
    'one-normal': 'One active normal-taxpayer GSTIN',
    other: 'Another or uncertain GST state',
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
    unregistered: 'No active GSTIN',
    registered: 'An active GSTIN',
    applies: 'It applies',
    'specified-profession': 'Specified professional path',
    'eligible-business': 'Eligible business path',
    'other-digital-service': 'Another digital service',
  }
  const describedBy = [help ? `${id}-help` : '', error ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ')
  return (
    <fieldset
      id={id}
      tabIndex={-1}
      className="field choice-field"
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy || undefined}
    >
      <legend>{label}</legend>
      {help && (
        <p className="field-help" id={`${id}-help`}>
          {help}
        </p>
      )}
      <div className="choice-grid">
        {options.map((option) => (
          <label className="choice-card" key={option}>
            <input
              type="radio"
              name={id}
              value={option}
              checked={value === option}
              onChange={(event) => onChange(event.target.value)}
            />
            <span>{labels?.[option] ?? optionLabels[option] ?? option}</span>
          </label>
        ))}
      </div>
      <FieldError id={`${id}-error`} error={error} />
    </fieldset>
  )
}

function SelectField({
  id,
  label,
  help,
  value,
  options,
  error,
  onChange,
}: {
  readonly id: string
  readonly label: string
  readonly help?: string
  readonly value: string
  readonly options: readonly {
    readonly value: string
    readonly label: string
  }[]
  readonly error?: string
  readonly onChange: (value: string) => void
}) {
  const describedBy = [help ? `${id}-help` : '', error ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ')
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {help && (
        <p className="field-help" id={`${id}-help`}>
          {help}
        </p>
      )}
      <SelectControl
        id={id}
        value={value}
        describedBy={describedBy || undefined}
        invalid={Boolean(error)}
        options={options}
        onChange={onChange}
      />
      <FieldError id={`${id}-error`} error={error} />
    </div>
  )
}

function MoneyField({
  id,
  label,
  help,
  value,
  error,
  onChange,
}: {
  readonly id: DraftAmountKey
  readonly label: string
  readonly help: string
  readonly value: string
  readonly error?: string
  readonly onChange: (value: string) => void
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <p className="field-help" id={`${id}-help`}>
        {help}
      </p>
      <div className="money-input">
        <span aria-hidden="true">₹</span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={value}
          aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => {
            const parsed = parseMoney(value)
            if ('value' in parsed)
              onChange(parsed.value.toLocaleString('en-IN'))
          }}
        />
      </div>
      <FieldError id={`${id}-error`} error={error} />
    </div>
  )
}

function CheckHeading({
  title,
  description,
  first = false,
}: {
  readonly title: string
  readonly description?: string
  readonly first?: boolean
}) {
  return (
    <header className="question-heading">
      <span className="period-pill">
        {first ? 'Tax year 2026-27' : TAX_YEAR}
      </span>
      <h1 id="check-title" tabIndex={-1}>
        {title}
      </h1>
      {description && <p>{description}</p>}
    </header>
  )
}

function requiredAmount(
  errors: Record<string, string>,
  draft: Draft,
  key: DraftAmountKey,
) {
  const parsed = parseMoney(draft.amounts[key])
  if ('error' in parsed) errors[key] = parsed.error
}

function creditTriggerMayApply(draft: Draft) {
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
  const platformSelected = draft.delivery === 'platform'
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
        ? [...new Set([...draft.unsupportedFacts, 'otherUnsupportedFacts'])]
        : draft.unsupportedFacts,
  }
  for (const key of requiredKeys) {
    const parsed = parseMoney(draft.amounts[key])
    if ('error' in parsed) errors[key] = parsed.error
  }
  if (!draft.path) errors.path = 'Choose the income path used in your records.'
  if (!draft.clientKind) errors.clientKind = 'Choose a client branch.'
  if (!draft.gstKind) errors.gstKind = 'Choose a GST branch.'
  return { value, errors }
}

function ErrorSummary({ errors }: { readonly errors: Record<string, string> }) {
  const entries = Object.entries(errors)
  if (entries.length === 0) return null
  return (
    <div className="error-summary" role="alert" tabIndex={-1}>
      <strong>Check these answers:</strong>
      <ul>
        {entries.map(([key, message]) => (
          <li key={key}>{message}</li>
        ))}
      </ul>
    </div>
  )
}

function groupStep(group: ProfileGroup) {
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

function profileErrorKey(error: ProfileInputError) {
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
    incomePath: 'path',
    otherIncome: 'otherAnnualReturnTrigger',
    gst: 'gstKind',
    unsupportedFacts: 'unsupportedCertainty',
  }
  const last = error.path.split('.').at(-1) ?? error.group
  return aliases[last] ?? last
}

function UnsupportedFactsField({
  draft,
  setDraft,
  error,
}: {
  readonly draft: Draft
  readonly setDraft: (patch: Partial<Draft>) => void
  readonly error?: string
}) {
  const options = Object.entries(unsupportedFactLabels) as [
    UnsupportedFact,
    string,
  ][]
  return (
    <fieldset className="field unsupported-facts" aria-invalid={Boolean(error)}>
      <legend>Do any of these facts apply?</legend>
      <p className="field-help">
        Select every fact that applies. This version stops rather than
        estimating around it.
      </p>
      <ChoiceField
        id="unsupportedCertainty"
        label="Your answer"
        help="Choose Not sure if you cannot confirm the list."
        options={['none', 'selected', 'not-sure']}
        value={draft.unsupportedCertainty}
        onChange={(value) =>
          setDraft({
            unsupportedCertainty: value as Draft['unsupportedCertainty'],
          })
        }
      />
      {draft.unsupportedCertainty === 'selected' && (
        <div className="check-list">
          {options.map(([value, label]) => (
            <label key={value}>
              <input
                type="checkbox"
                checked={draft.unsupportedFacts.includes(value)}
                onChange={(event) =>
                  setDraft({
                    unsupportedFacts: event.target.checked
                      ? [...draft.unsupportedFacts, value]
                      : draft.unsupportedFacts.filter((fact) => fact !== value),
                  })
                }
              />{' '}
              {label}
            </label>
          ))}
        </div>
      )}
      <FieldError id="unsupported-facts-error" error={error} />
    </fieldset>
  )
}

function GroupSummary({
  draft,
  onEdit,
}: {
  readonly draft: Draft
  readonly onEdit: (step: number) => void
}) {
  const pathLabel =
    draft.path === 'eligible-business'
      ? 'Eligible business'
      : draft.path === 'specified-profession'
        ? 'Specified profession'
        : 'Not selected'
  const clientLabel = draft.clientKind || 'Not selected'
  return (
    <div className="review-list">
      {[
        [
          'You and your practice',
          `${draft.personKind || 'Person not selected'}; ${draft.residence || 'residence not selected'}; ${draft.taxRegime || 'tax regime not selected'}.`,
          0,
        ],
        [
          'Your work and tax method',
          `${draft.activity || 'Activity not selected'}; ${pathLabel}.`,
          1,
        ],
        [
          'Receipts and profit',
          `${draft.amounts.grossReceipts || 'No gross receipts'} gross receipts; ${draft.amounts.declaredProfit || 'no declared profit'} declared profit.`,
          2,
        ],
        [
          'Clients and payments',
          `${clientLabel}; ${draft.delivery || 'delivery method not selected'}.`,
          3,
        ],
        [
          'Other income and tax paid',
          `${draft.amounts.taxableBankInterest || '0'} interest; ${draft.amounts.tds || '0'} TDS; ${draft.amounts.advanceTaxPaid || '0'} advance tax paid.`,
          4,
        ],
        [
          'GST and filing',
          `${draft.gstKind || 'GST branch not selected'}${draft.gstState ? `; ${draft.gstState}` : ''}.`,
          5,
        ],
      ].map(([title, text, step]) => (
        <article key={title as string}>
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <button
            className="text-button"
            type="button"
            onClick={() => onEdit(step as number)}
          >
            Edit
          </button>
        </article>
      ))}
    </div>
  )
}

export function CheckRoute() {
  const location = useLocation()
  const navigate = useNavigate()
  const { savedWorkspace } = useOutletContext<AppOutletContext>()
  const routeState = location.state as {
    readonly example?: boolean
    readonly personal?: boolean
    readonly editSaved?: boolean
    readonly animate?: boolean
    readonly step?: number
  } | null
  const currentCheck = getCurrentCheck()
  const [usingExample] = useState(
    Boolean(routeState?.example) ||
      Boolean(currentCheck?.example && !routeState?.personal),
  )
  const startingProfile = usingExample
    ? exampleProfile
    : routeState?.personal
      ? null
      : (currentCheck?.profile ??
        (routeState?.editSaved &&
        savedWorkspace.kind === 'ready' &&
        savedWorkspace.workspace.active
          ? savedWorkspace.workspace.active.profile
          : null))
  const [editingSaved] = useState(
    !routeState?.personal &&
      !routeState?.example &&
      (Boolean(routeState?.editSaved) || Boolean(currentCheck?.saved)),
  )
  const [draft, setDraft] = useState<Draft>(() =>
    startingProfile ? draftFromProfile(startingProfile) : blankDraft(),
  )
  const [step, setStep] = useState(() =>
    Math.min(Math.max(routeState?.step ?? 0, 0), questionnaireSteps.length - 1),
  )
  const [highestStep, setHighestStep] = useState(() =>
    Math.min(
      Math.max(
        routeState?.step ??
          (startingProfile ? questionnaireSteps.length - 1 : 0),
        0,
      ),
      questionnaireSteps.length - 1,
    ),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [motion, setMotion] = useState<'none' | 'step' | 'error'>(
    routeState?.animate ? 'step' : 'none',
  )

  useEffect(() => {
    if (routeState?.example || routeState?.personal) clearCurrentCheck()
    if (routeState?.example || routeState?.personal || routeState?.editSaved)
      navigate('/check', { replace: true, state: null })
  }, [
    navigate,
    routeState?.editSaved,
    routeState?.example,
    routeState?.personal,
  ])

  useEffect(() => {
    window.scrollTo(0, 0)
    document.getElementById('check-title')?.focus()
  }, [step])

  useEffect(() => {
    const first = Object.keys(errors)[0]
    if (!first) return
    const direct = document.getElementById(first)
    const target = direct ?? document.querySelector(`input[name="${first}"]`)
    if (target instanceof HTMLElement) target.focus()
  }, [errors])

  const patchDraft = (patch: Partial<Draft>, ...errorKeys: string[]) => {
    setDraft((current) => ({ ...current, ...patch }))
    setErrors((current) => {
      const next = { ...current }
      for (const key of [...Object.keys(patch), ...errorKeys]) {
        if (key !== 'amounts') delete next[key]
      }
      return next
    })
    setHighestStep((current) => Math.min(current, step))
  }
  const setAmount = (key: DraftAmountKey, value: string) =>
    patchDraft({ amounts: { ...draft.amounts, [key]: value } }, key)

  const validateStep = () => {
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
      if (
        draft.hasClientWorkSubcontractor === 'no' &&
        !draft.contractorBoundary
      )
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
      if (
        draft.path === 'eligible-business' &&
        'value' in qualifying &&
        'value' in gross &&
        qualifying.value > gross.value
      )
        nextErrors.qualifyingReceipts =
          'Qualifying receipts cannot exceed gross receipts.'
    }
    if (step === 3) {
      if (!draft.clientKind)
        nextErrors.clientKind =
          'Choose whether clients are domestic, foreign, or mixed.'
      if (!draft.delivery)
        nextErrors.delivery = 'Choose direct or platform-mediated work.'
      if (draft.delivery === 'platform')
        for (const [key, label] of [
          ['platformOwnAccount', 'own-account supply'],
          ['platformRecipientIdentifiable', 'contractual recipient'],
          ['platformGrossBeforeFees', 'gross consideration'],
          ['platformIncomeCharacter', 'income character'],
          ['platformForeignFeeGstTreatment', 'platform fee treatment'],
          ['platformNoRecipientReverseCharge', 'reverse-charge treatment'],
        ] as const)
          if (!draft[key]) nextErrors[key] = `Choose an answer for ${label}.`
      if (draft.clientKind === 'foreign' || draft.clientKind === 'mixed')
        for (const [key, label] of [
          ['foreignWorkInIndia', 'work location'],
          ['foreignRecipientIdentifiable', 'foreign recipient'],
          ['foreignOwnAccount', 'own-account supply'],
          ['foreignPlaceOfSupply', 'place of supply'],
          ['foreignSameEstablishment', 'establishment relationship'],
          ['foreignPaymentRoute', 'payment route'],
          ['foreignSettledToIndianBank', 'Indian settlement'],
          ['foreignAccountExposure', 'foreign account exposure'],
          ['foreignOperation', 'foreign operation'],
          ['foreignTax', 'foreign tax'],
          ['foreignTreatyRelief', 'treaty relief'],
          ['foreignReceiptsResolved', 'receipt resolution'],
          ['foreignCurrencyResolved', 'currency resolution'],
        ] as const)
          if (!draft[key]) nextErrors[key] = `Choose an answer for ${label}.`
    }
    if (step === 4) {
      for (const key of amountKeys.slice(5, 9))
        requiredAmount(nextErrors, draft, key)
      if (creditTriggerMayApply(draft) && !draft.ageSixtyOrOlder)
        nextErrors.ageSixtyOrOlder =
          'Choose an age band for the return trigger.'
      if (!draft.otherAnnualReturnTrigger)
        nextErrors.otherAnnualReturnTrigger =
          'Choose whether another prescribed return trigger applies.'
      if (!draft.unsupportedCertainty)
        nextErrors.unsupportedCertainty =
          'Choose whether any unsupported fact applies.'
    }
    if (step === 5) {
      if (!draft.gstKind) nextErrors.gstKind = 'Choose a GST branch.'
      if (draft.gstKind === 'unregistered') {
        if (!draft.gstState)
          nextErrors.gstState = 'Choose a state or Union territory.'
        requiredAmount(nextErrors, draft, 'aggregateTurnover')
        if (!draft.turnoverComplete)
          nextErrors.turnoverComplete =
            'Confirm that aggregate turnover is complete.'
        if (!draft.compulsoryRegistration)
          nextErrors.compulsoryRegistration =
            'Confirm compulsory-registration facts.'
      }
      if (draft.gstKind === 'registered' && !draft.gstStatus)
        nextErrors.gstStatus = 'Choose the registered GST state.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const go = (nextStep: number, animate: boolean) => {
    setErrors({})
    setMotion(animate ? 'step' : 'none')
    setStep(nextStep)
    setHighestStep((current) => Math.max(current, nextStep))
  }

  const calculate = (event: MouseEvent<HTMLButtonElement>) => {
    const animate = event.detail > 0
    if (!validateStep()) {
      setMotion(animate ? 'error' : 'none')
      return
    }
    const candidate = candidateFromDraft(draft)
    if (Object.keys(candidate.errors).length > 0) {
      setErrors(candidate.errors)
      setStep(errorStep(Object.keys(candidate.errors)[0] ?? 'review'))
      setMotion(animate ? 'error' : 'none')
      return
    }
    const parsed = parseProfile(candidate.value)
    if (!parsed.valid) {
      const nextErrors = Object.fromEntries(
        parsed.errors.map((error) => [profileErrorKey(error), error.message]),
      )
      setErrors(nextErrors)
      setStep(groupStep(parsed.errors[0]?.group ?? 'review'))
      setMotion(animate ? 'error' : 'none')
      return
    }
    setCurrentCheck(
      parsed.profile,
      usingExample,
      true,
      editingSaved,
      currentCheck?.saveDismissed ?? false,
    )
    const button = event.currentTarget.getBoundingClientRect()
    navigate('/plan', {
      state: animate
        ? {
            animate: true,
            confettiOrigin: {
              x: (button.left + button.width / 2) / window.innerWidth,
              y: (button.top + button.height / 2) / window.innerHeight,
            },
          }
        : null,
    })
  }

  const selectJourneyStep = (journeyStep: number, animate: boolean) => {
    if (journeyStep === 0) navigate('/', { state: { animate } })
    else if (
      journeyStep <= questionnaireSteps.length &&
      journeyStep - 1 <= highestStep
    )
      go(journeyStep - 1, animate)
  }

  const questionGroupClassName = `question-group${motion === 'step' ? ' question-group--enter' : ''}`

  const stepContent = (): ReactNode => {
    if (step === 0)
      return (
        <div className={questionGroupClassName} key={step}>
          <CheckHeading
            title="Does this fit your situation?"
            description="These questions decide whether this version can give you a tax estimate."
            first
          />
          <div className="question-sections">
            <section className="question-section" aria-labelledby="about-you">
              <h2 id="about-you">About you</h2>
              <div className="field-stack">
                <ChoiceField
                  id="personKind"
                  label="Are you an individual, not a company or firm?"
                  value={draft.personKind}
                  options={['individual', 'not-individual', 'not-sure']}
                  labels={{ individual: 'Yes', 'not-individual': 'No' }}
                  error={errors.personKind}
                  onChange={(value) =>
                    patchDraft({ personKind: value as Draft['personKind'] })
                  }
                />
                <ChoiceField
                  id="adult"
                  label="Are you 18 or older?"
                  help="This version can only estimate tax for adults. You must also confirm this before saving."
                  value={draft.adult}
                  error={errors.adult}
                  onChange={(value) => patchDraft({ adult: value as TriState })}
                />
                <ChoiceField
                  id="residence"
                  label="What was your Indian tax residence status for 2026-27?"
                  help="Use the status in your tax records or confirmed by your tax adviser. Choose Not sure if you have not confirmed it."
                  value={draft.residence}
                  options={[
                    'resident-ordinarily-resident',
                    'resident-not-ordinarily-resident',
                    'non-resident',
                    'not-sure',
                  ]}
                  error={errors.residence}
                  onChange={(value) =>
                    patchDraft({ residence: value as Draft['residence'] })
                  }
                />
                <ChoiceField
                  id="taxRegime"
                  label="Which tax regime are you using for 2026-27?"
                  help="This version only supports the new tax regime."
                  value={draft.taxRegime}
                  options={['new', 'old', 'not-sure']}
                  error={errors.taxRegime}
                  onChange={(value) =>
                    patchDraft({ taxRegime: value as Draft['taxRegime'] })
                  }
                />
              </div>
            </section>

            <section
              className="question-section"
              aria-labelledby="about-practice"
            >
              <h2 id="about-practice">About your practice</h2>
              <div className="field-stack">
                <ChoiceField
                  id="onePractice"
                  label="Do you run one self-employed service practice?"
                  help="Choose No if you have more than one business or profession."
                  value={draft.onePractice}
                  error={errors.onePractice}
                  onChange={(value) =>
                    patchDraft({ onePractice: value as TriState })
                  }
                />
                <ChoiceField
                  id="setupInIndia"
                  label="Is the practice set up and managed in India?"
                  value={draft.setupInIndia}
                  error={errors.setupInIndia}
                  onChange={(value) =>
                    patchDraft({ setupInIndia: value as TriState })
                  }
                />
                <ChoiceField
                  id="workInIndia"
                  label="Do you perform all the work that earns this income while in India?"
                  value={draft.workInIndia}
                  error={errors.workInIndia}
                  onChange={(value) =>
                    patchDraft({ workInIndia: value as TriState })
                  }
                />
              </div>
            </section>

            <section
              className="question-section"
              aria-labelledby="people-involved"
            >
              <h2 id="people-involved">Who helps with the work</h2>
              <div className="field-stack">
                <ChoiceField
                  id="hasPartner"
                  label="Do you have a business partner in this practice?"
                  value={draft.hasPartner}
                  error={errors.hasPartner}
                  onChange={(value) =>
                    patchDraft({ hasPartner: value as TriState })
                  }
                />
                <ChoiceField
                  id="hasEmployee"
                  label="Do you employ anyone in this practice?"
                  value={draft.hasEmployee}
                  error={errors.hasEmployee}
                  onChange={(value) =>
                    patchDraft({ hasEmployee: value as TriState })
                  }
                />
                <ChoiceField
                  id="hasForeignOperation"
                  label="Does your practice have an office or other business operation outside India?"
                  help="Foreign clients alone do not count. We ask about clients later."
                  value={draft.hasForeignOperation}
                  error={errors.hasForeignOperation}
                  onChange={(value) =>
                    patchDraft({ hasForeignOperation: value as TriState })
                  }
                />
                <ChoiceField
                  id="hasClientWorkSubcontractor"
                  label="Does a subcontractor help deliver work to your clients?"
                  value={draft.hasClientWorkSubcontractor}
                  error={errors.hasClientWorkSubcontractor}
                  onChange={(value) => {
                    const next = value as TriState
                    patchDraft(
                      {
                        hasClientWorkSubcontractor: next,
                        contractorBoundary:
                          next === 'no' ? draft.contractorBoundary : '',
                      },
                      'contractorBoundary',
                    )
                  }}
                />
                {draft.hasClientWorkSubcontractor === 'no' && (
                  <ChoiceField
                    id="contractorBoundary"
                    label="Do you use a contractor in India for support work only?"
                    help="Choose Yes only if they do not deliver client work, become an employee or agent, create another business, involve a foreign operation, or require you to deduct tax from their payments."
                    options={['none', 'incidental-domestic', 'not-sure']}
                    labels={{ none: 'No', 'incidental-domestic': 'Yes' }}
                    value={draft.contractorBoundary}
                    error={errors.contractorBoundary}
                    onChange={(value) =>
                      patchDraft({
                        contractorBoundary:
                          value as Draft['contractorBoundary'],
                      })
                    }
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      )
    if (step === 1)
      return (
        <div className={questionGroupClassName} key={step}>
          <CheckHeading
            title="Tell us about your work"
            description="Choose the option that best describes your work. Then tell us which tax method you use."
          />
          <SelectField
            id="activity"
            label="Which option best describes your work?"
            value={draft.activity}
            error={errors.activity}
            onChange={(value) => patchDraft({ activity: value as Activity })}
            options={[
              {
                value: 'software-development',
                label: 'Software development or IT',
              },
              {
                value: 'technical-consultancy',
                label: 'Technical consultancy',
              },
              { value: 'design', label: 'Design' },
              { value: 'writing-content', label: 'Writing or content' },
              {
                value: 'marketing-advertising',
                label: 'Marketing or advertising',
              },
              {
                value: 'other-digital-service',
                label: 'Another digital service',
              },
              { value: 'not-sure', label: 'Not sure' },
            ]}
          />
          {draft.activity === 'not-sure' && (
            <p className="field-help" role="status">
              Not sure stops the estimate. Choose a specific option if you can
              confirm one.
            </p>
          )}
          <ChoiceField
            id="path"
            label="Which tax method do you use for this work?"
            help="Choose the method in your records or the one confirmed by your tax adviser. We cannot estimate your tax without a confirmed method."
            options={['specified-profession', 'eligible-business']}
            value={draft.path}
            error={errors.path}
            onChange={(value) =>
              patchDraft({ path: value as DraftPath, pathConfirmed: '' })
            }
          />
          {draft.path && (
            <ChoiceField
              id="pathConfirmed"
              label={
                draft.path === 'eligible-business'
                  ? 'Is your whole practice an eligible business?'
                  : 'Is your whole practice a specified profession?'
              }
              help="Choose Yes only if this matches your records or professional advice."
              value={draft.pathConfirmed}
              error={errors.pathConfirmed}
              onChange={(value) =>
                patchDraft({ pathConfirmed: value as TriState })
              }
            />
          )}
          {draft.path === 'eligible-business' && (
            <div className="field-stack path-follow-up">
              <ChoiceField
                id="notGoodsCarriage"
                label="Does your practice provide services rather than transport goods?"
                value={draft.notGoodsCarriage}
                error={errors.notGoodsCarriage}
                onChange={(value) =>
                  patchDraft({ notGoodsCarriage: value as TriState })
                }
              />
              <ChoiceField
                id="notAgencyCommissionBrokerage"
                label="Do you provide services on your own account, rather than as an agent, commission earner, or broker?"
                value={draft.notAgencyCommissionBrokerage}
                error={errors.notAgencyCommissionBrokerage}
                onChange={(value) =>
                  patchDraft({
                    notAgencyCommissionBrokerage: value as TriState,
                  })
                }
              />
              <ChoiceField
                id="noChapterViiiCDeduction"
                label="Are you claiming no Chapter VIII-C deduction?"
                value={draft.noChapterViiiCDeduction}
                error={errors.noChapterViiiCDeduction}
                onChange={(value) =>
                  patchDraft({ noChapterViiiCDeduction: value as TriState })
                }
              />
              <ChoiceField
                id="fiveYearExclusion"
                label="Does the five-year exclusion apply to this method?"
                help="This checks whether an earlier use of this method affects you now. Choose Not sure if you need to review earlier years."
                options={['none', 'applies', 'not-sure']}
                value={draft.fiveYearExclusion}
                error={errors.fiveYearExclusion}
                onChange={(value) =>
                  patchDraft({
                    fiveYearExclusion: value as Draft['fiveYearExclusion'],
                  })
                }
              />
            </div>
          )}
        </div>
      )
    if (step === 2)
      return (
        <div className={questionGroupClassName} key={step}>
          <CheckHeading
            title="Use the totals from your records"
            description="Enter whole-rupee amounts before expenses, platform fees, and Indian withholding."
          />
          {draft.path === 'eligible-business' ? (
            <>
              <MoneyField
                id="grossReceipts"
                label="Gross business receipts"
                help="Use the complete annual gross amount for this practice."
                value={draft.amounts.grossReceipts}
                error={errors.grossReceipts}
                onChange={(value) => setAmount('grossReceipts', value)}
              />
              <MoneyField
                id="qualifyingReceipts"
                label="Qualifying banking or online receipts"
                help="Include receipts received through the specified banking or online modes during the Tax Year or by the applicable return due date."
                value={draft.amounts.qualifyingReceipts}
                error={errors.qualifyingReceipts}
                onChange={(value) => setAmount('qualifyingReceipts', value)}
              />
              <MoneyField
                id="otherReceipts"
                label="All other receipts"
                help="This amount plus qualifying receipts must equal gross business receipts."
                value={draft.amounts.otherReceipts}
                error={errors.otherReceipts}
                onChange={(value) => setAmount('otherReceipts', value)}
              />
              <MoneyField
                id="cashReceipts"
                label="Receipts in cash"
                help="Include cash and non-account-payee cheques or drafts."
                value={draft.amounts.cashReceipts}
                error={errors.cashReceipts}
                onChange={(value) => setAmount('cashReceipts', value)}
              />
              <MoneyField
                id="declaredProfit"
                label="Declared profit"
                help="The supported business floor is 6% of qualifying receipts plus 8% of other receipts."
                value={draft.amounts.declaredProfit}
                error={errors.declaredProfit}
                onChange={(value) => setAmount('declaredProfit', value)}
              />
            </>
          ) : (
            <>
              <MoneyField
                id="grossReceipts"
                label="Gross professional receipts"
                help="Do not subtract expenses, platform fees, or Indian withholding."
                value={draft.amounts.grossReceipts}
                error={errors.grossReceipts}
                onChange={(value) => setAmount('grossReceipts', value)}
              />
              <MoneyField
                id="cashReceipts"
                label="Professional receipts received in cash"
                help="Include cash and non-account-payee cheques or drafts. Exactly 5% still uses the higher receipt limit."
                value={draft.amounts.cashReceipts}
                error={errors.cashReceipts}
                onChange={(value) => setAmount('cashReceipts', value)}
              />
              <MoneyField
                id="declaredProfit"
                label="Declared profit"
                help="It must be at least 50% of gross professional receipts."
                value={draft.amounts.declaredProfit}
                error={errors.declaredProfit}
                onChange={(value) => setAmount('declaredProfit', value)}
              />
            </>
          )}
        </div>
      )
    if (step === 3)
      return (
        <div className={questionGroupClassName} key={step}>
          <CheckHeading
            title="Tell us who pays and how the work is supplied"
            description="No client, platform, country, account, invoice, or foreign-currency details are collected."
          />
          <ChoiceField
            id="clientKind"
            label="Where are your clients?"
            options={['domestic', 'foreign', 'mixed', 'not-sure']}
            value={draft.clientKind}
            error={errors.clientKind}
            onChange={(value) =>
              patchDraft({ clientKind: value as DraftClientKind })
            }
          />
          <ChoiceField
            id="delivery"
            label="How do you supply the service?"
            options={['direct', 'platform', 'not-sure']}
            value={draft.delivery}
            error={errors.delivery}
            onChange={(value) =>
              patchDraft({ delivery: value as DraftDelivery })
            }
          />
          {draft.delivery === 'platform' && (
            <div className="field-stack">
              <ChoiceField
                id="platformOwnAccount"
                label="Do you supply the main service on your own account?"
                value={draft.platformOwnAccount}
                error={errors.platformOwnAccount}
                onChange={(value) =>
                  patchDraft({ platformOwnAccount: value as TriState })
                }
              />
              <ChoiceField
                id="platformRecipientIdentifiable"
                label="Can your records identify the contractual recipient?"
                value={draft.platformRecipientIdentifiable}
                error={errors.platformRecipientIdentifiable}
                onChange={(value) =>
                  patchDraft({
                    platformRecipientIdentifiable: value as TriState,
                  })
                }
              />
              <ChoiceField
                id="platformGrossBeforeFees"
                label="Do your records show gross customer consideration before fees and withholding?"
                value={draft.platformGrossBeforeFees}
                error={errors.platformGrossBeforeFees}
                onChange={(value) =>
                  patchDraft({ platformGrossBeforeFees: value as TriState })
                }
              />
              <ChoiceField
                id="platformIncomeCharacter"
                label="Is the income not employment, commission, brokerage, royalty, licensing, or agency income?"
                value={draft.platformIncomeCharacter}
                error={errors.platformIncomeCharacter}
                onChange={(value) =>
                  patchDraft({ platformIncomeCharacter: value as TriState })
                }
              />
              <ChoiceField
                id="platformForeignFeeGstTreatment"
                label="Is foreign platform-fee GST treatment known?"
                options={['not-applicable', 'known', 'not-sure']}
                value={draft.platformForeignFeeGstTreatment}
                error={errors.platformForeignFeeGstTreatment}
                onChange={(value) =>
                  patchDraft({
                    platformForeignFeeGstTreatment:
                      value as Draft['platformForeignFeeGstTreatment'],
                  })
                }
              />
              <ChoiceField
                id="platformNoRecipientReverseCharge"
                label="Does the platform fee create no unsupported recipient-side reverse-charge duty?"
                value={draft.platformNoRecipientReverseCharge}
                error={errors.platformNoRecipientReverseCharge}
                onChange={(value) =>
                  patchDraft({
                    platformNoRecipientReverseCharge: value as TriState,
                  })
                }
              />
            </div>
          )}
          {(draft.clientKind === 'foreign' || draft.clientKind === 'mixed') && (
            <div className="field-stack">
              <ChoiceField
                id="foreignWorkInIndia"
                label="Is all income-producing work performed in India?"
                value={draft.foreignWorkInIndia}
                error={errors.foreignWorkInIndia}
                onChange={(value) =>
                  patchDraft({ foreignWorkInIndia: value as TriState })
                }
              />
              <ChoiceField
                id="foreignRecipientIdentifiable"
                label="Can your records identify the overseas contractual recipient?"
                value={draft.foreignRecipientIdentifiable}
                error={errors.foreignRecipientIdentifiable}
                onChange={(value) =>
                  patchDraft({
                    foreignRecipientIdentifiable: value as TriState,
                  })
                }
              />
              <ChoiceField
                id="foreignOwnAccount"
                label="Do you supply the main service on your own account?"
                value={draft.foreignOwnAccount}
                error={errors.foreignOwnAccount}
                onChange={(value) =>
                  patchDraft({ foreignOwnAccount: value as TriState })
                }
              />
              <ChoiceField
                id="foreignPlaceOfSupply"
                label="Does the ordinary cross-border place-of-supply rule apply?"
                value={draft.foreignPlaceOfSupply}
                error={errors.foreignPlaceOfSupply}
                onChange={(value) =>
                  patchDraft({ foreignPlaceOfSupply: value as TriState })
                }
              />
              <ChoiceField
                id="foreignSameEstablishment"
                label="Are the supplier and recipient establishments of the same person?"
                help="Choose No for the supported own-account branch."
                value={draft.foreignSameEstablishment}
                error={errors.foreignSameEstablishment}
                onChange={(value) =>
                  patchDraft({ foreignSameEstablishment: value as TriState })
                }
              />
              <ChoiceField
                id="foreignPaymentRoute"
                label="How is payment received?"
                options={[
                  'convertible-foreign-exchange',
                  'rbi-permitted-rupee',
                  'not-sure',
                ]}
                value={draft.foreignPaymentRoute}
                error={errors.foreignPaymentRoute}
                onChange={(value) =>
                  patchDraft({
                    foreignPaymentRoute: value as Draft['foreignPaymentRoute'],
                  })
                }
              />
              <ChoiceField
                id="foreignSettledToIndianBank"
                label="Does the covered path settle through an authorised route to your own Indian bank account?"
                value={draft.foreignSettledToIndianBank}
                error={errors.foreignSettledToIndianBank}
                onChange={(value) =>
                  patchDraft({ foreignSettledToIndianBank: value as TriState })
                }
              />
              <ChoiceField
                id="foreignAccountExposure"
                label="Is there any foreign account, wallet, provider-held balance, or signing authority?"
                options={['none', 'possible', 'not-sure']}
                value={draft.foreignAccountExposure}
                error={errors.foreignAccountExposure}
                onChange={(value) =>
                  patchDraft({
                    foreignAccountExposure:
                      value as Draft['foreignAccountExposure'],
                  })
                }
              />
              <ChoiceField
                id="foreignOperation"
                label="Is there a foreign operation?"
                value={draft.foreignOperation}
                error={errors.foreignOperation}
                onChange={(value) =>
                  patchDraft({ foreignOperation: value as TriState })
                }
              />
              <ChoiceField
                id="foreignTax"
                label="Was foreign tax withheld?"
                value={draft.foreignTax}
                error={errors.foreignTax}
                onChange={(value) =>
                  patchDraft({ foreignTax: value as TriState })
                }
              />
              <ChoiceField
                id="foreignTreatyRelief"
                label="Are you claiming foreign-tax or treaty relief?"
                value={draft.foreignTreatyRelief}
                error={errors.foreignTreatyRelief}
                onChange={(value) =>
                  patchDraft({ foreignTreatyRelief: value as TriState })
                }
              />
              <ChoiceField
                id="foreignReceiptsResolved"
                label="Are fees, withholding, refunds, chargebacks, receivables, and accounting method resolved in one annual rupee total?"
                value={draft.foreignReceiptsResolved}
                error={errors.foreignReceiptsResolved}
                onChange={(value) =>
                  patchDraft({ foreignReceiptsResolved: value as TriState })
                }
              />
              <ChoiceField
                id="foreignCurrencyResolved"
                label="Are all currency effects already resolved in that annual rupee total?"
                value={draft.foreignCurrencyResolved}
                error={errors.foreignCurrencyResolved}
                onChange={(value) =>
                  patchDraft({ foreignCurrencyResolved: value as TriState })
                }
              />
            </div>
          )}
        </div>
      )
    if (step === 4)
      return (
        <div className={questionGroupClassName} key={step}>
          <CheckHeading
            title="Add supported other income and credits"
            description="Enter only actual Indian amounts for this Tax Year. Leave nothing blank."
          />
          <MoneyField
            id="taxableBankInterest"
            label="Taxable bank or deposit interest"
            help="Enter interest before TDS."
            value={draft.amounts.taxableBankInterest}
            error={errors.taxableBankInterest}
            onChange={(value) => setAmount('taxableBankInterest', value)}
          />
          <MoneyField
            id="tds"
            label="Actual Indian TDS"
            help="Enter TDS credit for the included income."
            value={draft.amounts.tds}
            error={errors.tds}
            onChange={(value) => setAmount('tds', value)}
          />
          <MoneyField
            id="tcs"
            label="Actual Indian TCS"
            help="Enter TCS credit available for this Tax Year."
            value={draft.amounts.tcs}
            error={errors.tcs}
            onChange={(value) => setAmount('tcs', value)}
          />
          <MoneyField
            id="advanceTaxPaid"
            label="Advance tax already paid"
            help="Enter total advance tax paid for this Tax Year, not self-assessment tax for another period."
            value={draft.amounts.advanceTaxPaid}
            error={errors.advanceTaxPaid}
            onChange={(value) => setAmount('advanceTaxPaid', value)}
          />
          {creditTriggerMayApply(draft) && (
            <ChoiceField
              id="ageSixtyOrOlder"
              label="Were you sixty or older during this Tax Year?"
              help="This changes the TDS and TCS annual-return trigger."
              value={draft.ageSixtyOrOlder}
              error={errors.ageSixtyOrOlder}
              onChange={(value) =>
                patchDraft({ ageSixtyOrOlder: value as TriState })
              }
            />
          )}
          <ChoiceField
            id="otherAnnualReturnTrigger"
            label="Do you know that another prescribed annual-return trigger applies?"
            help="Choose Not sure if you need to review the banking, travel, electricity, or foreign-asset conditions."
            value={draft.otherAnnualReturnTrigger}
            error={errors.otherAnnualReturnTrigger}
            onChange={(value) =>
              patchDraft({ otherAnnualReturnTrigger: value as TriState })
            }
          />
          <UnsupportedFactsField
            draft={draft}
            setDraft={patchDraft}
            error={errors.unsupportedCertainty}
          />
        </div>
      )
    if (step === 5)
      return (
        <div className={questionGroupClassName} key={step}>
          <CheckHeading
            title="Finish with GST and return facts"
            description="GST aggregate turnover is the all-India amount for this PAN. It is not copied from your professional receipts."
          />
          <ChoiceField
            id="gstKind"
            label="Which GST state describes you?"
            options={['unregistered', 'registered', 'not-sure']}
            value={draft.gstKind}
            error={errors.gstKind}
            onChange={(value) =>
              patchDraft({
                gstKind: value as DraftGstKind,
                gstStatus: '',
                gstState: '',
              })
            }
          />
          {draft.gstKind === 'registered' && (
            <>
              <ChoiceField
                id="gstStatus"
                label="What is the registered state?"
                options={['one-normal', 'other', 'not-sure']}
                value={draft.gstStatus}
                error={errors.gstStatus}
                onChange={(value) =>
                  patchDraft({ gstStatus: value as DraftGstStatus })
                }
              />
              {draft.gstStatus === 'one-normal' && (
                <SelectField
                  id="gstState"
                  label="State or Union territory"
                  value={draft.gstState}
                  error={errors.gstState}
                  onChange={(value) => patchDraft({ gstState: value })}
                  options={statesAndUnionTerritories.map((state) => ({
                    value: state,
                    label: state,
                  }))}
                />
              )}
            </>
          )}
          {draft.gstKind === 'unregistered' && (
            <>
              <SelectField
                id="gstState"
                label="State or Union territory"
                help="Choose the state from which the practice makes taxable supplies."
                value={draft.gstState}
                error={errors.gstState}
                onChange={(value) => patchDraft({ gstState: value })}
                options={statesAndUnionTerritories.map((state) => ({
                  value: state,
                  label: state,
                }))}
              />
              <MoneyField
                id="aggregateTurnover"
                label="GST aggregate turnover for this PAN"
                help="Include taxable, exempt, export, and inter-State supplies. Exclude GST, cess, and inward supplies taxed under reverse charge."
                value={draft.amounts.aggregateTurnover}
                error={errors.aggregateTurnover}
                onChange={(value) => setAmount('aggregateTurnover', value)}
              />
              <ChoiceField
                id="turnoverComplete"
                label="Is that aggregate-turnover amount complete?"
                value={draft.turnoverComplete}
                error={errors.turnoverComplete}
                onChange={(value) =>
                  patchDraft({ turnoverComplete: value as TriState })
                }
              />
              <ChoiceField
                id="compulsoryRegistration"
                label="Is there a compulsory-registration fact separate from turnover?"
                help="Choose Not sure when a fact may require earlier registration."
                value={draft.compulsoryRegistration}
                error={errors.compulsoryRegistration}
                onChange={(value) =>
                  patchDraft({ compulsoryRegistration: value as TriState })
                }
              />
              <div className="field">
                <label htmlFor="thresholdLiabilityDate">
                  If turnover is above the threshold, when did liability arise?
                </label>
                <p className="field-help" id="threshold-date-help">
                  Leave blank when turnover is below or at the threshold, or
                  when you do not know the date.
                </p>
                <DatePicker
                  id="thresholdLiabilityDate"
                  value={draft.thresholdLiabilityDate}
                  min="2026-04-01"
                  max="2027-03-31"
                  clearable
                  describedBy="threshold-date-help"
                  onChange={(value) =>
                    patchDraft({ thresholdLiabilityDate: value })
                  }
                />
              </div>
            </>
          )}
          <p className="section-note">
            Return-form guidance remains outside this first release. A supported
            result can still show an annual-return action when a trigger is
            established.
          </p>
        </div>
      )
    return (
      <div className={questionGroupClassName} key={step}>
        <CheckHeading
          title="Review before calculating"
          description="Your answers stay in this tab until you choose what to do with the result."
        />
        <GroupSummary draft={draft} onEdit={(nextStep) => go(nextStep, true)} />
        <div className="review-boundary">
          <h2>What My Next Filing does not collect</h2>
          <p>
            No name, client or platform identity, country, account number,
            invoice, document, foreign-currency amount, or free text.
          </p>
        </div>
        <ErrorSummary errors={errors} />
      </div>
    )
  }

  const onNext = (event: MouseEvent<HTMLButtonElement>) => {
    const animate = event.detail > 0
    if (step === questionnaireSteps.length - 1) calculate(event)
    else if (validateStep()) go(step + 1, animate)
    else setMotion('error')
  }

  return (
    <section
      className="questionnaire journey-layout"
      aria-labelledby="check-title"
    >
      {usingExample && (
        <div className="notice notice--top notice--example" role="status">
          <strong>Fictional example.</strong> You can explore these answers, but
          they cannot be saved.
        </div>
      )}
      <div
        className={`questionnaire-main${motion === 'error' ? ' is-pointer-activated' : ''}`}
      >
        {stepContent()}
      </div>
      <JourneySidebar
        activeStep={step + 1}
        backAction={
          <button
            className="button button--secondary"
            type="button"
            onClick={() => (step === 0 ? navigate('/') : go(step - 1, true))}
          >
            Back
          </button>
        }
        action={
          <button
            className="button button--primary"
            type="button"
            onClick={onNext}
          >
            {step === questionnaireSteps.length - 1
              ? 'Calculate my plan'
              : 'Continue'}
          </button>
        }
        disabledSteps={Array.from(
          { length: calculationStep + 1 },
          (_, index) => index,
        ).filter(
          (index) => index === calculationStep || index > highestStep + 1,
        )}
        onStepSelect={selectJourneyStep}
      />
    </section>
  )
}
