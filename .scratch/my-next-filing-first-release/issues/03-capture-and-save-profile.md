# Capture and preserve a Profile

Status: blocked
Blocked by: 01

## Outcome

A user can complete all seven questionnaire groups, review every answer, edit any group, and retain valid progress in the browser without sending Profile data anywhere.

## Work

- Use the official shadcn Questionnaire, Field, Input, Checkbox, Select, Button, Progress, and disclosure items.
- Implement every Profile confirmation, money field, unsupported-fact choice, GST aggregate-turnover completeness choice, and final review copy from `SPEC.md`.
- Parse digits, Indian-grouped commas, and one leading rupee symbol into integer rupees. Reject negatives, paise, unsafe integers, cash above receipts, and higher profit below the supported minimum.
- Keep GST aggregate turnover direct. Do not derive or cross-validate it from income-tax amounts.
- Implement `saved-profile.ts` with schema version, update time, corrupt-data result, explicit deletion, and current-page memory fallback when storage fails.
- Keep questionnaire state route-local. Add no context, state library, storage adapter, or URL state.

## Test seam

Browser journey.

## Acceptance evidence

- Each behavior starts as one failing Browser-journey assertion.
- All Profile confirmations appear together.
- The review shows plain-language assumptions and working Change actions.
- Valid progress restores after reload when storage works.
- Corrupt saved data produces the explicit reset state.
- Unavailable storage preserves the current session and shows the required notice.
- Delete removes saved answers only after confirmation and returns home.
- Network inspection shows no Profile or money value leaving the page.

## Authority

- [Implementation specification](../spec.md)
- [`SPEC.md` questionnaire, money, saved-Profile, and privacy decisions](../../../SPEC.md)
