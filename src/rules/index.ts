export type DateOnly = `${number}-${number}-${number}`

export type StatutorySource = {
  readonly id: string
  readonly kind: 'statutory'
  readonly publisher: string
  readonly title: string
  readonly url: string
  readonly publicationDate?: DateOnly
  readonly reviewDate: DateOnly
  readonly taxPeriod: string
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

export type RuleDataset = {
  readonly id: string
  readonly schemaVersion: 1
  readonly taxPeriod: string
  readonly effectiveStart: DateOnly
  readonly effectiveEnd: DateOnly
  readonly verifiedOn: DateOnly
  readonly expiresOn: DateOnly
  readonly changeNotes: readonly string[]
  readonly sources: readonly Source[]
  readonly ruleSources: readonly {
    readonly id: string
    readonly sourceId: string
  }[]
  readonly presumptive: {
    readonly minimumProfitRate: number
    readonly cashReceiptRate: number
    readonly standardReceiptLimit: number
    readonly lowCashReceiptLimit: number
  }
  readonly income: {
    readonly ceiling: number
    readonly slabs: readonly {
      readonly upper: number | null
      readonly rate: number
    }[]
    readonly rebateLimit: number
    readonly rebateMaximum: number
    readonly cessRate: number
  }
  readonly advanceTax: {
    readonly liabilityThreshold: number
    readonly normalDueDate: DateOnly
    readonly operativeDueDate: DateOnly | null
    readonly extensionSourceId: string | null
  }
  readonly annualReturn: {
    readonly normalDueDate: DateOnly
    readonly operativeDueDate: DateOnly | null
    readonly extensionSourceId: string | null
  }
  readonly gst: {
    readonly lowerThresholdStates: readonly string[]
    readonly lowerThreshold: number
    readonly standardThreshold: number
  }
}

const taxPeriod = 'Tax Year 2026-27'
const reviewedOn = '2026-08-29' as DateOnly

export const sourceRegistry = [
  {
    id: 'income-tax-act-2026',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Income-tax Act, 2025 as amended by Finance Act, 2026',
    url: 'https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf',
    publicationDate: '2026-03-30',
    reviewDate: reviewedOn,
    taxPeriod,
    coveredRuleIds: [
      'period',
      'presumptive-receipts',
      'presumptive-profit',
      'advance-tax-date',
      'income-rounding',
      'annual-return-date',
    ],
  },
  {
    id: 'section-58',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Section 58: presumptive income from profession',
    url: 'https://www.incometaxindia.gov.in/w/section-58-138',
    reviewDate: reviewedOn,
    taxPeriod,
    coveredRuleIds: ['presumptive-receipts', 'presumptive-profit'],
  },
  {
    id: 'section-62',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Section 62: specified professions',
    url: 'https://www.incometaxindia.gov.in/w/section-62-134',
    reviewDate: reviewedOn,
    taxPeriod,
    coveredRuleIds: ['supported-profession'],
  },
  {
    id: 'section-156',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Section 156: rebate for resident individuals',
    url: 'https://wmstatic-prd.incometaxindia.gov.in/documents/20117/42998/Section-156_2026-04-01_05-11-58_344893_en.pdf/415b0f0e-8826-feaa-b374-481e54d4b98e',
    publicationDate: '2026-04-01',
    reviewDate: reviewedOn,
    taxPeriod,
    coveredRuleIds: ['rebate-and-marginal-relief'],
  },
  {
    id: 'section-404',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Section 404: advance-tax applicability',
    url: 'https://www.incometaxindia.gov.in/w/section-404-5',
    reviewDate: reviewedOn,
    taxPeriod,
    coveredRuleIds: ['advance-tax-threshold'],
  },
  {
    id: 'budget-faq-2026',
    kind: 'statutory',
    publisher: 'Income Tax Department',
    title: 'Budget 2026 FAQs: tax slabs and rebate examples',
    url: 'https://www.incometaxindia.gov.in/documents/20117/15766092/FAQs-Budget-2026%2BUpdated.pdf/daf54d14-aca9-c4ea-b786-598fd2f8d4c4',
    reviewDate: reviewedOn,
    taxPeriod,
    coveredRuleIds: ['new-regime-slabs'],
  },
  {
    id: 'gst-act-2026',
    kind: 'statutory',
    publisher: 'India Code',
    title:
      'Central Goods and Services Tax Act, 2017, consolidated to 11 June 2026',
    url: 'https://www.indiacode.nic.in/indiacode/bitstream/123456789/15689/1/A2017-12.pdf',
    publicationDate: '2017-04-12',
    reviewDate: reviewedOn,
    taxPeriod,
    coveredRuleIds: ['gst-aggregate-turnover', 'gst-registration-threshold'],
  },
  {
    id: 'advance-tax-challan',
    kind: 'tutorial',
    publisher: 'Income Tax Department',
    title: 'How to generate challan form',
    url: 'https://www.incometax.gov.in/iec/foportal/help/generate-challan-form',
    reviewDate: reviewedOn,
    coveredObligation: 'advance-tax',
    status: 'provisional',
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
] as const satisfies readonly Source[]

export const currentRules = {
  id: 'my-next-filing-2026-27-v1',
  schemaVersion: 1,
  taxPeriod,
  effectiveStart: '2026-04-01',
  effectiveEnd: '2027-03-31',
  verifiedOn: reviewedOn,
  expiresOn: '2027-08-31',
  changeNotes: [
    'Initial Tax Year 2026-27 dataset reviewed on 29 August 2026.',
    'GST turnover is a direct declared amount and is never derived from income-tax inputs.',
  ],
  sources: sourceRegistry,
  ruleSources: [
    { id: 'supported-profession', sourceId: 'section-62' },
    { id: 'presumptive-receipts', sourceId: 'section-58' },
    { id: 'presumptive-profit', sourceId: 'section-58' },
    { id: 'new-regime-slabs', sourceId: 'budget-faq-2026' },
    { id: 'rebate-and-marginal-relief', sourceId: 'section-156' },
    { id: 'advance-tax-threshold', sourceId: 'section-404' },
    { id: 'advance-tax-date', sourceId: 'income-tax-act-2026' },
    { id: 'annual-return-date', sourceId: 'income-tax-act-2026' },
    { id: 'gst-registration-threshold', sourceId: 'gst-act-2026' },
  ],
  presumptive: {
    minimumProfitRate: 0.5,
    cashReceiptRate: 0.05,
    standardReceiptLimit: 5_000_000,
    lowCashReceiptLimit: 7_500_000,
  },
  income: {
    ceiling: 5_000_000,
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
    cessRate: 0.04,
  },
  advanceTax: {
    liabilityThreshold: 10_000,
    normalDueDate: '2027-03-15',
    operativeDueDate: null,
    extensionSourceId: null,
  },
  annualReturn: {
    normalDueDate: '2027-08-31',
    operativeDueDate: null,
    extensionSourceId: null,
  },
  gst: {
    lowerThresholdStates: ['Manipur', 'Mizoram', 'Nagaland', 'Tripura'],
    lowerThreshold: 1_000_000,
    standardThreshold: 2_000_000,
  },
} as const satisfies RuleDataset

export type RuleValidation =
  | { readonly valid: true; readonly data: RuleDataset }
  | { readonly valid: false; readonly errors: readonly string[] }

const isDate = (value: unknown): value is DateOnly =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`))

const todayInIndia = (now: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const find = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  return `${find('year')}-${find('month')}-${find('day')}` as DateOnly
}

export function validateRuleDataset(
  value: unknown,
  now = new Date(),
): RuleValidation {
  const errors: string[] = []
  if (!value || typeof value !== 'object')
    return { valid: false, errors: ['Rules must be an object.'] }

  const rules = value as Partial<RuleDataset>
  if (!rules.id) errors.push('Rules need a dataset identity.')
  if (rules.schemaVersion !== 1)
    errors.push('Rules use an unknown schema version.')
  if (
    !isDate(rules.effectiveStart) ||
    !isDate(rules.effectiveEnd) ||
    !isDate(rules.expiresOn)
  ) {
    errors.push('Rules need valid effective and expiry dates.')
  } else {
    if (rules.effectiveStart > rules.effectiveEnd)
      errors.push('Rules have an invalid effective date range.')
    if (rules.expiresOn < rules.effectiveEnd)
      errors.push('Rules expire before the supported period ends.')
    if (rules.expiresOn > '2027-08-31')
      errors.push('Rules expire after the supported review window.')
    if (rules.expiresOn < todayInIndia(now))
      errors.push('Rules have expired and must be reviewed.')
  }

  if (!Array.isArray(rules.sources) || rules.sources.length === 0) {
    errors.push('Rules need statutory sources.')
  } else {
    const ids = new Set<string>()
    for (const source of rules.sources) {
      if (!source || typeof source !== 'object') {
        errors.push('Rules contain an invalid source.')
        continue
      }
      const candidate = source as Partial<Source>
      if (!candidate.id || ids.has(candidate.id))
        errors.push('Rules contain a duplicate or missing source identity.')
      if (candidate.id) ids.add(candidate.id)
      if (!candidate.url || !candidate.url.startsWith('https://'))
        errors.push('Rules contain a non-HTTPS source URL.')
      if (
        candidate.kind === 'statutory' &&
        (!candidate.publisher || !candidate.title)
      ) {
        errors.push('Rules contain an incomplete statutory source.')
      }
      if (candidate.kind === 'tutorial' && candidate.status === 'approved') {
        if (
          !['Income Tax Department', 'Goods and Services Tax'].includes(
            candidate.publisher ?? '',
          )
        ) {
          errors.push(
            'Rules contain an approved tutorial from an unreviewed publisher.',
          )
        }
      }
    }
    if (!rules.sources.some((source) => source.kind === 'statutory'))
      errors.push('Rules need a statutory source.')
  }

  if (!Array.isArray(rules.ruleSources) || rules.ruleSources.length === 0) {
    errors.push('Rules need rule provenance.')
  } else {
    const ids = new Set<string>()
    const sourceIds = new Set((rules.sources ?? []).map((source) => source.id))
    for (const reference of rules.ruleSources) {
      if (!reference.id || ids.has(reference.id))
        errors.push('Rules contain a duplicate or missing rule identity.')
      if (reference.id) ids.add(reference.id)
      if (!sourceIds.has(reference.sourceId))
        errors.push(`Rule ${reference.id || 'reference'} has a missing source.`)
    }
  }

  const expectedRates = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]
  if (
    !rules.income ||
    !Array.isArray(rules.income.slabs) ||
    rules.income.slabs.map((slab) => slab.rate).join(',') !==
      expectedRates.join(',')
  ) {
    errors.push('Rules contain tax rates outside the supported slab set.')
  }
  if (
    !rules.gst ||
    rules.gst.lowerThreshold !== 1_000_000 ||
    rules.gst.standardThreshold !== 2_000_000 ||
    !Array.isArray(rules.gst.lowerThresholdStates)
  ) {
    errors.push('Rules contain GST thresholds outside the supported profile.')
  }

  for (const obligation of [rules.advanceTax, rules.annualReturn]) {
    if (!obligation || !isDate(obligation.normalDueDate)) {
      errors.push('Rules need valid obligation due dates.')
    } else if (obligation.operativeDueDate && !obligation.extensionSourceId) {
      errors.push('An operative due date needs extension provenance.')
    }
  }

  return errors.length > 0
    ? { valid: false, errors }
    : { valid: true, data: value as RuleDataset }
}
