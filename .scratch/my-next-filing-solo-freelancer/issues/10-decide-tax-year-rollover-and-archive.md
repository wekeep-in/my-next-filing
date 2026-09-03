# Decide Tax Year rollover and archive behavior

Type: grilling
Status: resolved
Blocked by: 07, 08, 09

## Question

How does the Application open a new supported Tax Year, reuse or re-confirm durable Profile facts, retire year-specific amounts, archive prior Completion records, respond to stale or missing Rules, and present earlier years without recalculating them under newer law? Define the boundary between an active Saved workspace and a read-only archived year.

## Answer

Use three year states: one Active Tax Year, any Open prior Tax Year that still needs attention, and read-only Archived Tax Years. A rollover creates a new active earning period; it does not pretend every duty from the ended year has finished.

### Starting a new Tax Year

Do not create a new Active Tax Year until a complete core Rule dataset for that period validates and is current. If Rules are missing or stale, keep the existing Saved workspace available, show that the new period cannot start, and link official Sources. Do not clone the old Rules or calculate with the previous Tax Year's values.

When current Rules become available, offer “Start Tax Year [period].” Build a draft from reusable prior declarations, but require the user to review and confirm every group before it becomes the new Profile.

Reusable suggestions may include state or Union territory, activity label, income path, one-practice facts, and ordinary client arrangement. Never carry forward:

- receipt, profit, interest, credit, tax-paid, or GST aggregate-turnover amounts;
- Completion records;
- age-band, residence, tax-regime, presumptive-path eligibility, five-year exclusion, audit, GST registration, foreign-client, foreign-account, platform, or unsupported-fact confirmations; or
- any calculated result, Coverage state, Obligation, date status, Rule value, or Source review.

Clear year-specific amounts to empty inputs, not zero, so the user cannot accidentally confirm carried values. Treat reused non-money facts as draft suggestions until the final review succeeds. Do not write the new year to the Saved workspace before a valid Profile and Supported result exist.

### Previous-year state during rollover

The ended year becomes an Open prior Tax Year when any applicable Obligation remains uncompleted or any Completion record is Needs review. It stays evaluable and editable with its matching validated Rule dataset. The user may finish the annual return, correct its Profile, update advance tax paid, mark or undo Completion records, and resolve Needs-review records while a newer Active Tax Year exists.

The returning dashboard combines open Obligations from the Active Tax Year and every Open prior Tax Year, sorts them by current operative or normal date, and shows the earliest incomplete item. It never moves a Completion record between years.

An ended year with stale matching Rules preserves the Profile and Completion records but cannot recalculate Coverage, applicability, or what remains. Show the Stale-rules state for that year and keep deletion available. A valid current-year Profile remains independent.

### Archiving

Offer “Archive this Tax Year” only when:

- the earning period has ended;
- current matching Rules reproduce the Profile and its applicable Obligations;
- no supported Obligation remains open;
- no Completion record is Needs review; and
- the user confirms that the archive is a personal convenience record, not government verification.

Archiving freezes the saved Profile and Completion records for display. It stores no calculation snapshot, Deadline status, rendered copy, Rule copy, or generated obligation list. Display the Rule dataset identity and the date the user archived the year as provenance metadata, not as proof of filing.

An Archived Tax Year cannot be edited, re-evaluated under newer Rules, or used as a Profile for a new year. It may be viewed or deleted. Do not add reopen, duplicate, import, or historical-backfill behavior in this scope. The confirmation must warn that archiving removes edit and undo controls for that year.

### Archive display

An archive may show:

- the saved declared Profile in read-only form;
- each saved Completion record and its user-declared completion date;
- the Tax Year and matching Rule dataset identity;
- the archive date; and
- the standing statement that My Next Filing did not verify government acceptance.

Do not show a recalculated tax estimate or reconstruct unsaved Obligations. If matching historical Rules remain current enough for a separately reviewed display, that belongs to a later scope; archived data itself never supplies statutory truth.

### Retention and deletion

Archived years remain in the current browser until the user deletes that year, deletes the whole Saved workspace, or the browser clears or evicts storage. State this user-controlled retention explicitly. Do not silently delete the only copy or imply that an archive meets a taxpayer's statutory record-keeping duty.

Provide per-year deletion for Open prior and Archived Tax Years, plus whole-workspace deletion. Deleting the Active Tax Year removes its Profile and Completion records and returns that period to the start state; it does not delete other years. Every deletion uses the Saved-workspace revision and cross-tab rules and confirms success only after the write succeeds.

Qualified privacy review may impose a shorter period or different deletion behavior. The saved feature still follows the 13 May 2027 fail-closed boundary until that gate is cleared.

### Rules and version behavior

Every year record keeps its Tax Year identity and the Rule dataset identity used at its last successful Evaluation. Evaluation always selects Rules by exact Tax Year. A later schema migration may reshape stored user data but cannot reinterpret it with a different period's law.

If an old Rule dataset receives a reviewed extension or correction while its year remains Open, re-evaluate it and reconcile Completion records by stable composite identity. Archived years remain read-only; a statutory correction triggers a visible archive warning but does not silently rewrite the historical user record.

Do not support a Tax Year for which the required income, obligation, and Source groups cannot pass validation. Rule availability, not the calendar alone, enables rollover.

### Invariants

- Exactly one Tax Year is Active for earning-period Profile entry.
- A newer Active Tax Year does not hide unfinished prior-year Obligations.
- Reused facts are unconfirmed draft input until the user reviews them.
- Amounts, Completion records, Coverage, and Rules never carry forward.
- Open prior years use only their exact matching Rules.
- Archived years are read-only user records, not recalculated statutory results.
- No historical year can be created through backfill in this scope.
- Stale old Rules cannot disable an independently valid Active Tax Year.
