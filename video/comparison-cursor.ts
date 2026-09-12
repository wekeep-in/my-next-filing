import type { Locator, Mouse } from '@playwright/test'
import type { CursorPoint } from './src/cursor'
import { humanPath } from './human-cursor'

// Store the actual mouse path and click times alongside the unretimed capture.
export function comparisonCursor(mouse: Mouse, started: () => number) {
  const points: CursorPoint[] = []
  let position = { x: 1100, y: 620 }
  const at = () => ((Date.now() - started()) * 30) / 1000
  const move = async (x: number, y: number) => {
    const path = humanPath(position, { x, y }, `comparison-${points.length}`)
    for (const point of path) {
      await mouse.move(point.x, point.y)
      points.push({ ...point, at: at() })
      await new Promise((resolve) => setTimeout(resolve, 12))
    }
    position = { x, y }
  }
  return {
    points,
    move,
    async click(
      locator: Pick<
        Locator,
        'scrollIntoViewIfNeeded' | 'boundingBox' | 'click'
      >,
    ) {
      await locator.scrollIntoViewIfNeeded()
      const box = await locator.boundingBox()
      if (!box) throw new Error('Cursor target is not visible')
      await move(box.x + box.width / 2, box.y + box.height / 2)
      points.push({ ...position, at: at(), click: true })
      await locator.click()
    },
  }
}
