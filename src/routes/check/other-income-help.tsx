import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'
import { currentRules } from '@/rules'

// Reviewed 2026-09-06 against the linked ITD AIS/Form 168 guidance; undated.
export function InterestHelp() {
  return (
    <HelpModal
      topic="taxable bank interest"
      title="Which interest amount?"
      description={`Add taxable savings and deposit interest from your bank certificates for ${currentRules.taxPeriod}. Use gross interest before TDS, including taxable interest reinvested.`}
    >
      <p>
        If only TDS was deducted, net interest plus that TDS equals gross
        interest. Exclude deposit principal and exempt interest. No TDS does not
        mean no tax. Cross-check your Annual Information Statement, or AIS,
        without counting the same interest twice.
      </p>
      <ExternalLink href="https://www.incometax.gov.in/iec/foportal/ais-faq">
        How to check your AIS
      </ExternalLink>
    </HelpModal>
  )
}

export function TdsHelp() {
  return (
    <HelpModal
      topic="Indian TDS credit"
      title="Which TDS amount?"
      description="TDS is tax a client or bank withheld. Enter the actual credit for work income and bank interest included in this estimate."
    >
      <p>
        Match payer certificates with AIS tax-credit entries for{' '}
        {currentRules.taxPeriod}. Total the tax deducted, not the gross
        payments. Count each credit once. Exclude salary, foreign and GST
        withholding; enter TCS and advance tax separately. Resolve mismatches
        with the payer before proceeding; use 0 only if no credit applies.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/documents/d/guest/form-168-faqs">
        Official AIS and credit guide, PDF
      </ExternalLink>
    </HelpModal>
  )
}

export function TcsHelp() {
  return (
    <HelpModal
      topic="Indian TCS credit"
      title="Which TCS amount?"
      description="TCS is income tax collected from you on certain transactions. Enter only the credit available for this tax year."
    >
      <p>
        Match the collector's certificate with AIS tax-credit entries for{' '}
        {currentRules.taxPeriod}. Total the tax collected, not the transaction
        value. Count each credit once; exclude GST TCS, reversed credits and
        amounts used for another year. Resolve mismatches with the collector
        before proceeding. Use 0 if none applies.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/documents/d/guest/fn-168">
        Official TCS credit guide, PDF
      </ExternalLink>
    </HelpModal>
  )
}
