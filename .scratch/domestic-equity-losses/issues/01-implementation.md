# Current-year domestic equity loss support

Status: implemented and verified on 8 September 2026. Not committed or deployed.

## Result

The existing domestic equity branch accepts resolved annual gains and current-year losses for the same supported Indian listed shares and equity-oriented mutual funds. It records four non-negative totals, applies permitted loss set-off, displays each adjustment and remaining balance, and adds explicit timely-return/carry-forward guidance when a loss remains unused. A portfolio no longer stops solely because it contains an allowable current-year loss.

Long-term losses use only long-term gains. Short-term losses use short-term gains first and then remaining long-term gains. Unused losses do not reduce salary, freelance/business income, interest, dividends or NPS capacity. Set-off precedes the basic-exemption and long-term-threshold calculations. The original mixed-gain exemption restriction now checks the remaining gain categories, permitting formerly blocked portfolios reduced to one or no positive categories.

Unused losses appear beside the estimate before the collapsed breakdown. The existing annual-return action explains that timely filing is required to claim carry-forward, even when tax is zero or no other return trigger is established. It names the conditional purpose and preserves its existing identity. The notice explains category restrictions, eight following Tax Years, return verification and loss determination. Neither saved completion nor calculated unused amounts establish approved carry-forward. Independently stale filing evidence removes the date and carry-forward conclusion, while the unused-loss notice and valid tax arithmetic remain.

Workspace schema 7 migrates to 8; Recovery 6 migrates to 7. Captured historical inputs remain under `tests/fixtures/workspace-v7.json` and `tests/fixtures/recovery-v6.json`. Confirmed old gain-only scope supplies zero losses; ambiguous or legacy-blocked profiles remain blocked. Recovery retains gain amounts, leaves loss amounts and the expanded confirmation unanswered, and resets an old gains-only No. Reads do not write; normal saves persist the migrated schema. All four amounts clear on deselection. Prior-year states, consent, revisions and Completion records survive.

## Requirement-by-requirement audit

| Requirement | Current evidence |
| --- | --- |
| Same instruments, annual records, no new income category or transaction calculation | `EquityGains` extends its existing domestic branch; the form and help retain STT, instrument, ownership and resolved-record conditions. No transaction, currency, instrument-identity or upload fields were added. |
| Four separate buckets | Strict parsing requires both gain and both loss amounts; questionnaire, review, Recovery and workspace round trips include all four. Zero, missing, negative, fractional, unsafe and unknown-field cases are tested. |
| STCL against STCG or LTCG, LTCL against LTCG only | `calculateTax` exposes the three permitted applied amounts. Named independent cases in `tests/unit/equity-losses.test.ts` verify same-category, cross-category, restricted and unused amounts. |
| Capital losses cannot offset non-capital income | Unit cases preserve ordinary income, salary, NPS, dividends and GST. The eligible-business case verifies losses and actual credits together. |
| Gains, losses, applications, remaining taxable gains and unused losses visible | `TaxSummary` renders source totals, three applied amounts, remaining gains, final tax bases and unused balances. Production-browser assertions check exact labelled values. |
| Unused loss is not hidden by zero tax | The loss-only browser journey proves the notice is visible while arithmetic is collapsed, with the dated conditional filing action, balances, eight-year period and determination requirement. The saved plan retains them after reload. |
| Timely filing and carry-forward conditions | `AnnualReturnRules.capitalLossCarryForwardYears`, annual-return provenance and the conditional trigger implement sections 111, 121 and 263. The primary review and visual due-date-table check are in [research](../research/losses.md). |
| Brought-forward losses, derivatives, foreign investments and unresolved records remain excluded | Existing stop facts are retained, scope No/Not sure blocks otherwise well-formed four-bucket profiles, extra brought-forward fields are rejected, and the form/help explicitly list the exclusions. No new gain/loss category was added. |
| Investigate mixed-gain basic exemption without blocking independent loss support | Research rechecks sections 196/198 and official guidance without finding a clear combined-allocation priority. Unit and browser tests prove that loss adjustment can eliminate the old block, while a remaining ambiguous two-category case is still withheld. |
| Conservative missing/stale evidence behavior | Missing core loss-set-off provenance stops the estimate. Missing, stale or invalid annual carry-forward evidence withholds only filing guidance. Rendered-markup tests prohibit stale deadline/eight-year claims while keeping unused amounts visible. |
| Existing model and browser data preserved | No dependency, storage key or parallel evaluator. Historical workspace/Recovery and prior-year migration tests preserve records and reject mixed schemas. Production-browser migrations verify that reads do not rewrite storage. |
| Responsive, keyboard and privacy requirements | Inspected 1440px, 1024px and 320px screenshots. Existing help focus tests, reduced-motion keyboard branch clearing, overflow checks and synthetic request/storage assertions passed across the three browser projects. |
| Pending GST authority refresh preserved | Dataset v10 retains the 7 September GST/LUT review and 31 October expiry. Its independent renewal and expiry regressions pass alongside the loss changes. |

## Verification

Final `pnpm verify:release` exited successfully. Formatting, lint, TypeScript, live Rule validation, all 208 Vitest tests, production build and static bundle/header checks passed. Playwright passed 101 cases; the one skipped case is the existing WebKit video test. All 15 new loss journeys passed in Chromium, Firefox and WebKit. The loss suite adds 33 Vitest cases, including the rendered stale-guidance and migration checks.

The first focused browser run had one test-selector failure: the conditional return title correctly appeared in both the next-action card and agenda. The assertion was scoped to the main level-two heading; no application behavior or assertion meaning was weakened. The initial full run passed, and the final full run also includes the two additional audit checks for eligible-business credits and well-formed unconfirmed scope.

Current test clocks moved to 8 September to match the new statutory review. Historical JSON inputs and explicit expiry tests remain historical; two future-date cases moved to 9 September so they still test future values. Existing gain-only tests enter explicit zero losses and assert the current output schema versions. No tests were deleted or newly skipped.

Evidence: `artifacts/equity-loss-release-final.log`, `artifacts/vitest/results.xml`, and `artifacts/playwright/report/`. New form and unused-loss screenshots are in `artifacts/playwright/results/` under the equity-loss journeys. Official-source artifacts are in `artifacts/equity-loss-research/`. The pre-existing bundled-video chunk advisory remains; this work makes no new Lighthouse, external professional approval or deployment claim.
