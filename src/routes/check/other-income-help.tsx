import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'
import { currentRules } from '@/rules'

// Reviewed 2026-09-06: amended Act sections 7, 92, 93, 276, 408 and 425; SEBI circular 2020/194.
export function AdditionalIncomeHelp() {
  return (
    <HelpModal
      topic="dividends and additional interest"
      title="Which dividends and interest can I include?"
      description={`Use the amounts taxable for ${currentRules.taxPeriod} from your tax records, before TDS. The total credited to your bank may be different.`}
    >
      <p>
        Include ordinary dividends from Indian companies. The taxable year can
        depend on when a dividend was declared, distributed, paid or made
        available. Use your issuer's records to confirm the year. Do not deduct
        interest or other expenses from dividends or mutual-fund distributions.
      </p>
      <p>
        Indian mutual-fund distributions may be called IDCW, or Income
        Distribution cum Capital Withdrawal. Include the confirmed taxable
        amount whether paid to you or reinvested. Do not enter proceeds from
        selling, redeeming or switching units, or subtract a capital portion
        yourself.
      </p>
      <p>
        For post-office interest, enter only the taxable part before TDS. Your
        records must already resolve any exemption, ownership share and the year
        it belongs to. Exclude deposit principal, exempt interest and full
        maturity proceeds. This version does not calculate scheme exemptions or
        adjustments for early closure.
      </p>
      <p>
        For an Indian income-tax refund, include only its interest component
        taxable this year, not the refund itself. Reversals, disputed amounts,
        cross-year adjustments, other refund types, and unresolved amounts need
        separate guidance.
      </p>
      <p>
        This version does not cover foreign or deemed dividends, buybacks,
        company loans, liquidation or capital reductions, REIT/InvIT or other
        business-trust distributions, AIF income, special certificates/bonds,
        capital gains, losses, or expense/deduction claims. These are product
        limits. If you cannot confirm the categories and amounts, choose Not
        sure.
      </p>
      <p>
        The normal presumptive advance-tax date stays 15 March. Unexpected
        dividend income can need a separate timing review, including the
        conditional provision for payment by 31 March. Ask your adviser; this
        plan does not calculate interest or promise relief.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf">
        Official income-tax treatment
      </ExternalLink>
      <ExternalLink href="https://www.sebi.gov.in/sebi_data/attachdocs/oct-2020/1601906688276.pdf">
        SEBI guide to mutual-fund distributions, PDF
      </ExternalLink>
    </HelpModal>
  )
}

export function SalaryCoverageHelp() {
  return (
    <HelpModal
      topic="salary coverage"
      title="Which salary situations are covered?"
      description="This version covers salary from employers in India for work you performed in India, alongside your supported freelance practice."
    >
      <p>
        Your records must already establish the full year's salary, taxable
        benefits and exemptions under the new regime. Having a job for only part
        of the year or changing employers does not by itself exclude you.
      </p>
      <p>
        Arrears are pay received late for an earlier period. Advance salary is
        pay received before it is due. This version does not cover either,
        pension, retirement or termination payouts, or settlements for unused
        leave.
      </p>
      <p>
        Share-based pay includes employee share options and restricted stock
        units, often called ESOPs and RSUs. Foreign salary and unresolved tax
        adjustments for provident or other retirement funds are also outside
        this version.
      </p>
      <p>
        This version calculates the salary standard deduction and supported
        employer contributions to the National Pension System, or NPS. It does
        not cover tax-relief claims, personal NPS deduction claims, Agniveer
        deductions or other deductions. These are product limits, not a
        statement that every excluded deduction is disallowed by law.
      </p>
      <p>
        If any condition does not fit, choose No. If you cannot confirm it,
        choose Not sure. Do not leave income out just to get an estimate.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf">
        Official salary and new-regime rules
      </ExternalLink>
    </HelpModal>
  )
}

// Reviewed 2026-09-06 against amended Act sections 15–19 and 202.
export function SalaryHelp() {
  return (
    <HelpModal
      topic="annual salary"
      title="Which salary amount?"
      description={`The standard deduction is an amount subtracted from salary before calculating taxable income. Enter salary from all employers for ${currentRules.taxPeriod} before this deduction and TDS.`}
    >
      <p>
        Include salary due for this year even if it has not reached your bank,
        taxable allowances, bonuses and employer-valued benefits. Subtract only
        exemptions confirmed under the new regime. Do not subtract employee PF,
        professional tax or personal NPS contributions. Include employer NPS
        contributions once, before the employer NPS deduction.
      </p>
      <p>
        If an employer's figure already subtracts a standard deduction, add that
        deduction back before combining it with other employers' figures. We
        apply one deduction to the combined salary, capped at ₹75,000 or salary,
        whichever is lower.
      </p>
      <p>
        For example, if two employers report ₹6,00,000 and ₹4,00,000 before the
        deduction, enter ₹10,00,000. We deduct ₹75,000 once, leaving ₹9,25,000
        of taxable salary.
      </p>
      <p>
        Use your tax records to resolve benefits and exemptions first. If you
        cannot confirm the amount or the salary conditions, choose Not sure.
        Enter actual employer TDS separately in Indian TDS credit; do not
        include expected future withholding.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/w/section-19-199">
        Official salary deduction rules
      </ExternalLink>
    </HelpModal>
  )
}

