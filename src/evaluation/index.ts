import { validateRuleDataset } from '../rules/index.ts'
import type { DateOnly, RuleDataset } from '../rules/index.ts'

export const unsupportedFactLabels = {
  salary: 'Salary income',
  houseProperty: 'House-property income',
  dividendsOrGifts: 'Dividend or gift income',
  capitalGains: 'Capital gains',
  cryptoLotteryGaming: 'Crypto, lottery, or gaming income',
  foreignIncomeOrRelief: 'Foreign income or foreign-tax relief',
  agriculturalIncome: 'Agricultural income',
  deductionsLossesOrCredit:
    'A deduction, loss, or tax credit this check does not show',
  disputedCredit: 'A disputed TDS or TCS credit',
  anotherBusiness: 'Another business or profession',
  foreignClients: 'Foreign clients',
  platformOrAgencyIncome:
    'Platform, marketplace, agency, commission, or brokerage income',
  goodsSales: 'Goods sales',
  employeesOrDeductorDuties: 'Employees or deductor filing duties',
  auditRequirement: 'An audit requirement under tax law or another law',
  otherUnsupportedFacts: 'Another unsupported fact',
} as const

export type UnsupportedFact = keyof typeof unsupportedFactLabels

export type Profile = {
  readonly scopeConfirmed: boolean | null
  readonly residentIndividual: boolean
  readonly newTaxRegime: boolean
  readonly itOrSoftwareConsulting: boolean
  readonly presumptiveProfessionalTaxation: boolean
  readonly directIndianClients: boolean
  readonly noGstin: boolean
  readonly grossProfessionalReceipts: number
  readonly cashReceipts: number
  readonly higherExpectedProfit: number
  readonly taxableBankInterest: number
  readonly tdsAlreadyDeducted: number
  readonly tcsAlreadyCollected: number
  readonly advanceTaxAlreadyPaid: number
  readonly stateOrUnionTerritory: string
  readonly gstAggregateTurnover: number
  readonly unsupportedFacts: readonly UnsupportedFact[]
}

export type DeadlineStatus = 'upcoming' | 'due-today' | 'deadline-passed'

export type Obligation = {
  readonly id: 'advance-tax' | 'annual-return'
  readonly title: string
  readonly taxPeriod: string
  readonly normalDueDate: DateOnly
  readonly operativeDueDate: DateOnly | null
  readonly extensionSourceId: string | null
  readonly dueDate: DateOnly
  readonly status: DeadlineStatus
  readonly reasons: readonly string[]
  readonly consequence: string
  readonly statutorySourceId: string
  readonly tutorialSourceId: string | null
  readonly verifiedOn: DateOnly
  readonly amountDue?: number
}

