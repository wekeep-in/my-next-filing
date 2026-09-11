import { humanPath, exitTarget } from './human-cursor.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { chromium } from '@playwright/test'
import {
  browserTime,
  cursorForClip,
  encodeClip,
  outputFrame,
  sourceTime,
  startCapture,
  setRecordingDate,
  toCanvas,
  trackPointer,
  viewport,
} from './browser-recorder.ts'
import { cursorAt, cursorOpacity } from './src/cursor.ts'

// These cases protect the recorder's timing contract, independent of any demo edit.
test('recorded cursor holds, preserves same-frame click coordinates, and handles the first point', () => {
  const points = [
    { at: 0, x: 100, y: 120, click: true },
    { at: 0.2, x: 600, y: 400, click: false },
    { at: 90, x: 900, y: 500, click: true },
  ]
  assert.deepEqual(cursorAt(points, 0), {
    position: points[0],
    click: points[0],
  })
  assert.deepEqual(cursorAt(points, 45), {
    position: points[1],
    click: points[0],
  })
  assert.deepEqual(cursorAt(points, 90), {
    position: points[2],
    click: points[2],
  })
  assert.equal(cursorAt([], 0).position, undefined)
})

test('slow shots retime footage and events together without merging clicks', () => {
  const clip = { start: 100, end: 104, duration: 2 }
  for (const frame of [0, 1, 29, 59, 60, 83])
    assert.ok(
      Math.abs(outputFrame(clip, sourceTime(clip, frame)) - frame) < 1e-9,
    )
  const source = {
    events: [
      { time: 99, x: 10, y: 100, click: false },
      { time: 102, x: 300, y: 300, click: true },
      { time: 102.001, x: 700, y: 400, click: false },
      { time: 102.002, x: 800, y: 500, click: true },
    ],
  }
  const points = cursorForClip(source, clip, 84)
  assert.equal(points.filter((point) => point.click).length, 2)
  assert.equal(points[1].at, 30)
  assert.deepEqual(cursorAt(points, 31).click, points[3])
  assert.deepEqual(toCanvas({ x: 720, y: 450 }), { x: 640, y: 360 })
})

test(
  'headless frame markers keep consecutive shots and new documents aligned',
  { timeout: 60000 },
  async () => {
    const directory = await mkdtemp(
      path.join(tmpdir(), "mnf recording's test-"),
    )
    let browser, capture
    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--force-device-scale-factor=2'],
      })
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 2,
      })
      const page = await context.newPage()
      await setRecordingDate(page, '2026-09-08T12:00:00+05:30')
      const events = await trackPointer(page)
      for (const [index, color] of [
        [0, [21, 128, 61]],
        [1, [21, 128, 61]],
        [2, [37, 99, 235]],
      ] as const) {
        if (index !== 1)
          await page.goto(
            'data:text/html,' +
              encodeURIComponent(`
        <body style="margin:0;background:#f1f5f9">
        <input id="toggle" type="checkbox" style="position:absolute;left:500px;top:500px">
        <label for="toggle" style="position:absolute;left:200px;top:200px;width:200px;height:200px">Click</label>
        <script>document.addEventListener('click', e => {e.stopPropagation();document.body.style.background='rgb(${color.join(',')})'});</script>`),
          )
        if (index === 1)
          await page.evaluate(() => {
            document.body.style.background = '#f1f5f9'
          })
        if (index === 0) await page.mouse.move(100, 100)
        await page.evaluate(() => window.__mnfFlushPointer())
        capture = await startCapture(
          context,
          page,
          path.join(directory, String(index)),
          events,
        )
        const source = capture.source
        const start = await browserTime(page)
        await page.waitForTimeout(200)
        await page.mouse.click(300, 300)
        await page.mouse.move(700, 400)
        await page.keyboard.press('Space')
        await page.waitForTimeout(800)
        await page.evaluate(() => window.__mnfFlushPointer())
        const end = await browserTime(page)
        await capture.stop()
        capture = undefined
        const clicks = source.events.filter(
          (event) => event.click && event.time >= start && event.time <= end,
        )
        assert.equal(
          clicks.length,
          1,
          'Label forwarding and keyboard activation must not duplicate physical clicks',
        )
        assert.ok(
          source.frames.every(
            (frame, i) =>
              frame.time < end + 1 &&
              (i === 0 || frame.time >= source.frames[i - 1].time),
          ),
        )
        const clip = { start, end, duration: 1 }
        const output = path.join(directory, `${index}.mp4`)
        const points = await encodeClip(source, clip, 30, output)
        const click = points.find((point) => point.click)
        assert.ok(click)
        const rgb = execFileSync('ffmpeg', [
          '-v',
          'error',
          '-i',
          output,
          '-vf',
          'crop=2:2:20:20,scale=1:1,format=rgb24',
          '-f',
          'rawvideo',
          '-',
        ])
        assert.equal(rgb.length, 90)
        const visible = Array.from({ length: 30 }, (_, i) => i).find((frame) =>
          color.every(
            (value, channel) => Math.abs(rgb[frame * 3 + channel] - value) <= 6,
          ),
        )
        assert.ok(visible !== undefined)
        assert.ok(
          Math.abs(visible - click.at) <= 1,
          `Paint at ${visible}; cursor click at ${click.at}`,
        )
        assert.deepEqual({ x: click.x, y: click.y }, toCanvas(clicks[0]))
        assert.deepEqual(cursorAt(points, click.at).click, click)
      }
      assert.equal(
        events.filter((event) => event.click).length,
        3,
        'Raw gestures survive navigation; each capture uses only its document',
      )
    } finally {
      try {
        await capture?.stop()
      } finally {
        try {
          await browser?.close()
        } finally {
          await rm(directory, { recursive: true, force: true })
        }
      }
    }
  },
)

