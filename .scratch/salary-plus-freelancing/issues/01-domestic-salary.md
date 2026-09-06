# Support domestic salary alongside freelancing

Status: Implemented locally; verification recorded below.

## Result

The other-income step asks whether salary exists. Yes reveals a scope confirmation, one annual amount and salary help. Review and the calculation breakdown show the salary amount; the result shows the single capped standard deduction and taxable salary. Employer TDS is included once through the existing credit input. The existing plan, payment update, save and restore paths handle the expanded Profile.

## Compliance review, 6 September 2026

No findings in the implemented salary change.

- `src/rules/index.ts` records ₹75,000 in the common income-tax group with required provenance, a 2026-09-06 review date, the existing 2026-04-01 to 2027-03-31 effective period, and the existing 2027-08-31 review expiry. The new Source omits an unverified publication date. Missing, changed or expired salary rules stop the core estimate.
- `src/evaluation/index.ts` applies the salary-only deduction once, then includes taxable salary in both screening and final evaluation. It retains the combined rebate, marginal relief, income ceiling and credit rules. No salary deduction reduces presumptive profit.
- Sections 19 and 202 support the capped new-regime standard deduction. Sections 263 and 408 preserve the business/profession return date and whole-current-income presumptive advance-tax instalment. Section 405 supports counting actual withholding against included income. Sources and access caveats are in the [research](../research/domestic-salary.md).
- The salary confirmation excludes additional deduction/relief cases, including employer NPS and Agniveer deductions, so the annual-return income test does not omit a newly supported Chapter VIII add-back. No current-year return-form recommendation was added.
- Employment salary stays out of the GST input and practice receipts. Only GST helper text changed; no GST threshold or date changed.

## Verification

`scripts/verify-salary.ts` checks deduction caps, both presumptive paths, rebate and marginal relief, annual-return thresholds, the income ceiling, actual TDS/refunds, unchanged GST conclusions and dates, malformed and uncertain salary data, stale/missing Rules, questionnaire progression, hidden-field clearing, Recovery migration, Saved-workspace migration, preservation of completion dates and revision checks.

The existing evaluation and frontend suites pass with the new required salary answer. Lint, typecheck, Rule validation, production build and built-asset checks pass. The production build reports its bundle-size advisory.

Browser checks used synthetic data in an isolated context. Checked the salary form at 1440px, 1024px and a 390px mobile viewport, and the expanded calculation at 320px. No horizontal overflow was found. Verified whole-rupee formatting, the uncertain-salary stop, review values, the calculated ₹2,55,100 balance for the synthetic example, browser saving and reload. Salary help opens with Enter, focuses its heading, closes with Escape and restores trigger focus. The existing shared reduced-motion guards cover the added fields; no new motion or CSS was introduced. A dedicated screen-reader session and OS reduced-motion emulation were not run.

This is a local implementation review, not a replacement for the repository's full public-release gates.
