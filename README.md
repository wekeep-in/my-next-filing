# My Next Filing

I built this after too many compliance reminders gave me noise instead of a clear next step. My Next Filing is a static website for a narrow profile: a GST-unregistered resident individual who provides IT or software consulting directly to Indian clients.

It will calculate a best-effort tax estimate in the browser and show the next supported tax action. It will not file a return, send reminders, connect to government systems, or replace a tax professional.

## Current state

This repository has the React and Vite base only. The questionnaire, rule dataset, calculations, and public deployment setup are still planned.

## Local commands

```sh
pnpm install
pnpm dev
pnpm build
pnpm format:check
pnpm lint
pnpm typecheck
```

## Deployment

The finished site will build to static files for Cloudflare Workers Static Assets. It will have no application backend or database.

## Sources and limits

`SPEC.md` defines the supported profile, statutory source policy, and product limits. Tax rules and tutorial links need human review before they ship. This project gives general information, not tax, accounting, or legal advice.

Contributors using Claude Code or Codex should install [Matt Pocock's skills](https://github.com/mattpocock/skills).

## License

[Apache License 2.0](LICENSE).
