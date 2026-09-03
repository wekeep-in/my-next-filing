# My Next Filing saved-workspace privacy applicability review

Prepared: 2 September 2026

Review status: Awaiting a qualified Indian privacy reviewer

## Review requested

Please review the planned browser-only saved workspace for the successor to My Next Filing. Record approval or exact required changes in the response section. This packet supplies product facts, technical facts, and proposed safeguards. It does not offer a legal conclusion.

The review must cover operation before and on or after 13 May 2027. It must state the exact product and Analytics configuration to which the opinion applies.

Do not add real taxpayer data, contact details, account identifiers, or production credentials to this packet.

## Current product

- My Next Filing is a public static React application at `mynextfiling.wekeep.in` for resident-individual freelancers in India.
- It has no account, login, backend, database, server function, government connection, filing action, payment action, cloud Profile storage, reminder, or user-contact identifier.
- The current release keeps Profile answers and calculated results in memory. A reload clears them.
- The current release does not collect a name, PAN, Aadhaar number, GSTIN value, email address, phone number, bank-account details, password, OTP, client identity, invoice, or document.
- The application uses a versioned local Rule dataset and stops personalized calculation when Rules are invalid, stale, or do not cover the declared Profile.
- Production currently downloads and executes Google Analytics `gtag.js` on the application origin. It sends allowlisted route views with fixed titles and route-only locations. Local and preview deployments do not load it.

## Planned successor behavior

The first successor release broadens verified income-tax support to eligible solo digital freelancers with domestic or Foreign professional receipts. It adds an optional saved filing workspace on the current browser and Completion records for supported income-tax Obligations. It does not add cloud sync, document processing, reminders, government integration, or a GST-return calendar.

Saving remains off until the user explicitly chooses it. The unsaved journey remains fully usable.

The provisional saved envelope contains only:

- a schema version;
- the Tax Year identity;
- declared Profile facts needed by Evaluation, including occupation and scope answers, state or Union territory, money inputs, and tax-credit inputs;
- Completion records containing the supported Obligation identity, Tax Year, and user-declared completion date; and
- local metadata needed to enforce the retention and migration rules later approved for the product.

The saved envelope does not contain:

- a calculated result, display copy, or Rule copy;
- a name, PAN, Aadhaar number, GSTIN value, email address, phone number, bank or payment-account identifier, password, or OTP;
- a client, platform-account, invoice, transaction, document, free-text note, or acknowledgement number; or
- an Analytics identifier, campaign value, page history, or data copied from Analytics.

On restore, the application treats browser storage as untrusted input, validates the whole envelope, and runs Evaluation against current valid Rules. It does not trust a stored calculation.

A Completion record means only that the user marked an Obligation complete. It does not show government filing, payment, acceptance, or verification.

## Technical boundary requiring review

The proposed store is one namespaced, versioned `localStorage` value on the application origin. Browser storage is origin-wide and is readable by scripts executing in that page.

The current Google Analytics script executes with the page's privileges and can technically read the saved value even if application code never passes it to Analytics. Moving the value to IndexedDB would not isolate it from page scripts. A route allowlist does not solve this in the current single-page application because the remote script remains loaded after navigation.

The later product decision will choose among:

1. removing remote Analytics JavaScript from the origin that stores the workspace;
2. serving the saved workspace from a separate origin where remote Analytics code never executes; or
3. retaining the remote script and accurately disclosing and controlling that third-party trust boundary.

Please state which options are legally permissible, which safeguards each requires, and whether any option remains unacceptable for the proposed data.

## Proposed minimum safeguards

- Treat Profile values and Completion records as personal data even if a legal exclusion might apply.
- Give storage and Analytics separate choices. Rejecting either one does not impair the calculator.
- Explain the saved fields, purpose, current-browser scope, shared-browser exposure, loss risk, retention, deletion path, and lack of account, sync, backup, or recovery before saving.
- Warn users not to save on a shared or public browser.
- Save no partial questionnaire or example data before opt-in.
- Confirm saving only after the storage write succeeds.
- Validate restored data and known migrations before Evaluation. Reject an unknown newer schema and do not silently overwrite invalid saved data.
- Delete only My Next Filing's namespaced workspace data, clear its current in-memory state, and coordinate other open tabs. Do not call `localStorage.clear()`.
- Keep Profile and Completion data out of URLs, titles, logs, error reporting, Analytics, external links, and generic sharing.
- Use HTTPS, restrictive security headers, a Content Security Policy matched to the selected Analytics boundary, self-hosted non-Analytics assets, and dependency review.
- Do not claim that browser storage is encrypted, permanent, backed up, private from other browser users, securely erased, or available on another device.

