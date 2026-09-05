# My Next Filing solo-freelancer successor specification

| Item | Value |
| --- | --- |
| Document type | Successor product specification |
| Status | Approved for implementation |
| Product | My Next Filing |
| Production domain | `mynextfiling.wekeep.in` |
| Initial statutory period | Tax Year 2026-27 |
| Original planning authority | [.scratch/my-next-filing-solo-freelancer/map.md](.scratch/my-next-filing-solo-freelancer/map.md) |
| Frontend redesign authority | [.scratch/frontend-ideas/spec.md](.scratch/frontend-ideas/spec.md) |
| Original implementation plan | [.scratch/my-next-filing-solo-freelancer/implementation-plan.md](.scratch/my-next-filing-solo-freelancer/implementation-plan.md) |
| Frontend redesign plan | [.scratch/frontend-ideas/implementation-plan.md](.scratch/frontend-ideas/implementation-plan.md) |

## Document authority

This root specification is authoritative for the successor implementation. The previous release specification remains recoverable in version control history and is not a second public journey.

[`CONTEXT.md`](CONTEXT.md) defines controlled product language. The original decision tickets linked from the [final audit](.scratch/my-next-filing-solo-freelancer/issues/15-audit-decision-completeness.md) and the accepted [frontend ADRs](docs/adr/) explain the material choices. This document defines the resulting behavior.

Statutory values in this specification come from the planning research dated 2 September 2026. They are implementation inputs, not release approval. The compliance gate in [Define verification and release gates](.scratch/my-next-filing-solo-freelancer/issues/14-define-verification-and-release-gates.md) must verify them again against then-current official sources before Rule freeze and public release.

## Product outcome

My Next Filing gives a resident-individual Solo freelancer one clear view of supported Indian tax obligations. The user declares a narrow Profile. The Application evaluates that Profile locally against typed and expiry-bound Rules, shows the next supported action, and can save the Profile and user-declared Completion records in the current browser after explicit consent.

The primary outcome is simple: a returning user can identify what remains without completing the questionnaire again.

The Application remains general, best-effort information. It does not give tax, accounting, or legal advice. It does not file, pay, verify, or connect to a government system.

## Release slices

### First successor release

The first successor release must ship one complete loop:

1. A supported Solo freelancer enters or revises a Profile.
2. Evaluation returns the supported income-tax estimate, area Coverage, Review actions, and dated Obligations.
3. The user can continue without saving or explicitly save in the current browser.
4. A later visit restores the saved Profile, revalidates it, re-runs Evaluation against current Rules, and shows what remains.
5. The user can create, change, and undo a Completion record.
6. The user can delete saved data and return to the new-user state.

The first release supports the income-tax paths, GST-registration threshold result, and conditional GST-registration Obligation in this specification. A registered freelancer may receive a supported income-tax result with unavailable GST-return Coverage. The first release does not contain the registered-exporter return calendar.

The generic public-site share action is optional finishing work. Its failure cannot delay the saved-workspace loop.

### Later slices

The next Tax Year slice adds rollover, Open prior years, and read-only archives before users need the next Rule dataset. It moves ahead of the GST slice when the calendar requires it.

The later registered-exporter slice adds the narrow GST calendar defined below only after its own current statutory review.

Each slice uses the same Profile, Evaluation, Rules, workspace, and Completion models. It must not create a second calculator or workspace.

## Supported audience and public claim

The public claim may say that My Next Filing supports Solo digital freelancers in India only after the release passes the Profile, statutory, privacy, and target-user gates.

The intended activities are:

- software development and information technology;
- technical consultancy;
- design;
- writing and content;
- marketing and advertising; and
- another digital service that the user confirms belongs wholly to the Eligible business path and is not a specified profession, agency, commission, brokerage, goods, royalty, or licensing activity.

An activity label helps the user understand the question. It never selects a tax path. The user must confirm the path used in their records or chosen with professional advice. "Not sure" stops the calculation.

## Profile boundary

### Shared conditions

Every calculable Profile must confirm that the user:

- is an individual aged eighteen or older;
- is resident and ordinarily resident in India for the Tax Year;
- uses the new tax regime;
- operates one self-employed service practice set up and managed in India;
- performs all income-producing work in India;
- has no partner, employee, foreign operation, or subcontractor delivering the client work;
- uses one confirmed presumptive path for the whole practice;
- has no unsupported income, deduction, loss, credit, special-rate item, audit requirement, surcharge case, or taxable total income above ₹50 lakh; and
- can supply complete non-negative safe-integer rupee amounts from their tax records.

An incidental domestic contractor is allowed only when that contractor does not deliver the client work and creates no payroll, deductor, agency, second-business, or foreign-operation duty. Uncertainty about this boundary stops the calculation.

The Profile supports domestic-only, foreign-only, and mixed clients. It supports direct work, platform-mediated work, and a mix of both only when every applicable client branch below succeeds.

### Specified professional path

This path requires:

- confirmation that the whole practice is a specified profession under the applicable Rules;
- gross receipts before expenses, platform fees, Indian withholding, or other deductions;
- cash receipts, including non-account-payee cheques and drafts;
- gross receipts no higher than ₹50 lakh when cash receipts exceed 5 percent, or ₹75 lakh when cash receipts do not exceed 5 percent; and
- declared profit no lower than 50 percent of gross receipts.

A lower-profit claim, unknown cash amount, exceeded receipt limit, regular-books case, audit case, or uncertain profession classification is Unsupported.

### Eligible business path

This path requires confirmation that:

- the whole practice is an eligible business and not a specified profession;
- the practice is not goods carriage, agency, commission, or brokerage;
- the user claims no Chapter VIII-C deduction;
- no five-year presumptive-method exclusion applies;
- the user can separate qualifying banking or online receipts received during the Tax Year or by the applicable return due date from all other receipts;
- gross receipts do not exceed ₹2 crore, or ₹3 crore when cash receipts do not exceed 5 percent; and
- declared profit is no lower than 6 percent of qualifying banking or online receipts plus 8 percent of all other receipts.

Non-account-payee cheques and drafts count as cash for the 5-percent test. An uncertain classification, payment-mode split, five-year history, exclusion, lower-profit claim, exceeded limit, regular-books case, or audit case is Unsupported. This path is not a fallback when the Specified professional path fails.

### Platform work

Platform work is supported only when the user confirms that:

- they supply the main service on their own account;
- their records identify the contractual recipient;
- their records state gross customer consideration before platform fees and withholding;
- the income is not employment, commission, brokerage, royalty, licensing, or an agency receipt; and
- any foreign platform fee has known GST treatment and creates no unsupported recipient-side reverse-charge duty.

Evaluation never infers classification from a platform brand. An unclear recipient, gross amount, legal relationship, or income character is Unsupported.

### Foreign professional receipts

Foreign clients do not by themselves make the income-tax estimate unsupported. The foreign or mixed-client branch requires confirmation that:

- the practice and all income-producing work remain in India;
- the overseas contractual recipient is identifiable in the user's records;
- the freelancer supplies the main service on their own account and is not an agent or intermediary;
- the ordinary cross-border place-of-supply rule applies;
- supplier and recipient are not establishments of the same person;
- payment uses convertible foreign exchange or an RBI-permitted rupee route;
- the fully covered path settles through an authorised route to the user's own Indian bank account;
- the fully covered path has no foreign account, retained platform balance, signing authority, foreign operation, foreign tax, or treaty-relief fact; and
- gross receipts and all currency effects are resolved in one confirmed annual rupee total.

The annual rupee total must already reflect the user's regular cash or mercantile method and resolve fees, withholding, refunds, chargebacks, receivables, and exchange effects. The Application does not collect foreign-currency totals or perform conversion.

A possible foreign account, virtual receiving account, wallet, provider-held balance, contractual claim against a foreign provider, or signing authority can leave the income-tax estimate supported but makes the related return or foreign-account guidance unavailable. Work outside India, a foreign operation, RNOR or uncertain residence, foreign tax or treaty relief, unresolved receipts, or unresolved currency/account effects is Unsupported.

When foreign receipts exist, show a concise reviewed note about the 1 October 2026 FEMA transition and direct the user to their authorised dealer or a qualified adviser. This is guidance, not an Obligation. An annual total cannot produce invoice-level export, realisation, repatriation, SOFTEX, or service-EDF dates.

The Application does not collect client or platform names, client countries, account numbers, routing details, balances, invoices, documents, or foreign tax identifiers.

### Supported other income and credits

The Profile supports only:

- taxable bank or deposit interest before TDS;
- actual Indian TDS for included income;
- actual Indian TCS; and
- advance tax already paid for the Tax Year.

Salary, house property, dividends or gifts, capital gains, crypto, gaming, lottery, agricultural income, unrelated foreign income, foreign tax, disputed credits, deductions, losses, special-rate income, and another business or profession are Unsupported.

### GST branch

An unregistered user supplies state or Union territory, complete GST aggregate turnover, compulsory-registration facts, and the threshold-liability date when known.

GST aggregate turnover is the all-India value for the same PAN defined in `CONTEXT.md`; it is not copied from professional receipts or bank interest. A threshold-liability date must fall within the Tax Year and cannot be later than the current India date. A definite or uncertain compulsory-registration fact makes the turnover-only GST conclusion unavailable unless it also changes the core income path or receipts.

A user with one active normal-taxpayer GSTIN can receive the income-tax result without storing the GSTIN value. GST-return Coverage is unavailable in the first successor release.

Another or uncertain registration state, multiple GSTINs, composition, suspension, cancellation, reverse charge, or uncertain GST facts makes GST Coverage unavailable when those facts do not change the income path or receipts. If they can change the core tax calculation, the Profile is Unsupported.

## Questionnaire

