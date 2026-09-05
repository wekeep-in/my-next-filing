# Plan the solo-freelancer filing workspace

Label: wayfinder:map

Status: decision-complete

The accepted [frontend redesign specification](../frontend-ideas/spec.md) supersedes this map where it changes questionnaire routing, Recovery drafts, Saved-workspace schema and legacy deletion, frontend state ownership, or their release checks. The root `SPEC.md` remains authoritative.

## Destination

Reach a decision-complete product and technical definition for a successor to the current release that serves resident-individual solo digital freelancers with domestic or Foreign professional receipts, saves work on the current device, tracks user-declared completion, and remains ready for a separate implementation specification and ordered implementation plan.

The map is complete when no product, statutory, domain, privacy, interaction, architecture, migration, verification, or release decision remains for the implementation-planning effort to invent.

## Notes

- `SPEC.md` remains the authority for the current release. This effort plans a successor and must not silently rewrite shipped behavior.
- This map plans decisions only. It does not create the successor specification, implementation plan, application code, infrastructure, or production release.
- The intended audience is common solo digital freelancers such as developers, designers, writers, marketers, and consultants. Statutory research must decide which categories can share a supported calculation path.
- Support direct clients and freelance platforms where the freelancer remains the service provider.
- Foreign professional receipts cover service payments from clients outside India. They do not cover foreign salary, investments, property, capital gains, foreign assets, unrelated foreign-source income, or foreign-tax credit.
- Preserve the existing stop behavior for unsupported domestic income, deductions, losses, credits, and activities.
- Plan GST threshold monitoring and a narrow registered-exporter calendar. Do not plan GST liability, refunds, or return preparation.
- A Completion record is the user's declaration that an Obligation was completed. It never claims government acceptance or verification.
- Save the Profile and Completion records only after explicit consent on the current device. Re-run Evaluation against current Rules instead of trusting a stored result.
- Keep one current Tax Year active and archive prior supported years during rollover. Historical backfilling and historical recalculation are excluded.
- Preserve the current design language: focused journey, one primary action, chronological agenda, Fraunces and Inter, warm neutral ground, dark ink, green accent, compact rounded cards, accessible interaction, and restrained CSS motion.
- Use only a generic share action for the public website. Never put Profile, money, result, or Completion record data in a shared URL, title, preview, or Analytics event.
- Use `grilling` with `domain-modeling` for product decisions, `research` for outside facts, `compliance-review` for statutory work, `prototype` with `emil-design-eng` for the interaction decision, and `code-conventions` with `codebase-design` for application seams. Keep Ponytail full: choose the smallest design that meets the settled product boundary.
- The local Markdown tracker uses `Status: claimed` as the ticket claim. Research runs use isolated throwaway branches named in their tickets so concurrent work does not switch the shared worktree.
- The agent privacy review may guide conservative product decisions, but only the qualified privacy-review task can clear the final release gate.

## Decisions so far

