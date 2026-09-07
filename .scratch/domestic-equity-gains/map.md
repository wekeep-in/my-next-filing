# Domestic equity capital gains alongside freelancing

Authorized 7 September 2026. Baseline: 8facfbf. Status: implemented and verified locally. See [implementation and verification](issues/01-implementation.md).

## Plan

1. Verify the Tax Year 2026-27 authority and record the bounded calculation in [research](research/equity.md).
2. Extend the existing Profile, local Rules and pure Evaluation with separate short-term and long-term equity gains. Preserve ordinary-income deductions, special-rate tax, return triggers and independent GST coverage.
3. Add a conditional section to Other income, review answers and the existing tax breakdown. Keep unsupported gains explicit and retain legacy stop facts until reviewed.
4. Migrate workspace 6 to 7 and Recovery 5 to 6 in memory. Historical fixtures were captured using the baseline decoders before changing production code. Preserve consent, revisions, completion records and amounts; new Recovery answers stay blank.
5. Verify independent arithmetic, scope, malformed input, stale authority, restoration, branch clearing, privacy, keyboard and responsive behavior. Run the full release command and record results in the implementation issue.

## Scope

Confirmed Indian listed-equity and qualifying Indian equity-oriented mutual-fund investment gains only, with the applicable STT conditions satisfied. Annual gain amounts come from resolved tax records. No transaction processing, loss adjustment, foreign investments, property gains, other funds, derivatives, business trading, buybacks, employee shares, exemption claims or unresolved basis/ownership treatment.

Both gain categories are supported when ordinary income after permitted NPS deductions uses the basic exemption. A single positive category also supports unused basic exemption. Mixed positive categories below that ordinary-income boundary remain subject to review until allocation between categories is established from primary authority. This restriction is a product boundary, not a statement that such taxpayers cannot claim the exemption.

No new dependency, storage key, account, upload, filing action, commit or deployment.

## Verification result

`pnpm verify:release` passed on 7 September 2026: formatting, lint, TypeScript, live Rules, 174 Vitest tests, production build, static bundle/header checks and 86 Playwright cases. The existing WebKit video case is skipped; all 15 new equity browser cases pass. No deployment or commit.
