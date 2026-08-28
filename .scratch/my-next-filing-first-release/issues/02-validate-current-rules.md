# Validate and publish the current Rule dataset

Status: blocked
Blocked by: 01

## Outcome

The repository contains a typed, versioned, sourced Rule dataset and Source registry that pass the public Rule-validation interface. Invalid or expired production Rules fail closed before build output can ship.

## Work

- Create `src/rules/index.ts` as the only public Rules interface.
- Define Rule-owned types, `currentRules`, the read-only Source registry, and `validateRuleDataset(unknown)`.
- Author Tax Year 2026-27 Rules and Sources as TypeScript objects with `satisfies`.
- Include dataset identity, schema version, period, effective dates, verification date, expiry, rates, thresholds, eligibility, dates, Source identities, and change notes.
- Encode the reviewed statutory Sources and tutorial approval states from `SPEC.md`.
- Add `pnpm rules:validate`; make the production build call it.
- Do not fetch or validate Sources over the network at build or runtime.

## Test seam

Rule validation.

## Acceptance evidence

- Start with a failing test for the smallest valid Rule dataset behavior.
- `src/rules/validate.test.ts` proves the current dataset and every explicit validation error in `SPEC.md`.
- Error results identify the failed invariant without throwing an opaque exception.
- The production dataset has no approved return tutorial while the reviewed candidates remain deferred or rejected.
- The expiry date is no later than 31 August 2027.
- `pnpm rules:validate`, `pnpm test`, `pnpm typecheck`, and `pnpm build` pass.
- Run the repository compliance review and record direct official Sources and review dates.

## Authority

- [Implementation specification](../spec.md)
- [`SPEC.md` Rule dataset, Source registry, and change-control decisions](../../../SPEC.md)
- [Statutory research](../../my-next-filing-implementation/research/statutory-rules-and-sources.md)
