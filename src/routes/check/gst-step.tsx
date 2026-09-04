import type { TriState } from '@/evaluation'
import { DatePicker } from '@/components/date-picker'
import {
  CheckHeading,
  ChoiceField,
  FieldError,
  MoneyField,
  SelectField,
} from '@/routes/check/fields'
import type {
  Draft,
  DraftAmountKey,
  DraftGstKind,
  DraftGstStatus,
  PatchDraft,
} from '@/routes/check/model'
import { statesAndUnionTerritories } from '@/routes/check/model'

export function GstStep({
  className,
  draft,
  errors,
  latestThresholdDate,
  patchDraft,
  setAmount,
}: {
  readonly className: string
  readonly draft: Draft
  readonly errors: Record<string, string>
  readonly latestThresholdDate: string
  readonly patchDraft: PatchDraft
  readonly setAmount: (key: DraftAmountKey, value: string) => void
}) {
  return (
    <div className={className}>
      <CheckHeading
        title="Your GST registration"
        description="Tell us whether you've ever had a GSTIN. If not, we'll check whether your turnover may require registration."
      />
      <ChoiceField
        id="gstKind"
        label="Have you ever had a GSTIN for this practice?"
        options={['unregistered', 'registered', 'not-sure']}
        value={draft.gstKind}
        error={errors.gstKind}
        onChange={(value) =>
          patchDraft({
            gstKind: value as DraftGstKind,
            gstStatus: '',
            gstState: '',
          })
        }
      />
      {draft.gstKind === 'registered' && (
        <>
          <ChoiceField
            id="gstStatus"
            label="Which describes your GST registration?"
            help="Choose Something else if you have more than one GSTIN, use the composition scheme, or have a suspended or cancelled GSTIN."
            options={['one-normal', 'other', 'not-sure']}
            value={draft.gstStatus}
            error={errors.gstStatus}
            onChange={(value) =>
              patchDraft({ gstStatus: value as DraftGstStatus })
            }
          />
          {draft.gstStatus === 'one-normal' && (
            <SelectField
              id="gstState"
              label="Where is your active GSTIN registered?"
              value={draft.gstState}
              error={errors.gstState}
              onChange={(value) => patchDraft({ gstState: value })}
              options={statesAndUnionTerritories.map((state) => ({
                value: state,
                label: state,
              }))}
            />
          )}
          <p className="section-note">
            This version doesn't calculate GST returns or show GST return dates.
            You can still get your income-tax estimate.
          </p>
        </>
      )}
      {draft.gstKind === 'unregistered' && (
        <>
          <SelectField
            id="gstState"
            label="Which state or Union territory do you make taxable supplies from?"
            value={draft.gstState}
            error={errors.gstState}
            onChange={(value) => patchDraft({ gstState: value })}
            options={statesAndUnionTerritories.map((state) => ({
              value: state,
              label: state,
            }))}
          />
          <MoneyField
            id="aggregateTurnover"
            label="GST aggregate turnover for this PAN"
            help="Enter your all-India total for 2026-27. Include taxable, exempt, export, and inter-State supplies. Exclude GST, cess, and inward supplies taxed under reverse charge. This may differ from the receipts entered earlier."
            value={draft.amounts.aggregateTurnover}
            error={errors.aggregateTurnover}
            onChange={(value) => setAmount('aggregateTurnover', value)}
          />
          <ChoiceField
            id="turnoverComplete"
            label="Is this your complete GST aggregate turnover?"
            labels={{
              yes: "Yes, it's complete",
              no: "No, it's incomplete",
            }}
            value={draft.turnoverComplete}
            error={errors.turnoverComplete}
            onChange={(value) =>
              patchDraft({ turnoverComplete: value as TriState })
            }
          />
          <ChoiceField
            id="compulsoryRegistration"
            label="Could you need to register for GST for a reason other than turnover?"
            help="Choose Not sure if you haven't confirmed this."
            value={draft.compulsoryRegistration}
            error={errors.compulsoryRegistration}
            onChange={(value) =>
              patchDraft({ compulsoryRegistration: value as TriState })
            }
          />
          <div className="field">
            <label htmlFor="thresholdLiabilityDate">
              If your turnover is above the threshold, when did you become
              liable to register?
            </label>
            <p className="field-help" id="threshold-date-help">
              Choose a past or present date in 2026-27. Leave this blank if your
              turnover is at or below the threshold or you don't know the date.
            </p>
            <DatePicker
              id="thresholdLiabilityDate"
              value={draft.thresholdLiabilityDate}
              min="2026-04-01"
              max={latestThresholdDate}
              clearable
              describedBy={`threshold-date-help${errors.thresholdLiabilityDate ? ' thresholdLiabilityDate-error' : ''}`}
              invalid={Boolean(errors.thresholdLiabilityDate)}
              onChange={(value) =>
                patchDraft({ thresholdLiabilityDate: value })
              }
            />
            <FieldError
              id="thresholdLiabilityDate-error"
              error={errors.thresholdLiabilityDate}
            />
          </div>
        </>
      )}
    </div>
  )
}
