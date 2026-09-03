# Decide the supported Obligation catalog

Type: grilling
Status: resolved
Blocked by: 01, 02, 04, 05

## Question

For every supported Solo freelancer Profile, which dated income-tax, GST, LUT, and foreign-receipt actions belong in the Application, and which nearby duties must remain guidance or explicit exclusions? Define normal and operative dates, applicability reasons, amount behavior, completion eligibility, source provenance, and partial-coverage behavior without turning the product into filing preparation or a general compliance calendar.

## Answer

Use **Obligation** only for an applicable action with a defensible date. Use **Review action** for an undated instruction to verify a condition. General guidance does not enter the chronological agenda. Only Obligations may receive Completion records.

### First successor catalog

The first successor release has exactly three possible Obligations:

1. **Pay advance tax.** Applies to either supported presumptive path when calculated advance-tax liability after actual Indian TDS and TCS is at least ₹10,000. The normal due date is 15 March 2027. Advance tax already paid reduces the estimated remaining amount but does not erase the underlying Obligation.
2. **File the annual income-tax return.** Applies when any supported filing trigger is established. The normal due date for the supported non-audit Profile is 31 August 2027. Do not name ITR-3 or ITR-4 as the Obligation.
3. **Apply for GST registration.** Applies only to an unregistered Profile whose GST aggregate turnover exceeded the applicable service threshold, whose threshold-liability date is known, and whose GST facts contain no separate unresolved compulsory-registration issue. The normal due date is thirty days after liability arose.

When GST aggregate turnover is above the threshold but the liability date is unknown, show an urgent Review action and Incomplete coverage. Do not invent a date or create a Completion record. A below-threshold or exactly-at-threshold status is information, not an Obligation.

The first successor release contains no GST-return, LUT, SOFTEX, EDF, realization, or other foreign-document Obligation.

### Annual-return triggers

Add the annual-return Obligation when any of these supported facts applies:

- rounded total income is above ₹4 lakh;
- Specified professional path gross receipts exceed ₹10 lakh;
- Eligible business path gross receipts exceed ₹60 lakh;
- actual Indian TDS plus TCS is at least ₹25,000, or at least ₹50,000 for a resident individual aged sixty or older; or
- the user confirms that another prescribed filing trigger applies.

Ask whether the user is sixty or older only when that answer changes the TDS/TCS trigger. Use one consolidated, explained confirmation for other prescribed triggers. If the user cannot confirm whether another trigger applies, keep the tax estimate but make annual-return coverage incomplete. Never present “no filing indicated” from an unknown trigger.

The first release does not select a return form. Foreign-account, foreign-asset, and disclosure facts can suppress simplified-return guidance without changing valid income-tax arithmetic. Provide one official starting link and, when separately reviewed, one tutorial link.

### Later registered-exporter catalog

The later GST-registered exporter slice can add exactly these Obligations for one active normal-taxpayer GSTIN in one Indian state:

- **Furnish LUT.** Applies when the registered user is eligible, exports without payment of IGST, and supplies the first planned export date for the Tax Year. The action must occur before that first export. Use the first-export calendar date with copy that makes the “before export” condition explicit. An unknown date or eligibility produces a Review action, not an Obligation.
- **File monthly GSTR-1.** Normal due date is the 11th day of the next month.
- **File monthly GSTR-3B.** Normal due date is the 20th day of the next month.
- **File quarterly GSTR-1.** For confirmed QRMP cadence, normal due date is the 13th day after the quarter.
- **File quarterly GSTR-3B.** For confirmed QRMP cadence, normal due date is the applicable 22nd or 24th day after the quarter based on the Profile's state group.
- **Review and make the QRMP monthly payment, if due.** For the first two months of a QRMP quarter, the normal review date is the 25th day of the next month. It remains conditional because this product does not know GST liability or ledger balances.

The GST slice must support both monthly cadence and the complete QRMP calendar. IFF is optional and never becomes an Obligation. More than one GSTIN, composition, suspension, cancellation, a non-normal taxpayer type, or an unknown cadence remains outside the GST calendar.

### Amount behavior

Only advance tax shows an amount. Display the estimated amount remaining after supported credits and advance tax already paid, never less than zero. Label it estimated and not a government demand.

GST registration, annual return, LUT, GSTR-1, GSTR-3B, and QRMP payment review show no calculated amount. In particular, do not infer GST payable, ledger balance, refund, interest, fee, or penalty.

### Date and source provenance

Every Obligation carries:

- a stable identity;
- its Tax Year or GST period;
- a normal due date;
- the direct statutory Source for applicability and normal date;
- an optional operative due date;
- the direct notification Source for an extension;
- plain applicability reasons;
- a short non-numeric consequence summary;
- a Rule verification date and expiry boundary; and
- an optional separately reviewed Tutorial Source.

The operative due date controls current status but never replaces or hides the normal due date. An extension cannot ship from a search result, portal message, tutorial, or unattributed calendar. Missing, invalid, expired, or incompletely sourced Rules stop the affected personalized conclusion; ticket 07 permits another independently valid area to remain Available only through its tagged Coverage result.

### Completion and deadline status

Every dated Obligation may receive one user-declared Completion record, including the conditional QRMP payment review. Review actions, general guidance, optional IFF, and excluded duties cannot.

Completion and deadline status are separate. Upcoming, Due today, and Deadline passed compare the India date with the operative due date or otherwise the normal due date. “Deadline passed” never means missed, overdue, filed, paid, or accepted. A Completion record is displayed separately and still does not show government verification. The Completion-record decision owns reconciliation with changed dates, Profile facts, and payment inputs.

After a passed deadline, show only a short statement that interest, a fee, or another consequence can apply and direct the user to the applicable government portal or a qualified adviser. Do not calculate a consequence without the filing, payment, waiver, ledger, and assessment facts it needs.

### Guidance and explicit exclusions

Keep these outside the agenda and Completion records:

- invoice creation and foreign-currency GST valuation;
- SOFTEX, service EDF, export-realization, repatriation, and Rule 96A dates;
- IEC and eBRC unless a later scope supports the relevant benefit;
- GST liability, input-tax credit, refunds, interest, late fees, and penalties;
- return preparation, payment, validation, upload, submission, and government acceptance; and
- GSTR-9 for 2026-27 until period-specific forms and exemptions are officially available and reviewed.

The first successor should show concise official guidance about the 1 October 2026 FEMA transition and direct users with foreign receipts to their authorised dealer or qualified adviser. Annual totals cannot generate invoice-level foreign-export deadlines.

### Compliance boundary

The catalog uses the statutory findings in [Income-tax treatment for solo digital freelancers](../research/income-tax-treatment.md) and [GST and foreign-receipt duties for solo freelancers](../research/gst-and-foreign-receipt-duties.md). All normal dates, extensions, annual-return triggers, GST states, and the uncommenced intermediary-place-of-supply amendment require a final period-specific compliance review before Rules freeze.
