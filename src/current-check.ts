import type { Profile } from './evaluation'

type CurrentCheck = {
  readonly profile: Profile
  readonly example: boolean
  readonly complete: boolean
}

let currentCheck: CurrentCheck | null = null

export function getCurrentCheck() {
  return currentCheck
}

export function setCurrentCheck(
  profile: Profile,
  example: boolean,
  complete: boolean,
) {
  currentCheck = { profile, example, complete }
}
