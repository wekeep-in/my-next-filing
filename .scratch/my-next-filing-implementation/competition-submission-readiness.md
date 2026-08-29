# Build What Moves India submission readiness

Checked: 29 August 2026 at 4:56 AM IST

Deadline: 29 August 2026 at 10:00 PM IST, with no grace period.

## Current verdict

**Not ready to submit.** The workspace has a valid React and Vite base plus a planning prototype, but the competition requires a public working end-to-end citizen journey. The checked application renders only "Project setup is in progress."

## Readiness table

| Requirement | Status | Evidence or missing item |
| --- | --- | --- |
| Registered submission owner | Unknown | Human must confirm registration and the email used. Do not record the email in this public-planning artifact. |
| Solo or two-person team | Unknown | Human must confirm. A partner must have registered separately. |
| Public browser URL with no approval request | Blocked | `mynextfiling.com` does not resolve. No Cloudflare or `wrangler.jsonc` setup exists. |
| Working citizen journey | Blocked | `src/App.tsx` is a setup placeholder. Questionnaire, Evaluation, Rule dataset, result states, in-memory Profile flow, and synthetic example are absent. |
| Static production build | Partial | A `dist` directory exists, but it contains the placeholder application and is not a submission candidate. |
| Public video, at most two minutes | Missing | No video artifact or link exists. Record only after the submitted build is stable. |
| Project summary under 250 words | Draft below | Finalize only after the build matches the claims. |
| Every demonstrated control works | Blocked | No product controls exist in application code. |
| Synthetic data only | Planned | The specification and prototype use synthetic data; application implementation is absent. |
| Mocked and external steps labelled | Planned | Required by the specification; application implementation is absent. |
| Codex contribution disclosed | Draft below | Wayfinder map, statutory research, interface prototype, domain glossary, and implementation decisions are material contributions. |
| Dependencies and asset permission checked | Partial | Apache-2.0 project licence exists. Current dependencies are React, React DOM, React Router, Vite, TypeScript, Oxlint, and Oxfmt. Final shadcn items and any assets still require review and disclosure. |
| Submission links checked privately | Blocked | Public build and video links do not exist. |

## Minimum submission sequence

This is a deadline sequence, not authorization to deploy or submit.

1. Implement one complete synthetic journey: landing, example entry, Profile review, Evaluation, supported Plan, and declared external links.
2. Include the strict stop states that affect honesty: unsupported Profile and stale Rules. Leave unfinished routes or controls out of the video.
3. Build static assets and deploy a public no-approval preview with Analytics disabled.
4. Check the submitted journey on a phone-sized viewport and in a private browser window. Confirm every shown control works.
5. Freeze the build used for the video. Record a public video no longer than two minutes.
6. Finalize the summary and Codex disclosure against that exact build.
7. Check the public URL, video URL, registered email, partner field, permissions, and disclosure immediately before the human submits.

## Draft project summary

My Next Filing is a browser-only compliance guide for one narrow profile: a GST-unregistered resident individual who provides IT or software consulting directly to clients in India.

The problem started with reminder overload. Deadlines arrived as disconnected emails, without one view of what applied, why it applied, or what to do next. My Next Filing asks for a small set of declared facts and uses a reviewed local Rule dataset to show an estimated income-tax amount, advance-tax status, annual return date, and GST-registration threshold status.

The prototype has no account, backend, government connection, filing action, payment flow, or reminder system. Profile and money values stay in the browser. Unsupported facts stop the calculation instead of producing a broad approximation. Statutory sources sit beside results, while external tutorials remain clearly separate.

The demonstration uses fictional amounts and labels every external step. It is an independent prototype and does not claim government endorsement, adoption, or professional tax advice.

## Draft two-minute video outline

| Time | Content |
| --- | --- |
| 0:00–0:12 | State the reminder-noise problem and supported Profile. |
| 0:12–0:48 | Run the fictional example through review to the Plan. |
| 0:48–1:00 | Show the next deadline, estimate, GST status, Sources, and external-step labels. |
| 1:00–1:22 | Explain local Evaluation, versioned Rules, static deployment, and no backend. |
| 1:22–1:42 | Explain Codex's material work: specification analysis, statutory research, decision map, UI prototype, and implementation assistance. |
| 1:42–1:55 | Show the unsupported or stale stop state and privacy limits. |
| 1:55–2:00 | Close on the public URL and independent-prototype disclosure. |

## Draft Codex contribution disclosure

Codex materially contributed to turning the approved product specification into an implementation-ready decision map, checking statutory and deployment sources, identifying and resolving the GST aggregate-turnover defect, prototyping and refining the interface, defining the domain glossary and module seams, and assisting with implementation and verification. The author reviewed the decisions and remains responsible for the submitted product and statutory claims.

## Human confirmation required

- Is this an active submission target for 10:00 PM IST today?
- Is the entrant solo or part of a registered two-person team?
- Has the intended submission owner registered with the email they will use on the form?
- If a partner exists, has that partner registered separately and supplied their registered email privately?
