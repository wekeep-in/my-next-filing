# Build the application shell and route frame

Status: ready
Blocked by: none

## Outcome

A user can open the landing page, start the Focused flow, visit every public route directly, and reach a clear not-found page. The application matches the resolved visual direction without containing tax logic.

## Work

- Configure Tailwind CSS and shadcn Base UI for the existing Vite application.
- Add only the official shadcn items needed by this slice. Do not add all components.
- Add the Substack color tokens, `#111111` ink, minor-third type tokens, focus styles, motion rules, and 320-pixel responsive base.
- Configure React Router for `/`, `/check`, `/plan`, `/methodology`, `/sources`, `/disclaimer`, `/privacy`, and unmatched routes.
- Implement the landing page and shared Focused-flow frame. Keep unfinished route content honest and non-interactive.
- Keep Profile values out of routes, query strings, hashes, titles, and logs.

## Acceptance evidence

- Direct browser entry loads every declared route.
- An unmatched path renders the not-found state and a working link home.
- The landing action reaches `/check`; no control implies that calculation already works.
- Keyboard focus is visible and the shell works at 320 CSS pixels.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.

## Authority

- [Implementation specification](../spec.md)
- [`SPEC.md` route, design, motion, and accessibility decisions](../../../SPEC.md)
