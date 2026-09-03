# Decide the Profile, Evaluation, and Rules model

Type: grilling
Status: resolved
Blocked by: 05, 06

## Question

How should the existing Profile, Evaluation result kinds, GST status, Obligation model, Rule dataset, and Source registry change to represent the supported solo-freelancer paths without spreading statutory logic into routes or weakening fail-closed behavior? Decide whether one Evaluation can express partial coverage cleanly or whether the successor needs a sharper result model, and record every invariant the implementation specification must preserve.

## Answer

Keep one deep, pure Evaluation module and one Rules module. Expand their internal models instead of creating public path-specific calculators, a rules adapter, or route-level eligibility logic. Exact file placement remains with the later architecture decision.

### Public module interfaces

The Evaluation module exposes only the small interfaces needed by forms, saved-data restoration, and result rendering:

- `parseProfile(unknown)` returns either one complete typed Profile or structured input errors.
- `evaluate(profile, currentDate, validatedRules)` returns one Evaluation result.

The Rules module exposes:

- the current local Tax Year Rule dataset and Source registry; and
- `validateRules(unknown, currentDate)`, which returns either structurally invalid Rules or a validated set of independently available rule groups.

Do not create a public calculator for each presumptive path. Private implementations may calculate the Specified professional path and Eligible business path behind `evaluate`. Tests and callers use the same public interfaces.

Profile parsing, legal eligibility, and rule validity remain distinct:

- parsing rejects malformed, missing, unknown, unsafe, or arithmetically impossible input;
- Evaluation returns Unsupported for a well-formed Profile whose declared legal facts fall outside the calculation boundary; and
- Rules validation withholds any conclusion whose required statutory data or provenance is invalid, missing, or stale.

Routes may manage questionnaire drafts and display parse errors. They do not construct a typed Profile by assertion, calculate money, select an income path, decide applicability, or combine partial statutory conclusions.

### Profile model

Use nested discriminated unions rather than the current large boolean record.

Shared Profile facts cover adult and residence status, new-regime selection, the one-practice boundary, activity label, supported other income and credits, unsupported facts, state or Union territory, GST aggregate turnover, and the confirmations common to every path.

The `incomePath` branch is exactly one of:

- **Specified professional path:** gross receipts, cash receipts, declared profit, and specified-profession confirmation.
- **Eligible business path:** qualifying banking or online receipts, all other receipts, declared profit, eligible-business exclusions, Chapter VIII-C deduction confirmation, and five-year-history confirmation.

The client branch is exactly one of:

- domestic clients only; or
- foreign or mixed clients with the required work-location, recipient, own-account supply, place-of-supply, establishment, receipt-route, Indian settlement, foreign-account or balance, foreign-operation, foreign-tax, and resolved-rupee confirmations.

The GST branch is exactly one of:

- unregistered with completeness, compulsory-registration, and optional threshold-liability date facts;
- one active normal-taxpayer GSTIN, without storing the GSTIN value; or
- another or uncertain registration state that can retain only independent income-tax Coverage.

Do not store derived profit, selected thresholds, calculated tax, rule values, display strings, Completion records, questionnaire progress, or Analytics data in Profile. All money values are non-negative safe integer rupees. Reject unknown fields when parsing restored data so an obsolete or corrupted shape cannot silently enter Evaluation.

Questionnaire drafts may be incomplete and use display strings. They are not Profile and never enter Evaluation until parsing succeeds.

### Evaluation result kinds

Retain exactly three top-level result kinds:

1. **Supported result.** Income-tax arithmetic is valid. The result contains the Tax estimate, tagged Coverage for annual return, GST, and foreign-account or return guidance, applicable Obligations, Review actions, assumptions, explanations, and source references.
2. **Unsupported result.** A well-formed declared fact can change tax arithmetic or put the Profile outside the supported calculation. The result contains stable fact codes, affected areas, plain reasons, editable questionnaire-group identities, and official starting Sources. It contains no approximate calculation.
3. **Stale-rules result.** Root Rules, source identity, or a rule group required for the core income-tax calculation is invalid, missing, or stale. No tax estimate is returned.

Do not add a top-level partial result. Incomplete coverage is expressed by area.

Each area uses a tagged Coverage value:

- **Available** contains the complete typed conclusion for that area.
- **Unavailable** contains a stable reason such as unknown Profile fact, unsupported Profile fact, missing Rules, stale Rules, or missing provenance, plus plain guidance and safe Source references.

An available conclusion can state that no action applies. Do not use Unavailable as a substitute for “not applicable.” Views must render the tag and may not infer availability from nulls or missing properties.

The income-tax estimate is always present in a Supported result. It records the selected path and contains a path-specific presumptive-income breakdown plus the common rounded-income, slab-tax, relief, cess, credit, payable, settled, or refund breakdown.

