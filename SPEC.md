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

The GST calendar slice adds the registered-freelancer calendar defined below, with separate return and LUT review boundaries.

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

- the domestic salary branch below, alongside either supported presumptive practice;
- the confirmed ordinary domestic dividend and additional-interest branch below;
- the domestic equity-gains branch below;
- the domestic rental-income branch below;
- taxable bank or deposit interest before TDS;
- actual Indian TDS for included income;
- actual Indian TCS; and
- advance tax already paid for the Tax Year.

House property outside the domestic rental branch, gifts, unsupported dividends or distributions, capital gains outside the domestic equity branch, crypto, gaming, lottery, agricultural income, unrelated foreign income, foreign tax, disputed credits, deductions other than the supported salary, employer NPS and rental deductions, losses outside the domestic equity branch, other special-rate income, and another business or profession are Unsupported.

### Ordinary domestic dividends and additional interest

Ask whether the user has Indian-company dividends, Indian mutual-fund distributions, taxable post-office interest or income-tax refund interest. No is an explicit absent branch; Yes reveals four annual amounts and a scope confirmation. Unknown amounts or treatment never mean zero. Keep bank/deposit interest and all existing income fields separate.

Use tax-record amounts taxable for this Tax Year before Indian TDS. Company dividends follow the applicable declaration/distribution/payment rules; other-source amounts use the user's regular accounting method. Include taxable mutual-fund IDCW whether paid out or reinvested. A bank-credit total alone is not sufficient. Add the four amounts once to combined taxable income before rounding; do not deduct dividend/distribution expenses or change the presumptive profit calculation. Include related actual TDS once in the existing credit total.

Require confirmed ordinary Indian-company dividends and taxable Indian regulated mutual-fund distributions only. Exclude foreign or deemed dividends, buybacks, capital reductions/liquidation, company loans, sale/redemption/switch proceeds, capital gains/losses, REIT/InvIT/business-trust or AIF distributions, other specialised income, and expense/deduction or relief claims. Post-office amounts must already resolve exemptions, ownership and annual timing; exclude principal, exempt interest, unsupported certificates/bonds and premature-closure adjustments. Refund interest excludes refund principal, other kinds of refunds, reversals, disputes and cross-year adjustments.

Keep GST aggregate turnover independently declared; never add these four income-tax fields to it automatically. The normal presumptive advance-tax date remains 15 March. Explain that unexpected dividend income can require a separate review of payment timing, including the conditional 31 March provision, without computing interest or promising relief. Current-year return-form selection remains unavailable.

Preserve workspace version 4 through a version-5 migration. Its supported Profiles explicitly excluded other income, so add the absent additional-income branch. Retain every legacy unsupported fact; a combined dividend/gift exclusion stays blocked until the user reviews it. Recovery version 3 migrates to version 4 with the new answer blank. Capture and retain historical input fixtures. The [research and recent-commit analysis](.scratch/domestic-investment-income/map.md) define the scope and source limitations.

### Domestic salary alongside freelancing

Ask whether salary exists, with Yes, No, and Not sure. Yes reveals a scope confirmation, one annual salary amount and the employer NPS question below. No stores an explicit no-salary branch; uncertainty stops calculation.

The user confirms that all employment is with employers in India for work performed in India, and that their records resolve the complete Tax Year salary under the new regime. The amount combines all employers, includes taxable allowances, bonuses and employer-valued benefits, and excludes only confirmed new-regime exemptions. It is before the standard deduction and TDS, not CTC, take-home pay, or the sum of employer figures after separate standard deductions.

Foreign employment, pension, retirement or termination payouts, leave-encashment settlements, arrears, advance salary, share-based pay, unresolved fund tax adjustments, benefits or exemptions, tax relief, and deductions other than the standard deduction and supported employer NPS, including Agniveer deductions, remain Unsupported. These are product exclusions, not claims that the income or deduction is unlawful. Salary is separate from freelance receipts and employment salary is not included in GST aggregate turnover. Include current-year salary due even when not yet paid; do not subtract employee PF, professional tax or personal NPS contributions.

Deduct the lower of ₹75,000 and aggregate salary once per individual and Tax Year. Add the resulting taxable salary to presumptive income and supported other income. Include actual Indian employer TDS in the existing combined TDS input, counted once. Combined income after the employer NPS deduction controls rebate, marginal relief and the ₹50 lakh ceiling; annual-return income triggers use income before that deduction. The presumptive advance-tax date remains 15 March 2027. Return-form selection remains unavailable.

