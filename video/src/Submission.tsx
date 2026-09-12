import { Fragment } from 'react'
import {
  AbsoluteFill,
  Freeze,
  Easing,
  Html5Audio,
  Sequence,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { Handwrite, handwriteDuration } from './components/remocn/handwrite'
import { CheckList } from './components/remocn/check-list'
import { InkUnderline } from './components/remocn/ink-underline'
import { BrushGrain, brushFilterId } from './components/remocn/brush'
import { Paper } from './components/paper'
import { pageTurn } from './components/remocn/page-turn'
import {
  PaperEdge,
  PAPER_COLOR,
  PAPER_EDGE_EXTRA,
} from './components/paper-edge'
import { hashRange, paperJitter, qf } from './lib/remocn/stop-motion'
import { frameAt, narrationSegments } from './timeline'
import { NativeScreen, presentationScenes } from './NativeScreens'
import { SoundEffects } from './SoundEffects'
import type { BeatId } from './timeline'
import './fonts'

const ink = '#080e1a'
const green = '#006f26'
const paper = PAPER_COLOR
const muted = '#465365'
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

function Writing({
  text,
  top,
  width = 1100,
  size = 74,
  delay = 0,
  color = ink,
  underline = false,
}: {
  text: string
  top: number
  width?: number
  size?: number
  delay?: number
  color?: string
  underline?: boolean
}) {
  const time = handwriteDuration(text, { perStep: 2.4 })
  return (
    <div style={{ position: 'absolute', top, left: (1280 - width) / 2, width }}>
      <div style={{ position: 'relative', height: size * 1.35 }}>
        <Handwrite
          text={text}
          fontSize={size}
          perStep={2.4}
          delay={delay}
          color={color}
          weight={600}
        />
      </div>
      {underline && (
        <div
          style={{ display: 'flex', justifyContent: 'center', marginTop: -4 }}
        >
          <InkUnderline
            width={Math.min(width - 50, text.length * size * 0.4)}
            color={green}
            delay={delay + time}
            thickness={7}
            seed={text}
          />
        </div>
      )}
    </div>
  )
}

function scribblePath(width: number, seed: string) {
  let path = 'M 2 12'
  let x = 2
  let wordLeft = Math.floor(hashRange(`${seed}-word`, 3, 8))
  const baseline = hashRange(`${seed}-baseline`, 0.5, 2.2)
  for (let i = 0; x < width - 20; i++) {
    const w = hashRange(`${seed}-${i}-width`, 6, 17)
    const h = hashRange(`${seed}-${i}-height`, 3, 9)
    const y =
      12 + Math.sin(x / 51) * baseline + hashRange(`${seed}-${i}-y`, -1, 1)
    const shape = Math.floor(hashRange(`${seed}-${i}-shape`, 0, 6))
    if (wordLeft === 0) {
      x += hashRange(`${seed}-${i}-gap`, 7, 17)
      path += ` M ${x} ${y}`
      wordLeft = Math.floor(hashRange(`${seed}-${i}-word`, 2, 9))
    }
    if (shape === 0)
      path += ` C ${x + w * 0.2} ${y - h} ${x + w * 0.8} ${y - h} ${x + w * 0.62} ${y} Q ${x + w * 0.8} ${y - h * 0.5} ${x + w} ${y}`
    else if (shape === 1)
      path += ` C ${x + w * 0.9} ${y - h * 0.7} ${x + w * 0.55} ${y - h * 1.4} ${x + w * 0.15} ${y - 1} Q ${x + w * 0.25} ${y + 4} ${x + w} ${y}`
    else if (shape === 2)
      path += ` C ${x + w * 0.8} ${y - h * 1.8} ${x + w * 0.2} ${y - h * 1.8} ${x + w * 0.24} ${y - 2} Q ${x + w * 0.2} ${y + 3} ${x + w} ${y}`
    else if (shape === 3)
      path += ` Q ${x + w * 0.2} ${y - h} ${x + w * 0.55} ${y} C ${x + w * 0.9} ${y + h} ${x + w * 0.05} ${y + h} ${x + w * 0.4} ${y + 2} L ${x + w} ${y}`
    else if (shape === 4)
      path += ` L ${x + w * 0.28} ${y - h * 0.7} L ${x + w * 0.52} ${y + 1} Q ${x + w * 0.8} ${y - 3} ${x + w} ${y}`
    else
      path += ` Q ${x + w * 0.36} ${y + 2} ${x + w * 0.55} ${y - h * 0.45} T ${x + w} ${y}`
    x += w
    wordLeft--
  }
  return path
}

const searchResults = Array.from({ length: 24 }, (_, row) =>
  [
    {
      width: hashRange(`url-${row}`, 130, 275),
      y: 0,
      color: muted,
      weight: hashRange(`url-pen-${row}`, 1.2, 1.7),
    },
    {
      width: hashRange(`title-${row}`, 360, 650),
      y: 34,
      color: ink,
      weight: hashRange(`title-pen-${row}`, 2.1, 2.8),
    },
    {
      width: hashRange(`body-${row}`, 590, 735),
      y: 70,
      color: muted,
      weight: hashRange(`body-pen-${row}`, 1.25, 1.9),
    },
    {
      width: hashRange(`last-${row}`, 320, 680),
      y: 98,
      color: muted,
      weight: hashRange(`last-pen-${row}`, 1.25, 1.9),
    },
  ].map((line, index) => ({
    ...line,
    path: scribblePath(line.width, `result-${row}-${index}`),
  })),
)

export function SearchStory({
  looping = false,
  query = 'Indian freelancer tax filing',
  scrollStart = 66,
  scrollEnd = frameAt(14.5 - 7.1),
}: {
  looping?: boolean
  query?: string
  scrollStart?: number
  scrollEnd?: number
}) {
  const frame = useCurrentFrame()
  const questionAt = scrollEnd
  const pageHeight = 505 + searchResults.length * 144
  const lifted = interpolate(
    qf(frame),
    [scrollStart, questionAt],
    [0, 1],
    clamp,
  )
  const jitter = paperJitter(frame, 'search-lift', { amp: 1.6, rotAmp: 0.06 })
  const scrollY = interpolate(
    qf(frame),
    [scrollStart, questionAt],
    [0, -pageHeight - PAPER_EDGE_EXTRA],
    {
      ...clamp,
      easing: Easing.in(Easing.quad),
    },
  )
  return (
    <AbsoluteFill style={{ background: paper, overflow: 'hidden' }}>
      {looping ? (
        <Freeze frame={0}>
          <SearchStory />
        </Freeze>
      ) : (
        <Paper>
          {frame >= questionAt && (
            <div data-search-question>
              <Writing
                text="What do I do next?"
                top={305}
                size={82}
                delay={questionAt}
                color={green}
                underline
              />
            </div>
          )}
        </Paper>
      )}
      {frame < questionAt && (
        <div
          data-search-scroll
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 1280,
            height: pageHeight,
            transform: `translate(${jitter.x * lifted}px, ${scrollY}px) rotate(${(-0.6 + jitter.rot) * lifted}deg)`,
            transformOrigin: '18% 100%',
          }}
        >
          <PaperEdge width={1280} height={pageHeight}>
            <Paper height={pageHeight}>
              <div
                data-search-input
                style={{
                  position: 'absolute',
                  left: 224,
                  top: 323,
                  width: 832,
                  height: 74,
                  boxSizing: 'border-box',
                  borderRadius: 13,
                  background: '#ffffff',
                }}
              >
                <svg
                  width="832"
                  height="74"
                  viewBox="0 0 832 74"
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    overflow: 'visible',
                  }}
                >
                  <path
                    d="M 24 3 C 202 0 605 5 807 3 Q 830 2 829 23 L 830 53 Q 831 73 807 71 C 590 75 243 70 23 73 Q 2 74 3 53 L 2 23 Q 1 2 24 3 Z"
                    fill="none"
                    stroke="#666666"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 25 5 C 280 3 610 7 805 5 M 826 25 L 827 52 M 22 69 C 244 68 596 73 806 69"
                    fill="none"
                    stroke="#666666"
                    strokeWidth="0.55"
                    opacity="0.35"
                  />
                </svg>
                <svg
                  width="35"
                  height="35"
                  viewBox="0 0 35 35"
                  aria-hidden
                  style={{ position: 'absolute', left: 27, top: 19 }}
                >
                  <path
                    d="M 22 14 C 23 7 17 3 11 5 C 3 7 4 18 10 21 C 17 24 23 20 22 14 M 20 21 Q 25 25 30 30"
                    fill="none"
                    stroke={ink}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 10 6 C 6 8 5 15 9 19 M 21 22 L 29 31"
                    fill="none"
                    stroke={ink}
                    strokeWidth="0.65"
                    opacity="0.4"
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    left: 76,
                    top: 0,
                    width: 725,
                    height: 74,
                  }}
                >
                  <Handwrite
                    text={query}
                    sound="typing"
                    fontSize={38}
                    weight={500}
                    perStep={2.2}
                    delay={24}
                    align="left"
                    color={ink}
                  />
                </div>
              </div>
              <div
                aria-label="Illustrated search results"
                style={{
                  position: 'absolute',
                  left: 250,
                  top: 445,
                  width: 780,
                }}
              >
                {searchResults.map((lines, row) => (
                  <svg
                    key={row}
                    width="780"
                    height="144"
                    style={{ display: 'block', overflow: 'visible' }}
                  >
                    {lines.map((line, index) => (
                      <path
                        key={index}
                        d={line.path}
                        transform={`translate(0 ${line.y})`}
                        fill="none"
                        stroke={line.color}
                        strokeWidth={line.weight}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength="1"
                        strokeDasharray="1"
                        strokeDashoffset={interpolate(
                          frame,
                          [
                            64 + Math.min(row, 4) * 6 + index * 5,
                            91 + Math.min(row, 4) * 6 + index * 5,
                          ],
                          [1, 0],
                          clamp,
                        )}
                      />
                    ))}
                  </svg>
                ))}
              </div>
            </Paper>
          </PaperEdge>
        </div>
      )}
    </AbsoluteFill>
  )
}

