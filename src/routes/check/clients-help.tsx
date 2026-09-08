import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'

// Reviewed 2026-09-06 against the linked CBIC, RBI and ITD guidance.
// RBI receipt regulations: issued 2023-12-21, amended through 2025-02-12.
// These notes explain confirmations, not a personalized legal classification.
export function PlatformFeeHelp() {
  return (
    <HelpModal
      topic="GST on platform fees"
      title="How do I confirm GST on the fee?"
      description="Check the platform's fee invoice and the supplier's location. Ask your adviser whether you must pay GST yourself under reverse charge."
    >
      <p>
        An invoice with no GST does not prove that no GST is due. Answer Yes to
        the no-reverse-charge question only when confirmed; otherwise choose Not
        sure.
      </p>
      <ExternalLink href="https://taxinformation.cbic.gov.in/content-page/explore-act/1000613/1000001">
        Official IGST reverse-charge rules
      </ExternalLink>
    </HelpModal>
  )
}

export function PlaceOfSupplyHelp() {
  return (
    <HelpModal
      topic="GST place of supply"
      title="What am I confirming?"
      description="Place of supply is the location GST assigns to your service. A client's overseas address alone does not confirm which rule applies."
    >
      <p>
        Choose Yes only if your records or adviser confirm the general rule
        places the service at the overseas client's location, with no special
        rule applying. Choose Not sure until confirmed.
      </p>
      <ExternalLink href="https://taxinformation.cbic.gov.in/content-page/explore-act/1000621/1000001">
        Official place-of-supply rules
      </ExternalLink>
    </HelpModal>
  )
}

export function PaymentRouteHelp() {
  return (
    <HelpModal
      topic="overseas payment routes"
      title="Which payment option fits?"
      description="Choose foreign currency when records confirm freely convertible foreign exchange, even if it was converted to rupees before reaching your account."
    >
      <p>
        The rupee option requires an RBI-permitted rupee receipt route. Ask your
        bank or payment provider to confirm the route from the remittance
        records. A rupee bank credit alone is not enough; choose Not sure if
        unconfirmed.
      </p>
      <ExternalLink href="https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12579">
        RBI guidance on receipt routes
      </ExternalLink>
    </HelpModal>
  )
}

export function ForeignAccountHelp() {
  return (
    <HelpModal
      topic="overseas accounts and balances"
      title="What should I check?"
      description="Review your platform terms and payment arrangements for overseas accounts, retained balances or rights to money held abroad."
    >
      <p>
        Signing authority means you can authorise transactions on an account,
        even if it is not yours. Choose Yes or possibly if any listed
        arrangement applies, or Not sure if unclear. Review this again in the
        foreign-assets section. Established assets or signing authority can be
        supported when their income effects are resolved; uncertain
        classification still needs review. Do not infer account ownership from a
        provider brand.
      </p>
      <ExternalLink href="https://www.incometax.gov.in/iec/foportal/nudge/nudge-schedule-fa">
        Official foreign-account guidance
      </ExternalLink>
    </HelpModal>
  )
}

export function ForeignTaxReliefHelp() {
  return (
    <HelpModal
      topic="foreign-tax and treaty relief"
      title="Am I claiming tax relief?"
      description="A foreign-tax credit uses tax paid abroad to reduce Indian tax. A tax treaty can also provide relief from double taxation."
    >
      <p>
        Check your tax computation or ask your adviser whether you are claiming
        either. Having an overseas client alone does not mean you are. Choose
        Not sure if unconfirmed; this version cannot handle these relief claims.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/w/double-taxation-relief">
        Official double-taxation relief guide
      </ExternalLink>
    </HelpModal>
  )
}
