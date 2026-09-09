import { useEffect, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { CircleAlert, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function FieldHelp({
  id,
  label,
  children,
  trigger,
  disabled = false,
  tone = 'default',
}: {
  readonly id: string
  readonly label: string
  readonly children: ReactNode
  readonly trigger?: ReactElement<{ children?: ReactNode }>
  readonly disabled?: boolean
  readonly tone?: 'default' | 'warning'
}) {
  const [open, setOpen] = useState(false)
  const openedByClick = useRef(false)
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 861px)')
    const update = () => setWide(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return (
    <>
      <Tooltip
        open={open && !disabled}
        onOpenChange={(value, details) => {
          // Touch-generated mouseleave must not undo an explicit tap to open.
          if (
            !value &&
            details.reason === 'trigger-hover' &&
            openedByClick.current
          )
            return
          openedByClick.current = false
          setOpen(value)
        }}
      >
        <TooltipTrigger
          disabled={disabled}
          aria-label={`${label} help`}
          aria-describedby={open ? `${id}-tooltip` : `${id}-help`}
          closeOnClick={false}
          onClick={() => {
            if (disabled) return
            // A click pins help that hover or focus already opened.
            openedByClick.current = !openedByClick.current
            setOpen(openedByClick.current)
          }}
          render={
            trigger ?? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`relative min-h-0 rounded-none bg-transparent p-0 after:absolute after:top-1/2 after:left-1/2 after:min-h-11 after:min-w-11 after:-translate-1/2 after:content-[''] hover:bg-transparent hover:opacity-75 aria-expanded:bg-transparent ${tone === 'warning' ? 'size-4.5 text-warning hover:text-warning aria-expanded:text-warning' : 'size-4 text-muted-foreground hover:text-foreground aria-expanded:text-foreground'}`}
              />
            )
          }
        >
          {trigger ? (
            trigger.props.children
          ) : tone === 'warning' ? (
            <CircleAlert className="size-4.5" aria-hidden="true" />
          ) : (
            <Info className="size-4" aria-hidden="true" />
          )}
        </TooltipTrigger>
        <TooltipContent
          id={`${id}-tooltip`}
          role="tooltip"
          side={wide ? 'right' : 'top'}
          sideOffset={8}
        >
          {children}
        </TooltipContent>
      </Tooltip>
      <span id={`${id}-help`} className="sr-only">
        {children}
      </span>
    </>
  )
}
