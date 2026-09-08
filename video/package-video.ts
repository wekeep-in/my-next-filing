import { probe } from './browser-recorder.ts'
import assert from 'node:assert/strict'
import { AUDIO_DURATION, DURATION, FPS, timelineTime } from './src/timeline.ts'
import { execFile } from 'node:child_process'
import {
  copyFile,
  mkdir,
  readFile,
  rename,
  stat,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const exec = promisify(execFile)
const root = path.dirname(fileURLToPath(import.meta.url))
const recordings: { portalCapturePending?: boolean } = JSON.parse(
  await readFile(path.join(root, 'src/recordings.json'), 'utf8'),
)
assert.ok(
  !recordings.portalCapturePending,
  'The portal capture is pending; do not publish this draft.',
)
const master = path.join(root, 'out/my-next-filing-demo-v3-sfx-1080p.mp4')
const stage = path.join(root, 'out/website-video')
const destination = path.resolve(root, '../public/video')
assert.ok(
  (await stat(master)).mtimeMs >=
    (await stat(path.join(root, 'src/recordings.json'))).mtimeMs,
  'Render the current recording before packaging.',
)
const info = await probe(master)
const video = info.streams.find((stream) => stream.codec_type === 'video')
assert.ok(video)
assert.equal(video.width, 1920)
assert.equal(video.height, 1080)
assert.equal(Number(video.nb_frames), DURATION)
assert.equal(video.color_space, 'bt709')
assert.ok(Math.abs(Number(info.format.duration) - AUDIO_DURATION) < 0.1)

await mkdir(stage, { recursive: true })
await copyFile(
  path.join(root, 'subtitles.en.vtt'),
  path.join(stage, 'my-next-filing.en.vtt'),
)
await exec('ffmpeg', [
  '-v',
  'error',
  '-y',
  '-i',
  path.join(root, 'subtitles.en.vtt'),
  path.join(root, 'out/my-next-filing-demo-v3-sfx-1080p.en.srt'),
])
await copyFile(
  path.join(root, 'subtitles.en.vtt'),
  path.join(root, 'out/my-next-filing-demo-v3-sfx-1080p.en.vtt'),
)
// Hold on the plan before its callouts, without burned-in captions.
await exec('ffmpeg', [
  '-v',
  'error',
  '-y',
  '-ss',
  String(timelineTime(34.2)),
  '-i',
  master,
  '-vf',
  'scale=in_range=limited:out_range=full:in_color_matrix=bt709:out_color_matrix=bt601',
  '-pix_fmt',
  'yuvj444p',
  '-frames:v',
  '1',
  '-q:v',
  '2',
  path.join(stage, 'my-next-filing-poster.jpg'),
])

const variants = [
  {
    name: '1080p',
    width: 1920,
    height: 1080,
    crf: 18,
    rate: 5000,
    level: '4.0',
    avc: '640028',
  },
  {
    name: '720p',
    width: 1280,
    height: 720,
    crf: 20,
    rate: 2800,
    level: '3.1',
    avc: '64001f',
  },
  {
    name: '480p',
    width: 854,
    height: 480,
    crf: 22,
    rate: 1400,
    level: '3.1',
    avc: '64001f',
  },
]
const playlists = []
for (const variant of variants) {
  const folder = path.join(stage, `hls/v${variant.name}`)
  await mkdir(folder, { recursive: true })
  const playlist = path.join(folder, 'index.m3u8')
  await exec(
    'ffmpeg',
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      master,
      '-map',
      '0:v:0',
      '-map',
      '0:a:0',
      '-vf',
      `scale=${variant.width}:${variant.height}:flags=lanczos,setsar=1`,
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-threads',
      '8',
      '-crf',
      String(variant.crf),
      '-maxrate',
      `${variant.rate}k`,
      '-bufsize',
      `${variant.rate * 2}k`,
      '-profile:v',
      'high',
      '-level:v',
      variant.level,
      '-pix_fmt',
      'yuv420p',
      '-r',
      '30',
      '-g',
      '180',
      '-keyint_min',
      '180',
      '-sc_threshold',
      '0',
      '-flags',
      '+cgop',
      '-force_key_frames',
      'expr:gte(t,n_forced*6)',
      '-color_range',
      'tv',
      '-colorspace',
      'bt709',
      '-color_primaries',
      'bt709',
      '-color_trc',
      'bt709',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-ar',
      '48000',
      '-f',
      'hls',
      '-hls_time',
      '6',
      '-hls_playlist_type',
      'vod',
      '-hls_flags',
      'independent_segments',
      '-hls_segment_filename',
      path.join(folder, 'segment%03d.ts'),
      playlist,
    ],
    { maxBuffer: 2_000_000 },
  )
  const text = await readFile(playlist, 'utf8')
  assert.ok(text.includes('#EXT-X-ENDLIST'))
  assert.ok(text.includes('#EXT-X-INDEPENDENT-SEGMENTS'))
  const segments = [...text.matchAll(/#EXTINF:([\d.]+),\n([^\n]+)/g)]
  assert.equal(segments.length, Math.ceil(DURATION / FPS / 6))
  const lengths = segments.map((match) => Number(match[1]))
  assert.ok(lengths.slice(0, -1).every((duration) => duration === 6))
  const duration = lengths.reduce((sum, value) => sum + value, 0)
  assert.ok(Math.abs(duration - DURATION / FPS) < 0.001)
  const sizes = await Promise.all(
    segments.map(
      async (match) => (await stat(path.join(folder, match[2]))).size,
    ),
  )
  const peak = Math.ceil(
    Math.max(...sizes.map((bytes, i) => (bytes * 8) / lengths[i])) * 1.1,
  )
  const average = Math.ceil(
    (sizes.reduce((sum, value) => sum + value, 0) * 8) / duration,
  )
  const rendition = (await probe(playlist)).streams.find(
    (stream) => stream.codec_type === 'video',
  )
  assert.ok(rendition)
  assert.equal(rendition.width, variant.width)
  assert.equal(rendition.height, variant.height)
  assert.equal(rendition.color_space, 'bt709')
  await exec('ffmpeg', ['-v', 'error', '-i', playlist, '-f', 'null', '-'], {
    maxBuffer: 2_000_000,
  })
  playlists.push(
    `#EXT-X-STREAM-INF:BANDWIDTH=${peak},AVERAGE-BANDWIDTH=${average},RESOLUTION=${variant.width}x${variant.height},FRAME-RATE=30.000,CODECS="avc1.${variant.avc},mp4a.40.2",SUBTITLES="subs",CLOSED-CAPTIONS=NONE\nhls/v${variant.name}/index.m3u8`,
  )
  console.log(
    `Verified ${variant.name}: ${segments.length} aligned segments, ${Math.round(sizes.reduce((a, b) => a + b, 0) / 1e6)} MB`,
  )
}
// Let HLS own the captions: its manifest-loading reset clears external HTML track cues.
const subtitles = path.join(stage, 'hls/subtitles')
await mkdir(subtitles, { recursive: true })
const firstSegment = await probe(path.join(stage, 'hls/v1080p/segment000.ts'))
const firstPts = firstSegment.streams.find(
  (stream) => stream.codec_type === 'video',
)?.start_pts
assert.ok(Number.isFinite(firstPts))
const vtt = await readFile(path.join(root, 'subtitles.en.vtt'), 'utf8')
await writeFile(
  path.join(subtitles, 'en.vtt'),
  vtt.replace(
    'WEBVTT\n',
    `WEBVTT\nX-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:${firstPts}\n`,
  ),
)
await writeFile(
  path.join(subtitles, 'en.m3u8'),
  `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:${Math.ceil(DURATION / FPS)}\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXTINF:${(DURATION / FPS).toFixed(6)},\nen.vtt\n#EXT-X-ENDLIST\n`,
)
await writeFile(
  path.join(stage, 'my-next-filing.m3u8'),
  `#EXTM3U\n#EXT-X-VERSION:6\n#EXT-X-INDEPENDENT-SEGMENTS\n#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",LANGUAGE="en",AUTOSELECT=YES,DEFAULT=YES,FORCED=NO,CHARACTERISTICS="public.accessibility.transcribes-spoken-dialog",URI="hls/subtitles/en.m3u8"\n${playlists.join('\n')}\n`,
)
await copyFile(
  path.join(stage, 'my-next-filing-poster.jpg'),
  path.join(root, 'out/my-next-filing-poster.jpg'),
)

// Install only after every rendition decodes; retain the exact previous website assets.
const backup = path.join(root, `out/previous-website-video-${Date.now()}`)
await rename(destination, backup)
try {
  await rename(stage, destination)
} catch (error) {
  await rename(backup, destination)
  throw error
}
console.log(
  `Website video installed at ${destination}; previous assets retained at ${backup}`,
)
