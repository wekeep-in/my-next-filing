import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { parseProfile } from '@/evaluation'
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
import type { Draft, DraftAmountKey } from '@/routes/check/model'
import {
  blankDraft,
  candidateFromDraft,
  draftFromProfile,
  errorStep,
  exampleProfile,
  groupStep,
  profileErrorKey,
  todayInIndia,
  validateDraftStep,
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
  const [draft, setDraft] = useState<Draft>(() =>
    startingProfile ? draftFromProfile(startingProfile) : blankDraft(),
  )
  const [step, setStep] = useState(() =>
    Math.min(Math.max(routeState?.step ?? 0, 0), questionnaireSteps.length - 1),
  )
  const [highestStep, setHighestStep] = useState(() =>
    Math.min(
      Math.max(
        routeState?.step ??
          (startingProfile ? questionnaireSteps.length - 1 : 0),
        0,
      ),
      questionnaireSteps.length - 1,
    ),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [motion, setMotion] = useState<'none' | 'step'>(
    routeState?.animate ? 'step' : 'none',
  )
  const today = todayInIndia()
  const latestThresholdDate = today < '2027-03-31' ? today : '2027-03-31'

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

  useEffect(() => {
    const first = Object.keys(errors)[0]
    if (!first) return
    const direct = document.getElementById(first)
    const target = direct ?? document.querySelector(`input[name="${first}"]`)
    if (target instanceof HTMLElement) target.focus()
  }, [errors])

  const patchDraft = (patch: Partial<Draft>, ...errorKeys: string[]) => {
    setDraft((current) => ({ ...current, ...patch }))
    setErrors((current) => {
      const next = { ...current }
      for (const key of [...Object.keys(patch), ...errorKeys]) {
        if (key !== 'amounts') delete next[key]
      }
      return next
    })
    setHighestStep((current) => Math.min(current, step))
  }
  const setAmount = (key: DraftAmountKey, value: string) =>
    patchDraft({ amounts: { ...draft.amounts, [key]: value } }, key)

  const validateStep = () => {
    const nextErrors = validateDraftStep(draft, step, latestThresholdDate)
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const go = (nextStep: number, animate: boolean) => {
    setErrors({})
    setMotion(animate ? 'step' : 'none')
    setStep(nextStep)
    setHighestStep((current) => Math.max(current, nextStep))
  }

  const calculate = (event: MouseEvent<HTMLButtonElement>) => {
    const animate = event.detail > 0
    if (!validateStep()) {
      setMotion('none')
      return
    }
    const candidate = candidateFromDraft(draft)
    if (Object.keys(candidate.errors).length > 0) {
      setErrors(candidate.errors)
      setStep(errorStep(Object.keys(candidate.errors)[0] ?? 'review'))
      setMotion('none')
      return
    }
    const parsed = parseProfile(candidate.value)
    if (!parsed.valid) {
      const nextErrors = Object.fromEntries(
        parsed.errors.map((error) => [profileErrorKey(error), error.message]),
      )
      setErrors(nextErrors)
      setStep(groupStep(parsed.errors[0]?.group ?? 'review'))
      setMotion('none')
      return
    }
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
          patchDraft={patchDraft}
        />
      )
    if (step === 1)
      return (
        <ActivityStep
          key={step}
          className={questionGroupClassName}
          draft={draft}
          errors={errors}
          patchDraft={patchDraft}
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
          patchDraft={patchDraft}
        />
      )
    if (step === 4)
      return (
        <OtherIncomeStep
          key={step}
          className={questionGroupClassName}
          draft={draft}
          errors={errors}
          patchDraft={patchDraft}
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
          patchDraft={patchDraft}
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
