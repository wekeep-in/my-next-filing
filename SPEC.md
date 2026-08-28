# My Next Filing product specification

| Item | Value |
| --- | --- |
| Document type | Product specification |
| Status | Approved for implementation |
| Product | My Next Filing |
| Domain | `mynextfiling.com` |
| Author | Sarthak Mishra |
| Software licence | Apache License 2.0 |
| Statutory period | Tax Year 2026-27 |
| Law verification date | 29 August 2026 |
| Document language | ASD-STE100 Simplified Technical English |

## Problem Statement

I receive repeated compliance reminder emails from service firms and tax professionals. The reminders create noise. They do not give me one clear view of the obligations that apply to me.

I have missed GSTR-1, GSTR-3B, and advance-tax deadlines. I have paid late fees and interest. More reminders did not solve the problem. I need a page that I can open when I choose. The page must tell me what comes next, why it can apply, and where I can learn how to act.

The first release does not support my complete historical profile. It supports one narrow profile. This limit makes the result understandable and testable. The supported user is a GST-unregistered resident individual who provides IT or software consulting to clients in India.

The current public information has these problems:

- Government portals organize information by law, form, and filing process.
- A new taxpayer often does not know which form or process to search for.
- Commercial reminders often name a deadline without a personal explanation.
- A reminder does not show which facts made an obligation relevant.
- Different websites can use old dates, old section numbers, or old tax terms.
- Due-date extensions can make a copied calendar incorrect.
- A broad compliance calendar can show many items that do not apply.
- A penalty calculator can be wrong when it lacks filing, payment, waiver, or assessment facts.

The user needs a small, pull-based product. The product must give a best-effort result from declared facts. The product must show its limits. It must not claim to replace a tax professional or a government portal.

## Solution

My Next Filing is a public static website. It has no account, backend, or government-system connection.

The application asks the user for a narrow set of facts. The application evaluates the facts against a versioned local rule dataset. It returns one of three results:

1. A supported plan.
2. An unsupported-profile result.
3. A stale-rules result.

For a supported profile, the application gives the user:

- An estimated income-tax calculation.
- An advance-tax applicability result.
- The normal advance-tax deadline.
- The annual income-tax-return deadline.
- A GST-registration threshold status.
- A chronological agenda.
- A short reason for each result.
- The assumptions that the application used.
- A statutory source link.
- One reviewed external tutorial link when a suitable tutorial exists.

The application does not send reminders. It does not file a return. It does not record completion. It does not calculate late fees or interest. It does not give tax or legal advice.

The application stores questionnaire answers in the browser. The user can change the answers or delete the saved answers. The application does not collect a name, PAN, Aadhaar number, GSTIN, email address, phone number, bank account, password, or OTP.

The first release supports only the following profile:

- The user is a resident individual.
- The user uses the new tax regime.
- The user provides IT or software consulting.
- The user works directly for clients in India.
- The user uses presumptive professional taxation under section 58.
- The user does not have a GSTIN.
- The user has no unsupported income, deduction, loss, or tax credit.
- The calculated total income is not more than ₹50 lakh.

The first release covers income earned from 1 April 2026 to 31 March 2027. The interface uses this date range before it uses the term "Tax Year 2026-27."

## User Stories

### Entry and scope

1. As a self-employed IT consultant, I want the landing page to name the supported profile, so that I do not enter data for an unsupported case.
2. As a first-time visitor, I want a short product description, so that I know that the application gives an overview and not a filing service.
3. As a first-time visitor, I want to select "Check my dates," so that I can start with my own information.
4. As a competition reviewer, I want to select "Try an example," so that I can inspect a complete result without tax records.
5. As a cautious taxpayer, I want the landing page to state that the result is best-effort guidance, so that I do not treat it as professional advice.
6. As a privacy-conscious user, I want to know that the application has no account, so that I do not expect an identity check.
7. As a user on a slow connection, I want the core application to load as static files, so that I can start without an application-server request.
8. As a mobile user, I want the first action to remain visible without horizontal scrolling, so that I can start on a small screen.

### Profile confirmation

9. As a user, I want to confirm my profile on one screen, so that I can reject a wrong assumption before I enter amounts.
10. As a user, I want to confirm that I am a resident individual, so that the application does not apply this profile to another taxpayer type.
11. As a user, I want to confirm that I use the new tax regime, so that the application does not mix two slab systems.
12. As a user, I want to confirm that I provide IT or software consulting, so that the application can use the supported profession rule.
13. As a user, I want to confirm that I use presumptive professional taxation, so that the application can use the supported income method.
14. As a user, I want to confirm that I work directly for clients in India, so that the application does not ignore export or platform rules.
15. As a user, I want to confirm that I do not have a GSTIN, so that the application does not omit GST-return deadlines.
16. As a user who cannot make a confirmation, I want a clear unsupported result, so that I do not receive an approximate plan.
17. As an unsupported user, I want the application to name the unsupported fact, so that I know why calculation stopped.
18. As an unsupported user, I want to change the failed answer, so that I do not have to start again.
19. As an unsupported user, I want an official starting link when one is relevant, so that I can continue outside the application.
20. As a returning user, I want my valid confirmations to remain in the browser, so that I do not repeat the full questionnaire.

### Professional receipts and profit

21. As a user, I want to enter gross professional receipts, so that the application can estimate presumptive professional income.
22. As a user, I want a short definition of gross professional receipts, so that I do not subtract expenses or TDS.
23. As a user, I want to enter cash receipts, so that the application can select the correct section 58 receipt limit.
24. As a user, I want cash-receipt help text, so that I include non-account-payee cheques and drafts when required.
25. As a user, I want the cash amount to stay at or below gross receipts, so that I cannot submit an impossible profile.
26. As a user, I want the application to calculate the minimum presumptive profit, so that I can see the 50-percent amount.
27. As a user with higher expected profit, I want to enter the higher amount, so that the estimate does not understate my declared income.
28. As a user, I want the higher profit to stay at or above the minimum presumptive amount, so that the input follows the supported rule.
29. As a user, I want Indian digit grouping in money fields, so that I can read lakh values without counting digits.
30. As a user, I want to paste a rupee symbol or commas, so that common money formats do not cause an input error.
31. As a user, I want negative money values to fail validation, so that the application does not accept an invalid amount.
32. As a user, I want whole-rupee inputs, so that the form does not ask for unnecessary paise.

### Other supported income and tax credits

