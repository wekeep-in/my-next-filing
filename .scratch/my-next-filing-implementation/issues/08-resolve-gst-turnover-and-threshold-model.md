# Resolve the GST turnover and threshold model

Type: grilling
Status: resolved
Blocked by: 01

## Question

How should the approved product specification reconcile the verified GST rules with its current questionnaire and result behavior? Decide whether the profile should collect all PAN-wide taxable and exempt supplies, including relevant bank interest, or return an incomplete or unsupported GST result when the supplied facts cannot establish aggregate turnover. Also decide how the at-threshold review nudge distinguishes itself from statutory registration liability, which starts only when turnover exceeds the threshold. The answer must prevent double counting and must not broaden the supported business profile.

## Answer

Use the canonical term **GST aggregate turnover**. It is the all-India value of taxable, exempt, export, and inter-State supplies for the same PAN, excluding GST, cess, and inward supplies taxed under reverse charge. The supported business profile remains direct IT or software services to Indian clients; relevant interest can contribute to GST aggregate turnover without becoming another supported business activity.

Ask for one direct money input labelled "GST aggregate turnover for this PAN." Explain that it includes taxable and exempt supplies before GST, including IT or software invoices and relevant interest. Evaluation uses this declared amount directly. It must not add Gross professional receipts or taxable bank interest, and it must not enforce an arithmetic relationship with either income-tax field because GST valuation and timing can differ.

Require one explicit completeness choice:

- "I confirm this is my complete GST aggregate turnover."
- "I cannot confirm this total."

If the user confirms the amount, compare it with the location threshold using three distinct states:

- **Below threshold** when aggregate turnover is less than the threshold: "Your declared GST aggregate turnover is ₹X below the ₹Y starting threshold for [state]. Some facts can require registration earlier."
- **At threshold** when aggregate turnover equals the threshold: "Your declared GST aggregate turnover equals the ₹Y starting threshold. Turnover-based registration starts only after you exceed it. Review before further turnover." Keep the overall plan supported.
- **Above threshold** when aggregate turnover is greater than the threshold: "Review GST registration now. Your declared GST aggregate turnover is ₹X above the starting threshold. This version does not calculate GST returns." Keep the income-tax result and mark GST coverage incomplete.

If the user cannot confirm the total, keep the income-tax result, return GST status **Unavailable**, mark GST coverage incomplete, and say: "We can still show your income-tax result, but we cannot show a GST threshold status without complete GST aggregate turnover." Provide official starting links. If the user declares another business or supply type, retain the existing global Unsupported result.

Update the fictional example to ₹19,10,000 GST aggregate turnover, comprising ₹19,00,000 service invoices and ₹10,000 interest. For Maharashtra, show ₹90,000 below the ₹20 lakh starting threshold.

### Compliance review

- **S0, `SPEC.md` Group 5:** the current input description limits the amount to IT or software invoices and can omit exempt supplies. The smallest safe correction is the direct GST aggregate turnover input and explicit completeness choice above.
- **S0, `SPEC.md` GST-registration threshold monitor:** the current at-or-above branch can imply liability at equality. The smallest safe correction is separate Below, At, and Above states using `<`, `=`, and `>`.

Evidence: [Central Goods and Services Tax Act, 2017, consolidated as on 11 June 2026](https://www.indiacode.nic.in/indiacode/bitstream/123456789/15689/1/A2017-12.pdf), section 2(6) for aggregate turnover and section 22 for registration when turnover exceeds the threshold. The ₹10 lakh and ₹20 lakh service thresholds remain unchanged. `Reconcile the specification with verified authority` must apply these corrections before implementation.
