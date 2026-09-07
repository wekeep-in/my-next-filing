import { indiaDate } from '@/lib/india-date'
export type DateOnly = `${number}-${number}-${number}`

export const TAX_YEAR = 'Tax Year 2026-27' as const
export const GST_PORTAL_URL = 'https://www.gst.gov.in/'
export type TaxYear = `Tax Year ${number}-${number}`

export type StatutorySource = {
  readonly id: string
  readonly kind: 'statutory'
  readonly publisher: string
  readonly title: string
  readonly url: string
  readonly publicationDate?: DateOnly
  readonly reviewDate: DateOnly
  readonly taxPeriod: TaxYear
  readonly coveredRuleIds: readonly string[]
}

export type TutorialStatus =
  | 'approved'
  | 'provisional'
  | 'deferred'
  | 'rejected'
  | 'starting-link-only'

export type TutorialSource = {
  readonly id: string
  readonly kind: 'tutorial'
  readonly publisher: string
  readonly title: string
  readonly url: string
  readonly reviewDate: DateOnly
  readonly coveredObligation: string
  readonly status: TutorialStatus
  readonly replacementSourceId?: string
}

export type Source = StatutorySource | TutorialSource

export type RuleGroupId =
  | 'income-paths'
  | 'common-income-tax'
  | 'advance-tax'
  | 'annual-return'
  | 'gst-registration'
  | 'foreign-guidance'
  | 'gst-calendar'
  | 'lut'

export type RuleProvenanceRole =
  | 'applicability'
  | 'threshold'
  | 'rate'
  | 'date'
  | 'rounding'
  | 'guidance'
  | 'extension'

export type RuleProvenance = {
  readonly ruleId: string
  readonly sourceId: string
  readonly role: RuleProvenanceRole
}

export type RuleGroup<T> = {
  readonly id: RuleGroupId
  readonly effectiveStart: DateOnly
  readonly effectiveEnd: DateOnly
  readonly verifiedOn: DateOnly
  readonly expiresOn: DateOnly
  readonly values: T
  readonly provenance: readonly RuleProvenance[]
}

export type IncomePathRules = {
  readonly professionMinimumProfitRate: number
  readonly professionCashReceiptRate: number
  readonly professionStandardReceiptLimit: number
  readonly professionLowCashReceiptLimit: number
  readonly businessMinimumProfitRate: number
  readonly businessQualifyingReceiptRate: number
  readonly businessOtherReceiptRate: number
  readonly businessCashReceiptRate: number
  readonly businessStandardReceiptLimit: number
  readonly businessLowCashReceiptLimit: number
}

export type CommonIncomeTaxRules = {
  readonly equityShortTermRate: number
  readonly equityLongTermRate: number
  readonly equityLongTermThreshold: number
  readonly equityBasicExemption: number
  readonly rentalStandardDeductionRate: number
  readonly salaryStandardDeduction: number
  readonly employerNpsRate: number
  readonly employerRetirementFundLimit: number
  readonly incomeCeiling: number
  readonly slabs: readonly {
    readonly upper: number | null
    readonly rate: number
  }[]
  readonly rebateLimit: number
  readonly rebateMaximum: number
  readonly marginalReliefLimit: number
  readonly cessRate: number
  readonly roundingUnit: number
}

export type AdvanceTaxRules = {
  readonly liabilityThreshold: number
  readonly normalDueDate: DateOnly
  readonly operativeDueDate: DateOnly | null
  readonly extensionSourceId: string | null
}

export type AnnualReturnRules = {
  readonly capitalLossCarryForwardYears: number
  readonly filingIncomeThreshold: number
  readonly professionReceiptThreshold: number
  readonly businessReceiptThreshold: number
  readonly tdsTcsThreshold: number
  readonly seniorTdsTcsThreshold: number
  readonly normalDueDate: DateOnly
  readonly operativeDueDate: DateOnly | null
  readonly extensionSourceId: string | null
}

export type GstRegistrationRules = {
  readonly lowerThresholdStates: readonly string[]
  readonly lowerThreshold: number
  readonly standardThreshold: number
  readonly registrationWindowDays: number
}

export type ForeignGuidanceRules = {
  readonly transitionDate: DateOnly
  readonly message: string
}

export type GstCalendarRules = {
  readonly monthlyGstr1Day: number
  readonly quarterlyGstr1Day: number
  readonly monthlyGstr3bDay: number
  readonly quarterlyGstr3bEarlyDay: number
  readonly quarterlyGstr3bLateDay: number
  readonly qrmpPaymentDay: number
  readonly qrmpTurnoverLimit: number
  readonly quarterlyEarlyStates: readonly string[]
}

export type LutRules = { readonly prosecutionThreshold: number }

export type RuleDataset = {
  readonly id: string
  readonly schemaVersion: 1
  readonly taxPeriod: TaxYear
  readonly effectiveStart: DateOnly
  readonly effectiveEnd: DateOnly
  readonly verifiedOn: DateOnly
  readonly expiresOn: DateOnly
  readonly changeNotes: readonly string[]
  readonly sources: readonly Source[]
  readonly groups: {
    readonly incomePaths: RuleGroup<IncomePathRules>
    readonly commonIncomeTax: RuleGroup<CommonIncomeTaxRules>
    readonly advanceTax: RuleGroup<AdvanceTaxRules>
    readonly annualReturn: RuleGroup<AnnualReturnRules>
    readonly gstRegistration: RuleGroup<GstRegistrationRules>
    readonly foreignGuidance: RuleGroup<ForeignGuidanceRules>
    readonly gstCalendar: RuleGroup<GstCalendarRules>
    readonly lut: RuleGroup<LutRules>
  }
}

type RuleGroupStatus = {
  readonly valid: boolean
  readonly errors: readonly string[]
}

export type RuleValidation =
  | {
      readonly valid: true
      readonly data: RuleDataset
      readonly groups: Readonly<Record<RuleGroupId, RuleGroupStatus>>
    }
  | { readonly valid: false; readonly errors: readonly string[] }

const effectiveStart = '2026-04-01' as DateOnly
const effectiveEnd = '2027-03-31' as DateOnly
const reviewedOn = '2026-09-03' as DateOnly
const expiresOn = '2027-08-31' as DateOnly

const quarterlyEarlyStates = [
  'Chhattisgarh',
  'Madhya Pradesh',
  'Gujarat',
  'Maharashtra',
  'Karnataka',
  'Goa',
  'Kerala',
  'Tamil Nadu',
  'Telangana',
  'Andhra Pradesh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Puducherry',
  'Andaman and Nicobar Islands',
  'Lakshadweep',
] as const

