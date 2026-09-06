import { indiaDate } from '@/lib/india-date'
import { formatDate } from '@/lib/format'
import { canCompleteObligation } from '@/evaluation'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DatePicker } from '@/components/date-picker'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QrmpPaymentHelp } from '@/components/gst-help'
import { parseMoney } from '@/routes/check/model'
import { AmountInput } from '@/components/amount-input'
import type { Obligation } from '@/evaluation'
import type { DateOnly } from '@/rules'
import type { LoadSavedWorkspaceResult } from '@/workspace'

export type PlanEditor =
  | { readonly kind: 'completion'; readonly obligation: Obligation }
  | { readonly kind: 'payment'; readonly obligation: Obligation }

export function SaveNotice({
  onSave,
  onContinue,
}: {
  readonly onSave: () => void
  readonly onContinue: () => void
}) {
  return (
    <section className="save-notice" aria-label="Save data">
      <p>
        Save your answers and any completion dates you add in this browser.
        Anyone using this browser profile may be able to see them, so don't save
        on a shared browser.
      </p>
      <p>
        There is no account, sync, backup, or recovery. Private browsing or
        clearing site data may remove them. Read the{' '}
        <Link to="/#faqs">saved-data FAQs</Link>.
      </p>
      <div className="button-row">
        <Button className="max-[520px]:w-full" type="button" onClick={onSave}>
          Save data
        </Button>
        <Button
          className="max-[520px]:w-full"
          variant="outline"
          type="button"
          onClick={onContinue}
        >
          Cancel
        </Button>
      </div>
    </section>
  )
}

