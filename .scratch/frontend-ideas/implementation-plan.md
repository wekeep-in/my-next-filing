# Frontend state, routing, and recovery implementation plan

Status: implementation in progress on `frontend-recovery`

Source specification: [Frontend state, routing, and recovery specification](spec.md)

## Working rule

Implement on one branch and release once. Keep every work item independently reviewable and green, but do not deploy an intermediate item to production. Use synthetic Profile values only.

Add deterministic assertions with each work item that introduces behavior. Work item 8 runs the accumulated checks and completes release evidence; it is not the first testing step. Keep the accepted version-1 deletion policy without migration or backup.

Before changing TypeScript, apply `.agents/skills/code-conventions`. Apply `.agents/skills/write-ux-copy` to every interface string. This effort changes no statutory Rule, rate, threshold, obligation, support decision, or calculation.

## Dependency order

| Order | Work item | Depends on |
| ---: | --- | --- |
| 0 | Adopt documentation and freeze behavior | Interview complete |
| 1 | Add shared questionnaire and date primitives | 0 |
| 2 | Implement the questionnaire reducer | 1 |
| 3 | Implement Recovery-draft storage | 1, 2 |
| 4 | Replace Saved-workspace schema 1 with schema 2 | 0 |
| 5 | Install application ownership and nested routes | 2, 3, 4 |
| 6 | Derive the Plan model and coordinator | 2, 4, 5 |
| 7 | Complete notices, source selection, and destructive flows | 3, 4, 5, 6 |
| 8 | Verify the combined release | 1 through 7 |

## Intended file changes

| Path | Change |
| --- | --- |
| `src/lib/india-date.ts` | Add the one injected-date conversion |
| `src/routes/check/model.ts` | Keep Draft conversion, add metadata, selectors, and structured validation |
| `src/routes/check/session.ts` | Add questionnaire state, events, reducer, and completion transitions |
| `src/recovery-draft/index.ts` | Add strict Recovery codec and `sessionStorage` operations |
| `src/routes/check.tsx` | Replace monolithic step orchestration with the `/check` layout |
| `src/routes/check/*-step.tsx` | Consume reducer dispatch and shared selectors through route context |
| `src/routes/plan/model.ts` | Add Plan source and derived Plan-model unions |
| `src/routes/plan/coordinator.ts` | Add the route-scoped Plan coordinator |
| `src/routes/plan.tsx` | Render the derived Plan model and interaction union |
| `src/app.tsx` | Own shared session, example return snapshot, storage lifecycle, source selection, temporary Notices, and derived persistent warnings |
| `src/workspace/index.ts` | Add schema 2, legacy deletion, and the smaller derivation interface |
| `src/components/journey-sidebar.tsx` | Use canonical group metadata and route navigation |
| `src/components/landing-faqs.tsx` | Explain automatic Recovery and revised deletion behavior |
| `src/routes/landing.tsx` | Render source-aware generic entry actions |
| `src/current-check.ts` | Delete after all callers move to the reducer |
| `scripts/verify-frontend.ts` | Add deterministic frontend verification |
| `scripts/verify.ts` | Update only shared imports and schema fixtures required by the new contracts |
| `scripts/verify-build.ts` | Extend storage and private-route leak checks where static inspection can prove them |
| `package.json` | Run both assertion scripts from `pnpm test` |
| `src/styles.css` | Add only styles required for existing-pattern Notices and shared destructive controls |

Do not create a schema renderer, generic storage hook, state-machine wrapper, command executor, or second provider.

## Work item 0: adopt documentation and freeze behavior

Status: complete

### Changes

- Make the accepted root `SPEC.md` amendments from the scratch specification.
- Keep `CONTEXT.md` limited to the Recovery-draft term.
- Mark ADRs 0001 through 0004 accepted.
- Link this specification and plan from `.scratch/frontend-ideas/map.md`.
- Record the version-1 deletion and rollback limitation in release documentation.
- Freeze the source-selection and synchronization-lifecycle tables before storage integration.
- Update the existing privacy packet for automatic Recovery, opt-in Saved workspaces, exact deletion scope, and absence of Analytics. Carry every outstanding release gate into this effort's evidence checklist.

### Acceptance

- Root and scratch specifications agree about routes, Recovery drafts, Saved workspace, schema versions, deletion, privacy approval, and release shape.
- No unresolved decision remains in the scratch documents or ADRs.
- The privacy packet describes the proposed behavior; its approval and the existing manual release gates remain pending.
- `git diff --check` passes.

## Work item 1: add shared questionnaire and date primitives

Status: complete; shared primitives and frontend assertions pass lint, typecheck, and tests

### Changes

