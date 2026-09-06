# Prepare the reviewed resources catalogue

Status: implemented locally. See [source review](../research/source-review.md) for evidence and access limitations, and [verification](../verification.md) for executed checks.

## Result

Every existing Source has a documented publication decision. The public collection uses reviewed descriptions and classifications, retains legal provenance, and distinguishes official portals from approved tutorials.

## Work

1. Adopt the plan's behavior in root `SPEC.md` before changing application behavior. Add the public route, independent browsing contract, publication rules, in-memory search state, passive fresh entry, and review-warning behavior. Keep `CONTEXT.md` a glossary.
2. Recount the current registry and update the [inventory](../research/source-inventory.md) if it has changed since `f29fc73`.
3. Create the catalogue and typed Topic/Task choices in `src/resources/index.ts`, keyed by existing source identities. Reuse source URLs, publisher, official titles, review dates, and statutory periods.
4. Review each reader title, description, alias, primary identifier, and section reference against its official source with the compliance-review skill. Record actual evidence and access limitations in `../research/source-review.md`. Avoid numeric legal summaries.
5. Group the amended Act's three identities without deleting them from the Rule registry. Preserve its salary and rebate references and the oldest combined review date.
6. Publish the two `starting-link-only` records as official portals. Explicitly exclude `advance-tax-challan` and `return-identification`; do not promote their review statuses as part of this issue.
7. Validate complete registry coverage, unique ownership, nonempty metadata, known taxonomy, same-URL grouping, consistent source kind/publisher/statutory period, safe fixed links, publication status, and real non-future source-review dates. Check publication chronology where present. Fail validation for a newly unclassified source. Runtime withholding affects only invalid resources.
8. Derive resource review warnings using the existing Rule validator and independent group statuses. Keep safe bibliography available when reviewed coverage is stale; do not claim documents themselves expire.
9. Start `scripts/verify-resources.ts` with Node assertions for catalogue integrity, status exclusions, grouping, review dates, and independent/dataset-wide stale states. Include one malformed/future review date alongside a healthy entry, mixed-period same-URL grouping, and synthetic annual-return-only expiry affecting the grouped Act through covered Rule identities. Add it to `pnpm test`.

## Acceptance

- Initial catalogue has 22 public resources if the registry and review findings still support the inventory. A changed count has a documented reason.
- Every Source is assigned once to a catalogue definition or explicit exclusion; all public URLs come from the registry.
- An approved tutorial is never inferred from its official publisher. Excluded records cannot enter search vocabulary or suggestions.
- The grouped Act does not inherit its newest constituent review date as a full-document review.
- GST-calendar/LUT review warnings appear on 1 October 2026 independently; root expiry produces broader warnings while valid references remain available.
- No tax Rule, Source identity/status, Evaluation calculation, or persistence schema changes are required.
- Source review evidence and focused assertions pass. Record limitations rather than manufacturing a successful content review.

Verification: `pnpm exec tsx scripts/verify-resources.ts`, `pnpm rules:validate`, and the content/source review. The integrated release checks follow in issue 5.
