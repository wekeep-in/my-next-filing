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

## Deployment

`pnpm build` creates static `dist` assets. `wrangler.jsonc` configures Cloudflare Workers Static Assets with single-page-application fallback and the canonical custom domain. HTTPS is a production release check; it is not implemented by application code.

The deployment remains static-only through Cloudflare Workers Static Assets with SPA fallback. No Analytics, product events, session replay, remote error reporting, or remotely executed third-party script is part of the application.

## Sources and limits

The [successor specification](SPEC.md) defines the supported profile, statutory source policy, and product limits. Statutory values and sources live in `src/rules`; `pnpm rules:validate` and `pnpm verify:release` check them locally, and they expire on 31 August 2027. Tutorials remain separate from statutory authority and none are approved as a primary Tax Year 2026-27 action link.

This project gives general information, not tax, accounting, or legal advice. Public launch still requires the statutory, qualified privacy, accessibility, target-user, and Cloudflare release gates described in `SPEC.md`.

Contributors using Claude Code or Codex should install [Matt Pocock's skills](https://github.com/mattpocock/skills).

## License

[Apache License 2.0](LICENSE).
