import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'
import { currentRules } from '@/rules'

const qrmpLimit =
  currentRules.groups.gstCalendar.values.qrmpTurnoverLimit / 10_000_000
const lutLimit =
  currentRules.groups.lut.values.prosecutionThreshold / 10_000_000

// Reviewed 2026-09-06; sources and scope are recorded in .scratch/gst-filing-calendar/research/.
export function GstRegistrationHelp() {
  return (
    <HelpModal
      topic="GST registration details"
      title="Which registration details should I check?"
      description="Use your registration certificate and the filing periods shown in the GST portal."
    >
      <p>
        A normal taxpayer files GSTR-1 and GSTR-3B. This calendar covers one
        active GST registration. Composition registrations, multiple GSTINs,
        suspension and cancellation need separate guidance.
      </p>
      <p>
        The effective date is when your registration takes effect. It can differ
        from the date you applied or received approval. Check it against the
        first filing period shown in the portal.
      </p>
      <p>
        If registration was backdated, the first period does not match, or the
        registration changed state or status, choose Not sure until you have
        checked the records with your adviser. Leave the date blank if you do
        not know it. Your income-tax estimate can still be available.
      </p>
      <ExternalLink href="https://www.gst.gov.in/help/helpmodules/">
        GST registration and return help
      </ExternalLink>
    </HelpModal>
  )
}

export function GstFrequencyHelp() {
  return (
    <HelpModal
      topic="GST filing frequency"
      title="Monthly or quarterly GST returns?"
      description="Use the filing frequency confirmed in the GST portal for each quarter. Do not choose a frequency just because your turnover is below a limit."
    >
      <p>
        Monthly filers submit GSTR-1 and GSTR-3B each month. Under the Quarterly
        Return Monthly Payment scheme, or QRMP, these returns are quarterly,
        with payment checks for the first two months.
      </p>
      <p>
        You must have chosen QRMP in the GST portal and met its conditions.
        Aggregate turnover must be no more than ₹{qrmpLimit} crore in the
        previous financial year, and the last return due when choosing QRMP must
        have been filed. If turnover exceeds ₹{qrmpLimit} crore this year, QRMP
        eligibility ends from the next quarter.
      </p>
      <p>
        Check each quarter separately if your frequency changed. New
        registrations can join only within the applicable election window.
        Choose Not sure if a past or future quarter is not confirmed.
      </p>
      <p>
        GSTR-1 reports outward supplies, including your sales and service
        invoices. GSTR-3B summarises GST and input-tax credits. IFF, the Invoice
        Furnishing Facility for some invoices in the first two months, is
        optional and is not a required action in your plan.
      </p>
      <ExternalLink href="https://gstcouncil.gov.in/sites/default/files/2024-06/circular_refund_143_11_2020.pdf">
        Official QRMP guide, PDF
      </ExternalLink>
    </HelpModal>
  )
}

export function GstExportHelp() {
  return (
    <HelpModal
      topic="GST export routes"
      title="What do LUT, IGST and SEZ mean?"
      description="Use the GST treatment in your records. Having a client outside India does not by itself make a service a qualifying export."
    >
      <p>
        LUT means Letter of Undertaking. Eligible exporters use it to export
        without paying Integrated GST, or IGST, upfront, subject to the export
        conditions. This does not mean that every other GST duty disappears.
      </p>
      <p>
        Choose With IGST payment only if that is the confirmed route for all
        your service exports. This plan does not decide whether that route is
        available to you or calculate any refund.
      </p>
      <p>
        SEZ means Special Economic Zone. Supplies to an SEZ and exports under a
        bond need separate guidance here. Choose Bond, SEZ or mixed routes if
        any of those apply, or if you use more than one export route during the
        year. Confirmed return dates can still be shown.
      </p>
      <p>
        Choose No exports or SEZ supplies only if neither applies. If you cannot
        identify your route, choose Not sure.
      </p>
      <ExternalLink href="https://gstcouncil.gov.in/sites/default/files/2024-04/notfctn-37-central-tax-english.pdf">
        Official LUT and bond conditions, PDF
      </ExternalLink>
    </HelpModal>
  )
}

export function LutEligibilityHelp() {
  return (
    <HelpModal
      topic="LUT eligibility"
      title="Who can use an LUT?"
      description="This version needs you to confirm qualifying service exports outside India and the LUT conditions shown beside the question."
    >
      <p>
        The prosecution restriction concerns an offence under GST or the
        relevant earlier laws involving tax evasion of more than ₹{lutLimit}{' '}
        crore. It is not a turnover limit, and exactly ₹{lutLimit} crore does
        not exceed it.
      </p>
      <p>
        The facility to export without paying IGST can be withdrawn if the
        required conditions are not met. If it has been withdrawn or restricted,
        or you cannot confirm its status, ask your adviser before choosing Yes.
      </p>
      <p>
        An LUT covers a financial year. Submit it before the first export under
        it. Enter the first export in this year under this registration,
        including one already made. If you exported before submitting the LUT,
        ask your adviser or GST officer how to address the late filing.
        Acceptance is not automatic.
      </p>
      <ExternalLink href="https://gstcouncil.gov.in/sites/default/files/2024-04/notfctn-37-central-tax-english.pdf">
        Official LUT eligibility conditions, PDF
      </ExternalLink>
      <ExternalLink href="https://cbic-gst.gov.in/pdf/circular-cgst-125.pdf">
        Official guidance on late LUT filing, paragraph 44
      </ExternalLink>
    </HelpModal>
  )
}

export function QrmpPaymentHelp() {
  return (
    <HelpModal
      topic="QRMP payment reviews"
      title="Do I need to make a GST payment?"
      description="Check the payment requirement for each of the first two months of a QRMP quarter. This plan does not calculate the amount."
    >
      <p>
        Your cash ledger records money deposited with the GST portal. Your
        credit ledger records eligible input-tax credit. No deposit may be
        needed if GST liability is nil or the relevant ledger balance covers it.
        For the second month, check the two months together.
      </p>
      <p>
        PMT-06 is the challan used to deposit money. The fixed-sum and
        self-assessment payment methods have different conditions. Check the
        applicable method with your records or adviser; do not use freelance
        income to guess the deposit.
      </p>
      <p>
        Mark reviewed only after checking the requirement and making any payment
        due. It can also mean you confirmed that no payment was needed. My Next
        Filing cannot verify either conclusion. A payment review does not
        replace quarterly return filing.
      </p>
      <ExternalLink href="https://gstcouncil.gov.in/sites/default/files/2024-06/circular_refund_143_11_2020.pdf">
        Official QRMP payment guidance, section 6
      </ExternalLink>
    </HelpModal>
  )
}
