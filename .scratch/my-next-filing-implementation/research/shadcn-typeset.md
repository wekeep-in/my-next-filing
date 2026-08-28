# shadcn Typeset and registry guidance

Research date: 29 August 2026. Sources are limited to shadcn's official documentation and repository.

## Recommendation

Use shadcn's official Base UI components first. For this greenfield Vite app, Base UI is now shadcn's default and its recommendation for new projects. Add only the components the product uses. The official `Questionnaire`, `Field`, `Sidebar`, `Card`, and `Button` cover most of the approved interface without a parallel component layer. [shadcn recommends Base UI for new projects](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default), and its [Vite guide](https://ui.shadcn.com/docs/installation/vite) documents direct CLI installation.

Typeset is useful only on prose-heavy routes such as methodology, sources, disclaimer, and privacy. It is not an app-wide type system and it does not expose a modular-scale control. Keep the requested 1.2 minor-third scale in the app's theme tokens. If Typeset is used, change its local heading rules to those tokens so prose follows the same scale.

Treat community registries as an exception when the official registry has no suitable component. Review and pin every third-party item before installation, and verify its license separately.

## What Typeset is

shadcn/typeset is a first-party stylesheet for semantic HTML and rendered Markdown. A `.typeset` wrapper styles headings, paragraphs, lists, tables, code, and related elements. It follows shadcn theme colors and fonts, supports context-specific presets, and keeps appended streaming content from restyling earlier blocks. It is one CSS file copied into the application, not an npm package or runtime abstraction. [Typeset documentation](https://ui.shadcn.com/docs/typeset) and [July 2026 release note](https://ui.shadcn.com/docs/changelog/2026-07-typeset).

Installation is manual and works in React/Vite:

```css
@import "tailwindcss";
@import "./typeset.css";
```

```tsx
<article className="typeset typeset-legal">{content}</article>
```

The builder at [ui.shadcn.com/typeset](https://ui.shadcn.com/typeset) supplies the CSS file, framework font setup, preset class, and wrapper. A preset exposes only body and heading fonts plus `--typeset-size`, `--typeset-leading`, and `--typeset-flow`. Layout still owns readable measure and maximum width. Components inside prose can opt out with `not-typeset` or `data-not-typeset`. [Building and customizing Typeset](https://ui.shadcn.com/docs/typeset#building-your-typeset).

As of the research date, Typeset is current. shadcn released it in July 2026, keeps a live builder and documentation page, and does not label it beta or experimental. There is no stated stability guarantee or semantic version because the deliverable is copied CSS. The project's checked-in copy is therefore the effective version and must be reviewed like any other owned stylesheet.

## Minor-third fit and limits

Typeset's public controls cannot select a scale ratio. The project source fixes heading sizes at `1.75em`, `1.25em`, `1.125em`, `1em`, `0.875em`, and `0.8125em`; that sequence is not a 1.2 minor third. The documentation says shadcn deliberately reduced the controls to size, leading, and flow. [Current Typeset source](https://github.com/shadcn-ui/ui/blob/3cdaa6eb2f0da27aca8598cb752c32d840e06940/apps/v4/app/%28app%29/%28typeset%29/typeset.css#L55-L97) and [Typeset principles](https://ui.shadcn.com/docs/typeset#principles).

Use one shared minor-third token sequence for interface text, for example `0.8333rem`, `1rem`, `1.2rem`, `1.44rem`, `1.728rem`, and `2.0736rem`. Map semantic roles to the needed subset instead of using every step on every screen. If Typeset remains, replace only its heading multipliers with the same tokens. Its low-specificity `:where()` selectors and components layer make those overrides ordinary CSS. [Typeset overrides](https://ui.shadcn.com/docs/typeset#overrides).

Other boundaries:

- Typeset styles descendant HTML, not shadcn controls, navigation, card composition, or the landing-page display hierarchy.
- It raises the base size by `1.125` below `48rem`, so confirm that behavior against the chosen responsive type tokens. [Typeset source](https://github.com/shadcn-ui/ui/blob/3cdaa6eb2f0da27aca8598cb752c32d840e06940/apps/v4/app/%28app%29/%28typeset%29/typeset.css#L17-L38).
- It inherits the app font, so the specification's system-font requirement needs no font package.
- It does not set a maximum line length. The route layout must do that.
- If the legal and methodology pages use explicit React markup with a few elements, skip Typeset and use the theme tokens directly. One extra stylesheet only earns its place when it removes repeated prose styling.

## Official components before community code

shadcn is an open-code distribution system. The CLI writes component source into `components/ui`, where the application owns and may edit it. It is not a conventional opaque component package. [shadcn introduction](https://ui.shadcn.com/docs) and [component installation model](https://ui.shadcn.com/docs/new#add-components).

The new official [Questionnaire component](https://ui.shadcn.com/docs/components/base/questionnaire) is especially relevant. It handles ordered steps, single and multiple choice, freeform answers, optional skips, validation, saved defaults, conditional items, progress, keyboard navigation, native form serialization, and focus behavior. It leaves persistence and product branching to the containing page, which matches this app's boundary. Installing it with `pnpm dlx shadcn@latest add questionnaire` brings in `@shadcn/react` for the behavior, so verify that dependency against the specification's dependency rule before locking the implementation plan. shadcn released Questionnaire in August 2026 for Base UI, React Aria, and Radix. [Questionnaire release note](https://ui.shadcn.com/docs/changelog/2026-08-questionnaire).

Prefer the official [Field](https://ui.shadcn.com/docs/components/base/field), [Sidebar](https://ui.shadcn.com/docs/components/base/sidebar), and ordinary input, selection, disclosure, and card components before looking at a community registry. Install exact items rather than `add --all`.

## Community registry safeguards

The official directory says its community registries are maintained by third parties and tells users to review installed code for security and quality. Directory inclusion means the registry is public, open source, schema-valid, and reviewed for directory publication. It is not a code-quality or security approval. [Community Registry Directory](https://ui.shadcn.com/docs/directory) and [directory admission requirements](https://ui.shadcn.com/docs/registry/registry-index#requirements).

Registry Health does not close that gap. It is experimental and not live, and its planned score measures availability, schema correctness, and CLI installability, not code quality or design quality. [Registry Health](https://ui.shadcn.com/docs/registry/health).

For any third-party item:

1. Inspect the repository, root registry, resolved files, targets, package dependencies, registry dependencies, and environment variables.
2. Run `shadcn view`, then `shadcn add --dry-run`; use `--diff` or `--view` before allowing writes.
3. Check transitive registry dependencies because one item may pull code from another registry.
4. For a GitHub registry, pin a full 40-character commit SHA for reproducibility.
5. Read the upstream license and asset terms. shadcn's own code is MIT-licensed, but that license does not cover independent community registries. The directory requirements do not promise a particular license. Keep required notices and reject items whose right to use is unclear. [Official GitHub registry review guidance](https://ui.shadcn.com/docs/registry/github#review-before-installing), [shadcn MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).
