---
name: code-conventions
description: Apply My Next Filing's TypeScript and product-boundary rules before changing application code, rules, or sources.
---

# Code conventions

Read the relevant part of `SPEC.md` before changing behavior.

Keep the application static. It has no backend, account, database, worker code, or government connection. Do not put profile or money values in a URL, title, log, Analytics event, or external link.

Keep legal evaluation in one pure module. It accepts a validated profile, current date, and validated local rule dataset, then returns one supported, unsupported, or stale-rules result. Views and routes render that result. They do not calculate tax or decide eligibility.

Store money as integer rupees. Validate untrusted input at the browser boundary. Keep statutory data typed, versioned, sourced, and separate from evaluation code. An expired or invalid dataset must stop calculation.

For changed tax behavior, add one focused test through the evaluation, rule-validation, or browser-journey seam. Run the relevant test plus `pnpm lint`, `pnpm typecheck`, and `pnpm build` before finishing.
