# Agent review of saved-workspace privacy applicability

Reviewed: 2 September 2026

Review type: Evidence-backed agent analysis, not a qualified legal opinion

## Decision for product planning

The browser-only saved workspace can continue through product planning under a conservative boundary. Before saving is implemented, remove Google Analytics and all other remotely executed third-party JavaScript from the storage origin, treat the saved Profile and Completion records as personal data, use explicit and separate storage consent, minimise the stored fields, publish a privacy contact and self-service controls, and enforce the security and failure rules in the persistence research.

Do not treat this review as legal approval for public release. If qualified Indian privacy review is still unavailable, the safest release rule is:

- the unsaved in-memory calculator may continue under its separately reviewed privacy posture;
- the saved workspace must not launch until the current-law SPDI questions are accepted as a documented operator risk; and
- the saved workspace must fail closed no later than 13 May 2027 unless qualified review or a later official clarification resolves the DPDP consent-proof, security-retention, breach-notification, rights, and child-user issues identified below.

This review is sufficient to unblock conservative product design. It is not sufficient to close the qualified-review release gate.

## Confidence labels

- **Text** means the conclusion follows directly from the linked Act, Rule, or first-party documentation.
- **Inference** means the source supplies the legal or technical test but does not decide this exact browser-only design.
- **Unresolved** means the reviewed primary sources do not answer the point safely enough for a release claim.
- **Recommendation** is the smallest product choice that avoids relying on the unresolved point.

## Applicability before 13 May 2027

