# Verify the complete resources feature

Status: planned. Depends on [navigation integration](04-navigation-and-state.md) and all preceding issues.

## Result

The implementation has reproducible evidence for catalogue correctness, search relevance, source context, browser privacy, session preservation, accessibility, and responsive behavior. Unperformed manual checks remain visible.

## Work

1. Review the final change against SPEC.md, DESIGN.md, the [plan](../implementation-plan.md), and all catalogue publication decisions. Re-run source review for any description or identifier changed after its initial review.
2. Run `pnpm verify:release` after integration and resolve change-related failures. Confirm the new pure resources assertions execute through `pnpm test`.
3. Run `scripts/verify-resources-browser.tsx` in the intended browser context; do not count its mere existence as verification. Use the existing harness pattern rather than installing a browser-test framework for this slice.
4. Execute the plan's [end-to-end acceptance matrix](../implementation-plan.md#end-to-end-acceptance-and-release-evidence), including fresh denied/malformed/legacy storage, normal initialization afterward, edited-example preservation, selected-workspace round trips, Back/Forward, reload, and independent date boundaries.
5. Inspect URL/title/storage/network/outbound-link behavior using a synthetic sensitive-looking query. Ensure search and filters produce no requests or stored query text.
6. Review desktop, 1024px, 390px, 320px, 200% zoom, keyboard, screen-reader announcements, reduced motion, and mobile navigation visibility. Measure the production-built resource page against the existing performance/accessibility targets.
7. Have five representative Solo freelancers attempt the resource-finding and comprehension tasks described in the plan. Record outcomes and fix observed wording or matching problems. If participants are unavailable, mark this gate pending rather than simulate it.
8. Write `.scratch/resources/verification.md` with exact commands/results, date and browser evidence, content review status, remaining manual gates, and the tested commit or working-tree state. Update the map/issues to reflect actual completion.

## Acceptance

- Required automated checks and executed browser assertions pass for the integrated implementation.
- Relevance cases include negative and ambiguous queries; no excluded tutorial leaks through matches or suggestions.
- Source checks distinguish publication dates, reviewed periods, recorded review dates, and product review deadlines.
- Resource browsing does not modify stored or in-memory journey state except existing legitimate cross-tab changes.
- At least four of five participants complete resource-finding tasks without help; all understand that relevance does not establish personal obligations. Otherwise the usability gate remains open.
- No unrun check is described as passed. Local completion and public-release readiness are reported separately.
- No commit, deployment, or waiver of existing public-release gates is implied by this issue.
