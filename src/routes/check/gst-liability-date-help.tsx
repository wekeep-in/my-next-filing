import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'
import { currentRules } from '@/rules'

// Reviewed 2026-09-06 against CGST sections 22 and 25 and CBIC registration FAQ.
// The Act was published 2017-04-12; the FAQ is undated.
export function GstLiabilityDateHelp() {
  return (
    <HelpModal
      topic="the GST registration liability date"
      title="When did I cross the threshold?"
      description="Use the first date your cumulative GST aggregate turnover exceeded your applicable threshold. Exactly reaching it does not count."
    >
      <p>
        Check all-India GST turnover records under your PAN for{' '}
        {currentRules.taxPeriod}. Use the confirmed crossing date, not a bank
        payout or application date.
      </p>
      <p>
        Leave blank if at or below the threshold, or unsure. An unknown date
        withholds the deadline, not a possible obligation. Seek advice for
        earlier-year liability.
      </p>
      <div className="space-y-2">
        <p>
          <ExternalLink href="https://taxinformation.cbic.gov.in/content-page/explore-act/1000291/1000001">
            Official registration threshold rules
          </ExternalLink>
        </p>
        <p>
          <ExternalLink href="https://taxinformation.cbic.gov.in/content-page/explore-act/1000294/1000001">
            Official application timing
          </ExternalLink>
        </p>
      </div>
    </HelpModal>
  )
}
