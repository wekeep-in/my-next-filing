# Domestic rental income authority and scope

Reviewed 8 September 2026 for Tax Year 2026-27. This is the bounded addition authorized by the user, alongside the existing resident-individual, new-regime, presumptive-practice profile.

## Income tax

The controlling [Income-tax Act, 2025 as amended by Finance Act, 2026](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf) was read through the browser's PDF extraction. Its base enactment received assent on 21 August 2025 and commenced on 1 April 2026. A direct shell download returned 403; the browser provided the full amended text. No old assessment-year ITR FAQ establishes this slice.

| Provision | Effect and implementation |
| --- | --- |
| 20 | Owned buildings and appurtenant land are taxed under house property; business-occupied portions are excluded. This slice requires passive residential letting, separate from the supported practice. |
| 21(1)–(4) | Annual value normally considers expected rent and actual rent received or receivable. Vacancy and unrealised rent have separate conditions. Qualifying local-authority taxes actually paid by the owner reduce annual value. Accept an already resolved annual value before those taxes, not bank credits or an already net taxable amount. |
| 22(1)(a) | Deduct 30% of annual value after section 21 municipal taxes. The local rule stores 0.3 and rejects a different value. |
| 22(1)(b), (c), (6) | Interest on borrowing for acquisition, construction, repair, renewal or reconstruction is considered separately. Pre-acquisition/construction interest has instalment rules and foreign-payable interest has withholding conditions. This slice accepts only resolved eligible current-year interest on a completed let property, payable in India and not deducted elsewhere. It excludes principal/EMI totals and pre-construction instalments. |
| 21(6)–(7), 202(2)(a)(v) | Self-occupied treatment has a different new-regime deduction boundary. This slice does not calculate that branch or deemed-let-out property. |
| 23–25 | Arrears, recovered rent, co-ownership and deemed ownership have separate rules. They remain excluded. |
| 202(2)(b)(ii), (3) | House-property loss cannot offset another income head in this regime. The slice stops for a negative property result and makes no carry-forward promise. It never clamps loss to zero and calls the whole profile covered. Municipal taxes above annual value are rejected as outside the supported non-negative input relationship. |
| 122, 124 | Include non-negative taxable property income in ordinary gross income before the existing employer NPS deduction cap. The per-employer contribution rules stay unchanged. |
| 156, 202, 263 | Combined taxable income controls the existing slab/rebate/relief and income ceiling; the filing income test remains before Chapter VIII deductions. No return-form eligibility is inferred. |
| 405, 408(2) | The presumptive taxpayer pays advance tax on current income, not only practice profit, on the existing 15 March schedule. Rental income and its actual Indian TDS enter that combined calculation once. |

The additional August 2026 enactment identified in the existing equity research concerns schedules and corporate surcharge. It is not used as rental authority. Targeted current official-source searches did not identify a later replacement of the rental provisions above; absence of search results is not itself evidence for a rule.

## GST

- [Notification 12/2017–Central Tax (Rate)](https://cbic-gst.gov.in/hindi/pdf/central-tax-rate/Notification12-CGST.pdf), issued 28 June 2017, entry 12: residential dwelling for use as residence. The original English PDF was opened and read despite its `/hindi/` URL path.
- [Notification 04/2022–Central Tax (Rate)](https://cbic-gst.gov.in/pdf/central-tax-rate/04_2022-ctr-eng.pdf), issued 13 July 2022, effective 18 July 2022: inserts the registered-tenant exclusion in entry 12. These two primary sources establish the unregistered-tenant branch used here and are required provenance in both GST registration and GST calendar groups.
- [Notification 15/2022–Central Tax (Rate)](https://cbic-gst.gov.in/pdf/central-tax-rate/15_2022-ctr-eng.pdf), issued 30 December 2022, effective 1 January 2023: explains exemption for a registered proprietor renting personally for their own residence on their own account. The official PDF was downloaded and read using pypdf after the browser could not open it. It is evidence for why this version must not call every registered-tenant arrangement taxable. This first slice deliberately leaves those arrangements for separate GST review.
- [CGST Act, section 2(6)](https://cbic-gst.gov.in/hindi/CGST-bill-e.html), Act dated 12 April 2017: aggregate turnover includes exempt supplies. The original CBIC Act text was read for this definition, corroborating the existing India Code source. The existing India Code download endpoint timed out during this review. No unrelated original 2017 threshold or registration exception is adopted from the old HTML.

For established GST coverage require the dwelling and rental supply to be in the same state/UT as the practice/registration, residential use, and every tenant unregistered throughout the letting. The location restriction is a product boundary which avoids inferring another place of supply or registration. A No/Not sure preserves core income-tax arithmetic, annual-return actions and independent LUT guidance, while withholding GST registration/return conclusions and dates. No GST payable, input-tax credit or tenant reverse-charge amount is calculated.

Rent's GST supply value stays in independently declared aggregate turnover, including exempt rent. It is not the income-tax annual value or net taxable property income. Existing quarter elections remain portal-confirmed; adding a property does not infer QRMP eligibility from tax income.

## Independent numerical checks

1. Annual value ₹3,00,000; municipal taxes ₹20,000; net annual value ₹2,80,000; 30% deduction ₹84,000; interest ₹1,00,000; taxable property income ₹96,000. With practice profit ₹14,00,000, bank interest ₹10,000 and TDS ₹40,000, total income is ₹15,06,000; slab tax ₹1,05,900; cess ₹4,236; rounded balance ₹70,140.
2. The same property plus salary ₹10,00,000 less standard deduction ₹75,000, employer NPS ₹70,000, dividends ₹30,000, ST gains ₹1,00,000 and LT gains ₹2,00,000 gives ordinary income ₹23,91,000 and combined income ₹26,91,000. Slab tax ₹2,97,750; equity taxes ₹20,000 and ₹9,375; cess ₹13,085; gross tax ₹3,40,210; after ₹40,000 TDS, balance ₹3,00,210.
3. Annual value ₹100 with no taxes and interest ₹70 gives zero property income. ₹71 interest stops the estimate. Annual value ₹101 with no deductions except the standard deduction gives ₹70.70 property income; intermediate decimals are preserved until combined rounding.
4. At ordinary combined income ₹12,00,000 the existing rebate eliminates ordinary slab tax. At ₹12,00,010 marginal relief is ₹59,991.50 and the rounded remaining tax is ₹10 with no credits.

## Storage and review

Writer outputs for workspace 8 and Recovery 7 were captured before application edits. Workspace migration preserves consent, revision, amounts and completions; only previously excluded property income becomes an absent branch. Legacy property/deduction/unknown stop facts remain. Recovery migration adds unanswered rental fields. Neither migration writes until the existing normal write path runs.

The UX interaction contract is: the freelancer can include one resolved rental property in the combined plan, revise it, and save it in the same browser; GST uncertainty changes only its supported GST conclusions. The form uses existing choice, money, help-modal and section components. It collects no address, tenant name, GSTIN, loan identifier or documents.

Final compliance review: no S0–S2 findings against the bounded implementation. Statutory arithmetic remains in Evaluation, the deduction rate and evidence are required local Rules, and independent GST evidence failure withholds only GST. Existing broader public-release GST extension inventory limitations remain outside this change. Verification results are recorded in the implementation issue.
