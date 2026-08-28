---
name: compliance-review
description: Review My Next Filing's statutory data or tax calculations against current official Indian sources. Use for rule, threshold, rate, date, source, or tax-logic changes.
---

# Compliance review

Review only. Do not change code or rule data unless the user asks for a fix.

Read the relevant sections of `SPEC.md`, the local rule dataset, and the evaluation path. Then verify every changed statutory value against the primary authority. Prefer Income Tax Department, CBIC, GST Portal, Gazette, or PIB material. Record the direct URL and its publication or issue date. A search result or tutorial cannot establish a rule.

Check the value, effective date, expiry date, source reference, supported-profile boundary, and result behavior. Flag an invalid, missing, stale, or non-HTTPS source. Treat an expired dataset as a release blocker because this product must fail closed.

Report findings by severity:

- S0: a value or calculation gives a wrong personalized result.
- S1: a required boundary, source, or stale-rules guard is missing.
- S2: an edge case may give the wrong result.
- S3: a reviewability improvement.

For each finding, give the code or data location, rule, evidence URL, impact, and smallest safe fix. State "No findings" when the review finds none.
