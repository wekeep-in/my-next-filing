# Resources implementation verification

Verified locally on 6 September 2026, on the working tree following planning commit `6fbf45c`. The planning documents are committed; the implementation remains uncommitted. No deployment was performed.

## Implemented

`/resources` exposes 22 distinct documents/official portals with reviewed coverage descriptions, local search, Topic/Task filters, counts, explicit recovery, source details, and review warnings. Two unapproved tutorials remain excluded. Existing Source identities, statuses, dates, Rules, calculations, and persistence schemas are unchanged.

The page uses the existing visual system and controls. Landing and Plan links are visible outside mobile-hidden sidebar content. Browser-only search state survives internal navigation. Resources entry preserves personal, edited-example and workspace state, including failed writes. Fresh public entry leaves application data untouched.

## Automated checks

`pnpm verify:release` passed on the integrated implementation:

- Formatting, lint and TypeScript checks.
- Existing Rule validation and Profile/Evaluation/workspace/completion assertions.
- Existing frontend, salary and GST-calendar/LUT/migration assertions.
- New resource catalogue, relevance, protected identifiers, spelling suggestions, period constraints, facet counts, exclusions, malformed bibliography, grouped dates, and independent/root review-failure assertions.
- Production build and generated-bundle/static-header checks.

The existing large-chunk advisory remains for the asynchronously loaded video player. No dependency was added.

## Browser evidence

Used isolated Chromium 151.0.7922.34 contexts through the already available Playwright installation. All stored data and input markers were synthetic. Browser tools were not added to the application or dependency manifest.

Executed the browser-console harness in the real application:

```js
await (await import('/scripts/verify-resources-browser.tsx')).verifyResourcesBrowser(true)
```

It passed for complete personal plans, edited questionnaire answers, edited fictional examples, personal return sessions, selected workspaces with a separate personal draft, Back/Forward, query retention, fixed links, storage-byte preservation, and simulated failed Recovery writes. The final mobile state also checks that retained storage notices do not cover Resources navigation.

After that test, blocked the next `/src/routes/landing*` request and executed:

```js
await (await import('/scripts/verify-resources-browser.tsx')).verifyResourcesLoadFailure(true)
```

The recoverable screen appeared inside AppFrame and the latest unsaved personal amount survived. A separate pointer-driven mobile run also opened its return links successfully. Failed lazy imports resolve to the recoverable screen rather than leaving an unresolved child route with an empty outlet.

Additional browser checks passed:

| Check | Evidence |
| --- | --- |
| Passive public entry | Empty, denied, malformed and legacy storage at `/resources`, `/resources/`, `/resources//`, and `/resource%73`; application storage access remained absent even after a storage event. |
| Normal initialization afterward | Leaving Resources for the landing page invokes the existing restoration behavior. |
| Query privacy | Typing a synthetic sensitive-looking marker, Enter submission, and search/clear interactions did not change URL/title, access application storage, request remote content, or put the marker into outbound links. |
| Reload | Browse values reset; application data is not cleaned up by the resource route. |
| Responsive layout | 1440px, 1024px, 390px and 320px checks showed no horizontal overflow. Reviewed screenshots of ordinary and filtered states. |
| Zoom | 200% zoom at 1024px retained the layout without horizontal overflow. |
| Automated accessibility | axe reported no violations at all four widths and in the expanded grouped-source state. |
| Keyboard | Keyboard-only search/filter traversal and selection, unavailable-option selection guard, active-filter removal focus, and native source disclosure activation passed. Base UI permits keyboard focus on unavailable options so their labels/counts can be read, while preventing selection. |
| Reduced motion | Checked reduced-motion contexts and immediate resource-result updates; the list does not animate. |
| Mobile navigation | Landing, missing Plan, supported fictional Plan and stale fictional Plan links reached Resources. The real-shell tests also cover workspace and failed-write return navigation. |
| Review boundaries | 1 October 2026 showed seven GST-calendar/LUT resource warnings while all 22 references remained accessible. 1 September 2027 showed warnings on all 20 statutory resources, retaining the two portal entries without invented statutory coverage. |

React Router reads its existing `remix-router-transitions` session key during router construction. Instrumentation identified that framework call separately from application data access. The feature introduces no query persistence and does not access Profile, Recovery or workspace data on a fresh Resources visit.

## Performance

The initial production resource page scored 87 for mobile Lighthouse performance and 100 for accessibility. On-demand loading of the landing, questionnaire and Plan screens brought the measured page to the repository target: 90 performance and 100 accessibility. The resource route remains immediately available, and AppFrame remains mounted through normal navigation and screen-load failure.

Measured against the local production preview at `http://127.0.0.1:4187/resources`. Lighthouse and screenshot artifacts are under `/tmp/mnf-resources-*` in this workspace; they are local diagnostics rather than committed release artifacts. These are synthetic lab measurements, not field-performance data.

## Source and manual-release limits

The [source review](research/source-review.md) records each description/identifier check. Six official destinations could not be read successfully through the automated requests. Their resources retain conservative bibliography and existing review evidence; no recorded source-review date or approval status was advanced. The two official portals are not presented as reviewed how-to guides.

The five-person moderated resource-finding/comprehension check has not been run. A dedicated assistive-technology session, the repository's existing qualified privacy/compliance approvals, extension review, and full public-release browser/deployment gates are also not closed by this local feature verification. Local implementation is complete; public-release readiness remains subject to those gates.

## Resources layout and copy follow-up

The landing hero link now lives in a FAQ about browsing without completing the form. Its link uses the same computed typography and underline styles as the operator email link. Resources uses a wider two-column layout with filters and navigation buttons on the left. Narrow containers stack the layout, including at 200% zoom. Resource cards combine metadata and retain expandable provenance. Search help, source labels, review warnings, and empty-state recovery copy were revised without changing reviewed catalogue descriptions or statutory data.

Formatting, lint, typecheck, build, and resource assertions passed after the redesign. Browser checks passed at 1440px, 1024px, 390px, 320px, and 200% zoom. Axe reported no violations. The existing round-trip harness passed, as did keyboard filter/disclosure checks, reduced-motion browsing, clear-search focus, query privacy, passive entry, review warnings, and desktop/mobile FAQ navigation. Screenshots and the additional browser checks are under `/tmp/mnf-resources-redesign-*`.

The spacing follow-up matches the step heading size and desktop top padding, adds 8px between filter labels and controls, and replaces the navigation with one primary `Back to Home` link. The description uses the full header width. A 32px gap replaces the sidebar divider. Formatting, lint, typecheck, build, responsive accessibility checks, keyboard Home navigation, and the updated history-based round-trip harness passed. Follow-up browser checks and screenshots are under `/tmp/mnf-resources-refined-*`.

Review-period and source-check dates now appear as separate bullets inside `About this source`. The per-source check-date repetition was removed; publication dates and source references remain. Expanded and collapsed states passed checks at 1440px, 1024px, and 390px, including one occurrence of the check date. Screenshots are under `/tmp/mnf-resources-source-details-*`.

Search and LUT help now use information tooltips beside their labels, with the explanations also available to screen readers. The estimator note was removed. Tooltips open to the right above 860px and above the icons on smaller screens. Hover, keyboard focus/Escape, touch toggle/outside dismissal, responsive placement, WCAG 2.1 A/AA checks, and the browser round-trip harness passed. Formatting, lint, typecheck, and build passed. Screenshots and the focused check are under `/tmp/mnf-resources-help-*`.