// Reviewed 2026-09-07: amended Act sections 16, 17, 122, 124, 202 and 263.
export function EmployerNpsHelp() {
  return (
    <HelpModal
      topic="employer NPS"
      title="Which NPS amounts are covered?"
      description="Employer NPS is money your employer contributes to your National Pension System Tier I account. Your own contributions are different, even when payroll deducts them from your pay."
    >
      <p>
        Under the new regime, the employer deduction is up to 14% of basic pay
        plus eligible dearness allowance, or DA. DA counts only where your
        employment terms provide for it. Other allowances, bonuses, benefits,
        CTC and freelance income do not increase this limit.
      </p>
      <p>
        Use each employer's records for this tax year. Enter every contributing
        employer once. A new employer's statement may include your previous
        job's amounts; do not enter those amounts again. Keep the full employer
        contribution in annual salary, even if only part can be deducted.
      </p>
      <p>
        For one employer with ₹10,00,000 of basic pay and eligible DA, a
        ₹1,50,000 contribution gives a maximum deduction of ₹1,40,000. If more
        than one employer contributes, this version covers only cases where each
        contribution is within its own 14% limit. It does not transfer unused
        limits between employers.
      </p>
      <p>
        The combined deduction cannot exceed your total income before the NPS
        deduction. It is separate from the salary standard deduction. A lower
        taxable income does not necessarily remove the requirement to file a
        return; the income trigger is checked before this deduction.
      </p>
      <p>
        Check total employer contributions across recognised PF, NPS and
        approved superannuation funds, including all jobs. Amounts above
        ₹7,50,000 and taxable growth linked to excess contributions can need
        extra salary-tax calculations. This version does not cover those cases,
        even where the excess arose in an earlier year.
      </p>
      <p>
        Do not enter transfers, investment growth, withdrawals, pension payouts,
        NPS Vatsalya, Tier II or Unified Pension Scheme amounts here. You can
        have personal NPS contributions, but this estimate does not deduct them.
        Choose Not sure if your records do not confirm the amounts or treatment.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf">
        Official employer NPS and new-regime rules
      </ExternalLink>
    </HelpModal>
  )
}

// Reviewed 2026-09-06 against the linked ITD AIS/Form 168 guidance; undated.
export function InterestHelp() {
  return (
    <HelpModal
      topic="taxable bank interest"
      title="Which interest amount?"
      description={`Add taxable savings and deposit interest from your bank certificates for ${currentRules.taxPeriod}. Use gross interest before TDS, including taxable interest reinvested.`}
    >
      <p>
        If only TDS was deducted, net interest plus that TDS equals gross
        interest. Exclude deposit principal and exempt interest. No TDS does not
        mean no tax. Cross-check your Annual Information Statement, or AIS,
        without counting the same interest twice.
      </p>
      <ExternalLink href="https://www.incometax.gov.in/iec/foportal/ais-faq">
        How to check your AIS
      </ExternalLink>
    </HelpModal>
  )
}

export function TdsHelp() {
  return (
    <HelpModal
      topic="Indian TDS credit"
      title="Which TDS amount?"
      description="TDS is tax withheld by a payer. Enter the actual Indian credit for all income included in this estimate, including supported dividends, distributions and interest."
    >
      <p>
        Match payer certificates with AIS tax-credit entries for{' '}
        {currentRules.taxPeriod}. Total the tax deducted, not the gross
        payments. Count each credit once, including employer TDS. Exclude
        foreign and GST withholding; enter TCS and advance tax separately.
        Resolve mismatches with the payer before proceeding; use 0 only if no
        credit applies.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/documents/d/guest/form-168-faqs">
        Official AIS and credit guide, PDF
      </ExternalLink>
    </HelpModal>
  )
}

export function TcsHelp() {
  return (
    <HelpModal
      topic="Indian TCS credit"
      title="Which TCS amount?"
      description="TCS is income tax collected from you on certain transactions. Enter only the credit available for this tax year."
    >
      <p>
        Match the collector's certificate with AIS tax-credit entries for{' '}
        {currentRules.taxPeriod}. Total the tax collected, not the transaction
        value. Count each credit once; exclude GST TCS, reversed credits and
        amounts used for another year. Resolve mismatches with the collector
        before proceeding. Use 0 if none applies.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/documents/d/guest/fn-168">
        Official TCS credit guide, PDF
      </ExternalLink>
    </HelpModal>
  )
}
