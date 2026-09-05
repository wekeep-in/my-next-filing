# Solo-freelancer successor implementation plan

Status: original implementation complete; frontend state, routing, Recovery-draft, and workspace-version instructions superseded by [the frontend redesign plan](../frontend-ideas/implementation-plan.md)

Source specification: [My Next Filing solo-freelancer successor specification](successor-spec.md)

Decision record: [Solo-freelancer Wayfinder map](map.md)

## Working rule

Implement the first successor as one replacement journey on an implementation branch. Keep production on the current release until the release candidate passes every gate. Use Cloudflare previews for integration checks. Do not add a runtime feature-flag system or second public beta.

Use the existing platform and dependencies first. No work item approves a state library, storage library, component system, motion package, Cloudflare binding, or server module. Tests exercise the public module interfaces and observable route behavior rather than private helpers.

Each work item below ends with its acceptance criteria. A later item may start only when its listed dependencies pass. Qualified privacy review can run beside implementation, but it blocks production release.

## Dependency order

| Order | Work item | Depends on | Release |
| ---: | --- | --- | --- |
| 0 | Adopt the successor specification | Wayfinder complete | First successor |
| 1 | Freeze reviewed Rule inputs | 0 | First successor |
| 2 | Replace the Profile and Rules contracts | 1 | First successor |
| 3 | Implement Evaluation and Obligation derivation | 2 | First successor |
| 4 | Implement the pure workspace model and browser storage | 2, 3 | First successor |
| 5 | Rebuild the questionnaire around Profile branches | 2, 3 | First successor |
| 6 | Remove remote runtime access and add privacy controls | 4 | First successor |
| 7 | Build the focused saved workspace and Completion flow | 4, 5, 6 | First successor |
| 8 | Add the optional generic share action | 6 | First successor, optional |
| 9 | Verify and release the first successor | 1 through 8, qualified privacy review | First successor |
| 10 | Add Tax Year rollover and archives | 4, 7, current next-year Rules | Next Tax Year slice |
| 11 | Add the registered-exporter GST calendar | 3, 4, 7, new GST compliance review | Later GST slice |

## Work item 0: adopt the successor specification

### Changes

- Replace the root `SPEC.md` with `successor-spec.md` on the implementation branch. Preserve the current specification through version control.
- Change the specification status from implementation-ready draft to approved for implementation.
- Update `AGENTS.md` so it describes the planned Solo freelancer Profile, optional current-browser Saved workspace, Completion records, and continued no-backend boundary.
- Keep `CONTEXT.md` as the controlled glossary. Remove its temporary current-versus-successor note after the successor specification becomes authoritative.
- Add one README pointer to the new scope and leave detailed behavior in the specification.

### Acceptance

- The root specification and `AGENTS.md` agree about scope, persistence, Analytics, and infrastructure.
- No source code behavior changes in this item.
- `git diff --check` passes.

## Work item 1: freeze reviewed Rule inputs

### Changes

- Run the repository compliance-review workflow against current direct official Sources.
- Verify both presumptive paths, Tax Year 2026-27 calculation rules, annual-return triggers, advance-tax behavior, GST registration, foreign-client boundaries, Sources, extensions, and expiry dates.
- Record the review date, direct URLs, provision or notification, effective period, and any changed value.
- Stop this item on any S0 or S1 finding. Update the specification and decision record before code if official authority changes a settled product boundary.
- Start the qualified privacy review with the existing packet. Treat its response as a release dependency, not a statutory Rule input.

### Acceptance

- Every Rule planned for the first successor has current direct authority and an expiry or mandatory review date.
- The review records "No findings" or lists resolved findings with evidence.
- No unverified extension, tutorial, foreign-export date, or future form enters the Rule dataset.

## Work item 2: replace the Profile and Rules contracts

### Changes

