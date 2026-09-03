# Define verification and release gates

Type: grilling
Status: resolved
Blocked by: 01, 02, 03, 07, 09, 10, 11, 12, 13

## Question

What automated checks, fixtures, manual browser journeys, statutory review, privacy review, migration evidence, accessibility checks, performance checks, and release controls must the later implementation plan require? Cover each supported Profile and Obligation path, fail-closed Rules, stored-data corruption and migration, completion reconciliation, current-device deletion, mobile behavior, Analytics privacy, and the generic share action without designing a redundant test suite.

## Answer

The successor may replace the current public journey only when every applicable gate below has durable evidence from the same release commit. A failure in statutory, saved-data, privacy, or deletion behavior blocks release; a failure in the optional generic share action removes that action rather than blocking the core Saved-workspace loop.

### 1. One automated verification path

Provide one CI command that runs each existing class of check once: formatting check, lint, strict TypeScript, Rule validation, deterministic tests, and the production Vite build. Keep Node's strict assertions unless UI behavior proves a browser test runner is necessary; do not add snapshot tests, fixtures per component, a mocked server, or a second calculation oracle.

Use compact table-driven cases at the public module boundaries:

| Boundary | Required cases |
| --- | --- |
| `parseProfile` | Every complete domestic, foreign, mixed-client, direct, and platform branch; both income paths; exact threshold boundaries; missing/extra fields; unsafe, fractional, negative, and inconsistent amounts; every uncertainty and unsupported fact; no coercion from display strings |
| `evaluate` | Specified-professional 50/75-lakh and 5% cash boundaries; eligible-business 2/3-crore, low-cash, and 6%/8% profit boundaries; tax slabs, rebate, marginal relief, cess, rounding, credits, and ₹50-lakh ceiling; supported, unsupported, and stale top-level results; Available and Unavailable area Coverage, including a Supported result with Incomplete coverage |
| Obligation derivation | Advance-tax ₹10,000 boundary and estimated remaining amount; every supported annual-return trigger including age-dependent TDS/TCS; below/at/above GST thresholds and the known/unknown liability date; normal versus operative dates; India-date Deadline status; stable identities; exact statutory and extension Source provenance |
| Foreign and platform branches | Gross-before-fees requirement; resolved annual integer-rupee total; domestic settlement; possible provider-held foreign balance producing Incomplete coverage; foreign work, operation, tax, relief, unresolved currency, agency, commission, or unknown gross producing Unsupported |
| Rules | Wrong Tax Year; missing/extra/invalid group data; impossible dates; missing direct Source mapping; stale core group stopping all calculation; stale independent group withholding only its area; extension accepted only with a direct reviewed notification; no fallback to another year's values |
| Workspace | Absent key; valid version 1; malformed JSON; extra/missing fields; unknown schema; unsafe numbers; duplicate years or Completion identities; invalid active/archive invariants; unavailable/quota/security errors; whole-envelope write success; revision conflict; exact-key storage event; exact-key deletion; no `clear()` |
| Completion | Valid past/today date and rejected future date; one record per composite identity; create/change/undo; due-date or copy change retaining a match; changed applicability/cadence/period producing Needs review; stale area; positive advance-tax balance blocking completion; zero balance permitting it; no inference from amount, deadline, visit, or link click |
| Rollover and archive | New year blocked without exact current Rules; only approved reusable facts suggested; every amount and legal confirmation cleared; unfinished prior year stays Open; agenda sorts across years; archive gate rejects open or Needs-review work; archive is immutable; per-year and whole-workspace deletion remain independent |

Use statutory examples only after independently calculating their expected values from the reviewed Sources. A test that calls the production calculator to generate its own expected value is not evidence.

There is no predecessor saved schema in the current product, so version 1 requires no invented migration test. Its release evidence is strict acceptance of version 1 and untouched rejection of unknown or corrupt values. Before any real version 2 release, add one frozen version-1 fixture, test the explicit `v1 → v2` transformation, validation, idempotent reload, and failed replacement write leaving the original byte-for-byte intact.

