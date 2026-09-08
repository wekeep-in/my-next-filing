import {
  RECOVERY_KEY,
  WORKSPACE_KEY,
  expect,
  seedPersonal,
  test,
} from './fixtures'
import recoveryV5 from '../fixtures/recovery-v5.json' with { type: 'json' }
import workspaceV6 from '../fixtures/workspace-v6.json' with { type: 'json' }

test('combines salary dividends and equity gains through review save reload and payment update', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/other-income')
  for (const id of [
    'hasSalary',
    'salaryConfirmed',
    'hasAdditionalIncome',
    'additionalIncomeConfirmed',
    'hasEquityGains',
    'equityGainsConfirmed',
  ])
    await page
      .locator(`#${id}`)
      .getByRole('radio', { name: 'Yes', exact: true })
      .click()
  await page
    .locator('#hasEmployerNps')
    .getByRole('radio', { name: 'No', exact: true })
    .click()
  for (const [id, value] of [
    ['grossSalary', '200000'],
    ['dividends', '25000'],
    ['mutualFundDistributions', '0'],
    ['postOfficeInterest', '0'],
    ['incomeTaxRefundInterest', '0'],
    ['shortTermGains', '100000'],
    ['longTermGains', '200000'],
    ['shortTermLosses', '0'],
    ['longTermLosses', '0'],
  ])
    await page.locator(`#${id}`).fill(value)
  await page.reload()
  await expect(page.locator('#longTermGains')).toHaveValue('2,00,000')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL(/\/check\/gst$/)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(
    page.getByText('Short-term equity gains', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page).toHaveURL(/\/plan$/)
  await expect(page.locator('.tax-summary h2')).toHaveText('₹1,09,110')
  await page
    .getByText('How this estimate was calculated', { exact: true })
    .click()
  await expect(page.locator('.calculation-list')).toContainText('₹9,375')
  await expect(page.locator('.calculation-list')).toContainText('₹18,60,000')
  await expect(
    page.getByRole('heading', {
      name: 'File the annual income-tax return',
      exact: true,
    }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Save data in this browser', exact: true })
    .click()
  await page
    .getByRole('dialog', { name: 'Save data in this browser?', exact: true })
    .getByRole('button', { name: 'Save data', exact: true })
    .click()
  await page.reload()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹1,09,110')
  await page
    .locator('.attention-action')
    .getByRole('button', { name: 'Update amount paid', exact: true })
    .click()
  await page.locator('#advance-tax-update').fill('10000')
  await page
    .getByRole('button', { name: 'Save and recalculate', exact: true })
    .click()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹99,110')
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
    WORKSPACE_KEY,
  )
  expect(saved).toMatchObject({
    schemaVersion: 11,
    active: {
      profile: {
        otherIncome: {
          equityGains: {
            kind: 'domestic',
            confirmed: 'yes',
            shortTermGains: 100_000,
            longTermGains: 200_000,
          },
          advanceTaxPaid: 10_000,
        },
      },
    },
  })
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), RECOVERY_KEY),
  ).toBeNull()
  for (const href of await page
    .locator('a[href^="https:"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!)))
    expect(href).not.toMatch(/100000|200000|109110|1860000/)
})

test('keeps equity help keyboard accessible and fields usable at desktop tablet and mobile widths', async ({
  page,
}, testInfo) => {
  await seedPersonal(page)
  await page.goto('/check/other-income')
  await page
    .locator('#hasEquityGains')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  const help = page
    .locator('#hasEquityGains')
    .getByRole('button', { name: 'Learn more about domestic equity gains' })
  await help.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', {
    name: 'Which equity gains and losses can I include?',
  })
  await expect(dialog.getByRole('heading')).toBeFocused()
  await expect(dialog).toContainText('Do not subtract losses twice')
  await page.keyboard.press('Escape')
  await expect(help).toBeFocused()
  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    await page
      .locator('#equity-gains-title')
      .evaluate((element) => element.scrollIntoView({ block: 'center' }))
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`equity-${width}.png`) })
    await page
      .locator('#longTermGains')
      .evaluate((element) => element.scrollIntoView({ block: 'center' }))
    await expect(page.locator('#longTermGains')).toBeInViewport()
    await page.screenshot({
      path: testInfo.outputPath(`equity-amounts-${width}.png`),
    })
  }
  await page.locator('#shortTermGains').fill('12345')
  await page.locator('#longTermGains').fill('0')
  await page
    .locator('#equityGainsConfirmed')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page
    .locator('#hasEquityGains')
    .getByRole('radio', { name: 'No', exact: true })
    .click()
  await expect(page.locator('#shortTermGains')).toHaveCount(0)
  await page
    .locator('#hasEquityGains')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await expect(page.locator('#shortTermGains')).toHaveValue('')
  await expect(
    page
      .locator('#equityGainsConfirmed')
      .getByRole('radio', { name: 'Yes', exact: true }),
  ).toHaveAttribute('aria-checked', 'false')
})

