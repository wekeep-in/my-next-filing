import { taxYearShort } from '@/lib/tax-period'
import { isBusinessPath } from '@/routes/check/model'
import { CheckHeading, MoneyField } from '@/routes/check/fields'
import type { Draft, DraftAmountKey } from '@/routes/check/model'
import { DeclaredProfitHelp } from '@/routes/check/declared-profit-help'

export function ReceiptsStep({
  className,
  draft,
  errors,
  setAmount,
}: {
  readonly className: string
  readonly draft: Draft
  readonly errors: Record<string, string>
  readonly setAmount: (key: DraftAmountKey, value: string) => void
}) {
  return (
    <div className={className}>
      <CheckHeading
        title="Your receipts and profit"
        description="Enter whole-rupee amounts from your records. Receipt amounts should be before expenses, platform fees, and Indian withholding."
      />
      {isBusinessPath(draft) ? (
        <>
          <MoneyField
            id="grossReceipts"
            label="Gross business receipts"
            help="Enter the full gross amount for this practice."
            value={draft.amounts.grossReceipts}
            error={errors.grossReceipts}
            onChange={(value) => setAmount('grossReceipts', value)}
          />
          <MoneyField
            id="qualifyingReceipts"
            label="Qualifying bank or online receipts"
            help={`Use the amount your records classify as qualifying bank or online receipts. Include payments received during ${taxYearShort} or by the return due date.`}
            value={draft.amounts.qualifyingReceipts}
            error={errors.qualifyingReceipts}
            onChange={(value) => setAmount('qualifyingReceipts', value)}
          />
          <MoneyField
            id="otherReceipts"
            label="All other business receipts"
            help="Together with qualifying receipts, this must equal gross business receipts."
            value={draft.amounts.otherReceipts}
            error={errors.otherReceipts}
            onChange={(value) => setAmount('otherReceipts', value)}
          />
          <MoneyField
            id="cashReceipts"
            label="Receipts paid in cash"
            help="Include cash, non-account-payee cheques, and drafts."
            value={draft.amounts.cashReceipts}
            error={errors.cashReceipts}
            onChange={(value) => setAmount('cashReceipts', value)}
          />
          <MoneyField
            id="declaredProfit"
            label="Declared profit"
            help={
              <>
                Enter at least 6% of qualifying receipts plus 8% of other
                receipts. <DeclaredProfitHelp />
              </>
            }
            value={draft.amounts.declaredProfit}
            error={errors.declaredProfit}
            onChange={(value) => setAmount('declaredProfit', value)}
          />
        </>
      ) : (
        <>
          <MoneyField
            id="grossReceipts"
            label="Gross professional receipts"
            help="Enter the total before expenses, platform fees, or Indian withholding."
            value={draft.amounts.grossReceipts}
            error={errors.grossReceipts}
            onChange={(value) => setAmount('grossReceipts', value)}
          />
          <MoneyField
            id="cashReceipts"
            label="Professional receipts received in cash"
            help="Include cash, non-account-payee cheques, and drafts. If cash is exactly 5%, the higher receipt limit applies."
            value={draft.amounts.cashReceipts}
            error={errors.cashReceipts}
            onChange={(value) => setAmount('cashReceipts', value)}
          />
          <MoneyField
            id="declaredProfit"
            label="Declared profit"
            help={
              <>
                Enter at least 50% of gross professional receipts.{' '}
                <DeclaredProfitHelp />
              </>
            }
            value={draft.amounts.declaredProfit}
            error={errors.declaredProfit}
            onChange={(value) => setAmount('declaredProfit', value)}
          />
        </>
      )}
    </div>
  )
}
