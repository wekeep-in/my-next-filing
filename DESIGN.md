---
version: alpha
name: My Next Filing Editorial Utility
description: A calm, trustworthy filing planner for supported solo freelancers in India.
colors:
  background: "#f1f5f9"
  foreground: "#0f172a"
  card: "#ffffff"
  mutedForeground: "#475569"
  border: "#e2e8f0"
  pageDivider: "#cbd5e1"
  strongBorder: "#94a3b8"
  primary: "#15803d"
  primaryHover: "#166534"
  primaryForeground: "#ffffff"
  accent: "#e2e8f0"
  outlineHover: "#f8fafc"
  focus: "#2563eb"
  destructive: "#b91c1c"
  destructiveHover: "#991b1b"
  destructiveSurface: "#fee2e2"
  destructiveBorder: "#fca5a5"
  warning: "#92400e"
  warningSurface: "#fffbeb"
  warningStatusSurface: "#fef3c7"
  warningBorder: "#fcd34d"
  warningBorderStrong: "#f59e0b"
  successForeground: "#166534"
  successSurface: "#dcfce7"
  successBorder: "#bbf7d0"
  mediaBackground: "#020617"
typography:
  display:
    fontFamily: Fraunces Variable, Georgia, serif
    fontSize: 5.16rem
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: -0.035em
  displayCompact:
    fontFamily: Fraunces Variable, Georgia, serif
    fontSize: 2.488rem
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: -0.035em
  heading2:
    fontFamily: Fraunces Variable, Georgia, serif
    fontSize: 1.728rem
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: -0.035em
  heading3:
    fontFamily: Fraunces Variable, Georgia, serif
    fontSize: 1.44rem
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: -0.035em
  bodyLarge:
    fontFamily: Inter Variable, ui-sans-serif, system-ui, sans-serif
    fontSize: 1.6rem
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: Inter Variable, ui-sans-serif, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Inter Variable, ui-sans-serif, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 750
    lineHeight: 1.3
  action:
    fontFamily: Inter Variable, ui-sans-serif, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 800
    lineHeight: 1.1
  caption:
    fontFamily: Inter Variable, ui-sans-serif, system-ui, sans-serif
    fontSize: 0.75rem
    fontWeight: 800
    lineHeight: 1.3
rounded:
  option: 0.45rem
  tooltip: 0.5rem
  control: 0.7rem
  card: 1rem
  full: 9999px
spacing:
  hairline: 0.25rem
  xs: 0.5rem
  sm: 0.75rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  2xl: 3rem
  3xl: 4.5rem
components:
  buttonPrimary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primaryForeground}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    height: 2.9rem
    padding: 0.72rem
  buttonPrimaryHover:
    backgroundColor: "{colors.primaryHover}"
    textColor: "{colors.primaryForeground}"
  buttonOutline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    height: 2.9rem
  buttonOutlineHover:
    backgroundColor: "{colors.outlineHover}"
    textColor: "{colors.foreground}"
  buttonOutlineHoverBorder:
    backgroundColor: "{colors.pageDivider}"
    height: 1px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
    padding: 1.5rem
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    height: 3rem
    padding: 0.7rem
  status:
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 0.28rem
  supportingText:
    textColor: "{colors.mutedForeground}"
    typography: "{typography.body}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  pageDivider:
    backgroundColor: "{colors.pageDivider}"
    height: 1px
  controlHover:
    backgroundColor: "{colors.accent}"
  focusIndicator:
    backgroundColor: "{colors.focus}"
    size: 0.2rem
  buttonDestructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.primaryForeground}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
  buttonDestructiveHover:
    backgroundColor: "{colors.destructiveHover}"
    textColor: "{colors.primaryForeground}"
  destructiveNotice:
    backgroundColor: "{colors.destructiveSurface}"
    textColor: "{colors.destructive}"
    rounded: "{rounded.control}"
  destructiveNoticeBorder:
    backgroundColor: "{colors.destructiveBorder}"
    height: 1px
  warningNotice:
    backgroundColor: "{colors.warningSurface}"
    textColor: "{colors.warning}"
    rounded: "{rounded.control}"
  warningNoticeBorder:
    backgroundColor: "{colors.warningBorder}"
    height: 1px
  unsupportedChoiceBorder:
    backgroundColor: "{colors.warningBorderStrong}"
    height: 1px
  warningStatus:
    backgroundColor: "{colors.warningStatusSurface}"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
  upcomingStatus:
    backgroundColor: "{colors.successSurface}"
    textColor: "{colors.successForeground}"
    rounded: "{rounded.full}"
  periodBorder:
    backgroundColor: "{colors.strongBorder}"
    height: 1px
  attentionCardBorder:
    backgroundColor: "{colors.pageDivider}"
    height: 1px
  completionEditorBorder:
    backgroundColor: "{colors.successBorder}"
    height: 1px
  mediaPreview:
    backgroundColor: "{colors.mediaBackground}"
    rounded: "{rounded.control}"
