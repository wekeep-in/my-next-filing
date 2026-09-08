# Ordinary-income surcharge and rental GST coverage

Authorized as the next appropriate slices on 8 September 2026. Status: implemented and verified.

1. Extend ordinary taxable income to ₹1 crore with the first 10% surcharge band and marginal relief above ₹50 lakh. Preserve the ₹50 lakh ceiling where positive equity gains remain after current-year loss set-off. No other income-path, audit or special-rate scope changes.
2. Support the notified rental GST exemption for registered sole proprietors renting personally for their own residence and on their own account. Keep the same-state and residential-use boundaries.
3. Reuse existing inputs and storage formats. No migration, new storage key or inferred change to a saved No/Not sure answer. Retain legacy surcharge exclusions until explicit review.
4. Verify sources, arithmetic, boundaries, credits, NPS and mixed-income interactions, old workspaces and Recovery, registered/unregistered rental GST, stale evidence, rendered guidance and privacy. See [research](research/authority.md) and [implementation](issues/01-implementation.md).

## Verification

`pnpm verify:release` passed with 287 Vitest tests and 146 Playwright cases, plus the existing WebKit video skip. After the final non-wrapping relief-amount presentation fix, lint, typecheck, build and all 12 focused browser cases passed again. Desktop, 1024px and 320px screenshots were inspected. Compliance review: No findings against the bounded implementation. No tests were retired. See the [completion audit](issues/01-implementation.md). The user requested committing the verified changes. Deployment was not requested.
