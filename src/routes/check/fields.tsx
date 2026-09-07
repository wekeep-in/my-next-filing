import { taxYearShort } from '@/lib/tax-period'
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SelectControl } from '@/components/select-control'
import { Badge } from '@/components/ui/badge'
import { AmountInput } from '@/components/amount-input'
import { FieldHelp } from '@/components/field-help'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { TAX_YEAR } from '@/rules'
import type { DraftAmountKey } from '@/routes/check/model'
import { optionLabels } from '@/routes/check/model'

const defaultChoiceOptions = ['yes', 'no', 'not-sure'] as const
export const CoverageWarnings = createContext<Readonly<Record<string, string>>>(
  {},
)
export const FieldWarnings = createContext<Readonly<Record<string, string>>>({})

export function FieldError({
  id,
  error,
}: {
  readonly id: string
  readonly error?: string
}) {
  const warning = useContext(FieldWarnings)[id.replace(/-error$/, '')]
  const coverage = useContext(CoverageWarnings)[id.replace(/-error$/, '')]
  return (
    <>
      {warning && (
        <p
          className="choice-warning"
          id={id.replace(/-error$/, '-unsupported')}
          role="alert"
        >
          <strong>Outside this version.</strong> {warning}{' '}
          <Link to="/#faq-tax-support">See what this version supports</Link>.
        </p>
      )}
      {coverage && (
        <p
          className="choice-warning"
          id={id.replace(/-error$/, '-coverage')}
          role="status"
        >
          <strong>Partial plan.</strong> {coverage} Your income-tax estimate
          remains available.
        </p>
      )}
      {error ? (
        <p className="field-error" id={id} role="alert">
          {error}
        </p>
      ) : null}
    </>
  )
}

export function ChoiceField({
  id,
  label,
  help,
  value,
  options = defaultChoiceOptions,
  labels,
  error,
  onChange,
}: {
  readonly id: string
  readonly label: string
  readonly help?: ReactNode
  readonly value: string
  readonly options?: readonly string[]
  readonly labels?: Readonly<Record<string, string>>
  readonly error?: string
  readonly onChange: (value: string) => void
}) {
  const describedBy = [
    help ? `${id}-help` : '',
    error ? `${id}-error` : '',
    useContext(FieldWarnings)[id] ? `${id}-unsupported` : '',
    useContext(CoverageWarnings)[id] ? `${id}-coverage` : '',
  ]
    .filter(Boolean)
    .join(' ')
  const selectedUnsupported = Boolean(useContext(FieldWarnings)[id])
  const unsupportedId = `${id}-unsupported`
  return (
    <fieldset
      id={id}
      tabIndex={-1}
      className="field choice-field"
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy || undefined}
    >
      <legend id={`${id}-legend`}>{label}</legend>
      {help && (
        <div className="field-help text-muted-foreground" id={`${id}-help`}>
          {help}
        </div>
      )}
      <RadioGroup
        aria-labelledby={`${id}-legend`}
        className="choice-grid"
        name={id}
        value={value}
        onValueChange={onChange}
      >
        {options.map((option) => {
          const unsupported = selectedUnsupported && option === value
          return (
            <label
              className={`choice-card${unsupported ? ' choice-card--unsupported' : ''}`}
              key={option}
            >
              <RadioGroupItem
                value={option}
                tone={unsupported ? 'warning' : 'default'}
                aria-describedby={unsupported ? unsupportedId : undefined}
              />
              <span>{labels?.[option] ?? optionLabels[option] ?? option}</span>
            </label>
          )
        })}
      </RadioGroup>
      <FieldError id={`${id}-error`} error={error} />
    </fieldset>
  )
}

export function SelectField({
  id,
  label,
  help,
  value,
  options,
  error,
  onChange,
}: {
  readonly id: string
  readonly label: string
  readonly help?: ReactNode
  readonly value: string
  readonly options: readonly {
    readonly value: string
    readonly label: string
  }[]
  readonly error?: string
  readonly onChange: (value: string) => void
}) {
  const describedBy = [
    help ? `${id}-help` : '',
    error ? `${id}-error` : '',
    useContext(FieldWarnings)[id] ? `${id}-unsupported` : '',
    useContext(CoverageWarnings)[id] ? `${id}-coverage` : '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {help && (
        <p className="field-help" id={`${id}-help`}>
          {help}
        </p>
      )}
      <SelectControl
        id={id}
        value={value}
        describedBy={describedBy || undefined}
        invalid={Boolean(error)}
        options={options}
        onChange={onChange}
      />
      <FieldError id={`${id}-error`} error={error} />
    </div>
  )
}

export function MoneyField({
  id,
  label,
  help,
  tooltipLabel,
  value,
  error,
  onChange,
}: {
  readonly id:
    | DraftAmountKey
    | `employerNpsEmployers.${number}.${'contribution' | 'eligibleSalary'}`
  readonly label: ReactNode
  readonly help: ReactNode
  readonly tooltipLabel?: string
  readonly value: string
  readonly error?: string
  readonly onChange: (value: string) => void
}) {
  const warning = useContext(FieldWarnings)[id]
  return (
    <div className="field">
      {tooltipLabel ? (
        <div className="mb-3 flex min-h-7 items-center gap-1">
          <label htmlFor={id}>{label}</label>
          <FieldHelp id={id} label={tooltipLabel}>
            {help}
          </FieldHelp>
        </div>
      ) : (
        <>
          <label htmlFor={id}>{label}</label>
          <p className="field-help" id={`${id}-help`}>
            {help}
          </p>
        </>
      )}
      <div className="flex items-center overflow-hidden rounded-control border border-input bg-card focus-within:border-ring focus-within:ring-[.2rem] focus-within:ring-ring/15">
        <span className="pl-[.9rem] text-muted-foreground" aria-hidden="true">
          ₹
        </span>
        <AmountInput
          id={id}
          autoComplete="off"
          className="rounded-none border-0 focus-visible:border-0 focus-visible:ring-0"
          value={value}
          aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}${warning ? ` ${id}-unsupported` : ''}`}
          aria-invalid={Boolean(error)}
          onValueChange={onChange}
        />
      </div>
      <FieldError id={`${id}-error`} error={error} />
    </div>
  )
}

export function CheckHeading({
  title,
  description,
  first = false,
}: {
  readonly title: string
  readonly description?: string
  readonly first?: boolean
}) {
  return (
    <header className="question-heading">
      <Badge className="mb-[.85rem]" variant="period">
        {first ? `Tax year ${taxYearShort}` : TAX_YEAR}
      </Badge>
      <h1 id="check-title" tabIndex={-1}>
        {title}
      </h1>
      {description && <p>{description}</p>}
    </header>
  )
}
