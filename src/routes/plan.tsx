import Confetti from 'react-confetti-boom'
import { useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useOutletContext,
} from 'react-router-dom'
import type { AppOutletContext } from '../app.tsx'
import { ExternalLink, formatDate, formatMoney } from '../app.tsx'
import {
  clearCurrentCheck,
  getCurrentCheck,
  markSaveDismissed,
  setCurrentCheck,
} from '../current-check.ts'
import { evaluate, parseProfile } from '../evaluation/index.ts'
import { DatePicker } from '../form-controls.tsx'
import type {
  Coverage,
  Obligation,
  Profile,
  ProfileGroup,
  SupportedResult,
  TaxEstimate,
} from '../evaluation/index.ts'
import {
  JourneySidebar,
  calculationStep,
  questionnaireSteps,
} from '../journey-sidebar.tsx'
import { currentRules, sourceRegistry } from '../rules/index.ts'
import type { DateOnly } from '../rules/index.ts'
import {
  deriveWorkspaceView,
  deleteSavedWorkspace,
  saveSavedWorkspace,
} from '../workspace/index.ts'
import type {
  CompletionRecord,
  LoadSavedWorkspaceResult,
  SavedWorkspaceDraft,
  WorkspaceView,
} from '../workspace/index.ts'

const confettiColors = ['#008a30', '#10283c', '#155eef', '#fbbf24']

