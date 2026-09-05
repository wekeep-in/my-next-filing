import type { QuestionnaireState } from '@/routes/check/session'
import {
  questionnaireErrors,
  questionnaireReducer,
} from '@/routes/check/session'
import { indiaDate } from '@/lib/india-date'
import { useEffect, useReducer, useState } from 'react'
import type { MouseEvent } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import type { AppOutletContext } from '@/app'
import {
  clearCurrentCheck,
  getCurrentCheck,
  setCurrentCheck,
} from '@/current-check'
import {
  JourneySidebar,
  calculationStep,
  questionnaireSteps,
} from '@/components/journey-sidebar'
import { ActivityStep } from '@/routes/check/activity-step'
import { ClientsStep } from '@/routes/check/clients-step'
import { GstStep } from '@/routes/check/gst-step'
import type { DraftAmountKey } from '@/routes/check/model'
import {
  blankDraft,
  completeDraft,
  draftFromProfile,
  exampleProfile,
  firstIncompleteGroup,
  groupStep,
  questionnaireGroups,
  validateDraftGroup,
} from '@/routes/check/model'
import { OtherIncomeStep } from '@/routes/check/other-income-step'
import { ReceiptsStep } from '@/routes/check/receipts-step'
import { ReviewStep } from '@/routes/check/review'
import { SituationStep } from '@/routes/check/situation-step'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function CheckRoute() {
  const location = useLocation()
  const navigate = useNavigate()
  const { savedWorkspace } = useOutletContext<AppOutletContext>()
  const routeState = location.state as {
    readonly example?: boolean
    readonly personal?: boolean
    readonly editSaved?: boolean
    readonly animate?: boolean
    readonly step?: number
  } | null
  const currentCheck = getCurrentCheck()
  const [usingExample] = useState(
    Boolean(routeState?.example) ||
      Boolean(currentCheck?.example && !routeState?.personal),
  )
  const startingProfile = usingExample
    ? exampleProfile
    : routeState?.personal
      ? null
      : (currentCheck?.profile ??
        (routeState?.editSaved &&
        savedWorkspace.kind === 'ready' &&
        savedWorkspace.workspace.active
          ? savedWorkspace.workspace.active.profile
          : null))
  const [editingSaved] = useState(
    !routeState?.personal &&
      !routeState?.example &&
      (Boolean(routeState?.editSaved) || Boolean(currentCheck?.saved)),
  )
  const [session, dispatch] = useReducer(
    questionnaireReducer,
    null,
    (): QuestionnaireState => ({
      kind: 'editing',
      origin: usingExample
        ? { kind: 'example' }
        : editingSaved
          ? {
              kind: 'saved-edit',
              baseWorkspaceRevision:
                savedWorkspace.kind === 'ready'
                  ? savedWorkspace.workspace.revision
                  : 0,
            }
          : { kind: 'personal' },
      draft: startingProfile ? draftFromProfile(startingProfile) : blankDraft(),
      validationGroup: null,
    }),
  )
  const draft = session?.draft ?? blankDraft()
  const [step, setStep] = useState(() =>
    Math.min(Math.max(routeState?.step ?? 0, 0), questionnaireSteps.length - 1),
  )
  const [motion, setMotion] = useState<'none' | 'step'>(
    routeState?.animate ? 'step' : 'none',
  )
  const today = indiaDate(new Date())
  const latestThresholdDate = today < '2027-03-31' ? today : '2027-03-31'
  const highestStep = groupStep(
    firstIncompleteGroup(draft, latestThresholdDate) ?? 'review',
  )
  const errors = Object.fromEntries(
    questionnaireErrors(session, latestThresholdDate).map(
      ({ field, message }) => [field, message],
    ),
  )

  useEffect(() => {
    if (routeState?.example || routeState?.personal) clearCurrentCheck()
    if (routeState?.example || routeState?.personal || routeState?.editSaved)
      void navigate('/check', { replace: true, state: null })
  }, [
    navigate,
    routeState?.editSaved,
    routeState?.example,
    routeState?.personal,
  ])

  useEffect(() => {
    window.scrollTo(0, 0)
    document.getElementById('check-title')?.focus()
  }, [step])

  const focusError = (field: string | undefined) => {
    if (!field) return
    requestAnimationFrame(() => {
      const target =
        document.getElementById(field) ??
        document.querySelector(`input[name="${field}"]`)
      if (target instanceof HTMLElement) target.focus()
    })
  }
  const setAmount = (field: DraftAmountKey, value: string) =>
    dispatch({ type: 'amount-changed', field, value })

  const validateStep = () => {
    const nextErrors = Object.fromEntries(
      validateDraftGroup(
        draft,
        questionnaireGroups[step].id,
        latestThresholdDate,
      ).map(({ field, message }) => [field, message]),
    )
    dispatch({ type: 'expose-validation', group: questionnaireGroups[step].id })
    focusError(Object.keys(nextErrors)[0])
    return Object.keys(nextErrors).length === 0
  }

  const go = (nextStep: number, animate: boolean) => {
    dispatch({ type: 'clear-validation' })
    setMotion(animate ? 'step' : 'none')
    setStep(nextStep)
  }

  const calculate = (event: MouseEvent<HTMLButtonElement>) => {
    const animate = event.detail > 0
    if (!validateStep()) {
      setMotion('none')
      return
    }
    const parsed = completeDraft(draft, latestThresholdDate)
    if (!parsed.valid) {
      dispatch({
        type: 'expose-validation',
        group: parsed.errors[0]?.group ?? 'review',
      })
      focusError(parsed.errors[0]?.field)
      setStep(groupStep(parsed.errors[0]?.group ?? 'review'))
      setMotion('none')
      return
    }
    dispatch({ type: 'complete', latestThresholdDate })
    setCurrentCheck(parsed.profile, usingExample, true, editingSaved)
    const button = event.currentTarget.getBoundingClientRect()
    void navigate('/plan', {
      state: animate
        ? {
            animate: true,
            confettiOrigin: {
              x: (button.left + button.width / 2) / window.innerWidth,
              y: (button.top + button.height / 2) / window.innerHeight,
            },
          }
        : null,
    })
  }

  const selectJourneyStep = (journeyStep: number, animate: boolean) => {
    if (journeyStep === 0) void navigate('/', { state: { animate } })
    else if (
      journeyStep <= questionnaireSteps.length &&
      journeyStep - 1 <= highestStep
    )
      go(journeyStep - 1, animate)
  }

  const questionGroupClassName = `question-group${motion === 'step' ? ' question-group--enter' : ''}`
  const stepContent = () => {
    if (step === 0)
      return (
        <SituationStep
          key={step}
          className={questionGroupClassName}
          draft={draft}
          errors={errors}
          dispatch={dispatch}
        />
      )
    if (step === 1)
      return (
        <ActivityStep
          key={step}
          className={questionGroupClassName}
          draft={draft}
          errors={errors}
          dispatch={dispatch}
        />
      )
    if (step === 2)
      return (
        <ReceiptsStep
          key={step}
          className={questionGroupClassName}
          draft={draft}
          errors={errors}
          setAmount={setAmount}
        />
      )
    if (step === 3)
      return (
        <ClientsStep
          key={step}
          className={questionGroupClassName}
          draft={draft}
          errors={errors}
          dispatch={dispatch}
        />
      )
    if (step === 4)
      return (
        <OtherIncomeStep
          key={step}
          className={questionGroupClassName}
          draft={draft}
          errors={errors}
          dispatch={dispatch}
          setAmount={setAmount}
        />
      )
    if (step === 5)
      return (
        <GstStep
          key={step}
          className={questionGroupClassName}
          draft={draft}
          errors={errors}
          latestThresholdDate={latestThresholdDate}
          dispatch={dispatch}
          setAmount={setAmount}
        />
      )
    return (
      <ReviewStep
        key={step}
        className={questionGroupClassName}
        draft={draft}
        errors={errors}
        onEdit={(nextStep) => go(nextStep, true)}
      />
    )
  }

  const onNext = (event: MouseEvent<HTMLButtonElement>) => {
    const animate = event.detail > 0
    if (step === questionnaireSteps.length - 1) calculate(event)
    else if (validateStep()) go(step + 1, animate)
    else setMotion('none')
  }

  return (
    <section
      className="questionnaire journey-layout"
      aria-labelledby="check-title"
    >
      {usingExample && (
        <Alert
          className="notice--top notice--example"
          variant="example"
          role="status"
        >
          <strong>Fictional example.</strong> You can explore these answers, but
          they cannot be saved.
        </Alert>
      )}
      <div className="questionnaire-main">{stepContent()}</div>
      <JourneySidebar
        activeStep={step + 1}
        backAction={
          <Button
            className="w-full min-w-0 px-[.65rem] leading-[1.1]! font-extrabold!"
            variant="outline"
            type="button"
            onClick={() => (step === 0 ? navigate('/') : go(step - 1, true))}
          >
            Back
          </Button>
        }
        action={
          <Button
            className="w-full min-w-0 px-[.65rem] leading-[1.1]! font-extrabold!"
            type="button"
            onClick={onNext}
          >
            {step === questionnaireSteps.length - 1
              ? 'Calculate my plan'
              : 'Continue'}
          </Button>
        }
        disabledSteps={Array.from(
          { length: calculationStep + 1 },
          (_, index) => index,
        ).filter(
          (index) => index === calculationStep || index > highestStep + 1,
        )}
        onStepSelect={selectJourneyStep}
      />
    </section>
  )
}