function Prototype() {
  return (
    <Paper>
      <div
        data-prototype-shot
        style={{
          position: 'absolute',
          top: 172,
          left: 76,
          width: 684,
          boxSizing: 'border-box',
          padding: 12,
          background: '#ffffff',
          transform: 'rotate(-2.5deg)',
        }}
      >
        <Img
          src={staticFile('screens/old-home.png')}
          style={{ width: '100%', display: 'block' }}
        />
        <svg
          data-prototype-border
          viewBox="0 0 684 436.5"
          preserveAspectRatio="none"
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
        >
          <BrushGrain seed="prototype-frame" strokeWidth={2.2} grain={0.9} />
          <path
            d="M 12 6 C 184 3 483 9 672 5 Q 679 4 679 13 C 676 140 682 300 678 423 Q 679 432 669 431 C 487 435 209 429 13 432 Q 5 433 6 423 C 9 277 3 122 6 14 Q 6 5 12 6 Z"
            fill="none"
            stroke={ink}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
            filter={`url(#${brushFilterId('prototype-frame', 2.2, 0.9)})`}
          />
          <path
            d="M 27 8 C 187 6 469 11 651 7 M 675 35 C 675 163 680 295 675 405"
            fill="none"
            stroke={ink}
            strokeWidth={0.7}
            opacity={0.25}
          />
        </svg>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 782,
          top: 303,
          width: 410,
          height: 114,
        }}
      >
        <div style={{ width: '100%', height: '100%' }}>
          <Handwrite
            text="In 24 hours"
            fontSize={84}
            color={green}
            perStep={1.4}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <InkUnderline width={330} color={green} delay={35} thickness={8} />
        </div>
      </div>
    </Paper>
  )
}

