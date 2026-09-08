import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { hashRange } from '../lib/remocn/stop-motion'

export const PAPER_COLOR = '#ffffff'
export const PAPER_EDGE_EXTRA = 14

function edgeShape(width: number, height: number) {
  const points = Array.from(
    { length: Math.ceil((width + 24) / 5) + 1 },
    (_, i) => {
      const x = Math.min(width + 12, i * 5 - 12)
      const y =
        height +
        6 +
        Math.sin(x / 31) * 1.4 +
        Math.sin(x / 93) * 1.1 +
        hashRange(`paper-edge-${i}`, -1.7, 1.7)
      return { x, y }
    },
  )
  const lower = points.map(({ x, y }) => `${x},${y}`).join(' L ')
  const upper = points
    .map(({ x, y }, i) => `${x},${y - hashRange(`fiber-width-${i}`, 0.7, 2.1)}`)
    .reverse()
    .join(' L ')
  return {
    clip: `polygon(-12px -12px, ${width + 12}px -12px, ${[...points]
      .reverse()
      .map(({ x, y }) => `${x}px ${y}px`)
      .join(', ')})`,
    band: `M ${lower} L ${upper} Z`,
    edge: `M ${lower}`,
    fibers: points
      .filter((_, i) => i % 4 === 0)
      .map(
        ({ x, y }, i) =>
          `M ${x} ${y - 1} l ${hashRange(`fiber-x-${i}`, -1.5, 1.5)} ${hashRange(`fiber-y-${i}`, 1.1, 3)}`,
      )
      .join(' '),
  }
}

export function PaperEdge({
  width,
  height,
  children,
}: {
  width: number
  height: number
  children: ReactNode
}) {
  const shape = useMemo(() => edgeShape(width, height), [width, height])
  return (
    <div
      data-torn-paper
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        height: height + PAPER_EDGE_EXTRA,
        filter: 'drop-shadow(0 5px 5px rgb(0 0 0 / 0.16))',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: PAPER_COLOR,
          clipPath: shape.clip,
        }}
      >
        {children}
      </div>
      <svg
        data-paper-edge
        width={width}
        height={height + PAPER_EDGE_EXTRA}
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <path d={shape.band} fill="#ffffff" opacity="0.85" />
        <path
          d={shape.edge}
          fill="none"
          stroke="#b5b5b5"
          strokeWidth="0.45"
          opacity="0.4"
        />
        <path
          d={shape.fibers}
          fill="none"
          stroke="#eeeeee"
          strokeWidth="0.65"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </div>
  )
}
