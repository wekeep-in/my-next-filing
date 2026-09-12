import { createContext, useContext } from 'react'
import { Html5Audio, Sequence, staticFile } from 'remotion'
import { hashRange } from './lib/remocn/stop-motion'
import { DURATION, frameAt, scenes } from './timeline'
import recordings from './recordings.json'

const files = {
  paper: 'crumble-paper',
  pen: 'scribble',
  typing: 'keyboard-typinng',
  scroll: 'unfurling',
  click: 'mouse-click',
  music: 'crate-in-the-sea-gentle',
}
const levels = {
  paper: 0.55 * 10 ** (-4 / 20),
  pen: 0.18 * 10 ** (-6 / 20),
  typing: 0.15,
  scroll: 0.4 * 10 ** (-2 / 20),
  click: 0.16,
  music: 0.09,
}

export const AudioEnabledContext = createContext(true)

export const ScribbleGainContext = createContext(1)

export function SoundCue({
  kind,
  from = 0,
  length,
  offset = 0,
  fadeIn = 1,
  fadeOut = 2,
  label,
}: {
  kind: keyof typeof files
  from?: number
  length: number
  offset?: number
  fadeIn?: number
  fadeOut?: number
  label: string
}) {
  const enabled = useContext(AudioEnabledContext)
  const scribbleGain = useContext(ScribbleGainContext)
  if (!enabled) return null
  const level = levels[kind] * (kind === 'pen' ? scribbleGain : 1)
  return (
    <Sequence from={from} durationInFrames={length} layout="none" name={label}>
      <Html5Audio
        src={staticFile(`sfx/${files[kind]}.wav`)}
        trimBefore={offset}
        volume={(frame) =>
          level *
          Math.min(
            1,
            fadeIn === 0 ? 1 : frame / fadeIn,
            fadeOut === 0 ? 1 : Math.max(0, (length - 1 - frame) / fadeOut),
          )
        }
      />
      <span
        hidden
        data-sound={kind}
        data-sound-label={label}
        data-sound-fade-in={fadeIn}
        data-sound-fade-out={fadeOut}
        data-sound-file={files[kind]}
        data-sound-level={level}
        data-sound-offset={offset}
        data-sound-length={length}
      />
    </Sequence>
  )
}

// Split long phrases into measured strokes rather than selecting from an empty list.
export function penSoundSegments(length: number, seed: string) {
  const regions = [
    [0.35, 0.9],
    [1.1, 1.5],
    [2, 2.8],
    [3.1, 4.18],
    [4.3, 4.78],
    [3.1, 4.78],
  ].map(([start, end]) => [frameAt(start), frameAt(end)])
  const maximum = Math.max(...regions.map(([start, end]) => end - start))
  const segments: { from: number; length: number; offset: number }[] = []
  const chunkLength =
    length > 0 ? Math.ceil(length / Math.ceil(length / maximum)) : maximum
  for (let from = 0; from < length; from += chunkLength) {
    const duration = Math.min(chunkLength, length - from)
    const fitting = regions.filter(([start, end]) => end - start >= duration)
    const sampleSeed = from === 0 ? seed : `${seed}:${from}`
    const [start, end] =
      fitting[
        Math.floor(hashRange(`scribble-12:${sampleSeed}`, 0, fitting.length))
      ]
    segments.push({
      from,
      length: duration,
      offset: Math.round(
        hashRange(`scribble-cut:${sampleSeed}`, start, end - duration),
      ),
    })
  }
  return segments
}
export function PenSound({
  from,
  length,
  seed,
}: {
  from: number
  length: number
  seed: string
}) {
  const enabled = useContext(AudioEnabledContext)
  if (!enabled) return null
  return (
    <>
      {penSoundSegments(length, seed).map((segment) => (
        <SoundCue
          key={segment.from}
          kind="pen"
          from={from + segment.from}
          length={segment.length}
          offset={segment.offset}
          label={seed}
        />
      ))}
    </>
  )
}

export function SoundEffects() {
  const turns = scenes.filter((scene) => scene.turn)
  const offsets = [
    0.2, 0.85, 1.3, 3.8, 4.3, 7.7, 2.4, 8.35, 9.3, 9.8, 10.85, 11.6,
  ]
  const search = scenes.find((scene) => scene.id === 'search')!
  const question = frameAt(14.5)
  return (
    <>
      <SoundCue
        kind="music"
        length={DURATION}
        fadeIn={0}
        fadeOut={0}
        label="Crate in the Sea background"
      />
      {turns.map((scene, index) => (
        <SoundCue
          key={scene.id}
          kind="paper"
          from={scene.end}
          length={scene.transition}
          offset={frameAt(offsets[index])}
          fadeIn={14}
          fadeOut={5}
          label={`Page turn after ${scene.id}`}
        />
      ))}
      <SoundCue
        kind="scroll"
        from={search.start + 66}
        length={question - search.start - 66}
        fadeIn={15}
        fadeOut={18}
        label="Search sheet unfurls"
      />
      <SoundCue
        kind="paper"
        from={question - 18}
        length={27}
        offset={frameAt(10.3)}
        fadeIn={18}
        fadeOut={9}
        label="Search question reveal"
      />
      {Object.values(recordings.groups).flatMap((group) =>
        group.cursor
          .filter((point) => point.click)
          .map((point, index) => (
            <SoundCue
              key={`${group.id}-${index}`}
              kind="click"
              from={group.start + Math.ceil(point.at)}
              length={6}
              fadeIn={0}
              fadeOut={1}
              label={`Click ${group.id} ${point.at}`}
            />
          )),
      )}
    </>
  )
}
