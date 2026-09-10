import { useState } from 'react'
import { AbsoluteFill, Html5Video, Img, useCurrentFrame } from 'remotion'
import { Safari } from './safari'
import { Terminal } from './terminal'
import { SimulatedCursor } from '../../../video/src/components/remocn/simulated-cursor'
import recorded from './recordings.json'
import { slides } from './slides'

type Recording = (typeof recorded)[number]

function recordingForSlide(id: string): Recording {
  const recording = recorded.find((entry) => entry.id === id)
  if (!recording) throw new Error(`Missing pitch recording: ${id}`)
  return recording
}
export const framesForSlide = (index: number) => {
  const slide = slides[index]
  return slide.kind === 'demo'
    ? recordingForSlide(slide.recording).frames
    : slide.seconds * 30
}

function Capture({ clip, still }: { clip: Recording; still: boolean }) {
  const [failed, setFailed] = useState(
    () => !document.createElement('video').canPlayType('video/mp4'),
  )
  return (
    <div className="pitch-capture" data-clip={clip.id} aria-label={clip.title}>
      <div className="pitch-capture-canvas">
        {still || failed ? (
          <Img
            src={clip.poster}
            alt={clip.title}
            style={{ width: 1280, height: 720 }}
          />
        ) : (
          <Html5Video
            src={clip.video}
            muted
            pauseWhenBuffering
            onError={() => setFailed(true)}
            style={{ width: 1280, height: 720 }}
          />
        )}
        {!still && !failed && (
          <SimulatedCursor
            points={clip.cursor}
            size={30}
            color="var(--card)"
            rippleColor="var(--primary)"
          />
        )}
      </div>
      {failed && !still && (
        <p className="pitch-media-error">
          Recording unavailable. Showing the final frame.
        </p>
      )}
    </div>
  )
}

const taxWords = [
  ['Advance tax', 270, 195, 48, 0],
  ['GST', 268, 144, 46, 0],
  ['TDS', 277, 243, 40, 0],
  ['GSTR-3B', 269, 283, 32, 0],
  ['Presumptive taxation', 269, 104, 25, 0],
  ['Income tax', 157, 238, 29, 0],
  ['ITR-3', 359, 151, 29, 0],
  ['Input tax credit', 399, 234, 22, 0],
  ['Assessment year', 134, 155, 20, 0],
  ['QRMP', 383, 264, 26, 0],
  ['LUT', 171, 269, 24, 0],
  ['GSTR-1', 266, 76, 24, 0],
  ['Form 26AS', 159, 131, 20, 0],
  ['Tax audit', 265, 313, 19, 0],
  ['Surcharge', 394, 292, 20, 0],
  ['Rebate', 435, 156, 20, 0],
  ['Reverse charge', 68, 228, 16, 90],
  ['Taxable income', 272, 335, 18, 0],
  ['Turnover', 154, 295, 19, 0],
  ['Deductions', 359, 79, 16, 0],
  ['Capital gains', 167, 79, 17, 0],
  ['Tax regime', 460, 197, 17, 0],
  ['Financial year', 361, 313, 15, 0],
  ['Tax year', 435, 134, 16, 0],
  ['Cess', 102, 192, 18, 0],
  ['GSTIN', 415, 94, 17, 90],
  ['PAN', 123, 267, 19, 0],
  ['ITR-4', 177, 317, 17, 0],
  ['Self-assessment tax', 265, 53, 13, 0],
  ['Advance payment', 265, 35, 14, 0],
  ['Filing', 118, 108, 18, 0],
  ['Exports', 456, 259, 16, 0],
  ['Interest', 362, 59, 16, 0],
  ['Dividends', 164, 58, 14, 0],
  ['Registration', 480, 146, 13, 90],
  ['Return', 76, 131, 16, 0],
  ['Exemption', 378, 332, 14, 0],
  ['Tax liability', 267, 356, 14, 0],
  ['Gross receipts', 155, 337, 13, 0],
  ['Due date', 114, 317, 16, 0],
  ['Deductor', 350, 127, 12, 0],
  ['Tax credit', 342, 356, 14, 0],
  ['Late fee', 454, 98, 13, 0],
  ['Profit', 468, 280, 16, 0],
  ['Audit report', 365, 40, 12, 0],
  ['Tax period', 191, 355, 13, 0],
  ['Challan', 441, 177, 13, 0],
  ['Withholding', 163, 41, 12, 0],
  ['Resident', 64, 112, 13, 0],
  ['Income', 442, 314, 15, 0],
  ['Refund', 86, 85, 15, 0],
  ['Payment', 269, 17, 14, 0],
] as const

