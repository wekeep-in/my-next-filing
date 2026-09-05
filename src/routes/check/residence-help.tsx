import { currentRules } from '@/rules'
import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'

// Reviewed 2026-09-06 against the linked ITD guidance; publication dates unstated.
export function ResidenceHelp() {
  return (
    <HelpModal
      topic="Indian tax residence"
      title="Ordinarily resident or RNOR?"
      description="Ordinarily resident means you meet the residence test and the additional rules based on earlier years in India. RNOR means resident but not ordinarily resident."
    >
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