33. As a user, I want to enter taxable bank or deposit interest, so that the estimate includes the one supported other-income type.
34. As a user, I want the interest field to say "before TDS," so that I enter gross taxable interest.
35. As a user with no bank interest, I want the field to use zero, so that I can continue without an empty error.
36. As a user, I want to enter TDS that was actually deducted, so that the estimate includes a real tax credit.
37. As a user, I want the TDS help text to reject expected TDS, so that I do not claim a credit that does not exist.
38. As a user, I want to enter TCS that was actually collected, so that the estimate includes that supported credit.
39. As a user, I want to enter advance tax already paid, so that the estimate shows the remaining amount.
40. As a user, I want each credit field to explain where I can find the value, so that I do not guess.
41. As a user, I want the application to keep TDS separate from income, so that it does not reduce my taxable receipts.
42. As a user, I want the application to show an estimated refund when credits exceed tax, so that it does not show negative tax.
43. As a user, I want refund copy to state that the filed return controls the final result, so that I understand the estimate limit.

### Unsupported tax facts

44. As a user, I want one checklist of unsupported facts, so that I can confirm the calculation limit at one time.
45. As a user with salary income, I want an unsupported result, so that the application does not omit salary computation.
46. As a user with house-property income, I want an unsupported result, so that the application does not omit property rules.
47. As a user with dividends or gifts, I want an unsupported result, so that the application does not classify them as bank interest.
48. As a user with capital gains, I want an unsupported result, so that the application does not apply ordinary slab tax to special income.
49. As a user with crypto, lottery, or gaming income, I want an unsupported result, so that the application does not apply the wrong rate.
50. As a user with foreign income or foreign-tax relief, I want an unsupported result, so that the application does not omit cross-border rules.
51. As a user with agricultural income, I want an unsupported result, so that the application does not omit aggregation rules.
52. As a user with deductions or losses, I want an unsupported result, so that the application does not present an incomplete total income.
53. As a user with a disputed tax credit, I want an unsupported result, so that the application does not treat the dispute as settled.
54. As a user who selected the old tax regime, I want an unsupported result, so that the application does not use new-regime slabs.
55. As a user above the supported income ceiling, I want an unsupported result, so that the application does not omit surcharge and marginal relief.
56. As a user, I want all unsupported answers to remain editable, so that I can correct an accidental selection.

### Review and evaluation

57. As a user, I want to review all assumptions before calculation, so that I can find an incorrect answer.
58. As a user, I want each assumption in plain English, so that I do not need to interpret a section number.
59. As a user, I want to return to any questionnaire group, so that I can correct one value.
60. As a user, I want the calculation to complete in the browser, so that my money values do not leave my device.
61. As a user, I want the result to appear without a server wait, so that the transition feels immediate.
62. As a user, I want the current date to use India Standard Time, so that deadline status matches Indian statutory dates.
63. As a user, I want a stale-rules result after the rule dataset expires, so that the application does not present old law as current law.
64. As a user with stale rules, I want official links to remain available, so that I can verify the current position.
65. As a user with stale rules, I want the calculation controls disabled, so that I do not produce a new result from expired data.
66. As a user, I want an explicit error when saved answers are corrupt, so that I can reset them without a broken page.

### Plan and chronological agenda

67. As a supported user, I want the result to show the next applicable deadline first, so that I do not scan the whole period.
68. As a supported user, I want a chronological agenda after the next action, so that I can see the complete supported period.
69. As a supported user, I want advance tax to appear only when the estimated liability is at least ₹10,000, so that the agenda matches the supported rule.
70. As a supported user without advance tax, I want an explicit no-advance-tax result, so that I know the application did not forget the check.
71. As a supported user, I want the annual return deadline to appear even when no advance tax applies, so that I do not confuse tax payment with return filing.
72. As a user before a deadline, I want the status "Upcoming," so that I know the date has not arrived.
73. As a user on the due date, I want the status "Due today," so that the current action is clear.
74. As a user after the due date, I want the status "Deadline passed," so that the application does not claim that I failed to file.
75. As a user after the due date, I want text that says completion is unknown, so that I understand the absence of filing records.
76. As a user, I want the operative due date to control the status, so that a verified extension changes the displayed deadline.
77. As a user, I want to see both normal and extended dates, so that the extension does not erase the statutory schedule.
78. As a user, I want the extension source beside the changed date, so that I can verify the change.
79. As a user, I want the agenda to end with 31 August 2027, so that it includes the return for the supported tax year.
80. As a user, I do not want a completion control, so that the application does not act like a filing record.
81. As a user, I do not want a reminder control, so that the application does not add another notification channel.

### Tax estimate

82. As a supported user, I want a short tax summary, so that I can understand the estimate before I open the calculation detail.
83. As a supported user, I want an expandable calculation breakdown, so that I can inspect each stage when I choose.
84. As a supported user, I want the breakdown to show professional income, so that I can verify the presumptive calculation.
85. As a supported user, I want the breakdown to show bank interest separately, so that I can verify other supported income.
86. As a supported user, I want the breakdown to show rounded total income, so that the slab calculation has a clear base.
87. As a supported user, I want the breakdown to show slab tax, so that I can compare it with the published rates.
88. As a supported user, I want the breakdown to show rebate or marginal relief, so that a result near ₹12 lakh is understandable.
89. As a supported user, I want the breakdown to show cess, so that the estimate does not hide the final levy.
90. As a supported user, I want the breakdown to show TDS and TCS credits, so that I can verify the tax already collected.
91. As a supported user, I want the breakdown to show advance tax already paid, so that I can verify the remaining amount.
92. As a supported user, I want the final amount rounded to the nearest ₹10, so that the result follows the supported statutory rule.
93. As a supported user, I want the amount labeled "Estimated," so that I do not treat it as a government demand.
94. As a supported user, I want no late-interest calculation, so that the application does not use missing payment and assessment facts.
95. As a supported user, I want a short consequence note after a passed deadline, so that I know that interest can apply.
96. As a supported user, I want the consequence note to direct me to the portal amount, so that I do not use an invented penalty figure.

### GST-registration status

97. As a GST-unregistered user, I want to enter my state or Union territory, so that the application can select the supported service threshold.
98. As a GST-unregistered user, I want the application to use GST aggregate turnover for my PAN, so that taxable and exempt supplies across India are not omitted.
99. As a GST-unregistered user below the threshold, I want to see the remaining threshold amount, so that I know when to review registration.
100. As a GST-unregistered user exactly at the threshold, I want a review-before-further-turnover action, so that the application does not claim that equality creates turnover-based registration liability.
101. As a user above the threshold, I want the income-tax result to remain available and GST coverage marked incomplete, so that one GST action does not remove a valid estimate.
102. As a user who cannot confirm complete GST aggregate turnover, I want the income-tax result to remain available and the GST status marked unavailable, so that the application does not guess.
103. As a user in a lower-threshold state, I want the correct supported threshold, so that the application does not use the normal-state value.
104. As a user with a compulsory-registration fact, I want an unsupported result, so that turnover alone does not determine GST status.
105. As a user, I want the threshold source beside the status, so that I can verify the registration rule.
106. As a user, I do not want estimated GST returns, so that the first release stays within its declared coverage.

### Sources, tutorials, and trust

