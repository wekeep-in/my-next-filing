# My Next Filing first-release implementation specification

| Item | Value |
| --- | --- |
| Status | Ready for implementation |
| Product authority | [`SPEC.md`](../../SPEC.md) |
| Decision record | [My Next Filing first-release implementation map](../my-next-filing-implementation/map.md) |
| Prepared | 29 August 2026 |
| Production gate | Qualified privacy review remains required |

## Purpose

This document orders implementation of the approved first release. It does not replace `SPEC.md` or widen its product scope. When this document and `SPEC.md` differ on product behavior, `SPEC.md` controls.

## Non-negotiable boundaries

- Static React application with no backend, account, database, Worker script, storage binding, or government connection.
- Profile and money values never enter a URL, title, log, Analytics event, or external link.
- One narrow supported Profile and Tax Year 2026-27 only.
- Evaluation returns exactly Supported, Unsupported, or Stale-rules.
- No reminders, completion tracking, filing, payment, penalty, late-interest, or live government integration.
- Invalid or expired Rules fail closed.
- Statutory sources establish rules. Tutorial sources never do.
- Competition submission work does not control this product plan.

## Interface direction

Use the resolved **Focused flow**:

- centered landing-page hierarchy and one focused questionnaire group at a time;
- four-stage progress in the questionnaire shell;
- next deadline before calculation detail on the Plan;
- Substack orange `#ff6719`, hover orange `#ff5600`, white and neutral gray tokens, and `#111111` primary ink;
- a 16-pixel base and 1.2 minor-third type scale, capped at 82.56 pixels for the landing display;
- sentence-case labels without repeated tracked uppercase eyebrows;
- CSS transitions only, with pointer press feedback, no keyboard delay, touch-safe hover, and reduced-motion behavior.

Use official shadcn Base UI items before writing an equivalent. Start with Questionnaire, Field, Input, Checkbox, Select, Button, Progress, disclosure, and card items. Skip Typeset initially. Review and pin any community registry item before use.

## Application organization

```text
src/
  routes/               # one flat file per public route; route-local UI stays here
  evaluation/index.ts   # evaluate and Evaluation-owned interface types
  rules/index.ts        # validation, current Rules, Source registry, Rules-owned types
  components/ui/        # official shadcn components
  app.tsx
  current-check.ts
  analytics.ts
```

Only Evaluation and Rules expose `index.ts`. Do not add central `types`, `services`, `hooks`, or `utils` folders, a state library, a form library beyond the chosen shadcn Questionnaire dependency, a date library, a motion library, or an Analytics wrapper.

## Public interfaces

Evaluation accepts a validated Profile, current `Date`, and validated Rule dataset. It returns one complete Evaluation result. It owns Profile-independent calculation and result types, eligibility, rounding, India Standard Time status behavior, Obligations, and GST status logic.

Rules exports the current typed Rule dataset, read-only Source registry, Rule-owned types, and `validateRuleDataset(unknown)`. Author production Rules and Sources as TypeScript objects with `satisfies`. Runtime validation still checks identities, versions, dates, expiry, provenance, rates, thresholds, HTTPS Sources, duplicates, and tutorial approval.

`current-check.ts` holds the active Profile only in memory while the page remains open. Questionnaire state remains route-local. `/plan` uses a client-side React Router loader to load the current Profile, validate Rules, pass the current date into Evaluation, and redirect to `/check` when no complete Profile exists.

`analytics.ts` accepts only an allowlisted route identity. It never accepts Profile or Evaluation data.

## GST model

Collect one direct **GST aggregate turnover for this PAN** amount and one explicit Complete or Cannot confirm answer. Never calculate or cross-validate this amount from income-tax fields.

When complete, compare with the location threshold using `<`, `=`, and `>` for Below, At, and Above. At remains supported. Above keeps the income-tax result and marks GST coverage incomplete. Cannot confirm produces GST Unavailable, keeps the income-tax result, and marks GST coverage incomplete. Another business or supply type remains globally Unsupported.

The synthetic example declares ₹19,10,000 GST aggregate turnover and shows ₹90,000 below Maharashtra's ₹20 lakh starting threshold.

## Delivery and release

Deploy static `dist` assets through Cloudflare Workers Static Assets with SPA fallback, preview URLs, production from protected `main`, the root custom domain, a separate `www` redirect, and HTTPS. Preview builds contain no Analytics measurement ID.

Check in `docs/release-checklist.md`. Complete it in the production release pull request. Production remains blocked until the checklist links:

- statutory, extension, Source, tutorial, and Rule-expiry review;
- qualified privacy approval;
- preview and production Analytics network evidence;
- Cloudflare direct-route, custom-domain, `www`, and HTTPS checks;
- mobile Lighthouse result of at least 90;
- current and previous desktop browser checks;
- physical Chrome on Android and Safari on iOS checks;
- keyboard, focus, reduced-motion, touch, and 320-pixel layout checks; and
- external-link privacy and no-prefetch checks.

## Ordered tickets

1. [Build the application shell and route frame](issues/01-build-application-shell.md)
2. [Validate and publish the current Rule dataset](issues/02-validate-current-rules.md)
3. [Capture a Profile in memory](issues/03-capture-profile.md)
4. [Return Unsupported and Stale-rules results](issues/04-return-stop-results.md)
5. [Calculate the supported income-tax estimate](issues/05-calculate-income-tax.md)
6. [Add advance-tax and return Obligations](issues/06-add-tax-obligations.md)
7. [Add the GST aggregate-turnover monitor](issues/07-add-gst-monitor.md)
8. [Complete Sources, Methodology, and product-limit routes](issues/08-complete-reference-routes.md)
9. [Complete the synthetic example and Browser journey](issues/09-complete-browser-journey.md)
10. [Add privacy-safe Analytics consent](issues/10-add-privacy-safe-analytics.md)
11. [Configure merge checks and static delivery](issues/11-configure-ci-and-delivery.md)
12. [Pass the production release gates](issues/12-pass-production-release-gates.md)

## First-release completion

The release is complete only when every implementation ticket is resolved, `SPEC.md` behavior is present, formatting, lint, type checking, Rule validation, and the production build pass, the manual release checklist is complete, statutory Sources are re-verified, and qualified privacy review permits the production Analytics posture. A preview or partial journey is not the first release.
