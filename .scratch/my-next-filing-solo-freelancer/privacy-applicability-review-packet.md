# My Next Filing browser-storage privacy applicability review

Prepared: 2 September 2026

Product boundary updated: 5 September 2026

Review status: Awaiting a qualified Indian privacy reviewer

## Review requested

Please review automatic current-tab Recovery drafts and optional longer-lived Saved workspaces for the planned frontend replacement. Record approval or exact required changes separately for both stores. This packet supplies the proposed product and technical boundary, not a legal conclusion or evidence of production approval.

The review must cover operation before and on or after 13 May 2027. It must state the exact product and storage configuration to which the opinion applies. The candidate has no Analytics, product events, replay, remote error reporting, or remotely executed script.

Do not add real taxpayer data, contact details, account identifiers, or production credentials to this packet.

## Repository baseline and proposed replacement

- My Next Filing is a public static React application at `mynextfiling.wekeep.in` for resident-individual freelancers in India.
- It has no account, login, backend, database, server function, government connection, filing action, payment action, cloud Profile storage, reminder, or user-contact identifier.
- The repository baseline holds unsaved questionnaire answers in memory and supports an optional schema-version-1 Saved workspace. The proposed replacement adds Recovery drafts and intentionally removes version-1 workspaces. These facts describe the reviewed source and plan, not a new inspection of production.
- Neither store contains a name, PAN, Aadhaar number, GSTIN value, email address, phone number, bank-account details, password, OTP, client identity, invoice, or document.
- The application uses a versioned local Rule dataset and stops personalized calculation when Rules are invalid, stale, or do not cover the declared Profile.
- The candidate bundles or serves runtime scripts, fonts, images, video, and captions from the same origin. Confirm its deployed network behavior in the release evidence.

## Planned successor behavior

The first successor release broadens verified income-tax support to eligible solo digital freelancers with domestic or Foreign professional receipts. It adds an optional saved filing workspace on the current browser and Completion records for supported income-tax Obligations. It does not add cloud sync, document processing, reminders, government integration, or a GST-return calendar.

Longer-lived saving remains off until an adult user has a Supported result, sees the standalone notice, and chooses `Save data`. Automatic Recovery begins without a storage choice when a personal questionnaire opens, including while blank and before the adult answer is known. A four-second notice after the first verified write and the landing FAQ disclose that behavior. The in-memory journey remains usable if either storage area fails.

### Recovery draft

The version-1 `my-next-filing:recovery-draft` envelope in `sessionStorage` contains only schema version, Tax Year, personal or Saved-edit origin, optional base workspace revision, and incomplete questionnaire display strings and choices. These may include scope answers, state or Union territory, receipts, profit, interest, and tax-credit inputs. The whole small envelope is replaced after answer changes; it stores no Profile, calculated result, Completion record, route, timestamp, error, example, or UI state.

Recovery survives refresh in the current tab and is best effort; closing the tab may remove it. Restoration validates the Draft before fresh Profile parsing and Evaluation. It remains available for Supported, Unsupported, and stale-rules results. An example temporarily holds the latest personal session in memory so returning preserves even answers that could not be stored; examples themselves never enter either store.

### Saved workspace

The schema-version-2 `my-next-filing:workspace` envelope in `localStorage` contains only the fields approved in root `SPEC.md`:

- schema version, revision, accepted notice version 2, local decision timestamp, and update timestamp;
- Active Tax Year identity, a nullable active record, and the approved Open or Archived prior-year records;
- declared Profile facts needed by Evaluation, including occupation and scope answers, state or Union territory, money inputs, and tax-credit inputs;
- Completion records containing the supported Obligation identity, Tax Year, and user-declared completion date; and
- Rule dataset identities and archive dates where applicable.

The saved envelope does not contain:

- a calculated result, display copy, or Rule copy;
- a name, PAN, Aadhaar number, GSTIN value, email address, phone number, bank or payment-account identifier, password, or OTP;
- a client, platform-account, invoice, transaction, document, free-text note, or acknowledgement number; or
- an Analytics identifier, campaign value, page history, or data copied from Analytics.

On restore, the application treats browser storage as untrusted input, validates the whole envelope, and runs Evaluation against current valid Rules. It does not trust a stored calculation.

A Completion record means only that the user marked an Obligation complete. It does not show government filing, payment, acceptance, or verification.

## Technical boundary requiring review

The two exact browser keys have separate purposes: current-tab refresh recovery in `sessionStorage` and opt-in workspace restoration in `localStorage`. Application code does not upload either value or include it in requests, URLs, titles, logs, sharing, or external links. Scripts executing on the origin and other users of the browser profile may be able to access them.

