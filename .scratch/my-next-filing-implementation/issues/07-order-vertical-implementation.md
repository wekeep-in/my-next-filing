# Order the vertical implementation and handoff

Type: grilling
Status: resolved
Blocked by: none

## Question

What ordered set of vertical slices should implement the approved release with the fewest dependencies and the least rework? For each slice, identify its user-visible behavior, prerequisite decisions, statutory or source data, and completion evidence. End with repository publication, preview review, statutory re-verification, and production-release checks.

## Answer

Created the [first-release implementation specification](../../my-next-filing-first-release/spec.md) and twelve implementation tickets under [My Next Filing first release](../../my-next-filing-first-release/issues/).

The order is:

1. Build the Application shell and route frame.
2. Build Rules and Profile capture in parallel after the foundation.
3. Introduce Evaluation through Unsupported and Stale-rules results.
4. Add the supported income-tax estimate.
5. Add tax Obligations and date status.
6. Add the GST aggregate-turnover monitor.
7. Complete reference routes and Source presentation.
8. Complete the synthetic example and final Browser journey.
9. Add privacy-safe Analytics after reference-page content exists; this can run alongside final Browser-journey work.
10. Configure merge checks and static delivery after the journey and Analytics are complete.
11. Pass the human production gates, including the deferred privacy review, statutory re-verification, Analytics configuration, deployment, browser, accessibility, and performance evidence.

Every behavior ticket names its dependencies, Source inputs, and completion evidence. Competition submission work is excluded. Production remains impossible until the final release-gate ticket is resolved.
