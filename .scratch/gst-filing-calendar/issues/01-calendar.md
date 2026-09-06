# Registered-freelancer GST calendar

Status: Implemented locally. Current extension inventory remains a public-release verification item.

## Implemented behavior

One active normal registration now supports monthly GSTR-1/GSTR-3B or QRMP quarterly returns and conditional monthly payment reviews. The effective registration date controls the first relevant period. Each quarter has its own confirmed cadence, including explicit uncertainty. Unknown quarters do not remove established dates in other quarters.

The GST form also records the export route. Confirmed eligible service exporters receive a before-first-export LUT action; unknown dates, eligibility, SEZ/bond/mixed routes and stale LUT Rules are independent of return dates. No GST liability, ledger, refund, invoice or filing calculation was added.

Period-specific completion identities preserve earlier declarations after cadence changes, with unmatched or premature records shown as Needs review. QRMP actions use Mark reviewed and Marked reviewed by you. Return/review completion cannot precede the end of the relevant period, and LUT completion cannot precede registration. These recording constraints do not assert that early tax deposits are prohibited.

Workspace version 4 migrates version 3 by adding an unanswered registered calendar, after the existing salary migration from version 2. Recovery version 3 adds unanswered calendar fields after the older salary migration. Migrations retain consent, revisions, other answers and completion dates; they do not infer cadence or write during reads.

## Interface consistency

The user's follow-up requested the same section layout, gaps, margins and font sizes as other steps. Registration, filing frequency and service exports/LUT use the existing `question-sections > question-section > field-stack` structure. Frequency guidance sits directly below the section heading, before the quarter fields, as requested. A subsequent adjustment reduces only its heading-to-description gap to 16px; the 32px gap before the fields remains. No GST-specific stylesheet or typography rule was added.

Computed styles matched the situation step at desktop width: identical responsive section gaps and heading sizes, 32px inside each section, 40px between fields and zero field/heading margins. At 1024px and mobile widths the same shared rules apply. The shared grids now use `minmax(0, 1fr)` to prevent long select labels widening the 320px viewport. The expanded LUT form measured client width 320px and scroll width 320px after the correction.

## Statutory review

Primary evidence is in [returns](../research/returns.md) and [LUT](../research/lut.md). Normal schedules use Notifications 82/2020, 83/2020 and 84/2020 and Circular 143/13/2020. LUT eligibility uses Notification 37/2017, annual validity uses the surviving paragraph of Circular 8/8/2017, and before-export/late-furnishing guidance uses Circular 125/44/2019 paragraph 44.

Resolved during review:

- S2: added a registration-date floor to LUT completion, preventing a completion before a corrected registration date from closing the current action.
- S2: replaced the superseded before-export paragraph as the sole date source with Circular 125/44/2019. Circular 8 remains only for annual validity.
- S3: made the QRMP turnover timing explicit: preceding-year limit and loss of eligibility from the quarter following a current-year breach.
- The expiry validator now permits a review deadline before the tax period ends. Calendar and LUT groups independently expire on 30 September 2026. Tests confirm dates are available on the review deadline and withheld afterwards while income tax remains supported.

No remaining findings in the implemented normal-schedule logic. One release verification item remains:

- S1, current extensions: the official notification indexes available during research were incomplete or inaccessible. Targeted searches found no applicable April 2026-onward extension, but do not establish exhaustive absence. The interface explicitly shows normal dates; no unverified operative date was added. Complete the national/state extension check before public release and refresh the independent expiry. See [source access evidence](../research/returns.md#extensions-and-review-window).

## Verification

`pnpm verify:release` passed: formatting, lint, TypeScript, Rule validation, all deterministic suites, production build and built-asset/header checks. The production build retains its bundle-size advisory. Lint, typecheck and build were rerun after the final shared-grid adjustment.

The new `scripts/verify-gst-calendar.ts` covers monthly/QRMP calendars, every state/UT date group, partial registration, financial-year boundaries, nil-business periods, independent unknown quarters and LUT facts, missing/invalid/stale Rules, cadence changes, premature completion, malformed period identities, and storage migrations.

Browser checks used synthetic data in an isolated context. Verified keyboard selection and focus return, removing an uncertainty warning after confirmation, review values, generated calendars, save/reload, return completion, QRMP review with the correct status, blocking future-period completion, and restoration of changed export answers. Inspected 1440px, 1024px, 390px and 320px layouts. Shared reduced-motion guards remain unchanged; no new animation was introduced. A dedicated screen-reader session and OS reduced-motion emulation were not run.

The user requested a commit after the UX-copy fixes. Deployment was not requested. The command named verify:release does not replace the specification's human, privacy, accessibility and statutory public-release gates.
