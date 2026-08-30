import Confetti from 'react-confetti-boom'
import {
  Link,
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { getCurrentCheck } from '../current-check'
import { evaluate } from '../evaluation'
import type {
  EvaluationResult,
  GstStatus,
  Obligation,
  TaxEstimate,
} from '../evaluation'
import { ExternalLink, formatDate, formatMoney } from '../app'
import {
  JourneySidebar,
  calculationStep,
  questionnaireSteps,
} from '../journey-sidebar'
import { currentRules, sourceRegistry, validateRuleDataset } from '../rules'

type PlanLoaderData = {
  readonly evaluation: EvaluationResult
  readonly example: boolean
}

const confettiColors = ['#008a30', '#10283c', '#155eef', '#fbbf24']

export function planLoader(): PlanLoaderData | Response {
  const current = getCurrentCheck()
  if (!current?.complete) return redirect('/check')
  const validation = validateRuleDataset(currentRules)
  const evaluation = validation.valid
    ? evaluate(current.profile, new Date(), validation.data)
    : evaluate(current.profile, new Date(), currentRules)
  return {
    evaluation,
    example: current.example,
  }
}

function SourceReference({ id }: { readonly id: string }) {
  const source = sourceRegistry.find((candidate) => candidate.id === id)
  if (!source || source.kind !== 'statutory') return null
  return (
    <p className="source-reference">
      <strong>Source</strong>{' '}
      <ExternalLink href={source.url}>{source.title}</ExternalLink>
      <span className="source-meta">
        {source.publisher}. Reviewed {formatDate(source.reviewDate)}.
      </span>
    </p>
  )
}

function StatusPill({ status }: { readonly status: Obligation['status'] }) {
  const labels = {
    upcoming: 'Upcoming',
    'due-today': 'Due today',
    'deadline-passed': 'Deadline passed',
  }
  return <span className={`status status--${status}`}>● {labels[status]}</span>
}

function GstCard({ gst }: { readonly gst: GstStatus }) {
  let message = gst.message
  if (gst.kind === 'below') {
    message = `Your declared GST aggregate turnover is ${formatMoney(gst.difference)} below the ${formatMoney(gst.threshold)} starting threshold for ${gst.state}. Some facts require earlier registration.`
  }
  if (gst.kind === 'at') {
    message = `Your declared GST aggregate turnover is at the ${formatMoney(gst.threshold)} starting threshold. Turnover-based registration starts after you exceed it. Review before more turnover.`
  }
  if (gst.kind === 'above') {
    message = `Your declared GST aggregate turnover is ${formatMoney(gst.difference)} above the ${formatMoney(gst.threshold)} starting threshold. Review GST registration now. This version does not calculate GST returns.`
  }
  return (
    <article className="result-card gst-card">
      <h2>
        {gst.kind === 'below'
          ? 'Below the GST starting threshold'
          : gst.kind === 'at'
            ? 'At the GST starting threshold'
            : 'Above the GST starting threshold'}
      </h2>
      <p>{message}</p>
      {gst.coverageIncomplete && (
        <p className="coverage-note">
          ◆ GST coverage is incomplete; the income-tax estimate remains
          available.
        </p>
      )}
      <SourceReference id={gst.statutorySourceId} />
    </article>
  )
}

function TaxSummary({ tax }: { readonly tax: TaxEstimate }) {
  const label =
    tax.outcome === 'refund'
      ? 'Estimated refund'
      : tax.outcome === 'settled'
        ? 'Estimated balance'
        : 'Estimated amount remaining'
  return (
    <article className="result-card tax-summary">
      <p className="card-label">Income-tax estimate</p>
      <h2>{label}</h2>
      <p className="money-result">{formatMoney(tax.finalAmount)}</p>
      <p>
        {tax.outcome === 'refund'
          ? 'The filed return controls the final refund.'
          : 'This is an estimate, not a government demand.'}
      </p>
      <details>
        <summary>See calculation detail</summary>
        <dl className="calculation-list">
          <div>
            <dt>Minimum presumptive profit</dt>
            <dd>{formatMoney(tax.minimumPresumptiveProfit)}</dd>
          </div>
          <div>
            <dt>Professional income used</dt>
            <dd>{formatMoney(tax.professionalIncome)}</dd>
          </div>
          <div>
            <dt>Taxable bank interest</dt>
            <dd>{formatMoney(tax.taxableBankInterest)}</dd>
          </div>
          <div>
            <dt>Rounded total income</dt>
            <dd>{formatMoney(tax.roundedTotalIncome)}</dd>
          </div>
          <div>
            <dt>Slab tax</dt>
            <dd>{formatMoney(tax.slabTax)}</dd>
          </div>
          <div>
            <dt>Rebate</dt>
            <dd>−{formatMoney(tax.rebate)}</dd>
          </div>
          <div>
            <dt>Marginal relief</dt>
            <dd>−{formatMoney(tax.marginalRelief)}</dd>
          </div>
          <div>
            <dt>Health and Education Cess</dt>
            <dd>{formatMoney(tax.cess)}</dd>
          </div>
          <div>
            <dt>TDS credit</dt>
            <dd>−{formatMoney(tax.tds)}</dd>
          </div>
          <div>
            <dt>TCS credit</dt>
            <dd>−{formatMoney(tax.tcs)}</dd>
          </div>
          <div>
            <dt>Advance tax already paid</dt>
            <dd>−{formatMoney(tax.advanceTaxPaid)}</dd>
          </div>
        </dl>
      </details>
      <SourceReference id="budget-faq-2026" />
      <SourceReference id="section-156" />
    </article>
  )
}

function Agenda({
  obligations,
}: {
  readonly obligations: readonly Obligation[]
}) {
  const months = new Map<string, Obligation[]>()
  for (const obligation of obligations) {
    const key = new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).format(new Date(`${obligation.dueDate}T00:00:00+05:30`))
    months.set(key, [...(months.get(key) ?? []), obligation])
  }
  return (
    <section className="agenda" aria-labelledby="agenda-title">
      <h2 id="agenda-title">Your agenda</h2>
      {[...months.entries()].map(([month, items]) => (
        <div className="agenda-month" key={month}>
          <h3>{month}</h3>
          {items.map((obligation) => (
            <article className="agenda-item" key={obligation.id}>
              <div className="agenda-date">
                <strong>
                  {new Intl.DateTimeFormat('en-IN', {
                    day: 'numeric',
                    timeZone: 'Asia/Kolkata',
                  }).format(new Date(`${obligation.dueDate}T00:00:00+05:30`))}
                </strong>
                <span>
                  {new Intl.DateTimeFormat('en-IN', {
                    month: 'short',
                    timeZone: 'Asia/Kolkata',
                  }).format(new Date(`${obligation.dueDate}T00:00:00+05:30`))}
                </span>
              </div>
              <div>
                <StatusPill status={obligation.status} />
                <h4>{obligation.title}</h4>
                <p>{obligation.reasons[0]}</p>
                {obligation.operativeDueDate && (
                  <>
                    <p>
                      Normal date: {formatDate(obligation.normalDueDate)}.
                      Operative date: {formatDate(obligation.operativeDueDate)}.
                    </p>
                    {obligation.extensionSourceId && (
                      <SourceReference id={obligation.extensionSourceId} />
                    )}
                  </>
                )}
                {obligation.status === 'deadline-passed' && (
                  <p>
                    This deadline has passed. The application does not know
                    whether you completed this obligation.
                  </p>
                )}
                <details className="consequence">
                  <summary>If you miss this date</summary>
                  <p>{obligation.consequence}</p>
                </details>
                <SourceReference id={obligation.statutorySourceId} />
              </div>
            </article>
          ))}
        </div>
      ))}
    </section>
  )
}

