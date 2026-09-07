# Employer NPS alongside salary and freelancing

Status: implemented and verified locally; included with the approved grouped-situations design. Not deployed.

## Plan

1. Verify Tax Year 2026-27 employer NPS rules against current primary authority. Record the evidence in [research](research/employer-nps.md).
2. Extend the existing salary branch, without changing the step layout. Ask whether employer NPS applies, collect each contributing employer's contribution and qualifying salary separately, and explain the amounts in the existing Learn more modal.
3. Include employer contributions in declared gross salary once. Calculate each employer's deduction separately, capped at 14% of its qualifying salary, then cap the combined deduction at gross total income. Preserve the salary standard deduction, freelance calculation and independent GST inputs.
4. Show income before the NPS deduction and taxable income after it. Test annual-return requirements before Chapter VIII deductions, and the supported income ceiling after deductions.
5. Migrate saved workspace version 5 to 6 without losing consent, amounts or completion dates. Migrate Recovery version 4 to 5 with the new answer blank. Historical fixtures were captured from HEAD 8026c96 before changing the writers.
6. Verify arithmetic, invalid and unknown inputs, multi-employer cases, restored data, branch clearing, responsive layout, keyboard interaction and the production journey.

## Scope

Ordinary employer contributions to NPS Tier I only. Personal contributions are not deducted; merely having made them does not exclude a person. Withdrawals, pension income, Agniveer deductions and unresolved salary treatment remain outside this slice. Require all employers' combined recognised PF, NPS and approved superannuation contributions at or below ₹7,50,000, with no taxable accretion from current or earlier excess. No employer names or account identifiers are collected. No new dependencies, storage keys, filing actions or external data transmission.

The official sources do not explicitly resolve unused limits between employers. One contributing employer can use the statutory capped deduction. Multiple contributing employers are supported only when every contribution is within 14% of that employer's eligible salary. Over-cap multi-employer cases remain blocked for separate review. This closes the research ambiguity without asserting that the law prohibits pooling.

## Verification and reviews

Unit tests cover the deduction, combined-income cap, rebate and surcharge boundary, filing triggers before deductions, independent GST, actual credits, malformed inputs, stale authority and historical schema restoration. Existing tests use 7 September 2026 as their fixed current date because the new Rules were reviewed that day. Historical fixtures and intentionally older expiry tests retain their original dates.

The UX-copy skill kept essential conditions visible and moved definitions and examples into the existing Learn more modal. Desktop, 1024px and 320px screenshots were reviewed; labels, margins and section gaps follow the existing form. Concurrent grouped-situations prototype edits and the unrelated one-line change in src/styles.css were left intact.

The first complete release run encountered the existing motion test's short-animation observation race: the 160ms expansion had disappeared before the test inspected it. The earlier full Vitest run passed all 141 tests. Ten subsequent repetitions of each motion case passed with retries disabled. No animation code or assertions were changed; this is not a claim that the existing race is fixed. Failure report and screenshot are retained in artifacts/employer-nps-verification/.

Final `pnpm verify:release` passed: formatting, lint, TypeScript, live Rule validation, 141 Vitest tests, production build, static bundle/header verification, and 65 Playwright cases. The existing WebKit video case skips on that browser; no NPS test is skipped. All 12 new NPS browser journeys passed across Chromium, Firefox and WebKit. Screenshots and browser reports are in artifacts/playwright/. The existing large bundled-video chunk advisory remains; no performance-budget claim is made.

Compliance review of the implemented bounded scope: No findings. The research's pre-deduction filing-trigger issue is covered by the shared evaluator and screening regression test. Its multi-employer interpretation issue is addressed by the explicit support restriction. The direct source, publication date, review date, tax-year interval, expiry, provenance and fail-closed guards are recorded locally. Existing independent GST extension-inventory limitations remain unchanged.

## Employer-card design follow-up

The requested emil-design-eng review led to compact white employer cards, one employer header, a header-level Remove action, two aligned fields where space permits and a single column on mobile. The shared Resources info-tooltip pattern now holds both original descriptions beside their labels. The existing shared money fields still show errors and expose descriptions to assistive technology. No tax or storage behavior changed.

Touch testing found Chromium emitting a hover-close event after an explicit tap. The shared FieldHelp now keeps a click-opened tooltip open through hover-close events, while Escape, blur, outside dismissal and a second press retain their normal behavior. Real keyboard navigation and touchscreen taps passed twice per browser across Chromium, Firefox and WebKit. Diagnostic logs were removed. Initial traces are retained under artifacts/nps-tooltip-*.

The shared preview briefly returned an empty 404 before the app loaded, so subsequent verification used a separate build and preview port. The temporary build/config and owned preview are cleaned up after verification; reports and screenshots remain in artifacts/nps-card-final-results/ and artifacts/nps-card-report/.

Final card/tooltip verification passed formatting, lint, TypeScript, production build and all 27 employer-NPS and Resources browser cases. No tests were retired or skipped for this follow-up.

## Existing design to preserve

Recent commits changed dialog spacing, next-action placement, saved-data controls and bundled demo playback. This slice reuses the existing question-section, field-stack, money field and help modal. It does not change those unrelated flows or the demo assets.
