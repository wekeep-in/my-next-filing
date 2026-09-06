import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'
import { currentRules } from '@/rules'

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
        The only deduction this version calculates is the salary standard
        deduction. It does not cover tax-relief claims or other deductions,
        including employer contributions claimed under the National Pension
        System, or NPS, and the Agniveer scheme. These are limits of this
        version, not a statement that the deductions are disallowed by law.
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
        professional tax or personal NPS contributions.
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
      description="TDS is tax a client, employer or bank withheld. Enter the actual credit for freelance income, supported salary and bank interest included in this estimate."
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
