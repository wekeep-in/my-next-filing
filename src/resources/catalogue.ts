export const resourceTopics = [
  { value: 'income-tax', label: 'Income tax' },
  { value: 'gst', label: 'GST' },
  { value: 'overseas-clients', label: 'Overseas clients' },
] as const

export const resourceTasks = [
  { value: 'tax-methods', label: 'Understand tax methods' },
  { value: 'rates-deductions', label: 'Understand tax rates and deductions' },
  { value: 'advance-tax', label: 'Pay advance tax' },
  { value: 'income-tax-return', label: 'File an income tax return' },
  { value: 'gst-registration', label: 'Register for GST' },
  { value: 'gst-returns', label: 'File GST returns' },
  { value: 'lut', label: 'Understand LUT' },
  { value: 'overseas-payments', label: 'Receive overseas payments' },
] as const

export type ResourceTopic = (typeof resourceTopics)[number]['value']
export type ResourceTask = (typeof resourceTasks)[number]['value']
export const resourceTypes = [
  'Act',
  'Section',
  'Rules',
  'Notification',
  'Circular',
  'Official FAQ',
  'Regulations',
  'Official portal',
  'Official help portal',
  'Guide',
] as const

export type ResourceDefinition = {
  readonly sourceIds: readonly [string, ...string[]]
  readonly title: string
  readonly description: string
  readonly documentType: (typeof resourceTypes)[number]
  readonly topics: readonly ResourceTopic[]
  readonly tasks: readonly ResourceTask[]
  readonly aliases: readonly string[]
  readonly identifiers: readonly string[]
  readonly references?: readonly string[]
}

