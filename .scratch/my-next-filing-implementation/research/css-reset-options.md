# CSS reset and normalization options

Research date: 4 September 2026.

Scope: the static React/Vite application in this repository, which owns a global
stylesheet, custom Fraunces and Inter typography, custom form controls, visible
focus styles, and no utility-CSS framework. The immediate symptom was the
browser-default inset on `legend` after the surrounding `fieldset` padding was
reset.

## Recommendation

Use [`modern-normalize`](https://github.com/sindresorhus/modern-normalize) as the
package option, imported before `src/styles.css`. Its current package is
`3.0.1`, has zero dependencies, targets the latest Chrome, Firefox, and Safari,
and explicitly includes `legend { padding: 0; }` along with form-font,
form-margin, box-sizing, text-size, and `summary` normalizations. [Package
metadata and usage](https://www.npmjs.com/package/modern-normalize), [current
stylesheet](https://github.com/sindresorhus/modern-normalize/blob/main/modern-normalize.css)

Keep the application’s existing design rules after it. `modern-normalize` also
sets an `html` system font and `1.15` line-height, so the app’s later `:root`,
body, paragraph, heading, and control rules must remain authoritative. Do not
import a separate forms reset: this app intentionally owns its form borders,
spacing, labels, radios, selects, and focus treatment.

The package is now adopted in this app. The current stylesheet continues to own
the product-specific rules, including box sizing, body margin, inherited
control fonts, and zeroed fieldset padding/border; `modern-normalize` owns the
cross-browser legend padding normalization.

## Shortlist

| Option | What it does well | Cost or mismatch here | Verdict |
| --- | --- | --- | --- |
| [`modern-normalize` 3.0.1](https://www.npmjs.com/package/modern-normalize) | Small, zero-dependency stylesheet; preserves useful defaults; supports latest Chrome/Firefox/Safari; includes the exact legend-padding fix. | Sets a few document/control defaults that this app must override with its own design tokens. | Best package fit. |
| [`@csstools/normalize.css` 12.1.1](https://github.com/csstools/normalize.css/) | Conservative, standards-focused normalization; current source uses low-specificity `:where()` selectors and targets recent browsers. | Its current normalize sheet does not include `fieldset` or `legend` rules, so it does not solve this specific inset by itself. [Source](https://raw.githubusercontent.com/csstools/normalize.css/main/normalize.css) | Good if browser-bug normalization is the only goal; less useful for this symptom. |
| [`sanitize.css` 13.0.0](https://github.com/csstools/sanitize.css) | Broad, documented baseline; low-specificity selectors; optional assets, typography, forms, and reduced-motion sheets. | More opinionated: it changes line-height, overflow wrapping, navigation lists, media alignment, touch behavior, and default fieldset styling. Its optional forms sheet adds control borders and padding, conflicting with this app. | Too broad; do not add. |
| [`the-new-css-reset` 1.11.3](https://github.com/Elad2412/the-new-css-reset) | Uses modern `all: unset`, `revert`, and `:where()` to remove almost every user-agent style while preserving display. | It is a full reset, not a normalization layer. The app would need to re-author more semantic, form, and interactive defaults; its own README warns that focus styles must be supplied. | Too destructive for the current app. |
| [`@acab/reset.css` 0.11.0](https://github.com/mayank99/reset.css) | Uses cascade layers and `:where()`, includes focus, dialog/popover, and visually-hidden helpers. | It pre-applies `system-ui`, automatic dark-mode behavior, and focus decisions; the npm metadata declares no license and the package has low adoption. [Package metadata](https://www.npmjs.com/package/%40acab/reset.css) | Interesting reference, not a dependency to add. |

## Tooling options that are not resets

[`postcss-normalize`](https://www.npmjs.com/package/postcss-normalize) can
select the needed portions of normalize.css or sanitize.css based on a
Browserslist target. That is useful in a PostCSS-heavy project, but this app
currently has no PostCSS configuration or Browserslist requirement. Adding it
would create a build-tooling decision to solve a small static-CSS problem.

[`@unocss/reset`](https://unocss.dev/guide/style-reset) is a collection of
reset stylesheets, including normalize, sanitize, Eric Meyer, and Tailwind
variants. The official docs position it as an add-on for UnoCSS; this app does
not use UnoCSS, so installing it would add a framework-adjacent dependency with
no benefit over importing the underlying stylesheet directly.

The archived [`modern-css-reset`](https://github.com/Andy-set-studio/modern-css-reset)
is not a current choice: its repository is read-only and explicitly directs
users to a newer article. Avoid its npm package for new work.

## Integration notes

Vite supports importing CSS from JavaScript and bundles it with the application,
so a package reset remains a same-origin build asset rather than a runtime CDN
request. [Vite CSS imports](https://vite.dev/guide/features#css)

If adopted, the minimal integration is:

```ts
// src/main.tsx
import 'modern-normalize/modern-normalize.css'
import './styles.css'
```

The reset must load before the app stylesheet. The CSS Cascade specification
also permits an imported reset to be placed in an early `@layer reset`; normal
unlayered application rules then take precedence over it. [CSS Cascade Level 5,
layers](https://www.w3.org/TR/css-cascade-5/#layering)

## Decision

Adopt `modern-normalize@3.0.1`. It is imported before `src/styles.css` in
`src/main.tsx`. Keep the app-specific typography, form styling, spacing,
focus treatment, and layout rules after it, and review visual diffs across
every route when the reset version changes.
