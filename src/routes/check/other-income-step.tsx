import type { TriState } from '@/evaluation'
import { CheckHeading, ChoiceField, MoneyField } from '@/routes/check/fields'
import type { Draft, DraftAmountKey, PatchDraft } from '@/routes/check/model'
import { creditTriggerMayApply } from '@/routes/check/model'
import { UnsupportedFactsField } from '@/routes/check/review'

export function OtherIncomeStep({
  className,
  draft,
  errors,
  patchDraft,
  setAmount,
}: {
  readonly className: string
  readonly draft: Draft
  readonly errors: Record<string, string>
  readonly patchDraft: PatchDraft
  readonly setAmount: (key: DraftAmountKey, value: string) => void
}) {
  return (
    <div className={className}>
      <CheckHeading
        title="Other income and tax paid"
        description="Enter your Indian amounts for 2026-27. Use 0 if you have none."
      />
      <MoneyField
        id="taxableBankInterest"
        label="Taxable bank or deposit interest"
        help="Enter interest before any TDS."
        value={draft.amounts.taxableBankInterest}
        error={errors.taxableBankInterest}
        onChange={(value) => setAmount('taxableBankInterest', value)}
      />
      <MoneyField
        id="tds"
        label="Indian TDS credit"
        help="Enter actual Indian TDS for the income included in this estimate."
        value={draft.amounts.tds}
        error={errors.tds}
        onChange={(value) => setAmount('tds', value)}
      />
      <MoneyField
        id="tcs"
        label="Indian TCS credit"
        help="Enter the TCS credit available for 2026-27."
        value={draft.amounts.tcs}
        error={errors.tcs}
        onChange={(value) => setAmount('tcs', value)}
      />
      <MoneyField
        id="advanceTaxPaid"
        label="Advance tax already paid"
        help="Enter only advance tax paid for 2026-27. Do not include self-assessment tax."
        value={draft.amounts.advanceTaxPaid}
        error={errors.advanceTaxPaid}
        onChange={(value) => setAmount('advanceTaxPaid', value)}
      />
      {creditTriggerMayApply(draft) && (
        <ChoiceField
          id="ageSixtyOrOlder"
          label="Were you 60 or older at any time during 2026-27?"
          help="If you were 60 or older, this income-tax return trigger starts at ₹50,000 of combined TDS and TCS instead of ₹25,000."
          value={draft.ageSixtyOrOlder}
          error={errors.ageSixtyOrOlder}
          onChange={(value) =>
            patchDraft({ ageSixtyOrOlder: value as TriState })
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
          patchDraft({ otherAnnualReturnTrigger: value as TriState })
        }
      />
      <UnsupportedFactsField
        draft={draft}
        setDraft={patchDraft}
        error={errors.unsupportedCertainty}
      />
    </div>
  )
}
