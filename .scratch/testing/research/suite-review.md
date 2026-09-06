# Test suite review

This audit predates the migration. See [migration verification](../verification.md) for the implemented setup. Inventory links now point to the migrated tests.

Reviewed on 6 September 2026 against working tree HEAD `6fbf45c`, including the uncommitted Resources implementation. This is an analysis and migration recommendation. Application code, tests, dependencies and release commands were not changed.

Recommend `node:test` with the existing `tsx` for logic tests, Playwright Test for browser tests, and Lighthouse CI for repeatable performance audits. Vitest is the stronger alternative to `node:test` if Vite configuration reuse and integrated source coverage are priorities. Choose one logic runner. The [framework research](framework-options.md) records current official documentation, compatibility declarations and configuration details.

The existing assertions contain useful regression knowledge. Preserve their expected values and failure scenarios. The main improvement is to make every scenario discoverable, isolated and repeatable under a standard runner.

## Complete repository inventory

There are 13 files and 4,300 lines under `scripts`: five command-line assertion files, five manual browser files, two release validators and one storage helper. Line counts describe the inventory, not coverage or the number of test cases.

| File | Lines | What it exercises | Recommended home |
| --- | ---: | --- | --- |
| [verify.ts](../../../tests/unit/evaluation.test.ts) | 770 | Profile parsing, both income paths, selected money boundaries, rule rejection and independent expiry, workspace writes/conflicts/deletion, Completion matching | Named logic tests, retaining independently specified expected values |
| [verify-frontend.ts](../../../tests/unit/frontend.test.ts) | 1,139 | Money editing helpers, India dates, questionnaire assessment/reducer, route identities, Recovery parsing/storage failures, legacy deletion, Plan models, payments, ordered deletion | Logic tests grouped by module behavior; most of this file does not render UI |
| [verify-salary.ts](../../../tests/unit/salary.test.ts) | 349 | Salary calculation boundaries, unsupported facts, malformed amounts, stale/missing rules, questionnaire clearing and schema migrations | Named, table-driven logic tests |
| [verify-gst-calendar.ts](../../../tests/unit/gst-calendar.test.ts) | 514 | Monthly/quarterly periods, state groups, LUT, incomplete and stale areas, Completion limits, migrations; one static React markup assertion | Logic tests; retain the specific rendering assertion or move it to a browser test |
| [verify-resources.ts](../../../tests/unit/resources.test.ts) | 363 | Catalogue validation, search ranking/aliases, protected identifiers, typo suggestions, period matching, facet counts, source exclusion and review warnings | Named search/catalogue tests |
| [verify-questionnaire.ts](../../../tests/e2e/questionnaire.spec.ts) | 140 | Amount input behavior, warnings, progression, fictional/personal separation and Back/Forward | Playwright app journeys with synthetic setup |
| [verify-journey-menu.ts](../../../tests/e2e/journey-menu.spec.ts) | 177 | Responsive navigation geometry, touch targets, keyboard focus, Escape, disabled navigation | Playwright browser/viewport projects |
| [verify-motion.tsx](../../../tests/browser/motion.test.tsx) | 111 | AutoSize geometry, animation interruption, content removal, clipping, keyboard/width changes and reduced motion | Real-browser component tests |
| [verify-recovery.tsx](../../../tests/browser/recovery.test.tsx) | 343 | Mounted lifecycle ordering, paused writes, commit cleanup, deletion, partial/unverified removal, retry and stale Effects | Real-browser component tests plus critical built-app journeys |
| [verify-resources-browser.tsx](../../../tests/e2e/resources.spec.ts) | 301 | Resources search UI, app-state preservation, history, failed writes and rejected lazy imports | Independent Playwright app scenarios with runner-owned setup |
| [validate-rules.ts](../../../scripts/validate-rules.ts) | 8 | Current local Rule dataset validation | Keep as an explicit release validator |
| [verify-build.ts](../../../scripts/verify-build.ts) | 54 | Generated-asset marker scan and required static-header text | Keep as an explicit artifact check; supplement with browser/deployed-preview checks |
| [test-storage.ts](../../../tests/helpers/storage.ts) | 31 | Configurable in-memory Storage failure double | Reuse in logic/component tests; it is a helper, not a test |

