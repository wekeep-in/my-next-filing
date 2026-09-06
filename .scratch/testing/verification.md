# Testing migration verification

Verified locally on 6 September 2026. No application behavior, statutory data or expected tax amounts changed in this migration. The pre-existing `src/styles.css` edit was preserved. No commit or deployment was performed.

## Implemented

- Vitest 5 with separate Node and real Chromium Browser Mode projects, using the existing Vite plugins and aliases.
- Named test discovery, a controlled September 2026 clock, React rendering and cleanup through `vitest-browser-react`, JUnit reports and optional V8 source coverage.
- Playwright Test 1.63 against the production build, with Chromium, Firefox and WebKit projects, two workers, zero retries, and retained failure traces/screenshots. Exclusive tests are rejected by both runners.
- Lighthouse CI with three mobile runs per public URL, median Performance at least 90 and worst-run Accessibility 100. Reports remain local and ignored by git.
- A repository [test-conventions skill](../../.agents/skills/test-conventions/SKILL.md), required by `AGENTS.md` before test creation, edits, deletion or flake repair. It covers appropriate boundaries, fixtures, historical schema contracts, cleanup, repeated verification of flakes, and retirement of obsolete coverage.
- Local commands and browser prerequisites in [README.md](../../README.md#tests). The proposed GitHub workflow was removed at the user's request.

## Suite mapping

| Previous script | Current tests |
| --- | --- |
| `verify.ts` | [evaluation](../../tests/unit/evaluation.test.ts), 20 cases |
| `verify-frontend.ts` | [frontend models and storage](../../tests/unit/frontend.test.ts), 16 cases |
| `verify-salary.ts` | [salary](../../tests/unit/salary.test.ts), 9 cases |
| `verify-gst-calendar.ts` | [GST calendar](../../tests/unit/gst-calendar.test.ts), 7 cases |
| `verify-resources.ts` | [resource catalogue/search](../../tests/unit/resources.test.ts), 14 cases |
| `verify-recovery.tsx` | [Recovery lifecycle](../../tests/browser/recovery.test.tsx), 7 isolated cases |
| `verify-motion.tsx` | [motion](../../tests/browser/motion.test.tsx), 2 cases |
| `verify-questionnaire.ts` | [questionnaire journey](../../tests/e2e/questionnaire.spec.ts), 1 scenario per browser |
| `verify-journey-menu.ts` | [journey menu](../../tests/e2e/journey-menu.spec.ts), 4 viewport cases per browser |
| `verify-resources-browser.tsx` | [Resources journeys](../../tests/e2e/resources.spec.ts), 5 scenarios per browser |
| `test-storage.ts` | [shared Storage double](../../tests/helpers/storage.ts) |
| Temporary Lighthouse script | [Lighthouse command](../../scripts/lighthouse.ts), [configuration](../../lighthouserc.cjs), and [3 cleanup regressions](../../tests/unit/lighthouse.test.ts) |

The original standalone assertion and console-import scripts were removed after migration. Rule validation and generated-bundle/header validation remain explicit release validators. All 524 strict assertion call sites from the five original logic scripts were retained; two additional fixture checks were needed when separating their scenarios.

Browser journeys now use actual controls and history. Resources round trips use the Plan link so a fictional session stays fictional. The lazy-load failure case aborts an unvisited production Plan chunk; it exercises the same shared screen loader while retaining unsaved answers. Tooltip checks account for pointer hover opening the tooltip before a click and retain the original click-toggle assertions.

## Results

`pnpm verify:release` passed on the final local setup:

- Formatting, lint, strict TypeScript and current-date Rule validation.
- 78 Vitest cases: 69 Node and 9 Browser Mode.
- Production build and generated-asset/static-header checks.
- 30 Playwright runs: 10 scenarios across each of Chromium, Firefox and WebKit.

The build retains its existing large-chunk advisory. No browser test was skipped or retried to get this result.

`pnpm test:coverage` also passed. Application-source coverage from Vitest was 58.48% lines and 57.09% branches, including unimported source files. Evaluation line coverage was 92.88%; Recovery lifecycle 90.09%; resource search 99.25%. Playwright end-to-end execution is not included in those percentages. The reports establish a baseline, not an assertion of complete behavior coverage.

Playwright's browser binaries were installed in the versioned cache. This WSL account cannot install system packages through sudo. To finish local WebKit verification, the missing official distro libraries were downloaded and added to WebKit's own versioned library directory without replacing existing files or changing system packages. On a fresh Linux environment, use the documented `playwright install --with-deps` prerequisite.

## WSL cleanup correction

The first Lighthouse run created nine literal `C:\Users\PC\AppData\Local\lighthouse.*` directories in the repository. Chrome Launcher classified WSL as a Windows Chrome environment and converted its profile path, even though the configured executable was Linux Chromium. Linux Chromium interpreted the Windows-looking argument as a relative directory name.

`scripts/lighthouse.ts` now allocates an absolute native profile under gitignored `artifacts/lighthouse/.profiles`, explicitly supplies that path to Chrome and removes its owned directory in `finally`. Child exit status is preserved. Success, nonzero exit and launch failure have regression checks. The nine confirmed generated directories were removed.

A real nine-audit rerun completed with no Windows-style directories and no temporary Chrome profiles remaining. The failed performance assertions still returned exit code 1, and the HTML/JSON reports remained available. An uncatchable process termination can leave only ignored artifacts, not root-level Windows filenames.

## Lighthouse baseline

The final run used Lighthouse 12.6.1 and Playwright's Linux Chromium. All three runs were retained for each page:

| URL | Performance scores | Median | Accessibility |
| --- | --- | ---: | ---: |
| `/` | 74, 74, 74 | 74 | 100 each |
| `/check/tax-year` | 81, 82, 82 | 82 | 100 each |
| `/resources` | 89, 88, 89 | 89 | 100 each |

All three performance medians fail the unchanged 90-point budget. The static audit server uses response compression. These scores are a new tool-version baseline and should not be compared directly with the earlier Lighthouse 13.4.1 temporary-script scores. Performance optimization was not part of this testing migration.

The ordinary release command covers functional verification. Run the separate performance command when collecting Lighthouse evidence. These public navigation audits do not establish restored-workspace performance, all transient questionnaire states, actual Safari/iOS behavior, assistive-technology acceptance, qualified statutory/privacy review or deployed Cloudflare behavior.

Reports are under `artifacts/vitest`, `artifacts/coverage`, `artifacts/playwright` and `artifacts/lighthouse`. They are synthetic local verification artifacts and are ignored by git.
