# Default motion for changing content

Researched 5 September 2026 against current official documentation, installed Tailwind 4.3.3 and Base UI 1.7.0, and published AutoAnimate 0.10.0 source. No application code or dependencies changed during this research.

Use shared native entry styles for common form and editor blocks. Keep the existing native disclosure behavior. For smooth resizing after arbitrary nested JSX changes, a small shared measurement boundary is needed. Tailwind does not supply an automatic layout-animation engine, and AutoAnimate's removal behavior conflicts with this app's requirement to remove sensitive DOM immediately.

Implemented through `src/components/auto-size.tsx`, inherited by the questionnaire's content boundary and the shared result-card variant. It observes natural inner dimensions and animates an outer box over 160ms, without retaining removed children or adding a dependency. Shared CSS gives new fields/editors a 180ms upward entry and alerts/errors a 120ms downward entry. The existing page controller supplies pointer/keyboard and active-page-entry state, so size and entry feedback can stay immediate when appropriate.

The browser regression check is `await (await import('/scripts/verify-motion.tsx')).verifyMotion()` with the development server running. It exercises nested height changes, interruption, immediate DOM removal, clipping cleanup, keyboard input, width changes, and reduced motion. Live application checks also cover conditional Activity questions and Save data expansion/collapse. Native disclosure resize is allowed to settle independently to avoid a second animation following each intermediate height.

## What Tailwind and CSS provide

| Feature | Useful behavior | Limit |
| --- | --- | --- |
| `starting:opacity-0` | Generates `@starting-style`, which establishes entry styles for newly rendered elements or elements becoming visible from `display:none`. | It does not replay because an already visible element's content changes. [Tailwind starting styles](https://tailwindcss.com/docs/hover-focus-and-other-states#starting-style) |
| `transition-discrete` | Generates `transition-behavior:allow-discrete`, allowing transitions involving `display` and `content-visibility`. | It changes when discrete properties switch. It does not measure content or delay React removing a DOM node. [Tailwind transition behavior](https://tailwindcss.com/docs/transition-behavior), [MDN behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-behavior) |
| `[interpolate-size:allow-keywords]` | Enables transitions between a numeric size and intrinsic sizing such as `auto`. | One endpoint must be a length or percentage. A container remaining `height:auto` after a child is inserted has no changed size property to transition. [MDN interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size) |
| `calc-size()` | Performs arithmetic on intrinsic sizes and allows related interpolations. | It does not turn unchanged `auto` layout into a mutation-triggered transition. [Chrome intrinsic-size guide](https://developer.chrome.com/docs/css-ui/animate-to-height-auto) |
| `::details-content` | Targets the body of native `details`, separate from its summary. | Size transitions still need size interpolation support or measured numeric endpoints. [MDN details content](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::details-content) |

The installed Tailwind compiler generated the first three utilities above. It did not generate a guessed `interpolate-size-allow-keywords` utility. Use ordinary CSS or the arbitrary property form. Global `transition-all` does not solve unchanged `auto` sizing either.

An exit animation on a React conditional requires retaining the element until completion or using snapshots. CSS alone cannot animate a node React has already removed. MDN's DOM-removal example explicitly delays removal in JavaScript. [Starting-style removal example](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style#transitioning_elements_on_dom_addition_and_removal)

## Browser support

| Feature | Chrome | Safari | Firefox | Source |
| --- | --- | --- | --- | --- |
| `@starting-style` | 117 | 17.5 | 129 | [Mozilla data](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/at-rules/starting-style.json) |
| `transition-behavior` | 117 | 17.4 | 129 | [Mozilla data](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/transition-behavior.json) |
| `::details-content` | 131 | 18.4 | 143 | [Mozilla data](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/selectors/details-content.json) |
| `interpolate-size` | 129 | Unsupported | Unsupported | [Mozilla data](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/interpolate-size.json) |
| `calc-size()` | 129 | Unsupported | Unsupported | [Mozilla data](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/types/calc-size.json) |

Tailwind's minimum versions are Chrome 111, Safari 16.4, and Firefox 128. Native motion therefore needs immediate-state fallbacks even on some browsers supported by Tailwind. [Tailwind compatibility](https://tailwindcss.com/docs/compatibility)

## Existing Base UI support

Base UI exposes starting/ending attributes and coordinates animation completion before unmounting its components. Its Collapsible provides measured panel-size variables. These are component lifecycle features, not a general solution for arbitrary nested content resizing. Installed `useCollapsiblePanel` measures opening/closing dimensions and restores `auto` after opening; it is not a generic ResizeObserver wrapper. [Base UI animation](https://base-ui.com/react/handbook/animation), [Collapsible API](https://base-ui.com/react/components/collapsible)

The repository already uses Base UI for popups and native `details` for disclosures. Preserve those boundaries rather than replacing disclosures to obtain one animation.

## AutoAnimate fit

The registry's current published release is 0.10.0 with no runtime dependencies. Its React hook returns a parent ref and enable/disable control. The documented scope is the parent and immediate children. It adds `position:relative` to static parents and documents flex sizing limitations. [Package registry](https://registry.npmjs.org/@formkit%2fauto-animate/latest), [Official usage](https://auto-animate.formkit.com/)

Inspection of the published release source found:

- Mutation observation uses `childList:true` without `subtree`. Resize callbacks update coordinates; they do not trigger animations.
- Removal reinserts disconnected nodes, positions them absolutely, and removes them on animation finish. Cancelling during teardown can leave the reinserted node until its parent disappears. This latter consequence is a static inference, not a reproduced browser finding.
- Cleanup disconnects observers and recorded timers, but the initial delayed polling timeout is not recorded. It can start an interval after teardown.
- Measurements use transformed client rectangles. Existing page-entry transforms can affect cached positions.
- Reduced motion is checked at initialization, has no change listener, and is bypassed by custom plugins. Keyboard gating is absent.
- Default entry uses scale and lasts 1.5 times the configured duration; ordinary options cannot reproduce our exact entry effect.

These findings make it unsuitable as a blanket default for this app's form, save, and deletion flows. [AutoAnimate 0.10.0 implementation](https://github.com/formkit/auto-animate/blob/v0.10.0/src/index.ts), [React cleanup](https://github.com/formkit/auto-animate/blob/v0.10.0/src/react/index.ts)

## Recommended defaults

Use the established 120ms entry for alerts and errors, 150ms for disclosure resizing, and 180ms for revealed form/editor blocks, all with the existing easing. Apply those rules at shared semantic blocks so callers inherit them. Avoid overlapping entry effects on both a newly inserted parent and all of its descendants. These values follow local `DESIGN.md`.

For nested-content resizing, use a stable content region with one native ResizeObserver. Observe natural content dimensions and animate its containing box between measured sizes. Observing an inner element while sizing an outer element avoids observing the animation's own intermediate heights. ResizeObserver reports dimensions before paint, but writing sizes back into observed layout requires loop prevention. [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)

Keep measurement and cancellation in the shared implementation. Skip initial rendering, keyboard-triggered movement, reduced motion, and overlapping page entry. Cancel immediately when those conditions change. Let React remove deleted content immediately; animate only the remaining container's size.

Keep money values, urgency/deadline indicators, fixed rails, top bars, and existing popup animation outside automatic layout effects. Apply the defaults to form groups and editor containers. New content within those shared regions receives the behavior; a universal animation policy for every DOM mutation would require more exceptions and would violate the local motion rules.

Verification should cover nested conditional fields, validation insertion, rapid open/close, same-route workspace changes, deletion during animation, keyboard activation, reduced-motion changes, and mobile fixed controls.
