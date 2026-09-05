import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'

// Reviewed 2026-09-06 against sections 58 and 62; publication dates unstated.
export function TaxMethodHelp() {
  return (
    <HelpModal
      topic="tax methods"
      title="Which method fits my work?"
      description="Choose by your work's tax classification, not whichever gives a lower estimate."
    >
      <p>
        <strong>Specified professional path:</strong> for a listed profession,
        such as information technology or technical consultancy.
      </p>
      <p>
        <strong>Eligible business path:</strong> for qualifying businesses that
        are not specified professions. Agency, commission and brokerage are
        excluded.
      </p>
      <p>
        Confirm your whole practice's classification in your tax records or with
        your adviser. A job title alone is not enough; both methods have further
        eligibility conditions.
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
