# Frontend state, routing, and recovery specification

| Item | Value |
| --- | --- |
| Status | Approved for implementation |
| Scope | One coordinated frontend replacement release |
| Product authority | Root `SPEC.md`, amended with the accepted behavior |
| Implementation plan | `.scratch/frontend-ideas/implementation-plan.md` |
| Architecture records | `docs/adr/0001` through `docs/adr/0004` |

## Outcome

The Application uses one deterministic questionnaire session across `/check/*` and `/plan`. React renders that session, invokes pure Evaluation and Plan derivation, and performs browser effects outside the reducer. Static routes identify the visible questionnaire group. A versioned Recovery draft preserves personal answers through refresh in the current tab.

Ship all changes in one production release. Dependency-ordered commits and preview checkpoints are required, but no intermediate checkpoint may reach production.

## Preserved product boundaries

- Keep the Application static, local-first, and free of accounts, backend services, databases, remote runtime scripts, and government connections.
- Keep Profile and money values out of paths, queries, fragments, titles, logs, Analytics, sharing, external links, and network requests.
- Keep `parseProfile` and `evaluate` as the sole Profile-validation and legal-evaluation interface. Routes and reducers do not calculate tax or decide support.
- Keep Saved-workspace creation opt-in after a Supported result. Automatic Recovery-draft storage does not authorize longer-lived saving.
- Preserve `DESIGN.md`. Make only the interface changes required by routing, Recovery notices, validation, source selection, and destructive controls.

## Terms

`Draft` is the existing incomplete questionnaire representation containing display strings. `Profile` is the complete validated input to Evaluation. `Recovery draft` is the current-tab browser copy of a personal Draft. `Saved workspace` remains the longer-lived browser copy of a validated Profile and Completion records.

A Recovery draft never enters Evaluation by assertion. Restoration must produce a Draft, then run fresh Draft completion, `parseProfile`, Rule validation, and Evaluation as applicable.

## Application ownership

`AppFrame` owns:

- the nullable questionnaire reducer state and dispatch;
- an in-memory return snapshot of the latest personal or Saved-edit session while an example is active;
- the loaded Recovery-draft result;
- the loaded Saved-workspace result;
- temporary selection of a Saved workspace while a Recovery draft exists; and
- one tagged temporary top-bar Notice state. Persistent warnings are derived independently from the storage results.

The questionnaire reducer owns only transient questionnaire state. The Plan coordinator is route-scoped. Evaluation, Plan derivation, storage operations, routing, focus, scroll, motion, timers, dialogs, and notifications remain outside the questionnaire reducer.

Delete `src/current-check.ts`. No mutable module variable or forced-render counter may replace it.

## Questionnaire state

Use a tagged union equivalent to:

```ts
type DraftOrigin =
  | { readonly kind: 'personal' }
  | { readonly kind: 'example' }
  | {
      readonly kind: 'saved-edit'
      readonly baseWorkspaceRevision: number
    }

type QuestionnaireState =
  | null
  | {
      readonly kind: 'editing'
      readonly origin: DraftOrigin
      readonly draft: Draft
      readonly validationGroup: ProfileGroup | null
    }
  | {
      readonly kind: 'complete'
      readonly origin: DraftOrigin
      readonly draft: Draft
      readonly profile: Profile
    }
```

Null means no active questionnaire. The URL owns the current group. Selectors derive errors. Pure modules derive Evaluation and Plan results. The return snapshot exists only while an example temporarily replaces personal work; it is never serialized and is not a second reducer.

### Reducer events

Use intent events. The minimum event groups are:

- session events for starting personal, example, Saved-workspace edit, separate-unsaved continuation, restoring the example return snapshot, start over, and clearing a committed or deleted session;
- typed independent-field and amount changes;
- named cascading changes for income path, client location, delivery, GST kind, GST status, subcontractor status, and unsupported-fact selection;
- validation exposure and clearing; and
- Draft completion and transient Profile replacement after a valid Plan mutation.

Do not expose a `Partial<Draft>` patch event. Components dispatch what happened; the reducer decides every dependent reset.

### Cascading changes

