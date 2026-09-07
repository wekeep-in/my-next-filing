import { indiaDate } from '@/lib/india-date'
import { useId } from 'react'
import { ExternalLink } from '@/components/external-link'
import { GstFrequencyHelp, QrmpPaymentHelp } from '@/components/gst-help'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Obligation, SupportedResult, TaxEstimate } from '@/evaluation'
import { canCompleteObligation } from '@/evaluation'
import { formatDate, formatMoney } from '@/lib/format'
import { additionalIncomeFields } from '@/routes/check/model'
import { sourceRegistry } from '@/rules'
import type { DateOnly } from '@/rules'
import type { CompletionRecord } from '@/workspace'
import { CompletionEditor, PaymentEditor } from '@/routes/plan/editors'
import type { PlanEditor } from '@/routes/plan/editors'
import { ActionLinks } from '@/routes/plan/action-links'

const cardKickerClass =
  'mb-[.45rem] flex border-0 bg-transparent p-0 [font-size:.72rem] leading-[1.6] font-extrabold tracking-[.04em] text-muted-foreground uppercase'

function formatActionSummary(obligation: Obligation) {
  const prefix =
    obligation.kind === 'gst-lut'
      ? 'Before'
      : obligation.kind === 'gst-qrmp-payment'
        ? 'Normal review date'
        : obligation.kind === 'gst-gstr1' || obligation.kind === 'gst-gstr3b'
          ? 'Normally due by'
          : 'Due by'
  return (
    <>
      {obligation.kind === 'advance-tax' && (
        <>
          {obligation.amountDue === 0 ? (
            'No estimated amount left to pay.'
          ) : (
            <>
              <strong>{formatMoney(obligation.amountDue ?? 0)}</strong>{' '}
              estimated left to pay.
            </>
          )}{' '}
        </>
      )}
      {prefix} <strong>{formatDate(obligation.dueDate)}</strong>.
    </>
  )
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
  beforeExport = false,
}: {
  readonly status: Obligation['deadlineStatus']
  readonly beforeExport?: boolean
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
  return (
    <Badge variant={variants[status]}>
      {beforeExport && status === 'due-today'
        ? 'Before export today'
        : labels[status]}
    </Badge>
  )
}

export function CompletionStatus({
  completedOn,
  reviewed = false,
}: {
  readonly completedOn: DateOnly
  readonly reviewed?: boolean
}) {
  const descriptionId = useId()
  const description = `You marked this ${reviewed ? 'reviewed' : 'complete'} on ${formatDate(completedOn)}. My Next Filing cannot verify ${reviewed ? 'whether a payment was required or made' : 'government acceptance'}.`
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
          {reviewed ? 'Marked reviewed by you' : 'Completed'}
        </TooltipTrigger>
        <TooltipContent>{description}</TooltipContent>
      </Tooltip>
      <span className="sr-only" id={descriptionId}>
        {description}
      </span>
    </>
  )
}