export const sourceRegistry: readonly Source[] = [
  {
    id: 'domestic-rental-income-2026',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title:
      'Income-tax Act, 2025 as amended: house property, sections 20–22, 202, 263 and 408',
    url: 'https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf',
    publicationDate: '2025-08-21',
    reviewDate: '2026-09-08',
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['domestic-rental-income', 'rental-standard-deduction'],
  },
  {
    id: 'gst-residential-rent-exemption',
    kind: 'statutory',
    publisher: 'Central Board of Indirect Taxes and Customs',
    title:
      'Notification 12/2017, entry 12: residential dwelling for use as residence',
    url: 'https://cbic-gst.gov.in/hindi/pdf/central-tax-rate/Notification12-CGST.pdf',
    publicationDate: '2017-06-28',
    reviewDate: '2026-09-08',
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['rental-gst-exemption'],
  },
  {
    id: 'gst-residential-rent-tenants',
    kind: 'statutory',
    publisher: 'Central Board of Indirect Taxes and Customs',
    title:
      'Notification 04/2022: registered-tenant exclusion from residential-rent exemption',
    url: 'https://cbic-gst.gov.in/pdf/central-tax-rate/04_2022-ctr-eng.pdf',
    publicationDate: '2022-07-13',
    reviewDate: '2026-09-08',
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['rental-gst-tenants'],
  },
  {
    id: 'domestic-equity-gains-2026',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title:
      'Income-tax Act, 2025 as amended in 2026: equity gains and losses, deductions, rebate, carry-forward and filing',
    url: 'https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf',
    publicationDate: '2025-08-21',
    reviewDate: '2026-09-08',
    taxPeriod: TAX_YEAR,
    coveredRuleIds: [
      'domestic-equity-gains',
      'equity-short-term-rate',
      'equity-long-term-rate',
      'equity-long-term-threshold',
      'equity-basic-exemption',
      'equity-current-year-loss-set-off',
      'capital-loss-carry-forward',
    ],
  },
  {
    id: 'mutual-fund-idcw-guide',
    kind: 'tutorial',
    publisher: 'Securities and Exchange Board of India',
    title: 'SEBI: income distribution cum capital withdrawal options',
    url: 'https://www.sebi.gov.in/sebi_data/attachdocs/oct-2020/1601906688276.pdf',
    reviewDate: '2026-09-06',
    coveredObligation: 'income-distributions',
    status: 'approved',
  },
  {
    id: 'domestic-investment-income-2026',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title:
      'Income-tax Act: ordinary dividends, distributions and interest, sections 7, 92, 93, 276, 408 and 425',
    url: 'https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf',
    reviewDate: '2026-09-06',
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['ordinary-domestic-income'],
  },
  ...(
    [
      [
        'gst-notification-82-2020',
        'Notification 82/2020: GST return periods, GSTR-3B dates and QRMP payment dates',
        '2024-05/notfctn-82-central-tax-english-2020.pdf',
        '2020-11-10',
        ['gst-return-periods', 'gst-gstr3b-dates', 'gst-qrmp-payment-date'],
      ],
      [
        'gst-notification-83-2020',
        'Notification 83/2020: monthly and quarterly GSTR-1 dates',
        '2024-05/notfctn-83-central-tax-english-2020.pdf',
        '2020-11-10',
        ['gst-gstr1-dates'],
      ],
      [
        'gst-notification-84-2020',
        'Notification 84/2020: QRMP eligibility and changes',
        '2024-05/notfctn-84-central-tax-english-2020.pdf',
        '2020-11-10',
        ['gst-qrmp-eligibility'],
      ],
      [
        'gst-circular-143-2020',
        'Circular 143/13/2020: quarter elections, new registrations and conditional payments',
        '2024-06/circular_refund_143_11_2020.pdf',
        '2020-11-10',
        ['gst-cadence', 'gst-qrmp-payment-review'],
      ],
      [
        'gst-notification-37-2017',
        'Notification 37/2017: LUT eligibility and financial-year validity',
        '2024-04/notfctn-37-central-tax-english.pdf',
        '2017-10-04',
        ['lut-eligibility'],
      ],
    ] as const
  ).map(
    ([id, title, path, publicationDate, coveredRuleIds]): StatutorySource => ({
      id,
      kind: 'statutory',
      publisher: 'Central Board of Indirect Taxes and Customs',
      title,
      url: `https://gstcouncil.gov.in/sites/default/files/${path}`,
      publicationDate,
      reviewDate: '2026-09-07',
      taxPeriod: TAX_YEAR,
      coveredRuleIds,
    }),
  ),
  {
    id: 'gst-circular-8-2017',
    kind: 'statutory',
    publisher: 'Central Board of Indirect Taxes and Customs',
    title: 'Circular 8/8/2017: annual LUT before export',
    url: 'https://cbic-gst.gov.in/pdf/Final_Master_circular_LUT_Bond_04102017.pdf',
    publicationDate: '2017-10-04',
    reviewDate: '2026-09-07',
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['lut-annual-validity'],
  },
  {
    id: 'gst-circular-125-2019',
    kind: 'statutory',
    publisher: 'Central Board of Indirect Taxes and Customs',
    title:
      'Circular 125/44/2019: LUT before export and review of late furnishing',
    url: 'https://cbic-gst.gov.in/pdf/circular-cgst-125.pdf',
    publicationDate: '2019-11-18',
    reviewDate: '2026-09-07',
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['lut-before-export'],
  },
  {
    id: 'domestic-salary-2026',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title:
      'Income-tax Act, 2025 as amended: salary, employer NPS and combined income, sections 15–19, 122, 124, 202, 263, 405 and 408',
    url: 'https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf',
    publicationDate: '2026-03-30',
    reviewDate: '2026-09-07',
    taxPeriod: TAX_YEAR,
    coveredRuleIds: [
      'domestic-salary',
      'salary-standard-deduction',
      'employer-nps-deduction',
      'employer-retirement-fund-limit',
    ],
  },
  {
    id: 'income-tax-act-2025-2026',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Income-tax Act, 2025 as amended by Finance Act, 2026',
    url: 'https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf',
    publicationDate: '2026-03-30',
    reviewDate: reviewedOn,
    taxPeriod: TAX_YEAR,
    coveredRuleIds: [
      'tax-period',
      'specified-profession',
      'profession-receipt-limit',
      'profession-profit-floor',
      'business-receipt-limit',
      'business-profit-floor',
      'advance-tax-date',
      'income-rounding',
      'annual-return-income-threshold',
      'annual-return-profession-threshold',
      'annual-return-business-threshold',
      'annual-return-date',
    ],
  },
  {
    id: 'section-58',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Section 58: presumptive income from business and profession',
    url: 'https://www.incometaxindia.gov.in/w/section-58-138',
    reviewDate: reviewedOn,
    taxPeriod: TAX_YEAR,
    coveredRuleIds: [
      'profession-receipt-limit',
      'profession-profit-floor',
      'business-receipt-limit',
      'business-profit-floor',
      'business-five-year-exclusion',
      'business-payment-split',
      'advance-tax-date',
    ],
  },
  {
    id: 'section-62',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Section 62: specified professions',
    url: 'https://www.incometaxindia.gov.in/w/section-62-134',
    reviewDate: reviewedOn,
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['specified-profession', 'profession-profit-floor'],
  },
  {
    id: 'section-202',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Section 202: new-regime rates for Tax Year 2026-27',
    url: 'https://www.incometaxindia.gov.in/w/section-202-78',
    reviewDate: reviewedOn,
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['new-regime-slabs'],
  },
  {
    id: 'section-156',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Section 156: rebate for resident individuals',
    url: 'https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf',
    publicationDate: '2026-03-30',
    reviewDate: reviewedOn,
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['rebate-and-marginal-relief'],
  },
  {
    id: 'finance-act-2026',
    kind: 'statutory',
    publisher: 'Ministry of Law and Justice',
    title: 'Finance Act, 2026',
    url: 'https://www.incometaxindia.gov.in/documents/d/guest/finance-act-2026-pdf-1',
    publicationDate: '2026-03-30',
    reviewDate: reviewedOn,
    taxPeriod: TAX_YEAR,
    coveredRuleIds: [
      'income-ceiling',
      'health-education-cess',
      'dividend-expenses-disallowed',
    ],
  },
  {
    id: 'section-404',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Section 404: advance-tax threshold',
    url: 'https://www.incometaxindia.gov.in/w/section-404-5',
    reviewDate: reviewedOn,
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['advance-tax-threshold'],
  },
  {
    id: 'section-408',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Section 408: presumptive advance-tax payment date',
    url: 'https://www.incometaxindia.gov.in/w/section-408-6',
    reviewDate: reviewedOn,
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['advance-tax-date'],
  },
  {
    id: 'section-263',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Section 263: return filing due date and triggers',
    url: 'https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf',
    reviewDate: '2026-09-06',
    taxPeriod: TAX_YEAR,
    coveredRuleIds: [
      'annual-return-income-threshold',
      'annual-return-profession-threshold',
      'annual-return-business-threshold',
      'annual-return-tds-tcs-threshold',
      'annual-return-date',
    ],
  },
  {
    id: 'rule-163',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Income-tax Rules, 2026, rule 163 filing triggers',
    url: 'https://www.incometaxindia.gov.in/documents/d/guest/notification-22-2026-1',
    publicationDate: '2026-03-20',
    reviewDate: reviewedOn,
    taxPeriod: TAX_YEAR,
    coveredRuleIds: [
      'annual-return-tds-tcs-threshold',
      'annual-return-profession-threshold',
      'annual-return-business-threshold',
    ],
  },
  {
    id: 'budget-2026-return-dates',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Budget 2026 FAQs: return due dates for Tax Year 2026-27',
    url: 'https://www.incometaxindia.gov.in/documents/20117/15766092/FAQs-Budget-2026.pdf/ff3d0e10-88a0-b11f-3c27-b58375974227',
    publicationDate: '2026-01-30',
    reviewDate: reviewedOn,
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['annual-return-date'],
  },
  {
    id: 'gst-act-2017',
    kind: 'statutory',
    publisher: 'India Code',
    title: 'Central Goods and Services Tax Act, 2017',
    url: 'https://upload.indiacode.nic.in/showfile?actid=AC_CEN_2_2_00042_201712_1517807328102&filename=a2017-12.pdf&type=actfile',
    publicationDate: '2017-04-12',
    reviewDate: reviewedOn,
    taxPeriod: TAX_YEAR,
    coveredRuleIds: [
      'gst-aggregate-turnover',
      'gst-registration-threshold',
      'gst-registration-window',
    ],
  },
  {
    id: 'gst-registration-rules',
    kind: 'statutory',
    publisher: 'Central Board of Indirect Taxes and Customs',
    title: 'GST registration rules and thirty-day application window',
    url: 'https://cbic-gst.gov.in/gst-registration-rules.html',
    reviewDate: reviewedOn,
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['gst-registration-window'],
  },
  {
    id: 'fema-export-regulations-2026',
    kind: 'statutory',
    publisher: 'Reserve Bank of India',
    title: 'Foreign Exchange Management export and import regulations, 2026',
    url: 'https://www.rbi.org.in/scripts/BS_FemaNotifications.aspx?Id=13277',
    publicationDate: '2026-01-13',
    reviewDate: reviewedOn,
    taxPeriod: TAX_YEAR,
    coveredRuleIds: ['foreign-guidance-transition'],
  },
  {
    id: 'advance-tax-challan',
    kind: 'tutorial',
    publisher: 'Income Tax Department',
    title: 'How to generate challan form',
    url: 'https://www.incometax.gov.in/iec/foportal/help/generate-challan-form',
    reviewDate: '2026-09-06',
    coveredObligation: 'advance-tax',
    status: 'approved',
  },
  {
    id: 'gst-registration-hub',
    kind: 'tutorial',
    publisher: 'Goods and Services Tax',
    title: 'GST knowledge portal',
    url: 'https://www.gst.gov.in/help/helpmodules/',
    reviewDate: reviewedOn,
    coveredObligation: 'gst-registration',
    status: 'starting-link-only',
  },
  {
    id: 'gst-portal',
    kind: 'tutorial',
    publisher: 'Goods and Services Tax',
    title: 'GST portal: current filing dates and services',
    url: GST_PORTAL_URL,
    reviewDate: '2026-09-06',
    coveredObligation: 'gst-calendar',
    status: 'starting-link-only',
  },
  {
    id: 'efiling-portal-guide',
    kind: 'tutorial',
    publisher: 'Income Tax Department',
    title: 'Quick glance at the e-Filing portal',
    url: 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/quick-glance-first-time-registration-users/quick-glance-first-time-UM',
    reviewDate: '2026-09-06',
    coveredObligation: 'annual-return',
    status: 'approved',
  },
  {
    id: 'gst-registration-guide',
    kind: 'tutorial',
    publisher: 'Goods and Services Tax',
    title: 'Registration application for a normal taxpayer',
    url: 'https://tutorial.gst.gov.in/userguide/registration/Apply_for_Registration_Normal_Taxpayer.htm',
    reviewDate: '2026-09-06',
    coveredObligation: 'gst-registration',
    status: 'approved',
  },
  {
    id: 'gst-gstr1-guide',
    kind: 'tutorial',
    publisher: 'Goods and Services Tax',
    title: 'Creating and filing GSTR-1',
    url: 'https://tutorial.gst.gov.in/userguide/returns/Creation_of_Outward_Supplies_Return_in_GSTR-1.htm',
    reviewDate: '2026-09-06',
    coveredObligation: 'gst-gstr1',
    status: 'approved',
  },
  {
    id: 'gst-gstr3b-guide',
    kind: 'tutorial',
    publisher: 'Goods and Services Tax',
    title: 'Creating and filing GSTR-3B',
    url: 'https://tutorial.gst.gov.in/userguide/returns/Create_and_Submit_GSTR3B.htm',
    reviewDate: '2026-09-06',
    coveredObligation: 'gst-gstr3b',
    status: 'approved',
  },
  {
    id: 'gst-qrmp-payment-guide',
    kind: 'tutorial',
    publisher: 'Goods and Services Tax',
    title: 'Creating a GST challan after login',
    url: 'https://tutorial.gst.gov.in/userguide/payments/Create_Challan_(Post_Login).htm',
    reviewDate: '2026-09-06',
    coveredObligation: 'gst-qrmp-payment',
    status: 'approved',
  },
  {
    id: 'gst-lut-guide',
    kind: 'tutorial',
    publisher: 'Goods and Services Tax',
    title: 'Filing a letter of undertaking on the GST portal',
    url: 'https://tutorial.gst.gov.in/userguide/refund/Furnishing_of_Letter_of_Undertaking.htm',
    reviewDate: '2026-09-06',
    coveredObligation: 'gst-lut',
    status: 'approved',
  },
  {
    id: 'return-identification',
    kind: 'tutorial',
    publisher: 'Income Tax Department',
    title: 'Identification and generation of applicable return',
    url: 'https://www.incometax.gov.in/iec/foportal/help/identification-and-generation-of-applicable-itr-individual',
    reviewDate: reviewedOn,
    coveredObligation: 'annual-return',
    status: 'deferred',
  },
]

