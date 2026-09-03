# Choose the application and storage architecture

Type: grilling
Status: resolved
Blocked by: 07, 08, 09, 10, 11, 12

## Question

What is the smallest module, route, state, and browser-storage organization that can implement the settled Profile, Evaluation, Rules, Saved workspace, Completion record, Tax Year, privacy, and interaction models? Reuse the current deep Evaluation and Rules seams, keep statutory calculation synchronous and local, avoid speculative adapters and dependencies, and specify migrations and failure handling only where the persisted format requires them.

## Answer

Keep the current static React SPA and Cloudflare Workers Static Assets deployment. Add one deep `workspace` module, one privacy route, and no server code, binding, database, queue, AI service, workflow, state library, storage library, or Cloudflare Vite plugin. The existing `assets.directory` plus `not_found_handling: "single-page-application"` configuration already fits the product; Cloudflare's current documentation confirms both the [SPA fallback](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/) and [`_headers` support](https://developers.cloudflare.com/workers/static-assets/headers/) for static assets.

### Application seams

| Existing or new seam | Owns | Must not own |
| --- | --- | --- |
| `src/evaluation/index.ts` | Strict `parseProfile(unknown)`, the discriminated Profile, synchronous `evaluate`, tax arithmetic, eligibility, Coverage, Review actions, and applicable Obligations | React, browser storage, Completion records, route navigation, copy layout |
| `src/rules/index.ts` | Local datasets keyed by exact Tax Year, typed Source registry, independent rule groups, and expiry/provenance validation | User data, storage, UI state, network lookup, silent fallbacks |
| `src/workspace/index.ts` | Versioned-envelope parsing, browser reads/writes/deletion, revision conflicts, Tax Year invariants, Completion reconciliation, and derivation of next/open/completed/Needs-review views from fresh Evaluations | Statutory arithmetic, remote sync, UI components, hidden recovery, a generic repository abstraction |
| `src/current-check.ts` | The one transient, in-memory completed Profile used by the existing unsaved `/check` → `/plan` handoff | Persistent drafts, saved results, cross-tab state, URL encoding |
| `src/app.tsx` | Router, page shell, one in-memory copy of the latest workspace load result, exact-key `storage` listener, and Outlet context for routes | Domain decisions or raw localStorage parsing |
| Route components | Questionnaire drafts, rendering, confirmations, and calling the three deep modules | Constructing a typed Profile by assertion, calculations, migrations, matching records, or building external URLs from input |

Start with those files. Do not split `schema`, `repository`, `selectors`, `hooks`, or path-specific calculators into separate public layers. If the workspace implementation becomes unreadable during implementation, private files under `src/workspace/` may be extracted without enlarging its public API.

### Public module shape

The Evaluation and Rules APIs remain the small interfaces settled in ticket 07. The workspace module adds only:

- `loadSavedWorkspace(storage)` → absent, ready, invalid, or unavailable;
- `saveSavedWorkspace(storage, expectedRevision, nextWorkspace)` → saved, conflict, invalid, or unavailable;
- `deleteSavedWorkspace(storage, expectedRevision)` → deleted, absent, conflict, or unavailable; and
- `deriveWorkspaceView(savedWorkspace, evaluations, currentIndiaDate)` → the Active/Open/Archived year summaries, earliest next Obligation, open/completed lists, Review actions, and Needs-review records.

Use the browser's native `Storage` type as the test seam; do not create an interface with one implementation. Production passes `window.localStorage`. The module catches `getItem`, `setItem`, and `removeItem` failures and returns tagged outcomes without logging the raw value or a Profile field.

After loading, the app shell selects and validates the exact Rule dataset for each year and calls the Evaluation module; stale Rules are therefore an Evaluation result, not a storage result. `deriveWorkspaceView` is pure. It receives only already validated saved data and current Evaluation results. Routes never persist its output. Completion matching, deadline sorting, and Tax Year rollup live there so landing and plan views cannot disagree about what remains.

### Routes and state

Keep `/`, `/check`, `/plan`, and the existing not-found route; add only `/privacy`.

- `/` stays public and generic. It can detect only that a ready Saved workspace exists to offer “Continue your saved workspace”; it does not render saved details. The generic share helper remains route-local and uses `navigator.share` or the Clipboard API.
- `/check` owns its raw questionnaire draft in React state. On final review it calls `parseProfile` and `evaluate`, then stores only the completed typed Profile in `current-check.ts`. Editing a saved Active year also captures the revision it began from.
- `/plan` uses the transient completed check when present; otherwise it uses the ready Saved workspace from the app shell. A refresh of an unsaved plan returns to `/check`; a valid saved plan restores and re-evaluates. Selected Tax Year and open disclosures remain view state, not URL state.
- `/privacy` is static application copy plus the bounded delete control when a Saved workspace or invalid namespaced value exists.

