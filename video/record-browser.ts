import type { Browser, BrowserContext, Locator, Page } from '@playwright/test'
import type {
  Box,
  CaptureSource,
  ClipTiming,
  PointerEventRecord,
} from './browser-recorder.ts'
import type { CursorPoint } from './src/cursor.ts'
import { humanPath, exitTarget } from './human-cursor.ts'
import { randomUUID } from 'node:crypto'

type Clip = (
  | (ClipTiming & { source: number })
  | { image: string; duration: number }
) & { cursor?: CursorPoint[] }
type Group = {
  id: string
  start: number
  end: number
  clipIds: string[]
  cursor: CursorPoint[]
  video: string
}
type RecordingSession = {
  version: number
  sources: CaptureSource[]
  clips: Record<string, Clip>
  annotations: {
    plan?: { amount: Box[]; date: Box[] }
    zero?: Box[]
    completed?: Box[]
  }
  errors: string[]
  complete: boolean
}
import { chromium } from '@playwright/test'
import {
  browserTime,
  captureResolution,
  encodeClip,
  probe,
  startCapture,
  setRecordingDate,
  toCanvas,
  trackPointer,
  viewport,
} from './browser-recorder.ts'
import {
  mkdir,
  writeFile,
  readFile,
  mkdtemp,
  rename,
  copyFile,
} from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { parseArgs, promisify } from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { FPS, scenes } from './src/timeline.ts'

const exec = promisify(execFile)
const directory = path.dirname(fileURLToPath(import.meta.url))
await exec('ffmpeg', ['-version'])
await exec('ffprobe', ['-version'])
const { values: options } = parseArgs({
  options: {
    url: { type: 'string', default: 'http://localhost:5173' },
    headed: { type: 'boolean', default: false },
    preview: { type: 'boolean', default: false },
    draft: { type: 'boolean', default: false },
    'encode-only': { type: 'string' },
    resume: { type: 'string' },
    'portal-image': { type: 'string' },
  },
})
await mkdir(path.join(directory, 'out'), { recursive: true })
const existingSession = options['encode-only'] ?? options.resume
const runDirectory = existingSession
  ? path.dirname(path.resolve(existingSession))
  : await mkdtemp(path.join(directory, 'out/recording-'))
const sessionFile = path.join(runDirectory, 'session.json')
const portalImage = path.join(runDirectory, 'portal.png')
const portalInput =
  options['portal-image'] ??
  path.join(directory, 'public/screens/tax-portal.png')
if (options['portal-image'] || existsSync(portalInput))
  await copyFile(path.resolve(portalInput), portalImage)
const takeId = `${path.basename(runDirectory)}-${randomUUID().slice(0, 8)}`
const previous: RecordingSession = existingSession
  ? JSON.parse(await readFile(path.resolve(existingSession), 'utf8'))
  : {
      version: 2,
      sources: [],
      clips: {},
      annotations: {},
      errors: [],
      complete: false,
    }
assert.equal(previous.version, 2, 'Use a session from the portable recorder.')
if (options['encode-only'])
  assert.ok(
    previous.complete,
    'The browser journey must finish before encoding.',
  )
const clipsDirectory = path.join(runDirectory, 'clips')
const groupsDirectory = path.join(runDirectory, 'browser')
await mkdir(clipsDirectory, { recursive: true })
await mkdir(groupsDirectory, { recursive: true })
const sources = previous.sources
for (const source of sources)
  source.directory = path.resolve(runDirectory, source.directory)
const clips = previous.clips
const annotations = previous.annotations
const errors = previous.errors
let browser: Browser | undefined
let context: BrowserContext
let page!: Page
let activeCapture: Awaited<ReturnType<typeof startCapture>> | undefined
let movement = 0
let replaying = false
let sourceIndex = sources.length - 1
let pointerEvents: PointerEventRecord[] = []
let pointer = { x: 1100, y: 720 }
const duration = (id: string) => {
  const scene = scenes.find((scene) => scene.id === id)
  assert.ok(scene)
  return scene.length / FPS
}
const lastClips = new Set<string>(
  scenes
    .filter((scene) => !('paper' in scene) && scene.turn)
    .map((scene) => scene.id),
)
const saveSession = () =>
  writeFile(
    sessionFile,
    JSON.stringify(
      {
        ...previous,
        sources: sources.map((source) => ({
          ...source,
          directory: path
            .relative(runDirectory, source.directory)
            .split(path.sep)
            .join('/'),
        })),
      },
      null,
      2,
    ),
  )
