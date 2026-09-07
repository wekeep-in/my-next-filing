# Current-year equity loss authority and implementation decisions

Research began 7 September 2026; verified for implementation on 8 September 2026. Applies to Tax Year 2026-27 under the existing resident-individual, new-regime, non-audit presumptive-practice boundary.

## Authority and access

The requested [Income Tax Department amended Act](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf) returned 403 on direct opening this time. Its indexed section 108–109 text matches the current bare Act published by [ICAI, April 2026 second edition](https://resource.cdn.icai.org/91774dtc-aps4792.pdf), which was downloaded directly from ICAI and read, including the Finance Act 2026 amendments. This is the enacted text, not a commercial tax summary. The base Act received assent on 21 August 2025; ICAI's second-edition foreword is dated 31 March 2026 and its publication month is April 2026. No exact April publication day is claimed. Official ICAI PDF SHA-256: `e1101c2acca2e3b29036a426739052409135d561cbf19d97f6d58a38cd5fdff5`. The separately obtained third-party copy has a different byte hash and is not the verification artifact. Local evidence is under `artifacts/equity-loss-research/`.

| Provision | Enacted effect used |
| --- | --- |
| 108(2)(a) | A short-term capital loss can be set off against another short-term or long-term capital gain of the same year. |
| 108(2)(b) | A long-term capital loss can be set off only against another long-term capital gain. |
| 109(2) | Capital losses cannot be set off against any other income head. |
| 175(8)–(10) | Dividend/bonus stripping can disallow a transaction loss or affect basis. The declared annual loss totals must already resolve these rules; the application does not compute them from transactions. |
| 111(1), (2) | Unabsorbed capital losses retain their character and may be carried forward for no more than eight tax years immediately succeeding the loss year, subject to conditions. |
| 121 | Carry-forward requires determination pursuant to a return filed under section 263(1). A calculated unused amount is not an approved balance. |
| 263(1)(a)(viii) | A person intending to carry forward a capital loss must file by the due date. This is conditional on claiming carry-forward, not a claim that every loss makes filing unconditionally mandatory. |
| 263(1)(c), amended table row 3 | The existing non-audit business/profession due date is 31 August of the succeeding financial year. |
| 196(2), 198(3) | Resident basic-exemption adjustments apply to the gain amounts entering tax computation after permitted loss set-off. |
| 196(4), 198(6), (7), 156(2), (3) | Preserve the ordinary-income-only NPS deduction and limits on rebate/marginal relief; do not deduct capital losses from salary or practice income. |

The Department's [Income Tax Returns FAQ, question 21](https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-returns) independently confirms timely filing under 263(1) and section 121 for capital-loss carry-forward. The [ITR-2 FAQ, question 14](https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/itr-2-faq) corroborates the loss-category restrictions and eight-year period under the predecessor law; its old assessment-year rates and form eligibility are not used. The new Act is the controlling authority. The [17 August 2026 amendment](https://egazette.gov.in/WriteReadData/2026/275521.pdf), reviewed in the earlier equity research through the enacted Gazette copy, changes schedules and corporate surcharge, not these provisions.

The amended due-date table was additionally rendered and visually checked at PDF page 460, printed page 369, of the official ICAI copy. Row 3 specifies 31 August for the supported non-audit business/profession case. `artifacts/equity-loss-research/section263-due-date.png` records that check. Targeted official-domain amendment searches on 8 September did not identify a later change to the loss provisions used here; absence of search results is not treated as statutory authority.

## Ordering and scope

Records must provide four annual totals: positive short-term gains, absolute short-term losses, positive long-term gains and absolute long-term losses. They must cover the same supported domestic listed shares/equity-oriented mutual funds, all brokers/funds once, and resolve costs, ownership, holding periods, STT and loss-disallowance rules such as dividend/bonus stripping. No derived transaction dates, cost bases or loss eligibility decisions belong in the questionnaire. Brought-forward losses, derivatives, foreign investments and other instruments remain excluded.

Apply long-term loss to long-term gains first. Apply short-term loss to short-term gains, then any remaining short-term loss to the remaining long-term gains. Every step is within section 108's permitted pairings; this is the disclosed implementation order, not a claim that the Act prescribes this particular priority or that it optimises every future-year result. It preserves the restricted long-term loss for its only eligible category and prevents subtracting either loss twice. Apply losses before basic exemption and the annual long-term tax threshold; gains within that threshold are still income available for set-off.

The remaining non-negative gain categories enter total income. Unused losses do not reduce ordinary income, NPS capacity, GST turnover or ordinary filing triggers. The total-income ceiling and rebate boundaries use income after permitted current-year loss set-off. Filing-income tests still disregard Chapter VIII deductions, as before. Once a loss remains, the plan includes a conditional timely loss-return action to preserve carry-forward, even if other income is below the filing threshold or another trigger is unknown. Explain that condition explicitly in its title/reasons. No-loss mandatory-return behavior is unchanged.

## Mixed-gain basic exemption investigation

Re-read sections 196(2) and 198(3), the Department's [capital-gain guide](https://www.incometaxindia.gov.in/w/capital-gain), and searched the official domains for a combined-category allocation example. They establish resident basic-exemption entitlement but do not clearly prescribe an allocation priority between two simultaneously positive categories. Do not remove the existing restriction by assuming a favourable order. Test it against the gains remaining after loss set-off. A portfolio whose losses eliminate one category receives the existing single-category adjustment. A portfolio with no remaining gains has no mixed-allocation issue.

## Output and evidence model

Extend the existing equity result with source losses, three applied amounts, two remaining gain amounts, two unused losses and the final special-rate tax bases. Keep the original gains visible. Expose carry-forward guidance through the independently reviewed annual-return conclusion; use its deadline and a sourced eight-year limit. Show an explicit notice next to the estimate whenever unused loss exists, including when that independent guidance is stale or unknown. Do not hide unused loss behind a zero-tax result, assume timely filing or government acceptance, or turn saved loss inputs into a future-year loss ledger.

Reuse the existing equity statutory reference for the amended Act, extending its covered-rule identities for current-year set-off and carry-forward. Record ICAI's official copy as the alternate verification source here. Core set-off evidence is required for the estimate; annual-return/carry-forward evidence expires independently and withholds its own guidance. Keep all authorities local, typed and expiry-bound.

## Independent cases for verification

- Ordinary income ₹10 lakh; ST gains/losses ₹2 lakh/₹50,000; LT gains/losses ₹3 lakh/₹75,000: remaining gains ₹1,50,000 and ₹2,25,000; ST tax ₹30,000; LT tax ₹12,500; slab tax ₹40,000; cess ₹3,300; gross tax ₹85,800.
- ST gains/losses ₹50,000/₹2 lakh; LT gains/losses ₹3 lakh/₹1 lakh: apply LT loss ₹1 lakh, ST loss ₹50,000 to ST and ₹1,50,000 to LT; remaining LT gains ₹50,000; no unused loss. The long-term threshold applies after this adjustment.
- ST gains ₹1 lakh, LT gains/losses ₹50,000/₹2 lakh: ST gains remain ₹1 lakh; unused LT loss ₹1,50,000 cannot shelter them or ordinary income.
- Ordinary income ₹3 lakh; ST gains/losses ₹50,000/₹75,000; LT gains ₹3 lakh: remaining ST gain zero, LT gain ₹2,75,000; basic exemption ₹1 lakh then LT threshold ₹1,25,000 leaves ₹50,000 taxable at 12.5%; with cess ₹6,500. This case must not hit the old mixed-gain stop.
- Ordinary income ₹1 lakh; ST gains/losses ₹10,000/₹50,000; LT gains/losses ₹20,000/₹40,000: both gain categories become zero, unused ST loss ₹40,000 and LT loss ₹20,000; ordinary income remains ₹1 lakh. Show the timely loss-return action and conditional carry-forward guidance despite zero tax.

Verification must include every pairing, unused loss of either category, pure-loss portfolios, losses netted inside annual broker reports, zero losses, threshold/rounding edges, combined salary/NPS/dividends, both presumptive paths, legacy flags, malformed inputs, stale authority, migration/reload and the rendered calculation and carry-forward notice.

## Final compliance review

No findings against the implemented bounded scope. The calculation applies only the section 108 pairings, retains unused losses by category and never subtracts them from ordinary income. The conditional filing action cites the local carry-forward rule and preserves the existing return identity. Core set-off and independent filing/carry-forward provenance are tested separately. The unresolved mixed-gain basic-exemption priority is still withheld, now only after current-year loss adjustment. The source-host access limitation is documented above; the official ICAI bare Act, rather than a third-party mirror or tax summary, was used for textual verification.
