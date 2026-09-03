import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Outlet, createBrowserRouter, useLocation } from 'react-router-dom'
import { WORKSPACE_KEY, loadSavedWorkspace } from './workspace/index.ts'
import type { LoadSavedWorkspaceResult } from './workspace/index.ts'
import { CheckRoute } from './routes/check'
import { LandingRoute } from './routes/landing'
import { NotFoundRoute } from './routes/not-found'
import { PlanRoute } from './routes/plan'

export type AppOutletContext = {
  readonly savedWorkspace: LoadSavedWorkspaceResult
  readonly refreshSavedWorkspace: () => void
}

function browserStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function loadBrowserWorkspace(): LoadSavedWorkspaceResult {
  const storage = browserStorage()
  return storage
    ? loadSavedWorkspace(storage)
    : { kind: 'unavailable', reason: 'storage-unavailable' }
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(`${date}T00:00:00+05:30`))
}

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
      <span aria-hidden="true"> ↗</span>
      <span className="visually-hidden"> opens in a new tab</span>
    </a>
  )
}

function AppFrame() {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const isJourney =
    location.pathname === '/check' || location.pathname === '/plan'
  const [savedWorkspace, setSavedWorkspace] =
    useState<LoadSavedWorkspaceResult>(loadBrowserWorkspace)

  const refreshSavedWorkspace = () => {
    setSavedWorkspace(loadBrowserWorkspace())
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === WORKSPACE_KEY) refreshSavedWorkspace()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <div
      className={`app${isJourney ? ' app--journey' : ''}${isLanding ? ' app--landing' : ''}`}
    >
      <main>
        <Outlet context={{ savedWorkspace, refreshSavedWorkspace }} />
      </main>
      <footer className="site-footer">
        <p>
          © 2026 <ExternalLink href="https://wekeep.in">WeKeep</ExternalLink>.
          All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <AppFrame />,
    children: [
      { index: true, element: <LandingRoute /> },
      { path: '/check', element: <CheckRoute /> },
      { path: '/plan', element: <PlanRoute /> },
      { path: '*', element: <NotFoundRoute /> },
    ],
  },
])
