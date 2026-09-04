import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

const buttonVariants = cva(
  'inline-flex min-h-[2.9rem] shrink-0 select-none items-center justify-center rounded-control border border-transparent px-[1.05rem] py-[.72rem] font-extrabold leading-[1.1] whitespace-nowrap no-underline transition-[scale,background-color,border-color,color] duration-150 ease-app-out outline-none focus-visible:outline-[.2rem] focus-visible:outline-solid focus-visible:outline-offset-[.2rem] focus-visible:outline-ring active:not-focus-visible:scale-[.97] motion-reduce:active:not-focus-visible:scale-100 motion-reduce:transition-colors disabled:cursor-not-allowed disabled:opacity-55',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary-hover aria-expanded:bg-primary-hover',
        outline:
          'border-border bg-card text-foreground hover:border-page-divider hover:bg-outline-hover',
        destructive:
          'bg-destructive text-primary-foreground hover:bg-destructive-hover',
        ghost:
          'border-0 bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
        link: "relative min-h-0 rounded-none border-0 bg-transparent p-0 text-[.9rem] text-foreground underline decoration-[1.5px] underline-offset-[.17em] after:absolute after:top-1/2 after:left-1/2 after:min-h-11 after:min-w-11 after:-translate-1/2 after:content-[''] active:not-focus-visible:scale-[.98]",
      },
      size: {
        default: '',
        icon: 'size-11 min-h-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
