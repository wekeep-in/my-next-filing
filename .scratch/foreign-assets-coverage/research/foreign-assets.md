# Foreign assets, signing authority and independent coverage

Reviewed 8 September 2026 for Tax Year 2026-27. The slice supports established ownership or signing authority whose income effects are already resolved within the existing narrow profile. It adds filing and disclosure information; it does not calculate foreign income or classify payment providers.

## Controlling authority

The [Income-tax Act, 2025 as amended by Finance Act, 2026](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf) was opened and read through the browser's full PDF text. The Act received assent on 21 August 2025 and commenced on 1 April 2026. The [notified Income-tax Rules, 2026](https://www.incometaxindia.gov.in/documents/d/guest/notification-22-2026-1), issued 20 March 2026 and effective 1 April 2026, were also read directly. Draft rules and previous Assessment Year forms are not the implementation authority.

| Provision | Implemented effect |
| --- | --- |
| Act section 5 | A resident's income scope includes income received/accruing in India and income accruing outside India. Ownership is not a substitute for checking income. A foreign-asset answer never converts foreign income into a supported domestic field or assumes it is zero. |
| Act 263(1)(a)(ix)(A) | A resident other than not ordinarily resident who, at any time during the Tax Year, holds an asset or financial interest outside India, beneficially or otherwise, or has signing authority over an overseas account, has a return-filing trigger. No balance or income threshold appears in this trigger. |
| Act 263(1)(b) | This filing duty applies regardless of income or loss. The existing annual-return action is included even at nil income and nil tax. |
| Act 263(1)(a)(ix)(B), 263(9) | Beneficiary and beneficial-owner concepts differ. A beneficiary-only case has a separate exception concerning income included in the owner's income. The slice does not decide that exception or trust arrangements. The confirmation excludes them, overseas business control, related-party cross-border transactions and transfer-pricing report requirements. These are product boundaries; the section 263 deadline used here requires the absence of section 172 reporting. |
| Act 263(1)(c), amended table row 3 | Retain the existing 31 August deadline in the succeeding financial year for the supported non-audit business/profession case without section 172 reporting. No audit/transfer-pricing boundary is relaxed. |
| Act 263(2) | Prescribed return particulars can include assets and accounts. The plan directs the user to current form instructions rather than collecting identifiers or computing disclosures. |
| Rule 164(5)–(7) | Foreign assets and overseas signing authority exclude the simplified ITR-4 route. The visible guidance names that exclusion but does not positively select a form or fill its schedules. |

The annual filing trigger uses any time in the Tax Year. It is not a statement that the current Schedule FA reporting period equals that Tax Year. The current Department portal's available ITR utilities are for Assessment Year 2026-27; those relate to an earlier earning period. No previous calendar-year Schedule FA period, field layout, validation utility or revised-return date is adopted here.

The Department's [NUDGE page](https://www.incometax.gov.in/iec/foportal/nudge/nudge-schedule-fa), opened on 8 September, corroborates that foreign assets affect simplified-return eligibility and provides schedule guidance. Its dynamic footer does not provide a reliable publication date. It is only a help destination, not authority for this Tax Year's schedule period, penalty or filing deadline.

## Account and platform boundary

An overseas account, asset or signing authority can exist without additional taxable income. Examples within the bounded confirmation include a non-interest-bearing overseas account or a passive holding with no current-year dividend, gain, loss or benefit. Already included Indian freelance fees may have passed through an account, provided every existing receipt, currency, work-location and authorised-settlement condition is satisfied. Asset balances and sale proceeds are not added to tax income.

A provider brand, virtual routing number or marketing term does not establish who owns an account or where a contractual claim is located. The interface asks users to review legal ownership, location, authority and rights to held money. An established held-asset answer covers the earlier possible-account flag for disclosure guidance. Otherwise a possible client-account answer remains unresolved, even if the later asset answer says No. This prevents conflicting declarations from silently yielding a clean result.

This slice does not relax the existing own-Indian-bank settlement requirement, platform gross-receipts requirement, reverse-charge boundary or currency confirmation. The repository's older payment-account research cites the 2023 RBI PA-CB circular. Search identified a successor 2025 Payment Aggregator direction, but access to the current RBI material was restricted by its browser challenge during this run. No new settlement, pooled-account permission, retention period, provider classification or repatriation claim is based on the older research or a secondary reproduction. The tax filing trigger and return-form exclusion above are independently established by the primary Income-tax Act and Rules.

Retained balances, permissions to open/hold accounts, FEMA residence, beneficial ownership, income-tax residence and foreign-source income remain distinct questions. No invoice-level export deadlines, past non-disclosure scheme, penalties, foreign tax, treaties, exchange conversion or asset valuation is calculated.

## Evaluation and area independence

- `held` plus confirmed income scope preserves the tax arithmetic, establishes the annual-return trigger when that rule group is valid, and shows the visible foreign-assets guidance when its separate rule group is valid.
- `possible` plus confirmed income scope preserves the estimate. It withholds foreign guidance and prevents a negative annual-return conclusion only if no other filing trigger is established.
- Unconfirmed income effects, unsupported foreign income/tax/operations, unresolved currency/receipts, or retained legacy exclusions stop calculation. Classification uncertainty is never used as a favorable income assumption.
- Missing/stale annual-return rules withhold its conclusion and date, without suppressing independent asset guidance or tax. Missing/stale foreign guidance withholds that card without deleting an established annual-return action. No foreign facts means no foreign-guidance requirement, including when the independent group is stale.
- The Plan also renders the existing reviewed FEMA note for foreign clients; it was previously computed but not shown in an available-area card. No new FEMA rule or transition date is introduced.

## Storage and verification contract

Writer outputs were captured from commit `e48d6ea` before the schema changed. Workspace 9 migrates to 10 without a write. Previously supported possible-account profiles retain classification uncertainty and the already established income boundary. Any retained unsupported fact prevents an inferred income confirmation. No legacy fact is removed. Recovery 8 migrates to 9 with both new answers blank. Existing consent, amounts, revisions and completion identities remain.

The numerical invariant is exact: changing only the supported foreign-asset branch must not change the tax breakdown. The baseline ₹55,160 result remains ₹55,160. A nil-income profile with a confirmed held asset must instead gain the annual-return action, dated 31 August 2027, without acquiring a tax amount. Tests exercise these contracts, both uncertainty layers, stale independent areas, conflicting client answers, failed core client conditions, migrations and privacy.

No new personal data fields beyond presence and income-scope choices are collected. There are no countries, institutions, account numbers, identifiers, balances, asset values, transactions or documents. UX terms and controls distinguish an established asset from unresolved classification and from unresolved income effects.

## Final review

No findings against the implemented bounded behavior. The final release command passed with 264 Vitest tests and 134 Playwright cases; the existing WebKit video skip is unchanged. The reviewed source-access limitation concerns unexpanded RBI settlement/classification work, not the enacted income-tax provisions used by this slice.