The questionnaire uses one group per static nested `/check` route, visible progress, back navigation, preserved answers, and a final review with one Edit action per group. Introduce `1 April 2026 to 31 March 2027` before the shorthand `Tax Year 2026-27` on first use. It asks only facts that change a supported branch, calculation, Coverage result, Review action, or Obligation.

The groups are:

1. Tax Year, adult/residence/new-regime facts, and one-practice boundary.
2. Activity choice and explicit income-path confirmation.
3. Gross receipts, declared profit, and the payment split required by that path.
4. Domestic, foreign, or mixed clients; direct, platform-mediated, or both kinds of work; and platform and foreign follow-ups only when applicable.
5. Supported other income and Indian credits.
6. GST facts and the consolidated annual-return trigger confirmation.
7. Review.

Every uncertainty that can stop or reduce Coverage offers "Not sure". The interface explains uncommon legal confirmations. It does not infer a favorable answer to save a click.

Questionnaire drafts use display strings and may be incomplete. They are not Profile values and never enter Evaluation without fresh completion and `parseProfile`.

Amount inputs, including Plan payment updates, apply Indian digit grouping while the user types and preserve the cursor position. Blank and invalid entries remain available for correction without rounding or changing their meaning.

For a personal questionnaire, create one versioned Recovery draft at `my-next-filing:recovery-draft` in current-tab `sessionStorage` as soon as `/check` opens, including while blank. Replace the complete small value after every answer change and retain it through Supported, Unsupported, stale-rules, and unsaved Plan states. A refresh restores the Draft, revalidates it, and reruns Profile parsing and Evaluation as applicable. Do not store examples, routes, errors, Profiles, Evaluation results, Completion records, or UI state in the Recovery draft.

Treat Recovery storage as untrusted and best effort. Invalid Recovery data is removed and starts blank. A storage or removal failure preserves current in-memory answers, warns that refresh recovery is unavailable, and never blocks calculation. `Start over` removes only Recovery data after confirmation when answers exist. It never deletes a Saved workspace.

Restore browser data before enabling Recovery writes. Pause synchronization while an example or explicitly selected Saved workspace is displayed and during deletion. Start over replaces the old answers with a blank Draft only after verified removal. Saving the active Draft clears its recoverable session before cleanup; full deletion clears it after verified removal. A later render or route transition must not recreate the removed answers. Full deletion leaves both keys absent until a new personal questionnaire opens.

Storage warnings remain visible and actionable until their own conditions resolve. Derive them separately from temporary success notices, so a successful Recovery write cannot hide a workspace failure or vice versa.

After the first verified Recovery write in a loaded document, show for about four seconds: `Your answers will stay available if you refresh this tab. Closing the tab may remove them.` Explain the same behavior in the landing-page FAQ. A later unchanged write does not repeat the notice.

## Evaluation contract

The Application has one synchronous, deterministic, side-effect-free Evaluation module.

- `parseProfile(unknown)` returns one complete discriminated Profile or structured input errors.
- `evaluate(profile, currentDate, validatedRules)` returns one Evaluation result.

Routes render structured outcomes. They do not calculate tax, select an income path, decide an Obligation, merge Coverage, or construct a Profile by assertion.

Evaluation returns exactly three top-level kinds:

1. `supported`. The income-tax estimate is valid. The result includes the selected path, tax breakdown, area Coverage, applicable Obligations, Review actions, assumptions, explanations, and Source identities.
2. `unsupported`. A well-formed declared fact can change the core calculation or lies outside scope. The result contains stable fact codes, affected areas, plain reasons, correction-group identities, and safe official starting Sources. It contains no estimate.
3. `stale-rules`. Core Rules, dataset identity, or core Source provenance is invalid, missing, or stale. It contains no estimate.

Annual-return, GST, and foreign-account or return guidance use tagged Coverage:

- `available` contains a complete conclusion, including a conclusion that no action applies;
- `unavailable` contains a stable reason, affected area, plain guidance, and safe Source identities.

Unavailable Coverage inside a Supported result is Incomplete coverage. Null or a missing property never means unavailable or not applicable.

Core income-tax failure stops the complete estimate. A stale independent group withholds only its area and its Obligations. Evaluation never uses an old group, neighboring period, default, or favorable assumption.

## Income-tax calculation

For the Specified professional path, presumptive income is the greater of declared profit and 50 percent of gross receipts.

For the Eligible business path, presumptive income is the greater of declared profit and the sum of:

- 6 percent of qualifying banking or online receipts; and
- 8 percent of all other receipts.

Add supported taxable bank or deposit interest to presumptive income. Round total income to the nearest ₹10 before applying slab tax. Apply the Tax Year 2026-27 new-regime bands:

| Rounded total-income band | Rate |
| --- | ---: |
| Up to ₹4,00,000 | Nil |
| ₹4,00,001 to ₹8,00,000 | 5% |
| ₹8,00,001 to ₹12,00,000 | 10% |
| ₹12,00,001 to ₹16,00,000 | 15% |
| ₹16,00,001 to ₹20,00,000 | 20% |
| ₹20,00,001 to ₹24,00,000 | 25% |
| Above ₹24,00,000 | 30% |