### 2. Manual browser journey matrix

Run the built preview, not the development server, with synthetic data. Exercise the full flow in current stable Chrome, Firefox, desktop Safari, and iOS Safari; cover 320, 768, and 1440 CSS-pixel layouts. Record the release commit, browser versions, viewport, result, and defect link without recording entered Profile or money values.

Required journeys are:

1. Domestic Specified professional path without saving, including back/edit and refresh loss.
2. Foreign direct-client path: complete Profile, inspect Available Coverage or the explicit Incomplete-coverage state as applicable, opt into saving, reload, identify the next item, complete it, change its date, undo it, and delete the workspace.
3. Platform-mediated Eligible business path with gross-before-fees and qualifying-payment splits.
4. GST-registered freelancer receiving a valid income-tax result and plainly incomplete GST-return coverage.
5. Unregistered freelancer below, at, and above the applicable GST threshold, including unknown versus known liability date.
6. Each Unsupported boundary and each independently unavailable Coverage area returning to the exact correction group without losing in-memory answers.
7. Stale core Rules and stale area Rules, with no stale calculation and deletion/privacy controls still reachable.
8. Malformed and unknown-version storage, blocked overwrite, deliberate bounded deletion, and successful new start.
9. Storage unavailable and failed write/removal, with current work preserved and no false success.
10. Two tabs editing the same revision, where the second write conflicts and reloads rather than merges.
11. Active plus Open prior Tax Year, followed by valid archive and per-year deletion. This journey becomes release-blocking when rollover ships.
12. Generic share through native success, native cancellation, unavailable-native copy fallback, and copy failure. Inspect the exact fixed payload and confirm that cancellation changes no state.

Refresh `/plan` in both saved and unsaved states; verify direct navigation to `/privacy` and not-found behavior. No Profile, money, Evaluation, Tax Year selection, Completion, or saved-state value may appear in a route, query, fragment, title, history label, clipboard payload, or external URL during any journey.

### 3. Privacy and network gate

Qualified review of the exact release configuration is mandatory before the Saved-workspace successor reaches production. The reviewer must complete [the privacy applicability review packet](../privacy-applicability-review-packet.md), provide qualification and date, name the legal operator and contacts, cite controlling authority, approve or replace the notice/completion/deletion copy, and state approval separately for operation before and on or after 13 May 2027.

No blank, conditional, “unable to conclude,” or required-change response can be treated as approval for the affected behavior. If the review does not clear the exact Saved-workspace boundary, the successor release does not replace the current public journey. If an approval covers only the earlier period, saving and saved-data processing must fail closed no later than 13 May 2027 while bounded deletion and the separately reviewed unsaved calculator remain available. Analytics, a remote script, backend, account, cloud sync, export, recovery, document, identifier, or child-user change reopens the review.

For the production build and deployed preview, retain these inspectable checks:

- no `src/analytics.ts`, Google measurement ID, `gtag`, Tag Manager, Analytics, session replay, beacon, error-reporting SDK, or remotely executed JavaScript in source, lockfile additions, bundle text, DOM, or network traffic;
- no XHR, fetch, WebSocket, or beacon carrying Profile, money, Evaluation, Tax Year, saved-state, Completion, or share values;
- only the one namespaced workspace key is created, changed, or removed;
- all runtime scripts, fonts, images, captions, and video are same-origin;
- deployed Content Security Policy and other security headers match ticket 13 and block an attempted off-origin script;
- statutory/tutorial requests occur only after an explicit fixed-link navigation and contain no referrer or user-built query/fragment; and
- the privacy page, save notice, saved indicator, stop-saving behavior, whole-workspace deletion, and per-year deletion state current behavior accurately.

Do not substitute a privacy-policy page, a consent checkbox, localStorage, or a CSP test for the qualified review.

### 4. Statutory release gate

Immediately before Rule freeze, run the repository's compliance-review workflow against current direct official Sources. A reviewer must record the checked Rule dataset identity, Tax Year, review date, expiry, direct URLs, relevant provisions or notifications, calculations independently reproduced, and every unresolved point.

