# LUT and export calendar research

Reviewed on 6 September 2026 for FY 2026-27. This review covers a dated LUT action for an otherwise-supported service freelancer. It does not establish GST liability, refund entitlement, invoice-level realisation deadlines, or a complete exporter compliance service.

## Statutory basis

| Authority | Issued or amended | Verified result |
| --- | --- | --- |
| [CGST Rules, rule 96A, current CBIC text](https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/rules/cgst_rules/active/chapter10/rule96a_v1.00.html) | Inserted by Notification 15/2017-CT, 1 July 2017; latest amendments displayed are 12/2024-CT, 10 July 2024 | A registered exporter choosing export without integrated-tax payment furnishes RFD-11 bond or LUT before export. The calendar must state this timing relation. |
| [Notification 37/2017-Central Tax](https://gstcouncil.gov.in/sites/default/files/2024-04/notfctn-37-central-tax-english.pdf) | 4 October 2017 | Clause i excludes prosecution under the specified GST or existing laws where tax evaded exceeds ₹250 lakh. Clause ii specifies a financial year. Clause iii withdraws the facility for unpaid tax and interest under rule 96A, restoring it on payment. Paragraph 2 extends the provision to qualifying SEZ supplies. |
| [Circular 8/8/2017-GST](https://cbic-gst.gov.in/pdf/Final_Master_circular_LUT_Bond_04102017.pdf) | 4 October 2017 | Paragraph 2b states validity for the financial year. Paragraph 2a confirms the widened eligibility, replacing earlier turnover/remittance tests. |
| [Circular 40/14/2018-GST](https://cbic-gst.gov.in/pdf/circularno-40-cgst.pdf) | 6 April 2018 | Replaces paragraphs 2c, 2d and 2e of Circular 8. Furnish RFD-11 online; ARN acknowledgement establishes deemed acceptance. Physical submission and a three-working-day wait are not the current ordinary online instructions. Ineligibility can lead to rejection afterwards. |
| [Notification 12/2024-Central Tax](https://gstcouncil.gov.in/sites/default/files/2024-09/central-tax-12-2024-11072024.pdf) | 10 July 2024 | Clause 20 replaces rule 96A(1)(b) with the later of one year and the permitted FEMA period including RBI extension, with further Commissioner discretion. It also updates export-invoice transmission for GSTR-1A. Neither change replaces the before-export requirement. |
| [Circular 125/44/2019-GST](https://cbic-gst.gov.in/pdf/circular-cgst-125.pdf) | 18 November 2019 | Paragraph 44 allows case-specific condonation of late LUT furnishing. Paragraph 46 restates the prosecution exclusion and bond alternative. A missed LUT date is not proof that a particular tax, interest or penalty amount is due. |

The statute says **exceeds** ₹2.5 crore. Do not copy the [GST tutorial](https://tutorial.gst.gov.in/userguide/refund/Furnishing_of_Letter_of_Undertaking_for_Export_of_Goods_or_Services.htm), which says ₹2.5 crore or above. That tutorial also retains older three-day status descriptions. Use it only for navigation and acknowledgements, not to establish Rules. Its publication date is absent; reviewed on 6 September 2026.

## Product interpretation

Foreign clients do not by themselves establish an export. Retain SPEC's current foreign-client confirmations about the actual overseas recipient, work and practice in India, own-account supply, ordinary place-of-supply treatment, distinct establishments, and permissible payment route. Add an explicit confirmation that the supplies using the LUT qualify as exports. Do not infer this from a platform name or annual foreign receipts.

The smallest supported LUT branch requires:

1. One active normal-taxpayer registration whose relevant effective date is known.
2. An explicit route: no relevant export, export under LUT without IGST payment, with IGST payment, bond, or unknown. A domestic client supplying an SEZ is not automatically the first choice.
3. For the LUT route, confirmation of export conditions, no disqualifying prosecution above the statutory amount, and no withdrawal or unresolved restriction of the facility.
4. The first export date in FY 2026-27 under this registration. The question must include exports already made, rather than asking only about the next planned export. Otherwise a user who started exporting in April could receive a misleading later deadline.

The date establishes a prerequisite, not an end-of-day filing deadline. Display “Before [date]”. If the underlying Obligation format needs one sortable date, retain the export date with an explicit `before` relation. Do not silently move it back one calendar day and call that a statutory due date. There is no universal 31 March LUT deadline in these sources.

A date before the relevant registration effective date, outside this financial year, missing, or invalid needs an independent LUT Review. Do not shift it forward to the registration date. An expired or withdrawn LUT also needs review. These rules are product boundaries to prevent an unsupported personalized conclusion.

Existing Completion records can represent the user's declaration that furnishing was completed. Keep them explicitly user-declared. The app cannot verify an ARN or government status and must not request an ARN, GSTIN or upload. A timely historical completion should remain valid even when the planned export date is now past. If the user has already exported without furnishing LUT, direct them to review late furnishing with their adviser or jurisdictional officer; do not promise retrospective acceptance.

## Preserve independent coverage

The return calendar depends on registration type, state, effective period and confirmed filing cadence. It does not depend on LUT eligibility. Domestic, mixed and export practices can keep their known GSTR-1/GSTR-3B periods when LUT guidance is unavailable.

For a user choosing the IGST-payment or bond route, omit a personalized LUT obligation and explain that this slice does not assess that route's tax, bond or refund requirements. This is not an endorsement of a refund claim. For an unknown route, give a LUT/export Review without removing return dates.

SEZ rules legally exist, but this implementation need not broaden the existing ordinary cross-border service boundary into SEZ eligibility. Ask enough to avoid silently calling every domestic supply “no LUT needed”. A separate SEZ or mixed-unknown route can retain return dates while withholding LUT advice.

Treat LUT Rules as an independent group. Invalid, missing or expired LUT evidence must withhold the LUT date and conclusion, while current return-calendar Rules can still operate. A review expiry is a product maintenance choice, not the expiry of rule 96A. Do not reuse a prior-year LUT completion in a new year.

## QRMP wording check

[Circular 143/13/2020-GST](https://cbic-gst.gov.in/pdf/Circular_Refund_143_11_2020.pdf), issued 10 November 2020, paragraphs 6.1 to 6.3, supports a payment **review** on the 25th for each of the first two months. Adequate cash/credit-ledger balance or nil tax liability can mean no deposit. For month two the comparison is cumulative across the first two months. An export-only practice must not be told that a positive payment is always due, or that no payment is ever needed. Do not infer a nil return from no tax payment. Paragraph 5.2 makes IFF optional.

## Access and release notes

The GST Council Notification 37 PDF, Circulars 8, 40, 125 and 143, and Notification 12 PDF were opened as full official texts. The old CBIC URL for Notification 37 returns 404, so use its working GST Council mirror. The current CBIC rule 96A HTML was read in full using a read-only fetch with local certificate verification bypassed after the environment returned a TLS trust error. Its contents match the separately opened official notification and circular texts on the propositions used here. Avoid relying solely on that HTML endpoint for a release source.

No exhaustive enumeration of all 2026 notifications was completed in this LUT sub-review. The parent calendar review must finish the current-notification sweep and assign the reviewed group expiry before release. No findings in the proposed boundaries above; implementation still needs tests for stale LUT isolation, unknown eligibility/date, date before registration, before-date rendering, and Completion reuse within the same financial year.