107. As a user, I want each legal conclusion to have a statutory source, so that I can inspect the primary authority.
108. As a user, I want each tutorial link to show its publisher, so that I know who wrote the instructions.
109. As a user, I want each tutorial link to show its review date, so that I can judge how current it is.
110. As a user, I want one primary tutorial per action, so that I do not receive a list of competing links.
111. As a user, I want an official source link beside a commercial tutorial, so that I can verify the underlying rule.
112. As a user, I want external links to open in a new tab, so that my saved plan remains available.
113. As a user, I want external links to carry no profile data, so that the publisher does not receive my answers.
114. As a maintainer, I want a source registry, so that tutorial approval and statutory provenance remain reviewable.
115. As a maintainer, I want to remove a stale tutorial without editing evaluation logic, so that link maintenance stays local.
116. As a maintainer, I want source validation to reject an unreviewed publisher, so that a search result cannot ship without review.
117. As a maintainer, I want the application to distinguish a statutory source from a tutorial, so that educational content never becomes legal authority.
118. As a maintainer, I want normal and operative dates to keep separate provenance, so that an extension remains auditable.

### Saved data and privacy

119. As a returning user, I want valid questionnaire answers to load from browser storage, so that I can get an updated date status quickly.
120. As a returning user, I want a saved-data update time, so that I know when I last changed the profile.
121. As a user, I want to delete all saved answers, so that I can remove my local data.
122. As a user whose browser blocks storage, I want the current session to continue, so that storage failure does not block calculation.
123. As a user whose browser blocks storage, I want a short notice, so that I know the answers will not remain after refresh.
124. As a user, I want a privacy page, so that I can understand browser storage and Google Analytics use.
125. As a user, I want no money values in a route or page title, so that Analytics and browser history do not expose them.
126. As a user, I want Analytics failure to have no effect on the application, so that tracking cannot block the result.
127. As a maintainer, I want Analytics integration separate from evaluation logic, so that tracking changes cannot change a tax result.

### Responsive and interaction behavior

128. As a mobile user, I want the application to work at 320 CSS pixels, so that I can use it on a small phone.
129. As a keyboard user, I want every control to work without a pointer, so that the questionnaire remains operable.
130. As a keyboard user, I want visible focus, so that I know which control is active.
131. As a screen-reader user, I want each input to have a programmatic label, so that the question and error are available to assistive software.
132. As a user, I want errors beside the related field, so that I do not search the page for the cause.
133. As a user, I want information to use text and shape as well as color, so that status remains clear without color perception.
134. As a touch user, I want practical target sizes, so that I can select an answer without precise tapping.
135. As a user, I want short transitions between questionnaire states, so that a step change does not feel abrupt.
136. As a user who prefers reduced motion, I want movement removed, so that the interface respects my device setting.
137. As a keyboard user, I want keyboard actions to respond without animation delay, so that repeated navigation remains fast.
138. As a pointer user, I want buttons to respond to a press, so that the interface confirms the input.
139. As a touch user, I do not want a hover effect to remain after a tap, so that the control state remains clear.
140. As a user, I do not want animated tax amounts, so that the financial result stays stable and readable.
141. As a user, I want a friendly unsupported state, so that a strict scope limit does not feel like a system failure.
142. As a user, I want no government logo or copied government style, so that I do not mistake the application for an official service.

### Open-source maintenance and delivery

143. As a contributor, I want a public specification, so that I can understand the required behavior before I edit code.
144. As a contributor, I want controlled domain terms, so that profile, rule, result, and source names stay consistent.
145. As a contributor, I want one evaluation interface, so that legal logic does not spread across route and view code.
146. As a contributor, I want test-first vertical changes, so that each added behavior starts with an observable failure.
147. As a contributor, I want statutory expected values from worked examples, so that tests do not copy the implementation formula.
148. As a contributor, I want formatting and lint checks, so that mechanical style differences do not distract from review.
149. As a contributor, I want a rule validator, so that an invalid date or missing source fails before deployment.
150. As a contributor, I want preview deployment for a proposed change, so that reviewers can inspect the full journey.
151. As a maintainer, I want production deployment from the main branch, so that the public site matches reviewed source.
152. As a maintainer, I want preview analytics disabled, so that test traffic does not pollute production data.
153. As a maintainer, I want stale production rules to fail closed, so that a successful build cannot make expired calculations.
154. As a maintainer, I want a small dependency set, so that updates do not dominate a small static application.
155. As a maintainer, I want no hidden GST-return implementation, so that unfinished future scope cannot reach a user.
156. As a competition reviewer, I want every demonstrated control to work, so that the public build matches the video.
157. As a competition reviewer, I want all sample identities and amounts to be synthetic, so that the demonstration uses no personal tax data.
158. As a competition reviewer, I want the application to identify mocked and external steps, so that its limits remain honest.

## Implementation Decisions

### 1. Controlled terms

The specification uses these terms:

| Term | Meaning |
| --- | --- |
| Application | The My Next Filing static website. |
| Profile | The declared user facts and money inputs. |
| Rule dataset | The versioned local data that contains rates, dates, conditions, and sources. |
| Evaluation | The operation that applies the rule dataset to a profile and current date. |
| GST aggregate turnover | The all-India value of taxable, exempt, export, and inter-State supplies for the same PAN, excluding GST, cess, and inward supplies taxed under reverse charge. |
| Supported result | A result that contains an estimate and supported obligations. |
| Unsupported result | A result that names one or more profile facts outside the release scope. |
| Stale-rules result | A result that stops calculation because the rule dataset expired. |
| Obligation | A dated action that can apply to the supported profile. |
| Normal due date | The date in the normal statutory schedule. |
| Operative due date | A verified extended date that controls the current deadline status. |
| Deadline passed | The operative date is before the current date. Completion is unknown. |
| Statutory source | A government Act, rule, notification, circular, FAQ, or official manual. |
| Tutorial source | A reviewed external page that explains a task. |
| Review date | The date on which a human checked a source. |

### 2. Product identity and publication

- The product name is My Next Filing.
- The canonical domain is `https://mynextfiling.com`.
- The `www` host redirects to the canonical domain.
- HTTP redirects to HTTPS.
- Sarthak Mishra is the author.
- The source code uses the Apache License 2.0.
- The public repository will include `README`, `SPEC`, and `LICENSE`.
- The first specification file is local only. Repository publication is a later action.

### 3. Release definition

The first release is complete when all of these statements are true:

- A user can start a personal check from the landing page.
- A reviewer can load a synthetic example.
- The questionnaire accepts the full supported profile.
- The questionnaire rejects each declared unsupported profile.
- The evaluation produces the verified tax estimate.
- The plan shows the applicable advance-tax result.
- The plan shows the annual return date.
- The plan shows the GST-registration threshold status.
- The plan shows sources and external tutorials.
- The application restores valid saved answers.
- The application deletes saved answers on request.
- The application stops calculation for stale rules.
- The application works as a static deployment on the canonical domain.
- No questionnaire value leaves the browser through an application request.

