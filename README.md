# My Next Filing

I built this after too many compliance reminders gave me noise instead of a clear next step. My Next Filing is a static website for a narrow profile: a GST-unregistered resident individual who provides IT or software consulting directly to Indian clients.

It calculates a best-effort tax estimate in the browser and shows the next supported tax action. It does not file a return, send reminders, connect to government systems, or replace a tax professional.

## Current state

The application includes a five-step questionnaire, versioned local rules, an income-tax estimate, advance-tax and return agenda, GST registration-threshold monitor, and the synthetic example in `SPEC.md`. Answers and calculations stay in memory for the current page session and are not saved.

It supports only Tax Year 2026-27 and one narrow profile. Unsupported facts and expired or invalid rules stop calculation rather than provide an estimate.

## Local commands

```sh
pnpm install
pnpm dev
pnpm build
pnpm format:check
pnpm lint
pnpm typecheck
pnpm rules:validate
```

## Deployment

`pnpm build` creates static `dist` assets. `wrangler.jsonc` configures Cloudflare Workers Static Assets with single-page-application fallback and the canonical custom domain. HTTPS is a production release check; it is not implemented by application code.

## Sources and limits

`SPEC.md` defines the supported profile, statutory source policy, and product limits. Statutory values and sources live in `src/rules`, are checked locally at build time, and expire on 31 August 2027. Tutorials remain separate from statutory authority and none are approved as a primary Tax Year 2026-27 action link.

This project gives general information, not tax, accounting, or legal advice. Production Analytics and public launch remain subject to the qualified privacy and statutory re-review gates in [docs/release-checklist.md](docs/release-checklist.md).

Contributors using Claude Code or Codex should install [Matt Pocock's skills](https://github.com/mattpocock/skills).

## License

[Apache License 2.0](LICENSE).
