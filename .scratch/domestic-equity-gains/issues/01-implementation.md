# Domestic equity gains implementation

Implemented locally on 7 September 2026. Final release verification passed: 174 Vitest tests and 86 Playwright cases, with the existing WebKit video skip. No commit or deployment requested.

## Result

The existing Other income step now accepts confirmed domestic equity gains alongside either presumptive practice, optional domestic salary, employer NPS and supported dividends/interest. It keeps short-term and long-term gains separate, shows their tax components in the existing breakdown, and preserves independent GST inputs and obligations. Public support copy and the consolidated Resources entry reflect the bounded scope.

Profile parsing rejects missing/unknown branches, malformed amounts, unsafe gain totals and unsafe combined income or credits. Scope uncertainty and retained legacy stop facts still withhold the core estimate. Mixed positive gain categories with unused basic exemption remain blocked with a specific correction message and an explanation in the form. The [research](../research/equity.md) records why this boundary remains.

Workspace version 6 migrates to 7 and Recovery version 5 migrates to 6 without new storage keys. Migration is in memory. Existing amounts, consent, revision and Completion records survive; old Recovery requires a fresh equity answer. Legacy gain facts are never cleared automatically. Current writes continue through the existing validation and conflict handling.

## Calculation review

Reviewed the implementation against the [amended Act](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf), sections 156, 196, 198, 202, 263, 408 and 425, with the publication, period and later-amendment access limitations recorded in research.

The new tests caught the shared percentage helper rounding 12.5% to 13%. The helper now retains basis-point precision for the reviewed rates; existing presumptive, NPS, slab and cess callers retain coverage. All supported gain amounts remain in total income, including the long-term threshold portion. NPS is capped at ordinary income. Rebate and marginal relief are capped at ordinary slab tax. Cess and actual credits apply once. A later review also moved unsafe combined-credit errors to the visible TDS field rather than an inactive equity confirmation.

Compliance review: No findings within the implemented bounded scope. Missing, altered or expired equity authority fails closed with core income tax. The mixed-gain basic-exemption restriction avoids an unverified allocation rule. This does not establish current-year return-form eligibility, transaction-level gain computation, or interest relief.

## Verification

Added 33 named/table-driven Vitest cases covering independent arithmetic, thresholds, deductions, relief, combined salary/investment income, both presumptive paths, unsafe input, scope, rule provenance, form round trips, branch clearing and historical migrations. Added five production-browser journeys, each run in Chromium, Firefox and WebKit, covering the combined estimate, saving/reloading/payment edits, responsive and keyboard help, unsupported/invalid inputs, workspace migration and retained historical Recovery facts.

Existing migration assertions now expect current schema versions. Historical JSON fixtures remain unchanged. The old Resources assertion that capital-gain searches have no result was replaced by a positive search assertion for the newly covered subject; the unsupported identifier checks remain. No test was removed or skipped for this slice.

Early browser failures were incorrect test assumptions, not intermittent failures: invalid numeric edits retain the previous value; the visible checkbox uses the accessible role; and Continue is disabled when a required amount is empty. The corrected tests assert these existing contracts. The initial release log is retained at `artifacts/equity-release.log`.

Final command: `pnpm verify:release` passed formatting, lint, TypeScript, live Rule validation, all 174 Vitest tests, the production build, static bundle/header verification and 86 Playwright cases. All 15 new equity browser cases passed; the one existing skip is the WebKit video case. Output: `artifacts/equity-release-final.log`. Browser report and screenshots: `artifacts/playwright/`. Vitest report: `artifacts/vitest/results.xml`. Desktop 1440px, tablet 1024px and mobile 320px screenshots were inspected; amounts and labels remain readable, controls stay within the viewport, and the existing fixed navigation is preserved. Keyboard modal focus/restoration, reduced-motion branch clearing, and URL/storage behavior are exercised by the new browser cases.

The existing bundled-video chunk advisory and WebKit video-test exclusion are unrelated to this change. This work does not claim a new Lighthouse score, moderated usability result, external professional approval or public deployment. The independent GST-calendar/LUT expiry and extension-review requirements remain unchanged.