### 4. Technology

The implementation uses:

- React.
- TypeScript with strict type checking.
- Vite.
- React Router.
- Tailwind CSS.
- shadcn/ui.
- pnpm.
- Oxlint.
- Oxfmt.
- Google Analytics.
- Cloudflare Workers Static Assets.
- Cloudflare Workers Builds.

The implementation has no backend, database, server function, worker script, or storage binding.

The implementation must avoid a dependency when the browser or selected stack supplies sufficient behavior. The implementation must not add a state library, form library, date library, motion library, or Analytics wrapper without a measured need.

### 5. Route behavior

| Route | Purpose | Required behavior |
| --- | --- | --- |
| `/` | Landing page | Explain scope. Show "Check my dates" and "Try an example." |
| `/check` | Questionnaire | Edit and validate the profile. Save valid progress when storage is available. |
| `/plan` | Result | Show the supported, unsupported, or stale result. Redirect to `/check` when no profile exists. |
| `/methodology` | Calculation method | Explain supported formulas, assumptions, rounding, and exclusions. |
| `/sources` | Source register | List statutory and tutorial sources with review dates. |
| `/disclaimer` | Product limits | State the best-effort and no-advice terms. |
| `/privacy` | Data use | Explain browser storage and Google Analytics. |
| Any unmatched route | Not-found state | Explain that the page does not exist. Link to `/`. |

React Router controls client routes. Cloudflare serves the application entry file for an unmatched static path. A direct request to each public route must load the application.

### 6. Questionnaire flow

The questionnaire uses seven content groups. The design run can change the visual composition. It cannot split the profile confirmations into separate questions.

#### Group 1: About you

Show this period first:

> Income earned from 1 April 2026 to 31 March 2027

Show this secondary label:

> Tax Year 2026-27

Show the profile confirmations together:

- I am a resident individual.
- I use the new tax regime.
- I provide IT or software consulting.
- I use the presumptive method for professional income.
- I work directly for clients in India.
- I do not have a GSTIN.

Show this help text:

> This version supports only this profile. If one statement is not true, we will show where this version stops.

#### Group 2: Professional receipts

Use this label:

> Gross professional receipts

Use this description:

> Enter the gross professional receipts that you will report for this tax year. Use your invoice or receipt record. Do not subtract expenses or TDS.

Use this label:

> Receipts paid in cash

Use this description:

> Enter the part paid in cash. Also include a cheque or bank draft that was not account-payee. Enter zero if all receipts used normal bank or online payment.

Use this label:

> Higher expected profit

Use this description:

> The presumptive method treats at least half of your receipts as profit. If your actual profit is higher, enter the higher amount. Otherwise, keep the calculated amount.

The application calculates 50 percent of gross professional receipts. The higher expected profit cannot be less than this amount.

#### Group 3: Bank interest

Use this label:

> Taxable bank or deposit interest

Use this description:

> Enter gross taxable interest before TDS. You can find this value in your bank interest certificate or annual statement. Enter zero if you have none.

The application does not support another income type in this field.

#### Group 4: Tax credits and payments

Use this label:

> TDS already deducted

Use this description:

> Enter TDS that a client or bank already deducted from the income in this check. Do not enter TDS that you only expect.

Use this label:

> TCS already collected

Use this description:

> Enter TCS that was already collected and is available as your tax credit. Enter zero if you have none.

Use this label:

> Advance tax already paid

Use this description:

> Enter advance tax that you already paid for this tax year. Do not include self-assessment tax for another year.

The application can link to an official tax-credit statement guide. The application must not request a statement upload.

#### Group 5: GST check

Use this label:

> State or Union territory

Use this description:

> Select the place from which you provide your services. This check uses it to select the supported GST-registration threshold.

Use this label:

> GST aggregate turnover for this PAN

Use this description:

> Enter the total value of your taxable and exempt supplies across India for the same PAN, before GST. Include your IT or software invoices and relevant interest. Do not enter profit.

Use this question:

> Can you confirm that this is your complete GST aggregate turnover?

Require one answer:

- I confirm this is my complete GST aggregate turnover.
- I cannot confirm this total.

Use this description:

> GST aggregate turnover can include taxable and exempt supplies, including relevant interest. Other than my IT or software services and interest, I have no other supplies for this check.

Treat GST aggregate turnover as one direct declared amount. Do not calculate it from professional receipts or bank interest. Do not enforce an arithmetic relationship with an income-tax field because GST valuation and timing can differ. When the user cannot confirm the total, preserve any entered amount for editing but do not use it to produce a GST threshold status.

#### Group 6: Unsupported facts

Use this question:

> Do you have any of these items for this tax year?

List these items:

- Salary income.
- House-property income.
- Dividend or gift income.
- Capital gains.
- Crypto, lottery, or gaming income.
- Foreign income or foreign-tax relief.
- Agricultural income.
- A deduction, loss, or tax credit that this check does not show.
- A disputed TDS or TCS credit.
- Another business or profession.
- Foreign clients.
- Platform, marketplace, agency, commission, or brokerage income.
- Goods sales.
- Employees or deductor filing duties.
- An audit requirement under tax law or another law.

Use this description:

> Select every item that applies. This version will stop instead of guessing.

#### Group 7: Assumption review

Show all declared facts and calculated input assumptions. Provide "Change" for each group. Require this confirmation:

> I checked these answers. I understand that the result is general guidance and can be incomplete for my facts.

### 7. Money and input rules

- Store all money amounts as integer rupees.
- Do not store paise.
- Accept digits, Indian-grouped commas, and one leading rupee symbol.
- Remove display formatting before validation.
- Reject a negative amount.
- Reject a value above the JavaScript safe-integer limit.
- Reject cash receipts above gross receipts.
- Reject higher profit below 50 percent of gross receipts.
- Treat GST aggregate turnover as a direct input. Do not add another Profile amount to it or derive it from another Profile amount.
- Do not reject GST aggregate turnover because it is below professional receipts or professional receipts plus bank interest.
- Show money with the `en-IN` locale and the rupee symbol.
- Keep intermediate tax arithmetic exact at the supported rupee precision.
- Apply statutory rounding only at the specified stages.

An empty optional money field has the value zero after the user leaves the field. The application must show this behavior before final confirmation.

### 8. Profile eligibility

The evaluation returns an unsupported result if one of these conditions is true:

- The user is not a resident individual.
- The user does not use the new tax regime.
- The work is not IT or software consulting.
- The user does not use the supported presumptive method.
- The user does not work directly for clients in India.
- The user has a GSTIN.
- Gross receipts exceed ₹50 lakh when cash receipts exceed 5 percent.
- Gross receipts exceed ₹75 lakh when cash receipts do not exceed 5 percent.
- Higher profit is below 50 percent of gross receipts.
- The user declares an unsupported income, deduction, loss, credit, or activity.
- Rounded total income exceeds ₹50 lakh.
- The rule dataset is structurally invalid.

