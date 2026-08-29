# Return Unsupported and Stale-rules results

Status: blocked
Blocked by: 02, 03

## Outcome

Evaluation exists as one deep pure module. Unsupported Profiles and stale Rules stop safely, explain why, preserve editable answers, and expose only applicable official starting links.

## Work

- Create `src/evaluation/index.ts` as the only public Evaluation interface.
- Accept a validated Profile, current `Date`, and validated Rule dataset.
- Own Evaluation result types and return exactly Supported, Unsupported, or Stale-rules.
- Implement every declared unsupported Profile condition before supported tax calculation.
- Return Stale-rules after Rule expiry and keep calculation controls disabled.
- Add the `/plan` client loader. Redirect to `/check` when no Profile exists; otherwise validate Rules and call Evaluation synchronously.
- Render friendly Unsupported and Stale-rules states with editable answers and official links.

## Acceptance evidence

- No view or route contains eligibility or stale-date logic.
- The module has no adapter or remote dependency.

## Authority

- [Implementation specification](../spec.md)
- [`SPEC.md` Profile eligibility and Evaluation decisions](../../../SPEC.md)