const group = <T>(
  id: RuleGroupId,
  values: T,
  provenance: readonly RuleProvenance[],
): RuleGroup<T> => ({
  id,
  effectiveStart,
  effectiveEnd,
  verifiedOn: [
    'common-income-tax',
    'annual-return',
    'gst-registration',
  ].includes(id)
    ? '2026-09-08'
    : id === 'gst-registration'
      ? '2026-09-06'
      : reviewedOn,
  expiresOn,
  values,
  provenance,
})

export const currentRules: RuleDataset = {
  id: 'my-next-filing-2026-27-v11',
  schemaVersion: 1,
  taxPeriod: TAX_YEAR,
  effectiveStart,
  effectiveEnd,
  verifiedOn: '2026-09-08',
  expiresOn,
  changeNotes: [
    'Added bounded domestic rental income with the 30% net-annual-value deduction and eligible current interest, preserving independent rental GST review. Verified 8 September 2026.',
    'Current-year domestic equity loss set-off and conditional carry-forward filing guidance reviewed on 8 September 2026. Capital losses do not reduce ordinary income. The mixed-gain basic-exemption restriction is evaluated after loss adjustment.',
    'GST calendar and LUT authority refreshed on 7 September 2026 through 31 October 2026. Normal dates, eligibility and completion identities are unchanged. The public CBIC 2026 listing contains no applicable current-period extension; the wider state-extension inventory still requires release-time review.',
    'Domestic equity gains reviewed on 7 September 2026: separate 20% and 12.5% tax, ₹1,25,000 long-term threshold, bounded basic-exemption adjustment, and ordinary-income-only deductions and rebate.',
    'Employer NPS reviewed on 7 September 2026: 14% new-regime deduction, separate employer inputs, restricted retirement-fund scope and annual-return income before Chapter VIII deductions.',
    'Ordinary domestic dividends, taxable Indian mutual-fund distributions, post-office and income-tax refund interest added after review on 6 September 2026. Preserve established annual-return and GST-threshold conclusions despite independent uncertainty; annual triggers and dates now cite enacted authority.',
    'GST return calendars and independent LUT guidance initially reviewed on 6 September 2026 with a 30 September review deadline, superseded by the 7 September refresh. Dates are normal statutory dates; the current extension inventory is incomplete.',
    'Domestic salary and one capped standard deduction added after review on 6 September 2026; the presumptive advance-tax schedule and business-income return date continue to apply.',
    'Tax Year 2026-27 Rule groups reviewed on 3 September 2026.',
    'The dataset separates the two presumptive paths and independently reviewed annual-return, GST, and foreign-transition areas.',
    'GST aggregate turnover remains a direct declared amount and is never derived from income-tax inputs.',
  ],
  sources: sourceRegistry,
  groups: {
    gstCalendar: {
      ...group(
        'gst-calendar',
        {
          monthlyGstr1Day: 11,
          quarterlyGstr1Day: 13,
          monthlyGstr3bDay: 20,
          quarterlyGstr3bEarlyDay: 22,
          quarterlyGstr3bLateDay: 24,
          qrmpPaymentDay: 25,
          qrmpTurnoverLimit: 50_000_000,
          quarterlyEarlyStates,
        },
        [
          {
            ruleId: 'rental-gst-exemption',
            sourceId: 'gst-residential-rent-exemption',
            role: 'applicability',
          },
          {
            ruleId: 'rental-gst-tenants',
            sourceId: 'gst-residential-rent-tenants',
            role: 'applicability',
          },
          {
            ruleId: 'gst-return-periods',
            sourceId: 'gst-notification-82-2020',
            role: 'applicability',
          },
          {
            ruleId: 'gst-gstr1-dates',
            sourceId: 'gst-notification-83-2020',
            role: 'date',
          },
          {
            ruleId: 'gst-gstr3b-dates',
            sourceId: 'gst-notification-82-2020',
            role: 'date',
          },
          {
            ruleId: 'gst-qrmp-payment-date',
            sourceId: 'gst-notification-82-2020',
            role: 'date',
          },
          {
            ruleId: 'gst-qrmp-eligibility',
            sourceId: 'gst-notification-84-2020',
            role: 'threshold',
          },
          {
            ruleId: 'gst-cadence',
            sourceId: 'gst-circular-143-2020',
            role: 'applicability',
          },
          {
            ruleId: 'gst-qrmp-payment-review',
            sourceId: 'gst-circular-143-2020',
            role: 'guidance',
          },
        ],
      ),
      verifiedOn: '2026-09-08',
      expiresOn: '2026-10-31',
    },
    lut: {
      ...group('lut', { prosecutionThreshold: 25_000_000 }, [
        {
          ruleId: 'lut-eligibility',
          sourceId: 'gst-notification-37-2017',
          role: 'applicability',
        },
        {
          ruleId: 'lut-before-export',
          sourceId: 'gst-circular-125-2019',
          role: 'date',
        },
        {
          ruleId: 'lut-annual-validity',
          sourceId: 'gst-circular-8-2017',
          role: 'applicability',
        },
      ]),
      verifiedOn: '2026-09-07',
      expiresOn: '2026-10-31',
    },
    incomePaths: group(
      'income-paths',
      {
        professionMinimumProfitRate: 0.5,
        professionCashReceiptRate: 0.05,
        professionStandardReceiptLimit: 5_000_000,
        professionLowCashReceiptLimit: 7_500_000,
        businessMinimumProfitRate: 0.06,
        businessQualifyingReceiptRate: 0.06,
        businessOtherReceiptRate: 0.08,
        businessCashReceiptRate: 0.05,
        businessStandardReceiptLimit: 20_000_000,
        businessLowCashReceiptLimit: 30_000_000,
      },
      [
        {
          ruleId: 'specified-profession',
          sourceId: 'section-62',
          role: 'applicability',
        },
        {
          ruleId: 'profession-receipt-limit',
          sourceId: 'section-58',
          role: 'threshold',
        },
        {
          ruleId: 'profession-profit-floor',
          sourceId: 'section-58',
          role: 'rate',
        },
        {
          ruleId: 'business-receipt-limit',
          sourceId: 'section-58',
          role: 'threshold',
        },
        {
          ruleId: 'business-profit-floor',
          sourceId: 'section-58',
          role: 'rate',
        },
        {
          ruleId: 'business-payment-split',
          sourceId: 'section-58',
          role: 'rate',
        },
        {
          ruleId: 'business-five-year-exclusion',
          sourceId: 'section-58',
          role: 'applicability',
        },
      ],
    ),
    commonIncomeTax: group(
      'common-income-tax',
      {
        equityShortTermRate: 0.2,
        equityLongTermRate: 0.125,
        equityLongTermThreshold: 125_000,
        equityBasicExemption: 400_000,
        rentalStandardDeductionRate: 0.3,
        salaryStandardDeduction: 75_000,
        employerNpsRate: 0.14,
        employerRetirementFundLimit: 750_000,
        incomeCeiling: 5_000_000,
        slabs: [
          { upper: 400_000, rate: 0 },
          { upper: 800_000, rate: 0.05 },
          { upper: 1_200_000, rate: 0.1 },
          { upper: 1_600_000, rate: 0.15 },
          { upper: 2_000_000, rate: 0.2 },
          { upper: 2_400_000, rate: 0.25 },
          { upper: null, rate: 0.3 },
        ],
        rebateLimit: 1_200_000,
        rebateMaximum: 60_000,
        marginalReliefLimit: 1_200_000,
        cessRate: 0.04,
        roundingUnit: 10,
      },
      [
        {
          ruleId: 'domestic-rental-income',
          sourceId: 'domestic-rental-income-2026',
          role: 'applicability',
        },
        {
          ruleId: 'rental-standard-deduction',
          sourceId: 'domestic-rental-income-2026',
          role: 'rate',
        },
        {
          ruleId: 'equity-current-year-loss-set-off',
          sourceId: 'domestic-equity-gains-2026',
          role: 'applicability',
        },
        {
          ruleId: 'domestic-equity-gains',
          sourceId: 'domestic-equity-gains-2026',
          role: 'applicability',
        },
        {
          ruleId: 'equity-short-term-rate',
          sourceId: 'domestic-equity-gains-2026',
          role: 'rate',
        },
        {
          ruleId: 'equity-long-term-rate',
          sourceId: 'domestic-equity-gains-2026',
          role: 'rate',
        },
        {
          ruleId: 'equity-long-term-threshold',
          sourceId: 'domestic-equity-gains-2026',
          role: 'threshold',
        },
        {
          ruleId: 'equity-basic-exemption',
          sourceId: 'domestic-equity-gains-2026',
          role: 'threshold',
        },
        {
          ruleId: 'domestic-salary',
          sourceId: 'domestic-salary-2026',
          role: 'applicability',
        },
        {
          ruleId: 'employer-nps-deduction',
          sourceId: 'domestic-salary-2026',
          role: 'rate',
        },
        {
          ruleId: 'employer-retirement-fund-limit',
          sourceId: 'domestic-salary-2026',
          role: 'threshold',
        },
        {
          ruleId: 'ordinary-domestic-income',
          sourceId: 'domestic-investment-income-2026',
          role: 'applicability',
        },
        {
          ruleId: 'dividend-expenses-disallowed',
          sourceId: 'finance-act-2026',
          role: 'applicability',
        },
        {
          ruleId: 'salary-standard-deduction',
          sourceId: 'domestic-salary-2026',
          role: 'threshold',
        },
        {
          ruleId: 'income-ceiling',
          sourceId: 'finance-act-2026',
          role: 'threshold',
        },
        { ruleId: 'new-regime-slabs', sourceId: 'section-202', role: 'rate' },
        {
          ruleId: 'rebate-and-marginal-relief',
          sourceId: 'section-156',
          role: 'rate',
        },
        {
          ruleId: 'health-education-cess',
          sourceId: 'finance-act-2026',
          role: 'rate',
        },
        {
          ruleId: 'income-rounding',
          sourceId: 'income-tax-act-2025-2026',
          role: 'rounding',
        },
      ],
    ),
    advanceTax: group(
      'advance-tax',
      {
        liabilityThreshold: 10_000,
        normalDueDate: '2027-03-15',
        operativeDueDate: null,
        extensionSourceId: null,
      },
      [
        {
          ruleId: 'advance-tax-threshold',
          sourceId: 'section-404',
          role: 'threshold',
        },
        { ruleId: 'advance-tax-date', sourceId: 'section-408', role: 'date' },
      ],
    ),
    annualReturn: group(
      'annual-return',
      {
        capitalLossCarryForwardYears: 8,
        filingIncomeThreshold: 400_000,
        professionReceiptThreshold: 1_000_000,
        businessReceiptThreshold: 6_000_000,
        tdsTcsThreshold: 25_000,
        seniorTdsTcsThreshold: 50_000,
        normalDueDate: '2027-08-31',
        operativeDueDate: null,
        extensionSourceId: null,
      },
      [
        {
          ruleId: 'capital-loss-carry-forward',
          sourceId: 'domestic-equity-gains-2026',
          role: 'applicability',
        },
        {
          ruleId: 'annual-return-income-threshold',
          sourceId: 'section-263',
          role: 'threshold',
        },
        {
          ruleId: 'annual-return-profession-threshold',
          sourceId: 'rule-163',
          role: 'threshold',
        },
        {
          ruleId: 'annual-return-business-threshold',
          sourceId: 'rule-163',
          role: 'threshold',
        },
        {
          ruleId: 'annual-return-tds-tcs-threshold',
          sourceId: 'rule-163',
          role: 'threshold',
        },
        {
          ruleId: 'annual-return-date',
          sourceId: 'section-263',
          role: 'date',
        },
      ],
    ),
    gstRegistration: group(
      'gst-registration',
      {
        lowerThresholdStates: ['Manipur', 'Mizoram', 'Nagaland', 'Tripura'],
        lowerThreshold: 1_000_000,
        standardThreshold: 2_000_000,
        registrationWindowDays: 30,
      },
      [
        {
          ruleId: 'rental-gst-exemption',
          sourceId: 'gst-residential-rent-exemption',
          role: 'applicability',
        },
        {
          ruleId: 'rental-gst-tenants',
          sourceId: 'gst-residential-rent-tenants',
          role: 'applicability',
        },
        {
          ruleId: 'gst-aggregate-turnover',
          sourceId: 'gst-act-2017',
          role: 'applicability',
        },
        {
          ruleId: 'gst-registration-threshold',
          sourceId: 'gst-act-2017',
          role: 'threshold',
        },
        {
          ruleId: 'gst-registration-window',
          sourceId: 'gst-registration-rules',
          role: 'date',
        },
      ],
    ),
    foreignGuidance: group(
      'foreign-guidance',
      {
        transitionDate: '2026-10-01',
        message:
          'A FEMA export-regulation transition takes effect on 1 October 2026. Review the applicable payment and export-declaration process with your authorised dealer or a qualified adviser.',
      },
      [
        {
          ruleId: 'foreign-guidance-transition',
          sourceId: 'fema-export-regulations-2026',
          role: 'guidance',
        },
      ],
    ),
  },
}

