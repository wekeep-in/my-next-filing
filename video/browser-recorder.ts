import type { BrowserContext, Page } from '@playwright/test'
import type { CursorPoint } from './src/cursor.ts'
import type { Point } from './human-cursor.ts'

export type Box = Point & { width: number; height: number }
export type PointerEventRecord = Point & {
  time: number
  click: boolean
  hidden?: boolean
  documentId?: string
}
export type CaptureSource = {
  directory: string
  documentId: string
  frames: { file: string; time: number }[]
  events: PointerEventRecord[]
}
export type ClipTiming = { start: number; end: number; duration: number }
export type MediaProbe = {
  streams: {
    codec_type: string
    width: number
    height: number
    nb_frames: string
    color_space: string
    start_pts: number
  }[]
  format: { duration: string }
}
declare global {
  interface Window {
    __mnfDocumentId: string
    __mnfStopMarker?: () => Promise<void>
    __mnfRecordPointer: (event: PointerEventRecord) => Promise<void>
    __mnfFlushPointer: () => Promise<void[]>
  }
}
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { FPS } from './src/timeline.ts'

const exec = promisify(execFile)
export async function setRecordingDate(page: Page, date: string) {
  await page.addInitScript((now) => {
    // Playwright's fake clock also replaces performance and event timestamps.
    // Freeze only calendar time so CDP and input events keep their native epoch.
    globalThis.Date = new Proxy(Date, {
      construct(target, args, newTarget) {
        return Reflect.construct(target, args.length ? args : [now], newTarget)
      },
      apply(target) {
        return new target(now).toString()
      },
      get(target, property) {
        return property === 'now' ? () => now : Reflect.get(target, property)
      },
    })
  }, new Date(date).getTime())
}
export const viewport = { width: 1440, height: 900 }
export const captureResolution = { width: 2880, height: 1800 }
export const browserTime = (page: Page) =>
  page.evaluate(() => performance.now() / 1000)
export function toCanvas(point: Box): Box
export function toCanvas(point: Point): Point
export function toCanvas(point: Point | Box): Point | Box {
  const position = {
    x: (point.x * 1280) / viewport.width,
    y: (point.y * 1280) / viewport.width - 40,
  }
  return 'width' in point
    ? {
        ...position,
        width: (point.width * 1280) / viewport.width,
        height: (point.height * 1280) / viewport.width,
      }
    : position
}

// Event timestamps are captured before app handlers run. The Node-owned array
// survives full navigations; the browser clock, not binding arrival time, is used.
export async function trackPointer(page: Page) {
  const events: PointerEventRecord[] = []
  await page.exposeBinding(
    '__mnfRecordPointer',
    ({ frame }, event: PointerEventRecord) => {
      if (frame === page.mainFrame()) events.push(event)
    },
  )
  await page.addInitScript(() => {
    if (window !== window.top) return
    window.__mnfDocumentId = [
      ...crypto.getRandomValues(new Uint32Array(2)),
    ].join('-')
    const pending = new Set<Promise<void>>()
    window.__mnfFlushPointer = () => Promise.all(pending)
    for (const type of ['pointermove', 'pointerup'] as const) {
      addEventListener(
        type,
        (event) => {
          if (!event.isTrusted || (type === 'pointerup' && event.button !== 0))
            return
          const sent = window
            .__mnfRecordPointer({
              x: event.clientX,
              y: event.clientY,
              time: event.timeStamp / 1000,
              click: type === 'pointerup',
              documentId: window.__mnfDocumentId,
            })
            .catch(() => {}) // Navigation may destroy the context before the binding replies.
          pending.add(sent)
          void sent.then(() => pending.delete(sent))
        },
        { capture: true, passive: true },
      )
    }
  })
  return events
}

function markerId(bits: Uint8Array, tag: number) {
  let value = 0
  for (const bit of bits) value = value * 2 + (bit > 127 ? 1 : 0)
  return Math.floor(value / 2 ** 16) === 0xa500 + tag
    ? value % 2 ** 16
    : undefined
}
async function markerStrip(input: string) {
  return (
    await exec(
      'ffmpeg',
      [
        '-v',
        'error',
        '-framerate',
        String(FPS),
        '-i',
        input,
        '-vf',
        'crop=256:16:0:0,scale=32:1:flags=neighbor,format=gray',
        '-f',
        'rawvideo',
        '-',
      ],
      { encoding: 'buffer', maxBuffer: 16 * 1024 * 1024 },
    )
  ).stdout
}

let captureNumber = 0

