import { useEffect, useLayoutEffect } from 'react'
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
import type { ProfileGroup } from '@/evaluation'
import { JourneySidebar, calculationStep } from '@/components/journey-sidebar'
import { TopBar } from '@/components/top-bar'
import { AutoSize } from '@/components/auto-size'
import { Button } from '@/components/ui/button'
import { ActivityStep } from '@/routes/check/activity-step'
import { ClientsStep } from '@/routes/check/clients-step'
import { GstStep } from '@/routes/check/gst-step'
import { OtherIncomeStep } from '@/routes/check/other-income-step'
import { ReceiptsStep } from '@/routes/check/receipts-step'
import { ReviewStep } from '@/routes/check/review'
import { SituationStep } from '@/routes/check/situation-step'
import {
  canOpenGroup,
  completeDraft,
  firstIncompleteGroup,
  groupStep,
  questionnaireGroupFromPath,
  questionnaireGroups,
  validateDraftGroup,
} from '@/routes/check/model'
import type { DraftAmountKey } from '@/routes/check/model'
import { questionnaireErrors } from '@/routes/check/session'
import { sessionMatchesWorkspace } from '@/routes/plan/model'

type CheckContext = {
  readonly app: AppOutletContext
  readonly latestDate: string
  readonly go: (group: ProfileGroup, replace?: boolean) => void
}

export function CheckIndex() {
  const { app, latestDate } = useOutletContext<CheckContext>()
  if (!app.session) return null
  return (
    <Navigate
      replace
      to={
        app.session.kind === 'complete'
          ? '/plan'
          : `/check/${firstIncompleteGroup(app.session.draft, latestDate) ?? 'review'}`
      }
    />
  )
}

export function CheckGroup({ group }: { readonly group: ProfileGroup }) {
  const { app, latestDate, go } = useOutletContext<CheckContext>()
  const session = app.session
  if (!session) return null
  if (!canOpenGroup(session.draft, group, latestDate))
    return (
      <Navigate
        replace
        to={`/check/${firstIncompleteGroup(session.draft, latestDate)}`}
      />
    )
  const errors = Object.fromEntries(
    questionnaireErrors(session, latestDate).map(({ field, message }) => [
      field,
      message,
    ]),
  )
  const props = {
    className: 'question-group',
    draft: session.draft,
    errors,
    dispatch: app.dispatch,
  }
  const setAmount = (field: DraftAmountKey, value: string) =>
    app.dispatch({ type: 'amount-changed', field, value })
  switch (group) {
    case 'tax-year':
      return <SituationStep {...props} />
    case 'activity':
      return <ActivityStep {...props} />
    case 'receipts':
      return <ReceiptsStep {...props} setAmount={setAmount} />
    case 'clients':
      return <ClientsStep {...props} />
    case 'other-income':
      return <OtherIncomeStep {...props} setAmount={setAmount} />
    case 'gst':
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
          errors={errors}
          onEdit={(step) => go(questionnaireGroups[step].id)}
        />
      )
  }
}

export function CheckRoute() {
  const app = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const group = questionnaireGroupFromPath(location.pathname)
  const isIndex =
    location.pathname === '/check' || location.pathname === '/check/'
  const latestDate = latestQuestionnaireDate(new Date())
  const { session, dispatch } = app
  useEffect(() => {
    if (
      session?.kind === 'editing' &&
      session.validationGroup &&
      session.validationGroup !== group
    )
      dispatch({ type: 'clear-validation' })
  }, [dispatch, group, session])
  useLayoutEffect(() => {
    if (
      !session &&
      !app.deleted &&
      !app.workspaceSelected &&
      (group || isIndex)
    )
      app.startPersonal()
  }, [app, group, isIndex, session])
  useEffect(() => {
    if (!group) return
    window.scrollTo(0, 0)
    document.getElementById('check-title')?.focus()
  }, [group, location.key])
  const go = (target: ProfileGroup, replace = false) => {
    dispatch({ type: 'clear-validation' })
    void navigate(`/check/${target}`, { replace })
  }
  const context: CheckContext = {
    app,
    latestDate,
    go,
  }
  if (!group && !isIndex) return <Outlet context={context} />
  if (app.deleted) return <Navigate to="/plan" replace />
  if (app.workspaceSelected) return <Navigate to="/plan" replace />
  if (!session) return null
  if (isIndex) return <Outlet context={context} />
  const step = groupStep(group!)
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
    const errors = validateDraftGroup(session.draft, group!, latest)
    if (errors.length) {
      dispatch({ type: 'expose-validation', group: group! })
      focusError(errors[0]?.field)
      return
    }
    if (group !== 'review') {
      go(questionnaireGroups[step + 1].id)
      return
    }
    const completed = completeDraft(session.draft, latest)
    if (!completed.valid) {
      dispatch({
        type: 'expose-validation',
        group: completed.errors[0]?.group ?? 'review',
      })
      void navigate(`/check/${completed.errors[0]?.group ?? 'review'}`)
      focusError(completed.errors[0]?.field)
      return
    }
    dispatch({ type: 'complete', latestThresholdDate: latest })
    const button = event.currentTarget.getBoundingClientRect()
    void navigate('/plan', {
      state:
        event.detail > 0
          ? {
              confettiOrigin: {
                x: (button.left + button.width / 2) / window.innerWidth,
                y: (button.top + button.height / 2) / window.innerHeight,
              },
            }
          : null,
    })
  }
  return (
    <section
      className="questionnaire journey-layout"
      aria-labelledby="check-title"
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
          <Outlet context={context} />
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
        activeStep={step + 1}
        backAction={
          <Button
            className="w-full min-w-0 px-[.65rem] leading-[1.1]! font-extrabold!"
            variant="outline"
            onClick={() =>
              step === 0
                ? navigate('/', { replace: true })
                : go(questionnaireGroups[step - 1].id, true)
            }
          >
            Back
          </Button>
        }
        action={
          <Button
            className="w-full min-w-0 px-[.65rem] leading-[1.1]! font-extrabold!"
            onClick={next}
          >
            {group === 'review' ? 'Calculate my plan' : 'Continue'}
          </Button>
        }
        disabledSteps={[
          calculationStep,
          ...questionnaireGroups.flatMap(({ id }, index) =>
            canOpenGroup(session.draft, id, latestDate) ? [] : [index + 1],
          ),
        ]}
        onStepSelect={(selected) =>
          selected === 0
            ? navigate('/')
            : go(questionnaireGroups[selected - 1].id)
        }
      />
    </section>
  )
}