export const ruleDatasets: readonly RuleDataset[] = [currentRules]

const groupKeys: readonly (keyof RuleDataset['groups'])[] = [
  'gstCalendar',
  'lut',
  'incomePaths',
  'commonIncomeTax',
  'advanceTax',
  'annualReturn',
  'gstRegistration',
  'foreignGuidance',
]

const groupIds: readonly RuleGroupId[] = [
  'gst-calendar',
  'lut',
  'income-paths',
  'common-income-tax',
  'advance-tax',
  'annual-return',
  'gst-registration',
  'foreign-guidance',
]

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

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isSafeAmount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

const isRate = (value: unknown) =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 1

const safeAmount = (value: unknown): number | null =>
  isSafeAmount(value) ? value : null

function validateDates(
  value: Record<string, unknown>,
  now: Date,
  errors: string[],
  prefix: string,
) {
  const dates = [
    value.effectiveStart,
    value.effectiveEnd,
    value.verifiedOn,
    value.expiresOn,
  ]
  if (dates.some((date) => !isDate(date))) {
    errors.push(`${prefix} has invalid dates.`)
    return
  }
  const start = value.effectiveStart as DateOnly
  const end = value.effectiveEnd as DateOnly
  const verified = value.verifiedOn as DateOnly
  const expires = value.expiresOn as DateOnly
  const today = indiaDate(now)
  if (start > end) errors.push(`${prefix} has an invalid effective interval.`)
  if (verified > today) errors.push(`${prefix} has a future review date.`)
  // A review deadline may fall before the end of the earning period.
  if (expires < start || expires < verified || expires < today)
    errors.push(`${prefix} is outside its review window.`)
}

