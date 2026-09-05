# Frontend ideas

Status: core implementation complete on `frontend-recovery`; release gates pending

- [Implementation specification](spec.md)
- [Implementation plan](implementation-plan.md)
- [Implementation verification and remaining release gates](../my-next-filing-solo-freelancer/release-verification.md#frontend-implementation-checkpoint)

## Accepted ideas

- Use a pure `useReducer` model for the cross-route questionnaire workflow, while keeping evaluation derived and browser or UI effects outside the reducer.
- Give each questionnaire group a static nested route under `/check`, using the URL only for the current group and keeping all Profile, money, evaluation, completion, and save data out of it.
- Preserve in-progress answers across refreshes with one validated, versioned `sessionStorage` draft, while keeping `Start over` separate from the confirmed `Delete saved data` action.
- Preserve unrelated drafts during Saved-workspace mutations and the latest in-memory answers during examples, including failed Recovery writes. Explicit workspace selection overrides personal work until return or refresh.
- Define synchronization before wiring Effects, keep persistent failures separate from temporary notices, and make unverified or partial deletion retryable without recreating removed answers.
- Retain intentional version-1 deletion without migration or backup; the current user base does not justify migration complexity.
- Replace generic `Partial<Draft>` patches with intent-based reducer events so cascading state rules live in one place.
- Centralize repeated questionnaire branch selectors without introducing a schema-driven form engine.
- Derive one tagged Plan model for missing, deleted, stale, unsupported, and supported states, leaving React to render it and perform effects.
- Consolidate the duplicate India-date implementations into one `indiaDate(now)` function.
- Remove the unused `currentIndiaDate` argument and unused array input shape from `deriveWorkspaceView`.
