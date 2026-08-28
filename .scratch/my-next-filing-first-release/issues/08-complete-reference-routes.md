# Complete Sources, Methodology, and product-limit routes

Status: blocked
Blocked by: 02, 07

## Outcome

Users can inspect how the estimate works, the reviewed Source registry, product limits, and applicable external starting links without Profile data leaving the Application.

## Work

- Complete `/methodology`, `/sources`, and `/disclaimer` with semantic markup and the shared minor-third tokens. Do not add Typeset unless repetition now proves it removes code.
- Render Statutory and Tutorial sources as distinct types with publisher, title, review date, covered rules or action, and approval status.
- Link Evaluation Source identities to registry metadata without copying Source data into result types.
- Omit primary tutorials marked provisional, deferred, rejected, or starting-link-only.
- Open external links in a new tab with safe `rel` attributes.
- Do not prefetch external tutorials or append Profile, query, hash, or result data.

## Test seams

Rule validation and Browser journey.

## Acceptance evidence

- Rule validation rejects a missing Statutory source and an unapproved Tutorial publisher.
- Every legal conclusion rendered in the example resolves to a reviewed Statutory source.
- No return form or filing tutorial appears before its period-specific review.
- Browser network inspection shows no tutorial prefetch.
- External links contain only fixed reviewed URLs and no Profile value.
- Reference routes work with keyboard navigation and readable line length.

## Authority

- [Implementation specification](../spec.md)
- [`SPEC.md` Source registry, Methodology, and Disclaimer decisions](../../../SPEC.md)
- [Tutorial review](../../my-next-filing-implementation/research/statutory-rules-and-sources.md)