const button = (name: string) => page.getByRole('button', { name, exact: true })
const card = () => page.locator('.attention-card')
const wait = (ms: number) => page.waitForTimeout(Math.max(0, ms))

async function ready() {
  await page.locator('main h1').waitFor()
  await page.evaluate(() => document.fonts.ready)
  await wait(260)
}

async function visit(route: string) {
  await page.goto(new URL(route, options.url).href)
  await ready()
  await page.locator('.product-preview').evaluateAll((elements) =>
    elements.forEach((el) => {
      if (el instanceof HTMLElement) el.style.visibility = 'hidden'
    }),
  )
}

async function newSource() {
  if (activeCapture) {
    await activeCapture.stop()
    activeCapture = undefined
  }
  if (page) await page.close()
  page = await context.newPage()
  page.setDefaultTimeout(30000)
  await setRecordingDate(page, '2026-09-08T12:00:00+05:30')
  const events = await trackPointer(page)
  page.on('pageerror', (error) => errors.push(error.message))
  await visit('/')
  pointerEvents = events
  await page.mouse.move(pointer.x, pointer.y)
  await page.evaluate(() => window.__mnfFlushPointer())
}

async function movePointer(
  target: { x: number; y: number },
  seconds = 0.45,
  offset = 80,
) {
  if (replaying) {
    movement++
    await page.mouse.move(target.x, target.y)
    pointer = target
    return
  }
  const from = pointerEvents.at(-1) ?? pointer
  const points = humanPath(from, target, `move-${movement++}`, offset)
  const started = performance.now()
  for (const [index, point] of points.entries()) {
    await wait(
      started +
        (seconds * 1000 * index) / (points.length - 1) -
        performance.now(),
    )
    await page.mouse.move(
      Math.max(20, Math.min(viewport.width - 20, point.x)),
      Math.max(60, Math.min(viewport.height - 60, point.y)),
    )
  }
  pointer = target
}

async function parkPointer() {
  const from = pointerEvents.at(-1) ?? pointer
  await movePointer(exitTarget(from, `exit-${movement}`, viewport), 0.55, 24)
  await page.evaluate(() => window.__mnfFlushPointer())
  pointerEvents.push({
    ...pointer,
    time: await browserTime(page),
    click: false,
    hidden: true,
    documentId: await page.evaluate(() => window.__mnfDocumentId),
  })
}

async function reveal(locator: Locator, top = 86) {
  const target = await locator.evaluate((el, top) => {
    const y = Math.max(
      0,
      Math.min(
        scrollY + el.getBoundingClientRect().top - top,
        document.documentElement.scrollHeight - innerHeight,
      ),
    )
    scrollTo({ top: y, behavior: 'smooth' })
    return y
  }, top)
  await page.waitForFunction(
    (target) => Math.abs(scrollY - target) < 3,
    target,
    { timeout: 10000 },
  )
  await wait(70)
}

async function move(locator: Locator, seconds = 0.45) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Recording target is missing')
  if (box.y < 50 || box.y + box.height > viewport.height - 50)
    await reveal(locator, 220)
  const visible = await locator.boundingBox()
  if (!visible) throw new Error('Recording target disappeared')
  const target = {
    x: visible.x + visible.width / 2,
    y: visible.y + visible.height / 2,
  }
  await movePointer(target, seconds)
}

async function click(locator: Locator) {
  await move(locator)
  await locator.click()
}
async function step(label: string) {
  await click(button(label))
  await ready()
}
async function reviewStep(label: string) {
  await click(button('Back'))
  await ready()
  await step(label)
}

async function seedPersonal(route = '/check/fit') {
  await visit('/')
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
            '2026-09-08',
          ),
          TAX_YEAR,
        ),
      ),
    )
  }, '/src/')
  await visit(route)
}

