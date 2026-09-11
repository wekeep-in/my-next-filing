# Stage pitch

The 14-slide deck lives at `/pitch`, separate from the filing journey. All slide backgrounds are dark with white text, except slide seven, which is green with white text. It does not read or change questionnaire drafts or saved workspaces. Product footage uses fictional details. The private [speaker script](../.scratch/stage-pitch/content.md) is not published with the site and does not control playback timing.

## Present

Use the slide previews or arrow keys to navigate. Each slide plays once and holds its final frame until you advance. Use Space to pause for commentary. Fullscreen hides the controls until you move the pointer to them or focus them with Tab.

| Key | Action |
| --- | --- |
| Right / Page Down | Next slide |
| Left / Page Up | Previous slide |
| Space | Pause or play |
| R | Replay this slide |
| F | Enter or exit fullscreen |
| Escape | Exit fullscreen |
| Home / End | First or last slide |

`/pitch#7` opens slide seven. Desktop uses a preview rail beside the stage; below 900px the previews form a horizontal strip. The complete 16:9 slide fits its available space. Any surrounding letterboxing matches that slide's background, including dark text slides in fullscreen. Reduced motion opens still previews; Play explicitly starts a demo or the terminal animation. Failed recordings fall back to their final screenshots.

## Current slides

| Slide | Content | Treatment |
| --- | --- | --- |
| 1 | When is my next tax filing? | White type on dark ink |
| 2 | Then the replies stopped. | Origin story statement |
| 3 | Tax terminology | White cloud on dark ink |
| 4 | Public tax portals | 25-image mosaic |
| 5 | From notes to a tool. | Origin story statement |
| 6 | When is my next tax filing? | Return to the opening question |
| 7 | My Next Filing | Question collapses into the product name on green |
| 8 | The person behind the income | Fit, income, clients, taxes and GST in order |
| 9 | From answers to a plan | Review, calculation, reasons, sources and agenda |
| 10 | Come back and see what remains | Save notice, return, payment update and completion |
| 11 | And none of those answers were sent to us. | Privacy reveal after the complete demo |
| 12 | Privacy details | Browser calculations; no third-party APIs, web analytics or financial data uploads |
| 13 | Built with Codex | White heading and illustrative terminal |
| 14 | Built for freelancers. / By a freelancer. | Final statement; hold here |

The three recordings run for 173.0 seconds (profile), 40.1 seconds (plan), 56.7 seconds (workspace). They total about 4 minutes 30 seconds before presenter pauses.

The privacy claim concerns application answers and financial values. Ordinary hosting request metadata still exists; the script does not promise that the hosting provider collects nothing or that browser storage guarantees protection. There is no separate closing URL or feedback request.

