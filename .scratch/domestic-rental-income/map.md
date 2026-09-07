# Domestic rental income

Authorized 8 September 2026. Status: implemented and verified.

Add one wholly owned Indian residential property with resolved annual-value records and non-negative house-property income alongside the existing presumptive practice. Keep rental GST confirmation independent. Use the existing calculation, questionnaire, workspace and Recovery models.

1. Verify authority and scope in [research](research/rental-income.md).
2. Add typed rental amounts, core support checks, separately sourced GST coverage, review and calculation rows.
3. Migrate workspace 8 to 9 and Recovery 7 to 8. Historical writer outputs were captured from commit `7a080af` before edits as `tests/fixtures/workspace-v8.json` and `tests/fixtures/recovery-v7.json`.
4. Verify arithmetic, combinations, boundaries, stale evidence, migration, browser save/reload, responsive layout, keyboard and privacy. Record results in [implementation](issues/01-implementation.md).

No transaction ledger, documents, addresses, tenant identifiers, filing, property losses or additional tax regime.

## Verification

`pnpm verify:release` passed on the final implementation: formatting, lint, TypeScript, live Rules, 233 Vitest tests, production build/static-bundle checks, and 116 Playwright cases. The existing WebKit video case remains skipped. All 15 new rental browser cases passed; the repaired NPS layout test also passed ten consecutive WebKit runs with retries disabled. No tests were retired. See the [completion audit](issues/01-implementation.md). The user requested committing the verified changes. Deployment was not requested.
