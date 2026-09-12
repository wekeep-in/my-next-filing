import { chromium } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdir, rename, writeFile } from 'node:fs/promises'
import { comparisonCursor } from './comparison-cursor'
import { setRecordingDate } from './browser-recorder'

// Use synthetic answers in a fresh browser on the normal personal route.
const directory = 'video/public/comparison'
await mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: {
    dir: 'video/out/comparison-capture',
    size: { width: 1280, height: 720 },
  },
})
const page = await context.newPage()
const video = page.video()!
let started = 0,
  ended = 0
const cursor = comparisonCursor(page.mouse, () => started)
const cues: {
  label: string
  seconds: number
  box?: { x: number; y: number; width: number; height: number }
}[] = []
let guidePage: Awaited<ReturnType<typeof context.newPage>> | undefined
let guideStarted = 0,
  guideEnded = 0
try {
  await setRecordingDate(page, '2026-09-11T06:30:00Z')
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' })
  await page.evaluate(async (prefix) => {
    const { exampleProfile } = await import(prefix + 'routes/check/model.ts')
    const { sessionFromProfile } = await import(
      prefix + 'routes/check/session.ts'
    )
    const { RECOVERY_KEY, recoveryFromSession } = await import(
      prefix + 'recovery-draft/index.ts'
    )
    const { TAX_YEAR } = await import(prefix + 'rules/index.ts')
    sessionStorage.setItem(
      RECOVERY_KEY,
      JSON.stringify(
        recoveryFromSession(
          sessionFromProfile(
            exampleProfile,
            { kind: 'personal' },
            '2026-09-11',
          ),
          TAX_YEAR,
        ),
      ),
    )
  }, '/src/')
  await page.goto('http://127.0.0.1:5173/check/fit', {
    waitUntil: 'networkidle',
  })
  await page.getByRole('button', { name: 'Next', exact: true }).waitFor()
  // Record the leading setup offset; all subsequent footage stays at 1x.
  started = Date.now()
  const hold = (ms: number) => page.waitForTimeout(ms)
  const click = cursor.click
  for (const label of [
    'Your work',
    'Income and profit',
    'Clients and payments',
    'Taxes and GST',
    'Review your answers',
  ]) {
    cues.push({ label, seconds: (Date.now() - started) / 1000 })
    await hold(900)
    const closed = page
      .locator('.question-disclosure:not([data-open]) .question-card-trigger')
      .first()
    if (await closed.count()) {
      await click(closed)
      await hold(400)
    }
    await page.mouse.wheel(0, 330)
    await hold(1000)
    await page.mouse.wheel(0, 300)
    await hold(900)
    const next = page.getByRole('button', { name: 'Next', exact: true })
    if (label !== 'Review your answers') {
      await click(next)
      const target = ['income', 'clients', 'taxes-and-gst', 'review'][
        cues.length - 1
      ]
      await page.waitForURL(`**/check/${target}`)
    }
  }
  await click(
    page.getByRole('button', { name: 'Calculate my plan', exact: true }),
  )
  await page.waitForURL('**/plan')
  await page.screenshot({ path: 'video/out/comparison-plan.png' })
  await page
    .getByRole('link', { name: /^Open e-Pay Tax/ })
    .first()
    .waitFor()
  cues.push({
    label: 'Your next action',
    seconds: (Date.now() - started) / 1000,
    box: await page.locator('.attention-card h2').evaluate((el) => {
      const range = document.createRange()
      range.selectNodeContents(el)
      return range.getBoundingClientRect().toJSON()
    }),
  })
  for (const [index, label] of ['Amount', 'Date'].entries()) {
    const box = await page
      .locator('.attention-summary strong')
      .nth(index)
      .boundingBox()
    if (!box) throw new Error('Missing plan annotation target')
    cues.push({ label, seconds: (Date.now() - started) / 1000, box })
  }
  await hold(5500)
  await click(
    page.getByRole('button', {
      name: 'Save data in this browser',
      exact: true,
    }),
  )
  const saveDialog = page.getByRole('dialog', {
    name: 'Save data in this browser?',
    exact: true,
  })
  await saveDialog.waitFor()
  cues.push({
    label: 'Save in this browser',
    seconds: (Date.now() - started) / 1000,
  })
  await hold(2400)
  await click(
    saveDialog.getByRole('button', { name: 'Save data', exact: true }),
  )
  await saveDialog.waitFor({ state: 'hidden' })
  if (
    !(await page.evaluate(() =>
      localStorage.getItem('my-next-filing:workspace'),
    ))
  )
    throw new Error('The normal flow did not save a workspace')
  await hold(1400)
  await click(page.getByText('How to pay', { exact: true }).first())
  const guide = page
    .getByRole('link', { name: /^official e-Pay Tax guide/ })
    .first()
  await guide.scrollIntoViewIfNeeded()
  await hold(2200)
  await page.screenshot({ path: `${directory}/app-guide.png` })
  const href = await guide.getAttribute('href')
  if (
    href !==
    'https://www.incometax.gov.in/iec/foportal/help/generate-challan-form'
  )
    throw new Error('Unexpected guide destination')
  // End at the visible guide link; its destination is captured separately.
  cues.push({
    label: 'Official guide',
    seconds: (Date.now() - started) / 1000,
    box: (await guide.boundingBox()) ?? undefined,
  })
  await hold(1400)
  const popup = page.waitForEvent('popup')
  await click(guide)
  ended = Date.now()
  guidePage = await popup
  await guidePage.waitForLoadState('domcontentloaded')
  await guidePage
    .getByRole('heading', {
      name: 'How to Generate Challan Form User Manual',
      exact: true,
    })
    .first()
    .waitFor()
  await guidePage.evaluate(() => document.fonts.ready)
  guideStarted = Date.now()
  await guidePage.waitForTimeout(2500)
  guideEnded = Date.now()
} catch (error) {
  await page.screenshot({ path: 'video/out/comparison-error.png' })
  throw error
} finally {
  await context.close()
  await browser.close()
}
const duration = (file: string) =>
  Number(
    JSON.parse(
      execFileSync(
        'ffprobe',
        [
          '-v',
          'error',
          '-show_entries',
          'format=duration',
          '-of',
          'json',
          file,
        ],
        { encoding: 'utf8' },
      ),
    ).format.duration,
  )
const appSource = await video.path()
const appSeconds = (ended - started) / 1000
// Main tab kept recording while the real guide opened in its new tab.
const trimSeconds = Math.max(
  0,
  duration(appSource) - (guideEnded - started) / 1000,
)
await rename(appSource, `${directory}/app.webm`)
if (!guidePage) throw new Error('No official guide recording')
const guideSource = await guidePage.video()!.path()
const guideSeconds = (guideEnded - guideStarted) / 1000
const guideTrimSeconds = Math.max(0, duration(guideSource) - guideSeconds)
await rename(guideSource, `${directory}/app-official-guide.webm`)
await writeFile(
  `${directory}/capture.json`,
  JSON.stringify(
    {
      recordedOn: '2026-09-11',
      prefilled: true,
      route: 'personal',
      savedWorkspace: true,
      trimSeconds,
      appSeconds,
      guideSeconds,
      guideTrimSeconds,
      cues,
      cursor: cursor.points,
      guide:
        'https://www.incometax.gov.in/iec/foportal/help/generate-challan-form',
    },
    null,
    2,
  ) + '\n',
)
console.log(
  `App recording ready: ${appSeconds.toFixed(1)}s + ${guideSeconds.toFixed(1)}s official guide`,
)
