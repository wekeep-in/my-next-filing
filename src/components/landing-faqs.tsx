import { Link } from 'react-router-dom'
import { ExternalLink } from '@/components/external-link'
import { formatDate } from '@/lib/format'
import { currentRules } from '@/rules'
import { taxYearDateRange } from '@/lib/tax-period'
import { TaxMethodHelp } from '@/routes/check/tax-method-help'
import { ResidenceHelp } from '@/routes/check/residence-help'
import { RentalIncomeHelp } from '@/routes/check/rental-income-fields'
import { ForeignAssetsHelp } from '@/routes/check/foreign-assets-fields'
import {
  AdditionalIncomeHelp,
  EquityGainsHelp,
  SalaryCoverageHelp,
} from '@/routes/check/other-income-help'

const openSourceUrl = 'https://github.com/wekeep-in/my-next-filing'

export function LandingFaqs() {
  return (
    <section className="landing-faqs" id="faqs" aria-labelledby="faqs-title">
      <h2 className="sr-only" id="faqs-title">
        Frequently asked questions
      </h2>
      <div className="faq-list">
        <article>
          <h3>What can My Next Filing help me with?</h3>
          <p>
            It estimates income tax on the freelance profit and other income you
            enter, checks whether Goods and Services Tax, or GST, registration
            may apply, and puts the filing and payment dates it can establish in
            order. GST is separate from income tax.
          </p>
          <p>
            It does not file or pay anything, send reminders, confirm government
            acceptance, or replace a tax professional.
          </p>
        </article>

        <article>
          <h3>What should I have ready?</h3>
          <p>
            This tax year runs from {taxYearDateRange}. Have your full-year
            work-income totals before fees and tax deductions, other income
            records, and details of tax already paid. If you have a job,
            investments, rental income or GST registration, keep those records
            nearby too. You will not need to upload anything.
          </p>
          <p>
            The first step checks whether your work and tax method fit this app.
            The form explains unfamiliar terms as you go. If a fact is not
            confirmed, choose Not sure instead of guessing. Some tax
            classifications still need your records or a tax adviser's help.
          </p>
        </article>

        <article>
          <h3>Can I browse resources without filling in the form?</h3>
          <p>
            Yes. <Link to="/resources">Browse all resources</Link> for official
            tax references and help portals. Search by topic or task without
            entering any answers. Fill in the form when you want an estimate and
            filing dates based on your situation.
          </p>
        </article>

        <article>
          <h3>What happens to my answers?</h3>
          <p>
            When you open the questionnaire, this tab automatically keeps your
            in-progress answers so you can resume your estimate or unsaved plan
            after a refresh. Closing the tab may remove this draft. If this
            browser cannot keep the draft, a warning explains that refreshing
            may lose your answers. You can still calculate in this tab.
          </p>
          <p>
            After a supported result, you can choose to save a workspace for
            later visits. This browser then keeps the answers needed to run your
            estimate again and the dates you mark actions complete. Your
            estimate is worked out again when you return, using your saved
            answers and the available tax rules. Saving a workspace is available
            only if you confirm that you are 18 or older.
          </p>
          <p>
            My Next Filing does not ask for or save your name, PAN, Aadhaar
            number, GSTIN, account numbers, client or platform names, invoices,
            documents, or notes.
          </p>
        </article>

        <article>
          <h3>Where does saved information stay?</h3>
          <p>
            Your in-progress answers stay in this tab's browser storage. Your
            saved workspace stays in this browser profile. My Next Filing does
            not upload either copy or include your answers in page addresses,
            titles, logs, external links or shared links.
          </p>
          <p>
            Other people using the same browser profile, and code running on
            this site, may be able to read browser storage. Do not save on a
            shared or public browser.
          </p>
          <p>
            There is no account, sync, backup, or way to recover deleted data.
            Private browsing, clearing site data, browser cleanup, or device
            failure may remove saved information. A browser or device backup may
            also retain a copy outside My Next Filing's control.
          </p>
        </article>

        <article>
          <h3>How do I stop saving and delete my data?</h3>
          <p>
            Choose <em>Start over</em> to remove in-progress answers from this
            tab and start blank. Your saved workspace and completion dates stay
            as they are. If you have entered answers, you will be asked to
            confirm first.
          </p>
          <p>
            On Your plan, choose <em>Delete saved data</em> to remove your saved
            answers and completion dates from this browser, then your
            in-progress answers from this tab. Other tabs may retain their own
            in-progress answers. If anything cannot be deleted or checked, a
            message explains what happened and lets you try again.
          </p>
          <p>
            This version of the app removes previously saved answers and
            completion dates that use the old workspace format. Those removed
            values cannot be restored, including by returning to an older
            version of the site.
          </p>
        </article>

        <article>
          <h3>What does this site send over the internet?</h3>
          <p>
            Cloudflare hosts and delivers the site, so ordinary requests include
            technical connection information. My Next Filing does not include
            your answers, amounts, estimate, or saved workspace in those
            requests.
          </p>
          <p>
            The site has no analytics, product tracking, or remote error
            reporting. It does not load third-party scripts from other sites.
          </p>
        </article>

        <article>
          <h3>Who runs My Next Filing?</h3>
          <p>
            <ExternalLink href="https://sarthakmishra.com/">
              Sarthak Mishra
            </ExternalLink>{' '}
            operates My Next Filing. For access, correction, deletion, security,
            or grievance questions, email{' '}
            <a href="mailto:sarthak@wekeep.in">sarthak@wekeep.in</a>
            {'. '}Do not include tax amounts or personal identifiers in your
            message.
          </p>
        </article>

        <article id="faq-tax-support">
          <h3>Can My Next Filing estimate my tax?</h3>
          <p>
            This app is for adults who freelance on their own, run one service
            business or profession from India, and use the new tax regime. Your
            confirmed tax residence must be resident and ordinarily resident in
            India. <ResidenceHelp />
          </p>
          <p>
            Your whole freelance practice must use one confirmed presumptive tax
            method. This uses a minimum share of work income as profit. Your job
            title alone does not decide the method. <TaxMethodHelp />
          </p>
          <p>
            Alongside freelancing, you can include certain Indian salary,
            employer contributions to the National Pension System, bank and
            post-office interest, interest on an income-tax refund,
            Indian-company dividends and Indian mutual-fund payouts. The form
            asks about the conditions for each income type.{' '}
            <SalaryCoverageHelp />{' '}
            <AdditionalIncomeHelp buttonText="About dividends and interest" />
          </p>
          <p>
            It also covers confirmed profits and losses from eligible Indian
            shares and equity mutual funds, including eligible unused losses
            from earlier returns. Taxable income must be no more than ₹1 crore.
            Extra tax on higher income, called surcharge, and any applicable
            relief are included within that limit.{' '}
            <EquityGainsHelp buttonText="About equity gains and losses" />
          </p>
          <p>
            Rent from one home in India used as a residence can be included when
            you own it alone or have a documented share and the tax amounts are
            confirmed. A rental loss is outside this app. <RentalIncomeHelp />
          </p>
          <p>
            Overseas assets and accounts can be included when they add no income
            or unresolved tax effects outside this app. They may require extra
            reporting in your return. <ForeignAssetsHelp />
          </p>
          <p>It stops without showing a personal estimate if you have:</p>
          <ul>
            <li>
              A company, non-resident status, tax based on actual profit from
              regular accounts, a required audit, taxable income above the
              supported limit, or another tax regime.
            </li>
            <li>
              Salary or house-property income outside the supported conditions,
              gifts, unsupported dividends or distributions, gains outside the
              domestic equity conditions, crypto, lottery or gaming,
              agricultural income, unrelated foreign income, or foreign-tax
              relief.
            </li>
            <li>
              Another business or profession, commission, brokerage, agency
              work, goods sales, or an unsupported client or platform
              arrangement.
            </li>
            <li>
              Unsupported deductions, losses outside the domestic equity
              conditions or tax credits, employee or deductor duties, or amounts
              above this app's limits.
            </li>
          </ul>
          <p>
            An unknown GST answer may leave GST guidance incomplete while your
            income-tax estimate remains available. The plan explains which part
            needs a separate check. If a fact also changes your income-tax
            treatment, the estimate stops.
          </p>
          <p>
            It also does not calculate late interest, fees, penalties, GST
            payable, credits or refunds, or choose a tax return form. For one
            continuously active normal GST registration, it can show monthly or
            quarterly return dates and monthly payment checks under the
            Quarterly Return Monthly Payment scheme, called QRMP. Confirmed
            service exporters can also receive an action to submit a Letter of
            Undertaking, called LUT, before exporting without upfront GST
            payment. Unknown quarters or LUT facts leave the other established
            dates available.
          </p>
        </article>

        <article>
          <h3>How is the estimate worked out?</h3>
          <p>
            Your estimate starts with the minimum profit under your confirmed
            tax method, or the higher profit you enter. It then:
          </p>
          <ol>
            <li>
              Adds supported salary after its standard deduction, taxable bank
              interest, and supported dividends, distributions and additional
              interest, plus supported rental income and domestic equity gains.
            </li>
            <li>
              Subtracts the supported employer NPS deduction, limited to
              ordinary income excluding equity gains, then rounds combined total
              income to the nearest ₹10.
            </li>
            <li>
              Applies the {currentRules.taxPeriod} new-regime rates for each
              income band, then any tax reduction, called a rebate, or relief
              for income just above its limit. Equity gains use their separate
              rates and thresholds. It then adds 4% Health and Education Cess.
            </li>
            <li>
              Subtracts income tax deducted by payers, called TDS, tax collected
              on transactions, called TCS, and advance tax you already paid,
              then rounds the final estimate to the nearest ₹10.
            </li>
          </ol>
          <p>
            Advance tax is income tax paid during the year. A payment action
            appears when the estimated annual tax after TDS and TCS is at least
            ₹10,000. GST registration is checked separately using the full value
            of supplies under your tax identity and the limit for your state,
            rather than freelance profit.
          </p>
        </article>

        <article>
          <h3>How should I use this estimate?</h3>
          <p>
            Use it as a starting point. It is based on the answers you provide
            and the rules this app supports. It is not tax, accounting, or legal
            advice and does not create a professional relationship.
          </p>
          <p>
            The rules and official sources were last checked on{' '}
            {formatDate(currentRules.verifiedOn)}.
          </p>
          <p>
            Rules, forms, portals, and deadline extensions can change, so review
            the linked official sources before you file or pay. Any linked
            tutorial is maintained by its publisher.
          </p>
        </article>

        <article>
          <h3>Can I see the source code?</h3>
          <p>
            Yes. The source code is available on{' '}
            <ExternalLink href={openSourceUrl}>GitHub</ExternalLink>.
          </p>
        </article>
      </div>
    </section>
  )
}