function todayInIndia(): DateOnly {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}` as DateOnly
}

function formatDeadline(date: DateOnly) {
  return `On ${formatDate(date)}`
}

function SourceReferences({ ids }: { readonly ids: readonly string[] }) {
  return (
    <div className="source-list">
      {ids.map((id) => {
        const source = sourceRegistry.find((candidate) => candidate.id === id)
        if (!source) return null
        return (
          <p className="source-reference" key={id}>
            <strong>Source</strong>{' '}
            <ExternalLink href={source.url}>{source.title}</ExternalLink>
          </p>
        )
      })}
    </div>
  )
}

function StatusPill({
  status,
}: {
  readonly status: Obligation['deadlineStatus']
}) {
  const labels = {
    upcoming: 'Upcoming',
    'due-today': 'Due today',
    'deadline-passed': 'Deadline passed',
  } as const
  return <span className={`status status--${status}`}>{labels[status]}</span>
}

function TaxSummary({ tax }: { readonly tax: TaxEstimate }) {
  return (
    <article className="result-card tax-summary">
      <p className="card-kicker">Income-tax estimate</p>
      <h2>{formatMoney(tax.finalAmount)}</h2>
      <p>This is a best-effort estimate, not a government demand.</p>
      <details>
        <summary>See calculation detail</summary>
        <dl className="calculation-list">
          <div>
            <dt>Path</dt>
            <dd>
              {tax.path === 'specified-profession'
                ? 'Specified profession'
                : 'Eligible business'}
            </dd>
          </div>
          <div>
            <dt>Gross receipts</dt>
            <dd>{formatMoney(tax.presumptive.grossReceipts)}</dd>
          </div>
          {tax.presumptive.qualifyingReceipts !== null && (
            <div>
              <dt>Qualifying receipts at 6%</dt>
              <dd>{formatMoney(tax.presumptive.qualifyingReceipts)}</dd>
            </div>
          )}
          {tax.presumptive.otherReceipts !== null && (
            <div>
              <dt>Other receipts at 8%</dt>
              <dd>{formatMoney(tax.presumptive.otherReceipts)}</dd>
            </div>
          )}
          <div>
            <dt>Minimum presumptive income</dt>
            <dd>{formatMoney(tax.presumptive.minimumIncome)}</dd>
          </div>
          <div>
            <dt>Income used</dt>
            <dd>{formatMoney(tax.presumptive.usedIncome)}</dd>
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
            <dt>Indian TDS</dt>
            <dd>−{formatMoney(tax.tds)}</dd>
          </div>
          <div>
            <dt>Indian TCS</dt>
            <dd>−{formatMoney(tax.tcs)}</dd>
          </div>
          <div>
            <dt>Advance tax already paid</dt>
            <dd>−{formatMoney(tax.advanceTaxPaid)}</dd>
          </div>
        </dl>
      </details>
      <SourceReferences
        ids={['section-202', 'section-156', 'finance-act-2026']}
      />
    </article>
  )
}

function GstCard({
  coverage,
}: {
  readonly coverage: SupportedResult['coverage']['gst']
}) {
  if (coverage.kind === 'unavailable')
    return (
      <CoverageCard title="GST coverage needs review" coverage={coverage} />
    )
  const gst = coverage.value
  const title =
    gst.status === 'below'
      ? 'Below GST threshold'
      : gst.status === 'at'
        ? 'At the GST threshold'
        : 'Above the GST threshold'
  const message =
    gst.status === 'below'
      ? `The declared amount is ${formatMoney(gst.difference)} below the ${formatMoney(gst.threshold)} starting threshold for ${gst.state}.`
      : gst.status === 'at'
        ? `The declared amount is exactly ${formatMoney(gst.threshold)} for ${gst.state}. Registration begins after the threshold is exceeded.`
        : `The declared amount is ${formatMoney(gst.difference)} above the ${formatMoney(gst.threshold)} starting threshold for ${gst.state}.`
  return (
    <article className="result-card coverage-card">
      <p className="card-kicker">GST registration</p>
      <h2>{title}</h2>
      <p>{message}</p>
      {gst.registrationRequired && (
        <p className="coverage-note">
          The agenda shows the registration action only when the liability date
          is known.
        </p>
      )}
      <SourceReferences ids={coverage.sourceIds} />
    </article>
  )
}

function CoverageCard<T>({
  title,
  coverage,
}: {
  readonly title: string
  readonly coverage: Coverage<T>
}) {
  if (coverage.kind === 'available') return null
  return (
    <article className="result-card coverage-card coverage-card--unavailable">
      <p className="card-kicker">Review area</p>
      <h2>{title}</h2>
      <p>{coverage.reason}</p>
      <p>{coverage.guidance}</p>
      <SourceReferences ids={coverage.sourceIds} />
    </article>
  )
}

function AttentionCard({
  next,
  completions,
  saved,
  onMark,
  onUpdatePayment,
  onChangeDate,
  onUndo,
}: {
  readonly next: Obligation | null
  readonly completions: readonly CompletionRecord[]
  readonly saved: boolean
  readonly onMark: (obligation: Obligation) => void
  readonly onUpdatePayment: () => void
  readonly onChangeDate: (obligation: Obligation) => void
  readonly onUndo: (obligation: Obligation) => void
}) {
  const completion = next
    ? completions.find((record) => record.obligationId === next.id)
    : undefined
  if (!next)
    return (
      <section className="attention-card result-card">
        <p className="card-kicker">Your next step</p>
        <h1>No supported action remains</h1>
        <p>
          There is no open dated Obligation for the evaluated scope. Check the
          separate Review areas below.
        </p>
      </section>
    )
  const needsPayment = next.kind === 'advance-tax' && (next.amountDue ?? 0) > 0
  return (
    <section
      className="attention-card result-card"
      aria-labelledby="attention-title"
    >
      <p className="card-kicker">Your next step</p>
      <h1 id="attention-title">{next.title}</h1>
      <div className="attention-meta">
        <span className="deadline-date">{formatDeadline(next.dueDate)}</span>
        <StatusPill status={next.deadlineStatus} />
      </div>
      <p>{next.reasons[0]}</p>
      {next.kind === 'advance-tax' && (
        <p className="amount-callout">
          {next.amountDue === 0
            ? 'The estimate shows no amount remaining.'
            : `${formatMoney(next.amountDue ?? 0)} is the estimated amount remaining.`}
        </p>
      )}
      {completion && !needsPayment ? (
        <div className="completion-state">
          <p>
            <strong>
              Marked complete by you on {formatDate(completion.completedOn)}.
            </strong>{' '}
            My Next Filing has not verified government acceptance.
          </p>
          <div className="button-row">
            <button
              className="button button--secondary"
              type="button"
              onClick={() => onChangeDate(next)}
            >
              Change date
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => onUndo(next)}
            >
              Undo
            </button>
          </div>
        </div>
      ) : saved ? (
        <button
          className="button button--primary"
          type="button"
          onClick={needsPayment ? onUpdatePayment : () => onMark(next)}
        >
          {needsPayment ? 'Update payment' : 'Mark complete'}
        </button>
      ) : (
        <p className="notice">
          Save this workspace on the current device to mark actions complete.
        </p>
      )}
      <SourceReferences ids={next.statutorySourceIds} />
    </section>
  )
}

function Agenda({
  evaluation,
  workspaceView,
  completions,
  saved,
  onMark,
  onUpdatePayment,
  onChangeDate,
  onUndo,
}: {
  readonly evaluation: SupportedResult
  readonly workspaceView: WorkspaceView | null
  readonly completions: readonly CompletionRecord[]
  readonly saved: boolean
  readonly onMark: (obligation: Obligation) => void
  readonly onUpdatePayment: () => void
  readonly onChangeDate: (obligation: Obligation) => void
  readonly onUndo: (obligation: Obligation) => void
}) {
  const ordered = workspaceView
    ? workspaceView.years
        .flatMap((year) =>
          year.evaluation?.kind === 'supported'
            ? year.evaluation.obligations
            : [],
        )
        .filter(
          (obligation, index, all) =>
            all.findIndex((candidate) => candidate.id === obligation.id) ===
            index,
        )
    : evaluation.obligations
  const completionFor = (obligation: Obligation) =>
    completions.find((record) => record.obligationId === obligation.id)
  return (
    <section className="agenda" aria-labelledby="agenda-title">
      <div className="section-heading">
        <h2 id="agenda-title">Your agenda</h2>
        <p>
          {saved
            ? `${workspaceView?.openCount ?? ordered.length} open action${(workspaceView?.openCount ?? ordered.length) === 1 ? '' : 's'}`
            : `${ordered.length} supported action${ordered.length === 1 ? '' : 's'}`}
        </p>
      </div>
      <div className="agenda-list">
        {ordered.map((obligation) => {
          const completion = completionFor(obligation)
          const needsPayment =
            obligation.kind === 'advance-tax' && (obligation.amountDue ?? 0) > 0
          return (
            <article
              className={`agenda-item${completion && !needsPayment ? ' agenda-item--complete' : ''}`}
              key={obligation.id}
            >
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
              <div className="agenda-content">
                <div className="agenda-heading">
                  <h3>{obligation.title}</h3>
                  <StatusPill status={obligation.deadlineStatus} />
                </div>
                <p>{obligation.reasons[0]}</p>
                {completion && !needsPayment && (
                  <p className="completion-note">
                    Marked complete by you on{' '}
                    {formatDate(completion.completedOn)}. Government acceptance
                    is not verified.
                  </p>
                )}
                {saved && !completion && (
                  <button
                    className="text-button"
                    type="button"
                    onClick={() =>
                      needsPayment ? onUpdatePayment() : onMark(obligation)
                    }
                  >
                    {needsPayment ? 'Update payment' : 'Mark complete'}
                  </button>
                )}
                {saved && completion && !needsPayment && (
                  <>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => onChangeDate(obligation)}
                    >
                      Change date
                    </button>{' '}
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => onUndo(obligation)}
                    >
                      Undo
                    </button>
                  </>
                )}
                <details className="consequence">
                  <summary>If the date passes</summary>
                  <p>{obligation.consequence}</p>
                </details>
                <SourceReferences ids={obligation.statutorySourceIds} />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ReviewAreas({
  evaluation,
  onReview,
}: {
  readonly evaluation: SupportedResult
  readonly onReview: (group: ProfileGroup) => void
}) {
  const areas = [
    ['annualReturn', 'Annual-return coverage', 'other-income'],
    ['gst', 'GST coverage', 'gst'],
    ['foreignGuidance', 'Foreign-receipt guidance', 'clients'],
  ] as const
  return (
    <section className="review-areas" aria-labelledby="review-areas-title">
      <h2 id="review-areas-title">Coverage and review</h2>
      <p>These areas sit outside the open and completed action counts.</p>
      <div className="review-area-list">
        {areas.map(([key, title, group]) => {
          const coverage = evaluation.coverage[key]
          if (coverage.kind === 'unavailable')
            return (
              <article
                className="review-area review-area--unavailable"
                key={key}
              >
                <h3>{title}</h3>
                <p>{coverage.reason}</p>
                <p>{coverage.guidance}</p>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onReview(group)}
                >
                  Review answers
                </button>
                <SourceReferences ids={coverage.sourceIds} />
              </article>
            )
          const value = coverage.value
          const text =
            'required' in value
              ? value.required
                ? 'A return trigger is established.'
                : 'No supported trigger is established from the covered facts.'
              : 'registrationRequired' in value
                ? value.registrationRequired
                  ? 'Registration is indicated.'
                  : 'No turnover-based registration action is indicated.'
                : value.message
          return (
            <article className="review-area" key={key}>
              <h3>{title}</h3>
              <p>{text}</p>
              <SourceReferences ids={coverage.sourceIds} />
            </article>
          )
        })}
      </div>
      {evaluation.reviewActions.length > 0 && (
        <div className="review-actions">
          <h3>Review actions</h3>
          {evaluation.reviewActions.map((action) => (
            <article key={action.id}>
              <p>
                <strong>{action.title}</strong>. {action.reason}
              </p>
              <button
                className="text-button"
                type="button"
                onClick={() => onReview(action.correctionGroup)}
              >
                Review answers
              </button>
              <SourceReferences ids={action.sourceIds} />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function NeedsReview({
  workspaceView,
  onDelete,
}: {
  readonly workspaceView: WorkspaceView | null
  readonly onDelete: (record: CompletionRecord) => void
}) {
  const records =
    workspaceView?.years.flatMap((year) =>
      year.needsReview.map((item) => ({ ...item, taxYear: year.taxYear })),
    ) ?? []
  if (records.length === 0) return null
  return (
    <section className="needs-review" aria-labelledby="needs-review-title">
      <h2 id="needs-review-title">Needs review</h2>
      <p>
        These Completion records are kept, but the current result cannot safely
        match them. Delete a record if it no longer applies.
      </p>
      <div className="needs-review-list">
        {records.map((item) => (
          <article
            className="needs-review-item"
            key={`${item.taxYear}-${item.record.obligationId}`}
          >
            <div>
              <h3>
                {item.record.obligationId
                  .replace(/:Tax Year .+$/, '')
                  .replaceAll('-', ' ')}
              </h3>
              <p>
                {item.reason} Declared on {formatDate(item.record.completedOn)}.
              </p>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => onDelete(item.record)}
            >
              Delete completion
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

function SaveNotice({
  onSave,
  onContinue,
}: {
  readonly onSave: () => void
  readonly onContinue: () => void
}) {
  const [adultConfirmed, setAdultConfirmed] = useState(false)
  return (
    <section className="save-notice result-card" aria-labelledby="save-title">
      <p className="card-kicker">Optional current-device saving</p>
      <h2 id="save-title">Keep your place in this browser</h2>
      <p>
        Save this profile and the filing completions you mark in this browser.
        Anyone using this browser profile may be able to see them. There is no
        account, sync, backup, or recovery. Private browsing or clearing site
        data may remove them.
      </p>
      <p>
        <strong>Do not save on a shared or public browser.</strong>
      </p>
      <label className="check-row">
        <input
          type="checkbox"
          checked={adultConfirmed}
          onChange={(event) => setAdultConfirmed(event.target.checked)}
        />{' '}
        I am eighteen or older and want to save on this device.
      </label>
      <div className="button-row">
        <button
          className="button button--primary"
          type="button"
          disabled={!adultConfirmed}
          onClick={onSave}
        >
          Save on this device
        </button>
        <button
          className="button button--secondary"
          type="button"
          onClick={onContinue}
        >
          Continue without saving
        </button>
        <Link className="text-button" to="/#faqs">
          Read the saved-data FAQ
        </Link>
      </div>
    </section>
  )
}

function PaymentEditor({
  onSubmit,
  onCancel,
  current,
}: {
  readonly onSubmit: (value: string) => void
  readonly onCancel: () => void
  readonly current: number
}) {
  const [value, setValue] = useState(current.toLocaleString('en-IN'))
  const [error, setError] = useState('')
  return (
    <div className="inline-editor">
      <h3>Update advance tax paid</h3>
      <p>
        Enter the total advance tax already paid for this Tax Year. The estimate
        will run again.
      </p>
      <label htmlFor="advance-tax-update">Total advance tax already paid</label>
      <div className="money-input">
        <span aria-hidden="true">₹</span>
        <input
          id="advance-tax-update"
          inputMode="numeric"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <div className="button-row">
        <button
          className="button button--primary"
          type="button"
          onClick={() => {
            const trimmed = value.trim()
            const parsed = /^(?:₹\s?)?[\d,]+$/.test(trimmed)
              ? Number(trimmed.replace(/^₹\s?/, '').replaceAll(',', ''))
              : Number.NaN
            if (!Number.isSafeInteger(parsed) || parsed < 0)
              setError('Use a non-negative whole-rupee amount.')
            else onSubmit(String(parsed))
          }}
        >
          Update payment
        </button>
        <button
          className="button button--secondary"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function CompletionEditor({
  obligation,
  initialDate,
  onSubmit,
  onCancel,
}: {
  readonly obligation: Obligation
  readonly initialDate: DateOnly
  readonly onSubmit: (date: DateOnly) => void
  readonly onCancel: () => void
}) {
  const [date, setDate] = useState(initialDate)
  const [error, setError] = useState('')
  return (
    <div className="inline-editor">
      <h3>
        {obligation.kind === 'gst-registration'
          ? 'Mark registration action complete'
          : 'Mark this action complete'}
      </h3>
      <p>
        Marked complete by you. My Next Filing has not verified government
        acceptance.
      </p>
      <label htmlFor="completion-date">Date you completed it</label>
      <DatePicker
        id="completion-date"
        value={date}
        max={todayInIndia()}
        onChange={(value) => setDate(value as DateOnly)}
      />
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <div className="button-row">
        <button
          className="button button--primary"
          type="button"
          onClick={() => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > todayInIndia())
              setError('Choose a valid date no later than today.')
            else onSubmit(date)
          }}
        >
          Confirm completion
        </button>
        <button
          className="button button--secondary"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function SavedDataState({
  savedWorkspace,
  onDelete,
}: {
  readonly savedWorkspace: LoadSavedWorkspaceResult
  readonly onDelete: () => void
}) {
  if (savedWorkspace.kind === 'invalid')
    return (
      <section
        className="stop-state result-card"
        aria-labelledby="saved-invalid-title"
      >
        <p className="period">Saved data needs attention</p>
        <h1 id="saved-invalid-title">
          We could not restore this browser workspace.
        </h1>
        <p>
          No calculation was produced from the saved value. You can start a
          separate unsaved check, or delete the saved value and start again.
        </p>
        <div className="button-row">
          <Link className="button button--primary" to="/check">
            Start an unsaved check
          </Link>
          <button
            className="button button--secondary"
            type="button"
            onClick={onDelete}
          >
            Delete saved data
          </button>
        </div>
      </section>
    )
  if (savedWorkspace.kind === 'unavailable')
    return (
      <section
        className="stop-state result-card"
        aria-labelledby="saved-unavailable-title"
      >
        <p className="period">Browser storage unavailable</p>
        <h1 id="saved-unavailable-title">
          Your current tab can still continue.
        </h1>
        <p>
          This browser did not make saved data available. Nothing was changed or
          deleted.
        </p>
        <div className="button-row">
          <Link className="button button--primary" to="/check">
            Start an unsaved check
          </Link>
          <button
            className="button button--secondary"
            type="button"
            onClick={onDelete}
          >
            Try deleting saved data
          </button>
        </div>
      </section>
    )
  return null
}

function sourceStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function groupStep(group: ProfileGroup) {
  return {
    'tax-year': 0,
    activity: 1,
    receipts: 2,
    clients: 3,
    'other-income': 4,
    gst: 5,
    review: 6,
  }[group]
}

export function PlanRoute() {
  const location = useLocation()
  const navigate = useNavigate()
  const { savedWorkspace, refreshSavedWorkspace } =
    useOutletContext<AppOutletContext>()
  const [, setRefresh] = useState(0)
  const currentCheck = getCurrentCheck()
  const [savePrompt, setSavePrompt] = useState(false)
  const [saveDismissed, setSaveDismissed] = useState(
    Boolean(currentCheck?.saveDismissed),
  )
  const [saveMessage, setSaveMessage] = useState('')
  const [storageConflict, setStorageConflict] = useState(false)
  const [editor, setEditor] = useState<{
    kind: 'completion' | 'payment'
    obligation: Obligation
  } | null>(null)
  const [editorMessage, setEditorMessage] = useState('')
  const transient = currentCheck?.complete ? currentCheck : null
  const profile =
    transient?.profile ??
    (savedWorkspace.kind === 'ready' && savedWorkspace.workspace.active
      ? savedWorkspace.workspace.active.profile
      : null)
  const evaluation = profile
    ? evaluate(profile, new Date(), currentRules)
    : null
  const isExample = Boolean(transient?.example)
  const saved =
    savedWorkspace.kind === 'ready' &&
    !isExample &&
    (!transient || transient.saved) &&
    Boolean(savedWorkspace.workspace.active)
  const activeCompletions =
    saved && savedWorkspace.kind === 'ready' && savedWorkspace.workspace.active
      ? savedWorkspace.workspace.active.completions
      : []
  const hasUnsavedSavedProfile =
    saved &&
    Boolean(transient) &&
    Boolean(
      savedWorkspace.kind === 'ready' && savedWorkspace.workspace.active,
    ) &&
    JSON.stringify(profile) !==
      JSON.stringify(
        savedWorkspace.kind === 'ready'
          ? savedWorkspace.workspace.active?.profile
          : null,
      )
  const workspaceView =
    evaluation && !isExample
      ? deriveWorkspaceView(
          saved ? savedWorkspace.workspace : null,
          { [profile?.taxYear ?? currentRules.taxPeriod]: evaluation },
          todayInIndia(),
        )
      : null
  const supported = evaluation?.kind === 'supported' ? evaluation : null
  const next = workspaceView?.next?.obligation ?? null
  const routeState = location.state as {
    readonly animate?: boolean
    readonly confettiOrigin?: { readonly x: number; readonly y: number }
  } | null
  const confettiOrigin = routeState?.confettiOrigin
  const celebrate =
    Boolean(supported && confettiOrigin) &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (
    !profile &&
    savedWorkspace.kind !== 'invalid' &&
    savedWorkspace.kind !== 'unavailable'
  ) {
    return <Navigate to="/check" replace />
  }

  const persist = (
    nextProfile: Profile,
    completions: readonly CompletionRecord[],
  ): boolean => {
    const storage = sourceStorage()
    if (!storage) {
      setEditorMessage(
        'This browser did not make storage available. Your current work remains in this tab.',
      )
      setStorageConflict(false)
      return false
    }
    const currentSaved =
      savedWorkspace.kind === 'ready' ? savedWorkspace.workspace : null
    const draft: SavedWorkspaceDraft = {
      noticeVersion: 1,
      consentDecidedAt:
        currentSaved?.consentDecidedAt ?? new Date().toISOString(),
      activeTaxYear: nextProfile.taxYear,
      active: {
        ruleDatasetId: currentRules.id,
        profile: nextProfile,
        completions,
      },
      priorYears: currentSaved?.priorYears ?? [],
    }
    const result = saveSavedWorkspace(
      storage,
      currentSaved?.revision ?? null,
      draft,
    )
    if (result.kind === 'saved') {
      setStorageConflict(false)
      clearCurrentCheck()
      refreshSavedWorkspace()
      setSavePrompt(false)
      setEditorMessage('Saved on this device.')
      setRefresh((value) => value + 1)
      return true
    } else if (result.kind === 'conflict') {
      setStorageConflict(true)
      setEditorMessage(
        'This workspace changed in another tab. Reload the saved workspace before writing again.',
      )
    } else if (result.kind === 'invalid') {
      setStorageConflict(false)
      setEditorMessage(
        'The existing saved value needs deliberate deletion before it can be replaced.',
      )
    } else {
      setStorageConflict(false)
      setEditorMessage(
        'This change was not saved. Your current work remains in this tab.',
      )
    }
    return false
  }

  const saveCurrent = () => {
    if (!profile || !supported || isExample) return
    const currentSaved =
      savedWorkspace.kind === 'ready' ? savedWorkspace.workspace : null
    persist(profile, currentSaved?.active?.completions ?? [])
  }

  const updatePayment = (raw: string) => {
    if (!profile) return
    const amount = Number(raw)
    const parsed = parseProfile({
      ...profile,
      otherIncome: { ...profile.otherIncome, advanceTaxPaid: amount },
    })
    if (!parsed.valid) {
      setEditorMessage(
        'The payment value could not be accepted. Your current work remains unchanged.',
      )
      return
    }
    const nextEvaluation = evaluate(parsed.profile, new Date(), currentRules)
    if (nextEvaluation.kind !== 'supported') {
      setEditorMessage(
        'This update changed the supported result. Review the answers before saving it.',
      )
      return
    }
    const currentSaved =
      savedWorkspace.kind === 'ready' ? savedWorkspace.workspace : null
    if (currentSaved) {
      if (persist(parsed.profile, currentSaved.active?.completions ?? []))
        setEditor(null)
    } else {
      setCurrentCheck(
        parsed.profile,
        false,
        true,
        false,
        currentCheck?.saveDismissed ?? false,
      )
      setRefresh((value) => value + 1)
      setEditor(null)
      setEditorMessage(
        'Payment updated for this tab. The estimate is refreshed.',
      )
    }
  }

  const saveCompletion = (obligation: Obligation, date: DateOnly) => {
    if (
      !savedWorkspace.kind ||
      savedWorkspace.kind !== 'ready' ||
      !savedWorkspace.workspace.active ||
      !profile
    )
      return
    const completions = [
      ...savedWorkspace.workspace.active.completions.filter(
        (record) => record.obligationId !== obligation.id,
      ),
      { obligationId: obligation.id, completedOn: date },
    ]
    if (persist(profile, completions)) setEditor(null)
  }

  const removeCompletion = (obligation: Obligation) => {
    if (
      savedWorkspace.kind !== 'ready' ||
      !savedWorkspace.workspace.active ||
      !profile
    )
      return
    persist(
      profile,
      savedWorkspace.workspace.active.completions.filter(
        (record) => record.obligationId !== obligation.id,
      ),
    )
  }

  const removeCompletionRecord = (record: CompletionRecord) => {
    if (
      savedWorkspace.kind !== 'ready' ||
      !savedWorkspace.workspace.active ||
      !profile
    )
      return
    persist(
      profile,
      savedWorkspace.workspace.active.completions.filter(
        (candidate) => candidate.obligationId !== record.obligationId,
      ),
    )
  }

  const deleteSaved = () => {
    if (
      !window.confirm(
        'Delete the saved profile and completion records from this browser?',
      )
    )
      return
    const storage = sourceStorage()
    if (!storage) {
      setSaveMessage(
        'The browser did not make saved data available. Nothing was deleted.',
      )
      return
    }
    const expected =
      savedWorkspace.kind === 'ready' ? savedWorkspace.workspace.revision : null
    const result = deleteSavedWorkspace(storage, expected)
    if (result.kind === 'deleted' || result.kind === 'absent') {
      clearCurrentCheck()
      refreshSavedWorkspace()
      navigate('/#faqs')
      return
    }
    setSaveMessage(
      result.kind === 'conflict'
        ? 'The saved workspace changed in another tab. Reload before deleting it.'
        : 'Saved data was not removed.',
    )
  }

  const review = (group: ProfileGroup, animate = false) => {
    if (!profile) return
    setCurrentCheck(
      profile,
      isExample,
      true,
      saved,
      currentCheck?.saveDismissed ?? false,
    )
    navigate('/check', {
      state: animate
        ? { step: groupStep(group), animate: true }
        : { step: groupStep(group) },
    })
  }

  const startOver = () => {
    clearCurrentCheck()
    navigate('/check', { state: { personal: true } })
  }

  const content =
    evaluation?.kind === 'stale-rules' ? (
      <section className="stop-state result-card" aria-labelledby="stale-title">
        <p className="period">Rules need review</p>
        <h1 id="stale-title">We cannot calculate a current result.</h1>
        <p>
          The local Rules for this period are invalid, missing, or outside their
          review window. Calculation is disabled until they are reviewed.
        </p>
        {evaluation.expiresOn && (
          <p>
            The dataset review window ended on{' '}
            {formatDate(evaluation.expiresOn)}.
          </p>
        )}
        <SourceReferences ids={evaluation.sourceIds} />
      </section>
    ) : evaluation?.kind === 'unsupported' ? (
      <section
        className="stop-state result-card"
        aria-labelledby="unsupported-title"
      >
        <p className="period">Profile outside this version</p>
        <h1 id="unsupported-title">
          This version cannot calculate a reliable plan for these answers.
        </h1>
        <p>
          Change an answer if it was accidental. Otherwise, use a fixed official
          source or qualified adviser outside this application.
        </p>
        <ul className="fact-list">
          {evaluation.facts.map((fact) => (
            <li key={`${fact.code}-${fact.correctionGroup}`}>
              <strong>{fact.label}.</strong> {fact.reason}{' '}
              <button
                className="text-button"
                type="button"
                onClick={() => review(fact.correctionGroup)}
              >
                Review answers
              </button>
            </li>
          ))}
        </ul>
        <SourceReferences ids={evaluation.sourceIds} />
      </section>
    ) : (
      supported && (
        <>
          <AttentionCard
            next={next}
            completions={activeCompletions}
            saved={saved}
            onMark={(obligation) =>
              setEditor({ kind: 'completion', obligation })
            }
            onUpdatePayment={() => {
              if (next) setEditor({ kind: 'payment', obligation: next })
            }}
            onChangeDate={(obligation) =>
              setEditor({ kind: 'completion', obligation })
            }
            onUndo={removeCompletion}
          />
          {editor?.kind === 'payment' && profile && (
            <PaymentEditor
              current={profile.otherIncome.advanceTaxPaid}
              onSubmit={updatePayment}
              onCancel={() => setEditor(null)}
            />
          )}
          {editor?.kind === 'completion' && (
            <CompletionEditor
              obligation={editor.obligation}
              initialDate={
                activeCompletions.find(
                  (record) => record.obligationId === editor.obligation.id,
                )?.completedOn ?? todayInIndia()
              }
              onSubmit={(date) => saveCompletion(editor.obligation, date)}
              onCancel={() => setEditor(null)}
            />
          )}
          {editorMessage && (
            <div className="notice" role="status">
              <p>{editorMessage}</p>
              {storageConflict && (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    clearCurrentCheck()
                    refreshSavedWorkspace()
                    setStorageConflict(false)
                    setEditorMessage('Reloaded the saved workspace.')
                    setEditor(null)
                    setRefresh((value) => value + 1)
                  }}
                >
                  Reload saved workspace
                </button>
              )}
            </div>
          )}
          <div className="plan-summary">
            <TaxSummary tax={supported.tax} />
            <GstCard coverage={supported.coverage.gst} />
          </div>
          <Agenda
            evaluation={supported}
            workspaceView={workspaceView}
            completions={activeCompletions}
            saved={saved}
            onMark={(obligation) =>
              setEditor({ kind: 'completion', obligation })
            }
            onUpdatePayment={() => {
              const obligation = supported.obligations.find(
                (item) => item.kind === 'advance-tax',
              )
              if (obligation) setEditor({ kind: 'payment', obligation })
            }}
            onChangeDate={(obligation) =>
              setEditor({ kind: 'completion', obligation })
            }
            onUndo={removeCompletion}
          />
          <ReviewAreas evaluation={supported} onReview={review} />
          <NeedsReview
            workspaceView={workspaceView}
            onDelete={removeCompletionRecord}
          />
          <details className="assumptions result-card">
            <summary>Assumptions and sources</summary>
            <ul>
              {supported.assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
            <ul>
              {supported.explanations.map((explanation) => (
                <li key={explanation}>{explanation}</li>
              ))}
            </ul>
            <SourceReferences ids={supported.sourceIds} />
          </details>
        </>
      )
    )

  return (
    <section className="plan journey-layout" aria-label="Filing workspace">
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
      {isExample && (
        <div className="notice notice--top notice--example" role="status">
          <strong>Fictional example.</strong> These amounts are for
          demonstration only.
        </div>
      )}
      <div
        className={`plan-main${routeState?.animate ? ' journey-view--enter' : ''}`}
      >
        {saveMessage && (
          <p className="notice notice--top" role="alert">
            {saveMessage}
          </p>
        )}
        {(savedWorkspace.kind === 'invalid' ||
          savedWorkspace.kind === 'unavailable') &&
        !transient ? (
          <SavedDataState
            savedWorkspace={savedWorkspace}
            onDelete={deleteSaved}
          />
        ) : (
          content
        )}
        {supported &&
          !isExample &&
          savedWorkspace.kind === 'absent' &&
          !saved &&
          !savePrompt &&
          !saveDismissed &&
          !saveMessage && (
            <button
              className="text-button save-link"
              type="button"
              onClick={() => setSavePrompt(true)}
            >
              Save this workspace on this device
            </button>
          )}
        {supported &&
          !isExample &&
          savedWorkspace.kind === 'absent' &&
          !saved &&
          savePrompt && (
            <SaveNotice
              onSave={saveCurrent}
              onContinue={() => {
                markSaveDismissed()
                setSavePrompt(false)
                setSaveDismissed(true)
              }}
            />
          )}
        {saved && (
          <div className="workspace-controls">
            <p className="saved-state" role="status">
              Saved on this device. Re-evaluated against current Rules.
            </p>
            <div className="button-row">
              {supported && hasUnsavedSavedProfile && (
                <button
                  className="button button--primary"
                  type="button"
                  onClick={saveCurrent}
                >
                  Save changes
                </button>
              )}
              <button
                className="button button--secondary"
                type="button"
                onClick={() => review('review')}
              >
                Review answers
              </button>
              <button
                className="text-button"
                type="button"
                onClick={deleteSaved}
              >
                Stop saving
              </button>
            </div>
          </div>
        )}
        {!supported && saved && (
          <NeedsReview
            workspaceView={workspaceView}
            onDelete={removeCompletionRecord}
          />
        )}
      </div>
      <JourneySidebar
        activeStep={calculationStep}
        backAction={
          <button
            className="button button--secondary"
            type="button"
            onClick={() => (profile ? review('review') : navigate('/check'))}
          >
            Back
          </button>
        }
        action={
          <button
            className="button button--primary"
            type="button"
            onClick={startOver}
          >
            Start over
          </button>
        }
        disabledSteps={[]}
        onStepSelect={(journeyStep, animate) =>
          journeyStep === 0
            ? navigate('/', { state: { animate } })
            : journeyStep <= questionnaireSteps.length
              ? review(
                  (
                    [
                      'tax-year',
                      'activity',
                      'receipts',
                      'clients',
                      'other-income',
                      'gst',
                      'review',
                    ] as const
                  )[journeyStep - 1],
                  animate,
                )
              : undefined
        }
      />
    </section>
  )
}
