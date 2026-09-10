import { ExternalLink } from '@/components/external-link'
import { HelpModal } from '@/components/help-modal'
import { currentRules } from '@/rules'

// Reviewed 2026-09-06: amended Act sections 7, 92, 93, 276, 408 and 425; SEBI circular 2020/194.
export function AdditionalIncomeHelp({
  buttonText,
}: {
  readonly buttonText?: string
}) {
  return (
    <HelpModal
      topic="dividends and additional interest"
      buttonText={buttonText}
      title="Which dividends and interest can I include?"
      description={`Use the amounts taxable for ${currentRules.taxPeriod} from your tax records, before tax deducted by the payer, called TDS. The total credited to your bank may be different.`}
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
        maturity proceeds. This app does not calculate scheme exemptions or
        adjustments for early closure.
      </p>
      <p>
        For an Indian income-tax refund, include only its interest component
        taxable this year, not the refund itself. Reversals, disputed amounts,
        cross-year adjustments, other refund types, and unresolved amounts need
        separate guidance.
      </p>
      <p>
        This app does not cover foreign or deemed dividends, buybacks, company
        loans, liquidation or capital reductions, real-estate or infrastructure
        investment trust payouts, other business-trust distributions,
        alternative investment fund income, special certificates/bonds, gains or
        losses outside the separate domestic-equity section, or
        expense/deduction claims. These are product limits. If you cannot
        confirm the categories and amounts, choose Not sure.
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
      description="This app covers salary from employers in India for work you performed in India, alongside your supported freelance practice."
    >
      <p>
        Your records must already establish the full year's salary, taxable
        benefits and exemptions under the new regime. Having a job for only part
        of the year or changing employers does not by itself exclude you.
      </p>
      <p>
        Arrears are pay received late for an earlier period. Advance salary is
        pay received before it is due. This app does not cover either, pension,
        retirement or termination payouts, or settlements for unused leave.
      </p>
      <p>
        Share-based pay includes employee share options and restricted stock
        units, often called ESOPs and RSUs. Foreign salary and unresolved tax
        adjustments for provident or other retirement funds are also outside
        this app.
      </p>
      <p>
        This app calculates the salary standard deduction and supported employer
        contributions to the National Pension System, or NPS. It does not cover
        tax-relief claims, personal NPS deduction claims, Agniveer deductions or
        other deductions. These are product limits, not a statement that every
        excluded deduction is disallowed by law.
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
        exemptions confirmed under the new regime. Do not subtract your own
        provident-fund contributions, professional tax or personal NPS
        contributions. Include employer NPS contributions once, before the
        employer NPS deduction.
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
        your total employment package and freelance income do not increase this
        limit.
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
        than one employer contributes, this app covers only cases where each
        contribution is within its own 14% limit. It does not transfer unused
        limits between employers.
      </p>
      <p>
        The combined deduction cannot exceed your ordinary income before the NPS
        deduction. Domestic equity gains do not increase this limit. It is
        separate from the salary standard deduction. A lower taxable income does
        not necessarily remove the requirement to file a return; the income
        trigger is checked before this deduction.
      </p>
      <p>
        Check total employer contributions across recognised provident funds,
        NPS and approved superannuation pension funds, including all jobs.
        Amounts above ₹7,50,000 and taxable growth linked to excess
        contributions can need extra salary-tax calculations. This app does not
        cover those cases, even where the excess arose in an earlier year.
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
        interest. Exclude the money you deposited and interest that is exempt
        from tax. No TDS does not mean no tax. Cross-check your Annual
        Information Statement, or AIS, without counting the same interest twice.
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
      description="TDS means tax deducted at source. A client, employer or bank deducts it from your payment and pays it to the government. Your tax credit is the amount available to reduce your income-tax bill. Enter the actual Indian credit for all income included in this estimate, including supported rental income, dividends, distributions and interest."
    >
      <p>
        Match the tax-deduction certificates from your clients, employers and
        banks with your Annual Information Statement, or AIS, tax-credit entries
        for {currentRules.taxPeriod}. Total the tax deducted, not the gross
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
      description="TCS means tax collected at source. A seller or other collector collects it from you on certain transactions and pays it to the government. A tax credit reduces your income-tax bill. Enter only the credit available for this tax year."
    >
      <p>
        Match the collector's certificate with your Annual Information
        Statement, or AIS, tax-credit entries for {currentRules.taxPeriod}.
        Total the tax collected, not the transaction value. Count each credit
        once; exclude GST TCS, reversed credits and amounts used for another
        year. Resolve mismatches with the collector before proceeding. Use 0 if
        none applies.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/documents/d/guest/fn-168">
        Official TCS credit guide, PDF
      </ExternalLink>
    </HelpModal>
  )
}

