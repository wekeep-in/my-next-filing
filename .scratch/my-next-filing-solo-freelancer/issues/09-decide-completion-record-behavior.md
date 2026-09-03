# Decide Completion record behavior

Type: grilling
Status: resolved
Blocked by: 06, 08

## Question

What states and transitions may a Completion record have, which Obligations can receive one, what date and note data may be retained, how can a user correct or undo it, and how does it behave when a due date, applicability result, Profile, or Rule dataset changes? The interface must distinguish a user declaration from government acceptance and must still answer what remains.

## Answer

Keep Completion records binary and minimal. The absence of a matching record means the Obligation is not marked complete. A matching record means the user marked it complete. Do not add in-progress, dismissed, waived, accepted, rejected, verified, or paid states.

### Stored record

Store exactly:

- the Obligation's stable composite identity, including its kind and Tax Year or GST period; and
- `completedOn`, a valid India calendar date chosen by the user and no later than the current India date.

Store no note, amount, acknowledgement number, portal status, document, URL, evidence, form name, payment reference, or government identifier. The Saved-workspace envelope revision and update time are sufficient for concurrency and retention; each Completion record needs no separate audit timestamp.

Only an Obligation returned by current Evaluation can create a record. Review actions, guidance, optional actions, unavailable Coverage, and excluded duties cannot.

### Create, correct, and undo

Creating a record requires an explicit action on one Obligation. Default the date field to today's India date, show it before confirmation, and allow the user to choose an earlier valid date. Do not permit a future date.

Use action-specific confirmation copy. For filings, say “Marked complete by you.” For the conditional QRMP item, say “Marked reviewed by you.” Always add:

> My Next Filing has not verified government acceptance.

Changing the completion date replaces the one record for the same composite identity. Undo deletes that record and immediately returns the Obligation to what remains. Both actions must be available without starting the questionnaire again.

### Advance-tax reconciliation

A Completion record never changes `advanceTaxAlreadyPaid` or the Tax estimate. If the user attempts to mark advance tax complete while the estimate still shows an amount remaining, require them to update total advance tax already paid first. Re-run Profile parsing and Evaluation. Create the Completion record only when the resulting estimated remaining amount is zero.

If a later Profile or Rule change makes the estimated remaining amount positive again, preserve the record as Needs review and return advance tax to what remains. Do not silently edit the payment input, delete the record, or claim the payment failed.

### Matching and changed Rules

Match records only by stable composite Obligation identity, never by title, array position, due date, or display copy.

- A changed normal or operative due date, extension Source, tutorial, title, or consequence does not break a record when the Obligation identity and applicability remain the same. Show current dates and Sources beside the historical user-declared completion date.
- If a Profile change makes the Obligation no longer applicable, preserve the record as Needs review and remove it from the current completed agenda. Offer delete; do not silently discard history.
- If cadence, Tax Year, GST period, or Obligation kind changes, the old record does not transfer. Preserve it as Needs review.
- If core Rules are stale, preserve all records but do not calculate what remains. If an area rule group is stale, records for that area become Needs review until current Rules can reproduce the Obligation.
- If current Rules later reproduce the same composite identity and the Profile makes it applicable again, the record may match again automatically unless an amount reconciliation still fails.

Needs review is derived at restore or after a change; it is not stored as a second mutable status.

### What remains

The workspace selector receives the current applicable Obligations and saved Completion records. A current Obligation counts as complete only when a matching record exists and every required reconciliation passes. All other applicable Obligations remain open.

Sort open Obligations by operative or normal due date and current catalog order. The first is the next incomplete Obligation. When none remain, state that no supported Obligation remains for the current evaluated scope. Continue to show urgent Review actions and Incomplete coverage separately; do not convert them into completed or open Obligations.

Completed, open, and Needs-review lists derive from current Evaluation plus saved records. Do not persist those lists or current Deadline status.

### Deadline behavior

Completion and Deadline status stay orthogonal. A user may mark an Obligation complete before, on, or after its due date. The page may show both “Marked complete by you on [date]” and “Deadline passed.” Neither fact proves timely filing, correct payment, or government acceptance.

Never infer completion from an amount of zero, a passed date, an external-link click, a page visit, or a prior Evaluation. Never infer non-compliance from a missing Completion record.

### Storage and privacy behavior

Completion changes use the Saved workspace's validated whole-envelope write and revision check. If the write fails, leave the existing record unchanged and do not display success. Other open tabs reload or block stale writes through the Saved-workspace concurrency rule.

Deleting the Saved workspace deletes all Completion records with it. Ticket 10 also permits deliberate deletion of one Open prior or Archived Tax Year. No Completion field enters Analytics, URLs, titles, logs, error reports, links, or sharing.

### Invariants

- A Completion record is always a user declaration and never a statutory or government fact.
- Completion never changes Profile, Rules, tax arithmetic, applicability, amount, or Source provenance.
- Exactly one record may match one composite Obligation identity.
- No record is silently copied to another Tax Year, filing period, cadence, or Obligation kind.
- Mismatched records are preserved as Needs review until the user deletes them or current Evaluation safely matches them again.
- Undo is deletion, not another status or tombstone.
