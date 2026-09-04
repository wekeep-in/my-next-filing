import Confetti from 'react-confetti-boom'
import { useEffect, useId, useState } from 'react'
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
  setCurrentCheck,
} from '../current-check.ts'
import { evaluate, parseProfile } from '../evaluation/index.ts'
import { DatePicker } from '../form-controls.tsx'
import type {
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
const deletedWorkspaceMessage =
  'Your saved answers and completion dates were removed from this browser.'

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
  return `Due ${formatDate(date)}`
}

function SourceLinks({ ids }: { readonly ids: readonly string[] }) {
  if (ids.length === 0) return null
  return (
    <div>
      {ids.map((id) => {
        const source = sourceRegistry.find((candidate) => candidate.id === id)
        if (!source) return null
        return (
          <p className="source-reference" key={id}>
            <ExternalLink href={source.url}>{source.title}</ExternalLink>
          </p>
        )
      })}
    </div>
  )
}

function SourceReferences({ ids }: { readonly ids: readonly string[] }) {
  if (ids.length === 0) return null
  return (
    <details className="source-list">
      <summary>
        Official source{ids.length === 1 ? '' : 's'} ({ids.length})
      </summary>
      <SourceLinks ids={ids} />
    </details>
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

function CompletionStatus({ completedOn }: { readonly completedOn: DateOnly }) {
  const tooltipId = useId()
  return (
    <span className="completion-status">
      <span
        className="status status--completed"
        tabIndex={0}
        aria-describedby={tooltipId}
      >
        Completed
      </span>
      <span className="completion-tooltip" id={tooltipId} role="tooltip">
        You marked this complete on {formatDate(completedOn)}. My Next Filing
        cannot verify government acceptance.
      </span>
    </span>
  )
}

type PlanEditor =
  | { readonly kind: 'completion'; readonly obligation: Obligation }
  | { readonly kind: 'payment'; readonly obligation: Obligation }

function TaxSummary({ tax }: { readonly tax: TaxEstimate }) {
  const label =
    tax.outcome === 'payable'
      ? 'Estimated tax left to pay'
      : tax.outcome === 'refund'
        ? 'Estimated refund'
        : 'No estimated tax left to pay'
  const note =
    tax.outcome === 'refund'
      ? 'Based on your answers. This is an estimate, not a confirmed refund.'
      : 'Based on your answers. This is an estimate, not a government demand.'
  return (
    <article className="result-card tax-summary">
      <p className="card-kicker">{label}</p>
      <h2>{formatMoney(tax.finalAmount)}</h2>
      <p>{note}</p>
      <details className="calculation-details">
        <summary>How this estimate was calculated</summary>
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
            <dt>Presumptive income used</dt>
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
  if (coverage.kind === 'unavailable') return null
  const gst = coverage.value
  const title =
    gst.status === 'below'
      ? 'Your turnover is below the GST registration threshold'
      : gst.status === 'at'
        ? 'Your turnover is at the GST registration threshold'
        : 'Your turnover is above the GST registration threshold'
  const message =
    gst.status === 'below'
      ? `Your declared GST turnover is ${formatMoney(gst.difference)} below the ${formatMoney(gst.threshold)} starting threshold for ${gst.state}.`
      : gst.status === 'at'
        ? `Your declared GST turnover is exactly ${formatMoney(gst.threshold)} for ${gst.state}. Registration begins after the threshold is exceeded.`
        : `Your declared GST turnover is ${formatMoney(gst.difference)} above the ${formatMoney(gst.threshold)} starting threshold for ${gst.state}.`
  return (
    <article className="result-card coverage-card">
      <p className="card-kicker">GST registration</p>
      <h2>{title}</h2>
      <p>{message}</p>
      {gst.registrationRequired && (
        <p className="coverage-note">
          Your agenda includes registration only when you provide the date on
          which liability arose.
        </p>
      )}
      <SourceReferences ids={coverage.sourceIds} />
    </article>
  )
}

function AttentionCard({
  next,
  completions,
  saved,
  isExample,
  advanceTaxPaid,
  onSave,
  savePrompt,
  onSaveConfirm,
  onSaveCancel,
  editor,
  onPaymentSubmit,
  onCompletionSubmit,
  onEditorCancel,
  onUpdatePayment,
  onChangeDate,
  onUndo,
}: {
  readonly next: Obligation | null
  readonly completions: readonly CompletionRecord[]
  readonly saved: boolean
  readonly isExample: boolean
  readonly advanceTaxPaid: number
  readonly onSave?: () => void
  readonly savePrompt: boolean
  readonly onSaveConfirm: () => void
  readonly onSaveCancel: () => void
  readonly editor: PlanEditor | null
  readonly onPaymentSubmit: (value: string) => void
  readonly onCompletionSubmit: (obligation: Obligation, date: DateOnly) => void
  readonly onEditorCancel: () => void
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
        <p className="card-kicker">Next action</p>
        <h2>No dated actions in your plan</h2>
        <p>
          This plan does not show any open filing or payment dates. Check any
          items below before relying on it.
        </p>
      </section>
    )
  const needsPayment = next.kind === 'advance-tax' && (next.amountDue ?? 0) > 0
  return (
    <section
      className="attention-card result-card"
      aria-labelledby="attention-title"
    >
      <p className="card-kicker">Next action</p>
      <h2 id="attention-title">{next.title}</h2>
      <p>{next.reasons[0]}</p>
      <div className="attention-meta">
        {next.kind === 'advance-tax' && (
          <span className="amount-callout">
            {next.amountDue === 0
              ? 'No estimated amount left to pay'
              : `${formatMoney(next.amountDue ?? 0)} estimated left to pay`}
          </span>
        )}
        <span className="deadline-date">{formatDeadline(next.dueDate)}</span>
      </div>
      {completion && !needsPayment && !editor ? (
        <div className="completion-state">
          <p>
            <strong>
              You marked this complete on {formatDate(completion.completedOn)}.
            </strong>{' '}
            My Next Filing cannot verify government acceptance.
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
              Remove completion
            </button>
          </div>
        </div>
      ) : !saved && isExample ? (
        <p className="notice">
          This fictional example cannot be saved or marked complete.
        </p>
      ) : null}
      <SourceReferences ids={next.statutorySourceIds} />
      {(editor ||
        (!completion && saved) ||
        (!saved && !isExample && (savePrompt || onSave))) && (
        <div className="attention-action">
          {editor?.kind === 'payment' && (
            <PaymentEditor
              current={advanceTaxPaid}
              onSubmit={onPaymentSubmit}
              onCancel={onEditorCancel}
              embedded={editor.obligation.id === next.id}
            />
          )}
          {editor?.kind === 'completion' && (
            <CompletionEditor
              obligation={editor.obligation}
              initialDate={
                completions.find(
                  (record) => record.obligationId === editor.obligation.id,
                )?.completedOn ?? todayInIndia()
              }
              onSubmit={(date) => onCompletionSubmit(editor.obligation, date)}
              onCancel={onEditorCancel}
              embedded={editor.obligation.id === next.id}
            />
          )}
          {!editor && saved && !completion && needsPayment && (
            <button
              className="button button--secondary"
              type="button"
              onClick={onUpdatePayment}
            >
              Update amount paid
            </button>
          )}
          {!editor && saved && !completion && !needsPayment && (
            <CompletionEditor
              obligation={next}
              initialDate={todayInIndia()}
              onSubmit={(date) => onCompletionSubmit(next, date)}
              embedded
            />
          )}
          {!editor &&
            !saved &&
            !isExample &&
            (savePrompt || onSave) &&
            (savePrompt ? (
              <SaveNotice onSave={onSaveConfirm} onContinue={onSaveCancel} />
            ) : (
              <button
                className="button button--secondary"
                type="button"
                onClick={onSave}
              >
                Save data in this browser
              </button>
            ))}
        </div>
      )}
    </section>
  )
}

function Agenda({
  evaluation,
  workspaceView,
  nextId,
  completions,
  saved,
  onMark,
  onUpdatePayment,
  onChangeDate,
  onUndo,
}: {
  readonly evaluation: SupportedResult
  readonly workspaceView: WorkspaceView | null
  readonly nextId: string | null
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
            : `${ordered.length} action${ordered.length === 1 ? '' : 's'}`}
        </p>
      </div>
      <div className="agenda-list">
        {ordered.map((obligation) => {
          const completion = completionFor(obligation)
          const isNext = obligation.id === nextId
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
                  {completion && !needsPayment ? (
                    <CompletionStatus completedOn={completion.completedOn} />
                  ) : (
                    <StatusPill status={obligation.deadlineStatus} />
                  )}
                </div>
                <p>{obligation.reasons[0]}</p>
                {saved && !completion && !isNext && (
                  <button
                    className="text-button"
                    type="button"
                    onClick={() =>
                      needsPayment ? onUpdatePayment() : onMark(obligation)
                    }
                  >
                    {needsPayment
                      ? 'Update amount paid'
                      : 'Add completion date'}
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
                      Remove completion
                    </button>
                  </>
                )}
                <details className="consequence">
                  <summary>What may happen after this date</summary>
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
    ['annualReturn', 'Annual-return check', 'other-income'],
    ['gst', 'GST registration check', 'gst'],
    ['foreignGuidance', 'Foreign-receipt check', 'clients'],
  ] as const
  const unavailable = areas.filter(
    ([key]) => evaluation.coverage[key].kind === 'unavailable',
  )
  const standaloneActions = evaluation.reviewActions.filter(
    (action) =>
      !unavailable.some(([key]) => {
        const coverage = evaluation.coverage[key]
        return coverage.kind === 'unavailable' && coverage.area === action.area
      }),
  )
  if (unavailable.length === 0 && standaloneActions.length === 0) return null
  return (
    <section className="review-areas" aria-labelledby="review-areas-title">
      <h2 id="review-areas-title">Check before relying on this plan</h2>
      <p>These checks do not count as dated actions.</p>
      {unavailable.length > 0 && (
        <div className="review-area-list">
          {unavailable.map(([key, title, group]) => {
            const coverage = evaluation.coverage[key]
            if (coverage.kind === 'available') return null
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
                  {reviewLabel(group)}
                </button>
                <SourceReferences ids={coverage.sourceIds} />
              </article>
            )
          })}
        </div>
      )}
      {standaloneActions.length > 0 && (
        <div className="review-actions">
          {standaloneActions.map((action) => (
            <article key={action.id}>
              <p>
                <strong>{action.title}</strong>. {action.reason}
              </p>
              <button
                className="text-button"
                type="button"
                onClick={() => onReview(action.correctionGroup)}
              >
                {reviewLabel(action.correctionGroup)}
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
      <h2 id="needs-review-title">Completion dates to check</h2>
      <p>
        These saved dates no longer match an action in your current plan. Remove
        a date if it no longer applies.
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
              Remove completion date
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
  return (
    <section className="save-notice result-card" aria-label="Save data">
      <p>
        Save your answers and any completion dates you add in this browser.
        Anyone using this browser profile may be able to see them, so don't save
        on a shared browser.
      </p>
      <p>
        There is no account, sync, backup, or recovery. Private browsing or
        clearing site data may remove them. Read more{' '}
        <Link className="text-button" to="/#faqs">
          here
        </Link>
        .
      </p>
      <div className="button-row">
        <button
          className="button button--primary"
          type="button"
          onClick={onSave}
        >
          Save data
        </button>
        <button
          className="button button--secondary"
          type="button"
          onClick={onContinue}
        >
          Cancel
        </button>
      </div>
    </section>
  )
}

function PaymentEditor({
  onSubmit,
  onCancel,
  current,
  embedded = false,
}: {
  readonly onSubmit: (value: string) => void
  readonly onCancel: () => void
  readonly current: number
  readonly embedded?: boolean
}) {
  const [value, setValue] = useState(current.toLocaleString('en-IN'))
  const [error, setError] = useState('')
  return (
    <div className="inline-editor">
      {!embedded && <h3>How much advance tax have you paid?</h3>}
      <p>
        Enter the total advance tax already paid for this Tax Year. Your plan
        will be recalculated.
      </p>
      <label htmlFor="advance-tax-update">Total advance tax already paid</label>
      <div className="money-input">
        <span aria-hidden="true">₹</span>
        <input
          id="advance-tax-update"
          inputMode="numeric"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setError('')
          }}
        />
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <div className="button-row">
        <button
          className="button button--secondary"
          type="button"
          onClick={() => {
            const trimmed = value.trim()
            const parsed = /^(?:₹\s?)?[\d,]+$/.test(trimmed)
              ? Number(trimmed.replace(/^₹\s?/, '').replaceAll(',', ''))
              : Number.NaN
            if (!Number.isSafeInteger(parsed) || parsed < 0)
              setError('Enter a whole-rupee amount of ₹0 or more.')
            else onSubmit(String(parsed))
          }}
        >
          Save and recalculate
        </button>
        <button className="text-button" type="button" onClick={onCancel}>
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
  embedded = false,
}: {
  readonly obligation: Obligation
  readonly initialDate: DateOnly
  readonly onSubmit: (date: DateOnly) => void
  readonly onCancel?: () => void
  readonly embedded?: boolean
}) {
  const [date, setDate] = useState(initialDate)
  const [error, setError] = useState('')
  const inputId = `completion-date-${obligation.id.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
  return (
    <div
      className={`inline-editor${embedded ? ' inline-editor--embedded' : ''}`}
    >
      <p>Choose the date you completed this action. Your plan will update.</p>
      <div className="completion-controls">
        <div className="completion-field">
          <label htmlFor={inputId}>Completion date</label>
          <DatePicker
            id={inputId}
            value={date}
            max={todayInIndia()}
            onChange={(value) => {
              setDate(value as DateOnly)
              setError('')
            }}
          />
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="button-row">
          <button
            className="button button--secondary"
            type="button"
            onClick={() => {
              if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > todayInIndia())
                setError('Choose a valid date no later than today.')
              else onSubmit(date)
            }}
          >
            Mark completed
          </button>
          {onCancel && (
            <button className="text-button" type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DeleteNotice({
  onDelete,
  onCancel,
}: {
  readonly onDelete: () => void
  readonly onCancel: () => void
}) {
  return (
    <section
      className="delete-notice result-card"
      aria-labelledby="delete-title"
      aria-live="polite"
    >
      <h2 id="delete-title">Delete saved data?</h2>
      <p>
        This removes your saved answers and completion dates from this browser.
        You can continue with an unsaved estimate. This cannot be undone.
      </p>
      <div className="button-row">
        <button
          className="button button--danger"
          type="button"
          onClick={onDelete}
        >
          Delete saved data
        </button>
        <button
          className="button button--secondary"
          type="button"
          onClick={onCancel}
        >
          Keep saved data
        </button>
      </div>
    </section>
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
        <p className="period">Saved data unavailable</p>
        <h1 id="saved-invalid-title">We couldn't restore your saved data</h1>
        <p>
          No estimate was calculated from it. Start an unsaved estimate, or
          delete the saved data and start again.
        </p>
        <div className="button-row">
          <Link className="button button--primary" to="/check">
            Start an unsaved estimate
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
        <p className="period">Saving unavailable</p>
        <h1 id="saved-unavailable-title">You can continue in this tab</h1>
        <p>
          This browser did not make saved storage available. Nothing was changed
          or deleted.
        </p>
        <div className="button-row">
          <Link className="button button--primary" to="/check">
            Start an unsaved estimate
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

function reviewLabel(group: ProfileGroup) {
  return {
    'tax-year': 'Review personal and Tax Year answers',
    activity: 'Review work and tax method',
    receipts: 'Review receipts and profit',
    clients: 'Review client and payment answers',
    'other-income': 'Review income and tax paid',
    gst: 'Review GST answers',
    review: 'Review all answers',
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
  const [saveMessage, setSaveMessage] = useState('')
  const [deletionToastVisible, setDeletionToastVisible] = useState(false)
  const [storageConflict, setStorageConflict] = useState(false)
  const [deletePrompt, setDeletePrompt] = useState(false)
  const [deletedWorkspace, setDeletedWorkspace] = useState(false)
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
  const canOfferSave = Boolean(
    supported &&
    !isExample &&
    savedWorkspace.kind === 'absent' &&
    !saved &&
    !savePrompt &&
    !saveMessage,
  )
  const next = workspaceView
    ? (workspaceView.next?.obligation ?? null)
    : (supported?.obligations[0] ?? null)
  const routeState = location.state as {
    readonly animate?: boolean
    readonly confettiOrigin?: { readonly x: number; readonly y: number }
  } | null
  const confettiOrigin = routeState?.confettiOrigin
  const celebrate =
    Boolean(supported && confettiOrigin) &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (saveMessage !== deletedWorkspaceMessage) return
    const hide = window.setTimeout(() => setDeletionToastVisible(false), 3800)
    const remove = window.setTimeout(() => setSaveMessage(''), 4000)
    return () => {
      window.clearTimeout(hide)
      window.clearTimeout(remove)
    }
  }, [saveMessage])

  if (
    !profile &&
    !deletedWorkspace &&
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
      setEditorMessage('')
      setRefresh((value) => value + 1)
      return true
    } else if (result.kind === 'conflict') {
      setStorageConflict(true)
      setEditorMessage(
        'This saved data changed in another tab. Reload it before trying again.',
      )
    } else if (result.kind === 'invalid') {
      setStorageConflict(false)
      setEditorMessage('This saved data cannot be updated until you delete it.')
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
      setCurrentCheck(parsed.profile, false, true, false)
      setRefresh((value) => value + 1)
      setEditor(null)
      setEditorMessage('')
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
      if (profile) {
        setCurrentCheck(profile, false, true, false)
      } else {
        clearCurrentCheck()
        setDeletedWorkspace(true)
      }
      refreshSavedWorkspace()
      setDeletePrompt(false)
      setEditor(null)
      setEditorMessage('')
      setDeletionToastVisible(true)
      setSaveMessage(deletedWorkspaceMessage)
      return
    }
    setSaveMessage(
      result.kind === 'conflict'
        ? 'The saved data changed in another tab. Reload before deleting it.'
        : 'Saved data was not removed.',
    )
  }

  const review = (group: ProfileGroup, animate = false) => {
    if (!profile) return
    setCurrentCheck(profile, isExample, true, saved)
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

  const content = deletedWorkspace ? (
    <section className="stop-state result-card" aria-labelledby="deleted-title">
      <p className="period">Saved data deleted</p>
      <h1 id="deleted-title">Your saved data was removed</h1>
      <p>
        My Next Filing no longer has saved data in this browser. You can start a
        new unsaved estimate.
      </p>
      <Link className="button button--primary" to="/check">
        Start an unsaved estimate
      </Link>
    </section>
  ) : evaluation?.kind === 'stale-rules' ? (
    <section className="stop-state result-card" aria-labelledby="stale-title">
      <p className="period">Plan unavailable</p>
      <h1 id="stale-title">
        We can't calculate this plan with the current tax rules
      </h1>
      <p>
        The tax rules built into this version are missing, invalid, or past
        their review date. No estimate was calculated. Check the official
        sources below or return after the rules are updated.
      </p>
      {evaluation.expiresOn && (
        <p>
          These tax rules were due for review on{' '}
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
      <p className="period">This version does not cover your situation</p>
      <h1 id="unsupported-title">
        We can't calculate a reliable plan from these answers
      </h1>
      <p>
        If an answer is incorrect, review it below. Otherwise, use the linked
        official sources or ask a qualified tax adviser.
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
              {reviewLabel(fact.correctionGroup)}
            </button>
          </li>
        ))}
      </ul>
      <SourceReferences ids={evaluation.sourceIds} />
    </section>
  ) : (
    supported && (
      <>
        <header className="question-heading">
          <span className="period-pill">{profile?.taxYear}</span>
          <h1>Your plan</h1>
          <p>
            Based on the answers you reviewed. My Next Filing does not file,
            pay, or verify completion.
          </p>
        </header>
        <AttentionCard
          next={next}
          completions={activeCompletions}
          saved={saved}
          isExample={isExample}
          advanceTaxPaid={profile?.otherIncome.advanceTaxPaid ?? 0}
          onSave={canOfferSave ? () => setSavePrompt(true) : undefined}
          savePrompt={savePrompt}
          onSaveConfirm={saveCurrent}
          onSaveCancel={() => setSavePrompt(false)}
          editor={editor}
          onPaymentSubmit={updatePayment}
          onCompletionSubmit={saveCompletion}
          onEditorCancel={() => setEditor(null)}
          onUpdatePayment={() => {
            if (next) setEditor({ kind: 'payment', obligation: next })
          }}
          onChangeDate={(obligation) =>
            setEditor({ kind: 'completion', obligation })
          }
          onUndo={removeCompletion}
        />
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
                  setEditorMessage('')
                  setEditor(null)
                  setRefresh((value) => value + 1)
                }}
              >
                Reload saved data
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
          nextId={next?.id ?? null}
          completions={activeCompletions}
          saved={saved}
          onMark={(obligation) => setEditor({ kind: 'completion', obligation })}
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
          <summary>Assumptions and limits</summary>
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
        </details>
        <details className="assumptions result-card">
          <summary>Official sources ({supported.sourceIds.length})</summary>
          <SourceLinks ids={supported.sourceIds} />
        </details>
      </>
    )
  )

  return (
    <section className="plan journey-layout" aria-label="Your plan">
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
      {saveMessage && (
        <div
          className={`notice notice--top${saveMessage === deletedWorkspaceMessage ? ' notice--toast' : ''}`}
          data-visible={
            saveMessage === deletedWorkspaceMessage
              ? deletionToastVisible
              : undefined
          }
          role="status"
        >
          {saveMessage}
        </div>
      )}
      <div
        className={`plan-main${routeState?.animate ? ' journey-view--enter' : ''}`}
      >
        {(savedWorkspace.kind === 'invalid' ||
          savedWorkspace.kind === 'unavailable') &&
        !transient ? (
          <SavedDataState
            savedWorkspace={savedWorkspace}
            onDelete={() => setDeletePrompt(true)}
          />
        ) : (
          content
        )}
        {saved && (
          <div className="workspace-controls">
            {deletePrompt ? (
              <DeleteNotice
                onDelete={deleteSaved}
                onCancel={() => setDeletePrompt(false)}
              />
            ) : (
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
                  className="button button--danger"
                  type="button"
                  onClick={() => setDeletePrompt(true)}
                >
                  Delete saved data
                </button>
              </div>
            )}
          </div>
        )}
        {deletePrompt && !saved && (
          <DeleteNotice
            onDelete={deleteSaved}
            onCancel={() => setDeletePrompt(false)}
          />
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