- Add `indiaDate(now: Date): DateOnly` and move every duplicate India-date conversion to it.
- Capture `new Date()` once per workflow entry or action and pass it through.
- Add the ordered `questionnaireGroups` metadata using `ProfileGroup` identities and current navigation labels.
- Replace numeric group mappings in questionnaire and Plan correction paths.
- Add repeated branch selectors for business path, platform work, foreign clients, age-band requirement, and unregistered GST.
- Change validation to return `DraftError[]` with field, group, and message.
- Add pure `isBlankDraft`, `firstIncompleteGroup`, `canOpenGroup`, and Draft-completion functions.
- Preserve `candidateFromDraft` and `parseProfile` as the final Profile seam.

### Acceptance

- One India-date implementation remains.
- One ordered group definition controls navigation, routes, correction links, and validation order.
- No repeated branch condition covered by the five initial selectors remains in UI, validation, conversion, or review code.
- Draft completion returns a Profile only through `parseProfile`.
- Existing Evaluation results remain byte-for-byte equivalent for current fixtures.
- `pnpm lint`, `pnpm typecheck`, and `pnpm test` pass.

## Work item 2: implement the questionnaire reducer

Status: complete; intent events replace route patches and reducer assertions pass lint, typecheck, and tests

### Changes

- Add nullable session state, the `editing` and `complete` questionnaire states, and the `personal`, `example`, and `saved-edit` origins. Null means no active questionnaire.
- Add named session, independent-field, amount, cascading-choice, validation, completion, and Profile-replacement events.
- Move every dependent reset from route components into reducer branches.
- Clear all abandoned branch values listed in the specification.
- Keep `validationGroup` as the only validation state and derive its errors.
- Keep the URL group, storage results, Evaluation, Plan, focus, motion, and Notices out of reducer state.
- Add restoration of an exact example return snapshot and clearing of a committed or deleted session.
- Add exhaustive reducer assertions for every event, no-op, and cascade.

### Acceptance

- No route component constructs a multi-field cleanup patch.
- No reducer event accepts `Partial<Draft>`.
- Every state transition returns a valid state without side effects or mutation; no-ops may preserve identity.
- `complete` is impossible without both Draft and parsed Profile.
- Hidden branch values are absent after their controlling choice changes.
- Reducer tests pass under repeated identical events.

## Work item 3: implement Recovery-draft storage

Status: complete; strict Recovery codec, verified storage operations, and synchronization eligibility assertions pass; Effect wiring follows in item 5

### Changes

- Add the exact `my-next-filing:recovery-draft` envelope and tagged load, write, and delete results.
- Implement `parseRecoveryDraft` with exact keys, origin and revision consistency, Tax Year matching, known choices, unique known unsupported facts, valid date shapes, and 32-character money-string bounds.
- Accept incomplete Drafts without weakening the parser.
- Catch storage access, JSON, quota, security, serialization, write, readback, and removal failures.
- Skip identical writes and verify changed writes and deletions.
- Remove an invalid Recovery value when possible and distinguish removal failure.
- Distinguish a verified remaining value from unverified deletion after a successful removal and failed readback. Pause affected writes and retry inspection without recreating removed values.
- Implement and assert the synchronization eligibility rules; wire the React Effect in work item 5 after restoration and source ownership exist.
- Keep complete, Unsupported, and stale-rules Drafts recoverable.

### Acceptance

- Every tagged storage outcome has a deterministic assertion.
- Invalid or unknown Recovery input never reaches the reducer or Evaluation.
- An unrelated `sessionStorage` key survives every operation.
- Examples, Profile objects, Evaluation, routes, errors, and UI state never enter the serialized value.
- Repeated identical synchronization requests perform at most one changed write.
- Storage failure leaves the current in-memory Draft usable.
- A removal followed by a throwing read returns unverified, preserves memory, and blocks writes until inspection resolves the outcome.

## Work item 4: replace Saved-workspace schema 1 with schema 2

Status: pending

### Changes

- Change the envelope and strict decoder to schema version 2 without adding fields.
- Increment `STORAGE_NOTICE_VERSION` to 2.
- Make schema-version-1 detection return a legacy state without parsing it into an active workspace.
- Add a verified exact-key legacy deletion operation that rereads the value and confirms version 1 immediately before removal.
- Retry deletion on every version-1 encounter and never create a backup or migration.
- Return distinct legacy-removal-failed and legacy-removal-unverified outcomes for a verified remaining value and unreadable post-removal state.
- Block workspace writes while legacy or invalid data remains or deletion is unverified.
- Remove the unused `currentIndiaDate` parameter and array input from `deriveWorkspaceView`.
- Keep keyed multi-year Evaluation input and all existing completion reconciliation.

