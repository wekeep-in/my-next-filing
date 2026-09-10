import {
  QuestionSection,
  QuestionSections,
} from '@/routes/check/question-section'
import { Button } from '@/components/ui/button'
import { taxYearDateRange, taxYearShort } from '@/lib/tax-period'
import type { QuestionnaireDispatch } from '@/routes/check/session'
import type { TriState } from '@/evaluation'
import { CheckHeading, ChoiceField, MoneyField } from '@/routes/check/fields'
import type { Draft, DraftAmountKey } from '@/routes/check/model'
import { additionalIncomeFields, equityGainFields } from '@/routes/check/model'
import { BroughtForwardLossFields } from '@/routes/check/brought-forward-loss-fields'
import { ForeignAssetsFields } from '@/routes/check/foreign-assets-fields'
import { RentalIncomeFields } from '@/routes/check/rental-income-fields'
import { EmployerNpsFields } from '@/routes/check/employer-nps-fields'
import { ReceiptsStep } from '@/routes/check/receipts-step'
import {
  AdditionalIncomeHelp,
  EquityGainsHelp,
  InterestHelp,
  SalaryCoverageHelp,
  SalaryHelp,
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
        title="Income and profit"
        description={`Use full-year amounts for ${taxYearDateRange}, not just this month or the year so far. Enter whole rupees from your records. Use 0 only when an amount is zero, not when it is unknown.`}
      />
      <QuestionSections initialOpen="receipts-title">
        <QuestionSection
          id="receipts-title"
          title="Freelance receipts and profit"
        >
          <ReceiptsStep
            className="field-stack"
            draft={draft}
            errors={errors}
            setAmount={setAmount}
            heading={false}
          />
        </QuestionSection>
        <QuestionSection id="salary-title" title="Salary">
          <div className="field-stack">
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
                          Your records confirm the full year's salary, benefits
                          that count as income and amounts exempt from tax under
                          the new regime.
                        </li>
                        <li>
                          You have no pension, retirement or termination payout,
                          or leave-encashment settlement.
                        </li>
                        <li>
                          You have no late pay for earlier periods, pay before
                          it is due, employee shares or options, or foreign
                          salary.
                        </li>
                        <li>
                          You have no unresolved tax adjustments for retirement
                          funds.
                        </li>
                        <li>
                          You claim no tax relief or deduction beyond the
                          standard deduction and supported employer NPS
                          deduction. Agniveer deductions are not covered.
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
                      Combine all employers. Enter salary before tax deducted by
                      employers, called TDS, and before the standard deduction.
                      The standard deduction reduces taxable salary. Do not use
                      your total employment package, called CTC, or take-home
                      pay. Include employer NPS contributions before any NPS
                      deduction. We apply the standard deduction once, up to
                      ₹75,000. <SalaryHelp />
                    </>
                  }
                  value={draft.amounts.grossSalary}
                  error={errors.grossSalary}
                  onChange={(value) => setAmount('grossSalary', value)}
                />
                <EmployerNpsFields
                  draft={draft}
                  errors={errors}
                  dispatch={dispatch}
                />
              </div>
            )}
          </div>
        </QuestionSection>
        <QuestionSection
          id="other-interest-title"
          title="Interest and dividends"
        >
          <div className="field-stack">
            <MoneyField
              id="taxableBankInterest"
              zeroLabel="No taxable bank or deposit interest"
              label="Taxable bank or deposit interest"
              help={
                <>
                  Include taxable interest from Indian savings accounts, fixed
                  deposits and recurring deposits. Enter it before tax deducted
                  by the bank, called TDS. Exclude the money you deposited.{' '}
                  <InterestHelp />
                </>
              }
              value={draft.amounts.taxableBankInterest}
              error={errors.taxableBankInterest}
              onChange={(value) => setAmount('taxableBankInterest', value)}
            />
            <ChoiceField
              id="hasAdditionalIncome"
              label="Do you have dividends or any of this other interest?"
              help={
                <>
                  Dividends are payouts from companies you invest in. Include
                  Indian-company dividends, Indian mutual-fund payouts, taxable
                  post-office interest and interest on an income-tax refund.
                  Keep bank interest in the field above.{' '}
                  <AdditionalIncomeHelp />
                </>
              }
              value={draft.hasAdditionalIncome}
              error={errors.hasAdditionalIncome}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'hasAdditionalIncome',
                  value: value as TriState,
                })
              }
            />
            {draft.hasAdditionalIncome === 'yes' && (
              <>
                <ChoiceField
                  id="additionalIncomeConfirmed"
                  label="Do these income details match your records?"
                  help={
                    <>
                      <ul className="mb-3 list-disc space-y-2 pl-5">
                        <li>
                          These are only ordinary Indian-company dividends,
                          taxable Indian mutual-fund distributions, taxable
                          post-office interest or Indian income-tax refund
                          interest.
                        </li>
                        <li>
                          Your tax records confirm the full year's taxable
                          amounts before TDS, including reinvested
                          distributions. Exempt amounts and ownership shares are
                          already resolved.
                        </li>
                        <li>
                          You have no special distributions, buybacks, foreign
                          income, disputed or adjusted amounts, or expense,
                          deduction or relief claims for these amounts.
                        </li>
                      </ul>
                      <AdditionalIncomeHelp />
                    </>
                  }
                  value={draft.additionalIncomeConfirmed}
                  error={errors.additionalIncomeConfirmed}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'additionalIncomeConfirmed',
                      value: value as TriState,
                    })
                  }
                />
                {additionalIncomeFields.map(({ key, label }) => (
                  <MoneyField
                    key={key}
                    id={key}
                    label={label}
                    zeroLabel={`No ${label.toLowerCase()}`}
                    help={
                      key === 'dividends'
                        ? 'Enter ordinary dividends taxable this year before TDS or expenses. Use 0 if none.'
                        : key === 'mutualFundDistributions'
                          ? 'Enter taxable mutual-fund payouts, often labelled IDCW, before tax deducted. Include payouts reinvested in the fund. Exclude money from selling or switching units. Use 0 if none.'
                          : key === 'postOfficeInterest'
                            ? 'Enter only the interest that is taxable, before any tax deducted. Exclude the money you deposited and tax-exempt interest. Use 0 if none.'
                            : 'Enter only interest paid on your income-tax refund. Exclude the tax that was returned to you. Use 0 if none.'
                    }
                    value={draft.amounts[key]}
                    error={errors[key]}
                    onChange={(value) => setAmount(key, value)}
                  />
                ))}
              </>
            )}
          </div>
        </QuestionSection>
        <RentalIncomeFields
          draft={draft}
          errors={errors}
          dispatch={dispatch}
          setAmount={setAmount}
        />
        <QuestionSection
          id="equity-gains-title"
          title="Domestic equity gains and losses"
        >
          <div className="field-stack">
            <ChoiceField
              id="hasEquityGains"
              label="Did you sell Indian shares or equity mutual funds at a profit or loss?"
              help={
                <>
                  A capital gain is profit from selling an investment; a capital
                  loss means selling for less than its allowed cost. Include
                  sales and fund redemptions, not changes in the value of
                  investments you still hold. Keep dividends above.{' '}
                  <EquityGainsHelp />
                </>
              }
              value={draft.hasEquityGains}
              error={errors.hasEquityGains}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'hasEquityGains',
                  value: value as TriState,
                })
              }
            />
            {draft.hasEquityGains === 'yes' && (
              <>
                <ChoiceField
                  id="equityGainsConfirmed"
                  label="Do your equity gains and losses meet these conditions?"
                  help={
                    <>
                      <ul className="mb-3 list-disc space-y-2 pl-5">
                        <li>
                          Only Indian listed shares and qualifying Indian
                          equity-oriented mutual funds held as investments, with
                          the required securities transaction tax, or STT,
                          conditions met. STT is a tax on investment
                          transactions shown in broker or fund records.
                        </li>
                        <li>
                          Your tax records confirm the full year’s gains and
                          allowable current-year losses across all brokers and
                          funds, with costs, ownership, holding periods and any
                          loss disallowance resolved.
                        </li>
                        <li>
                          No foreign investments, business trading, employee
                          shares, buybacks, exemption claims or other excluded
                          transactions.
                        </li>
                      </ul>
                      <p>
                        Enter gains and losses separately before loss
                        adjustment, the long-term threshold or basic exemption.
                        Enter eligible earlier-year losses in the separate
                        section below. The plan applies losses before allocating
                        any unused basic exemption.
                      </p>
                      <EquityGainsHelp />
                    </>
                  }
                  value={draft.equityGainsConfirmed}
                  error={errors.equityGainsConfirmed}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'equityGainsConfirmed',
                      value: value as TriState,
                    })
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-fit whitespace-normal"
                  onClick={() =>
                    dispatch({
                      type: 'amounts-zeroed',
                      fields: ['shortTermLosses', 'longTermLosses'],
                    })
                  }
                >
                  I have no current-year equity losses
                </Button>
                {equityGainFields.map(({ key, label }) => (
                  <MoneyField
                    key={key}
                    id={key}
                    label={label}
                    zeroLabel={`No ${label.toLowerCase()}`}
                    help={
                      key === 'shortTermGains'
                        ? 'Total gains from profitable short-term sales before subtracting losses. Do not enter sale proceeds. Use 0 if none.'
                        : key === 'longTermGains'
                          ? 'Total gains from profitable long-term sales before losses and the ₹1,25,000 threshold. Use 0 if none.'
                          : 'Enter losses allowed by tax rules as a positive amount. Do not subtract them from gains yourself. Include only this tax year, not earlier losses. Use 0 if none.'
                    }
                    value={draft.amounts[key]}
                    error={errors[key]}
                    onChange={(value) => setAmount(key, value)}
                  />
                ))}
              </>
            )}
          </div>
        </QuestionSection>
        <BroughtForwardLossFields
          draft={draft}
          errors={errors}
          dispatch={dispatch}
        />
        <ForeignAssetsFields
          draft={draft}
          errors={errors}
          dispatch={dispatch}
        />
      </QuestionSections>
    </div>
  )
}
