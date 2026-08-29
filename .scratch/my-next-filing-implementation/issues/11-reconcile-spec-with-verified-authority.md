# Reconcile the specification with verified authority

Type: task
Status: resolved
Blocked by: 08

## Question

After the GST decision is recorded, update `SPEC.md` so it remains the single implementation authority. Incorporate the approved GST input and threshold semantics, limit post-15-March advance-tax wording to payments made on or before 31 March, replace weak or stale statutory URLs, and record the reviewed or deferred tutorial statuses. Preserve the locked release scope and document the new verification date and sources.

## Answer

Updated `SPEC.md` while preserving the supported Profile, tax-calculation boundary, three Evaluation result kinds, no-backend rule, privacy restrictions, and out-of-scope list.

The specification now:

- defines GST aggregate turnover as a controlled term;
- uses one direct GST aggregate turnover input with an explicit Complete or Cannot confirm choice;
- forbids deriving or cross-validating that amount from income-tax fields;
- distinguishes Below, At, Above, and Unavailable GST states with `<`, `=`, and `>` behavior;
- keeps valid income-tax results for Above and Unavailable GST states while marking GST coverage incomplete;
- limits post-15-March advance-tax treatment to amounts paid on or before 31 March 2027;
- replaces the brittle section 408, old section 516, and old CGST bill URLs with current official consolidations;
- records the 29 August 2026 review status of every initial tutorial candidate;
- defers a return tutorial until a suitable Tax Year 2026-27 source exists;
- updates the fictional example to ₹19,10,000 GST aggregate turnover and ₹90,000 below the Maharashtra threshold; and
- adds expectations for exact-threshold, Unavailable, and bank-interest double-counting behavior.

Consistency checks found 158 sequential user stories, only HTTPS source references, and no remaining stale source URL or replaced GST term.

### Compliance review

**No findings** remain in the changed specification sections.

- Income-tax section 408 states that section 58 presumptive taxpayers pay by 15 March and that an amount paid as advance tax on or before 31 March is treated as advance tax for that financial year. Source: [Income-tax Act, 2025 as amended by Finance Act, 2026](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf), Income-tax Act assented 21 August 2025 and Finance Act 2026 assented 30 March 2026.
- Income-tax section 516 supplies the retained nearest-₹10 rounding rule. Source: the same amended Act.
- CGST section 2(6) defines aggregate turnover and section 22 applies turnover-based registration when turnover exceeds the threshold. Source: [Central Goods and Services Tax Act, 2017, consolidated as on 11 June 2026](https://www.indiacode.nic.in/indiacode/bitstream/123456789/15689/1/A2017-12.pdf), Act dated 12 April 2017.

No application code or Rule dataset existed for these behaviors, so this task changed the authoritative specification only.