- In `src/evaluation/index.ts`, replace the boolean-heavy current Profile with the shared facts and discriminated `incomePath`, `clients`, and `gst` branches from the specification.
- Add strict `parseProfile(unknown)`. Reject unknown fields, unsafe numbers, fractional or negative rupees, invalid dates, duplicates, and impossible cross-field values.
- Keep questionnaire draft types route-local. They may contain empty display strings and must not be accepted by Evaluation.
- In `src/rules/index.ts`, replace the monolithic Rule shape with one dataset per Tax Year and independently validated income-path, common-income-tax, advance-tax, annual-return, and GST-registration groups.
- Keep one Source registry. Add explicit Rule-to-Source provenance roles. Retain normal and operative dates separately.
- Expose only `parseProfile`, `evaluate`, local datasets and Sources, exact-year selection, and `validateRules` from the domain modules.
- Extend the existing Node assertion checks. Use table-driven boundary cases instead of one test function per field.

### Acceptance

- Both complete income paths and all client/GST branches parse into exactly one type.
- A draft, old Profile shape, malformed restored value, or unsupported cross-field combination cannot enter `evaluate` through a type assertion in production code.
- Each Rule group can fail independently and every required Rule has direct provenance.
- `pnpm rules:validate`, `pnpm test`, and `pnpm typecheck` pass.

## Work item 3: implement Evaluation and Obligation derivation

### Changes

- Keep one `evaluate(profile, currentDate, validatedRules)` function and private path-specific calculation helpers.
- Implement Specified professional and Eligible business presumptive income, common new-regime calculation, credits, rounding, and the ₹50-lakh stop.
- Replace nullable partial results with tagged Coverage for annual return, GST, and foreign-account or return guidance.
- Return stable unsupported codes and correction-group identities for every stop fact.
- Derive only the first-release Obligations: advance tax, annual return, and conditional GST registration.
- Return all applicable Obligations. Remove route-level `nextObligation`; the workspace selector will choose what remains.
- Keep amounts only on advance tax. Keep Deadline status independent from Completion.
- Build expected values independently from the official Rules. Do not use Evaluation to generate test expectations.

### Acceptance

- The complete evaluation matrix in the successor specification and verification ticket passes at exact threshold edges.
- A stale core group produces no estimate. A stale independent group suppresses only that area and its Obligations.
- Domestic, foreign, mixed, direct, and supported platform paths reach Supported without weakening any core stop.
- Possible foreign-account facts produce Incomplete coverage only when arithmetic is otherwise fixed.
- No route calculates money, selects a path, or decides applicability.

## Work item 4: implement the workspace model and storage

### Changes

- Add `src/workspace/index.ts` as the only workspace and localStorage seam.
- Implement strict version-1 envelope parsing for `my-next-filing:workspace`.
- Implement `loadSavedWorkspace`, `saveSavedWorkspace`, `deleteSavedWorkspace`, and pure `deriveWorkspaceView` with the tagged outcomes in the architecture decision.
- Store the exact approved fields. Do not store drafts, examples, results, Rule values, Deadline status, rendered copy, or extra identifiers.
- Compare revisions immediately before whole-envelope writes and deletion. Listen for the exact-key storage event in the app shell.
- Preserve invalid raw data until deliberate deletion. Preserve current valid in-memory work on storage failure.
- Represent the Active Tax Year as an identity plus nullable saved record, with Open and Archived records in the prior-year collection. Remove the complete key when both are empty.
- Implement composite Completion matching, Needs review, cross-year agenda sorting, and advance-tax reconciliation in the pure selector.
- Keep version 1 free of migration machinery. Reject unknown versions. Add migration code only when a real version 2 exists.

### Acceptance

- The workspace test matrix covers absent, ready, invalid, unavailable, conflict, exact-key deletion, write failure, and storage event behavior.
- No failure leaks a Profile or amount into a thrown/logged/display reason.
- Two stale tabs cannot silently auto-merge. A detected revision mismatch leaves the stored value untouched.
- `removeItem('my-next-filing:workspace')` is the only whole-workspace deletion operation. No code calls `localStorage.clear()`.
- Deleting the Active saved record retains prior years and returns the Active period to a blank check; deleting the last remaining record removes the key.
- Workspace derivation is pure and routes do not persist its output.

