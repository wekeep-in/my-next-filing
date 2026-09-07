# Implement domestic rental income

Status: implemented and verified on 8 September 2026.

## Implemented behavior

- One wholly owned Indian residential rental property, with confirmed resolved tax treatment, enters the same Profile and Evaluation as freelance, salary, NPS and investment income.
- Three annual rupee inputs feed municipal-tax deduction, 30% net-annual-value deduction and eligible current-year interest. Negative property income stops the estimate. Inputs reject malformed values, unsafe totals, unknown fields and unsupported relationships.
- Ordinary income includes the non-negative property result before NPS, rebate, marginal relief, total-income ceiling and filing tests. Existing credits and presumptive payment dates apply once. The Plan shows every property calculation component.
- Separate rental GST confirmation covers same-state supply for residential use to unregistered tenants. Uncertainty preserves core tax and independent LUT actions while withholding GST registration/return conclusions and dates. GST turnover remains independently declared and explicitly includes exempt rental supply value.
- Questionnaire, review, restored exclusions, FAQs and Resources describe the bounded support and remaining exclusions. Existing components and visual system are reused.
- Workspace 8 migrates to 9 in memory; Recovery 7 migrates to 8 with unanswered rental fields. Captured writer outputs from `7a080af` protect historical amounts, consent, revision and Completion records. Normal writes use the existing keys. Deselection clears hidden rental inputs and confirmations.

## Checks

Focused rental tests cover independent arithmetic, zero/fractional values, both presumptive paths, salary/NPS/dividend/equity combinations, rebate/marginal-relief and income-ceiling boundaries, filing triggers, property losses, invalid/missing/hidden input, source/rate failures, independent GST review, migration, and field clearing.

The 15 rental Playwright cases passed across Chromium, Firefox and WebKit. They exercise Recovery, saving, reload, revisiting fields, legacy property exclusions, GST partial plans, responsive fields, modal keyboard focus, reduced motion, URL/title and outbound-link privacy. The existing unsupported-facts suite also passed, 21 focused cases in total.

Desktop, 1024px and 320px screenshots were inspected. Existing section spacing, labels, controls and fixed navigation remain usable without horizontal overflow. Screenshots live under `artifacts/playwright/results/rental-income-rental-help-*/` after the final run.

No tests were retired. Current-schema and Resources catalogue expectations were updated. The historical on-disk version-7 assertion remains version 7 until a normal save occurs; the migration does not eagerly write.

A WebKit failure in the existing NPS layout test reproduced once in six runs. A storage-state wait exposed that the earlier salary radio selection itself could fail when the temporary Recovery banner disappeared during automated scrolling/clicking. The layout test now waits for that banner to appear and disappear before exercising the controls, and verifies the final persisted answer before reload. The corrected test passed ten consecutive WebKit runs with retries disabled, under the existing two-worker concurrency. It preserves the tooltip, geometry, deselection and reload assertions. No timeout, retry, browser skip or product behavior was changed for this test. Reproduction trace: `artifacts/rental-research/nps-failure/trace.zip`; reproduction and verification logs: `nps-repro.log`, `nps-fixed.log`, `nps-settled.log` in the same artifact directory.

`pnpm verify:release` passed on the final implementation: format, lint, typecheck, live Rule validation, 233 Vitest tests across the unit and browser projects, production build and static bundle checks, and 116 Playwright cases. The one existing WebKit video skip remains; no new skip or retry was introduced. Full results are in `artifacts/rental-research/release.log`, `artifacts/vitest/results.xml` and `artifacts/playwright/report/index.html`. There are no remaining test failures.

Compliance review: No findings against the implemented bounded behavior. The 30% rate, subtraction order, new-regime loss stop, ordinary-income integration, presumptive advance-tax treatment and independent GST withholding match the documented primary-source review. Broader property or registered-tenant support remains explicitly outside this slice. Compliance evidence and bounded exclusions are in [research](../research/rental-income.md). The user requested committing the completed changes. Deployment was not requested.
