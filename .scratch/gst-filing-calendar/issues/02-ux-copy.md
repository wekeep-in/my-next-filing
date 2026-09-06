# Salary and GST copy review fixes

Status: Implemented and verified. User requested fixes followed by a commit.

## Scope and interaction

Reviewed salary commit eac3cb6 together with the uncommitted GST calendar. Here, a freelancer can identify the supported income and GST facts, understand unfamiliar terms before confirming them, and record completed filings or payment reviews in the browser; answers and recorded dates can be edited or removed.

The write-ux-copy skill guided the distinction between visible conditions and optional explanations. The conditions being confirmed remain visible. Modal content explains terms and how to check records without silently widening eligibility.

## Changes

- Salary, registration-history and LUT confirmations use readable checklists. Salary coverage help explains arrears, advance salary, stock compensation and deduction exclusions; it is also reachable from the salary exclusion and support FAQ.
- Salary amount help defines the standard deduction and gives a two-employer example. It still asks for salary before TDS and the deduction.
- Added shared registration, filing-frequency, export-route, LUT-eligibility and QRMP-payment help modals. Each uses the existing accessible HelpModal with official sources.
- The short filing-frequency introduction remains below the heading with the requested 16px gap. Longer eligibility details moved into Learn more.
- Export choices use distinguishing words first: LUT: without IGST and With IGST payment. First-export guidance retains the registration and already-exported conditions.
- Stale GST/LUT rules no longer promise unavailable return dates. The plan offers Open GST portal instead of asking the user to edit answers to refresh rules. Other partial messages describe known dates only when those dates exist.
- Saved actions retain their original form and period, such as GSTR-1 for April 2026. QRMP controls consistently say review, including Change review date and Remove review. Premature records cannot appear completed in the next-action card.
- The FAQ separates whole-estimate exclusions from independent GST limitations.

## Verification

Regression checks cover expired-rule wording, portal actions, month/quarter/year labels and the existing completion rules. All existing calendar, salary, evaluation, storage and frontend checks remain in the test command.

Browser verification covered each new modal and the revised salary modal, keyboard opening and focus return, official-source links, QRMP review controls, and GST layouts at desktop, 1024px and 320px. The LUT option fits without clipping at 320px and the heading-to-description gap remains 16px. Checklists use semantic lists; no new motion was introduced.

The statutory explanations preserve the previously reviewed boundaries. Reopened official Circular 143/13/2020, Notification 37/2017 and salary section 19 while checking the copy. GST and LUT thresholds displayed in the new explanations come from local Rules. No rates, eligibility calculation or deadline changed in this copy pass. The generic GST portal URL is a fixed starting link; automated access returned HTTP 403, so it is not treated as statutory evidence for a date.

The existing public-release requirement to complete the current extension inventory remains. A commit and the repository verification command do not establish public-release approval.