| Intent | Required clearing |
| --- | --- |
| Income path changes | Path confirmation, business-only confirmations, and all receipt and profit strings whose meaning depends on the path |
| Delivery stops including platform work | Every platform field |
| Client location stops including foreign clients | Every foreign-client field |
| GST kind changes | GST status, state, turnover, completeness, compulsory-registration answer, and liability date |
| GST status stops being one normal registration | Registered GST state |
| Client-work subcontractor answer stops exposing contractor boundary | Contractor-boundary answer |
| Unsupported-fact certainty changes to none or not sure | Selected unsupported facts |
| TDS or TCS changes so the age band is no longer required | Age-band answer |

No hidden branch value may remain in memory or the Recovery draft after its branch is abandoned.

## Questionnaire metadata and selectors

Define one ordered `questionnaireGroups` constant containing each `ProfileGroup` and user-visible navigation label. The identity is also the child-route path. Keep React elements in router configuration.

Canonical order:

1. `tax-year`
2. `activity`
3. `receipts`
4. `clients`
5. `other-income`
6. `gst`
7. `review`

Start with shared branch selectors for business path, platform work, foreign clients, age-band requirement, and unregistered GST. Add another selector only after at least two callers repeat the same decision. Do not create a configuration-driven form engine or a selector for every Draft property.

Add pure workflow selectors for blank-Draft detection, group validation, first incomplete group, route accessibility, and Draft completion.

## Validation

Use structured errors:

```ts
type DraftError = {
  readonly field: string
  readonly group: ProfileGroup
  readonly message: string
}
```

Expose no validation on first entry. A failed Continue exposes the current group, focuses its first invalid field, and keeps errors derived from the latest Draft. Successful navigation clears exposed validation. Review becomes accessible only when all six answer groups validate.

A syntactically complete answer that will later produce Unsupported still completes its questionnaire group. Evaluation alone decides support.

Final completion converts the Draft candidate and calls `parseProfile`. It returns either structured Draft/Profile errors or a complete Profile. The reducer enters `complete` only with that Profile.

## Routes

Configure a `/check` layout with these static children:

```text
/check/tax-year
/check/activity
/check/receipts
/check/clients
/check/other-income
/check/gst
/check/review
```

Do not use `:step`, query parameters, or fragments for questionnaire state.

Bare `/check` redirects a complete session to `/plan`, an incomplete editing session to its first incomplete group, and a fully valid editing session to `/check/review`.

A known group after the first incomplete group redirects with replacement to the first incomplete group. An unknown `/check/*` path renders the normal not-found route.

Continue and sidebar navigation push history. Bare-index and guard corrections replace history. The interface Back control replaces the current entry with the previous logical group. Browser Back follows actual browser history.

On group change, scroll to the top and focus the group heading. Preserve existing pointer-versus-keyboard motion behavior and reduced-motion treatment.

## Entry and source priority

Resolve the displayed source using this decision table. In-memory work remains authoritative even when its latest Recovery write failed.

| Condition, in priority order | Displayed source |
| --- | --- |
| An example is active | Example, with any personal session held in its return snapshot |
| The user explicitly selected the Saved workspace in this document | Saved workspace, preserving personal work |
| An in-memory personal or Saved-edit session exists | That session |
| On initial restoration, a valid non-redundant Recovery draft exists | Restore that Draft into the questionnaire session |
| A valid schema-version-2 Saved workspace exists | Saved workspace |
| Neither source exists | No session |

Refresh clears temporary selection and the example return snapshot, reads both stores, and applies restoration priority. A failed storage write never replaces newer in-memory answers with an older Recovery copy.

The landing page uses:

| Available state | Primary action | Secondary action |
| --- | --- | --- |
| No Recovery draft or Saved workspace | `Start your estimate` | Fictional example |
| Incomplete Recovery draft | `Continue your estimate` | Saved workspace when present |
| Complete Recovery draft | `Continue your plan` | Saved workspace when present |
| Saved workspace only | `Continue your saved workspace` | Start a separate estimate |
| Both sources | Recovery action | `Open saved workspace` |

Opening a Saved workspace while personal work exists does not replace the questionnaire or delete its Recovery draft. Show `Return to your estimate`; this action clears explicit workspace selection. Refresh restores Recovery priority. Landing actions describe in-memory work when present and otherwise the restored stores.

Starting a Saved-workspace edit while personal work exists requires an explanation and the explicit action `Discard draft and edit saved data`, including when that work could not be stored.

