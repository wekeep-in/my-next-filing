import { questionnaireGroups } from '@/routes/check/model'
import type { ReactNode } from 'react'
import { cn } from 'cn'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const questionnaireSteps = questionnaireGroups.map(({ label }) => label)

export const calculationStep = questionnaireSteps.length + 1
const journeySteps = ['Overview', ...questionnaireSteps, 'Your plan']
const noDisabledSteps: readonly number[] = []

function JourneySteps({
  activeStep,
  disabledSteps,
  onStepSelect,
}: {
  readonly activeStep: number
  readonly disabledSteps: readonly number[]
  readonly onStepSelect: (step: number) => void
}) {
  return (
    <ol className="journey-list">
      {journeySteps.map((label, index) => (
        <li
          className={cn(
            'journey-step',
            index === activeStep && 'is-current',
            index < activeStep && 'is-complete',
          )}
          key={label}
          aria-current={index === activeStep ? 'step' : undefined}
        >
          <Button
            className="journey-step-link whitespace-normal active:not-focus-visible:scale-100"
            variant="ghost"
            type="button"
            disabled={disabledSteps.includes(index)}
            aria-label={`${index + 1}. ${label}`}
            onClick={() => onStepSelect(index)}
          >
            <span className="journey-number">{index + 1}</span>
            <span className="journey-label">{label}</span>
          </Button>
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
  disabledSteps = noDisabledSteps,
  className = '',
}: {
  readonly activeStep: number
  readonly backAction: ReactNode
  readonly action: ReactNode
  readonly onStepSelect: (step: number) => void
  readonly disabledSteps?: readonly number[]
  readonly className?: string
}) {
  return (
    <aside
      className={cn('journey-sidebar', className)}
      aria-label="Journey overview"
    >
      <Card className="journey-panel">
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
      </Card>
      <p className="journey-note">
        Questions? <Link to="/#faqs">Read the FAQs</Link>
        {'.'}
      </p>
    </aside>
  )
}