The first successor review must cover:

- classification and exclusions for both presumptive paths, receipt limits, cash tests, profit floors, and the five-year exclusion;
- applicable slabs, rebate, marginal relief, cess, rounding, income ceiling, advance-tax threshold/date, and supported annual-return triggers/date;
- GST aggregate turnover, state thresholds, compulsory-registration boundaries, and the thirty-day registration date;
- foreign-client, platform, export-of-service, authorised-route, income-source, and foreign-account Coverage boundaries;
- the 1 October 2026 FEMA transition guidance and the operative status of the intermediary place-of-supply amendment; and
- every normal date, extension, Source mapping, tutorial status, verification date, and expiry value exposed by the release.

Any missing, stale, indirect, contradictory, or period-mismatched Source blocks its core calculation or independently withholds its area. Search results, tax blogs, calendars, and portal banners are discovery aids, not Rule authority. The later registered-exporter release gets its own gate for LUT, monthly and complete QRMP GSTR-1/GSTR-3B dates, conditional PMT-06 review, export conditions, extensions, and then-current GSTR-9 treatment; the first release cannot pre-approve them.

### 5. Accessibility and interaction gate

Require a 100 Accessibility score from a mobile and desktop Lighthouse snapshot for `/`, each questionnaire state class, `/plan`, and `/privacy`, with zero critical automated findings. Then manually verify because the score is not sufficient:

- the entire flow works by keyboard with logical focus order, visible focus, and no trap;
- focus moves to the step heading, first invalid field, confirmation dialog, and restored main heading at the correct time;
- all fields have persistent labels, descriptions, and linked errors; grouped choices have a name and instructions;
- status, Coverage, save result, conflict, Completion, and deletion changes are announced without color alone;
- native date and money inputs remain understandable with Indian examples and errors;
- dialogs, details, buttons, and 44-pixel touch targets expose correct names and states;
- text reflows at 320 pixels and 200% zoom without horizontal scrolling or hiding the next action;
- VoiceOver on Safari and one desktop screen reader can complete save, resume, Completion, undo, and deletion; and
- reduced motion removes nonessential transitions while the interface remains fully understandable.

No confetti, autoplaying success motion, moving urgency indicator, or animation of money/deadline state passes this gate.

### 6. Performance and production behavior gate

On a Cloudflare deployment preview using the production build, require Lighthouse Performance of at least 90 on mobile for the landing, first questionnaire view, returning workspace, and privacy page; no layout shift caused by bundled fonts or restored state; no long task introduced by parsing/evaluating the small envelope; and no off-origin runtime request. Compare compressed JavaScript and media behavior with the current release and investigate any material regression rather than setting a speculative per-file budget.

Verify HTTPS, SPA fallback, MIME types, CSP and privacy headers, cache revalidation, deep links, and a clean-console smoke test. The local Evaluation must work after the initial static assets load with the network offline; external Source navigation and the landing video may naturally be unavailable.

### 7. Target-user and release gate

Run the five-person moderated test settled in ticket 04 against the release candidate. Participants must collectively cover domestic and foreign clients, direct and platform work, and both supported income paths. At least four of five must, without help, enter or revise a Profile, opt into saving, reload, identify what remains, create a Completion record, undo it, and delete the Saved workspace. All five must explain that saving is current-browser only and Completion is not government verification. Record only aggregate results and non-sensitive observations.

Build from a reviewed clean commit, retain the automated report, compliance record, completed privacy packet, browser matrix, Lighthouse reports, aggregate usability note, production-bundle network capture, and deployment URL together as the release evidence. Use a Cloudflare preview first, smoke-test the same artifact and headers, then deploy once; do not run a second public beta journey. Confirm the prior deployment remains available for rollback and perform a production smoke test without real taxpayer data.

The generic share action ships only if every privacy/payload/cancellation/fallback check passes; otherwise omit it. No production product event or post-release Analytics window is approved by this plan. Reintroducing measurement requires reopening the privacy, architecture, and success-measure decisions.