The fictional example is never written to browser storage. On example entry, capture the latest non-example questionnaire session in memory before replacing it. Preserve that snapshot through example edits and repeated example entry. Leaving the example restores the exact snapshot, including answers from failed Recovery writes, and releases the snapshot. Refreshing it restores the personal Recovery draft when available or starts a blank personal questionnaire; an in-memory snapshot cannot survive refresh. Leaving the example uses `Return to your estimate` when personal work exists and `Start your estimate` otherwise.

## Recovery-draft storage

Use `sessionStorage` key `my-next-filing:recovery-draft`.

```ts
type RecoveryDraftEnvelope = {
  readonly schemaVersion: 1
  readonly taxYear: TaxYear
  readonly origin: 'personal' | 'saved-edit'
  readonly baseWorkspaceRevision: number | null
  readonly draft: Draft
}
```

`personal` requires a null base revision. `saved-edit` requires a non-negative safe-integer base revision. Do not store a route, timestamp, errors, Profile, Evaluation, Plan result, notice, Completion record, example marker, or other UI state.

### Interface

```ts
loadRecoveryDraft(storage: Storage, taxYear: TaxYear): LoadRecoveryDraftResult
saveRecoveryDraft(storage: Storage, value: RecoveryDraftEnvelope): RecoveryWriteResult
deleteRecoveryDraft(storage: Storage): RecoveryDeleteResult
parseRecoveryDraft(value: unknown, taxYear: TaxYear): RecoveryDraftEnvelope | null
```

Use tagged results for absent, ready, saved, unchanged, deleted, invalid-removed, invalid-removal-failed, deletion-unverified, invalid input, and unavailable storage. Error reasons contain no Profile or money value.

Treat storage as untrusted. Require exact envelope and Draft keys, exact enums or permitted empty strings, known unique unsupported facts, a matching Tax Year, consistent origin and revision, valid date-string shapes, and bounded money strings. A Recovery draft may be incomplete. Cap each stored money display string at 32 characters.

Catch property access, JSON, quota, security, serialization, write, and removal failures. Verify `setItem` and `removeItem` by reading the exact key afterward. Never call `sessionStorage.clear()`.

Distinguish a verified remaining value from an unreadable outcome after removal. If removal may have succeeded but readback fails, return `deletion-unverified`, retain current in-memory work, pause writes to that key, and offer inspection retry. Do not claim the stored value survived or recreate it as a backup. A readable retry can establish absence, a remaining value, or a conflict before choosing the next operation. Use the same outcome distinction for Saved-workspace and legacy deletion.

### Write and restore behavior

Create the blank Recovery draft when a personal `/check/*` route opens after initial restoration and source selection. After every committed change to an active personal or Saved-edit Draft, serialize and write the complete envelope. Skip `setItem` when the current serialized value is identical. Do not debounce.

An Effect performs synchronization. Repeated development Effects remain harmless through the unchanged-value check.

Define synchronization eligibility before wiring the Effect:

| Lifecycle state | Recovery synchronization |
| --- | --- |
| Initial storage reads or source restoration are incomplete | Paused; no blank write may overwrite restored work |
| Active personal or Saved-edit questionnaire or unsaved Plan | Enabled for that session's Draft |
| Example active, Saved workspace explicitly selected, or no questionnaire session | Paused; existing Recovery is left untouched |
| Removal is in progress, failed, or unverified | Paused for the affected key until its retry or cancellation resolves the operation |
| The current Draft was successfully saved into a workspace | Clear that session and switch to the workspace before its Recovery cleanup; synchronization stays off |
| Full deletion is verified | Clear the corresponding session and example return snapshot; keep both keys absent until a new personal questionnaire is opened |
| Start over is verified | Replace the old session with a blank personal Draft; only that new blank value may be written |

Pending Effects must check the current synchronization eligibility before writing. A render, route transition, or repeated Effect cannot recreate a committed or deleted Draft. This requires local ownership and guards, not a command executor or generic persistence framework.

When restored data is malformed, unknown, obsolete, inconsistent, or invalid, remove only the Recovery key and start blank in memory. If removal succeeds, show the required invalid-draft notice and allow blank-Draft synchronization. If removal fails or cannot be verified, keep synchronization paused, show the persistent storage warning, and offer retry. Later answer changes can retry inspection and removal before writing, while keeping the latest in-memory Draft usable.

