import { expect, test } from './fixtures'

for (const width of [1440, 1024, 390, 320]) {
  test(`journey navigation preserves layout and keyboard behavior at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/check/income?example=1')
    const trigger = page.getByRole('button', { name: /^Show journey steps/ })
    const desktop = page.locator('.journey-nav > .journey-list')
    await expect(desktop).toBeAttached()
    await page.evaluate(() => document.fonts.ready)
    if (width > 1100) {
      await expect(trigger).toBeHidden()
      await expect(desktop).toBeVisible()
      return
    }
    await expect(desktop).toBeHidden()
    await expect(trigger).toBeVisible()
    const spacing = () =>
      page.evaluate(() =>
        Math.abs(
          document.querySelector('.journey-nav')!.getBoundingClientRect().top -
            document.querySelector('.top-bars')!.getBoundingClientRect().bottom,
        ),
      )
    await expect.poll(spacing).toBeLessThan(1)
    for (const bottom of [true, false]) {
      await page.evaluate(
        (end) =>
          window.scrollTo({
            top: end ? document.documentElement.scrollHeight : 0,
            behavior: 'instant',
          }),
        bottom,
      )
      await expect.poll(spacing).toBeLessThan(1)
    }
    await expect
      .poll(() =>
        page.evaluate(() =>
          Math.abs(
            document
              .querySelector('.question-group > :first-child')!
              .getBoundingClientRect().top -
              document.querySelector('.journey-nav')!.getBoundingClientRect()
                .bottom -
              2 *
                parseFloat(getComputedStyle(document.documentElement).fontSize),
          ),
        ),
      )
      .toBeLessThan(1)
    for (const repeats of [1, 10]) {
      await page.evaluate((count) => {
        document.querySelector('[data-test-notice]')?.remove()
        const notice = document.createElement('div')
        notice.dataset.testNotice = ''
        notice.className = 'top-bar'
        notice.textContent = 'Temporary layout check. '.repeat(count)
        document.querySelector('.top-bars')!.append(notice)
      }, repeats)
      await expect.poll(spacing).toBeLessThan(1)
    }
    await page
      .locator('[data-test-notice]')
      .evaluate((notice) => notice.remove())
    await expect.poll(spacing).toBeLessThan(1)
    expect(
      await trigger.evaluate((button) => button.getBoundingClientRect().height),
    ).toBeGreaterThanOrEqual(44)
    expect(
      await trigger.evaluate(
        (button) => button.scrollWidth <= button.clientWidth,
      ),
    ).toBe(true)

    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const popup = page.locator('.journey-menu-content')
    const steps = popup.locator('li button')
    await expect(steps).toHaveCount(
      await desktop.locator(':scope > li').count(),
    )
    const alignment = () =>
      popup.evaluate((panel) => {
        const bounds = panel.getBoundingClientRect()
        return Math.max(
          Math.abs(bounds.left),
          Math.abs(bounds.right - document.documentElement.clientWidth),
          Math.abs(
            bounds.top -
              document.querySelector('.journey-nav')!.getBoundingClientRect()
                .bottom,
          ),
        )
      })
    await expect.poll(alignment).toBeLessThan(1)
    expect(
      await steps.evaluateAll((buttons) =>
        buttons.every((button) => button.getBoundingClientRect().height >= 56),
      ),
    ).toBe(true)
    expect(await trigger.locator('.journey-number').textContent()).toBe(
      await popup.locator('[aria-current] .journey-number').textContent(),
    )
    await expect(popup.locator('[aria-current] button')).toBeFocused()
    expect(
      await popup.evaluate((panel) => ({
        animation: getComputedStyle(panel).animationName,
        transition: getComputedStyle(panel).transitionDuration,
      })),
    ).toEqual({ animation: 'none', transition: '0s' })
    await page.evaluate(() => {
      const spacer = document.createElement('div')
      spacer.dataset.testSpacer = ''
      spacer.style.height = '100vh'
      document.body.append(spacer)
    })
    for (const top of [80, 0]) {
      await page.evaluate(
        (position) => window.scrollTo({ top: position, behavior: 'instant' }),
        top,
      )
      await expect.poll(alignment).toBeLessThan(1)
    }
    await page
      .locator('[data-test-spacer]')
      .evaluate((spacer) => spacer.remove())
    const url = page.url()
    await popup.locator('button:disabled').evaluateAll((buttons) => {
      for (const button of buttons)
        if (button instanceof HTMLButtonElement) button.click()
    })
    await expect(page).toHaveURL(url)
    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
    await trigger.press('Enter')
    await popup.locator('[aria-current] button').click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
}
