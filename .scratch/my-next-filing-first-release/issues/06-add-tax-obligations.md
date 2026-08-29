# Add advance-tax and return Obligations

Status: blocked
Blocked by: 05

## Outcome

The Plan shows the next applicable tax action first, followed by a chronological agenda with verified advance-tax and annual-return Obligations and honest deadline status.

## Work

- Add advance-tax applicability at rounded estimated liability of at least ₹10,000.
- Add the normal 15 March 2027 advance-tax date and 31 August 2027 annual-return date.
- Treat an amount paid after 15 March as advance tax only through 31 March 2027.
- Model stable identity, tax period, normal and optional Operative due dates, reasons, consequence copy, Source identities, and rule verification date.
- Calculate Upcoming, Due today, and Deadline passed in India Standard Time.
- Preserve the Normal due date when an Operative due date exists.
- Render the nearest Obligation before the full month-grouped agenda. Never imply completion.
- Show no advance-tax result when liability is below ₹10,000, but retain the annual return.

## Acceptance evidence

- The example shows 15 March 2027 first and 31 August 2027 second.
- Passed-deadline copy says completion is unknown and gives no invented fee or interest amount.
- The Plan shows Source and How to do this separately, and omits an unapproved tutorial.

## Authority

- [Implementation specification](../spec.md)
- [`SPEC.md` advance-tax, return, Obligation, and agenda decisions](../../../SPEC.md)
- [Income-tax Act research](../../my-next-filing-implementation/research/statutory-rules-and-sources.md)