async function textRects(locator: Locator, phrase: string) {
  const rects = await locator.evaluate((el, phrase) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    const nodes = []
    let text = ''
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      nodes.push({ node, start: text.length })
      text += node.textContent ?? ''
    }
    const start = text.indexOf(phrase)
    if (start < 0) throw new Error('Annotation text is missing')
    const end = start + phrase.length
    const first = nodes.find(
      ({ node, start: offset }) =>
        start >= offset && start < offset + (node.textContent ?? '').length,
    )
    const last = nodes.find(
      ({ node, start: offset }) =>
        end > offset && end <= offset + (node.textContent ?? '').length,
    )
    if (!first || !last) throw new Error('Annotation text range is missing')
    const range = document.createRange()
    range.setStart(first.node, start - first.start)
    range.setEnd(last.node, end - last.start)
    return [...range.getClientRects()]
      .filter((r) => r.width > 0)
      .map((r) => ({ x: r.x, y: r.y, width: r.width, height: r.height }))
  }, phrase)
  return rects.map((rect) => toCanvas(rect))
}

async function shot(
  id: string,
  run: (
    at: (seconds: number, action: () => Promise<unknown>) => Promise<void>,
  ) => Promise<void>,
) {
  if (options.resume && clips[id]) {
    assert.ok(
      Math.abs(clips[id].duration - duration(id)) < 1e-6,
      'Resume requires unchanged scene durations.',
    )
    const savedAnnotations = structuredClone(annotations)
    replaying = true
    try {
      await run(async (_seconds, action) => {
        await action()
        await ready()
      })
    } finally {
      replaying = false
      Object.assign(annotations, savedAnnotations)
    }
    console.log(`Retained ${id}`)
    return
  }
  sourceIndex++
  activeCapture = await startCapture(
    context,
    page,
    path.join(runDirectory, `source-${sourceIndex}`),
    pointerEvents,
  )
  sources.push(activeCapture.source)
  const start = await browserTime(page)
  const at = async (seconds: number, action: () => Promise<unknown>) => {
    await wait((start + seconds - (await browserTime(page))) * 1000)
    await action()
  }
  await run(at)
  // Hold the first completed state still through the outgoing page turn.
  if (lastClips.has(id) && id !== 'completion-preview') await parkPointer()
  const afterActions = await browserTime(page)
  // Keep at least one output frame after the final input, even when retiming a
  // slow host. Otherwise an end-of-shot click can fall beyond the last sample.
  await wait(
    Math.max(
      300,
      ((afterActions - start) * 1000) / (Math.round(duration(id) * FPS) - 1) +
        40,
      (start + duration(id) - afterActions) * 1000,
    ),
  )
  const end = await browserTime(page)
  // Keep the outgoing native animation for the page-turn overlap.
  await wait(1000)
  await page.evaluate(() => window.__mnfFlushPointer())
  assert.ok(activeCapture)
  activeCapture.assertHealthy()
  await activeCapture.stop()
  activeCapture = undefined
  clips[id] = { source: sourceIndex, start, end, duration: duration(id) }
  await saveSession()
  console.log(
    `Recorded ${id}${end - start > duration(id) + 0.2 ? ' (fitted to narration slot)' : ''}`,
  )
}

