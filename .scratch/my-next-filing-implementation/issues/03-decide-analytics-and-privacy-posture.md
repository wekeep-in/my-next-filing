# Decide the production Analytics and privacy posture

Type: research
Status: resolved
Blocked by: none

## Question

Using current official privacy-law and Google Analytics sources, what production consent, disclosure, retention, configuration, and user-control requirements apply to this India-focused static site? Keep the decision within `SPEC.md`: Analytics is required, profile and result data must never be sent, and Analytics failure must never affect the application.

## Answer

Use production-only GA4 with basic opt-in consent and sanitized page views only. Keep all profile, money, and result state outside the Analytics boundary; rejection, failure, or withdrawal must not affect the application. The binding dates, 14-month retention choice, configuration baseline, user controls, release checks, and legal-review gates are in [Analytics and privacy posture](../research/analytics-and-privacy-posture.md).
