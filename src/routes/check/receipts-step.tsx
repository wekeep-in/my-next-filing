import { taxYearShort } from '@/lib/tax-period'
import { isBusinessPath, remainingBusinessReceipts } from '@/routes/check/model'
import { CheckHeading, MoneyField } from '@/routes/check/fields'
import type { Draft, DraftAmountKey } from '@/routes/check/model'
import { DeclaredProfitHelp } from '@/routes/check/declared-profit-help'

export function ReceiptsStep({
  className,
  draft,
  errors,
  setAmount,
  heading = true,
}: {
  readonly className: string
  readonly draft: Draft
  readonly errors: Record<string, string>
  readonly setAmount: (key: DraftAmountKey, value: string) => void
  readonly heading?: boolean
}) {
  return (
    <div className={className}>
      {heading && (
        <CheckHeading
          title="Your receipts and profit"
          description="Receipts are your freelance work income before expenses, platform fees and tax deducted by clients. Enter full-year totals in whole rupees from your records."
        />
      )}
      {isBusinessPath(draft) ? (
        <>
          <MoneyField
            id="grossReceipts"
            label="Gross business receipts"
            help="Enter your full-year work income before expenses, platform fees and tax deducted by clients. This is your gross receipts, not just the amount that reached your bank."
            value={draft.amounts.grossReceipts}
            error={errors.grossReceipts}
            onChange={(value) => setAmount('grossReceipts', value)}
          />
          <MoneyField
            id="qualifyingReceipts"
            label="Qualifying bank or online receipts"
            help={`Enter the part of gross receipts received through permitted banking or online modes during ${taxYearShort} or by the income-tax return deadline. Examples include account-payee cheques, bank transfers and UPI. Confirm the amount from your records; do not count cash deposited into a bank as a bank payment.`}
            value={draft.amounts.qualifyingReceipts}
            error={errors.qualifyingReceipts}
            onChange={(value) => setAmount('qualifyingReceipts', value)}
          />
          <MoneyField
            id="otherReceipts"
            label="All other business receipts"
            readOnly={
              draft.amounts.otherReceipts === remainingBusinessReceipts(draft)
            }
            help="Filled from gross receipts minus qualifying receipts. Check this amount against your records."
            value={draft.amounts.otherReceipts}
            error={errors.otherReceipts}
            onChange={(value) => setAmount('otherReceipts', value)}
          />
          <MoneyField
            id="cashReceipts"
            zeroLabel="No cash receipts, non-account-payee cheques or drafts"
            label="Receipts paid in cash"
            help="Include cash and cheques or bank drafts that are not marked account payee. Account-payee means only the named recipient can receive the money into their account."
            value={draft.amounts.cashReceipts}
            error={errors.cashReceipts}
            onChange={(value) => setAmount('cashReceipts', value)}
          />
          <MoneyField
            id="declaredProfit"
            label="Declared profit"
            help={
              <>
                Declared profit is the profit you will report for tax. Enter at
                least 6% of qualifying receipts plus 8% of other receipts, or
                your higher confirmed profit. <DeclaredProfitHelp />
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
            help="Enter your full-year work income before expenses, platform fees and tax deducted by clients. This is your gross receipts, not just the amount that reached your bank."
            value={draft.amounts.grossReceipts}
            error={errors.grossReceipts}
            onChange={(value) => setAmount('grossReceipts', value)}
          />
          <MoneyField
            id="cashReceipts"
            zeroLabel="No cash receipts, non-account-payee cheques or drafts"
            label="Professional receipts received in cash"
            help="Include cash and cheques or bank drafts that are not marked account payee. Account-payee means only the named recipient can receive the money into their account. Enter 0 if none."
            value={draft.amounts.cashReceipts}
            error={errors.cashReceipts}
            onChange={(value) => setAmount('cashReceipts', value)}
          />
          <MoneyField
            id="declaredProfit"
            label="Declared profit"
            help={
              <>
                Declared profit is the profit you will report for tax. Enter at
                least 50% of gross receipts, or your higher confirmed profit.{' '}
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
