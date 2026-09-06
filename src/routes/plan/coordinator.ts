import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { browserStorage, latestQuestionnaireDate } from '@/app-context'
import type { AppOutletContext } from '@/app-context'
import { currentRules } from '@/rules'
import type { DateOnly } from '@/rules'
import { canCompleteObligation, evaluate, parseProfile } from '@/evaluation'
import type { Obligation, Profile } from '@/evaluation'
import { STORAGE_NOTICE_VERSION, saveSavedWorkspace } from '@/workspace'
import type { CompletionRecord, SavedWorkspaceDraft } from '@/workspace'
import {
  derivePlanModel,
  preparePayment,
  selectPlanSource,
  updateCompletionRecords,
} from '@/routes/plan/model'
import type { PlanSource } from '@/routes/plan/model'

export type PlanInteraction =
  | { readonly kind: 'none' }
  | { readonly kind: 'save-confirmation' }
  | { readonly kind: 'delete-confirmation'; readonly revision: number | null }
  | {
      readonly kind: 'payment-editing' | 'completion-editing'
      readonly obligation: Obligation
      readonly revision: number | null
      readonly source: PlanSource['kind']
    }

type MutationNotice = {
  readonly kind: 'error' | 'conflict'
  readonly message: string
} | null

export function usePlanCoordinator(app: AppOutletContext) {
  const navigate = useNavigate()
  const [now, setNow] = useState(() => new Date())
  const source = selectPlanSource(
    app.session,
    app.savedWorkspace,
    app.workspaceSelected,
    app.deleted,
  )
  const model = derivePlanModel(source, now, currentRules, app.savedWorkspace)
  const [interaction, setInteraction] = useState<PlanInteraction>({
    kind: 'none',
  })
  const [notice, setNotice] = useState<MutationNotice>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const currentWorkspace =
    app.savedWorkspace.kind === 'ready' ? app.savedWorkspace.workspace : null
  const revision = currentWorkspace?.revision ?? null
  const staleEdit =
    source.kind === 'transient' &&
    source.session.origin.kind === 'saved-edit' &&
    source.session.origin.baseWorkspaceRevision !== revision
  const error = (message: string) => setNotice({ kind: 'error', message })
  const conflict = () =>
    setNotice({
      kind: 'conflict',
      message:
        'This saved data changed in another tab. Your current work is still here. Reload the saved data before trying again.',
    })
  const open = (next: PlanInteraction) => {
    setNow(new Date())
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    setNotice(null)
    setInteraction(next)
  }
  const cancel = () => {
    setInteraction({ kind: 'none' })
    setNotice(null)
    trigger.current?.focus()
  }
  useEffect(() => {
    if (interaction.kind === 'none' || interaction.kind === 'save-confirmation')
      return
    const target =
      interaction.kind === 'payment-editing'
        ? document.getElementById('advance-tax-update')
        : document.querySelector(
            '.inline-editor input, .inline-editor [id^="completion-date-"], .delete-notice button',
          )
    if (target instanceof HTMLElement) target.focus()
  }, [interaction])

  const persist = (
    profile: Profile,
    completions: readonly CompletionRecord[],
    expectedRevision: number | null,
    actionDate: Date,
    commitSession: boolean,
  ) => {
    if (app.writesPaused) {
      error(
        'Finish or cancel the pending deletion before saving another change.',
      )
      return false
    }
    const storage = browserStorage('localStorage')
    if (!storage) {
      error(
        'This browser did not make saving available. Your current work remains in this tab.',
      )
      return false
    }
    const draft: SavedWorkspaceDraft = {
      noticeVersion: STORAGE_NOTICE_VERSION,
      consentDecidedAt:
        currentWorkspace?.consentDecidedAt ?? actionDate.toISOString(),
      activeTaxYear: profile.taxYear,
      active: { profile, completions, ruleDatasetId: currentRules.id },
      priorYears: currentWorkspace?.priorYears ?? [],
    }
    const result = saveSavedWorkspace(
      storage,
      expectedRevision,
      draft,
      actionDate,
    )
    if (result.kind === 'saved') {
      app.workspaceSaved(result.workspace, commitSession)
      setInteraction({ kind: 'none' })
      setNotice(null)
      return true
    }
    if (result.kind === 'conflict') conflict()
    else
      error(
        result.kind === 'invalid'
          ? 'This change could not be saved. Review the answers and saved-data warning before trying again.'
          : 'This change was not confirmed as saved. Your current work remains in this tab.',
      )
    return false
  }
  const saveCurrent = () => {
    if (
      model.kind !== 'supported' ||
      (!model.canSave && !model.canSaveChanges) ||
      source.kind !== 'transient'
    )
      return
    const actionDate = new Date()
    setNow(actionDate)
    const parsed = parseProfile(model.profile)
    if (
      !parsed.valid ||
      evaluate(parsed.profile, actionDate, currentRules).kind !== 'supported'
    ) {
      error(
        'This plan could not be saved with the current answers and rules. Your answers are still here.',
      )
      return
    }
    persist(
      parsed.profile,
      currentWorkspace?.active?.completions ?? [],
      source.session.origin.kind === 'saved-edit'
        ? source.session.origin.baseWorkspaceRevision
        : null,
      actionDate,
      true,
    )
  }
  const editorRevision = () =>
    interaction.kind === 'payment-editing' ||
    interaction.kind === 'completion-editing'
      ? interaction.revision
      : revision
  const sameEditorSource = () => {
    if (
      (interaction.kind === 'payment-editing' ||
        interaction.kind === 'completion-editing') &&
      interaction.source !== source.kind
    ) {
      error(
        'The plan changed while this editor was open. Close it and open the action again.',
      )
      return false
    }
    return true
  }
  const updatePayment = (raw: string) => {
    if (model.kind !== 'supported' || !sameEditorSource()) return
    const actionDate = new Date()
    setNow(actionDate)
    const prepared = preparePayment(
      model.profile,
      raw,
      actionDate,
      currentRules,
    )
    if (prepared.kind !== 'valid') {
      error(
        'This payment update could not be accepted with the current answers and rules. Your current work remains unchanged.',
      )
      return
    }
    if (source.kind === 'workspace')
      persist(
        prepared.profile,
        model.completions,
        editorRevision(),
        actionDate,
        false,
      )
    else if (source.kind === 'transient') {
      app.dispatch({
        type: 'payment-replaced',
        profile: prepared.profile,
        latestThresholdDate: latestQuestionnaireDate(actionDate),
      })
      setInteraction({ kind: 'none' })
      setNotice(null)
    }
  }
  const changeCompletion = (
    obligationId: string,
    date: DateOnly | null,
    expectedRevision = editorRevision(),
  ) => {
    if (
      source.kind !== 'workspace' ||
      !source.workspace.active ||
      !sameEditorSource()
    )
      return
    const actionDate = new Date()
    setNow(actionDate)
    if (date !== null) {
      const evaluation = evaluate(
        source.workspace.active.profile,
        actionDate,
        currentRules,
      )
      if (evaluation.kind !== 'supported') {
        error(
          'This action cannot be marked complete with the current rules. Your saved data is unchanged.',
        )
        return
      }
      const current = evaluation.obligations.find(
        ({ id }) => id === obligationId,
      )
      if (!current || !canCompleteObligation(current, date)) {
        error('This action cannot be marked complete from the current plan.')
        return
      }
    }
    persist(
      source.workspace.active.profile,
      updateCompletionRecords(
        source.workspace.active.completions,
        obligationId,
        date,
      ),
      expectedRevision,
      actionDate,
      false,
    )
  }
  const deleteSaved = () => {
    if (interaction.kind !== 'delete-confirmation') return
    if (app.deleteAll(interaction.revision)) setInteraction({ kind: 'none' })
  }
  const reload = () => {
    setNow(new Date())
    app.refreshSavedWorkspace()
    cancel()
    void navigate('/plan', { replace: true })
  }
  return {
    model,
    source,
    interaction,
    notice,
    revision,
    staleEdit,
    openSave: () => open({ kind: 'save-confirmation' }),
    openDelete: () => open({ kind: 'delete-confirmation', revision }),
    openPayment: (obligation: Obligation) =>
      open({
        kind: 'payment-editing',
        obligation,
        revision,
        source: source.kind,
      }),
    openCompletion: (obligation: Obligation) =>
      open({
        kind: 'completion-editing',
        obligation,
        revision,
        source: source.kind,
      }),
    saveCurrent,
    updatePayment,
    deleteSaved,
    cancel,
    reload,
    saveCompletion: (
      obligation: Obligation,
      date: DateOnly,
      expectedRevision?: number | null,
    ) => changeCompletion(obligation.id, date, expectedRevision),
    removeCompletion: (obligation: Obligation) =>
      changeCompletion(obligation.id, null),
    removeCompletionRecord: (record: CompletionRecord) =>
      changeCompletion(record.obligationId, null),
  }
}
