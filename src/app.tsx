import { useEffect, useState } from 'react'
import { cn } from 'cn'
import { Outlet, createBrowserRouter, useLocation } from 'react-router-dom'
import { ExternalLink } from '@/components/external-link'
import { WORKSPACE_KEY, loadSavedWorkspace } from '@/workspace'
import type { LoadSavedWorkspaceResult } from '@/workspace'
import { CheckRoute } from '@/routes/check'
import { LandingRoute } from '@/routes/landing'
import { NotFoundRoute } from '@/routes/not-found'
import { PlanRoute } from '@/routes/plan'

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
    const target = location.hash
      ? document.getElementById(location.hash.slice(1))
      : null
    if (target)
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      })
    else window.scrollTo(0, 0)
  }, [location.hash, location.pathname])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === WORKSPACE_KEY) refreshSavedWorkspace()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <div
      className={cn(
        'flex min-h-svh flex-col',
        isJourney && 'app--journey',
        isLanding && 'app--landing',
      )}
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
