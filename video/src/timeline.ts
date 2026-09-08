export const FPS = 30
export const SOURCE_AUDIO_DURATION = 123.637542
export const SOURCE_DURATION = Math.ceil(SOURCE_AUDIO_DURATION * FPS)
export const frameAt = (seconds: number) => Math.round(seconds * FPS)
export const narrationPauses = [
  { at: 25.5, seconds: 2 },
  { at: 28.5, seconds: 2 },
  { at: 62.4, seconds: 2 },
]
export const timelineTime = (seconds: number) =>
  seconds +
  narrationPauses.reduce(
    (sum, pause) => sum + (seconds >= pause.at ? pause.seconds : 0),
    0,
  )
export const AUDIO_DURATION = timelineTime(SOURCE_AUDIO_DURATION)
export const DURATION = Math.ceil(AUDIO_DURATION * FPS)
// Measured audible span: 1.168–131.394 seconds of Crate in the Sea.
export const MUSIC_DURATION_LIMIT = 130.22
export const narrationSegments = [
  0,
  ...narrationPauses.map((pause) => pause.at),
].map((start, index) => {
  const end = narrationPauses[index]?.at ?? SOURCE_AUDIO_DURATION
  return {
    start: frameAt(start),
    end: index === narrationPauses.length ? SOURCE_DURATION : frameAt(end),
    from: frameAt(timelineTime(start)),
    length:
      (index === narrationPauses.length ? SOURCE_DURATION : frameAt(end)) -
      frameAt(start),
    fadeOut: end === 62.4 ? frameAt(0.2) : 0,
  }
})

// Cuts follow the supplied v3 WebVTT cues; audio plays at its original speed.
const originalBeats = [
  { at: 0, id: 'hook', paper: true },
  { at: 7.1, id: 'search', paper: true },
  { at: 17.6, id: 'home' },
  { at: 32.2, id: 'plan' },
  { at: 39.1, id: 'agenda' },
  { at: 43.7, id: 'calculation' },
  { at: 46.1, id: 'guidance' },
  { at: 47.8, id: 'portal-page' },
  { at: 50, id: 'return-plan' },
  { at: 50.4, id: 'save-dialog' },
  { at: 53.3, id: 'completion-preview' },
  { at: 59.1, id: 'outside', paper: true },
  { at: 62.4, id: 'prototype', paper: true },
  { at: 66.95, id: 'features', paper: true },
  { at: 75.7, id: 'clients' },
  { at: 79.8, id: 'return-story', paper: true },
  { at: 83.45, id: 'return-home' },
  { at: 85.1, id: 'reopened' },
  { at: 86.3, id: 'payment-empty' },
  { at: 87, id: 'payment-entered' },
  { at: 89.1, id: 'zero-balance' },
  { at: 93.4, id: 'completed' },
  { at: 96.2, id: 'completed-agenda' },
  { at: 99.7, id: 'privacy', paper: true },
  { at: 105.3, id: 'help' },
  { at: 109.8, id: 'unsupported' },
  { at: 115.9, id: 'closing', paper: true },
  { at: 120.5, id: 'domain', paper: true },
] as const

// The expanded walkthrough is timed directly in the edited composition.
export const beats = [
  ...originalBeats.map((beat) => ({ ...beat, at: timelineTime(beat.at) })),
  { at: 22.4, id: 'practice' },
  { at: 24, id: 'work' },
  { at: 26.2, id: 'receipts' },
  { at: 27.8, id: 'clients-preview' },
  { at: 29.2, id: 'tax-paid' },
  { at: 31, id: 'gst-preview' },
  { at: 32.6, id: 'review' },
].sort((a, b) => a.at - b.at)

export type BeatId = (typeof beats)[number]['id']

export const scenes = beats.map((beat, index) => {
  const start = frameAt(beat.at)
  const next = beats[index + 1]
  const end = next ? frameAt(next.at) : DURATION
  const paper = 'paper' in beat
  const turn = Boolean(next && (paper || 'paper' in next))
  const transition = !next ? 0 : turn ? 24 : 4
  return { ...beat, start, end, length: end - start, transition, turn }
})