The app shell loads the workspace once at startup, keeps the tagged result in ordinary React state, and passes it through React Router's existing Outlet context. It listens only for the exact storage key. A storage event refreshes read-only views; an editor still relies on its captured revision and receives a conflict instead of an automatic merge. Do not introduce Redux, Zustand, React Query, a service worker, or a React context wrapper around the router.

Retain the current in-memory unsaved behavior rather than saving drafts. Remove the Analytics import and `src/analytics.ts`. Remove `react-confetti-boom` and its plan-route use because completion is a user declaration, not a verified success. Reuse the application's current semantic components and CSS; do not add shadcn/ui or another component dependency. Keep current bundled/self-hosted fonts and media.

### Persisted envelope version 1

Use the single stable key `my-next-filing:workspace`; keep the schema version inside the value so a future version can find and migrate it. Version 1 contains exactly:

- `schemaVersion: 1` and a non-negative integer `revision`;
- the accepted storage-notice version and ISO decision timestamp;
- the Active Tax Year identity, a nullable saved record for that period, and one envelope update timestamp;
- an array of prior-year records, each with Tax Year, `open | archived`, last successfully evaluated Rule dataset identity, a complete parsed Profile, Completion records, and an archive date only when archived; and
- for each Completion record, the structured composite Obligation identity and `completedOn` India date approved in ticket 09.

The active saved record may be null only after the user deletes that year's Profile while retaining prior years. The Active Tax Year identity still names the current blank start state. If there is no active saved record and no prior-year record, remove the whole key. Validate that a non-null active record matches the Active Tax Year identity, there is no duplicate Tax Year or Completion identity, only prior years are open/archived, archive dates match archive state, all numbers are safe integers where required, and every object has exactly the known fields. Presence of the envelope is the storage choice; do not store a separate save flag, Analytics identifier, rendered result, calculated amount, Rule copy, deadline state, draft, name, free text, or identifier.

Version 1 needs no migration framework. The loader accepts version 1 and rejects an unknown version without modifying it. When version 2 actually exists, add one explicit `v1 → v2` function, validate its output, then replace the original only after the final `setItem` succeeds. A chain is written only when a third real version exists. Never partly recover, downgrade, or overwrite a failed migration.

### Writes, concurrency, and failures

Serialize and replace the whole small envelope with native `JSON.stringify`. Immediately before a write or deletion, re-read the key and compare the stored revision with `expectedRevision`; increment once on success. The exact-key storage listener catches ordinary cross-tab changes, and the pre-write check blocks stale editors. Do not auto-merge or add BroadcastChannel, Web Locks, IndexedDB, a queue, or per-field writes for this scope.

If parsing, validation, Rule selection, Evaluation, revision comparison, serialization, write, or removal fails:

- preserve the last raw saved value unless the user deliberately completes bounded deletion;
- keep the current valid work in memory;
- produce no saved success state and no calculation from invalid data;
- return a tagged, display-safe reason with no embedded Profile or money value; and
- keep privacy and deletion controls reachable.

Deletion calls `removeItem` for this key only, confirms absence with a read, then resets the in-memory workspace. Never call `clear()`.

### Cloudflare and browser boundary

Keep `wrangler.jsonc` as a static-assets-only Worker with no `main` script and no bindings. D1, KV, R2, Durable Objects, Workers AI, Workflows, Queues, and server-side Analytics solve no accepted requirement and would violate the current-device boundary. Reconsider infrastructure only if the user later reopens accounts, cloud sync, document processing, server reminders, or server-side sharing.

Extend `public/_headers` with a site-wide Content Security Policy that limits scripts, styles, fonts, images, media, and connections to the application origin; also set `frame-ancestors 'none'`, `base-uri 'none'`, `object-src 'none'`, a no-referrer policy, MIME sniffing protection, framing protection, and a restrictive Permissions Policy. Preserve the HLS MIME rule. External statutory and tutorial navigation remains possible through fixed links with `noopener noreferrer`; the app neither prefetches nor sends a referrer.

This architecture keeps all Profile, amount, Evaluation, Tax Year selection, and Completion state inside the tab or the one browser-storage value. None enters a URL, document title, log, error payload, Analytics call, external link, or Cloudflare application request.
