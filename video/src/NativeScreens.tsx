import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from 'remotion'
import { ScribbleCircle } from './components/remocn/scribble-circle'
import { InkUnderline } from './components/remocn/ink-underline'
import {
  SimulatedCursor,
  type CursorPoint,
} from './components/remocn/simulated-cursor'
import recordings from './recordings.json'
import { frameAt, scenes, timelineTime } from './timeline'
import { ScribbleGainContext } from './SoundEffects'

type Box = { x: number; y: number; width: number; height: number }
type Group = {
  id: string
  start: number
  end: number
  clipIds: string[]
  video: string
  cursor?: CursorPoint[]
}
const groups: Record<string, Group> = recordings.groups
const green = '#006f26'

// One video element per continuous UI chapter preserves the recorded transitions
// and scrolls, rather than remounting a media element at each editorial cue.
export const presentationScenes = scenes
  .filter(
    (scene, index) =>
      'paper' in scene || index === 0 || 'paper' in scenes[index - 1],
  )
  .map((scene) =>
    groups[scene.id]
      ? {
          ...scene,
          length: groups[scene.id].end - groups[scene.id].start,
          transition: 24,
          turn: true,
        }
      : scene,
  )

function Circles({ boxes, name }: { boxes: Box[]; name: string }) {
  return (
    <AbsoluteFill data-callout={name} style={{ pointerEvents: 'none' }}>
      {boxes.map((box, index) => (
        <div
          key={index}
          style={{ position: 'absolute', left: box.x - 13, top: box.y - 11 }}
        >
          <ScribbleCircle
            width={box.width + 26}
            height={box.height + 22}
            strokeWidth={3.2}
            color={green}
            grain={1}
            laps={1.02}
            seed={`${name}-${index}`}
          />
        </div>
      ))}
    </AbsoluteFill>
  )
}

function Underlines({ boxes, name }: { boxes: Box[]; name: string }) {
  return (
    <AbsoluteFill data-callout={name} style={{ pointerEvents: 'none' }}>
      {boxes.map((box, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: box.x,
            top: box.y + box.height - 2,
          }}
        >
          <InkUnderline
            width={box.width}
            color={green}
            thickness={4.5}
            grain={0.8}
            delay={index * 3}
            seed={`${name}-${index}`}
          />
        </div>
      ))}
    </AbsoluteFill>
  )
}

export function NativeScreen({
  id,
  audioOnly = false,
}: {
  id: string
  audioOnly?: boolean
}) {
  const group = groups[id]
  if (!group) throw new Error(`Missing native browser chapter ${id}`)
  const at = (seconds: number) => frameAt(timelineTime(seconds)) - group.start
  return (
    <ScribbleGainContext.Provider value={10 ** (-2 / 20)}>
      <AbsoluteFill
        data-native-ui={id}
        style={{ background: '#f1f5f9', overflow: 'hidden' }}
      >
        <AbsoluteFill
          data-native-crop
          style={{ transform: 'scale(1.03)', transformOrigin: '50% 0' }}
        >
          {!audioOnly && (
            <OffthreadVideo
              src={staticFile(group.video)}
              muted
              pauseWhenBuffering
              style={{ width: 1280, height: 720 }}
            />
          )}
          {!audioOnly && group.cursor && (
            <SimulatedCursor
              points={group.cursor}
              size={28}
              color="#ffffff"
              rippleColor="#15803d"
            />
          )}
          {id === 'home' && (
            <>
              <Sequence
                from={at(35.3)}
                durationInFrames={frameAt(39.1) - frameAt(35.3)}
                layout="none"
              >
                <Circles boxes={recordings.annotations.plan.date} name="date" />
              </Sequence>
              <Sequence
                from={at(36.35)}
                durationInFrames={frameAt(39.1) - frameAt(36.35)}
                layout="none"
              >
                <Circles
                  boxes={recordings.annotations.plan.amount}
                  name="amount"
                />
              </Sequence>
            </>
          )}
          {id === 'return-home' && (
            <>
              <Sequence
                from={at(89.92)}
                durationInFrames={frameAt(92.5) - frameAt(89.92)}
                layout="none"
              >
                <Underlines
                  boxes={recordings.annotations.zero}
                  name="zero-balance"
                />
              </Sequence>
              <Sequence
                from={at(94)}
                durationInFrames={frameAt(96.2) - frameAt(94)}
                layout="none"
              >
                <Underlines
                  boxes={recordings.annotations.completed}
                  name="next-action"
                />
              </Sequence>
            </>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    </ScribbleGainContext.Provider>
  )
}