export async function startCapture(
  context: BrowserContext,
  page: Page,
  directory: string,
  events: PointerEventRecord[],
) {
  await mkdir(directory, { recursive: true })
  const documentId = await page.evaluate(() => window.__mnfDocumentId)
  const previousPointer = events.at(-1)
  if (previousPointer && previousPointer.documentId !== documentId) {
    // A document reload changes its clock, not the physical mouse position.
    events.push({
      ...previousPointer,
      documentId,
      time: await browserTime(page),
      click: false,
    })
  }
  const source: CaptureSource = { directory, documentId, frames: [], events }
  const samples = new Map<number, number>()
  const tag = (captureNumber % 255) + 1
  const binding = `__mnfFrame${captureNumber++}`
  await page.exposeBinding(
    binding,
    (_source, sample: { id: number; time: number }) => {
      samples.set(sample.id, sample.time)
    },
  )
  // An in-picture frame ID survives CDP wall-clock jumps and asynchronous JPEG
  // delivery. Its 128×8 CSS-pixel strip is entirely outside the final crop.
  await page.evaluate(
    ({ binding, tag }) => {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 8
      Object.assign(canvas.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '128px',
        height: '8px',
        zIndex: '2147483647',
        pointerEvents: 'none',
      })
      canvas.setAttribute('aria-hidden', 'true')
      document.documentElement.append(canvas)
      const ctx = canvas.getContext('2d')!
      const send = Reflect.get(window, binding) as (sample: {
        id: number
        time: number
      }) => Promise<void>
      const pending = new Set<Promise<void>>()
      let id = 0,
        raf = 0
      const marker = {
        draw() {
          id++
          if (id >= 2 ** 16) throw new Error('Recording frame marker exhausted')
          const value = (0xa500 + tag) * 2 ** 16 + id
          for (let bit = 0; bit < 32; bit++) {
            ctx.fillStyle =
              Math.floor(value / 2 ** (31 - bit)) % 2 ? '#fff' : '#000'
            ctx.fillRect(bit * 4, 0, 4, 8)
          }
          const sent = send({ id, time: performance.now() / 1000 })
          pending.add(sent)
          void sent.then(() => pending.delete(sent))
          raf = requestAnimationFrame(() => marker.draw())
        },
      }
      window.__mnfStopMarker = async () => {
        cancelAnimationFrame(raf)
        await Promise.all(pending)
        canvas.remove()
      }
      marker.draw()
    },
    { binding, tag },
  )
  const session = await context.newCDPSession(page)
  const pending = new Set<Promise<void>>()
  let failure: unknown
  let stopping = false
  let ready = false
  let firstResolve: () => void, firstReject: (error: unknown) => void
  const first = new Promise<void>((resolve, reject) => {
    firstResolve = resolve
    firstReject = reject
  })
  const timeout = setTimeout(
    () =>
      firstReject(
        new Error('Chromium produced no recording frames within 15 seconds.'),
      ),
    15000,
  )
  const onFrame = (event: { data: string; sessionId: number }) => {
    const file = `${String(source.frames.length).padStart(6, '0')}.jpg`
    source.frames.push({ file, time: 0 })
    const saved = (async () => {
      try {
        await writeFile(
          path.join(directory, file),
          Buffer.from(event.data, 'base64'),
        )
        if (
          !ready &&
          markerId(await markerStrip(path.join(directory, file)), tag) !==
            undefined
        ) {
          ready = true
          firstResolve()
        }
        await session.send('Page.screencastFrameAck', {
          sessionId: event.sessionId,
        })
      } catch (error) {
        if (!stopping || (error instanceof Error && 'code' in error))
          failure ??= error
        firstReject(error)
      }
    })()
    pending.add(saved)
    void saved.then(() => pending.delete(saved))
  }
  session.on('Page.screencastFrame', onFrame)
  const finishStop = async () => {
    stopping = true
    try {
      await session.send('Page.stopScreencast')
    } finally {
      session.off('Page.screencastFrame', onFrame)
      await Promise.all(pending)
      await session.detach()
      assert.equal(
        await page.evaluate(() => window.__mnfDocumentId),
        documentId,
        'Stop the shot before a full document navigation.',
      )
      await page.evaluate(() => window.__mnfStopMarker?.())
    }
    if (failure) throw failure
    const strip = await markerStrip(path.join(directory, '%06d.jpg'))
    let sawMarker = false
    assert.equal(strip.length, source.frames.length * 32)
    source.frames = source.frames
      .flatMap((frame, index) => {
        const bits = strip.subarray(index * 32, (index + 1) * 32)
        const id = markerId(bits, tag)
        // Chromium may send its cached pre-marker image as initial preroll.
        if (id === undefined && !sawMarker) return []
        assert.ok(id !== undefined, 'Captured frame marker is unreadable.')
        sawMarker = true
        const time = samples.get(id)
        assert.ok(
          time !== undefined,
          'Captured frame has no monotonic timestamp.',
        )
        return [{ file: frame.file, time }]
      })
      .sort((a, b) => a.time - b.time)
    source.events = events.filter((event) => event.documentId === documentId)
  }
  let stopped: Promise<void> | undefined
  const stop = () => (stopped ??= finishStop())
  try {
    await Promise.all([
      session.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 100,
        maxWidth: captureResolution.width,
        maxHeight: captureResolution.height,
        everyNthFrame: 1,
      }),
      first,
    ])
    return {
      source,
      stop,
      assertHealthy() {
        if (failure) throw failure
      },
    }
  } catch (error) {
    await stop().catch(() => {})
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

// These inverse mappings are shared by the image sampler and cursor exporter.
// Only an overlong shot is sped up; its page-turn tail keeps real-time playback.
export const sourceTime = (clip: ClipTiming, frame: number) =>
  frame < clip.duration * FPS
    ? clip.start + (frame * (clip.end - clip.start)) / (clip.duration * FPS)
    : clip.end + (frame - clip.duration * FPS) / FPS
export const outputFrame = (clip: ClipTiming, time: number) =>
  time < clip.end
    ? ((time - clip.start) * clip.duration * FPS) / (clip.end - clip.start)
    : clip.duration * FPS + (time - clip.end) * FPS

export function cursorForClip(
  source: Pick<CaptureSource, 'events'> &
    Partial<Pick<CaptureSource, 'frames'>>,
  clip: ClipTiming,
  frames: number,
): CursorPoint[] {
  const events = [...source.events].sort((a, b) => a.time - b.time)
  assert.ok(
    events.every((event) =>
      [event.x, event.y, event.time].every(Number.isFinite),
    ),
    'Pointer coordinates and timestamps must be finite.',
  )
  assert.ok(
    events
      .filter(
        (event) =>
          event.click && event.time >= clip.start && event.time < clip.end,
      )
      .every((event) => event.time <= sourceTime(clip, frames - 1)),
    'The final click needs a trailing hold before the shot ends.',
  )
  const selected = source.frames
    ? sampledFrames(source.frames, clip, frames)
    : undefined
  const at = (time: number) =>
    selected
      ? selected.findIndex((frame) => frame.time >= time)
      : outputFrame(clip, time)
  assert.ok(
    events
      .filter(
        (event) =>
          event.click && event.time >= clip.start && event.time < clip.end,
      )
      .every((event) => at(event.time) >= 0),
    'Capture must include a painted frame after every click.',
  )
  const initial = events.findLast((event) => event.time <= clip.start)
  assert.ok(initial, 'A recording must start with a known pointer position.')
  return [
    {
      at: 0,
      ...toCanvas(initial),
      click: false,
      hidden: initial.hidden,
      hiddenAt: initial.hidden ? -FPS : undefined,
    },
    ...events
      .filter(
        (event) =>
          event.time >= clip.start &&
          event.time <= sourceTime(clip, frames - 1) &&
          at(event.time) >= 0,
      )
      .map((event) => ({
        at: at(event.time),
        ...toCanvas(event),
        click: event.click,
        hidden: event.hidden,
        hiddenAt: event.hidden ? at(event.time) : undefined,
      })),
  ]
}

export async function probe(file: string): Promise<MediaProbe> {
  return JSON.parse(
    (
      await exec('ffprobe', [
        '-v',
        'error',
        '-show_streams',
        '-show_format',
        '-of',
        'json',
        file,
      ])
    ).stdout,
  )
}

export function sampledFrames(
  images: CaptureSource['frames'],
  clip: ClipTiming,
  count: number,
) {
  let index = 0
  return Array.from({ length: count }, (_, frame) => {
    while (images[index + 1]?.time <= sourceTime(clip, frame)) index++
    return images[index]
  })
}

export async function encodeClip(
  source: CaptureSource,
  clip: ClipTiming,
  frames: number,
  output: string,
) {
  assert.ok(Number.isInteger(frames) && frames > 0 && clip.end > clip.start)
  assert.ok(source.frames.length > 0 && source.frames[0].time <= clip.start)
  const info = (await probe(path.join(source.directory, source.frames[0].file)))
    .streams[0]
  assert.equal(
    info.width,
    captureResolution.width,
    'Capture must retain device-scale resolution.',
  )
  assert.equal(info.height, captureResolution.height)
  const list = path.join(source.directory, `${path.basename(output)}.ffconcat`)
  const lines = ['ffconcat version 1.0']
  for (const image of sampledFrames(source.frames, clip, frames)) {
    lines.push(`file '${image.file}'`, `option framerate ${FPS}`)
  }
  await writeFile(list, lines.join('\n'))
  await mkdir(path.dirname(output), { recursive: true })
  await exec(
    'ffmpeg',
    [
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
      '-vf',
      'scale=2560:1600:flags=lanczos:in_range=full:out_range=limited:in_color_matrix=bt601:out_color_matrix=bt709,crop=2560:1440:0:80,setsar=1',
      '-frames:v',
      String(frames),
      '-r',
      String(FPS),
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
      '-movflags',
      '+faststart',
      output,
    ],
    { maxBuffer: 2_000_000 },
  )
  const encoded = (await probe(output)).streams[0]
  assert.equal(Number(encoded.nb_frames), frames)
  assert.equal(encoded.width, 2560)
  assert.equal(encoded.height, 1440)
  return cursorForClip(source, clip, frames)
}
