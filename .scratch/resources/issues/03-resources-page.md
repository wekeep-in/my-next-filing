# Build the accessible resources page

Status: implemented and verified locally. Responsive, keyboard and automated accessibility checks are recorded in [verification](../verification.md).

## Result

The public page presents the collection in the established visual system, with visible search/filter labels, useful descriptions and review context, and clear ways out of empty results.

## Work

1. Build `src/routes/resources.tsx` around the existing `.reference-page` column and source-owned Input, Select, Button, Card, and Badge components.
2. Render the title, short introduction and scope note, search field, Topic/Task controls, active-filter removal controls, result count, and one semantic list of resources.
3. Use the existing Select primitives for counted/disabled options. Do not expand the questionnaire's shared SelectControl API just for this page.
4. Render each resource's reader title link, description, publisher/type, known period, recorded source-review date, and visible review warning. Use native Source details disclosures for official titles, section references, and constituent dates.
5. Use fixed registry links through ExternalLink. Do not fabricate deep links, embed government pages, prefetch destinations, or fetch document content.
6. Implement the [planned copy and states](../implementation-plan.md#interface-and-copy), including normal/filtered empty, suggested correction, ambiguous period, per-resource review warning, and full catalogue unavailability.
7. Refresh date-dependent warnings on mount and tab-focus return using the shared India-date behavior. Do not animate result changes or reorder transitions.
8. Keep focus in edited controls as results change; announce the count only. Restore focus appropriately when a removable active-filter control disappears. Prevent form submission and skip initial search autofocus.

## Acceptance

- Every published entry can be reached without answering a questionnaire.
- Topic and Task are the only filters; source and period context is visible without an unnecessary filter panel.
- Clear search preserves filters, Clear filters preserves search, and Show all resources clears both.
- The list never calls a portal a reviewed step-by-step guide or a match a personal obligation.
- Titles, source details, empty states, and warnings work at desktop, 1024px, 390px, 320px, and 200% zoom.
- Keyboard, focus, target size, external-link announcements, and reduced motion follow DESIGN.md.
- No new visual language, mobile drawer, generic results component framework, or per-resource detail route is introduced.

Verification: write-ux-copy review in rendered context; lint, types, and build after route wiring. Record visual/accessibility evidence in issue 5.
