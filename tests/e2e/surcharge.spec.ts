import {
  RECOVERY_KEY,
  WORKSPACE_KEY,
  expect,
  questionField,
  seedPersonal,
  test,
} from './fixtures'
import type { Page } from '@playwright/test'

async function choose(page: Page, id: string, name: string) {
  await (
    await questionField(page, `#${id}`)
  )
    .getByRole('radio', { name, exact: true })
    .check()
}

test('ordinary income above fifty lakh reaches a complete surcharge breakdown and survives save reload and payment update', async ({
  page,
}, testInfo) => {
  const remote: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).hostname !== '127.0.0.1')
      remote.push(request.url())
  })
  await seedPersonal(page)
  await page.goto('/check/income')
  await (await questionField(page, '#grossReceipts')).fill('5100000')
  // Let the temporary notice finish before the later viewport and save interactions.
  const notice = page.getByText(
    'Your answers will stay available if you refresh this tab. Closing the tab may remove them.',
    { exact: true },
  )
  await expect(notice).toBeVisible()
  await expect(notice).toHaveCount(0)
  await (await questionField(page, '#declaredProfit')).fill('5100000')
  await expect(
    page.getByRole('button', { name: 'Next', exact: true }),
  ).toBeEnabled()
  await page.goto('/check/income')
  await (await questionField(page, '#taxableBankInterest')).fill('0')
  await (await questionField(page, '#tds')).fill('0')
  await (await questionField(page, '#aggregateTurnover')).fill('5100000')
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹12,27,200')
  await expect(
    page.getByRole('heading', { name: 'Surcharge included', exact: true }),
  ).toBeVisible()
  await page
    .getByText('How this estimate was calculated', { exact: true })
    .click()
  const list = page.locator('.calculation-list')
  for (const text of [
    'Surcharge before marginal relief',
    '₹1,11,000',
    'Surcharge marginal relief',
    '₹41,000',
    'Net surcharge',
    '₹70,000',
    '₹11,80,000',
    '₹47,200',
  ])
    await expect(list).toContainText(text)
  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    await page
      .getByText('Surcharge before marginal relief', { exact: true })
      .scrollIntoViewIfNeeded()
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath(`surcharge-${width}.png`),
    })
  }
  await page.setViewportSize({ width: 1440, height: 900 })
  await page
    .getByRole('button', { name: 'Save data in this browser', exact: true })
    .click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Save data', exact: true })
    .click()
  await page.reload()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹12,27,200')
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
      WORKSPACE_KEY,
    ),
  ).toMatchObject({
    schemaVersion: 11,
    active: { profile: { incomePath: { declaredProfit: 5_100_000 } } },
  })
  await page
    .locator('.attention-action')
    .getByRole('button', { name: 'Update amount paid', exact: true })
    .click()
  await (await questionField(page, '#advance-tax-update')).fill('100000')
  await page
    .getByRole('button', { name: 'Update and recalculate', exact: true })
    .click()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹11,27,200')
  expect(page.url()).not.toMatch(/5100000|100000|1227200/)
  expect(await page.title()).not.toMatch(/5100000|100000|1227200/)
  expect(remote).toEqual([])
})

test('the one-crore ceiling blocks and mixed equity within the first surcharge band proceeds', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/income')
  const next = page.getByRole('button', { name: 'Next', exact: true })
  await (await questionField(page, '#taxableBankInterest')).fill('11000000')
  await expect(
    await questionField(page, '#taxableBankInterest-unsupported'),
  ).toContainText('₹1 crore')
  await expect(next).toBeDisabled()
  await (await questionField(page, '#taxableBankInterest')).fill('3700000')
  await choose(page, 'hasEquityGains', 'Yes')
  await choose(page, 'equityGainsConfirmed', 'Yes')
  for (const [id, value] of [
    ['shortTermGains', '10'],
    ['longTermGains', '0'],
    ['shortTermLosses', '0'],
    ['longTermLosses', '0'],
  ])
    await (await questionField(page, `#${id}`)).fill(value)
  await expect(page.locator('#shortTermGains-unsupported')).toHaveCount(0)
  await expect(next).toBeEnabled()
  await (await questionField(page, '#shortTermLosses')).fill('10')
  await expect(page.locator('#shortTermGains-unsupported')).toHaveCount(0)
  await expect(next).toBeEnabled()
})

