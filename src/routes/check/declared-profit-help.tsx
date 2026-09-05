import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'

// Reviewed 2026-09-06 against sections 28, 33–35 and 58,
// Income-tax Act, 2025, as amended 2026-03-30. Examples are not automatic deductions.
export function DeclaredProfitHelp() {
  return (
    <HelpModal
      topic="declared profit and freelancer expenses"
      title="What profit should I enter?"
      description="Enter your confirmed declared profit. Presumptive profit already accounts for expenses; do not subtract them again."
    >
      <p>
        To review actual profit, start with gross work income minus business
        costs: software, internet, workspace, platform fees, work travel and
        accounting. Count only documented business use. Exclude personal costs,
        your withdrawals and income tax; TDS is a credit, not an expense.
      </p>
      <p>
        Equipment may need depreciation instead of a full deduction. Confirm
        adjustments with your adviser. A claim below the minimum shown beside
        this field is outside this version.
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
