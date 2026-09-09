import type { ComponentType, MouseEvent } from 'react'
import { browserStorage, latestQuestionnaireDate } from '@/app-context'
import type { AppOutletContext } from '@/app-context'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import { cn } from 'cn'
import { LoaderIcon } from 'lucide-react'
import {
  Link,
  Navigate,
  Outlet,
  createBrowserRouter,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router-dom'
import { ExternalLink } from '@/components/external-link'
import { TopBar } from '@/components/top-bar'
import { Button } from '@/components/ui/button'
import type { ProfileGroup } from '@/evaluation'
import {
  WORKSPACE_KEY,
  deleteLegacyWorkspace,
  loadSavedWorkspace,
} from '@/workspace'
import type { LoadSavedWorkspaceResult } from '@/workspace'
import { useRecoveryLifecycle } from '@/recovery-draft/lifecycle'
import {
  blankDraft,
  exampleProfile,
  firstIncompleteGroup,
  isBlankDraft,
  questionnaireRouteForGroup,
  questionnaireRouteFromPath,
  questionnaireRoutes,
} from '@/routes/check/model'
import {
  questionnaireReducer,
  sessionFromProfile,
} from '@/routes/check/session'
import type { QuestionnaireSession } from '@/routes/check/session'
import { NotFoundRoute } from '@/routes/not-found'
import { ResourcesRoute } from '@/routes/resources'
import { emptyResourceFilters } from '@/resources'
import { usePageTransition } from '@/lib/page-transition'

type Notice =
  | 'recovery-saved'
  | 'invalid-recovery-removed'
  | 'legacy-deleted'
  | 'all-deleted'
const noticeCopy: Record<Notice, string> = {
  'recovery-saved':
    'Your answers will stay available if you refresh this tab. Closing the tab may remove them.',
  'invalid-recovery-removed':
    "Your previous answers couldn't be restored and were removed from this tab. Start again below.",
  'legacy-deleted':
    'Your previously saved answers and completion dates were removed because this version uses a new workspace.',
  'all-deleted':
    'Your saved answers and completion dates were removed from this browser. Your in-progress answers were removed from this tab.',
}
type Confirmation =
  | { readonly kind: 'start-over' }
  | {
      readonly kind: 'saved-edit'
      readonly group: ProfileGroup
    }

function AppFrame() {
  const location = useLocation()
  const navigate = useNavigate()
  const content = usePageTransition()
  const [session, rawDispatch] = useReducer(questionnaireReducer, null)
  const isResourcesRoute =
    useMatch({ path: '/resources', caseSensitive: true, end: true }) !== null
  const exampleMode = isResourcesRoute
    ? session?.origin.kind === 'example'
    : new URLSearchParams(location.search).get('example') === '1'
  const [resourceFilters, setResourceFilters] = useState(emptyResourceFilters)
  const [savedWorkspace, setSavedWorkspace] =
    useState<LoadSavedWorkspaceResult>({ kind: 'absent' })
  const [workspaceSelected, rawSelectWorkspace] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [exampleReturn, setExampleReturn] =
    useState<QuestionnaireSession | null>(null)
  const initializedOnce = useRef(false)
  const legacyNoticeShown = useRef(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const confirmationTrigger = useRef<HTMLElement | null>(null)
  const showConfirmation = (next: Confirmation, trigger?: HTMLElement) => {
    confirmationTrigger.current =
      trigger ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null)
    setConfirmation(next)
  }

  const refreshSavedWorkspace = useCallback(() => {
    const storage = browserStorage('localStorage')
    let loaded: LoadSavedWorkspaceResult = storage
      ? loadSavedWorkspace(storage, new Date())
      : { kind: 'unavailable', reason: 'storage-unavailable' }
    if (storage && loaded.kind === 'legacy') {
      const removed = deleteLegacyWorkspace(storage)
      if (removed.kind === 'legacy-deleted' && !legacyNoticeShown.current) {
        legacyNoticeShown.current = true
        setNotice('legacy-deleted')
      }
      loaded =
        removed.kind === 'legacy-removal-failed' ||
        removed.kind === 'legacy-removal-unverified'
          ? { kind: removed.kind }
          : removed.kind === 'unavailable'
            ? { kind: 'unavailable', reason: 'storage-unavailable' }
            : loadSavedWorkspace(storage, new Date())
    }
    setSavedWorkspace(loaded)
    return loaded
  }, [])

  const {
    state: recovery,
    removal,
    writesPaused,
    dispatch,
    selectWorkspace: setWorkspaceSelected,
    restore: restoreRecovery,
    retry: retryRecovery,
    remove: removeRecovery,
    workspaceSaved,
    deleteAll,
    retryRemoval,
    cancelRemoval,
  } = useRecoveryLifecycle({
    session,
    exampleReturn,
    exampleMode,
    workspaceSelected,
    initialized,
    dispatch: rawDispatch,
    selectWorkspace: rawSelectWorkspace,
    onNotice: setNotice,
    onChange: (change) => {
      switch (change.kind) {
        case 'restored':
          if (session?.origin.kind === 'example')
            setExampleReturn(change.session)
          else dispatch({ type: 'restore', session: change.session })
          break
        case 'workspace-saved':
          setSavedWorkspace({ kind: 'ready', workspace: change.workspace })
          break
        case 'session-committed':
          setSavedWorkspace({ kind: 'ready', workspace: change.workspace })
          dispatch({ type: 'clear' })
          setWorkspaceSelected(true)
          setExampleReturn(null)
          break
        case 'workspace-removed':
          setSavedWorkspace({ kind: 'absent' })
          setWorkspaceSelected(false)
          break
        case 'removal-cancelled':
          refreshSavedWorkspace()
          break
        case 'removed':
          switch (change.intent.kind) {
            case 'cleanup':
              break
            case 'saved-edit':
              beginSavedEdit(change.intent.group)
              break
            case 'discard-newer':
              setExampleReturn(null)
              dispatch({ type: 'clear' })
              setWorkspaceSelected(true)
              refreshSavedWorkspace()
              void navigate('/plan', { replace: true })
              break
            case 'start-over':
              setExampleReturn(null)
              setWorkspaceSelected(false)
              setDeleted(false)
              dispatch({ type: 'start-over' })
              void navigate('/check/fit', { replace: true })
              break
            case 'delete-all':
              setExampleReturn(null)
              dispatch({ type: 'clear' })
              setWorkspaceSelected(false)
              setDeleted(true)
              setNotice('all-deleted')
              void navigate('/plan', { replace: true })
              break
          }
          break
      }
    },
  })

  useLayoutEffect(() => {
    if (isResourcesRoute || initializedOnce.current) return
    initializedOnce.current = true
    const now = new Date()
    const workspace = refreshSavedWorkspace()
    let restored = restoreRecovery(now)
    if (
      !exampleMode &&
      restored?.kind === 'complete' &&
      workspace.kind === 'ready' &&
      JSON.stringify(restored.profile) ===
        JSON.stringify(workspace.workspace.active?.profile)
    ) {
      restored = null
      removeRecovery({ kind: 'cleanup' })
    }
    if (
      !exampleMode &&
      !restored &&
      (location.pathname === '/check' ||
        location.pathname === '/check/' ||
        questionnaireRouteFromPath(location.pathname))
    )
      restored = {
        kind: 'editing',
        origin: { kind: 'personal' },
        draft: blankDraft(),
        validationGroup: null,
      }
    if (exampleMode) {
      setExampleReturn(restored)
      restored = sessionFromProfile(
        exampleProfile,
        { kind: 'example' },
        latestQuestionnaireDate(now),
      )
    }
    dispatch({ type: 'restore', session: restored })
    setInitialized(true)
  }, [
    restoreRecovery,
    removeRecovery,
    dispatch,
    exampleMode,
    location.pathname,
    isResourcesRoute,
    refreshSavedWorkspace,
  ])

  useLayoutEffect(() => {
    if (!initialized || isResourcesRoute) return
    if (exampleMode && session?.origin.kind !== 'example') {
      // oxlint-disable-next-line react/set-state-in-effect -- Synchronize browser history mode with the in-memory return session.
      setExampleReturn(session)
      setWorkspaceSelected(false)
      setDeleted(false)
      dispatch({
        type: 'restore',
        session: sessionFromProfile(
          exampleProfile,
          { kind: 'example' },
          latestQuestionnaireDate(new Date()),
        ),
      })
    } else if (!exampleMode && session?.origin.kind === 'example') {
      dispatch({ type: 'restore', session: exampleReturn })
      setExampleReturn(null)
    }
  }, [
    dispatch,
    exampleMode,
    exampleReturn,
    initialized,
    isResourcesRoute,
    session,
    setWorkspaceSelected,
  ])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [notice])
  useEffect(() => {
    if (!initialized) return
    const onStorage = (event: StorageEvent) => {
      if (event.key === WORKSPACE_KEY || event.key === null)
        refreshSavedWorkspace()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [initialized, refreshSavedWorkspace])
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
    const element = dialog.current
    if (!confirmation || !element) return
    element.showModal()
    element.querySelector<HTMLButtonElement>('[data-safe-action]')?.focus()
    return () => {
      element.close()
      if (confirmationTrigger.current?.isConnected)
        confirmationTrigger.current.focus()
    }
  }, [confirmation])

  const startPersonal = () => {
    if (session && !isBlankDraft(session.draft)) {
      showConfirmation({ kind: 'start-over' })
      return
    }
    setExampleReturn(null)
    setDeleted(false)
    setWorkspaceSelected(false)
    dispatch({ type: 'start-over' })
    void navigate('/check/fit')
  }
  const startExample = () => {
    if (session?.origin.kind !== 'example') setExampleReturn(session)
    setWorkspaceSelected(false)
    setDeleted(false)
    dispatch({
      type: 'restore',
      session: sessionFromProfile(
        exampleProfile,
        { kind: 'example' },
        latestQuestionnaireDate(new Date()),
      ),
    })
    void navigate('/check/fit?example=1')
  }
  const returnPersonal = () => {
    const returned =
      session?.origin.kind === 'example' ? exampleReturn : session
    setExampleReturn(null)
    setWorkspaceSelected(false)
    setDeleted(false)
    if (!returned) {
      dispatch({ type: 'start-over' })
      void navigate('/check/fit')
      return
    }
    dispatch({ type: 'restore', session: returned })
    const incomplete =
      returned.kind === 'editing'
        ? firstIncompleteGroup(
            returned.draft,
            latestQuestionnaireDate(new Date()),
          )
        : null
    void navigate(
      returned.kind === 'complete'
        ? '/plan'
        : `/check/${incomplete ? questionnaireRouteForGroup(incomplete) : 'review'}`,
    )
  }
  const openWorkspace = () => {
    if (session?.origin.kind === 'example') {
      dispatch({ type: 'restore', session: exampleReturn })
      setExampleReturn(null)
    }
    setWorkspaceSelected(true)
    setDeleted(false)
    void navigate('/plan')
  }
  const beginSavedEdit = (group: ProfileGroup) => {
    if (savedWorkspace.kind !== 'ready' || !savedWorkspace.workspace.active)
      return
    setExampleReturn(null)
    setWorkspaceSelected(false)
    const workspace = savedWorkspace.workspace
    dispatch({
      type: 'restore',
      session: sessionFromProfile(
        workspace.active!.profile,
        { kind: 'saved-edit', baseWorkspaceRevision: workspace.revision },
        latestQuestionnaireDate(new Date()),
      ),
    })
    void navigate(`/check/${questionnaireRouteForGroup(group)}`)
  }
  const editGroup = (group: ProfileGroup) => {
    if (workspaceSelected || !session) {
      if (session && !isBlankDraft(session.draft)) {
        showConfirmation({ kind: 'saved-edit', group })
        return
      }
      if (!removal) beginSavedEdit(group)
    } else {
      dispatch({ type: 'clear-validation' })
      void navigate(
        `/check/${questionnaireRouteForGroup(group)}${session.origin.kind === 'example' ? '?example=1' : ''}`,
      )
    }
  }
  const startOver = (event?: MouseEvent<HTMLElement>) => {
    if (session?.origin.kind === 'example') {
      startExample()
      return
    }
    if (session && !isBlankDraft(session.draft))
      showConfirmation({ kind: 'start-over' }, event?.currentTarget)
    else removeRecovery({ kind: 'start-over' })
  }
  const confirm = () => {
    if (confirmation?.kind === 'start-over')
      removeRecovery({ kind: 'start-over' })
    else if (confirmation?.kind === 'saved-edit')
      removeRecovery({ kind: 'saved-edit', group: confirmation.group })
    setConfirmation(null)
  }
  const context: AppOutletContext = {
    resourceFilters,
    setResourceFilters,
    session,
    personalSession:
      session?.origin.kind === 'example' ? exampleReturn : session,
    dispatch,
    savedWorkspace,
    workspaceSelected,
    deleted,
    writesPaused,
    refreshSavedWorkspace,
    startPersonal,
    startExample,
    returnPersonal,
    openWorkspace,
    editGroup,
    startOver,
    discardSavedEdit: () => {
      removeRecovery({ kind: 'discard-newer' })
    },
    workspaceSaved,
    deleteAll,
  }
  const recoveryFailed =
    recovery.kind === 'unavailable' ||
    recovery.kind === 'write-failed' ||
    recovery.kind === 'invalid-removal-failed' ||
    recovery.kind === 'deletion-unverified'
  const workspaceFailed =
    savedWorkspace.kind !== 'ready' && savedWorkspace.kind !== 'absent'
  return (
    <div
      className={cn(
        'flex min-h-svh flex-col',
        location.pathname === '/' && 'app--landing',
        (location.pathname === '/check' ||
          location.pathname === '/check/' ||
          questionnaireRouteFromPath(location.pathname) !== null ||
          location.pathname === '/plan') &&
          'app--journey',
      )}
    >
      {notice && (
        <TopBar
          variant={
            notice === 'recovery-saved'
              ? 'info'
              : notice === 'all-deleted'
                ? 'success'
                : 'warning'
          }
        >
          {noticeCopy[notice]}
        </TopBar>
      )}
      {recoveryFailed && (
        <TopBar variant="warning">
          {recovery.kind === 'deletion-unverified'
            ? "We couldn't check whether your in-progress answers were removed from this tab's storage. Your current answers are still here. Try checking again."
            : "This browser couldn't store your answers for refresh recovery. Your answers are still here, but a refresh may remove them."}{' '}
          <Button variant="link" onClick={retryRecovery}>
            Retry refresh recovery
          </Button>
        </TopBar>
      )}
      {workspaceFailed && (
        <TopBar variant="warning">
          {savedWorkspace.kind === 'legacy-removal-unverified'
            ? "We couldn't check whether your previously saved answers and completion dates were removed. Saving is paused until we can check again."
            : savedWorkspace.kind === 'legacy' ||
                savedWorkspace.kind === 'legacy-removal-failed'
              ? 'Your previously saved data could not be removed. You can continue an estimate in this tab; saving is paused.'
              : 'Your saved workspace could not be restored. You can continue an estimate in this tab.'}{' '}
          <Button variant="link" onClick={refreshSavedWorkspace}>
            Check saved data again
          </Button>
        </TopBar>
      )}
      {removal && (
        <TopBar variant="destructive">
          {removal.kind === 'delete-all'
            ? removal.message
            : removal.result.kind === 'deletion-unverified'
              ? "We couldn't check whether your in-progress answers were removed from this tab's storage. Your current work is still available."
              : removal.kind === 'cleanup'
                ? 'Your workspace was saved, but its refresh copy could not be removed from this tab.'
                : 'Your in-progress answers could not be removed. Your current answers are still here.'}{' '}
          <Button variant="link" onClick={retryRemoval}>
            Retry deletion
          </Button>{' '}
          {removal.kind !== 'cleanup' && (
            <Button variant="link" onClick={cancelRemoval}>
              Keep remaining answers
            </Button>
          )}
        </TopBar>
      )}
      <main ref={content}>
        {(isResourcesRoute ||
          (initialized &&
            exampleMode === (session?.origin.kind === 'example'))) && (
          <Outlet context={context} />
        )}
      </main>
      {confirmation && (
        <dialog
          ref={dialog}
          className="app-confirmation"
          aria-labelledby="confirmation-title"
          aria-describedby="confirmation-description"
          onCancel={(event) => {
            event.preventDefault()
            setConfirmation(null)
          }}
        >
          <h2 id="confirmation-title">
            {confirmation.kind === 'start-over'
              ? 'Start over with blank answers?'
              : 'Discard your estimate and edit saved data?'}
          </h2>
          <p id="confirmation-description">
            This removes your in-progress answers from this tab. Your saved
            workspace and completion dates will not change. This cannot be
            undone.
          </p>
          <div className="button-row">
            <Button
              className="min-w-0 whitespace-normal max-[520px]:w-full"
              variant="destructive"
              onClick={confirm}
            >
              {confirmation.kind === 'start-over'
                ? 'Clear answers and start over'
                : 'Discard draft and edit saved data'}
            </Button>
            <Button
              className="min-w-0 whitespace-normal max-[520px]:w-full"
              variant="outline"
              data-safe-action
              onClick={() => setConfirmation(null)}
            >
              Keep my answers
            </Button>
          </div>
        </dialog>
      )}
      <footer className="site-footer">
        <p>
          © 2026 <ExternalLink href="https://wekeep.in">WeKeep</ExternalLink>.
          All rights reserved.
        </p>
      </footer>
    </div>
  )
}

