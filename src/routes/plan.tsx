import Confetti from 'react-confetti-boom'
import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { latestQuestionnaireDate, useApp } from '@/app-context'
import { TopBar } from '@/components/top-bar'
import { Badge } from '@/components/ui/badge'
import { PeriodNavigation } from '@/components/period-navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import {
  JourneySidebar,
  calculationStep,
  journeySteps,
} from '@/components/journey-sidebar'
import {
  firstIncompleteGroup,
  questionnaireRouteForGroup,
  questionnaireRoutes,
} from '@/routes/check/model'
import {
  Agenda,
  NeedsReview,
  ReviewAreas,
  reviewLabel,
} from '@/routes/plan/agenda'
import {
  AttentionCard,
  ForeignGuidanceCard,
  GstCard,
  SourceLinks,
  SourceReferences,
  TaxSummary,
} from '@/routes/plan/cards'
import { DeleteNotice, SaveNotice, SavedDataState } from '@/routes/plan/editors'
import type { PlanEditor } from '@/routes/plan/editors'
import { usePlanCoordinator } from '@/routes/plan/coordinator'
import { sessionMatchesWorkspace } from '@/routes/plan/model'

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
  const routeState = location.state as {
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
  if (app.session?.kind === 'editing' && !app.workspaceSelected) {
    const incomplete = firstIncompleteGroup(
      app.session.draft,
      latestQuestionnaireDate(new Date()),
    )
    return (
      <Navigate
        replace
        to={`/check/${incomplete ? questionnaireRouteForGroup(incomplete) : 'review'}${app.session.origin.kind === 'example' ? '?example=1' : ''}`}
      />
    )
  }
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
              The tax rules built into this app are missing, invalid, or past
              their review date. No estimate was calculated. Check the official
              sources below or return after the rules are updated.
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
            <h1 tabIndex={-1} id="unsupported-title">
              This app cannot estimate tax for your situation
            </h1>
            <p>
              Your answers are still here. If one is incorrect, edit it below.
              If these answers are right, ask a tax adviser about the listed
              conditions. Do not leave out income to get an estimate.
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
              <PeriodNavigation>{profile?.taxYear}</PeriodNavigation>
              <h1 tabIndex={-1}>Your plan</h1>
              <p>
                Your income-tax estimate and next actions, based on the answers
                you reviewed. Use the official portals to file or pay. Marking
                an action complete here only updates your own plan.
              </p>
            </header>
            <AttentionCard
              next={next}
              completions={activeCompletions}
              saved={saved}
              isExample={isExample}
              advanceTaxPaid={profile?.otherIncome.advanceTaxPaid ?? 0}
              onSave={canOfferSave ? c.openSave : undefined}
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
            {savePrompt && (
              <SaveNotice onSave={saveCurrent} onContinue={c.cancel}>
                {c.notice && (
                  <p role="alert" className="field-error">
                    {c.notice.message}{' '}
                    {c.notice.kind === 'conflict' && (
                      <Button variant="link" onClick={c.reload}>
                        Reload saved data
                      </Button>
                    )}
                  </p>
                )}
              </SaveNotice>
            )}
            {c.notice && !savePrompt && (
              <TopBar
                variant={
                  c.notice.kind === 'conflict' ? 'warning' : 'destructive'
                }
              >
                {c.notice.message}{' '}
                {c.notice.kind === 'conflict' && (
                  <Button variant="link" onClick={c.reload}>
                    Reload saved data
                  </Button>
                )}
              </TopBar>
            )}
            <div className="plan-summary">
              <TaxSummary
                tax={supported.tax}
                annualReturn={supported.coverage.annualReturn}
              />
              <GstCard coverage={supported.coverage.gst} />
              <ForeignGuidanceCard
                coverage={supported.coverage.foreignGuidance}
              />
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
        <TopBar variant="example">
          <strong>Fictional example.</strong> These amounts are for
          demonstration only.{' '}
          <Button variant="link" onClick={app.returnPersonal}>
            {app.personalSession
              ? 'Return to your estimate'
              : 'Start your estimate'}
          </Button>
        </TopBar>
      )}
      <div className="plan-main">
        {renderPlan()}
        {c.staleEdit && (
          <TopBar variant="warning">
            Your saved workspace changed while you were editing. Your answers
            are still here.{' '}
            <Button
              variant="link"
              onClick={() => app.dispatch({ type: 'continue-unsaved' })}
            >
              Continue as a separate estimate
            </Button>{' '}
            {app.savedWorkspace.kind === 'ready' && (
              <Button variant="link" onClick={app.discardSavedEdit}>
                Use newer saved workspace
              </Button>
            )}
          </TopBar>
        )}
        <div className="workspace-controls">
          {model.kind === 'supported' && model.canSaveChanges && (
            <Button onClick={saveCurrent}>Save changes</Button>
          )}
          {c.interaction.kind !== 'delete-confirmation' &&
            model.kind !== 'saved-data-unavailable' &&
            app.savedWorkspace.kind !== 'absent' && (
              <Button variant="destructive" onClick={c.openDelete}>
                Delete saved data
              </Button>
            )}
        </div>
        {c.interaction.kind === 'delete-confirmation' && (
          <DeleteNotice onDelete={c.deleteSaved} onCancel={c.cancel} />
        )}
        {source.kind === 'workspace' && app.personalSession && (
          <Button
            className="workspace-switch"
            variant="link"
            onClick={app.returnPersonal}
          >
            Return to your estimate
          </Button>
        )}
        {source.kind !== 'workspace' &&
          app.savedWorkspace.kind === 'ready' &&
          !sessionMatchesWorkspace(app.session, app.savedWorkspace) && (
            <Button
              className="workspace-switch"
              variant="link"
              onClick={app.openWorkspace}
            >
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
            variant="outline"
            onClick={app.startOver}
          >
            Start over
          </Button>
        }
        onStepSelect={(step) => {
          const target = journeySteps[step].id
          if (target !== 'plan')
            review(
              questionnaireRoutes.find(({ id }) => id === target)!.groups[0],
            )
        }}
      />
    </section>
  )
}
