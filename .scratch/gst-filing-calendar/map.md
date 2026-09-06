# GST filing calendars

## Objective

Add a GST calendar for one active normal-taxpayer registration, alongside the existing freelance income-tax estimate. Cover monthly and QRMP schedules, registration partway through the year, changes in cadence between quarters, and independent LUT guidance for eligible service exports. Keep all inputs and completion records in the browser.

## Plan

1. Verify normal return/payment schedules, state groups, registration-period rules, LUT eligibility and current extension sources. Record evidence in [return research](research/returns.md) and [LUT research](research/lut.md).
2. Update SPEC.md. Add independently expiring GST-calendar and LUT rule groups. Extend the registered Profile with the effective registration date, continuous normal-registration confirmation, four quarter-specific cadences and the declared export/LUT branch. Unknown independent facts withhold only the affected dates.
3. Generate period-specific GSTR-1, GSTR-3B and conditional QRMP payment-review actions; add the annual before-export LUT action when established. Preserve known quarters when another quarter or LUT facts are uncertain. No GST amounts, filing or portal verification.
4. Extend the existing GST form, review, plan and completion controls. Distinguish a payment review from a completed payment. Migrate older workspace and Recovery envelopes without deleting answers or inferring cadence.
5. Verify period boundaries, both cadence paths and state groups, stale groups, uncertainty, matching/undo after cadence changes, migration, and browser journeys at desktop/tablet/mobile widths. Record checks and remaining release limitations in [implementation](issues/01-calendar.md).

## Decisions

- Store no GSTIN or documents. The registration date is the effective date in the user's records, not an application date.
- Record cadence per financial quarter. Do not infer QRMP from freelance receipts or apply today's cadence to earlier quarters. Unknown future choices remain explicit.
- Add separate LUT Coverage. An unknown LUT date, eligibility or export route never removes established GST return obligations.
- Use stable kind/Tax Year/period identities for recurring actions. A cadence change preserves old completion records as Needs review when their periods no longer match.
- Use the shared `question-sections`, `question-section` and `field-stack` structure for registration, frequency and export/LUT sections. The user's follow-up requires the same spacing and heading sizes as the situation and client steps; do not introduce GST-specific CSS.
- Show normal statutory dates with direct sources and a short independent review expiry. The current extension inventory needs a release-time recheck; do not describe unverified extensions as operative dates.

## Status

Implemented locally and verified, including the [UX-copy fixes](issues/02-ux-copy.md). The user requested committing the completed changes. The current-extension inventory remains a public-release check. Deployment was not requested.