For ordinary slab-tax income no higher than ₹12 lakh, the rebate is the lower of slab tax and ₹60,000. Above ₹12 lakh, marginal relief limits slab tax to the income above ₹12 lakh when slab tax would otherwise be higher. The comparison, not a hard-coded endpoint, controls the result.

Calculate Health and Education Cess at 4 percent after rebate or marginal relief. Subtract actual Indian TDS and TCS. The rounded non-negative result before advance tax paid is estimated advance-tax liability. Subtract advance tax already paid to produce the estimated remaining amount or refund, rounded to the nearest ₹10.

The Application stops when rounded total income exceeds ₹50 lakh. It calculates no surcharge, deduction, loss, special-rate tax, foreign-tax relief, interest, fee, or penalty.

## First-release Obligation catalog

Only a dated applicable action is an Obligation. An undated fact to verify is a Review action and cannot receive a Completion record.

### Pay advance tax

This applies to either income path when estimated advance-tax liability after actual Indian TDS and TCS is at least ₹10,000. Its normal due date is 15 March 2027. Advance tax already paid reduces the estimated remaining amount but does not erase applicability.

Only this Obligation shows an amount. The amount is an estimate, never a government demand. The Application does not calculate interest.

### File the annual income-tax return

This applies when any supported trigger is established:

- rounded total income is above ₹4 lakh;
- Specified professional path gross receipts exceed ₹10 lakh;
- Eligible business path gross receipts exceed ₹60 lakh;
- actual Indian TDS plus TCS is at least ₹25,000, or at least ₹50,000 for a resident individual aged sixty or older; or
- the user confirms that another prescribed filing trigger applies.

Ask whether the user is sixty or older only when that answer changes the TDS/TCS trigger. If another prescribed trigger is uncertain, keep the tax estimate and make annual-return Coverage unavailable.

The normal due date is 31 August 2027 for the supported non-audit Profile. The Obligation does not name ITR-3 or ITR-4. Return-form guidance remains unavailable until current forms and disclosure facts are reviewed.

### Apply for GST registration

This applies only when an unregistered Profile exceeds the applicable service threshold, the threshold-liability date is known, and no separate compulsory-registration uncertainty exists. The normal due date is thirty days after liability arose.

The starting threshold is ₹10 lakh in Manipur, Mizoram, Nagaland, and Tripura and ₹20 lakh elsewhere. Exactly at the threshold is an Available conclusion with no Obligation. Above the threshold with an unknown liability date produces an urgent Review action and unavailable GST Coverage, not an invented date.

This Obligation shows no GST amount.

## Obligation and Source model

An Obligation contains:

- a structured composite identity made from kind and Tax Year or GST period;
- title and applicability reasons;
- normal due date and its direct statutory Source;
- optional operative due date and its direct extension Source;
- India-date Deadline status;
- optional estimated amount only when supported;
- a short non-numeric consequence summary;
- Rule and statutory Source identities;
- optional separately reviewed Tutorial Source; and
- verification and expiry metadata.

The operative date controls current status but never replaces the normal date. `Upcoming`, `Due today`, and `Deadline passed` compare the current India date with the operative date or otherwise the normal date. `Deadline passed` never means missed, overdue, filed, or unpaid.

Tutorials never establish applicability, values, dates, or Coverage. Removing a tutorial cannot change Evaluation.

## Saved workspace

Longer-lived saving is optional and starts off. Offer it only after a complete Profile parses and Evaluation returns Supported, including Supported with Incomplete coverage. Do not put Recovery drafts, examples, malformed data, Unsupported Profiles, or Profiles evaluated with stale core Rules in the Saved workspace.

Before the first Saved-workspace write, show this standalone notice, subject to qualified privacy review:

> Save your answers and the completion dates you add. Anyone using this browser profile may be able to see them. There is no account, sync, backup, or recovery. Private browsing or clearing site data may remove them.

Actions are `Save data` and `Cancel`. Store accepted notice version 2. The landing-page FAQ explains saved-data behavior. The questionnaire confirms the user is eighteen or older before a supported result can be saved. Canceling the notice leaves the save action available in the same unsaved session.

The one stable key is `my-next-filing:workspace`. Its version-2 envelope contains only:

- schema version and revision;
- accepted notice version and local ISO decision timestamp;
- Active Tax Year identity, a nullable saved record for that period, and envelope update timestamp;
- prior-year records with Tax Year, open/archived state, last evaluated Rule dataset identity, complete Profile, Completion records, and archive date when archived; and
- Completion identities with `completedOn` India dates.

It stores no draft, example, calculated result, tax breakdown, Rule value or copy, Deadline status, rendered copy, name, government or account identifier, client or platform identity, invoice, document, free text, Analytics value, or share value.

The active saved record is null only when the user deletes the current year's Profile while retaining prior years. The Active Tax Year identity still names the blank current-period start state. If the active saved record is null and no prior year remains, delete the complete workspace key.

