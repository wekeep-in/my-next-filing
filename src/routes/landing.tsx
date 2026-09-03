import type { MouseEvent } from 'react'
import MuxPlayer from '@mux/mux-player-react/lazy'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import type { AppOutletContext } from '../app.tsx'
import { ExternalLink, formatDate } from '../app.tsx'
import { JourneySidebar, calculationStep } from '../journey-sidebar.tsx'
import { currentRules } from '../rules/index.ts'

const openSourceUrl = 'https://github.com/wekeep-in/my-next-filing'

export function LandingRoute() {
  const navigate = useNavigate()
  const { savedWorkspace } = useOutletContext<AppOutletContext>()
  const hasSaved =
    savedWorkspace.kind === 'ready' && Boolean(savedWorkspace.workspace.active)

  const navigateToCheckFromPointer = (
    event: MouseEvent<HTMLAnchorElement>,
    state: { readonly example?: true; readonly personal?: true },
  ) => {
    if (
      event.button !== 0 ||
      event.detail === 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return
    event.preventDefault()
    navigate('/check', { state: { ...state, animate: true } })
  }

  return (
    <section className="landing" aria-labelledby="landing-title">
      <header className="landing-hero">
        <div className="landing-title-row">
          <span className="period-pill">1 April 2026 to 31 March 2027</span>
          <h1 id="landing-title">My Next Filing</h1>
        </div>
        <p className="landing-intro">
          A local, best-effort tax and filing overview for supported solo
          freelancers in India.
        </p>
        <p className="landing-example">
          Here's{' '}
          <Link
            to="/check"
            state={{ example: true }}
            onClick={(event) =>
              navigateToCheckFromPointer(event, { example: true })
            }
          >
            an example
          </Link>
          .
        </p>
      </header>

      <JourneySidebar
        className="landing-sidebar"
        activeStep={0}
        backAction={null}
        action={
          <Link
            className="button button--primary landing-start"
            to={hasSaved ? '/plan' : '/check'}
            state={hasSaved ? undefined : { personal: true }}
            onClick={(event) => {
              if (!hasSaved)
                navigateToCheckFromPointer(event, { personal: true })
            }}
          >
            {hasSaved ? 'Continue' : 'Start now'}
          </Link>
        }
        disabledSteps={[2, 3, 4, 5, 6, 7, calculationStep]}
        onStepSelect={(step, animate) =>
          step === 0
            ? window.scrollTo(0, 0)
            : navigate('/check', {
                state: { personal: true, step: step - 1, animate },
              })
        }
      />

      <figure className="product-preview">
        <MuxPlayer
          aria-label="My Next Filing walkthrough"
          src="/video/my-next-filing.m3u8"
          poster="/video/my-next-filing-poster.jpg"
          placeholder="/video/my-next-filing-poster.jpg"
          playsInline
          preload="metadata"
          loading="viewport"
          streamType="on-demand"
          accentColor="var(--accent)"
          disableTracking
          noMutedPref
          noVolumePref
        >
          <track
            default
            kind="captions"
            label="English"
            src="/video/my-next-filing.en.vtt"
            srcLang="en"
          />
        </MuxPlayer>
      </figure>

      <section className="landing-faqs" id="faqs" aria-labelledby="faqs-title">
        <h2 className="visually-hidden" id="faqs-title">
          Frequently asked questions
        </h2>
        <div className="faq-list">
          <article>
            <h3>What does it do?</h3>
            <p>
              It estimates tax in this browser and orders supported deadlines.
              It does not file, pay, send reminders, verify government
              acceptance, or replace a tax professional.
            </p>
          </article>

          <article>
            <h3>Is my data saved?</h3>
            <p>
              Your answers and calculation stay only in this page's memory while
              you use it. If you explicitly choose to save a completed profile,
              this browser may keep the Profile facts needed to re-run the
              current Tax Year check and the completion dates you declare for
              supported Obligations. Saving is optional, current-browser only,
              and drafts and calculated results are never saved.
            </p>
            <p>
              It stores no name, PAN, Aadhaar number, GSTIN value, client or
              platform identity, account number, invoice, document, note,
              calculated result, Rule value, Deadline status, or tracking
              identifier.
            </p>
          </article>

          <article>
            <h3>Where does saved data stay?</h3>
            <p>
              Application code does not upload saved values or put them in URLs,
              page titles, logs, external links, or sharing. Scripts on this
              origin and other people using this browser profile may be able to
              access browser storage. Do not save on a shared or public browser.
            </p>
            <p>
              There is no account, sync, backup, or recovery. Browser clearing,
              private browsing, browser eviction, or device failure may remove
              the value. Saved data is treated as untrusted input and is
              revalidated and re-evaluated locally on restore.
            </p>
          </article>

          <article>
            <h3>How do I remove saved data?</h3>
            <p>
              Use <em>Stop saving</em> on Your plan to remove the saved
              workspace. Production static assets are hosted through Cloudflare.
              Normal requests may include technical connection metadata needed
              to deliver the site. The application sends no page measurements,
              product usage events, or error reports, and executes no
              third-party runtime code. For access, correction, deletion,
              incident, or grievance questions, contact{' '}
              <ExternalLink href="https://wekeep.in">WeKeep</ExternalLink> and
              do not include taxpayer amounts or identifiers in an email or
              link.
            </p>
          </article>

          <article>
            <h3>What's not supported?</h3>
            <p>
              This check supports only the declared resident-individual profile
              covered by this release. It stops for:
            </p>
            <ul>
              <li>
                Companies, non-residents, regular-books or audit cases, and
                unsupported tax regimes or income paths.
              </li>
              <li>
                Salary, house-property, dividend, gift, capital-gains, crypto,
                lottery, gaming, agricultural, or unrelated foreign-source
                income and foreign-tax relief.
              </li>
              <li>
                Another business or profession, unsupported client or platform
                arrangements, commission, brokerage, goods sales, deductions,
                losses, disputed credits, or employee and deductor duties.
              </li>
              <li>
                Audit or surcharge cases, compulsory GST-registration facts, and
                any other unsupported fact or amount above the supported limit.
              </li>
            </ul>
            <p>
              It does not calculate late interest, fees, penalties, GST returns,
              or return forms.
            </p>
          </article>

          <article>
            <h3>How does the estimate work?</h3>
            <p>
              Professional income uses the applicable presumptive method for the
              selected path and the higher declared profit when entered. The
              application adds taxable bank or deposit interest, rounds total
              income to the nearest ₹10, and applies the current Tax Year
              2026-27 new-regime slabs, relief, cess, and Indian credits. Then
              it:
            </p>
            <ol>
              <li>Applies rebate or marginal relief when eligible.</li>
              <li>Adds 4% Health and Education Cess.</li>
              <li>Subtracts actual TDS, TCS, and advance tax already paid.</li>
              <li>
                Rounds the estimated payable amount or refund to the nearest
                ₹10.
              </li>
            </ol>
            <p>
              Advance tax appears when liability after TDS and TCS reaches
              ₹10,000. GST status uses declared aggregate turnover and the state
              threshold, not income-tax fields.
            </p>
          </article>

          <article>
            <h3>How should I use this estimate?</h3>
            <p>
              This is general information and a best-effort estimate for the
              declared profile and tax period. It is not tax, accounting, or
              legal advice and creates no professional relationship.
            </p>
            <p>
              The local Rules and statutory Sources used by this check were last
              reviewed on {formatDate(currentRules.verifiedOn)}.
            </p>
            <p>
              Check your facts and decide what to file or pay. Rules, forms,
              portals, and extensions can change. Tutorial publishers control
              their pages.
            </p>
          </article>

          <article>
            <h3>Is the code open source?</h3>
            <p>
              Yes. The code is{' '}
              <a href={openSourceUrl} target="_blank" rel="noopener noreferrer">
                open source
              </a>{' '}
              and available on GitHub.
            </p>
          </article>
        </div>
      </section>
    </section>
  )
}
