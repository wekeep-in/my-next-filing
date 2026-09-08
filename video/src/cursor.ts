export interface CursorPoint {
  x: number
  y: number
  /** Arrival on the output timeline; fractional frames preserve distinct events. */
  at: number
  click?: boolean
  hidden?: boolean
  hiddenAt?: number
}

export function cursorAt(points: CursorPoint[], frame: number) {
  return {
    position: points.findLast((point) => point.at <= frame) ?? points[0],
    click: points.findLast((point) => point.click && point.at <= frame),
  }
}

export const cursorOpacity = (position: CursorPoint, frame: number) =>
  position.hidden
    ? Math.max(0, 1 - (frame - (position.hiddenAt ?? position.at)) / 6)
    : 1
