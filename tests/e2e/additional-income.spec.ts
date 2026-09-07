import {
  RECOVERY_KEY,
  WORKSPACE_KEY,
  expect,
  seedPersonal,
  test,
} from './fixtures'
import recoveryV3 from '../fixtures/recovery-v3.json' with { type: 'json' }
import workspaceV4 from '../fixtures/workspace-v4.json' with { type: 'json' }

test('includes additional income and preserves established filing and GST conclusions through save and reload', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/other-income')
  await page
    .locator('#hasAdditionalIncome')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await page
    .locator('#additionalIncomeConfirmed')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  for (const [id, amount] of [
    ['dividends', '30000'],
    ['mutualFundDistributions', '20000'],
    ['postOfficeInterest', '15000'],
    ['incomeTaxRefundInterest', '5000'],
  ])
    await page.locator(`#${id}`).fill(amount)
  await page
    .locator('#otherAnnualReturnTrigger')
    .getByRole('radio', { name: 'Not sure', exact: true })
    .click()
  await page
    .locator('#ageSixtyOrOlder')
    .getByRole('radio', { name: 'Not sure', exact: true })
    .click()
  await expect(page.locator('#otherAnnualReturnTrigger-coverage')).toHaveCount(
    0,
  )
  await expect(page.locator('#ageSixtyOrOlder-coverage')).toHaveCount(0)
  await page.reload()
  await expect(page.locator('#mutualFundDistributions')).toHaveValue('20,000')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL(/\/check\/gst$/)
  await page.locator('#aggregateTurnover').fill('2000001')
  await expect(page.locator('#thresholdLiabilityDate-coverage')).toContainText(
    'exceeds the registration threshold',
  )
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(
    page.getByText('Indian-company dividends', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page).toHaveURL(/\/plan$/)
  await expect(
    page.getByRole('heading', {
      name: 'Your turnover is above the GST registration threshold',
    }),
  ).toBeVisible()
  await expect(
    page.getByText('Confirm when GST registration became required', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: 'Apply for GST registration',
      exact: true,
    }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('heading', {
      name: 'File the annual income-tax return',
      exact: true,
    }),
  ).toBeVisible()
  await page
    .getByText('How this estimate was calculated', { exact: true })
    .click()
  await expect(page.locator('.calculation-list')).toContainText('₹14,80,000')
  await expect(page.locator('.tax-summary h2')).toHaveText('₹66,080')
  await page
    .getByRole('button', { name: 'Save data in this browser', exact: true })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Save data in this browser?',
    exact: true,
  })
  await expect(dialog.getByRole('heading')).toBeFocused()
  await dialog.getByRole('button', { name: 'Save data', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await page.reload()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹66,080')
  const workspace = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
    WORKSPACE_KEY,
  )
  expect(workspace).toMatchObject({
    schemaVersion: 9,
    active: {
      profile: {
        otherIncome: { additionalIncome: { mutualFundDistributions: 20_000 } },
      },
    },
  })
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), RECOVERY_KEY),
  ).toBeNull()
  for (const href of await page
    .locator('a[href^="https:"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!)))
    expect(href).not.toMatch(/30000|20000|15000|5000|2000001/)
})

test('preserves income through Resources navigation with responsive help and fields', async ({
  page,
}, testInfo) => {
  await seedPersonal(page)
  await page.goto('/check/other-income')
  await page
    .locator('#hasAdditionalIncome')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  const help = page.locator('#hasAdditionalIncome').getByRole('button', {
    name: 'Learn more about dividends and additional interest',
  })
  await help.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', {
    name: 'Which dividends and interest can I include?',
  })
  await expect(dialog.getByRole('heading')).toBeFocused()
  await expect(dialog).toContainText('reinvested')
  await page.keyboard.press('Escape')
  await expect(help).toBeFocused()
  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    await expect(page.locator('#postOfficeInterest')).toBeVisible()
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page.locator('#other-interest-title').scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath(`income-${width}.png`) })
  }
  // The existing questionnaire FAQ shortcut is intentionally desktop-only.
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.locator('#dividends').fill('12345')
  await page.getByRole('link', { name: 'Read the FAQs', exact: true }).click()
  await page
    .getByRole('link', { name: 'Browse all resources', exact: true })
    .click()
  await expect(page).toHaveURL(/\/resources$/)
  await page.getByRole('searchbox').fill('IDCW')
  await expect(
    page.getByRole('heading', {
      name: 'Mutual-fund IDCW distributions opens in a new tab',
      exact: true,
    }),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/resources$/)
  await page.goBack()
  await page.goBack()
  await expect(page.locator('#dividends')).toHaveValue('12,345')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page
    .locator('#hasAdditionalIncome')
    .getByRole('radio', { name: 'No', exact: true })
    .click()
  await expect(page.locator('#dividends')).toHaveCount(0)
  await page
    .locator('#hasAdditionalIncome')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await expect(page.locator('#dividends')).toHaveValue('')
})

test('loads the published workspace and upgrades it on an ordinary save', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem('test:historical')) return
      localStorage.setItem(key, value)
      sessionStorage.setItem('test:historical', 'yes')
    },
    { key: WORKSPACE_KEY, value: JSON.stringify(workspaceV4) },
  )
  await page.goto('/plan')
  await expect(
    page.getByRole('heading', { name: 'Your plan', exact: true }),
  ).toBeVisible()
  await page
    .locator('.attention-action')
    .getByRole('button', { name: 'Update amount paid', exact: true })
    .click()
  await page.locator('#advance-tax-update').fill('1000')
  await page
    .getByRole('button', { name: 'Save and recalculate', exact: true })
    .click()
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
    WORKSPACE_KEY,
  )
  expect(saved).toMatchObject({
    schemaVersion: 9,
    active: {
      profile: { otherIncome: { additionalIncome: { kind: 'none' } } },
      completions: workspaceV4.active.completions,
    },
  })
})

test('restores published Recovery without inventing an answer to the new income question', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem('test:historical')) return
      sessionStorage.setItem(key, value)
      sessionStorage.setItem('test:historical', 'yes')
    },
    { key: RECOVERY_KEY, value: JSON.stringify(recoveryV3) },
  )
  await page.goto('/check/other-income')
  await expect(page.locator('#taxableBankInterest')).toHaveValue('10,000')
  const no = page
    .locator('#hasAdditionalIncome')
    .getByRole('radio', { name: 'No', exact: true })
  await expect(no).toHaveAttribute('aria-checked', 'false')
  await no.click()
  await page.reload()
  await expect(no).toHaveAttribute('aria-checked', 'true')
  await expect(page.locator('#taxableBankInterest')).toHaveValue('10,000')
})