### Acceptance

- Version 1 is never evaluated, migrated, overwritten, or returned as ready.
- Verified version-1 removal affects only `my-next-filing:workspace`.
- A verified remaining legacy value stays untouched. An unverified removal makes no preservation claim. Both outcomes block new workspace writes and offer inspection retry without restoring a backup.
- Version 2 round-trips every currently approved workspace field.
- Unknown and malformed non-version-1 values retain the existing deliberate-deletion behavior.
- Workspace derivation accepts one keyed input shape and produces the existing valid fixture results.

## Work item 5: install application ownership and nested routes

Status: pending

### Changes

- Hoist the nullable questionnaire reducer, example return snapshot, Recovery result, Saved-workspace result, temporary source selection, and temporary Notice state into `AppFrame`.
- Extend or replace the current outlet context with typed read and dispatch hooks used by routes.
- Configure `/check` as a layout with seven explicit static child routes and an index redirect.
- Add known-group access correction and an unknown-child not-found route.
- Implement the chosen push and replace history rules.
- Initialize personal, example, Saved-edit, restored Recovery, and empty states without overwriting an existing Recovery draft implicitly.
- Implement the source-selection table: explicit selection overrides personal work for this document, returning clears that override, and refresh restores Recovery priority.
- Capture the latest personal or Saved-edit session before example entry and restore it on return, including answers whose Recovery write failed.
- Wire the Recovery Effect to the lifecycle table only after initial reads and source selection. Pause it for examples, workspace selection, and deletion; clear committed or deleted sessions before cleanup can trigger another write.
- Move group scroll, focus, and motion behavior to route transitions.
- Remove every `current-check` caller, delete `src/current-check.ts`, and remove forced rerenders.

### Acceptance

- Refresh at each valid questionnaire route restores the Draft and route when accessible.
- Bare `/check`, complete Draft, inaccessible known group, and unknown group resolve exactly as specified.
- Browser Back and the interface Back control follow their separate policies.
- Example state never enters storage. Entry and edits leave personal Recovery untouched; return restores the latest in-memory answers, and refresh follows the specified personal restoration or blank-start behavior.
- Personal edit → failed Recovery write → example → return restores the exact latest answers. Repeated example entry does not replace the return snapshot with example state.
- In the built browser, restoration precedes the first synchronization write and explicit workspace selection survives route changes until return or refresh.
- Repeated development Strict Mode Effects perform at most one changed write.
- Profile and money values are absent from all locations and navigation state.
- No module-global mutable questionnaire state remains.

## Work item 6: derive the Plan model and coordinator

Status: pending

### Changes

- Add exhaustive Plan-source and six-kind Plan-model unions.
- Move current Profile, Evaluation, workspace-view, source, save-availability, and next-action derivation out of JSX.
- Keep `derivePlanModel` synchronous and side-effect-free.
- Add the route-scoped coordinator and one local interaction union.
- Consolidate duplicate Completion add, replace, and removal behavior through one completion-update path.
- Route Profile-changing actions through candidate construction, `parseProfile`, fresh Evaluation, and source-specific persistence.
- Keep the Draft and Profile synchronized after an unsaved advance-tax update.
- Preserve Completion records during Saved-workspace Profile updates.
- Distinguish committing the active Draft from workspace-only mutations. Completion add/change/remove and saved payment updates preserve any unrelated Draft and Recovery value.
- Remove dummy refresh state, duplicated `groupStep`, and boolean combinations replaced by tagged models.

### Acceptance

- An exhaustive switch renders every Plan-model kind.
- No Plan renderer calculates tax, chooses support, or reads browser storage directly.
- Every mutation either updates the transient reducer or performs one revision-checked whole-workspace write.
- Invalid and newly unsupported payment changes leave current state unchanged with accurate recovery.
- Completion controls remain absent from Recovery-only plans.
- Every workspace-only mutation leaves an unrelated Recovery value and in-memory personal session unchanged.
- Existing supported, unsupported, stale, saved, and deleted Plan fixtures still render their intended state.

## Work item 7: complete notices, source selection, and destructive flows

Status: pending

### Changes

