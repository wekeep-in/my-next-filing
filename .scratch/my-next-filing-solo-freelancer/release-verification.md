# First successor verification record

Checked: 3 September 2026

## Completed on this worktree

- `pnpm verify:release` passed: formatting, lint, typecheck, Rule validation, deterministic assertions, production build, and generated-bundle/header inspection.
- Deterministic assertions cover both presumptive paths, exact cash and receipt boundaries, tax relief and rounding, annual-return and GST triggers, foreign incomplete Coverage, independent stale groups, strict workspace parsing, revision conflicts, completion reconciliation and Needs review, write/removal failure, and bounded deletion.
- Built bundle inspection found no measurement ID, tag loader, remote executable script, or `localStorage.clear()` call.
- Built route smoke checks passed for `/`, `/check`, `/privacy`, and not-found handling. Synthetic journeys reached `/plan`; the save, payment-editor, reload, Completion, undo, stored-envelope, GST-registration, and bounded-deletion paths were exercised in built previews.
- Local production-preview Lighthouse runs scored Performance/Accessibility `92/100` for `/`, `95/100` for `/check`, and `95/100` for `/privacy`. The local HTTP origin only fails the HTTPS-specific audit; no off-origin runtime requests were observed on the final build.
- `pnpm wrangler deploy --dry-run` passed with no bindings and the existing SPA static-assets configuration.
- `pnpm wrangler versions upload --preview-alias successor-2026-09-03` uploaded Cloudflare version `d3e851e2-560c-4aed-baef-930d35205603` without routing production traffic; the preview URL was not returned for inspection.
- Headless Chrome smoke screenshots and DOM checks passed for `/`, `/check`, `/privacy`, and not-found handling at 320, 768, and 1440 CSS pixels; no horizontal-scroll issue was observed in the 320-pixel views.
- The OG card was refreshed to the successor scope and kept at 1200x630 with a compressed same-origin PNG.
- No deferred Tax Year rollover/archive UI or registered-exporter GST calendar was added. Only one local Tax Year dataset exists.

## Release blockers still requiring external or manual evidence

- Qualified Indian privacy review packet approval for the exact saved-workspace configuration.
- Current-stable Firefox, desktop Safari, and iOS Safari journey matrix at 320, 768, and 1440 CSS pixels.
- Deployed-preview Lighthouse, plus keyboard, zoom, reduced-motion, VoiceOver, and desktop screen-reader evidence.
- Five-person moderated comprehension test using synthetic data.
- Cloudflare preview headers/network/offline smoke test, protected-branch release, rollback record, and production smoke test.

## Frontend replacement release evidence

Planning update: 5 September 2026. No new release checks or approvals are recorded by this update. The [frontend plan](../frontend-ideas/implementation-plan.md) carries every blocker above forward to the combined release commit; the historical checks above do not approve the replacement.

- Update the [privacy packet](privacy-applicability-review-packet.md) for automatic current-tab Recovery and opt-in Saved workspaces, then obtain approval for the exact behavior and final copy.
- Run the complete automated gate and refresh official-source compliance review for the release commit.
- Complete current-stable Chrome, Firefox, desktop Safari, and iOS Safari journeys, deployed-preview Lighthouse, keyboard, zoom, reduced-motion and screen-reader checks, and the five-person moderated usability test.
- Exercise restoration and Effect ordering, source switching, unrelated-draft preservation during workspace mutations, failed-write example return, simultaneous storage warnings, unverified removal, and partial-deletion retry after the workspace key disappears. Verify that later renders cannot recreate removed answers.
- Record preview headers, network, offline behavior, deployment, production smoke tests, and rollback evidence against the same commit using synthetic data only.

The replacement intentionally deletes version-1 Saved workspaces without migration or backup. Code rollback cannot restore removed Profiles or Completion records. Keep the prior deployment available for code rollback and test that limitation explicitly.


## Frontend implementation checkpoint

Checked: 5 September 2026, on `frontend-recovery`. These are local implementation checks recorded with the implementation commit, not production release approval.

- Formatting, lint, TypeScript, deterministic Profile/Evaluation/workspace assertions, new frontend assertions, and the production Vite build pass. Frontend assertions cover reducer events and cascades, strict Recovery parsing, storage failures and unverified removal, source selection, all six Plan models, payment preparation, Completion updates, and ordered deletion.
- Chrome 151.0.0.0 exercised the production build at `http://localhost:4174` in an isolated browser context with synthetic inputs. Every nested group restored with its heading and actions; inaccessible groups redirected; unknown and differently capitalized paths showed not-found; Continue pushed history and the interface Back control replaced it.
- Browser checks passed for refresh recovery, failed-write example return, explicit Saved-workspace selection and refresh priority, leaving examples for the Saved workspace, saving and redundant Recovery cleanup, and preservation of unrelated Recovery during saved payment and Completion changes.
- Unsaved payment updates recalculated offline, retained matching Draft values through reload, and enabled no Completion control. Supported plans with no dated actions still offered saving. Successive completions, completion-date editing after all actions were completed, undo, and recovery from another tab's revision conflict passed.
- Completion creation was rejected when the clock moved beyond Rule expiry after rendering, and the Plan changed to its stale state. The action date is captured once and also updates Plan derivation.
- Partial deletion kept its retry after the workspace disappeared. Verified retry left both keys absent without later Effects recreating answers. Unverified removal preserved in-memory work, reported uncertainty, and completed after inspection retry. Legacy deletion failures preserved the remaining value, and successful retry removed only the workspace key.
- Independent storage failures remained visible together; Recovery success did not hide a workspace failure. Recovery retry worked on the landing page without creating a questionnaire. Unrelated storage keys survived the tested operations.
- The Plan and questionnaire reflowed without horizontal overflow at 1440, 1024, and 320 CSS pixels. Desktop and mobile screenshots retained the existing fonts, colors, rail, and actions. The Start-over dialog fit at 320px, focused its safe action, returned focus on cancellation, and preserved answers. Failed Continue focused the first linked invalid field. Existing reduced-motion CSS was inspected; full screen-reader, actual 200-percent zoom, and reduced-motion device checks remain pending.
- The tested core Plan journey requested no off-origin resource, and browser console inspection found no errors. The local automated bundle gate remains red: `scripts/verify-build.ts` detects `sendBeacon` in the bundled Mux player dependency. A fresh archive of pre-change commit `3d8e35b`, built with the same installed dependencies, fails the same original gate. The check has not been weakened; session-storage clearing is now checked alongside local-storage clearing.

Production remains blocked by that bundle gate, qualified privacy approval for the exact automatic-Recovery behavior, refreshed official-source compliance review, the full browser/accessibility/Lighthouse matrix, the five-person moderated test, and deployed-preview/production/rollback evidence from the release commit. No production deployment was performed for this checkpoint.
