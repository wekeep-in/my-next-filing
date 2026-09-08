import type { TriState } from '@/evaluation'
import { HelpModal } from '@/components/help-modal'
import { ExternalLink } from '@/components/external-link'
import { ChoiceField, MoneyField } from '@/routes/check/fields'
import { rentalIncomeFields } from '@/routes/check/model'
import type { Draft, DraftAmountKey } from '@/routes/check/model'
import type { QuestionnaireDispatch } from '@/routes/check/session'

export function RentalIncomeHelp() {
  return (
    <HelpModal
      topic="rental income"
      title="Which rental income can I include?"
      description="This version covers one wholly owned Indian residential property let for use as a residence, with its tax treatment resolved in your records."
    >
      <p>
        Annual value is the amount established for income tax before deducting
        municipal taxes. It considers expected rent and rent received or
        receivable. Do not simply total bank credits, subtract TDS, or enter
        income after deductions. Resolve vacancy and unrealised rent before
        entering an amount.
      </p>
      <p>
        Enter only local-authority property taxes you actually paid during this
        Tax Year. Exclude unpaid bills, taxes paid by the tenant, society
        maintenance, insurance and repairs. The standard deduction accounts for
        expenses; do not subtract them again.
      </p>
      <p>
        Enter eligible current-year interest on borrowing used to acquire,
        construct, repair, renew or reconstruct the completed let property. Your
        records must establish the deduction, with interest payable in India and
        not deducted elsewhere. Exclude loan principal, the full EMI,
        pre-construction instalments and unrelated borrowing.
      </p>
      <p>
        Co-ownership, deemed ownership, clubbing, other properties with taxable
        income or losses, foreign property, self-occupied or deemed-let-out
        property, arrears or recovered rent, commercial letting, subletting and
        accommodation businesses need separate review. This version does not
        apply brought-forward property losses or calculate a negative property
        result.
      </p>
      <p>
        Rental income stays separate from freelance receipts. Include actual
        Indian rental TDS once in the combined TDS field. For GST, exempt rent
        still counts in aggregate turnover. Use the rental supply value from
        your GST records, not taxable property income or the income-tax annual
        value.
      </p>
      <p>
        The GST confirmation covers only a dwelling and rental supply in the
        same state or Union territory as your practice. Throughout the letting,
        every tenant must be unregistered for GST, or a registered sole
        proprietor renting personally for their own residence and on their own
        behalf, rather than for their business. A company lease or a rental on
        behalf of the proprietorship does not meet these conditions. Choose Not
        sure if the tenant's capacity or account is unclear; your income-tax
        estimate remains available.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf">
        Official house-property rules
      </ExternalLink>
      <ExternalLink href="https://cbic-gst.gov.in/pdf/central-tax-rate/15_2022-ctr-eng.pdf">
        GST exemption for a proprietor's own residence
      </ExternalLink>
    </HelpModal>
  )
}

export function RentalIncomeFields({
  draft,
  errors,
  dispatch,
  setAmount,
}: {
  readonly draft: Draft
  readonly errors: Record<string, string>
  readonly dispatch: QuestionnaireDispatch
  readonly setAmount: (key: DraftAmountKey, value: string) => void
}) {
  return (
    <section className="question-section" aria-labelledby="rental-income-title">
      <h2 id="rental-income-title">Rental income</h2>
      <div className="field-stack">
        <ChoiceField
          id="hasRentalIncome"
          label="Do you have rental income this Tax Year?"
          help={
            <>
              Keep rent separate from freelance receipts. <RentalIncomeHelp />
            </>
          }
          value={draft.hasRentalIncome}
          error={errors.hasRentalIncome}
          onChange={(value) =>
            dispatch({
              type: 'field-changed',
              field: 'hasRentalIncome',
              value: value as TriState,
            })
          }
        />
        {draft.hasRentalIncome === 'yes' && (
          <>
            <ChoiceField
              id="rentalIncomeConfirmed"
              label="Does your rental income meet all these conditions?"
              help={
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>
                    You wholly own one Indian residential property let only for
                    residential use. Its income is taxable as house-property
                    income, separate from your freelance practice.
                  </li>
                  <li>
                    Your records resolve annual value, ownership, vacancy and
                    unrealised rent. There is no co-ownership, clubbing, deemed
                    ownership, arrears, recovered rent or other property income
                    or loss to include.
                  </li>
                  <li>
                    Any loan interest is eligible current-year interest on this
                    completed let property, payable in India and not deducted
                    elsewhere. There are no pre-construction instalments or
                    brought-forward property losses.
                  </li>
                </ul>
              }
              value={draft.rentalIncomeConfirmed}
              error={errors.rentalIncomeConfirmed}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'rentalIncomeConfirmed',
                  value: value as TriState,
                })
              }
            />
            {rentalIncomeFields.map(({ key, label }) => (
              <MoneyField
                key={key}
                id={key}
                label={label}
                help={
                  key === 'rentalAnnualValue'
                    ? 'Use the established income-tax annual value before municipal taxes, standard deduction, loan interest or TDS. Bank rent credits alone may be insufficient.'
                    : key === 'rentalMunicipalTaxes'
                      ? 'Enter qualifying local-authority property taxes actually paid by you this Tax Year. Exclude maintenance charges and unpaid or tenant-paid taxes. Use 0 if none.'
                      : 'Enter eligible current-year interest from your loan records. Exclude principal, the full EMI and pre-construction interest. Use 0 if none.'
                }
                value={draft.amounts[key]}
                error={errors[key]}
                onChange={(value) => setAmount(key, value)}
              />
            ))}
            <ChoiceField
              id="rentalGstConfirmed"
              label="Does the rental meet these GST conditions?"
              help={
                <>
                  <ul className="mt-3 list-disc space-y-2 pl-5">
                    <li>
                      The dwelling and rental supply are in the same state or
                      Union territory as your freelance practice and any GST
                      registration entered here.
                    </li>
                    <li>
                      The dwelling is used only as a residence. Throughout the
                      letting, every tenant is either unregistered for GST or a
                      registered sole proprietor renting in their personal
                      capacity for their own residence, on their own behalf
                      rather than for their proprietorship.
                    </li>
                  </ul>
                  <p className="mt-3">
                    Other or uncertain arrangements need separate GST review.
                    Your income-tax estimate remains available. Include rental
                    supply value in the GST turnover you declare, even when rent
                    is exempt.
                  </p>
                </>
              }
              value={draft.rentalGstConfirmed}
              error={errors.rentalGstConfirmed}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'rentalGstConfirmed',
                  value: value as TriState,
                })
              }
            />
          </>
        )}
      </div>
    </section>
  )
}
