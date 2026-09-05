import { questionnaireGroups } from '@/routes/check/model'
import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import { cn } from 'cn'
import { ChevronDownIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  return (
    <aside
      className={cn('journey-sidebar', className)}
      aria-label="Journey overview"
    >
      <Card className="journey-panel">
        <nav className="journey-nav" aria-label="Journey steps">
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger
              render={<Button variant="ghost" />}
              className="journey-menu-trigger"
              aria-label={`Show journey steps, ${journeySteps[activeStep]}, step ${activeStep + 1} of ${journeySteps.length}`}
            >
              <span className="is-current flex min-w-0 items-center gap-2">
                <span className="journey-number shrink-0" aria-hidden="true">
                  {activeStep + 1}
                </span>
                <span className="truncate">{journeySteps[activeStep]}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2 font-normal text-muted-foreground tabular-nums">
                {activeStep + 1} of {journeySteps.length}
                <ChevronDownIcon
                  aria-hidden="true"
                  className="size-4 text-foreground"
                />
              </span>
            </PopoverTrigger>
            <PopoverContent
              ref={menuRef}
              positionMethod="fixed"
              align="start"
              sideOffset={1}
              collisionPadding={0}
              collisionAvoidance={{ side: 'none', align: 'none' }}
              className="journey-menu-content"
              initialFocus={() =>
                menuRef.current?.querySelector<HTMLButtonElement>(
                  '[aria-current="step"] button',
                ) ?? true
              }
            >
              <PopoverTitle className="sr-only">Journey steps</PopoverTitle>
              <nav aria-label="Journey steps" className="journey-menu-scroll">
                <JourneySteps
                  activeStep={activeStep}
                  disabledSteps={disabledSteps}
                  onStepSelect={(step) => {
                    setMenuOpen(false)
                    onStepSelect(step)
                  }}
                />
              </nav>
            </PopoverContent>
          </Popover>
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
