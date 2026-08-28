# Choose the test mix and release evidence

Type: grilling
Status: resolved
Blocked by: 01, 02, 03, 04, 05, 10, 11

## Question

Given the resolved rule facts, delivery constraints, privacy posture, interface, and module organization, what is the minimum test mix and release checklist that proves the three agreed seams, the independent statutory values, the full example journey, critical stop states, storage failures, accessibility basics, supported browsers, performance target, source validation, and static production build? Decide which checks run in continuous integration and which remain explicit manual release checks.

## Answer

Add only `vitest` and `@playwright/test` as test dependencies. Do not add React Testing Library, jsdom, an accessibility package, a visual-snapshot tool, or a coverage package.

Keep automated tests in three files aligned with the agreed seams:

```text
src/evaluation/evaluate.test.ts
src/rules/validate.test.ts
e2e/journey.spec.ts
```

`evaluate.test.ts` proves the independent statutory literals, Profile eligibility, credits and refund, rounding, Obligations, India Standard Time statuses, and GST states through Evaluation. `validate.test.ts` proves the current Rule dataset and every explicit validation error through Rule validation. `journey.spec.ts` has six focused Chromium cases: the fictional example, an unsupported and editable Profile, stale Rules through browser clock control, saved Profile restoration, corrupt saved data, and unavailable browser storage. Use keyboard interaction in the unsupported case to cover labels, errors, focus, and operation without a pointer.

Use no coverage percentage, snapshots, internal mocks, private-function tests, or call-order assertions. Expected statutory values are independent literals with source context. Build behavior one vertical slice at a time with one red test, the minimum green implementation, then review structure.

Every merge runs, in order:

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm test:e2e`
5. `pnpm build`

`pnpm build` runs Rule validation, TypeScript, and the Vite production build. Playwright runs Chromium with zero retries and retains traces or screenshots only on failure.

Keep these as explicit manual production-release gates: statutory and tutorial re-review; Rule expiry; qualified privacy approval; preview Analytics absence; production consent and network behavior; Cloudflare direct routes, HTTPS, canonical domain, and `www` redirect; mobile Lighthouse score of at least 90; current and previous desktop browsers; physical Chrome on Android and Safari on iOS; keyboard, focus, reduced motion, 320-pixel layout, and touch behavior; and external-link privacy and no-prefetch checks.

Check in one reusable `docs/release-checklist.md` template. Complete it in the production release pull request and link CI results, Lighthouse output, browser checks, source review, privacy approval, and Analytics network evidence. Do not commit generated reports, screenshots, traces, or videos.