`pnpm test` invokes only the first five assertion files. `verify:release` includes those files and the two validators. None of the five browser functions are invoked by those commands. No checked-in GitHub Actions, GitLab CI, CircleCI, Azure Pipelines or Jenkins configuration was found. External CI configuration was not inspected.

## Verified execution

`pnpm verify:release` passed formatting, lint, strict TypeScript, Rule validation, all five assertion scripts, the production build and generated-asset/header checks. Vite emitted its existing large-chunk advisory.

The following also passed without installing or changing anything:

```sh
node --import tsx --test scripts/verify.ts scripts/verify-frontend.ts scripts/verify-salary.ts scripts/verify-gst-calendar.ts scripts/verify-resources.ts
```

Node reported five passing file-level tests and zero named suites. This proves that the existing TypeScript/JSX imports work under this runner. It does not yet provide individual scenario results, setup or cleanup. Browser scripts were inspected, not rerun in this review. Historical browser/accessibility/performance evidence is recorded in the repository, but it is not a new run against this worktree.

## Changes that would improve reliability

1. **Automate the existing browser scenarios.** Their headers require console imports on a running development server. Some need a pre-seeded draft, selected route or manually blocked request. The Resources failure test depends on state from the preceding test. Put setup and request failure injection in each Playwright test. Run full application journeys against the production build, and component scenarios against their test-only development page.

