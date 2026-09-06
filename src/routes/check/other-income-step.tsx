import { taxYearShort } from '@/lib/tax-period'
import type { QuestionnaireDispatch } from '@/routes/check/session'
import type { TriState } from '@/evaluation'
import { CheckHeading, ChoiceField, MoneyField } from '@/routes/check/fields'
import type { Draft, DraftAmountKey } from '@/routes/check/model'
import { creditTriggerMayApply } from '@/routes/check/model'
import { UnsupportedFactsField } from '@/routes/check/review'
import {
  InterestHelp,
  SalaryCoverageHelp,
  SalaryHelp,
  TcsHelp,
  TdsHelp,
} from '@/routes/check/other-income-help'

export function OtherIncomeStep({
  className,
  draft,
  errors,
  dispatch,
  setAmount,
}: {
  readonly className: string
  readonly draft: Draft
  readonly errors: Record<string, string>
  readonly dispatch: QuestionnaireDispatch
  readonly setAmount: (key: DraftAmountKey, value: string) => void
}) {
  return (
    <div className={className}>
      <CheckHeading
        title="Other income and tax paid"
        description={`Enter your Indian amounts for ${taxYearShort}. Use 0 if you have none.`}
      />
      <ChoiceField
        id="hasSalary"
        label={`Do you also have salary income for ${taxYearShort}?`}
        help="Include salary from a job you held for only part of the year. Keep employment salary separate from freelance receipts."
        value={draft.hasSalary}
        error={errors.hasSalary}
        onChange={(value) =>
          dispatch({
            type: 'field-changed',
            field: 'hasSalary',
            value: value as TriState,
          })
        }
      />
      {draft.hasSalary === 'yes' && (
        <div className="field-stack">
          <ChoiceField
            id="salaryConfirmed"
            label="Does all your salary meet these conditions?"
            help={
              <>
                <ul className="mb-3 list-disc space-y-2 pl-5">
                  <li>
                    Your employers are in India and you performed all
                    job-related work in India.
                  </li>
                  <li>
                    Your records confirm the full year's salary, taxable
                    benefits and new-regime exemptions.
                  </li>
                  <li>
                    You have no pension, retirement or termination payout, or
                    leave-encashment settlement.
                  </li>
                  <li>
                    You have no arrears, advance salary, share-based pay or
                    foreign salary.
                  </li>
                  <li>
                    You have no unresolved tax adjustments for retirement funds.
                  </li>
                  <li>
                    You claim no tax relief or deduction beyond the standard
                    deduction, including employer NPS or Agniveer deductions.
                  </li>
                </ul>
                <SalaryCoverageHelp />
              </>
            }
            value={draft.salaryConfirmed}
            error={errors.salaryConfirmed}
            onChange={(value) =>
              dispatch({
                type: 'field-changed',
                field: 'salaryConfirmed',
                value: value as TriState,
              })
            }
          />
          <MoneyField
            id="grossSalary"
            label="Annual salary before standard deduction"
            help={
              <>
                Combine all employers and enter salary before TDS and the
                standard deduction, not CTC or take-home pay. We apply the
                standard deduction once, up to ₹75,000. <SalaryHelp />
              </>
            }
            value={draft.amounts.grossSalary}
            error={errors.grossSalary}
            onChange={(value) => setAmount('grossSalary', value)}
          />
        </div>
      )}
      <MoneyField
        id="taxableBankInterest"
        label="Taxable bank or deposit interest"
        help={
          <>
            Enter interest before any TDS. <InterestHelp />
          </>
        }
        value={draft.amounts.taxableBankInterest}
        error={errors.taxableBankInterest}
        onChange={(value) => setAmount('taxableBankInterest', value)}
      />
      <MoneyField
        id="tds"
        label="Indian TDS credit"
        help={
          <>
            Enter actual Indian TDS for included freelance income, salary and
            bank interest. Count each credit once. <TdsHelp />
          </>
        }
        value={draft.amounts.tds}
        error={errors.tds}
        onChange={(value) => setAmount('tds', value)}
      />
      <MoneyField
        id="tcs"
        label="Indian TCS credit"
        help={
          <>
            Enter the TCS credit available for {taxYearShort}. <TcsHelp />
          </>
        }
        value={draft.amounts.tcs}
        error={errors.tcs}
        onChange={(value) => setAmount('tcs', value)}
      />
      <MoneyField
        id="advanceTaxPaid"
        label="Advance tax already paid"
        help={`Enter only advance tax paid for ${taxYearShort}. Do not include self-assessment tax.`}
        value={draft.amounts.advanceTaxPaid}
        error={errors.advanceTaxPaid}
        onChange={(value) => setAmount('advanceTaxPaid', value)}
      />
      {creditTriggerMayApply(draft) && (
        <ChoiceField
          id="ageSixtyOrOlder"
          label={`Were you 60 or older at any time during ${taxYearShort}?`}
          help="If you were 60 or older, this income-tax return trigger starts at ₹50,000 of combined TDS and TCS instead of ₹25,000."
          value={draft.ageSixtyOrOlder}
          error={errors.ageSixtyOrOlder}
          onChange={(value) =>
            dispatch({
              type: 'field-changed',
              field: 'ageSixtyOrOlder',
              value: value as TriState,
            })
          }
        />
      )}
      <ChoiceField
        id="otherAnnualReturnTrigger"
        label="Does another condition require you to file an income-tax return?"
        help="Choose Not sure if you need to review the banking, travel, electricity, or foreign-asset conditions."
        value={draft.otherAnnualReturnTrigger}
        error={errors.otherAnnualReturnTrigger}
        onChange={(value) =>
          dispatch({
            type: 'field-changed',
            field: 'otherAnnualReturnTrigger',
            value: value as TriState,
          })
        }
      />
      <UnsupportedFactsField
        draft={draft}
        dispatch={dispatch}
        error={errors.unsupportedCertainty}
      />
    </div>
  )
}
