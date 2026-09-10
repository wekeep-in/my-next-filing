import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { probe } from './browser-recorder.ts'
import { cursorAt } from './src/cursor.ts'
import type { CursorPoint } from './src/cursor.ts'

const exec = promisify(execFile)
export type PitchRecording = {
  id: string
  title: string
  frames: number
  cursor: CursorPoint[]
  video: string
  poster: string
}
type Range = readonly [number, number]

// Collapse only jointly idle footage and cursor intervals. Keep both ends so
// the final state survives; protect the full 24-frame click ripple as well.
export function compactTimeline(clip: PitchRecording, frozen: Range[]) {
  const idle = Array<boolean>(clip.frames).fill(false)
  for (const [start, end] of frozen)
    idle.fill(true, Math.max(0, start), Math.min(clip.frames, end))
  clip.cursor.forEach((point, index) => {
    const previous = clip.cursor[Math.max(0, index - 1)]
    if (
      point.x !== previous.x ||
      point.y !== previous.y ||
      point.hidden !== previous.hidden
    )
      idle.fill(
        false,
        Math.max(0, Math.floor(previous.at)),
        Math.ceil(point.at) + 1,
      )
    if (point.click)
      idle.fill(false, Math.floor(point.at), Math.ceil(point.at) + 25)
  })
  const keep = Array<boolean>(clip.frames).fill(true)
  for (let start = 0; start < idle.length;) {
    if (!idle[start]) {
      start++
      continue
    }
    let end = start + 1
    while (idle[end]) end++
    if (end - start > 12) keep.fill(false, start + 6, end - 6)
    start = end
  }
  const ranges: Range[] = []
  for (let start = 0; start < keep.length;) {
    if (!keep[start]) {
      start++
      continue
    }
    let end = start + 1
    while (keep[end]) end++
    ranges.push([start, end])
    start = end
  }
  let frames = 0
  const cursor: CursorPoint[] = []
  for (const [start, end] of ranges) {
    const initial = cursorAt(clip.cursor, start).position
    if (initial) cursor.push({ ...initial, at: frames, click: false })
    cursor.push(
      ...clip.cursor
        .filter((p) => p.at >= start && p.at < end)
        .map((p) => ({
          ...p,
          at: frames + p.at - start,
          ...(p.hiddenAt === undefined
            ? {}
            : { hiddenAt: frames + p.hiddenAt - start }),
        })),
    )
    frames += end - start
  }
  assert.equal(
    cursor.filter((p) => p.click).length,
    clip.cursor.filter((p) => p.click).length,
  )
  return { ranges, frames, cursor }
}

const chapters = [
  {
    id: 'profile-demo',
    title: 'The person behind the income',
    ids: ['clients', 'salary', 'interest', 'rent', 'equity'],
  },
  {
    id: 'plan-demo',
    title: 'From answers to a plan',
    ids: ['calculate', 'action', 'why', 'sources', 'calculation', 'agenda'],
  },
  {
    id: 'workspace-demo',
    title: 'Come back and see what remains',
    ids: ['save', 'return', 'payment', 'complete'],
  },
] as const

export async function compactPitchRecordings(clips: PitchRecording[]) {
  const directory = await mkdtemp(path.join(tmpdir(), 'mnf-pitch-'))
  const results: PitchRecording[] = []
  try {
    for (const chapter of chapters) {
      const inputs: string[] = [],
        filters: string[] = [],
        cursor: CursorPoint[] = []
      let frames = 0
      for (const [index, id] of chapter.ids.entries()) {
        const clip = clips.find((clip) => clip.id === id)
        assert.ok(clip, `Missing recording: ${id}`)
        const file = path.resolve(`public${clip.video}`)
        const { stderr } = await exec('ffmpeg', [
          '-hide_banner',
          '-threads',
          '2',
          '-i',
          file,
          '-vf',
          'freezedetect=n=-60dB:d=0.3',
          '-an',
          '-f',
          'null',
          '-',
        ])
        const frozen: Range[] = []
        let start: number | undefined
        for (const match of stderr.matchAll(/freeze_(start|end): ([\d.]+)/g)) {
          if (match[1] === 'start') start = Math.ceil(Number(match[2]) * 30)
          else if (start !== undefined) {
            frozen.push([start, Math.floor(Number(match[2]) * 30)])
            start = undefined
          }
        }
        if (start !== undefined) frozen.push([start, clip.frames])
        const edit = compactTimeline(clip, frozen)
        inputs.push('-threads', '2', '-i', file)
        filters.push(
          `[${index}:v]select='${edit.ranges.map(([a, b]) => `between(n,${a},${b - 1})`).join('+')}',setpts=N/(30*TB)[v${index}]`,
        )
        cursor.push(
          ...edit.cursor.map((p) => ({
            ...p,
            at: frames + p.at,
            ...(p.hiddenAt === undefined
              ? {}
              : { hiddenAt: frames + p.hiddenAt }),
          })),
        )
        frames += edit.frames
        console.log(
          `${id}: ${(clip.frames / 30).toFixed(2)}s → ${(edit.frames / 30).toFixed(2)}s`,
        )
      }
      filters.push(
        `${chapter.ids.map((_, i) => `[v${i}]`).join('')}concat=n=${chapter.ids.length}:v=1:a=0[out]`,
      )
      const video = path.join(directory, `${chapter.id}.mp4`)
      await exec('ffmpeg', [
        '-v',
        'error',
        '-y',
        ...inputs,
        '-filter_complex_threads',
        '2',
        '-filter_complex',
        filters.join(';'),
        '-map',
        '[out]',
        '-an',
        '-r',
        '30',
        '-c:v',
        'libx264',
        '-threads',
        '2',
        '-preset',
        'fast',
        '-crf',
        '18',
        '-pix_fmt',
        'yuv420p',
        '-colorspace',
        'bt709',
        '-movflags',
        '+faststart',
        video,
      ])
      const media = await probe(video)
      assert.equal(
        Number(media.streams.find((s) => s.codec_type === 'video')?.nb_frames),
        frames,
      )
      const last = clips.find((clip) => clip.id === chapter.ids.at(-1))!
      await copyFile(
        `public${last.poster}`,
        path.join(directory, `${chapter.id}.jpg`),
      )
      results.push({
        id: chapter.id,
        title: chapter.title,
        frames,
        cursor,
        video: `/pitch/${chapter.id}.mp4`,
        poster: `/pitch/${chapter.id}.jpg`,
      })
    }
    await mkdir('public/pitch', { recursive: true })
    for (const clip of results) {
      await copyFile(
        path.join(directory, `${clip.id}.mp4`),
        `public${clip.video}`,
      )
      await copyFile(
        path.join(directory, `${clip.id}.jpg`),
        `public${clip.poster}`,
      )
    }
    return results
  } finally {
    await rm(directory, { recursive: true })
  }
}