export function PaymentEditor({
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
  const [touched, setTouched] = useState(false)
  const parsed = parseMoney(value)
  const error = touched && 'error' in parsed ? parsed.error : ''
  const errorId = 'advance-tax-update-error'
  return (
    <Card className="inline-editor">
      {!embedded && <h3>How much advance tax have you paid?</h3>}
      <p>
        Enter the total advance tax already paid for this Tax Year. Your plan
        will be recalculated.
      </p>
      <label htmlFor="advance-tax-update">Total advance tax already paid</label>
      <div className="relative max-w-96">
        <span
          className="pointer-events-none absolute inset-y-0 left-[.9rem] z-10 flex items-center text-muted-foreground"
          aria-hidden="true"
        >
          ₹
        </span>
        <AmountInput
          className="pl-8"
          id="advance-tax-update"
          value={value}
          onBlur={() => setTouched(true)}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          onValueChange={(amount) => {
            setValue(amount)
            setTouched(true)
          }}
        />
      </div>
      {error && (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
      <div className="button-row">
        <Button
          className="max-[520px]:w-full"
          variant="outline"
          type="button"
          disabled={'error' in parsed}
          onClick={() => {
            if ('value' in parsed) onSubmit(String(parsed.value))
          }}
        >
          Save and recalculate
        </Button>
        <Button variant="link" type="button" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  )
}

export function CompletionEditor({
  obligation,
  initialDate,
  workspaceRevision,
  onSubmit,
  onCancel,
  embedded = false,
}: {
  readonly obligation: Obligation
  readonly initialDate: DateOnly
  readonly workspaceRevision: number | null
  readonly onSubmit: (date: DateOnly, revision: number | null) => void
  readonly onCancel?: () => void
  readonly embedded?: boolean
}) {
  const [baseRevision] = useState(workspaceRevision)
  const [date, setDate] = useState(initialDate)
  const [error, setError] = useState('')
  const inputId = `completion-date-${obligation.id.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
  const errorId = `${inputId}-error`
  const reviewed = obligation.kind === 'gst-qrmp-payment'
  const tooEarly = Boolean(
    obligation.completionNotBefore &&
    obligation.completionNotBefore > indiaDate(new Date()),
  )
  return (
    <Card
      className={`inline-editor${embedded ? ' inline-editor--embedded' : ''}`}
    >
      <p>
        {reviewed
          ? 'Choose the date you checked whether GST was due and made any required payment.'
          : 'Choose the date you completed this action. Your plan will update.'}
        {reviewed && (
          <>
            {' '}
            <QrmpPaymentHelp />
          </>
        )}
      </p>
      {tooEarly && (
        <p>
          You can record this action from{' '}
          {formatDate(obligation.completionNotBefore!)} after its filing period
          ends.
        </p>
      )}
      {baseRevision !== workspaceRevision && (
        <p role="status">
          Your saved workspace changed while this date editor was open. Reload
          the saved data before saving this date.
        </p>
      )}
      <div className="completion-controls">
        <div className="completion-field">
          <label htmlFor={inputId}>
            {reviewed ? 'Review date' : 'Completion date'}
          </label>
          <DatePicker
            id={inputId}
            value={date}
            min={obligation.completionNotBefore}
            max={indiaDate(new Date())}
            describedBy={error ? errorId : undefined}
            invalid={Boolean(error)}
            onChange={(value) => {
              setDate(value as DateOnly)
              setError('')
            }}
          />
          {error && (
            <p className="field-error" id={errorId} role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="button-row">
          <Button
            className="h-12 max-[520px]:w-full"
            variant="outline"
            type="button"
            disabled={tooEarly}
            onClick={() => {
              if (
                !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
                date > indiaDate(new Date()) ||
                !canCompleteObligation(obligation, date)
              )
                setError(
                  obligation.kind === 'gst-lut'
                    ? 'Choose a valid date on or after registration and no later than today.'
                    : obligation.completionNotBefore
                      ? 'Choose a valid date after the filing period ends and no later than today.'
                      : 'Choose a valid date no later than today.',
                )
              else onSubmit(date, baseRevision)
            }}
          >
            {reviewed ? 'Mark reviewed' : 'Mark completed'}
          </Button>
          {onCancel && (
            <Button variant="link" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export function DeleteNotice({
  onDelete,
  onCancel,
}: {
  readonly onDelete: () => void
  readonly onCancel: () => void
}) {
  return (
    <Card
      as="section"
      className="delete-notice"
      variant="result"
      aria-labelledby="delete-title"
      aria-live="polite"
    >
      <h2 id="delete-title">Delete saved data?</h2>
      <p>
        This removes your saved answers and completion dates from this browser,
        and your in-progress answers from this tab. Other tabs may retain their
        in-progress answers. This cannot be undone.
      </p>
      <div className="button-row">
        <Button
          className="max-[520px]:w-full"
          variant="destructive"
          type="button"
          onClick={onDelete}
        >
          Delete saved data
        </Button>
        <Button
          className="max-[520px]:w-full"
          variant="outline"
          type="button"
          onClick={onCancel}
        >
          Keep saved data
        </Button>
      </div>
    </Card>
  )
}

export function SavedDataState({
  savedWorkspace,
  onDelete,
}: {
  readonly savedWorkspace: LoadSavedWorkspaceResult
  readonly onDelete: () => void
}) {
  if (
    savedWorkspace.kind === 'invalid' ||
    savedWorkspace.kind === 'legacy' ||
    savedWorkspace.kind === 'legacy-removal-failed' ||
    savedWorkspace.kind === 'legacy-removal-unverified'
  )
    return (
      <Card
        as="section"
        className="stop-state"
        variant="result"
        aria-labelledby="saved-invalid-title"
      >
        <Badge variant="state">Saved data unavailable</Badge>
        <h1 id="saved-invalid-title">We couldn't restore your saved data</h1>
        <p>
          No estimate was calculated from it. Start an unsaved estimate, or
          delete the saved data and start again.
        </p>
        <div className="button-row">
          <Link
            className={buttonVariants({ className: 'max-[520px]:w-full' })}
            to="/check"
          >
            Start an unsaved estimate
          </Link>
          <Button
            className="max-[520px]:w-full"
            variant="outline"
            type="button"
            onClick={onDelete}
          >
            Delete saved data
          </Button>
        </div>
      </Card>
    )
  if (savedWorkspace.kind === 'unavailable')
    return (
      <Card
        as="section"
        className="stop-state"
        variant="result"
        aria-labelledby="saved-unavailable-title"
      >
        <Badge variant="state">Saving unavailable</Badge>
        <h1 id="saved-unavailable-title">You can continue in this tab</h1>
        <p>
          This browser did not make saved storage available. Your current work
          remains in this tab.
        </p>
        <div className="button-row">
          <Link
            className={buttonVariants({ className: 'max-[520px]:w-full' })}
            to="/check"
          >
            Start an unsaved estimate
          </Link>
          <Button
            className="max-[520px]:w-full"
            variant="outline"
            type="button"
            onClick={onDelete}
          >
            Try deleting saved data
          </Button>
        </div>
      </Card>
    )
  return null
}