## Work item 5: rebuild the questionnaire

### Changes

- Keep `/check` and the existing route-local React state pattern.
- Reorganize the flow into the seven groups in the successor specification.
- Show only branch-relevant fields. Use native controls and the existing money parser/Indian grouping behavior where it remains correct.
- Add explicit path, client, platform, foreign-receipt, GST, annual-return, and unsupported-fact confirmations.
- Add `Not sure` where uncertainty changes support or Coverage.
- Use `parseProfile` at the final review boundary. Render its structured field/group errors and focus the first error.
- Preserve values on back/edit. Do not save draft progress.
- Keep the synthetic example as a separate demonstration. `Use my information` clears it and starts a blank personal check. Do not add per-field example provenance.

### Acceptance

- Every public Profile branch can be entered without seeing irrelevant questions.
- No occupation label silently selects a statutory path.
- No client, platform, country, account, invoice, document, foreign-currency amount, or free text is collected.
- Unsupported and Incomplete-coverage corrections return to the exact group without losing in-memory answers.
- Refresh clears an unsaved questionnaire.

## Work item 6: remove remote access and add privacy controls

### Changes

- Delete `src/analytics.ts`, remove its app-shell import, and remove every Google Analytics reference from runtime copy and configuration.
- Remove the unused confetti dependency from `package.json` and lockfile.
- Add `/privacy` with the exact current behavior and qualified-review copy.
- Make stop saving delete the complete workspace after confirmation.
- Keep whole-workspace deletion available from the privacy page, stale-rules state, and invalid-storage state. Add the workspace entry point in work item 7 and per-year deletion when the Tax Year slice ships.
- Extend `public/_headers` with the same-origin CSP and security headers from the specification while preserving HLS MIME behavior.
- Review the built bundle and network panel for remote scripts, beacons, Profile requests, and Source prefetch.

### Acceptance

- The source, lockfile, production bundle, DOM, and runtime network contain no measurement ID, `gtag`, Tag Manager, session replay, error-reporting SDK, or remote executable script.
- All runtime assets are same-origin and the deployed CSP blocks an attempted off-origin script.
- No Profile, amount, Evaluation, Tax Year selection, Completion, or save-state value enters a URL, title, log, clipboard payload, error payload, or external link.
- The privacy and deletion text matches the qualified review. A failed removal does not claim success.

## Work item 7: build the focused workspace and Completion flow

### Changes

- Keep `/plan` for transient results and restored workspaces. A refresh restores only after valid saved data; otherwise it returns to `/check`.
- Implement the selected focused-timeline layout with one main attention card, chronological agenda, Coverage, Review actions, and compact Tax Year control.
- Make the landing CTA generic. It may reveal that a valid workspace exists but must not reveal its values.
- Add the save notice after the first non-example Supported result. Keep continue-without-saving equally available.
- Add Completion confirmation with the native date input, change date, undo, Needs review, and permanent non-verification copy.
- Use `Update payment` for advance tax until fresh Evaluation shows zero remaining.
- Keep Coverage/Review actions outside open and completed counts.
- Handle Unsupported, stale core Rules, stale area Rules, invalid storage, storage conflict, and write/delete failure as designed.
- Add workspace deletion entry points and keep restrained CSS feedback and reduced-motion behavior.

### Acceptance

- New, returning, foreign-client, GST-registered, Unsupported, stale-rules, invalid-storage, and no-open-item journeys match the successor specification.
- The earliest provable open Obligation is the main action. A stale Active or Open year takes priority when the overall earliest item cannot be proven.
- Completion never changes the tax result. A matching record and its current Deadline status can appear together.
- Desktop and 320-pixel layouts keep the main action before full year management.
- Keyboard and screen-reader users can save, resume, complete, change, undo, and delete.

## Work item 8: add the optional generic share action

### Changes

