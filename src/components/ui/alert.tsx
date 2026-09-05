import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

const alertVariants = cva(
  'w-full rounded-control border px-[.9rem] py-3 text-left text-sm',
  {
    variants: {
      variant: {
        default: 'border-warning-border bg-warning-surface text-warning',
        warning: 'border-warning-border bg-warning-surface text-warning',
        info: 'border-border bg-card text-foreground',
        example: 'border-primary bg-primary font-bold text-primary-foreground',
        destructive:
          'border-destructive bg-destructive-surface text-destructive',
        success:
          'border-success-border bg-success-surface text-success-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'font-bold text-current [&_a]:underline [&_a]:underline-offset-[.17em]',
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-sm text-current [&_a]:underline [&_a]:underline-offset-[.17em]',
        className,
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-action"
      className={cn('mt-2', className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
