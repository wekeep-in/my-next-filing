# Searchable resources

Status: implemented and verified locally, 6 September 2026. Manual usability and public-release gates remain pending.

The user approved a public resources page after the product assessment and requested a full plan through `grill-with-docs`. Technical and obvious decisions are delegated to the agent. Ask about product or design only if a material ambiguity remains.

- [Implementation plan](implementation-plan.md)
- [Implementation verification and remaining gates](verification.md)
- [Resource description/source review](research/source-review.md)
- [Current source inventory and publication decisions](research/source-inventory.md)
- [Prepare the catalogue](issues/01-prepare-catalogue.md)
- [Implement search and filters](issues/02-search-and-filters.md)
- [Build the resources page](issues/03-resources-page.md)
- [Integrate navigation and preserve journey state](issues/04-navigation-and-state.md)
- [Verify the complete feature](issues/05-verification.md)

## Decision tree

| Branch | Decision | Basis |
| --- | --- | --- |
| Purpose | Find relevant references without entering a Profile. | User request and accepted product assessment. |
| Audience and scope | Existing Solo freelancer topics and registered source collection. | Current product boundary; no broader tax research service requested. |
| Entry | Public `/resources`, with visible links on landing and all plan states. | Accepted assessment. |
| Reading experience | Searchable document list, short descriptions, Topic and Task filters, clear review context. | Accepted assessment and existing design system. |
| Personalization | No applicability decisions or automatic Profile-based filters. | Existing Evaluation boundary. |
| Publication | Consolidate duplicate documents; include official portals as starting points; withhold unapproved how-to material. | Registry status and existing source policy. |
| Search | Local, deterministic matching over reviewed metadata with protected identifiers and periods. | Technical decision delegated to agent. |
| State and privacy | Preserve journey state; hold browse state in memory; no search text in requests, URLs, logs, titles, or storage. | Existing privacy contract and delegated technical decision. |
| Freshness | Keep safe references accessible with clear review warnings; expired Rules never become current advice through search. | Existing stale-plan behavior and independent Rule groups. |
| Visual design | Existing Fraunces/Inter, semantic colors, compact cards and source-owned controls. | `DESIGN.md`; no redesign requested. |
| Verification | Catalogue validation, relevance assertions, browser journeys, accessibility and source review. | User's accuracy requirement and repository checks. |

## Interview frontier

No unresolved product or design question was found. The accepted proposal settles the experience; the user delegated the remaining technical choices. The plan states the consequential defaults and edge cases explicitly rather than asking the user to choose implementation details.

The planning workflow read `grill-with-docs`, `grilling`, and `domain-modeling` directly because this session has no dedicated Skill tool. Fact-finding was delegated as the grilling workflow directs. `CONTEXT.md` now distinguishes a Resource from an Obligation or personalized result. No new ADR is warranted: these choices reuse existing boundaries and can be revised without a new architectural commitment.

## Completion record

- Completed the linked plan, current-source inventory, and five ordered issues.
- Checked document links, file references, internal consistency, and whitespace. The source inventory and search/freshness contracts received a second read-only fact check.
- Committed the planning documents as `6fbf45c`, then implemented the five issues. The catalogue has 22 resources and two explicitly withheld tutorials.
- Source descriptions were reviewed with recorded access limitations. Automated release checks and browser validation passed; see the verification record for evidence and the manual gates still pending.
- Browser evidence added passive route matching through the router, spacing for retained storage notices, and on-demand loading of other screens to meet the performance target. Failed screen imports retain AppFrame and unsaved answers.

Do not mark implementation or manual release checks complete from planning evidence.