The [salary research](.scratch/salary-plus-freelancing/research/domestic-salary.md) records the Tax Year 2026-27 authority and exclusions. Preserve existing workspace version-2 records through an explicit version-3 migration adding no salary where the old facts declared none. Recovery version 1 migrates to version 2 with salary unanswered, preserving other answers and requiring confirmation. Neither migration deletes data or grants new salary eligibility. Clear salary amount and confirmation when the salary branch is deselected.

### Employer NPS alongside salary and freelancing

Within the existing Salary section, ask whether employers contribute to the user's NPS Tier I account for this Tax Year. No stores an explicit absent branch. Not sure withholds the core estimate. Yes requires a scope confirmation and separate contribution and eligible-salary amounts for each contributing employer. Collect no employer names or account identifiers. Include each employer once, without repeating earlier employment carried into a later employer's statement.

The existing gross salary amount must include the full employer NPS contributions once, before the standard deduction and NPS deduction. Never add the contribution to salary again. Eligible salary means that employer's basic pay plus DA where the terms of employment provide for it. Exclude other allowances, bonuses, benefits, the employer contribution itself and freelance income from this base. The sum of all entered contributions and eligible salary must fit within declared gross salary; reject unsafe sums, missing amounts and unknown fields.

Require confirmed total employer contributions across recognised PF, NPS and approved superannuation funds, across every employer, no higher than ₹7,50,000 for the year. No taxable annual accretion from current or earlier excess contributions or unresolved fund adjustments is supported. Tier II, Vatsalya, UPS-specific treatment, withdrawals, transfers, pension payouts and other unsupported deductions remain outside this branch. Personal NPS contributions may exist but are not deducted.

For a single contributing employer, deduct the lower of its contribution and 14% of its eligible salary. For multiple contributing employers, this slice requires each contribution within its own 14% limit. An over-cap multi-employer case needs separate review; do not infer cross-employer pooling. Sum the allowed contributions and cap the deduction at ordinary income before NPS, excluding equity gains but including eligible freelance and other ordinary income. Subtract before rounding total income. The resulting amount cannot be negative. Keep freelance income and GST turnover separate.

Show the employer contribution already included in salary, combined income before NPS, the allowed employer NPS deduction and rounded taxable total income. Annual-return income tests use the rounded pre-NPS amount because Chapter VIII deductions are disregarded for that test. Preserve independent triggers even where taxable income or tax becomes nil. The [research and implementation plan](.scratch/employer-nps/map.md) record the authority and the multi-employer boundary.

Migrate workspace version 5 to 6 in memory. A previously confirmed supported domestic salary excluded employer NPS, so add the explicit absent branch. Unconfirmed salary or legacy unsupported facts about salary, deductions or unknown treatment must remain uncertain or blocked. Preserve revision, consent, amounts and Completion records. Reject mixed schemas. Migrate Recovery version 4 to 5 with the new NPS answer blank and no rows; never infer a new questionnaire answer. Clear rows and NPS confirmation when NPS is deselected; clear the NPS branch when salary is deselected. Preserve actual historical schema fixtures and persist only through normal validated writes.

### Domestic equity capital gains alongside freelancing

Support confirmed investment gains and allowable current-year losses from Indian listed equity shares and qualifying Indian equity-oriented mutual funds under sections 196 and 198 alongside either existing presumptive path. Ask Yes, No or Not sure. Yes requires a scope confirmation and four separate non-negative whole-rupee annual totals: short-term gains, short-term losses, long-term gains and long-term losses. Gains are the sum of profitable transactions before set-off; losses are positive absolute totals of allowable loss-making transactions before set-off. A broker’s net-only result is insufficient. Never net losses twice. All records must resolve ownership, holding periods, cost basis, eligible expenses and any older acquisition-cost treatment; enter gains rather than sale proceeds, bank credits or unrealised appreciation. Include all brokers/funds once. Enter long-term gains before the annual ₹1,25,000 threshold and basic-exemption adjustment. Do not deduct STT.