try {
  if (!options['encode-only']) {
    browser = await chromium.launch({
      headless: !options.headed,
      args: ['--force-device-scale-factor=2'],
    })
    context = await browser.newContext({
      viewport,
      deviceScaleFactor: 2,
      reducedMotion: 'no-preference',
      locale: 'en-IN',
      timezoneId: 'Asia/Kolkata',
    })
    await newSource()
    await shot('home', async (at) => {
      await at(3.55, () =>
        click(
          page.getByRole('link', { name: 'Start your estimate', exact: true }),
        ),
      )
    })
    await seedPersonal()
    await shot('practice', async (at) => {
      await at(0.6, () => move(button('Next')))
    })
    await shot('work', async (at) => {
      await at(0.05, () => click(button('Your work and tax method')))
      await wait(260)
      await at(0.8, () => reveal(page.locator('#work-and-tax-method'), 120))
    })
    for (const [id, route] of [
      ['receipts', 'income'],
      ['clients-preview', 'clients'],
      ['tax-paid', 'taxes-and-gst'],
      ['gst-preview', 'taxes-and-gst'],
      ['review', 'review'],
    ]) {
      await shot(id, async (at) => {
        await at(0.05, async () => {
          if (id === 'gst-preview') {
            await click(button('GST registration'))
            await wait(260)
            await reveal(page.locator('#gst-registration-title'), 120)
          } else await click(button('Next'))
          await page.waitForURL(new URL(`/check/${route}`, options.url).href)
          await ready()
        })
        if (id === 'tax-paid')
          await at(0.9, () =>
            reveal(
              page.getByRole('heading', {
                name: 'Tax already paid',
                exact: true,
              }),
            ),
          )
        if (id === 'review')
          await at(2.35, () => click(button('Calculate my plan')))
      })
    }
    await ready()
    await shot('plan', async (at) => {
      await at(0.05, () => reveal(card()))
      await at(0.45, async () => {
        const summary = card().locator('.attention-summary')
        const strong = await summary.locator('strong').allTextContents()
        annotations.plan = {
          amount: await textRects(summary, strong[0]),
          date: await textRects(summary, strong[strong.length - 1]),
        }
        const date = annotations.plan.date[0]
        await movePointer(
          {
            x: ((date.x + date.width + 18) * viewport.width) / 1280,
            y: ((date.y + date.height / 2 + 40) * viewport.width) / 1280,
          },
          1.8,
          48,
        )
      })
    })
    await shot('agenda', async (at) => {
      await at(0.05, () =>
        reveal(page.getByRole('heading', { name: 'Your agenda', exact: true })),
      )
    })
    await shot('calculation', async (at) => {
      await at(0.05, () => reveal(page.locator('.tax-summary')))
      await at(0.9, () =>
        click(
          page.getByText('How this estimate was calculated', { exact: true }),
        ),
      )
      await at(1.75, () =>
        page.evaluate(() => scrollBy({ top: 170, behavior: 'smooth' })),
      )
    })
    await page
      .getByText('How this estimate was calculated', { exact: true })
      .click()
    await shot('guidance', async (at) => {
      await at(0.05, () => reveal(card()))
      await at(0.45, async () => {
        const portal = page.getByRole('link', { name: /^Open e-Pay Tax/ })
        const opened = page.waitForEvent('popup')
        await click(portal)
        const popup = await opened
        await popup.close()
        await page.bringToFront()
      })
    })
    // The destination blocks automated browsers. Use a real manual capture;
    // leave this shot pending rather than substituting another government page.
    clips['portal-page'] = {
      image: 'portal.png',
      duration: duration('portal-page'),
    }
    await shot('return-plan', async () => {})
    await reveal(button('Save data in this browser'), 490)
    await shot('save-dialog', async (at) => {
      await at(0.3, () => click(button('Save data in this browser')))
      await at(2.1, () =>
        click(
          page
            .getByRole('dialog')
            .getByRole('button', { name: 'Save data', exact: true }),
        ),
      )
    })
    const annual = page.locator('.agenda-item').filter({
      has: page.getByRole('heading', {
        name: 'File the annual income-tax return',
        exact: true,
      }),
    })
    await reveal(annual, 150)
    await shot('completion-preview', async (at) => {
      await at(0.1, () =>
        click(
          annual.getByRole('button', {
            name: 'Add completion date',
            exact: true,
          }),
        ),
      )
      const editor = card().locator('.inline-editor')
      await editor.waitFor()
      await reveal(editor, 240)
      await at(1.4, () =>
        click(editor.getByLabel('Completion date', { exact: true })),
      )
      const day = page.getByRole('button', {
        name: '7 September 2026',
        exact: true,
      })
      await day.waitFor()
      await at(2.3, async () => {
        await move(day, 0.35)
        await wait(250)
        await day.click()
      })
      await at(3.5, async () => {
        const mark = editor.getByRole('button', {
          name: 'Mark completed',
          exact: true,
        })
        await move(mark, 0.4)
        await wait(400)
        await mark.click()
      })
      await annual
        .getByRole('button', { name: 'Remove completion', exact: true })
        .waitFor()
      await editor.waitFor({ state: 'hidden' })
      await ready()
      await reveal(annual, 150)
      await wait(800)
    })
    // Reset this independent example outside the footage so the later advance-tax
    // walkthrough can still reveal the annual return as its next action.
    await annual
      .getByRole('button', { name: 'Remove completion', exact: true })
      .click()
    await annual
      .getByRole('button', { name: 'Add completion date', exact: true })
      .waitFor()
    await visit('/plan')
    await reveal(card())
    await reviewStep('3. Clients and payments')
    await shot('clients', async (at) => {
      await at(1.0, () =>
        click(
          page.locator('#clientKind').getByRole('radio', {
            name: 'Both in India and outside India',
            exact: true,
          }),
        ),
      )
      await at(2.1, () =>
        click(
          page.locator('#delivery').getByRole('radio', {
            name: 'Directly and through a platform',
            exact: true,
          }),
        ),
      )
      await at(3.2, async () => {
        await click(button('Platform work'))
        await wait(260)
        await reveal(page.locator('#platform-work'), 120)
      })
    })
    await newSource()
    await shot('return-home', async (at) => {
      await at(0.65, () =>
        click(
          page.getByRole('link', {
            name: 'Continue your saved workspace',
            exact: true,
          }),
        ),
      )
    })
    await ready()
    await shot('reopened', async (at) => {
      await at(0.05, () => reveal(card()))
      await at(0.65, () =>
        click(
          card().getByRole('button', {
            name: 'Update amount paid',
            exact: true,
          }),
        ),
      )
    })
    await reveal(page.getByLabel('Total advance tax already paid'), 430)
    const balance = (await page.locator('.tax-summary h2').innerText()).replace(
      /[^0-9]/g,
      '',
    )
    await shot('payment-empty', async (at) => {
      await at(0.2, () =>
        click(page.getByLabel('Total advance tax already paid')),
      )
      await at(0.45, () => page.keyboard.press('ControlOrMeta+A'))
    })
    await shot('payment-entered', async (at) => {
      await at(0.05, () => page.keyboard.type(balance, { delay: 55 }))
      await at(1.35, () => click(button('Update and recalculate')))
    })
    await shot('zero-balance', async (at) => {
      await at(0.05, () => reveal(card()))
      await at(0.8, async () => {
        annotations.zero = await textRects(
          card().locator('.attention-summary'),
          'No estimated amount left',
        )
      })
      const complete = card().getByRole('button', {
        name: 'Mark completed',
        exact: true,
      })
      await at(1.1, async () => {
        await move(complete, 1)
        await wait(900)
      })
      await at(3.2, () => complete.click())
      await card()
        .getByRole('heading', {
          name: 'File the annual income-tax return',
          exact: true,
        })
        .waitFor()
    })
    await shot('completed', async (at) => {
      await at(0.2, async () => {
        const heading = card().locator('h2')
        annotations.completed = await textRects(
          heading,
          await heading.innerText(),
        )
      })
      await at(1.2, () => parkPointer())
    })
    await shot('completed-agenda', async (at) => {
      await at(0.05, () =>
        reveal(page.getByRole('heading', { name: 'Your agenda', exact: true })),
      )
    })
    await reviewStep('1. Fit for this app')
    await click(button('Your work and tax method'))
    await wait(260)
    await reveal(page.locator('#work-and-tax-method'), 120)
    await shot('help', async (at) => {
      const learn = page.getByRole('button', {
        name: 'Which method fits my work?',
        exact: true,
      })
      await at(0.25, async () => {
        await move(learn, 1)
        await wait(800)
        await learn.click()
        await page.getByRole('dialog').waitFor()
        await wait(1500)
      })
    })
    await page.keyboard.press('Escape')
    await shot('unsupported', async (at) => {
      await at(0.35, () =>
        click(
          page.locator('#pathConfirmed').getByText('Not sure', { exact: true }),
        ),
      )
      await at(1.15, () => reveal(page.locator('#pathConfirmed'), 150))
    })
  }
  previous.complete = true
} finally {
  try {
    await activeCapture?.stop()
  } catch (error) {
    previous.complete = false
    throw error
  } finally {
    try {
      await browser?.close()
    } finally {
      await saveSession()
    }
  }
}
assert.deepEqual(
  errors,
  [],
  'The browser journey must finish without app errors.',
)
const missingImages: string[] = []
for (const [id, clip] of Object.entries(clips)) {
  const frames = Math.round(clip.duration * FPS) + (lastClips.has(id) ? 24 : 0)
  const output = path.join(clipsDirectory, `${id}.mp4`)
  if ('image' in clip) {
    const image = path.join(runDirectory, clip.image)
    if (!existsSync(image)) {
      missingImages.push(id)
      continue
    }
    await exec('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-loop',
      '1',
      '-framerate',
      String(FPS),
      '-i',
      image,
      '-vf',
      'scale=2560:1440:force_original_aspect_ratio=decrease:out_color_matrix=bt709:out_range=limited,pad=2560:1440:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1',
      '-frames:v',
      String(frames),
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '16',
      '-threads',
      '2',
      '-pix_fmt',
      'yuv420p',
      '-color_range',
      'tv',
      '-colorspace',
      'bt709',
      '-color_primaries',
      'bt709',
      '-color_trc',
      'bt709',
      output,
    ])
    clip.cursor = [
      { at: 0, x: 0, y: 0, hidden: true, hiddenAt: -FPS, click: false },
    ]
  } else {
    clip.cursor = await encodeClip(sources[clip.source], clip, frames, output)
  }
  console.log(`Encoded ${id}`)
}
if (missingImages.length && !options.draft) {
  throw new Error(
    `App footage is saved at ${runDirectory}. Finish with --encode-only ${sessionFile} --portal-image /path/to/e-pay-tax.png, or use --draft to review the app edits.`,
  )
}
for (const id of missingImages) {
  const frames =
    Math.round(clips[id].duration * FPS) + (lastClips.has(id) ? 24 : 0)
  await exec('ffmpeg', [
    '-v',
    'error',
    '-y',
    '-stream_loop',
    '-1',
    '-i',
    path.join(clipsDirectory, 'return-plan.mp4'),
    '-frames:v',
    String(frames),
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '16',
    '-threads',
    '2',
    '-pix_fmt',
    'yuv420p',
    '-color_range',
    'tv',
    '-colorspace',
    'bt709',
    '-color_primaries',
    'bt709',
    '-color_trc',
    'bt709',
    path.join(clipsDirectory, `${id}.mp4`),
  ])
  clips[id].cursor = [
    { at: 0, x: 0, y: 0, hidden: true, hiddenAt: -FPS, click: false },
  ]
}

