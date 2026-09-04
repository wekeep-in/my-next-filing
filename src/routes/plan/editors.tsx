import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DatePicker } from '../../components/date-picker.tsx'
import { Badge } from '../../components/ui/badge.tsx'
import { Button, buttonVariants } from '../../components/ui/button.tsx'
import { Card } from '../../components/ui/card.tsx'
import { Input } from '../../components/ui/input.tsx'
import type { Obligation } from '../../evaluation/index.ts'
import type { DateOnly } from '../../rules/index.ts'
import type { LoadSavedWorkspaceResult } from '../../workspace/index.ts'

export type PlanEditor =
  | { readonly kind: 'completion'; readonly obligation: Obligation }
  | { readonly kind: 'payment'; readonly obligation: Obligation }

export function todayInIndia(): DateOnly {
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
        clearing site data may remove them. Read more{' '}
        <Link
          className={buttonVariants({
            variant: 'link',
            className: '[font-size:inherit]',
          })}
          to="/#faqs"
        >
          here
        </Link>
        .
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
  const [error, setError] = useState('')
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
        <Input
          className="pl-[2rem]"
          id="advance-tax-update"
          inputMode="numeric"
          value={value}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            setValue(event.target.value)
            setError('')
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
  const errorId = `${inputId}-error`
  return (
    <Card
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
            onClick={() => {
              if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > todayInIndia())
                setError('Choose a valid date no later than today.')
              else onSubmit(date)
            }}
          >
            Mark completed
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
        This removes your saved answers and completion dates from this browser.
        You can continue with an unsaved estimate. This cannot be undone.
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
  if (savedWorkspace.kind === 'invalid')
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
          This browser did not make saved storage available. Nothing was changed
          or deleted.
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