Require the applicable STT conditions: sale chargeable to STT for short-term gains, acquisition and transfer STT paid for long-term shares, and transfer STT paid for long-term fund units. Notification-based acquisition exceptions and IFSC transactions remain outside this branch. Records must already resolve any loss-disallowance rules, including dividend/bonus stripping. Exclude brought-forward losses, losses outside the accepted domestic equity instruments, net-only reports that cannot establish the four buckets; exemption/reinvestment claims, foreign or unlisted shares, property, debt or other nonqualifying funds, REIT/InvIT/AIF/ULIP income, derivatives, intraday/business trading, employee shares, buybacks, clubbing and unresolved corporate actions. Keep other gains and broad special-rate facts as explicit stop facts.

Cap employer NPS at ordinary income excluding both gain categories. Apply long-term losses to long-term gains first. Apply short-term losses to short-term gains, then to remaining long-term gains. This is the disclosed permitted order, not a claim that the statute mandates that priority. Neither loss may reduce ordinary income; any unused amount remains separate. Add the remaining non-negative gains to combined income, including long-term gains within the tax threshold, for total-income, rebate, ceiling and annual-return tests. Annual-return tests remain before Chapter VIII deductions. Round combined total income once to ₹10, then subtract the gains remaining after loss set-off for the non-negative ordinary slab-tax balance. Do not independently round each income category.

Calculate short-term tax at 20% and long-term tax at 12.5% on gains above ₹1,25,000. After current-year loss set-off, when only one gain category is positive and ordinary income is below ₹4 lakh, use the non-negative rounded total above ₹4 lakh as that category's base, capped at its entered gain; apply the long-term threshold afterward where applicable. When both categories remain positive after loss set-off and the ordinary balance is below ₹4 lakh, return Unsupported for basic-exemption allocation review. This is a product scope boundary pending primary-source verification, not denial of a statutory entitlement.

For combined total income up to ₹12 lakh, rebate is limited to ordinary slab tax and ₹60,000. Above ₹12 lakh, calculate marginal relief from total pre-relief tax less income exceeding ₹12 lakh, floored at zero and capped at ordinary slab tax. Neither relief reduces special-rate tax. Apply existing cess, actual credits and final rounding once. Preserve the ₹50 lakh total-income ceiling.

Show entered gains and losses, each of the three permitted applied-loss amounts, remaining gains, unused losses by category, ordinary income for slab tax, basic exemption used, long-term threshold used, final taxable gain bases and both equity-tax components in the existing calculation breakdown. Preserve independent GST facts; never copy gains or proceeds into GST turnover. Keep the presumptive 15 March advance-tax date, with explicit guidance that unexpected gains may require separate payment-timing review including the conditional 31 March provision. Do not calculate interest or promise relief. Return-form selection stays unavailable.

Migrate workspace version 6 to 7 in memory with an absent equity branch only where legacy facts excluded gains; uncertain or unsupported gains/special-rate facts retain the uncertain branch and original stop facts. Preserve revisions, consent, amounts and completions. Recovery version 5 migrates to 6 with the new answer and fields blank. Never clear legacy `capitalGains` automatically. Reject mixed schema shapes and hidden amounts; deselecting gains clears their amounts and confirmation. Current writes use these versions after validation. The [plan and research](.scratch/domestic-equity-gains/map.md) record evidence and limits.

Current-year loss support migrates workspace 7 to 8 in memory, retaining earlier migrations. Old confirmed domestic equity Profiles explicitly excluded current-year losses and receive zero loss fields. An uncertain scope or retained legacy gain/loss stop remains uncertain or blocked; zero placeholders in such a blocked branch do not grant eligibility. Preserve existing amounts, revision, consent and Completion records. Reject old/new mixed fields. Recovery 6 migrates to 7 with both loss fields blank and equity confirmation cleared; a former No to gains becomes unanswered because the question now also covers pure losses. Preserve an existing Yes and its gain amounts. Branch deselection clears all four amounts. No new storage key or future-year loss ledger is introduced.

If a capital loss remains unused, show its amount and category beside the estimate even when tax is zero. The independently validated annual-return conclusion includes conditional carry-forward guidance. To preserve the option to claim carry-forward, the plan includes the existing annual-return action with explicit conditional wording, including when no other filing trigger is established. Its `required` conclusion then means filing is required to claim carry-forward, not that merely realising a loss unconditionally requires a return. Sections 111, 121 and 263 require timely filing and determination of the loss; do not promise an approved balance. Explain the maximum eight immediately following Tax Years and that ST loss can offset future capital gains but LT loss only future LT gains. This version does not apply brought-forward losses. Stale/missing annual-return evidence withholds its deadline and carry-forward conclusion while preserving core loss set-off, the unused-loss amounts and an explicit guidance-review notice. Preserve the existing conditional advance-tax timing guidance. See the [loss-support plan and research](.scratch/domestic-equity-losses/map.md).

