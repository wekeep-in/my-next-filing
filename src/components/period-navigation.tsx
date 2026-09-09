import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

export function PeriodNavigation({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <div className="mb-[.85rem] flex items-center gap-3">
      <Badge
        variant="period"
        className="relative border-transparent bg-foreground text-primary-foreground no-underline after:absolute after:inset-x-0 after:top-1/2 after:min-h-11 after:-translate-y-1/2 hover:bg-muted-foreground"
        render={<Link to="/" />}
      >
        Home
      </Badge>
      <Badge variant="period">{children}</Badge>
    </div>
  )
}
