import type { TriState } from '@/evaluation'
import { HelpModal } from '@/components/help-modal'
import { ExternalLink } from '@/components/external-link'
import { ChoiceField } from '@/routes/check/fields'
import type { Draft } from '@/routes/check/model'
import type { QuestionnaireDispatch } from '@/routes/check/session'
import { taxYearShort } from '@/lib/tax-period'

export function ForeignAssetsHelp() {
  return (
    <HelpModal
      topic="foreign assets and signing authority"
      title="Which overseas arrangements count?"
      description="Check your ownership and account records for this Tax Year. A foreign client, foreign currency or provider brand alone does not establish a foreign asset."
    >
      <p>
        Include assets and financial interests you held outside India as owner
        or beneficial owner, and signing authority over any overseas account,
        even when someone else owns the money. A beneficial owner has provided
        consideration for an asset held for their own or another person's
        benefit. Include accounts or assets held at any time during the Tax
        Year, even if closed or sold later or if they earned no income.
      </p>
      <p>
        For a virtual receiving account, wallet or platform balance, check who
        legally holds the account, where it is located, and whether you have a
        separate balance or claim against an overseas provider. Routing details
        alone do not establish ownership. Choose Not sure if the arrangement is
        unresolved; this version does not classify a provider by brand.
      </p>
      <p>
        Foreign bank interest, dividends, rent, gains, losses, employee-share
        benefits, foreign tax and treaty relief remain outside this version. A
        beneficiary-only or trust arrangement also needs separate review. Do not
        treat these amounts as zero or include them in the domestic income
        fields.
      </p>
      <p>
        Supported freelance fees can already be included in your annual gross
        rupee receipts. Their payment route must still meet the existing
        conditions, including authorised settlement to your own Indian bank
        account and resolved fees, withholding and currency effects. Holding
        money abroad does not establish permission to retain it there.
      </p>
      <p>
        For an established foreign asset or signing authority, a resident and
        ordinarily resident individual must file a return even when income or
        tax is nil. Use current Tax Year instructions to establish the reporting
        period, categories and amounts. This plan does not select a return form,
        fill foreign-asset schedules, value assets, or resolve past
        non-disclosure.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf">
        Official foreign-asset filing requirements
      </ExternalLink>
    </HelpModal>
  )
}

export function ForeignAssetsFields({
  draft,
  errors,
  dispatch,
}: {
  readonly draft: Draft
  readonly errors: Record<string, string>
  readonly dispatch: QuestionnaireDispatch
}) {
  return (
    <section
      className="question-section"
      aria-labelledby="foreign-assets-title"
    >
      <h2 id="foreign-assets-title">Foreign assets and accounts</h2>
      <div className="field-stack">
        <ChoiceField
          id="hasForeignAssets"
          label={`Did you hold foreign assets or have signing authority during ${taxYearShort}?`}
          help={
            <>
              Include assets, financial interests and overseas accounts held at
              any time in this Tax Year, even with no income or a zero closing
              balance. <ForeignAssetsHelp />
            </>
          }
          value={draft.hasForeignAssets}
          error={errors.hasForeignAssets}
          onChange={(value) =>
            dispatch({
              type: 'field-changed',
              field: 'hasForeignAssets',
              value: value as TriState,
            })
          }
        />
        {(draft.hasForeignAssets === 'yes' ||
          draft.hasForeignAssets === 'not-sure') && (
          <ChoiceField
            id="assetIncomeConfirmed"
            label="Can you confirm all these income conditions?"
            help={
              <>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>
                    These arrangements add no income, gains, losses, deductions
                    or benefits outside the supported amounts entered here. In
                    particular, there is no foreign interest, dividend, rent,
                    investment gain or employee-share benefit to include.
                  </li>
                  <li>
                    Any freelance fees are already included once in your
                    complete annual gross rupee receipts, with currency and
                    account effects resolved. All work and the practice remain
                    in India, and the existing payment-route conditions still
                    apply.
                  </li>
                  <li>
                    There is no foreign tax or relief claim, beneficiary-only or
                    trust arrangement, foreign operation, overseas business
                    control, cross-border related-party transaction,
                    transfer-pricing report requirement, or unresolved income or
                    tax treatment.
                  </li>
                </ul>
                <p className="mt-3">
                  Uncertain account classification can still need a disclosure
                  review. Uncertain income amounts stop the estimate. Choose Not
                  sure if you cannot confirm the conditions.
                </p>
              </>
            }
            value={draft.assetIncomeConfirmed}
            error={errors.assetIncomeConfirmed}
            onChange={(value) =>
              dispatch({
                type: 'field-changed',
                field: 'assetIncomeConfirmed',
                value: value as TriState,
              })
            }
          />
        )}
      </div>
    </section>
  )
}