const portalTiles = [
  ['01.jpg', 'Income Tax Department homepage', 212, 0, 61, 75],
  ['02.jpg', 'GST portal login', 276, 22, 60, 70],
  ['03.jpg', 'Protean PAN services', 340, 37, 97, 55],
  ['04.jpg', 'Income Tax Department homepage', 101, 49, 108, 81],
  ['05.jpg', 'CBIC GST portal', 50, 91, 48, 40],
  ['06.jpg', 'GST help and taxpayer facilities', 212, 78, 61, 52],
  ['07.jpg', 'Income Tax Department homepage', 276, 95, 115, 82],
  ['08.jpg', 'GST taxpayer search', 394, 95, 43, 42],
  ['09.jpg', 'GST registration', 440, 69, 72, 69],
  ['10.jpg', 'GST e-Invoice portal', 515, 126, 48, 42],
  ['11.jpg', 'CBIC GST portal', 485, 140, 28, 28],
  ['12.jpg', 'Protean PAN services', 485, 171, 78, 39],
  ['13.jpg', 'GST portal homepage', 394, 141, 88, 70],
  ['14.jpg', 'Income Tax challan guide', 328, 180, 62, 79],
  ['15.jpg', 'Income Tax return downloads', 277, 180, 48, 47],
  ['16.jpg', 'GST GSTR-3B filing guide', 136, 134, 137, 93],
  ['17.jpg', 'CBIC GST portal', 51, 134, 82, 51],
  ['18.jpg', 'UTIITSL PAN services', 0, 135, 47, 66],
  ['19.jpg', 'GST help and taxpayer facilities', 51, 189, 39, 38],
  ['20.jpg', 'Income Tax challan guide', 93, 189, 40, 38],
  ['21.jpg', 'Income Tax return downloads', 93, 231, 82, 50],
  ['22.jpg', 'Protean PAN services', 179, 231, 49, 50],
  ['23.jpg', 'GST registration', 232, 231, 93, 74],
  ['24.jpg', 'GST e-Invoice portal', 394, 215, 61, 61],
  ['25.jpg', 'UTIITSL PAN services', 459, 215, 49, 47],
] as const

function Content({ index, still = false }: { index: number; still?: boolean }) {
  const slide = slides[index]
  const clip = slide.kind === 'demo' ? recordingForSlide(slide.recording) : null
  return (
    <AbsoluteFill
      className="pitch-slide"
      data-slide={index + 1}
      data-demo={Boolean(clip)}
      data-kind={slide.kind}
    >
      <div className="pitch-slide-body">
        {clip && (
          <Safari>
            <Capture clip={clip} still={still} />
          </Safari>
        )}
        {[
          'opening',
          'statement',
          'clarity',
          'product',
          'freelancer',
          'closing',
        ].includes(slide.kind) && (
          <div className="pitch-statement">
            <h1>{slide.title}</h1>
          </div>
        )}
        {slide.kind === 'words' && (
          <div className="pitch-word-cloud" aria-label="Tax terminology">
            {taxWords.map(([word, left, top, fontSize, rotation]) => (
              <span
                key={word}
                style={{
                  left,
                  top,
                  fontSize,
                  fontWeight: 400 + (fontSize - 12) * 8,
                  letterSpacing: `${(12 - fontSize) / 1800}em`,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                }}
              >
                {word}
              </span>
            ))}
          </div>
        )}
        {slide.kind === 'portals' && (
          <div className="pitch-portals">
            {portalTiles.map(([file, alt, left, top, width, height]) => (
              <Img
                key={file}
                src={`/pitch/portals/${file}`}
                alt={alt}
                style={{ left, top, width, height }}
              />
            ))}
          </div>
        )}
        {slide.kind === 'boundaries' && (
          <ul className="pitch-boundaries" role="list">
            <li>
              <span aria-hidden="true">💻</span>No account registration.
            </li>
            <li>
              <span aria-hidden="true">🔌</span>No portal connection
            </li>
            <li>
              <span aria-hidden="true">📊</span>No web analytics
            </li>
            <li>
              <span aria-hidden="true">🛡️</span>No compromises on privacy.
            </li>
          </ul>
        )}
        {slide.kind === 'codex' && (
          <>
            <div className="pitch-statement">
              <h1>Built with Codex</h1>
            </div>
            <Terminal still={still} />
          </>
        )}
      </div>
    </AbsoluteFill>
  )
}

export function PitchScene({
  index,
  previous,
  reduced,
  preview = false,
}: {
  index: number
  previous: number | null
  reduced: boolean
  preview?: boolean
}) {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: 'var(--background)' }}>
      <Content index={index} still={preview || (reduced && frame === 0)} />
      {!reduced && previous !== null && frame < 6 && (
        <AbsoluteFill className="pitch-slide-fade" aria-hidden="true" inert>
          <Content index={previous} still />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
