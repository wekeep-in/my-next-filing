'use client'

import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

import { cursorAt, cursorOpacity } from '../../cursor'
import type { CursorPoint } from '../../cursor'
export type { CursorPoint } from '../../cursor'

export interface SimulatedCursorProps {
  points: CursorPoint[]
  color?: string
  rippleColor?: string
  size?: number
  className?: string
}

export function SimulatedCursor({
  points,
  color = '#ffffff',
  rippleColor = color,
  size = 32,
  className,
}: SimulatedCursorProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { position, click: clickTarget } = cursorAt(points, frame)
  if (!position) return null
  const { x, y } = position
  const activeClickFrame = clickTarget
    ? frame - Math.ceil(clickTarget.at)
    : null

  // Click feedback
  let clickScale = 1
  let rippleRadius = 0
  let rippleOpacity = 0
  if (activeClickFrame !== null && clickTarget) {
    const dip = spring({
      fps,
      frame: activeClickFrame,
      config: { damping: 10, stiffness: 200, mass: 0.6 },
      durationInFrames: 14,
    })
    clickScale = activeClickFrame < 18 ? 0.82 + dip * 0.18 : 1
    rippleRadius = interpolate(activeClickFrame, [0, 24], [4, 60], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
    rippleOpacity = interpolate(activeClickFrame, [0, 24], [0.6, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  }

  return (
    <div
      data-simulated-cursor
      data-cursor-x={x}
      data-cursor-y={y}
      className={className}
      style={{
        position: 'absolute',
        opacity: cursorOpacity(position, frame),
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Click ripple */}
      {rippleOpacity > 0 && (
        <svg
          data-click-ripple
          style={{
            position: 'absolute',
            left: (clickTarget?.x ?? x) - 80,
            top: (clickTarget?.y ?? y) - 80,
            width: 160,
            height: 160,
            pointerEvents: 'none',
          }}
        >
          <circle
            cx={80}
            cy={80}
            r={rippleRadius}
            fill="none"
            stroke={rippleColor}
            strokeWidth={2}
            opacity={rippleOpacity}
          />
        </svg>
      )}

      {/* Cursor */}
      <div
        style={{
          position: 'absolute',
          left: x - (size * 5) / 24,
          top: y - (size * 3) / 24,
          width: size,
          height: size,
          scale: `${clickScale}`,
          transformOrigin: 'top left',
          zIndex: 2147483647,
          pointerEvents: 'none',
          willChange: 'transform, left, top',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 3L5 19L9.5 14.5L12.5 21L15 20L12 13.5L18.5 13.5L5 3Z"
            fill={color}
            stroke="#000000"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