export function PaperBeat({ id }: { id: BeatId }) {
  switch (id) {
    case 'hook':
      return (
        <Paper>
          <Writing text="Which tax rules" top={200} size={87} />
          <Writing
            text="apply to me?"
            top={320}
            size={100}
            delay={25}
            color={green}
            underline
          />
        </Paper>
      )
    case 'search':
      return <SearchStory />
    case 'outside':
      return (
        <Paper>
          <Writing text="Prepare here." top={205} size={94} color={green} />
          <Writing
            text="File and pay on official portals."
            top={358}
            size={64}
            delay={34}
          />
        </Paper>
      )
    case 'prototype':
      return <Prototype />
    case 'features':
      return (
        <Paper>
          <div
            data-feature-checklist
            style={{ position: 'absolute', left: 330, top: 151 }}
          >
            <CheckList
              items={[
                'Salary alongside freelancing',
                'Rent from one Indian home',
                'Dividends and bank interest',
                'Indian equity gains and losses',
                'GST checks and filing dates',
              ]}
              width={870}
              fontSize={52}
              rowGap={27}
              color={ink}
              boxColor={ink}
              tickColor={green}
              delay={24}
              itemGap={27}
              closeGap={9}
              perStep={2.4}
            />
          </div>
        </Paper>
      )
    case 'return-story':
      return (
        <Paper>
          <Writing text="Come back." top={200} size={92} />
          <Writing
            text="See what's next."
            top={320}
            size={92}
            delay={20}
            color={green}
            underline
          />
        </Paper>
      )
    case 'privacy':
      return (
        <Paper>
          <Writing text="Your answers." top={200} size={87} />
          <Writing
            text="Your browser."
            top={320}
            size={100}
            delay={25}
            color={green}
            underline
          />
        </Paper>
      )
    case 'closing':
      return (
        <Paper>
          <Writing
            text="What should I file next?"
            top={305}
            size={82}
            delay={18}
            underline
          />
        </Paper>
      )
    case 'domain':
      return (
        <Paper>
          <Writing
            text="mynextfiling.wekeep.in"
            top={307}
            size={78}
            delay={18}
            color={green}
          />
        </Paper>
      )
    default:
      throw new Error(`Unknown paper beat ${id}`)
  }
}

