# Verify the static delivery and competition constraints

Type: research
Status: resolved
Blocked by: none

## Question

Against current official Cloudflare and Build What Moves India sources, what exact facts must the implementation plan honor for a React and Vite single-page application on Workers Static Assets and Workers Builds, SPA fallback, preview and production domains, production-only Analytics configuration, and competition submission? Record any mismatch with `SPEC.md` and the release checks needed to catch it.

## Answer

Use a static-only Worker with SPA fallback, explicit public preview URLs, a root Custom Domain plus a separate `www` redirect, and production-trigger-only Analytics variables. The material `SPEC.md` omission is the competition submission bundle and its 10:00 PM IST deadline on 29 August 2026. Full findings and release checks: [Delivery and competition constraints](../research/delivery-and-competition-constraints.md).