## Draft storage notice for review

> Save this profile and the filing completions you mark in this browser. Anyone using this browser profile may be able to see them. There is no account, sync, backup, or recovery. Private browsing or clearing site data may remove them.

Actions:

- `Save on this device`
- `Continue without saving`
- `Privacy details`

Proposed deletion confirmation:

> Removed My Next Filing's saved profile and completion records from this browser.

Proposed completion qualification:

> Marked complete by you. My Next Filing has not verified government acceptance.

Please approve or replace each statement. State any notice that must appear earlier, remain persistently available, or name the legal operator and contact.

## Questions for the reviewer

For each item, answer **Approved**, **Change required**, **Not applicable**, or **Unable to conclude**. Cite the controlling authority and provide exact wording or configuration when a change is required.

1. Before 13 May 2027, do the Information Technology Act, 2000 and the Information Technology Rules, 2011 apply to the planned browser-only processing? Are receipts, profit, interest, tax paid, and tax withheld "financial information" or otherwise sensitive personal data when no bank-account or payment-instrument identifier is stored?
2. When Profile values remain in a browser chosen and controlled by the user, are they collected, received, possessed, dealt with, or handled by the operator for current-law purposes?
3. On and after 13 May 2027, is the operator a Data Fiduciary for this browser-only processing under the Digital Personal Data Protection Act, 2023? If not, identify the exact exclusion and facts on which the conclusion depends.
4. Is affirmative opt-in the correct basis for storage? What itemised notice, purpose statement, withdrawal path, and proof of notice or consent must the operator retain when the product has no account, backend, or user-contact identifier?
5. Is a locally stored consent choice sufficient evidence? If not, what is the smallest compliant approach that does not send the Profile or Completion records to a server?
6. What retention period or inactivity rule applies to the active Profile and archived Completion records? Must the user be able to delete one Tax Year separately, or is deleting the whole workspace sufficient?
7. Does the proposed deletion behavior satisfy applicable erasure duties? Which claims about browser backups, private browsing, other open tabs, device storage, or prior Analytics processing must the product avoid?
8. What access, correction, erasure, withdrawal, grievance, and nomination processes must exist without an account or user-contact identifier? State required contact details and response periods.
9. What reasonable security safeguards apply? State requirements for Content Security Policy, third-party scripts, dependency review, incident response, breach notification, records, and processor contracts.
10. Can Google Analytics execute on the same origin as saved Profile and Completion data? If yes, state the required consent, configuration, disclosure, processor terms, overseas-processing analysis, data minimisation, and retention. If no, state whether removal or origin separation is required.
11. How should the public adult-focused product handle users under 18 without collecting age or identity data? State whether storage, Analytics, or the entire product must be unavailable to them.
12. May the product consider the four proposed parameter-free events: saving enabled for a Tax Year, later-date workspace resume, saved-data deletion, and generic homepage sharing? State whether each is permissible and what identifier, retention, and consent limits apply.
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
| Approved Analytics boundary |  |
| Required notice and consent wording |  |
| Required proof of notice or consent |  |
| Required retention and deletion behavior |  |
| Required user-rights and grievance process |  |
| Required child-user behavior |  |
| Required safeguards and breach process |  |
| Approved production measurement events |  |
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
- [Current Analytics implementation](../../src/analytics.ts)
- [Digital Personal Data Protection Act, 2023](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf)
- [Digital Personal Data Protection Rules, 2025](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)
- [DPDP commencement notification, G.S.R. 843(E)](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf)
- [Information Technology Rules, 2011, G.S.R. 313(E)](https://upload.indiacode.nic.in/showfile?actid=AC_CEN_45_76_00001_200021_1517807324077&filename=GSR313E_10511%281%29_0.pdf&type=rule)

## Completion instructions

The reviewer should complete every applicable response, cite primary authority, identify assumptions, and mark any unresolved question. Return the completed packet without real taxpayer data. The Wayfinder ticket remains open until the response records the reviewer qualification, review date, exact approved boundary, and required changes.
