import { readFileSync } from 'node:fs'
import type { Page } from '@playwright/test'
import { expect, seedPersonal, stored, test } from './fixtures'
import recordings from '../../src/routes/pitch/recordings.json'

async function expectSlide(page: Page, slide: number) {
  await expect(page.locator('.pitch-stage')).toHaveAttribute(
    'aria-label',
    new RegExp(`^Slide ${slide} of 14:`),
  )
}

test('keeps complete videos and fallback posters inside their frames', async ({
  page,
}) => {
  for (const slide of [8, 9, 10]) {
    await page.goto(`/pitch#${slide}`)
    const media = page
      .locator('.pitch-stage .pitch-capture')
      .locator('video, img')
    await expect(media).toBeVisible()
    const frame = await page
      .locator('.pitch-stage .pitch-capture')
      .boundingBox()
    const picture = await media.boundingBox()
    expect(picture!.x).toBeGreaterThanOrEqual(frame!.x - 1)
    expect(picture!.y).toBeGreaterThanOrEqual(frame!.y - 1)
    expect(picture!.x + picture!.width).toBeLessThanOrEqual(
      frame!.x + frame!.width + 1,
    )
    expect(picture!.y + picture!.height).toBeLessThanOrEqual(
      frame!.y + frame!.height + 1,
    )
    expect(picture!.width / picture!.height).toBeCloseTo(16 / 9, 2)
    await expect(page.locator('.pitch-stage filter')).toHaveCount(0)
    await expect(
      page.locator(
        '.pitch-stage h1, .pitch-stage ul, .pitch-stage .pitch-slide-footer',
      ),
    ).toHaveCount(0)
    const ink = await page
      .locator('.pitch-stage')
      .evaluate((element) => getComputedStyle(element).color)
    await expect(page.locator('.pitch-stage .pitch-slide')).toHaveCSS(
      'background-color',
      ink,
    )
    await expect(page.locator('.pitch-stage .pitch-safari')).toBeVisible()
  }
})