### Domestic rental income alongside freelancing

Ask Yes, No or Not sure about rental income. Yes requires confirmation of one wholly owned Indian residential property let for residential use, with annual value and tax-record amounts resolved. Exclude co-ownership, deemed ownership or clubbing, foreign property, commercial or business-style letting, subletting, self-occupied/deemed-let-out property, unresolved vacancy/unrealised rent, arrears/recovered rent, pre-construction interest and brought-forward property losses. The separate freelance-practice condition still applies; this passive property income does not select or change its presumptive path.

Collect three non-negative safe-integer annual rupee amounts: established annual value before municipal-tax deduction, qualifying local-authority property taxes actually paid by the owner this Tax Year, and eligible current-year borrowed-capital interest. Interest must relate to the completed let property, be supported by records, payable in India and not deducted elsewhere. Exclude principal, total EMI, personal-loan interest unrelated to the property and pre-construction instalments. Annual value is not assumed to equal bank receipts. Municipal taxes cannot exceed the declared annual value in this slice.

Subtract municipal taxes, deduct 30% of the resulting net annual value, then subtract eligible interest. Preserve fractional intermediate amounts and round combined income once using the existing rule. A negative property result is Unsupported, never silently capped at zero or deducted from salary/practice income. Add a non-negative property result once to ordinary income before employer NPS; include it in the existing rebate, marginal relief, income ceiling, annual-return and advance-tax calculations. Count actual Indian rental TDS once in the combined credit input. Keep the presumptive payment schedule and current unavailable return-form guidance. Show annual value, municipal taxes, net annual value, standard deduction, interest and taxable property income separately in the calculation.

Require a separate rental GST confirmation for established coverage: the dwelling and rental supply are in the same state/UT as the existing practice/registration, used only as a residence, and every tenant is unregistered for GST throughout the letting. This is a deliberately narrow product boundary, not a claim that all other rentals are taxable. No/Not sure preserves the income-tax estimate but withholds GST registration/return conclusions and dates pending review. Independent LUT and income-tax actions remain. Require an explicit answer; blank is incomplete. Keep rental GST authority in the independent GST rule groups. Include exempt rental supply value in independently declared all-India GST aggregate turnover; never copy taxable property income or annual value into GST turnover. No GST liability or ITC calculation.

Workspace 8 migrates to 9 in memory: add absent rental income only where legacy facts excluded property income and unresolved deductions/other situations. Retain all stop facts; uncertain legacy facts get a Not sure rental branch. Preserve revision, consent, other amounts and Completion records. Recovery 7 migrates to 8 with rental choices and amounts blank; do not infer an answer. Reject mixed schemas, unknown fields and hidden amounts. Deselection clears rental confirmations and amounts. Writes use the new schema through existing validation and storage keys. See [.scratch/domestic-rental-income/map.md](.scratch/domestic-rental-income/map.md).

### GST branch

An unregistered user supplies state or Union territory, complete GST aggregate turnover, compulsory-registration facts, and the threshold-liability date when known.

GST aggregate turnover is the all-India value for the same PAN defined in `CONTEXT.md`; it is not copied from professional receipts or bank interest. A threshold-liability date must fall within the Tax Year and cannot be later than the current India date. A definite or uncertain compulsory-registration fact makes the turnover-only GST conclusion unavailable unless it also changes the core income path or receipts.

A user with one active normal-taxpayer GSTIN can receive the income-tax result and the supported GST calendar without storing the GSTIN value. Calendar facts include effective registration date, continuous normal-registration status, the portal-confirmed cadence for each applicable financial quarter, and the export/LUT branch. Unknown calendar facts do not stop the income-tax estimate.

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

Show the other-tax-situation exclusions as four stacked cards: Other income, Salary and investments, Overseas income and assets, and Business and tax requirements. Keep all cards visible. Only the checkboxes change selections; their text remains an accessible name without toggling on click. Place extra explanations in the shared info tooltip beside each label. Use one unselected-by-default pair of None of these apply and I'm not sure after all four cards. Either alternative clears the selected situations; selecting a situation clears the alternative. Preserve restored answers and show the legacy combined dividend/gift choice only while selected. Retain normal validation, immediate scope warnings and forward-navigation blocking.

