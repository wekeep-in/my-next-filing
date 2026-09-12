// Bake the existing SVG layers at full resolution; their paper motion stays in React.
// Run with the Remotion Studio server available on port 3001.
import { chromium } from '@playwright/test'
import fs from 'node:fs'
const b = await chromium.launch()
try {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
  await p.goto('http://localhost:3001/Comparison')
  await p.waitForFunction(() => typeof window.remotion_setFrame === 'function')
  await p.evaluate(() => window.remotion_setFrame(100, 'Comparison', 1))
  await p.waitForTimeout(500)
  const svg = await p
    .locator('svg[data-paper-grain]')
    .first()
    .evaluate((e) => e.outerHTML)
  const out = 'video/public/paper'
  fs.mkdirSync(out, { recursive: true })
  const capture = await b.newPage({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
  })
  for (const height of [720, 3961]) {
    await capture.setViewportSize({ width: 1280, height })
    await capture.setContent(
      `<style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg}`,
    )
    await capture.locator('svg').evaluate((el, height) => {
      el.setAttribute('height', height)
      el.querySelector('filter[filterUnits]').setAttribute('height', height)
      el.style.mixBlendMode = 'normal'
      el.style.display = 'block'
    }, height)
    await capture.screenshot({
      path: `${out}/texture-${height}.png`,
      omitBackground: true,
    })
    await capture.locator('svg').evaluate((el) => {
      const defs = el.querySelector('defs')
      const filter = defs.querySelector('filter[filterUnits]')
      filter.querySelector('feComposite').remove()
      el.querySelectorAll(':scope > rect').forEach((e) => e.remove())
      const rect = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect',
      )
      for (const [k, v] of Object.entries({
        width: '100%',
        height: '100%',
        fill: 'white',
        filter: `url(#${filter.id})`,
      }))
        rect.setAttribute(k, v)
      el.append(rect)
    })
    await capture.screenshot({
      path: `${out}/ink-${height}.png`,
      omitBackground: true,
    })
    console.log(`Baked paper layers at 2560 × ${height * 2}`)
  }
} finally {
  await b.close()
}
