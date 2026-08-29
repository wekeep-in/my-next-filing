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
        <nav aria-label="Journey steps">
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
        </nav>
        <div className="journey-actions">
          {backAction}
          {action}
        </div>
      </div>
      <p className="journey-note">
        Review all of the <a href="/#faqs">FAQs</a> prior to starting.
      </p>
    </aside>
  )
}
