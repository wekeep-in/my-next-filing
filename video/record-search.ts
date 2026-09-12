import { chromium } from 'patchright'
import { comparisonCursor } from './comparison-cursor'
import type { Locator } from 'patchright'
import { mkdir, rename, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { parseArgs } from 'node:util'

const { values } = parseArgs({ options: { executable: { type: 'string' } } })
const directory = 'video/public/comparison'
await mkdir(directory, { recursive: true })
const browser = await chromium.launch({
  headless: false,
  executablePath: values.executable,
})
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  locale: 'en-IN',
  recordVideo: {
    dir: 'video/out/search-capture',
    size: { width: 1280, height: 720 },
  },
})
const page = await context.newPage()
page.setDefaultTimeout(20000)
const video = page.video()!
const cues: {
  id: string
  seconds: number
  host: string
  box?: { x: number; y: number; width: number; height: number }
}[] = []
let started = 0,
  ended = 0
const cursor = comparisonCursor(page.mouse, () => started)
const hold = (ms: number) => page.waitForTimeout(ms)
const cue = async (id: string, locator?: Locator) => {
  cues.push({
    id,
    seconds: (Date.now() - started) / 1000,
    host: new URL(page.url()).hostname,
    box: locator
      ? await locator.evaluate((el) => {
          const range = document.createRange()
          if (el.matches('input, textarea'))
            return el.getBoundingClientRect().toJSON()
          range.selectNodeContents(el)
          return range.getBoundingClientRect().toJSON()
        })
      : undefined,
  })
}
const search = async (query: string, pauseCue?: string) => {
  const field = page.getByRole('combobox', { name: 'Search', exact: true })
  await cursor.click(field)
  await field.fill('')
  if (pauseCue) {
    await cue(pauseCue, field)
    await hold(3200)
  }
  await field.pressSequentially(query, { delay: 95 })
  if ((await field.inputValue()) !== query) await field.fill(query)
  await field.press('Enter')
  await hold(2500)
  if ((await page.locator('body').innerText()).includes('unusual traffic'))
    throw new Error(
      'Google challenged the capture; no result footage published.',
    )
  const dismiss = page.getByRole('button', { name: 'Not now', exact: true })
  if (await dismiss.isVisible()) await cursor.click(dismiss)
  await page.locator('a h3').first().waitFor()
}
const results = () => page.locator('a').filter({ has: page.locator('h3') })
const wrongTurn = async (id: string, title: RegExp) => {
  const result = results().filter({ hasText: title }).first()
  await result.scrollIntoViewIfNeeded()
  await hold(800)
  await cursor.click(result)
  await page.waitForURL(
    (url) => !/^([a-z]+\.)?google\.(com|co\.in)$/.test(url.hostname),
    {
      waitUntil: 'domcontentloaded',
    },
  )
  await hold(1800)
  const heading = page.locator('h1:visible').first()
  if (await heading.count()) await heading.scrollIntoViewIfNeeded()
  await cue(id, (await heading.count()) ? heading : undefined)
  await page.screenshot({ path: `${directory}/${id}.png` })
  await hold(3200)
  await page.mouse.wheel(0, 380)
  await hold(1800)
  await page.goBack({ waitUntil: 'commit' })
  await page.getByRole('combobox', { name: 'Search', exact: true }).waitFor()
  await cue(`${id}-back`)
  await hold(1800)
}
try {
  await page.goto('https://www.google.co.in/', {
    waitUntil: 'domcontentloaded',
  })
  await page.getByRole('combobox', { name: 'Search', exact: true }).waitFor()
  // Dismiss Google's location invitation before the publishable recording.
  started = Date.now()
  await search('pay tax online')
  await hold(1200)
  const locationPrompt = page.getByRole('button', {
    name: 'Not now',
    exact: true,
  })
  if (await locationPrompt.isVisible()) await cursor.click(locationPrompt)
  await page.goto('https://www.google.com/', { waitUntil: 'domcontentloaded' })
  await page.getByRole('combobox', { name: 'Search', exact: true }).waitFor()
  cursor.points.length = 0
  cues.length = 0
  await hold(750)
  started = Date.now()
  await cue('start')
  await search('freelancer tax india', 'empty-search')
  await cue(
    'broad-results',
    page.getByRole('combobox', { name: 'Search', exact: true }),
  )
  await hold(2000)
  await wrongTurn(
    'general-article',
    /Freelancer Income Tax|Taxation for Freelancers|Freelancer.*Gig Worker Tax/,
  )
  await cue('refine')
  await search('freelancer tax filing deadline', 'try-another')
  await cue(
    'refined-results',
    page.getByRole('combobox', { name: 'Search', exact: true }),
  )
  await hold(1500)
  await wrongTurn('filing-detour', /ITR for Freelancers: ITR-3 or ITR-4/i)
  await cue('find-guide')
  await search('how to generate tax challan')
  const result = results()
    .filter({ hasText: /How to Generate Challan Form/i })
    .first()
  await result.scrollIntoViewIfNeeded()
  await hold(800)
  await cue('official-result', result.locator('h3'))
  await page.screenshot({ path: `${directory}/search-result.png` })
  await hold(3000)
  await cursor.click(result)
  await page.waitForURL('**/help/generate-challan-form')
  const heading = page
    .getByRole('heading', {
      name: 'How to Generate Challan Form User Manual',
      exact: true,
    })
    .first()
  await heading.waitFor()
  await page.evaluate(() => document.fonts.ready)
  await hold(1000)
  await cue('guide', heading)
  await page.screenshot({ path: `${directory}/guide.png` })
  await hold(4500)
  ended = Date.now()
  if (ended - started >= 120000)
    throw new Error(
      'Manual recording exceeds the two-minute presentation budget.',
    )
} catch (error) {
  await page.screenshot({ path: 'video/out/search-capture/error.png' })
  console.error(
    page.url(),
    (await page.locator('body').innerText()).slice(0, 1200),
  )
  throw error
} finally {
  await context.close()
  await browser.close()
}
const source = await video.path()
const probe = JSON.parse(
  execFileSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', source],
    { encoding: 'utf8' },
  ),
)
const duration = Number(probe.format.duration)
const durationSeconds = (ended - started) / 1000
const trimSeconds = Math.max(0, duration - durationSeconds)
await rename(source, `${directory}/search.webm`)
await writeFile(
  `${directory}/search.json`,
  JSON.stringify(
    {
      recordedOn: '2026-09-11',
      durationSeconds,
      trimSeconds,
      cues,
      cursor: cursor.points,
      guide:
        'https://www.incometax.gov.in/iec/foportal/help/generate-challan-form',
    },
    null,
    2,
  ) + '\n',
)
console.log(`Search recording ready: ${durationSeconds.toFixed(1)}s`)
