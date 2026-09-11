import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { probe } from './browser-recorder.ts'
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
const chapters = [
  {
    id: 'profile-demo',
    title: 'The person behind the income',
    ids: ['fit', 'income', 'clients', 'taxes'],
  },
  {
    id: 'plan-demo',
    title: 'From answers to a plan',
    ids: ['plan'],
  },
  {
    id: 'workspace-demo',
    title: 'Come back and see what remains',
    ids: ['workspace'],
  },
] as const

export async function assemblePitchRecordings(clips: PitchRecording[]) {
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
        inputs.push('-threads', '2', '-i', file)
        filters.push(`[${index}:v]setpts=PTS-STARTPTS[v${index}]`)
        cursor.push(
          ...clip.cursor.map((p) => ({
            ...p,
            at: frames + p.at,
            ...(p.hiddenAt === undefined
              ? {}
              : { hiddenAt: frames + p.hiddenAt }),
          })),
        )
        frames += clip.frames
        console.log(
          `${id}: ${(clip.frames / 30).toFixed(2)}s, including reading holds`,
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
