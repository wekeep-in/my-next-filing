import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'
import { currentRules } from '@/rules'

// Reviewed 2026-09-06 against section 202 and the linked ITD manuals.
export function TaxRegimeHelp() {
  return (
    <HelpModal
      topic="tax regimes"
      title="Which regime am I using?"
      description="The new and old regimes are two sets of income-tax rates and deductions. Deductions reduce taxable income. The new regime is the default and allows fewer deductions; the old regime uses different rates and allows more."
    >
      <p>
        Check your latest return and any regime-choice forms on the Income Tax
        portal. Choosing an option here does not change your regime with the
        government. Freelancers face switching restrictions, so confirm what
        applies for {currentRules.taxPeriod} with your adviser. Choose Not sure
        until confirmed.
      </p>
      <div className="space-y-2">
        <p>
          <ExternalLink href="https://www.incometax.gov.in/iec/foportal/help/how-to-know-the-itr-status">
            Find your filed return
          </ExternalLink>
        </p>
        <p>
          <ExternalLink href="https://www.incometax.gov.in/iec/foportal/help/how-to-view-filed-forms">
            Find your filed forms
          </ExternalLink>
        </p>
        <p>
          <ExternalLink href="https://www.incometaxindia.gov.in/w/section-202-78">
            Official regime rules
          </ExternalLink>
        </p>
      </div>
    </HelpModal>
  )
}
