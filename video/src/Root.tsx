import { Comparison, COMPARISON_FPS, COMPARISON_DURATION } from './Comparison'
import { Composition, Sequence } from 'remotion'
import { Submission } from './Submission'
import { DURATION, FPS } from './timeline'

function HighResolutionSubmission({
  audioOnly = false,
}: {
  audioOnly?: boolean
}) {
  return (
    <Sequence
      width={1280}
      height={720}
      style={{
        display: audioOnly ? 'none' : undefined,
        width: 1280,
        height: 720,
        transform: 'scale(2)',
        transformOrigin: '0 0',
      }}
    >
      <Submission audioOnly={audioOnly} />
    </Sequence>
  )
}

function HighResolutionComparison() {
  return (
    <Sequence
      width={1280}
      height={720}
      style={{
        width: 1280,
        height: 720,
        transform: 'scale(2)',
        transformOrigin: '0 0',
      }}
    >
      <Comparison />
    </Sequence>
  )
}

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="Comparison"
        component={HighResolutionComparison}
        width={2560}
        height={1440}
        fps={COMPARISON_FPS}
        durationInFrames={COMPARISON_DURATION}
      />
      <Composition
        id="Submission"
        component={HighResolutionSubmission}
        width={2560}
        height={1440}
        fps={FPS}
        durationInFrames={DURATION}
      />
      <Composition
        id="Soundtrack"
        component={HighResolutionSubmission}
        defaultProps={{ audioOnly: true }}
        width={2560}
        height={1440}
        fps={FPS}
        durationInFrames={DURATION}
      />
    </>
  )
}
