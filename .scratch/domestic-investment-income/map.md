# Domestic investment income and established conclusions

## Objective

Support ordinary Indian-company dividends, taxable Indian mutual-fund distributions, taxable post-office interest and income-tax refund interest alongside the existing freelance and optional salary paths. Preserve established annual-return and GST-threshold conclusions when another independent fact is unknown.

## Recent-commit analysis before implementation

Baseline: f29fc73, the previous GST and copy slice. Reviewed the ten commits through 4c5b4d1 before beginning application changes.

| Commits | Change | Constraint on this slice |
| --- | --- | --- |
| 06069c7 and planning 6fbf45c | Public searchable Resources directory, independently reviewed catalogue, passive entry, lazy screen modules | New relevant source metadata must fit the catalogue. Preserve search privacy, draft/workspace round trips and lazy loading. |
| b0a32ed and 14f2d37 | Vitest Node/Browser, Playwright, Lighthouse, local test conventions | Add named cases under tests/unit, tests/browser or tests/e2e at the appropriate boundary. Do not restore removed verification scripts. Capture current historical storage envelopes before changing their schema. |
| b8bd417 | FAQ buttons and links use the same styling | Reuse existing HelpModal, ExternalLink and button primitives. |
| bc4a8f9 and 941852d | Fixed official portal destinations and tutorials for actions | New income uses existing income-tax actions. Preserve portal links, period privacy and source/tutorial distinction. |
| 8521450 | Compact next action, Due by summary, native disclosures, quiet save footer, full consent dialog and contained errors | Extend the tax breakdown and structured conclusions without rebuilding the main card or restoring inline consent. Preserve dialog focus and error recovery. |
| 4c5b4d1 | Responsive resource-filter spacing | No changes to resource filter geometry are needed. |
| 98e173e | Shorter README | Read commands from package.json and runner configuration. |

The worktree was clean. This was an integration analysis of the recent changes, not a full repository audit. No unrelated fix or redesign is proposed.

## Plan

1. Verify Tax Year 2026-27 income treatment, narrow supported categories, credits, timing and GST separation in [income research](research/income.md); verify the two independent-conclusion changes in [conclusion research](research/known-conclusions.md).
2. Update the specification and local Rules. Extend the existing Profile and other-income form with explicit optional income categories and records confirmation. Keep excluded special income separate.
3. Include the new amounts in combined income, ceiling checks, credits and the calculation breakdown. Preserve positive filing/registration conclusions without inventing missing dates or negative outcomes.
4. Migrate historical browser data without deleting answers, inferring new income, or losing completion dates. Keep current consent and portal flows.
5. Add focused Vitest and built-app Playwright checks, run required verification, and record evidence and limitations in an implementation issue.

## Status

Implemented and verified on 7 September 2026. The full verification command passed 115 Vitest tests and 51 Playwright cases, plus lint, types, Rules and build checks. See [implementation and verification](issues/01-implementation.md).

No deployment or commit requested for this slice. Separate concurrent plan-delete and demo-video edits were preserved.
