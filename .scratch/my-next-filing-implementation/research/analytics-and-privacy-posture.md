# Analytics and privacy posture

Research date: 29 August 2026

Authority used: current Government of India legislation and notifications, and official Google Analytics documentation. `SPEC.md` remains the product authority.

This is implementation research, not legal advice. Formal privacy text and the unresolved child-user and retention questions below still need Indian privacy counsel before public release.

## Decision

Use a production-only GA4 property through `gtag.js`. Collect only sanitized page views after an adult visitor gives a clear affirmative choice. Use basic consent mode: do not load the Google tag and do not send cookieless pings before consent. A rejection or withdrawal sends nothing further to Google and has no effect on the questionnaire, calculation, saved profile, or result.

Keep the integration deliberately small:

- One local Analytics module loads `gtag.js` only when the production enable flag and measurement ID exist and the visitor has allowed Analytics.
- The only event is `page_view`.
- Event data is limited to a fixed route name, a fixed route title, and a sanitized location made from the canonical origin and an allowlisted pathname. Ignore the query string and hash. Report every unmatched route as `/not-found`, never as the visitor-supplied path.
- Never pass application state to the Analytics module. Do not send questionnaire answers, profile flags, state or Union territory, money, credits, tax or GST results, deadline status, validation errors, example selection, or unsupported reasons.
- Do not set `user_id`, user properties, custom dimensions, custom metrics, custom events, or ecommerce data.
- Turn off enhanced measurement, automatic event detection, Google signals, advertising personalization, and all Google Ads and other product links. Turn on email and query-parameter redaction as a backup, not as the primary control.
- Set the GA4 user and event retention control to 14 months and turn off "Reset user data on new activity." Use session-based Analytics cookies with `cookie_expires: 0` and `cookie_update: false`.
- Treat every Analytics call as optional. Do not await it in a route transition or evaluation path. Catch loader errors and leave the application unchanged.

This meets the locked requirement to use Analytics without letting Analytics receive profile, money, or result data or control application behavior.

## What is binding, and when

### Position on 29 August 2026

Most of the Digital Personal Data Protection Act, 2023 provisions that govern private processing are not yet in force. The commencement notification brings sections 3 to 5, most of section 6, sections 7 to 17, and the related enforcement provisions into force 18 months after 13 November 2025, which is 13 May 2027. Consent Manager registration starts earlier, on 13 November 2026, but this site is not acting as a statutory Consent Manager. [MeitY commencement notification, G.S.R. 843(E)](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf)

