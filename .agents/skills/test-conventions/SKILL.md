---
name: test-conventions
description: Apply My Next Filing's conventions when creating, editing, deleting, or repairing flaky tests, fixtures, test configuration, and performance checks.
---

# Test conventions

Read the relevant `SPEC.md` behavior and the existing tests before changing coverage. Read `DESIGN.md` for layout, focus, or motion expectations. Use the repository's code conventions for TypeScript. Current commands and prerequisites live in [README.md](../../../README.md#tests); inspect `package.json` and the runner configuration rather than inventing a new command. Verification is local; adding hosted workflows requires a user request.

## Choose the boundary

| Behavior being checked | Where it belongs |
| --- | --- |
| Evaluation, parsing, reducers, dates, persistence envelopes, search | Vitest Node under `tests/unit` |
| React Effects, controls, focus, geometry, ResizeObserver, Web Animations | Vitest Browser Mode under `tests/browser` |
| Actual app initialization, reload, history, multiple tabs, route-load failures | Playwright against the production build under `tests/e2e` |
| Lighthouse scores and performance reports | Lighthouse CI through `scripts/lighthouse.ts` |

Use the smallest boundary that exercises the real failure. A model assertion does not establish that the rendered control, storage event, or deleted draft behaves correctly. Cover integration contracts in browser tests without repeating every arithmetic case there. Keep Rule freshness and generated-asset checks as explicit release validators.

## Write maintainable cases

- Name independently diagnosable scenarios by their trigger and expected outcome. Put behavior assertions inside named tests. Use table-driven cases for independent boundaries; keep a sequence together when the sequence is the behavior being verified.
- Reuse existing helpers and the Vitest React renderer. Create fresh mutable stores and sessions for each case. Shared constants must remain unchanged. Use narrow failure doubles for denied reads, quota errors and uncertain removal; verify native cross-tab behavior with pages in the same Playwright context.
- Use synthetic data. Expected money values must come from independently checked examples, not a second call to the implementation. Use [compliance-review](../compliance-review/SKILL.md) when changing statutory expectations. Preserve real historical schema inputs while those versions remain supported; synthesizing an old schema from today's fixture is not sufficient evidence of backward compatibility.
- Control dates through existing explicit arguments or test clocks. Keep current-date Rule validation outside the frozen test clock. Assert observable storage, state, UI and calculation outcomes rather than private function call counts, except where ordering or write suppression is the contract.
- Prefer accessible role/label locators and retrying assertions. Let `vitest-browser-react` own mounting, cleanup and React updates. Use real geometry and animation APIs for motion tests, preserving the animation under test. Avoid broad snapshots and per-component fixture scaffolding.
- Test names, logs, traces and reports must contain only synthetic inputs. Runtime privacy checks should observe actual URL, storage and network behavior, not just a matching string in source code.

## Own cleanup

Each test or command owns the state and resources it creates. Restore mocks, clocks, prototype changes and DOM modifications; close owned contexts and servers. Use `finally` or runner teardown so assertion failures also clean up.

Use the runner's workers for parallel cases. Concurrent CLI invocations need separate output directories; otherwise one invocation can delete another's reports during startup or teardown.

Allocate temporary files in native temporary storage or a gitignored artifact directory. Remove the exact per-run directory on normal and failed completion, including launch failure. Preserve intended reports separately. Interrupted leftovers must remain inside ignored storage. Never sweep unrelated browser data or another test's files.

Use the shared Lighthouse command, which supplies a native profile path and removes it after the audit. On WSL, a Linux Chromium executable must receive a Linux path; Chrome Launcher's automatic Windows profile conversion can otherwise create literal `C:\...` directories in the repository. Validate cleanup after the real command exits, including a failing audit. A broad ignore pattern for accidental root directories is not a cleanup fix.

## Fix flakes

1. Reproduce the exact failing scenario with retries disabled. Retain its failure trace and identify the relevant browser, viewport, clock and state. Reduce a hard-to-reproduce case until the failure can be distinguished from unrelated setup problems.
2. Find the cause: shared state, incomplete teardown, a render/storage race, font/layout readiness, or an uncontrolled dependency. Replace readiness delays with the observable condition. Preserve deliberate Effect-ordering and animation assertions while fixing their setup.
3. Repeat the focused case under the conditions that exposed the failure, then run its containing suite with normal concurrency. Vitest supports `--repeats` and `--retry=0`; Playwright supports `--repeat-each` and `--retries=0`. Choose a bounded batch based on the observed failure rate. Passing once or only with retries is not evidence of a fix.
4. Report the cause, correction and repeated-run result. Keep unexpected failures visible. Increasing timeouts, weakening assertions, skipping a case or lowering a performance budget requires evidence that the expectation itself was wrong; these are not substitutes for fixing a race.

## Retire obsolete tests

Before deleting a test, identify the contract it protects and why it no longer applies. Trace callers and read the authorized behavior change. A failing test, a refactor, or a difficult setup alone does not make the contract obsolete.

- If behavior moved, move or rewrite the assertion at the new public boundary. If another test now fully covers it, retain the stronger case and explain the duplication removed.
- If behavior was intentionally removed or superseded, delete the obsolete case and update current documentation. Keep regression coverage for supported old storage schemas, deletion, privacy and statutory boundaries for as long as those contracts remain reachable.
- Remove newly unused fixtures, helpers, mocks, snapshots, configuration entries and dependencies after checking their remaining references with `rg`. Remove empty test projects instead of leaving a permanently skipped suite. Preserve useful historical verification records, marking superseded instructions when needed.
- Verify the remaining suite still discovers and exercises the supported behavior. Do not replace deleted coverage with a vacuous assertion or an unconditional skip.

## Finish

Run the affected named cases and their containing suite. Run the release command for runner changes, shared setup changes or a broad migration. Collect coverage when it helps locate a gap; percentages complement explicit behavior assertions and do not establish calculation correctness. Run performance audits without competing builds or browser tests and retain failed reports with the unchanged budget.

Report the tests run, any retired coverage and its reason, remaining failures, and artifact locations. Distinguish a functioning test command from an application that meets its performance or release targets.
