import { useOutletContext } from 'react-router-dom'
import { indiaDate } from '@/lib/india-date'
import type { ProfileGroup } from '@/evaluation'
import type { LoadSavedWorkspaceResult, SavedWorkspace } from '@/workspace'
import type {
  QuestionnaireDispatch,
  QuestionnaireState,
} from '@/routes/check/session'

export function browserStorage(
  area: 'localStorage' | 'sessionStorage',
): Storage | null {
  try {
    return window[area]
  } catch {
    return null
  }
}
export const latestQuestionnaireDate = (now: Date) => {
  const today = indiaDate(now)
  return today < '2027-03-31' ? today : '2027-03-31'
}

export type AppOutletContext = {
  readonly session: QuestionnaireState
  readonly personalSession: QuestionnaireState
  readonly dispatch: QuestionnaireDispatch
  readonly savedWorkspace: LoadSavedWorkspaceResult
  readonly workspaceSelected: boolean
  readonly deleted: boolean
  readonly writesPaused: boolean
  readonly refreshSavedWorkspace: () => void
  readonly startPersonal: () => void
  readonly startExample: () => void
  readonly returnPersonal: () => void
  readonly openWorkspace: () => void
  readonly editGroup: (group: ProfileGroup) => void
  readonly startOver: () => void
  readonly discardSavedEdit: () => void
  readonly workspaceSaved: (
    workspace: SavedWorkspace,
    commitSession: boolean,
  ) => void
  readonly deleteAll: (expectedRevision: number | null) => boolean
}
export const useApp = () => useOutletContext<AppOutletContext>()