2. **Replace readiness sleeps with observable outcomes.** Every browser file defines a fixed wait, ranging from 40 to 200 milliseconds. Inputs use prototype setters and manually dispatched events; journeys sometimes call the router directly. Use role/label locators, browser-driven typing/clicks and retrying assertions. Keep direct browser evaluation for storage inspection and animation geometry where it is the behavior under test. Do not make an animation test pass by disabling the animation. [Playwright waiting behavior](https://playwright.dev/docs/actionability)

3. **Name scenarios and isolate mutable setup.** The shell `&&` chain stops after the first failing file, and each top-level file stops at its first failed assertion. Long storage sequences share mutable flags and values. Use named cases, fresh stores and parameterized boundary rows. Keep one coherent multi-step scenario together; do not turn every assertion into its own test. `node:test` already supplies names, hooks and reporters. [Node runner](https://nodejs.org/api/test.html)

4. **Control dates consistently.** The files declare September 2026 test dates, but several workspace calls in `verify.ts` and `verify-frontend.ts` omit the optional `now` argument. Those functions use the real clock; lifecycle code also calls `new Date()`. Pass dates at existing boundaries or set the test clock. Keep current-date release Rule validation separate so deterministic tests do not hide stale shipped data.

5. **Keep actual historical migration inputs.** Salary/GST tests construct older schemas by deleting properties from today's Profile and Draft fixtures. Those checks are useful, but their inputs change with production fixtures. Add small frozen synthetic envelopes for each real supported prior schema and verify migration, unchanged source bytes, repeat loading and failed replacement writes. Do not invent future schemas or a second tax calculator.

6. **Retain fault injection and add real browser storage behavior.** `TestStorage` covers quota, denied reads and uncertain removals well. `verify.ts` also defines four overlapping storage classes. Consolidate only where behavior matches; preserve its silent-removal-failure scenario. Use two pages in one browser context for shared-workspace conflicts and storage events, and independent contexts for unrelated users. A Map-backed double cannot exercise those browser events. [Browser contexts](https://playwright.dev/docs/browser-contexts)

7. **Make evidence repeatable.** Axe, responsive checks, network inspection and Lighthouse results appear in verification notes and temporary scripts rather than one checked-in command. Add focused axe scans to existing browser states and retain reports/traces as CI artifacts. Keep manual keyboard, assistive-technology and actual Safari/iOS checks required by the specification. Playwright's WebKit is not the branded Safari browser. [Accessibility checks](https://playwright.dev/docs/accessibility-testing), [browser support](https://playwright.dev/docs/browsers)

8. **Measure coverage without treating it as correctness.** No coverage configuration or report exists in the repository. Establish a branch-coverage baseline for evaluation, rules, workspace, Recovery, questionnaire and search before proposing thresholds. Include unimported source files. Preserve direct expected-value examples; a percentage cannot establish that a money calculation is correct. Vitest's official coverage provider is a reason to choose it if this workflow becomes central. [Vitest coverage](https://vitest.dev/guide/coverage.html)

The bundle scan remains useful, but matching strings in `dist` cannot establish whether a request executes or whether deployed headers are enforced. Keep it and add production-browser network observations and deployed-header checks at the existing release boundary.

## Lighthouse scripts

The Resources verification note points to temporary artifacts. The actual script at `/tmp/mnf-resources-lighthouse.mjs` imports Playwright and Lighthouse from `/tmp/playlist-sorter-browser/node_modules`, hardcodes a Chrome binary under one user's cache, reserves a debugging port, manually launches/closes Chrome, audits one fixed Resources URL, writes JSON and prints scores plus LCP/CLS. It does not repeat measurements or fail on a score below the product target.

The installed temporary packages are Lighthouse 13.4.1 and Playwright 1.62.1. No new Lighthouse score was measured for this review.

Use Lighthouse CI's configuration-driven collection, assertions and filesystem reports. For this static SPA, configure `staticDistDir: 'dist'`, SPA fallback and explicit routes. Specify three runs and median performance aggregation; the default assertion aggregation is optimistic. Use the existing Performance 90 and Accessibility 100 targets, retain the reports, and run serially on a consistent Chrome/CI image. The [framework note](framework-options.md) gives the configuration and version caveats. [LHCI configuration](https://googlechrome.github.io/lighthouse-ci/docs/configuration.html), [consistent collection](https://googlechrome.github.io/lighthouse-ci/docs/getting-started.html)

Start with public landing, questionnaire entry and Resources. A bare `/plan` URL does not measure a restored workspace. That needs a synthetic workspace setup and confirmation that the expected page loaded. A list of URLs also cannot cover every transient questionnaire state. Keep those distinct from ordinary navigation audits.

Pin tool and browser versions and establish a migration baseline. The currently published Lighthouse CI version bundles an older Lighthouse major than the temporary script. Scores across those versions are not a valid before/after comparison. Local static serving also does not exercise Cloudflare's deployed headers and network behavior.

## Recommended order

1. Add Playwright and make the five existing browser suites repeatable. Prioritize Recovery/deletion, real two-tab conflicts, questionnaire history and Resources state/privacy. Preserve the motion cases in a real browser.
2. Add Lighthouse CI and a performance command usable both on demand and in CI. Reuse the production build, retain reports on assertion failure, and run measurements without concurrent browser/build workloads.
3. Introduce named logic tests using `node:test` and the existing `tsx`. Choose Vitest instead if its Vite integration and coverage workflow justify the dependency; do not operate both logic runners.
4. Fix shared setup/date dependencies, freeze real migration envelopes and add a focused coverage baseline. Keep one release entry point, with each class of check run once.

Playwright's current component fixture can use a small test-only gallery for the two mounted suites. Vitest Browser Mode is an alternative if inline JSX tests remove more setup. jsdom is not a replacement for the real layout and Web Animations behavior already tested here. No Storybook server, application backend, generic page-object framework or broad snapshot suite is needed. [Playwright components](https://playwright.dev/docs/test-components), [jsdom limitations](https://github.com/jsdom/jsdom#unimplemented-parts-of-the-web-platform)
