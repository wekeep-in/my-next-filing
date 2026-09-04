import type { ReactNode } from 'react'

export function ExternalLink({
  href,
  children,
}: {
  readonly href: string
  readonly children: ReactNode
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true">{' '}↗</span>
      <span className="sr-only"> opens in a new tab</span>
    </a>
  )
}
