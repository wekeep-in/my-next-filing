import {
  browseResourcesFromPlan,
  expect,
  failRecoveryWrites,
  openResources,
  returnFromResources,
  seedPersonal,
  stored,
  test,
} from './fixtures'

test('searches a fresh public catalogue without changing storage URL title or outbound requests', async ({
  page,
}) => {
  const remote: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).hostname !== '127.0.0.1')
      remote.push(request.url())
  })
  await page.goto('/resources')
  await expect(page.locator('[aria-label="Resources"] > li')).toHaveCount(29)
  const help = page.getByRole('button', { name: 'Search resources help' })
  await help.hover()
  await expect(page.getByRole('tooltip')).toHaveText(
    'Try a topic, form name or section number.',
  )
  await help.click()
  await expect(page.getByRole('tooltip')).toHaveCount(0)
  // Preserve the original click-toggle check independently of pointer hover opening it first.
  await help.dispatchEvent('click')
  await expect(page.getByRole('tooltip')).toHaveText(
    'Try a topic, form name or section number.',
  )
  await help.dispatchEvent('click')
  await expect(page.getByRole('tooltip')).toHaveCount(0)
  const before = await stored(page)
  const url = page.url()
  const title = await page.title()
  const search = page.getByRole('searchbox', {
    name: 'Search resources',
    exact: true,
  })
  await search.fill('advnace tax')
  await page
    .getByRole('button', { name: 'Did you mean “advance tax”?' })
    .click()
  await expect(search).toHaveValue('advance tax')
  await expect(page.getByRole('status')).toHaveText('5 resources')
  await search.press('Enter')
  await expect(page).toHaveURL(url)
  await expect(page).toHaveTitle(title)
  expect(await stored(page)).toEqual(before)
  expect(remote).toEqual([])
  await search.fill('')
  await expect(page.locator('[aria-label="Resources"] > li')).toHaveCount(29)
})

test('keeps a personal plan and browse state through Back Forward and reload', async ({
  page,
}) => {
  await seedPersonal(page, true)
  await page.goto('/resources')
  const before = await stored(page)
  await page.getByRole('link', { name: 'Back to Home', exact: true }).click()
  await page
    .getByRole('link', { name: 'Continue your plan', exact: true })
    .click()
  await expect(page).toHaveURL(/\/plan$/)
  await expect(
    page.getByRole('link', { name: 'Browse resources', exact: true }),
  ).toHaveCount(0)
  await browseResourcesFromPlan(page)
  await page.locator('#resource-search').fill('LUT')
  await page.goBack()
  await expect(page).toHaveURL(/\/#faqs$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/plan$/)
  expect(await stored(page)).toEqual(before)
  await page.goForward()
  await expect(page).toHaveURL(/\/#faqs$/)
  await page.goForward()
  await expect(page.locator('#resource-search')).toHaveValue('LUT')
  expect(await stored(page)).toEqual(before)
  await page.reload()
  await expect(page.locator('#resource-search')).toHaveValue('')
  expect(await stored(page)).toEqual(before)
})

test('retains personal edits through FAQ resource visits and failed Recovery writes', async ({
  page,
}) => {
  await seedPersonal(page, true)
  await page.goto('/check/receipts')
  const gross = page.locator('#grossReceipts')
  await expect(gross).toHaveValue('20,00,000')
  await gross.fill('2100000')
  await expect.poll(async () => (await stored(page)).tab).toContain('21,00,000')
  const personal = await stored(page)
  await openResources(page)
  await page.locator('#resource-search').fill('LUT')
  await returnFromResources(page)
  await expect(gross).toHaveValue('21,00,000')
  expect(await stored(page)).toEqual(personal)

  await failRecoveryWrites(page)
  const beforeFailure = await stored(page)
  await gross.fill('2400000')
  await openResources(page)
  await returnFromResources(page)
  await expect(gross).toHaveValue('24,00,000')
  expect(await stored(page)).toEqual(beforeFailure)
  await openResources(page)
  await expect(page.locator('#resource-search')).toHaveValue('LUT')
  await page.setViewportSize({ width: 320, height: 800 })
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.querySelector('.resources-page nav')!.getBoundingClientRect()
            .top -
          document.querySelector('.top-bars')!.getBoundingClientRect().bottom,
      ),
    )
    .toBeGreaterThanOrEqual(0)
})

test('preserves selected workspace and its separate personal draft', async ({
  page,
}) => {
  await seedPersonal(page, true)
  await page.goto('/plan')
  await page
    .getByRole('button', { name: 'Open saved workspace', exact: true })
    .click()
  const selected = await stored(page)
  await browseResourcesFromPlan(page)
  await page.goBack()
  await expect(page).toHaveURL(/\/#faqs$/)
  await page.goBack()
  await expect(
    page.getByRole('button', { name: 'Return to your estimate', exact: true }),
  ).toBeVisible()
  expect(await stored(page)).toEqual(selected)
  await page
    .getByRole('button', { name: 'Return to your estimate', exact: true })
    .click()
  await page
    .getByRole('button', { name: '4. Receipts and profit', exact: true })
    .click()
  await expect(page.locator('#grossReceipts')).toHaveValue('20,00,000')
})

test('a failed lazy screen keeps the shell resources and latest unsaved answers', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/receipts')
  await failRecoveryWrites(page)
  const before = await stored(page)
  await page.locator('#grossReceipts').fill('2400000')
  // Plan has not loaded in this document. Fail its production chunk without importing app internals.
  await page.route('**/assets/plan-*.js', (route) => route.abort())
  await page
    .getByRole('button', { name: '8. Review your answers', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: "This page couldn't load" }),
  ).toBeVisible()
  await page
    .getByRole('link', { name: 'Back to resources', exact: true })
    .click()
  await expect(page.locator('#resource-search')).toBeVisible()
  await page.goBack()
  await page.goBack()
  await page
    .getByRole('button', { name: '4. Receipts and profit', exact: true })
    .click()
  await expect(page.locator('#grossReceipts')).toHaveValue('24,00,000')
  expect(await stored(page)).toEqual(before)
})
