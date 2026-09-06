import { taxYearShort } from '@/lib/tax-period'
import {
  AdditionalIncomeHelp,
  SalaryCoverageHelp,
} from '@/routes/check/other-income-help'
import type {
  QuestionnaireDispatch,
  QuestionnaireEvent,
} from '@/routes/check/session'
import {
  activityOptions,
  additionalIncomeFields,
  creditTriggerMayApply,
  groupStep,
  gstQuarterQuestions,
  hasForeignClients,
  hasPlatformWork,
  isBusinessPath,
  isUnregisteredGst,
  optionLabels,
  parseMoney,
  unsupportedFactLabels,
} from '@/routes/check/model'
import { useRef } from 'react'
import type { UnsupportedFact } from '@/evaluation'
import { flushSync } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Draft } from '@/routes/check/model'
import { CheckHeading, FieldError } from '@/routes/check/fields'

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

export function UnsupportedFactsField({
  draft,
  dispatch,
  error,
}: {
  readonly draft: Draft
  readonly dispatch: QuestionnaireDispatch
  readonly error?: string
}) {
  const options = (
    Object.entries(unsupportedFactLabels) as [UnsupportedFact, string][]
  ).filter(
    ([value]) =>
      value !== 'unsupportedFactsNotSure' &&
      (value !== 'dividendsOrGifts' || draft.unsupportedFacts.includes(value)),
  )
  const warningId = 'unsupportedCertainty-unsupported'
  const pointerSelection = useRef(false)
  const updateDraft = (event: QuestionnaireEvent) => {
    const apply = () => dispatch(event)
    const animate = pointerSelection.current
    pointerSelection.current = false
    if (
      !animate ||
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      apply()
      return
    }
    document.startViewTransition(() => flushSync(apply))
  }
  return (
    <fieldset
      id="unsupportedCertainty"
      tabIndex={-1}
      className="field choice-field unsupported-facts"
      aria-invalid={Boolean(error)}
      aria-describedby={`unsupportedCertainty-help${error ? ' unsupportedCertainty-error' : ''}`}
      onPointerDown={() => {
        pointerSelection.current = true
      }}
      onKeyDown={() => {
        pointerSelection.current = false
      }}
    >
      <legend id="unsupportedCertainty-legend">
        Do any of these situations apply to you?
      </legend>
      <p className="field-help" id="unsupportedCertainty-help">
        Select every situation that applies. If none apply, choose None of
        these. Choose Not sure if you cannot confirm.
      </p>
      <div className="choice-grid unsupported-options">
        {options.map(([value, label]) => {
          const checked = draft.unsupportedFacts.includes(value)
          return (
            <label
              className={`choice-card unsupported-option has-focus-visible:outline-[.2rem] has-focus-visible:outline-offset-[.2rem]${checked ? ' choice-card--unsupported' : ''}`}
              key={value}
              style={{
                outlineColor: 'var(--ring)',
                viewTransitionName: `unsupported-${value}`,
              }}
            >
              <Checkbox
                className="absolute! size-px! overflow-hidden! border-0! p-0! whitespace-nowrap! [clip:rect(0,0,0,0)]"
                name="unsupportedFacts"
                value={value}
                checked={checked}
                aria-describedby={checked ? warningId : undefined}
                onCheckedChange={(nextChecked) => {
                  updateDraft({
                    type: 'unsupported-fact-toggled',
                    fact: value,
                    checked: nextChecked,
                  })
                }}
              />
              <span>{label}</span>
            </label>
          )
        })}
      </div>
      {draft.unsupportedFacts.includes('salary') && (
        <p className="field-help">
          Check which salary situations this version can cover.{' '}
          <SalaryCoverageHelp />
        </p>
      )}
      {(draft.unsupportedFacts.includes('unsupportedDividends') ||
        draft.unsupportedFacts.includes('dividendsOrGifts')) && (
        <p className="field-help">
          Review the dividend and interest fields above. If an older answer
          combined dividends and gifts, select any gift income separately before
          clearing that answer. <AdditionalIncomeHelp />
        </p>
      )}
      <RadioGroup
        aria-labelledby="unsupportedCertainty-legend"
        className="choice-grid unsupported-alternatives"
        name="unsupportedCertainty"
        value={
          draft.unsupportedCertainty === 'none' ||
          draft.unsupportedCertainty === 'not-sure'
            ? draft.unsupportedCertainty
            : ''
        }
        onValueChange={(value) =>
          updateDraft({
            type: 'unsupportedCertainty-changed',
            value: value as Draft['unsupportedCertainty'],
          })
        }
      >
        {[
          ['none', 'None of these'],
          ['not-sure', 'Not sure'],
        ].map(([value, label]) => {
          const warning =
            value === 'not-sure' && draft.unsupportedCertainty === value
          return (
            <label
              className={`choice-card${warning ? ' choice-card--unsupported' : ''}`}
              key={value}
            >
              <RadioGroupItem
                value={value}
                tone={warning ? 'warning' : 'default'}
                aria-describedby={value === 'not-sure' ? warningId : undefined}
              />
              <span>{label}</span>
            </label>
          )
        })}
      </RadioGroup>
      <FieldError id="unsupportedCertainty-error" error={error} />
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
  const answer = (
    value: string,
    labels: Readonly<Record<string, string>> = {},
  ) => labels[value] ?? optionLabels[value] ?? (value || 'Not answered')
  const money = (value: string) => {
    const parsed = parseMoney(value)
    return 'value' in parsed
      ? `₹${parsed.value.toLocaleString('en-IN')}`
      : 'Not entered'
  }
  const date = (value: string) =>
    value
      ? new Intl.DateTimeFormat('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Asia/Kolkata',
        }).format(new Date(`${value}T00:00:00+05:30`))
      : 'Not entered'
  const groups = [
    {
      title: 'You and your practice',
      editLabel: 'Edit answers about you and your practice',
      step: groupStep('tax-year'),
      answers: [
        { label: 'Person', value: answer(draft.personKind) },
        { label: '18 or older', value: answer(draft.adult) },
        { label: 'Residence status', value: answer(draft.residence) },
        { label: 'Tax regime', value: answer(draft.taxRegime) },
        {
          label: 'One self-employed service practice',
          value: answer(draft.onePractice),
        },
        {
          label: 'Practice set up and managed in India',
          value: answer(draft.setupInIndia),
        },
        {
          label: 'All work performed in India',
          value: answer(draft.workInIndia),
        },
        { label: 'Business partner', value: answer(draft.hasPartner) },
        { label: 'Employees', value: answer(draft.hasEmployee) },
        {
          label: 'Business operation outside India',
          value: answer(draft.hasForeignOperation),
        },
        {
          label: 'Client-work subcontractor',
          value: answer(draft.hasClientWorkSubcontractor),
        },
        ...(draft.hasClientWorkSubcontractor === 'no'
          ? [
              {
                label: 'Support-only contractor in India',
                value: answer(draft.contractorBoundary, {
                  none: 'No',
                  'incidental-domestic': 'Yes',
                }),
              },
            ]
          : []),
      ],
    },
    {
      title: 'Your work and tax method',
      editLabel: 'Edit your work and tax method',
      step: groupStep('activity'),
      answers: [
        {
          label: 'Work type',
          value:
            activityOptions.find(({ value }) => value === draft.activity)
              ?.label ?? 'Not answered',
        },
        { label: 'Tax method', value: answer(draft.path) },
        { label: 'Method confirmed', value: answer(draft.pathConfirmed) },
        ...(isBusinessPath(draft)
          ? [
              {
                label: 'Services rather than goods transport',
                value: answer(draft.notGoodsCarriage),
              },
              {
                label: 'Working on your own account',
                value: answer(draft.notAgencyCommissionBrokerage),
              },
              {
                label: 'No Chapter VIII-C deduction',
                value: answer(draft.noChapterViiiCDeduction),
              },
              {
                label: 'Five-year exclusion',
                value: answer(draft.fiveYearExclusion),
              },
            ]
          : []),
      ],
    },
    {
      title: 'Receipts and profit',
      editLabel: 'Edit receipts and profit',
      step: groupStep('receipts'),
      answers: [
        {
          label: isBusinessPath(draft)
            ? 'Gross business receipts'
            : 'Gross professional receipts',
          value: money(draft.amounts.grossReceipts),
        },
        ...(isBusinessPath(draft)
          ? [
              {
                label: 'Qualifying bank or online receipts',
                value: money(draft.amounts.qualifyingReceipts),
              },
              {
                label: 'All other business receipts',
                value: money(draft.amounts.otherReceipts),
              },
            ]
          : []),
        {
          label: 'Receipts paid in cash',
          value: money(draft.amounts.cashReceipts),
        },
        {
          label: 'Declared profit',
          value: money(draft.amounts.declaredProfit),
        },
      ],
    },
    {
      title: 'Clients and payments',
      editLabel: 'Edit clients and payments',
      step: groupStep('clients'),
      answers: [
        { label: 'Client location', value: answer(draft.clientKind) },
        {
          label: 'How you work with clients',
          value: answer(draft.delivery, {
            direct: 'Directly',
            platform: 'Through a platform',
            both: 'Directly and through a platform',
          }),
        },
        ...(hasPlatformWork(draft)
          ? [
              {
                label: 'Main service provided by you',
                value: answer(draft.platformOwnAccount),
              },
              {
                label: 'Who the service contract is with',
                value: answer(draft.platformRecipientIdentifiable),
              },
              {
                label: 'Full client payment shown in records',
                value: answer(draft.platformGrossBeforeFees),
              },
              {
                label: 'Own freelance service income confirmed',
                value: answer(draft.platformIncomeCharacter),
              },
              {
                label: 'Foreign platform fee',
                value: answer(draft.platformForeignFeeGstTreatment, {
                  'not-applicable': 'No foreign platform fee',
                  known: 'Yes, and I have confirmed how GST applies',
                }),
              },
              {
                label: 'No reverse-charge GST on platform fee',
                value: answer(draft.platformNoRecipientReverseCharge),
              },
            ]
          : []),
        ...(hasForeignClients(draft)
          ? [
              {
                label: 'Foreign-client work performed from India',
                value: answer(draft.foreignWorkInIndia),
              },
              {
                label: 'Who the overseas service contract is with',
                value: answer(draft.foreignRecipientIdentifiable),
              },
              {
                label: 'Main overseas service provided by you',
                value: answer(draft.foreignOwnAccount),
              },
              {
                label: 'General GST place-of-supply rule confirmed',
                value: answer(draft.foreignPlaceOfSupply),
              },
              {
                label: 'Same legal entity as overseas client',
                value: answer(draft.foreignSameEstablishment),
              },
              {
                label: 'Payment route',
                value: answer(draft.foreignPaymentRoute),
              },
              {
                label: 'Payments reach your own Indian bank account',
                value: answer(draft.foreignSettledToIndianBank),
              },
              {
                label: 'Overseas account or money held abroad',
                value: answer(draft.foreignAccountExposure, {
                  none: 'No',
                  possible: 'Yes or possibly',
                }),
              },
              {
                label: 'Business operation outside India',
                value: answer(draft.foreignOperation),
              },
              {
                label: 'Foreign tax deducted from payments',
                value: answer(draft.foreignTax),
              },
              {
                label: 'Foreign-tax or treaty relief claimed',
                value: answer(draft.foreignTreatyRelief),
              },
              {
                label: 'Full year’s gross receipts confirmed in rupees',
                value: answer(draft.foreignReceiptsResolved),
              },
              {
                label:
                  'Currency conversions and exchange gains or losses included',
                value: answer(draft.foreignCurrencyResolved),
              },
            ]
          : []),
      ],
    },
    {
      title: 'Other income and tax paid',
      editLabel: 'Edit other income and tax paid',
      step: groupStep('other-income'),
      answers: [
        {
          label: 'Dividends and additional interest',
          value: answer(draft.hasAdditionalIncome),
        },
        ...(draft.hasAdditionalIncome === 'yes'
          ? [
              {
                label: 'Income types and annual amounts confirmed',
                value: answer(draft.additionalIncomeConfirmed),
              },
              ...additionalIncomeFields.map(({ key, label }) => ({
                label,
                value: money(draft.amounts[key]),
              })),
            ]
          : []),
        {
          label: 'Salary alongside freelancing',
          value: answer(draft.hasSalary),
        },
        ...(draft.hasSalary === 'yes'
          ? [
              {
                label: 'Salary conditions confirmed',
                value: answer(draft.salaryConfirmed),
              },
              {
                label: 'Annual salary before standard deduction',
                value: money(draft.amounts.grossSalary),
              },
            ]
          : []),
        {
          label: 'Taxable bank or deposit interest',
          value: money(draft.amounts.taxableBankInterest),
        },
        { label: 'Indian TDS credit', value: money(draft.amounts.tds) },
        { label: 'Indian TCS credit', value: money(draft.amounts.tcs) },
        {
          label: 'Advance tax already paid',
          value: money(draft.amounts.advanceTaxPaid),
        },
        ...(creditTriggerMayApply(draft)
          ? [
              {
                label: `60 or older during ${taxYearShort}`,
                value: answer(draft.ageSixtyOrOlder),
              },
            ]
          : []),
        {
          label: 'Another income-tax return condition',
          value: answer(draft.otherAnnualReturnTrigger),
        },
        {
          label: 'Situations outside this version',
          value:
            draft.unsupportedCertainty === 'selected'
              ? draft.unsupportedFacts
                  .map((fact) => unsupportedFactLabels[fact])
                  .join(', ')
              : answer(draft.unsupportedCertainty, {
                  none: 'None of these',
                }),
        },
      ],
    },
    {
      title: 'GST registration and filings',
      editLabel: 'Edit GST registration and filing answers',
      step: groupStep('gst'),
      answers: [
        { label: 'Ever had a GSTIN', value: answer(draft.gstKind) },
        ...(draft.gstKind === 'registered'
          ? [
              {
                label: 'GST registration',
                value: answer(draft.gstStatus),
              },
              ...(draft.gstStatus === 'one-normal'
                ? [
                    { label: 'GSTIN registered in', value: draft.gstState },
                    {
                      label: 'Effective registration date',
                      value: date(draft.gstRegisteredFrom),
                    },
                    {
                      label: 'Registration history and first period checked',
                      value: answer(draft.gstContinuous),
                    },
                    ...gstQuarterQuestions(draft).map(({ field, label }) => ({
                      label: `Filing frequency for ${label}`,
                      value: answer(draft[field], {
                        monthly: 'Monthly',
                        qrmp: 'Quarterly returns (QRMP)',
                      }),
                    })),
                    {
                      label: 'Export route',
                      value: answer(draft.gstExportRoute, {
                        none: 'No exports or SEZ supplies',
                        lut: 'LUT: without IGST',
                        igst: 'With IGST payment',
                        other: 'Bond, SEZ or mixed routes',
                      }),
                    },
                    ...(draft.gstExportRoute === 'lut'
                      ? [
                          {
                            label: 'LUT conditions confirmed',
                            value: answer(draft.gstLutConfirmed),
                          },
                          {
                            label: 'First service export date',
                            value: date(draft.gstFirstExportDate),
                          },
                        ]
                      : []),
                  ]
                : []),
            ]
          : []),
        ...(isUnregisteredGst(draft)
          ? [
              {
                label: 'Taxable supplies made from',
                value: draft.gstState || 'Not answered',
              },
              {
                label: 'GST aggregate turnover',
                value: money(draft.amounts.aggregateTurnover),
              },
              {
                label: 'Complete aggregate turnover',
                value: answer(draft.turnoverComplete),
              },
              {
                label: 'Another reason to register for GST',
                value: answer(draft.compulsoryRegistration),
              },
              {
                label: 'GST registration liability date',
                value: date(draft.thresholdLiabilityDate),
              },
            ]
          : []),
      ],
    },
  ]
  return (
    <div className="review-list">
      {groups.map(({ title, editLabel, step, answers }) => (
        <Card as="article" key={title}>
          <div className="review-card-header">
            <h2>{title}</h2>
            <Button
              className="shrink-0 leading-[1.1]! font-extrabold!"
              variant="link"
              type="button"
              aria-label={editLabel}
              onClick={() => onEdit(step)}
            >
              Edit
            </Button>
          </div>
          <dl className="review-answers">
            {answers.map(({ label, value }) => (
              <div className="review-answer" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      ))}
    </div>
  )
}

export function ReviewStep({
  className,
  draft,
  errors,
  onEdit,
}: {
  readonly className: string
  readonly draft: Draft
  readonly errors: Record<string, string>
  readonly onEdit: (step: number) => void
}) {
  return (
    <div className={className}>
      <CheckHeading
        title="Check your answers before calculating"
        description="We'll use these answers to calculate your estimate and plan. Edit any section that isn't right."
      />
      <GroupSummary draft={draft} onEdit={onEdit} />
      <ErrorSummary errors={errors} />
    </div>
  )
}