Keep salary, registration-history and LUT conditions visible as short checklists. Use the shared Learn more modal for definitions, record checks, salary examples, GST filing frequency, export routes and QRMP payment reviews. The filing-frequency introduction stays directly below its section heading, with a 16px gap; quarter fields follow it. Short export options must preserve the distinction between LUT without IGST and IGST payment on narrow screens.

Questionnaire drafts use display strings and may be incomplete. They are not Profile values. A separate Evaluation screening function may inspect normalized incomplete input to return support reasons and input errors only. It never returns an estimate. Calculation still requires fresh completion and `parseProfile`.

Amount inputs, including Plan payment updates, apply Indian digit grouping while the user types and preserve the cursor position. Blank entries remain available for correction. Reject edits containing letters, signs, fractions, exponent notation, or unsafe amounts without changing the previous amount. Validate entered values and related fields before Continue, and show required-field errors after leaving an empty field. Disable forward navigation while a required answer is missing, an input is invalid, or a declared fact stops the core estimate. Show supported-scope reasons beside the relevant control as soon as its required answers are known. Independent Coverage limitations explain the partial plan and do not block the income-tax estimate.

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

Add supported taxable salary after its single capped standard deduction, taxable bank or deposit interest, supported dividends, distributions and additional interest, and non-negative supported rental income to presumptive income. Subtract the supported employer NPS deduction, limited to this ordinary income. Add supported equity gains separately as described below. Round combined total income to the nearest ₹10 before applying slab tax. Apply the Tax Year 2026-27 new-regime bands:

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

The Application stops when rounded total income after the employer NPS deduction exceeds ₹50 lakh. It calculates no surcharge, deduction other than the supported salary, employer NPS and rental deductions, losses outside the domestic equity branch, special-rate tax other than the domestic equity branch, foreign-tax relief, interest, fee, or penalty.

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

An established trigger is sufficient to show required annual-return Coverage and the dated Obligation. Omit uncertain reasons. Unknown age cannot establish the lower TDS/TCS threshold; credits at or above the higher threshold establish the trigger for either age band. If no trigger is established and a material answer is uncertain, keep the tax estimate and make annual-return Coverage unavailable. Never infer a negative filing conclusion from unknown answers. Independent foreign-account or return-form guidance remains separate.

The normal due date is 31 August 2027 for the supported non-audit Profile. The Obligation does not name ITR-3 or ITR-4. Return-form guidance remains unavailable until current forms and disclosure facts are reviewed.

### Apply for GST registration

This applies only when an unregistered Profile exceeds the applicable service threshold, the threshold-liability date is known, and no separate compulsory-registration uncertainty exists. The normal due date is thirty days after liability arose.

The starting threshold is ₹10 lakh in Manipur, Mizoram, Nagaland, and Tripura and ₹20 lakh elsewhere. Exactly at the threshold is an Available conclusion with no Obligation. With complete turnover and supported compulsory-registration facts, above-threshold turnover remains an Available registration-required conclusion even if the liability date is unknown. Also show an urgent date Review action in screening and results. Withhold the dated Obligation until the date is established; never invent it. Invalid or future dates and independent compulsory-registration uncertainty retain their safeguards.

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

The next-action card and each agenda item link to a fixed official portal entry point and, when approved, an official procedural tutorial for that action kind. Use public registration or payment pages where available, otherwise the official login with a short menu destination. Links open in a new tab without a referrer and never carry Profile, period, amount, or Completion values. Opening a link does not record completion. Annual-return help covers portal navigation without choosing a return form; QRMP help retains conditional payment-review language. Keep tutorials in the Source registry and Resources catalogue, separate from statutory authority.

## Saved workspace

Longer-lived saving is optional and starts off. Offer it only after a complete Profile parses and Evaluation returns Supported, including Supported with Incomplete coverage. Do not put Recovery drafts, examples, malformed data, Unsupported Profiles, or Profiles evaluated with stale core Rules in the Saved workspace.

Before the first Saved-workspace write, show this standalone notice in a dialog, subject to qualified privacy review:

> Save your answers and the completion dates you add. Anyone using this browser profile may be able to see them. There is no account, sync, backup, or recovery. Private browsing or clearing site data may remove them.