### Restore and write behavior

Treat storage as untrusted input. The workspace module:

1. catches storage and JSON failures;
2. rejects missing or extra fields, unsafe numbers, invalid dates, unknown identities, duplicate records, invalid year states, and unknown schema versions;
3. runs only explicit ordered migrations that exist for a real older version;
4. validates the whole migrated envelope and every Profile;
5. selects and validates exact matching Rules; and
6. runs fresh Evaluation before deriving the workspace view.

Version 2 deliberately does not migrate version 1. When the Application encounters a parsed JSON object whose top-level schema version is 1, it rereads the exact key, confirms that version, removes only that key, verifies absence, and shows: `Your previously saved answers and completion dates were removed because this version uses a new workspace.` It repeats verified removal if version 1 reappears, but shows the notice at most once per loaded document. It creates no backup and offers no recovery.

If inspection confirms the version-1 value remains, leave it untouched and offer deletion retry. If removal may have succeeded but verification cannot read the key, report an unverified deletion and offer inspection retry without claiming the raw value survived. Both outcomes block Saved-workspace writes and keep the in-memory questionnaire and Recovery draft available. Do not recreate removed data. A code rollback cannot restore a removed version-1 Profile or Completion record.

Every write replaces the complete small envelope. Immediately before a write or deletion, compare the stored revision with the revision loaded by the tab. A mismatch produces a conflict and reload option. The browser `storage` event refreshes read-only views or marks an editor stale. The Application does not auto-merge.

A quota, security, private-mode, serialization, write, or removal failure preserves valid in-memory work and leaves any verified remaining stored value untouched. Never promise that the previous value survived unreadable post-mutation state or display false success. If deletion may have succeeded but readback fails, report an unverified deletion, pause writes to the affected key, and offer inspection retry. Invalid saved data produces no calculation and cannot be overwritten until the user deliberately deletes it.

Recovery cleanup after saving applies only to the Draft being committed or a freshly verified redundant Profile. Completion changes, saved payment updates, and other workspace-only mutations preserve unrelated in-memory answers and Recovery storage.

The user may start a separate unsaved estimate while invalid saved data remains. That estimate cannot overwrite the invalid value.

Retain the workspace until the user deletes it or the browser clears or evicts it. State that this is best effort, not a statutory record-keeping system. `Delete saved data` withdraws the storage choice by deleting the complete workspace and current-tab Recovery draft because the Application has no second purpose for retaining them.

Deletion removes and verifies only `my-next-filing:workspace` before removing and verifying `my-next-filing:recovery-draft`. It never calls `localStorage.clear()` or `sessionStorage.clear()`. A partial failure identifies what remains; an unreadable result states what could not be verified. Keep inspection and deletion retry reachable even after the workspace key is absent. Clear corresponding memory only after verified removal. Other tabs' Recovery drafts remain separate. On confirmed success, show:

> Your saved answers and completion dates were removed from this browser. Your in-progress answers were removed from this tab.

## Completion records

A Completion record stores exactly one composite Obligation identity and one valid `completedOn` India date no later than today. Absence means not marked complete. It stores no note, amount, acknowledgement, portal status, document, URL, evidence, or payment reference.

Only a current Obligation in a Saved workspace can create a record. A Recovery-only or otherwise unsaved Plan offers saving but no Completion control. When the next saved action can be completed, its main card shows a calendar date selector defaulted to today's India date and a secondary `Mark completed` action. Other saved agenda items use `Add completion date` to open the same controls. After saving, the `Completed` status exposes on hover and keyboard focus:

> You marked this complete on [date]. My Next Filing cannot verify government acceptance.

The later conditional QRMP payment-review action uses `Marked reviewed by you` with the same non-verification statement.

Changing the date replaces the record. `Remove completion` deletes it. Neither action changes the Profile, tax arithmetic, applicability, amount, due date, or Source.

Advance tax cannot be marked complete while its estimated remaining amount is positive. The primary action is `Update amount paid`. The user updates total advance tax already paid, Evaluation runs again, and completion becomes available only when the remaining estimate is zero.

A record matches by composite identity, never title, order, date, or copy. A changed due date or Source retains the match. Changed applicability, period, cadence, or a positive advance-tax balance preserves the record as Needs review and returns the current Obligation to what remains. Needs review is derived, not stored.

A Needs-review record offers deletion. If later current Evaluation reproduces the same identity, it can match again automatically unless an amount reconciliation still fails.

## Tax Year rollover and archive

Exactly one Tax Year is Active. A new Active year can start only when a complete current Rule dataset validates. Reusable prior facts appear only as draft suggestions. The user must confirm every group.

Never carry forward money, Completion records, age/residence/regime confirmations, presumptive eligibility, audit facts, GST state, foreign facts, Coverage, Obligations, dates, Rules, or calculated results. Clear amount inputs to empty, not zero.

