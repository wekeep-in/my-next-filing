import { Link } from 'react-router-dom'
import { ExternalLink } from '@/components/external-link'
import { formatDate } from '@/lib/format'
import { currentRules } from '@/rules'
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
            It gives you a best-effort income-tax estimate, checks whether GST
            registration may apply, and puts the supported filing and payment
            dates in order.
          </p>
          <p>
            It does not file or pay anything, send reminders, confirm government
            acceptance, or replace a tax professional.
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
            When you open the questionnaire, this tab automatically keeps a
            recovery draft of your answers. You can refresh and continue your
            estimate or unsaved plan. Closing the tab may remove this draft. If
            this browser cannot keep the draft, a warning explains that
            refreshing may lose your answers. You can still calculate in this
            tab.
          </p>
          <p>
            After a supported result, you can choose to save a workspace for
            later visits. This browser then keeps the answers needed to run your
            estimate again and the dates you mark actions complete. It does not
            put drafts, examples, calculated results, or tax rules in the saved
            workspace. Saving a workspace is available only if you confirm that
            you are 18 or older.
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
            not upload either copy or put your answers in URLs, page titles,
            logs, external links, or sharing.
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
            in-progress answers. A partial or unverified deletion explains what
            remains or could not be checked and gives you a retry action.
          </p>
          <p>
            This version removes previously saved answers and completion dates
            that use the old workspace format. Those removed values cannot be
            restored, including by returning to an older version of the site.
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
            This version is for an adult individual who is resident and
            ordinarily resident in India, uses the new tax regime, and runs one
            solo service practice. It can also include supported domestic
            salary, with one standard deduction of up to ₹75,000 across all
            employers, and supported employer NPS contributions.{' '}
            <SalaryCoverageHelp />
          </p>
          <p>
            It can also include confirmed domestic equity gains and current-year
            losses, ordinary Indian-company dividends, taxable Indian
            mutual-fund distributions, taxable post-office interest and
            income-tax refund interest when your records confirm the amounts.{' '}
            <AdditionalIncomeHelp buttonText="About dividends and interest" />{' '}
            <EquityGainsHelp buttonText="About equity gains and losses" />
          </p>
          <p>It stops without showing a personal estimate if you have:</p>
          <ul>
            <li>
              A company, non-resident status, a regular-books case, an audit, a
              surcharge, or another tax regime.
            </li>
            <li>
              Salary this version cannot cover, house-property income, gifts,
              unsupported dividends or distributions, gains outside the domestic
              equity conditions, crypto, lottery or gaming, agricultural income,
              unrelated foreign income, or foreign-tax relief.
            </li>
            <li>
              Another business or profession, commission, brokerage, agency
              work, goods sales, or an unsupported client or platform
              arrangement.
            </li>
            <li>
              Unsupported deductions, losses outside the domestic equity
              conditions or tax credits, employee or deductor duties, or amounts
              above this version's limits.
            </li>
          </ul>
          <p>
            Some GST facts affect only the GST part of your plan. For example,
            another reason for compulsory registration or an unknown filing
            frequency can leave GST guidance incomplete while your income-tax
            estimate remains available. If a fact also changes your income-tax
            treatment, the estimate stops.
          </p>
          <p>
            It also does not calculate late interest, fees, penalties, GST
            payable, credits or refunds, or choose a tax return form. For one
            continuously active normal GST registration, it can show monthly or
            QRMP return dates and conditional payment reviews. Confirmed service
            exporters can also receive a before-export LUT action. Unknown
            quarters or LUT facts leave the other established dates available.
          </p>
        </article>

        <article>
          <h3>How is the estimate worked out?</h3>
          <p>
            Your estimate starts with the presumptive tax method you confirm and
            uses a higher declared profit if you enter one. It then:
          </p>
          <ol>
            <li>
              Adds supported salary after its standard deduction, taxable bank
              interest, and supported dividends, distributions and additional
              interest, plus supported domestic equity gains.
            </li>
            <li>
              Subtracts the supported employer NPS deduction, limited to
              ordinary income excluding equity gains, then rounds combined total
              income to the nearest ₹10.
            </li>
            <li>
              Applies the {currentRules.taxPeriod} new-regime slabs, rebate or
              marginal relief to ordinary-income tax. Equity gains use their
              separate rates and thresholds. It then adds 4% Health and
              Education Cess.
            </li>
            <li>
              Subtracts TDS, TCS, and advance tax already paid, then rounds the
              final estimate to the nearest ₹10.
            </li>
          </ol>
          <p>
            It shows advance tax when the amount left after TDS and TCS is at
            least ₹10,000. The GST result uses your GST aggregate turnover and
            state threshold, not your income-tax receipts.
          </p>
        </article>

        <article>
          <h3>How should I use this estimate?</h3>
          <p>
            Use it as a starting point. It is based on the answers you provide
            and the rules this version supports. It is not tax, accounting, or
            legal advice and does not create a professional relationship.
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