Keep a complete Draft after calculation. On `/plan` refresh, complete it again, call `parseProfile`, and run fresh Evaluation. An incomplete Recovery draft at `/plan` redirects to its first incomplete group unless the user explicitly selected the Saved workspace in the current document.

Keep Recovery drafts for Supported, Unsupported, and stale-rules results. They never enable Saved-workspace creation outside existing Supported rules and never hold Completion records.

### Conflicts and cleanup

A Saved-workspace edit records its base revision. If the current workspace revision differs, preserve the Draft and block overwrite. Offer continuing it as a separate unsaved estimate or discarding it and loading the newer Saved workspace. Never merge.

After successfully committing the active Draft to a workspace, clear that questionnaire session, select the saved workspace, and delete only its corresponding Recovery draft. A workspace-only payment, Completion, or other update must preserve unrelated personal work and Recovery storage. Cleanup is also allowed when fresh completion verifies that the Recovery Profile matches the active Saved-workspace Profile. Differing Profiles retain Recovery priority on restoration. Failed or unverified cleanup leaves an accurate persistent warning and a retry; the verified workspace save remains successful and the committed Draft is not synchronized again.

## Saved workspace schema 2

Continue using `my-next-filing:workspace`. Schema version 2 contains the same approved fields as version 1 except `schemaVersion` is `2` and accepted `noticeVersion` is `2`. It still contains no Draft, example, Evaluation, Rule copy, rendered text, route state, or UI state.

Keep `loadSavedWorkspace`, `saveSavedWorkspace`, and `deleteSavedWorkspace` as the storage interface. Keep whole-envelope revision checks, strict parsing, exact-key writes, and exact-key deletion.

Change workspace derivation to:

```ts
deriveWorkspaceView(
  savedWorkspace: SavedWorkspace | null,
  evaluationsByTaxYear: Readonly<Record<string, EvaluationResult>>,
): WorkspaceView
```

Remove the unused current-date parameter and array input alternative.

Increment `STORAGE_NOTICE_VERSION` to 2. The standalone Saved-workspace notice and explicit `Save data` action remain required after a Supported result.

## Intentional version-1 deletion

Any parsed JSON object at `my-next-filing:workspace` whose top-level `schemaVersion` is `1` is legacy data selected for deletion. Do not migrate or back it up.

On every encounter, reread the exact key, confirm it is still version 1, remove only that key, verify absence, and show the legacy-deletion Notice at most once per document lifetime.

If a read verifies that the legacy value remains, leave it untouched, return a tagged legacy-removal failure, and offer retry. If removal may have succeeded but readback fails, return a tagged legacy-removal-unverified result and offer inspection retry without claiming the raw value survived. Both outcomes block Saved-workspace writes and keep the in-memory questionnaire and Recovery draft usable. Never recreate removed legacy data. An old tab cannot overwrite schema 2 through a successful revision-checked write; any reappearing version-1 value follows the same deletion path.

This is intentional irreversible data loss. A code rollback cannot restore removed Profiles or Completion records. Do not create an undisclosed backup key.

## Start over and delete saved data

`Start over` appears in shared questionnaire and Plan navigation. A blank Draft needs no confirmation. A non-empty Draft or unsaved plan requires the specified confirmation. Pause Recovery synchronization, delete and verify only the Recovery key, then reset to a blank personal Draft and clear any example return snapshot. A failed or unverified removal retains the latest answers and offers retry. The Saved workspace remains unchanged. From a Saved plan, the new blank Recovery draft becomes primary and `Open saved workspace` remains available.

Show `Delete saved data` when a Saved workspace, unreadable workspace, or failed or unverified legacy deletion exists. After confirmation, pause writes to the affected keys, delete and verify the Saved-workspace key first, then delete and verify the Recovery key only after workspace success or confirmed absence. Clear corresponding memory only after its storage operation is verified. Keep a separate deletion retry reachable for a pending, failed, unverified, or partial deletion even after the workspace key is absent. Retry inspects current storage and does not depend on the ordinary `Delete saved data` visibility condition.

Return and render exact complete, failed, unverified, and partial outcomes. Claim complete deletion only when both keys are verified absent. The Recovery part affects this tab only; other tabs' Recovery drafts remain separate. Never call either storage area's `clear()` method.