An ended year remains Open while an applicable Obligation is uncompleted or a Completion record Needs review. It stays editable and uses only its exact matching current Rules. Open Obligations from all evaluable Active and Open years share one chronological agenda.

If any Active or Open year has stale core Rules, the workspace cannot prove the overall earliest remaining item. Its Rules-review state becomes the main attention card. Independently valid years and agendas remain visible below.

Otherwise, sort open Obligations by operative or normal date and then catalog order. The first is the next action. When no Obligation remains, say that no supported action remains for the evaluated scope and continue to show any separate Review action or unavailable Coverage.

Archiving is available only after the earning period ends, exact Rules reproduce the Profile and Obligations, no Obligation remains open, and no Completion record Needs review. The user confirms that an archive is a personal convenience record, not government verification.

An archive shows only the read-only Profile, Completion records and declared dates, Tax Year, Rule dataset identity, archive date, and non-verification statement. It contains no calculation snapshot and cannot be reopened, edited, recalculated, duplicated, or used as the next year's Profile. Active, Open prior, and Archived years can be deleted individually. Deleting the Active year's record returns that period to a blank start state and leaves prior years intact.

If a later statutory correction affects an archive's recorded Rule dataset, show an archive warning. Do not rewrite the Profile, Completion records, or historical display in place.

## Entry, workspace, and correction experience

The public landing page remains generic. Reuse its current origin story and self-hosted media where the copy remains accurate. Update only the scope, privacy, and actions needed by this successor. Without browser data, its primary action starts an estimate. An incomplete Recovery draft uses `Continue your estimate`; a complete Recovery draft uses `Continue your plan`; and a Saved workspace alone uses `Continue your saved workspace`. When both exist, Recovery is primary and `Open saved workspace` is secondary. Hide the secondary action when the complete personal plan has the same Profile and the Saved workspace has no Completion records or prior years to show. No action exposes a Profile, amount, deadline, or Completion record.

Use the latest in-memory personal work for these actions when its Recovery write failed. Explicitly opening a Saved workspace selects it for the current document without replacing personal answers or deleting their Recovery draft. `Return to your estimate` restores those answers and clears that selection. Refresh clears temporary selection and restores a valid non-redundant Recovery draft ahead of the Saved workspace. Beginning a Saved-workspace edit while personal work exists requires the explicit `Discard draft and edit saved data` action.

Keep one `Try a fictional example` path using the synthetic domestic professional Profile below. Label it fictional throughout. Example state cannot be saved, completed, rolled over, archived, or stored as Recovery. Before example entry, retain the latest personal or Saved-edit session in an in-memory return snapshot. Leaving the example restores those exact answers, including changes that could not be stored, and clears the snapshot. Refresh can restore only the stored Recovery draft. When no personal work exists, `Start your estimate` starts a blank personal estimate. Do not track edits to individual example fields.

| Example fact | Value |
| --- | --- |
| Tax Year | 2026-27 |
| Person and residence | Adult resident and ordinarily resident individual in India |
| Practice | One self-employed practice set up and managed in India; all work performed in India; no employee, partner, foreign operation, or client-work subcontractor |
| State | Maharashtra |
| Activity and path | IT or software consulting; confirmed Specified professional path |
| Clients | Direct clients in India only |
| Tax regime | New regime |
| GST | Unregistered; complete aggregate turnover; no compulsory-registration fact |
| Gross professional receipts | ₹19,00,000 |
| GST aggregate turnover | ₹19,10,000 |
| Cash receipts | ₹0 |
| Declared profit | ₹14,00,000 |
| Taxable bank interest | ₹10,000 |
| Actual Indian TDS | ₹40,000 |
| Actual Indian TCS | ₹0 |
| Advance tax already paid | ₹0 |
| Other annual-return trigger | No |
| Unsupported facts | None |

The example uses declared profit rather than the 50-percent minimum. It produces the reviewed ₹55,160 estimated remaining amount, an advance-tax Obligation, an annual-return Obligation, and a GST threshold result ₹90,000 below Maharashtra's ₹20-lakh threshold. Reverify those expected results whenever the applicable Rules change.

The selected workspace design is the focused timeline:

- one main card answers what to do next;
- a chronological agenda follows;
- Coverage and Review actions remain outside open/completed counts;
- desktop uses a compact Tax Year rail; and
- mobile puts a one-line Tax Year control near the header and the main action before full year management.

`Back` opens the grouped summary. Contextual Coverage and Needs-review links open the affected group. Unsupported keeps in-memory answers and identifies the correction group. It offers no save action or approximate result.

Stale core Rules preserve saved data, replace the main card with `Plan unavailable`, withhold affected calculation and dated agenda items, link fixed official Sources, and keep the saved-data FAQ and deletion controls reachable.

## Routes and presentation

Keep these routes:

- `/` for the generic landing and optional share action;
- `/check` as the questionnaire index, with static children `/check/tax-year`, `/check/activity`, `/check/receipts`, `/check/clients`, `/check/other-income`, `/check/gst`, and `/check/review`;
- `/plan` for a transient result or restored workspace; and
- the existing not-found route.

