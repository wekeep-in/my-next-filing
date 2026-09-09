import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
} from 'react-router-dom'
import { latestQuestionnaireDate, useApp } from '@/app-context'
import type { AppOutletContext } from '@/app-context'
import {
  JourneySidebar,
  journeyStep,
  journeySteps,
} from '@/components/journey-sidebar'
import { TopBar } from '@/components/top-bar'
import { AutoSize } from '@/components/auto-size'
import { Button } from '@/components/ui/button'
import { FieldHelp } from '@/components/field-help'
import { QuestionIssues } from '@/routes/check/question-section'
import { ClientsStep } from '@/routes/check/clients-step'
import { GstStep } from '@/routes/check/gst-step'
import { OtherIncomeStep } from '@/routes/check/other-income-step'
import { ReviewStep } from '@/routes/check/review'
import { SituationStep } from '@/routes/check/situation-step'
import {
  assessQuestionnaireRoute,
  questionnaireGroups,
  questionnaireRouteForGroup,
  questionnaireRouteFromPath,
  questionnaireRouteStep,
  questionnaireRoutes,
} from '@/routes/check/model'
import type { DraftAmountKey, QuestionnaireRoute } from '@/routes/check/model'
import { CoverageWarnings, FieldWarnings } from '@/routes/check/fields'
import { sessionMatchesWorkspace } from '@/routes/plan/model'

type CheckContext = {
  readonly app: AppOutletContext
  readonly assessment: ReturnType<typeof assessQuestionnaireRoute> | null
  readonly latestDate: string
  readonly go: (route: QuestionnaireRoute, replace?: boolean) => void
}

export function CheckIndex() {
  const { app, assessment } = useOutletContext<CheckContext>()
  if (!app.session || !assessment) return null
  return (
    <Navigate
      replace
      to={
        app.session.kind === 'complete'
          ? `/plan${app.session.origin.kind === 'example' ? '?example=1' : ''}`
          : `/check/${assessment.resumeGroup}${app.session.origin.kind === 'example' ? '?example=1' : ''}`
      }
    />
  )
}

export function CheckGroup({ group }: { readonly group: QuestionnaireRoute }) {
  const { app, latestDate, go, assessment } = useOutletContext<CheckContext>()
  const session = app.session
  if (!session || !assessment) return null
  if (assessment.redirectGroup)
    return (
      <Navigate
        replace
        to={`/check/${assessment.redirectGroup}${session.origin.kind === 'example' ? '?example=1' : ''}`}
      />
    )
  const props = {
    className: 'question-group',
    draft: session.draft,
    errors: assessment.errors,
    dispatch: app.dispatch,
  }
  const setAmount = (field: DraftAmountKey, value: string) =>
    app.dispatch({ type: 'amount-changed', field, value })
  switch (group) {
    case 'fit':
      return <SituationStep {...props} />
    case 'income':
      return <OtherIncomeStep {...props} setAmount={setAmount} />
    case 'clients':
      return <ClientsStep {...props} />
    case 'taxes-and-gst':
      return (
        <GstStep
          {...props}
          setAmount={setAmount}
          latestThresholdDate={latestDate}
        />
      )
    case 'review':
      return (
        <ReviewStep
          className="question-group"
          draft={session.draft}
          errors={assessment.errors}
          onEdit={(step) =>
            go(questionnaireRouteForGroup(questionnaireGroups[step].id))
          }
        />
      )
  }
}

