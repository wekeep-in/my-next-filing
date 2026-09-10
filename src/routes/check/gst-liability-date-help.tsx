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
      description="Add up your GST turnover from the start of the tax year. Use the first date the running total went above the registration limit. Exactly reaching the limit does not count."
    >
      <p>
        For the service business covered here, the limit is ₹
        {currentRules.groups.gstRegistration.values.lowerThreshold.toLocaleString(
          'en-IN',
        )}{' '}
        in{' '}
        {currentRules.groups.gstRegistration.values.lowerThresholdStates.join(
          ', ',
        )}
        , and ₹
        {currentRules.groups.gstRegistration.values.standardThreshold.toLocaleString(
          'en-IN',
        )}{' '}
        elsewhere. Other registration requirements can apply below these limits.
      </p>
      <p>
        Check all-India GST turnover records under your PAN for{' '}
        {currentRules.taxPeriod}. Use the confirmed crossing date, not a bank
        payout or application date.
      </p>
      <p>
        Leave blank if at or below the threshold, or unsure. If registration is
        required but the date is unknown, the plan says you need to register
        without guessing a deadline. Ask an adviser if the requirement began in
        an earlier tax year.
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
