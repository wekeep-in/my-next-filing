import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
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
}: {
  readonly id: string
  readonly label: string
  readonly children: ReactNode
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
        open={open}
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
          aria-label={`${label} help`}
          aria-describedby={open ? `${id}-tooltip` : `${id}-help`}
          closeOnClick={false}
          onClick={() => {
            openedByClick.current = !open
            setOpen(!open)
          }}
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative size-7 min-h-7 text-muted-foreground after:absolute after:-inset-2 after:content-['']"
            />
          }
        >
          <Info className="size-4" aria-hidden="true" />
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
