# My Next Filing first-release implementation

Label: wayfinder:map

## Destination

Produce a decision-complete, ordered implementation plan for the approved first release in `SPEC.md`. An implementer must be able to build and verify the release without inventing product behavior or silently changing the specification.

## Notes

- `SPEC.md` is the product authority. Its controlled terms apply throughout this map.
- The supported profile, tax-calculation boundary, three evaluation result kinds, best-effort claim, no-backend rule, absence of reminders and completion tracking, rule provenance and expiry rules, privacy restrictions, and out-of-scope list are locked.
- This map plans the work. It does not deliver production code. Research notes and rough prototypes are decision assets.
- Use `wayfinder`, `grilling`, and `domain-modeling` for decision sessions. Use `research` for research tickets and `prototype` with `emil-design-eng` for the interface ticket.
- Prefer the smallest dependency set and the fewest modules that preserve the public Evaluation and Rule-validation boundaries.

## Decisions so far

- [Verify the statutory rule set and source candidates](issues/01-verify-statutory-rules-and-sources.md): Income-tax values are verified, but the GST turnover model and several source and copy details need reconciliation; no due-date extension was found.
- [Verify the static delivery and competition constraints](issues/02-verify-delivery-and-competition-constraints.md): The static-only Cloudflare path works with explicit preview, domain-redirect, and Analytics controls; the competition submission also needs a time-boxed artifact checklist.
- [Decide the production Analytics and privacy posture](issues/03-decide-analytics-and-privacy-posture.md): Use opt-in, production-only, sanitized GA4 page views, subject to the recorded production legal-review gates.
- [Choose the end-to-end interface design](issues/04-choose-interface-design.md): Use the Focused flow with Substack orange and neutral tokens, darker ink, a minor-third type scale, plain labels, and an official-shadcn-first implementation policy.
- [Choose the application and module organization](issues/05-choose-application-organization.md): Use a small seam-first tree with deep Evaluation and Rules modules, flat routes, route-local questionnaire state, one in-memory Profile handoff, and official shadcn components first.
- [Resolve the GST turnover and threshold model](issues/08-resolve-gst-turnover-and-threshold-model.md): Collect declared GST aggregate turnover directly, require explicit completeness, and distinguish Below, At, Above, and Unavailable GST states without discarding valid income-tax results.
- [Reconcile the specification with verified authority](issues/11-reconcile-spec-with-verified-authority.md): `SPEC.md` now contains the approved GST model, corrected advance-tax wording, current primary sources, tutorial review states, and aligned example expectations.
- [Order the vertical implementation and handoff](issues/07-order-vertical-implementation.md): The final implementation spec and twelve dependency-wired tickets order the release from route foundation through Rules, Profile, Evaluation, Plan, Analytics, delivery, and mandatory production gates.

## Not yet specified

None.

## Out of scope

- Production implementation and deployment. This map ends at an implementation-ready handoff.
- Any change to the locked authority listed in `SPEC.md` under "Wayfinder authority."
- Every item listed in `SPEC.md` under "Out of Scope."
- [Confirm the competition submission plan](issues/10-confirm-competition-submission-readiness.md): the user will handle the competition separately, so its deadline and submission artifacts do not control this product plan.
- [Complete the production privacy legal review](issues/09-complete-production-privacy-review.md): the legal opinion itself is production-release work, not a planning decision; it remains mandatory in [Pass the production release gates](../my-next-filing-first-release/issues/12-pass-production-release-gates.md).