Only the questionnaire-group identity enters its path. Selected Tax Year, Profile values, amounts, Evaluation state, Completion state, Recovery state, and save state remain in memory or their exact browser-storage values. They do not enter routes, queries, fragments, titles, logs, clipboard content, Analytics, or external links.

The first incomplete group limits forward access, while Review requires all six answer groups to validate. Bare `/check` redirects to the first incomplete group, Review, or a complete session's Plan. Unknown `/check/*` paths remain not-found. Continue and sidebar moves push browser history; index and access corrections plus the interface Back control replace the current entry.

Preserve the current visual language: Fraunces headings, Inter body text, warm neutral ground, dark ink, green accent, compact rounded cards, one primary action, and chronological information. Follow `DESIGN.md`; use its semantic Tailwind tokens and the source-owned shadcn components backed by Base UI where applicable. Generated defaults must be curated to this visual language before use.

Use restrained CSS transitions for press, hover, disclosure, and short content entry. Respect reduced motion. A successful plan transition may show brief confetti feedback, but do not animate money, urgency, or Deadline status.

Navigation feedback is owned by the shared app shell. Pointer-driven links, buttons, and history changes use the same short entry, including opening a different plan at the same path. Initial load, keyboard navigation, hash-only changes, and reduced motion remain immediate. Answer edits, recalculation, and notices do not restart page entry; navigation must not remount content merely to animate it.

Shared questionnaire and result-card containers smoothly resize for pointer-triggered content changes. Newly shown fields, notices, and editors inherit entry feedback. Keyboard interactions and reduced motion remain immediate. Let React remove obsolete or deleted content immediately, and animate only the remaining container's size. Input values and money results are never interpolated.

## Privacy, Analytics, and sharing

The successor has no Google Analytics, product events, session replay, remote error reporting, or remotely executed third-party script. All scripts, fonts, images, video, and captions are bundled or same-origin.

The landing-page FAQ must describe the legal operator and contact, automatic current-tab Recovery drafts, longer-lived opt-in Saved workspaces, their stored categories and separate purposes, refresh and tab-closing behavior, current-browser scope, shared-browser risk, best-effort retention, loss, version-1 deletion, archives, deletion controls, Cloudflare hosting request metadata, absence of Analytics, user access/correction/deletion routes, adult-only Saved-workspace creation, and incident/grievance contacts approved by the qualified reviewer.

It must not call browser storage private, anonymous, encrypted, permanent, securely erased, accessible only by the user, or guaranteed to remain on one physical device. State that application code does not upload saved values or include them in application requests, while scripts on the origin and other users of the browser profile may be able to access them.

Qualified review of the [privacy applicability review packet](.scratch/my-next-filing-solo-freelancer/privacy-applicability-review-packet.md) is mandatory before release. Without approval or controlling official clarification for the exact configuration, saved functionality must fail closed no later than 13 May 2027. Bounded deletion and the separately reviewed unsaved calculator remain available.

The optional `Share My Next Filing` action appears only on the public landing page. Use native Web Share when available and copy-link fallback otherwise. The fallback copies only the canonical URL. Preview and share only:

- title: `My Next Filing`;
- text: `A clear, best-effort tax and filing overview for supported solo freelancers in India.`; and
- URL: `https://mynextfiling.wekeep.in/`.

Cancellation changes no state. The Application does not measure sharing or append a query, fragment, campaign, referral, user, or workspace value.

## Cloudflare and security boundary

Deploy the Vite build through Cloudflare Workers Static Assets with SPA fallback and the existing custom domain. Use no Worker script, binding, backend, database, secret, queue, AI product, Workflow, Durable Object, KV, D1, or R2 bucket.

Site-wide static-asset headers must include a same-origin Content Security Policy for scripts, styles, fonts, images, media, and connections, plus `frame-ancestors 'none'`, `base-uri 'none'`, `object-src 'none'`, no-referrer policy, MIME sniffing protection, framing protection, and a restrictive Permissions Policy. Preserve the HLS content type.

External statutory and Tutorial Sources are fixed registry URLs. They open with `noopener noreferrer`, are not prefetched, and contain no user-built value.

## Repository and publication

Keep the project licensed under Apache License 2.0. The repository keeps the specification, controlled glossary, lockfile, Rule and Source policy, and commands for development, formatting, lint, types, tests, Rule validation, build, preview, and deployment.

Do not commit real taxpayer data, credentials, private portal captures, private APIs, copied government code, or generated claims of government adoption. Keep the existing first-person project origin and describe Codex contributions accurately where relevant. The Application uses no government logo and does not imitate a government portal.

## Rules and Sources

Keep one local Rule dataset per Tax Year. The root contains identity, schema version, Tax Year, effective interval, verification date, overall review deadline, change notes, and one Source registry.

Use independent groups for:

- income paths and receipt limits;
- common income-tax calculation;
- advance tax;
- annual return;
- GST registration; and
- the later GST calendar and LUT Rules only when that slice ships.

