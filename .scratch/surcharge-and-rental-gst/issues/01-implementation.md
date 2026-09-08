# Implement ordinary-income surcharge and rental GST expansion

Status: implemented and verified. Authorized as the next appropriate slices on 8 September 2026.

## Supported behavior

- Ordinary taxable income can reach ₹1 crore. Above ₹50 lakh, the first 10% surcharge band applies, with marginal relief computed against ordinary tax at ₹50 lakh plus the excess income. Cess follows the reduced surcharge; actual credits and advance payments apply once afterward.
- The ₹50 lakh ceiling remains where positive equity gains survive current-year loss adjustment. Fully offset gains and pure capital losses can use the ordinary-income band. Existing income-path limits and unsupported facts remain enforced.
- The calculation displays the surcharge, its separate marginal relief, the net surcharge and the pre-cess total. A visible note explains this band and directs users to current return/disclosure instructions without choosing a return form.
- The rental GST confirmation accepts a GST-registered sole proprietor renting personally for their own residence, on their own behalf rather than for their business. The same-state and residential-use conditions remain. Old No/Not sure answers and legacy surcharge flags require explicit review; none are automatically changed.
- Workspace 10 and Recovery 9 are unchanged. No new fields, migration, storage key, dependencies, API or remote runtime are added. Existing historical data and Completion records are preserved.

## Verification

`pnpm verify:release` passed: formatting, lint, TypeScript, current Rule validation, 287 Vitest tests, production build/static-bundle validation and 146 Playwright cases. The existing WebKit video test is the only skip. No test was retired. Old ordinary-income ceiling assertions now test ₹1 crore; equity assertions retain ₹50 lakh. Resources counts include the new primary exemption source.

The new cases verify threshold rounding, marginal relief at adjacent steps, the upper band endpoint, cess ordering, TDS/TCS/payment/refund amounts, salary/NPS/rental/dividend combinations, net-zero versus positive equity gains, stale/missing provenance, old storage data and unchanged schema, registered/unregistered GST coverage, retained No/Not sure answers and legacy exclusions. Browser cases cover save/reload/payment updates, keyboard help, reduced motion, privacy and 1440px/1024px/320px layouts.

Screenshot review found a surcharge-relief minus sign wrapping separately from its amount. The row now uses the existing non-wrapping deduction-value style. After that presentation-only change, lint, typecheck, build and all 12 focused browser cases passed. Final screenshots were inspected at desktop, 1024px and 320px; the relief amount now stays on one line and there is no horizontal overflow. Artifacts: `artifacts/surcharge-research/release.log`, `e2e-final.log` and screenshots under `artifacts/playwright/results/surcharge-*/`.

Compliance evidence is in [research](../research/authority.md). The user requested committing the verified changes. Deployment was not requested.

## Compliance conclusion

No findings against the implemented bounded scope. Surcharge and its marginal relief use the enacted first band and threshold comparison, cess follows relief, and credits apply once. Positive net equity gains retain the lower ceiling. The registered-proprietor exemption requires all notified personal-capacity/residence conditions and remains independently sourced for both GST paths. Missing/stale data cannot produce a favorable conclusion.
