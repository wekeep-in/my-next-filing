import { expect, questionField, seedPersonal, test } from './fixtures'

for (const width of [1440, 1024, 390, 320]) {
  test(`six-step navigation, compact groups and blocked help work at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/check/fit')
    const list = page.locator('.journey-nav > .journey-list')
    await expect(list.locator('li')).toHaveCount(6)
    await expect(list).not.toContainText('Overview')
    await expect(list).toContainText('Review your answers')
    const home = page.getByRole('link', { name: 'Home', exact: true })
    await expect(home).toBeVisible()
    expect(
      await home.evaluate((link) =>
        parseFloat(getComputedStyle(link, '::after').height),
      ),
    ).toBeGreaterThanOrEqual(44)
    const about = page
      .locator('.question-disclosure')
      .filter({ has: page.locator('#about-you') })
    const practice = page
      .locator('.question-disclosure')
      .filter({ has: page.locator('#about-practice') })
    await expect(about).toHaveAttribute('data-open', '')
    await expect(page.locator('#onePractice')).toBeHidden()
    await practice.locator('.question-card-trigger').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#onePractice')).toBeVisible()
    await expect(page.locator('#personKind')).toBeHidden()
    const next = page.getByRole('button', { name: 'Continue', exact: true })
    await expect(next).toBeDisabled()
    const help = page.locator('[aria-label="Why Continue is unavailable help"]')
    expect(
      await help.evaluate(
        (button) =>
          button.getBoundingClientRect().right <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await help.focus()
    await expect(page.getByRole('tooltip')).toContainText(
      'Choose whether you are an individual',
    )
    await page.keyboard.press('Escape')
    await expect(page.getByRole('tooltip')).toBeHidden()
    await help.hover()
    await expect(page.getByRole('tooltip')).toContainText(
      'Choose whether you are an individual',
    )
    await expect(next).toBeDisabled()
    await page.keyboard.press('Escape')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await about
      .locator('.question-card-trigger')
      .click({ position: { x: 12, y: 12 } })
    await (
      await questionField(page, '#personKind')
    )
      .getByRole('radio', { name: 'Yes', exact: true })
      .click()
    await expect(
      page.getByRole('button', { name: 'Continue', exact: true }),
    ).toBeDisabled()
    await page.evaluate(() => document.fonts.ready)
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: testInfo.outputPath(`form-${width}.png`) })
    await home.click()
    await expect(page).toHaveURL(/\/$/)
    await page.getByRole('link', { name: /Continue/ }).click()
    await expect(
      page
        .locator('#personKind')
        .getByRole('radio', { name: 'Yes', exact: true }),
    ).toHaveAttribute('aria-checked', 'true')
  })
}

test('business receipts derive safely and explicit none actions survive reload', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/fit')
  await (
    await questionField(page, '#path')
  )
    .getByRole('radio', { name: 'Eligible business path', exact: true })
    .click()
  for (const id of [
    'pathConfirmed',
    'notGoodsCarriage',
    'notAgencyCommissionBrokerage',
    'noChapterViiiCDeduction',
  ])
    await page
      .locator(`#${id}`)
      .getByRole('radio', { name: 'Yes', exact: true })
      .click()
  await page
    .locator('#fiveYearExclusion')
    .getByRole('radio', { name: 'None / does not apply', exact: true })
    .click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.locator('#grossReceipts').fill('100000')
  await page.locator('#qualifyingReceipts').fill('75000')
  await expect(page.locator('#otherReceipts')).toHaveValue('25,000')
  await expect(page.locator('#otherReceipts')).toHaveAttribute('readonly', '')
  await page
    .getByRole('button', {
      name: 'No cash receipts, non-account-payee cheques or drafts',
    })
    .click()
  await page.locator('#declaredProfit').fill('10000')
  await page.locator('#qualifyingReceipts').fill('100001')
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled()
  await expect(page.locator('#otherReceipts')).toHaveValue('')
  await page.locator('#qualifyingReceipts').fill('75000')
  await page.reload()
  await expect(page.locator('#otherReceipts')).toHaveValue('25,000')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await (
    await questionField(page, '#hasTaxPaid')
  )
    .getByRole('radio', { name: 'No', exact: true })
    .click()
  for (const id of ['tds', 'tcs', 'advanceTaxPaid'])
    await expect(page.locator(`#${id}`)).toHaveCount(0)
  await page.reload()
  await expect(
    (await questionField(page, '#hasTaxPaid')).getByRole('radio', {
      name: 'No',
      exact: true,
    }),
  ).toBeChecked()
  await page
    .getByRole('button', { name: '5. Review your answers', exact: true })
    .click()
  await expect(
    page.getByRole('heading', {
      name: 'Check your answers before calculating',
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    page.locator('.question-group .question-card-status'),
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', {
      name: 'Edit your answers for Fit for this version',
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    page.locator('.journey-nav > .journey-list [aria-current]'),
  ).toContainText('Review your answers')
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page).toHaveURL(/\/plan$/)
  await expect(
    page.getByRole('button', { name: 'Back', exact: true }),
  ).toBeVisible()
  await expect(
    page.locator('.journey-nav > .journey-list [aria-current]'),
  ).toContainText('Your plan')
})

test('foreign questions appear only for foreign clients and reuse whole-practice declarations', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/clients')
  await expect(page.locator('.question-disclosure')).toHaveCount(1)
  await expect(page.locator('#foreign-clients')).toHaveCount(0)
  await page
    .locator('#clientKind')
    .getByRole('radio', { name: 'Foreign clients only', exact: true })
    .click()
  await expect(page.locator('#foreign-clients')).toBeVisible()
  await questionField(page, '#foreignRecipientIdentifiable')
  await expect(page.locator('#foreignWorkInIndia')).toHaveCount(0)
  await expect(page.locator('#foreignOperation')).toHaveCount(0)
  await expect(
    page.getByText(/Your earlier answers about working in India/),
  ).toBeVisible()
  await page.reload()
  await expect(page.locator('#foreignWorkInIndia')).toHaveCount(0)
  await expect(page.locator('#foreignOperation')).toHaveCount(0)
  await (
    await questionField(page, '#clientKind')
  )
    .getByRole('radio', { name: 'Domestic clients only', exact: true })
    .click()
  await expect(page.locator('#foreign-clients')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeEnabled()
})

test.describe('touch navigation', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } })

  test('tapping blocked help keeps Continue disabled and the Home pill has an expanded target', async ({
    page,
  }) => {
    await page.goto('/check/fit')
    const help = page.locator('[aria-label="Why Continue is unavailable help"]')
    await help.tap()
    await expect(page.getByRole('tooltip')).toContainText(
      'Choose whether you are an individual',
    )
    await expect(
      page.getByRole('button', { name: 'Continue', exact: true }),
    ).toBeDisabled()
    await help.tap()
    await expect(page.getByRole('tooltip')).toBeHidden()
    const home = page.getByRole('link', { name: 'Home', exact: true })
    await home.scrollIntoViewIfNeeded()
    const bounds = await home.boundingBox()
    expect(bounds).not.toBeNull()
    // Tap inside the expanded target, just below the visible pill.
    await page.touchscreen.tap(
      bounds!.x + bounds!.width / 2,
      bounds!.y + bounds!.height + 4,
    )
    await expect(page).toHaveURL(/\/$/)
  })
})

test('changing question groups retains zero interest and credits', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/income')
  await (await questionField(page, '#taxableBankInterest')).fill('0')
  await expect(page.locator('#taxableBankInterest')).toHaveValue('0')
  await (await questionField(page, '#tds')).fill('0')
  await expect(page.locator('#tds')).toHaveValue('0')
  await expect(await questionField(page, '#taxableBankInterest')).toHaveValue(
    '0',
  )
  await page.reload()
  await expect(await questionField(page, '#taxableBankInterest')).toHaveValue(
    '0',
  )
  await expect(await questionField(page, '#tds')).toHaveValue('0')
})
