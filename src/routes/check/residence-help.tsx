import { currentRules } from '@/rules'
import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'

// Reviewed 2026-09-06 against the linked ITD guidance; publication dates unstated.
export function ResidenceHelp() {
  return (
    <HelpModal
      topic="Indian tax residence"
      title="What does tax residence mean?"
      description="Tax residence determines how India taxes your income. It is based on days in India and other legal conditions, not just your passport or where you live today."
    >
      <p>
        <strong>Resident and ordinarily resident</strong> means you meet both
        the residence tests and the additional conditions based on earlier
        years. <strong>Resident but not ordinarily resident</strong>, often
        shortened to RNOR, is a different status for some residents.
        <strong> Non-resident</strong> means you do not meet the applicable
        residence tests for the year. This app covers only the first status.
      </p>
      <p>
        Use your travel and tax records to check the full tests and exceptions
        for {currentRules.taxPeriod}. Choose Not sure until confirmed.
      </p>
      <ExternalLink href="https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/non%20resident%20-faq">
        Official residence tests and exceptions
      </ExternalLink>
    </HelpModal>
  )
}
