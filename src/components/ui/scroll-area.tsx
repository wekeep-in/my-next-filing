import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area'
import { cn } from 'cn'

export function ScrollArea({
  className,
  children,
  ...props
}: ScrollAreaPrimitive.Root.Props) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="h-full max-h-[inherit] overscroll-contain rounded-[inherit] outline-none focus-visible:outline-[.2rem] focus-visible:outline-offset-[-0.2rem] focus-visible:outline-ring"
      >
        <ScrollAreaPrimitive.Content>{children}</ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar className="m-1 flex w-2 justify-center rounded-full bg-transparent opacity-0 transition-opacity duration-150 data-scrolling:opacity-100 motion-reduce:transition-none">
        <ScrollAreaPrimitive.Thumb className="w-1.5 rounded-full bg-muted-foreground/40" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  )
}
