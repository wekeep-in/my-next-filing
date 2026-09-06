# Plan action links

Reviewed on 6 September 2026. This change adds navigation and procedural help to the next-action card and agenda. It changes no statutory values, eligibility, dates, Coverage or calculation. Opening a link never updates a Completion record.

The implementation reuses the Source registry, Resources catalogue and external-link control. Each supported Obligation kind has a fixed portal destination. Approved tutorials are selected in the view, independently of Evaluation. Non-approved tutorials remain hidden.

## Official destinations

The [Income Tax homepage](https://www.incometax.gov.in/iec/foportal/) links directly to [e-Pay Tax](https://eportal.incometax.gov.in/iec/foservices/#/e-pay-tax-prelogin/user-details) and [e-Filing login](https://eportal.incometax.gov.in/iec/foservices/#/login). The [GST homepage](https://www.gst.gov.in/) links to [registration](https://reg.gst.gov.in/registration/) and [login](https://services.gst.gov.in/services/login). All entry documents returned HTTP 200. Authenticated GST services use login plus the documented menu destination rather than an unverified authenticated deep link.

## Tutorial review

All linked tutorial pages returned HTTP 200 and their instructions were inspected for the stated procedural scope. No reliable publication or issue date was displayed for these live manuals. The Income Tax footer generates today's date in JavaScript, so it is not a publication date. The recorded Source review date is 2026-09-06.

| Source | Verified scope and boundary |
| --- | --- |
| [Generate challan](https://www.incometax.gov.in/iec/foportal/help/generate-challan-form) | Pre-login and post-login e-Pay Tax entry, challan generation and payment options. Approved for navigation only; the user selects the current period and payment type. No screenshot year, bank list or amount is copied into Rules. |
| [e-Filing portal guide](https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/quick-glance-first-time-registration-users/quick-glance-first-time-UM) | Dashboard and e-File menu, including return filing and verification. This does not choose ITR-3 or ITR-4 or approve current-period form instructions. The existing return-identification source remains deferred. |
| [GST registration](https://tutorial.gst.gov.in/userguide/registration/Apply_for_Registration_Normal_Taxpayer.htm) | New registration, Parts A and B, authentication and submission for a normal taxpayer. Other registration types in the shared manual do not expand the supported audience. |
| [GSTR-1](https://tutorial.gst.gov.in/userguide/returns/Creation_of_Outward_Supplies_Return_in_GSTR-1.htm) | Returns Dashboard, monthly or quarterly period selection, preparation, summary and filing. Optional IFF does not become an Obligation. |
| [GSTR-3B](https://tutorial.gst.gov.in/userguide/returns/Create_and_Submit_GSTR3B.htm) | Returns Dashboard, preparation, preview, payment screens and filing. No GST liability or credit calculation is added. |
| [QRMP challan](https://tutorial.gst.gov.in/userguide/payments/Create_Challan_(Post_Login).htm) | Services → Payments → Create Challan and the monthly payment for quarterly return option. The UI says to review ledgers and deposit only if needed; it does not infer an amount or mark a review as payment. |
| [LUT](https://tutorial.gst.gov.in/userguide/refund/Furnishing_of_Letter_of_Undertaking.htm) | Services → User Services → Furnish Letter of Undertaking, preparation, preview and submission of RFD-11. No automatic eligibility, regularisation or acceptance claim. |

No findings in this change's compliance review. Existing independent Rule expiry dates remain unchanged, including the GST calendar and LUT review boundary on 30 September 2026. Tutorials provide no statutory authority and do not refresh Rules.

## Verification

`pnpm verify:release` passed on 6 September 2026: formatting, lint, TypeScript, current-date Rule validation, 85 unit/browser tests, production build, bundle/header validation and 33 Playwright tests across Chromium, Firefox and WebKit. Reports are in `artifacts/vitest/results.xml` and `artifacts/playwright/report/index.html`.

The first new Browser Mode run exposed dependency discovery reloading tests during collection. Explicitly prebundling the link-button dependencies fixed it; both the next complete run and the release run passed. Resource assertions now account for seven approved guides and the extra advance-tax search result. General guides still have no statutory period, so period-specific search excludes them.

Compared next-action and agenda layouts at desktop, 1024px, 390px and 320px. Checked an actual QRMP plan, visible keyboard focus and reduced motion. Portal and tutorial controls retain 44px targets. The production journey test opens both destinations by keyboard and checks exact URLs, no referrer, no opener, no requests before activation, unchanged browser data and the original plan remaining open. It intercepts destination responses; public-page reachability was checked separately above. No authenticated filing or payment was attempted.

The layout follow-up keeps the official guide link inline in the note. Agenda notes have a top divider. The main-card note has no top divider and starts with the remaining amount when applicable, followed by the labeled due or review date; its separate metadata row was removed. The next-action card keeps its portal button below the note; agenda items place the portal CTA inline alongside the guide link. Action notes use the same 1.6 line height as the other plan paragraphs. Completion date labels remain available to screen readers but are visually hidden. The date selector and completion button share a row above 520px and stack on smaller screens. Lint, TypeScript, build, all 16 Browser Mode tests and the three portal-link journeys passed after these changes. Visual and keyboard checks covered 1440px, 1024px, 390px and 320px, plus the completion editor at 640px. Date selection and saving completion were exercised with synthetic browser data. Current screenshots are under `artifacts/plan-action-layout/`.

The agenda refinement was checked at 1440px, 1024px, 390px and 320px, including keyboard focus and reduced motion. Screenshots are under `artifacts/agenda-inline-cta/`. Browser cases check both inline agenda links and the next-action button for all seven action kinds. The shared external-link icon now uses Lucide, which was added to the existing test prebundle list to prevent dependency discovery from reloading a fresh browser run.

The main-card summary refinement passed lint, TypeScript, build, all 16 Browser Mode tests and the three cross-browser portal journeys. Visual checks covered positive and zero remaining balances, annual returns and QRMP review at 1440px, 1024px, 390px and 320px. Existing labels for normal due dates, normal review dates and furnishing before export are preserved. Screenshots are under `artifacts/main-card-summary/`.

Removed the general Browse resources link from every Plan result state at the user's request. Resources remains reachable through the landing FAQ. Navigation tests now follow that public route and its extra history entry. Retired the direct fictional-plan-to-Resources round-trip assertions because their only public entry point was the removed link; the FAQ intentionally returns to the personal session. Personal edits, failed Recovery writes, workspace selection, history, resource search and fictional/personal separation remain covered. Lint, TypeScript, build and all 18 resource/questionnaire journeys passed across Chromium, Firefox and WebKit. The remaining Plan layout was checked at 1440px, 1024px and 390px; screenshots are under artifacts/plan-resource-link-removal/.
