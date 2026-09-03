# GST and foreign-receipt duties for solo freelancers

Verified on 2 September 2026 against the official sources linked below.

## Answer in brief

The filing workspace can safely support a narrow foreign-client profile, but it cannot treat "foreign receipt" as a single annual number for every purpose.

The safe profile is a resident individual who supplies their own remote digital professional service from one Indian state, has no other business, has either no GSTIN or one active normal-taxpayer GSTIN, and can identify the overseas person contractually liable to pay for that service. The service must use the default cross-border place-of-supply rule, and every condition in the statutory definition of export of services must be confirmed. Platform use is safe only when the contract still makes the freelancer the supplier of the main service and the cross-border platform fee does not introduce an unsupported reverse-charge duty.

The current GST aggregate-turnover input can remain a direct, user-confirmed amount. It must include domestic taxable supplies, exempt supplies, exports and inter-State supplies of every person with the same PAN on an all-India basis. It must exclude GST and cess and inward supplies on which the person pays reverse charge. Foreign export receipts therefore count toward the registration threshold even though a qualifying export is zero-rated. [CGST Act, 2017, section 2(6), consolidated through the Finance Act, 2026](https://upload.indiacode.nic.in/showfile?actid=AC_CEN_2_2_00042_201712_1517807328102&filename=a2017-12.pdf&type=actfile)

The product can add fixed GSTR-1 and GSTR-3B calendar items for a registered normal taxpayer. It can also add the complete QRMP calendar, but that includes conditional monthly PMT-06 payment reviews, not only quarterly returns. It should not calculate a GST return, refund, reverse-charge liability or domestic output tax.

Two facts prevent a decision-complete implementation specification today:

1. RBI's current rules apply until 30 September 2026, while new export regulations take effect on 1 October 2026. The old regime uses SOFTEX for software and no declaration form for many other services. The new regime requires an Export Declaration Form for service exports generally. [RBI Master Direction, updated 17 July 2026](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10395), [FEMA 23(R)/2026-RB, issued 13 January 2026 and effective 1 October 2026](https://www.rbi.org.in/scripts/BS_FemaNotifications.aspx?Id=13277)
2. Invoice issue, export declaration and realization duties depend on invoice and payment dates. An annual rupee total cannot generate or resolve those obligations.

## Registration and aggregate turnover

### Threshold

For service suppliers, liability under section 22 starts only when aggregate turnover **exceeds** the threshold in a financial year:

| Principal place of business | Service threshold |
| --- | ---: |
| Manipur, Mizoram, Nagaland or Tripura | ₹10 lakh |
| Any other state or Union territory | ₹20 lakh |

The current repository values are correct for services. The ₹40 lakh option concerns persons engaged exclusively in supplying goods and must not be offered to this profile. [CGST Act, 2017, section 22](https://upload.indiacode.nic.in/showfile?actid=AC_CEN_2_2_00042_201712_1517807328102&filename=a2017-12.pdf&type=actfile), [CBIC registration guide, including the four ₹10 lakh states](https://gstcouncil.gov.in/sites/default/files/e-version-gst-flyers/Registration_under_GST_Law_new.pdf)

An export is an inter-State supply. Section 24 would ordinarily require an inter-State supplier to register regardless of turnover, but Notification 10/2017-Integrated Tax exempts inter-State taxable service suppliers up to the section 22 threshold. Notification 03/2019 aligned the special-state wording. A below-threshold freelancer does not need GST registration merely because the client is abroad. [Notification 10/2017-Integrated Tax, issued 13 October 2017](https://cbic-gst.gov.in/hindi/pdf/integrated-tax/10_2017_IT.pdf), [CBIC registration guide describing Notification 03/2019](https://gstcouncil.gov.in/sites/default/files/e-version-gst-flyers/Registration_under_GST_Law_new.pdf)

Supplying services through an electronic-commerce operator also does not by itself remove the threshold exemption. Notification 65/2017-Central Tax, as aligned by Notification 06/2019, exempts service suppliers using an operator required to collect tax at source, except section 9(5) services, while aggregate turnover remains within the applicable threshold. [Notification 65/2017-Central Tax, issued 15 November 2017](https://www.gstcouncil.gov.in/sites/default/files/2024-05/notfctn-65-central-tax-english.pdf), [Notification 06/2019-Central Tax, issued 29 January 2019](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-06-central-tax-english-2019.pdf)

### Product behavior

- Keep GST aggregate turnover as a direct declaration. Do not derive it from income-tax receipts or bank deposits.
- Include a plain instruction that exports and exempt supplies across the PAN count. Domestic and foreign supplies are added, not compared separately with the threshold.
- At exactly the threshold, retain the current "review before more turnover" result. Section 22 uses "exceeds".
- Above the threshold, a dated registration obligation is safe only if the user supplies the date on which liability arose. Section 25 gives 30 days from that date to apply. Without the crossing date, show an urgent action without inventing a due date. [CGST Act, 2017, sections 22 and 25](https://upload.indiacode.nic.in/showfile?actid=AC_CEN_2_2_00042_201712_1517807328102&filename=a2017-12.pdf&type=actfile)
- Keep the existing compulsory-registration stop. Reverse charge, agency activity and other section 24 facts can require registration independently of turnover. [CGST Act, 2017, sections 23 and 24](https://upload.indiacode.nic.in/showfile?actid=AC_CEN_2_2_00042_201712_1517807328102&filename=a2017-12.pdf&type=actfile)

## When a foreign service is an export

All five conditions in section 2(6) of the IGST Act must hold:

1. The supplier is located in India.
2. The recipient is located outside India.
3. The place of supply is outside India.
4. The supplier receives payment in convertible foreign exchange, or in Indian rupees where RBI permits it.
5. Supplier and recipient are not merely establishments of the same person under Explanation 1 to section 8.

[IGST Act, 2017, section 2(6)](https://www.indiacode.nic.in/bitstream/123456789/2251/1/A201713.pdf)

For ordinary remote professional services, section 13(2) puts the place of supply at the recipient's location. If that location is unavailable in the ordinary course of business, the place of supply falls back to the supplier's location and the service is not an export. The special categories in sections 13(3) through 13(13) can override the default. [CBIC Tax Information Portal, IGST Act section 13](https://taxinformation.cbic.gov.in/content-page/explore-act/1000621/1000001)

The supported service boundary should therefore say:

> You supply the contracted digital professional service on your own account. Your records identify the overseas recipient. The work is not an agency or facilitation service and does not fall under a special place-of-supply rule.

This covers a developer, designer, writer, marketer or consultant only when the actual contract fits that statement. A profession label alone does not settle place of supply.

The recipient is normally the person liable to pay the consideration. A platform, payer, Indian affiliate or person who interacts with the freelancer is not automatically the recipient. [CGST Act, 2017, sections 2(31) and 2(93), on CBIC's Tax Information Portal](https://taxinformation.cbic.gov.in/content-page/explore-act/1000271/1000001)

Supplying the main service on one's own account is not an intermediary service. Merely arranging or facilitating another supply between two principals is. CBIC says an intermediary requires at least three parties, two distinct supplies and an ancillary facilitation role; subcontracting or supplying the main service on a principal-to-principal basis is not intermediary work. [Circular 159/15/2021-GST, issued 20 September 2021](https://cbic-gst.gov.in/pdf/Circular-No-159-14-2021-GST.pdf)

As of this review, section 13(8)(b) still puts the place of supply for intermediary services at the supplier's location. Finance Act 2026 has enacted its omission, but the amendment has not yet been brought into force in CBIC's live legislation. Recheck this before every release. It does not change the recommended boundary because agency and facilitation work remain outside the supported profile. [CBIC Tax Information Portal, current IGST section 13](https://taxinformation.cbic.gov.in/content-page/explore-act/1000621/1000001), [Finance Act 2026, assented 30 March 2026](https://cdnbbsr.s3waas.gov.in/s371e09b16e21f7b6919bbfc43f6a5b2f0/uploads/2026/06/20260612876642151.pdf)

### Receipt currency

Convertible foreign exchange is safe. An ordinary INR transfer is not enough. INR qualifies only when RBI permits that route. The established general route uses an authorised dealer's Special Rupee Vostro Account; the foreign buyer's ordinary domestic INR payment should not be treated as proof. [IGST Act, 2017, section 2(6)(iv)](https://www.indiacode.nic.in/bitstream/123456789/2251/1/A201713.pdf), [RBI A.P. (DIR Series) Circular 10, issued 11 July 2022](https://rbi.org.in/scripts/FS_Notification.aspx?Id=12358&Mode=0&fn=5)

Payment may arrive through an authorised payment aggregator or an approved third party, but the contract, invoice and banking evidence must connect it to the export. The current RBI direction requires documentary support and authorised-dealer satisfaction for third-party proceeds. The regulations effective 1 October 2026 expressly let an authorised dealer permit third-party receipts when satisfied about the transaction's bona fides. [RBI Master Direction, paragraphs A.3(iii) and A.3(v)](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10395), [FEMA 23(R)/2026-RB, regulation 8](https://www.rbi.org.in/scripts/BS_FemaNotifications.aspx?Id=13277)

The product should ask the user to confirm the permitted receipt route. It should not attempt to infer export status from the bank account currency or from a platform brand.

## Zero-rating, LUT and invoice duties

A service that meets the export definition is a zero-rated supply. A registered exporter may claim refund of unutilised input tax credit when supplying without IGST under a bond or LUT. Paying IGST and claiming refund is restricted to notified classes. Refund calculation and filing are not needed for this phase. [IGST Act, 2017, section 16](https://www.indiacode.nic.in/bitstream/123456789/2251/1/A201713.pdf)

### LUT or bond

- A registered person exporting without payment of IGST must furnish Form GST RFD-11 before the export. The LUT is valid for the financial year in which it is furnished. [CGST Rule 96A as amended by Notification 12/2024-Central Tax](https://gstcouncil.gov.in/sites/default/files/2024-09/central-tax-12-2024-11072024.pdf), [Circular 8/8/2017-GST, issued 4 October 2017](https://cbic-gst.gov.in/pdf/Final_Master_circular_LUT_Bond_04102017.pdf)
- LUT is available to registered exporters except a person prosecuted for a relevant offence involving tax evasion above ₹2.5 crore. That excluded person uses a bond with the prescribed bank guarantee. [Notification 37/2017-Central Tax, issued 4 October 2017](https://gstcouncil.gov.in/sites/default/files/2024-04/notfctn-37-central-tax-english.pdf)
- A below-threshold unregistered exporter neither files an LUT nor charges GST. Do not prompt that user to file RFD-11.
- A calendar may show "Furnish LUT for 2026-27" only when the user is registered, exports without IGST and has not completed it. The legal deadline is before the first such export, not automatically 1 April. The first-export date is required to produce a dated obligation.
- CBIC permits fact-specific, ex-post-facto condonation in some late-LUT cases. That is remedial guidance, not a normal workflow or an automatic completed state. [Circular 125/44/2019-GST, paragraph 44](https://cbic-gst.gov.in/pdf/circular-cgst-125.pdf)

### Invoice

A registered service supplier must issue the tax invoice within 30 days from the date of supply. The invoice needs the normal Rule 46 particulars. An export invoice also needs the applicable export endorsement, recipient name and address, destination country and other export particulars. [Current CGST Rule 46 on CBIC's Tax Information Portal](https://taxinformation.cbic.gov.in/content-page/explore-rules/1000136/1000001), [CBIC invoice rules page, including Rule 47](https://cbic-gst.gov.in/gst-invoice-rules.html)

For GST valuation of a service invoiced in foreign currency, Rule 34 uses the exchange rate determined under generally accepted accounting principles on the GST time-of-supply date. The annual INR amount used for income tax is not a substitute for this invoice-level GST value. [CBIC Tax Information Portal, current CGST Rule 34](https://taxinformation.cbic.gov.in/content-page/explore-rules/1000120/1000001)

Invoice deadlines and currency conversion should remain guidance in the first saved workspace. Tracking them requires invoice date, supply date, currency and value for each transaction, which conflicts with the accepted annual-total input model.

## GST return calendars

These calendars are safe only for one active GSTIN held by a normal taxpayer. Users with several registrations, composition levy, casual or non-resident status, ISD, TDS/TCS duties, section 9(5) supplies or a cancelled/suspended registration need another calendar.

Registered normal taxpayers file GSTR-3B even for a nil period. Export invoices appear in GSTR-1 Table 6A, and zero-rated outward supplies appear in GSTR-3B Table 3.1(b). [GST Portal GSTR-3B guide](https://tutorial.gst.gov.in/userguide/returns/GSTR3B.htm), [GST Portal export/SEZ comparison guide](https://tutorial.gst.gov.in/userguide/inputtaxcredit/FAQs_comparison_of_liability_declared_and_ITC_claimed.htm)

### Monthly filer

For each tax period from April 2026 through March 2027:

| Filing | Normal due date |
| --- | --- |
| GSTR-1 | 11th day of the next month |
| GSTR-3B and payment | 20th day of the next month |

Notification 83/2020 sets the continuing GSTR-1 dates. Rule 61, substituted by Notification 82/2020, sets monthly GSTR-3B on the 20th. [Notification 83/2020-Central Tax, issued 10 November 2020](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-83-central-tax-english-2020.pdf), [Notification 82/2020-Central Tax, issued 10 November 2020](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-82-central-tax-english-2020.pdf)

### QRMP filer

QRMP is available when preceding-financial-year aggregate turnover is up to ₹5 crore, the taxpayer opts in and the return due when the option is exercised has been filed. Crossing ₹5 crore makes the taxpayer ineligible from the first month of the next quarter. [Notification 84/2020-Central Tax, issued 10 November 2020](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-84-central-tax-english-2020.pdf)

The quarterly return calendar for 2026-27 is:

| Quarter | GSTR-1 | GSTR-3B, group A | GSTR-3B, group B |
| --- | --- | --- | --- |
| April to June 2026 | 13 July 2026 | 22 July 2026 | 24 July 2026 |
| July to September 2026 | 13 October 2026 | 22 October 2026 | 24 October 2026 |
| October to December 2026 | 13 January 2027 | 22 January 2027 | 24 January 2027 |
| January to March 2027 | 13 April 2027 | 22 April 2027 | 24 April 2027 |

Group A is Chhattisgarh, Madhya Pradesh, Gujarat, Maharashtra, Karnataka, Goa, Kerala, Tamil Nadu, Telangana and Andhra Pradesh, plus Dadra and Nagar Haveli and Daman and Diu, Puducherry, Andaman and Nicobar Islands and Lakshadweep. Group B is every other state and Union territory. [Notification 82/2020-Central Tax, Rule 61](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-82-central-tax-english-2020.pdf)

QRMP still has monthly payment duties for the first two months of each quarter. Form GST PMT-06 is due on the 25th of the following month:

| Quarter | First two normal payment-review dates |
| --- | --- |
| April to June 2026 | 25 May and 25 June 2026 |
| July to September 2026 | 25 August and 25 September 2026 |
| October to December 2026 | 25 November and 25 December 2026 |
| January to March 2027 | 25 February and 25 March 2027 |

The deposit may be unnecessary where the relevant ledger balance covers liability or liability is nil. The application cannot decide that without GST liability and ledger data. It may show a conditional "Review and make QRMP monthly payment, if due" item, or it must exclude QRMP. It must not mark a tax payment due unconditionally. [Notification 85/2020-Central Tax, issued 10 November 2020](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-85-central-tax-english-2020.pdf), [Notification 82/2020-Central Tax, Rule 61(3)](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-82-central-tax-english-2020.pdf)

IFF is optional. It lets a QRMP filer furnish selected B2B invoice details for either of the first two months by the 13th of the next month. Do not present it as an obligation. [Notification 82/2020-Central Tax, Rule 59(2)](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-82-central-tax-english-2020.pdf)

All dates above are normal dates. GST authorities frequently issue period-specific extensions. The rule dataset must keep normal and operative dates separately, require a direct notification source for an extension and fail closed after its review window.

### Annual GST return

Do not add GSTR-9 for 2026-27 yet. Section 44 and Rule 80 create an annual-return regime, but the government has repeatedly used period-specific exemptions for small taxpayers. The 2026-27 position cannot be known before the relevant notification cycle, and its normal 31 December 2027 date sits beyond the current rules window. Reopen this question when the 2026-27 annual-return forms and exemptions exist. [Current CGST section 44](https://taxinformation.cbic.gov.in/content-page/explore-act/1000315/1000001), [current CGST Rule 80](https://taxinformation.cbic.gov.in/content-page/explore-rules/1000468/1000001)

## Platform-mediated work

A platform produces two possible supplies that must not be collapsed:

1. The freelancer's service to the contractual recipient.
2. The platform or payment provider's service to the freelancer.

For the first supply, store gross consideration payable for the freelancer's service before deducting platform charges. The platform's net payout is not enough to identify the GST value. Section 15 starts with the price paid or payable for the supply, while the recipient is the person liable to pay it. The contract and invoice decide whether the end client or the platform is that person. [CGST Act, sections 2(93) and 15, on CBIC's Tax Information Portal](https://taxinformation.cbic.gov.in/content-page/explore-act/1000271/1000001), [CGST Act section 15](https://taxinformation.cbic.gov.in/content-page/explore-act/1000284/1000001)

For the second supply, a fee billed by a foreign platform to the Indian freelancer can be an imported service. Notification 10/2017-Integrated Tax (Rate) puts tax on services supplied from outside the taxable territory to a person in the taxable territory on the Indian recipient under reverse charge, subject to the notification's terms. A person required to pay reverse charge is a compulsory-registration case under section 24. [Notification 10/2017-Integrated Tax (Rate), issued 28 June 2017](https://cbic-gst.gov.in/hindi/pdf/integrated-tax-rate/Notification10-IGST.pdf), [CGST Act, section 24](https://upload.indiacode.nic.in/showfile?actid=AC_CEN_2_2_00042_201712_1517807328102&filename=a2017-12.pdf&type=actfile)

That makes brand-level platform support unsafe. The first release may support a platform transaction only if the user confirms all of the following:

- the freelancer supplies the main professional service on their own account;
- the contract identifies the overseas recipient and gross consideration;
- the receipt route is permitted and documented by the authorised dealer or payment aggregator;
- the platform fee's GST treatment is already established and creates no recipient-side duty that this version omits.

Otherwise return an unsupported result that names imported-service reverse charge, agency/intermediary classification or unclear recipient as the reason. Do not silently support Upwork, Fiverr, Toptal or another brand as a category.

## Mixed domestic and foreign receipts

A freelancer may safely have both direct domestic professional receipts and qualifying export receipts when all supplies remain within the supported profession and one-state business boundary.

- Add both to aggregate turnover for registration.
- Treat qualifying exports as zero-rated, not exempt or outside GST.
- A registered freelancer reports exports and domestic outward supplies in the same GSTR-1 and GSTR-3B cadence.
- Domestic liability, service classification, rate, input tax credit and reverse charge remain outside the calculator. The workspace only tracks dates.
- An export that fails any section 2(6) condition is not silently reclassified. Stop GST coverage and direct the user to a professional because place of supply and tax treatment must be established.

## FEMA, SOFTEX, EDF and realization

### Through 30 September 2026

The current Master Direction requires export proceeds for goods, software and services to be realized and repatriated within nine months. An authorised dealer may grant extensions under its delegated conditions. [RBI Master Direction, paragraphs A.2 and C.20, updated 17 July 2026](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10395)

Software transmitted electronically uses SOFTEX. Long-duration contracts should be invoiced at least monthly or at contract milestones, with the last invoice within 15 days after completion. One-shot software contracts should be invoiced within 15 days after transmission. SOFTEX is due no later than 30 days after the invoice or last invoice in the month. Services for which no declaration form applies do not file SOFTEX, but realization and repatriation still apply. [RBI Master Direction, paragraphs B.5 and B.7](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10395)

The word "developer" is not enough to decide SOFTEX. The current rules concern export of computer software and specified audio/video software. The actual deliverable and transmission matter. Treat April to September 2026 software-export history as unsupported unless the user can identify whether SOFTEX applied and whether it was filed.

### From 1 October 2026

FEMA 23(R)/2026-RB supersedes the 2015 export regulations from 1 October 2026. It defines software broadly and makes these changes:

- Every exporter of services furnishes an EDF to the specified authority within 30 days after the end of the month in which the service invoice was raised. One EDF may cover a month's exports to one or more recipients.
- For non-software services, the exporter may instead submit the EDF on or before receipt of payment. The authorised dealer may extend a late submission after considering the reasons.
- The specified authority is an authorised dealer for non-software services; for software it is an authorised dealer or STPI in the domestic tariff area.
- Full service-export value must normally be realized and repatriated within 15 months from invoice. If the export is invoiced or settled in INR, the period is 18 months. The authorised dealer may extend it on request.
- Invoices up to ₹10 lakh are not exempt from declaration. The amount only enables the authorised dealer to close an EDPMS entry based on an exporter declaration in the circumstances stated by the regulation.
- The authorised dealer may permit third-party receipts after checking bona fides.

[FEMA 23(R)/2026-RB, regulations 1 through 8 and 18, issued 13 January 2026](https://www.rbi.org.in/scripts/BS_FemaNotifications.aspx?Id=13277)

The saved workspace can track the new monthly EDF duty only if it asks whether the month's exports were software, whether a declaration was made and, for non-software services using the receipt-date option, the relevant payment date. A generic month-end EDF item is otherwise liable to show the wrong due date.

### GST realization clock

Rule 96A now requires an LUT exporter to pay the IGST and interest within 15 days after the later of one year from invoice or the FEMA realization period, including an RBI-permitted extension, if payment has not been received. From 1 October 2026, the new 15-month or 18-month FEMA period will therefore also move the Rule 96A date for affected invoices. [Notification 12/2024-Central Tax, rule 96A amendment](https://gstcouncil.gov.in/sites/default/files/2024-09/central-tax-12-2024-11072024.pdf)

This is an invoice-level conditional duty. Do not put it in the agenda from an annual foreign-receipt total. The product needs each invoice date, permitted-currency route, payment status, payment date and any authorised extension to calculate it safely.

### IEC and eBRC

An IEC is not generally required just to export services. It becomes necessary when the service provider claims benefits under the Foreign Trade Policy. A person who obtains an IEC must confirm or update its details online each year during April through June. [Foreign Trade Policy 2023, paragraph 2.05](https://content.dgft.gov.in/Website/dgftprod/61d61bc2-272e-4880-b96c-c8f685a3b244/Foreign%20Trade%20Policy%202023.pdf)

Do not add an IEC or eBRC obligation to every freelancer. Keep both as guidance tied to FTP benefits, refund evidence or an authorised dealer's request. A BRC/FIRC is evidence used for a GST export-of-services refund; this phase does not claim or prepare refunds. [GST Portal export-service refund guide](https://tutorial.gst.gov.in/userguide/refund/Refund_of_ITC_paid_on_Exports_of_Goods_and_Services_without_payment_of_Integrated_Tax.htm)

## What the workspace may track

### Supported dated obligations

| Obligation | When it can be shown | Due-date rule |
| --- | --- | --- |
| Apply for GST registration | Liability date is known and no unsupported compulsory-registration fact exists | 30 days after liability arises |
| Furnish LUT in RFD-11 | Registered, eligible, exporting without IGST, first export date known | Before first such export in the financial year |
| File monthly GSTR-1 | Active normal GST registration with monthly cadence | 11th of next month, subject to extension |
| File monthly GSTR-3B | Same | 20th of next month, subject to extension |
| File quarterly GSTR-1 | Active normal GST registration with confirmed QRMP cadence | 13th after quarter, subject to extension |
| File quarterly GSTR-3B | Same, with state group known | 22nd or 24th after quarter, subject to extension |
| Review or make QRMP monthly payment | QRMP and first or second month of quarter | 25th of next month; conditional on liability and ledger balance |
| File SOFTEX | Pre-1 October 2026 software export and invoice facts known | Within 30 days of invoice or last monthly invoice |
| File service EDF | Export invoiced on or after 1 October 2026 and declaration route known | 30 days after invoice month, or permitted receipt-date route for non-software |
| Realize export proceeds | Invoice, currency route and extension facts known | Applicable FEMA period from invoice |
| Pay IGST and interest after unrealized LUT export | Registered LUT exporter and invoice remains unpaid | 15 days after the later Rule 96A/FEMA period |

Every completion record remains a user declaration. "Filed" must not imply portal acceptance or government verification.

### Guidance, not agenda items in the annual-total version

- Export-of-service classification and evidence.
- GST invoice contents and 30-day issue rule.
- GST foreign-currency valuation.
- BRC/FIRC and refund evidence.
- IEC unless FTP benefits are claimed.
- EDPMS follow-up handled with the authorised dealer.
- Domestic GST rate, liability and input tax credit.

### Explicit exclusions

- Foreign tax credit or tax withheld abroad.
- Agency, brokerage, commission or intermediary services.
- A foreign platform fee that may create imported-service reverse charge.
- More than one state of establishment or more than one GSTIN.
- Goods, royalties, licensing, automated digital products and special place-of-supply categories unless researched separately.
- GST composition levy and section 9(5) platform services.
- Return preparation, tax payment, refund calculation or refund filing.
- Late fee, interest or penalty calculation.
- GSTR-9 for 2026-27 until period-specific law is available.
- Historical compliance conclusions where an invoice, receipt, LUT, SOFTEX or EDF fact is missing.

## Source register

| Authority | Instrument | Publication or issue date | Use in this note |
| --- | --- | --- | --- |
| India Code | [Central Goods and Services Tax Act, 2017, current consolidation](https://upload.indiacode.nic.in/showfile?actid=AC_CEN_2_2_00042_201712_1517807328102&filename=a2017-12.pdf&type=actfile) | Enacted 12 April 2017; consolidation includes Finance Act 2026 | Aggregate turnover, registration, invoice and return duties |
| India Code | [Integrated Goods and Services Tax Act, 2017](https://www.indiacode.nic.in/bitstream/123456789/2251/1/A201713.pdf) | Enacted 12 April 2017; accessed 2 September 2026 | Export definition, place of supply and zero-rating |
| CBIC | [Tax Information Portal, current CGST sections 2 and 15](https://taxinformation.cbic.gov.in/content-page/explore-act/1000271/1000001) | Act enacted 12 April 2017; portal checked 2 September 2026 | Recipient, consideration and valuation |
| CBIC | [Tax Information Portal, current CGST section 44](https://taxinformation.cbic.gov.in/content-page/explore-act/1000315/1000001) | Act enacted 12 April 2017; portal checked 2 September 2026 | GST annual-return boundary |
| CBIC | [Tax Information Portal, current IGST section 13](https://taxinformation.cbic.gov.in/content-page/explore-act/1000621/1000001) | Act enacted 12 April 2017; portal checked 2 September 2026 | Cross-border place of supply and uncommenced amendment check |
| CBIC | [Notification 10/2017-Integrated Tax](https://cbic-gst.gov.in/hindi/pdf/integrated-tax/10_2017_IT.pdf) | 13 October 2017 | Below-threshold inter-State service registration exemption |
| CBIC | [Notification 10/2017-Integrated Tax (Rate)](https://cbic-gst.gov.in/hindi/pdf/integrated-tax-rate/Notification10-IGST.pdf) | 28 June 2017 | Reverse charge on imported services |
| GST Council | [Notification 65/2017-Central Tax](https://www.gstcouncil.gov.in/sites/default/files/2024-05/notfctn-65-central-tax-english.pdf) | 15 November 2017 | Below-threshold service suppliers using an e-commerce operator |
| GST Council | [Notification 06/2019-Central Tax](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-06-central-tax-english-2019.pdf) | 29 January 2019; effective 1 February 2019 | Alignment of the e-commerce service exemption with section 22 |
| CBIC | [Registration under GST Law guide](https://gstcouncil.gov.in/sites/default/files/e-version-gst-flyers/Registration_under_GST_Law_new.pdf) | Publication date not stated; checked 2 September 2026 | Official consolidation of the 2019 threshold-notification changes |
| CBIC | [Circular 159/15/2021-GST](https://cbic-gst.gov.in/pdf/Circular-No-159-14-2021-GST.pdf) | 20 September 2021 | Intermediary and own-account supply boundary |
| Government of India | [Finance Act 2026](https://cdnbbsr.s3waas.gov.in/s371e09b16e21f7b6919bbfc43f6a5b2f0/uploads/2026/06/20260612876642151.pdf) | Assented and first published 30 March 2026 | Enacted but uncommenced intermediary amendment |
| GST Council | [Notification 37/2017-Central Tax](https://gstcouncil.gov.in/sites/default/files/2024-04/notfctn-37-central-tax-english.pdf) | 4 October 2017 | LUT eligibility and financial-year validity |
| CBIC | [Circular 8/8/2017-GST](https://cbic-gst.gov.in/pdf/Final_Master_circular_LUT_Bond_04102017.pdf) | 4 October 2017 | LUT and bond operation |
| CBIC | [Circular 125/44/2019-GST](https://cbic-gst.gov.in/pdf/circular-cgst-125.pdf) | 18 November 2019 | Late-LUT condonation guidance |
| GST Council | [Notification 12/2024-Central Tax](https://gstcouncil.gov.in/sites/default/files/2024-09/central-tax-12-2024-11072024.pdf) | 10 July 2024 | Current Rule 96A realization period |
| CBIC | [Tax Information Portal, current CGST Rule 34](https://taxinformation.cbic.gov.in/content-page/explore-rules/1000120/1000001) | Rule substituted 27 July 2017; portal checked 2 September 2026 | Foreign-currency GST valuation |
| CBIC | [Tax Information Portal, current CGST Rule 46](https://taxinformation.cbic.gov.in/content-page/explore-rules/1000136/1000001) | Rule effective 1 July 2017; portal checked 2 September 2026 | Export invoice particulars |
| CBIC | [Tax Information Portal, current CGST Rule 80](https://taxinformation.cbic.gov.in/content-page/explore-rules/1000468/1000001) | Current rule checked 2 September 2026 | GSTR-9 form and normal date |
| CBIC | [Invoice rules page](https://cbic-gst.gov.in/gst-invoice-rules.html) | Rules effective 1 July 2017; page checked 2 September 2026 | Service-invoice time limit under Rule 47 |
| GST Council | [Notification 82/2020-Central Tax](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-82-central-tax-english-2020.pdf) | 10 November 2020 | GSTR-3B, QRMP, PMT-06 and IFF rules |
| GST Council | [Notification 83/2020-Central Tax](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-83-central-tax-english-2020.pdf) | 10 November 2020 | GSTR-1 normal dates |
| GST Council | [Notification 84/2020-Central Tax](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-84-central-tax-english-2020.pdf) | 10 November 2020 | QRMP eligibility |
| GST Council | [Notification 85/2020-Central Tax](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-85-central-tax-english-2020.pdf) | 10 November 2020 | QRMP payment method and exceptions |
| GST Network | [Current GSTR-3B guide](https://tutorial.gst.gov.in/userguide/returns/GSTR3B.htm) | Publication date not stated; checked 2 September 2026 | Portal behavior and nil returns |
| GST Network | [Export/SEZ return comparison guide](https://tutorial.gst.gov.in/userguide/inputtaxcredit/FAQs_comparison_of_liability_declared_and_ITC_claimed.htm) | Publication date not stated; checked 2 September 2026 | Export tables in GSTR-1 and GSTR-3B |
| GST Network | [Export-service refund guide](https://tutorial.gst.gov.in/userguide/refund/Refund_of_ITC_paid_on_Exports_of_Goods_and_Services_without_payment_of_Integrated_Tax.htm) | Publication date not stated; checked 2 September 2026 | BRC/FIRC operational evidence |
| RBI | [Master Direction on Export of Goods and Services](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10395) | Issued 1 January 2016; updated 17 July 2026 | Law through 30 September 2026, SOFTEX, realization and payment routes |
| RBI | [FEMA 23(R)/2026-RB](https://www.rbi.org.in/scripts/BS_FemaNotifications.aspx?Id=13277) | Issued 13 January 2026; Gazette 15 January 2026; effective 1 October 2026 | New EDF, EDPMS and realization regime |
| RBI | [A.P. (DIR Series) Circular 10](https://rbi.org.in/scripts/FS_Notification.aspx?Id=12358&Mode=0&fn=5) | 11 July 2022 | INR settlement through Special Rupee Vostro Accounts |
| DGFT | [Foreign Trade Policy 2023](https://content.dgft.gov.in/Website/dgftprod/61d61bc2-272e-4880-b96c-c8f685a3b244/Foreign%20Trade%20Policy%202023.pdf) | Effective 1 April 2023 | IEC rule for service exports |

## Compliance findings for the proposed expansion

- **S1, source boundary:** `src/rules/index.ts` currently sources only aggregate turnover and section 22. Foreign-client support also needs the inter-State service-registration exemption and its amendments. Smallest safe fix when implementation starts: add direct, dated source entries for Notification 10/2017-Integrated Tax and Notification 03/2019-Integrated Tax.
- **S1, effective-date boundary:** a single undated FEMA/SOFTEX rule would become wrong on 1 October 2026. Smallest safe fix: decide the transition scope, then use separate expiry-bound rule records on either side of that date.
- **S1, missing facts:** annual rupee totals cannot establish or complete invoice, EDF/SOFTEX, realization or Rule 96A duties. Smallest safe fix: keep those as guidance, or add the minimum invoice/payment record before calling them obligations.
- **S2, platform boundary:** an overseas platform fee can create imported-service reverse charge and compulsory registration. Smallest safe fix: support only a narrow confirmed fee arrangement and stop on foreign or unclear platform fees.

There is no defect in the current released calculation because it explicitly rejects foreign clients, platform income and GST-registered profiles. These findings are release blockers only for the proposed expansion.

## Decisions now sharp enough for Wayfinder tickets

1. **Choose the 1 October 2026 FEMA transition boundary.** Decide whether the next release models April to September history under SOFTEX, starts foreign-service tracking on 1 October under EDF, or treats all pre-launch export-document status as unsupported history.
2. **Choose the minimum foreign-invoice record.** Decide whether the workspace keeps annual totals and offers only GST return dates, or stores invoice and receipt dates needed for EDF, realization and Rule 96A obligations.
3. **Choose the platform-fee support gate.** Decide whether to exclude every foreign-billed platform fee or add imported-service reverse-charge registration and return behavior.
4. **Choose monthly-only GST or full QRMP.** Full QRMP requires state grouping, confirmed filing cadence and conditional PMT-06 payment-review items.
5. **Fix the one-state, one-GSTIN boundary.** Confirm that additional establishments, registrations and cancelled or suspended GSTINs stay outside the solo-freelancer release.
6. **Schedule a period-specific release review.** Recheck GST due-date extensions, the uncommenced intermediary-place-of-supply amendment and the 2026-27 GSTR-9 position immediately before rules freeze.
