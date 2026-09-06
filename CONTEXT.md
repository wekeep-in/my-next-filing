# My Next Filing

My Next Filing gives a narrow, best-effort view of tax obligations for a declared taxpayer profile and tax period. This glossary fixes the product language used in the specification, rules, evaluation, and interface.

## Language

**Application**:
The My Next Filing static website.
_Avoid_: Service, portal

**Profile**:
The facts and money amounts declared by the user for one Evaluation.
_Avoid_: Account, identity

**Solo freelancer**:
An adult resident and ordinarily resident individual who operates one self-employed service practice set up and managed in India. The term does not select an income-tax method.
_Avoid_: Company, employee, tax classification

**Specified professional path**:
The presumptive income method used when a Solo freelancer confirms that the whole practice is a specified profession under the applicable Rules.
_Avoid_: Freelancer path, job-title path

**Eligible business path**:
The presumptive income method used when a Solo freelancer confirms that the whole practice is an eligible business and not a specified profession.
_Avoid_: Default freelancer path, fallback path

**Foreign professional receipts**:
Amounts earned from freelance services for clients outside India, whether paid directly or through a supported freelance platform. They exclude foreign salary, investment income, property income, capital gains, foreign assets, and unrelated foreign-source income.
_Avoid_: Foreign income

**Rule dataset**:
The versioned collection of rates, dates, conditions, and Source identities that applies to a Tax Year.
_Avoid_: Tax database

**Evaluation**:
The operation that applies a Rule dataset and current date to a Profile.
_Avoid_: Tax calculation

**Supported result**:
An Evaluation result that contains an estimate and the obligations supported by the declared Profile.

**Incomplete coverage**:
A condition where Evaluation can calculate one supported area but withholds a separate conclusion because the unresolved fact does not change that calculation.
_Avoid_: Approximate calculation, favorable assumption

**Coverage**:
The available or unavailable conclusion for one evaluated area within a Supported result. Unavailable Coverage does not invalidate an independent calculation.
_Avoid_: Partial result

**Unsupported result**:
An Evaluation result that names one or more Profile facts outside the release scope and stops personalized calculation.

**Stale-rules result**:
An Evaluation result that stops personalized calculation because the Rule dataset has expired.

**GST aggregate turnover**:
The all-India value of taxable, exempt, export, and inter-State supplies for the same PAN, excluding GST, cess, and inward supplies taxed under reverse charge.
_Avoid_: PAN-wide GST turnover, GST receipts

**Obligation**:
A dated action that can apply to a Supported result.
_Avoid_: Reminder

**Review action**:
An undated instruction to verify a condition that the declared facts cannot turn into an Obligation. It cannot have a Completion record.
_Avoid_: Obligation, deadline

**Saved workspace**:
The best-effort browser copy of a validated Profile and its Completion records. It is not an account, backup, government record, or calculated result.
_Avoid_: Account, cloud profile, filing record

**Recovery draft**:
A set of questionnaire answers retained so the user can resume a questionnaire or unsaved plan after a refresh. It is separate from a Profile and Saved workspace and never enters Evaluation without fresh parsing.
_Avoid_: Saved workspace, Profile, autosave

**Active Tax Year**:
The one current earning period whose Profile the user can edit in the Saved workspace.

**Open prior Tax Year**:
An ended earning period that still has a supported Obligation or Completion record needing attention.
_Avoid_: Archived year

**Archived Tax Year**:
A prior period the user deliberately closed after no supported Obligation or Completion record needed attention. Its saved Profile and Completion records are read-only.
_Avoid_: Recalculated history

**Completion record**:
A user's declaration that they completed an Obligation on a date. It does not show government acceptance or verification.
_Avoid_: Verified filing, filing confirmation

**Needs review**:
The derived state of a Completion record that no longer safely matches the current Profile, Rules, or applicable Obligation. The record remains saved but does not count as complete.
_Avoid_: Rejected filing, government error

**Normal due date**:
The date in the normal statutory schedule for an Obligation.

**Operative due date**:
A verified extended date that controls the current status of an Obligation without replacing its Normal due date.

**Deadline passed**:
The status used when the Operative due date, or otherwise the Normal due date, is before the current date. Completion remains unknown.
_Avoid_: Missed, overdue filing

**Statutory source**:
A government Act, rule, notification, circular, FAQ, or official manual that supports a rule or result.
_Avoid_: Tutorial

**Tutorial source**:
A reviewed external page that explains how to perform an action without establishing the underlying rule.
_Avoid_: Statutory authority

**Resource**:
A document or official help destination presented for independent reading, with a description of what it covers. Relevance to a topic or task does not establish that an Obligation applies to the reader.
_Avoid_: Personalized recommendation, eligibility result

**Review date**:
The date on which a human checked a Source or Rule dataset.
