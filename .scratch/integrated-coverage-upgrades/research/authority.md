# Four upgrades to existing facts

Reviewed 8 September 2026 for the supported resident-individual, new-regime, non-audit presumptive practice in Tax Year 2026-27. The user authorized implementation of all four numbered slices. Gifts, rollover, regular books, other regimes and foreign-tax credit are separate work.

## Primary authority and applicability

- [Income-tax Act, 2025, amended by Finance Act 2026](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf): Act 30 of 2025, assented 21 August 2025, effective 1 April 2026, consolidated with the 30 March 2026 amendments. Section 24 separately assesses definite, ascertainable co-owner shares; sections 20–22 govern annual value and deductions. Sections 111 and 121 govern capital-loss set-off, carry-forward and timely loss returns. Section 536(2)(m), including the capital-gains row referring to old section 74, preserves prior-Act loss eligibility and the original remaining period. Sections 196 and 198 govern the supported 20% short-term and 12.5% long-term gains, unused basic exemption and the ₹1,25,000 annual long-term threshold. No statutory rate changes in this implementation.
- [Finance Act, 2026](https://www.incometaxindia.gov.in/documents/d/guest/finance-act-2026-pdf-1): assented 30 March 2026. Section 3(4)(b) row 10 / advance-tax parallel 3(12)(b) cover 10% surcharge above ₹50 lakh through ₹1 crore; 3(5) / 3(13) cap tax plus surcharge using tax at the threshold plus excess income. Sections 3(15)–(16) apply 4% cess after surcharge relief. These provisions cover supported equity components as well as ordinary income.
- [CGST Act](https://cbic-gst.gov.in/hindi/CGST-bill-e.html): Act 12 of 2017, assented 12 April 2017. Section 24(iii) provides compulsory registration for persons required to pay reverse-charge tax; section 25 provides the 30-day application window. Sections 2(82) and 49 distinguish output tax from recipient reverse charge and cash payment; section 16 makes input credit conditional. This implementation starts from an explicitly confirmed duty. It does not infer an import, supplier location, service classification, tax rate, liability amount or credit eligibility from a provider brand or an invoice without GST.

The existing source review for [residential-rental GST](../../surcharge-and-rental-gst/research/authority.md) still applies. Co-ownership adds an explicit condition that the user's rental share is their own GST supply under their PAN/registration, rather than a separate entity. No ruling about an association of co-owners is inferred.

## Official computation evidence for equity

The Department's [current Downloads page](https://www.incometax.gov.in/iec/foportal/downloads) lists the [AY 2026-27 ITR-3 Excel utility v1.3](https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-08/ITR3_AY_26-27_V1.3.zip), released **1 September 2026**. The downloaded workbook `ITR3_AY_26-27_V1.3.xlsm` has SHA-256 `adab9047975fdcddde4b8cd6c7122a463d90b8bfed7fc60cca4d0aa6ee53e8e3`. Its ZIP XML was inspected statically; no VBA was executed. Local evidence is in `artifacts/integrated-upgrades/`, including the original ZIP, workbook, extracted sheets and inspection script.

The [ITR-3 validation rules v1.0](https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-06/CBDT_e-filing_ITR-3_Validation%20Rules_V1.0_AY%2026-27.pdf), issued 18 June 2026, do not alone establish every allocation. The workbook formulas supply the missing computation evidence. Earlier return instructions can explain the comparison method but are not authority for current rates.

### Mixed basic exemption

In `SPI - SI - IF`, U19 selects ₹4,00,000 for the new regime, U22 subtracts special-rate income from total income, and U38 finds unused basic exemption. U52/W52 apply it to G21 (111A at 20%) first. After rows for unsupported pass-through/other instruments, U59/W59 apply the remainder to G28 (112A). H21=U52 and H28=U59; I28 then applies the ₹1,25,000 annual threshold. For this application's two supported categories, this establishes short-term first, then long-term.

The utility uses the earlier Act's section numbers. The implementation uses current sections 196/198 and local current rates, not an AY 2026-27 return form for Tax Year 2026-27. Combined income is rounded once as before; loss set-off precedes the allocation.

| Ordinary income | Net ST gains | Net LT gains | Exemption to ST / LT | Final tax with cess, no credits |
| ---: | ---: | ---: | ---: | ---: |
| 3,00,000 | 1,00,000 | 2,00,000 | 1,00,000 / 0 | 9,750 |
| 3,00,000 | 50,000 | 3,00,000 | 50,000 / 50,000 | 16,250 |
| 0 | 3,00,000 | 3,00,000 | 3,00,000 / 1,00,000 | 9,750 |
| 1,00,000 | 2,50,000 | 2,00,000 | 2,50,000 / 50,000 | 3,250 |

### Mixed surcharge comparison

`Tax Calculated` rows 292–310 reserve basic-exemption allocations in E294:E298, split ordinary income into slab bands in G295:H297, combine special-rate buckets in E300:O300, and consume threshold income from lower to higher rates in rows 301–303. The implementation follows that rate ordering for its supported subset: reserve zero-tax equity portions, split ordinary income into actual marginal slabs, merge the 20% and 12.5% portions, then fill ₹50 lakh in increasing rate order.

This is a reconstruction using current law, not a verbatim copy of the utility. Its generic partial-LTCG branch covers additional instruments and does not safely preserve the section-198 annual threshold for every narrow case. The implementation explicitly retains that threshold in the zero-tax portion. For an LT-only excess over ₹50 lakh, the comparison must remain `(50,00,000 − 4,00,000 − 1,25,000) × 12.5% = 5,59,375`; omitting the annual threshold would incorrectly produce ₹5,75,000. The statutory allowance and workbook ordering jointly establish the bounded calculation.

| Ordinary | Net ST | Net LT | Tax at ₹50 lakh comparison | Final tax with cess, no credits |
| ---: | ---: | ---: | ---: | ---: |
| 60,00,000 | 100 | 0 | 10,79,990 | 15,78,740 |
| 60,00,000 | 0 | 100 | 10,79,970 | 15,78,720 |
| 49,00,000 | 1,00,010 | 0 | 10,69,999 | 11,12,810 |
| 3,00,000 | 0 | 47,00,010 | 5,59,375 | 5,81,760 |
| 30,00,000 | 0 | 20,00,010 | 7,14,373.25 | 7,42,960 |
| 10,00,000 | 0 | 40,00,010 | 5,24,375 | 5,45,360 |
| 0 | 50,00,010 | 0 | 9,20,000 | 9,56,810 |

For the ₹49 lakh ordinary / ₹1,00,010 ST case, pre-surcharge tax is ₹10,70,002; the pre-cess cap is ₹10,69,999 + ₹10 = ₹10,70,009, leaving ₹7 surcharge. Rates, rounding, credit application and the ₹1 crore ceiling remain local and expiry-bound.

## Co-owned property

No ownership percentage is multiplied by raw whole-property amounts. The existing confirmation is widened to one documented, definite share; annual value, municipal-tax deduction and interest are already user-attributable tax-record values. Loan liability and interest entitlement are separately described and must not be inferred from ownership percentage. This avoids double apportionment and an unsupported loan-interest assumption.

A user-attributable annual value ₹3,00,000, municipal-tax deduction ₹20,000 and eligible interest ₹1,00,000 produces `(3,00,000 − 20,000) × 70% − 1,00,000 = ₹96,000`. The same arithmetic applies whether that is a whole property or the user's established share. Negative property results, multiple taxable properties, disputed ownership and unresolved GST supply identity remain outside their respective boundaries.

## Earlier capital losses

Accept 1–8 unique originating financial years, balances remaining after prior use/adjustment, and explicit confirmation of timely filed, determined, eligible losses from the supported domestic equity instruments. In Tax Year 2026-27, origins 2018–2025 are eligible. A 2018 loss's eighth succeeding year is 2026-27; transition to the new Act does not restart it. Expired entered balances stop calculation for review rather than disappearing silently. Condoned, disputed and unsupported-instrument losses remain excluded.

Apply current-year losses first. Then process years oldest first; within a year LT offsets LT only, then ST offsets ST and any remaining LT. Earlier losses cannot reduce ordinary income and are used before the annual LT threshold. Earlier unused balances retain their original final year and do not create a new current-year loss or fresh carry-forward period.

Independent example: current ST 2,00,000 less ST loss 50,000 and LT 3,00,000 less LT loss 75,000 leave ST 1,50,000 / LT 2,25,000. An origin-2018 ST balance 1,00,000 and LT 25,000 are fully used. Origin-2020 ST 1,00,000 / LT 2,50,000 then use ST 50,000 / LT 2,00,000, leaving 50,000 in each category with final year 2028-29. No current-year unused loss is manufactured.

## GST independence and dates

Uncertain platform fee GST affects GST coverage while resolved gross receipts and income character continue to support the income-tax estimate. Confirmed reverse charge establishes compulsory registration independently of turnover. A date is shown only when the RCM date, complete turnover, absence of other compulsory triggers and any applicable threshold date establish timing. If both dates apply, use the earlier. Uncertain timing keeps registration required with an undated action.

For an established normal registration, confirmed return dates remain usable; RCM adds cash-payment/reporting and conditional-credit review. Uncertain platform treatment marks GST incomplete while retaining those dates. Unresolved rental GST, invalid registration or expired calendar Rules still withhold the dates affected by those independent issues. No GST payable or credit is calculated.

## Review status

Arithmetic and source-isolation checks are implemented. Final release and browser results are recorded in the [completion audit](../issues/01-implementation.md). The utility is explicitly titled as an earlier-year computation reference in the local source catalogue and cannot select a return form for the current Tax Year.