Non-account-payee cheques and bank drafts count with cash for the 5-percent test.

The evaluation can return a supported income-tax result with an At-threshold, Above-threshold, or Unavailable GST status. An At-threshold status keeps the overall plan supported. An Above-threshold or Unavailable status keeps the income-tax result and states that GST coverage is incomplete. Another business or supply type still returns an unsupported result.

### 9. Main evaluation module and interface

The application has one deep evaluation module. The interface accepts:

- A validated profile.
- A current date.
- A validated rule dataset.

The interface returns exactly one result kind:

| Result kind | Required contents |
| --- | --- |
| Supported | Tax estimate, obligations, GST status, assumptions, explanations, and source references. |
| Unsupported | Unsupported facts, plain explanations, applicable starting links, and preserved editable answers. |
| Stale rules | Expiry information, disabled calculation state, and official starting links. |

The interface includes its invariants, validation errors, rounding rules, and date behavior. View modules must not calculate tax. Route modules must not decide which obligation applies. Source modules must not change an evaluation result outside the rule dataset.

The evaluation is a pure in-process operation. It has no adapter and no remote dependency. Tests use the same interface as the application.

### 10. Supported income calculation

The application calculates presumptive professional income as follows:

1. Calculate 50 percent of gross professional receipts.
2. Compare this amount with the higher profit entered by the user.
3. Use the greater amount.

The application adds taxable bank or deposit interest to professional income. The result is gross total income for this release.

The application does not deduct professional expenses from presumptive professional income. It does not apply a deduction, loss, exemption, or foreign-tax relief.

The application rounds total income to the nearest ₹10 before it applies slab tax:

- Discard paise.
- Round a units digit of 5 or more upward.
- Round a units digit below 5 downward.

### 11. Tax slabs for Tax Year 2026-27

Apply these new-regime slab rates to rounded total income:

| Total-income band | Rate |
| --- | ---: |
| Up to ₹4,00,000 | Nil |
| ₹4,00,001 to ₹8,00,000 | 5% |
| ₹8,00,001 to ₹12,00,000 | 10% |
| ₹12,00,001 to ₹16,00,000 | 15% |
| ₹16,00,001 to ₹20,00,000 | 20% |
| ₹20,00,001 to ₹24,00,000 | 25% |
| Above ₹24,00,000 | 30% |

The application applies each rate only to the income in its band.

### 12. Rebate and marginal relief

The application supports section 156 rebate only for ordinary slab-tax income.

If total income is not more than ₹12,00,000:

- The rebate is the lower of slab tax and ₹60,000.

If total income is more than ₹12,00,000:

1. Calculate the income above ₹12,00,000.
2. Compare this excess income with slab tax.
3. If slab tax is higher, reduce slab tax to the excess income.
4. Treat the reduction as marginal relief.

The application does not hard-code a marginal-relief end point. The comparison controls the result after income rounding.

The application stops when rounded total income exceeds ₹50 lakh. It does not calculate surcharge or surcharge marginal relief.

### 13. Cess, credits, payable amount, and refund

- Calculate Health and Education Cess at 4 percent after rebate or marginal relief.
- Add cess to income tax.
- Subtract actual TDS for included income.
- Subtract actual TCS.
- The result before advance tax paid is estimated advance-tax liability.
- Subtract advance tax already paid to get the estimated remaining amount.
- If credits and tax paid exceed gross tax, show the difference as an estimated refund.
- Round the final payable or refund amount to the nearest ₹10.

The result must not show a negative tax amount.

### 14. Advance-tax obligation

Advance tax applies in this release when rounded estimated advance-tax liability is at least ₹10,000.

For the supported presumptive professional profile:

- The normal due date is 15 March 2027.
- The required cumulative amount is 100 percent of estimated advance-tax liability.
- The displayed remaining amount cannot be less than zero.
- An amount paid after 15 March and on or before 31 March 2027 can still count as advance tax under the law.
- Payment after 15 March can still cause interest.

The application does not calculate interest under section 424 or section 425. Use this consequence copy:

> Interest can apply after this deadline. The correct amount depends on payment and assessment facts that this application does not collect. Verify the amount on the Income Tax portal or with a tax professional.

If estimated advance-tax liability is below ₹10,000, use this result copy:

> No advance tax is indicated by this estimate. Your annual return and GST-registration status can still require attention.

### 15. Annual return obligation

For the supported non-audit business or professional profile:

- The normal return due date is 31 August 2027.
- The application must not name a future return form before the official form is available and verified.
- The application links to the official return-form identification guide.
- The application links to one reviewed filing tutorial only when a suitable Tax Year 2026-27 tutorial is available. Until then, it shows the statutory source without a tutorial.

Use this consequence copy after the deadline:

> A filing fee and other effects can apply after the deadline. This application does not calculate them. Verify the current position before you file.

### 16. GST-registration threshold monitor

The release supports direct service supplies to Indian clients. It does not make a universal GST-registration decision.

Use these starting thresholds:

| Location group | Supported service threshold |
| --- | ---: |
| Manipur, Mizoram, Nagaland, and Tripura | ₹10 lakh |
| Other states and Union territories | ₹20 lakh |

When the user confirms complete GST aggregate turnover, the evaluation compares the direct declared amount with the selected threshold. It does not add professional receipts, bank interest, or another Profile amount.

Below the threshold, show:

> Your declared GST aggregate turnover is ₹X below the ₹Y starting threshold for [state]. Some facts can require registration earlier.

Exactly at the threshold, show:

> Your declared GST aggregate turnover equals the ₹Y starting threshold. Turnover-based registration starts only after you exceed it. Review before further turnover.

Keep the overall plan supported at the exact threshold.

Above the threshold, show:

> Review GST registration now. Your declared GST aggregate turnover is ₹X above the starting threshold. This version does not calculate GST returns.

Keep the income-tax result and mark GST coverage incomplete.

When the user cannot confirm complete GST aggregate turnover, use GST status "Unavailable" and show:

> We can still show your income-tax result, but we cannot show a GST threshold status without complete GST aggregate turnover.

Keep the income-tax result, mark GST coverage incomplete, and provide official starting links.

Return an unsupported result when the user declares a compulsory-registration fact or another supply type.

### 17. Obligation and status model

Each obligation contains:

- A stable identity.
- A title.
- A tax period.
- A normal due date.
- An optional operative due date.
- Applicability reasons.
- A plain consequence summary.
- A statutory-source reference.
- An optional tutorial-source reference.
- A rule verification date.

Use the operative due date when it exists. Otherwise, use the normal due date.

Use India Standard Time for status:

| Condition | Status |
| --- | --- |
| Current date is before the due date | Upcoming |
| Current date equals the due date | Due today |
| Current date is after the due date | Deadline passed |

The model has no completed, filed, paid, or dismissed status.

### 18. Rule dataset

The rule dataset is local, typed, and versioned. It contains:

- Dataset identity.
- Schema version.
- Tax period.
- Effective start and end dates.
- Verification date.
- Expiry date.
- Rates and thresholds.
- Eligibility conditions.
- Normal due dates.
- Operative due dates.
- Statutory-source references.
- Tutorial-source references.
- Human-readable change notes.

The initial dataset expires no later than 31 August 2027. A maintainer can set an earlier expiry when a known review is necessary.

The rule validator rejects:

- A missing dataset identity.
- An unknown schema version.
- A missing source.
- A non-HTTPS source URL.
- A duplicate rule identity.
- An invalid date range.
- An operative due date without extension provenance.
- A tax rate outside the supported set.
- A threshold outside the supported profile.
- An expired production dataset.
- A tutorial publisher that is not in the approved registry.

The application must keep a normal date when it adds an operative date. It must not overwrite the normal date.

### 19. Source registry

The source registry separates statutory sources and tutorial sources.

Each statutory source contains:

- Identity.
- Publisher.
- Document title.
- URL.
- Publication or issue date when available.
- Review date.
- Applicable tax period.
- Covered rule identities.

Each tutorial source contains:

- Identity.
- Publisher.
- Page title.
- URL.
- Review date.
- Covered obligation.
- Approval status.
- Optional replacement source.

A high search position can identify a candidate tutorial. It cannot approve the tutorial.

A human reviewer must read the candidate. The reviewer must confirm:

- The publisher is official or well-established.
- The page has a clear author or publisher.
- The instructions match the supported period.
- The page does not request unsafe data.
- The page does not make a false government claim.
- The page does not rely on an unsupported profile.
- The page is not a forum, social post, generated content farm, or link aggregator.

When an official tutorial is usable, prefer it. Use a reviewed commercial tutorial when it explains the task more clearly. Show one primary tutorial and one statutory source.

The application does not scrape, embed, summarize, or copy a tutorial. It stores and displays the reviewed link metadata.

### 20. Statutory sources reviewed on 29 August 2026

These primary sources were reviewed on the specification's law verification date. The implementation must verify them again before release:

| Subject | Reviewed primary source |
| --- | --- |
| Income-tax Act, 2025 as amended by Finance Act, 2026 | https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf |
| Presumptive income under section 58 | https://www.incometaxindia.gov.in/w/section-58-138 |
| Specified professions under section 62 | https://www.incometaxindia.gov.in/w/section-62-134 |
| Rebate under section 156 | https://wmstatic-prd.incometaxindia.gov.in/documents/20117/42998/Section-156_2026-04-01_05-11-58_344893_en.pdf/415b0f0e-8826-feaa-b374-481e54d4b98e |
| Advance-tax applicability under section 404 | https://www.incometaxindia.gov.in/w/section-404-5 |
| Advance-tax due date under section 408 | https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf |
| Income and tax rounding under section 516 | https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf |
| Tax slabs and rebate examples | https://www.incometaxindia.gov.in/documents/20117/15766092/FAQs-Budget-2026%2BUpdated.pdf/daf54d14-aca9-c4ea-b786-598fd2f8d4c4 |
| Return due date under section 263 | https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf |
| GST aggregate turnover under section 2(6) and registration under section 22 | https://www.indiacode.nic.in/indiacode/bitstream/123456789/15689/1/A2017-12.pdf |

### 21. Tutorial candidate review

These candidates were reviewed on 29 August 2026. A candidate marked provisional, deferred, rejected, or starting-link-only must not populate a primary tutorial-source reference:

| Action | Candidate | Status | Review result |
| --- | --- | --- | --- |
| Generate an advance-tax challan | https://www.incometax.gov.in/iec/foportal/help/generate-challan-form | Provisional | Official and detailed, but the visible instructions still use Assessment Year and Income-tax Act, 1961 language. Re-review after the portal manual matches the Tax Year 2026-27 flow. |
| Work with tax payments | https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/working-with-payments | Rejected as primary | This is an index rather than an action-specific tutorial. It can remain a fallback hub. |
| Identify the applicable return | https://www.incometax.gov.in/iec/foportal/help/identification-and-generation-of-applicable-itr-individual | Deferred | Tax Year 2026-27 return forms are not yet notified. Re-review when the forms and 2027 portal flow exist. |
| File an income-tax return | https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/file-income-tax-return | Rejected as primary | The page is sparse and currently points to Income-tax Act, 1961 material. Replace it with a period-specific official manual when published. |
| Start GST registration research | https://www.gst.gov.in/help/helpmodules/ | Starting link only | This is a safe official hub, not a primary tutorial. Prefer a specific normal-taxpayer registration manual after manual review. |

The initial release can replace a candidate with a manually reviewed commercial tutorial. The replacement must satisfy the source-registry rules.

### 22. Saved profile behavior

- Store the profile, storage-schema version, and update time in browser storage.
- Do not store a result as an independent legal fact.
- Re-evaluate saved answers on every plan load.
- Re-evaluate when the current date changes.
- Re-evaluate when the rule dataset changes.
- Clear incompatible stored data after an explicit user notice.
- Continue in memory when browser storage is unavailable.
- Provide "Change answers."
- Provide "Delete my saved answers."
- Require confirmation before deletion.
- Return to the landing page after deletion.

The application must not put a profile value in a route, query string, hash, page title, log message, or Analytics event.

### 23. Result copy

Show this notice near the top of every personalized result:

> This result uses the answers that you provided and rules verified on the date shown. It is general guidance, not tax or legal advice. Rules, extensions, and your facts can change. Verify the result before you file or pay.

Show this title above the nearest obligation:

> Your next filing

If advance tax applies, show:

> Advance tax can apply because your estimated tax after TDS and TCS is at least ₹10,000.

If a deadline passed, show:

> This deadline has passed. The application does not know whether you completed this obligation.

If rules are stale, show:

> We cannot calculate a current result. The rules for this period need a new review.

If the profile is unsupported, show:

> This version cannot calculate a reliable plan for this answer.

Follow the unsupported title with the exact fact and one short reason.

### 24. Disclaimer

The detailed disclaimer must use plain language. It must include these statements:

- The application gives general information and a best-effort estimate.
- The application does not give tax, accounting, or legal advice.
- The application does not create a professional relationship.
- The application covers only the stated profile and tax period.
- The user is responsible for verification, filing, and payment decisions.
- Government rules, forms, portal behavior, and extensions can change.
- External tutorial publishers control their own pages.
- The author and contributors provide the software without warranties, to the extent that law permits.

Formal public terms and privacy text require legal review. The implementation must not claim that a disclaimer cures an incorrect calculation.

