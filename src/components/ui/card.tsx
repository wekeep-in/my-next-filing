import * as React from 'react'
import { cn } from 'cn'
import { AutoSize } from '@/components/auto-size'

function Card({
  as: Component = 'div',
  className,
  variant = 'default',
  children,
  ...props
}: React.ComponentProps<'div'> & {
  readonly as?: 'article' | 'div' | 'section'
  readonly variant?: 'default' | 'result'
}) {
  return (
    <Component
      data-slot="card"
      className={cn(
        'rounded-card border border-border bg-card text-card-foreground',
        variant === 'result' && 'p-[clamp(1.15rem,3vw,1.8rem)]',
        className,
      )}
      {...props}
    >
      {variant === 'result' ? <AutoSize>{children}</AutoSize> : children}
    </Component>
  )
}

export { Card }
