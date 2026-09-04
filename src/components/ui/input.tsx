import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'
import { cn } from 'cn'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'min-h-12 w-full min-w-0 rounded-control border border-input bg-card px-[.85rem] py-[.7rem] text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[.2rem] focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