export function EquityGainsHelp({
  buttonText,
}: {
  readonly buttonText?: string
}) {
  return (
    <HelpModal
      topic="domestic equity gains"
      buttonText={buttonText}
      title="Which equity gains and losses can I include?"
      description={`Use your tax records for ${currentRules.taxPeriod}. Enter profit or allowable loss from investments you sold, not the full sale amount or changes in investments you still hold.`}
    >
      <p>
        Include Indian listed shares and Indian mutual funds confirmed as
        equity-oriented for tax purposes. Short-term and long-term describe how
        long you held the investment. For these supported shares and funds, up
        to 12 months is short-term; more than 12 months is long-term. Confirm
        the classification in your tax records and all applicable securities
        transaction tax, or STT.
      </p>
      <p>
        Short-term sales must be chargeable to STT. For long-term shares, STT
        must have been paid on acquisition and sale; for long-term fund units,
        on transfer. This app does not assess exceptions for acquisitions
        without STT or transactions in an International Financial Services
        Centre, or IFSC.
      </p>
      <p>
        Combine all brokers and funds once. Your gain and loss amounts must
        already resolve costs, eligible transfer expenses, ownership, holding
        periods and any older acquisition-cost rules. Do not deduct STT. Enter
        long-term gains before the annual ₹1,25,000 threshold and before any
        basic-exemption adjustment.
      </p>
      <p>
        Enter gains from profitable sales and allowable losses from loss-making
        sales separately for each holding-period category. If a broker report
        gives only a net amount, obtain the separate totals before continuing.
        Do not subtract losses twice. Your records must already account for
        restrictions on losses from buying and selling around dividend or
        bonus-unit dates. This section excludes unconfirmed or ineligible
        earlier-year losses, foreign or unlisted shares, debt and other
        nonqualifying funds, derivatives, intraday or business trading, employee
        shares, buybacks, property, income from real-estate or infrastructure
        investment trusts, alternative investment funds or unit-linked insurance
        plans; another person's income taxed as yours; tax exemptions for
        reinvesting sale proceeds; or unresolved changes such as mergers and
        share splits.
      </p>
      <p>
        Enter eligible earlier-year losses in their separate section. After loss
        adjustment, any unused basic exemption reduces short-term gains first,
        then long-term gains. The annual long-term threshold applies afterward.
        The breakdown shows each adjustment.
      </p>
      <p>
        Long-term losses reduce only long-term gains. Short-term losses reduce
        short-term gains first, then remaining long-term gains. They cannot
        reduce salary, freelance income or bank interest. The plan shows the
        amounts used and any unused loss. A return filed by the applicable due
        date and determination of the loss are needed to use unused losses in
        later tax years, called carry-forward; a saved completion is not proof
        of either.
      </p>
      <p>
        The normal presumptive advance-tax date remains 15 March. Unexpected
        gains can require a separate payment-timing review, including the
        conditional 31 March provision. This plan does not calculate interest,
        promise relief or select your return form.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf">
        Official equity gains and losses rules, sections 108–109, 111, 121, 196
        and 198
      </ExternalLink>
    </HelpModal>
  )
}

// Copy reviewed 2026-09-10 against Income-tax Rules, 2026, rule 163,
// notified 2026-03-20 and effective 2026-04-01. This explains a declaration;
// it does not add a separate eligibility calculation.
export function AnnualReturnHelp() {
  return (
    <HelpModal
      topic="other income-tax filing conditions"
      title="When might I need to file even with no tax due?"
      description="For this tax year, check whether any of these conditions applies. Add amounts across your accounts or payments; the limits are annual totals."
    >
      <ul className="list-disc space-y-2 pl-5">
        <li>
          You deposited more than ₹1 crore across current accounts with banks or
          co-operative banks.
        </li>
        <li>
          You spent more than ₹2 lakh on foreign travel for yourself or anyone
          else. The rule excludes travel to neighbouring countries and notified
          pilgrimage destinations; confirm any exception before leaving it out.
        </li>
        <li>You spent more than ₹1 lakh on electricity.</li>
        <li>You deposited ₹50 lakh or more across savings bank accounts.</li>
      </ul>
      <p>
        Current and savings accounts are different bank account types. Use the
        type on your bank statement and total deposits, not the closing balance.
        The first three limits must be exceeded; exactly ₹50 lakh meets the
        savings-account condition.
      </p>
      <p>
        Holding foreign assets or having authority to sign on an overseas
        account can also require a return even with no income. This plan checks
        your earlier foreign-asset answers, income, freelance receipts and TDS
        and TCS separately. Choose Yes for another filing condition you know
        applies. Choose No only after checking; use Not sure if unresolved.
      </p>
      <ExternalLink href="https://www.incometaxindia.gov.in/documents/d/guest/en-notified-it-rules-2026-20-03-2026-pdf#page=130">
        Official filing conditions, rule 163, PDF
      </ExternalLink>
    </HelpModal>
  )
}
