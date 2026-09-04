import * as React from 'react'
import { cn } from 'cn'

function Card({
  as: Component = 'div',
  className,
  variant = 'default',
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
        variant === 'result' &&
          'p-[clamp(1.15rem,3vw,1.8rem)] [&_h1]:leading-tight! [&_h2]:leading-tight! [&_h3]:leading-tight!',
        className,
      )}
      {...props}
    />
  )
}

export { Card }