test('withholds uncertain equity treatment and supports confirmed mixed basic exemption', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/receipts')
  await page.locator('#grossReceipts').fill('600000')
  await page.locator('#declaredProfit').fill('300000')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL(/\/check\/other-income$/)
  await page
    .locator('#hasEquityGains')
    .getByRole('radio', { name: 'Not sure', exact: true })
    .click()
  await expect(page.locator('#hasEquityGains-unsupported')).toContainText(
    'Outside this version',
  )
  await page
    .locator('#hasEquityGains')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await page
    .locator('#equityGainsConfirmed')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await page.locator('#shortTermGains').fill('100000')
  await page.locator('#longTermGains').fill('200000')
  await page.locator('#shortTermLosses').fill('0')
  await page.locator('#longTermLosses').fill('0')
  await expect(page.locator('#equityGainsConfirmed-unsupported')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeEnabled()
  await page.locator('#longTermGains').fill('0')
  await expect(page.locator('#equityGainsConfirmed-unsupported')).toHaveCount(0)
  await page.locator('#shortTermGains').fill('-1')
  await expect(page.locator('#shortTermGains')).toHaveValue('1,00,000')
  await page.locator('#shortTermGains').fill('')
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled()
  await expect(page).toHaveURL(/\/check\/other-income$/)
  await expect(page.locator('#shortTermGains-error')).toBeVisible()
})

test('restores the captured workspace and writes the new schema only on an ordinary save', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem('test:equity-history')) return
      localStorage.setItem(key, value)
      sessionStorage.setItem('test:equity-history', 'yes')
    },
    { key: WORKSPACE_KEY, value: JSON.stringify(workspaceV6) },
  )
  await page.goto('/plan')
  await expect(
    page.getByRole('heading', { name: 'Your plan', exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
      WORKSPACE_KEY,
    ),
  ).toMatchObject({ schemaVersion: 6 })
  await page
    .locator('.attention-action')
    .getByRole('button', { name: 'Update amount paid', exact: true })
    .click()
  await page.locator('#advance-tax-update').fill('1000')
  await page
    .getByRole('button', { name: 'Save and recalculate', exact: true })
    .click()
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
      WORKSPACE_KEY,
    ),
  ).toMatchObject({
    schemaVersion: 11,
    consentDecidedAt: workspaceV6.consentDecidedAt,
    active: {
      completions: workspaceV6.active.completions,
      profile: { otherIncome: { equityGains: { kind: 'none' } } },
    },
  })
})

test('restores captured Recovery without granting equity eligibility or clearing legacy gain facts', async ({
  page,
}) => {
  const legacy = {
    ...recoveryV5,
    draft: {
      ...recoveryV5.draft,
      unsupportedFacts: ['capitalGains'],
      unsupportedCertainty: 'selected',
    },
  }
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem('test:equity-history')) return
      sessionStorage.setItem(key, value)
      sessionStorage.setItem('test:equity-history', 'yes')
    },
    { key: RECOVERY_KEY, value: JSON.stringify(legacy) },
  )
  await page.goto('/check/other-income')
  await expect(
    page
      .locator('#hasEquityGains')
      .getByRole('radio', { name: 'No', exact: true }),
  ).toHaveAttribute('aria-checked', 'false')
  await expect(
    page.getByRole('checkbox', {
      name: 'Capital gains needing a separate review',
      exact: true,
    }),
  ).toBeChecked()
  await page
    .locator('#hasEquityGains')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await expect(
    page.getByRole('checkbox', {
      name: 'Capital gains needing a separate review',
      exact: true,
    }),
  ).toBeChecked()
  await expect(page.locator('#shortTermGains')).toHaveValue('')
})