The demos fit the local [Magic UI Safari](https://magicui.design/docs/components/safari) frame without cropping. Each uses one MP4 and its matching cursor timeline. The frame-driven [Magic UI Terminal](https://magicui.design/docs/components/terminal) adaptation types a Codex prompt, reveals green checkmarks, then asks for review. Its lower edge extends beyond the slide and is clipped. It is an illustrative sequence, not a recorded session. Both adaptations retain the [Magic UI MIT notice](../public/pitch/magicui-LICENSE.txt).

## Local playback

Install dependencies and build before travelling:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm pitch:present
```

The preview command serves `dist` at `http://127.0.0.1:4174/pitch`. Keep it running. Fonts, scripts and media are local. Test on the presentation laptop with Wi-Fi disabled; browser offline simulation can also block localhost. The deck must be served over HTTP.

## Edit and record

- `src/routes/pitch/slides.ts`: slide order, titles and statement durations.
- `src/routes/pitch/scene.tsx`, `terminal.tsx`, `safari.tsx` and `pitch.css`: presentation visuals.
- `src/routes/pitch/index.tsx`: playback, navigation and fullscreen controls.
- `video/record-pitch.ts`: synthetic browser capture.
- `video/pitch-media.ts`: chapter assembly and matching cursor offsets.
- `src/routes/pitch/recordings.json`: generated metadata for the three demos.

Start the app with `pnpm dev`, then record:

```bash
pnpm pitch:record
```

Use `--url http://127.0.0.1:5174` if the dev server is on a different port. Chromium and FFmpeg prerequisites are described in the [video guide](../video/README.md).

The recorder uses explicitly prefilled fictional answers, validates the synthetic profile and fixes the example date to 10 September 2026. It follows all six journey steps through their visible controls, opens each questionnaire section, and captures the plan, saving, payment updates and user-declared completion. It does not visit government portals or edit calculation results independently of their inputs.

The editor preserves every recorded frame, including reading holds, visible navigation and smooth scrolling. Overlapping scroll positions keep long question groups readable. FFmpeg joins the four questionnaire sections into one chapter and keeps the plan and workspace chapters continuous, applying the same offsets to cursor events. It verifies the final frame counts. Pause with Space whenever the audience needs more reading time.

Only final chapter videos and posters, the 25 portal images and the required license ship under `public/pitch`. Recording fragments are removed after successful assembly. The unused QR code, form screenshot and old underline audio option have been removed. Original footage from the earlier compact edit is retained in ignored local artifacts under `artifacts/pitch-tighten/source/`. The obsolete idle-compaction test was retired when that edit was removed; capture timing, clicks, navigation and playback remain covered.

## Verify

```bash
pnpm lint
pnpm typecheck
pnpm video:test
pnpm build
pnpm verify:build
pnpm exec playwright test tests/e2e/pitch.spec.ts
```

Checks cover recorder timing, continuous chapter playback, final-frame holds, replay, storage preservation, local assets under the production CSP, keyboard controls, fullscreen, reduced motion and responsive layout. Inspect a fresh recording after changing the questionnaire or rules.

## Narrative references and portal images

The [mymind deck](https://pitch.com/presentations/How-to-create-a-mind-a-pitch-deck-for-mymindcom-0xorJ97GmxqH5XeDps3qBPh2) informed the question-led pacing and full-slide color. The [Notably deck](https://pitch.com/presentations/Notably-Pitch-Deck-55KAdW2W3r925uRwtC0PTdfn) informed the move from a person's problem to the product. Both were inspected on 10 September 2026. Their artwork and copy are not included.

Slide 4 is a centered mosaic of 25 public, signed-out screenshots captured on 10 September 2026. Each page was captured at the viewport below to match its tile's proportions. The layout uses a solid dark background, square edges, narrow gaps and an irregular outline. Images are local presentation context, not live integrations or statutory guidance. No credentials or personal values were entered. TRACES and Income Tax's dynamic sign-in/payment pages did not load reliably during capture and are omitted.

| Image | Public page | Capture viewport |
| --- | --- | --- |
| 01.jpg | [Income Tax Department homepage](https://www.incometax.gov.in/iec/foportal/) | 549 × 675 |
| 02.jpg | [GST portal login](https://services.gst.gov.in/services/login) | 540 × 630 |
| 03.jpg | [Protean PAN services](https://tinpan.proteantech.in/) | 873 × 495 |
| 04.jpg | [Income Tax Department homepage](https://www.incometax.gov.in/iec/foportal/) | 972 × 729 |
| 05.jpg | [CBIC GST portal](https://cbic-gst.gov.in/) | 432 × 360 |
| 06.jpg | [GST help and taxpayer facilities](https://www.gst.gov.in/help/helpmodules/) | 549 × 468 |
| 07.jpg | [Income Tax Department homepage](https://www.incometax.gov.in/iec/foportal/) | 1035 × 738 |
| 08.jpg | [GST taxpayer search](https://services.gst.gov.in/services/searchtp) | 387 × 378 |
| 09.jpg | [GST registration](https://reg.gst.gov.in/registration/) | 648 × 621 |
| 10.jpg | [GST e-Invoice portal](https://einvoice.gst.gov.in/) | 432 × 378 |
| 11.jpg | [CBIC GST portal](https://cbic-gst.gov.in/) | 360 × 360 |
| 12.jpg | [Protean PAN services](https://tinpan.proteantech.in/) | 720 × 360 |
| 13.jpg | [GST portal homepage](https://www.gst.gov.in/) | 792 × 630 |
| 14.jpg | [Income Tax challan guide](https://www.incometax.gov.in/iec/foportal/help/generate-challan-form) | 558 × 711 |
| 15.jpg | [Income Tax return downloads](https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns) | 432 × 423 |
| 16.jpg | [GST GSTR-3B filing guide](https://tutorial.gst.gov.in/userguide/returns/Create_and_Submit_GSTR3B.htm) | 1233 × 837 |
| 17.jpg | [CBIC GST portal](https://cbic-gst.gov.in/) | 738 × 459 |
| 18.jpg | [UTIITSL PAN services](https://www.pan.utiitsl.com/) | 423 × 594 |
| 19.jpg | [GST help and taxpayer facilities](https://www.gst.gov.in/help/helpmodules/) | 369 × 360 |
| 20.jpg | [Income Tax challan guide](https://www.incometax.gov.in/iec/foportal/help/generate-challan-form) | 379 × 360 |
| 21.jpg | [Income Tax return downloads](https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns) | 738 × 450 |
| 22.jpg | [Protean PAN services](https://tinpan.proteantech.in/) | 441 × 450 |
| 23.jpg | [GST registration](https://reg.gst.gov.in/registration/) | 837 × 666 |
| 24.jpg | [GST e-Invoice portal](https://einvoice.gst.gov.in/) | 549 × 549 |
| 25.jpg | [UTIITSL PAN services](https://www.pan.utiitsl.com/) | 441 × 423 |
