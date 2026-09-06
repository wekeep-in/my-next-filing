# Test framework options

Research date: 2026-09-06. This note compares current first-party documentation and published package manifests. It does not measure local coverage, test speed, or flakiness.

The smallest adequate change is **`node:test` with the existing `tsx`, plus Playwright Test for browsers**. Keep the current assertions and browser scenarios while replacing their execution machinery. **Vitest + Playwright Test** is the stronger Vite-integrated option if source coverage, editor tooling or inline browser component tests justify its extra dependency. Both choices are conventional; neither requires a jsdom stack by default.

## Options

| Option | Fit for this repository | Tradeoff and decision |
| --- | --- | --- |
| `node:test` + existing `tsx` + Playwright Test | Smallest dependency change for the existing `node:assert/strict` checks | Recommended minimum. Node already has named tests, hooks, mocks, reporters and process isolation; `tsx --test` discovers TypeScript tests. It does not supply Vite's component compilation environment. [Node test runner](https://nodejs.org/api/test.html), [tsx test support](https://tsx.is/node-enhancement) |
| Vitest Node + Playwright Test | Vite configuration reuse, integrated source coverage and browser contexts managed by the runner | Recommended Vite-oriented alternative. Vitest reads Vite configuration and supplies an official editor extension; Playwright supplies browser fixtures and server management. [Vitest setup](https://vitest.dev/guide/), [Playwright configuration](https://playwright.dev/docs/test-configuration) |
| Vitest Node + React Testing Library/jsdom + Playwright Test | Conventional for form state, validation, hook effects, and accessible DOM queries | Optional, not the default here. jsdom cannot calculate CSS geometry or render, so it cannot replace real-browser motion/layout checks. Install only if many component tests do not need browser APIs. [Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [jsdom limitations](https://github.com/jsdom/jsdom#unimplemented-parts-of-the-web-platform) |
| Vitest Node + Vitest Browser Mode + Playwright Test | Real-browser component tests with inline JSX and the same Vitest APIs as logic tests | Best alternative to hand-built component mount pages. It adds a browser project and packages, but no third runner. Keep Playwright Test for real URLs, reloads, history, downloads and multiple tabs. Browser Mode runs tests inside its own Vite-served environment. [Browser setup](https://vitest.dev/guide/browser/), [component testing](https://vitest.dev/guide/browser/component-testing.html) |

The assertion library is not the problem. `node:assert/strict` can remain during either runner migration. Split scenarios into named tests and parameterized cases first; replacing every assertion with `expect` can wait.

The repository audit verified this minimum path without changing files: `node --import tsx --test scripts/verify.ts scripts/verify-frontend.ts scripts/verify-salary.ts scripts/verify-gst-calendar.ts scripts/verify-resources.ts` passed all five files and reported five file-level tests. That proves runner compatibility for those scripts. It does not create named scenario results or per-case cleanup.

Node 26 also has test watch mode, code coverage and module mocking. Its current documentation marks watch and coverage experimental, and module mocking as early development. This is a stability distinction, not evidence those features produce wrong results. Vitest's practical gains here are reusing the actual Vite aliases/plugins, its integrated editor/browser workflow, and its V8 provider's AST-based source coverage remapping. A migration justified only by discovery, named tests, hooks or reports does not need Vitest. [Node feature status](https://nodejs.org/api/test.html#collecting-code-coverage), [Vitest integration](https://vitest.dev/guide/), [Vitest coverage remapping](https://vitest.dev/guide/coverage.html#v8-provider)

## Browser component testing has changed

Playwright 1.63 offers a built-in `mount` fixture in `@playwright/test`. It mounts a named story through a small gallery page served by the application's dev server. The gallery owns React rendering; the runner manages navigation, mounting and teardown. The former `@playwright/experimental-ct-*` packages have been removed. For this repository, adapting existing component scenarios to that gallery is worth comparing against Vitest Browser Mode before adding another component stack. Keep the gallery out of the production build. [Current component guide](https://playwright.dev/docs/test-components), [published 1.63 type declarations](https://github.com/microsoft/playwright/blob/v1.63.0/packages/playwright/types/test.d.ts)

Prefer normal per-test contexts for recovery and storage checks. The gallery documentation shows an optional `reuseContext: true` optimization; do not copy that setting into state-sensitive tests without checking isolation. [Gallery configuration](https://playwright.dev/docs/test-components#step-2-configure-playwright), [default isolation](https://playwright.dev/docs/browser-contexts)

For a Vitest Browser alternative, use `@vitest/browser-playwright`, `provider: playwright()` and a Chromium instance. Use `render` from `vitest-browser-react`, awaited locator actions, and `await expect.element(...)`. The renderer integrates cleanup and retrying queries. It replaces the need for jsdom, React Testing Library, user-event and jest-dom in those browser component files. [Browser configuration](https://vitest.dev/guide/browser/), [React renderer](https://github.com/vitest-community/vitest-browser-react)

Do not simulate geometry to migrate the existing real-browser motion checks into jsdom. Mocked dimensions would remove the behavior those checks are supposed to verify. jsdom explicitly leaves layout and rendering outside its implementation. [jsdom limitations](https://github.com/jsdom/jsdom#unimplemented-parts-of-the-web-platform)

## Reliability choices that matter more than runner branding

- Let Playwright's `webServer` start and stop Vite or the built preview. Use one fixed port with `--strictPort`, an explicit URL, and `reuseExistingServer: !process.env.CI`. Build once and run release journeys against preview. The dev server remains suitable for component mounting. [Web server configuration](https://playwright.dev/docs/test-webserver)
- Use the built-in `page` and `context` fixtures. Each test gets fresh local storage, session storage and cookies. For cross-tab workspace behavior, open two pages in the same context; use separate contexts to represent independent browsers. [Isolation](https://playwright.dev/docs/browser-contexts), [multiple pages](https://playwright.dev/docs/pages)
- Prefer role/label locators and retrying DOM assertions. Preserve explicit waits for behavior whose duration is itself under test, but replace ordinary readiness sleeps with observable conditions. [Locators](https://playwright.dev/docs/locators), [locator assertions](https://playwright.dev/docs/api/class-locatorassertions)
- Start with zero local retries and at most one CI retry for diagnosis. Record `trace: 'retain-on-failure'` if the original failure matters; `on-first-retry` records only the retry. Keep flaky outcomes visible rather than treating a retry as a repair. [Recording modes](https://playwright.dev/docs/test-use-options#recording-options), [trace viewer](https://playwright.dev/docs/trace-viewer-intro)
- Add `@axe-core/playwright` scans to important existing browser states. This catches common accessibility failures but does not replace keyboard/focus checks or manual accessibility assessment. [Accessibility testing](https://playwright.dev/docs/accessibility-testing)
- Consider `fast-check` later for bounded parser/serialization properties and arithmetic invariants independently justified by the existing spec. It generates cases, shrinks failures and supports seed-based replay. Keep exact money examples and threshold cases as the primary regression tests; avoid assuming that a whole tax result must be monotonic across every policy boundary. [Core concepts](https://fast-check.dev/docs/core-blocks/), [configuration](https://fast-check.dev/docs/configuration/)

## Compatibility checked

The local `package.json` declares React 19.2.8, Vite 8.2.2, TypeScript 7.0.2 and tsx 4.23.13. `node --version` reports 26.7.0. The following latest-release manifests were fetched from the npm registry on the research date. These are compatibility declarations, not a successful installation or proof that every plugin works together.

| Package | Current release | Relevant declared compatibility |
| --- | --- | --- |
| [vitest](https://registry.npmjs.org/vitest/5.0.0) | 5.0.0 | Vite `^6.4.0 || ^7.0.0 || ^8.0.0`; Node `^22.12.0 || ^24.0.0 || >=26.0.0` |
| [@vitest/browser-playwright](https://registry.npmjs.org/@vitest%2fbrowser-playwright/5.0.0) | 5.0.0 | Vitest exactly 5.0.0; Playwright peer |
| [vitest-browser-react](https://registry.npmjs.org/vitest-browser-react/2.3.0) | 2.3.0 | React/React DOM 18 or 19; Vitest 4 or 5 |
| [@testing-library/react](https://registry.npmjs.org/@testing-library%2freact/16.3.3) | 16.3.3 | React/React DOM 18 or 19; `@testing-library/dom` 10 peer |
| [jsdom](https://registry.npmjs.org/jsdom/30.0.1) | 30.0.1 | Node `^22.22.2 || ^24.15.0 || >=26.0.0` |
| [@playwright/test](https://registry.npmjs.org/@playwright%2ftest/1.63.0) | 1.63.0 | Node `>=20`; depends on matching Playwright 1.63.0 |

The current Vitest documentation is for version 5. Old indexed excerpts still describe version 4 with lower Node requirements. Match the documentation to the version selected. [Vitest requirements](https://vitest.dev/guide/)

Before implementation, check a clean pnpm install, TypeScript 7 typechecking, Vite/plugin configuration, and browser binaries on the actual CI image. Playwright's installation guide lists current supported Node branches and operating systems separately from its broad npm engine declaration. No framework packages were installed for this research. [Playwright requirements](https://playwright.dev/docs/intro#system-requirements)

## Migration order

1. Add Playwright Test and wire the existing browser scenarios into an explicit script and CI. Replace machine-specific browser imports, manual launch/cleanup, and repeated server startup with the runner's configuration. Preserve every existing browser assertion.
2. Convert the top-level assertion scripts into named `node:test` cases under `tsx --test`, grouped by behavior. Choose Vitest instead at this step if its Vite/coverage/component workflow is wanted. Preserve input fixtures, expected money values, malformed-input cases and expiry cases. Keep file/build validation as explicit release checks where that remains clearer.
3. Standardize the two mounted component suites using Playwright's gallery fixture if adapting their existing setup is small. Choose Vitest Browser Mode instead if it removes substantially more mount code or React component coverage is about to grow. Do not install both component approaches by default.
4. Record branch coverage for the logic suite and inspect the mapping back to TypeScript before setting focused thresholds. With Vitest, use the matching `@vitest/coverage-v8` package. Retain typechecking and production-build checks as separate checks. [Vitest coverage](https://vitest.dev/guide/coverage.html)
5. Add focused accessibility scans and parser properties only after the current scenarios run reliably in CI.

Jest would add ESM/transform configuration without a clear benefit for a Vite application; its current ESM guide still marks that path experimental. Cypress is capable, but brings a new command model and requires a plugin for multiple tabs. Neither is my choice for this migration. [Jest ESM](https://jestjs.io/docs/ecmascript-modules), [Cypress tradeoffs](https://docs.cypress.io/app/references/trade-offs#multiple-browsers-open-at-the-same-time)
