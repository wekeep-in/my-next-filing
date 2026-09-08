# Implement foreign-asset coverage

Status: implemented and verified on 8 September 2026. Authorized as the next slice.

## Result

An established foreign asset or signing authority no longer has to stop the entire estimate. The user reviews a dedicated branch and confirms that all income effects fit the existing supported scope. The annual-return action includes the foreign-asset trigger, even at nil income and nil tax. A visible Plan card explains the ITR-4 exclusion and the need to use current reporting instructions.

Classification uncertainty and income uncertainty remain distinct. A confirmed income boundary with uncertain asset classification preserves the estimate and existing independent actions; it withholds disclosure guidance and cannot produce a negative filing conclusion unless the uncertainty is resolved. Unsupported foreign income, foreign tax, treaty relief, operations, related-party/transfer-pricing requirements and unresolved amounts remain excluded. Provider brands never determine eligibility. Existing payment-route and settlement requirements remain.

The Plan now also displays the already evaluated FEMA transition note for supported foreign clients. Review buttons use the affected action's correction group, including foreign-asset questions and rental GST review, rather than always sending the user to an unrelated group.

## Persistence

Workspace 9 migrates to 10 and Recovery 8 to 9 through the existing storage keys and validated writes. Original writer outputs from `e48d6ea` were captured before edits. Migration preserves consent, revisions, tax amounts and Completion records. A previously supported possible-account profile stays uncertain with its established income scope; a retained unsupported fact prevents any inferred income confirmation. Recovery's new questions remain unanswered. Legacy `foreignAssets` selections stay checked until the user explicitly reviews them. No balance, country, institution, account identifier or asset value is collected.

## Verification

The unit cases cover exact tax invariance, the nil-income filing trigger, uncertainty without a false negative filing conclusion, established filing despite other uncertainty, independent stale areas, unchanged core client stops, malformed branches, domestic-client normalization, historical data, mixed schemas and retained exclusions.

The browser cases cover questions, core stops versus partial guidance, correction navigation, modal keyboard focus, reduced motion, responsive layouts, saving/reload, historical exclusion review, absence of remote requests, and the nil-tax next action with visible disclosure guidance. Screenshots are under `artifacts/playwright/results/foreign-assets-*/`.

No test was retired. Current-schema assertions were updated while historical on-disk assertions retain their original versions. The Resources Act entry now includes worldwide-income and foreign-asset provisions, so its existing `foreign salary` search expectation now accepts the shared Act as a reading resource; that does not grant a foreign-salary Profile calculation. Core unsupported-income tests remain.

`pnpm verify:release` passed on the final implementation: formatting, lint, TypeScript, live Rule validation, 264 Vitest tests, production build/static-bundle checks and 134 Playwright cases. The existing WebKit video skip remains; no new skip or retry was introduced. All 18 new foreign-asset browser cases passed, including the nil-tax next action. Questionnaire and Plan screenshots were inspected at 1440px, 1024px and 320px. There are no remaining test failures.

Reports: `artifacts/foreign-assets-research/release.log`, `artifacts/vitest/results.xml`, and `artifacts/playwright/report/index.html`. Source review and remaining product boundaries are in [research](../research/foreign-assets.md).

Compliance review: No findings against the implemented bounded scope. The new branch adds no monetary calculation, requires resolved income effects, sources the section 263 trigger and rule 164 exclusion independently, preserves core client stops, and withholds each stale independent area. No previous-year Schedule FA period or provider-specific classification is promoted to a current rule. The user requested committing the verified changes. Deployment was not requested.
