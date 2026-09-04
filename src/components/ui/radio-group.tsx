import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { cn } from 'cn'

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('flex w-full flex-wrap gap-[.55rem]', className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  tone = 'default',
  ...props
}: RadioPrimitive.Root.Props & {
  readonly tone?: 'default' | 'warning'
}) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        'relative grid aspect-square size-3.5 shrink-0 place-items-center rounded-full border border-strong-border bg-card p-0 leading-none outline-none after:absolute after:-inset-[.9375rem] focus-visible:border-ring focus-visible:outline-[.2rem] focus-visible:outline-solid focus-visible:outline-offset-[.2rem] focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-destructive data-checked:border-primary',
        tone === 'warning' && 'data-checked:border-warning',
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="pointer-events-none absolute inset-0 grid place-items-center"
      >
        <span
          className={cn(
            'block size-2 rounded-full bg-primary',
            tone === 'warning' && 'bg-warning',
          )}
        />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
