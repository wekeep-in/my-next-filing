import type { MouseEvent } from 'react'
import MuxPlayer from '@mux/mux-player-react/lazy'
import { Link, useNavigate } from 'react-router-dom'
import { JourneySidebar, calculationStep } from '../journey-sidebar'

const openSourceUrl = 'https://github.com/wekeep-in/my-next-filing'

export function LandingRoute() {
  const navigate = useNavigate()

  const navigateToCheckFromPointer = (
    event: MouseEvent<HTMLAnchorElement>,
    state: { readonly example: true } | { readonly personal: true },
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
          A simple tax estimate and filing calendar for independent IT
          consultants in India.
        </p>
        <p className="landing-example">
          Here's{' '}
          <Link
            to="/check"
            state={{ example: true }}
            aria-label="Try an example"
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
            to="/check"
            state={{ personal: true }}
            onClick={(event) =>
              navigateToCheckFromPointer(event, { personal: true })
            }
          >
            Start now
          </Link>
        }
        disabledSteps={[2, 3, 4, 5, calculationStep]}
        onStepSelect={(step, animate) => {
          if (step === 0) window.scrollTo(0, 0)
          else
            navigate('/check', {
              state: { personal: true, step: step - 1, animate },
            })
        }}
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
              Estimates tax in this browser and orders supported deadlines. It
              does not file, pay, send reminders, track completion, or replace a
              tax professional.
            </p>
          </article>

          <article>
            <h3>Is the code open source?</h3>
            <p>
              Yes. The code is{' '}
              <a href={openSourceUrl} target="_blank" rel="noreferrer">
                open source
              </a>{' '}
              and available on GitHub.
            </p>
          </article>

          <article>
            <h3>Is my data saved?</h3>
            <p>
              No. Your answers and calculation stay only in this page's memory
              while you use it. Refreshing or closing the page clears them. The
              application does not write questionnaire answers or calculations
              to browser storage or send them to a server.
            </p>
            <p>
              Production uses Google Analytics for page analytics. Google
              receives fixed route visits and standard Analytics data about the
              browser, device, session, and approximate location. Analytics
              stores a pseudonymous client ID in first-party cookies. Local and
              preview deployments do not load Analytics.
            </p>
            <p>
              Analytics never receives questionnaire answers, amounts, tax
              results, errors, names, or profile values. Google Signals and ad
              personalization are disabled. Analytics cannot affect the check or
              its result.
            </p>
          </article>

          <article>
            <h3>What's not supported?</h3>
            <p>
              This check supports only resident individuals using the new tax
              regime, presumptive IT or software consulting, direct Indian
              clients, and no GSTIN. You must confirm these limits before the
              calculation. It stops for:
            </p>
            <ul>
              <li>
                Income from salary, house property, dividends, gifts, capital
                gains, crypto, lottery, gaming, agriculture, or foreign sources
                and relief.
              </li>
              <li>
                Another business or profession, foreign clients, platform,
                marketplace or agency income, commission, brokerage, or goods
                sales.
              </li>
              <li>
                Unlisted deductions, losses, or credits; disputed TDS or TCS;
                employee or deductor duties; an audit requirement; or a
                compulsory GST-registration fact.
              </li>
              <li>
                Any other unsupported fact, professional receipts above the
                supported limit, or total income above ₹50 lakh.
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
              Professional income is the higher of 50% of gross receipts or your
              higher expected profit. We add taxable bank or deposit interest,
              round total income to the nearest ₹10, and apply the Tax Year
              2026-27 new-regime slabs. Then we:
            </p>
            <ol>
              <li>
                Apply the resident-individual rebate or marginal relief when
                eligible.
              </li>
              <li>Add 4% Health and Education Cess.</li>
              <li>Subtract actual TDS, TCS, and advance tax already paid.</li>
              <li>
                Round the estimated payable amount or refund to the nearest ₹10.
              </li>
            </ol>
            <p>
              Advance tax appears when liability after TDS and TCS reaches
              ₹10,000. GST status uses your declared aggregate turnover and
              state threshold, not income-tax fields.
            </p>
          </article>

          <article>
            <h3>How should I use this estimate?</h3>
            <p>
              This is general information and a best-effort estimate for this
              profile and tax period. It is not tax, accounting, or legal advice
              and creates no professional relationship.
            </p>
            <p>
              Check your facts and decide what to file or pay. Rules, forms,
              portals, and extensions can change. Tutorial publishers control
              their pages. To the extent law permits, the author and
              contributors provide no warranties.
            </p>
          </article>
        </div>
      </section>
    </section>
  )
}
