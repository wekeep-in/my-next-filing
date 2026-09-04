import { useId } from 'react'
import { ExternalLink } from '@/components/external-link'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Obligation, SupportedResult, TaxEstimate } from '@/evaluation'
import { formatDate, formatMoney } from '@/lib/format'
import { sourceRegistry } from '@/rules'
import type { DateOnly } from '@/rules'
import type { CompletionRecord } from '@/workspace'
import {
  CompletionEditor,
  PaymentEditor,
  SaveNotice,
  todayInIndia,
} from '@/routes/plan/editors'
import type { PlanEditor } from '@/routes/plan/editors'

const cardKickerClass =
  'mb-[.45rem] flex border-0 bg-transparent p-0 [font-size:.72rem] leading-[1.6] font-extrabold tracking-[.04em] text-muted-foreground uppercase'

function formatDeadline(date: DateOnly) {
  return `Due ${formatDate(date)}`
}

export function SourceLinks({ ids }: { readonly ids: readonly string[] }) {
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

export function SourceReferences({ ids }: { readonly ids: readonly string[] }) {
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

export function StatusPill({
  status,
}: {
  readonly status: Obligation['deadlineStatus']
}) {
  const labels = {
    upcoming: 'Upcoming',
    'due-today': 'Due today',
    'deadline-passed': 'Deadline passed',
  } as const
  const variants = {
    upcoming: 'upcoming',
    'due-today': 'warning',
    'deadline-passed': 'destructive',
  } as const
  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}

export function CompletionStatus({
  completedOn,
}: {
  readonly completedOn: DateOnly
}) {
  const descriptionId = useId()
  const description = `You marked this complete on ${formatDate(completedOn)}. My Next Filing cannot verify government acceptance.`
  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Badge
              aria-describedby={descriptionId}
              className="relative cursor-help after:absolute after:top-1/2 after:left-1/2 after:min-h-11 after:min-w-11 after:-translate-1/2 after:content-['']"
              tabIndex={0}
            />
          }
        >
          Completed
        </TooltipTrigger>
        <TooltipContent>{description}</TooltipContent>
      </Tooltip>
      <span className="sr-only" id={descriptionId}>
        {description}
      </span>
    </>
  )
}

export function TaxSummary({ tax }: { readonly tax: TaxEstimate }) {
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
    <Card as="article" className="tax-summary min-w-0" variant="result">
      <Badge variant="outline" className={cardKickerClass}>
        {label}
      </Badge>
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
    </Card>
  )
}

export function GstCard({
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
    <Card as="article" className="coverage-card min-w-0" variant="result">
      <Badge variant="outline" className={cardKickerClass}>
        GST registration
      </Badge>
      <h2>{title}</h2>
      <p>{message}</p>
      {gst.registrationRequired && (
        <p className="coverage-note">
          Your agenda includes registration only when you provide the date on
          which liability arose.
        </p>
      )}
      <SourceReferences ids={coverage.sourceIds} />
    </Card>
  )
}

export function AttentionCard({
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
      <Card as="section" className="attention-card" variant="result">
        <Badge variant="outline" className={cardKickerClass}>
          Next action
        </Badge>
        <h2>No dated actions in your plan</h2>
        <p>
          This plan does not show any open filing or payment dates. Check any
          items below before relying on it.
        </p>
      </Card>
    )
  const needsPayment = next.kind === 'advance-tax' && (next.amountDue ?? 0) > 0
  return (
    <Card
      as="section"
      className="attention-card"
      variant="result"
      aria-labelledby="attention-title"
    >
      <Badge variant="outline" className={cardKickerClass}>
        Next action
      </Badge>
      <h2 id="attention-title">{next.title}</h2>
      <p>{next.reasons[0]}</p>
      <div className="attention-meta">
        {next.kind === 'advance-tax' && (
          <span className="text-[1.1rem] font-extrabold text-foreground">
            {next.amountDue === 0
              ? 'No estimated amount left to pay'
              : `${formatMoney(next.amountDue ?? 0)} estimated left to pay`}
          </span>
        )}
        <span className="text-[1.1rem] font-extrabold text-foreground">
          {formatDeadline(next.dueDate)}
        </span>
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
            <Button
              className="max-[520px]:w-full"
              variant="outline"
              type="button"
              onClick={() => onChangeDate(next)}
            >
              Change date
            </Button>
            <Button variant="link" type="button" onClick={() => onUndo(next)}>
              Remove completion
            </Button>
          </div>
        </div>
      ) : !saved && isExample ? (
        <Alert
          className="mt-4 mb-(--text-journey) text-journey leading-[1.6] text-warning"
          role={undefined}
        >
          This fictional example cannot be saved or marked complete.
        </Alert>
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
            <Button
              className="max-[520px]:w-full"
              variant="outline"
              type="button"
              onClick={onUpdatePayment}
            >
              Update amount paid
            </Button>
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
              <Button
                className="max-[520px]:w-full"
                variant="outline"
                type="button"
                onClick={onSave}
              >
                Save data in this browser
              </Button>
            ))}
        </div>
      )}
    </Card>
  )
}