function RouteLoadError() {
  return (
    <section className="reference-page" role="alert">
      <h1>This page couldn't load</h1>
      <p>
        Any answers you entered are still here. You can keep browsing resources.
      </p>
      <Link to="/resources" className="inline-flex min-h-11 items-center">
        Back to resources
      </Link>
    </section>
  )
}

function loadScreen(load: () => Promise<ComponentType>) {
  return async () => {
    try {
      return { Component: await load() }
    } catch {
      // Resolve a failed import to a screen, keeping its route and the stateful shell mounted.
      return { Component: RouteLoadError }
    }
  }
}

function LegacyQuestionnaireRedirect({ route }: { readonly route: string }) {
  const location = useLocation()
  return (
    <Navigate
      replace
      to={{ pathname: `/check/${route}`, search: location.search }}
    />
  )
}

export const router = createBrowserRouter([
  {
    element: <AppFrame />,
    hydrateFallbackElement: (
      <main className="app-loading">
        <div role="status" aria-label="Loading My Next Filing">
          <LoaderIcon
            className="size-8 animate-spin text-muted-foreground motion-reduce:animate-none"
            aria-hidden="true"
          />
        </div>
      </main>
    ),
    children: [
      {
        index: true,
        lazy: loadScreen(
          async () => (await import('@/routes/landing')).LandingRoute,
        ),
        errorElement: <RouteLoadError />,
      },
      {
        path: '/check',
        caseSensitive: true,
        lazy: loadScreen(
          async () => (await import('@/routes/check')).CheckRoute,
        ),
        errorElement: <RouteLoadError />,
        children: [
          {
            index: true,
            lazy: loadScreen(
              async () => (await import('@/routes/check')).CheckIndex,
            ),
          },
          ...questionnaireRoutes.map(({ id }) => ({
            path: id,
            caseSensitive: true,
            lazy: loadScreen(async () => {
              const { CheckGroup } = await import('@/routes/check')
              return () => <CheckGroup group={id} />
            }),
          })),
          ...[
            ['tax-year', 'fit'],
            ['activity', 'fit'],
            ['receipts', 'income'],
            ['other-income', 'income'],
            ['gst', 'taxes-and-gst'],
          ].map(([path, route]) => ({
            path,
            caseSensitive: true,
            element: <LegacyQuestionnaireRedirect route={route} />,
          })),
          { path: '*', element: <NotFoundRoute /> },
        ],
      },
      {
        path: '/plan',
        lazy: loadScreen(async () => (await import('@/routes/plan')).PlanRoute),
        errorElement: <RouteLoadError />,
      },
      { path: '/resources', caseSensitive: true, element: <ResourcesRoute /> },
      { path: '*', element: <NotFoundRoute /> },
    ],
  },
])
