# Resources page implementation plan

Status: implemented locally, 6 September 2026. See [verification](verification.md) for executed checks and remaining manual release gates.

Authority: the user's request to implement the proposed searchable resources page, beginning with `grill-with-docs`, with technical decisions delegated to the agent. Product behavior remains governed by [`SPEC.md`](../../SPEC.md), vocabulary by [`CONTEXT.md`](../../CONTEXT.md), and appearance by [`DESIGN.md`](../../DESIGN.md).

## Outcome and scope

A visitor can open `/resources`, find a relevant official document or help destination, understand what it covers, and open it without answering the questionnaire. A returning visitor can browse without losing their current estimate, edited fictional example, or workspace selection.

This page searches the reviewed collection, not the government websites or full document text. Matching a topic or task never establishes personal eligibility, an applicable deadline, or a filing requirement. The questionnaire and Evaluation remain the path to a personalized plan.

The initial collection uses the existing registry. At commit `f29fc73`, it contains 26 Source identities across 24 URLs. The publication plan yields 22 resources after description review: 20 distinct statutory documents and two official portals. Two unapproved tutorials stay withheld. See the [complete inventory](research/source-inventory.md).

Included in this slice:

- Public browsing, search, Topic and Task filters, counts, active-filter removal, and useful empty states.
- Reviewed plain-language titles, descriptions, aliases, document labels, and section references.
- Exact identifier matching and conservative typo suggestions.
- Safe fixed external links, recorded review dates, and independent warnings when reviewed coverage needs another check.
- Landing and plan navigation, passive public entry, and preservation of existing journey state.
- Automated catalogue and relevance checks, browser checks, and a small moderated usability check.

Deferred: collection expansion, a third-party guide programme, full-document indexing, generated answers, runtime AI, accounts, bookmarks, remotely stored searches, query analytics, user submissions, and resource detail routes. There is only one reviewed statutory Tax Year, so show coverage rather than a year filter. Add filters for publisher or document type only if the collection and observed user tasks justify them.

## Product decisions

| Decision | Selected behavior |
| --- | --- |
| Page name | `Resources` in navigation and as the page heading. |
| Landing entry | A visible `Browse resources` text link in the hero, alongside the secondary introductory links. Keep the current primary estimate/continue action. |
| Plan entry | A `Browse resources` link in the main content outside the result-state switch. It remains available for supported, stale, unsupported, and unavailable plans. |
| Questionnaire | No new step, prerequisite, or numbered sidebar item. |
| Initial view | All publishable resources, ordered by reader-facing title, with the count visible. No featured or personalized ranking. |
| Selection | One optional Topic and one optional Task. Different filters combine with AND; a resource can carry multiple topic/task tags. |
| Search updates | Update locally as input changes. Enter must not submit a GET request or change the URL. |
| Browsing state | Retain query and filters during internal navigation; reset on reload. Never save them to browser storage or router history state. |
| Return | Plain links back to the site and, when a journey is already in memory, back to that plan/estimate. Do not invoke actions that reset answers or select another workspace. |
| Public entry | A fresh `/resources` visit does not restore, migrate, or clean up saved answers. Normal initialization happens when the visitor enters another application route. |
| Personalization | No inference from stored Profile values and no automatic filtering from a saved plan. |
| Document opening | Existing `ExternalLink`; fixed registry URL; new tab; `noopener noreferrer`; no prefetch. |

These decisions follow the previously accepted proposal, current product boundaries, and the user's delegation. No product/design ambiguity remains to interview. No new ADR is needed because this feature reuses existing ownership and privacy decisions without a hard-to-reverse architecture change.

## Catalogue and publication

Add a small local catalogue in `src/resources/index.ts`. Keep display metadata out of `Source`: its legal schema currently validates exact keys. Leave the Rule registry and Evaluation provenance intact.

Each catalogue definition contains:

- A nonempty `sourceIds` tuple. Its first identity is the canonical resource identity and supplies the main official title and fixed URL.
- A reader-facing title and one or two short sentences describing the document's coverage.
- A document-type label, such as `Act`, `Section`, `Notification`, `Circular`, `Official FAQ`, or `Official portal`.
- Typed Topic and Task arrays drawn from the taxonomy below.
- Reviewed plain-language aliases and primary document/form/section identifiers for matching and ranking.
- Optional textual section references where a full document covers several independently useful subjects.

Reuse registry publisher, URL, official title, source kind, tutorial status, review date, and period. Do not copy them into the catalogue. Do not repeat tax thresholds, rates, due dates, or applicability tests in search metadata. A description may identify what a source discusses without restating its legal conclusion.

The amended Act's three identities become one resource. Retain references to salary and rebate material and their distinct source-review dates. Do not delete duplicate Source identities or merge different URLs through a heuristic. Never invent anchors or PDF page links; only add a new fixed section URL after its own source review.

Represent the two withheld identities explicitly with their reason in the catalogue's exclusion list. Validation must account for every registry identity through exactly one published definition or a documented exclusion. A newly added source therefore requires a conscious catalogue decision instead of silently entering public search.

Validate source display metadata per resource independently of root Rule validity: nonempty title/publisher, safe HTTPS URL without credentials, valid calendar dates, and a recorded source-review date no later than the supplied current India date. If a publication date exists, validate its chronology too. Withhold only the affected resource for malformed or future review metadata. Same-URL grouping also requires consistent source kind, publisher, and statutory period; do not combine incompatible years into one apparently current result. This is a small bibliographic integrity check, not a second legal-schema validator.

Publication rules:

| Source state | Resources behavior |
| --- | --- |
| Valid statutory reference with reviewed catalogue copy | Publish as the appropriate reference type. |
| Tutorial `approved` | Eligible for publication only after catalogue copy and period coverage are reviewed. No such entry exists initially. |
| Tutorial `starting-link-only` | Publish as `Official portal` or `Official help portal`; explain that it is a starting point. Do not call it a reviewed filing guide. |
| Tutorial `provisional`, `deferred`, or `rejected` | Exclude from results, counts, aliases, and suggestions. |
| Unknown identity, invalid URL, inconsistent grouping, or invalid catalogue metadata | Withhold the affected resource. Fail the catalogue verification command. |
| All entries withheld by invalid metadata | Show the library-unavailable state and a home link. Do not invent replacement links. |

For each published entry, record source inspection, checked title/description/classification/identifiers, review date, and any access limitation in `research/source-review.md` during implementation. Do not predate or invent review evidence. Use the compliance-review skill for source-derived copy and identifiers. If a proposed description cannot be substantiated, shorten it to bibliographic coverage or withhold it.

## Taxonomy

| Control | Values, in display order |
| --- | --- |
| Topic | All topics; Income tax; GST; Overseas clients |
| Task | All tasks; Understand tax methods; Understand tax rates and deductions; Pay advance tax; File an income tax return; Register for GST; File GST returns; Understand LUT; Receive overseas payments |

Explain `LUT` as `Letter of undertaking` beside that choice or in the adjacent helper. Keep `GST` visible because it is the established product term. Salary-related searches lead to the reviewed combined-income material; do not create an unsupported salary-only journey.

