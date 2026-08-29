# Capture a Profile in memory

Status: blocked
Blocked by: 01

## Outcome

A user can complete all seven questionnaire groups, review every answer, edit any group, and move between the questionnaire and result without sending or saving Profile data.

## Work

- Use the official shadcn Questionnaire, Field, Input, Checkbox, Select, Button, Progress, and disclosure items.
- Implement every Profile confirmation, money field, unsupported-fact choice, GST aggregate-turnover completeness choice, and final review copy from `SPEC.md`.
- Parse digits, Indian-grouped commas, and one leading rupee symbol into integer rupees. Reject negatives, paise, unsafe integers, cash above receipts, and higher profit below the supported minimum.
- Keep GST aggregate turnover direct. Do not derive or cross-validate it from income-tax amounts.
- Implement `current-check.ts` as the in-memory handoff between the questionnaire and Plan.
- Keep questionnaire state route-local. Add no context, state library, storage adapter, or URL state.

## Acceptance evidence

- All Profile confirmations appear together.
- The review shows plain-language assumptions and working Change actions.
- Back from the Plan preserves the current Profile while the page remains open.
- Refresh clears the Profile and redirects a direct Plan load to the questionnaire.
- Browser storage remains empty.
- Network inspection shows no Profile or money value leaving the page.

## Authority

- [Implementation specification](../spec.md)
- [`SPEC.md` questionnaire, money, in-memory Profile, and privacy decisions](../../../SPEC.md)