function validateSources(
  value: Record<string, unknown>,
  now: Date,
): {
  readonly errors: readonly string[]
  readonly records: ReadonlyMap<string, Record<string, unknown>>
} {
  const errors: string[] = []
  const records = new Map<string, Record<string, unknown>>()
  if (!Array.isArray(value.sources) || value.sources.length === 0)
    return { errors: ['Rules need a source registry.'], records }
  for (const source of value.sources) {
    if (!isRecord(source)) {
      errors.push('Rules contain an invalid source.')
      continue
    }
    if (!isText(source.id) || records.has(source.id)) {
      errors.push('Rules contain a duplicate or missing source identity.')
      continue
    }
    records.set(source.id, source)
    if (source.kind === 'statutory') {
      if (
        !(
          exactKeys(source, [
            'id',
            'kind',
            'publisher',
            'title',
            'url',
            'reviewDate',
            'taxPeriod',
            'coveredRuleIds',
          ]) ||
          exactKeys(source, [
            'id',
            'kind',
            'publisher',
            'title',
            'url',
            'publicationDate',
            'reviewDate',
            'taxPeriod',
            'coveredRuleIds',
          ])
        )
      )
        errors.push('Rules contain an incomplete statutory source.')
      if (
        !isText(source.publisher) ||
        !isText(source.title) ||
        source.taxPeriod !== TAX_YEAR ||
        !Array.isArray(source.coveredRuleIds) ||
        source.coveredRuleIds.some((id) => !isText(id))
      )
        errors.push('Rules contain an incomplete statutory source.')
    } else if (source.kind === 'tutorial') {
      if (
        !(
          exactKeys(source, [
            'id',
            'kind',
            'publisher',
            'title',
            'url',
            'reviewDate',
            'coveredObligation',
            'status',
          ]) ||
          exactKeys(source, [
            'id',
            'kind',
            'publisher',
            'title',
            'url',
            'reviewDate',
            'coveredObligation',
            'status',
            'replacementSourceId',
          ])
        )
      )
        errors.push('Rules contain an incomplete tutorial source.')
      if (
        !isText(source.publisher) ||
        !isText(source.title) ||
        !isText(source.coveredObligation) ||
        ![
          'approved',
          'provisional',
          'deferred',
          'rejected',
          'starting-link-only',
        ].includes(String(source.status))
      )
        errors.push('Rules contain an incomplete tutorial source.')
    } else errors.push('Rules contain an unknown source kind.')
    if (!isText(source.url) || !source.url.startsWith('https://'))
      errors.push('Rules contain a non-HTTPS source URL.')
    if (!isDate(source.reviewDate))
      errors.push('Rules contain a source without a valid review date.')
    else if (source.reviewDate > indiaDate(now))
      errors.push('Rules contain a source with a future review date.')
    if (source.publicationDate !== undefined && !isDate(source.publicationDate))
      errors.push('Rules contain an invalid source publication date.')
    if (
      isDate(source.publicationDate) &&
      isDate(source.reviewDate) &&
      source.publicationDate > source.reviewDate
    )
      errors.push('Rules contain a source reviewed before publication.')
  }
  return { errors, records }
}