The [inventory table](research/source-inventory.md#initial-catalogue-coverage) assigns every initial resource to these choices. GST export/LUT material may belong to both GST and Overseas clients. Do not tag all Income tax material with Overseas clients merely because some freelancers have them.

Calculate each option's count using the search query and the other filter, ignoring its own currently selected value. Count unique resources, not Source identities. Keep option labels and order stable. Disable zero-count choices except an already selected choice; `All topics` and `All tasks` always remain available. Never silently remove a selected filter when the query changes.

Show active filters as removable text-labelled controls and provide `Clear filters` when any filter is active. This action leaves search text intact. `Clear search` leaves filters intact. An empty-state action can explicitly offer `Show all resources`, which clears both.

## Search contract

Implement pure functions in `src/resources/index.ts`, with explicit catalogue and date inputs. Use ordinary strings and arrays; the collection does not need a dependency, backend, worker, inverted index, or search service.

Search these reviewed fields: reader title, description, official source titles, aliases, primary identifiers, section references, publisher, known reviewed statutory period, and Topic/Task labels. Do not index URLs, arbitrary internal IDs, unpublished entries, raw Rule error strings, research notes, or general scope disclaimers. An exclusion sentence containing `foreign salary` must not itself make the page recommend a resource for foreign salary.

Matching behavior:

1. Normalize Unicode compatibility characters, case, whitespace, and ordinary punctuation. Keep the original query only in memory for display. Bound the input to 200 characters.
2. Canonicalize reviewed identifier spellings such as `GSTR-3B`, `GSTR 3B`, and `GSTR3B` to the same token. Match section numbers, notification references, alphanumeric form names, and year references exactly. Never use numeric substring or fuzzy matches.
3. Use reviewed phrase aliases, including `ITR` / `income tax return` and `LUT` / `letter of undertaking`. Do not add legacy-section or period aliases without a verified mapping and visible context.
4. Ignore only a small explicit list of question/function words when a meaningful token remains. Preserve negation and words such as `before`, `after`, and `without`. Empty/whitespace queries browse everything; nonempty queries with no meaningful searchable term show recovery guidance rather than pretending to have an exact match.
5. Require every meaningful token or reviewed phrase equivalent to match within the same resource's searchable fields. Allow a prefix on the last ordinary alphabetic word of at least three characters while typing. Do not prefix-match protected identifiers, years, or numbers.
6. Apply Topic and Task constraints to those matches. Do not fall back to OR matching or silently drop filters to fill the list.
7. Rank matches by exact primary identifier first, exact reader/official title phrase next, then reviewed alias/section-reference phrase, then general token matches. Prefer title matches over descriptions and tags within a tier. Break ties by reader title and then canonical identity. A dedicated section result must precede a broad Act for the section's exact query.

On zero results, offer at most one `Did you mean …?` action when one ordinary alphabetic token of at least five characters has a unique one-edit correction among the published catalogue's words and that corrected query returns results with the current filters. Permit insertion, deletion, substitution, or one adjacent transposition. Never suggest corrections for numeric tokens, form/section identifiers, period labels, or multiple uncertain words. Apply the correction only after a click. Do not introduce a generic fuzzy-search framework for this bounded behavior.

Parse explicit `Tax Year {year}` query phrases as a structured constraint on statutory `taxPeriod`, removing that phrase from ordinary word matching. A supported period restricts matches to statutory sources with that period; a different period returns the period-specific empty state. Portals have no inferred period. Assessment Year or other unreviewed period-label variants show the explanatory empty state, not an automatic conversion. A bare year or a year in an Act/notification title remains a document-reference search. For example, `AY 2026-27` must not match solely because a source is tagged `Tax Year 2026-27`.

## Review dates and unavailable coverage

Keep publication date, source-review date, product review deadline, and covered period distinct. The normal resource card shows recorded source review and reviewed coverage where known; it makes no blanket `current`, `verified`, or `applies to you` claim.

For a grouped document, show the oldest constituent source-review date. A native `details` disclosure exposes the official title, individual source-review dates, publication date when present, and reviewed section references. Do not substitute a recent partial review for the combined document's oldest review.

Derive affected Rule groups through existing provenance and covered Rule identities, not from display tags. Read `validateRules(dataset, now)` once per catalogue evaluation and inspect the independent group statuses when root validation succeeds. When root validation fails, treat reviewed statutory coverage as unavailable for the whole dataset; do not parse human-readable error strings to guess a stronger status.

- A valid fixed bibliographic link remains usable when the product's Rule review is stale or unavailable.
- Add `Review needed` to affected resources and identify the affected topic in plain language. Do not call the underlying document expired or withdrawn.
- A document used by several groups lists the affected area without implying that unrelated areas also failed. If root validity is unavailable, use the broader review warning.
- Portal entries have no statutory Tax Year or legal provenance. Show their recorded source-review date without inventing a Tax Year or claiming they establish current dates.
- Rejected/withheld tutorials and structurally unsafe resources remain withheld regardless of a user's query.

Initial date checks must cover 30 September and 1 October 2026 for independent GST-calendar/LUT review warnings, and 1 September 2027 for dataset-wide review warnings. Refresh catalogue date state when the page mounts and when the visible tab regains focus, so a returning tab does not keep an earlier day's warning state. Use the shared `indiaDate` helper; do not add a timer framework or change Evaluation expiry behavior.

## Interface and copy

Use the existing `.reference-page` centered column, Fraunces headings, Inter controls/body copy, semantic Tailwind tokens, and source-owned components. Search spans the column. Two filters sit side by side when their labels fit and stack on narrow screens. Results are a single semantic list of compact white resource cards. Avoid a filter drawer for two controls. Plain, predictable categories follow [NN/g's filter-design research](https://www.nngroup.com/articles/filter-categories-values/); the specific taxonomy comes from this collection.

Each result presents the reader title as the main external link, followed by the coverage description, publisher and document label, relevant period where known, source-review date, and any review warning. An optional `Source details` disclosure holds the longer official title and section details. Keep essential warnings visible without opening it.

Reuse `Input`, `Button`, `Badge`, `Card`, and the local `Select` primitives. `SelectControl` lacks disabled options; use the underlying existing Select components for counted/disabled filter options instead of expanding every questionnaire control for this page. Use native `details`/`summary` for source details. `ExternalLink` already supplies new-tab semantics and referrer protection.

| State or control | Planned copy / behavior |
| --- | --- |
| Heading | `Resources` |
| Introduction | `Find official references and help for freelance taxes in India. No financial details needed.` |
| Scope note | `These resources explain topics and tasks. Your answers are needed to work out which obligations apply to you.` |
| Search label | `Search resources` |
| Search placeholder | `Try advance tax, GST registration or LUT` |
| Search helper | `Search titles, descriptions and common terms in this collection.` |
| Filter labels | `Topic` and `Task` |
| Result count | `{count} resource` / `{count} resources`; count is a polite status message. |
| Remove Topic | Visible selected label; accessible name `Remove topic filter: {topic}`. |
| Remove Task | Visible selected label; accessible name `Remove task filter: {task}`. |
| No match | `No resources match your search.` Show selected constraints and useful clear/search-suggestion actions. |
| Filtered empty | `No resources match these filters.` Offer `Clear filters`. |
| Unsupported period query | `This collection covers Tax Year 2026-27. An Assessment Year can refer to a different period.` Do not present another period's material as an exact match. |
| Review warning | `Review needed` and `The rules linked to this topic need another review. Check the official source for updates.` |
| Grouped review label | `Source checks recorded from {oldest_date}`; individual dates in Source details. |
| Single-source review label | `Source last checked {date}`. |
| Official help portal | `Official help portal` with a short description that identifies it as a starting point. |
| Catalogue unavailable | `Resources are unavailable right now.` Link back to My Next Filing; no invented retry network action. |
| Site return | `Back to My Next Filing` |
| Existing journey return | `Return to your plan` or `Return to your estimate`, based on the existing in-memory journey. |

The strings are interaction copy, not a substitute for source review. Check them with the write-ux-copy skill in the rendered states before committing implementation.

Accessibility and motion:

- Persistent visible labels, semantic search landmark/form, labelled filters, and a semantic result list with heading links.
- Prevent form submission. A native search input alone does not prevent a form from sending its query, as shown in [MDN's search-input examples](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/search). No initial input autofocus or automatic mobile keyboard opening. Match existing route-heading focus on navigation.
- Result changes never move focus, remount the input, scroll the page, or replay route entry. Announce the result count only, not the whole list.
- After removing a filter, move focus to its owning select if the removal control disappears. Keep clear-search focus in the search field.
- Use at least 44px interactive targets, text alongside warning color, visible focus, and the existing new-tab announcement.
- No list-reordering or height animation during search. Existing route entry and control feedback continue to respect reduced motion.
- Check desktop, 1024px, 390px, 320 CSS pixels, 200% zoom, keyboard, and screen-reader announcements.

## Routing, session preservation, and privacy

Keep `/resources` as a child of `AppFrame`. Moving it into a separate application root would discard in-memory journey state when navigating between roots. Add one `{ query, topic, task }` state object to AppFrame and expose it through `AppOutletContext`. It has no Profile fields and is excluded from every persistent schema.

Make these bounded changes in `src/app.tsx`:

1. Use the router's own case-sensitive route matcher, including its trailing-slash and decoded-path behavior. Declare the questionnaire session before computing example mode. On resources, derive example mode from the retained session; elsewhere retain the current fixed `?example=1` behavior.
2. Return early from the one-time initialization effect on resources before setting its initialized ref. Also retain its existing already-initialized guard. Add the resources-route flag to the dependencies. This prevents fresh browsing from loading, migrating, deleting, or restoring saved data.
3. Skip the example/personal reconciliation effect while on resources. Preserve both the edited example and the personal return session.
4. Attach the storage-event listener only after the normal app initialization has run. Preserve existing cross-tab handling after initialization.
5. Render the resources outlet even when the normal app is uninitialized; retain the existing initialization/example gate for other routes.

The fictional-example banners already belong to the questionnaire and plan routes, so they unmount naturally on resources. Do not add another banner guard in AppFrame. Preserve the retained example/return session and the state of genuine storage/recovery notices.

Leave `useRecoveryLifecycle` and persistence codecs unchanged. An initialized journey keeps its current synchronization inputs when entering resources. Changing browse state alone must not cause a save, cleanup, or re-evaluation. Do not suppress pending data operations or legitimate cross-tab changes merely because resources is visible.

Use plain router Links for resources entry and exit, not `startPersonal`, `returnPersonal`, or `openWorkspace`. Returning to a retained fictional journey can use the existing fixed `/plan?example=1`; otherwise use `/plan`, whose current guard routes an incomplete unselected session to its questionnaire. The resources URL stays generic. A site-home link retains the current home/personal-mode semantics.

Do not put a resources link only in `.journey-note`; that content is hidden at smaller widths. Keep the landing link in the hero and the plan link in main content outside `renderPlan()`. Do not add resources to the numbered journey or mobile fixed action bar.

Queries can contain financial details even though the interface never asks for them. They and filters must remain in memory: no URL query/fragment, title, log, telemetry, clipboard, storage, router history payload, or external request. Never build an external link from search text. Keep the page title static and the existing no-referrer policy. Source documents are fetched by the browser only after the user opens their fixed link.

The existing static SPA fallback supports the new route. No Cloudflare binding, Worker code, configuration change, or deploy is required to implement the page.

Implementation evidence refined two technical details. React Router already reads its own `remix-router-transitions` session key while constructing the router; the passive-entry boundary excludes Profile/Recovery/workspace access and cleanup, not the framework's unrelated transition bookkeeping. The initial production page scored 87 for Lighthouse mobile performance. Use React Router's built-in lazy screen loading for landing, questionnaire and Plan while retaining the existing AppFrame. Child-route load errors must remain inside that frame so a failed module request cannot discard unsaved answers. Source metadata lives in `src/resources/catalogue.ts` separately from search/review logic for readability.

## File plan

| File | Change |
| --- | --- |
| `SPEC.md` | Adopt the public resources contract, route, passive-entry behavior, temporary search state, publication boundary, and acceptance checks when implementation begins. |
| `CONTEXT.md` | Resource term added during planning; keep it a glossary. |
| `src/resources/index.ts` | Catalogue, classifications, explicit exclusions, integrity checks, source resolution/grouping, review-state derivation, pure search/filter/suggestion functions. Split only if actual readability warrants it. |
| `src/resources/catalogue.ts` | Authored resource definitions, typed Topic/Task labels and explicit exclusions. |
| `src/routes/resources.tsx` | The resource page, local date refresh, filter controls, result list, source details, recovery states, and plain return links. |
| `src/app.tsx` | Route registration, browse-state ownership, initialization/example guards, delayed storage listener, outlet gate, and on-demand loading of other screens with a state-preserving route error. |
| `src/app-context.ts` | Typed browse state and setter in the existing outlet context. |
| `src/routes/landing.tsx` | Visible resources entry. |
| `src/routes/plan.tsx` | Visible resources entry across result states. |
| `src/styles.css` | Only the responsive resource layout rules that cannot be expressed cleanly with existing utilities. |
| `scripts/verify-resources.ts` | Node-assert catalogue, date, matching, ranking, suggestion, and facet checks. |
| `scripts/verify-resources-browser.tsx` | Small mounted/browser-console integration check using the existing verification-script pattern for the real shell effects. |
| `package.json` | Include the pure resources assertions in `pnpm test`. No new dependency. |
| `.scratch/resources/research/source-review.md` | Actual per-resource description/source review evidence, written during implementation. |
| `.scratch/resources/verification.md` | Commands, browser evidence, usability outcomes, and remaining manual release gates, written during verification. |

Do not modify tax arithmetic, tax Rules, Source identities/statuses, saved schema versions, recovery migrations, or the statutory-source components on the personalized plan just to support browsing. If source inspection finds a pre-existing legal issue, record it and handle the affected resource conservatively; do not smuggle an unrelated tax correction into this slice.

## Ordered implementation issues

1. [Prepare the catalogue](issues/01-prepare-catalogue.md). Adopt the product contract, review all initial descriptions/classifications, explicitly group/withhold entries, and establish integrity and date behavior.
2. [Implement search and filters](issues/02-search-and-filters.md). Build deterministic matching, protected identifiers, ranking, facet counts, and bounded correction suggestions against the reviewed catalogue.
3. [Build the page](issues/03-resources-page.md). Implement all visible states using the existing design system and accessible controls.
4. [Integrate navigation and preserve state](issues/04-navigation-and-state.md). Add route and links, make fresh entry passive, and verify real restoration/example effects.
5. [Verify the complete feature](issues/05-verification.md). Run source and relevance checks, the production build, browser journeys, accessibility checks, and representative find-a-resource tasks.

Issues 1 and 2 define the data contract used by the UI. Issues 3 and 4 complete one integrated feature before final validation. Do not create an empty placeholder catalogue or a public half-working route as an intermediate release.

## Relevance acceptance cases

Use stable canonical source identities in assertions, with a fixed clock. Cases specify useful outcomes rather than reproducing the implementation's scoring formula.

| Query / condition | Required result |
| --- | --- |
| Empty query, no filters | Every publishable resource exactly once; baseline 22 after initial review. |
| `advance tax` | The payment threshold and timing references are near the top; provisional challan guide absent. |
| `how do I pay advance tax` | Relevant advance-tax references remain discoverable with question wording. |
| `ITR` and `income tax return` | Equivalent relevant resource sets, including `section-263`; deferred return guide absent. |
| `GSTR3B`, `GSTR-3B`, `GSTR 3B` | Equivalent matches with `gst-notification-82-2020` ahead of unrelated material. |
| `GSTR-1` | `gst-notification-83-2020` ranks ahead of resources solely about GSTR-3B. |
| `GSTR-9` | No automatic conversion to another GST form or claim of supported annual-return coverage. |
| `section 58` | `section-58` precedes broad Act material; `section-62` is not an exact replacement. |
| `section 156` or `salary` | Grouped amended Act discoverable once with the relevant reviewed reference. |
| `LUT` and `letter of undertaking` | Equivalent relevant sets covering the three reviewed LUT sources. |
| `GST registration` | Registration sources and the clearly labelled help portal are discoverable. |
| `overseas payments` | Reviewed FEMA material is discoverable without claiming all foreign-income guidance is covered. |
| `foreign salary`, `capital gains`, `company incorporation` | No unrelated resource presented as an exact supported answer through broad synonym expansion. |
| `AY 2026-27` | No silent substitution of Tax Year 2026-27; period guidance instead. |
| `advance tax Tax Year 2026-27` | Matches the supported advance-tax references using their recorded period; no inferred period is added to portals. |
| `GST Tax Year 2026-27` / `GST AY 2026-27` | The first finds matching statutory GST references; the second does not silently reuse that set. |
| `44ADA` | No unreviewed alias to current section references. |
| `advnace tax` | No automatic rewrite; one actionable `advance tax` suggestion if it yields matches under the active filters. |
| `section 59` | No spelling correction to section 58. |
| Search + Topic + Task | Results satisfy every active constraint; counts and removal controls agree. |
| Filter becomes zero after typing | Preserve it visibly and offer recovery; never silently broaden. |
| Duplicated Act sources | One resource, all reviewed section references retained, oldest source-review date displayed. |
| Same URL with incompatible statutory periods | Invalid grouping is withheld and fails validation rather than merging years. |
| One malformed or future source-review date | Withhold that resource; a healthy independent resource still renders correctly. |
| Only `annual-return` group synthetically expires | The grouped Act identifies the annual-return review warning through covered Rule identities without mislabelling its other coverage. |
| 1 October 2026 | GST-calendar/LUT references show review warnings while independently valid areas remain available. |
| 1 September 2027 | Safe bibliographic links remain; statutory coverage has review warnings and no current-applicability claim. |

Include unsafe/missing references, disallowed tutorial statuses, duplicate catalogue assignments, empty required metadata, and malformed source URLs in the catalogue checks. Assertion output uses synthetic queries and stable identities only; application code never logs user queries.

## End-to-end acceptance and release evidence

Run `pnpm verify:release` once after the integrated implementation, resolving failures related to the change. It covers formatting, lint, types, Rule validation, deterministic tests, build, and built-asset checks. The new pure resource script must be part of that path. Independently stale groups require the explicit resources tests above because root Rule validation alone is insufficient.

Run the mounted/browser-console resources check separately; the current release command does not execute browser-console scripts. Use isolated browser contexts and synthetic storage only:

- Direct resource-route variants and reloads work with missing, denied, malformed, and legacy storage. Before leaving the public route, verify no attempted Profile, Recovery or workspace reads, writes, cleanup, or migration, including after a synthetic storage event. Identify React Router's existing transition-key access separately.
- Enter the normal app from fresh resources and confirm restoration occurs before existing synchronization.
- Browse and return from incomplete personal answers, complete unsaved plans, a selected workspace with a separate personal draft, and an edited fictional example. Compare in-memory state and stored bytes across Links and Back/Forward. Do not confuse expected cross-tab updates with mutations caused by browsing.
- Search/filters survive internal route navigation and reset on reload. Source details can reset on route re-entry; they have no saved state.
- Search typing, Enter, filters, clear actions, and suggestions make no external requests and put no query/filter values into URLs, titles, storage, logs, or outbound links. Verify with a synthetic sensitive-looking marker.
- Keyboard users can reach every result, filter, clear control, disclosure, and return link. Announcements describe counts without reading the whole list; focus stays useful when a filter control disappears.
- Compare desktop, 1024px, 390px, 320px, 200% zoom, and reduced-motion states. Check overflowing titles, counts, filter labels, warnings, and touch targets.
- Verify links are visible on mobile landing and all plan states. No new numbered journey step or confetti appears for resources navigation.
- Check the production-built page's performance and accessibility against the existing targets, recording any unavailable measurement rather than claiming it passed.

Use a short moderated check with five representative Solo freelancers, arranged by the product owner. Tasks: find an advance-tax reference, find the GSTR-3B resource from an unhyphenated query, find LUT material, recover from a restrictive filter, and distinguish an official portal from a reviewed how-to guide. Target at least four of five completing the resource-finding tasks without help, and all five understanding that search relevance does not establish personal obligations. Treat the target as a release criterion, not fabricated evidence or a guarantee of perfect search.

Local implementation can finish while participant recruitment remains pending. Record such manual gates honestly. This slice does not waive the repository's existing qualified reviews or public-release gates, and does not authorize deployment or a commit.
