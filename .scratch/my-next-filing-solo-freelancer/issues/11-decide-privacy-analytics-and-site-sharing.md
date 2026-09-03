# Decide privacy, Analytics, and site-sharing behavior

Type: grilling
Status: resolved
Blocked by: 03, 04, 08

## Question

What consent, disclosure, deletion, Analytics, external-link, and generic site-share behavior must accompany on-device financial data? Decide whether the current Analytics integration can coexist with saved data, which coarse product events are permissible if any, and how the public website can be shared without exposing or implying a Profile, result, amount, or Completion record.

## Answer

Remove Google Analytics before enabling the Saved workspace. Do not replace it with another remotely executed Analytics or session-replay script on the same origin. The first successor collects no production product events; moderated usability testing supplies its usefulness evidence.

### Runtime privacy boundary

All application runtime code, fonts, images, video, captions, and other assets must be self-hosted or bundled at build time. A locked dependency may be included in the static build after review, but the page must not download executable third-party JavaScript at runtime. Keep video tracking disabled.

The production Content Security Policy should default to the application origin and allow only the exact static, media, navigation, and government or tutorial destinations the shipped interface needs. Security headers, dependency review, and a network inspection must verify the final boundary. A Content Security Policy does not excuse an intentionally allowed remote script from reading origin storage.

Cloudflare serves the static application and necessarily receives ordinary HTTP request metadata. The privacy notice must identify the hosting role and state that Profile, amount, Evaluation, and Completion values are not placed in application requests. Do not add a Worker endpoint, server log, beacon, or other collection path for those values.

### Saved-workspace consent

Use the standalone opt-in and exact storage boundary from the Saved-workspace decision. The notice must identify:

- each category of Profile and Completion data stored;
- the sole purpose of restoring the filing workspace in this browser;
- the accepted notice version and local decision time;
- same-browser visibility and shared-device risk;
- best-effort retention and loss behavior;
- the absence of an account, sync, backup, recovery, or government verification;
- persistent controls to review, edit, stop saving, and delete; and
- the legal operator and monitored privacy or grievance contact required by final review.

The user can continue without saving. Do not bundle storage with another choice, preselect acceptance, save before success, or ask again during the same unsaved journey after rejection.

Saved functionality is adult-only. Require an eighteen-or-older confirmation before the first write, but do not collect a birth date or identity document. Under the conservative agent review, saved functionality fails closed no later than 13 May 2027 unless qualified review or later official guidance clears the recorded consent-proof, retention, security, breach, rights, and child-user issues.

### Privacy page and product copy

Publish a dedicated privacy page before persistence ships. It must describe current behavior rather than aspiration:

- the operator and contact;
- stored data and excluded identifiers;
- purpose and legal posture;
- exact browser scope;
- retention, archive, migration, deletion, and loss behavior;
- shared-device, private-browsing, extension, dependency, and browser-backup limits;
- Cloudflare hosting request metadata;
- absence of Analytics and production product events;
- user access, correction, deletion, grievance, and incident-notice paths;
- adult-only saved functionality; and
- the date, version, and re-review triggers.

Do not use “private,” “anonymous,” “encrypted,” “permanent,” “securely erased,” “only you can access it,” “never leaves this device,” “DPDP compliant,” or “government verified.” State instead that application code does not upload saved values or include them in requests, while anyone using the same browser profile and code executing on the origin may be able to access them.

Update every current FAQ, landing statement, and result statement that says answers are never saved. The unsaved-path copy may still say that its current check stays in memory; the Saved-workspace copy must make the user's choice visible.

### Deletion and withdrawal

Keep “Delete saved data” and per-year deletion available from the returning workspace, privacy page, stale-rules state, and invalid-storage recovery state. Removal follows the Saved-workspace decision and affects only the namespaced filing data. Confirm what was removed without claiming secure erasure or removal from browser or operating-system backups.

Stopping saving withdraws the storage choice and deletes the Saved workspace because the product has no independent purpose for retaining it. The user may continue in memory. No consent record, Analytics identifier, or tombstone survives deletion inside application storage unless qualified review later requires and permits another design.

### External links

External statutory and tutorial links remain fixed Source-registry URLs, open in a new tab, use `noopener` and `noreferrer`, and carry no query, fragment, Profile, amount, result, Completion, referral, campaign, or user value. Do not prefetch them. Link selection depends only on structured Evaluation results and local Source identities, never by constructing a remote URL from user input.

### Generic site sharing

Offer a secondary “Share My Next Filing” action on the public landing page only. Use the native Web Share interface when available and a copy-link fallback otherwise. The fixed payload is:

- Title: `My Next Filing`
- Text: `A clear, best-effort tax and filing overview for supported solo freelancers in India.`
- URL: `https://mynextfiling.wekeep.in/`

Do not share the current route, questionnaire, Plan, Tax Year selection, deadline, occupation, client scope, GST state, amount, Completion record, saved-workspace existence, or a generated image. Do not add query parameters, fragments, referral codes, campaign tags, shortened URLs, a public profile, or an application request. Preview the generic text before the user confirms the system share action.

Do not measure the share action. A canceled share changes no state and shows no success message; a successful native share or copy may show a small confirmation without claiming that a recipient opened it.

### Product measurement

Reject the four candidate production events from the release-boundary decision for this successor release. Do not measure save enablement, later-date resume, deletion, share use, Profile qualification, result kind, Obligation identity, Deadline status, Completion, correction, amount, or timing.

Use the agreed five-person moderated test as the release evidence. If later evidence justifies production measurement, reopen privacy and architecture decisions first; do not quietly reintroduce a remote script or infer consent from storage opt-in.

### Release and re-review

The agent privacy review is sufficient for conservative planning but not legal release approval. Final release still requires the explicit risk and review treatment recorded in the release-gate decision. Reopen this decision for any Analytics, remote runtime script, backend, account, cloud sync, document, identifier, export, recovery, age, retention, law, or hosting change.
