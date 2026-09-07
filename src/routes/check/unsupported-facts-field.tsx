import { useContext } from 'react'
import type { UnsupportedFact } from '@/evaluation'
import { FieldHelp } from '@/components/field-help'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FieldError, FieldWarnings } from '@/routes/check/fields'
import { unsupportedFactLabels } from '@/routes/check/model'
import type { Draft } from '@/routes/check/model'
import type { QuestionnaireDispatch } from '@/routes/check/session'

const groups: readonly { title: string; facts: readonly UnsupportedFact[] }[] =
  [
    {
      title: 'Other income',
      facts: [
        'houseProperty',
        'gifts',
        'capitalGains',
        'cryptoLotteryGaming',
        'agriculturalIncome',
        'royaltyOrLicensing',
      ],
    },
    {
      title: 'Salary and investments',
      facts: ['salary', 'unsupportedDividends', 'dividendsOrGifts'],
    },
    {
      title: 'Overseas income and assets',
      facts: ['unrelatedForeignIncome', 'foreignAssets', 'foreignTaxOrRelief'],
    },
    {
      title: 'Business and tax requirements',
      facts: [
        'anotherBusinessOrProfession',
        'employeesOrDeductorDuties',
        'goodsSales',
        'agencyCommissionBrokerage',
        'deductionsLossesOrSpecialRate',
        'disputedCredit',
        'auditRequirement',
        'surchargeCase',
        'otherUnsupportedFacts',
      ],
    },
  ]
const explanations: Partial<
  Record<UnsupportedFact, { title: string; help: string }>
> = {
  dividendsOrGifts: {
    title: 'Dividends or gifts selected in an earlier version',
    help: 'Review the dividend fields above. Select any gift income separately before clearing this older combined answer.',
  },
  houseProperty: {
    title: 'Income from house property',
    help: 'For example, rental income.',
  },
  capitalGains: {
    title: 'Capital gains needing a separate review',
    help: 'Gains outside the domestic equity conditions above, such as property or foreign-share gains. If this answer was restored, review your equity gains before clearing it.',
  },
  salary: {
    title: 'Salary needing a separate review',
    help: 'Foreign salary, pension, arrears, advance pay, employee share options, or other salary outside the supported conditions.',
  },
  unsupportedDividends: {
    title: 'Dividends or distributions needing a separate review',
    help: 'For example, foreign dividends or REIT payouts. Check the supported conditions before choosing.',
  },
  deductionsLossesOrSpecialRate: {
    title: 'Other deductions, losses, or special-rate income',
    help: 'Deductions outside the supported salary conditions, losses outside the current-year domestic equity conditions, or other unsupported special-rate income.',
  },
  employeesOrDeductorDuties: {
    title: 'Employees or TDS filing requirements',
    help: 'You have employees, or must deduct tax and file TDS returns.',
  },
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
  const scopeWarning = useContext(FieldWarnings).unsupportedCertainty
  const warningId = 'unsupportedCertainty-unsupported'
  return (
    <section
      id="unsupportedCertainty"
      tabIndex={-1}
      className="field"
      aria-labelledby="situations-title"
      aria-invalid={Boolean(error)}
      aria-describedby={`unsupportedCertainty-help${error ? ' unsupportedCertainty-error' : ''}${scopeWarning ? ` ${warningId}` : ''}`}
    >
      <h2 id="situations-title" className="scroll-mt-48">
        Do any of these situations apply to you?
      </h2>
      <p
        id="unsupportedCertainty-help"
        className="mt-4 mb-6 text-muted-foreground"
      >
        These answers help us identify anything that needs a separate review
        before estimating your tax. Review all four cards and select every
        situation that applies. If none apply, choose None of these apply below.
        Choose I'm not sure if you cannot confirm.
      </p>
      <div className="grid gap-4">
        {groups.map((group, groupIndex) => {
          return (
            <Card key={group.title} className="min-w-0 p-4 sm:p-6">
              <div className="mb-3 flex min-h-11 items-center justify-between gap-4 border-b border-border pb-4">
                <p
                  id={`situations-group-${groupIndex}`}
                  role="heading"
                  aria-level={3}
                  className="m-0 font-bold text-foreground"
                >
                  {group.title}
                </p>
              </div>
              <fieldset className="m-0 min-w-0 border-0 p-0">
                <legend className="sr-only">{group.title}</legend>
                {group.facts
                  .filter(
                    (fact) =>
                      fact !== 'dividendsOrGifts' ||
                      draft.unsupportedFacts.includes(fact),
                  )
                  .map((fact) => {
                    const copy = explanations[fact]
                    const label = copy?.title ?? unsupportedFactLabels[fact]
                    const checked = draft.unsupportedFacts.includes(fact)
                    const id = `situation-${fact}`
                    return (
                      <div
                        key={fact}
                        className={`flex min-h-10 items-center gap-3 ${checked ? 'bg-warning-surface' : ''}`}
                      >
                        <Checkbox
                          id={id}
                          name="unsupportedFacts"
                          value={fact}
                          checked={checked}
                          aria-labelledby={`${id}-label`}
                          aria-describedby={
                            [
                              copy ? `${id}-help` : '',
                              checked && scopeWarning ? warningId : '',
                            ]
                              .filter(Boolean)
                              .join(' ') || undefined
                          }
                          onCheckedChange={(selected) => {
                            dispatch({
                              type: 'unsupported-fact-toggled',
                              fact,
                              checked: selected,
                            })
                          }}
                        />
                        <div className="relative top-px min-w-0 text-[.9rem]/[1.3] font-semibold">
                          <span id={`${id}-label`}>{label}</span>
                          {copy && (
                            <>
                              {'\u00a0'}
                              <span className="inline-flex align-middle">
                                <FieldHelp id={id} label={label}>
                                  {copy.help}
                                </FieldHelp>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </fieldset>
            </Card>
          )
        })}
      </div>
      <RadioGroup
        aria-labelledby="situations-title"
        className="choice-grid mt-4"
        name="unsupportedCertainty"
        value={
          draft.unsupportedCertainty === 'selected'
            ? ''
            : draft.unsupportedCertainty
        }
        onValueChange={(choice: unknown) => {
          if (choice === 'none' || choice === 'not-sure')
            dispatch({ type: 'unsupportedCertainty-changed', value: choice })
        }}
      >
        {[
          ['none', 'None of these apply'],
          ['not-sure', "I'm not sure"],
        ].map(([value, label]) => {
          const warning =
            value === 'not-sure' && draft.unsupportedCertainty === value
          return (
            <label
              key={value}
              className={`choice-card${warning ? ' choice-card--unsupported' : ''}`}
            >
              <RadioGroupItem
                value={value}
                tone={warning ? 'warning' : 'default'}
                aria-describedby={warning ? warningId : undefined}
              />
              <span>{label}</span>
            </label>
          )
        })}
      </RadioGroup>
      <FieldError id="unsupportedCertainty-error" error={error} />
    </section>
  )
}