Until section 44(2) of the DPDP Act takes effect on 13 May 2027, section 43A of the Information Technology Act, 2000 and the 2011 Sensitive Personal Data or Information Rules remain relevant. Section 43A applies to a company, firm, sole proprietorship, or association engaged in commercial or professional activity that handles sensitive personal data and negligently fails to maintain reasonable security, causing wrongful loss or gain. [India Code, Information Technology Act section 43A](https://www.indiacode.nic.in/handle/123456789/1362/simple-search?query=The+Information+Technology+%28Reasonable+Security+Practices+and+Procedures+and+Sensitive+Personal+Data+or+Information%29+Rules%2C+2011.&searchradio=rules)

The 2011 Rules require an applicable body corporate to publish a privacy policy that states its practices, the types of personal and sensitive data handled, purpose and use, disclosures, and security practices. Their express consent rule applies to the enumerated sensitive categories, such as passwords, financial account or payment-instrument details, health, sexual orientation, medical records, and biometrics. Ordinary GA4 page and device metadata is not on that sensitive-data list, although a GA client identifier and associated events may still be "personal information" under the Rules' broader definition. [Official 2011 Rules, G.S.R. 313(E)](https://upload.indiacode.nic.in/showfile?actid=AC_CEN_45_76_00001_200021_1517807324077&filename=GSR313E_10511%281%29_0.pdf&type=rule)

Counsel must confirm whether the site operator and its relationship with visitors fall within the current Rule 4 wording. The product should publish the policy regardless. Google currently requires every Analytics customer to disclose the use of Google Analytics and explain how it collects and processes data. This is a Google service requirement, not an Indian statute. [Google Analytics Privacy Disclosures Policy](https://support.google.com/analytics/answer/7318509?hl=en)

I did not find a currently effective Indian rule that expressly requires opt-in consent for ordinary page-analytics cookies. The no-tracking-before-consent design is therefore a conservative product decision today. It also avoids a second implementation when the DPDP provisions take effect.

### Requirements from 13 May 2027

Assume that the GA client ID, session information, approximate location, browser and device data, and page activity are digital personal data. Google says its default implementation collects session statistics, approximate geolocation, and browser and device information, and stores a client ID in the `_ga` first-party cookie when Analytics storage is enabled. [Google Analytics data collection](https://support.google.com/analytics/answer/11593727?hl=en)

On that assumption, the site operator determines the page-measurement purpose and must satisfy the Data Fiduciary duties. Do not rely on a "certain legitimate use" for Analytics. Use consent.

The consent must be free, specific, informed, unconditional, unambiguous, and shown through clear affirmative action. It must cover only personal data necessary for the stated purpose. Withdrawal must be as easy as giving consent, and the operator must cause its processor to stop processing within a reasonable time after withdrawal unless another law authorizes continued processing. The operator must be able to prove that it gave notice and obtained valid consent. [DPDP Act, sections 5 and 6](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023-1.pdf)

The notice must stand on its own in clear language. It must itemize the personal data, state the purpose, and link to withdrawal, rights, and complaint methods. The site must publish a business contact for privacy questions and a way to make rights requests and grievances. [DPDP Rules 2025, rules 3, 9, and 14](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)

The Act also requires reasonable security safeguards, breach notice, erasure when consent is withdrawn or the stated purpose is no longer served, and processor compliance. The Rules specify minimum security controls and breach notices to affected people without delay and to the Data Protection Board, including a detailed submission within 72 hours. [DPDP Act, section 8](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023-1.pdf) and [DPDP Rules 2025, rules 6 and 7](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)

Rule 8(3) requires personal data and processing logs to be retained for at least one year for the government-access purposes in the Seventh Schedule, then erased unless another law requires further retention. Google offers a standard GA4 property only 2-month or 14-month user and event retention. The 14-month option is the only available setting that clears the one-year floor; turning reset off prevents a returning visitor from extending the user-level clock indefinitely. Google deletes expired data monthly and says the retention setting does not affect standard aggregated reports. [DPDP Rules 2025, rule 8(3) and Seventh Schedule](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf) and [Google Analytics data retention](https://support.google.com/analytics/answer/7667196?hl=en)

The Act requires verifiable parental consent before processing a child's personal data and prohibits tracking or behavioural monitoring of children. A child is under 18, and the Rules prescribe identity and age checks for the parent. A generic "I am 18" checkbox is not verifiable parental consent. The site's adult taxpayer audience does not itself resolve access by a child. [DPDP Act, section 9](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023-1.pdf) and [DPDP Rules 2025, rule 10](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)

## Consent and user controls

Show a compact consent panel before any Google script or request. Neither choice is preselected. Use equally clear actions:

- `Allow analytics`
- `Do not allow`

The panel should say, in substance:

> We use Google Analytics to count visits and page views. If you allow it, Google receives a random browser identifier, the page path and title, approximate location, and browser and device information. We never send your answers, amounts, or results. Your choice does not change how the application works.

Link `Privacy details` to `/privacy`. Save only the choice, policy version, and decision time in browser storage. Keep that record separate from the saved questionnaire. A blocked-storage browser may keep the choice in memory for the current page; on a later visit, ask again rather than assume consent.

Put `Analytics choices` in the persistent footer. Withdrawal must immediately stop future events, deny every consent type, remove the first-party `_ga` and property cookie where possible, and leave the application state untouched. Explain that withdrawal does not retroactively erase data already processed. The privacy page must give a monitored contact route for access, erasure, and grievance requests. Google supports deletion by effective user ID in User Explorer, but mapping a no-account visitor to a pseudonymous client ID is an operational problem that counsel must review. [Google User Explorer deletion controls](https://support.google.com/analytics/answer/9283607?hl=en)

Basic consent mode is the right fit. Google states that basic mode blocks tags until the user interacts and sends no data before consent, while advanced mode sends cookieless pings after denial. This site has no advertising or conversion-modeling need that justifies advanced mode. [Google consent mode](https://support.google.com/analytics/answer/10000067?hl=en)

## GA4 configuration baseline

Use these settings as a release checklist. They are product recommendations unless a binding source above says otherwise.

| Control | Required setting | Reason |
| --- | --- | --- |
| Deployment | Production only | Required by `SPEC.md`; preview and local builds send nothing. |
| Tag loading | Basic consent mode | No request or cookieless ping before consent. |
| Events | Manual `page_view` only | Page analytics is required; every other event is unnecessary. |
| Page location | Canonical origin plus allowlisted pathname | Google collects URLs and titles by default; arbitrary paths, queries, and hashes could leak entered data. [Google PII guidance](https://support.google.com/analytics/answer/6366371?hl=en) |
| Enhanced measurement | Off | It can collect outbound links, search terms, file downloads, videos, and form interactions. [Google enhanced measurement](https://support.google.com/analytics/answer/9216061?hl=en) |
| User and event data retention | 14 months, reset on new activity off | Closest GA4 setting that clears the future one-year rule without indefinite refresh. |
| Analytics cookies | Session only, `cookie_expires: 0`, `cookie_update: false` | Cross-session identification is unnecessary for page analytics. Google supports a zero-second session cookie. [Google cookie configuration](https://developers.google.com/tag-platform/security/guides/customize-cookies) |
| Google signals | Off | Avoid signed-in association, demographics, interests, and join beacons. [Google privacy controls](https://support.google.com/analytics/answer/9019185?hl=en) |
| Advertising | `ad_storage`, `ad_user_data`, and `ad_personalization` always denied; advertising personalization off | The product has no advertising purpose. [Google consent types](https://support.google.com/analytics/answer/12334711?hl=en) |
| Product links | No Google Ads or other product links | Exported linked data leaves GA's controls. [Google data safeguards](https://support.google.com/analytics/answer/6004245?hl=en) |
| Data sharing | Turn off optional sharing | No product requirement needs it. |
| Data redaction | Email redaction on; redact every query parameter | Backup for mistakes. Google describes redaction as best effort, so code must still sanitize first. [Google data redaction](https://support.google.com/analytics/answer/13544947?hl=en) |
| User features | No User-ID, user-provided data, custom dimensions, Measurement Protocol, or BigQuery export | They add identification or data copies with no page-analytics need. |

Google's default cookies last two years and distinguish users and sessions. That default is unnecessary here, which is why the decision uses session cookies. [Google Analytics cookie usage](https://support.google.com/analytics/answer/11397207?hl=en)

## Privacy-page content

The reviewed `/privacy` page must state:

1. Who operates the site and a monitored business contact for privacy requests.
2. Questionnaire answers stay in the visitor's browser, what fields are saved, and how `Delete my saved answers` works.
3. Google Analytics runs only in production and only after permission.
4. The exact Analytics data categories, page-measurement purpose, Google as recipient or processor, first-party cookie names and session lifetime, 14-month user and event retention, and the possible persistence of non-user-level aggregate reports.
5. No profile, answer, money, tax result, GST result, name, or application user identifier goes to Analytics.
6. How to allow, reject, or withdraw, and that rejection has no effect on the application.
7. How to request access, correction, erasure, or grievance handling, and the published response period once rule 14 applies.
8. That Google may process data outside India, subject to the applicable terms and future government transfer restrictions.
9. That the service is intended for adults and the child-user limitation counsel approves.
10. The policy version, effective date, and a link to Google's explanation of data use.

## Legal-review gates

Counsel must approve these points before public release and review them again before 13 May 2027:

1. Whether the operator is a current Rule 4 body corporate and whether the proposed privacy notice satisfies the 2011 Rules.
2. Whether the selected GA metadata is personal data under the DPDP Act and whether consent is the correct basis.
3. How a public adult-focused site must prevent Analytics processing for visitors under 18 without collecting more identity data or adding a backend.
4. Whether GA4's 14-month user/event retention, monthly deletion, and persistent standard aggregates satisfy rules 8(3) and the Act's erasure duty.
5. Whether Google's processor terms, security commitments, overseas processing, rights workflow, and breach support are sufficient for the operator's duties.
6. The final consent and privacy copy, business contact, grievance period, and proof-of-consent record.

Do not keep Analytics enabled on or after 13 May 2027 if counsel cannot close the child-processing conflict. This is the one point where the static, no-account architecture and a public audience may not be enough by themselves.

## Release evidence

Before release, record one browser-network check that proves all of the following:

- Local and preview builds contain no measurement ID, load no Google tag, and send no Analytics request.
- A fresh production visit before choice sends no Google request and sets no `_ga` cookie.
- Reject sends no request. Reloading preserves the rejection when browser storage works.
- Allow sends only a sanitized `page_view`. Tests with money, rupee symbols, unsupported answers, result values, query strings, hashes, and arbitrary unmatched paths show none of those values in request URLs or payloads.
- Route changes send fixed route names and titles only. Form interaction and outbound source clicks send no events.
- Withdrawal stops later events and removes Analytics cookies without deleting or changing the saved questionnaire.
- Blocking `googletagmanager.com` and `google-analytics.com` does not change any route, validation, evaluation, result, or deletion behavior.
- The GA property settings match the baseline above, because most of them live outside source control.
