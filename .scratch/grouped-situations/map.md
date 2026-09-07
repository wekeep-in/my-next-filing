# Grouped situations

Accepted: four stacked cards in the real other-income form. Employer-card styling, inset heading separators, compact checkbox rows, semibold labels and adjacent shared help tooltips follow the latest worktree design. One global pair of alternatives appears at the end.

Implemented in `src/routes/check/unsupported-facts-field.tsx`, using the existing questionnaire reducer and recovery schema. The prototype component, variant switch and old bubble styles were removed. No prototype answers were migrated.

Verification covers live blocking, reload, uncertainty, global clearing, keyboard selection, non-clickable labels, and restored combined dividend/gift answers.

Release verification passed on 7 September 2026: formatting, lint, TypeScript, live Rule validation, 141 Vitest tests, production build, static bundle/header checks, and 71 Playwright cases across Chromium, Firefox and WebKit. The existing WebKit video case remains skipped. Responsive checks covered 1440, 1024, 375 and 320px. Final copy alignment includes the supported employer NPS deduction in the review and evaluation labels.
