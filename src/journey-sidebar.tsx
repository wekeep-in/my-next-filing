import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export const questionnaireSteps = [
  'You and your practice',
  'Your work and tax method',
  'Receipts and profit',
  'Clients and payments',
  'Other income and tax paid',
  'GST and filing',
  'Review your answers',
] as const

export const calculationStep = questionnaireSteps.length + 1
const journeySteps = ['Overview', ...questionnaireSteps, 'Your plan']

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
            aria-label={`${index + 1}. ${label}`}
            onClick={(event) => onStepSelect(index, event.detail > 0)}
          >
            <span className="journey-number">{index + 1}</span>
            <span className="journey-label">{label}</span>
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
        <nav className="journey-nav" aria-label="Journey steps">
          <JourneySteps
            activeStep={activeStep}
            disabledSteps={disabledSteps}
            onStepSelect={onStepSelect}
          />
        </nav>
        <div className="journey-actions">
          {backAction}
          {action}
        </div>
      </div>
      <p className="journey-note">
        Questions? <Link to="/#faqs">Read the FAQs</Link>.
      </p>
    </aside>
  )
}
