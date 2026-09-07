# GST calendar and LUT authority refresh

Reviewed 7 September 2026 for the existing FY 2026-27 calendar. This supersedes the 6 September review's 30 September maintenance deadline, not its statutory scope. No normal date, eligibility threshold, amount calculation, completion identity or browser schema changes.

## Review window

Set both independently validated groups' `verifiedOn` to 2026-09-07 and `expiresOn` to 2026-10-31. Update the seven statutory source review dates and the dataset identity to v9. The 54-day window is a product maintenance decision for the existing normal-schedule calendar, bounded to less than two months; it is not a legislative sunset or evidence about notifications issued after this review. Recheck before publication, before the next expiry, or immediately when an applicable amendment/extension is identified. Do not automatically roll the dates forward.

Continue presenting normal dates subject to official extensions. The current central listing was obtained this time, but exhaustive state/UT extension coverage remains an open release item. No operative override is inferred from a missing search result, a newsletter, or a listing title. No year-long expiry is inherited from income-tax Rules.

## Authorities re-read

| Authority and issue date | Relevant provisions verified | Result |
| --- | --- | --- |
| [Notification 82/2020-CT, 10 November 2020](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-82-central-tax-english-2020.pdf) | Paragraph 5, Rule 61 from 1 January 2021; PDF pages 4–5 | Monthly GSTR-3B 20th; quarterly 22nd/24th by the existing state table; first-two-month PMT-06 25th; partial periods included. |
| [Notification 83/2020-CT, 10 November 2020](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-83-central-tax-english-2020.pdf) | Continuing GSTR-1 dates from 1 January 2021 | Monthly 11th, quarterly 13th; unchanged. |
| [Notification 84/2020-CT, 10 November 2020](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-84-central-tax-english-2020.pdf) | QRMP eligibility and loss of eligibility | Prior-year turnover up to ₹5 crore; election required; crossing during a quarter ends eligibility from the succeeding quarter. |
| [Circular 143/13/2020-GST, 10 November 2020](https://gstcouncil.gov.in/sites/default/files/2024-06/circular_refund_143_11_2020.pdf) | Paragraphs 4–6 | Election windows and new registrations; optional IFF; conditional payment review rather than an unconditional payment obligation. |
| [Notification 37/2017-CT, 4 October 2017](https://gstcouncil.gov.in/sites/default/files/2024-04/notfctn-37-central-tax-english.pdf) | Clauses i–iii | Prosecution exclusion where tax evaded exceeds ₹250 lakh; financial-year LUT; withdrawal/restoration conditions. |
| [Circular 8/8/2017-GST, 4 October 2017](https://cbic-gst.gov.in/pdf/Final_Master_circular_LUT_Bond_04102017.pdf) | Paragraph 2b | Financial-year validity. Superseded procedural paragraphs are not relied on. |
| [Circular 125/44/2019-GST, 18 November 2019](https://cbic-gst.gov.in/pdf/circular-cgst-125.pdf) | Paragraphs 44 and 46 | Before-export furnishing; case-specific late-furnishing condonation; prosecution boundary. No automatic regularisation. |

Also read the active [Rule 61](https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/rules/cgst_rules/active/chapter8/rule61_v1.00.html) and [Rule 96A](https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/rules/cgst_rules/active/chapter10/rule96a_v1.00.html) HTML. Rule 61 matches the normal schedule and state groups. Rule 96A retains prior-to-export furnishing and shows the 10 July 2024 amendment to the service-realisation provision and GSTR-1A references. This calendar does not compute invoice-level realisation deadlines. [Notification 12/2024-CT, 10 July 2024](https://gstcouncil.gov.in/sites/default/files/2024-09/central-tax-12-2024-11072024.pdf) supplies the direct amendment. [Circular 40/14/2018, 6 April 2018](https://cbic-gst.gov.in/pdf/circularno-40-cgst.pdf) confirms that older physical-filing instructions in Circular 8 are superseded. The current [GST Portal GSTR-3B FAQ](https://tutorial.gst.gov.in/userguide/returns/GSTR3B.htm), publication date unstated, corroborates the normal dates, possible extensions and nil-business filing.

## Current notification inventory and access

The [GST Council index](https://gstcouncil.gov.in/cgst-tax-notification) still exposes entries only through 11/2025. The browser fetch of CBIC's tax portal returned timeouts/502. Direct read-only retrieval succeeded after disabling certificate verification for that public-source request because the environment could not verify the issuer chain. This does not change application TLS, fetch behavior or security settings. No Profile data or credentials were sent. Rule HTML and Circular 8 were read through that route and checked against the separately accessible official PDFs.

The public site's own JavaScript identifies the read-only notification listing at `https://taxinformation.cbic.gov.in/api/cbic-tax-msts/content-dtls-year`. A POST with `{"taxId":1000001,"contentType":"NOTIFICATIONS","contentId":"","year":"2026"}` returned five entries. `CIRCULARS` with the same tax/year returned two. These are listing queries, not mutations. The public latest-update endpoint is [CBIC GST updates](https://taxinformation.cbic.gov.in/api/cbic-notification-msts/fetchUpdatesByTaxId/1000001).

| 2026 listing entry | Subject | Effect on this calendar |
| --- | --- | --- |
| 01/2026-Central Tax, 21 April 2026 | March 2026 monthly GSTR-3B extended to 21 April | Prior financial-year return period; excluded from the April 2026-onward calendar. |
| 02/2026-Central Tax | GST Appellate Tribunal jurisdiction | No normal return/LUT date change. |
| 01/2026-Central Tax (Rate), Integrated Tax (Rate), Union Territory Tax (Rate) | Tariff alignment with Finance Act 2026 and corrigenda | No normal return/LUT date change in the listed subjects. |
| 255/01/2026-GST | Jurisdiction on migration/transfer | Outside the supported continuous one-registration history. |
| 256/02/2026-GST | Departmental appeals in common-adjudication cases | Outside this calendar. |

The 2025 notification query returned 90 entries across notification categories. Its central-tax entries include prior-period date extensions and amendments, rather than an April 2026-onward normal-date replacement. Current consolidated Rule 61 supplies the operative continuing normal rule. Listing titles identify what to inspect; they are not standalone statutory provenance for any changed date.

The [direct CBIC Notification 01/2026 PDF response](https://taxinformation.cbic.gov.in/content/pdf/tax_repository/gst/notifications/gst-ct-01-2026.pdf) returns a JSON object with a base64 `data` field and filename. Decoded and read the PDF: issued 21 April 2026, effective 20 April, extending only the March 2026 monthly GSTR-3B return to 21 April. No override belongs in this calendar.

The [West Bengal state index](https://comtax.wb.gov.in/GST/GST_Notifications/gst_notifications_state.html) contains 2026 entries through July; its March-2026 return extension is also outside this calendar. The [Meghalaya March-2026 extension entry](https://www.meghalaya.gov.in/circulars/content/50800) was indexed but failed direct web opening. These checks do not establish complete coverage of every state/UT. Keep the earlier release requirement for an exhaustive extension inventory open.

## Compliance result

No findings in the re-reviewed normal schedule, eligibility or before-export LUT logic. All seven statutory source URLs remain HTTPS and their source issue dates are preserved. The narrow source-review refresh does not change arithmetic or government deadlines. Existing missing/invalid/stale group guards remain in force.

S1, release evidence limitation: exhaustive state/UT extension coverage is not established. This review supports continued use of the explicitly qualified normal schedule for the bounded maintenance window, not a claim that every operative deadline is verified. Resolve the extension inventory before public release. No override or unconditional full-coverage claim was added.

## Verification

Formatting, lint, TypeScript, current-date Rules validation, all 159 unit tests and production build passed. The calendar and Resources expiry cases move to 31 October/1 November. A new regression covers continued GST/LUT availability on 1 October, expiry at India midnight after 31 October, unchanged dates/tax, and retention of saved completions. Existing tests retain independent stale-group and missing-provenance coverage. See the [implementation issue](../issues/03-authority-refresh.md).
