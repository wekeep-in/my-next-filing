# My Next Filing privacy legal review packet

Prepared: 29 August 2026

## Review requested

Please review the proposed Google Analytics and privacy posture for the public My Next Filing prototype. Record approval or exact required changes in the response section. This packet supplies product facts and proposed controls; it does not offer a legal conclusion.

## Product facts

- Public static website at `mynextfiling.com`, focused on users in India.
- No account, login, backend, database, server function, government connection, or cloud Profile storage.
- Questionnaire answers and money amounts stay only in current-page memory and clear on refresh or close.
- The Application does not collect a name, PAN, Aadhaar number, GSTIN, email address, phone number, bank account, password, or OTP.
- The supported audience is a resident individual providing IT or software consulting. The site is intended for adults but is publicly accessible.
- Google Analytics is the only proposed third-party data collection.
- The law research date is 29 August 2026. Relevant DPDP duties identified in the research take effect on 13 May 2027.

## Proposed Analytics controls

- Production GA4 only. Local and preview deployments have no measurement ID and send nothing.
- Basic opt-in consent. Do not load `gtag.js`, create a GA cookie, or send a cookieless ping before `Allow analytics`.
- Equal `Allow analytics` and `Do not allow` actions. Rejection does not affect the Application.
- Manual `page_view` only, using an allowlisted route name, fixed route title, and canonical origin plus allowlisted pathname.
- Ignore query strings and hashes. Report every unmatched route as `/not-found`.
- Never send Profile facts, state or Union territory, answers, money, tax or GST results, deadline status, validation errors, example selection, unsupported reasons, a name, `user_id`, user properties, or custom events.
- Enhanced measurement, Google signals, advertising features, product links, User-ID, user-provided data, custom dimensions, Measurement Protocol, and BigQuery export off.
- Session Analytics cookies with `cookie_expires: 0` and `cookie_update: false`.
- GA4 user and event retention set to 14 months with reset on new activity off.
- Withdrawal stops future events, denies all consent types, and removes first-party Analytics cookies where possible. It does not alter the current questionnaire.
- `Analytics choices` remains available from the persistent footer.
- If counsel cannot close the child-processing question, Analytics stays disabled on and after 13 May 2027.

## Operator details to complete

| Item | Review response |
| --- | --- |
| Legal operator name |  |
| Entity or individual status |  |
| Business address, if the notice requires one |  |
| Monitored privacy contact |  |
| Grievance contact, if different |  |

## Questions for counsel

For each item, answer **Approved**, **Change required**, or **Not applicable**, then provide the final wording or configuration when a change is required.

1. Does the operator fall within the current Information Technology Rules 2011 obligations, including the privacy-policy requirement, before 13 May 2027?
2. From 13 May 2027, is the operator a Data Fiduciary for the proposed GA4 metadata, and is affirmative consent the correct basis?
3. Does the proposed consent notice itemize the data and purpose adequately? What exact proof-of-consent record must the static site retain?
4. How may a public adult-focused site avoid Analytics processing for users under 18 without collecting identity data, adding a backend, or performing age verification? Is disabling Analytics from 13 May 2027 the required fallback?
5. Does GA4's 14-month user and event retention, monthly deletion, and continued standard aggregate reporting satisfy applicable retention and erasure duties?
6. What access, correction, erasure, withdrawal, and grievance workflow must the operator provide? State the response periods and required contact details.
7. Are Google's processor terms, security commitments, breach support, and overseas processing terms sufficient? Identify any agreement, assessment, or disclosure the operator must complete.
8. Does the proposed session-cookie configuration and basic consent mode meet the applicable cookie and notice requirements?
9. Approve or replace the consent copy below.
10. Approve the privacy-page content checklist in the cited research report or provide exact changes.

## Proposed consent copy

> We use Google Analytics to count visits and page views. If you allow it, Google receives a random browser identifier, the page path and title, approximate location, and browser and device information. We never send your answers, amounts, or results. Your choice does not change how the application works.

Actions:

- `Allow analytics`
- `Do not allow`
- `Privacy details`

## Review response

| Decision | Response |
| --- | --- |
| Approved for public release before 13 May 2027 |  |
| Approved for operation on and after 13 May 2027 |  |
| Required code or GA4 configuration changes |  |
| Required consent-copy changes |  |
| Required privacy-page changes |  |
| Required contracts, assessments, or records |  |
| Required re-review date |  |
| Reviewer name and qualification |  |
| Review date |  |

## Evidence supplied

- [Analytics and privacy posture](research/analytics-and-privacy-posture.md)
- [Digital Personal Data Protection Act, 2023](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023-1.pdf)
- [Digital Personal Data Protection Rules, 2025](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)
- [DPDP commencement notification, G.S.R. 843(E)](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf)
- [Google Analytics privacy disclosures policy](https://support.google.com/analytics/answer/7318509?hl=en)
