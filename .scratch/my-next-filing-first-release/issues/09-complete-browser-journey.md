# Complete the synthetic example and Browser journey

Status: blocked
Blocked by: 03, 04, 05, 06, 07, 08

## Outcome

The fictional example and personal check form one complete, polished citizen journey from landing page to supported Plan or declared stop state.

## Work

- Wire Try an example to the exact synthetic Profile in `SPEC.md` and evaluate it through the same interface as a personal check.
- Finish the Focused-flow layouts for landing, questionnaire, review, Plan, stop states, saved-data notices, and reference links.
- Apply the final Substack tokens, darker ink, minor-third scale, plain labels, focus behavior, pointer press feedback, touch-safe hover, and reduced-motion rules.
- Complete the six focused Playwright cases in `e2e/journey.spec.ts`.
- Use keyboard interaction for the unsupported and editable Profile case.
- Keep all demonstrated controls working; remove any unfinished control rather than leaving a dead affordance.

## Test seam

Browser journey.

## Acceptance evidence

- The example produces ₹14,00,000 professional income, ₹10,000 bank interest, ₹55,160 estimated remaining tax, 15 March 2027 as the next Obligation, 31 August 2027 in the agenda, and ₹90,000 remaining GST threshold room.
- The unsupported, stale, corrupt-data, unavailable-storage, and saved-Profile cases pass in Chromium with zero retries.
- Labels, related errors, visible focus, heading order, landmarks, text-plus-shape status, and keyboard operation are present.
- The Application works at 320 CSS pixels with no horizontal scrolling.
- Reduced motion removes movement; keyboard actions have no animation delay; tax amounts do not animate.
- No application-data request occurs after static assets load.

## Authority

- [Implementation specification](../spec.md)
- [`SPEC.md` example, Browser behavior, accessibility, and motion decisions](../../../SPEC.md)
- [Interface decision and prototype](../../my-next-filing-implementation/issues/04-choose-interface-design.md)
