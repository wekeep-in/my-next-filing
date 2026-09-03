import type { Profile } from './evaluation'

type CurrentCheck = {
  readonly profile: Profile
  readonly example: boolean
  readonly complete: boolean
  readonly saved: boolean
  readonly saveDismissed: boolean
}

let currentCheck: CurrentCheck | null = null

export function getCurrentCheck() {
  return currentCheck
}

export function setCurrentCheck(
  profile: Profile,
  example: boolean,
  complete: boolean,
  saved = false,
  saveDismissed = false,
) {
  currentCheck = { profile, example, complete, saved, saveDismissed }
}

export function markSaveDismissed() {
  if (currentCheck) currentCheck = { ...currentCheck, saveDismissed: true }
}

export function clearCurrentCheck() {
  currentCheck = null
}
