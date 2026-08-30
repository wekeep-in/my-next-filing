import type { Profile } from './evaluation'

type CurrentCheck = {
  readonly profile: Profile
  readonly example: boolean
  readonly complete: boolean
  readonly highestStep: number
}

let currentCheck: CurrentCheck | null = null

export function getCurrentCheck() {
  return currentCheck
}

export function setCurrentCheck(
  profile: Profile,
  example: boolean,
  complete: boolean,
  highestStep: number,
) {
  currentCheck = { profile, example, complete, highestStep }
}
