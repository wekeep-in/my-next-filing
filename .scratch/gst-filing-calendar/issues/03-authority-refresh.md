# Refresh GST calendar and LUT authority

Status: implemented and verified locally on 7 September 2026. Not committed or deployed.

The previous review would withhold both areas after 30 September. Re-read the seven statutory sources, current Rule 61 and Rule 96A, relevant procedural amendments, and the public CBIC 2026 notification/circular listings. The [review record](../research/authority-refresh-2026-09-07.md) contains direct URLs, publication dates, listing query details, source-access limitations and the March 2026 extension exclusion.

Dataset v9 refreshes both groups through 31 October 2026, with source and group review dates of 7 September. The expiry is a bounded maintenance decision. Normal dates, eligibility, tax estimates, completion identities and storage schemas are unchanged. No remote fetch or automatic freshness renewal was added.

Compliance review found no issue with the normal schedules or LUT conditions. The existing S1 release-evidence limitation remains for an exhaustive state/UT extension inventory; no universal absence-of-extension claim or unverified operative override was added. The working CBIC listing resolves the earlier central-index access gap, but does not certify completeness of every jurisdiction's publications.

Verification passed `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm rules:validate`, `pnpm test:unit` and `pnpm build`. All 159 unit tests pass. The new regression proves continued availability after the old cutoff, expiry at the end of 31 October in India, stable government dates and tax, and preserved saved Completion records. Existing independent-area invalid/stale/missing-source tests remain. The Resources checks retain bibliography while changing freshness warnings at the renewed boundary.

No tests were retired. The unit report is `artifacts/vitest/results.xml`. No UI/layout, storage migration or browser lifecycle code changed, so the production-browser matrix was not rerun for this metadata refresh. The existing video-bundle size advisory remains.
