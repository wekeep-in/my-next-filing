# Calculate the supported income-tax estimate

Status: blocked
Blocked by: 04

## Outcome

A supported Profile produces the verified professional income, total income, slab tax, rebate or marginal relief, cess, credits, remaining amount or refund, and a readable calculation breakdown.

## Work

- Extend Evaluation from the Unsupported and Stale-rules branches to the Supported result.
- Calculate presumptive professional income as the higher of 50 percent of Gross professional receipts or Higher expected profit.
- Add taxable bank or deposit interest without reducing receipts by TDS.
- Apply total-income rounding, Tax Year 2026-27 new-regime slabs, section 156 rebate or marginal relief, 4-percent cess, actual TDS and TCS, Advance tax already paid, and final nearest-₹10 rounding.
- Stop above ₹50 lakh instead of calculating surcharge.
- Render the estimate summary before an accessible calculation disclosure. Keep routes and views free of tax arithmetic.

## Acceptance evidence

- Expected values are independent literals with Source context and never recompute the implementation formula.
- The fictional Profile yields professional income of ₹14,00,000 and keeps ₹10,000 bank interest separate.
- The Plan labels every amount Estimated and never shows negative tax.

## Authority

- [Implementation specification](../spec.md)
- [`SPEC.md` supported income, slabs, rebate, cess, credits, and rounding decisions](../../../SPEC.md)
- [Statutory research](../../my-next-filing-implementation/research/statutory-rules-and-sources.md)
