import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type SelectOption = {
  readonly value: string
  readonly label: string
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
  return (
    <Select
      items={options}
      value={value || null}
      onValueChange={(next) => {
        if (typeof next === 'string') onChange(next)
      }}
    >
      <SelectTrigger
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className="min-h-12 w-full rounded-control border-input bg-card px-[.85rem] py-[.7rem] text-base leading-[1.1] text-foreground focus-visible:border-ring focus-visible:ring-[.2rem] focus-visible:ring-ring/15"
      >
        <SelectValue placeholder="Choose an answer" />
      </SelectTrigger>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        sideOffset={6}
        className="z-140 rounded-control border border-border p-[.35rem] shadow-panel ring-0 duration-160 ease-app-out motion-reduce:animate-none data-open:fade-in-0 data-open:zoom-in-[.97] data-closed:fade-out-0 data-closed:zoom-out-[.97]"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="min-h-11 rounded-option px-[.7rem] py-[.65rem] text-base leading-[1.3] focus:bg-accent data-selected:bg-accent data-selected:font-bold [&_svg]:hidden"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