### 25. Google Analytics and privacy

- Integrate Google Analytics for page analytics.
- Do not send questionnaire answers.
- Do not send money amounts.
- Do not send a tax result.
- Do not send a name or user identifier.
- Do not include sensitive values in a route or page title.
- Keep Analytics outside the evaluation module.
- Make application behavior independent of Analytics availability.
- Describe Analytics on the privacy page.

The specification does not prescribe detailed Analytics consent configuration. The implementation must complete an applicable privacy review before public release.

### 26. Information design

- Show the next action before the full agenda.
- Use a chronological agenda instead of a conventional month grid.
- Group agenda items by month.
- Show the due date with strong number typography.
- Show one primary action per view.
- Put statutory citations under a "Source" label.
- Put tutorial links under a "How to do this" label.
- Keep the estimate summary visible before the detailed calculation.
- Hide advanced detail in an accessible disclosure control.
- Keep errors close to the related input.
- Do not show an empty dashboard.

### 27. Visual and interaction direction

The later design run can select exact visual tokens and layout. It must keep these constraints:

- Use a light theme.
- Use a warm neutral background.
- Use dark, high-contrast text.
- Use one lively accent color.
- Use rounded but compact cards.
- Use the system font stack.
- Use no mascot.
- Use no government logo.
- Do not imitate a government portal.
- Use no confetti.
- Do not joke about fines, tax debt, or missed filing.
- Use shadcn/ui as the interface base.

Playfulness must come from clear progress, responsive controls, friendly copy, color, and small state transitions. It must not reduce trust in a tax result.

### 28. Motion rules

- Use CSS transitions.
- Do not add a motion dependency.
- Use press feedback near `scale(0.97)` for pointer-activated buttons.
- Keep questionnaire transitions below 220 milliseconds.
- Animate only opacity and transform.
- Use a strong ease-out curve for entered content.
- Do not use `ease-in` for interface entry.
- Do not animate from `scale(0)`.
- Do not animate a keyboard-initiated action.
- Apply hover effects only when the device supports hover and a fine pointer.
- Respect `prefers-reduced-motion`.
- Remove position movement in reduced-motion mode.
- Do not animate tax amounts.
- Do not delay interaction until an animation ends.

### 29. Basic accessibility behavior

The release does not claim formal WCAG certification. It must still provide:

- Semantic page landmarks.
- A logical heading order.
- A programmatic label for every form control.
- Error text associated with the invalid control.
- Full keyboard operation.
- Visible focus.
- Text or shape in addition to color for every status.
- Sufficient contrast for normal text and controls.
- Practical touch targets.
- Reduced-motion behavior.
- A layout that works from 320 CSS pixels upward.

### 30. Example profile

The landing page provides "Try an example." The example uses only synthetic data:

| Input | Value |
| --- | ---: |
| Residence and legal status | Resident individual |
| State | Maharashtra |
| Work | IT or software consulting |
| Clients | Direct clients in India |
| Tax regime | New regime |
| Income method | Presumptive professional taxation |
| GST registration | No GSTIN |
| Gross professional receipts | ₹19,00,000 |
| GST aggregate turnover | ₹19,10,000 |
| GST aggregate turnover completeness | Confirmed |
| Cash receipts | ₹0 |
| Higher expected profit | ₹14,00,000 |
| Taxable bank interest | ₹10,000 |
| Actual TDS | ₹40,000 |
| Actual TCS | ₹0 |
| Advance tax already paid | ₹0 |
| Unsupported facts | None |

The example must show that the higher profit, not the 50-percent minimum, controls professional income. It must show an advance-tax result and a GST aggregate turnover result ₹90,000 below Maharashtra's ₹20 lakh starting threshold.

The example page must state:

> These are fictional amounts. Replace them with your own answers if you use the personal check.

### 31. Static deployment

- Build the application into static assets.
- Deploy only the static build output.
- Use Cloudflare Workers Static Assets.
- Configure SPA fallback to the application entry file.
- Use Workers Builds with the source repository.
- Create preview deployments for proposed changes.
- Deploy production from the protected main branch.
- Attach `mynextfiling.com` as the production custom domain.
- Redirect `www.mynextfiling.com` to the canonical domain.
- Enable HTTPS.
- Use no server code, function, data store, or secret for the core application.
- Limit Google Analytics configuration to production.

### 32. Performance behavior

- The calculation must complete synchronously.
- The questionnaire transition must not show a loading state.
- The application must make no application-data request after static assets load.
- The application must not prefetch an external tutorial.
- The core journey must not require an image.
- Add route-level code splitting only after bundle measurement shows a need.
- Target a mobile Lighthouse performance score of at least 90.
- Support the current and previous major desktop browsers.
- Support current Chrome on Android and current Safari on iOS.

The implementation plan can select manual or automated verification for browser and performance targets.

### 33. Open-source repository requirements

The future public repository must include:

- An Apache-2.0 `LICENSE`.
- A `README` with purpose, scope, local commands, deployment summary, disclaimer, and source policy.
- This product specification.
- A lockfile.
- Commands for development, build, format, lint, type check, rule validation, and tests.

The repository must not contain real taxpayer data, credentials, private portal captures, private APIs, or copied government code.

### 34. Change control for statutory data

A rule change is not a copy edit. A rule change must include:

- The changed rule identity.
- The old value.
- The new value.
- The effective date.
- The source URL.
- The source issue or publication date.
- A plain change note.
- A behavior test through an agreed seam.
- A rule-dataset validation result.

A tutorial-link change must include:

- The reviewed publisher.
- The review date.
- The covered action.
- The reason for replacement.

Do not approve a statutory change from a search snippet, forum answer, social post, or generated summary.

## Testing Decisions

### 1. Development method

Use test-driven development for behavior changes.

For each vertical slice:

1. Write one failing test for observable behavior.
2. Add only enough implementation to pass the test.
3. Continue with the next observable behavior.
4. Review structure after the behavior works.

Do not write all tests before implementation. Do not test private functions. Do not assert internal call order.

### 2. Agreed test seams

The project has three agreed seams:

| Seam | Input | Observable result |
| --- | --- | --- |
| Evaluation | Profile, current date, and rule dataset | Supported, unsupported, or stale result. |
| Rule validation | Rule dataset | Valid dataset or explicit validation errors. |
| Browser journey | User actions from questionnaire entry | Rendered plan or declared stop state. |

Tests must use these interfaces. Tests must not reach through an interface to test internal helpers.

The implementation plan or design wayfinder can choose the final mix of unit, integration, browser, and smoke tests. The chosen mix must prove the specified behavior with the least maintenance cost.

### 3. Independent expected values

Expected statutory values must come from an official worked example or an independently worked literal. A test must not calculate its expected value with the implementation formula.

At minimum, the test plan must consider these cases:

