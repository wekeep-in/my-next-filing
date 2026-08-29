# Statutory rules and sources for Tax Year 2026-27

Reviewed on 29 August 2026 against official Indian government sources. This is implementation research, not tax or legal advice.

## Bottom line

The Income-tax rules in `SPEC.md` are safe to implement for the declared narrow profile, subject to the source-registry changes and edge-case wording below. The GST threshold amounts and four lower-threshold states are also correct. The GST turnover input is not safe as specified because GST aggregate turnover includes exempt supplies; the separate bank-interest amount can therefore matter. No operative extension was found for either future due date.

## Discrepancies and required decisions

| Priority | SPEC position | Official position | Required implementation action |
| --- | --- | --- | --- |
| Blocking | "PAN-wide GST turnover" is described as the invoice value of IT or software services, and the user confirms those services are the only supplies. | CGST Act section 2(6) includes taxable supplies and exempt supplies of every person with the same PAN on an all-India basis. Interest on deposits, loans, or advances is an exempt service. Official advance rulings have included savings-bank, PPF, loan, and deposit interest in aggregate turnover, although an advance ruling binds only its applicant and jurisdiction. See the [CGST Act consolidated to 11 June 2026](https://www.indiacode.nic.in/indiacode/bitstream/123456789/15689/1/A2017-12.pdf), the [CBIC services-rate entry for interest](https://cbic-gst.gov.in/gst-goods-services-rates.html), and the [Gujarat AAR example](https://gstcouncil.gov.in/sites/default/files/AAR/guj_aar_10_2020_19.04.2020_ssmr.pdf). | Do not calculate GST status from consulting invoices alone when bank interest is non-zero. Obtain a qualified interpretation before release, then either include all relevant exempt supplies in the GST input or return an incomplete/unsupported GST result. Avoid silently adding the income-tax interest field because the user could otherwise double-count it in a PAN-wide figure. |
| High | The GST result changes to "Review GST registration now" at or above ₹10 lakh/₹20 lakh. | CGST Act section 22 says liability arises when aggregate turnover exceeds, not equals, the applicable threshold. | Keep an at-threshold review nudge only if the copy makes clear that it is conservative and is not a statement that threshold-based registration is already mandatory. Model the statutory comparison as `turnover > threshold`. |
| Medium | "An amount paid after 15 March can still count as advance tax." | Section 408(3) treats payment as advance tax only when paid on or before 31 March of that financial year. | Say "after 15 March and on or before 31 March." Do not treat a payment after 31 March 2027 as advance tax for Tax Year 2026-27. |
| Medium | The initial source list uses an old CGST "bill" page and a 1 June 2019 update as current authority. | India Code publishes a consolidated CGST Act current through 11 June 2026, including Finance Act 2026 amendments. | Replace the bill page as the canonical GST Act source. Keep the 2019 update only as explanatory history. |
| Medium | The initial tutorial candidates are presented together without an approval result. | Several are generic indexes or still describe Assessment Year/Income-tax Act, 1961 flows. The official transition FAQ says the new return forms for Tax Year 2026-27 have not yet been notified. | Ship no return-form name and no return-filing tutorial until the Tax Year 2026-27 form and portal flow are available and manually reviewed. Keep tutorial approval separate from statutory approval. |

## Rules safe to implement

| Rule | Verified result | Authority |
| --- | --- | --- |
| Period | Tax Year 2026-27 is 1 April 2026 through 31 March 2027. | Income-tax Act, 2025, section 3 in the [Act as amended by Finance Act, 2026](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf). |
| IT/software profession | "Information technology" is a specified profession. A resident individual can use the section 58 professional presumptive rule when its conditions hold. | [Section 62(4)](https://www.incometaxindia.gov.in/w/section-62-134) and [section 58](https://www.incometaxindia.gov.in/w/section-58-138). |
| Presumptive receipts | Limit is ₹50 lakh, increased to ₹75 lakh when cash receipts do not exceed 5% of gross receipts. Non-account-payee cheques and drafts count as cash. | Section 58(2), Table serial 3, and section 58(9) in the [amended Act](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf). |
| Presumptive profit | Use 50% of gross receipts or profit actually earned, whichever is higher. No further loss, allowance, or deduction is allowed against that presumptive income. | Section 58(2), Table serial 3, and section 58(4) in the [amended Act](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf). |
| New-regime slabs | Nil to ₹4 lakh; then 5%, 10%, 15%, 20%, 25%, and 30% across the bands stated in `SPEC.md`. | Section 202 and the [Finance Bill 2026 explanatory memorandum](https://www.incometaxindia.gov.in/documents/81799/11848482/memo-2026.pdf/fe530cfa-9c49-fc5c-4bfa-fc96fd5e7b7a), which confirms no change for Tax Year 2026-27. |
| Rebate and marginal relief | For a resident individual under section 202, income up to ₹12 lakh receives the lower of tax or ₹60,000. Above ₹12 lakh, rebate marginal relief limits income tax to the excess income where the statutory comparison applies. | [Section 156](https://wmstatic-prd.incometaxindia.gov.in/documents/20117/42998/Section-156_2026-04-01_05-11-58_344893_en.pdf/415b0f0e-8826-feaa-b374-481e54d4b98e) and the [amended Act](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf). |
| Cess | Health and Education Cess is 4% for Tax Year 2026-27. | [Finance Act, 2026](https://www.incometaxindia.gov.in/documents/d/guest/finance-act-2026-pdf-1), Act 4 of 2026, assented 30 March 2026. |
| Rounding | Total income and any payable/refundable amount are rounded to the nearest ₹10 after ignoring paise; a last digit of 5 or more rounds up. | Income-tax Act, 2025, section 516 in the [amended Act](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf). |
| Advance-tax threshold | Advance tax is payable when the amount computed under the advance-tax Part is ₹10,000 or more. Computation subtracts qualifying tax deductible/collectible at source. | [Section 404](https://www.incometaxindia.gov.in/w/section-404-5) and sections 405-406 in the [amended Act](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf). |
| Presumptive advance-tax date | Section 58 presumptive taxpayers pay the whole amount on or before 15 March: 15 March 2027 for this period. Payments through 31 March are still treated as advance tax; interest can apply to shortfall/default. | Section 408(2)-(3), sections 424-425 in the [amended Act](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf), and the official [Tax Payments FAQ](https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/tax-payments-faq). |
| Return date | A non-audit assessee with business/profession income has a normal due date of 31 August in the succeeding financial year: 31 August 2027. | Section 263(1)(c), as substituted by Finance Act 2026, in the [amended Act](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf) and the [Finance Bill 2026 memorandum](https://www.incometaxindia.gov.in/documents/81799/11848482/memo-2026.pdf/fe530cfa-9c49-fc5c-4bfa-fc96fd5e7b7a). |
| GST aggregate turnover | All-India, same-PAN taxable, exempt, export, and inter-State supplies are included; GST and inward reverse-charge supplies are excluded. | CGST Act section 2(6) in the [India Code consolidation as on 11 June 2026](https://www.indiacode.nic.in/indiacode/bitstream/123456789/15689/1/A2017-12.pdf). |
| GST service thresholds | Liability under the turnover rule arises above ₹10 lakh in Manipur, Mizoram, Nagaland, and Tripura, and above ₹20 lakh elsewhere. The ₹40 lakh enhancement is for exclusive suppliers of goods, not this service profile. | CGST Act section 22 and its explanation in the [India Code consolidation](https://www.indiacode.nic.in/indiacode/bitstream/123456789/15689/1/A2017-12.pdf). The four-state result follows from the Act's exclusions from the constitutional special-category list. |
| Inter-State services | A direct Indian client in another state does not by itself destroy the threshold exemption: Notification 10/2017 exempts inter-State taxable service suppliers from registration up to the section 22 threshold. Other section 24 or notified compulsory-registration facts still matter. | [Notification 10/2017-Integrated Tax](https://cbic-gst.gov.in/hindi/pdf/integrated-tax/10_2017_IT.pdf) dated 13 October 2017, read with CGST sections 23-24. |

## Due-date extensions

No official order, circular, or notification was located that extends 15 March 2027 or 31 August 2027 as of 29 August 2026. Both are future dates, so this is not evidence that no extension will later be issued.

Initialize both obligations with `operative_due_date: null`. Recheck the Income Tax Department circulars, notifications, portal news, the enacted law, and the relevant tutorial shortly before public release and again near each deadline. If an extension appears, retain the normal date, add the operative date, and cite the extension instrument. A portal banner or search snippet alone is insufficient.

## Initial statutory URL audit

| SPEC source | Result and action |
| --- | --- |
| Income-tax Act, 2025 as amended by Finance Act, 2026 | Approve as the canonical Income-tax consolidation. |
| Sections 58, 62, 156, and 404 | Content matches the consolidation. They may remain as convenience links, with the amended Act as fallback. |
| Section 408 URL ending `section-408-5` | Do not rely on this brittle page slug. The currently indexed section page uses a different slug. Cite section 408 in the amended Act, which contains the complete rule. |
| `Documents/Act/Income-tax-Act-2025.pdf` for section 516 | Official but not the Finance Act 2026 consolidation. Replace it with the amended Act URL; section 516 itself is unchanged. |
| Budget 2026 FAQ for slabs/rebate | Official explanatory material, not the controlling provisions. Register sections 202 and 156 as statutory authorities and keep the FAQ only as explanation/examples. |
| Whole amended Act for section 263 | Legally sufficient. Add section 263 to `covered_rule_identities` and optionally retain the current section-specific PDF for easier review. |
| CBIC `CGST-bill-e.html` | Replace. It exposes original-era text and is not a reliable current consolidation. Use the India Code Act current to 11 June 2026. |
| `01062019-GST-An-Update.pdf` | The threshold summary remains consistent, but it is dated 1 June 2019. Keep only as official explanatory history, never as sole current authority. |

The Income Tax Department content is readable in a normal browser/search fetch but returned bot-protection HTTP 403 to command-line checks during this review. Do not make deployment or rule validation depend on live HTTP success from those hosts. Perform the required release check in a browser and record the human review date.

## Tutorial candidate review

| Candidate | Decision on 29 August 2026 | Reason/action |
| --- | --- | --- |
| [How to Generate Challan Form](https://www.incometax.gov.in/iec/foportal/help/generate-challan-form) | Provisional; not yet approve for Tax Year 2026-27 | Official and detailed, but the visible instructions still say to select an Assessment Year and retain Income-tax Act, 1961 references. The transition FAQ says Tax Year 2026-27 applies to April 2026-March 2027 payments. Re-review after the manual explicitly matches the new portal flow. |
| [Working with Payments](https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/working-with-payments) | Reject as primary tutorial | It is an index of manuals, FAQs, and videos, not an action-specific tutorial. It can remain a fallback hub. |
| [Identification and Generation of Applicable ITR](https://www.incometax.gov.in/iec/foportal/help/identification-and-generation-of-applicable-itr-individual) | Defer | The generic wizard manual is usable, but the official [transition FAQ](https://www.incometaxindia.gov.in/documents/81799/11848482/Updated-FQAs-on-Interplay%26Transitions.pdf/e10ad2b6-9495-de90-58d3-20606d8954ae) says Tax Year 2026-27 return forms are not yet notified. Re-review when forms and the 2027 portal flow exist. |
| [File Income Tax Return](https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/file-income-tax-return) | Reject as primary tutorial for now | It is a sparse help-center page, not a complete filing tutorial, and currently points to Income-tax Act, 1961 material. Replace with a period-specific official manual when published. |
| [GST Knowledge Portal](https://www.gst.gov.in/help/helpmodules/) | Approve only as an official starting link | It is safe for "start GST registration research," but it is a broad hub. Prefer the more specific [Register with GST](https://www.gst.gov.in/help/enrollmentwithgst) page or its normal-taxpayer user manual after manual review. |

All five candidate domains are official and the checked URLs contain no profile data. The linked government transactions can require PAN, mobile number, OTP, or other identifiers on the government portal. My Next Filing must neither collect nor append them. Record publisher `Income Tax Department` or `Goods and Services Tax`, approval status, and human review date in the registry. Do not infer freshness from the portal's dynamic "current time" footer.

## Implementation gate

Income-tax implementation can proceed with the verified values above. GST implementation must remain blocked on the bank-interest/aggregate-turnover decision. Before release, re-run this review for Finance Act or Rules changes, extensions, GST amendments/notifications, form availability, URL behavior, and every approved tutorial.
