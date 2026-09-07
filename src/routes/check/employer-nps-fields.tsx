import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { TriState } from '@/evaluation'
import { ChoiceField, MoneyField } from '@/routes/check/fields'
import type { Draft } from '@/routes/check/model'
import { EmployerNpsHelp } from '@/routes/check/other-income-help'
import type { QuestionnaireDispatch } from '@/routes/check/session'

export function EmployerNpsFields({
  draft,
  errors,
  dispatch,
}: {
  readonly draft: Draft
  readonly errors: Record<string, string>
  readonly dispatch: QuestionnaireDispatch
}) {
  const addButton = useRef<HTMLButtonElement>(null)
  const setEmployers = (value: Draft['employerNpsEmployers']) =>
    dispatch({ type: 'field-changed', field: 'employerNpsEmployers', value })
  return (
    <>
      <ChoiceField
        id="hasEmployerNps"
        label="Do your employers contribute to your NPS?"
        help={
          <>
            Include employer-funded contributions to your NPS Tier I account for
            this tax year. Do not include your own contributions deducted from
            pay. <EmployerNpsHelp />
          </>
        }
        value={draft.hasEmployerNps}
        error={errors.hasEmployerNps}
        onChange={(value) => {
          dispatch({
            type: 'field-changed',
            field: 'hasEmployerNps',
            value: value as TriState,
          })
          if (value === 'yes' && draft.employerNpsEmployers.length === 0)
            setEmployers([{ contribution: '', eligibleSalary: '' }])
        }}
      />
      {draft.hasEmployerNps === 'yes' && (
        <div className="field-stack">
          <ChoiceField
            id="employerNpsConfirmed"
            label="Do your NPS and retirement-fund details meet these conditions?"
            help={
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Your records confirm each employer's NPS contribution and the
                  basic pay and eligible dearness allowance for that employment.
                </li>
                <li>
                  Your annual salary above includes these employer contributions
                  once, before any NPS deduction.
                </li>
                <li>
                  Total employer contributions to recognised PF, NPS and
                  approved superannuation funds across all your employers are no
                  more than ₹7,50,000 this year.
                </li>
                <li>
                  You have no taxable fund growth from current or earlier excess
                  contributions, unresolved fund adjustments, or UPS, Tier II or
                  NPS Vatsalya treatment.
                </li>
                <li>
                  If more than one employer contributes, each contribution is
                  within 14% of that employer's basic pay and eligible DA. Other
                  multi-employer cases need a separate review.
                </li>
              </ul>
            }
            value={draft.employerNpsConfirmed}
            error={errors.employerNpsConfirmed}
            onChange={(value) =>
              dispatch({
                type: 'field-changed',
                field: 'employerNpsConfirmed',
                value: value as TriState,
              })
            }
          />
          <div className="grid gap-4">
            {draft.employerNpsEmployers.map((employer, index) => (
              <Card
                role="group"
                aria-labelledby={`employer-nps-${index}-title`}
                className="min-w-0 p-4 sm:p-6"
                key={index}
              >
                <div className="mb-5 flex min-h-11 items-center justify-between gap-4 border-b border-border pb-4">
                  <p
                    id={`employer-nps-${index}-title`}
                    className="m-0 font-bold text-foreground"
                  >
                    Employer {index + 1}
                  </p>
                  {draft.employerNpsEmployers.length > 1 && (
                    <Button
                      type="button"
                      variant="link"
                      className="text-muted-foreground"
                      onClick={() => {
                        addButton.current?.focus()
                        setEmployers(
                          draft.employerNpsEmployers.filter(
                            (_, i) => i !== index,
                          ),
                        )
                      }}
                    >
                      Remove
                      <span className="sr-only"> employer {index + 1}</span>
                    </Button>
                  )}
                </div>
                <div className="employer-nps-fields">
                  <MoneyField
                    id={`employerNpsEmployers.${index}.contribution`}
                    tooltipLabel={`Employer ${index + 1} NPS contribution`}
                    label={
                      <>
                        <span className="sr-only">Employer {index + 1} </span>
                        NPS contribution
                      </>
                    }
                    help="Enter the employer-funded amount paid into your NPS for this tax year, not your account balance or your own contribution."
                    value={employer.contribution}
                    error={errors[`employerNpsEmployers.${index}.contribution`]}
                    onChange={(value) =>
                      setEmployers(
                        draft.employerNpsEmployers.map((row, i) =>
                          i === index ? { ...row, contribution: value } : row,
                        ),
                      )
                    }
                  />
                  <MoneyField
                    id={`employerNpsEmployers.${index}.eligibleSalary`}
                    tooltipLabel={`Employer ${index + 1} basic pay and eligible DA`}
                    label={
                      <>
                        <span className="sr-only">Employer {index + 1} </span>
                        Basic pay and eligible DA
                      </>
                    }
                    help="Enter this year's basic pay plus dearness allowance that qualifies under your employment terms. Exclude other allowances, bonuses, benefits and employer NPS."
                    value={employer.eligibleSalary}
                    error={
                      errors[`employerNpsEmployers.${index}.eligibleSalary`]
                    }
                    onChange={(value) =>
                      setEmployers(
                        draft.employerNpsEmployers.map((row, i) =>
                          i === index ? { ...row, eligibleSalary: value } : row,
                        ),
                      )
                    }
                  />
                </div>
              </Card>
            ))}
            {errors.employerNpsEmployers && (
              <p role="alert">{errors.employerNpsEmployers}</p>
            )}
            <Button
              ref={addButton}
              type="button"
              variant="outline"
              className="justify-self-start"
              onClick={() =>
                setEmployers([
                  ...draft.employerNpsEmployers,
                  { contribution: '', eligibleSalary: '' },
                ])
              }
            >
              Add another employer
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
