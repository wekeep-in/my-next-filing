---
name: code-conventions
description: Apply My Next Filing's TypeScript, product-boundary, and design-system rules before changing application code, rules, sources, or interface styling.
---

# Code conventions

Read the relevant part of `SPEC.md` before changing behavior.

Read `DESIGN.md` before changing interface layout, styling, typography, color, motion, or components. Reuse the source-owned shadcn modules under `src/components/ui` and semantic Tailwind tokens. Preserve their curated design when running the shadcn CLI by reviewing its diff before accepting generated changes.

Keep the application static. It has no backend, account, database, worker code, or government connection. Do not put profile or money values in a URL, title, log, Analytics event, or external link.

Keep legal evaluation in one pure module. It accepts a validated profile, current date, and validated local rule dataset, then returns one supported, unsupported, or stale-rules result. Views and routes render that result. They do not calculate tax or decide eligibility.

Store money as integer rupees. Validate untrusted input at the browser boundary. Keep statutory data typed, versioned, sourced, and separate from evaluation code. An expired or invalid dataset must stop calculation.

For changed tax behavior, run the repository compliance review plus `pnpm lint`, `pnpm typecheck`, and `pnpm build` before finishing.

For interface changes, run `pnpm lint`, `pnpm typecheck`, and `pnpm build`, then compare the affected states at desktop, 1024px, and mobile widths. Check keyboard focus and reduced motion when the changed component is interactive or animated.
