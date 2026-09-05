import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { parseMoney } from '@/routes/check/model'

export function formatAmountEdit(raw: string, caret: number, inputType = '') {
  const parsed = parseMoney(raw)
  if ('error' in parsed || !/\d/.test(raw)) return { value: raw, caret }
  const value = parsed.value.toLocaleString('en-IN')
  let digitsAfter = raw.slice(caret).replace(/\D/g, '').length
  let nextCaret = value.length
  while (nextCaret > 0 && digitsAfter > 0) {
    if (/\d/.test(value[nextCaret - 1])) digitsAfter--
    nextCaret--
  }
  // Backspace must move past a restored comma so repeated deletion keeps working.
  if (inputType === 'deleteContentBackward' && value[nextCaret - 1] === ',')
    nextCaret--
  return { value, caret: nextCaret }
}

export function AmountInput({
  value,
  onValueChange,
  ...props
}: Omit<
  ComponentProps<typeof Input>,
  'type' | 'inputMode' | 'value' | 'onChange' | 'onCompositionEnd'
> & {
  readonly value: string
  readonly onValueChange: (value: string) => void
}) {
  const update = (input: HTMLInputElement, event: Event) => {
    if (event instanceof InputEvent && event.isComposing) {
      onValueChange(input.value)
      return
    }
    const next = formatAmountEdit(
      input.value,
      input.selectionStart ?? input.value.length,
      event instanceof InputEvent ? event.inputType : '',
    )
    // Update before React commits the controlled value, keeping its caret intact.
    input.value = next.value
    input.setSelectionRange(next.caret, next.caret)
    onValueChange(next.value)
  }
  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(event) => update(event.currentTarget, event.nativeEvent)}
      onCompositionEnd={(event) =>
        update(event.currentTarget, event.nativeEvent)
      }
    />
  )
}