There is no Analytics choice, remote runtime script, or product measurement event in this candidate. Cloudflare hosting request metadata remains part of the review. This packet replaces the earlier unresolved Analytics alternatives; it does not reopen them.

### Retention and deletion

- Recovery is retained through an unsaved plan. Saving that same Draft or verifying a redundant Profile permits cleanup; a Completion or payment update to a different Saved workspace leaves unrelated Recovery intact.
- `Start over` removes only the current tab's Recovery after confirmation when answers exist, verifies removal, then starts a blank personal Draft. It leaves the Saved workspace unchanged.
- `Delete saved data` removes and verifies the Saved-workspace key first, then the current-tab Recovery key. Other tabs' Recovery drafts are separate. Partial and unverified outcomes remain visible and retryable even when the workspace key is already absent.
- An encountered JSON object with top-level workspace schema version 1 is intentionally deleted without migration, backup, or recovery. A temporary notice follows verified removal. This accepted reset is irreversible; a code rollback cannot restore removed Profiles or Completion records.
- Failed or unverified operations preserve usable in-memory answers. An unreadable post-mutation outcome does not establish that the old stored value remains; unverified deletion pauses affected writes until inspection resolves it. Persistent warnings remain independent of temporary success notices.
- Saved workspaces remain until deliberate deletion or browser clearing or eviction. Retention is best effort, not statutory record keeping, sync, or backup. The existing per-year deletion and archive rules remain in root `SPEC.md`.

Review the exact automatic-storage, adult-answer timing, notice timing, tab scope, retention, irreversible reset, and deletion-failure behavior above.

## Proposed minimum safeguards

- Treat questionnaire answers, Profile values, and Completion records as personal data even if a legal exclusion might apply.
- Keep Saved-workspace opt-in separate from automatic Recovery. A storage failure does not impair the in-memory calculator.
- Explain automatic Recovery after its first verified write and in the FAQ. Explain Saved-workspace fields, purpose, browser scope, shared-browser exposure, loss risk, retention, deletion, and lack of account, sync, backup, or recovery before its first write.
- Warn users not to save on a shared or public browser.
- Store incomplete questionnaires only in Recovery. Examples never enter either store. Saved-workspace creation requires a parsed adult Profile and Supported Evaluation.
- Confirm saving only after the storage write succeeds.
- Validate restored data before Evaluation. Delete version-1 workspaces as decided; reject other unknown or invalid workspace values without overwriting them.
- Delete only the exact keys and clear corresponding memory only after verified removal. Coordinate workspace changes through storage events and revision checks, without claiming deletion of another tab's Recovery. Never call either storage area's `clear()` method.
- Keep Profile and Completion data out of URLs, titles, logs, error reporting, Analytics, external links, and generic sharing.
- Use HTTPS, restrictive security headers, a Content Security Policy excluding off-origin runtime scripts, same-origin assets, and dependency review.
- Do not claim that browser storage is encrypted, permanent, backed up, private from other browser users, securely erased, or available on another device.

## Draft storage notice for review

First verified Recovery write, shown for approximately four seconds:

> Your answers will stay available if you refresh this tab. Closing the tab may remove them.

Before the first Saved-workspace write:

> Save your answers and the completion dates you add. Anyone using this browser profile may be able to see them. There is no account, sync, backup, or recovery. Private browsing or clearing site data may remove them.

Actions are `Save data` and `Cancel`. Accepted notice version is 2. The landing FAQ provides the full product and storage explanation.

Proposed deletion confirmation:

> Your saved answers and completion dates were removed from this browser. Your in-progress answers were removed from this tab.

Automatic legacy deletion, shown only after verified removal:

> Your previously saved answers and completion dates were removed because this version uses a new workspace.

Proposed completion qualification:

> You marked this complete on [date]. My Next Filing cannot verify government acceptance.

Please approve or replace each statement. State any notice that must appear earlier, remain persistently available, or name the legal operator and contact.

## Questions for the reviewer

For each item, answer **Approved**, **Change required**, **Not applicable**, or **Unable to conclude**. Cite the controlling authority and provide exact wording or configuration when a change is required.

