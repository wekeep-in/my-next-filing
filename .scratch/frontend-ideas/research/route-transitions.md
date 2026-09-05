# Consistent page entry

Researched 5 September 2026 against official documentation and installed React 19.2.8, React Router 7.18.2, Tailwind 4.3.3, and Vite 8.2.2. React Router's current website serves 8.3.1 documentation; installed source and declarations were checked before recommending any API.

Use one effect in the shared app frame to animate committed page content with the browser's `Element.animate()` API. Depend on the router's `location.key`, preserve mounted forms, and skip animation for reduced motion. This recommendation follows from the app's existing entry effect and navigation flows. It does not require a package upgrade or another animation dependency.

Implemented in `src/lib/page-transition.ts`, attached once to the app frame's `main` element. The 180ms entry restores the original opacity plus `translateY(0.5rem)` movement and easing. It follows committed location changes and cancels on a subsequent navigation or keyboard input. Initial load, keyboard activation, reduced motion, and hash-only navigation skip the entry. The route-specific animation flags and the Plan's animation remount key were removed. The remaining native internal FAQ anchor now uses React Router's `Link`, so it preserves the active document and follows the same navigation handling.

Animate content blocks rather than the whole `main` wrapper. Existing routes place navigation in a direct `aside`; animate their other direct content blocks. Animate a route without an aside as a single block. Exclude fixed, absolute, and sticky targets, including the Plan's confetti overlay. This keeps the original visual effect while leaving sidebar and portal-owned controls stationary. The selector uses `:scope` and `:has`, both supported by Tailwind 4's minimum browsers. [Tailwind compatibility](https://tailwindcss.com/docs/compatibility), [Mozilla :has compatibility data](https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/selectors/has.json), [MDN :scope](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:scope)

## Why the saved workspace entry was missed

At inspection, `src/routes/check.tsx` and `src/routes/plan.tsx` conditionally apply entry classes from an `animate` flag. Callers pass that flag individually. The CSS uses `@starting-style` for a 180ms fade and 0.5rem movement. Opening saved data can also replace the content of `/plan` while remaining on `/plan`. A pathname-only trigger misses that change; a mounted-element starting style cannot replay simply because its content changed. These are findings from the local application.

## Available approaches

| Approach | Finding |
| --- | --- |
| React `<ViewTransition>` | Official docs still label it Canary/Experimental. The installed stable React export is `undefined`. Avoid changing React release channels for this fix. [React reference](https://react.dev/reference/react/ViewTransition) |
| React Router native view transitions | Stable `viewTransition` props on links/forms and `viewTransition: true` navigation options wrap the router update in `document.startViewTransition()`. They remain per-navigation opt-ins. [Router guide](https://reactrouter.com/how-to/view-transitions) |
| Global router default | Neither installed `DOMRouterOpts` nor `RouterProviderProps` offers a global `viewTransition` default. The current documented option lists agree. [createBrowserRouter](https://reactrouter.com/api/data-routers/createBrowserRouter), [RouterProvider](https://reactrouter.com/api/data-routers/RouterProvider) |
| Router instrumentation | Stable `instrumentations` exists in installed 7.18.2, but its information is read-only and cannot rewrite navigation arguments. It is intended for observation. [Instrumentation design](https://reactrouter.com/how-to/instrumentation#read-only-design) |
| Shared effect and native animation | `useLocation` supports location-change effects. `useLayoutEffect` runs after the DOM commit before paint. `Element.animate()` starts an animation without remounting the element. These stable APIs fit automatic entry. [useLocation](https://reactrouter.com/api/hooks/useLocation), [useLayoutEffect](https://react.dev/reference/react/useLayoutEffect), [Element.animate](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) |

## Implementation constraints

- Trigger from `location.key`, the history entry identity, so links, programmatic navigation, same-path navigation, and browser back/forward share one path. Installed `createMemoryRouter` checks confirmed that same-path PUSH/REPLACE generate a new key and back/forward restore the corresponding key. A state update without navigation needs a separate semantic view identity only if it actually replaces a page. Do not key the effect on profile values or ordinary edits. [Location reference](https://api.reactrouter.com/v8/interfaces/react-router.Location.html#key)
- Cancel the previous animation in effect cleanup. This also handles React Strict Mode's development setup/cleanup cycle. Avoid awaiting `animation.finished` unless its cancellation rejection is handled. [Effect lifecycle](https://react.dev/reference/react/useLayoutEffect), [Animation.cancel](https://developer.mozilla.org/en-US/docs/Web/API/Animation/cancel)
- Keep the content entry brief and use the existing easing. Do not transform a wrapper containing fixed navigation rails: any non-`none` transform establishes their containing block. Target content siblings of the navigation instead, and retain the default `fill: none` so the final transform does not persist. [CSS transform](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform), [Animation fill](https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/KeyframeEffect#fill)
- Check `matchMedia('(prefers-reduced-motion: reduce)')` before creating a JavaScript animation. CSS `motion-reduce` classes do not cancel a separately created Web Animation. Tailwind supports those variants for CSS-driven effects. [Reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion), [Tailwind animation](https://tailwindcss.com/docs/animation#supporting-reduced-motion)
- Keep initial rendering, hash-only navigation, focus movement, and in-place deletion/confirmation feedback deliberate. Ordinary form editing and notices should not replay page entry. These are app integration decisions, not automatic guarantees of an animation API.

## Native view transition limits

Installed router code tracks previously opted-in pathname pairs in `appliedViewTransitions`. POP transitions depend on that history; a global navigation wrapper does not guarantee animation for every history entry. Local app state may also commit before the router takes its old snapshot. A shared effect on committed content avoids needing to coordinate snapshots of those updates. This conclusion comes from `completeNavigation` and `RouterProvider` in the installed router source.

`document.startViewTransition()` is available across current browsers since October 2025, while basic `Element.animate()` has broad support since March 2020. Feature detection can leave immediate page updates on unsupported browsers. [View transition compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition), [Web animation compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)

Browser view-transition snapshots are part of local rendering. The specification requires protecting captured sensitive/cross-origin pixels from document access and introduces no new privacy considerations. Neither proposed animation API calls a service or requires sharing Profile or money values. [CSSWG privacy and security](https://drafts.csswg.org/css-view-transitions-1/#security-considerations)

Tailwind can keep the existing styles and tokens. Vite already processes imported CSS and browser TypeScript code, so this approach needs no Vite or Tailwind configuration change. [Vite CSS support](https://vite.dev/guide/features#css)
