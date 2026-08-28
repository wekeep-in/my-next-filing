# My Next Filing

My Next Filing gives a narrow, best-effort view of tax obligations for a declared taxpayer profile and tax period. This glossary fixes the product language used in the specification, rules, evaluation, and interface.

## Language

**Application**:
The My Next Filing static website.
_Avoid_: Service, portal

**Profile**:
The facts and money amounts declared by the user for one Evaluation.
_Avoid_: Account, identity

**Rule dataset**:
The versioned collection of rates, dates, conditions, and Source identities that applies to a Tax Year.
_Avoid_: Tax database

**Evaluation**:
The operation that applies a Rule dataset and current date to a Profile.
_Avoid_: Tax calculation

**Supported result**:
An Evaluation result that contains an estimate and the obligations supported by the declared Profile.

**Unsupported result**:
An Evaluation result that names one or more Profile facts outside the release scope and stops personalized calculation.

**Stale-rules result**:
An Evaluation result that stops personalized calculation because the Rule dataset has expired.

**GST aggregate turnover**:
The all-India value of taxable, exempt, export, and inter-State supplies for the same PAN, excluding GST, cess, and inward supplies taxed under reverse charge.
_Avoid_: PAN-wide GST turnover, GST receipts

**Obligation**:
A dated action that can apply to a Supported result.
_Avoid_: Reminder, completion record

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

**Review date**:
The date on which a human checked a Source or Rule dataset.
