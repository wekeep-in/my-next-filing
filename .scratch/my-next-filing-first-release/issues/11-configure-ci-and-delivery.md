# Configure merge checks and static delivery

Status: blocked
Blocked by: 09, 10

## Outcome

Every merge proves formatting, lint, type checking, Rule validation, and production build behavior. The repository contains the static Cloudflare configuration needed for preview and production deployment without Worker code.

## Work

- Add the `rules:validate` script.
- Make `pnpm build` run Rule validation, TypeScript, and Vite.
- Configure merge checks in this order: format, lint, type checking, Rule validation, build.
- Add `wrangler.jsonc` for static `dist`, SPA fallback, preview URLs, no Worker entry point, no assets binding, and the root custom-domain route.
- Keep production and preview Analytics variables separate; preview has no measurement ID.
- Add `docs/release-checklist.md` from the approved manual-gate list.
- Add the native CI workflow only after the public repository host is selected; do not add a second CI system.

## Build evidence

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm rules:validate`, and `pnpm build` pass from a clean checkout.
- Direct requests to every route work under the local static preview.
- An unmatched path renders the client not-found state under SPA fallback.
- The uploaded asset configuration contains no Worker script, binding, data store, or secret.
- The preview bundle contains no Analytics measurement ID.
- Generated Lighthouse output is ignored rather than committed.

## Authority

- [Implementation specification](../spec.md)
- [`SPEC.md` mechanical checks, static delivery, performance, and repository decisions](../../../SPEC.md)
- [Delivery research](../../my-next-filing-implementation/research/delivery-and-competition-constraints.md)
