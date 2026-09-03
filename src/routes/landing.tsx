import { useState } from 'react'
import type { MouseEvent } from 'react'
import MuxPlayer from '@mux/mux-player-react/lazy'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import type { AppOutletContext } from '../app.tsx'
import { ExternalLink, formatDate } from '../app.tsx'
import { JourneySidebar, calculationStep } from '../journey-sidebar.tsx'
import { currentRules } from '../rules/index.ts'

const openSourceUrl = 'https://github.com/wekeep-in/my-next-filing'
const sharePayload = {
  title: 'My Next Filing',
  text: 'A clear, best-effort tax and filing overview for supported solo freelancers in India.',
  url: 'https://mynextfiling.wekeep.in/',
} as const

function ShareLink() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  const share = async () => {
    setStatus('idle')
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(sharePayload)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError'))
          setStatus('failed')
      }
      return
    }
    if (!navigator.clipboard) {
      setStatus('failed')
      return
    }
    try {
      await navigator.clipboard.writeText(sharePayload.url)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <>
      <button className="text-button" type="button" onClick={share}>
        share
      </button>{' '}
      My Next Filing
      {status === 'copied' && (
        <span className="share-result" role="status">
          {' '}
          Link copied
        </span>
      )}
      {status === 'failed' && (
        <span className="field-error" role="alert">
          {' '}
          Couldn't share the link. Copy it from the address bar instead
        </span>
      )}
    </>
  )
}

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
          <span className="period-pill">Tax year 2026-27</span>
          <h1 id="landing-title">My Next Filing</h1>
        </div>
        <p className="landing-intro">
          Estimate your taxes and see the next filing dates. This app runs in
          your browser and is made for Indian freelancers.
        </p>
        <p className="landing-example">
          Try a{' '}
          <Link
            to="/check"
            state={{ example: true }}
            onClick={(event) =>
              navigateToCheckFromPointer(event, { example: true })
            }
          >
            fictional example
          </Link>
          {' or '}
          <ShareLink />.
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
            {hasSaved ? 'Continue your saved workspace' : 'Start your estimate'}
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
            <h3>What can My Next Filing help me with?</h3>
            <p>
              It gives you a best-effort income-tax estimate, checks whether GST
              registration may apply, and puts the supported filing and payment
              dates in order.
            </p>
            <p>
              It does not file or pay anything, send reminders, confirm
              government acceptance, or replace a tax professional.
            </p>
          </article>

          <article>
            <h3>What happens to my answers?</h3>
            <p>
              While you answer the questions, your answers and estimate stay in
              this tab. If you close or refresh it, they are lost unless you
              choose to save after getting a supported result.
            </p>
            <p>
              If you save, this browser keeps the answers needed to run the run
              your estimate again and the dates you mark actions complete. It
              does not save drafts, examples, calculated results, or tax rules.
              Saving is available only if you confirm that you are 18 or older.
            </p>
            <p>
              My Next Filing does not ask for or save your name, PAN, Aadhaar
              number, GSTIN, account numbers, client or platform names,
              invoices, documents, or notes.
            </p>
          </article>

          <article>
            <h3>Where does saved information stay?</h3>
            <p>
              Your saved workspace stays in this browser profile. My Next Filing
              does not upload it or put it in URLs, page titles, logs, external
              links, or sharing.
            </p>
            <p>
              Other people using the same browser profile, and code running on
              this site, may be able to read browser storage. Do not save on a
              shared or public browser.
            </p>
            <p>
              There is no account, sync, backup, or recovery. Private browsing,
              clearing site data, browser cleanup, or device failure may remove
              saved information. A browser or device backup may also retain a
              copy outside My Next Filing's control.
            </p>
          </article>

          <article>
            <h3>How do I stop saving and delete my data?</h3>
            <p>
              On the last step, Your plan, choose <em>Stop saving</em>. This
              removes My Next Filing's saved profile and completion dates from
              this browser. You can continue without saving.
            </p>
          </article>

          <article>
            <h3>What does this site send over the internet?</h3>
            <p>
              Cloudflare hosts and delivers the site, so ordinary requests
              include technical connection information. My Next Filing does not
              include your answers, amounts, estimate, or saved workspace in
              those requests.
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
              operates My Next Filing. For access, correction, deletion,
              security, or grievance questions, email{' '}
              <a href="mailto:sarthak@wekeep.in">sarthak@wekeep.in</a>. Do not
              include tax amounts or personal identifiers in your message.
            </p>
          </article>

          <article id="faq-tax-support">
            <h3>Can My Next Filing estimate my tax?</h3>
            <p>
              This version is for an adult individual who is resident and
              ordinarily resident in India, uses the new tax regime, and runs
              one solo service practice.
            </p>
            <p>It stops without showing a personal estimate if you have:</p>
            <ul>
              <li>
                A company, non-resident status, a regular-books case, an audit,
                a surcharge, or another tax regime.
              </li>
              <li>
                Salary, house-property income, dividends, gifts, capital gains,
                crypto, lottery or gaming, agricultural income, unrelated
                foreign income, or foreign-tax relief.
              </li>
              <li>
                Another business or profession, commission, brokerage, agency
                work, goods sales, or an unsupported client or platform
                arrangement.
              </li>
              <li>
                Unsupported deductions, losses or tax credits, employee or
                deductor duties, compulsory GST-registration facts, or amounts
                above this version's limits.
              </li>
            </ul>
            <p>
              It also does not calculate late interest, fees, penalties, GST
              returns, or choose a tax return form.
            </p>
          </article>

          <article>
            <h3>How is the estimate worked out?</h3>
            <p>
              Your estimate starts with the presumptive tax method you confirm
              and uses a higher declared profit if you enter one. It then:
            </p>
            <ol>
              <li>Adds taxable bank or deposit interest.</li>
              <li>Rounds total income to the nearest ₹10.</li>
              <li>
                Applies the Tax Year 2026-27 new-regime slabs, rebate or
                marginal relief, and 4% Health and Education Cess.
              </li>
              <li>
                Subtracts TDS, TCS, and advance tax already paid, then rounds
                the final estimate to the nearest ₹10.
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
              Rules, forms, portals, and deadline extensions can change, so
              review the linked official sources before you file or pay. Any
              linked tutorial is maintained by its publisher.
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
    </section>
  )
}
