import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export const questionnaireSteps = [
  'Your situation',
  'Activity and path',
  'Receipts and profit',
  'Clients and work',
  'Other income',
  'GST and return facts',
  'Review',
] as const

export const calculationStep = questionnaireSteps.length + 1
const journeySteps = ['Overview', ...questionnaireSteps, 'Your plan']

const sharePayload = {
  title: 'My Next Filing',
  text: 'A clear, best-effort tax and filing overview for supported solo freelancers in India.',
  url: 'https://mynextfiling.wekeep.in/',
} as const

function ShareLink() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  const share = async () => {
    setStatus('idle')
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(sharePayload)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError'))
          setStatus('failed')
      }
      return
    }
    if (!navigator.clipboard) {
      setStatus('failed')
      return
    }
    try {
      await navigator.clipboard.writeText(sharePayload.url)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <>
      <button className="text-button" type="button" onClick={share}>
        Share
      </button>
      {status === 'copied' && (
        <span className="share-result" role="status">
          {' '}
          Link copied.
        </span>
      )}
      {status === 'failed' && (
        <span className="field-error" role="alert">
          {' '}
          The browser could not share or copy the link.
        </span>
      )}
    </>
  )
}

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
        <Link to="/#faqs">Read the FAQs</Link> and don't forget to <ShareLink />
        .
      </p>
    </aside>
  )
}