test('a restored surcharge exclusion remains selected until explicitly reviewed', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/income')
  await (await questionField(page, '#taxableBankInterest')).fill('3700000')
  const scope = await questionField(
    page,
    '#unsupportedSituationAnswers-businessTax',
  )
  const flag = scope.getByRole('radio', { name: 'Yes', exact: true })
  await flag.check()
  await expect(
    page.getByRole('button', { name: 'Next', exact: true }),
  ).toBeDisabled()
  await expect
    .poll(
      async () =>
        await page.evaluate((key) => sessionStorage.getItem(key), RECOVERY_KEY),
    )
    .toContain('unsupportedBusinessOrTax')
  await page.reload()
  const reviewedScope = await questionField(
    page,
    '#unsupportedSituationAnswers-businessTax',
  )
  await expect(flag).toBeChecked()
  await reviewedScope.getByRole('radio', { name: 'No', exact: true }).check()
  await expect(
    page.getByRole('button', { name: 'Next', exact: true }),
  ).toBeEnabled()
})

test('the personal-residence proprietor exemption requires explicit review and preserves rental tax and browser answers', async ({
  page,
}, testInfo) => {
  await seedPersonal(page)
  await page.goto('/check/income')
  await choose(page, 'hasRentalIncome', 'Yes')
  await choose(page, 'rentalIncomeConfirmed', 'Yes')
  for (const [id, amount] of [
    ['rentalAnnualValue', '300000'],
    ['rentalMunicipalTaxes', '20000'],
    ['rentalInterest', '100000'],
  ])
    await (await questionField(page, `#${id}`)).fill(amount)
  const field = await questionField(page, '#rentalGstConfirmed')
  await expect(field).toContainText(
    'sole proprietor, someone who owns a business alone',
  )
  await expect(field).toContainText('renting the home personally to live in')
  await expect(field).toContainText('not for their business')
  await choose(page, 'rentalGstConfirmed', 'No')
  await expect(
    await questionField(page, '#rentalGstConfirmed-coverage'),
  ).toBeVisible()
  await expect
    .poll(async () => {
      const raw = await page.evaluate(
        (key) => sessionStorage.getItem(key),
        RECOVERY_KEY,
      )
      return raw ? (JSON.parse(raw) as unknown) : null
    })
    .toMatchObject({ draft: { rentalGstConfirmed: 'no' } })
  await page.reload()
  await questionField(page, '#rentalGstConfirmed')
  await expect(
    field.getByRole('radio', { name: 'No', exact: true }),
  ).toBeChecked()
  const help = page.getByRole('button', {
    name: 'Which rental income can I include?',
    exact: true,
  })
  await help.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', {
    name: 'Which rental income can I include?',
  })
  await expect(dialog.getByRole('heading')).toBeFocused()
  await expect(dialog).toContainText('rather than for their business')
  await page.keyboard.press('Escape')
  await expect(help).toBeFocused()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await choose(page, 'rentalGstConfirmed', 'Yes')
  await expect(page.locator('#rentalGstConfirmed-coverage')).toHaveCount(0)
  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await field.scrollIntoViewIfNeeded()
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath(`rental-proprietor-${width}.png`),
    })
  }
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await (await questionField(page, '#aggregateTurnover')).fill('2300000')
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹70,140')
  await expect(
    page.getByRole('heading', {
      name: 'Your turnover is above the GST registration threshold',
      exact: true,
    }),
  ).toBeVisible()
})
