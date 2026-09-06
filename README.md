# My Next Filing

I built this after too many compliance reminders gave me noise instead of a clear next step. My Next Filing is a static website for supported resident-individual solo freelancers in India.

It calculates a best-effort tax estimate locally, shows supported dated actions, and can save a validated Profile plus user-declared Completion records in the current browser after explicit consent. It does not file, pay, send reminders, connect to government systems, or replace a tax professional.

## Current state

The application includes a branched questionnaire, versioned local Rules, an income-tax estimate, advance-tax and annual-return agenda, GST registration-threshold monitor, optional current-browser saving, and the fictional example in `SPEC.md`. Saved data is revalidated and re-evaluated on restore; drafts and calculated results are never saved.

It supports only Tax Year 2026-27 and the first successor Profile. Unsupported facts and expired or invalid Rules stop calculation rather than provide an estimate.

## Local commands

```sh
pnpm install
pnpm dev
pnpm build
pnpm format:check
pnpm lint
pnpm test
pnpm typecheck
pnpm rules:validate
pnpm verify:release
```

## Tests

Use the Node version in `.node-version` and install browser binaries and their operating-system dependencies once:

```sh
pnpm exec playwright install --with-deps chromium firefox webkit
```

On Linux, installing system libraries requires sudo. Browser binaries belong to Playwright's versioned cache; the configuration has no machine-specific executable path.

| Command | Checks |
| --- | --- |
| `pnpm test` | Named Vitest logic cases and real Chromium component/lifecycle tests |
| `pnpm test:unit` | Logic tests only |
| `pnpm test:browser` | Vitest Browser Mode only |
| `pnpm test:watch` | Vitest watch mode |
| `pnpm test:coverage` | Logic/component tests with source coverage under `artifacts/coverage` |
| `pnpm test:e2e` | Build once, then run production journeys in Chromium, Firefox and WebKit |
| `pnpm test:performance` | Build once, then run Lighthouse CI against the static SPA |
| `pnpm verify:release` | Formatting, lint, types, current Rule validation, Vitest, build, artifact checks and all Playwright projects |

Tests live under `tests/unit`, `tests/browser` and `tests/e2e`. Synthetic fixtures and controlled clocks keep tests repeatable. The separate `rules:validate` release check uses the current date. The old browser-console verification scripts have been migrated; no manual console import or external temporary dependency is needed.

Vitest Browser Mode uses the existing Vite configuration and `vitest-browser-react` for rendering and cleanup. Playwright owns isolated contexts, real history/reload journeys and failure traces against `dist`. To debug a component visually, run `pnpm exec vitest --project browser --browser.headless=false`.

Lighthouse CI audits the landing, questionnaire entry and Resources three times each, requiring median mobile Performance of at least 90 and Accessibility of 100 in every run. It uses the installed Playwright Chromium executable and writes HTML/JSON locally to `artifacts/lighthouse`. The performance command explicitly allocates a native Chrome profile under gitignored `artifacts/lighthouse/.profiles` and removes it even when an audit fails. This avoids Chrome Launcher's Windows-path conversion on WSL. Use `node scripts/lighthouse.ts` to audit an existing build with the same cleanup. Run performance collection without concurrent builds or browser tests. Lighthouse CI currently bundles Lighthouse 12.6.1; establish a fresh baseline when comparing with the former Lighthouse 13.4.1 temporary script. These navigation audits do not measure restored workspace or transient questionnaire states.

Verification runs locally. Use `pnpm test:coverage` when collecting coverage and `pnpm test:performance` for performance audits. Reports contain synthetic test data only. Real Safari/iOS, assistive-technology, deployed-header and other manual release checks in `SPEC.md` still apply.

## Deployment

`pnpm build` creates static `dist` assets. `wrangler.jsonc` configures Cloudflare Workers Static Assets with single-page-application fallback and the canonical custom domain. HTTPS is a production release check; it is not implemented by application code.

The deployment remains static-only through Cloudflare Workers Static Assets with SPA fallback. No Analytics, product events, session replay, remote error reporting, or remotely executed third-party script is part of the application.

## Sources and limits

The [successor specification](SPEC.md) defines the supported profile, statutory source policy, and product limits. Statutory values and sources live in `src/rules`; `pnpm rules:validate` and `pnpm verify:release` check them locally, and they expire on 31 August 2027. Tutorials remain separate from statutory authority and none are approved as a primary Tax Year 2026-27 action link.

This project gives general information, not tax, accounting, or legal advice. Public launch still requires the statutory, qualified privacy, accessibility, target-user, and Cloudflare release gates described in `SPEC.md`.

Contributors using Claude Code or Codex should install [Matt Pocock's skills](https://github.com/mattpocock/skills).

## License

[Apache License 2.0](LICENSE).