Actions are `Save data` and `Cancel`. Store accepted notice version 2. The landing-page FAQ explains saved-data behavior. The questionnaire confirms the user is eighteen or older before a supported result can be saved. Canceling the notice leaves the save action available in the same unsaved session.

Keep the entire notice visible before consent. Escape cancels and returns focus to the save action. Saving errors and conflict recovery stay inside the dialog; no failure may be hidden behind it.

The one stable key is `my-next-filing:workspace`. Its version-6 envelope contains only:

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

The version-2-to-3 migration runs in memory, validates the complete result, and preserves revision, consent, all Profile values and Completion records. It adds the explicit no-salary branch to old Profiles that excluded salary; an old salary exclusion becomes uncertain and remains Unsupported. The subsequent migration reaches the current version before a normal save. Mixed schemas or unknown fields are invalid.

Version 4 continues that migration chain and adds a nullable, unanswered calendar to version-3 registered Profiles. Unregistered Profiles and all prior values and Completion records remain unchanged. Recovery version 3 adds unanswered GST calendar fields after the version-1-to-2 salary migration. Validate the entire resulting envelope, reject mixed schemas, and persist the latest version only through normal writes and revision checks. No migration infers a filing frequency or export route.

The earlier version-1 deletion policy remains. When the Application encounters a parsed JSON object whose top-level schema version is 1, it rereads the exact key, confirms that version, removes only that key, verifies absence, and shows: `Your previously saved answers and completion dates were removed because this version uses a new workspace.` It repeats verified removal if version 1 reappears, but shows the notice at most once per loaded document. It creates no backup and offers no recovery.

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

Saved-action labels retain the form and original month or quarter when the current plan no longer matches. QRMP actions consistently use review-date controls, including Change review date and Remove review. Unavailable-rule messages must not claim that withheld GST dates remain in the agenda. Offer the fixed official GST portal link for stale GST/LUT Rules; editing Profile answers cannot refresh Rules.

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

Keep one `Try a fictional example` path using the synthetic domestic professional Profile below. Label it fictional throughout. Example state cannot be saved, completed, rolled over, archived, or stored as Recovery. Before example entry, retain the latest personal or Saved-edit session in an in-memory return snapshot. Leaving the example restores those exact answers, including changes that could not be stored, and clears the snapshot. Use `?example=1` to identify fictional mode on questionnaire and Plan URLs, with no Profile or money values in the URL. Refresh in that mode restores the original fictional example and retains any stored Recovery draft for return. Example edits remain in memory only. Browser history follows the URL mode. Starting over inside the example resets only the example. When no personal work exists, `Start your estimate` starts a blank personal estimate. Do not track edits to individual example fields.

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
- `/plan` for a transient result or restored workspace;
- `/resources` for independent public browsing of the reviewed source collection; and
- the existing not-found route.

Only the questionnaire-group identity enters its path. Selected Tax Year, Profile values, amounts, Evaluation state, Completion state, Recovery state, and save state remain in memory or their exact browser-storage values. They do not enter routes, queries, fragments, titles, logs, clipboard content, Analytics, or external links.

The first incomplete group limits forward access, while Review requires all six answer groups to validate. Bare `/check` redirects to the first incomplete group, Review, or a complete session's Plan. Unknown `/check/*` paths remain not-found. Continue and sidebar moves push browser history; index and access corrections plus the interface Back control replace the current entry.

Preserve the current visual language: Fraunces headings, Inter body text, warm neutral ground, dark ink, green accent, compact rounded cards, one primary action, and chronological information. Follow `DESIGN.md`; use its semantic Tailwind tokens and the source-owned shadcn components backed by Base UI where applicable. Generated defaults must be curated to this visual language before use.

Use restrained CSS transitions for press, hover, disclosure, and short content entry. Respect reduced motion. A successful plan transition may show brief confetti feedback, but do not animate money, urgency, or Deadline status.

Navigation feedback is owned by the shared app shell. Pointer-driven links, buttons, and history changes use the same short entry, including opening a different plan at the same path. Initial load, keyboard navigation, hash-only changes, and reduced motion remain immediate. Answer edits, recalculation, and notices do not restart page entry; navigation must not remount content merely to animate it.

Load landing, questionnaire, and Plan screen modules on demand so independent resource browsing does not download every screen. Keep AppFrame and its in-memory state mounted across navigation. A failed screen-module load shows a recoverable message inside that frame and a link to Resources, without discarding answers or exposing an error stack. Initial screen loading has a text status.

