import { useCurrentFrame } from 'remotion'

// Adapted from Magic UI Terminal (MIT), https://magicui.design/r/terminal.json.
// The window structure and sequential typing/checkmarks use Remotion's frame
// clock instead of viewport observers and timers, preserving player controls.
// Copyright (c) Magic UI. See public/pitch/magicui-LICENSE.txt.
const steps = [
  'Reading the product specification.',
  'Building the questionnaire.',
  'Adding the filing plan.',
  'Keeping financial details in the browser.',
  'Adding browser checks.',
] as const

export function Terminal({ still }: { still: boolean }) {
  const currentFrame = useCurrentFrame()
  const frame = still ? 480 : currentFrame
  const command = '> codex'
  const prompt = '› Build a private tax planner for freelancers.'
  const summary = 'Ready for your review.'
  return (
    <div className="pitch-terminal" aria-label="Illustrative Codex CLI session">
      <div className="pitch-terminal-header">
        <div className="pitch-terminal-dots" aria-hidden="true">
          <div />
          <div />
          <div />
        </div>
        <span>codex · my-next-filing</span>
      </div>
      <pre>
        <code>
          <span className="pitch-terminal-line">
            {command.slice(0, Math.max(0, Math.floor((frame - 12) / 2)))}
          </span>
          <strong
            className="pitch-terminal-line"
            aria-hidden={frame < 40}
            style={{ opacity: frame >= 40 ? 1 : 0 }}
          >
            OpenAI Codex
          </strong>
          <span className="pitch-terminal-line pitch-terminal-prompt">
            {prompt.slice(0, Math.max(0, Math.floor((frame - 54) / 2)))}
          </span>
          {steps.map((step, index) => {
            const progress = Math.max(
              0,
              Math.min(1, (frame - 150 - index * 33) / 6),
            )
            return (
              <span
                key={step}
                className="pitch-terminal-line pitch-terminal-check"
                aria-hidden={progress === 0}
                style={{
                  opacity: progress,
                  transform: `translateY(${(1 - progress) * -5}px)`,
                }}
              >
                <span aria-hidden="true">✔</span> {step}
              </span>
            )
          })}
          <span className="pitch-terminal-line pitch-terminal-summary">
            {summary.slice(0, Math.max(0, Math.floor((frame - 330) / 2)))}
            <span
              aria-hidden="true"
              style={{
                opacity:
                  frame >= 330 && (still || Math.floor(frame / 15) % 2 === 0)
                    ? 1
                    : 0,
              }}
            >
              ▌
            </span>
          </span>
        </code>
      </pre>
    </div>
  )
}
