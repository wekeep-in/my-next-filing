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

export function RemotionRoot() {
  return (
    <>
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