// Coverage descriptions only. Review evidence: .scratch/resources/research/source-review.md.
// URLs, statutory periods, publishers and source-review dates stay in the Rule registry.
export const resourceDefinitions: readonly ResourceDefinition[] = [
  // Procedural guides only. Review: .scratch/plan-action-links/source-review.md.
  {
    sourceIds: ['advance-tax-challan'],
    title: 'Generate a challan with e-Pay Tax',
    description:
      'Official instructions for creating an income-tax payment challan before or after login. Select the applicable period and payment type on the portal.',
    documentType: 'Guide',
    topics: ['income-tax'],
    tasks: ['advance-tax'],
    aliases: ['e-Pay Tax', 'income tax payment', 'payment challan'],
    identifiers: [],
  },
  {
    sourceIds: ['efiling-portal-guide'],
    title: 'Find filing services on the e-Filing portal',
    description:
      'An official tour of the dashboard, income-tax return filing and verification services. This guide does not select a return form for your plan.',
    documentType: 'Guide',
    topics: ['income-tax'],
    tasks: ['income-tax-return'],
    aliases: ['ITR', 'income tax return', 'e-filing dashboard'],
    identifiers: [],
  },
  {
    sourceIds: ['gst-registration-guide'],
    title: 'Apply for GST registration',
    description:
      'The official walkthrough for completing a normal-taxpayer registration application, including Parts A and B and submission.',
    documentType: 'Guide',
    topics: ['gst'],
    tasks: ['gst-registration'],
    aliases: ['GST registration help', 'new registration'],
    identifiers: ['GST REG-01'],
  },
  {
    sourceIds: ['gst-gstr1-guide'],
    title: 'Prepare and file GSTR-1',
    description:
      'Official instructions for entering outward supplies, reviewing the summary and filing monthly or quarterly GSTR-1.',
    documentType: 'Guide',
    topics: ['gst'],
    tasks: ['gst-returns'],
    aliases: ['outward supplies', 'GST filing help'],
    identifiers: ['GSTR-1'],
  },
  {
    sourceIds: ['gst-gstr3b-guide'],
    title: 'Prepare and file GSTR-3B',
    description:
      'Official instructions for preparing, previewing and filing GSTR-3B, including the payment screens.',
    documentType: 'Guide',
    topics: ['gst'],
    tasks: ['gst-returns'],
    aliases: ['GST filing help'],
    identifiers: ['GSTR-3B'],
  },
  {
    sourceIds: ['gst-qrmp-payment-guide'],
    title: 'Create a challan for a QRMP payment',
    description:
      'Official instructions for creating a GST challan, including the monthly payment option under QRMP. Use it after checking whether a deposit is needed.',
    documentType: 'Guide',
    topics: ['gst'],
    tasks: ['gst-returns'],
    aliases: ['QRMP', 'quarterly returns monthly payment', 'GST payment'],
    identifiers: ['PMT-06'],
  },
  {
    sourceIds: ['gst-lut-guide'],
    title: 'Furnish a letter of undertaking on the GST portal',
    description:
      'The official walkthrough for preparing, previewing and submitting an LUT in Form GST RFD-11.',
    documentType: 'Guide',
    topics: ['gst', 'overseas-clients'],
    tasks: ['lut'],
    aliases: ['LUT', 'letter of undertaking', 'export services'],
    identifiers: ['GST RFD-11'],
  },
  {
    sourceIds: ['gst-notification-82-2020'],
    title: 'GSTR-3B and QRMP payment schedules',
    description:
      'Rules on GST return periods, GSTR-3B filing and monthly payments under QRMP.',
    documentType: 'Notification',
    topics: ['gst'],
    tasks: ['gst-returns'],
    aliases: [
      'GST return dates',
      'quarterly returns monthly payment',
      'PMT-06',
    ],
    identifiers: ['GSTR-3B', 'Notification 82/2020'],
  },
  {
    sourceIds: ['gst-notification-83-2020'],
    title: 'GSTR-1 filing schedules',
    description:
      'The notification about monthly and quarterly GSTR-1 filing dates.',
    documentType: 'Notification',
    topics: ['gst'],
    tasks: ['gst-returns'],
    aliases: ['GST return dates', 'outward supplies'],
    identifiers: ['GSTR-1', 'Notification 83/2020'],
  },
  {
    sourceIds: ['gst-notification-84-2020'],
    title: 'QRMP eligibility',
    description:
      'Conditions for using the quarterly return and monthly payment scheme.',
    documentType: 'Notification',
    topics: ['gst'],
    tasks: ['gst-returns'],
    aliases: ['QRMP', 'quarterly returns monthly payment'],
    identifiers: ['Notification 84/2020'],
  },
  {
    sourceIds: ['gst-circular-143-2020'],
    title: 'QRMP elections and payments',
    description:
      'Guidance on choosing QRMP, changing filing frequency and making monthly payments.',
    documentType: 'Circular',
    topics: ['gst'],
    tasks: ['gst-returns'],
    aliases: [
      'QRMP',
      'quarterly returns monthly payment',
      'GST filing frequency',
    ],
    identifiers: ['Circular 143/13/2020'],
  },
  {
    sourceIds: ['gst-notification-37-2017'],
    title: 'LUT eligibility for exports',
    description:
      'The notification setting out who may furnish a letter of undertaking for exports.',
    documentType: 'Notification',
    topics: ['gst', 'overseas-clients'],
    tasks: ['lut'],
    aliases: ['LUT', 'export services'],
    identifiers: ['Notification 37/2017'],
  },
  {
    sourceIds: ['gst-circular-8-2017'],
    title: 'LUT validity and requirements',
    description:
      'Guidance on a letter of undertaking, its financial-year validity and related export requirements.',
    documentType: 'Circular',
    topics: ['gst', 'overseas-clients'],
    tasks: ['lut'],
    aliases: ['LUT', 'annual renewal', 'export services'],
    identifiers: ['Circular 8/8/2017'],
  },
  {
    sourceIds: ['gst-circular-125-2019'],
    title: 'LUT furnishing and late-submission review',
    description:
      'LUT provisions within the GST refund circular, including furnishing before export and review of late furnishing.',
    documentType: 'Circular',
    topics: ['gst', 'overseas-clients'],
    tasks: ['lut'],
    aliases: ['LUT', 'export services'],
    identifiers: ['Circular 125/44/2019'],
    references: ['LUT provisions in paragraphs 44 and 45'],
  },
  {
    sourceIds: [
      'income-tax-act-2025-2026',
      'domestic-salary-2026',
      'section-156',
    ],
    title: 'Income-tax Act: freelance income, salary and rebate',
    description:
      'The amended Act used for the income-tax references in this collection, including salary alongside freelance income and the resident-individual rebate.',
    documentType: 'Act',
    topics: ['income-tax'],
    tasks: [
      'tax-methods',
      'rates-deductions',
      'advance-tax',
      'income-tax-return',
    ],
    aliases: [
      'salary standard deduction',
      'rebate marginal relief',
      'presumptive income',
      'ITR',
    ],
    identifiers: ['Income-tax Act 2025'],
    references: [
      'Sections 15–19: salary and deductions',
      'Section 156: rebate',
      'Section 263: income tax return',
      'Section 408: advance tax',
    ],
  },
  {
    sourceIds: ['section-58'],
    title: 'Presumptive income for businesses and professions',
    description:
      'The income-tax provision covering presumptive profit, receipt limits and conditions for the business and specified-profession paths.',
    documentType: 'Section',
    topics: ['income-tax'],
    tasks: ['tax-methods', 'advance-tax'],
    aliases: [
      'presumptive taxation',
      'cash receipts',
      'eligible business',
      'specified profession',
    ],
    identifiers: ['Section 58'],
  },
  {
    sourceIds: ['section-62'],
    title: 'Specified professions and record-keeping',
    description:
      'The section defining specified professions and addressing books and records.',
    documentType: 'Section',
    topics: ['income-tax'],
    tasks: ['tax-methods'],
    aliases: [
      'specified profession',
      'professional income',
      'presumptive taxation',
    ],
    identifiers: ['Section 62'],
    references: ['Section 62(4): specified professions'],
  },
  {
    sourceIds: ['section-202'],
    title: 'New-regime income-tax rates',
    description:
      'The new-regime section covering income-tax rates and deduction conditions.',
    documentType: 'Section',
    topics: ['income-tax'],
    tasks: ['rates-deductions'],
    aliases: ['tax slabs', 'new tax regime'],
    identifiers: ['Section 202'],
  },
  {
    sourceIds: ['finance-act-2026'],
    title: 'Finance Act 2026',
    description:
      'The enacted Finance Act referenced for income-tax changes and cess.',
    documentType: 'Act',
    topics: ['income-tax'],
    tasks: ['rates-deductions'],
    aliases: ['health education cess', 'income tax amendments'],
    identifiers: ['Finance Act 2026'],
  },
  {
    sourceIds: ['section-404'],
    title: 'Advance tax: payment threshold',
    description: 'The section describing when advance tax becomes payable.',
    documentType: 'Section',
    topics: ['income-tax'],
    tasks: ['advance-tax'],
    aliases: ['advance tax liability', 'pay advance tax'],
    identifiers: ['Section 404'],
  },
  {
    sourceIds: ['section-408'],
    title: 'Advance tax: payment timing',
    description:
      'The section on advance-tax instalments, including payment timing for presumptive income.',
    documentType: 'Section',
    topics: ['income-tax'],
    tasks: ['advance-tax'],
    aliases: ['advance tax due date', 'pay advance tax'],
    identifiers: ['Section 408'],
    references: ['Section 408(2): presumptive advance tax'],
  },
  {
    sourceIds: ['section-263'],
    title: 'Income tax return: filing requirements and dates',
    description:
      'The section covering return-filing requirements and due dates.',
    documentType: 'Section',
    topics: ['income-tax'],
    tasks: ['income-tax-return'],
    aliases: ['ITR', 'annual return', 'filing threshold'],
    identifiers: ['Section 263'],
  },
  {
    sourceIds: ['rule-163'],
    title: 'Income tax return: additional filing conditions',
    description:
      'Rule 163 in the Income-tax Rules, covering additional conditions for furnishing a return.',
    documentType: 'Rules',
    topics: ['income-tax'],
    tasks: ['income-tax-return'],
    aliases: ['ITR', 'annual return', 'TDS TCS filing conditions'],
    identifiers: ['Rule 163'],
  },
  {
    sourceIds: ['budget-2026-return-dates'],
    title: 'Budget 2026: return-date proposals explained',
    description:
      'Budget FAQs explaining proposed return-date changes. Read alongside the enacted return-filing section.',
    documentType: 'Official FAQ',
    topics: ['income-tax'],
    tasks: ['income-tax-return'],
    aliases: ['ITR', 'income tax return due date'],
    identifiers: ['Budget 2026'],
  },
  {
    sourceIds: ['gst-act-2017'],
    title: 'GST Act: turnover and registration',
    description:
      'The Central GST Act used for the turnover and registration references in this collection.',
    documentType: 'Act',
    topics: ['gst'],
    tasks: ['gst-registration'],
    aliases: ['GST registration threshold', 'aggregate turnover', 'CGST'],
    identifiers: ['CGST Act 2017'],
  },
  {
    sourceIds: ['gst-registration-rules'],
    title: 'GST registration rules',
    description:
      'Official rules on registration applications and the registration process.',
    documentType: 'Rules',
    topics: ['gst'],
    tasks: ['gst-registration'],
    aliases: ['apply for GST', 'registration application'],
    identifiers: [],
  },
  {
    sourceIds: ['fema-export-regulations-2026'],
    title: 'Overseas payments: export and import regulations',
    description:
      'RBI regulations on export and import of goods and services, including receipt of export payments.',
    documentType: 'Regulations',
    topics: ['overseas-clients'],
    tasks: ['overseas-payments'],
    aliases: [
      'FEMA',
      'foreign clients',
      'overseas receipts',
      'export services',
      'international payments',
    ],
    identifiers: ['FEMA 23(R)/2026'],
  },
  {
    sourceIds: ['gst-registration-hub'],
    title: 'GST help portal',
    description:
      'An official starting point for GST help, including registration.',
    documentType: 'Official help portal',
    topics: ['gst'],
    tasks: ['gst-registration'],
    aliases: ['GST registration help', 'GST knowledge portal'],
    identifiers: [],
  },
  {
    sourceIds: ['gst-portal'],
    title: 'GST portal',
    description:
      'The official starting point for GST services and published filing information. Check the portal for updates.',
    documentType: 'Official portal',
    topics: ['gst'],
    tasks: ['gst-returns'],
    aliases: ['GST website', 'GST filing help'],
    identifiers: [],
  },
]

export const resourceExclusions: Readonly<Record<string, string>> = {
  'return-identification':
    'Deferred: current-period return instructions need review.',
}
