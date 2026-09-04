import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Obligation, ProfileGroup, SupportedResult } from '@/evaluation'
import type { CompletionRecord, WorkspaceView } from '@/workspace'
import {
  CompletionStatus,
  SourceReferences,
  StatusPill,
} from '@/routes/plan/cards'

export function reviewLabel(group: ProfileGroup) {
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

export function Agenda({
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
                  <Button
                    variant="link"
                    type="button"
                    onClick={() =>
                      needsPayment ? onUpdatePayment() : onMark(obligation)
                    }
                  >
                    {needsPayment
                      ? 'Update amount paid'
                      : 'Add completion date'}
                  </Button>
                )}
                {saved && completion && !needsPayment && (
                  <>
                    <Button
                      variant="link"
                      type="button"
                      onClick={() => onChangeDate(obligation)}
                    >
                      Change date
                    </Button>{' '}
                    <Button
                      variant="link"
                      type="button"
                      onClick={() => onUndo(obligation)}
                    >
                      Remove completion
                    </Button>
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

export function ReviewAreas({
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
              <Card
                as="article"
                className="review-area review-area--unavailable"
                key={key}
              >
                <h3>{title}</h3>
                <p>{coverage.reason}</p>
                <p>{coverage.guidance}</p>
                <Button
                  variant="link"
                  type="button"
                  onClick={() => onReview(group)}
                >
                  {reviewLabel(group)}
                </Button>
                <SourceReferences ids={coverage.sourceIds} />
              </Card>
            )
          })}
        </div>
      )}
      {standaloneActions.length > 0 && (
        <div className="review-actions">
          {standaloneActions.map((action) => (
            <Card as="article" key={action.id}>
              <p>
                <strong>{action.title}</strong>. {action.reason}
              </p>
              <Button
                variant="link"
                type="button"
                onClick={() => onReview(action.correctionGroup)}
              >
                {reviewLabel(action.correctionGroup)}
              </Button>
              <SourceReferences ids={action.sourceIds} />
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

export function NeedsReview({
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
          <Card
            as="article"
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
            <Button
              className="shrink-0 max-[520px]:mt-[.7rem]"
              variant="link"
              type="button"
              onClick={() => onDelete(item.record)}
            >
              Remove completion date
            </Button>
          </Card>
        ))}
      </div>
    </section>
  )
}
