---
status: accepted
---

# Use automatic Recovery drafts

The Application writes `my-next-filing:recovery-draft` to `sessionStorage` when a personal questionnaire opens, retains it through an unsaved plan including Unsupported or stale-rules results, and restores it after refresh; its envelope contains version, Tax Year, origin, optional base Saved-workspace revision, and Draft. Explicit workspace selection overrides personal work only for the current document, while refresh restores Recovery priority; cleanup follows only committing that Draft or verifying an identical saved Profile, and workspace-only mutations preserve unrelated drafts. This accepts automatic current-tab storage in exchange for refresh recovery, with qualified privacy approval required before release; it enables neither longer-lived saving nor Completion records, and stale saved edits cannot overwrite newer revisions.
