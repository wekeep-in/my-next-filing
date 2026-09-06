import { ArrowUpRightIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function ExternalLink({
  href,
  children,
  className,
}: {
  readonly href: string
  readonly children: ReactNode
  readonly className?: string
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>
        {children}
        <span aria-hidden="true" className="whitespace-nowrap">
          {' '}
          <ArrowUpRightIcon className="inline size-[1em] align-[-.125em]" />
        </span>
      </span>
      <span className="sr-only"> opens in a new tab</span>
    </a>
  )
}
