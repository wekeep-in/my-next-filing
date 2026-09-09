import { QuestionSection } from '@/routes/check/question-section'
import { useRef } from 'react'
import { TAX_YEAR, currentRules } from '@/rules'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HelpModal } from '@/components/help-modal'
import {
  ChoiceField,
  FieldError,
  MoneyField,
  SelectField,
} from '@/routes/check/fields'
import type { Draft } from '@/routes/check/model'
import type { QuestionnaireDispatch } from '@/routes/check/session'
import type { TriState } from '@/evaluation'

export function BroughtForwardLossFields({
  draft,
  errors,
  dispatch,
}: {
  readonly draft: Draft
  readonly errors: Record<string, string>
  readonly dispatch: QuestionnaireDispatch
}) {
  const addButton = useRef<HTMLButtonElement>(null)
  const firstYear = Number(TAX_YEAR.slice(9, 13))
  const yearOptions = Array.from(
    {
      length:
        currentRules.groups.commonIncomeTax.values.capitalLossCarryForwardYears,
    },
    (_, index) => {
      const year = firstYear - index - 1
      return {
        value: String(year),
        label: `${year}-${String(year + 1).slice(-2)}`,
      }
    },
  )
  const setRows = (rows: Draft['broughtForwardYears']) =>
    dispatch({
      type: 'field-changed',
      field: 'broughtForwardYears',
      value: rows,
    })
  const update = (
    index: number,
    key: keyof Draft['broughtForwardYears'][number],
    value: string,
  ) =>
    setRows(
      draft.broughtForwardYears.map((row, i) =>
        i === index ? { ...row, [key]: value } : row,
      ),
    )
  return (
    <QuestionSection
      id="brought-forward-title"
      title="Capital losses from earlier years"
    >
      <div className="field-stack">
        <ChoiceField
          id="hasBroughtForwardLosses"
          label="Do you have eligible capital losses left from earlier years?"
          help={
            <>
              Enter balances from your tax records after previous use and
              adjustments. Keep this year's losses in the current-year fields.{' '}
              <HelpModal
                topic="earlier-year capital losses"
                title="Which earlier losses can I use?"
                description="Use determined loss balances from timely filed returns, not an unconfirmed estimate from this plan or a broker's net total."
              >
                <p>
                  This branch covers still-available losses from the supported
                  Indian listed shares and equity-oriented mutual funds. Your
                  records must resolve filing eligibility, determination,
                  previous use, amendments and the original loss year. Disputed,
                  condoned, foreign, trading or other unsupported losses need
                  separate review.
                </p>
                <p>
                  Use the financial year in which the loss arose, not its
                  assessment year. The original eight-year window does not
                  restart under the new Act. Current-year losses are applied
                  first, then earlier years from oldest to newest. Long-term
                  losses reduce long-term gains only; short-term losses reduce
                  short-term gains first, then remaining long-term gains.
                </p>
                <p>
                  Unused earlier balances keep their original last usable year.
                  This plan does not certify them or promise future set-off. Do
                  not enter a balance that has already been used elsewhere.
                </p>
              </HelpModal>
            </>
          }
          value={draft.hasBroughtForwardLosses}
          error={errors.hasBroughtForwardLosses}
          onChange={(value) => {
            dispatch({
              type: 'field-changed',
              field: 'hasBroughtForwardLosses',
              value: value as TriState,
            })
            if (value === 'yes' && draft.broughtForwardYears.length === 0)
              setRows([{ originYear: '', shortTerm: '', longTerm: '' }])
          }}
        />
        {draft.hasBroughtForwardLosses === 'yes' && (
          <>
            <ChoiceField
              id="broughtForwardLossesConfirmed"
              label="Are these losses confirmed eligible for this Tax Year?"
              help="Confirm that returns were filed on time, losses were determined, and the remaining balances and original years are correct after prior use and adjustments. They must be within the original eight-year window and from the supported domestic equity instruments."
              value={draft.broughtForwardLossesConfirmed}
              error={errors.broughtForwardLossesConfirmed}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'broughtForwardLossesConfirmed',
                  value: value as TriState,
                })
              }
            />
            {draft.broughtForwardYears.map((row, index) => (
              <Card
                key={index}
                className="p-4 sm:p-6"
                role="group"
                aria-label={`Earlier loss ${index + 1}`}
              >
                <div className="field-stack">
                  <SelectField
                    id={`broughtForwardYears.${index}.originYear`}
                    label={`Loss ${index + 1}: originating financial year`}
                    value={row.originYear}
                    options={
                      yearOptions.some(
                        ({ value }) => value === row.originYear,
                      ) || !row.originYear
                        ? yearOptions
                        : [
                            ...yearOptions,
                            {
                              value: row.originYear,
                              label: `${row.originYear} (review year)`,
                            },
                          ]
                    }
                    error={errors[`broughtForwardYears.${index}.originYear`]}
                    onChange={(value) => update(index, 'originYear', value)}
                  />
                  <MoneyField
                    id={`broughtForwardYears.${index}.shortTerm`}
                    label={`Loss ${index + 1}: remaining short-term balance`}
                    help="Enter the eligible balance before this year's set-off. Use 0 if none."
                    value={row.shortTerm}
                    error={errors[`broughtForwardYears.${index}.shortTerm`]}
                    onChange={(value) => update(index, 'shortTerm', value)}
                  />
                  <MoneyField
                    id={`broughtForwardYears.${index}.longTerm`}
                    label={`Loss ${index + 1}: remaining long-term balance`}
                    help="Enter the eligible balance before this year's set-off. Use 0 if none."
                    value={row.longTerm}
                    error={errors[`broughtForwardYears.${index}.longTerm`]}
                    onChange={(value) => update(index, 'longTerm', value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setRows(
                        draft.broughtForwardYears.filter((_, i) => i !== index),
                      )
                      requestAnimationFrame(() => addButton.current?.focus())
                    }}
                  >
                    Remove loss year {index + 1}
                  </Button>
                </div>
              </Card>
            ))}
            <FieldError
              id="broughtForwardYears-error"
              error={errors.broughtForwardYears}
            />
            <Button
              type="button"
              variant="outline"
              ref={addButton}
              disabled={draft.broughtForwardYears.length >= 8}
              onClick={() =>
                setRows([
                  ...draft.broughtForwardYears,
                  { originYear: '', shortTerm: '', longTerm: '' },
                ])
              }
            >
              Add loss year
            </Button>
          </>
        )}
      </div>
    </QuestionSection>
  )
}