1. Before 13 May 2027, do the Information Technology Act, 2000 and the Information Technology Rules, 2011 apply to the planned browser-only processing? Are receipts, profit, interest, tax paid, and tax withheld "financial information" or otherwise sensitive personal data when no bank-account or payment-instrument identifier is stored?
2. When Profile values remain in a browser chosen and controlled by the user, are they collected, received, possessed, dealt with, or handled by the operator for current-law purposes?
3. On and after 13 May 2027, is the operator a Data Fiduciary for this browser-only processing under the Digital Personal Data Protection Act, 2023? If not, identify the exact exclusion and facts on which the conclusion depends.
4. Assess automatic Recovery separately from opt-in Saved workspaces. Is the proposed basis and notice timing acceptable for each? What itemised notice, purpose statement, withdrawal path, and proof must the operator retain without an account, backend, or user-contact identifier?
5. Is the locally stored Saved-workspace notice choice sufficient evidence? What evidence, if any, is required for automatic Recovery without a prior choice, and can it remain entirely in the browser?
6. What retention or inactivity rules apply separately to Recovery drafts, active Profiles, and archived Completion records? Must the user be able to delete one Tax Year separately, or is deleting the whole workspace sufficient?
7. Does the exact Start-over, current-tab Recovery deletion, whole-workspace deletion, intentional version-1 reset, and partial or unverified outcome behavior satisfy applicable duties? Which claims about browser backups, private browsing, other open tabs, or device storage must the product avoid?
8. What access, correction, erasure, withdrawal, grievance, and nomination processes must exist without an account or user-contact identifier? State required contact details and response periods.
9. What reasonable security safeguards apply? State requirements for Content Security Policy, third-party scripts, dependency review, incident response, breach notification, records, and processor contracts.
10. For the candidate with no Analytics, product events, or remotely executed script, what hosting-metadata disclosure, processor terms, overseas-processing analysis, or retention obligations remain?
11. Automatic Recovery starts before the adult answer is known, while Saved-workspace creation requires an adult Profile. Is that exact boundary acceptable for users under 18? State required changes without adding identity collection by assumption.
12. Is disclosure after the first verified Recovery write through a four-second notice plus the FAQ sufficient? State any earlier, persistent, or action-specific explanation required, including during storage failure and example use.
13. Is the planned operator required to publish terms, a privacy notice, a grievance contact, a security contact, or other notices before release? Supply the required legal identity and contact fields.
14. Which conclusions differ before and on or after 13 May 2027? State any release deadline, re-review trigger, or code or configuration change needed at commencement.

## Operator details to complete

| Item | Review response |
| --- | --- |
| Legal operator name |  |
| Entity or individual status |  |
| Business address, if required |  |
| Monitored privacy contact |  |
| Grievance contact, if different |  |
| Security or breach contact, if different |  |

## Review response

| Decision | Response |
| --- | --- |
| Applicable law before 13 May 2027 |  |
| Applicable law on and after 13 May 2027 |  |
| SPDI classification and possession or control conclusion |  |
| DPDP Data Fiduciary conclusion |  |
| Approved product and storage boundary |  |
| Approved automatic Recovery and disclosure timing |  |
| Approved opt-in Saved-workspace boundary |  |
| Approved absence of Analytics and hosting-metadata treatment |  |
| Required notice and consent wording |  |
| Required proof of notice or consent |  |
| Required retention and deletion behavior |  |
| Approved version-1 deletion and unverified or partial outcomes |  |
| Required user-rights and grievance process |  |
| Required child-user behavior |  |
| Required safeguards and breach process |  |
| Approved for release before 13 May 2027 |  |
| Approved for operation on and after 13 May 2027 |  |
| Required changes before approval |  |
| Required re-review date or trigger |  |
| Reviewer name and qualification |  |
| Review date |  |

## Evidence supplied

- [Agent privacy applicability review](research/agent-privacy-applicability-review.md)
- [Wayfinder map](map.md)
- [Release boundary and success measures](issues/04-set-release-boundary-and-success-measures.md)
- [On-device persistence privacy and security research](research/on-device-persistence.md)
- [Current product specification](../../SPEC.md)
- [Frontend implementation specification](../frontend-ideas/spec.md)
- [Frontend implementation plan](../frontend-ideas/implementation-plan.md)
- [Release verification record and outstanding gates](release-verification.md)
- [Digital Personal Data Protection Act, 2023](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf)
- [Digital Personal Data Protection Rules, 2025](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)
- [DPDP commencement notification, G.S.R. 843(E)](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf)
- [Information Technology Rules, 2011, G.S.R. 313(E)](https://upload.indiacode.nic.in/showfile?actid=AC_CEN_45_76_00001_200021_1517807324077&filename=GSR313E_10511%281%29_0.pdf&type=rule)

## Completion instructions

The reviewer should complete every applicable response, cite primary authority, identify assumptions, and mark any unresolved question. Approve automatic Recovery and opt-in Saved workspaces separately for the exact release commit and final copy; blank, conditional, or required-change responses are not release approval. Return the completed packet without real taxpayer data. The Wayfinder ticket remains open until the response records the reviewer qualification, review date, exact approved boundary, and required changes.