export function CheckRoute() {
  const [touched, setTouched] = useState<ReadonlySet<string>>(new Set())
  const app = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const route = questionnaireRouteFromPath(location.pathname)
  const isIndex =
    location.pathname === '/check' || location.pathname === '/check/'
  const latestDate = latestQuestionnaireDate(new Date())
  const { session, dispatch } = app
  const assessment = useMemo(
    () =>
      session
        ? assessQuestionnaireRoute(session, route ?? 'fit', latestDate, touched)
        : null,
    [session, route, latestDate, touched],
  )
  useEffect(() => {
    if (
      session?.kind === 'editing' &&
      session.validationGroup &&
      route &&
      questionnaireRouteForGroup(session.validationGroup) !== route
    )
      dispatch({ type: 'clear-validation' })
  }, [dispatch, route, session])
  useLayoutEffect(() => {
    if (
      !session &&
      !app.deleted &&
      !app.workspaceSelected &&
      (route || isIndex)
    )
      app.startPersonal()
  }, [app, isIndex, route, session])
  useEffect(() => {
    if (!route) return
    window.scrollTo(0, 0)
    document.getElementById('check-title')?.focus()
  }, [route, location.key])
  const go = (target: QuestionnaireRoute, replace = false) => {
    dispatch({ type: 'clear-validation' })
    void navigate(
      `/check/${target}${session?.origin.kind === 'example' ? '?example=1' : ''}`,
      { replace },
    )
  }
  const context: CheckContext = {
    app,
    assessment,
    latestDate,
    go,
  }
  if (!route && !isIndex) return <Outlet context={context} />
  if (app.deleted) return <Navigate to="/plan" replace />
  if (app.workspaceSelected) return <Navigate to="/plan" replace />
  if (!session || !assessment) return null
  if (isIndex) return <Outlet context={context} />
  const step = questionnaireRouteStep(route!)
  const focusError = (field: string | undefined) => {
    if (!field) return
    requestAnimationFrame(() => {
      const target =
        document.getElementById(field) ??
        document.querySelector(`input[name="${field}"]`)
      if (target instanceof HTMLElement) target.focus()
    })
  }
  const next = (event: MouseEvent<HTMLButtonElement>) => {
    const now = new Date()
    const latest = latestQuestionnaireDate(now)
    const { progression } = assessQuestionnaireRoute(
      session,
      route!,
      latest,
      touched,
    )
    if (progression.kind === 'blocked') {
      if (progression.issue) {
        const issue = progression.issue
        dispatch({ type: 'expose-validation', group: issue.group })
        if (questionnaireRouteForGroup(issue.group) !== route)
          void navigate(
            `/check/${questionnaireRouteForGroup(issue.group)}${session.origin.kind === 'example' ? '?example=1' : ''}`,
          )
        focusError(issue.field)
      }
      return
    }
    if (progression.kind === 'next') {
      go(progression.group)
      return
    }
    dispatch({ type: 'complete', latestThresholdDate: latest })
    const button = event.currentTarget.getBoundingClientRect()
    void navigate(
      `/plan${session.origin.kind === 'example' ? '?example=1' : ''}`,
      {
        state:
          event.detail > 0
            ? {
                confettiOrigin: {
                  x: (button.left + button.width / 2) / window.innerWidth,
                  y: (button.top + button.height / 2) / window.innerHeight,
                },
              }
            : null,
      },
    )
  }
  return (
    <section
      className="questionnaire journey-layout"
      aria-labelledby="check-title"
      onBlurCapture={(event) => {
        const field = event.target.closest('.field')
        const id =
          field?.id || field?.querySelector('label[for]')?.getAttribute('for')
        if (id) setTouched((current) => new Set([...current, id]))
      }}
    >
      {session.origin.kind === 'example' && (
        <TopBar variant="example">
          <strong>Fictional example.</strong> You can explore these answers, but
          they cannot be saved.{' '}
          <Button variant="link" onClick={app.returnPersonal}>
            {app.personalSession
              ? 'Return to your estimate'
              : 'Start your estimate'}
          </Button>
        </TopBar>
      )}
      <div className="questionnaire-main">
        <AutoSize>
          <QuestionIssues value={assessment.sectionIssues}>
            <FieldWarnings value={assessment.warnings}>
              <CoverageWarnings value={assessment.coverage}>
                <Outlet context={context} />
              </CoverageWarnings>
            </FieldWarnings>
          </QuestionIssues>
          {assessment.stale && (
            <p className="choice-warning" role="alert">
              The rules need an update before this version can calculate your
              plan.
            </p>
          )}
        </AutoSize>
        <div className="button-row questionnaire-actions">
          <Button variant="link" onClick={app.startOver}>
            Start over
          </Button>
          {app.savedWorkspace.kind === 'ready' &&
            !sessionMatchesWorkspace(session, app.savedWorkspace) && (
              <Button variant="link" onClick={app.openWorkspace}>
                Open saved workspace
              </Button>
            )}
        </div>
      </div>
      <JourneySidebar
        activeStep={journeyStep(route!)}
        backAction={
          <Button
            className="w-full min-w-0 px-[.65rem] leading-[1.1]! font-extrabold!"
            variant="outline"
            onClick={() =>
              step === 0
                ? navigate('/', { replace: true })
                : go(questionnaireRoutes[step - 1].id, true)
            }
          >
            Back
          </Button>
        }
        action={
          <FieldHelp
            id="continue-blocked"
            label="Why Continue is unavailable"
            disabled={assessment.progression.kind !== 'blocked'}
            trigger={
              <span
                className="block min-w-0"
                tabIndex={
                  assessment.progression.kind === 'blocked' ? 0 : undefined
                }
              >
                <Button
                  className="w-full min-w-0 px-[.65rem] leading-[1.1]! font-extrabold! disabled:pointer-events-none"
                  onClick={next}
                  disabled={assessment.progression.kind === 'blocked'}
                  aria-describedby={
                    assessment.progression.kind === 'blocked'
                      ? 'continue-blocked-help'
                      : undefined
                  }
                >
                  {route === 'review' ? 'Calculate my plan' : 'Continue'}
                </Button>
              </span>
            }
          >
            {assessment.stale
              ? 'The rules need an update before this version can calculate your plan.'
              : (assessment.progression.kind === 'blocked' &&
                  assessment.progression.issue?.message) ||
                'Complete the required answers before continuing.'}
          </FieldHelp>
        }
        disabledSteps={journeySteps.flatMap(({ id: target }, index) =>
          target !== 'plan' && assessment.availableGroups.includes(target)
            ? []
            : [index],
        )}
        onStepSelect={(selected) => {
          const target = journeySteps[selected].id
          if (target !== 'plan') go(target)
        }}
      />
    </section>
  )
}
