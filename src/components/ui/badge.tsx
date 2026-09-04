import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

const badgeVariants = cva(
  'inline-flex h-auto w-fit shrink-0 items-center justify-center rounded-full border border-transparent px-[.55rem] py-[.28rem] text-xs font-extrabold leading-none whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        period:
          'border-strong-border bg-transparent px-[.65rem] py-[.3rem] [font-size:clamp(.85rem,.8vw,1rem)] font-bold leading-none text-muted-foreground',
        upcoming: 'bg-success-surface text-success-foreground',
        warning: 'bg-warning-status-surface text-warning',
        destructive: 'bg-destructive-surface text-destructive',
        outline: 'border-border bg-card text-foreground',
        state:
          'mb-1 border-0 bg-transparent p-0 text-sm leading-[1.3] font-extrabold text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  })
}

export { Badge, badgeVariants }
