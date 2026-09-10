import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'

// Reviewed 2026-09-06 against sections 58 and 62; publication dates unstated.
export function TaxMethodHelp() {
  return (
    <HelpModal
      topic="tax methods"
      title="Which method fits my work?"
      description="The presumptive method uses a minimum share of your work income as taxable profit. The percentage is a profit calculation, not your income-tax rate."
    >
      <p>
        <strong>Specified professional path:</strong> for a profession listed in
        tax law, such as information technology or technical consultancy. The
        minimum profit is 50% of gross receipts, your work income before
        expenses or tax deducted by clients.
      </p>
      <p>
        <strong>Eligible business path:</strong> for qualifying businesses that
        are not specified professions. Agency, commission and brokerage are
        excluded. The minimum profit is 6% of qualifying bank or online receipts
        plus 8% of other receipts.
      </p>
      <p>
        Both paths have receipt limits and other conditions. Use a higher
        confirmed profit when it exceeds the minimum. Do not subtract business
        expenses from that profit again.
      </p>
      <p>
        Your job title alone cannot select a path. Check your tax records or ask
        a tax adviser which classification covers all your work. If you do not
        know, leave the choice unselected. This app cannot estimate your tax
        until the method is confirmed. If you use actual profit from regular
        accounts instead, these paths do not cover your case.
      </p>
      <div className="space-y-2">
        <p>
          <ExternalLink href="https://www.incometaxindia.gov.in/w/section-62-134">
            Official list of professions
          </ExternalLink>
        </p>
        <p>
          <ExternalLink href="https://www.incometaxindia.gov.in/w/section-58-138">
            Official method rules and limits
          </ExternalLink>
        </p>
      </div>
    </HelpModal>
  )
}
