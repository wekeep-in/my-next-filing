# Delivery and competition constraints

Research date: 29 August 2026

Authority used: current Cloudflare documentation and the official Build What Moves India brief and FAQ. `SPEC.md` remains the product authority. This report identifies delivery facts and external submission rules that the implementation plan must add.

## Decision

Keep the specified React and Vite single-page application on Workers Static Assets and Workers Builds. It needs no Worker script. Use an explicit static-assets configuration, production and preview build triggers, a production custom domain, and a separate Cloudflare redirect for `www`.

Use production-trigger build variables to include Google Analytics only in the production bundle. Do not treat a generic production-mode Vite build as proof that the deployment is the production deployment because Workers Builds runs the build command for production and non-production branches.

The competition submission is a separate, time-boxed release artifact. The first submission closes at 10:00 PM IST on 29 August 2026 with no grace period. The site, video, summary, and registration details must be ready before that time.

## Workers Static Assets and SPA routing

Cloudflare supports a static-only Worker by pointing `assets.directory` to the build output. A project with no Worker script must omit `main` and the assets `binding`. For Vite, the directory is `./dist`. [Cloudflare recommends Workers Static Assets for static sites](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/) and documents the no-script configuration in its [Pages-to-Workers migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/).

Set `assets.not_found_handling` to `single-page-application`. When no uploaded asset matches, Cloudflare returns `/index.html` with `200 OK`; React Router must then render either the requested public route or the application's not-found view. This satisfies direct navigation to `/check`, `/plan`, `/methodology`, `/sources`, `/disclaimer`, and `/privacy`. It also means the not-found view is a client-side 404 with an HTTP 200 response. [Cloudflare SPA routing documentation](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/).

The minimum checked-in `wrangler.jsonc` shape is:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "my-next-filing",
  "compatibility_date": "2026-08-29",
  "workers_dev": false,
  "preview_urls": true,
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  },
  "routes": [
    {
      "pattern": "mynextfiling.com",
      "custom_domain": true
    }
  ]
}
```

`workers_dev: false` prevents a second public production hostname. `preview_urls: true` keeps version and branch previews available even when the production `workers.dev` route is disabled. Cloudflare says preview URLs otherwise default to the value of `workers_dev`. Preview URLs use `<version-or-alias>-<worker-name>.<account-subdomain>.workers.dev` and cannot use the production custom domain. [Cloudflare preview URL documentation](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/).

## Workers Builds and domains

Workers Builds supports GitHub and GitLab repositories. The Worker name in Cloudflare must match `name` in `wrangler.jsonc`. Use these build settings:

| Setting | Required value |
| --- | --- |
| Production branch | `main` |
| Build command | `pnpm build` |
| Production deploy command | `pnpm exec wrangler deploy` |
| Non-production branch builds | Enabled |
| Non-production deploy command | `pnpm exec wrangler versions upload` |

A production-branch push runs the build and deploy commands and promotes the new version. A non-production push runs the same build command and the non-production deploy command, creating a preview version without promoting it. Cloudflare also creates a stable branch preview alias and a version-specific preview URL on `workers.dev`. [Workers Builds branch controls](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/), [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), and [per-branch preview announcement](https://developers.cloudflare.com/changelog/post/2025-07-23-workers-preview-urls/).

Cloudflare does not protect `main`; the Git host must enforce branch protection before Workers Builds listens to it.

The `mynextfiling.com` Custom Domain needs an active Cloudflare zone. Cloudflare creates the DNS record and certificate for that exact hostname. It does not make `www.mynextfiling.com` equivalent. Configure a proxied DNS record for `www` and a Cloudflare Redirect Rule that preserves the path and query while redirecting to `https://mynextfiling.com`. A static-assets `_redirects` file cannot perform a domain-level redirect. Turn on Always Use HTTPS for the zone, or use an equivalent redirect rule, so all HTTP requests redirect to HTTPS. [Cloudflare Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [Static Assets redirects](https://developers.cloudflare.com/workers/static-assets/redirects/), and [Always Use HTTPS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/).

## Production-only Analytics

Workers Builds has separate production and preview triggers, and build environment variables can differ by trigger. Put the public Google Analytics measurement ID and an explicit enable flag only on the production trigger. Leave both absent or false on the preview trigger. [Workers Builds API reference](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/).

The application should initialize Analytics only when the production enable flag is true and the measurement ID exists. This keeps the integration outside evaluation logic and makes a missing or blocked Analytics request harmless, as `SPEC.md` requires.

Release evidence must show:

- A branch preview contains no measurement ID and sends no request to Google Analytics or Google Tag Manager.
- The canonical production deployment sends only the approved page analytics after the privacy decision is implemented.
- Questionnaire answers, money, results, and user identifiers never appear in routes, titles, Analytics events, or outbound request data.
- Blocking the Analytics hosts does not change questionnaire or result behavior.

