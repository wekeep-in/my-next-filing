# Integrated coverage upgrades

Status: complete. Implemented 8 September 2026.

## Delivered

1. Platform GST treatment no longer blocks a valid income-tax estimate. Explicit confirmed reverse-charge liability establishes registration independently of turnover; established dates use the earlier applicable trigger. Unknown timing withholds the deadline. Normal registrations retain confirmed return periods and show cash-payment/reporting guidance, including where an unrelated calendar detail is incomplete.
2. One Indian residential rental accepts a definite documented co-owner share. Inputs are the user's established annual value and separate municipal-tax/interest deductions. Ownership percentage does not automatically establish loan liability or multiply already apportioned values. Non-negative property income and independent rental GST scope remain.
3. Mixed basic exemption is allocated to ST then LT gains. The first surcharge band supports ordinary income plus supported equity through ₹1 crore, with a comparison preserving both basic exemption and the LT annual threshold. Existing rounding, rebate limits, NPS exclusion and credits remain.
4. Eligible earlier capital-loss balances are entered by original year and loss type. Current losses apply first, then eligible earlier years oldest first. The plan shows entered, used and remaining amounts and original final years. No approved loss balance, renewed eight-year window or new current-year loss is inferred.

See the [primary-source review and independent calculations](../research/authority.md). No findings remain against the implemented statutory boundaries. This is a review of the local bounded calculation and guidance; GST payable/ITC, other gain instruments, disputed balances and broader filing regimes are not calculated.

## Persistence

Captured actual workspace 10 and Recovery 9 outputs before implementation from `a403bee`. They remain immutable fixtures in `tests/fixtures/workspace-v10.json` and `tests/fixtures/recovery-v9.json`.

Workspace migrates to 11 and Recovery to 10. Reads do not rewrite saved storage. Consent, revision, Completion records, amounts and residual exclusion flags survive. Old confirmation of no RCM becomes `none`; old No/Not sure becomes unknown, never a confirmed liability. Historical Recovery leaves the new loss question unanswered. Current schemas reject mixed envelopes, malformed rows and inactive hidden data. No storage key or remote data flow was added.

## Verification

- `pnpm verify:release`: passed formatting, lint, type checking, live Rules validation, 311 Vitest tests, production build/static-header checks and 155 Playwright cases across Chromium, Firefox and WebKit. One pre-existing WebKit video case skips because that browser build lacks an HLS/H.264 decoder; no new skips or retries.
- A final added regression verifies that confirmed RCM payment instructions remain visible alongside an incomplete return calendar and that missing computation evidence stops the estimate. All 13 cases in `coverage-upgrades.test.ts` passed afterward. The final full Vitest run passed all 312 tests; formatting, lint and type checks also passed. Results are recorded in `artifacts/integrated-upgrades/final-tests.log`.
- New arithmetic cases include mixed basic-exemption exhaustion, rounding, ₹50 lakh comparisons with ST/LT/ordinary mixtures, annual LT threshold preservation, old-loss expiry, oldest-first use, LT restrictions, threshold interaction, absent current gains, and current/earlier loss separation.
- Integration checks cover co-owned share inputs, GST-only warnings, registration dates, save/reload/edit, captured migrations, retained exclusions, empty/duplicate/unsafe loss data and keyboard removal focus. Screenshots and overflow checks cover 1440, 1024 and 320 pixels. Mobile field and plan screenshots were visually inspected.
- Existing privacy, failed-storage, multiple-tab, deletion, navigation, motion and other income suites pass. No dependency or runtime network request was introduced.

Artifacts: `artifacts/integrated-upgrades/release.log`, `final-regression.log`, `final-tests.log`; browser report and viewport screenshots in `artifacts/playwright/`. Raw computation evidence and downloads are in `artifacts/integrated-upgrades/`.

Old tests that enforced the removed mixed-equity guards were rewritten to assert the newly supported outcomes while retaining malformed/uncertain/over-ceiling cases. All historical fixtures remain. Existing historic Recovery scenarios explicitly answer the newly introduced loss question before continuing; no default confirmation was invented.

## Later work

Money gifts, Tax Year rollover/archives, multiple or loss-making properties, broader regular-books/old-regime support, foreign-tax credits and payroll remain separate releases. No unrequested product work was added.