---

# My Next Filing design system

## Overview

My Next Filing is a calm editorial utility, not a dashboard and not a government portal. It should feel like a knowledgeable person has reduced a complicated filing journey to one clear next action. The visual reference is the established landing and journey interface: generous warm-neutral space, large Fraunces questions, readable Inter copy, compact white cards, one green action, and chronological information.

Preserve this language when changing implementation. Tailwind and the source-owned shadcn components make it repeatable; they do not authorize a redesign.

## Colors

Slate provides the neutral ground, ink, supporting text, and lines. White holds focused content. Use `border` inside white cards and the darker `pageDivider` only for separators drawn directly on the page ground. Green is reserved for the primary action, positive progress, and completed state. Blue appears only as the accessible focus indicator. Amber and red communicate review and destructive states with text as well as color.

Use the semantic tokens (`background`, `foreground`, `card`, `mutedForeground`, `border`, `primary`, `accent`, `focus`, and `destructive`) rather than palette utilities in product modules. The mappings in `src/styles.css` are the implementation source of truth and use the closest Tailwind palette colors. Keep one light theme; dark mode is outside the product scope.

The live theme color and SVG favicon use `primary`. Existing authored raster artwork, including the social preview, keeps its original sampled green until that artwork is deliberately regenerated; do not recolor compressed assets at runtime.

## Typography

Fraunces is the editorial voice for headings. Inter is the functional voice for body copy, labels, controls, dates, and amounts. Both fonts come from pinned Fontsource packages and Vite emits them as same-origin assets; no remote font request is allowed.

Headings use weight 700, `-0.035em` tracking, and `1.04` line height. The global display heading is fluid from `2.488rem` to `5.16rem`; the landing display is fluid from `3rem` to `4.8rem`. Body copy defaults to `1rem/1.6`. Labels and actions are bold enough to scan but remain sentence case. Do not replace Fraunces with a sans serif or introduce another typeface.

## Layout

The main canvas is fluid. Desktop content uses `min(68vw, 82rem)` with a sidebar between `17.25rem` and `24rem`. Journey pages put the content and progress rail in two columns above 1100px. At 1100px and below, progress becomes a compact fixed top rail and actions become a fixed bottom bar with safe-area padding. The landing page becomes one column at 860px. Additional adaptations occur at 640px, 520px, and 380px; the complete interface must continue to work from 320 CSS pixels and at 200% zoom.

Use the existing rhythm before inventing a value. Dense control spacing uses quarter- and half-rem steps; section spacing expands from `1.5rem` to `4.5rem`. Keep the primary action close to the progress context and keep the main question ahead of supporting explanation in reading order.

## Elevation & Depth

Hierarchy comes primarily from surface contrast and one-pixel borders. Cards sit on the slate ground as white paper. Reserve the soft `0 1rem 2.5rem rgb(15 23 42 / 0.09)` shadow for sticky journey panels, attention cards, and floating controls. Fixed mobile actions use a lighter upward shadow. Avoid stacked shadows, glass effects, gradients, and decorative depth.

## Shapes

Cards use a `1rem` radius; controls use `0.7rem`; compact internal options use `0.45rem`; statuses and period pills are fully rounded. Borders are one pixel except the `0.2rem` focus outline and the occasional four-pixel state marker. Shape should group information, not decorate empty space.

## Components

Local modules under `src/components/ui` are the shadcn layer and are owned by this repository. Interactive primitives use Base UI when it provides the relevant behavior. Customize those files to this design before using them; inspect CLI diffs before accepting any regenerated component.