## Competition submission constraints

The official brief requires a working end-to-end citizen journey, not a static design. Codex or an OpenAI model must contribute meaningfully, and the submission must explain that contribution. Reviewers test the citizen experience. Every demonstrated feature must work. The build must disclose what works, what is mocked, and which dependencies it uses. [Build What Moves India builder brief](https://buildwhatmovesindia.com/brief) and [FAQ](https://buildwhatmovesindia.com/faq).

The Project Submission form opens at 8:00 PM IST on 28 August 2026 and closes at 10:00 PM IST on 29 August 2026. There is no grace period. The initial submission requires:

- A public browser URL that opens without an access request. If login exists, it must use mock consumer credentials.
- One public video no longer than two minutes. Minute one demonstrates the project as a citizen. Minute two explains how it was built and why those choices were made.
- A project summary under 250 words that explains the project and why it improves the current experience.
- The registered partner email for a two-person team. Both teammates must have registered, but only one submits. A solo entrant leaves this field blank.

Links must work without access approval. A team may replace its submission before closing time; the latest response counts. The same registered email must be used in later stages. If shortlisted, the team resubmits the same artifact set by 7 September 2026. [Submission and schedule in the official brief](https://buildwhatmovesindia.com/brief).

The prototype must use synthetic data where personal information, payments, OTPs, or government systems would otherwise appear. It must not access or interfere with a live government system, reverse-engineer private systems, use undocumented private APIs, scrape restricted information, use sensitive real data, imply government endorsement, misuse a government logo, or include code, assets, or data without permission. Other tools, libraries, starter templates, and open-source components are allowed only with the right to use them and clear disclosure. The builder retains ownership. [Competition rules in the official brief](https://buildwhatmovesindia.com/brief) and [tools, data, and rights in the FAQ](https://buildwhatmovesindia.com/faq).

Judging covers the problem, the working build, usability and accessibility, product thinking, end-to-end thinking, and honest disclosure. Selection does not mean government adoption. [Judging criteria and adoption statement](https://buildwhatmovesindia.com/brief).

## `SPEC.md` comparison

| Topic | Finding | Plan consequence |
| --- | --- | --- |
| React, Vite, Workers Static Assets, no Worker script | Aligned with current Cloudflare support. | Keep the stack. Omit `main` and the assets binding. |
| SPA fallback and application not-found state | Compatible, with one qualification: Cloudflare returns `index.html` and HTTP 200 for an unmatched asset path. | Test the client not-found view. Do not claim an HTTP 404. Add server code only if an HTTP 404 becomes a requirement. |
| Preview builds | Intent is aligned, but the spec does not name the non-production build toggle, preview deploy command, or explicit preview URL setting. | Add them to infrastructure setup and release evidence. |
| Protected `main` | Aligned, but Cloudflare only selects a production branch. | Configure protection in GitHub or GitLab. |
| Canonical domain, `www`, and HTTPS | Aligned, but a Custom Domain alone covers only the exact root hostname. | Add the `www` proxied DNS record, Redirect Rule, and HTTPS redirect setting. |
| Production-only Analytics | Intent is aligned, but the enforcement mechanism is unspecified. | Separate the production and preview trigger variables and test network behavior on both deployments. |
| Synthetic data, no live government integration, no endorsement, meaningful Codex contribution, and working demo controls | Aligned. | Preserve these as demo acceptance checks. |
| Competition submission | Material omission. The spec does not record the deadline, public video, summary limit, or team submission fields. | Add a submission checklist owned outside the application build. |
| Permission and tool disclosure | Partly covered by repository licensing, but the competition also requires permission for all submitted assets and disclosure of tools and libraries. | Audit assets and prepare a concise dependency and Codex-contribution disclosure. |

## Release gate

Before submission or public release, verify all of the following:

1. `pnpm build` produces `dist`, and `wrangler.jsonc` uploads only that directory with no Worker entry point or binding.
2. Direct browser requests to every public route load the application. An unknown route shows the React not-found view. A known static asset has its expected content type.
3. A non-production push creates public branch and version preview URLs and does not change `mynextfiling.com`.
4. A reviewed merge to protected `main` deploys the same commit to `https://mynextfiling.com`.
5. HTTP redirects to HTTPS. `www` redirects to the root hostname while preserving path and query. The root hostname has a valid certificate.
6. Preview bundles and network logs contain no Analytics configuration or requests. Production Analytics failure does not affect the application.
7. The public link works in a private browser without login or access approval, and the complete synthetic example works on mobile and desktop.
8. Every control shown in the final video works on the submitted public build. Mocked and external steps are labeled.
9. The final video is public and no longer than two minutes. The summary is under 250 words. All submission links and team fields are checked before 10:00 PM IST on 29 August 2026.
10. The submission discloses Codex's material contribution and other tools or libraries, and all code, assets, data, and example identities are owned, licensed, or synthetic.
