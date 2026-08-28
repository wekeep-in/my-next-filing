# Add the GST aggregate-turnover monitor

Status: blocked
Blocked by: 06

## Outcome

The Plan reports Below, At, Above, or Unavailable GST status from direct declared GST aggregate turnover without changing a valid income-tax result or broadening the supported business Profile.

## Work

- Use the direct GST aggregate turnover amount and explicit completeness answer captured in the Profile.
- Select the ₹10 lakh threshold for Manipur, Mizoram, Nagaland, and Tripura and ₹20 lakh elsewhere.
- Compare with `<`, `=`, and `>` for Below, At, and Above.
- Keep At supported with review-before-further-turnover copy.
- Keep income tax and mark GST coverage incomplete for Above and Unavailable.
- Return global Unsupported when the user declares another business, supply type, or compulsory-registration fact.
- Show the reviewed statutory Source beside the status. Do not estimate GST returns.

## Test seam

Evaluation.

## Acceptance evidence

- Failing tests precede each GST state.
- `evaluate.test.ts` covers both thresholds, Below, exact At, Above, Unavailable, and another-supply Unsupported.
- A non-zero bank-interest field is not added automatically to GST aggregate turnover.
- No arithmetic relationship with professional receipts is enforced.
- The example uses ₹19,10,000 and shows ₹90,000 below the Maharashtra threshold.
- Compliance review reports no remaining S0 or S1 finding for the implemented model.

## Authority

- [Implementation specification](../spec.md)
- [`SPEC.md` GST questionnaire and threshold-monitor decisions](../../../SPEC.md)
- [Resolved GST decision](../../my-next-filing-implementation/issues/08-resolve-gst-turnover-and-threshold-model.md)
