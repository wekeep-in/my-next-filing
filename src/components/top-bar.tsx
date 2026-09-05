import { createContext, useContext, useLayoutEffect, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Alert } from '@/components/ui/alert'

const TopBarContext = createContext<HTMLDivElement | null>(null)

export function TopBarProvider({ children }: { readonly children: ReactNode }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  useLayoutEffect(() => {
    if (!container) return
    const updateHeight = () =>
      document.documentElement.style.setProperty(
        '--top-bar-height',
        `${container.getBoundingClientRect().height}px`,
      )
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(container)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--top-bar-height')
    }
  }, [container])

  return (
    <TopBarContext value={container}>
      <div
        className="top-bars"
        role="region"
        aria-label="Notifications"
        ref={setContainer}
      />
      {children}
    </TopBarContext>
  )
}

export function TopBar({
  variant = 'warning',
  ...props
}: Omit<ComponentProps<typeof Alert>, 'className'>) {
  const container = useContext(TopBarContext)
  return container
    ? createPortal(
        <Alert
          className="top-bar"
          variant={variant}
          role="status"
          {...props}
        />,
        container,
      )
    : null
}
