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
    readonly filingIncomeThreshold: number
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
const reviewedOn = '2026-08-30' as DateOnly

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
      'annual-return-threshold',
      'annual-return-date',
    ],
  },
  {
    id: 'finance-act-2026',
    kind: 'statutory',
    publisher: 'Ministry of Law and Justice',
    title: 'Finance Act, 2026',
    url: 'https://www.incometaxindia.gov.in/documents/d/guest/finance-act-2026-pdf-1',
    publicationDate: '2026-03-30',
    reviewDate: reviewedOn,
    taxPeriod,
    coveredRuleIds: ['income-ceiling', 'health-education-cess'],
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
    publicationDate: '2026-01-30',
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
  id: 'my-next-filing-2026-27-v2',
  schemaVersion: 1,
  taxPeriod,
  effectiveStart: '2026-04-01',
  effectiveEnd: '2027-03-31',
  verifiedOn: reviewedOn,
  expiresOn: '2027-08-31',
  changeNotes: [
    'Tax Year 2026-27 dataset reviewed on 30 August 2026.',
    'annual-return-threshold changed from an unconditional filing obligation to rounded total income above ₹4,00,000, effective 1 April 2026, under sections 202 and 263 of the Act amended 30 March 2026. Other filing triggers remain outside this check.',
    'GST turnover is a direct declared amount and is never derived from income-tax inputs.',
  ],
  sources: sourceRegistry,
  ruleSources: [
    { id: 'period', sourceId: 'income-tax-act-2026' },
    { id: 'supported-profession', sourceId: 'section-62' },
    { id: 'presumptive-receipts', sourceId: 'section-58' },
    { id: 'presumptive-profit', sourceId: 'section-58' },
    { id: 'income-ceiling', sourceId: 'finance-act-2026' },
    { id: 'new-regime-slabs', sourceId: 'budget-faq-2026' },
    { id: 'rebate-and-marginal-relief', sourceId: 'section-156' },
    { id: 'health-education-cess', sourceId: 'finance-act-2026' },
    { id: 'income-rounding', sourceId: 'income-tax-act-2026' },
    { id: 'advance-tax-threshold', sourceId: 'section-404' },
    { id: 'advance-tax-date', sourceId: 'income-tax-act-2026' },
    { id: 'annual-return-threshold', sourceId: 'income-tax-act-2026' },
    { id: 'annual-return-date', sourceId: 'income-tax-act-2026' },
    { id: 'gst-aggregate-turnover', sourceId: 'gst-act-2026' },
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
    filingIncomeThreshold: 400_000,
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

const requiredRuleIds = [
  'period',
  'supported-profession',
  'presumptive-receipts',
  'presumptive-profit',
  'income-ceiling',
  'new-regime-slabs',
  'rebate-and-marginal-relief',
  'health-education-cess',
  'income-rounding',
  'advance-tax-threshold',
  'advance-tax-date',
  'annual-return-threshold',
  'annual-return-date',
  'gst-aggregate-turnover',
  'gst-registration-threshold',
] as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const isDate = (value: unknown): value is DateOnly => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toISOString().slice(0, 10) === value
}

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

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
  if (!isRecord(value))
    return { valid: false, errors: ['Rules must be an object.'] }

  const rules = value
  if (!isText(rules.id)) errors.push('Rules need a dataset identity.')
  if (rules.schemaVersion !== 1)
    errors.push('Rules use an unknown schema version.')
  if (rules.taxPeriod !== taxPeriod)
    errors.push('Rules use an unsupported tax period.')
  if (
    !isDate(rules.effectiveStart) ||
    !isDate(rules.effectiveEnd) ||
    !isDate(rules.verifiedOn) ||
    !isDate(rules.expiresOn)
  ) {
    errors.push('Rules need valid effective, verification, and expiry dates.')
  } else {
    if (
      rules.effectiveStart !== '2026-04-01' ||
      rules.effectiveEnd !== '2027-03-31'
    )
      errors.push('Rules use dates outside the supported tax period.')
    if (rules.effectiveStart > rules.effectiveEnd)
      errors.push('Rules have an invalid effective date range.')
    if (rules.expiresOn < rules.effectiveEnd)
      errors.push('Rules expire before the supported period ends.')
    if (rules.expiresOn > '2027-08-31')
      errors.push('Rules expire after the supported review window.')
    if (rules.expiresOn < todayInIndia(now))
      errors.push('Rules have expired and must be reviewed.')
    if (rules.verifiedOn > todayInIndia(now))
      errors.push('Rules have a future verification date.')
  }
  if (
    !Array.isArray(rules.changeNotes) ||
    rules.changeNotes.length === 0 ||
    rules.changeNotes.some((note) => !isText(note))
  )
    errors.push('Rules need human-readable change notes.')

  const sourceRecords = new Map<string, Record<string, unknown>>()
  if (!Array.isArray(rules.sources) || rules.sources.length === 0) {
    errors.push('Rules need statutory sources.')
  } else {
    const ids = new Set<string>()
    for (const source of rules.sources) {
      if (!isRecord(source)) {
        errors.push('Rules contain an invalid source.')
        continue
      }
      if (!isText(source.id) || ids.has(source.id)) {
        errors.push('Rules contain a duplicate or missing source identity.')
      } else {
        ids.add(source.id)
        sourceRecords.set(source.id, source)
      }
      if (!isText(source.url) || !source.url.startsWith('https://'))
        errors.push('Rules contain a non-HTTPS source URL.')
      if (!isDate(source.reviewDate))
        errors.push('Rules contain a source without a valid review date.')
      else if (source.reviewDate > todayInIndia(now))
        errors.push('Rules contain a source with a future review date.')
      if (
        source.publicationDate !== undefined &&
        !isDate(source.publicationDate)
      )
        errors.push('Rules contain an invalid source publication date.')
      else if (
        isDate(source.publicationDate) &&
        isDate(source.reviewDate) &&
        source.publicationDate > source.reviewDate
      )
        errors.push('Rules contain a source reviewed before publication.')
      if (source.kind === 'statutory') {
        if (
          !isText(source.publisher) ||
          !isText(source.title) ||
          source.taxPeriod !== taxPeriod ||
          !Array.isArray(source.coveredRuleIds) ||
          source.coveredRuleIds.some((id) => !isText(id))
        )
          errors.push('Rules contain an incomplete statutory source.')
      } else if (source.kind === 'tutorial') {
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
      } else {
        errors.push('Rules contain an unknown source kind.')
      }
      if (source.kind === 'tutorial' && source.status === 'approved') {
        if (
          !['Income Tax Department', 'Goods and Services Tax'].includes(
            String(source.publisher ?? ''),
          )
        ) {
          errors.push(
            'Rules contain an approved tutorial from an unreviewed publisher.',
          )
        }
      }
    }
    if (
      !rules.sources.some(
        (source) => isRecord(source) && source.kind === 'statutory',
      )
    )
      errors.push('Rules need a statutory source.')
  }

  if (!Array.isArray(rules.ruleSources) || rules.ruleSources.length === 0) {
    errors.push('Rules need rule provenance.')
  } else {
    const ids = new Set<string>()
    for (const reference of rules.ruleSources) {
      if (!isRecord(reference)) {
        errors.push('Rules contain an invalid rule reference.')
        continue
      }
      if (!isText(reference.id) || ids.has(reference.id))
        errors.push('Rules contain a duplicate or missing rule identity.')
      if (isText(reference.id)) ids.add(reference.id)
      const source = isText(reference.sourceId)
        ? sourceRecords.get(reference.sourceId)
        : undefined
      if (!source || source.kind !== 'statutory') {
        errors.push(
          `Rule ${isText(reference.id) ? reference.id : 'reference'} has a missing statutory source.`,
        )
      } else if (
        !Array.isArray(source.coveredRuleIds) ||
        !source.coveredRuleIds.includes(reference.id)
      ) {
        errors.push(`Rule ${reference.id} is not covered by its source.`)
      }
    }
    for (const id of requiredRuleIds)
      if (!ids.has(id)) errors.push(`Rule ${id} has no provenance.`)
  }

  const presumptive = isRecord(rules.presumptive) ? rules.presumptive : null
  if (
    !presumptive ||
    presumptive.minimumProfitRate !== 0.5 ||
    presumptive.cashReceiptRate !== 0.05 ||
    presumptive.standardReceiptLimit !== 5_000_000 ||
    presumptive.lowCashReceiptLimit !== 7_500_000
  )
    errors.push('Rules contain unsupported presumptive-tax values.')

  const expectedSlabs = [
    [400_000, 0],
    [800_000, 0.05],
    [1_200_000, 0.1],
    [1_600_000, 0.15],
    [2_000_000, 0.2],
    [2_400_000, 0.25],
    [null, 0.3],
  ] as const
  const income = isRecord(rules.income) ? rules.income : null
  if (
    !income ||
    income.ceiling !== 5_000_000 ||
    income.rebateLimit !== 1_200_000 ||
    income.rebateMaximum !== 60_000 ||
    income.cessRate !== 0.04 ||
    !Array.isArray(income.slabs) ||
    income.slabs.length !== expectedSlabs.length ||
    !income.slabs.every((slab, index) => {
      const expected = expectedSlabs[index]
      return (
        isRecord(slab) &&
        slab.upper === expected[0] &&
        slab.rate === expected[1]
      )
    })
  )
    errors.push('Rules contain income-tax values outside the supported set.')

  const gst = isRecord(rules.gst) ? rules.gst : null
  if (
    !gst ||
    gst.lowerThreshold !== 1_000_000 ||
    gst.standardThreshold !== 2_000_000 ||
    !Array.isArray(gst.lowerThresholdStates) ||
    gst.lowerThresholdStates.join(',') !== 'Manipur,Mizoram,Nagaland,Tripura'
  )
    errors.push('Rules contain GST thresholds outside the supported profile.')

  const obligations = [
    ['advance tax', rules.advanceTax, '2027-03-15', 'advance-tax-date'],
    ['annual return', rules.annualReturn, '2027-08-31', 'annual-return-date'],
  ] as const
  for (const [name, obligation, normalDueDate, ruleId] of obligations) {
    if (!isRecord(obligation) || !isDate(obligation.normalDueDate)) {
      errors.push('Rules need valid obligation due dates.')
      continue
    }
    if (obligation.normalDueDate !== normalDueDate)
      errors.push(`Rules contain an unsupported ${name} due date.`)
    if (
      obligation.operativeDueDate !== null &&
      !isDate(obligation.operativeDueDate)
    )
      errors.push('Rules contain an invalid operative due date.')
    if (
      isDate(obligation.operativeDueDate) &&
      obligation.operativeDueDate <= obligation.normalDueDate
    )
      errors.push('An operative due date must extend the normal due date.')
    if (obligation.operativeDueDate && !isText(obligation.extensionSourceId))
      errors.push('An operative due date needs extension provenance.')
    if (!obligation.operativeDueDate && obligation.extensionSourceId !== null)
      errors.push('Extension provenance needs an operative due date.')
    if (isText(obligation.extensionSourceId)) {
      const source = sourceRecords.get(obligation.extensionSourceId)
      if (
        !source ||
        source.kind !== 'statutory' ||
        !Array.isArray(source.coveredRuleIds) ||
        !source.coveredRuleIds.includes(ruleId)
      )
        errors.push('An operative due date needs a statutory extension source.')
    }
  }

  const advanceTax = isRecord(rules.advanceTax) ? rules.advanceTax : null
  if (!advanceTax || advanceTax.liabilityThreshold !== 10_000)
    errors.push('Rules contain an unsupported advance-tax threshold.')
  const annualReturn = isRecord(rules.annualReturn) ? rules.annualReturn : null
  if (!annualReturn || annualReturn.filingIncomeThreshold !== 400_000)
    errors.push('Rules contain an unsupported return-filing threshold.')

  return errors.length > 0
    ? { valid: false, errors }
    : { valid: true, data: value as RuleDataset }
}
