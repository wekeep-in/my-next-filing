import { createContext, useContext, useId } from 'react'
import type { ReactNode } from 'react'
import { AbsoluteFill, Img, staticFile } from 'remotion'
import { PaperWobble } from './remocn/paper-wobble'
import { PAPER_COLOR } from './paper-edge'
export const PaperTextureCacheContext = createContext(false)
const paper = PAPER_COLOR
const ink = '#080e1a'

export function Paper({
  children,
  height = 720,
  background = paper,
}: {
  children: ReactNode
  height?: number
  background?: string
}) {
  const textureId = useId().replaceAll(':', '')
  const cacheEnabled = useContext(PaperTextureCacheContext)
  const cached = cacheEnabled && (height === 720 || height === 3961)
  const inkMask = staticFile(`paper/ink-${height}.png`)
  return (
    <AbsoluteFill
      style={{
        height,
        bottom: 'auto',
        background,
        color: ink,
        fontFamily: 'Inter',
        overflow: 'hidden',
      }}
    >
      <PaperWobble
        seed="paper-sheet"
        amp={0.7}
        rotAmp={0.035}
        step={3}
        style={{
          position: 'absolute',
          inset: 0,
          width: 1280,
          height,
          transform: 'scale(1.004)',
          transformOrigin: '640px 360px',
        }}
      >
        <AbsoluteFill
          data-paper-surface
          style={{
            background,
          }}
        >
          {cached && (
            <>
              <Img
                src={staticFile(`paper/texture-${height}.png`)}
                style={{
                  position: 'absolute',
                  width: 1280,
                  height,
                  mixBlendMode: 'multiply',
                  pointerEvents: 'none',
                }}
              />
              <Img
                src={inkMask}
                style={{
                  position: 'absolute',
                  width: 1280,
                  height,
                  opacity: 0,
                  pointerEvents: 'none',
                }}
              />
            </>
          )}
          <svg
            width="1280"
            height={height}
            data-paper-grain
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              mixBlendMode: 'multiply',
              display: cached ? 'none' : undefined,
            }}
          >
            <defs>
              <filter id={`${textureId}-grain`}>
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.24"
                  numOctaves="4"
                  seed="9"
                  stitchTiles="stitch"
                  result="pulp"
                />
                <feDiffuseLighting
                  in="pulp"
                  surfaceScale="1.35"
                  diffuseConstant="1.08"
                  lightingColor="#ffffff"
                >
                  <feDistantLight azimuth="45" elevation="60" />
                </feDiffuseLighting>
              </filter>
              <filter id={`${textureId}-fibers`}>
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.045 0.22"
                  numOctaves="3"
                  seed="21"
                  stitchTiles="stitch"
                />
                <feColorMatrix
                  type="matrix"
                  values="1.3 0 0 0 0.25 1.3 0 0 0 0.25 1.3 0 0 0 0.25 0 0 0 0 1"
                />
              </filter>
              <filter id={`${textureId}-mottle`}>
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.012"
                  numOctaves="3"
                  seed="35"
                  stitchTiles="stitch"
                />
                <feColorMatrix
                  type="matrix"
                  values="2 0 0 0 -0.15 2 0 0 0 -0.15 2 0 0 0 -0.15 0 0 0 0 1"
                />
              </filter>
              <filter
                id={`${textureId}-ink`}
                filterUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="1280"
                height={height}
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.24"
                  numOctaves="4"
                  seed="9"
                  stitchTiles="stitch"
                  result="ink-grain"
                />
                <feColorMatrix
                  in="ink-grain"
                  type="matrix"
                  values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.7 0.53"
                  result="ink-opacity"
                />
                <feComposite
                  in="SourceGraphic"
                  in2="ink-opacity"
                  operator="in"
                />
              </filter>
            </defs>
            <rect
              width="100%"
              height="100%"
              filter={`url(#${textureId}-mottle)`}
              opacity="0.14"
            />
            <rect
              width="100%"
              height="100%"
              filter={`url(#${textureId}-grain)`}
              opacity="0.5"
            />
            <rect
              width="100%"
              height="100%"
              filter={`url(#${textureId}-fibers)`}
              opacity="0.12"
            />
          </svg>
          <AbsoluteFill
            data-paper-ink
            style={{
              filter: cached ? undefined : `url(#${textureId}-ink)`,
              maskImage: cached ? `url(${inkMask})` : undefined,
              maskSize: cached ? '100% 100%' : undefined,
              maskRepeat: cached ? 'no-repeat' : undefined,
              mixBlendMode: background === paper ? 'multiply' : 'normal',
            }}
          >
            {children}
          </AbsoluteFill>
        </AbsoluteFill>
      </PaperWobble>
    </AbsoluteFill>
  )
}
