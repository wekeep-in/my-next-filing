import { useRef, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

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
  return monthFromDate(new Date(Date.UTC(month.year, month.month + amount, 15)))
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

export function DatePicker({
  id,
  label,
  value,
  min,
  max,
  describedBy,
  invalid = false,
  clearable = false,
  onChange,
}: {
  readonly id: string
  readonly label?: string
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstDay = new Date(Date.UTC(month.year, month.month, 1)).getUTCDay()
  const leadingDays = (firstDay + 6) % 7
  const daysInMonth = new Date(
    Date.UTC(month.year, month.month + 1, 0),
  ).getUTCDate()
  const days = Array.from({ length: 42 }, (_, index) => {
    const day = index - leadingDays + 1
    if (day < 1 || day > daysInMonth) return null
    const dayValue = dateKey(new Date(Date.UTC(month.year, month.month, day)))
    return { day, value: dayValue }
  })
  const minMonth = safeMin ? monthFromValue(safeMin) : null
  const maxMonth = safeMax ? monthFromValue(safeMax) : null
  const canGoPrevious = !minMonth || monthKey(month) > monthKey(minMonth)
  const canGoNext = !maxMonth || monthKey(month) < monthKey(maxMonth)

  const close = () => {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const choose = (nextValue: string) => {
    if (!isWithin(nextValue, safeMin, safeMax)) return
    onChange(nextValue)
    close()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        ref={triggerRef}
        id={id}
        aria-label={label ? `${label}: ${formatDateValue(value)}` : undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className="group flex min-h-12 w-full items-center justify-between gap-4 rounded-control border border-input bg-card px-[.85rem] py-[.7rem] text-left leading-[1.1] text-foreground outline-none focus-visible:border-ring focus-visible:ring-[.2rem] focus-visible:ring-ring/15"
      >
        {label ? (
          <span className="flex min-w-0 items-baseline gap-[.65rem]">
            <span className="shrink-0 font-extrabold">{label}</span>
            <span className="truncate text-muted-foreground">
              {formatDateValue(value)}
            </span>
          </span>
        ) : (
          formatDateValue(value)
        )}
        <ChevronDownIcon className="size-4 shrink-0 text-foreground transition-transform duration-160 ease-app-out group-data-popup-open:rotate-180 motion-reduce:transition-none" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={0}
        sideOffset={6}
        className="z-140 w-[min(20rem,100vw)] gap-[.65rem] overflow-hidden rounded-control border border-border p-[.3rem] shadow-panel ring-0 duration-160 ease-app-out motion-reduce:animate-none data-open:fade-in-0 data-open:zoom-in-[.97] data-closed:fade-out-0 data-closed:zoom-out-[.97]"
      >
        <PopoverTitle className="sr-only">Choose a date</PopoverTitle>
        <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center text-center">
          <Button
            aria-label="Previous month"
            className="size-11 min-h-11 rounded-[.55rem] p-0"
            disabled={!canGoPrevious}
            size="icon"
            type="button"
            variant="outline"
            onClick={() => setMonth((current) => addMonths(current, -1))}
          >
            ‹
          </Button>
          <strong className="text-[.95rem] text-foreground">
            {formatMonth(month)}
          </strong>
          <Button
            aria-label="Next month"
            className="size-11 min-h-11 rounded-[.55rem] p-0"
            disabled={!canGoNext}
            size="icon"
            type="button"
            variant="outline"
            onClick={() => setMonth((current) => addMonths(current, 1))}
          >
            ›
          </Button>
        </div>
        <div
          className="grid grid-cols-7 text-center text-[.72rem] font-extrabold text-muted-foreground"
          aria-hidden="true"
        >
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((item, index) =>
            item ? (
              <Button
                aria-label={formatDateValue(item.value)}
                aria-pressed={item.value === value}
                className="size-auto min-h-11 w-full min-w-11 rounded-option border-0 p-[.35rem] font-normal text-foreground active:not-focus-visible:scale-100 disabled:text-strong-border disabled:opacity-60 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                disabled={!isWithin(item.value, safeMin, safeMax)}
                key={item.value}
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => choose(item.value)}
              >
                {item.day}
              </Button>
            ) : (
              <span
                className="min-h-11 min-w-11"
                key={`empty-${index}`}
                aria-hidden="true"
              />
            ),
          )}
        </div>
        {clearable && value && (
          <Button
            className="justify-self-start"
            variant="link"
            type="button"
            onClick={() => {
              onChange('')
              close()
            }}
          >
            Clear date
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
