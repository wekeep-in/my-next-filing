import { Fragment } from 'react'
import type { ComponentType } from 'react'
import { AbsoluteFill, Freeze, Sequence } from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { NativeScreen } from './NativeScreens'
import { PaperBeat, SearchStory } from './Submission'
import { Paper, PaperTextureCacheContext } from './components/paper'
import { Handwrite } from './components/remocn/handwrite'
import { ArrowAnnotate } from './components/remocn/arrow-annotate'
import { CheckList } from './components/remocn/check-list'
import { pageTurn } from './components/remocn/page-turn'
import { AudioEnabledContext, SoundCue, PenSound } from './SoundEffects'
import recordings from './recordings.json'
import { scenes } from './timeline'
import './fonts'

export const COMPARISON_FPS = 30
const f = (seconds: number) => Math.round(seconds * COMPARISON_FPS)
const turnFrames = 24
const green = '#006f26'
const ink = '#080e1a'
const questions = [
  'What do I do next?',
  'How much do I owe?',
  'How do I pay it?',
  'When do I pay it?',
]
function Statement({
  text,
  color = ink,
  background,
}: {
  text: string
  color?: string
  background?: string
}) {
  return (
    <Paper background={background}>
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: text.includes('\n') ? 240 : 295,
          width: 1120,
          height: text.includes('\n') ? 240 : 130,
        }}
      >
        <Handwrite text={text} fontSize={82} color={color} perStep={2.4} />
      </div>
    </Paper>
  )
}
function Questions({ resolved = false }: { resolved?: boolean }) {
  return (
    <Paper>
      <div
        data-question-checklist={resolved ? 'resolved' : 'open'}
        style={{ position: 'absolute', left: 360, top: 190 }}
      >
        <CheckList
          items={questions.map((text) => ({ text, checked: resolved }))}
          width={680}
          fontSize={52}
          rowGap={32}
          color={ink}
          tickColor={green}
          seed="pitch-questions"
          delay={24}
          itemGap={22}
          closeGap={42}
          perStep={2.4}
          strikeOnly={resolved}
          tickOnStrike={resolved}
        />
      </div>
    </Paper>
  )
}
export const searchCycles = [
  { query: 'Indian freelancer tax filing', scrollFrames: 156 },
  { query: 'advance tax for freelancers', scrollFrames: 96 },
  { query: 'official tax payment guide', scrollFrames: 60 },
].map((cycle) => {
  const typedAt = 24 + Math.ceil(cycle.query.length / 2.2) * 3
  return {
    ...cycle,
    typedAt,
    scrollStart: typedAt + 30,
    frames: typedAt + 30 + cycle.scrollFrames,
  }
})
function SearchLoop() {
  return (
    <>
      {searchCycles.map((cycle, index) => (
        <Sequence
          key={cycle.query}
          from={searchCycles
            .slice(0, index)
            .reduce((sum, item) => sum + item.frames, 0)}
          durationInFrames={cycle.frames}
          layout="none"
        >
          <SearchStory
            looping
            query={cycle.query}
            scrollStart={cycle.scrollStart}
            scrollEnd={cycle.frames}
          />
        </Sequence>
      ))}
    </>
  )
}
function Changing() {
  const items = [
    'Maybe you expand and hire employees.',
    'Maybe you face losses.',
    'Or your income grows enough to cross a threshold.',
  ]
  return (
    <Paper>
      <div
        style={{
          position: 'absolute',
          left: 165,
          top: 110,
          width: 1080,
          height: 120,
        }}
      >
        <Handwrite
          text="It keeps changing"
          align="left"
          fontSize={82}
          color={green}
          perStep={2.4}
        />
      </div>
      {items.map((text, index) => (
        <div
          key={text}
          style={{
            position: 'absolute',
            left: 165,
            top: 290 + index * 100,
            width: 950,
            height: 80,
          }}
        >
          <div style={{ position: 'absolute', left: -83, top: 15 }}>
            <ArrowAnnotate
              width={70}
              height={50}
              from={{ x: 0.08, y: 0.2 }}
              to={{ x: 0.9, y: 0.5 }}
              stroke={green}
              bow={0.22}
              delayInFrames={30 + index * 34}
              durationInFrames={18}
            />
            <PenSound
              from={30 + index * 34}
              length={18}
              seed={`Changing arrow ${index}`}
            />
          </div>
          <Handwrite
            text={text}
            fontSize={43}
            color={ink}
            align="left"
            delay={30 + index * 34}
            perStep={2.4}
          />
        </div>
      ))}
    </Paper>
  )
}
type Group = keyof typeof recordings.groups
type Chapter = {
  title: string
  frames: number
  view: ComponentType
  group?: Group
  sourceStart?: number
  sourceEnd?: number
  background?: string
}
function paper(title: string, seconds: number, view: ComponentType): Chapter {
  return { title, frames: f(seconds), view }
}
function native(
  title: string,
  group: Group,
  start: string,
  end?: string,
): Chapter {
  const recording = recordings.groups[group]
  const boundary = (id: string) => {
    const scene = scenes.find((item) => item.id === id)
    if (!scene) throw new Error(`Missing main-video scene: ${id}`)
    return scene.start - recording.start
  }
  const sourceStart = boundary(start)
  const sourceEnd = end ? boundary(end) : recording.end - recording.start
  return {
    title,
    group,
    sourceStart,
    sourceEnd,
    frames: sourceEnd - sourceStart,
    view: () => (
      <Sequence from={-sourceStart} layout="none">
        <NativeScreen id={group} />
      </Sequence>
    ),
  }
}
const chapters: Chapter[] = [
  paper('When is my next tax filing?', 15, () => (
    <Statement text="When is my next tax filing?" color={green} />
  )),
  paper('The questions', 9, Questions),
  paper(
    'A never-ending search for guidance',
    searchCycles.reduce((sum, cycle) => sum + cycle.frames, 0) / COMPARISON_FPS,
    SearchLoop,
  ),
  paper('It keeps changing', 12, Changing),
  paper('This doesn’t have to be so hard.', 5, () => (
    <Statement text="This doesn’t have to be so hard." />
  )),
  {
    ...paper('My Next Filing', 4, () => (
      <Statement text="My Next Filing" color="#ffffff" background={green} />
    )),
    background: green,
  },
  native('Answer questions about my work', 'home', 'practice', 'receipts'),
  native('Income and taxes already paid', 'home', 'receipts', 'review'),
  native('Review and calculate', 'home', 'review', 'plan'),
  native('My next action', 'home', 'plan', 'agenda'),
  native('Upcoming compliances', 'home', 'agenda', 'calculation'),
  native('Check the calculation', 'home', 'calculation', 'guidance'),
  native('Open the official portal', 'home', 'guidance', 'return-plan'),
  native('Save data and record completion', 'home', 'return-plan'),
  paper('File and pay through the official portals', 5, () => (
    <Statement text={'File and pay through the\nofficial portals.'} />
  )),
  paper('Prepare here.', 4, () => (
    <Statement text="Prepare here." color={green} />
  )),
  paper('In 24 hours', 6, () => <PaperBeat id="prototype" />),
  paper('A more user-friendly app', 9, () => <PaperBeat id="features" />),
  native('More work types', 'clients', 'clients'),
  paper('Come back. See what’s next.', 6, () => (
    <PaperBeat id="return-story" />
  )),
  native('Reopen my saved plan', 'return-home', 'return-home', 'payment-empty'),
  native(
    'Update and recalculate',
    'return-home',
    'payment-empty',
    'zero-balance',
  ),
  native(
    'No estimated amount left',
    'return-home',
    'zero-balance',
    'completed',
  ),
  native('Mark completed', 'return-home', 'completed', 'completed-agenda'),
  native('The plan reflects my progress', 'return-home', 'completed-agenda'),
  paper('Your answers. Your browser.', 7, () => <PaperBeat id="privacy" />),
  native('Questions and help text', 'help', 'help', 'unsupported'),
  native('Unsupported answers', 'help', 'unsupported'),
  paper('The questions, answered', 8, () => <Questions resolved />),
  paper('What should I file next?', 6, () => <PaperBeat id="closing" />),
  paper('mynextfiling.wekeep.in', 6, () => <PaperBeat id="domain" />),
]
const turns = chapters.map((chapter, index) => {
  const next = chapters[index + 1]
  return Boolean(
    next &&
    !(
      chapter.group &&
      chapter.group === next.group &&
      chapter.sourceEnd === next.sourceStart
    ),
  )
})
export const comparisonSceneGuide = chapters.map((chapter, index) => ({
  title: chapter.title,
  frames: chapter.frames,
  turn: turns[index],
  start: chapters
    .slice(0, index)
    .reduce(
      (sum, item, i) => sum + item.frames + (turns[i] ? turnFrames : 0),
      0,
    ),
}))
export const COMPARISON_DURATION = chapters.reduce(
  (sum, chapter, index) =>
    sum + chapter.frames + (turns[index] ? turnFrames : 0),
  0,
)
export const COMPARISON_SECONDS = COMPARISON_DURATION / COMPARISON_FPS
function StageSoundEffects() {
  const paperOffsets = [
    0.2, 0.85, 1.3, 3.8, 4.3, 7.7, 2.4, 8.35, 9.3, 9.8, 10.85, 11.6,
  ]
  const searchStart = comparisonSceneGuide[2].start
  return (
    <>
      {comparisonSceneGuide.map(
        (scene, index) =>
          scene.turn && (
            <SoundCue
              key={`turn-${index}`}
              kind="paper"
              from={scene.start + scene.frames}
              length={turnFrames}
              offset={f(paperOffsets[index % paperOffsets.length])}
              fadeIn={14}
              fadeOut={5}
              label={`Page turn after ${scene.title}`}
            />
          ),
      )}
      {searchCycles.map((cycle, index) => {
        const start =
          searchStart +
          searchCycles
            .slice(0, index)
            .reduce((sum, item) => sum + item.frames, 0)
        return (
          <Fragment key={cycle.query}>
            <SoundCue
              kind="scroll"
              from={start + cycle.scrollStart}
              length={cycle.scrollFrames}
              fadeIn={8}
              fadeOut={8}
              label={`Search scroll ${index + 1}`}
            />
            <SoundCue
              kind="paper"
              from={start + cycle.frames - 12}
              length={12}
              offset={f(10.3)}
              fadeIn={3}
              fadeOut={3}
              label={`Search sheet ${index + 1}`}
            />
          </Fragment>
        )
      })}
      {chapters.flatMap((chapter, index) => {
        if (
          !chapter.group ||
          chapter.sourceStart === undefined ||
          chapter.sourceEnd === undefined
        )
          return []
        const start = chapter.sourceStart
        const end = chapter.sourceEnd
        return recordings.groups[chapter.group].cursor
          .filter((point) => point.click && point.at >= start && point.at < end)
          .map((point) => (
            <SoundCue
              key={`click-${index}-${point.at}`}
              kind="click"
              from={
                comparisonSceneGuide[index].start + Math.ceil(point.at - start)
              }
              length={6}
              fadeIn={0}
              fadeOut={1}
              label={`Click ${chapter.title} ${point.at}`}
            />
          ))
      })}
    </>
  )
}
export function Comparison() {
  return (
    <PaperTextureCacheContext.Provider value={true}>
      <AudioEnabledContext.Provider value={true}>
        <AbsoluteFill style={{ background: '#fff' }}>
          <StageSoundEffects />
          <TransitionSeries>
            {chapters.map((chapter, index) => (
              <Fragment key={chapter.title}>
                <TransitionSeries.Sequence
                  durationInFrames={
                    chapter.frames + (turns[index] ? turnFrames : 0)
                  }
                  name={`${String(index + 1).padStart(2, '0')} · ${chapter.title}`}
                >
                  <Freeze
                    frame={chapter.frames - 1}
                    active={(frame) => frame >= chapter.frames}
                  >
                    <chapter.view />
                  </Freeze>
                </TransitionSeries.Sequence>
                {turns[index] && (
                  <TransitionSeries.Transition
                    presentation={pageTurn({ poses: 8, angle: -5 })}
                    timing={linearTiming({ durationInFrames: turnFrames })}
                  />
                )}
                {turns[index] && (
                  <TransitionSeries.Sequence
                    durationInFrames={turnFrames}
                    name="Turn onto paper"
                  >
                    <Paper background={chapters[index + 1]?.background}>
                      {null}
                    </Paper>
                  </TransitionSeries.Sequence>
                )}
              </Fragment>
            ))}
          </TransitionSeries>
        </AbsoluteFill>
      </AudioEnabledContext.Provider>
    </PaperTextureCacheContext.Provider>
  )
}
