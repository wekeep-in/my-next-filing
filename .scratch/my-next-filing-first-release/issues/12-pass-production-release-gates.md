# Pass the production release gates

Status: blocked
Blocked by: 11

## Outcome

The approved first release is publicly available on the canonical domain only after every statutory, privacy, Analytics, deployment, browser, accessibility, and performance gate has evidence.

## Work

- Publish the repository, select one supported Git host, protect `main`, and connect Workers Builds.
- Obtain qualified Indian privacy review using the prepared packet. Apply every required code, GA4, consent-copy, privacy-page, contract, and record change before enabling Analytics.
- Re-verify Finance Act and Rules changes, due-date extensions, GST threshold and aggregate-turnover treatment, Source URLs, portal guides, return-form availability, and each approved tutorial.
- Confirm the production Rule dataset is valid and unexpired. If a Rule cannot be verified, remove that personalized result or fail closed.
- Review the preview with Analytics absent, then deploy the reviewed commit from protected `main`.
- Attach `mynextfiling.com`, configure `www` redirection with path and query preservation, and enforce HTTPS.
- Configure the approved GA4 property settings and production-only build variables.
- Complete `docs/release-checklist.md` in the production release pull request.

## Required evidence

- All implementation tickets and automated merge checks are resolved and green.
- Qualified privacy approval, operator details, consent copy, and re-review date are recorded.
- Statutory and tutorial review records include direct primary URLs, issue or publication dates, reviewer, and review date.
- Preview and production network captures prove the approved Analytics behavior and Profile-data exclusion.
- Direct-route, private-window, canonical-domain, `www`, HTTPS, and certificate checks pass.
- Mobile Lighthouse performance is at least 90.
- Current and previous desktop browsers, physical Chrome on Android, and physical Safari on iOS pass the core journey.
- Keyboard, focus, reduced motion, touch, 320-pixel layout, external-link privacy, and no-prefetch checks pass.
- The public build contains no real taxpayer data, credential, private capture, private interface, or endorsement claim.

## Release rule

Any missing gate blocks production. A passing preview is not a production release.

## Authority

- [Implementation specification](../spec.md)
- [`SPEC.md` statutory review, privacy, delivery, and first-release completion decisions](../../../SPEC.md)
- [Privacy legal review packet](../../my-next-filing-implementation/privacy-legal-review-packet.md)