export type TaxEstimate = {
  readonly minimumPresumptiveProfit: number
  readonly professionalIncome: number
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

export type GstStatus = {
  readonly kind: 'below' | 'at' | 'above'
  readonly threshold: number
  readonly difference: number
  readonly state: string
  readonly coverageIncomplete: boolean
  readonly message: string
  readonly statutorySourceId: string
}

export type SupportedResult = {
  readonly kind: 'supported'
  readonly tax: TaxEstimate
  readonly advanceTaxApplies: boolean
  readonly noAdvanceTaxMessage: string | null
  readonly annualReturn: {
    readonly requiredByIncome: boolean
    readonly normalDueDate: DateOnly
    readonly operativeDueDate: DateOnly | null
    readonly extensionSourceId: string | null
    readonly dueDate: DateOnly
    readonly statutorySourceId: string
    readonly message: string | null
  }
  readonly obligations: readonly Obligation[]
  readonly nextObligation: Obligation | null
  readonly gst: GstStatus
  readonly assumptions: readonly string[]
  readonly statutorySourceIds: readonly string[]
}

export type UnsupportedResult = {
  readonly kind: 'unsupported'
  readonly facts: readonly { readonly label: string; readonly reason: string }[]
  readonly officialSourceIds: readonly string[]
}

export type StaleRulesResult = {
  readonly kind: 'stale-rules'
  readonly expiresOn: DateOnly | null
  readonly errors: readonly string[]
  readonly officialSourceIds: readonly string[]
}

export type EvaluationResult =
  | SupportedResult
  | UnsupportedResult
  | StaleRulesResult

const amountKeys: (keyof Pick<
  Profile,
  | 'grossProfessionalReceipts'
  | 'cashReceipts'
  | 'higherExpectedProfit'
  | 'taxableBankInterest'
  | 'tdsAlreadyDeducted'
  | 'tcsAlreadyCollected'
  | 'advanceTaxAlreadyPaid'
  | 'gstAggregateTurnover'
>)[] = [
  'grossProfessionalReceipts',
  'cashReceipts',
  'higherExpectedProfit',
  'taxableBankInterest',
  'tdsAlreadyDeducted',
  'tcsAlreadyCollected',
  'advanceTaxAlreadyPaid',
  'gstAggregateTurnover',
]

function indiaDate(now: Date): DateOnly {
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

function roundToNearestTen(amount: number) {
  const rupees = Math.floor(amount)
  return rupees - (rupees % 10) + (rupees % 10 >= 5 ? 10 : 0)
}

function deadlineStatus(today: DateOnly, dueDate: DateOnly): DeadlineStatus {
  if (today < dueDate) return 'upcoming'
  if (today === dueDate) return 'due-today'
  return 'deadline-passed'
}

function calculateSlabTax(totalIncome: number, rules: RuleDataset) {
  let lower = 0
  let tax = 0
  for (const slab of rules.income.slabs) {
    const upper = slab.upper ?? totalIncome
    tax += Math.max(0, Math.min(totalIncome, upper) - lower) * slab.rate
    if (totalIncome <= upper) break
    lower = upper
  }
  return tax
}

function unsupported(
  label: string,
  reason: string,
): UnsupportedResult['facts'][number] {
  return { label, reason }
}

function sourceIdsForRules(rules: unknown) {
  if (!rules || typeof rules !== 'object' || !('sources' in rules)) return []
  const sources = (rules as { readonly sources?: unknown }).sources
  if (!Array.isArray(sources)) return []
  return sources.flatMap((source) =>
    source &&
    typeof source === 'object' &&
    'kind' in source &&
    source.kind === 'statutory' &&
    'id' in source &&
    typeof source.id === 'string'
      ? [source.id]
      : [],
  )
}

function calculateTax(profile: Profile, rules: RuleDataset): TaxEstimate {
  const minimumProfit =
    profile.grossProfessionalReceipts * rules.presumptive.minimumProfitRate
  const professionalIncome = Math.max(
    minimumProfit,
    profile.higherExpectedProfit,
  )
  const roundedTotalIncome = roundToNearestTen(
    professionalIncome + profile.taxableBankInterest,
  )
  const slabTax = calculateSlabTax(roundedTotalIncome, rules)
  const rebate =
    roundedTotalIncome <= rules.income.rebateLimit
      ? Math.min(slabTax, rules.income.rebateMaximum)
      : 0
  const marginalRelief =
    roundedTotalIncome > rules.income.rebateLimit &&
    slabTax > roundedTotalIncome - rules.income.rebateLimit
      ? slabTax - (roundedTotalIncome - rules.income.rebateLimit)
      : 0
  const taxAfterRelief = slabTax - rebate - marginalRelief
  const cess = taxAfterRelief * rules.income.cessRate
  const grossTax = taxAfterRelief + cess
  const beforeAdvancePaid =
    grossTax - profile.tdsAlreadyDeducted - profile.tcsAlreadyCollected
  const estimatedAdvanceTaxLiability = roundToNearestTen(
    Math.max(0, beforeAdvancePaid),
  )
  const finalBalance =
    grossTax -
    profile.tdsAlreadyDeducted -
    profile.tcsAlreadyCollected -
    profile.advanceTaxAlreadyPaid
  const finalAmount = roundToNearestTen(Math.abs(finalBalance))

  return {
    minimumPresumptiveProfit: minimumProfit,
    professionalIncome,
    taxableBankInterest: profile.taxableBankInterest,
    roundedTotalIncome,
    slabTax,
    rebate,
    marginalRelief,
    taxAfterRelief,
    cess,
    grossTax,
    tds: profile.tdsAlreadyDeducted,
    tcs: profile.tcsAlreadyCollected,
    estimatedAdvanceTaxLiability,
    advanceTaxPaid: profile.advanceTaxAlreadyPaid,
    outcome:
      finalAmount === 0 ? 'settled' : finalBalance < 0 ? 'refund' : 'payable',
    finalAmount,
  }
}

function calculateGst(profile: Profile, rules: RuleDataset): GstStatus {
  const threshold = rules.gst.lowerThresholdStates.includes(
    profile.stateOrUnionTerritory,
  )
    ? rules.gst.lowerThreshold
    : rules.gst.standardThreshold
  const difference = Math.abs(threshold - profile.gstAggregateTurnover)
  if (profile.gstAggregateTurnover < threshold) {
    return {
      kind: 'below',
      threshold,
      difference,
      state: profile.stateOrUnionTerritory,
      coverageIncomplete: false,
      message: `Your declared GST aggregate turnover is below the starting threshold for ${profile.stateOrUnionTerritory}. Some facts can require registration earlier.`,
      statutorySourceId: 'gst-act-2026',
    }
  }
  if (profile.gstAggregateTurnover === threshold) {
    return {
      kind: 'at',
      threshold,
      difference: 0,
      state: profile.stateOrUnionTerritory,
      coverageIncomplete: false,
      message:
        'Your declared GST aggregate turnover equals the starting threshold. Turnover-based registration starts only after you exceed it. Review before further turnover.',
      statutorySourceId: 'gst-act-2026',
    }
  }
  return {
    kind: 'above',
    threshold,
    difference,
    state: profile.stateOrUnionTerritory,
    coverageIncomplete: true,
    message:
      'Review GST registration now. Your declared GST aggregate turnover is above the starting threshold. This version does not calculate GST returns.',
    statutorySourceId: 'gst-act-2026',
  }
}

function obligations(
  tax: TaxEstimate,
  today: DateOnly,
  rules: RuleDataset,
): {
  readonly advanceTaxApplies: boolean
  readonly annualReturn: SupportedResult['annualReturn']
  readonly items: readonly Obligation[]
} {
  const advanceTaxApplies =
    tax.estimatedAdvanceTaxLiability >= rules.advanceTax.liabilityThreshold
  const annualReturnRequiredByIncome =
    tax.roundedTotalIncome > rules.annualReturn.filingIncomeThreshold
  const advanceDueDate =
    rules.advanceTax.operativeDueDate ?? rules.advanceTax.normalDueDate
  const returnDueDate =
    rules.annualReturn.operativeDueDate ?? rules.annualReturn.normalDueDate
  const items: Obligation[] = []
  if (advanceTaxApplies) {
    items.push({
      id: 'advance-tax',
      title: 'Pay advance tax',
      taxPeriod: rules.taxPeriod,
      normalDueDate: rules.advanceTax.normalDueDate,
      operativeDueDate: rules.advanceTax.operativeDueDate,
      extensionSourceId: rules.advanceTax.extensionSourceId,
      dueDate: advanceDueDate,
      status: deadlineStatus(today, advanceDueDate),
      reasons: [
        'Advance tax can apply because your estimated tax after TDS and TCS is at least ₹10,000.',
      ],
      consequence:
        'Interest can apply after this deadline. The correct amount depends on payment and assessment facts that this application does not collect. Verify the amount on the Income Tax portal or with a tax professional.',
      statutorySourceId: 'income-tax-act-2026',
      tutorialSourceId: null,
      verifiedOn: rules.verifiedOn,
      amountDue: tax.outcome === 'payable' ? tax.finalAmount : 0,
    })
  }
  if (annualReturnRequiredByIncome) {
    items.push({
      id: 'annual-return',
      title: 'File your annual income-tax return',
      taxPeriod: rules.taxPeriod,
      normalDueDate: rules.annualReturn.normalDueDate,
      operativeDueDate: rules.annualReturn.operativeDueDate,
      extensionSourceId: rules.annualReturn.extensionSourceId,
      dueDate: returnDueDate,
      status: deadlineStatus(today, returnDueDate),
      reasons: [
        'Your rounded total income is above ₹4,00,000. This is the normal date for the supported non-audit professional profile.',
      ],
      consequence:
        'A filing fee and other effects can apply after the deadline. This application does not calculate them. Verify the current position before you file.',
      statutorySourceId: 'income-tax-act-2026',
      tutorialSourceId: null,
      verifiedOn: rules.verifiedOn,
    })
  }
  return {
    advanceTaxApplies,
    annualReturn: {
      requiredByIncome: annualReturnRequiredByIncome,
      normalDueDate: rules.annualReturn.normalDueDate,
      operativeDueDate: rules.annualReturn.operativeDueDate,
      extensionSourceId: rules.annualReturn.extensionSourceId,
      dueDate: returnDueDate,
      statutorySourceId: 'income-tax-act-2026',
      message: annualReturnRequiredByIncome
        ? null
        : 'This estimate does not indicate a mandatory income-tax return from the income it covers. Other filing conditions that this application does not collect can still require a return.',
    },
    items,
  }
}

export function evaluate(
  profile: Profile,
  currentDate: Date,
  rules: RuleDataset,
): EvaluationResult {
  const ruleValidation = validateRuleDataset(rules, currentDate)
  if (!ruleValidation.valid) {
    return {
      kind: 'stale-rules',
      expiresOn: typeof rules?.expiresOn === 'string' ? rules.expiresOn : null,
      errors: ruleValidation.errors,
      officialSourceIds: sourceIdsForRules(rules),
    }
  }

  const facts: { label: string; reason: string }[] = []
  if (profile.scopeConfirmed !== true)
    facts.push(
      unsupported(
        'Supported profile confirmation',
        'This check can calculate only when every stated profile assumption applies.',
      ),
    )
  if (!profile.residentIndividual)
    facts.push(
      unsupported(
        'Resident individual',
        'This version supports resident individuals only.',
      ),
    )
  if (!profile.newTaxRegime)
    facts.push(
      unsupported('New tax regime', 'This version uses new-regime slabs only.'),
    )
  if (!profile.itOrSoftwareConsulting)
    facts.push(
      unsupported(
        'IT or software consulting',
        'This version supports this specified profession only.',
      ),
    )
  if (!profile.presumptiveProfessionalTaxation) {
    facts.push(
      unsupported(
        'Presumptive professional taxation',
        'This version uses the supported presumptive income method only.',
      ),
    )
  }
  if (!profile.directIndianClients) {
    facts.push(
      unsupported(
        'Direct clients in India',
        'Foreign, platform, and agency rules are outside this version.',
      ),
    )
  }
  if (!profile.noGstin)
    facts.push(
      unsupported(
        'No GSTIN',
        'GST-registered profiles need a different filing calendar.',
      ),
    )
  if (!profile.stateOrUnionTerritory)
    facts.push(
      unsupported(
        'State or Union territory',
        'Select a location for the GST threshold check.',
      ),
    )
  for (const key of amountKeys) {
    const amount = profile[key]
    if (!Number.isSafeInteger(amount) || amount < 0) {
      facts.push(
        unsupported(
          'Money input',
          'Use a non-negative whole-rupee amount within the supported range.',
        ),
      )
      break
    }
  }
  if (profile.cashReceipts > profile.grossProfessionalReceipts) {
    facts.push(
      unsupported(
        'Cash receipts',
        'Cash receipts cannot exceed gross professional receipts.',
      ),
    )
  }
  const minimumProfit =
    profile.grossProfessionalReceipts *
    ruleValidation.data.presumptive.minimumProfitRate
  if (profile.higherExpectedProfit < minimumProfit) {
    facts.push(
      unsupported(
        'Higher expected profit',
        'It cannot be below half of gross professional receipts.',
      ),
    )
  }
  const cashRate =
    profile.grossProfessionalReceipts === 0
      ? 0
      : profile.cashReceipts / profile.grossProfessionalReceipts
  const receiptLimit =
    cashRate > ruleValidation.data.presumptive.cashReceiptRate
      ? ruleValidation.data.presumptive.standardReceiptLimit
      : ruleValidation.data.presumptive.lowCashReceiptLimit
  if (profile.grossProfessionalReceipts > receiptLimit) {
    facts.push(
      unsupported(
        'Professional receipts',
        `This profile supports receipts up to ₹${receiptLimit.toLocaleString('en-IN')} for the declared cash-receipt level.`,
      ),
    )
  }
  for (const fact of profile.unsupportedFacts) {
    facts.push(
      unsupported(
        unsupportedFactLabels[fact],
        'This fact needs rules that this version does not calculate.',
      ),
    )
  }
  const unroundedTotal =
    Math.max(minimumProfit, profile.higherExpectedProfit) +
    profile.taxableBankInterest
  if (roundToNearestTen(unroundedTotal) > ruleValidation.data.income.ceiling) {
    facts.push(
      unsupported(
        'Total income above ₹50 lakh',
        'This version stops before surcharge and marginal-relief rules apply.',
      ),
    )
  }
  if (facts.length > 0) {
    return {
      kind: 'unsupported',
      facts,
      officialSourceIds: sourceIdsForRules(ruleValidation.data),
    }
  }

  const tax = calculateTax(profile, ruleValidation.data)
  const obligationResult = obligations(
    tax,
    indiaDate(currentDate),
    ruleValidation.data,
  )
  const gst = calculateGst(profile, ruleValidation.data)
  const nextObligation =
    obligationResult.items.find((item) => item.status !== 'deadline-passed') ??
    obligationResult.items.at(-1) ??
    null

  return {
    kind: 'supported',
    tax,
    advanceTaxApplies: obligationResult.advanceTaxApplies,
    noAdvanceTaxMessage: obligationResult.advanceTaxApplies
      ? null
      : 'No advance tax is indicated by this estimate. Your GST-registration status can still require attention.',
    annualReturn: obligationResult.annualReturn,
    obligations: obligationResult.items,
    nextObligation,
    gst,
    assumptions: [
      'Resident individual using the new tax regime.',
      'IT or software consultant using the supported presumptive method.',
      'Direct Indian clients and no GSTIN.',
      'The estimate uses declared receipts, bank interest, tax credits, and advance tax paid.',
      'You confirmed that no FAQ-listed unsupported fact applies. Receipts fit the limit for your cash level; total income is within ₹50 lakh.',
    ],
    statutorySourceIds: [
      'section-58',
      'section-62',
      'budget-faq-2026',
      'section-156',
      'finance-act-2026',
      'section-404',
      'income-tax-act-2026',
      'gst-act-2026',
    ],
  }
}
