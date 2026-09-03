# Decide the Saved workspace lifecycle

Type: grilling
Status: resolved
Blocked by: 03, 04, 05

## Question

What exactly does a user opt into saving on the current device, when is it created and updated, how is it resumed, cleared, corrupted, migrated, or made unavailable, and what does the Application say on shared or private-browsing devices? Keep the unsaved path intact, store no calculated result as current authority, and define the smallest lifecycle that supports revisiting work safely.

## Answer

Use **Saved workspace** for the best-effort current-browser copy of a validated Profile and its Completion records. It is optional convenience state, not an account, backup, government record, or source of statutory truth.

### Creation and consent

Saving starts off. Offer it only after a complete Profile parses successfully and Evaluation returns a Supported result, including a Supported result with Incomplete coverage. Do not save partial questionnaire drafts, example data, malformed data, an Unsupported Profile, or a new Profile evaluated with stale core Rules.

Before the first write, show a standalone notice that itemises the Profile and Completion fields, explains the restore purpose, warns about shared browsers and data loss, states that there is no account, sync, backup, or recovery, identifies the retention and deletion controls, and links to the privacy contact. Require an affirmative “Save on this device” action. “Continue without saving” remains equally usable.

Storage consent is separate from any Analytics choice. The Saved workspace is available only to a user who confirms they are eighteen or older. Do not persist an Analytics identifier or treat visiting the page as storage consent.

### Stored envelope

Use one namespaced, versioned browser-storage envelope. It contains only:

- storage schema version and revision;
- accepted storage-notice version and local decision time;
- Active Tax Year identity and the year records approved in ticket 10;
- the complete validated Profile for each retained year;
- user-declared Completion records; and
- the minimum timestamps needed for retention, migration, and later-date resume behavior.

Do not store questionnaire display strings, partial input, example data, calculated results, tax breakdowns, Rule values or copies, Deadline status, rendered copy, source content, names, government or account identifiers, client or platform identities, documents, invoices, free text, Analytics data, or share data.

The storage schema version, Tax Year, Rule dataset identity, and Completion identity remain separate values. A current Rule change never rewrites stored facts into a calculated result.

### Updates

After opt-in, write the complete envelope only after a validated Profile change, Completion-record change, approved rollover, or consent-metadata change succeeds. One whole-envelope replacement is sufficient for this small dataset. Do not introduce a background queue, database, debounce framework, or per-field storage.

Increment the local revision on each successful write. Before replacing a value, compare the revision that the current tab loaded with the stored revision. If another tab changed it, stop the write and offer to reload the newer Saved workspace. Listen for the browser storage event and refresh read-only views or block a stale editor. Do not attempt an automatic field merge.

Confirm “Saved” only after the browser write succeeds. On quota, security, private-mode, or other storage failure, keep the current valid Profile in memory, state that changes were not saved, and offer retry or continued unsaved use.

### Resume

On application start, look only for the namespaced Saved-workspace key. Treat its content as untrusted input:

1. Parse JSON without throwing into the page.
2. Reject missing or extra fields, unsafe numbers, invalid dates, unknown identities, and an unknown newer schema.
3. Run only explicit ordered migrations from known older schemas.
4. Validate the migrated envelope before replacing the original.
5. Parse each Profile through the domain Profile parser.
6. Validate current Rules and run a fresh Evaluation.

A valid restore opens the returning-user view and derives current Coverage, Obligations, Review actions, Deadline status, and what remains. Never restore a stored calculation.

If current core Rules are stale, preserve the Saved workspace, show the Stale-rules result, disable recalculation and saving of changed tax facts, and keep deletion available. If only an independently separable rule group is stale, restore the Profile and show that area's unavailable Coverage.

### Corruption and migration failure

Do not use, partly recover, silently overwrite, or automatically delete an invalid envelope. Show a saved-data error that explains no calculation was produced from it and offers “Delete saved data and start again.” The current session may start an independent unsaved check, but it cannot overwrite the invalid value until the user deliberately deletes it.

If a known migration fails or its replacement write fails, leave the original value untouched and use the same recovery state. Reject an unknown future schema rather than guessing how to downgrade it.

### Retention and recovery

For the first successor release, retain the active Tax Year until the user deletes the Saved workspace or the browser clears or evicts it. State that rule explicitly. Do not promise permanence or silently expire the only current-year copy. The rollover decision must establish archive retention before a second Tax Year is persisted; without that decision, do not create durable archives.

Provide no export, import, recovery code, passphrase, cosmetic PIN, or request for persistent-storage permission. A browser or operating-system backup may copy the value outside the Application's visibility, so do not claim that no other copy can exist.

Qualified privacy review may impose an earlier retention or release cutoff. Under the current agent-review boundary, saved functionality must fail closed no later than 13 May 2027 unless that gate is cleared; the unsaved calculator remains separately available when its Rules are current.

### Deletion

“Delete saved data” removes only the application's namespaced Saved-workspace key, clears its current in-memory Profile and Completion records, coordinates other open tabs through the storage event, and returns the current tab to the new-user state. Confirm success only after removal succeeds.

Do not call `localStorage.clear()` because the origin may contain unrelated media or consent preferences. Do not delete Analytics cookies through a filing-data control. Use this bounded confirmation:

> Removed My Next Filing's saved profile and completion records from this browser.

Do not say securely erased or deleted everywhere.

### Shared and private browsers

Before opt-in, state:

> Save this profile and the filing completions you mark in this browser. Anyone using this browser profile may be able to see them. There is no account, sync, backup, or recovery. Private browsing or clearing site data may remove them.

Also say “Do not save on a shared or public browser.” Do not claim encryption, anonymity, access control, or sole-user visibility. Private-browsing behavior is a storage limitation, not an error in the calculator; when persistence is unavailable, continue in memory.

### Invariants

- Saving never changes Evaluation, amounts, applicability, or Coverage.
- Completion records never enter Profile or Rules.
- Restored data never bypasses parsing, Rule validation, or fresh Evaluation.
- The unsaved journey remains complete and does not nag repeatedly after rejection.
- No Saved-workspace value enters a URL, title, log, Analytics event, error report, external link, or share action.
- Storage failure cannot discard the current in-memory work or display false success.
- Deletion and privacy controls remain available when Rules are stale or the restored value is invalid.

Use `localStorage`; no accepted requirement justifies IndexedDB. Ticket 13 fixes the exact workspace-module interface and the stable key `my-next-filing:workspace`.