### Area-scoped fail-closed behavior

Root dataset identity, schema, Tax Year, effective range, Source identity, and the rule group needed for income-tax arithmetic are core. If one fails, return Stale rules and no estimate.

After core income-tax Rules and Profile facts succeed:

- stale or unavailable annual-return Rules make annual-return Coverage unavailable and suppress its Obligation;
- stale or unavailable GST-registration Rules make GST Coverage unavailable and suppress its Obligation or threshold conclusion;
- stale or unavailable foreign-guidance Rules suppress that guidance without altering tax arithmetic; and
- a later GST-calendar rule-group failure suppresses only the affected GST periods and never invents dates from a neighbouring period.

Evaluation withholds only independently separable areas. A failed fact or Rule that can change receipts, the presumptive path, taxable income, credits, rounding, relief, surcharge, or audit treatment still prevents the core calculation.

### Rule dataset

Keep one local Rule dataset per Tax Year. Its root contains a stable dataset identity, schema version, Tax Year, effective range, verification date, overall review deadline, change notes, and the single Source registry.

Organise values into rule groups that match independent evaluated areas:

- income paths and receipt limits;
- common income-tax slabs, relief, cess, rounding, and ceiling;
- advance tax;
- annual return;
- GST registration; and
- the later GST calendar and LUT rules.

Add a group only when the product supports its conclusion. Do not scaffold unused foreign-document, refund, penalty, or filing-preparation Rules.

Each rule group has its own stable identity, effective interval, verification date, expiry or mandatory review date, values, conditions, and statutory Source references. This permits a GST extension or a 1 October 2026 transition to expire the affected conclusion without disabling unrelated, current income-tax arithmetic.

The Rules validator must reject unsafe numbers, unknown schema versions, missing identities, duplicate identities, invalid or overlapping effective intervals, invalid dates, missing required values, inconsistent thresholds or rates, unreferenced required Rules, missing Sources, non-HTTPS Sources, invalid Source review chronology, expired required groups, and operative dates without direct extension provenance. It must not fill a missing group with an old value or a default.

### Source registry and provenance

Keep one Source registry with the existing statutory and tutorial distinction.

Every personalized conclusion and Obligation points to stable Rule identities. Each Rule points to one or more statutory Sources with an explicit provenance role such as applicability authority, normal-date authority, rate or threshold authority, or extension authority. An operative date requires its own direct extension Source and cannot overwrite the normal date or its Source.

Tutorial Sources remain separately reviewed instructional links. They never establish a value, condition, date, Coverage state, or Evaluation result. Removing a tutorial cannot change calculation.

Sources contain stable identity, publisher, title, HTTPS URL, publication or issue date when available, human review date, applicable Tax Year or period, status, and covered Rule identities. Rule-group validation fails closed when a required statutory Source is unavailable or outside its review window.

### Obligation and Review-action model

Evaluation returns every applicable Obligation. It does not accept Completion records and does not return `nextObligation` or “next incomplete” state.

An Obligation contains a stable kind plus its Tax Year or GST filing period as the composite identity, title, normal and optional operative dates, India-date Deadline status, applicability reasons, optional estimated amount only where supported, consequence copy, Rule identities, statutory Source identities, optional Tutorial Source, and verification metadata. Repeated GST returns cannot share identity merely because their titles match.

A Review action has a stable identity, title, reason, affected Coverage area, and safe Source references. It has no due date, Deadline status, amount, or Completion record eligibility.

The saved workspace later combines applicable Obligations with Completion records to choose what remains. This is a separate pure selection concern, not statutory Evaluation and not route-owned legal logic.

### Required invariants

- Evaluation remains synchronous, deterministic, side-effect free, and local.
- Evaluation receives the current date explicitly and derives India-date status consistently.
- Evaluation performs no storage, logging, Analytics, network, document, government, or filing action.
- Profile and money values never enter URLs, titles, logs, Analytics, external links, or Source URLs.
- Completion records never alter tax arithmetic or statutory applicability.
- Views render structured results and do not reproduce tax, eligibility, date, source, or stale-rule logic.
- Every supported amount remains integer rupees and uses statutory rounding only at named stages.
- Every unavailable or stopped conclusion has a stable code, plain reason, and safe recovery or starting guidance.
- An unknown, malformed, unsupported, or stale fact never becomes a favorable assumption.
- Normal and operative dates remain distinct and independently sourced.
- Current Rules are revalidated whenever a restored Profile is evaluated.
- No calculated result, derived Rule value, or current Deadline status is treated as durable user data.

The current released Evaluation remains valid for its existing Profile. These decisions describe its successor and must replace incompatible fields and branches rather than layering a second public calculator beside it.