- Add one AppFrame temporary Notice union and existing-pattern top-bar renderer; derive persistent warnings and retry actions from each storage and deletion result.
- Implement the exact Recovery success, invalid removal, failure, start-over, and automatic legacy-deletion copy.
- Show the success and deletion Notices for approximately four seconds, once per document where specified.
- Replace only older temporary Notices. Keep every unresolved storage warning visible regardless of success or failure in another store.
- Add non-empty Start-over confirmation; reset only after verified Recovery removal. A blank Draft needs no confirmation.
- Add ordered Saved-workspace then Recovery deletion with exact complete, failed, unverified, and partial results. Keep retries reachable after the workspace key is absent.
- Add stale Saved-edit choices for separate unsaved continuation or newer-workspace restoration.
- Clean up Recovery only when committing that same Draft or verifying a redundant Profile. Clear the committed session before cleanup and keep unrelated personal work intact.
- Update the landing FAQ and standalone Saved-workspace notice for automatic Recovery, schema 2, notice version 2, deletion, and current-tab limits.
- Preserve keyboard focus, polite announcement, reduced motion, and current responsive layout.

### Acceptance

- Every displayed success follows verified storage state.
- Start over never deletes a Saved workspace or Completion record.
- Delete saved data never clears unrelated local or session storage.
- Partial deletion identifies exactly what remains and offers a useful retry.
- Unverified deletion reports uncertainty, retains usable memory, and offers inspection retry without recreating removed data.
- A success Notice never hides another store's failure, and simultaneous Recovery and workspace failures both remain actionable.
- Browser checks verify that later Effects and route transitions cannot recreate committed or deleted answers; Start over writes only a new blank Draft. Full deletion leaves both keys absent until a new questionnaire starts.
- Deletion copy distinguishes the browser's Saved workspace from this tab's Recovery; another tab's Recovery remains separate.
- A stale Saved edit cannot overwrite a newer revision.
- Recovery and Saved-workspace actions remain distinguishable without exposing private values.
- Qualified privacy review approves the exact behavior and final copy.

## Work item 8: verify the combined release

Status: pending

### Automated checks

- Run the assertions added throughout work items 1 through 7 in `scripts/verify-frontend.ts`, using Node strict assertions and in-memory `Storage` adapters. Include readback failure after successful mutation and concurrent independent storage outcomes.
- Keep statutory Evaluation assertions intact.
- Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm rules:validate`, `pnpm test`, `pnpm build`, and `pnpm verify:build` through `pnpm verify:release`.
- Inspect generated assets for forbidden storage clearing, private route construction, remote runtime scripts, and obsolete schema handling where static inspection is reliable.

### Browser checks

- Check `/`, every `/check/*` route, `/plan`, and not-found at desktop, 1024px, and 320px.
- Check 200-percent zoom, keyboard, reduced motion, VoiceOver on Safari, and one desktop screen reader.
- Refresh every group and each Plan kind.
- Exercise browser Back, interface Back, sidebar jumps, invalid-group correction, example isolation, and source switching.
- Exercise valid, malformed, unavailable, failed-write, failed-delete, legacy, repeated-legacy, schema-2, stale-edit, redundant, and partial-deletion storage states.
- Exercise another-tab workspace revision changes while viewing and editing.
- Exercise unrelated Recovery during saved Completion and payment edits, failed-write example return, simultaneous persistent warnings, removal followed by unreadable verification, and partial-deletion retry after the workspace disappears.
- Verify actual Effect ordering around restoration, save, Start over, and full deletion in the built application, including later renders and navigation after cleanup.
- Inspect production-preview storage and network with synthetic data only.

### Release checks

- Obtain qualified privacy approval for automatic Recovery and the final wording.
- Carry forward all unresolved gates in the [existing release record](../my-next-filing-solo-freelancer/release-verification.md): current-stable Chrome, Firefox, desktop Safari, and iOS Safari journeys at the required widths; deployed-preview Lighthouse; keyboard, zoom, reduced-motion and screen-reader evidence; the five-person moderated usability test; and Cloudflare preview, production, and rollback evidence.
- Refresh the official-source compliance review for the release commit as required by root `SPEC.md`, even though this effort changes no statutory logic. Record every artifact against that same commit; prior evidence does not mark a new gate complete.
- Record that code rollback cannot restore deleted version-1 workspaces.
- Deploy the same verified commit to preview, complete the existing Lighthouse and security checks, then cut over production once.
- Smoke-test production routes, schema-1 deletion, Recovery refresh, save, Completion, Start over, and full deletion with synthetic data.

### Acceptance

- Every automated, browser, privacy, performance, security, and production gate passes for the same commit.
- No intermediate commit reached production.
- Root `SPEC.md`, scratch specification, ADRs, source behavior, and release record agree.
- The prior Cloudflare deployment remains available for code rollback, with the documented deleted-data limitation.

## Completion

This effort is complete when work items 0 through 8 pass, all carried-forward release evidence and qualified privacy approval are attached to the release record, and the production smoke test confirms the combined release. A passing implementation leaves no deferred requirement except the explicitly out-of-scope future Plan consolidation.
