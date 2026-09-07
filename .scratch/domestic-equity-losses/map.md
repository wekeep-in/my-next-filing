# Current-year domestic equity losses

Status: implemented and verified on 8 September 2026. Authorized by the attached objective on 7 September. See the [implementation and completion audit](issues/01-implementation.md).

## Plan and acceptance

1. Verify current-year adjustments, carry-forward conditions and mixed-gain basic exemption against primary authority. See [research](research/losses.md).
2. Extend the existing domestic equity branch with separate non-negative short-term and long-term loss totals. Keep the same instruments and resolved annual records. Gains and losses are entered before set-off; no netting a broker's net gain a second time.
3. Apply long-term losses only to long-term gains, short-term losses to short-term gains then remaining long-term gains. Carry no capital loss into ordinary income. Show every applied amount, remaining gain and unused loss. Apply basic exemption and the long-term threshold after loss adjustment.
4. Retain the mixed-gain exemption restriction only if both gain categories remain positive after set-off and ordinary income leaves unused basic exemption. It must not block cases reduced to one category or zero gains.
5. Show unused losses outside the collapsed arithmetic breakdown. Reuse the annual-return action for timely loss filing, with explicit conditional wording about claiming carry-forward, the reviewed deadline, eight-year limit and determination requirement. Do not promise approved carry-forward or apply losses in later years. Stale annual-return evidence withholds its dates/guidance while retaining independent tax arithmetic and an explicit review notice.
6. Migrate workspace 7 to 8 and Recovery 6 to 7. Fixtures were captured from the existing writers before application edits. Preserve original values, revision, consent and completions. Confirmed old equity scope explicitly excluded losses and can migrate to zero losses; uncertain or legacy-blocked facts remain blocked. Recovery's new loss fields stay blank and its expanded equity confirmation must be reviewed.
7. Verify arithmetic, ordering, filing, rejected cases, source freshness, migrations, field clearing, browser save/reload, keyboard, responsive layouts, and privacy. Run `pnpm verify:release` and record the requirement-by-requirement completion audit.

## Boundaries

No brought-forward losses, foreign investments, derivatives/F&O, new investment classes, transaction computation, uploads, remote data, or new storage keys. Existing generic capital-gain/loss stop facts survive until explicitly corrected. The pending GST/LUT authority refresh remains intact.

## Verification

`pnpm verify:release` passed on the final implementation: 208 Vitest tests, build and static bundle checks, and 101 Playwright cases. The existing WebKit video case is skipped; all 15 new equity-loss browser cases passed. No test was retired. Changes remain uncommitted and undeployed.