function validateGroup(
  value: unknown,
  expectedId: RuleGroupId,
  expectedValueKeys: readonly string[],
  now: Date,
  sources: ReadonlyMap<string, Record<string, unknown>>,
  requiredRuleIds: readonly string[],
  rootStart: DateOnly,
  rootEnd: DateOnly,
): readonly string[] {
  const errors: string[] = []
  if (!isRecord(value)) return ['Rule group is missing.']
  if (
    !exactKeys(value, [
      'id',
      'effectiveStart',
      'effectiveEnd',
      'verifiedOn',
      'expiresOn',
      'values',
      'provenance',
    ])
  )
    errors.push('Rule group has unknown or missing fields.')
  if (value.id !== expectedId) errors.push('Rule group has the wrong identity.')
  validateDates(value, now, errors, `Rule group ${expectedId}`)
  if (
    isDate(value.effectiveStart) &&
    isDate(value.effectiveEnd) &&
    (value.effectiveStart < rootStart || value.effectiveEnd > rootEnd)
  )
    errors.push(`Rule group ${expectedId} is outside the dataset interval.`)
  if (isDate(value.expiresOn) && value.expiresOn > expiresOn)
    errors.push(`Rule group ${expectedId} outlives the dataset review window.`)
  if (!isRecord(value.values) || !exactKeys(value.values, expectedValueKeys))
    errors.push(`Rule group ${expectedId} has incomplete values.`)
  const provenanceIds = new Set<string>()
  if (!Array.isArray(value.provenance) || value.provenance.length === 0) {
    errors.push(`Rule group ${expectedId} has no provenance.`)
  } else {
    for (const reference of value.provenance) {
      if (
        !isRecord(reference) ||
        !exactKeys(reference, ['ruleId', 'sourceId', 'role']) ||
        !isText(reference.ruleId) ||
        !isText(reference.sourceId) ||
        ![
          'applicability',
          'threshold',
          'rate',
          'date',
          'rounding',
          'guidance',
          'extension',
        ].includes(String(reference.role)) ||
        provenanceIds.has(reference.ruleId)
      ) {
        errors.push(`Rule group ${expectedId} has invalid provenance.`)
        continue
      }
      provenanceIds.add(reference.ruleId)
      const source = sources.get(reference.sourceId)
      if (
        source?.kind !== 'statutory' ||
        !Array.isArray(source.coveredRuleIds) ||
        !source.coveredRuleIds.includes(reference.ruleId)
      )
        errors.push(`Rule ${reference.ruleId} has no direct statutory source.`)
    }
  }
  for (const ruleId of requiredRuleIds)
    if (!provenanceIds.has(ruleId))
      errors.push(`Rule ${ruleId} has no provenance.`)
  const groupValues = isRecord(value.values) ? value.values : null
  if (
    groupValues &&
    ('operativeDueDate' in groupValues || 'extensionSourceId' in groupValues) &&
    typeof groupValues.extensionSourceId === 'string'
  ) {
    const hasExtensionProvenance =
      Array.isArray(value.provenance) &&
      value.provenance.some(
        (reference) =>
          isRecord(reference) &&
          reference.sourceId === groupValues.extensionSourceId &&
          reference.role === 'extension',
      )
    const source = sources.get(groupValues.extensionSourceId)
    if (source?.kind !== 'statutory' || !hasExtensionProvenance)
      errors.push(`Rule group ${expectedId} has invalid extension provenance.`)
  }
  if (groupValues) validateValues(expectedId, groupValues, errors)
  return errors
}