## Plan model

Use an explicit Plan source tagged as missing, deleted, transient, workspace, or saved-data-unavailable. `derivePlanModel` combines that source with one captured `Date`, current Rules, and any required workspace evaluations.

The result is exactly:

```ts
type PlanModel =
  | MissingPlanModel
  | DeletedPlanModel
  | SavedDataUnavailablePlanModel
  | StalePlanModel
  | UnsupportedPlanModel
  | SupportedPlanModel
```

Each kind contains only values safe for its renderer. `supported` includes its Evaluation and derived Workspace view where applicable. `saved-data-unavailable` includes a tagged reason and safe recovery actions. When a valid transient plan exists, render it with a separate storage warning rather than replacing it with a storage-error screen.

Use exhaustive switches. Remove nullable and boolean combinations that duplicate the tagged result.

## Plan coordinator

Keep one route-scoped coordinator. It receives the Plan source, current workspace snapshot, questionnaire dispatch, storage access, one captured date, and Rules. It returns the Plan model, the current interaction, notices, and named action callbacks.

Use one local interaction union for none, save confirmation, delete confirmation, payment editing, and completion editing. Keep status notices separate. Defer further Plan interaction consolidation.

For a Profile-changing action, the coordinator constructs the candidate without mutation, calls `parseProfile`, runs fresh Evaluation with the captured date and Rules, rejects invalid or newly unsupported updates with current work intact, and then dispatches a transient Profile replacement or saves a revision-checked workspace according to source.

For an unsaved advance-tax update, update both the complete Profile and its Draft amount so Recovery produces the same Profile. For a Saved workspace, persist the Profile and existing Completion records together. Completion addition, date replacement, and removal remain Saved-workspace-only operations.

## India date

Define one `indiaDate(now: Date): DateOnly` helper with no default date. Replace duplicate implementations. Each workflow captures `new Date()` once and passes it to date conversion, Evaluation, validation, storage metadata, and Plan derivation.

## Notices and copy

`AppFrame` owns one tagged temporary top-bar Notice. A newer temporary Notice replaces the previous temporary Notice. Recovery success and verified deletion notices hide after approximately four seconds. Derive persistent warnings and their retry actions independently from Recovery, Saved-workspace, and deletion results. Render every unresolved warning until its own condition resolves; success in one store or a timer must not hide another store's failure. Keep these warnings outside the temporary Notice union.

Required copy:

| State | Copy |
| --- | --- |
| First verified Recovery write | `Your answers will stay available if you refresh this tab. Closing the tab may remove them.` |
| Invalid Recovery removed | `Your previous answers couldn't be restored and were removed from this tab. Start again below.` |
| Recovery unavailable | `This browser couldn't store your answers for refresh recovery. Your answers are still here, but a refresh may remove them.` |
| Start-over title | `Start over with blank answers?` |
| Start-over consequence | `This removes your in-progress answers from this tab. Your saved workspace and completion dates will not change. This cannot be undone.` |
| Start-over action | `Clear answers and start over` |
| Start-over safe action | `Keep my answers` |
| Complete user-requested deletion | `Your saved answers and completion dates were removed from this browser. Your in-progress answers were removed from this tab.` |
| Workspace deletion unverified | `We couldn't check whether your saved answers and completion dates were removed. Your current work is still available in this tab. Try checking again.` |
| Recovery deletion unverified | `We couldn't check whether your in-progress answers were removed from this tab's storage. Your current answers are still here. Try checking again.` |
| Automatic legacy deletion | `Your previously saved answers and completion dates were removed because this version uses a new workspace.` |

Show the first-write Notice once per document lifetime after the first verified `saved` result, not after `unchanged`. Explain automatic Recovery drafts, refresh behavior, tab-closing limits, Saved-workspace distinction, shared-browser access, failures, Start over, and full deletion in the landing FAQ. Qualified privacy review controls final public wording.

## Privacy and release gate

Automatic Recovery storage begins before a choice and is disclosed after the first verified write through the top-bar Notice plus the FAQ. This differs from the current approved opt-in-only persistence policy.

Qualified privacy approval for the exact implemented behavior and copy remains mandatory before production release. Implementation and preview verification may continue while review is pending. Make no privacy-compliance claim without that approval.