export function TaxSummary({
  tax,
  annualReturn,
}: {
  readonly tax: TaxEstimate
  readonly annualReturn: SupportedResult['coverage']['annualReturn']
}) {
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
      {tax.equityGains &&
        (tax.equityGains.unusedShortTermLoss > 0 ||
          tax.equityGains.unusedLongTermLoss > 0) && (
          <section
            className="mt-6 border-t border-border pt-4"
            aria-labelledby="unused-equity-loss-title"
          >
            <h3 id="unused-equity-loss-title">Unused capital losses</h3>
            <p>
              Short-term: {formatMoney(tax.equityGains.unusedShortTermLoss)}.
              Long-term: {formatMoney(tax.equityGains.unusedLongTermLoss)}.
              These amounts do not reduce your salary, freelance income or other
              ordinary income.
            </p>
            {annualReturn.kind === 'available' &&
            annualReturn.value.lossCarryForward ? (
              <>
                <p>
                  To claim carry-forward, file a return reporting these losses
                  by {formatDate(annualReturn.value.dueDate)} and complete the
                  required return verification. Carry-forward also depends on
                  determination of the loss.
                </p>
                <p>
                  Unused short-term losses may offset future capital gains;
                  unused long-term losses may offset only future long-term
                  gains, for up to{' '}
                  {annualReturn.value.lossCarryForward.maximumYears} tax years
                  immediately following this Tax Year. This is an estimate, not
                  an approved loss balance. This version does not apply
                  brought-forward losses.
                </p>
              </>
            ) : (
              <p>
                Review the filing deadline and carry-forward conditions using
                the official return guidance. This part of your plan is
                unavailable; zero capital-gains tax does not establish that your
                losses can be carried forward.
              </p>
            )}
            <SourceReferences ids={annualReturn.sourceIds} />
          </section>
        )}
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
          {tax.additionalIncome &&
            additionalIncomeFields.map(({ key, label: incomeLabel }) => (
              <div key={key}>
                <dt>{incomeLabel}</dt>
                <dd>{formatMoney(tax.additionalIncome![key])}</dd>
              </div>
            ))}
          {tax.rentalIncome && (
            <>
              <div>
                <dt>Property annual value before municipal taxes</dt>
                <dd>{formatMoney(tax.rentalIncome.rentalAnnualValue)}</dd>
              </div>
              <div>
                <dt>Municipal taxes paid</dt>
                <dd>{formatMoney(tax.rentalIncome.rentalMunicipalTaxes)}</dd>
              </div>
              <div>
                <dt>Net annual value</dt>
                <dd>{formatMoney(tax.rentalIncome.netAnnualValue)}</dd>
              </div>
              <div>
                <dt>Property standard deduction</dt>
                <dd>{formatMoney(tax.rentalIncome.standardDeduction)}</dd>
              </div>
              <div>
                <dt>Eligible property-loan interest</dt>
                <dd>{formatMoney(tax.rentalIncome.rentalInterest)}</dd>
              </div>
              <div>
                <dt>Taxable rental income</dt>
                <dd>{formatMoney(tax.rentalIncome.taxableIncome)}</dd>
              </div>
            </>
          )}
          {tax.equityGains && (
            <>
              <div>
                <dt>Short-term equity gains before loss adjustment</dt>
                <dd>{formatMoney(tax.equityGains.shortTermGains)}</dd>
              </div>
              <div>
                <dt>Long-term equity gains before loss adjustment</dt>
                <dd>{formatMoney(tax.equityGains.longTermGains)}</dd>
              </div>
              {(tax.equityGains.shortTermLosses > 0 ||
                tax.equityGains.longTermLosses > 0) && (
                <>
                  <div>
                    <dt>Current-year short-term losses available</dt>
                    <dd>{formatMoney(tax.equityGains.shortTermLosses)}</dd>
                  </div>
                  <div>
                    <dt>Current-year long-term losses available</dt>
                    <dd>{formatMoney(tax.equityGains.longTermLosses)}</dd>
                  </div>
                  <div>
                    <dt>Long-term losses used against long-term gains</dt>
                    <dd>
                      −
                      {formatMoney(tax.equityGains.longTermLossAgainstLongTerm)}
                    </dd>
                  </div>
                  <div>
                    <dt>Short-term losses used against short-term gains</dt>
                    <dd>
                      −
                      {formatMoney(
                        tax.equityGains.shortTermLossAgainstShortTerm,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Short-term losses used against long-term gains</dt>
                    <dd>
                      −
                      {formatMoney(
                        tax.equityGains.shortTermLossAgainstLongTerm,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Short-term gains after loss adjustment</dt>
                    <dd>{formatMoney(tax.equityGains.netShortTermGains)}</dd>
                  </div>
                  <div>
                    <dt>Long-term gains after loss adjustment</dt>
                    <dd>{formatMoney(tax.equityGains.netLongTermGains)}</dd>
                  </div>
                  <div>
                    <dt>Unused short-term capital loss</dt>
                    <dd>{formatMoney(tax.equityGains.unusedShortTermLoss)}</dd>
                  </div>
                  <div>
                    <dt>Unused long-term capital loss</dt>
                    <dd>{formatMoney(tax.equityGains.unusedLongTermLoss)}</dd>
                  </div>
                </>
              )}
            </>
          )}
          {tax.salary && (
            <>
              <div>
                <dt>Salary before standard deduction</dt>
                <dd>{formatMoney(tax.salary.grossSalary)}</dd>
              </div>
              <div>
                <dt>Salary standard deduction</dt>
                <dd className="whitespace-nowrap">
                  −{formatMoney(tax.salary.standardDeduction)}
                </dd>
              </div>
              <div>
                <dt>Taxable salary</dt>
                <dd>{formatMoney(tax.salary.taxableSalary)}</dd>
              </div>
            </>
          )}
          {tax.employerNpsContributions !== null && (
            <>
              <div>
                <dt>Employer NPS already included in salary</dt>
                <dd>{formatMoney(tax.employerNpsContributions)}</dd>
              </div>
              <div>
                <dt>Income before employer NPS deduction</dt>
                <dd>{formatMoney(tax.incomeBeforeNpsDeduction)}</dd>
              </div>
              <div>
                <dt>Employer NPS deduction</dt>
                <dd>−{formatMoney(tax.employerNpsDeduction)}</dd>
              </div>
            </>
          )}
          <div>
            <dt>Rounded total income</dt>
            <dd>{formatMoney(tax.roundedTotalIncome)}</dd>
          </div>
          {tax.equityGains && (
            <>
              <div>
                <dt>Ordinary income for slab tax</dt>
                <dd>{formatMoney(tax.ordinaryIncome)}</dd>
              </div>
              <div>
                <dt>Basic exemption used against equity gains</dt>
                <dd>{formatMoney(tax.equityGains.basicExemptionUsed)}</dd>
              </div>
              <div>
                <dt>Long-term gains within the annual threshold</dt>
                <dd>{formatMoney(tax.equityGains.longTermThresholdUsed)}</dd>
              </div>
              <div>
                <dt>Short-term gains taxed at 20%</dt>
                <dd>{formatMoney(tax.equityGains.taxableShortTermGains)}</dd>
              </div>
              <div>
                <dt>Long-term gains taxed at 12.5%</dt>
                <dd>{formatMoney(tax.equityGains.taxableLongTermGains)}</dd>
              </div>
              <div>
                <dt>Short-term equity tax at 20%</dt>
                <dd>{formatMoney(tax.equityGains.shortTermTax)}</dd>
              </div>
              <div>
                <dt>Long-term equity tax at 12.5%</dt>
                <dd>{formatMoney(tax.equityGains.longTermTax)}</dd>
              </div>
            </>
          )}
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
        ids={[
          'section-202',
          'section-156',
          'finance-act-2026',
          ...(tax.salary ? ['domestic-salary-2026'] : []),
          ...(tax.additionalIncome ? ['domestic-investment-income-2026'] : []),
          ...(tax.rentalIncome ? ['domestic-rental-income-2026'] : []),
          ...(tax.equityGains ? ['domestic-equity-gains-2026'] : []),
        ]}
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
  if (gst.status === 'calendar')
    return (
      <Card as="article" className="coverage-card min-w-0" variant="result">
        <Badge variant="outline" className={cardKickerClass}>
          GST filing calendar
        </Badge>
        <h2>Your GST return dates are in the agenda</h2>
        <p>
          {gst.actionCount} return and payment-review actions for your confirmed
          filing periods in {gst.state}.
        </p>
        <p>
          Dates follow the normal statutory schedule. Check the GST portal for
          notified extensions. This plan does not calculate GST payable, credits
          or refunds. <GstFrequencyHelp />
        </p>
        <SourceReferences ids={coverage.sourceIds} />
      </Card>
    )
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
  editor,
  onPaymentSubmit,
  onCompletionSubmit,
  workspaceRevision,
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
  readonly editor: PlanEditor | null
  readonly onPaymentSubmit: (value: string) => void
  readonly onCompletionSubmit: (
    obligation: Obligation,
    date: DateOnly,
    revision?: number | null,
  ) => void
  readonly workspaceRevision: number | null
  readonly onEditorCancel: () => void
  readonly onUpdatePayment: () => void
  readonly onChangeDate: (obligation: Obligation) => void
  readonly onUndo: (obligation: Obligation) => void
}) {
  const savedCompletion = next
    ? completions.find((record) => record.obligationId === next.id)
    : undefined
  const completion =
    savedCompletion &&
    next &&
    canCompleteObligation(next, savedCompletion.completedOn)
      ? savedCompletion
      : undefined
  const today = indiaDate(new Date())
  const needsPayment = next?.kind === 'advance-tax' && (next.amountDue ?? 0) > 0
  const actions = (editor ||
    (!completion && saved && next) ||
    (!saved && !isExample && (onSave || next?.kind === 'advance-tax'))) && (
    <div className="attention-action">
      {!editor && !saved && !isExample && next?.kind === 'advance-tax' && (
        <Button variant="link" onClick={onUpdatePayment}>
          Update amount paid
        </Button>
      )}
      {editor?.kind === 'payment' && (
        <PaymentEditor
          current={advanceTaxPaid}
          onSubmit={onPaymentSubmit}
          onCancel={onEditorCancel}
          embedded={editor.obligation.id === next?.id}
        />
      )}
      {editor?.kind === 'completion' && (
        <CompletionEditor
          workspaceRevision={workspaceRevision}
          key={editor.obligation.id}
          obligation={editor.obligation}
          initialDate={
            completions.find(
              (record) => record.obligationId === editor.obligation.id,
            )?.completedOn ?? today
          }
          onSubmit={(date, revision) =>
            onCompletionSubmit(editor.obligation, date, revision)
          }
          onCancel={onEditorCancel}
          embedded={editor.obligation.id === next?.id}
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
      {!editor && saved && next && !completion && !needsPayment && (
        <CompletionEditor
          workspaceRevision={workspaceRevision}
          key={next.id}
          obligation={next}
          initialDate={today}
          onSubmit={(date, revision) =>
            onCompletionSubmit(next, date, revision)
          }
          embedded
        />
      )}
      {!editor && !saved && !isExample && onSave && (
        <Button
          className="min-h-11"
          variant="link"
          type="button"
          onClick={onSave}
        >
          Save data in this browser
        </Button>
      )}
    </div>
  )
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
        {actions}
      </Card>
    )
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
      <h2 id="attention-title" tabIndex={-1}>
        {next.title}
      </h2>
      <p className="attention-summary">{formatActionSummary(next)}</p>
      {completion && !needsPayment && !editor ? (
        <div className="completion-state">
          <p>
            <strong>
              You marked this{' '}
              {next.kind === 'gst-qrmp-payment' ? 'reviewed' : 'complete'} on{' '}
              {formatDate(completion.completedOn)}.
            </strong>{' '}
            {next.kind === 'gst-qrmp-payment'
              ? 'My Next Filing cannot verify whether a payment was required or made.'
              : 'My Next Filing cannot verify government acceptance.'}
          </p>
          <div className="button-row">
            <Button
              className="max-[520px]:w-full"
              variant="outline"
              type="button"
              onClick={() => onChangeDate(next)}
            >
              {next.kind === 'gst-qrmp-payment'
                ? 'Change review date'
                : 'Change completion date'}
            </Button>
            <Button variant="link" type="button" onClick={() => onUndo(next)}>
              {next.kind === 'gst-qrmp-payment'
                ? 'Remove review'
                : 'Remove completion'}
            </Button>
          </div>
        </div>
      ) : null}
      <ActionLinks kind={next.kind} prominent>
        <details className="action-reason">
          <summary>Why this action</summary>
          <p>
            {next.reasons[0]}
            {next.kind === 'gst-qrmp-payment' && (
              <>
                {' '}
                <QrmpPaymentHelp />
              </>
            )}
          </p>
        </details>
      </ActionLinks>
      <SourceReferences ids={next.statutorySourceIds} />
      {actions}
      {!saved && isExample && (
        <p className="attention-example">
          This fictional example cannot be saved or marked complete.
        </p>
      )}
    </Card>
  )
}
