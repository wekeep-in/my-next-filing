import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ExternalLink } from '@/components/external-link'
import { QrmpPaymentHelp } from '@/components/gst-help'
import { GST_PORTAL_URL } from '@/rules'
import { completionLabel } from '@/routes/plan/model'
import { ActionLinks } from '@/routes/plan/action-links'
import type { Obligation, ProfileGroup, SupportedResult } from '@/evaluation'
import { canCompleteObligation } from '@/evaluation'
import type { CompletionRecord, WorkspaceView } from '@/workspace'
import {
  CompletionStatus,
  SourceReferences,
  StatusPill,
} from '@/routes/plan/cards'

export function reviewLabel(group: ProfileGroup) {
  return {
    'tax-year': 'Review fit answers',
    activity: 'Review fit answers',
    receipts: 'Review income and profit',
    clients: 'Review client and payment answers',
    'other-income': 'Review income and profit',
    gst: 'Review tax and GST answers',
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
          const record = completionFor(obligation)
          const completion =
            record && canCompleteObligation(obligation, record.completedOn)
              ? record
              : undefined
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
                    <CompletionStatus
                      completedOn={completion.completedOn}
                      reviewed={obligation.kind === 'gst-qrmp-payment'}
                    />
                  ) : (
                    <StatusPill
                      status={obligation.deadlineStatus}
                      beforeExport={obligation.kind === 'gst-lut'}
                    />
                  )}
                </div>
                <p>
                  {obligation.reasons[0]}
                  {obligation.kind === 'gst-qrmp-payment' && (
                    <>
                      {' '}
                      <QrmpPaymentHelp />
                    </>
                  )}
                </p>
                {obligation.kind === 'gst-lut' && (
                  <p>
                    Before {formatDate(obligation.dueDate)}, your first export
                    date.
                  </p>
                )}
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
                      : obligation.kind === 'gst-qrmp-payment'
                        ? 'Add review date'
                        : 'Add completion date'}
                  </Button>
                )}
                {saved && completion && !needsPayment && (
                  <div className="flex flex-wrap gap-6">
                    <Button
                      variant="link"
                      type="button"
                      onClick={() => onChangeDate(obligation)}
                    >
                      {obligation.kind === 'gst-qrmp-payment'
                        ? 'Change review date'
                        : 'Change completion date'}
                    </Button>
                    <Button
                      variant="link"
                      type="button"
                      onClick={() => onUndo(obligation)}
                    >
                      {obligation.kind === 'gst-qrmp-payment'
                        ? 'Remove review'
                        : 'Remove completion'}
                    </Button>
                  </div>
                )}
                <ActionLinks kind={obligation.kind} />
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
    ['annualReturn', 'Annual-return check', 'gst'],
    ['gst', 'GST check', 'gst'],
    ['lut', 'LUT and export check', 'gst'],
    ['foreignGuidance', 'Foreign-asset and receipt check', 'clients'],
  ] as const
  const unavailable = areas.filter(
    ([key]) => evaluation.coverage[key].kind === 'unavailable',
  )
  const standaloneActions = evaluation.reviewActions.filter(
    (action) =>
      action.id === 'platform-rcm-payment' ||
      !unavailable.some(([key]) => {
        const coverage = evaluation.coverage[key]
        return coverage.kind === 'unavailable' && coverage.area === action.area
      }),
  )
  if (unavailable.length === 0 && standaloneActions.length === 0) return null
  return (
    <section className="review-areas" aria-labelledby="review-areas-title">
      <h2 id="review-areas-title">Check before relying on this plan</h2>
      <p>
        These items need a separate check because this plan cannot give a
        complete answer for them. They are not included in the count of dated
        actions.
      </p>
      {unavailable.length > 0 && (
        <div className="review-area-list">
          {unavailable.map(([key, title, group]) => {
            const coverage = evaluation.coverage[key]
            if (coverage.kind === 'available') return null
            const correctionGroup =
              evaluation.reviewActions.find(
                (action) => action.area === coverage.area,
              )?.correctionGroup ?? group
            return (
              <Card
                as="article"
                className="review-area review-area--unavailable"
                key={key}
              >
                <h3>{title}</h3>
                <p>{coverage.reason}</p>
                <p>{coverage.guidance}</p>
                {[
                  'gst-calendar-rules',
                  'gst-lut-rules',
                  'gst-rules-stale',
                ].includes(coverage.code) ? (
                  <ExternalLink href={GST_PORTAL_URL}>
                    Open GST portal
                  </ExternalLink>
                ) : (
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => onReview(correctionGroup)}
                  >
                    {reviewLabel(correctionGroup)}
                  </Button>
                )}
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
      <h2 id="needs-review-title">Saved action dates to check</h2>
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
              <h3>{completionLabel(item.record.obligationId)}</h3>
              <p>
                {item.reason} Date you entered:{' '}
                {formatDate(item.record.completedOn)}.
              </p>
            </div>
            <Button
              className="shrink-0 max-[520px]:mt-[.7rem]"
              variant="link"
              type="button"
              onClick={() => onDelete(item.record)}
            >
              {item.record.obligationId.startsWith('gst-qrmp-payment:')
                ? 'Remove review date'
                : 'Remove completion date'}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  )
}
