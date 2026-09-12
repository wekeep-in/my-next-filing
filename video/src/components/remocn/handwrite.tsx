'use client'

import { useCurrentFrame } from 'remotion'
import { PenSound, SoundCue } from '../../SoundEffects'
import { BrushGrain, brushFilterId } from './brush'
import {
  DEFAULT_STEP,
  hashRange,
  qf,
  qstep,
} from '../../lib/remocn/stop-motion'

// The composition loads the bundled font before rendering, including offline previews.
const HAND_FAMILY = 'Caveat'

export interface HandwriteProps {
  text: string
  fontSize?: number
  color?: string
  delay?: number
  perStep?: number
  weight?: 400 | 500 | 600 | 700
  align?: 'left' | 'center'
  fontFamily?: string
  step?: number
  sound?: 'pen' | 'typing'
  wrap?: 'words' | 'none'
}

export function Handwrite({
  text,
  fontSize = 54,
  color = '#26242c',
  delay = 0,
  perStep = 1.6,
  weight = 600,
  align = 'center',
  fontFamily = HAND_FAMILY,
  step = DEFAULT_STEP,
  sound = 'pen',
  wrap = 'words',
}: HandwriteProps) {
  const frame = useCurrentFrame()
  const steps = Math.max(0, qstep(Math.max(0, qf(frame, step) - delay), step))
  const shown = Math.floor(steps * perStep)
  const chars = Array.from(text)
  let nextCharacter = 0
  const words = text
    .split(/(\s+)/u)
    .filter(Boolean)
    .map((value) => {
      const start = nextCharacter
      nextCharacter += Array.from(value).length
      return { value, start }
    })
  const freshFrom = shown - Math.ceil(perStep)
  const seed = `handwrite:${text}`
  const strokeWidth = fontSize * 0.05
  const grain = 0.9
  const soundStart = Math.ceil((delay + step) / step) * step
  const soundEnd =
    Math.ceil((delay + Math.ceil(chars.length / perStep) * step) / step) * step

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        background: 'transparent',
      }}
    >
      {sound === 'typing' ? (
        <SoundCue
          kind="typing"
          from={soundStart}
          length={soundEnd - soundStart}
          label={`Typing ${text}`}
        />
      ) : (
        <PenSound
          from={soundStart}
          length={soundEnd - soundStart}
          seed={`Writing ${text}`}
        />
      )}
      <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
        <BrushGrain seed={seed} strokeWidth={strokeWidth} grain={grain} />
      </svg>
      <span
        data-handwritten={text}
        style={{
          display: 'inline-block',
          fontFamily: `${fontFamily}, cursive`,
          fontWeight: weight,
          fontSize,
          lineHeight: 1.15,
          color,
          whiteSpace: wrap === 'none' ? 'nowrap' : 'pre-wrap',
          textAlign: align,
          filter: `url(#${brushFilterId(seed, strokeWidth, grain)})`,
        }}
      >
        {words.map(({ value, start }) =>
          /\s/u.test(value) ? (
            <span key={start} style={{ whiteSpace: 'pre-wrap' }}>
              {value}
            </span>
          ) : (
            <span
              key={start}
              data-handwritten-word={value}
              style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
            >
              {Array.from(value).map((char, offset) => {
                const i = start + offset
                const visible = i < shown
                const slant = hashRange(`hw:${text}:${i}:r`, -3.2, 3.2)
                const dy = hashRange(`hw:${text}:${i}:y`, -1.8, 1.8)
                const fresh = visible && i >= freshFrom
                return (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      whiteSpace: 'pre',
                      opacity: visible ? 1 : 0,
                      translate: visible ? `0 ${dy}px` : undefined,
                      rotate: visible ? `${slant}deg` : undefined,
                      scale: visible ? `${fresh ? 1.06 : 1}` : undefined,
                    }}
                  >
                    {char}
                  </span>
                )
              })}
            </span>
          ),
        )}
      </span>
    </div>
  )
}

export function handwriteDuration(
  text: string,
  options?: { perStep?: number; step?: number },
): number {
  const perStep = options?.perStep ?? 1.6
  const step = options?.step ?? DEFAULT_STEP
  return Math.ceil(Array.from(text).length / perStep) * step + step
}