const groups: Record<string, Group> = {}
let current: Group | undefined
for (const scene of scenes) {
  if ('paper' in scene) {
    current = undefined
    continue
  }
  if (!current) {
    current = {
      id: scene.id,
      start: scene.start,
      end: scene.end,
      clipIds: [],
      cursor: [],
      video: `browser/${takeId}/group-${scene.id}.mp4`,
    }
    groups[scene.id] = current
  }
  current.end = scene.end
  current.clipIds.push(scene.id)
  const groupStart = current.start
  current.cursor.push(
    ...(clips[scene.id].cursor ?? []).map((point) => ({
      ...point,
      at: point.at + scene.start - groupStart,
      hiddenAt:
        point.hiddenAt === undefined
          ? undefined
          : point.hiddenAt + scene.start - groupStart,
    })),
  )
}
for (const group of Object.values(groups)) {
  const list = path.join(clipsDirectory, `${group.id}.ffconcat`)
  await writeFile(
    list,
    group.clipIds.map((id) => `file '${id}.mp4'`).join('\n'),
  )
  await exec('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    list,
    '-c',
    'copy',
    '-movflags',
    '+faststart',
    path.join(groupsDirectory, path.basename(group.video)),
  ])
}
const metadata = {
  viewport,
  zoom: 1,
  capturePlatform: 'Playwright Chromium',
  portalCapturePending: missingImages.length > 0,
  captureResolution,
  outputResolution: { width: 2560, height: 1440 },
  groups,
  annotations,
  errors,
}
for (const group of Object.values(groups)) {
  const info = (
    await probe(path.join(groupsDirectory, path.basename(group.video)))
  ).streams[0]
  assert.equal(Number(info.nb_frames), group.end - group.start + 24)
  assert.ok(
    group.cursor.every(
      (point, index) =>
        Number.isFinite(point.at) &&
        point.at >= 0 &&
        (index === 0 || point.at >= group.cursor[index - 1].at),
    ),
  )
}
const stagedMetadata = path.join(runDirectory, 'recordings.json')
await writeFile(stagedMetadata, JSON.stringify(metadata, null, 2))
if (!options.preview) {
  const target = path.join(directory, 'public/browser', takeId)
  const metadataTarget = path.join(directory, 'src/recordings.json')
  const backup = path.join(runDirectory, 'previous-recordings.json')
  await copyFile(metadataTarget, backup)
  await mkdir(path.dirname(target), { recursive: true })
  await rename(groupsDirectory, target)
  try {
    await copyFile(stagedMetadata, metadataTarget)
  } catch (error) {
    await rename(target, groupsDirectory)
    await copyFile(backup, metadataTarget)
    throw error
  }
}
console.log(
  `${options.preview ? 'Preview' : missingImages.length ? 'Installed draft (portal capture pending)' : 'Installed recording'} ready; session and metadata: ${runDirectory}`,
)