- Buttons have a minimum height of `2.9rem`, `0.72rem 1.05rem` padding, weight 800, and a subtle `scale(0.97)` pointer press. Primary is green, secondary is white with a slate border, destructive is red, and text actions are underlined. Keep at least a 44px target.
- Outline buttons hover on a `slate-50` surface with a `slate-300` border. Button hover colors and borders transition over 150ms; reduced motion keeps the color transition but removes movement.
- Cards are white with a slate border and the card radius. Attention cards alone add the soft panel shadow and use the darker `pageDivider` border without implying success.
- The next-action card puts its deadline and any estimated amount below the heading, followed by its primary portal link. Only the amount and date are bold foreground text; surrounding summary copy is muted and uses “Due by” for due dates. Applicability reasons, portal guidance including the official tutorial link, and statutory sources stack as native disclosures with the same dividers as the other result cards. Agenda portal guidance uses the same disclosure. Browser saving sits in a quiet footer and opens the full consent notice in a focused dialog. Completion controls keep a visible date label and a compact date selector. Fictional-example restrictions use neutral footer text.
- Questionnaire content and result cards use the shared natural-size wrapper. Pointer-triggered content changes resize over 160ms with the app easing; keyboard input, reduced motion, responsive width changes, and page entry stay immediate. The wrapper observes inner content while resizing its outer box, releases clipping after completion, and lets native disclosure sizing finish independently. Removed content is never retained for an exit animation.
- Inputs, selects, radio choices, checkboxes, popovers, and calendars share the control radius, white surface, persistent label, blue focus treatment, and foreground-colored disclosure caret. Radio indicators are optically centered; an unsupported selected radio uses the warning foreground and stronger warning border. Select triggers show the option label, never its storage key. Long select lists keep directional scroll arrows on transparent-to-popover fade scrims. Select and calendar popup shells clip to their radius while an inset inner list owns scrolling. A field error is linked with `aria-describedby` and never communicated by color alone.
- Period and status badges are compact, fully rounded, and text-labelled. Money, urgency, and deadline state do not animate.
- Text links use a solid `1px` underline with a `0.17em` offset. Weight-800 links and text actions use `1.5px`; underline weight follows text hierarchy. External-link arrows use a narrow no-break space so the icon stays close to its label.
- A Home link precedes the Tax Year pill on questionnaire and plan headers. It shares the pill shape and type, with a foreground background and light text. Its expanded hit area preserves a 44px touch target.
- Long questionnaire groups use Base UI accordion cards with compact white surfaces and a full-width separator between the open heading and fields. Card headings use 1.25rem type and 1.5rem vertical padding in both open and closed states. Leave 1.25rem between accordion cards and 3rem between plain deciding questions and the conditional cards that follow them. Only one opens at a time. Panels animate height and opacity over 150ms with the existing easing; keyboard and reduced-motion interactions are immediate. Avoid native content-visibility transitions around form inputs because WebKit can reject focus during those transitions. Missing or unresolved answers have a warning-colored circled alert with a tooltip immediately after the heading text; complete answers show a green circled check in the same position. Both status icons are 18px and align with the heading text. Info icons have no visible button surface or padding; keep their invisible touch targets and focus indicators. The disabled forward button itself owns its explanatory tooltip, with no adjacent help button.
- Client routing questions use an accordion card. Applicable client follow-ups retain cards. Fit for this app and Income and profit use accordion cards; Income and profit retains seven cards, starting with Freelance receipts and profit, followed by Salary, Interest and dividends, Rental income, Domestic equity gains and losses, Capital losses from earlier years, and Foreign assets and accounts. Taxes and GST groups tax already paid, income-tax filing conditions and GST registration in separate cards, with further cards for a normal registration.
- The six-step journey rail gives Fit for this app, Income and profit, Clients and payments, Taxes and GST, Review your answers, and Your plan their own entries. Home is outside the step count. The same rail remains visible on the Plan page, where Your plan is current and the other steps open their corresponding review route. The journey rail remains an ordered list with current and completed states. At 1100px and below, its fixed top bar shows a `1.5rem` current-step number circle, the step name, and an `x of 6` counter in one row. The name and counter use `0.9375rem` text. A long header name truncates; the trigger's accessible name and the panel retain the full name. The page reserves the bar’s height, and questionnaire and plan content start `2rem` below it. The row opens a full-width panel directly below the bar, with no gap or rounded floating surface. The panel slides down over 180ms after pointer activation; keyboard and reduced-motion interactions are immediate. Its full-width rows match the top bar with `0.9375rem` labels and `1.5rem` circular numbers; both use `0.75rem`, weight-800 digits. Rows retain at least 56px touch targets, and edge-to-edge separators instead of timeline connectors. Existing navigation restrictions remain, and short viewports scroll. Its mobile wrappers and fixed actions are part of the interaction model, not optional decoration.
- App-wide notices share one context-provided top-bar host with information, warning, destructive, success, and fictional-example variants. At tablet and mobile widths, the fixed progress rail sits directly below the host's measured visible height. Empty hosts reserve no space; stacked notices scroll within the existing height limit. Notice actions inherit the notice's type size and color.
- Native `details` and `summary` remain the disclosure primitive outside the questionnaire cards. Questions use `0.875rem` text and answers use the `1rem` body size. Summary rows keep `0.75rem` vertical padding in both states and at least a 44px target. Open answers start directly after that padding and end with `0.75rem` before the bottom divider. Adjacent disclosures share one divider. Omit the final bottom divider when the disclosure ends its container; retain it before following content such as the next-action footer or completion controls. Standalone disclosure cards keep their outer border. Use the Base UI tooltip, select, checkbox, radio, and popover behavior where applicable.
- Newly revealed fields, notes, and editors inherit a 180ms entry from 0.25rem below. Alerts and errors enter from 0.25rem above over 120ms. These shared CSS defaults apply to pointer interactions, respect reduced motion, and pause during page entry so the effects do not stack. Amount changes do not replay entry or tween their values.