Each group has identity, effective interval, verification and expiry dates, values, conditions, and direct statutory Source identities. The validator rejects unsafe values, unknown versions, duplicate identities, invalid or overlapping dates, missing required values, inconsistent thresholds or rates, unreferenced Rules, missing or non-HTTPS Sources, invalid review chronology, expired groups, and operative dates without direct extension provenance.

The Source registry distinguishes statutory and Tutorial Sources. Every personalized conclusion points through Rules to direct statutory authority. An extension requires its own notification Source. A Tutorial Source has review status and never establishes a Rule.

The release compliance review must cover every item listed in [Define verification and release gates](.scratch/my-next-filing-solo-freelancer/issues/14-define-verification-and-release-gates.md), including the 1 October 2026 FEMA transition and the then-current status of the intermediary place-of-supply amendment.

## Later registered-exporter calendar

The later slice may support one active normal-taxpayer GSTIN in one Indian state after the user confirms cadence and all export conditions. It adds only:

- Furnish LUT before the first planned export when eligible and exporting without payment of IGST;
- monthly GSTR-1 on the 11th day of the next month;
- monthly GSTR-3B on the 20th day of the next month;
- quarterly GSTR-1 on the 13th day after the quarter;
- quarterly GSTR-3B on the applicable 22nd or 24th day after the quarter; and
- conditional QRMP monthly payment review on the 25th day of the next month for the first two months of a quarter.

An unknown first-export date or LUT eligibility produces a Review action. IFF remains optional and never becomes an Obligation. More than one GSTIN, composition, suspension, cancellation, a non-normal taxpayer type, or unknown cadence is outside the calendar.

This slice calculates no GST payable, ledger balance, input-tax credit, refund, interest, fee, or penalty. It excludes return preparation and submission. GSTR-9 for 2026-27 remains excluded until period-specific forms and exemptions are officially available and reviewed.

## Accessibility, performance, and browser behavior

The complete product works from 320 CSS pixels upward, at 200 percent zoom, by keyboard, with visible focus, semantic landmarks and headings, persistent labels, linked errors, named groups, text in addition to color, 44-pixel targets, announced state changes, and no focus trap.

VoiceOver on Safari and one desktop screen reader must complete Recovery restoration, nested-route navigation, save, resume, Completion, undo, conflict recovery, Start over, and deletion. Reduced motion removes nonessential movement.

Evaluation and workspace derivation remain synchronous. No questionnaire transition shows a loading state. After initial same-origin assets load, the core calculation works without a network connection. Route-level splitting is allowed only after measurement shows a need.

The production preview targets mobile Lighthouse Performance of at least 90 and Accessibility of 100 for the landing, questionnaire state classes, and plan/workspace.

## Release acceptance

The release commit must pass the complete gate in [Define verification and release gates](.scratch/my-next-filing-solo-freelancer/issues/14-define-verification-and-release-gates.md). This includes:

- one formatting, lint, type, Rule, deterministic-test, and production-build path;
- exact Profile, Evaluation, Rules, workspace, Completion, rollover, and failure fixtures;
- exact questionnaire reducer, branch selector, Recovery draft, nested-route, Plan-model, schema-version-2, version-1 deletion, unverified and partial-deletion fixtures, including independent warnings, unrelated-draft preservation, and example return after failed writes;
- built-browser verification that restoration precedes synchronization, later Effects cannot recreate deleted answers, and partial-deletion retry remains reachable;
- the synthetic multi-browser journey matrix;
- production-bundle, storage, network, CSP, and deletion inspection;
- refreshed official-source compliance review;
- completed qualified privacy approval;
- accessibility and performance evidence;
- the five-person moderated usability test; and
- Cloudflare preview, production smoke test, and rollback evidence from the same commit.

At least four of five representative Solo freelancers must complete the full enter/save/reload/identify/complete/undo/delete loop without help. All five must understand that saving is current-browser only and Completion is not government verification.

## Out of scope

- Accounts, login, authentication, cloud sync, server persistence, or recovery.
- Document upload, bank-statement parsing, OCR, runtime AI, or bookkeeping.
- Email, SMS, WhatsApp, push, browser, or calendar reminders.
- Personal sharing, public records, referrals, streaks, community counts, or leaderboards.
- Government credentials, OTPs, APIs, portal integration, filing, payment, or acceptance verification.
- Foreign-tax credit, foreign salary, investments, property, capital gains, foreign-asset guidance, and unrelated foreign-source income.
- GST liability, input-tax credit, refunds, preparation, validation, upload, or submission.
- Historical backfill or recalculation under superseded Rules.
- Companies, LLPs, partnerships, HUFs, trusts, non-residents, employers, payroll, or deductor duties.
- Regular-books cases, old tax regime, audit cases, surcharge cases, and taxable total income above ₹50 lakh.
- Late-interest, late-fee, or penalty calculation.
- Native mobile application, installable PWA, dark theme, translations, mascot, or formal WCAG certification.
