import { groupStep } from '@/routes/check/model'
import Confetti from 'react-confetti-boom'
import { useEffect, useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useOutletContext,
} from 'react-router-dom'
import type { AppOutletContext } from '@/app'
import { Alert, AlertAction, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import {
  clearCurrentCheck,
  getCurrentCheck,
  setCurrentCheck,
} from '@/current-check'
import { evaluate, parseProfile } from '@/evaluation'
import type { Obligation, Profile, ProfileGroup } from '@/evaluation'
import {
  JourneySidebar,
  calculationStep,
  questionnaireSteps,
} from '@/components/journey-sidebar'
import { currentRules } from '@/rules'
import type { DateOnly } from '@/rules'
import {
  deleteSavedWorkspace,
  deriveWorkspaceView,
  saveSavedWorkspace,
} from '@/workspace'
import type { CompletionRecord, SavedWorkspaceDraft } from '@/workspace'
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

const confettiColors = ['#15803d', '#0f172a', '#2563eb', '#fbbf24']
const deletedWorkspaceMessage =
  'Your saved answers and completion dates were removed from this browser.'

function sourceStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function PlanRoute() {
  const location = useLocation()
  const navigate = useNavigate()
  const { savedWorkspace, refreshSavedWorkspace } =
    useOutletContext<AppOutletContext>()
  const [, setRefresh] = useState(0)
  const currentCheck = getCurrentCheck()
  const [savePrompt, setSavePrompt] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [deletionToastVisible, setDeletionToastVisible] = useState(false)
  const [storageConflict, setStorageConflict] = useState(false)
  const [deletePrompt, setDeletePrompt] = useState(false)
  const [deletedWorkspace, setDeletedWorkspace] = useState(false)
  const [editor, setEditor] = useState<PlanEditor | null>(null)
  const [editorMessage, setEditorMessage] = useState('')
  const transient = currentCheck?.complete ? currentCheck : null
  const profile =
    transient?.profile ??
    (savedWorkspace.kind === 'ready' && savedWorkspace.workspace.active
      ? savedWorkspace.workspace.active.profile
      : null)
  const now = new Date()
  const evaluation = profile ? evaluate(profile, now, currentRules) : null
  const isExample = Boolean(transient?.example)
  const saved =
    savedWorkspace.kind === 'ready' &&
    !isExample &&
    (!transient || transient.saved) &&
    Boolean(savedWorkspace.workspace.active)
  const activeCompletions =
    saved && savedWorkspace.kind === 'ready' && savedWorkspace.workspace.active
      ? savedWorkspace.workspace.active.completions
      : []
  const hasUnsavedSavedProfile =
    saved &&
    Boolean(transient) &&
    Boolean(
      savedWorkspace.kind === 'ready' && savedWorkspace.workspace.active,
    ) &&
    JSON.stringify(profile) !==
      JSON.stringify(
        savedWorkspace.kind === 'ready'
          ? savedWorkspace.workspace.active?.profile
          : null,
      )
  const workspaceView =
    evaluation && !isExample
      ? deriveWorkspaceView(saved ? savedWorkspace.workspace : null, {
          [profile?.taxYear ?? currentRules.taxPeriod]: evaluation,
        })
      : null
  const supported = evaluation?.kind === 'supported' ? evaluation : null
  const canOfferSave = Boolean(
    supported &&
    !isExample &&
    savedWorkspace.kind === 'absent' &&
    !saved &&
    !savePrompt &&
    !saveMessage,
  )
  const next = workspaceView
    ? (workspaceView.next?.obligation ?? null)
    : (supported?.obligations[0] ?? null)
  const routeState = location.state as {
    readonly animate?: boolean
    readonly confettiOrigin?: { readonly x: number; readonly y: number }
  } | null
  const confettiOrigin = routeState?.confettiOrigin
  const celebrate =
    Boolean(supported && confettiOrigin) &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (saveMessage !== deletedWorkspaceMessage) return
    const hide = window.setTimeout(() => setDeletionToastVisible(false), 3800)
    const remove = window.setTimeout(() => setSaveMessage(''), 4000)
    return () => {
      window.clearTimeout(hide)
      window.clearTimeout(remove)
    }
  }, [saveMessage])

  if (
    !profile &&
    !deletedWorkspace &&
    savedWorkspace.kind !== 'invalid' &&
    savedWorkspace.kind !== 'unavailable'
  ) {
    return <Navigate to="/check" replace />
  }

  const persist = (
    nextProfile: Profile,
    completions: readonly CompletionRecord[],
    actionDate = new Date(),
  ): boolean => {
    const storage = sourceStorage()
    if (!storage) {
      setEditorMessage(
        'This browser did not make storage available. Your current work remains in this tab.',
      )
      setStorageConflict(false)
      return false
    }
    const currentSaved =
      savedWorkspace.kind === 'ready' ? savedWorkspace.workspace : null
    const draft: SavedWorkspaceDraft = {
      noticeVersion: 2,
      consentDecidedAt:
        currentSaved?.consentDecidedAt ?? actionDate.toISOString(),
      activeTaxYear: nextProfile.taxYear,
      active: {
        ruleDatasetId: currentRules.id,
        profile: nextProfile,
        completions,
      },
      priorYears: currentSaved?.priorYears ?? [],
    }
    const result = saveSavedWorkspace(
      storage,
      currentSaved?.revision ?? null,
      draft,
      actionDate,
    )
    if (result.kind === 'saved') {
      setStorageConflict(false)
      clearCurrentCheck()
      refreshSavedWorkspace()
      setSavePrompt(false)
      setEditorMessage('')
      setRefresh((value) => value + 1)
      return true
    } else if (result.kind === 'conflict') {
      setStorageConflict(true)
      setEditorMessage(
        'This saved data changed in another tab. Reload it before trying again.',
      )
    } else if (result.kind === 'invalid') {
      setStorageConflict(false)
      setEditorMessage('This saved data cannot be updated until you delete it.')
    } else {
      setStorageConflict(false)
      setEditorMessage(
        'This change was not saved. Your current work remains in this tab.',
      )
    }
    return false
  }

  const saveCurrent = () => {
    if (!profile || !supported || isExample) return
    const currentSaved =
      savedWorkspace.kind === 'ready' ? savedWorkspace.workspace : null
    persist(profile, currentSaved?.active?.completions ?? [])
  }

  const updatePayment = (raw: string) => {
    if (!profile) return
    const amount = Number(raw)
    const parsed = parseProfile({
      ...profile,
      otherIncome: { ...profile.otherIncome, advanceTaxPaid: amount },
    })
    if (!parsed.valid) {
      setEditorMessage(
        'The payment value could not be accepted. Your current work remains unchanged.',
      )
      return
    }
    const actionDate = new Date()
    const nextEvaluation = evaluate(parsed.profile, actionDate, currentRules)
    if (nextEvaluation.kind !== 'supported') {
      setEditorMessage(
        'This update changed the supported result. Review the answers before saving it.',
      )
      return
    }
    const currentSaved =
      savedWorkspace.kind === 'ready' ? savedWorkspace.workspace : null
    if (currentSaved) {
      if (
        persist(
          parsed.profile,
          currentSaved.active?.completions ?? [],
          actionDate,
        )
      )
        setEditor(null)
    } else {
      setCurrentCheck(parsed.profile, false, true, false)
      setRefresh((value) => value + 1)
      setEditor(null)
      setEditorMessage('')
    }
  }

  const saveCompletion = (obligation: Obligation, date: DateOnly) => {
    if (
      !savedWorkspace.kind ||
      savedWorkspace.kind !== 'ready' ||
      !savedWorkspace.workspace.active ||
      !profile
    )
      return
    const completions = [
      ...savedWorkspace.workspace.active.completions.filter(
        (record) => record.obligationId !== obligation.id,
      ),
      { obligationId: obligation.id, completedOn: date },
    ]
    if (persist(profile, completions)) setEditor(null)
  }

  const removeCompletion = (obligation: Obligation) => {
    if (
      savedWorkspace.kind !== 'ready' ||
      !savedWorkspace.workspace.active ||
      !profile
    )
      return
    persist(
      profile,
      savedWorkspace.workspace.active.completions.filter(
        (record) => record.obligationId !== obligation.id,
      ),
    )
  }

  const removeCompletionRecord = (record: CompletionRecord) => {
    if (
      savedWorkspace.kind !== 'ready' ||
      !savedWorkspace.workspace.active ||
      !profile
    )
      return
    persist(
      profile,
      savedWorkspace.workspace.active.completions.filter(
        (candidate) => candidate.obligationId !== record.obligationId,
      ),
    )
  }

  const deleteSaved = () => {
    const storage = sourceStorage()
    if (!storage) {
      setSaveMessage(
        'The browser did not make saved data available. Nothing was deleted.',
      )
      return
    }
    const expected =
      savedWorkspace.kind === 'ready' ? savedWorkspace.workspace.revision : null
    const result = deleteSavedWorkspace(storage, expected)
    if (result.kind === 'deleted' || result.kind === 'absent') {
      if (profile) {
        setCurrentCheck(profile, false, true, false)
      } else {
        clearCurrentCheck()
        setDeletedWorkspace(true)
      }
      refreshSavedWorkspace()
      setDeletePrompt(false)
      setEditor(null)
      setEditorMessage('')
      setDeletionToastVisible(true)
      setSaveMessage(deletedWorkspaceMessage)
      return
    }
    setSaveMessage(
      result.kind === 'conflict'
        ? 'The saved data changed in another tab. Reload before deleting it.'
        : 'Saved data was not removed.',
    )
  }

  const review = (group: ProfileGroup, animate = false) => {
    if (!profile) return
    setCurrentCheck(profile, isExample, true, saved)
    void navigate('/check', {
      state: animate
        ? { step: groupStep(group), animate: true }
        : { step: groupStep(group) },
    })
  }

  const startOver = () => {
    clearCurrentCheck()
    void navigate('/check', { state: { personal: true } })
  }

  const content = deletedWorkspace ? (
    <Card
      as="section"
      className="stop-state"
      variant="result"
      aria-labelledby="deleted-title"
    >
      <Badge variant="state">Saved data deleted</Badge>
      <h1 id="deleted-title">Your saved data was removed</h1>
      <p>
        My Next Filing no longer has saved data in this browser. You can start a
        new unsaved estimate.
      </p>
      <Link
        className={buttonVariants({ className: 'max-[520px]:w-full' })}
        to="/check"
      >
        Start an unsaved estimate
      </Link>
    </Card>
  ) : evaluation?.kind === 'stale-rules' ? (
    <Card
      as="section"
      className="stop-state"
      variant="result"
      aria-labelledby="stale-title"
    >
      <Badge variant="state">Plan unavailable</Badge>
      <h1 id="stale-title">
        We can't calculate this plan with the current tax rules
      </h1>
      <p>
        The tax rules built into this version are missing, invalid, or past
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
  ) : evaluation?.kind === 'unsupported' ? (
    <Card
      as="section"
      className="stop-state"
      variant="result"
      aria-labelledby="unsupported-title"
    >
      <Badge variant="state">This version does not cover your situation</Badge>
      <h1 id="unsupported-title">
        We can't calculate a reliable plan from these answers
      </h1>
      <p>
        If an answer is incorrect, review it below. Otherwise, use the linked
        official sources or ask a qualified tax adviser.
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
  ) : (
    supported && (
      <>
        <header className="question-heading">
          <Badge variant="period" className="mb-[.85rem]">
            {profile?.taxYear}
          </Badge>
          <h1>Your plan</h1>
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
          onSave={canOfferSave ? () => setSavePrompt(true) : undefined}
          savePrompt={savePrompt}
          onSaveConfirm={saveCurrent}
          onSaveCancel={() => setSavePrompt(false)}
          editor={editor}
          onPaymentSubmit={updatePayment}
          onCompletionSubmit={saveCompletion}
          onEditorCancel={() => setEditor(null)}
          onUpdatePayment={() => {
            if (next) setEditor({ kind: 'payment', obligation: next })
          }}
          onChangeDate={(obligation) =>
            setEditor({ kind: 'completion', obligation })
          }
          onUndo={removeCompletion}
        />
        {editorMessage && (
          <Alert className="mt-4" role="status">
            <AlertDescription>{editorMessage}</AlertDescription>
            {storageConflict && (
              <AlertAction>
                <Button
                  variant="link"
                  type="button"
                  onClick={() => {
                    clearCurrentCheck()
                    refreshSavedWorkspace()
                    setStorageConflict(false)
                    setEditorMessage('')
                    setEditor(null)
                    setRefresh((value) => value + 1)
                  }}
                >
                  Reload saved data
                </Button>
              </AlertAction>
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
          onMark={(obligation) => setEditor({ kind: 'completion', obligation })}
          onUpdatePayment={() => {
            const obligation = supported.obligations.find(
              (item) => item.kind === 'advance-tax',
            )
            if (obligation) setEditor({ kind: 'payment', obligation })
          }}
          onChangeDate={(obligation) =>
            setEditor({ kind: 'completion', obligation })
          }
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
  )

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
          demonstration only.
        </Alert>
      )}
      {saveMessage && (
        <Alert
          className={`notice--top${saveMessage === deletedWorkspaceMessage ? ' notice--toast' : ''}`}
          data-visible={
            saveMessage === deletedWorkspaceMessage
              ? deletionToastVisible
              : undefined
          }
          role="status"
        >
          {saveMessage}
        </Alert>
      )}
      <div
        className={`plan-main${routeState?.animate ? ' journey-view--enter' : ''}`}
      >
        {(savedWorkspace.kind === 'invalid' ||
          savedWorkspace.kind === 'unavailable') &&
        !transient ? (
          <SavedDataState
            savedWorkspace={savedWorkspace}
            onDelete={() => setDeletePrompt(true)}
          />
        ) : (
          content
        )}
        {saved && (
          <div className="workspace-controls">
            {deletePrompt ? (
              <DeleteNotice
                onDelete={deleteSaved}
                onCancel={() => setDeletePrompt(false)}
              />
            ) : (
              <div className="button-row">
                {supported && hasUnsavedSavedProfile && (
                  <Button
                    className="max-[520px]:w-full"
                    type="button"
                    onClick={saveCurrent}
                  >
                    Save changes
                  </Button>
                )}
                <Button
                  className="max-[520px]:w-full"
                  variant="destructive"
                  type="button"
                  onClick={() => setDeletePrompt(true)}
                >
                  Delete saved data
                </Button>
              </div>
            )}
          </div>
        )}
        {deletePrompt && !saved && (
          <DeleteNotice
            onDelete={deleteSaved}
            onCancel={() => setDeletePrompt(false)}
          />
        )}
        {!supported && saved && (
          <NeedsReview
            workspaceView={workspaceView}
            onDelete={removeCompletionRecord}
          />
        )}
      </div>
      <JourneySidebar
        activeStep={calculationStep}
        backAction={
          <Button
            className="w-full min-w-0 px-[.65rem]"
            variant="outline"
            type="button"
            onClick={() => (profile ? review('review') : navigate('/check'))}
          >
            Back
          </Button>
        }
        action={
          <Button
            className="w-full min-w-0 px-[.65rem]"
            type="button"
            onClick={startOver}
          >
            Start over
          </Button>
        }
        disabledSteps={[]}
        onStepSelect={(journeyStep, animate) =>
          journeyStep === 0
            ? navigate('/', { state: { animate } })
            : journeyStep <= questionnaireSteps.length
              ? review(
                  (
                    [
                      'tax-year',
                      'activity',
                      'receipts',
                      'clients',
                      'other-income',
                      'gst',
                      'review',
                    ] as const
                  )[journeyStep - 1],
                  animate,
                )
              : undefined
        }
      />
    </section>
  )
}