Motion is restrained and functional. The app shell applies the established 180ms entry from `opacity: 0; transform: translateY(0.5rem)` to full opacity and the resting position, with `cubic-bezier(0.23, 1, 0.32, 1)`, after pointer-initiated navigation commits. It follows the router location key, including same-path workspace switches and browser history, without remounting content. A route's direct `aside` holds navigation; its other content blocks receive the entry. A route without a sidebar receives the entry as one block. Keep viewport-fixed controls in the sidebar or a portal, and leave independently positioned overlays out of page entry. Routes and navigation controls do not carry animation flags. Initial rendering, keyboard navigation, hash-only changes, and reduced motion skip this entry. Local view transitions use 180ms for groups and 160ms for old/new content. Disclosure, popover, save, and deletion feedback run between 100ms and 180ms with the same easing. Newly shown warnings, alerts, and field errors enter over 120ms. Pointer presses may scale; keyboard activation does not. `prefers-reduced-motion: reduce` removes movement while preserving immediate state feedback. Confetti is brief, success-only, and suppressed for reduced motion.

## Presentation video

The stage presentation uses the landing-page submission video's layered paper texture, PaperWobble motion, rough page edges, Caveat handwriting and page turns. Follow the 31-scene speaker notes. Scene 2 draws four questions with empty checkboxes and no strikes. Scene 3 reuses the main video's illustrated search; scene 4 repeats the same scroll in progressively faster cycles, exposing a fresh search bar beneath each outgoing sheet. Scene 5 shows “It keeps changing” with a left-aligned heading and drawn arrows beside the three supplied situation-change statements.

Use the original full-frame native app recordings with their matching cursors, ripples and annotations. The older Google recordings and Safari framing are not used in this cut. Preserve source timing across adjacent native scenes. Finish page turns onto blank paper before introducing the next scene. The app-introduction card keeps white lettering on green textured paper, including the sheet exposed during the incoming page turn. The checklist reprise after scene 28 begins with the same words and empty boxes already visible; the check marks and strikes animate. It precedes the original closing question and domain. Use the main video’s paper transitions, typing, scrolling, clicks, handwriting and strike sounds, mapped to the stage timeline. Do not mount background music or narration. Keep this treatment outside the product interface and retain the landing-page submission's existing content.

## Do's and Don'ts

Do use semantic Tailwind tokens, existing shadcn modules, visible focus, semantic HTML, persistent labels, and text alongside status color. Do compare desktop, 1024px, and mobile states against the established interface after component changes. Do keep Tailwind Preflight as the only CSS reset. Do keep all fonts, scripts, styles, icons, and media bundled or same-origin.

Don't add a second visual language, dark theme, gradient, ornamental icon, remote asset, or animation for amounts, urgency, or deadlines. Don't leak Profile or money values into URLs, titles, logs, analytics, sharing, or external links. Don't overwrite curated shadcn modules without reviewing the generated diff. Don't add a new primitive when the platform, Base UI, or an existing local module already covers the behavior.