test('human paths preserve endpoints, bend, and repeat from their seed', () => {
  const from = { x: 100, y: 200 },
    to = { x: 900, y: 500 }
  const points = humanPath(from, to, 'demo')
  assert.deepEqual(points[0], from)
  assert.deepEqual(points.at(-1), to)
  assert.deepEqual(humanPath(from, to, 'demo'), points)
  assert.notDeepEqual(humanPath(from, to, 'another'), points)
  assert.ok(
    points.every(
      (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
    ),
  )
  assert.ok(
    points.some(
      (point) => Math.abs(point.y - 200 - ((point.x - 100) * 300) / 800) > 5,
    ),
  )
  assert.deepEqual(humanPath(from, from, 'still'), [from, from])
})

test('only exit fades; the next recorded movement appears immediately', () => {
  const exit = { at: 30, x: 324, y: 314, hidden: true }
  assert.equal(cursorOpacity(exit, 30), 1)
  assert.equal(cursorOpacity(exit, 33), 0.5)
  assert.equal(cursorOpacity(exit, 36), 0)
  assert.equal(cursorOpacity({ ...exit, at: 90, hiddenAt: 30 }, 90), 0)
  assert.equal(cursorOpacity({ ...exit, at: 60, hidden: false }, 60), 1)
})

test('an end-of-shot click cannot silently disappear during retiming', () => {
  const source = {
    events: [
      { time: 100, x: 10, y: 20, click: false },
      { time: 102, x: 20, y: 30, click: true },
    ],
  }
  assert.throws(
    () => cursorForClip(source, { start: 100, end: 102.01, duration: 0.7 }, 21),
    /trailing hold/,
  )
  const points = cursorForClip(
    source,
    { start: 100, end: 102.31, duration: 0.7 },
    21,
  )
  assert.equal(points.filter((point) => point.click).length, 1)
})

test('exit drifts remain substantial near viewport edges', () => {
  for (const from of [
    { x: 80, y: 100 },
    { x: 720, y: 450 },
    { x: 1380, y: 800 },
  ]) {
    const target = exitTarget(from, 'exit', viewport)
    assert.ok(Math.hypot(target.x - from.x, target.y - from.y) >= 80)
    assert.ok(
      target.x >= 60 && target.x <= 1380 && target.y >= 90 && target.y <= 810,
    )
  }
})

test('dropped frames hold picture and pointer together while keeping click coordinates', () => {
  const source = {
    frames: [
      { file: 'a', time: 100 },
      { file: 'b', time: 101 },
      { file: 'c', time: 102 },
    ],
    events: [
      { time: 100, x: 100, y: 100, click: false },
      { time: 100.2, x: 300, y: 300, click: true },
      { time: 100.3, x: 600, y: 400, click: false },
    ],
  }
  const points = cursorForClip(
    source,
    { start: 100, end: 102, duration: 2 },
    60,
  )
  assert.equal(cursorAt(points, 29).click, undefined)
  const state = cursorAt(points, 30)
  assert.deepEqual(
    state.position && { x: state.position.x, y: state.position.y },
    toCanvas(source.events[2]),
  )
  assert.deepEqual(
    state.click && { x: state.click.x, y: state.click.y },
    toCanvas(source.events[1]),
  )
})

test('the narration pauses keep every step, captions, and music duration aligned', async () => {
  const {
    DURATION,
    SOURCE_DURATION,
    frameAt,
    scenes,
    timelineTime,
    narrationSegments,
    MUSIC_DURATION_LIMIT,
    FPS,
  } = await import('./src/timeline.ts')
  const { readFile } = await import('node:fs/promises')
  assert.equal(DURATION - SOURCE_DURATION, 180)
  assert.equal(timelineTime(62.2), 66.2)
  assert.equal(
    scenes.find((scene) => scene.id === 'prototype')?.start,
    frameAt(68.4),
  )
  assert.ok(DURATION / FPS <= MUSIC_DURATION_LIMIT)
  assert.equal(
    narrationSegments.reduce((sum, segment) => sum + segment.length, 0),
    SOURCE_DURATION,
  )
  assert.deepEqual(
    scenes
      .filter(
        (scene) => scene.start >= frameAt(17.6) && scene.start < frameAt(36.2),
      )
      .map((scene) => scene.id),
    [
      'home',
      'practice',
      'work',
      'receipts',
      'clients-preview',
      'tax-paid',
      'gst-preview',
      'review',
    ],
  )
  const captions = await readFile(
    new URL('./subtitles.en.vtt', import.meta.url),
    'utf8',
  )
  assert.ok(captions.includes('cue-19\n00:01:08.840 --> 00:01:12.620'))
  assert.ok(captions.includes('00:02:06.900 --> 00:02:09.360'))
})