- [Research income-tax treatment for solo digital freelancers](issues/01-research-income-tax-treatment.md): foreign clients do not bar presumptive taxation, but safe expansion needs explicit profession or business-path classification, confirmed gross rupee receipts, and separate return-guidance boundaries.
- [Research GST and foreign-receipt duties for solo freelancers](issues/02-research-gst-and-foreign-receipt-duties.md): narrow export support needs one-state own-account service facts, complete export conditions, an expiry-bound GST calendar, and a 1 October 2026 FEMA transition; annual totals cannot drive invoice-level duties.
- [Research privacy and security for on-device persistence](issues/03-research-on-device-persistence.md): use one validated, versioned localStorage envelope only after settling third-party Analytics access, shared-browser warnings, retention, recovery, deletion, and qualified Indian privacy review.
- [Set the successor release boundary and success measures](issues/04-set-release-boundary-and-success-measures.md): ship the verified solo-freelancer income-tax expansion with the complete on-device save, resume, completion, undo, and deletion loop; defer the GST calendar, gate release with target-user testing, and collect no production product events after ticket 11's privacy decision.
- [Define the supported solo-freelancer Profile](issues/05-define-supported-solo-freelancer-profile.md): support one adult India-based service practice through an explicitly confirmed specified-professional or eligible-business path, accept domestic and resolved foreign receipts, isolate non-calculation GST and return uncertainty as Incomplete coverage, and stop every fact that can change tax arithmetic.
- [Decide the supported Obligation catalog](issues/06-decide-supported-obligation-catalog.md): ship advance tax, annual return, and conditionally dated GST registration first; later add LUT plus monthly or full QRMP GST filing dates, while keeping invoice-level foreign duties, tax amounts, penalties, and filing actions outside the agenda.
- [Decide the Profile, Evaluation, and Rules model](issues/07-decide-profile-evaluation-and-rules-model.md): retain one deep pure Evaluation and three top-level results, model path and client facts as discriminated Profile branches, express partial availability through tagged area Coverage, validate expiry-bound rule groups independently, and keep completion outside statutory calculation.
- [Decide the Saved workspace lifecycle](issues/08-decide-saved-workspace-lifecycle.md): persist one explicitly consented, versioned Profile-and-completion envelope in browser storage, revalidate and re-evaluate on every restore, block stale-tab writes, preserve invalid data until deliberate deletion, keep unsaved use complete, and provide no fake backup or access-control promise.
- [Decide Completion record behavior](issues/09-decide-completion-record-behavior.md): store one user-declared date per composite Obligation identity, keep completion separate from deadlines and tax arithmetic, require advance-tax amount reconciliation, derive open and completed work from current Evaluation, and preserve mismatches as Needs review.
- [Decide Tax Year rollover and archive behavior](issues/10-decide-tax-year-rollover-and-archive.md): create a new active year only from current validated Rules and reconfirmed facts, keep unfinished ended years open beside it, archive only fully reconciled years as read-only declared history, and never carry amounts, completion, calculation, or law across periods.
- [Decide privacy, Analytics, and site-sharing behavior](issues/11-decide-privacy-analytics-and-site-sharing.md): remove remote Analytics before saving and collect no production events, use separate adult-only storage consent and self-service deletion, keep runtime assets local, disclose Cloudflare hosting, and share only a fixed canonical homepage payload.
- [Research foreign payment accounts and income-source classification](issues/16-research-foreign-accounts-and-income-source.md): keep India-based work supportable when funds settle directly to an Indian bank, use a tax-estimate-only result for possible foreign accounts or balances, and stop for foreign operations, residence, tax, or unresolved currency facts that can change the calculation.
- [Prototype the expanded filing-workspace journey](issues/12-prototype-the-expanded-journey.md): use the focused timeline with one dominant next action and one chronological agenda, keep the branched questionnaire minimal, place Tax Year management behind the action on mobile, and treat advance-tax payment reconciliation, Coverage, stop states, save consent, and corrections as contextual parts of the same journey.
- [Choose the application and storage architecture](issues/13-choose-application-and-storage-architecture.md): keep the static React SPA on Workers Static Assets, add one deep browser-only workspace module and one privacy route, retain route-local drafts and the pure Evaluation/Rules seams, use one strict revisioned localStorage envelope, remove Analytics/confetti, and add no Cloudflare service or dependency.
- [Define verification and release gates](issues/14-define-verification-and-release-gates.md): require one non-redundant automated path, full public-boundary fixtures, synthetic multi-browser journeys, strict storage and privacy network checks, current official statutory review, qualified privacy approval, accessibility/performance evidence, the five-person comprehension test, and a preview-to-production release record from the same commit.
- [Audit decision completeness before implementation planning](issues/15-audit-decision-completeness.md): the current specification remains the shipped-release authority, every successor supersession and unchanged constraint is explicit, dependency-era placeholders are reconciled, no decision ticket remains, and external legal/statutory/usability evidence stays an execution-time release gate rather than assumed approval.

## Not yet specified

None for this planning destination. Ticket 14 specifies release evidence that must still be produced during implementation and release.

## Handoff artifacts

- [Solo-freelancer successor specification](successor-spec.md)
- [Ordered implementation plan](implementation-plan.md)

## Out of scope

- Creating the successor product specification or implementation plan during this Wayfinder effort.
- Application code, infrastructure provisioning, deployment, or migration execution.
- Accounts, authentication, cloud sync, a backend, a database, or another new server-side persistence system.
- Document upload, bank-statement processing, OCR, runtime AI, or transaction-level bookkeeping.
- Email, SMS, WhatsApp, push, browser, or calendar reminders.
- Personal social profiles, public Completion records, community counts, referrals, streaks, or leaderboards.
- Government credentials, OTPs, portal integration, filing, payment, government-status verification, or acknowledgement storage.
- Foreign-tax credit and foreign salary, investments, property income, capital gains, foreign assets, or unrelated foreign-source income.
- Full GST liability, input-tax credit, refunds, return preparation, validation, upload, or submission.
- Historical-year backfilling or recalculation under superseded Rules.
- Companies, LLPs, partnerships, HUFs, trusts, non-residents, employers, or payroll and deductor duties.
- [Obtain an India privacy applicability review](issues/17-obtain-india-privacy-applicability-review.md): qualified legal approval is production-release evidence outside this planning destination; the review packet remains a mandatory implementation gate and no approval was inferred.
