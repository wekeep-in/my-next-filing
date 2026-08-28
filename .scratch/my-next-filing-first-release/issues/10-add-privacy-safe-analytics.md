# Add privacy-safe Analytics consent

Status: blocked
Blocked by: 01, 08

## Outcome

The Application can collect sanitized production page views only after opt-in consent. Rejection, withdrawal, blocking, or Analytics failure never changes product behavior.

## Work

- Complete `/privacy` with browser-storage behavior, Analytics data categories, purpose, recipient, controls, retention, limits, and monitored-contact placeholders pending legal approval.
- Implement `analytics.ts` with a fixed route allowlist and manual `page_view` only.
- Use basic consent mode. Do not load the Google tag or send a ping before permission.
- Store consent choice, policy version, and decision time separately from the Profile. Use memory only when storage is blocked and ask again on a later visit.
- Add persistent Analytics choices. Withdrawal stops future events and removes first-party Analytics cookies where possible.
- Keep local and preview configuration disabled. Do not enable production Analytics until the release-gate ticket records qualified approval.
- Configure no User-ID, user properties, enhanced measurement, Google signals, advertising, product links, custom events, or data exports.

## Test seam

Browser journey.

## Acceptance evidence

- A fresh page before choice sends no Google request and sets no Analytics cookie.
- Reject and reload send nothing when storage works.
- Allow sends only one sanitized page view with fixed route name, title, and canonical allowlisted path.
- Query strings, hashes, unmatched paths, Profile facts, money, results, validation errors, and unsupported reasons never appear in Analytics data.
- Withdrawal stops later events without changing or deleting the saved Profile.
- Blocking Google hosts leaves every route, Evaluation result, and deletion behavior unchanged.

## Authority

- [Implementation specification](../spec.md)
- [`SPEC.md` Analytics and privacy decisions](../../../SPEC.md)
- [Analytics and privacy research](../../my-next-filing-implementation/research/analytics-and-privacy-posture.md)
- [Privacy legal review packet](../../my-next-filing-implementation/privacy-legal-review-packet.md)
