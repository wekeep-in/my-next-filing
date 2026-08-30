# Choose the end-to-end interface design

Type: prototype
Status: resolved
Blocked by: none

## Question

Using a rough responsive prototype and live human review, what exact layout, spacing, card composition, visual tokens, questionnaire composition, result hierarchy, source presentation, accessibility behavior, and motion treatment should the first release use across its required routes and supported, unsupported, stale, empty, and error states? Preserve every design constraint and required copy in `SPEC.md`.

## References

- [Wise account dashboard](https://mobbin.com/screens/d104a8bc-bc31-484d-80e8-2c9a2cb1e796)
- [Wise money-transfer flow](https://mobbin.com/flows/77c0a951-fd82-4d40-8146-e54549e9319b)
- [Wise current landing-page typography and cards](https://mobbin.com/sites/sections/ad2c592f-5439-41a9-8c88-7b32902c5543)
- [Substack feed and sidebar](https://mobbin.com/screens/119fd075-65f4-4818-a0c3-5be5d8e684b5)

## Answer

Use the prototype's **Focused flow** direction. The landing page uses the simple centered Wise-style hierarchy; the questionnaire removes application navigation and keeps one group in a centered working column with four-stage progress; the result keeps the same focused shell and places the next deadline before calculation detail. The prototype covers the required reference, unsupported, stale, empty, and error states and works at 320 CSS pixels.

Use Substack's orange `#ff6719`, hover orange `#ff5600`, white, and neutral gray tokens. Use `#111111` for the darker primary ink requested in review. Set interface typography from a 16-pixel base on a 1.2 minor-third scale, with the landing display capped at 82.56 pixels. Use sentence-case labels in normal flow; do not repeat tracked uppercase eyebrow labels.

Implement with official shadcn Base UI components before writing an owned equivalent. The official Questionnaire, Field, Sidebar, Button, input, selection, disclosure, and card components are the starting set. Typeset is optional only for prose-heavy reference routes; it does not supply a minor-third scale, so any checked-in Typeset CSS must use the project's type tokens. Use community registry items only when the official registry has no suitable component, after reviewing resolved files, dependencies, transitive registry items, environment use, licence, and pinned source. See [shadcn Typeset and registry guidance](../research/shadcn-typeset.md).
