# Surcharge and registered-proprietor rental exemption

Reviewed 8 September 2026 for Tax Year 2026-27. These are two bounded additions to the existing resident-individual, new-regime, non-audit presumptive-practice scope.

## First ordinary-income surcharge band

Controlling source: [Finance Act, 2026](https://www.incometaxindia.gov.in/documents/d/guest/finance-act-2026-pdf-1), Act 4 of 2026, assented 30 March 2026; section 3 applies under the Income-tax Act, 2025 from 1 April 2026. The enacted PDF was opened and its tax, advance-tax, marginal-relief and cess provisions read. The 1961-Act/Assessment-Year tables and the Budget memorandum were not substituted for this authority.

- Section 3(4)(b), table row 10: section-202 individual income above ₹50 lakh and not above ₹1 crore has a 10% surcharge. The parallel advance-tax provision is section 3(12)(b), row 10.
- Sections 3(5) and 3(13), each table row 6: income tax plus surcharge is capped at the amount payable at the threshold plus the income exceeding it. These are the enacted `Tn = Rn + Sn` and `Ta = Ra + Sa` limits. For this ordinary-only first band, the comparison at ₹50 lakh is the existing ordinary slab tax, ₹10,80,000, without surcharge. The implementation calls the same slab function rather than storing that computed amount as a separate rule.
- Sections 3(15)–(16): 4% cess is applied to income tax plus surcharge after marginal relief. Actual Indian TDS, TCS and advance payments are then applied by the existing calculation.
- The current local section-202 slabs and ₹10 income/tax rounding remain unchanged. Combined taxable income after employer NPS controls the band; the annual-return income test stays before NPS.

The source permits surcharge on equity components too, but this slice does not implement a mixed-rate threshold comparison. Where positive equity gains remain after current-year loss adjustment, the product retains its ₹50 lakh ceiling. Even gains within the long-term tax threshold count for this boundary. Fully offset gains and pure capital losses leave no positive gain component and may use the ordinary-income band. This is a product limitation, not denial of statutory marginal relief.

The existing ₹1 crore band endpoint becomes the product ceiling for ordinary income; later surcharge bands remain excluded. Receipt limits, presumptive profit floors, audit/transfer-pricing restrictions, foreign income, disputed credits, other regimes and unsupported deductions remain unchanged. The existing return-form selection stays unavailable, with a general prompt to confirm current higher-income disclosures. No asset/liability schedule period or positive return-form eligibility is inferred.

### Independent arithmetic

All examples below have no credits or advance tax unless stated. Amounts are rupees.

| Rounded ordinary income | Income tax | Surcharge before relief | Surcharge marginal relief | Net surcharge | Final tax including cess |
| --- | ---: | ---: | ---: | ---: | ---: |
| 50,00,000 | 10,80,000 | 0 | 0 | 0 | 11,23,200 |
| 50,00,010 | 10,80,003 | 1,08,000.30 | 1,07,993.30 | 7 | 11,23,210 |
| 51,00,000 | 11,10,000 | 1,11,000 | 41,000 | 70,000 | 12,27,200 |
| 51,61,190 | 11,28,357 | 1,12,835.70 | 2.70 | 1,12,833 | 12,90,840 |
| 51,61,200 | 11,28,360 | 1,12,836 | 0 | 1,12,836 | 12,90,840 |
| 52,00,000 | 11,40,000 | 1,14,000 | 0 | 1,14,000 | 13,04,160 |
| 60,00,000 | 13,80,000 | 1,38,000 | 0 | 1,38,000 | 15,78,720 |
| 1,00,00,000 | 25,80,000 | 2,58,000 | 0 | 2,58,000 | 29,51,520 |

At ₹51 lakh, the pre-cess limit is ₹10,80,000 + ₹1,00,000 = ₹11,80,000; cess is ₹47,200. The marginal-relief endpoint is computed, never hard-coded. Tests include whole-income rounding on both sides of ₹50 lakh and ₹1 crore and adjacent ₹10 steps where relief ends.

At ₹60 lakh, ₹10 lakh TDS, ₹1 lakh TCS and ₹3 lakh advance tax leave ₹1,78,720 payable; changing advance tax to ₹7 lakh instead yields an estimated ₹2,21,280 refund. A combination of ₹30 lakh professional profit, ₹20 lakh salary after its standard deduction, ₹2.10 lakh rental income and ₹30,000 dividends, less ₹1.40 lakh employer NPS, yields ₹51 lakh taxable income and ₹12,27,200 before credits.

## Registered-proprietor residential rent

Controlling source: [Notification 15/2022–Central Tax (Rate)](https://cbic-gst.gov.in/pdf/central-tax-rate/15_2022-ctr-eng.pdf), issued 30 December 2022 and effective 1 January 2023. It adds an explanation to entry 12 of [Notification 12/2017](https://cbic-gst.gov.in/hindi/pdf/central-tax-rate/Notification12-CGST.pdf), following the registered-tenant exclusion in [Notification 04/2022](https://cbic-gst.gov.in/pdf/central-tax-rate/04_2022-ctr-eng.pdf). The official 15/2022 PDF was previously downloaded and read in the rental slice; its complete text remains in `artifacts/rental-research/rent-15-2022.pdf` and the primary publication was checked again for this expansion.

The exemption covers a GST-registered proprietor renting in a personal capacity for their own residence, on their own account and not the proprietorship concern's account. The UI explains this as acting on their own behalf rather than for their business; it does not classify the lease from a bank account number or GST number alone. Company leases, business-capacity renting and unresolved conditions remain outside this branch.

The existing confirmation now accepts either an unregistered tenant or that narrowly defined registered proprietor throughout the letting. Same-state dwelling/supply, residential use and the core house-property income conditions remain. No GST tax or ITC is computed. Exempt rental supply value still belongs in separately declared aggregate turnover; income-tax annual value and net property income are not copied into it.

The new exemption provenance is independently required for GST registration and registered-calendar groups. Missing or stale GST evidence withholds that area and dates while leaving supported income tax and annual-return conclusions intact. A previous Yes remains within the widened condition; a previous No/Not sure stays unchanged until explicit review.

## Persistence and verification

No Profile fields or money inputs changed, so workspace version 10 and Recovery version 9 remain. No new fixture version, storage key, migration, inferred confirmation or automatic clearing of `surchargeCase` is introduced. Existing historical workspace and Recovery tests stay reachable. The old blanket ₹50 lakh ordinary-income stop assertions move to ₹1 crore; equity boundary tests stay at ₹50 lakh.

See [implementation](../issues/01-implementation.md) for final checks and screenshots. This review does not broaden regular-books, audit, mixed-rate surcharge or later-band support.

## Final compliance review

No findings against the bounded implementation. Independent calculations, rounding boundaries, credits, scope exclusions, source validation and independent GST failure behavior pass. The release run passed 287 Vitest tests and 146 Playwright cases with one existing video skip; final presentation checks also passed.