function validateValues(
  id: RuleGroupId,
  values: Record<string, unknown>,
  errors: string[],
) {
  if (
    id === 'gst-calendar' &&
    (values.monthlyGstr1Day !== 11 ||
      values.quarterlyGstr1Day !== 13 ||
      values.monthlyGstr3bDay !== 20 ||
      values.quarterlyGstr3bEarlyDay !== 22 ||
      values.quarterlyGstr3bLateDay !== 24 ||
      values.qrmpPaymentDay !== 25 ||
      values.qrmpTurnoverLimit !== 50_000_000 ||
      !Array.isArray(values.quarterlyEarlyStates) ||
      JSON.stringify(values.quarterlyEarlyStates) !==
        JSON.stringify(quarterlyEarlyStates))
  )
    errors.push(
      'GST calendar values do not match the reviewed statutory schedules.',
    )
  if (id === 'lut' && values.prosecutionThreshold !== 25_000_000)
    errors.push('LUT eligibility does not match the reviewed notification.')
  if (id === 'income-paths') {
    const rates = [
      values.professionMinimumProfitRate,
      values.professionCashReceiptRate,
      values.businessMinimumProfitRate,
      values.businessQualifyingReceiptRate,
      values.businessOtherReceiptRate,
      values.businessCashReceiptRate,
    ]
    const amounts = [
      values.professionStandardReceiptLimit,
      values.professionLowCashReceiptLimit,
      values.businessStandardReceiptLimit,
      values.businessLowCashReceiptLimit,
    ]
    if (
      rates.some((rate) => !isRate(rate)) ||
      amounts.some((amount) => !isSafeAmount(amount))
    )
      errors.push('Rules contain invalid income-path values.')
    const professionStandard = safeAmount(values.professionStandardReceiptLimit)
    const professionLowCash = safeAmount(values.professionLowCashReceiptLimit)
    if (
      professionStandard !== null &&
      professionLowCash !== null &&
      professionLowCash < professionStandard
    )
      errors.push('Rules contain inconsistent profession thresholds.')
    const businessStandard = safeAmount(values.businessStandardReceiptLimit)
    const businessLowCash = safeAmount(values.businessLowCashReceiptLimit)
    if (
      businessStandard !== null &&
      businessLowCash !== null &&
      businessLowCash < businessStandard
    )
      errors.push('Rules contain inconsistent business thresholds.')
    if (
      values.professionMinimumProfitRate !== 0.5 ||
      values.professionCashReceiptRate !== 0.05 ||
      values.professionStandardReceiptLimit !== 5_000_000 ||
      values.professionLowCashReceiptLimit !== 7_500_000 ||
      values.businessMinimumProfitRate !== 0.06 ||
      values.businessQualifyingReceiptRate !== 0.06 ||
      values.businessOtherReceiptRate !== 0.08 ||
      values.businessCashReceiptRate !== 0.05 ||
      values.businessStandardReceiptLimit !== 20_000_000 ||
      values.businessLowCashReceiptLimit !== 30_000_000
    )
      errors.push('Rules contain income-path values outside the reviewed set.')
  }
  if (id === 'common-income-tax') {
    if (values.rentalStandardDeductionRate !== 0.3)
      errors.push(
        'Rules contain a rental standard deduction outside the reviewed set.',
      )
    if (
      values.equityShortTermRate !== 0.2 ||
      values.equityLongTermRate !== 0.125 ||
      values.equityLongTermThreshold !== 125_000 ||
      values.equityBasicExemption !== 400_000
    )
      errors.push('Rules contain equity-gain values outside the reviewed set.')
    if (
      values.employerNpsRate !== 0.14 ||
      values.employerRetirementFundLimit !== 750_000
    )
      errors.push('Rules contain employer NPS values outside the reviewed set.')
    if (values.salaryStandardDeduction !== 75_000)
      errors.push(
        'Rules contain a salary standard deduction outside the reviewed set.',
      )
    const slabs = values.slabs
    if (
      !isSafeAmount(values.incomeCeiling) ||
      !isSafeAmount(values.rebateLimit) ||
      !isSafeAmount(values.rebateMaximum) ||
      !isSafeAmount(values.marginalReliefLimit) ||
      !isRate(values.cessRate) ||
      !isSafeAmount(values.roundingUnit) ||
      values.roundingUnit === 0 ||
      !Array.isArray(slabs) ||
      slabs.length !== 7
    )
      errors.push('Rules contain invalid income-tax values.')
    else {
      let previousUpper = 0
      slabs.forEach((slab, index) => {
        if (!isRecord(slab) || !exactKeys(slab, ['upper', 'rate'])) {
          errors.push('Rules contain invalid tax slabs.')
          return
        }
        if (!isRate(slab.rate)) errors.push('Rules contain invalid tax rates.')
        const upper = slab.upper
        const numericUpper = safeAmount(upper)
        if (index === slabs.length - 1) {
          if (upper !== null)
            errors.push('The final tax slab must be open-ended.')
        } else if (numericUpper === null || numericUpper <= previousUpper)
          errors.push('Rules contain unordered tax slabs.')
        else previousUpper = numericUpper
      })
      const expectedSlabs = [
        [400_000, 0],
        [800_000, 0.05],
        [1_200_000, 0.1],
        [1_600_000, 0.15],
        [2_000_000, 0.2],
        [2_400_000, 0.25],
        [null, 0.3],
      ] as const
      if (
        values.incomeCeiling !== 5_000_000 ||
        values.rebateLimit !== 1_200_000 ||
        values.rebateMaximum !== 60_000 ||
        values.marginalReliefLimit !== 1_200_000 ||
        values.cessRate !== 0.04 ||
        values.roundingUnit !== 10 ||
        !slabs.every(
          (slab, index) =>
            isRecord(slab) &&
            slab.upper === expectedSlabs[index]?.[0] &&
            slab.rate === expectedSlabs[index]?.[1],
        )
      )
        errors.push('Rules contain income-tax values outside the reviewed set.')
    }
  }
  if (id === 'annual-return' && values.capitalLossCarryForwardYears !== 8)
    errors.push(
      'Rules contain a capital-loss carry-forward period outside the reviewed set.',
    )
  if (id === 'advance-tax' || id === 'annual-return')
    validateObligationValues(
      values,
      errors,
      id === 'advance-tax' ? 'advance tax' : 'annual return',
    )
  if (
    id === 'advance-tax' &&
    (values.liabilityThreshold !== 10_000 ||
      values.normalDueDate !== '2027-03-15')
  )
    errors.push('Rules contain advance-tax values outside the reviewed set.')
  if (
    id === 'annual-return' &&
    (values.filingIncomeThreshold !== 400_000 ||
      values.professionReceiptThreshold !== 1_000_000 ||
      values.businessReceiptThreshold !== 6_000_000 ||
      values.tdsTcsThreshold !== 25_000 ||
      values.seniorTdsTcsThreshold !== 50_000 ||
      values.normalDueDate !== '2027-08-31')
  )
    errors.push('Rules contain annual-return values outside the reviewed set.')
  if (id === 'gst-registration') {
    const lowerThreshold = safeAmount(values.lowerThreshold)
    const standardThreshold = safeAmount(values.standardThreshold)
    const registrationWindowDays = safeAmount(values.registrationWindowDays)
    if (
      !Array.isArray(values.lowerThresholdStates) ||
      values.lowerThresholdStates.length === 0 ||
      values.lowerThresholdStates.some((state) => !isText(state)) ||
      lowerThreshold === null ||
      standardThreshold === null ||
      registrationWindowDays === null ||
      registrationWindowDays === 0 ||
      lowerThreshold > standardThreshold
    )
      errors.push('Rules contain invalid GST registration values.')
    if (
      values.lowerThreshold !== 1_000_000 ||
      values.standardThreshold !== 2_000_000 ||
      values.registrationWindowDays !== 30 ||
      !Array.isArray(values.lowerThresholdStates) ||
      values.lowerThresholdStates.join(',') !==
        'Manipur,Mizoram,Nagaland,Tripura'
    )
      errors.push('Rules contain GST values outside the reviewed set.')
  }
  if (
    id === 'foreign-guidance' &&
    (!isDate(values.transitionDate) || !isText(values.message))
  )
    errors.push('Rules contain invalid foreign guidance values.')
  if (id === 'foreign-guidance' && values.transitionDate !== '2026-10-01')
    errors.push(
      'Rules contain foreign guidance values outside the reviewed set.',
    )
  if (Object.keys(values).length === 0)
    errors.push(`Rule group ${id} has no values.`)
}

