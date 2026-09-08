// TypeScript adaptation of HumanCursor's HumanizeMouseTrajectory.
// Check out https://github.com/riflosnake/HumanCursor
import { hash01 } from './src/lib/remocn/stop-motion.ts'

export type Point = { x: number; y: number }

export function humanPath(
  from: Point,
  to: Point,
  seed: string,
  offset = 80,
): Point[] {
  if (from.x === to.x && from.y === to.y) return [{ ...from }, { ...to }]
  const random = (key: string) => hash01(`${seed}:${key}`)
  const controls = [
    from,
    ...Array.from({ length: 2 }, (_, index) => ({
      x: Math.floor(
        Math.min(from.x, to.x) -
          offset +
          random(`x${index}`) * (Math.abs(to.x - from.x) + 2 * offset),
      ),
      y: Math.floor(
        Math.min(from.y, to.y) -
          offset +
          random(`y${index}`) * (Math.abs(to.y - from.y) + 2 * offset),
      ),
    })),
    to,
  ]
  const count = Math.max(
    2,
    Math.floor(Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y))),
  )
  const curve = Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1),
      u = 1 - t
    const weights = [u ** 3, 3 * u ** 2 * t, 3 * u * t ** 2, t ** 3]
    const point = controls.reduce(
      (sum, p, i) => ({
        x: sum.x + p.x * weights[i],
        y: sum.y + p.y * weights[i],
      }),
      { x: 0, y: 0 },
    )
    // Upstream distorts y only, with N(1, 1) noise on half the interior samples.
    if (index > 0 && index < count - 1 && random(`distort${index}`) < 0.5)
      point.y +=
        1 +
        Math.sqrt(
          -2 * Math.log(Math.max(Number.EPSILON, random(`normalA${index}`))),
        ) *
          Math.cos(2 * Math.PI * random(`normalB${index}`))
    return point
  })
  // easeOutQuad re-samples the curve; endpoints remain exact.
  return Array.from({ length: 40 }, (_, index) => {
    if (index === 0) return { ...from }
    if (index === 39) return { ...to }
    const t = index / 39
    return curve[Math.floor(t * (2 - t) * (curve.length - 1))]
  })
}

export function exitTarget(
  from: Point,
  seed: string,
  viewport: { width: number; height: number },
): Point {
  const angle = hash01(seed) * Math.PI * 2
  const target = (angle: number) => ({
    x: Math.max(
      60,
      Math.min(viewport.width - 60, from.x + Math.cos(angle) * 140),
    ),
    y: Math.max(
      90,
      Math.min(viewport.height - 90, from.y + Math.sin(angle) * 140),
    ),
  })
  const first = target(angle)
  return Math.hypot(first.x - from.x, first.y - from.y) >= 80
    ? first
    : target(angle + Math.PI)
}
