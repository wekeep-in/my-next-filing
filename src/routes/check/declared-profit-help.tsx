import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'

// Reviewed 2026-09-06 against sections 28, 33–35 and 58,
// Income-tax Act, 2025, as amended 2026-03-30. Examples are not automatic deductions.
export function DeclaredProfitHelp() {
  return (
    <HelpModal
      topic="declared profit and freelancer expenses"
      title="What profit should I enter?"
      description="Declared profit is the amount you report as profit for tax purposes. Under the presumptive method, use at least the minimum percentage shown beside the field, or your higher confirmed profit."
    >
      <p>
        For example, 50% of ₹10 lakh in gross receipts is ₹5 lakh of profit, not
        ₹5 lakh of tax. Your tax is calculated on profit together with your
        other income. Do not subtract expenses again from presumptive profit.
      </p>
      <p>
        To review actual profit, start with gross work income minus business
        costs: software, internet, workspace, platform fees, work travel and
        accounting. Count only documented business use. Exclude personal costs,
        your withdrawals and income tax; tax deducted by a client, called TDS,
        reduces tax owed rather than profit.
      </p>
      <p>
        Equipment may need depreciation, spreading its allowed cost across
        years, instead of deducting the whole purchase at once. Confirm
        adjustments with your adviser. A claim below the minimum shown beside
        this field is outside this app.
      </p>
      <div className="space-y-2">
        <p>
          <ExternalLink href="https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf#page=67">
            Official expense rules, PDF
          </ExternalLink>
        </p>
        <p>
          <ExternalLink href="https://www.incometaxindia.gov.in/w/section-33-180">
            Depreciation rules
          </ExternalLink>
        </p>
        <p>
          <ExternalLink href="https://www.incometaxindia.gov.in/w/section-58-138">
            Presumptive-income rules
          </ExternalLink>
        </p>
      </div>
    </HelpModal>
  )
}
