# Resources inventory

Inspected 6 September 2026 at repository commit `f29fc73`. This is a local inventory and publication plan, not a new statutory compliance review. Recount before implementation if the registry changes.

## Evidence

- [`src/rules/index.ts`](../../../src/rules/index.ts) owns Source identities, URLs, types, review dates, periods, tutorial statuses, Rule provenance, and validation.
- [Earlier tutorial review](../../my-next-filing-implementation/research/statutory-rules-and-sources.md) records period-specific problems with payment and return guides.
- [LUT research](../../gst-filing-calendar/research/lut.md) records why official tutorial wording still needs comparison against authority.
- [`SPEC.md`](../../../SPEC.md) distinguishes statutory authority from tutorials and keeps fixed official links reachable when a personalized plan is unavailable.

| Inventory | Count |
| --- | ---: |
| Source identities | 26 |
| Distinct exact URLs | 24 |
| Statutory identities | 22 |
| Distinct statutory URLs | 20 |
| Tutorial identities | 4 |
| Approved tutorials | 0 |
| Planned public resources, after editorial review | 22 |

## Initial catalogue coverage

These are descriptive working labels and classification decisions. Implementing the catalogue includes checking each title, description, alias, and task against its linked source. No new legal conclusion is approved by this table.

| Source identity or group | Public role | Topic | Tasks |
| --- | --- | --- | --- |
| `gst-notification-82-2020` | GST return periods and payment schedule reference | GST | File GST returns |
| `gst-notification-83-2020` | GSTR-1 schedule reference | GST | File GST returns |
| `gst-notification-84-2020` | QRMP eligibility reference | GST | File GST returns |
| `gst-circular-143-2020` | QRMP elections and payment reference | GST | File GST returns |
| `gst-notification-37-2017` | LUT eligibility reference | GST; Overseas clients | Understand LUT |
| `gst-circular-8-2017` | Annual LUT reference | GST; Overseas clients | Understand LUT |
| `gst-circular-125-2019` | LUT furnishing reference | GST; Overseas clients | Understand LUT |
| `income-tax-act-2025-2026` + `domestic-salary-2026` + `section-156` | One amended Act resource, preserving salary and rebate references | Income tax | Understand tax methods; Understand tax rates and deductions; Pay advance tax; File an income tax return |
| `section-58` | Presumptive income reference | Income tax | Understand tax methods; Pay advance tax |
| `section-62` | Specified professions reference | Income tax | Understand tax methods |
| `section-202` | New-regime rates reference | Income tax | Understand tax rates and deductions |
| `finance-act-2026` | Finance Act reference | Income tax | Understand tax rates and deductions |
| `section-404` | Advance-tax threshold reference | Income tax | Pay advance tax |
| `section-408` | Advance-tax timing reference | Income tax | Pay advance tax |
| `section-263` | Return-filing requirements reference | Income tax | File an income tax return |
| `rule-163` | Additional return-filing requirements reference | Income tax | File an income tax return |
| `budget-2026-return-dates` | Official return-date FAQ | Income tax | File an income tax return |
| `gst-act-2017` | GST turnover and registration reference | GST | Register for GST |
| `gst-registration-rules` | Registration process rules reference | GST | Register for GST |
| `fema-export-regulations-2026` | Overseas receipts regulations reference | Overseas clients | Receive overseas payments |
| `gst-registration-hub` | Official help portal, not an approved step-by-step guide | GST | Register for GST |
| `gst-portal` | Official portal, not personalized dates or a filing action | GST | File GST returns |
| `advance-tax-challan` | Withheld: `provisional` | Not published | Re-review before promotion |
| `return-identification` | Withheld: `deferred` | Not published | Re-review before promotion |

The two portals remain `starting-link-only`. Do not change their statuses to publish them as portals. Provisional, deferred, and rejected tutorials must not enter search results or suggestions. Approved tutorials can enter later after their own review; this slice does not need to expand the collection to ship.

## Duplicate and review handling

The amended Act's three identities point to the same exact URL. Preserve those identities in the Rule registry and explicitly group them in the browsing catalogue. Do not use URL deduplication to delete or rewrite statutory provenance. Do not merge different URLs merely because their titles look alike.

The salary identity was reviewed on 6 September; the other two on 3 September. The combined resource's displayed source-review date must use the oldest constituent date, with individual dates available in source details. A newer partial review cannot refresh the entire document's reviewed coverage.

## Period and freshness facts

All statutory records name `Tax Year 2026-27`. That is this product's reviewed coverage. It is not the document's publication year: the collection includes 2017 and 2020 GST material. Tutorials have no `taxPeriod` field.

- Dataset review deadline: 31 August 2027.
- GST-calendar and LUT review deadlines: 30 September 2026.
- The FEMA source describes a transition on 1 October 2026; any description of that transition needs the fixed date and a fresh source check.
- An Assessment Year is not interchangeable with a Tax Year. Do not make `AY 2026-27` a synonym of `Tax Year 2026-27`.
- Legacy section identifiers, including `44ADA`, need explicit reviewed context before any association with current references. No automatic translation belongs in this release.

Read-only validation at the inspection commit passed on 6 and 30 September 2026. On 1 October, root validity remained true but GST-calendar and LUT groups were invalid. On 1 September 2027, root validation failed. `scripts/validate-rules.ts` checks root validity only, so that command alone does not verify resources' independent review warnings.

Review deadlines belong to the product's checked coverage, not to the existence or legal lifetime of a document. Safe reference links can remain accessible with review warnings. Never describe a document as legally expired just because the product needs another review.

## Missing metadata and implementation consequences

The registry has no reader-facing descriptions, Topic/Task classifications, search aliases, protected form identifiers, display-type labels, or verified section anchors. Add these in a small catalogue keyed by Source identities. The existing Source validator accepts exact keys; adding unrelated browsing fields to Source records would unnecessarily change the legal schema.

Keep source URLs, official titles, publishers, periods, and recorded review dates in the registry. The catalogue must reuse them. Search only reviewed catalogue metadata and source titles, not research notes, remote page content, full PDFs, or global scope warnings.

Do not fabricate PDF page fragments or section anchors. Where only a full document is registered, open that document and provide a verified section reference in the result description or details.
