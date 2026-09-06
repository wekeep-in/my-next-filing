# Compare three next-action card layouts

Type: prototype
Status: resolved

## Question

Which arrangement makes the first plan card easier to scan while retaining the action, deadline, estimated amount, applicability, portal guidance, official sources, browser-save consent, and completion controls?

## Review

The throwaway prototype is preserved on branch `prototype/next-action-card-design` at commit `2cbd1c8af522`. On that branch, run `pnpm prototype`, then open `http://localhost:5180/plan?example=1&variant=A`. The prototype route, command, and switcher are removed from the working branch.

- A, Compact footer: action summary, adjacent portal and guide links, two supporting disclosures, a quiet tracking footer.
- B, Side-by-side brief: the action on the left, visible applicability and portal guidance on the right, browser tracking below.
- C, Act, then record: the deadline beside the heading, numbered portal and browser-record sections, sources at the end.

The floating switcher cycles with its buttons or left/right arrow keys outside fields and dialogs. Only the variant enters the URL. The action selector previews annual return or advance tax; the state selector previews Unsaved, Save consent, Saved, or Fictional example. State persists while switching layouts and resets on reload. All mutations are simulated in memory. Payment editing deliberately closes without recalculation because this prototype evaluates presentation only.

Source: `src/routes/plan/attention.prototype.tsx` and its scoped stylesheet, with `src/components/prototype-switcher.tsx`. The host is the existing `/plan` route, gated to development and fictional example mode. Data, portal destinations, source links, and notices reuse the application. Production excludes the prototype module.

## Decision

Implement the compact layout, A, with the user's requested edits: stack How to file and Official sources vertically with dividers matching the other result cards, and place the agenda's portal-navigation note in a disclosure. The user also requested moving the main card's guide link inside How to file. Preserve the standalone save-consent dialog, compact visible completion controls, and neutral fictional-example note. Remove all prototype code and review controls from the working branch.

The final card also places applicability explanations in a first disclosure, Why this action. Summary dates use Due by; only the amount and date are bold foreground text, with surrounding wording muted. LUT timing and conditional QRMP review wording remain specific to those actions.

## Verification

- Formatting, lint, type checking, and production build pass.
- All 16 browser tests pass, including portal destination/privacy contracts and disclosure presentation for all seven supported action kinds.
- All 9 focused production-browser checks pass across Chromium, Firefox, and WebKit. They cover disclosure links, unchanged storage when following links or canceling consent, consent focus/Escape, successful saves, and visible saving errors with retry inside the dialog.
- Compared unsaved, consent, saved/completion, expanded guidance, agenda, and fictional-example states at desktop, 1024px, and mobile widths. Final summary styling and disclosures were verified at 1440, 1024, 390, and 320px, including keyboard and reduced motion. Screenshots are in the ignored `artifacts/next-action-card/` directory.