test('navigates all slides without changing the saved workspace or draft', async ({
  page,
}) => {
  await seedPersonal(page, true)
  await page.goto('/pitch')
  const before = await stored(page)
  expect(before.local).not.toBeNull()
  expect(before.tab).not.toBeNull()
  const navigation = page.getByRole('navigation', {
    name: 'Slides',
    exact: true,
  })
  await expect(navigation.getByRole('button')).toHaveCount(14)
  await expect(navigation.locator('.pitch-preview')).toHaveCount(14)
  await expect(navigation.locator('video')).toHaveCount(0)
  const scrollArea = navigation.locator('[data-slot="scroll-area"]')
  const scrollbar = scrollArea.locator('[data-slot="scroll-area-scrollbar"]')
  await page.locator('.pitch-stage').hover()
  await expect(scrollbar).toHaveCSS('opacity', '0')
  await scrollArea.hover()
  await expect(scrollbar).toHaveCSS('opacity', '1')
  await page.mouse.wheel(0, 100)
  await page.locator('.pitch-stage').hover()
  await expect(scrollbar).toHaveCSS('opacity', '0')
  await expect(page.getByRole('link', { name: 'Download script' })).toHaveCount(
    0,
  )
  await expect(page.locator('.pitch-controls')).not.toContainText('Present')
  const privacySlide = navigation.getByRole('button', {
    name: 'Slide 12: No financial data uploads. No third-party APIs. No web analytics.',
    exact: true,
  })
  await privacySlide.click()
  await expect(privacySlide).toHaveAttribute('aria-current', 'step')
  await expect(
    page.getByRole('complementary', { name: 'Speaker notes' }),
  ).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Open the app' })).toHaveCount(0)
  await expect(page.locator('.pitch-stage')).toContainText(
    'No financial data uploads.',
  )
  expect(
    await page.locator('.pitch-page').evaluate((element) => element.scrollTop),
  ).toBe(0)
  await expect(
    page.locator('.pitch-keyboard-help [data-slot="kbd"]'),
  ).toHaveCount(6)
  await navigation
    .getByRole('button', {
      name: 'Slide 1: When is my next tax filing?',
      exact: true,
    })
    .click()
  await expect(page.locator('.pitch-stage')).toHaveAttribute(
    'aria-label',
    /^Slide 1 of 14/,
  )
  await page.keyboard.press('ArrowLeft')
  await expectSlide(page, 1)
  for (let slide = 2; slide <= 14; slide++) {
    await page.keyboard.press('ArrowRight')
    await expectSlide(page, slide)
  }
  await page.keyboard.press('ArrowRight')
  await expectSlide(page, 14)
  await page.reload()
  await expectSlide(page, 14)
  await page.goto('/pitch#15')
  await expectSlide(page, 1)
  await page.keyboard.press('Home')
  await expectSlide(page, 1)
  await page.getByRole('button', { name: 'Next slide', exact: true }).click()
  await expect(page).toHaveURL(/\/pitch#2$/)
  await page.reload()
  await expectSlide(page, 2)
  expect(await stored(page)).toEqual(before)
  await expect(page.locator('.pitch-stage audio')).toHaveCount(0)
})

test('plays chapters with end holds and replay, or shows stills without an MP4 decoder', async ({
  page,
  baseURL,
}) => {
  test.setTimeout(
    recordings.reduce((ms, clip) => ms + (clip.frames * 1000) / 30, 60000),
  )
  const canPlay = await page.evaluate(() =>
    Boolean(document.createElement('video').canPlayType('video/mp4')),
  )
  const policy = readFileSync('dist/_headers', 'utf8')
    .split('\n')
    .find((line) => line.trim().startsWith('Content-Security-Policy:'))
    ?.split('Content-Security-Policy:')[1]
    .trim()
  if (!policy) throw new Error('Production CSP is missing')
  const outside: string[] = []
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/*', async (route) => {
    if (new URL(route.request().url()).origin !== new URL(baseURL!).origin) {
      outside.push(route.request().url())
      await route.abort()
    } else if (route.request().isNavigationRequest()) {
      const response = await route.fetch()
      await route.fulfill({
        response,
        headers: { ...response.headers(), 'content-security-policy': policy },
      })
    } else await route.continue()
  })
  for (const [slide, chapter] of [
    [8, 'profile-demo'],
    [9, 'plan-demo'],
    [10, 'workspace-demo'],
  ] as const) {
    await page.goto(`/pitch#${slide}`)
    const video = page.locator('.pitch-stage video')
    if (!canPlay) {
      await expect(
        page.locator('.pitch-stage .pitch-media-error'),
      ).toBeVisible()
      await expect(
        page.locator('.pitch-stage .pitch-capture img'),
      ).toBeVisible()
      await expect(video).toHaveCount(0)
      await expectSlide(page, slide)
      continue
    }
    await expect(video).toHaveCount(1)
    await expect
      .poll(() =>
        video.evaluate((element: HTMLVideoElement) => element.currentTime),
      )
      .toBeGreaterThan(0.3)
    await expect(video).toHaveJSProperty('muted', true)
    const pixels = () =>
      video.evaluate((element: HTMLVideoElement) => {
        const canvas = document.createElement('canvas')
        canvas.width = 160
        canvas.height = 90
        const context = canvas.getContext('2d')!
        context.drawImage(element, 0, 0, 160, 90)
        return context
          .getImageData(0, 0, 160, 90)
          .data.reduce(
            (sum, value, index) => (sum + value * (index + 1)) >>> 0,
            0,
          )
      })
    const opening = await pixels()
    await expect.poll(pixels, { timeout: 3000 }).not.toBe(opening)
    const src = await video.getAttribute('src')
    await expect(page.locator('.pitch-stage .pitch-capture')).toHaveAttribute(
      'data-clip',
      chapter,
    )
    await expect(
      page.getByRole('button', { name: 'Play slide', exact: true }),
    ).toBeVisible({
      timeout:
        (recordings.find((clip) => clip.id === chapter)!.frames * 1000) / 30 +
        15000,
    })
    await expectSlide(page, slide)
    await expect(page.locator('.pitch-stage audio')).toHaveCount(0)
    await expect(page.locator('.pitch-stage .pitch-media-error')).toHaveCount(0)
    await page
      .getByRole('button', { name: 'Replay slide', exact: true })
      .click()
    await expect(page.locator('.pitch-stage .pitch-capture')).toHaveAttribute(
      'data-clip',
      chapter,
    )
    await page.getByRole('button', { name: 'Pause slide', exact: true }).click()
    await expect(video).toHaveJSProperty('paused', true)
    await expect(video).toHaveAttribute('src', src!)
  }
  expect(outside).toEqual([])
  expect(errors).toEqual([])
})

test('keeps reduced-motion slides still and fits desktop, tablet and mobile', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [width, height] of [
    [1920, 1080],
    [1920, 900],
    [1440, 800],
    [1600, 800],
    [1024, 768],
    [390, 844],
    [320, 740],
  ]) {
    await page.setViewportSize({ width, height })
    await page.goto('/pitch#8')
    await expect(
      page.getByRole('button', { name: 'Play slide', exact: true }),
    ).toBeVisible()
    await expect(page.locator('.pitch-stage video')).toHaveCount(0)
    await expect(page.locator('.pitch-stage img')).toHaveCount(1)
    await page.evaluate(() => document.fonts.ready)
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    const bounds = await page.locator('.pitch-stage').boundingBox()
    expect(bounds).not.toBeNull()
    if (width >= 900) {
      const navigation = await page.locator('.pitch-navigation').boundingBox()
      expect(navigation!.width).toBeLessThanOrEqual(240)
      const workspace = await page.locator('.pitch-workspace').boundingBox()
      const preview = await page.locator('.pitch-preview').first().boundingBox()
      expect(preview!.width).toBeGreaterThan(navigation!.width - 40)
      expect(navigation!.x + navigation!.width).toBeLessThanOrEqual(
        workspace!.x,
      )
      const deck = await page.locator('.pitch-page').boundingBox()
      expect(workspace!.x + workspace!.width).toBe(deck!.x + deck!.width)
      expect(bounds!.width).toBeGreaterThan(width / 3)
      expect(bounds!.x).toBe(workspace!.x)
      expect(bounds!.y).toBe(workspace!.y)
      expect(bounds!.width).toBe(workspace!.width)
      await expect(page.locator('.pitch-stage')).toHaveCSS(
        'border-radius',
        '0px',
      )
      const row = await page.locator('.pitch-control-row').boundingBox()
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(row!.y + 1)
      expect(
        Math.abs(row!.y + row!.height - workspace!.y - workspace!.height),
      ).toBeLessThan(1)
      await expect(page.locator('.pitch-control-row')).toHaveCSS(
        'border-top-width',
        '1px',
      )
      const controls = await page.locator('.pitch-controls').boundingBox()
      const shortcuts = await page.locator('.pitch-keyboard-help').boundingBox()
      expect(shortcuts!.x).toBeGreaterThan(controls!.x + controls!.width)
      expect(
        Math.abs(
          controls!.y +
            controls!.height / 2 -
            shortcuts!.y -
            shortcuts!.height / 2,
        ),
      ).toBeLessThan(2)
    } else {
      expect(bounds!.width).toBeGreaterThan(width - 100)
      expect(bounds!.width / bounds!.height).toBeCloseTo(16 / 9, 2)
    }
    await page.screenshot({ path: testInfo.outputPath(`pitch-${width}.png`) })
  }
  await page.getByRole('button', { name: 'Next slide', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expectSlide(page, 9)
  await expect(
    page.getByRole('button', { name: 'Next slide', exact: true }),
  ).toBeFocused()
})

test('enters fullscreen on supported browsers and explains a rejected request', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/pitch')
  if (browserName === 'chromium') {
    await page
      .getByRole('button', { name: 'Enter fullscreen', exact: true })
      .click()
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement?.className))
      .toBe('pitch-stage-wrap')
    for (let slide = 1; slide <= 14; slide++) {
      if (slide > 1) await page.keyboard.press('ArrowRight')
      await expectSlide(page, slide)
      const color = await page
        .locator(`.pitch-stage .pitch-slide[data-slide="${slide}"]`)
        .evaluate((element) => getComputedStyle(element).backgroundColor)
      await expect(page.locator('.pitch-stage-wrap')).toHaveCSS(
        'background-color',
        color,
      )
      await expect(page.locator('.pitch-stage')).toHaveCSS(
        'background-color',
        color,
      )
    }
    await page.keyboard.press('Home')
    await expectSlide(page, 1)
    await page.keyboard.press('ArrowRight')
    await expectSlide(page, 2)
    await page.keyboard.press('ArrowRight')
    await expectSlide(page, 3)
    await expect(page.locator('.pitch-stage .pitch-word-cloud')).toBeVisible()
    await expect(page.locator('.pitch-stage .pitch-slide-footer')).toHaveCount(
      0,
    )
    const background = await page
      .locator('.pitch-stage')
      .evaluate((element) => getComputedStyle(element).backgroundColor)
    await expect(page.locator('.pitch-stage-wrap')).toHaveCSS(
      'background-color',
      background,
    )
    const stage = await page.locator('.pitch-stage').boundingBox()
    expect(stage!.width / stage!.height).toBeCloseTo(16 / 9, 2)
    await page.keyboard.press('f')
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement === null))
      .toBe(true)
  }
  await page.locator('.pitch-stage-wrap').evaluate((element) => {
    element.requestFullscreen = () =>
      Promise.reject(new Error('Synthetic fullscreen denial'))
  })
  await page
    .getByRole('button', { name: 'Enter fullscreen', exact: true })
    .click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Fullscreen could not start' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Next slide', exact: true }).click()
  await expectSlide(page, browserName === 'chromium' ? 4 : 2)
})

test('shows the narrative visuals and controls the animated Codex terminal', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [slide, title] of [
    [1, 'When is my next tax filing?'],
    [5, 'From notes to a tool.'],
    [14, 'Built for freelancers. By a freelancer.'],
    [11, 'And none of those answers were sent to us.'],
  ] as const) {
    await page.goto(`/pitch#${slide}`)
    const heading = page.locator('.pitch-stage h1')
    await expect(heading).toHaveText(title)
    await expect(heading).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(page.locator('.pitch-stage p')).toHaveCount(0)
    await expect(heading).toHaveCSS('font-size', '64px')
    const canvas = page.locator('.pitch-stage .pitch-slide')
    await expect(canvas).toHaveCSS('background-image', 'none')
    const ink = await page
      .locator('.pitch-stage')
      .evaluate((element) => getComputedStyle(element).color)
    await expect(canvas).toHaveCSS('background-color', ink)
  }
  await page.goto('/pitch#4')
  const portals = page.locator('.pitch-stage img')
  await expect(portals).toHaveCount(25)
  await expect
    .poll(() =>
      portals.evaluateAll((images) =>
        images.every(
          (image) =>
            image instanceof HTMLImageElement &&
            image.complete &&
            image.naturalWidth > 0,
        ),
      ),
    )
    .toBe(true)
  const mosaicFits = await portals.evaluateAll((images) => {
    const canvas = images[0].closest('.pitch-slide')!.getBoundingClientRect()
    const tiles = images.map((image) => image.getBoundingClientRect())
    return tiles.every(
      (tile, index) =>
        tile.left > canvas.left &&
        tile.right < canvas.right &&
        tile.top > canvas.top &&
        tile.bottom < canvas.bottom &&
        tiles
          .slice(index + 1)
          .every(
            (other) =>
              tile.right <= other.left ||
              tile.left >= other.right ||
              tile.bottom <= other.top ||
              tile.top >= other.bottom,
          ),
    )
  })
  expect(mosaicFits).toBe(true)
  await page.goto('/pitch#12')
  await expect(page.locator('.pitch-stage ul')).toHaveCSS(
    'list-style-type',
    'none',
  )
  await expect(page.locator('.pitch-stage li')).toHaveText([
    'Calculations in your browser.',
    'No third-party APIs.',
    'No web analytics.',
    'No financial data uploads.',
  ])
  await expect(
    page.locator('.pitch-stage li svg[aria-hidden="true"]'),
  ).toHaveCount(4)
  await expect(page.locator('.pitch-stage li').first()).toHaveCSS(
    'font-family',
    /Fraunces Variable/,
  )
  await expect(page.locator('.pitch-stage li').first()).toHaveCSS(
    'font-size',
    '48px',
  )
  await expect(page.locator('.pitch-stage h1, .pitch-stage p')).toHaveCount(0)
  await page.goto('/pitch#13')
  const terminal = page.locator('.pitch-stage .pitch-terminal')
  await expect(terminal).toBeVisible()
  await expect(page.locator('.pitch-stage h1')).toHaveText('Built with Codex')
  await expect(page.locator('.pitch-stage img')).toHaveCount(0)
  const canvas = await page.locator('.pitch-stage .pitch-slide').boundingBox()
  const panel = await terminal.boundingBox()
  const heading = await page.locator('.pitch-stage h1').boundingBox()
  expect(panel!.x + panel!.width / 2).toBeCloseTo(
    canvas!.x + canvas!.width / 2,
    0,
  )
  expect(panel!.y).toBeGreaterThan(heading!.y + heading!.height)
  expect(panel!.y + panel!.height).toBeGreaterThan(canvas!.y + canvas!.height)
  await expect(page.locator('.pitch-stage .pitch-slide')).toHaveCSS(
    'overflow',
    'hidden',
  )
  const check = terminal.locator('.pitch-terminal-check').first()
  await expect(check).toHaveCSS('opacity', '1')
  const code = terminal.locator('code')
  const still = await code.textContent()
  await page.getByRole('button', { name: 'Play slide', exact: true }).click()
  await expect.poll(() => code.textContent()).not.toBe(still)
  await expect(check).toHaveCSS('opacity', '1', { timeout: 10000 })
  await page.getByRole('button', { name: 'Pause slide', exact: true }).click()
  const paused = await code.textContent()
  await page.evaluate(async () => {
    for (let frame = 0; frame < 5; frame++)
      await new Promise(requestAnimationFrame)
  })
  await expect(code).toHaveText(paused!)
  await page.getByRole('button', { name: 'Replay slide', exact: true }).click()
  await expect(check).toHaveCSS('opacity', '0')
  const ink = await page
    .locator('.pitch-stage')
    .evaluate((element) => getComputedStyle(element).color)
  await expect(page.locator('.pitch-stage h1')).toHaveCSS(
    'color',
    'rgb(255, 255, 255)',
  )
  await expect(terminal).toHaveCSS('background-color', ink)
})
