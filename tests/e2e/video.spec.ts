import { readFileSync } from 'node:fs'
import { expect, test } from './fixtures'

test('plays the walkthrough with English captions under the deployed CSP', async ({
  page,
}) => {
  const canPlayHls = await page.evaluate(
    () =>
      Boolean(
        document
          .createElement('video')
          .canPlayType('application/vnd.apple.mpegurl'),
      ) || MediaSource.isTypeSupported('video/mp4; codecs="avc1.640028"'),
  )
  test.skip(canPlayHls === false, 'This browser build has no HLS/H.264 decoder')
  const policy = readFileSync('dist/_headers', 'utf8')
    .split('\n')
    .find((line) => line.trim().startsWith('Content-Security-Policy:'))
    ?.split('Content-Security-Policy:')[1]
    .trim()
  if (!policy) throw new Error('Production CSP is missing')
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('/', async (route) => {
    const response = await route.fetch()
    await route.fulfill({
      response,
      headers: { ...response.headers(), 'content-security-policy': policy },
    })
  })
  await page.goto('/', { waitUntil: 'networkidle' })
  const video = page.locator('mux-player video')
  await expect(video).toBeVisible()
  await video.evaluate(async (element: HTMLVideoElement) => {
    element.muted = true
    await element.play()
  })
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeGreaterThan(1)
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) =>
        Array.from(element.textTracks).some(
          (track) =>
            track.language === 'en' &&
            track.mode === 'showing' &&
            Boolean(track.cues?.length),
        ),
      ),
    )
    .toBe(true)
  expect(errors).toEqual([])
})