function SupportedPlan({
  result,
}: {
  readonly result: Extract<EvaluationResult, { kind: 'supported' }>
}) {
  const next = result.nextObligation
  return (
    <>
      <section
        className="next-filing result-card"
        aria-labelledby="next-filing-title"
      >
        <p className="card-label">Your next filing</p>
        {next ? (
          <>
            <h1 id="next-filing-title">{next.title}</h1>
            <p className="deadline-date">{formatDate(next.dueDate)}</p>
            <p>{next.reasons[0]}</p>
            {typeof next.amountDue === 'number' && (
              <p className="amount-due">
                Estimated amount remaining: {formatMoney(next.amountDue)}
              </p>
            )}
            {next.status === 'deadline-passed' && (
              <p>
                This deadline has passed. The application does not know whether
                you completed this obligation.
              </p>
            )}
            {next.operativeDueDate && next.extensionSourceId && (
              <SourceReference id={next.extensionSourceId} />
            )}
            <SourceReference id={next.statutorySourceId} />
          </>
        ) : (
          <>
            <h1 id="next-filing-title">No filing is indicated</h1>
            <p>{result.noAdvanceTaxMessage}</p>
            <p>{result.annualReturn.message}</p>
            <p>
              If you need to file, the normal date for this non-audit
              professional profile is{' '}
              {formatDate(result.annualReturn.normalDueDate)}.
            </p>
            {result.annualReturn.operativeDueDate && (
              <p>
                A verified extension changes the operative date to{' '}
                {formatDate(result.annualReturn.operativeDueDate)}.
              </p>
            )}
            {result.annualReturn.extensionSourceId && (
              <SourceReference id={result.annualReturn.extensionSourceId} />
            )}
            <SourceReference id="section-404" />
            <SourceReference id={result.annualReturn.statutorySourceId} />
          </>
        )}
      </section>
      <div className="result-grid">
        <TaxSummary tax={result.tax} />
        <GstCard gst={result.gst} />
      </div>
      {!result.advanceTaxApplies && next && (
        <p className="notice">{result.noAdvanceTaxMessage}</p>
      )}
      {result.annualReturn.message && next && (
        <div className="notice return-note">
          <p>{result.annualReturn.message}</p>
          <p>
            If you need to file, the normal date for this non-audit professional
            profile is {formatDate(result.annualReturn.normalDueDate)}.
          </p>
          {result.annualReturn.operativeDueDate && (
            <p>
              A verified extension changes the operative date to{' '}
              {formatDate(result.annualReturn.operativeDueDate)}.
            </p>
          )}
          {result.annualReturn.extensionSourceId && (
            <SourceReference id={result.annualReturn.extensionSourceId} />
          )}
          <SourceReference id={result.annualReturn.statutorySourceId} />
        </div>
      )}
      {result.obligations.length > 0 && (
        <Agenda obligations={result.obligations} />
      )}
      <details className="assumptions result-card">
        <summary>Assumptions used</summary>
        <ul>
          {result.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </details>
      <details className="assumptions result-card">
        <summary>Statutory sources used</summary>
        {result.statutorySourceIds.map((id) => (
          <SourceReference id={id} key={id} />
        ))}
      </details>
    </>
  )
}

function UnsupportedPlan({
  result,
}: {
  readonly result: Extract<EvaluationResult, { kind: 'unsupported' }>
}) {
  return (
    <section className="stop-state" aria-labelledby="unsupported-title">
      <p className="period">Profile outside this version</p>
      <h1 id="unsupported-title">
        This version cannot calculate a reliable plan for this answer.
      </h1>
      <p>
        Change the answer if it was accidental. Otherwise, use an official
        source to continue outside this application.
      </p>
      <ul className="fact-list">
        {result.facts.map((fact) => (
          <li key={`${fact.label}-${fact.reason}`}>
            <strong>{fact.label}.</strong> {fact.reason}
          </li>
        ))}
      </ul>
      <SourceReference
        id={result.officialSourceIds[0] ?? 'income-tax-act-2026'}
      />
    </section>
  )
}

function StaleRulesPlan({
  result,
}: {
  readonly result: Extract<EvaluationResult, { kind: 'stale-rules' }>
}) {
  return (
    <section className="stop-state" aria-labelledby="stale-title">
      <p className="period">Rules need review</p>
      <h1 id="stale-title">
        We cannot calculate a current result. The rules for this period need a
        new review.
      </h1>
      {result.expiresOn && (
        <p>The local rule dataset expired on {formatDate(result.expiresOn)}.</p>
      )}
      <p className="notice notice--warning">
        Calculation is disabled until the rule dataset is valid and current.
      </p>
      <button className="button button--primary" type="button" disabled>
        Calculation disabled
      </button>
      {result.officialSourceIds.slice(0, 2).map((id) => (
        <SourceReference key={id} id={id} />
      ))}
    </section>
  )
}

export function PlanRoute() {
  const { evaluation, example } = useLoaderData() as PlanLoaderData
  const location = useLocation()
  const navigate = useNavigate()
  const routeState = location.state as {
    readonly animate?: boolean
    readonly confettiOrigin?: { readonly x: number; readonly y: number }
  } | null
  const confettiOrigin = routeState?.confettiOrigin
  const celebrate =
    evaluation.kind === 'supported' &&
    Boolean(confettiOrigin) &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const backStep =
    evaluation.kind === 'unsupported'
      ? evaluation.facts.some(
          (fact) => fact.label === 'Supported profile confirmation',
        )
        ? questionnaireSteps.length - 1
        : 0
      : questionnaireSteps.length - 1

  const selectJourneyStep = (journeyStep: number, animate: boolean) => {
    if (journeyStep === 0) navigate('/', { state: { animate } })
    else if (journeyStep <= questionnaireSteps.length)
      navigate('/check', { state: { step: journeyStep - 1, animate } })
  }

  return (
    <section className="plan journey-layout" aria-label="Calculation result">
      {celebrate && (
        <Confetti
          colors={confettiColors}
          opacityDeltaMultiplier={2}
          particleCount={45}
          shapeSize={8}
          spreadDeg={60}
          style={{ position: 'fixed', zIndex: 3 }}
          x={confettiOrigin?.x}
          y={confettiOrigin?.y}
        />
      )}
      {example && (
        <p className="notice notice--top notice--example">
          These are fictional amounts. Replace them with your own answers if you
          use the personal check.
        </p>
      )}
      <div
        className={`plan-main${routeState?.animate ? ' journey-view--enter' : ''}`}
      >
        {evaluation.kind === 'supported' && (
          <SupportedPlan result={evaluation} />
        )}
        {evaluation.kind === 'unsupported' && (
          <UnsupportedPlan result={evaluation} />
        )}
        {evaluation.kind === 'stale-rules' && (
          <StaleRulesPlan result={evaluation} />
        )}
      </div>
      <JourneySidebar
        activeStep={calculationStep}
        backAction={
          <Link
            className="button button--secondary"
            to="/check"
            state={{ step: backStep }}
          >
            Back
          </Link>
        }
        action={
          <Link
            className="button button--primary"
            to="/check"
            state={{ personal: true }}
          >
            Start over
          </Link>
        }
        onStepSelect={selectJourneyStep}
      />
    </section>
  )
}
