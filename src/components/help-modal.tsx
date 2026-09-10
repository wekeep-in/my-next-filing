import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export function HelpModal({
  topic,
  title,
  description,
  buttonText,
  children,
}: {
  readonly topic: string
  readonly title: string
  readonly description: string
  readonly buttonText?: string
  readonly children: ReactNode
}) {
  const heading = useRef<HTMLHeadingElement>(null)

  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={<Button variant="link" className="font-semibold" />}
        aria-label={buttonText ?? title}
      >
        {buttonText ?? title}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-400 bg-foreground/30 backdrop-blur-sm" />
        <Dialog.Popup
          initialFocus={heading}
          className="fixed bottom-0 left-0 z-400 w-full rounded-t-card border border-border bg-card text-foreground outline-none sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[calc(100%-4rem)] sm:max-w-2xl sm:-translate-1/2 sm:rounded-card"
        >
          <Dialog.Close
            render={<Button variant="outline" size="icon" />}
            aria-label={`Close help about ${topic}`}
            className="absolute -top-14 right-4 rounded-full sm:-right-10"
          >
            <X className="size-5" aria-hidden="true" />
          </Dialog.Close>
          <ScrollArea className="max-h-[min(65dvh,36rem)] rounded-[inherit]">
            <div className="px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
              <Dialog.Title
                ref={heading}
                tabIndex={-1}
                className="m-0 outline-none"
              >
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-4 text-muted-foreground">
                {description}
              </Dialog.Description>
              <div className="mt-6 space-y-5">{children}</div>
            </div>
          </ScrollArea>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
