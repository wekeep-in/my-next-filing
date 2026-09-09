import {
  RECOVERY_KEY,
  WORKSPACE_KEY,
  expect,
  openQuestionStep,
  questionField,
  seedPersonal,
  test,
} from './fixtures'
import recoveryV5 from '../fixtures/recovery-v5.json' with { type: 'json' }
import workspaceV6 from '../fixtures/workspace-v6.json' with { type: 'json' }

test('combines salary dividends and equity gains through review save reload and payment update', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/income')
  for (const id of [
    'hasSalary',
    'salaryConfirmed',
    'hasAdditionalIncome',
    'additionalIncomeConfirmed',
    'hasEquityGains',
    'equityGainsConfirmed',
  ])
    await (
      await questionField(page, `#${id}`)
    )
      .getByRole('radio', { name: 'Yes', exact: true })
      .click()
  await (
    await questionField(page, '#hasEmployerNps')
  )
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
    await (await questionField(page, `#${id}`)).fill(value)
  await page.reload()
  await expect(await questionField(page, '#longTermGains')).toHaveValue(
    '2,00,000',
  )
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL(/\/check\/clients$/)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL(/\/check\/taxes-and-gst$/)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Other income', exact: true }).click()
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
  await (await questionField(page, '#advance-tax-update')).fill('10000')
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
  await page.goto('/check/income')
  await (
    await questionField(page, '#hasEquityGains')
  )
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  const help = (await questionField(page, '#hasEquityGains')).getByRole(
    'button',
    { name: 'Learn more about domestic equity gains' },
  )
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
    await (
      await questionField(page, '#equity-gains-title')
    ).evaluate((element) => element.scrollIntoView({ block: 'center' }))
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`equity-${width}.png`) })
    await (
      await questionField(page, '#longTermGains')
    ).evaluate((element) => element.scrollIntoView({ block: 'center' }))
    await expect(await questionField(page, '#longTermGains')).toBeInViewport()
    await page.screenshot({
      path: testInfo.outputPath(`equity-amounts-${width}.png`),
    })
  }
  await (await questionField(page, '#shortTermGains')).fill('12345')
  await (await questionField(page, '#longTermGains')).fill('0')
  await (
    await questionField(page, '#equityGainsConfirmed')
  )
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await (
    await questionField(page, '#hasEquityGains')
  )
    .getByRole('radio', { name: 'No', exact: true })
    .click()
  await expect(page.locator('#shortTermGains')).toHaveCount(0)
  await (
    await questionField(page, '#hasEquityGains')
  )
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await expect(await questionField(page, '#shortTermGains')).toHaveValue('')
  await expect(
    (await questionField(page, '#equityGainsConfirmed')).getByRole('radio', {
      name: 'Yes',
      exact: true,
    }),
  ).toHaveAttribute('aria-checked', 'false')
})

test('withholds uncertain equity treatment and supports confirmed mixed basic exemption', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/income')
  await (await questionField(page, '#grossReceipts')).fill('600000')
  await (await questionField(page, '#declaredProfit')).fill('300000')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL(/\/check\/review$/)
  await openQuestionStep(page, 1)
  await (
    await questionField(page, '#hasEquityGains')
  )
    .getByRole('radio', { name: 'Not sure', exact: true })
    .click()
  await expect(
    await questionField(page, '#hasEquityGains-unsupported'),
  ).toContainText('Outside this version')
  await (
    await questionField(page, '#hasEquityGains')
  )
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await (
    await questionField(page, '#equityGainsConfirmed')
  )
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await (await questionField(page, '#shortTermGains')).fill('100000')
  await (await questionField(page, '#longTermGains')).fill('200000')
  await (await questionField(page, '#shortTermLosses')).fill('0')
  await (await questionField(page, '#longTermLosses')).fill('0')
  await expect(page.locator('#equityGainsConfirmed-unsupported')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeEnabled()
  await (await questionField(page, '#longTermGains')).fill('0')
  await expect(page.locator('#equityGainsConfirmed-unsupported')).toHaveCount(0)
  await (await questionField(page, '#shortTermGains')).fill('-1')
  await expect(await questionField(page, '#shortTermGains')).toHaveValue(
    '1,00,000',
  )
  await (await questionField(page, '#shortTermGains')).fill('')
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled()
  await expect(page).toHaveURL(/\/check\/income$/)
  await expect(await questionField(page, '#shortTermGains-error')).toBeVisible()
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
  await (await questionField(page, '#advance-tax-update')).fill('1000')
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
  await page.goto('/check/fit')
  const scope = await questionField(
    page,
    '#unsupportedSituationAnswers-otherIncome',
  )
  const legacyAnswer = scope.getByRole('radio', { name: 'Yes', exact: true })
  await expect(legacyAnswer).toBeChecked()
  await scope.getByRole('radio', { name: 'No', exact: true }).check()
  await page
    .getByRole('button', { name: '2. Income and profit', exact: true })
    .click()
  await expect(
    (await questionField(page, '#hasEquityGains')).getByRole('radio', {
      name: 'No',
      exact: true,
    }),
  ).toHaveAttribute('aria-checked', 'false')
  await (
    await questionField(page, '#hasEquityGains')
  )
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await expect(await questionField(page, '#shortTermGains')).toHaveValue('')
})
