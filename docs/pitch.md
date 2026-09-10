# Stage pitch

The 13-slide deck lives at `/pitch`, separate from the filing journey. It does not read or change questionnaire drafts or saved workspaces. Product footage uses fictional details. The private [speaker script](../.scratch/stage-pitch/content.md) is not published with the site and does not control playback timing.

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
| 2 | Compliance is complicated. | Centered dark type on muted ground |
| 3 | Tax terminology | Compact cloud with varied size, weight and letter spacing |
| 4 | Public tax portals | 25-image mosaic on dark ink |
| 5 | But, what if tax planning was quick and easy? | White type on dark ink |
| 6 | My Next Filing | Product name only, centered in green |
| 7 | The person behind the income | Continuous 12.4-second demo |
| 8 | From answers to a plan | Continuous 11.8-second demo |
| 9 | Come back and see what remains | Continuous 17.8-second demo |
| 10 | No compromises on privacy. | Four centered serif lines with emojis |
| 11 | Built for freelancers / by a freelancer. | Explicit two-line statement on dark ink |
| 12 | Built with Codex | Dark heading on muted ground, dark animated terminal below |
| 13 | mynextfiling.wekeep.in | URL only on dark ink |

Slide 10 says "No account registration.", "No portal connection", "No web analytics", and "No compromises on privacy."

The demos fit the local [Magic UI Safari](https://magicui.design/docs/components/safari) frame without cropping. Each uses one MP4 and its matching cursor timeline. The frame-driven [Magic UI Terminal](https://magicui.design/docs/components/terminal) adaptation types a Codex prompt, reveals green checkmarks, then asks for review. Its lower edge extends beyond the slide and is clipped. It is an illustrative sequence, not a recorded session. Both adaptations retain the [Magic UI MIT notice](../public/pitch/magicui-LICENSE.txt).

## Local playback

Install dependencies and build before travelling:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm pitch:present
```

The preview command serves `dist` at `http://127.0.0.1:4174/pitch`. Keep it running. Fonts, scripts and media are local. Test on the presentation laptop with Wi-Fi disabled; browser offline simulation can also block localhost. The deck must be served over HTTP. The public URL on the final slide requires internet access.

## Edit and record

- `src/routes/pitch/slides.ts`: slide order, titles and statement durations.
- `src/routes/pitch/scene.tsx`, `terminal.tsx`, `safari.tsx` and `pitch.css`: presentation visuals.
- `src/routes/pitch/index.tsx`: playback, navigation and fullscreen controls.
- `video/record-pitch.ts`: synthetic browser capture.
- `video/pitch-media.ts`: idle cuts, cursor retiming and chapter assembly.
- `src/routes/pitch/recordings.json`: generated metadata for the three demos.

Start the app with `pnpm dev`, then record:

```bash
pnpm pitch:record
```

Use `--url http://127.0.0.1:5174` if the dev server is on a different port. Chromium and FFmpeg prerequisites are described in the [video guide](../video/README.md).

The recorder validates a synthetic profile and fixes the example date to 10 September 2026. It captures clients, supported income, the plan, saving, payment updates and user-declared completion. It does not visit government portals or edit calculation results independently of their inputs.

The editor removes intervals where both the footage and cursor are idle, retaining 0.4 seconds across each interval's two ends. It preserves cursor movement, every click and click ripples. One retained-frame map edits the video and cursor together. FFmpeg assembles three continuous MP4s, verifies their frame counts and publishes their metadata. The player uses these exact durations without script padding.

Only final chapter videos and posters, the 25 portal images and the required license ship under `public/pitch`. Recording fragments are removed after successful assembly. The unused QR code, form screenshot and old underline audio option have been removed. Original footage from the pause edit is retained in ignored local artifacts under `artifacts/pitch-tighten/source/`.

## Verify

```bash
pnpm lint
pnpm typecheck
pnpm video:test
pnpm build
pnpm verify:build
pnpm exec playwright test tests/e2e/pitch.spec.ts
```

Checks cover cursor retiming, early visible motion, continuous playback, final-frame holds, replay, storage preservation, local assets under the production CSP, keyboard controls, fullscreen, reduced motion and responsive layout. Inspect a fresh recording after changing the questionnaire or rules.

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