**Text.** Section 43A of the Information Technology Act applies to a body corporate that possesses, deals with, or handles sensitive personal data in a computer resource that it owns, controls, or operates. Its definition of body corporate includes a sole proprietorship engaged in commercial or professional activity. The 2011 SPDI Rules require a published privacy policy and impose collection, consent, purpose, retention, review, withdrawal, disclosure, transfer, grievance, and security duties when their conditions are met. Electronic communication can supply Rule 5 consent. [Information Technology Act, 2000, section 43A](https://www.indiacode.nic.in/bitstream/123456789/13116/1/it_act_2000_updated.pdf), [SPDI Rules, 2011, G.S.R. 313(E)](https://upload.indiacode.nic.in/showfile?actid=AC_CEN_45_76_00001_200021_1517807324077&filename=GSR313E_10511%281%29_0.pdf&type=rule), [MeitY clarification issued 24 August 2011](https://www.pib.gov.in/newsite/erelcontent.aspx?lang=2&reg=48&relid=74990)

**Unresolved.** The SPDI definition names financial information such as bank-account, credit-card, debit-card, and payment-instrument details. The planned envelope excludes those identifiers but includes receipts, profit, interest, tax paid, and tax withheld. The sources reviewed do not decide whether those aggregate values alone are SPDI. They also do not decide whether the operator possesses, controls, or operates a value that application code stores only in a visitor-controlled browser and never receives.

**Recommendation.** Do not claim that the 2011 regime is inapplicable. Apply its protective controls voluntarily, publish the required-style privacy information, and record this classification and control question as an operator risk until qualified review settles it.

## Applicability on and after 13 May 2027

**Text.** The DPDP Act defines personal data as data about an individual identifiable by or in relation to it. Processing expressly includes collection, recording, storage, retrieval, use, erasure, and destruction. A Data Fiduciary is the person who determines the purpose and means of processing. Sections 3 through 17 and most operational Rules take effect eighteen months after the 13 November 2025 Gazette publication, which is 13 May 2027. [DPDP Act, 2023, sections 2 and 3](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf), [commencement notification G.S.R. 843(E)](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf), [DPDP Rules, 2025, rule 1](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)

**Inference.** The operator selects which Profile and Completion fields the application stores and why, so the operator appears to determine the purpose and means. The personal-or-domestic-purpose exclusion applies to processing by an individual for that individual's own purpose; relying on it for the operator of a public application is unsafe. The absence of a name does not by itself make a detailed tax Profile non-personal when the record is presented back to the person to whom it relates.

**Unresolved.** Several DPDP duties refer to data in the Data Fiduciary's possession or control. The Act and Rules do not expressly decide how those duties apply when the only durable copy remains in the Data Principal's browser and the operator has no technical path to retrieve it. Do not claim that this architecture is outside the Act without qualified review.

## Notice, consent, and proof

**Text.** Consent must be free, specific, informed, unconditional, unambiguous, affirmative, and limited to necessary data. The notice must independently provide an itemised description of the personal data, the specified purpose, and links or means to withdraw consent, exercise rights, and complain. Withdrawal must be as easy as consent. If consent is disputed in a proceeding, the Data Fiduciary must prove that compliant notice and consent were given. [DPDP Act, sections 5 and 6](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf), [DPDP Rules, rule 3](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)

**Recommendation.** Keep storage consent separate from Analytics consent. Store the accepted notice version and decision time inside the local envelope. Keep every published notice version and deployment identity in the repository. Provide persistent controls to review saved fields, edit them, stop saving, and delete the workspace.

**Unresolved.** A local consent record and repository history may show the designed flow, but they cannot prove that a particular unidentified visitor received the notice and consented. A server-side consent receipt would add personal-data processing and contradict the current no-backend scope. This proof question requires qualified review before operation under the substantive DPDP provisions.

## Retention, erasure, and recovery

**Text.** The Act generally requires erasure when consent is withdrawn or the specified purpose is no longer served, unless another law requires retention. Rule 8 applies prescribed inactivity periods only to the large classes in its Third Schedule, which does not describe this product. Rule 8 also contains a broader minimum one-year retention rule for personal data and processing logs for the Seventh Schedule purposes. [DPDP Act, section 8](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf), [DPDP Rules, rule 8 and Third and Seventh Schedules](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)

**Unresolved.** The interaction between withdrawal erasure, browser-only deletion, and Rule 8's one-year retention text is not safe to decide here. The operator cannot both remove the only local copy on demand and retain an inaccessible compliance copy for a year without changing the architecture.

**Recommendation.** The product decision may choose a short, explicit convenience-retention period and immediate user-controlled deletion, but public release after 13 May 2027 requires qualified confirmation that this does not conflict with Rule 8. Do not claim backup, permanence, secure erasure, or deletion from browser or operating-system backups.

## Rights, contact, and grievance handling

**Text.** The Act supplies access, correction, updating, erasure, grievance, and nomination rights. The Rules require the means to exercise rights, a prominently published business contact, and a published grievance-response period no longer than ninety days. [DPDP Act, sections 11 through 14](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf), [DPDP Rules, rules 9 and 14](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)

**Recommendation.** The workspace should show, edit, and delete its whole local record without operator involvement. The public privacy page still needs the legal operator name, a monitored business contact, a grievance path, a stated response period, and an explanation that the operator cannot locate a browser-only record remotely. The user can exercise local correction and erasure only on the browser profile that holds it.

## Security and breach response

**Text.** The Rules require minimum safeguards covering appropriate protection such as encryption, obfuscation, masking, or tokens; access control; logs and monitoring; continuity; one-year retention for detection and investigation; processor contracts; and technical and organisational controls. Breaches require notice to each affected Data Principal without delay and Board notice without delay followed by details within seventy-two hours. [DPDP Rules, rules 6 and 7](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)

**Technical fact.** `localStorage` is origin-wide, visible to JavaScript on that origin, vulnerable to same-origin XSS and compromised dependencies, best-effort rather than a backup, and visible to anyone using the same unlocked browser profile. An externally hosted script included directly in the page runs with the page's privileges. [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html), [MDN third-party script security](https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement/src#security_considerations)

**Recommendation.** Remove remote Analytics JavaScript before saving. Keep all runtime assets self-hosted, use a restrictive Content Security Policy and security headers, validate stored data as untrusted input, audit dependencies, avoid free text and identifiers, coordinate concurrent tabs, and document incident response. Do not add cosmetic encryption whose key ships with the application.

**Unresolved.** With no account or registered communication channel, the operator cannot identify or contact every person affected by a compromised script or release. A prominent next-visit notice may be useful, but the source text does not establish it as sufficient. The breach-notification and one-year security-record duties require qualified review or a changed architecture before the post-commencement saved workspace launches.

## Children

**Text.** A child is anyone under eighteen. Before processing a child's personal data, a Data Fiduciary must obtain verifiable parental consent, and the general exemptions in the Fourth Schedule do not cover a public tax-planning application. [DPDP Act, sections 2 and 9](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf), [DPDP Rules, rules 10 and 12 and Fourth Schedule](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)

**Recommendation.** State that the saved workspace is for adults and require an affirmative eighteen-or-older confirmation before storage. Do not save data or load Analytics when the user is under eighteen or does not confirm. Do not collect a date of birth or identity document merely to support this small feature.

**Unresolved.** An adult self-declaration is not verifiable parental consent for a child who uses the product. Whether the adult-only boundary and proportionate checks are sufficient requires qualified review. The fail-closed post-commencement rule remains necessary.

## Google Analytics and product measurement

**Technical fact.** The current implementation loads `gtag.js` immediately on production route visits. Google's basic consent mode can prevent the tag from loading and sending any data until consent, while advanced consent mode still sends cookieless measurements when Analytics storage is denied. Neither mode prevents a loaded third-party script from reading same-origin storage. [Google consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode)

**Recommendation.** Remove Google Analytics from the application before enabling the saved workspace. Do not replace it with another remotely executed analytics script on the same origin. Reject all four candidate product events for the first successor release. Use the agreed moderated usability gate as the evidence of usefulness. The generic homepage share action remains unmeasured and must contain no personalized data.

This is the simplest enforceable privacy boundary. Consent configuration alone would not support the existing promise that Analytics never receives Profile values once a remote script can read persistent origin storage.

## Review-packet answers

| Review question | Agent conclusion |
| --- | --- |
| Applicable law before 13 May 2027 | The IT Act and SPDI Rules remain relevant. Applicability to aggregate tax values stored only in a user browser is unresolved; use SPDI-grade controls and obtain qualified review. |
| Applicable law on and after 13 May 2027 | Substantive DPDP provisions and matching Rules commence. Treat the operator as a Data Fiduciary for planning; possession or control of browser-only values remains unresolved. |
| SPDI classification and possession or control | Unable to conclude from primary sources. Do not rely on non-applicability. |
| DPDP Data Fiduciary conclusion | Likely on the purpose-and-means test, but not a qualified conclusion. |
| Approved product and storage boundary | Planning approval only for explicit, minimised, current-browser storage with the safeguards above. No legal release approval. |
| Analytics boundary | Remove Google Analytics and other remote runtime scripts before saving. |
| Notice and consent | Use a standalone itemised notice, affirmative opt-in, equal unsaved path, persistent review and withdrawal, and versioned notice records. |
| Proof of consent | Local receipt plus repository history is the minimal design, but legal sufficiency is unresolved. |
| Retention and deletion | Choose explicit product retention and local deletion; Rule 8 interaction needs qualified review before post-commencement operation. |
| Rights and grievance | Provide local view, correction, deletion, a public operator contact, grievance path, and response period of no more than ninety days. |
| Child-user behavior | Saved storage is adult-only; no saving or Analytics for an under-eighteen or unconfirmed user. Legal sufficiency remains unresolved. |
| Safeguards and breach | Self-host runtime code, strict CSP, data minimisation, validation, dependency controls, and incident procedure. Individual breach notice is unresolved without contact data. |
| Production measurement | Reject the four candidate events for the first successor release. |
| Release before 13 May 2027 | Not legally approved. A conservative pre-commencement release may be considered only after the operator accepts the documented SPDI risk and completes security and privacy controls. |
| Operation on and after 13 May 2027 | Fail closed unless qualified review or later official guidance resolves the listed DPDP conflicts. |
| Re-review trigger | Any storage-schema, third-party script, Analytics, backend, account, export, age-boundary, law, Rule, notification, or 13 May 2027 commencement change. |

## Residual review required

A qualified Indian privacy reviewer must still settle:

- SPDI classification of aggregate income and tax values;
- operator possession or control of browser-only storage;
- the DPDP Data Fiduciary conclusion;
- proof of notice and consent without a user identifier;
- Rule 8 retention versus immediate local deletion;
- reasonable safeguards for plaintext browser storage;
- breach notice without an account or registered communication channel; and
- the adult-only boundary without identity or age verification.

Until those points are settled, this document is a conservative planning input and risk register, not an approval to launch.
