import Confetti from 'react-confetti-boom'
import { useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { latestQuestionnaireDate, useApp } from '@/app-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import { JourneySidebar, calculationStep } from '@/components/journey-sidebar'
import { firstIncompleteGroup, questionnaireGroups } from '@/routes/check/model'
import {
  Agenda,
  NeedsReview,
  ReviewAreas,
  reviewLabel,
} from '@/routes/plan/agenda'
import {
  AttentionCard,
  GstCard,
  SourceLinks,
  SourceReferences,
  TaxSummary,
} from '@/routes/plan/cards'
import { DeleteNotice, SavedDataState } from '@/routes/plan/editors'
import type { PlanEditor } from '@/routes/plan/editors'
import { usePlanCoordinator } from '@/routes/plan/coordinator'

const confettiColors = ['#15803d', '#0f172a', '#2563eb', '#fbbf24']

export function PlanRoute() {
  const app = useApp()
  const c = usePlanCoordinator(app)
  const {
    model,
    source,
    saveCurrent,
    updatePayment,
    saveCompletion,
    removeCompletion,
    removeCompletionRecord,
  } = c
  const location = useLocation()
  const navigate = useNavigate()
  const routeState = location.state as {
    readonly animate?: boolean
    readonly confettiOrigin?: { readonly x: number; readonly y: number }
  } | null
  const confettiOrigin = routeState?.confettiOrigin
  const isExample =
    source.kind === 'transient' && source.session.origin.kind === 'example'
  const celebrate =
    model.kind === 'supported' &&
    Boolean(confettiOrigin) &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const review = app.editGroup
  useEffect(() => {
    document.querySelector<HTMLElement>('.plan-main h1')?.focus()
  }, [location.key, model.kind])
  if (app.session?.kind === 'editing' && !app.workspaceSelected)
    return (
      <Navigate
        replace
        to={`/check/${firstIncompleteGroup(app.session.draft, latestQuestionnaireDate(new Date())) ?? 'review'}`}
      />
    )
  const renderPlan = () => {
    switch (model.kind) {
      case 'missing':
        return (
          <Card as="section" className="stop-state" variant="result">
            <h1 tabIndex={-1}>Start your estimate</h1>
            <p>Answer the questions to see your plan.</p>
            <Button onClick={() => app.startPersonal()}>
              Start your estimate
            </Button>
          </Card>
        )
      case 'saved-data-unavailable':
        return (
          <SavedDataState
            savedWorkspace={app.savedWorkspace}
            onDelete={c.openDelete}
          />
        )
      case 'deleted':
        return (
          <Card
            as="section"
            className="stop-state"
            variant="result"
            aria-labelledby="deleted-title"
          >
            <Badge variant="state">Saved data deleted</Badge>
            <h1 tabIndex={-1} id="deleted-title">
              Your saved data was removed
            </h1>
            <p>
              My Next Filing no longer has saved data in this browser. You can
              start a new unsaved estimate.
            </p>
            <Button
              className={buttonVariants({ className: 'max-[520px]:w-full' })}
              onClick={() => app.startPersonal()}
            >
              Start an unsaved estimate
            </Button>
          </Card>
        )
      case 'stale': {
        const evaluation = model.evaluation
        return (
          <Card
            as="section"
            className="stop-state"
            variant="result"
            aria-labelledby="stale-title"
          >
            <Badge variant="state">Plan unavailable</Badge>
            <h1 tabIndex={-1} id="stale-title">
              We can't calculate this plan with the current tax rules
            </h1>
            <p>
              The tax rules built into this version are missing, invalid, or
              past their review date. No estimate was calculated. Check the
              official sources below or return after the rules are updated.
            </p>
            {evaluation.expiresOn && (
              <p>
                These tax rules were due for review on{' '}
                {formatDate(evaluation.expiresOn)}.
              </p>
            )}
            <SourceReferences ids={evaluation.sourceIds} />
          </Card>
        )
      }
      case 'unsupported': {
        const evaluation = model.evaluation
        return (
          <Card
            as="section"
            className="stop-state"
            variant="result"
            aria-labelledby="unsupported-title"
          >
            <Badge variant="state">
              This version does not cover your situation
            </Badge>
            <h1 tabIndex={-1} id="unsupported-title">
              We can't calculate a reliable plan from these answers
            </h1>
            <p>
              If an answer is incorrect, review it below. Otherwise, use the
              linked official sources or ask a qualified tax adviser.
            </p>
            <ul className="fact-list">
              {evaluation.facts.map((fact) => (
                <li key={`${fact.code}-${fact.correctionGroup}`}>
                  <strong>{fact.label}.</strong> {fact.reason}{' '}
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => review(fact.correctionGroup)}
                  >
                    {reviewLabel(fact.correctionGroup)}
                  </Button>
                </li>
              ))}
            </ul>
            <SourceReferences ids={evaluation.sourceIds} />
          </Card>
        )
      }
      case 'supported': {
        const {
          evaluation: supported,
          profile,
          workspaceView,
          next,
          completions: activeCompletions,
          saved,
          canSave: canOfferSave,
        } = model
        const savePrompt = c.interaction.kind === 'save-confirmation'
        const editor: PlanEditor | null =
          c.interaction.kind === 'payment-editing'
            ? { kind: 'payment', obligation: c.interaction.obligation }
            : c.interaction.kind === 'completion-editing'
              ? { kind: 'completion', obligation: c.interaction.obligation }
              : null
        return (
          <>
            <header className="question-heading">
              <Badge variant="period" className="mb-[.85rem]">
                {profile?.taxYear}
              </Badge>
              <h1 tabIndex={-1}>Your plan</h1>
              <p>
                Based on the answers you reviewed. My Next Filing does not file,
                pay, or verify completion.
              </p>
            </header>
            <AttentionCard
              next={next}
              completions={activeCompletions}
              saved={saved}
              isExample={isExample}
              advanceTaxPaid={profile?.otherIncome.advanceTaxPaid ?? 0}
              onSave={canOfferSave ? c.openSave : undefined}
              savePrompt={savePrompt}
              onSaveConfirm={saveCurrent}
              onSaveCancel={c.cancel}
              editor={editor}
              onPaymentSubmit={updatePayment}
              onCompletionSubmit={saveCompletion}
              workspaceRevision={c.revision}
              onEditorCancel={c.cancel}
              onUpdatePayment={() => {
                if (next) c.openPayment(next)
              }}
              onChangeDate={(obligation) => c.openCompletion(obligation)}
              onUndo={removeCompletion}
            />
            {c.notice && (
              <Alert className="mt-4" role="status">
                <AlertDescription>{c.notice.message}</AlertDescription>
                {c.notice.kind === 'conflict' && (
                  <Button variant="link" onClick={c.reload}>
                    Reload saved data
                  </Button>
                )}
              </Alert>
            )}
            <div className="plan-summary">
              <TaxSummary tax={supported.tax} />
              <GstCard coverage={supported.coverage.gst} />
            </div>
            <Agenda
              evaluation={supported}
              workspaceView={workspaceView}
              nextId={next?.id ?? null}
              completions={activeCompletions}
              saved={saved}
              onMark={(obligation) => c.openCompletion(obligation)}
              onUpdatePayment={() => {
                const obligation = supported.obligations.find(
                  (item) => item.kind === 'advance-tax',
                )
                if (obligation) c.openPayment(obligation)
              }}
              onChangeDate={(obligation) => c.openCompletion(obligation)}
              onUndo={removeCompletion}
            />
            <ReviewAreas evaluation={supported} onReview={review} />
            <NeedsReview
              workspaceView={workspaceView}
              onDelete={removeCompletionRecord}
            />
            <details className="assumptions rounded-card border border-border bg-card p-[clamp(1.15rem,3vw,1.8rem)] text-card-foreground">
              <summary>Assumptions and limits</summary>
              <ul>
                {supported.assumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
              <ul>
                {supported.explanations.map((explanation) => (
                  <li key={explanation}>{explanation}</li>
                ))}
              </ul>
            </details>
            <details className="assumptions rounded-card border border-border bg-card p-[clamp(1.15rem,3vw,1.8rem)] text-card-foreground">
              <summary>Official sources ({supported.sourceIds.length})</summary>
              <SourceLinks ids={supported.sourceIds} />
            </details>
          </>
        )
      }
    }
  }
  return (
    <section className="plan journey-layout" aria-label="Your plan">
      {celebrate && (
        <Confetti
          colors={confettiColors}
          opacityDeltaMultiplier={2}
          particleCount={45}
          shapeSize={8}
          spreadDeg={60}
          style={{ position: 'fixed', zIndex: 3 }}
          x={confettiOrigin?.x}
          y={confettiOrigin?.y}
        />
      )}
      {isExample && (
        <Alert
          className="notice--top notice--example"
          role="status"
          variant="example"
        >
          <strong>Fictional example.</strong> These amounts are for
          demonstration only.{' '}
          <Button variant="link" onClick={app.returnPersonal}>
            {app.personalSession
              ? 'Return to your estimate'
              : 'Start your estimate'}
          </Button>
        </Alert>
      )}
      <div
        key={location.key}
        className={`plan-main${routeState?.animate ? ' journey-view--enter' : ''}`}
      >
        {renderPlan()}
        {c.staleEdit && (
          <Alert role="status">
            Your saved workspace changed while you were editing. Your answers
            are still here.{' '}
            <Button
              variant="link"
              onClick={() => app.dispatch({ type: 'continue-unsaved' })}
            >
              Continue as a separate estimate
            </Button>
            {app.savedWorkspace.kind === 'ready' && (
              <Button variant="link" onClick={app.discardSavedEdit}>
                Use newer saved workspace
              </Button>
            )}
          </Alert>
        )}
        {model.kind === 'supported' && model.canSaveChanges && (
          <Button className="mt-4" onClick={saveCurrent}>
            Save changes
          </Button>
        )}
        {c.interaction.kind === 'delete-confirmation' ? (
          <DeleteNotice onDelete={c.deleteSaved} onCancel={c.cancel} />
        ) : (
          app.savedWorkspace.kind !== 'absent' && (
            <div className="workspace-controls">
              <Button variant="destructive" onClick={c.openDelete}>
                Delete saved data
              </Button>
            </div>
          )
        )}
        {source.kind === 'workspace' && app.personalSession && (
          <Button variant="link" onClick={app.returnPersonal}>
            Return to your estimate
          </Button>
        )}
        {source.kind !== 'workspace' && app.savedWorkspace.kind === 'ready' && (
          <Button variant="link" onClick={app.openWorkspace}>
            Open saved workspace
          </Button>
        )}
      </div>
      <JourneySidebar
        activeStep={calculationStep}
        backAction={
          <Button
            className="w-full min-w-0 px-[.65rem]"
            variant="outline"
            onClick={() =>
              'profile' in model ? review('review') : app.startPersonal()
            }
          >
            Back
          </Button>
        }
        action={
          <Button
            className="w-full min-w-0 px-[.65rem]"
            onClick={app.startOver}
          >
            Start over
          </Button>
        }
        onStepSelect={(step, animate) =>
          step === 0
            ? navigate('/')
            : step <= questionnaireGroups.length
              ? review(questionnaireGroups[step - 1].id, animate)
              : undefined
        }
      />
    </section>
  )
}
