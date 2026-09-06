# Salary alongside freelancing

## Scope

Support domestic employment salary alongside either existing presumptive freelance path, under the new regime for Tax Year 2026-27. The user approved research followed by implementation on 6 September 2026.

## Decisions

- Use one aggregate salary amount before the standard deduction and TDS, with resolved new-regime exemptions and benefits. Apply one deduction capped at ₹75,000 and salary. Keep actual employer TDS in the combined credit field.
- Require an explicit salary answer and confirmation of the narrow scope. Foreign salary, pensions, retirement/termination/leave settlements, arrears, advance salary, stock compensation, unresolved fund adjustments, relief and further deductions stay excluded.
- Reuse the existing income-tax evaluation and deadline paths. Salary affects combined taxable income and never enters practice receipts or GST turnover.
- Migrate workspace version 2 to version 3 in memory, preserving values and completion dates. Recovery version 1 becomes version 2 with salary unanswered. Normal validated writes persist the new schemas.

## Evidence

- [Statutory research and boundaries](research/domestic-salary.md)
- [Implementation and compliance review](issues/01-domestic-salary.md)
- [Authoritative behavior](../../SPEC.md)

No deployment or commit is part of this change. Broader salary treatment remains a later scope decision.
