import type { ReactNode } from 'react'

export const questionnaireSteps = [
  'Professional receipts',
  'Bank interest',
  'Tax credits and payments',
  'GST check',
  'Review',
] as const

export const calculationStep = questionnaireSteps.length + 1

const journeySteps = ['Overview', ...questionnaireSteps, 'Next Filing']

function JourneySteps({
  activeStep,
  disabledSteps,
  onStepSelect,
}: {
  readonly activeStep: number
  readonly disabledSteps: readonly number[]
  readonly onStepSelect: (step: number, animate: boolean) => void
}) {
  return (
    <ol className="journey-list">
      {journeySteps.map((label, index) => (
        <li
          className={`journey-step${index === activeStep ? ' is-current' : ''}${index < activeStep ? ' is-complete' : ''}`}
          key={label}
          aria-current={index === activeStep ? 'step' : undefined}
        >
          <button
            className="journey-step-link"
            type="button"
            disabled={disabledSteps.includes(index)}
            onClick={(event) => onStepSelect(index, event.detail > 0)}
          >
            <span className="journey-number">{index + 1}</span>
            <span>{label}</span>
          </button>
        </li>
      ))}
    </ol>
  )
}

export function JourneySidebar({
  activeStep,
  backAction,
  action,
  onStepSelect,
  disabledSteps = [],
  className = '',
}: {
  readonly activeStep: number
  readonly backAction: ReactNode
  readonly action: ReactNode
  readonly onStepSelect: (step: number, animate: boolean) => void
  readonly disabledSteps?: readonly number[]
  readonly className?: string
}) {
  return (
    <aside
      className={`journey-sidebar ${className}`.trim()}
      aria-label="Questionnaire overview"
    >
      <div className="journey-panel">
        <nav className="journey-nav--desktop" aria-label="Journey steps">
          <JourneySteps
            activeStep={activeStep}
            disabledSteps={disabledSteps}
            onStepSelect={onStepSelect}
          />
        </nav>
        <nav className="journey-progress-nav" aria-label="Journey steps">
          <div className="journey-progress">
            {journeySteps.map((label, index) => (
              <button
                className={`journey-progress-number${index === activeStep ? ' is-current' : ''}${index < activeStep ? ' is-complete' : ''}`}
                type="button"
                disabled={disabledSteps.includes(index)}
                aria-current={index === activeStep ? 'step' : undefined}
                aria-label={`${index + 1}. ${label}`}
                key={label}
                onClick={(event) => onStepSelect(index, event.detail > 0)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </nav>
        <div className="journey-actions journey-actions--main">
          {backAction}
          {action}
        </div>
      </div>
      <p className="journey-note">
        Review all of the <a href="/#faqs">FAQs</a> prior to starting.
      </p>
      <div className="journey-actions journey-actions--sticky">
        {backAction}
        {action}
      </div>
    </aside>
  )
}
