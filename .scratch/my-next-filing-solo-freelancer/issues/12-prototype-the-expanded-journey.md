# Prototype the expanded filing-workspace journey

Type: prototype
Status: resolved
Blocked by: 05, 06, 07, 08, 09, 10, 11

## Question

Using a rough responsive prototype and live human review, how should a new user, returning user, domestic freelancer, foreign-client freelancer, GST-registered exporter, unsupported user, and stale-rules user move through the successor Application? Decide the minimum-input questionnaire, save consent, resume state, next action, agenda, Completion record controls, Tax Year archive, generic share action, corrections, stop states, mobile behavior, accessibility, and motion while preserving the current design language.

## Answer

Choose **Variant A: Focused timeline**. It extends the current result-and-plan journey into a Saved workspace without turning the Application into a dashboard or task manager. The throwaway prototype is on branch `prototype/solo-freelancer-workspace` at commit `7ca461d`; its source is `.scratch/my-next-filing-solo-freelancer/prototype/` on that branch.

The user delegated the prototype review to the agent and accepted the recommendation. This resolves the interaction direction, not the release usability gate; representative target users still test the implemented journey before release.

### Entry and resume

- Keep the public landing page generic. With no saved data, its primary action starts a check. With a valid Saved workspace, its primary action says “Continue your saved workspace” without exposing a Profile, amount, deadline, or completion on the landing page.
- Continue opens the focused workspace with the earliest open Obligation across the Active and Open prior Tax Years as the main card. If none is open, show the most urgent Review action or the plain statement that no supported action remains.
- Do not support parallel workspaces or a second saved draft. “Review answers” edits the current Active Tax Year; deletion is the deliberate path to start over.
- Keep “Share My Next Filing” secondary and only on the public landing page. It uses the fixed generic payload already decided and never appears inside a personalized workspace.
- Keep one “Try an example” path with the current synthetic domestic professional Profile. Label it as fictional throughout; it cannot enable saving, create Completion records, or enter rollover/archive state. “Use my information” starts a blank personal check instead of tracking edits to individual example fields.

### Minimum-input questionnaire

Retain the current one-group-at-a-time form, back navigation, visible progress, and final review. Do not save a draft. Ask only facts that select a supported branch or change a calculation, Coverage result, or Obligation:

1. Tax Year, adult/residence/new-regime facts, and the one-practice boundary.
2. Plain-language activity choice, followed by the user's explicit Specified professional or Eligible business path confirmation. Never infer the path from a job title.
3. Gross rupee receipts, declared profit, and only the cash or qualifying-payment split required by that path.
4. Domestic, foreign, or mixed clients. Ask platform facts only when a platform is used and foreign-receipt facts only when foreign receipts exist. Accept the user's resolved annual rupee totals; never ask for client names, countries, accounts, balances, invoices, or foreign-currency amounts.
5. Supported other income and Indian credits.
6. GST registration/turnover facts and the consolidated annual-return trigger confirmation.
7. A review grouped by those same sections, with an Edit action per group.

Hide irrelevant follow-ups, preserve entered values when moving back, explain why an uncommon confirmation is required, and offer “Not sure” wherever uncertainty must stop or reduce Coverage. Do not replace legal confirmations with inferred defaults merely to remove a click.

### Workspace hierarchy

- The main card always answers “What should I do next?” with the action, normal or operative date, short applicability reason, current Deadline status, and an amount only for advance tax.
- A chronological “Your agenda” follows, mixing Active and Open prior years while labeling each Tax Year. Completed declarations remain visible but do not displace the next open item.
- Coverage warnings and Review actions sit next to the affected result and outside the completed/open count. Foreign-account, return-form, or GST uncertainty must never look like a completed duty.
- On desktop, keep a compact Tax Year rail for Active, Open prior, and Archived years. Archived views show only the read-only Profile, Completion records, Rule dataset identity, archive date, and non-verification statement approved in ticket 10.
- The first successor gives a GST-registered freelancer the supported income-tax workspace plus Incomplete GST coverage. The later exporter calendar adds its dated GST items to the same agenda; it does not create a separate GST dashboard.

### Completion and correction controls

- For annual-return and GST Obligations, “Mark complete” opens a compact confirmation with a native date input defaulted to today's India date and the permanent government-non-verification statement.
- For advance tax with a positive estimated amount remaining, the primary action is **Update payment**, not “Mark complete.” It returns to the advance-tax-paid input and offers completion only after re-evaluation reaches zero remaining.
- A matched record reads “Marked complete by you on [date]” or the approved QRMP review wording. “Change date” and “Undo” stay beside that record; neither requires restarting the questionnaire.
- “Review answers” opens the grouped summary first. Contextual Coverage and Needs-review notices deep-link to the affected group. Saving occurs only after the edited Profile parses, evaluates to a Supported result, and the whole-envelope write succeeds.
- Offer the standalone save notice after the first supported result, including Supported with Incomplete coverage. “Save on this device” and “Continue without saving” are peers. Do not ask again in the same unsaved journey after rejection.

### Stop and failure states

- Unsupported keeps the user's current in-memory answers and identifies the exact group to change; it offers no agenda, save action, or false partial calculation.
- Stale core Rules preserve the Saved workspace, replace the next-action card with “Rules need review,” withhold calculations and dated agenda items, link fixed official Sources, and keep review and deletion available.
- If any Active or Open prior Tax Year has stale core Rules, the workspace cannot prove the overall earliest remaining Obligation. Make that year's Rules-review state the main attention card while keeping independently valid years and their dated agendas visible below.
- Invalid saved data produces no calculation and offers only an independent unsaved check or deliberate saved-data deletion. A failed write leaves the current valid work in memory and never displays “Saved.”
- Incomplete coverage keeps valid income-tax conclusions visible, labels the unavailable area, explains the unresolved fact, and provides one Review action rather than a generic warning banner.

### Mobile, accessibility, and motion review

The prototype's structure works at a 320-pixel viewport and its final mobile Lighthouse snapshot scored 100 for accessibility. Production must retain semantic headings, real buttons, visible focus, 44-pixel targets, programmatic pressed/expanded states, errors linked to inputs, keyboard operation, and a reduced-motion path.

| Before | After | Why |
| --- | --- | --- |
| Three competing structures | Focused next-action card, chronological agenda, compact year control | Preserves the current product's strongest mental model and avoids dashboard density. |
| Full Tax Year rail before the hero on a phone | One-line Tax Year control near the header; year management after the main action | The prototype showed that the rail delays the answer to “what is next?” on narrow screens. |
| “Mark complete” while advance tax still has ₹55,160 remaining | “Update payment” until re-evaluation reaches zero | Keeps Completion records separate from money and prevents a false completion state. |
| Persistent inbox/detail split | One page with contextual edit and review links | The split reads as desktop task software and adds a second navigation model. |
| Metric cards for date, balance, and open count | Put the date and, when allowed, amount directly in the next-action card | Removes repeated information and keeps the amount from becoming the product's headline. |

Use only restrained CSS transitions already present in the design language: small button press/hover feedback, short disclosure expansion, and no celebratory or looping motion. Never animate money, urgency, or a Deadline status. The prototype's scenario pills and variant switcher are review controls only and must not ship.
