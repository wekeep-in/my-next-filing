# Foreign assets and payment-account coverage

Authorized as the next slice on 8 September 2026. Status: implemented and verified.

Support established foreign assets/signing authority whose income effects do not change the existing supported calculation. Add the independent annual-return trigger and visible disclosure guidance. Preserve review for uncertain account classification and core stops for unsupported income, foreign tax, operations or unresolved amounts. Do not classify providers by brand or loosen settlement, payment-route or platform-fee boundaries.

1. Verify sections 5 and 263 and notified rule 164. Record [research](research/foreign-assets.md).
2. Add one Profile branch with presence and income-scope confirmation, independent coverage and visible guidance in the same plan.
3. Migrate workspace 9 to 10 and Recovery 8 to 9. Historical writer outputs from `e48d6ea` were captured before edits in `tests/fixtures/workspace-v9.json` and `tests/fixtures/recovery-v8.json`.
4. Verify arithmetic invariance, filing despite nil income, uncertainty/stale-area behavior, legacy exclusions, storage, keyboard/responsive states and privacy. Record results in [implementation](issues/01-implementation.md).

## Verification

`pnpm verify:release` passed on the final implementation: formatting, lint, TypeScript, live Rule validation, 264 Vitest tests, production build/static-bundle checks, and 134 Playwright cases. The existing WebKit video skip remains. All 18 new foreign-asset browser cases passed, including the nil-tax next action and desktop/1024px/320px screenshots. No tests were retired. See the [completion audit](issues/01-implementation.md). The user requested committing the verified changes. Deployment was not requested.
