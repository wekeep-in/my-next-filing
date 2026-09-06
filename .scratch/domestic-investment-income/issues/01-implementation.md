# Ordinary domestic income and established conclusions

Status: Implemented and verified on 7 September 2026.

## Result

The other-income step now accepts ordinary Indian-company dividends, taxable Indian mutual-fund distributions, taxable post-office interest and income-tax refund interest after explicit confirmation. The four annual amounts are separate from bank interest, salary and freelance receipts. The tax breakdown and final review identify each amount. A shared Learn more modal explains record timing, reinvested IDCW, taxable versus exempt interest, refund principal, exclusions and dividend payment-timing limits.

An established annual-return trigger survives uncertainty about another trigger. Unknown age cannot establish the lower TDS/TCS trigger. When no positive trigger is known, uncertainty still withholds the conclusion. The existing portal action, non-audit deadline and separate foreign/form guidance remain intact.

Complete above-threshold GST turnover now retains its registration-required conclusion when the crossing date is unknown. An urgent date review remains visible in the form and plan. No registration deadline or completion action is invented. Compulsory-registration uncertainty, invalid dates and stale Rules retain their safeguards.

## Recent changes preserved

The [map](../map.md) records the analysis of ten commits after f29fc73, completed before application edits. This slice preserves the compact next-action card, fixed official portal links, native disclosures, modal save consent, Resources browsing, lazy screen modules and the Vitest/Playwright setup. The other-income form uses the established section and field-stack layout without new CSS.

Section 263's older standalone HTML still showed the original return date. Its registry reference now points to the enacted amended Act, with receipt triggers sourced to rule 163. Resources consolidates those references under the same Act URL and adds the SEBI IDCW circular. The collection still has 29 unique resources, with 33 source identities; search for section 263 finds the consolidated Act. No duplicate-URL card is introduced.

## Storage compatibility

Workspace version 5 migrates version 4 in memory. Supported historical Profiles had explicitly excluded additional income, so they receive an absent branch; legacy combined dividend/gift, unknown and other-unsupported answers remain blocking. The main form separates gifts from unsupported dividends and only displays the old combined option when it was actually restored.

Recovery version 4 migrates version 3 with the new answer blank and the new amounts empty. A returning draft therefore needs confirmation. No migration overwrites storage during a read or removes completion dates.

Historical fixtures in `tests/fixtures/workspace-v4.json` and `recovery-v3.json` were captured from the published 4c5b4d1 code before changing these schemas. Older migration cases now use those fixed historical values rather than silently regenerating them from the new Profile.

## Statutory review

No remaining findings in the implemented scope after a focused review against [income research](../research/income.md) and [known-conclusion research](../research/known-conclusions.md).

- New amounts and their combined sum must be non-negative safe whole rupees. Missing or uncertain facts cannot become zero. Income is included once before rounding and slab calculation, including the combined ceiling, rebate and credits.
- Company-dividend timing and ordinary other-source treatment come from the amended Act. Finance Act 2026 supplies the no-expense treatment for dividends and specified distributions. The existing income-tax review expiry remains 31 August 2027; GST-calendar/LUT expiry is unchanged.
- The August 2026 amendment does not change these resident-individual ordinary-income provisions. The enacted Gazette was read through a mirror after the official host failed, as documented in the research.
- No post-office exemption formula, specialised distribution, capital-gain, refund-adjustment, interest/penalty or return-form computation was added. GST turnover remains independently declared.
- The Finance Act's 30 March 2026 publication metadata is correct; its electronic Gazette identifier contains 31 March. The research note was corrected to distinguish them.

## Verification and artifacts

Added 30 named/table-driven unit scenarios and four built-app journeys executed in Chromium, Firefox and WebKit. Unit checks cover all four amounts, combined calculation and ceiling, invalid inputs, missing provenance, legacy flags, migrations, established annual triggers, unknown-age thresholds, and GST date reviews. Built-app checks cover actual entry, help/focus, responsive layout, Resources round trips, consent, save/reload, historical workspace upgrade and Recovery re-confirmation.

The first expanded Resources round-trip test exposed test-setup mistakes, not app regressions: it attempted a desktop-only FAQ shortcut after the mobile-width checks, then used a resource-heading locator without the existing accessible new-tab suffix. Both were corrected to match the actual interface, without force clicks, longer timeouts or retries. The corrected 12-case matrix passed with retries disabled. Initial traces are retained under `artifacts/domestic-income-initial-failure/`.

The final `pnpm verify:release` command passed: formatting, lint, TypeScript, current-date Rule validation, 115 Vitest tests, production build, generated-asset/header checks and all 51 Playwright cases across Chromium, Firefox and WebKit. Current reports live under `artifacts/vitest/` and `artifacts/playwright/`; the latter includes the new 1440px, 1024px and 320px screenshots. No existing test was retired; resource expectations changed only for the deliberate source consolidation and new reference. The build retains its bundle-size advisory; no new performance-score claim is made.

No commit or deployment was requested. Separate concurrent edits to the plan delete control and demo-video notes were left untouched. Existing public-release requirements, including the GST extension inventory, remain outside this implementation's completion claim.
