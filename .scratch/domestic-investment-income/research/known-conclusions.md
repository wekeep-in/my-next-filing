# Keep established filing conclusions

Reviewed 6 September 2026 for Tax Year 2026-27. This review covers the two approved completeness improvements, not a new filing-form or registration category.

## Decision

Implement both changes within the existing supported Profile. A fact that establishes an obligation should survive uncertainty about another independent trigger. A missing date should withhold the deadline, not erase a separately established registration conclusion.

## Statutory evidence

| Authority | Publication and effective dates | Verified point |
| --- | --- | --- |
| [Income-tax Act, 2025 as amended by Finance Act, 2026](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf), section 263, PDF pages 340–343 | Finance Act enacted 30 March 2026; relevant amendment effective 1 April 2026. Consolidation publication date is not stated. | Total-income and prescribed-condition routes independently require a return. The amended due-date table assigns 31 August of the following financial year to non-audit business/profession cases where section 172 does not apply. Foreign-asset/signing-authority facts are filing triggers, not a separate due-date category. |
| [Income-tax Rules, 2026, Notification 22/2026](https://www.incometaxindia.gov.in/documents/d/guest/notification-22-2026-1), rule 163, PDF page 130 | Issued 20 March 2026; effective 1 April 2026. | Conditions are alternatives. Business receipts above ₹60 lakh, professional receipts above ₹10 lakh, and combined TDS/TCS of at least ₹25,000 qualify. The credit threshold becomes ₹50,000 for a resident individual aged sixty or older. Other alternatives concern current-account deposits, foreign travel, electricity expenditure and savings-account deposits. |
| [Central Goods and Services Tax Act, 2017](https://www.indiacode.nic.in/indiacode/bitstream/123456789/15689/1/A2017-12.pdf), sections 22–25, PDF pages 36–38 | Enacted 12 April 2017. The consolidation records later amendments; its publication date is not stated. | Section 22 establishes turnover-based registration liability. Section 25 requires an application within thirty days after liability arises. Sections 23 and 24 retain exemptions and independent compulsory-registration cases. The service thresholds remain ₹10 lakh for Manipur, Mizoram, Nagaland and Tripura and ₹20 lakh elsewhere. |

Every link above was opened on 6 September 2026. Use enacted provisions rather than Budget proposals. This review does not establish a new extension or change existing Rule expiry dates.

## Annual-return contract

Current behavior in `annualReturnUncertainty`, `calculateAnnualReturn` and `screenProfile` treats either uncertain question as a veto even after a positive trigger has been found.

Use one shared computation of established triggers for evaluation and screening. If any valid trigger is established, annual-return Coverage is available with `required: true`, the established reasons, and the existing dated Obligation. Do not cite uncertain reasons. If no trigger is established and a material answer remains uncertain, retain unavailable Coverage and the existing Review action. If no trigger is established and relevant answers rule out all supported triggers, retain the current available negative conclusion.

Unknown age must never act as an answer of no. With credits from ₹25,000 to below ₹50,000, omit the credit reason unless age is confirmed below sixty. Credits of at least ₹50,000 independently meet both thresholds. An unrelated established trigger makes the age question unnecessary for deciding whether a return is required. Hiding that question must not silently write a favourable age answer.

Keep the normal due date of 31 August 2027 only inside the existing non-audit, supported-practice boundary. Audit and section 172 reporting cases must remain excluded. An uncertain foreign account or signing authority may still need independent foreign/disclosure review even when the annual filing obligation is established. Showing the obligation does not establish return-form eligibility or complete disclosures.

Implementation inference: a separate review merely asking whether some additional trigger exists adds no useful action after filing is already required. Preserve review only where it resolves another actual decision, such as foreign disclosures. Do not suppress the independent foreign Coverage result.

## GST contract

In `calculateGst`, keep the complete-turnover and compulsory-registration guards first. An incomplete turnover total or compulsory-registration answer other than no continues to withhold this area's conclusion.

Once these guards pass, return the existing available `GstConclusion`, including threshold, difference, state and `registrationRequired: true`, when turnover exceeds the threshold. If the liability date is missing, also return an urgent date Review action and no dated Obligation. The existing model already permits available Coverage alongside Review actions, so no new coverage variant is needed.

A valid known date produces the existing thirty-day deadline. Preserve rejection of future and out-of-year dates. Exactly-at-threshold and below-threshold results remain unchanged. Screening must retain the missing-date Review action even though Coverage is now available. Plan wording must not suggest that available threshold Coverage means all dates are known.

## Review findings

- S1, source binding in `src/rules/index.ts`: the registered section-263 HTML URL currently shows the original July date, while the annual-date binding points at a Budget FAQ. Bind the unchanged August date to the enacted amended Act above. Point receipts-trigger references to rule 163, where their actual values are prescribed. This prevents a reader from following a source that contradicts the result.
- S2, annual-return evaluation: an uncertain age currently selects the lower credit threshold before the blanket uncertainty guard hides the result. Removing only the guard would expose a false reason. Fix the positive-trigger computation and its screening caller together.
- S2, GST evaluation: replacing unavailable Coverage alone would drop screening's date warning, because screening currently collects only unavailable GST Coverage. Preserve the separate Review action through screening and the plan.

## Verification cases

Check established income, professional receipts, business receipts, confirmed other trigger and credits at ₹50,000 with the other trigger or age unknown. Also check credits at ₹25,000 and ₹49,999 with unknown age and no independent trigger, plus exact income/receipt boundaries. Unsupported audit facts and stale annual Rules must still prevent dated annual conclusions.

For GST, check above-threshold with a missing date, above-threshold with a valid date, exactly at threshold, incomplete turnover, uncertain compulsory registration, future date rejection and stale registration Rules. The missing-date case must show the threshold conclusion and date review in both screening and results, with no invented Obligation or Completion control.