- Add `Share My Next Filing` only to the public landing page.
- Keep its fixed title, text, and canonical URL in the landing module. Use native Web Share and Clipboard APIs with no new dependency.
- Preview the generic payload before invoking native share.
- Treat native cancellation as no-op. Show copy/share success only after the browser operation succeeds.

### Acceptance

- Native success, native cancellation, copy fallback, and copy failure match the specification.
- The shared payload is byte-for-byte fixed and contains no current route, query, fragment, referral, Profile, result, amount, deadline, Tax Year, Completion, or saved-state value.
- No share event or identifier is recorded.
- If this item misses its gate, remove the action and release the core loop.

## Work item 9: verify and release the first successor

### Changes

- Add one CI verification command that runs formatting check, lint, typecheck, Rule validation, deterministic tests, and production build once each.
- Complete the automated matrix without component snapshots or a second calculator.
- Run the production-build browser journeys with synthetic data in the required browsers and viewports.
- Run Lighthouse, keyboard, zoom, reduced-motion, VoiceOver, and desktop screen-reader checks.
- Complete the five-person moderated test and record aggregate results only.
- Obtain the completed qualified privacy packet and final compliance review for the exact release commit.
- Deploy the same commit to a Cloudflare preview, inspect headers/network/storage/deep links, then release from the protected branch and smoke-test production.

### Acceptance

- Every mandatory gate in the successor specification passes from the same commit.
- At least four of five participants finish the whole loop without help. All five understand current-browser saving and non-verified Completion.
- The prior Cloudflare deployment remains available for rollback.
- Production smoke tests use synthetic data and record no real taxpayer Profile.

## Work item 10: add Tax Year rollover and archives

### Changes

- Start only after current Rules for the next Tax Year pass compliance review and Rules validation.
- Add the approved rollover draft suggestions while clearing every amount and reconfirmation.
- Support one Active year, Open prior years, combined agenda derivation, stale-year attention, archive eligibility, read-only archive display, and per-year deletion.
- Keep the version-1 envelope if it already represents multiple years. Change its schema only if the real stored shape must change. If it changes, add the single explicit migration and frozen prior-version fixture.

### Acceptance

- No amount, Completion record, legal confirmation, Rule, Coverage, date, or result carries forward.
- Unfinished prior work stays visible beside the new Active year.
- Archives contain only the approved saved user data and provenance, remain immutable, and never recalculate.
- Migration failure leaves the prior serialized value byte-for-byte intact.

## Work item 11: add the registered-exporter GST calendar

### Changes

- Run a new compliance review for the exact GST periods, LUT conditions, monthly/QRMP cadence, state grouping, extensions, export conditions, FEMA transition, and GSTR-9 status.
- Add the GST calendar/LUT Rule groups only after that review.
- Extend the Profile only with the minimum one-state, normal-taxpayer, cadence, LUT, and first-export facts. Do not store a GSTIN value.
- Add the approved LUT, GSTR-1, GSTR-3B, and conditional QRMP payment-review Obligations to the same Evaluation and workspace agenda.
- Extend the structured composite identity for GST periods before enabling Completion.

### Acceptance

- Monthly and complete QRMP calendars pass exact period and extension boundary cases.
- IFF remains optional guidance, not an Obligation.
- No GST payable, ledger, credit, refund, fee, interest, penalty, preparation, upload, or submission logic exists.
- Multiple/uncertain registrations and unsupported taxpayer states make GST Coverage unavailable without corrupting an independent valid income-tax result.

## Final completion criteria

The implementation effort is complete only when:

- the root specification describes shipped behavior;
- the first successor loop works without a backend or remote runtime script;
- Profile and money values remain in the browser and out of URLs, logs, Analytics, sharing, and external requests;
- every calculation and dated conclusion uses current validated Rules and direct Sources;
- stored data survives only through explicit consent, strict parsing, revision checks, and bounded deletion;
- Completion remains a user declaration separate from tax and government status;
- the selected focused UX passes the target-user, accessibility, browser, privacy, statutory, and Cloudflare release gates; and
- deferred Tax Year and GST slices remain absent until their own prerequisites pass.
