import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

export type SelectOption = {
  readonly value: string
  readonly label: string
}

type Month = {
  readonly year: number
  readonly month: number
}

function dateFromValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toISOString().slice(0, 10) === value ? date : null
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function monthFromDate(date: Date): Month {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() }
}

function monthFromValue(value: string) {
  const date = dateFromValue(value)
  return date ? monthFromDate(date) : null
}

function monthKey(month: Month) {
  return `${month.year}-${String(month.month + 1).padStart(2, '0')}`
}

function addMonths(month: Month, amount: number): Month {
  const date = new Date(Date.UTC(month.year, month.month + amount, 15))
  return monthFromDate(date)
}

function formatDateValue(value: string) {
  if (!dateFromValue(value)) return 'Choose a date'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(`${value}T00:00:00+05:30`))
}

function formatMonth(month: Month) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(month.year, month.month, 15)))
}

function isWithin(value: string, min?: string, max?: string) {
  return (!min || value >= min) && (!max || value <= max)
}

function useOutsideDismiss<T extends HTMLElement>(
  open: boolean,
  onDismiss: () => void,
) {
  const rootRef = useRef<T>(null)
  useEffect(() => {
    if (!open) return
    const dismiss = (event: Event) => {
      const target = event.target
      if (target instanceof Node && !rootRef.current?.contains(target))
        onDismiss()
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('focusin', dismiss)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('focusin', dismiss)
    }
  }, [onDismiss, open])
  return rootRef
}

export function SelectControl({
  id,
  value,
  options,
  describedBy,
  invalid = false,
  onChange,
}: {
  readonly id: string
  readonly value: string
  readonly options: readonly SelectOption[]
  readonly describedBy?: string
  readonly invalid?: boolean
  readonly onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selectedIndex = options.findIndex((option) => option.value === value)
  const [activeIndex, setActiveIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : 0,
  )
  const rootRef = useOutsideDismiss<HTMLDivElement>(open, () => setOpen(false))
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listId = `${id}-options`

  const openList = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }

  const choose = (option: SelectOption) => {
    onChange(option.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const move = (amount: number) => {
    setActiveIndex((current) =>
      Math.min(Math.max(current + amount, 0), options.length - 1),
    )
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) openList()
      else move(event.key === 'ArrowDown' ? 1 : -1)
    } else if (event.key === 'Home' && open) {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End' && open) {
      event.preventDefault()
      setActiveIndex(options.length - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!open) openList()
      else if (options[activeIndex]) choose(options[activeIndex])
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div className="custom-select" ref={rootRef}>
      <button
        ref={triggerRef}
        className="custom-select-trigger"
        id={id}
        type="button"
        role="combobox"
        aria-controls={listId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-activedescendant={
          open ? `${listId}-option-${activeIndex}` : undefined
        }
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        {options[selectedIndex]?.label ?? 'Choose an answer'}
      </button>
      {open && (
        <div className="custom-select-menu" id={listId} role="listbox">
          {options.map((option, index) => (
            <button
              className="custom-select-option"
              id={`${listId}-option-${index}`}
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function DatePicker({
  id,
  value,
  min,
  max,
  describedBy,
  invalid = false,
  clearable = false,
  onChange,
}: {
  readonly id: string
  readonly value: string
  readonly min?: string
  readonly max?: string
  readonly describedBy?: string
  readonly invalid?: boolean
  readonly clearable?: boolean
  readonly onChange: (value: string) => void
}) {
  const safeMin = min && dateFromValue(min) ? min : undefined
  const safeMax = max && dateFromValue(max) ? max : undefined
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Month>(
    () =>
      monthFromValue(value) ??
      monthFromValue(safeMin ?? '') ??
      monthFromValue(safeMax ?? '') ??
      monthFromDate(new Date()),
  )
  const rootRef = useOutsideDismiss<HTMLDivElement>(open, () => setOpen(false))
  const triggerRef = useRef<HTMLButtonElement>(null)
  const calendarId = `${id}-calendar`
  const firstDay = new Date(Date.UTC(month.year, month.month, 1)).getUTCDay()
  const leadingDays = (firstDay + 6) % 7
  const daysInMonth = new Date(
    Date.UTC(month.year, month.month + 1, 0),
  ).getUTCDate()
  const days = Array.from({ length: 42 }, (_, index) => {
    const day = index - leadingDays + 1
    if (day < 1 || day > daysInMonth) return null
    const date = new Date(Date.UTC(month.year, month.month, day))
    const dayValue = dateKey(date)
    return { day, value: dayValue }
  })
  const minMonth = safeMin ? monthFromValue(safeMin) : null
  const maxMonth = safeMax ? monthFromValue(safeMax) : null
  const canGoPrevious = !minMonth || monthKey(month) > monthKey(minMonth)
  const canGoNext = !maxMonth || monthKey(month) < monthKey(maxMonth)

  const choose = (nextValue: string) => {
    if (!isWithin(nextValue, safeMin, safeMax)) return
    const nextMonth = monthFromValue(nextValue)
    if (nextMonth) setMonth(nextMonth)
    onChange(nextValue)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const clear = () => {
    onChange('')
    setOpen(false)
    triggerRef.current?.focus()
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (
      event.key === 'Enter' ||
      event.key === ' ' ||
      event.key === 'ArrowDown'
    ) {
      event.preventDefault()
      setOpen(true)
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
    }
  }

  const onPopoverKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div className="date-picker" ref={rootRef}>
      <button
        ref={triggerRef}
        className="date-picker-trigger"
        id={id}
        type="button"
        aria-controls={calendarId}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
      >
        {formatDateValue(value)}
      </button>
      {open && (
        <div
          className="date-picker-popover"
          id={calendarId}
          role="dialog"
          aria-label="Choose a date"
          onKeyDown={onPopoverKeyDown}
        >
          <div className="date-picker-toolbar">
            <button
              className="date-picker-nav"
              type="button"
              aria-label="Previous month"
              disabled={!canGoPrevious}
              onClick={() => setMonth((current) => addMonths(current, -1))}
            >
              ‹
            </button>
            <strong>{formatMonth(month)}</strong>
            <button
              className="date-picker-nav"
              type="button"
              aria-label="Next month"
              disabled={!canGoNext}
              onClick={() => setMonth((current) => addMonths(current, 1))}
            >
              ›
            </button>
          </div>
          <div className="date-picker-weekdays" aria-hidden="true">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="date-picker-grid" role="grid">
            {days.map((item, index) =>
              item ? (
                <button
                  className="date-picker-day"
                  key={item.value}
                  type="button"
                  role="gridcell"
                  aria-label={formatDateValue(item.value)}
                  aria-selected={item.value === value}
                  disabled={!isWithin(item.value, safeMin, safeMax)}
                  onClick={() => choose(item.value)}
                >
                  {item.day}
                </button>
              ) : (
                <span
                  className="date-picker-day-spacer"
                  key={`empty-${index}`}
                  aria-hidden="true"
                />
              ),
            )}
          </div>
          {clearable && value && (
            <button className="text-button" type="button" onClick={clear}>
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  )
}