Shared questionnaire and result-card containers smoothly resize for pointer-triggered content changes. Newly shown fields, notices, and editors inherit entry feedback. Keyboard interactions and reduced motion remain immediate. Let React remove obsolete or deleted content immediately, and animate only the remaining container's size. Input values and money results are never interpolated.

## Resources

The public Resources page lets visitors find official references and help destinations without entering a Profile. Link it from a landing-page FAQ about browsing without completing the questionnaire. The Plan page has no general resource-browsing link; its action-specific guides and official sources remain available. Resources is outside the numbered questionnaire and does not infer applicability, personal deadlines, or eligibility from search or filters.

Browse all publishable resources or search reviewed titles, descriptions, aliases, identifiers, and known periods. Offer one Topic and one Task filter, combined with AND, with unique-resource counts, removable selections, and explicit empty-state recovery. Exact form, section, notification, and year identifiers take priority and are never corrected into a different identifier. Ordinary-word typo suggestions require explicit selection. An Assessment Year is not a Tax Year alias. Show recorded coverage rather than a year filter while the collection has one statutory period.

The local catalogue references existing Source identities and fixed URLs. Keep display metadata outside the statutory Source schema. Explicitly consolidate identical documents without deleting their provenance, retain useful section references, and show the oldest recorded source-review date for grouped material. Publish `starting-link-only` sources as labelled official portals, not approved tutorials. Withhold provisional, deferred, rejected, or invalid entries from results and suggestions. Every registry identity needs a catalogue assignment or documented exclusion.

Preserve safe bibliographic links when Rule review expires, with a visible review warning for the affected area. Root Rule failure removes any claim of available statutory coverage across the dataset; independent group failure affects only its linked areas. A review deadline does not mean the underlying document has legally expired. Invalid links, source display metadata, or inconsistent grouping withhold only the affected resource. Source descriptions and identifiers require a recorded official-source review before publication.

Keep query and filters in memory across internal navigation and reset them on reload. Do not put them in URLs, titles, logs, Analytics, clipboard content, router history payloads, browser storage, or external requests. Search never fetches remote content. A fresh Resources visit does not access, restore, migrate, or clean up Profile, Recovery, or Saved-workspace data. Entering another application route runs normal initialization. Internal resource visits preserve personal answers, edited fictional examples, personal return sessions, and workspace selection, including failed-write states. Normal pending data operations and initialized cross-tab behavior remain available.

Reuse the existing visual system, source-owned controls, and external-link behavior. Search and result changes keep keyboard focus in the edited control, announce the result count, and do not animate the list. Verify catalogue integrity, positive and negative relevance cases, independent review expiry, fresh passive entry, personal/example/workspace round trips, responsive layout, keyboard interaction, query privacy, and representative resource-finding tasks. The [implementation plan](.scratch/resources/implementation-plan.md) defines the initial catalogue and acceptance cases.

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

Site-wide static-asset headers must include a same-origin Content Security Policy for scripts, stylesheets, fonts, images, media, and connections, plus `frame-ancestors 'none'`, `base-uri 'none'`, `object-src 'none'`, no-referrer policy, MIME sniffing protection, framing protection, and a restrictive Permissions Policy. Allow inline CSS for bundled component styles and blob media for the HLS player's in-browser video buffer. Inline scripts and off-origin runtime requests remain blocked. Preserve the HLS content type.

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
- independently expiring GST calendar and LUT Rules.

Each group has identity, effective interval, verification and expiry dates, values, conditions, and direct statutory Source identities. The validator rejects unsafe values, unknown versions, duplicate identities, invalid or overlapping dates, missing required values, inconsistent thresholds or rates, unreferenced Rules, missing or non-HTTPS Sources, invalid review chronology, expired groups, and operative dates without direct extension provenance.

The Source registry distinguishes statutory and Tutorial Sources. Every personalized conclusion points through Rules to direct statutory authority. An extension requires its own notification Source. A Tutorial Source has review status and never establishes a Rule.

The release compliance review must cover every item listed in [Define verification and release gates](.scratch/my-next-filing-solo-freelancer/issues/14-define-verification-and-release-gates.md), including the 1 October 2026 FEMA transition and the then-current status of the intermediary place-of-supply amendment.

## Registered-freelancer GST calendar