- Total income at ₹4 lakh.
- Total income at ₹8 lakh.
- Total income at ₹12 lakh.
- Total income at ₹12.10 lakh, including section 156 marginal relief and 4-percent cess.
- Total income at ₹50 lakh.
- Total income above ₹50 lakh.
- Cash receipts exactly 5 percent of professional receipts.
- Cash receipts above 5 percent.
- Receipts at each section 58 limit.
- Higher profit equal to the 50-percent minimum.
- Higher profit above the minimum.
- TDS that reduces advance-tax liability below ₹10,000.
- Advance-tax liability exactly ₹10,000.
- Credits that produce an estimated refund.
- Final rounding below and above a units digit of 5.
- The 15 March 2027 advance-tax date.
- The 31 August 2027 return date.
- A normal due date with no extension.
- A normal due date with a verified operative date.
- Upcoming, due-today, and deadline-passed status in India Standard Time.
- Normal and lower GST service thresholds.
- GST aggregate turnover below, exactly at, and above the threshold.
- An unavailable GST status when the user cannot confirm complete GST aggregate turnover.
- A non-zero bank-interest input that is not added automatically to declared GST aggregate turnover.
- Each unsupported profile flag.
- A stale rule dataset.
- A missing statutory source.
- An unapproved tutorial publisher.
- Corrupt saved data.
- Unavailable browser storage.

### 4. Browser behavior

The test plan must prove the full example journey through the browser seam. It must also prove the critical stop states. The implementation plan decides whether this proof uses one long journey or a small focused set.

Do not add view-module tests by default. Add one only when the browser seam cannot prove an important behavior at a reasonable cost.

### 5. Mechanical checks

The continuous-integration plan includes, as applicable:

- Oxfmt check.
- Oxlint check.
- TypeScript check.
- Rule-dataset validation.
- Selected behavior tests.
- Production build.

Browser-matrix and Lighthouse automation are optional. The implementation plan can use manual release checks or automated checks. Do not make an unverified compliance claim.

### 6. Test quality

A good test must:

- Describe user or caller behavior.
- Use an agreed seam.
- Use an independent expected value.
- Fail when the behavior is absent.
- Survive an internal refactor.
- Avoid a mock for owned in-process logic.
- Control the current date through the evaluation interface.
- Avoid network access to a tutorial or government page.

Mock only a true external operation. The core evaluation has no external operation and needs no mock.

## Out of Scope

The first release does not include:

- A GST-registered profile.
- GSTR-1, GSTR-3B, IFF, PMT-06, or another GST-return calendar.
- GST-return preparation or filing.
- A general GST-registration opinion.
- A company, LLP, partnership, HUF, trust, or non-resident profile.
- A profession other than IT or software consulting.
- Goods sales.
- Foreign clients or export-of-service rules.
- Platform or marketplace income.
- Agency, commission, or brokerage income.
- Employee, payroll, PF, ESI, or professional-tax duties.
- TDS-deductor or TCS-collector filing duties.
- The old tax regime.
- Regular books and expense deductions.
- Salary income.
- House-property income.
- Dividends, gifts, or unsupported other income.
- Capital gains.
- Crypto, lottery, or gaming income.
- Foreign income or foreign-tax relief.
- Agricultural income.
- Deductions, loss set-off, or brought-forward credit.
- Surcharge or surcharge marginal relief.
- Taxable total income above ₹50 lakh.
- Tax-audit determination.
- Audit under another law.
- Interest calculation under section 424 or section 425.
- Late-fee or penalty calculation.
- Return-form selection before the form is officially available.
- Return preparation, validation, upload, submission, or acknowledgement.
- A payment transaction.
- A government OTP, credential, or account.
- A live government integration.
- A private or undocumented government interface.
- A stored filing record.
- Completion tracking.
- Email, SMS, WhatsApp, push, browser, or calendar reminders.
- Calendar-file export.
- An authored filing tutorial.
- Embedded or copied external tutorial content.
- Runtime search for tutorials.
- Runtime model inference.
- A chatbot.
- An account or login.
- Cloud synchronization.
- A backend or database.
- A native mobile application.
- Progressive-web-application installation.
- Offline support.
- Hindi or another translation.
- Dark theme.
- A mascot.
- Formal WCAG certification.
- Another tax year.
- State, municipal, labour, or sector-specific compliance.
- Production legal advice or professional responsibility.

Future support for a GST-registered profile can use the same typed rule dataset. The first release must not include hidden, disabled, or partial GST-return code.

## Further Notes

### 1. First-person origin

Use this first-person project explanation in project documentation when a personal origin is useful:

> I receive repeated compliance reminders from service firms and tax professionals. The reminders create noise, but they do not give me one clear view of what applies. I have missed GSTR-1, GSTR-3B, and advance-tax deadlines. I have paid for those delays. I built My Next Filing for people who want a quick, best-effort overview before they decide what to do next.

Do not state that the first release supports GSTR-1 or GSTR-3B. Those missed filings explain the project origin. They are outside the first release.

### 2. Independent competition prototype

The first release is an independent competition prototype. Codex must make a material contribution to the implementation. The project must describe that contribution honestly.

The prototype must:

- Use synthetic example data.
- Avoid a live government connection.
- Avoid private or undocumented government interfaces.
- Avoid real taxpayer credentials and identifiers.
- Avoid a government logo or endorsement claim.
- State which results are calculated locally.
- State which instructions are external links.
- State that selection does not mean government adoption.

Relevant competition sources:

- https://buildwhatmovesindia.com/brief
- https://buildwhatmovesindia.com/faq

### 3. Wayfinder authority

A later design or implementation wayfinder can decide:

- Exact visual tokens.
- Exact layout.
- Exact spacing and card composition.
- Exact test mix.
- Detailed implementation order.
- Minor route organization.
- Minor module organization behind the agreed seams.

The wayfinder cannot change:

- The supported profile.
- The tax calculation boundary.
- The three evaluation result kinds.
- The best-effort product claim.
- The no-backend rule.
- The absence of reminders and completion tracking.
- The rule-source and expiry requirements.
- The privacy restriction on questionnaire and money data.
- The out-of-scope list.

### 4. Statutory review before release

The law verification date in this specification is 29 August 2026. The implementation must verify all statutory sources again before public release.

The review must check:

- Finance Act changes.
- Income-tax Rules changes.
- Due-date extensions.
- Portal guide changes.
- GST threshold notifications.
- GST aggregate-turnover treatment of taxable and exempt supplies, including relevant interest.
- Source URL availability.
- Tutorial content.

If a rule cannot be verified, remove the related personalized result or return a stale-rules result. Do not fill the gap with a blog claim.

### 5. Document authority

This document defines the first-release product behavior. It is not a product-requirements document. It contains no market forecast, revenue plan, growth target, or feature roadmap.

A future implementation plan can order the work. It cannot silently change this product specification.
