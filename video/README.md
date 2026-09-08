# My Next Filing video

An editable Remotion project for the demo shown on the website. [Direction](#direction) pairs the complete narration with the finished screen sequence.

The composition is 2560 × 1440 at 30 fps. The export is 1920 × 1080 and 3890 frames long, about 2:10. The supplied narration plays in full at its original speed, with two-second pauses after "my work", after "taxes already paid", and after "peace of mind". The last of these keeps its 200 ms narration fade. Later scene cuts and captions follow those pauses; the Crate in the Sea music edit preserves the original tempo and ends with the video. Narration, prepared sound effects, fonts, browser recordings, and the historical homepage screenshot are included, so previewing and rendering need no original recording session.

## Start here

Use Node.js 22.18 or later, pnpm, and FFmpeg with `ffprobe` on your PATH. The application and video share the root package, lockfile, and TypeScript configuration. Run the commands below from the repository root.

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm typecheck
pnpm video:studio
```

Open <http://localhost:3001/Submission>. The Studio timeline lets you scrub through the paper scenes, browser footage, narration, and sound cues.

```bash
pnpm video:render
```

The finished MP4 is written to `out/my-next-filing-demo-v3-sfx-1080p.mp4`. Generated exports and recording intermediates stay in the ignored `out/` directory.

## Read the source

| File | What it controls |
| --- | --- |
| [src/timeline.ts](src/timeline.ts) | Narration duration, frame rate, scene cuts, and transition lengths. |
| [src/Root.tsx](src/Root.tsx) | Picture and soundtrack compositions, rendered at twice the layout resolution. |
| [src/Submission.tsx](src/Submission.tsx) | Paper texture, handwritten search, prototype screenshot, title pages, and scene assembly. |
| [src/NativeScreens.tsx](src/NativeScreens.tsx) | Continuous browser chapters, cursor overlay, crop, and annotation placement. |
| [src/SoundEffects.tsx](src/SoundEffects.tsx) | Mix levels, handwriting sounds, click cues, page turns, and the Crate in the Sea music edit. |
| [src/components/remocn/](src/components/remocn/) | Source-owned handwriting, brush, cursor, and transition components. |
| [src/recordings.json](src/recordings.json) | Recorded chapter boundaries, cursor coordinates, clicks, and text bounds for callouts. |
| [subtitles.en.vtt](subtitles.en.vtt) | Complete narration transcript with caption timings. |

Browser footage stays in one video element per continuous chapter, preserving recorded scrolling and transitions. Footage, cursor, and annotations share a 3% crop that hides the scrollbar. Paper grain and ink effects apply only to the paper scenes. Their motion advances every three frames. The feature summary uses the local copy of [@remocn/check-list](https://remocn.dev/docs/ui-blocks/check-list), with five single-line labels of 25–30 characters and separate scribble sounds for each tick and scratch-off.

Fonts load from `public/fonts/`; their licenses are included there. The animation components were adapted from [remocn](https://remocn.dev/), including a page-turn stacking fix. All questionnaire inputs in the recordings are fictional.

## Record new browser footage

The recorder uses the installed Playwright Chromium and software FFmpeg. It runs headlessly on Linux, WSL, and servers,; the same pipeline is intended for macOS and Windows, which have not been exercised in this workspace. It needs no desktop session, PowerShell, remote debugging port, or NVIDIA GPU. On Linux/WSL, install browser system libraries with `pnpm exec playwright install --with-deps chromium`. Install FFmpeg and ffprobe in the same environment as Node; under WSL, use their Linux packages.

Run `pnpm dev` from the repository root, then in another terminal:

```bash
pnpm video:record --preview
```

Paths such as `out/` and `public/` in the rest of this document are relative to `video/`.

The e-Pay Tax site blocks automated browsers. The supplied `public/screens/tax-portal.png` is used for its portal cut. Override it with `--portal-image /path/to/e-pay-tax.png`. The source image stays intact; video framing removes the small aspect-ratio difference. `--draft` keeps the app plan on screen in those slots while the capture is pending; website packaging refuses that draft.

This runs the real application journey and writes four 30 fps chapters plus `recordings.json` into a fresh `out/recording-*/` directory. Inspect that recording before using it in the composition. Omit `--preview` to install a completed take into a unique folder under `public/browser/` and update `src/recordings.json`. Unique media URLs prevent stale Studio video caches. Installation retains the previous take in the recording directory and rolls back if replacement fails.

Use `--url http://localhost:5174` for another Vite development server, or `--headed` to watch the browser where a desktop is available. The setup imports the app's fictional example from Vite, so `--url` must point to a development build.

[record-browser.ts](record-browser.ts) describes the scene actions. [browser-recorder.ts](browser-recorder.ts) captures timestamped frames and pointer events, maps both to the edit timeline, and encodes the footage. [The tool comparison](recorder-research.md) explains why this uses Chromium's timestamped screencast API instead of Playwright's test-video output.

The viewport is 1440 × 900 CSS pixels at device scale 2. Chromium captures 2880 × 1800 frames; FFmpeg scales and crops them to 2560 × 1440 with explicit BT.709 color conversion. Each shot captures only its own document; setup and full navigations stay outside the footage. The same transform maps pointer coordinates and text bounds onto the composition's 1280 × 720 layout. A Date-only override fixes the calendar to 8 September 2026 while leaving frame and event clocks untouched. Motion stays enabled.

Shots wait for their actions to finish. If a slow host overruns a narration slot, encoding fits the entire shot into that slot and applies the same time mapping to the pointer events. Each outgoing chapter retains 24 tail frames for its page turn. Each image carries a binary frame marker in the top strip removed by the final crop. The marker identifies its browser monotonic timestamp, so adjustable system time and delayed JPEG delivery cannot reorder the footage. Missing frames hold the picture and matching cursor state together.

Movement uses a TypeScript port of [HumanCursor](https://github.com/riflosnake/HumanCursor): two randomized Bézier control points, Gaussian y distortion, and ease-out resampling. Seeded randomness makes each scripted path repeatable. [human-cursor.ts](human-cursor.ts) preserves exact endpoints; Playwright dispatches the sampled positions and the recorder captures their actual timestamps. At an exit, the cursor follows a longer curve of about 140 CSS pixels in a seeded direction over 550 ms, then fades over six frames. It reappears immediately on the next movement. The upstream MIT notice is in [HumanCursor-LICENSE.txt](HumanCursor-LICENSE.txt).

Pointer releases identify physical clicks, so a label forwarding a second DOM click does not duplicate the ripple or sound. Pointer listeners run before app handlers and use each event's browser timestamp and actual viewport position. Events survive full page navigation. Each event maps to the first output frame showing a capture after that event. Rapid clicks retain separate coordinates even when they land in one output frame, and the cursor holds during pauses. The click ripple keeps the click's coordinates even if the pointer moves again in the same output frame. Click audio starts on that event's first output frame. Keyboard activation creates no mouse-click effect.

Raw JPEGs, event timestamps, intermediate clips, and the completed capture session live together in `out/recording-*/`. Retry encoding without driving the website again:

```bash
pnpm video:record --encode-only video/out/recording-EXAMPLE/session.json --preview
```

Use `--resume video/out/recording-EXAMPLE/session.json` to retain completed shots after a failed browser journey. It replays their app actions to restore state and records only unfinished shots; scene durations must match. A completed journey can be re-encoded. The early annual-return completion example is reset outside the footage before the later advance-tax walkthrough. Controls and selectors reflect the current scripted questionnaire, and must be updated if that questionnaire changes. The recorder hides the homepage's embedded video during capture.

`pnpm video:test` runs the focused recorder regression tests. They cover the human movement path, exit fading, slow-shot retiming, stationary cursor holds, rapid and first-point clicks, and a real headless capture across navigation. The integration case decodes raw captures and the MP4 to verify their timing alongside the exported clicks, including labels that forward DOM click events. It needs Chromium and FFmpeg, and cleans up its temporary files.

## Edit sound

The prepared WAVs in `public/sfx/` are the audio assets used by the composition. The Crate in the Sea track is `public/sfx/crate-in-the-sea-gentle.wav`.

After changing mix levels, render only the soundtrack and combine it with an existing picture export:

```bash
pnpm video:render:audio
pnpm video:mux:audio
```

The remux writes `out/my-next-filing-demo-v3-remixed-1080p.mp4`, preserving the existing master. Review the result, then replace `out/my-next-filing-demo-v3-sfx-1080p.mp4` with it before packaging. Use `pnpm video:render` when the picture changes.

If replacing the narration, update its duration and cuts in `src/timeline.ts`, the captions, and the Direction table below together.

## Package for the website

```bash
pnpm video:package
```

Packaging reads the SFX master and creates 1080p, 720p, and 480p HLS renditions with aligned six-second segments and AAC audio. It verifies each rendition before replacing the application's `../public/video/`, and keeps the previous package in `out/previous-website-video-*`. This changes local website assets. Restart an already running Vite server after packaging if the new duration adds HLS segments; its public-file inventory can retain the previous segment list.

The poster uses frame 1026, before the plan callouts. Packaging also writes standalone SRT/VTT captions into `out/`. The HLS subtitle playlist uses a WebVTT timestamp map from the first video segment, keeping captions synchronized with the stream.

## Direction

| Voiceover | Screen sequence |
| --- | --- |
| As an independent freelancer in India, figuring out which tax and compliance rules apply to me can feel overwhelming. | Handwrite "Which tax rules" and "apply to me?" on textured white paper. Write the second line in green and underline it. |
| If I Google "Indian freelancer tax filing," there's plenty of information. | Type the query into an illustrated search field. Scribbled search results fill a long paper sheet that scrolls upward, accelerating as it leaves the screen. |
| But which parts apply to me, and what do I actually do next? | Reveal the handwritten question "What do I do next?" in green, with an underline. |
| That's why I built My Next Filing. Let me show you an example. | Turn the paper away to reveal the current homepage. Click "Start your estimate". |
| I start by answering a few questions about my work, | Keep the fictional example pre-filled. Show "You and your practice", then click Continue to "Your work and tax method". |
| enter my income and taxes already paid, | Click Continue through "Receipts and profit", "Clients and payments", and "Other income and tax paid". Scroll to "Tax already paid", then continue to "GST registration and filings". |
| review my answers, and calculate my plan. | Click Continue to "Review your answers", hold on the pre-filled summary, then click "Calculate my plan". |
| Here's my next action, the date, and the estimated amount left to pay. | Hold on the next-action card. Move the cursor slowly toward the date and keep it visible. Circle the date first, then the estimated amount, in green. |
| Below it, you can view all upcoming compliances for the whole tax year. | Scroll down to "Your agenda" and show the upcoming actions. |
| I can also check the calculation here | Scroll to the tax summary and expand "How this estimate was calculated". |
| and open the official how-to guide for the related portal. | Return to the next-action card and click "Open e-Pay Tax". Cut to the official portal page, then cut back to the plan before saving. |
| I can also save my data in this browser and record what I've completed. | Open "Save data in this browser", show the save notice, and choose "Save data". Scroll to the agenda, open "Add completion date", select 7 September 2026, click "Mark completed", and hold on the completed action. |
| I still file and pay through the official portals, | Hold on the completed record, then turn to the reminder to file and pay on official portals. |
| but this app gives me some much needed peace of mind. | Turn to a paper page reading "Prepare here." in green and "File and pay on official portals." below it. |
| My last submission was a proof of concept built in 24 hours. | Show the original homepage screenshot, tilted slightly with a sketched border. Handwrite and underline "In 24 hours" beside it. |
| This round, I built a more user-friendly app with a lot more features. | Turn to the handwritten feature checklist and begin revealing its five lines. |
| It now supports more work types, including eligible work through platforms like Upwork and overseas clients. | Write and check five feature lines: salary alongside freelancing; rent from one Indian home; dividends and bank interest; Indian equity gains and losses; GST checks and filing dates. Switch directly to "Clients and payments". Select "Both domestic and foreign clients" and "Directly and through a platform", and scroll to the follow-up questions. |
| But the biggest change? What happens when I come back? | Turn to a paper page reading "Come back." and "See what's next." Write the second line in green and underline it. |
| I reopen my saved plan, | Show the returning homepage, click "Continue your saved workspace", and reveal the restored next-action card. |
| update the amount paid, and recalculate. | Open "Update amount paid", enter the fictional payment in "Total advance tax already paid", and click "Save and recalculate". |
| The balance is now 0. | Show the recalculated card and underline "No estimated amount left" in green. |
| I mark that action completed, and the next action changes. | Move onto "Mark completed", hold the hover, then click. Hold on the replacement next-action card and underline its heading. |
| The plan constantly reflects my progress. | Scroll to the updated agenda and show the recorded completion. |
| All my answers stay in this browser, and the calculations happen here, too. | Turn to a paper page reading "Your answers." and "Your browser." Write the second line in green and underline it. |
| I've simplified the questions and added help text wherever necessary. | Return to the work and tax-method questions. Move onto the tax-method "Learn more" control, pause before clicking, and hold the dialog open to show its explanation. |
| Unsupported answers get an immediate explanation, so I know when this tool can't help. | Select "Not sure" for the tax-method confirmation and scroll to its unsupported-answer explanation. |
| The question stays the same: What should I file next? | Turn to a paper page and handwrite "What should I file next?" with a green underline. |
| Now, I can keep coming back to the answer. | Turn to the final paper page. Handwrite "mynextfiling.wekeep.in" in green and hold through the ending. |
