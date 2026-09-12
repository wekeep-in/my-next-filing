# Stage presentation with sound effects

The `Comparison` composition follows the 31 scenes in [speaker notes](../.scratch/stage-pitch/content.md), using the landing-page submission video as its visual base. The former pitch deck remains preserved at commit `8fa9c74`.

## Review before export

Open [Comparison in Studio](http://localhost:3001/Comparison), using `pnpm video:studio` if needed. The presenter has approved the final MP4 export at the full 2560 × 1440 composition resolution. The composition includes paper transitions, writing, scribbles, typing, scrolling and click sounds, but no narration or background music. The final deliverable is MP4 only, with sound effects and no background music or narration.

The completed export is `video/out/my-next-filing-stage-final.mp4`: 2560 × 1440, 30 fps, H.264 video with stereo AAC sound effects, 207.68 seconds (about 3:28). The file passed a full decode check. Render outputs stay in the ignored `video/out/` directory; the source and required assets are versioned.

## Current sequence

The 31 scenes match the speaker notes. The questions open as an unchecked list. A single illustrated search scene cycles through three different queries; each fully written query holds for one second before scrolling. The scrolls accelerate across the cycles, with no separate “What do I do next?” reveal.

“It keeps changing” and its three statements are left aligned, with drawn arrows instead of bullets. The My Next Filing card’s green paper is visible beneath the outgoing transition. The official-portals card breaks before “official portals.”

The existing main-video footage covers the questionnaire, plan, saving, return visit, help and unsupported answers. The concluding question list begins fully visible; boxes tick and statements get crossed out. The closing question and domain follow.

## Visuals and source material

Use the main video's layered paper, grain, handwriting, rough edges, page turns and full-frame native app recordings. `NativeScreen` retains the original cursor paths, click ripples and annotation timing. Adjacent pieces of a single recording preserve source offsets without a page turn; narrative transitions finish onto blank paper before the next scene appears.

The previous Google recordings and Safari-framed comparison are no longer used. Existing raw comparison captures remain source material, not part of this composition. No web recapture is necessary for this cut. The green My Next Filing introduction retains paper texture and white lettering.

`comparisonSceneGuide` exposes scene starts and durations for Studio checks. Run lint, typecheck, build, build verification and `pnpm video:test`. Check the unchecked list, all loop boundaries, the three statements with drawn arrows, representative native footage and the tick-and-strike reprise in Studio. The original `Submission` composition remains available unchanged in content and narration.

Effects use the original samples and levels. Transition cues follow the current scene boundaries, clicks follow the original cursor timestamps remapped into each scene, and the faster search loops have effects timed to their shorter cycles. Long handwriting is divided into valid scribble samples so it cannot select a missing region. The export command includes the sound-effects track.

The stage renderer caches the static grain and ink-opacity layers as full-resolution PNG textures under `video/public/paper`, preserving PaperWobble and the drawn graphics. `node video/cache-paper.mjs` regenerates them from the original SVG definitions with Studio running. The main `Submission` keeps its original SVG rendering path. These textures are internal assets; the delivered video is MP4 only.
