# Domestic salary alongside a freelance practice

Reviewed 6 September 2026 for income earned from 1 April 2026 to 31 March 2027, Tax Year 2026-27. This is not Assessment Year 2026-27.

## Decision

Proceed with one aggregate amount for supported domestic employment salary before the standard deduction. Apply the deduction locally once. Keep salary separate from the existing presumptive practice and bank-interest amounts. Require an explicit supported-salary confirmation; an unanswered or uncertain confirmation must not mean zero salary.

This supports a job alongside freelancing and an ordinary change of employer within the year. It does not require employer records, names, a monthly payroll model, or a second tax calculation.

## Verified authorities

The controlling source is the Income Tax Department's [Income-tax Act, 2025 as amended by Finance Act, 2026](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf). Its cover explicitly identifies the enacted amended Act. The following paragraph summarises provisions read in that document; page numbers are PDF page numbers starting at one.

Section 9(3), page 31, covers employment services rendered in India. Section 15, pages 41–42, includes salary due, advance salary and previously untaxed arrears; it prevents double taxation of advances and excludes partner remuneration. Section 124, pages 185–187, permits employer pension contributions, with a 14% salary limit under the new regime and a defined salary base. Section 157, page 217, provides relief for specified arrears and advances. Section 392, pages 465–466, addresses salary withholding, multiple employers and special ESOP deferral. Section 405, pages 509–510, connects advance-tax credits to included income and actual withholding. Section 408(2), page 512, applies the whole-current-income March instalment to the supported presumptive assessees. Section 263, pages 341–342, gives non-audit business/profession cases an August deadline; its income trigger disregards Chapter VIII deductions, not the section 19 standard deduction. These provisions support combining the income heads while preserving the existing advance-tax and return-date paths.

Additional direct sources:

| Authority | Verified rule | Date and review status |
| --- | --- | --- |
| [Section 19](https://www.incometaxindia.gov.in/w/section-19-199) | The new-regime standard deduction is the lesser of ₹75,000 and salary. It reduces the salary head, not business profits. Applying it to annual aggregate salary means one cap across employers. Other entries cover retirement-related deductions, which this first slice will exclude. | Act dated 2025; webpage publication date not stated. Read 2026-09-06 and checked against the amended Act. |
| [Section 16](https://www.incometaxindia.gov.in/w/section-16-220) | Statutory salary includes wages, pension, gratuity, fees/commission, perquisites, advances, leave payments and specified fund amounts. Therefore a label such as annual salary or CTC alone cannot define the accepted amount safely. | Webpage publication date not stated. Read 2026-09-06. |
| [Section 202](https://www.incometaxindia.gov.in/w/section-202-78) | New-regime computation excludes employment-tax deduction and most Chapter VIII deductions, but preserves employer pension deductions under section 124(1)/(2), Agniveer employer contributions under section 125(2), and section 146. Its regime-election conditions continue to distinguish people with business/profession income. Salary does not turn the freelancer into a salary-only regime-election case. | Page includes Finance Act 2026 amendments; read 2026-09-06. |
| [ITD tax-payment transition guidance, questions 17–19](https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/tax-payments) | Tax Year 2026-27 uses the new Act; advance tax applies at ₹10,000, and section 58 presumptive assessees pay their entire liability by 15 March. This corroborates 15 March 2027 for the combined case. | Publication date not stated; read 2026-09-06. |
| [CBIC CGST Act compilation, section 2(6), section 7 and Schedule III entry 1](https://cbic-gst.gov.in/pdf/CGST-Act-Updated-31082021.pdf) | Employment services are outside supply. Salary is therefore excluded from GST aggregate turnover, as well as from freelance receipts. | Compilation as of 2021-08-31, underlying Act assented 2017-04-12. Read 2026-09-06. Current CBIC Schedule III text also located; see access limitation below. |

The income-tax consolidated PDF is already registered locally with publication date 2026-03-30. This investigation confirmed its identity and operative amendments but did not independently establish that publication date from its cover. Do not describe the retrieval date as a publication date. The separate section 19 page has no visible publication date, so omit it in source metadata.

## Minimum safe amount contract

The input should mean the aggregate employment salary taxable under the new regime before section 19's standard deduction and before TDS. The user's tax records must already resolve the taxable amount, permitted exemptions, taxable allowances and any supported ordinary perquisites. It must cover the whole tax year and all included employers.

Do not accept CTC, take-home pay, bank credits, or an employer's final taxable-income figure after the standard deduction. A record that already deducts ₹75,000 must be restored to the before-deduction salary amount before entry; otherwise the application would deduct twice. Include current-year salary due even if not yet credited to the bank. Do not subtract employee PF, professional tax, personal NPS or other deductions from the input.

Recommended first-slice confirmation boundaries are product decisions, deliberately narrower than the law:

- Employment is with an Indian employer and all employment work is performed in India. A foreign employer, overseas duties, foreign currency, foreign tax or treaty questions stop this salary branch. A foreign-owned Indian employing entity is not excluded merely because of its parent.
- Employment and client invoices are separately identified. A partner's remuneration is not included as employment salary. The existing one-practice and platform classification gates still apply.
- No pension, family pension, gratuity, termination compensation, retirement settlement, leave-encashment settlement, previous-year arrears, advance salary, or relief claim.
- No ESOP, RSU, sweat-equity or other stock compensation, including deferred ESOP tax. This also avoids unresolved foreign-asset and special payment-timing consequences.
- No employer NPS or Agniveer contribution requiring a deduction, no other allowed deduction claim, and no unresolved provident/superannuation-fund tax adjustment.
- Any included ordinary taxable benefits and allowed exemptions are already resolved in current new-regime records. An uncertain figure stops the estimate; the application does not calculate exemptions or value perquisites.

An alternative would accept already-computed income chargeable under Salaries. I would not use it for this slice: summing multiple employers' after-deduction figures can repeat the deduction, and the user cannot see what the application applied. One before-deduction amount and one visible deduction is easier to audit.

## Calculation and integration

Use `salaryDeduction = min(supportedSalaryBeforeDeduction, rules.salaryStandardDeduction)` and `taxableSalary = supportedSalaryBeforeDeduction - salaryDeduction`. Add taxable salary to the existing presumptive income and bank interest before rounding total income. Keep the existing rebate, marginal relief, cess, combined ₹50 lakh ceiling and credit calculations.

One aggregate TDS input remains sufficient if its explanation includes actual salary TDS together with freelance and interest TDS, without double counting. Do not use expected year-end employer withholding as actual credit or deduct TDS from salary first. Existing TDS/TCS-based return triggers then naturally include employer withholding.

The return threshold uses combined income after the standard deduction for this narrow case. Introducing employer NPS later would require revisiting the return trigger because Chapter VIII deductions are added back for that test. Salary does not change the non-audit business/profession normal return deadline of 31 August 2027. Do not name a return form or promise ITR-4 eligibility; current-year form selection remains outside the reviewed scope.

Store the deduction in the existing common income-tax rule group, with direct section 19 applicability/rate provenance and amended-Act support for the salary scope. Use 2026-04-01 through 2027-03-31 as the effective tax period and 2026-09-06 as this verification date. Preserve the existing dataset expiry policy; that expiry is an application review deadline, not a statutory sunset. Missing, unsafe or stale salary rules must fail closed with the core estimate.

## Implementation risks to test

These are review requirements for the new branch, not findings against the still-excluding-salary baseline.

| Severity | Risk and smallest check |
| --- | --- |
| S0 | Double deduction or deduction from freelance profit. Check salary ₹50,000, ₹75,000 and ₹75,001, plus a combined-employer example using a single aggregate. |
| S0 | Salary omitted from slab/rebate/ceiling calculation. Check combined income on both sides of the rebate threshold and ₹50 lakh ceiling, including marginal relief. |
| S0 | Salary enters practice receipt eligibility or GST turnover. With the same practice and GST facts, adding salary must not change those branches. |
| S1 | Missing or uncertain salary facts silently mean no salary. Exercise questionnaire, direct Profile validation and saved/recovery records. Old complete Profiles need an explicit compatibility decision. |
| S1 | Salary deductions accepted without statutory data provenance. Remove or expire the new required rule and ensure core evaluation stops. |
| S2 | Job change creates extra deduction or salary changes payment dates. Check aggregate salary plus presumptive profit retains 15 March 2027 and 31 August 2027. |
| S2 | TDS entered twice, or withholding treated as a salary expense. Check the same gross salary with different actual TDS produces identical total income and appropriately different balances. |

## Access limitations and remaining scope

The amended income-tax PDF and section 19/16/202 pages were readable through the browser source tool. A direct shell download of the income-tax PDF returned HTTP 403. Several web opens of the current CBIC dynamic Schedule III page and the existing India Code PDF failed. The [current CBIC Schedule III page](https://taxinformation.cbic.gov.in/content-page/explore-act/1000736/1000001/schedule%20III/ACTS) was located with the same employment exclusion, and the complete CBIC 2021 compilation was read to establish the operative text. No change to GST thresholds or dates is proposed here.

No payroll exemption formulas, perquisite valuation rules, employer NPS computation, arrears relief, pension treatment, stock-compensation computation, or current-year return-form selection was validated for implementation. Those cases are excluded rather than treated as zero. The findings support implementing the narrow aggregate-salary branch now.