Keep Recovery and Saved values out of logs and error text. Do not add telemetry, event replay, remote error reporting, or a runtime feature flag.

## Accessibility and presentation

- Preserve the existing journey rail, fixed mobile actions, semantic headings, linked field errors, visible focus, 44-pixel targets, and 320-pixel support.
- Announce top-bar Notices with the existing polite status pattern without moving focus to temporary success messages.
- Move focus to destructive confirmations when opened and return focus to their trigger when cancelled.
- Focus the first invalid field after failed navigation and the new group heading after successful navigation.
- Preserve reduced-motion behavior and do not animate Profile or money values.

## Automated verification

Keep `scripts/verify.ts` and add `scripts/verify-frontend.ts`. `pnpm test` runs both with the existing Node assertion approach and no new dependency.

Add assertions with the work item that introduces each contract. The frontend script must cover every reducer event and cascade, branch selector, group validator, first-incomplete result, Draft-completion outcome, Recovery storage result, source-selection branch, route decision, Plan-model kind, Plan mutation, ordered deletion outcome, and schema-version behavior described above. Include removal succeeding before readback throws, concurrent independent storage warnings, unrelated Recovery surviving workspace mutations, and the latest example return snapshot after a failed write.

Use synthetic values only. Tests assert observable results through module interfaces, never private helper state.

## Browser and release verification

Before production:

1. Run `pnpm verify:release` from the release commit.
2. Exercise landing, every nested route, Review, Supported, Unsupported, stale, missing, deleted, saved-data-unavailable, and not-found states in the production build.
3. Exercise refresh at every questionnaire group and unsaved Plan, browser Back and interface Back, example refresh and return after failed Recovery writes, Recovery versus workspace selection, multi-tab revision conflict, repeated version-1 deletion, all storage failures, and partial delete-all. Check actual Effect ordering around restoration, save, Start over, and full deletion; later renders must not recreate removed answers, and partial-deletion retry must remain reachable without a workspace key.
4. Check desktop, 1024px, 320px, 200-percent zoom, keyboard, reduced motion, VoiceOver on Safari, and one desktop screen reader.
5. Inspect production-preview storage, network, CSP, deep links, Lighthouse, and rollback behavior using synthetic data.

Carry forward every outstanding item in the [existing release record](../my-next-filing-solo-freelancer/release-verification.md), including the named browser matrix, refreshed compliance review, and five-person usability test. Update the [privacy packet](../my-next-filing-solo-freelancer/privacy-applicability-review-packet.md) for the exact Recovery and Saved-workspace behavior before requesting review. Qualified privacy approval is a blocking release artifact. Record that rollback cannot restore deleted version-1 browser values.

## Acceptance

The implementation is complete only when:

- no mutable cross-route singleton, dummy rerender, duplicate group-step mapping, duplicate India-date function, unused workspace current-date parameter, or workspace array input remains;
- the URL alone selects a questionnaire group and contains no private state;
- every Draft transition and result is reproducible through pure reducer and selector tests;
- refresh restores the exact valid personal Draft or unsaved Plan from the current tab;
- hidden branch values cannot survive in memory or storage;
- Saved workspace and Completion behavior remains opt-in, strictly parsed, freshly evaluated, and revision checked;
- version-1 workspaces are intentionally and verifiably deleted with the required Notice and failure handling;
- every complete, failed, conflicting, invalid, and partial storage outcome preserves accurate user-facing state;
- the existing statutory Evaluation tests remain unchanged except for import or shared-date wiring required by the refactor; and
- the complete release gate and qualified privacy approval pass for the same commit.

## Out of scope

- A state-machine library, external state store, command executor, global Plan provider, or generic storage hook.
- Nested discriminated Draft branches or a schema-driven form renderer.
- A second Plan reducer or further Plan interaction consolidation.
- Profile, Evaluation, Completion, or money values in URLs.
- Persisted examples, errors, routes, UI state, Evaluation results, or Plan results.
- IndexedDB, cookies, cloud sync, export, backup, migration of version-1 workspaces, or hidden recovery copies.
- Visual redesign, calendar replacement, confetti removal, component-library replacement, CSS reorganization, or route-level bundle splitting.
- Statutory Rule, threshold, rate, obligation, support, or calculation changes.
