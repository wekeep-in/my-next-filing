import { expect, seedPersonal, stored, test } from './fixtures'

test('keeps the plan and saved data when portal and guide links open in a new tab', async ({
  page,
  context,
}) => {
  await seedPersonal(page, true)
  const requests: { url: string; referer: string | undefined }[] = []
  await context.route('https://**/*', async (route) => {
    requests.push({
      url: route.request().url(),
      referer: route.request().headers().referer,
    })
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<title>Official destination test</title>',
    })
  })
  await page.goto('/plan')
  const next = page.getByRole('region', {
    name: 'Pay advance tax',
    exact: true,
  })
  const agenda = page.getByRole('region', { name: 'Your agenda', exact: true })
  const portal = next.getByRole('link', { name: /^Open e-Pay Tax/ })
  const guide = next.getByRole('link', { name: /^official e-Pay Tax guide/ })
  await expect(portal).toBeVisible()
  await expect(guide).toBeVisible()
  await expect(
    next.locator('p').filter({
      has: page.getByRole('link', { name: /^official e-Pay Tax guide/ }),
    }),
  ).toContainText('₹55,160 estimated left to pay. Due 15 March 2027.')
  await expect(
    agenda.getByRole('link', { name: /^Open e-Pay Tax/ }),
  ).toBeVisible()
  await expect(
    agenda.getByRole('link', { name: /^official e-Filing guide/ }),
  ).toBeVisible()
  expect(requests).toEqual([])
  const before = await stored(page)
  for (const [link, expected] of [
    [
      portal,
      'https://eportal.incometax.gov.in/iec/foservices/#/e-pay-tax-prelogin/user-details',
    ],
    [
      guide,
      'https://www.incometax.gov.in/iec/foportal/help/generate-challan-form',
    ],
  ] as const) {
    await link.focus()
    await expect(link).toBeFocused()
    const popupPromise = page.waitForEvent('popup')
    await page.keyboard.press('Enter')
    const popup = await popupPromise
    try {
      await expect(popup).toHaveURL(expected)
      await expect(popup).toHaveTitle('Official destination test')
      expect(await popup.evaluate(() => window.opener === null)).toBe(true)
      expect(await popup.evaluate(() => document.referrer)).toBe('')
    } finally {
      await popup.close()
    }
    await expect(page).toHaveURL(/\/plan$/)
    expect(await stored(page)).toEqual(before)
  }
  expect(requests).toEqual([
    {
      url: 'https://eportal.incometax.gov.in/iec/foservices/',
      referer: undefined,
    },
    {
      url: 'https://www.incometax.gov.in/iec/foportal/help/generate-challan-form',
      referer: undefined,
    },
  ])
})