function validateObligationValues(
  values: Record<string, unknown>,
  errors: string[],
  label: string,
) {
  for (const key of Object.keys(values))
    if (key.endsWith('Threshold') && !isSafeAmount(values[key]))
      errors.push(`Rules contain an invalid ${label} threshold.`)
  if (!isDate(values.normalDueDate))
    errors.push(`Rules need a valid ${label} date.`)
  if (values.operativeDueDate !== null && !isDate(values.operativeDueDate))
    errors.push(`Rules contain an invalid ${label} operative date.`)
  if (
    isDate(values.operativeDueDate) &&
    isDate(values.normalDueDate) &&
    values.operativeDueDate <= values.normalDueDate
  )
    errors.push(`Rules contain an invalid ${label} extension.`)
  if (values.operativeDueDate && !isText(values.extensionSourceId))
    errors.push(`Rules need ${label} extension provenance.`)
  if (!values.operativeDueDate && values.extensionSourceId !== null)
    errors.push(`Rules contain unused ${label} extension provenance.`)
}

export function validateRules(
  value: unknown,
  now = new Date(),
): RuleValidation {
  if (!isRecord(value))
    return { valid: false, errors: ['Rules must be an object.'] }
  const errors: string[] = []
  if (
    !exactKeys(value, [
      'id',
      'schemaVersion',
      'taxPeriod',
      'effectiveStart',
      'effectiveEnd',
      'verifiedOn',
      'expiresOn',
      'changeNotes',
      'sources',
      'groups',
    ])
  )
    errors.push('Rules contain unknown or missing root fields.')
  if (!isText(value.id)) errors.push('Rules need a dataset identity.')
  if (value.schemaVersion !== 1)
    errors.push('Rules use an unknown schema version.')
  if (value.taxPeriod !== TAX_YEAR)
    errors.push('Rules use an unsupported tax period.')
  validateDates(value, now, errors, 'Rules')
  if (isDate(value.expiresOn) && value.expiresOn > expiresOn)
    errors.push('Rules outlive the supported review window.')
  if (
    value.effectiveStart !== effectiveStart ||
    value.effectiveEnd !== effectiveEnd
  )
    errors.push('Rules use dates outside the supported tax period.')
  if (
    !Array.isArray(value.changeNotes) ||
    value.changeNotes.length === 0 ||
    value.changeNotes.some((note) => !isText(note))
  )
    errors.push('Rules need human-readable change notes.')
  const sourceResult = validateSources(value, now)
  errors.push(...sourceResult.errors)
  const rawGroups = value.groups
  if (
    !isRecord(rawGroups) ||
    Object.keys(rawGroups).some(
      (key) => !groupKeys.includes(key as keyof RuleDataset['groups']),
    )
  )
    errors.push('Rules need all required independent groups.')
  if (errors.length > 0) return { valid: false, errors }

  const expectedValues: Record<keyof RuleDataset['groups'], readonly string[]> =
    {
      gstCalendar: [
        'monthlyGstr1Day',
        'quarterlyGstr1Day',
        'monthlyGstr3bDay',
        'quarterlyGstr3bEarlyDay',
        'quarterlyGstr3bLateDay',
        'qrmpPaymentDay',
        'qrmpTurnoverLimit',
        'quarterlyEarlyStates',
      ],
      lut: ['prosecutionThreshold'],
      incomePaths: [
        'professionMinimumProfitRate',
        'professionCashReceiptRate',
        'professionStandardReceiptLimit',
        'professionLowCashReceiptLimit',
        'businessMinimumProfitRate',
        'businessQualifyingReceiptRate',
        'businessOtherReceiptRate',
        'businessCashReceiptRate',
        'businessStandardReceiptLimit',
        'businessLowCashReceiptLimit',
      ],
      commonIncomeTax: [
        'equityShortTermRate',
        'equityLongTermRate',
        'equityLongTermThreshold',
        'equityBasicExemption',
        'rentalStandardDeductionRate',
        'salaryStandardDeduction',
        'employerNpsRate',
        'employerRetirementFundLimit',
        'incomeCeiling',
        'slabs',
        'rebateLimit',
        'rebateMaximum',
        'marginalReliefLimit',
        'cessRate',
        'roundingUnit',
      ],
      advanceTax: [
        'liabilityThreshold',
        'normalDueDate',
        'operativeDueDate',
        'extensionSourceId',
      ],
      annualReturn: [
        'capitalLossCarryForwardYears',
        'filingIncomeThreshold',
        'professionReceiptThreshold',
        'businessReceiptThreshold',
        'tdsTcsThreshold',
        'seniorTdsTcsThreshold',
        'normalDueDate',
        'operativeDueDate',
        'extensionSourceId',
      ],
      gstRegistration: [
        'lowerThresholdStates',
        'lowerThreshold',
        'standardThreshold',
        'registrationWindowDays',
      ],
      foreignGuidance: ['transitionDate', 'message'],
    }
  const requiredRules: Record<keyof RuleDataset['groups'], readonly string[]> =
    {
      gstCalendar: [
        'rental-gst-exemption',
        'rental-gst-tenants',
        'gst-return-periods',
        'gst-gstr1-dates',
        'gst-gstr3b-dates',
        'gst-qrmp-payment-date',
        'gst-qrmp-eligibility',
        'gst-cadence',
        'gst-qrmp-payment-review',
      ],
      lut: ['lut-eligibility', 'lut-before-export', 'lut-annual-validity'],
      incomePaths: [
        'specified-profession',
        'profession-receipt-limit',
        'profession-profit-floor',
        'business-receipt-limit',
        'business-profit-floor',
        'business-payment-split',
        'business-five-year-exclusion',
      ],
      commonIncomeTax: [
        'domestic-rental-income',
        'rental-standard-deduction',
        'equity-current-year-loss-set-off',
        'domestic-equity-gains',
        'equity-short-term-rate',
        'equity-long-term-rate',
        'equity-long-term-threshold',
        'equity-basic-exemption',
        'domestic-salary',
        'employer-nps-deduction',
        'employer-retirement-fund-limit',
        'ordinary-domestic-income',
        'dividend-expenses-disallowed',
        'salary-standard-deduction',
        'income-ceiling',
        'new-regime-slabs',
        'rebate-and-marginal-relief',
        'health-education-cess',
        'income-rounding',
      ],
      advanceTax: ['advance-tax-threshold', 'advance-tax-date'],
      annualReturn: [
        'capital-loss-carry-forward',
        'annual-return-income-threshold',
        'annual-return-profession-threshold',
        'annual-return-business-threshold',
        'annual-return-tds-tcs-threshold',
        'annual-return-date',
      ],
      gstRegistration: [
        'rental-gst-exemption',
        'rental-gst-tenants',
        'gst-aggregate-turnover',
        'gst-registration-threshold',
        'gst-registration-window',
      ],
      foreignGuidance: ['foreign-guidance-transition'],
    }
  const statuses = {} as Record<RuleGroupId, RuleGroupStatus>
  const groups = value.groups as Record<string, unknown>
  groupKeys.forEach((key, index) => {
    const groupErrors = validateGroup(
      groups[key],
      groupIds[index],
      expectedValues[key],
      now,
      sourceResult.records,
      requiredRules[key],
      effectiveStart,
      effectiveEnd,
    )
    statuses[groupIds[index]] = {
      valid: groupErrors.length === 0,
      errors: groupErrors,
    }
  })
  const coreErrors = [
    ...statuses['income-paths'].errors,
    ...statuses['common-income-tax'].errors,
  ]
  return coreErrors.length > 0
    ? { valid: false, errors: coreErrors }
    : { valid: true, data: value as RuleDataset, groups: statuses }
}

export function selectRules(taxYear: TaxYear): RuleDataset | null {
  return ruleDatasets.find((dataset) => dataset.taxPeriod === taxYear) ?? null
}