Support one active normal-taxpayer GSTIN in one Indian state or Union territory, with domestic, export or mixed clients. The registration must have remained continuously active as a normal taxpayer for the supported period, with no composition, suspension, cancellation or other registration history. Confirm that the effective date agrees with the first GST filing period in the portal; retrospective or unresolved first-period facts require review. It adds only:

- Furnish LUT before the first planned export when eligible and exporting without payment of IGST;
- monthly GSTR-1 on the 11th day of the next month;
- monthly GSTR-3B on the 20th day of the next month;
- quarterly GSTR-1 on the 13th day after the quarter;
- quarterly GSTR-3B on the applicable 22nd or 24th day after the quarter; and
- conditional QRMP monthly payment review on the 25th day of the next month for the first two months of a quarter.

Collect cadence separately for April–June, July–September, October–December and January–March. Do not infer it from receipts, registration status or another quarter. Only quarters overlapping registration need answers; unknown future cadence is allowed and withholds that quarter alone. Include the month or quarter containing the confirmed effective registration date, even when registration begins partway through it. A new registration beginning after a quarter's first month with QRMP declared for that same quarter needs review. Keep other established quarters in the agenda. Periods with no business still have return actions.

LUT Coverage is separate from GST-return Coverage. Collect a declared export route: no service exports, LUT, IGST, bond, or uncertain. LUT eligibility requires confirmed qualifying service exports outside India, no prosecution involving tax evasion exceeding ₹2.5 crore, and no withdrawal or restriction of the LUT facility. SEZ supplies, bond management, mixed LUT/IGST routes and unknown eligibility require independent LUT review. No-export and confirmed IGST routes have no LUT action. Neither conclusion establishes export/refund eligibility.

An unknown first-export date or LUT eligibility produces a Review action. A known first-export date must be within the Tax Year and no earlier than the effective registration date. Show that date with an explicit requirement to furnish LUT before export, never a universal 31 March deadline. If exports already occurred without an LUT, direct the user to review regularisation; do not infer automatic acceptance or tax liability. LUT completion is user-declared and does not establish timely coverage. IFF remains optional and never becomes an Obligation. More than one GSTIN, composition, suspension, cancellation, or a non-normal taxpayer type remains outside the calendar.

Generate stable period-specific identities for GSTR-1, GSTR-3B and QRMP payment review. Monthly and quarterly return identities differ. Completion may not precede the end of the applicable return/review period; this is a product recording constraint, not a claim that early deposits are prohibited. LUT completion may not precede the effective registration date. A changed cadence preserves unmatched dates as Needs review. QRMP completion controls and status say reviewed, not paid, because liability and ledger sufficiency are unknown. Keep the calendar in the existing next-action and agenda views.

Calendar and LUT Rules were re-reviewed on 7 September 2026 and expire independently on 31 October 2026. This is a bounded product review window for the normal schedules, not a statutory expiry or a promise that extensions cannot occur. Show normal statutory dates and explain that official extensions may change them. Do not fabricate operative dates. The [authority refresh](.scratch/gst-filing-calendar/research/authority-refresh-2026-09-07.md) records the current CBIC listing and the remaining gap in exhaustive state-extension coverage; recheck extensions before public release and the next review deadline. Stale calendar Rules withhold GST return dates only; stale LUT Rules withhold LUT guidance only. The calendar migrations introduced workspace version 4 and Recovery version 3, retaining existing data and leaving new calendar facts unanswered. Continue those migrations to the current workspace and Recovery versions before normal writes.

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
- exact questionnaire reducer, branch selector, Recovery draft, nested-route, Plan-model, workspace version-2-to-3 and Recovery version-1-to-2 migrations, version-1 workspace deletion, unverified and partial-deletion fixtures, including independent warnings, unrelated-draft preservation, and example return after failed writes;
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
- Foreign-tax credit, foreign salary, foreign investments or property, gains outside the supported domestic equity branch, foreign-asset guidance, and unrelated foreign-source income.
- GST liability, input-tax credit, refunds, preparation, validation, upload, or submission.
- Historical backfill or recalculation under superseded Rules.
- Companies, LLPs, partnerships, HUFs, trusts, non-residents, employers, payroll, or deductor duties.
- Regular-books cases, old tax regime, audit cases, surcharge cases, and taxable total income above ₹50 lakh.
- Late-interest, late-fee, or penalty calculation.
- Native mobile application, installable PWA, dark theme, translations, mascot, or formal WCAG certification.