export function Submission({ audioOnly = false }: { audioOnly?: boolean }) {
  return (
    <AbsoluteFill style={{ background: paper }}>
      {narrationSegments.map((segment) => (
        <Sequence
          key={segment.start}
          from={segment.from}
          durationInFrames={segment.length}
          layout="none"
          name={`Narration from ${(segment.start / 30).toFixed(1)}s`}
        >
          <Html5Audio
            src={staticFile('narration.mp3')}
            trimBefore={segment.start}
            trimAfter={segment.end}
            volume={(frame) =>
              0.72 *
              10 ** (-4 / 20) *
              (segment.fadeOut
                ? Math.min(
                    1,
                    Math.max(0, (segment.length - 1 - frame) / segment.fadeOut),
                  )
                : 1)
            }
          />
        </Sequence>
      ))}
      <SoundEffects />
      <TransitionSeries>
        {presentationScenes.map((scene) => (
          <Fragment key={scene.id}>
            <TransitionSeries.Sequence
              durationInFrames={scene.length + scene.transition}
              name={`${scene.at.toFixed(1)}s · ${scene.id}`}
            >
              {'paper' in scene ? (
                <PaperBeat id={scene.id} />
              ) : (
                <NativeScreen id={scene.id} audioOnly={audioOnly} />
              )}
            </TransitionSeries.Sequence>
            {scene.transition > 0 &&
              (scene.turn ? (
                <TransitionSeries.Transition
                  presentation={pageTurn({ poses: 8, angle: -5 })}
                  timing={linearTiming({ durationInFrames: scene.transition })}
                />
              ) : (
                <TransitionSeries.Transition
                  presentation={fade()}
                  timing={linearTiming({ durationInFrames: scene.transition })}
                />
              ))}
          </Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  )
}
