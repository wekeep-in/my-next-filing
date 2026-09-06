# Implement accurate local search and filters

Status: planned. Depends on [catalogue preparation](01-prepare-catalogue.md).

## Result

People can use ordinary task wording or precise official identifiers to find relevant entries. Results honor every active constraint and never substitute a different form, section, or period to avoid an empty list.

## Work

1. Implement the [search contract](../implementation-plan.md#search-contract) as pure functions over the resolved catalogue. Use native strings/arrays, not a new dependency or service.
2. Normalize ordinary typography and reviewed aliases; preserve the original query in memory. Match all meaningful query tokens within each resource.
3. Canonicalize reviewed identifier spellings such as GSTR-3B without fuzzy numeric matching. Protect section numbers, form names, notification references, period labels, and years. Explicit Tax Year phrases constrain statutory taxPeriod separately from document-reference years; Assessment Year queries are not converted. Include both positive and negative period cases.
4. Implement the documented ranking tiers and stable tie-breaks. Dedicated identifier matches must precede broad documents.
5. Implement single Topic and Task selections with AND behavior, unique-resource counts, and option counts calculated against the other active constraints.
6. Keep zero-count selections visible when a query changes. Return enough state for the page to disable other zero-count choices and offer precise recovery.
7. Add the single, explicit typo-suggestion behavior only for an unambiguous one-edit ordinary word correction that yields filtered results. Do not silently change the query.
8. Extend the existing resources assertion script with the plan's [relevance cases](../implementation-plan.md#relevance-acceptance-cases). Cover partial typing, punctuation, case, aliases, wrong identifiers/years, all-word matching, blocked tutorial vocabulary, filter intersections, and count correctness.

## Acceptance

- Ordinary and abbreviated ITR/LUT queries find equivalent relevant resource sets.
- GSTR3B spelling variants match GSTR-3B; GSTR-9 and section 59 are not rewritten into supported identifiers.
- `section 58` ranks its dedicated source before broad Act material.
- Unsupported foreign-income or company queries do not return broad false positives through scope-disclaimer text.
- Queries and filters are not inputs to Evaluation or outbound URLs.
- No remote indexing, full-document search claim, generic fuzzy-search abstraction, or new dependency is introduced.
- The focused relevance assertions pass using a fixed date and explicit expected resource identities.

Verification: `pnpm exec tsx scripts/verify-resources.ts`, `pnpm lint`, and `pnpm typecheck`.
