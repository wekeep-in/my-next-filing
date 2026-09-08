import type { Page } from '@playwright/test'
import {
  RECOVERY_KEY,
  WORKSPACE_KEY,
  expect,
  seedPersonal,
  test,
} from './fixtures'
import recoveryV7 from '../fixtures/recovery-v7.json' with { type: 'json' }
import workspaceV8 from '../fixtures/workspace-v8.json' with { type: 'json' }

async function choose(page: Page, id: string, name: string) {
  await page.locator(`#${id}`).getByRole('radio', { name, exact: true }).click()
}
async function enterRent(page: Page) {
  await choose(page, 'hasRentalIncome', 'Yes')
  await choose(page, 'rentalIncomeConfirmed', 'Yes')
  await page.locator('#rentalAnnualValue').fill('300000')
  await page.locator('#rentalMunicipalTaxes').fill('20000')
  await page.locator('#rentalInterest').fill('100000')
  await choose(page, 'rentalGstConfirmed', 'Yes')
}

test('rental income reaches the combined plan and survives Recovery save reload and editing', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/other-income')
  await enterRent(page)
  await page.reload()
  await expect(page.locator('#rentalAnnualValue')).toHaveValue('3,00,000')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.locator('#aggregateTurnover-help')).toContainText(
    'exempt rental supply value',
  )
  // GST supply value is separately declared; the net property income is not used.
  await page.locator('#aggregateTurnover').fill('2300000')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(
    page.getByText('Your share of annual value before municipal taxes', {
      exact: true,
    }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹70,140')
  await page
    .getByText('How this estimate was calculated', { exact: true })
    .click()
  const list = page.locator('.calculation-list')
  for (const text of [
    'Net annual value',
    '₹2,80,000',
    '₹84,000',
    'Taxable rental income',
    '₹96,000',
    '₹15,06,000',
  ])
    await expect(list).toContainText(text)
  await expect(
    page.getByRole('heading', {
      name: 'Your turnover is above the GST registration threshold',
    }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Save data in this browser', exact: true })
    .click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Save data', exact: true })
    .click()
  await page.reload()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹70,140')
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
    WORKSPACE_KEY,
  )
  expect(saved).toMatchObject({
    schemaVersion: 11,
    active: {
      profile: {
        otherIncome: {
          rentalIncome: {
            rentalAnnualValue: 300_000,
            rentalMunicipalTaxes: 20_000,
            rentalInterest: 100_000,
          },
        },
        gst: { aggregateTurnover: 2_300_000 },
      },
    },
  })
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), RECOVERY_KEY),
  ).toBeNull()
  await page
    .getByRole('button', { name: '6. Other income and tax paid', exact: true })
    .click()
  await expect(page.locator('#rentalInterest')).toHaveValue('1,00,000')
  expect(page.url()).not.toMatch(/300000|20000|100000|2300000/)
  expect(await page.title()).not.toMatch(/300000|20000|100000|2300000/)
  for (const href of await page
    .locator('a[href^="https:"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!)))
    expect(href).not.toMatch(/300000|20000|100000|2300000/)
})

test('property losses block progress while rental GST uncertainty permits the income-tax plan', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/other-income')
  await enterRent(page)
  const next = page.getByRole('button', { name: 'Continue', exact: true })
  await page.locator('#rentalInterest').fill('196001')
  await expect(page.locator('#rentalInterest-unsupported')).toContainText(
    'property losses',
  )
  await expect(next).toBeDisabled()
  await page.locator('#rentalInterest').fill('100000')
  await choose(page, 'rentalIncomeConfirmed', 'Not sure')
  await expect(next).toBeDisabled()
  await choose(page, 'rentalIncomeConfirmed', 'Yes')
  await choose(page, 'rentalGstConfirmed', 'Not sure')
  await expect(page.locator('#rentalGstConfirmed-coverage')).toContainText(
    'Partial plan',
  )
  await expect(next).toBeEnabled()
  await next.click()
  await next.click()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹70,140')
  await expect(
    page
      .getByText(
        'Confirm the rental GST conditions, including tenant registration and the state of supply.',
        { exact: false },
      )
      .first(),
  ).toBeVisible()
})

test('rental help and fields fit desktop tablet and mobile with keyboard and reduced motion', async ({
  page,
}, testInfo) => {
  await seedPersonal(page)
  await page.goto('/check/other-income')
  await enterRent(page)
  const help = page.getByRole('button', {
    name: 'Learn more about rental income',
    exact: true,
  })
  await help.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', {
    name: 'Which rental income can I include?',
  })
  await expect(dialog.getByRole('heading')).toBeFocused()
  await expect(dialog).toContainText('full EMI')
  await page.keyboard.press('Escape')
  await expect(help).toBeFocused()
  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    await page.locator('#rentalAnnualValue').scrollIntoViewIfNeeded()
    await expect(page.locator('#rentalAnnualValue')).toBeVisible()
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`rental-${width}.png`) })
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await choose(page, 'hasRentalIncome', 'No')
  await expect(page.locator('#rentalAnnualValue')).toHaveCount(0)
  await choose(page, 'hasRentalIncome', 'Yes')
  await expect(page.locator('#rentalAnnualValue')).toHaveValue('')
  await expect(
    page
      .locator('#rentalIncomeConfirmed')
      .getByRole('radio', { name: 'Yes', exact: true }),
  ).toHaveAttribute('aria-checked', 'false')
})

test('historical Recovery requires rental review and preserves the selected property exclusion', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, draft }) => {
      if (sessionStorage.getItem('test:historical')) return
      sessionStorage.setItem('test:historical', 'yes')
      sessionStorage.setItem(key, JSON.stringify(draft))
    },
    {
      key: RECOVERY_KEY,
      draft: {
        ...recoveryV7,
        draft: {
          ...recoveryV7.draft,
          unsupportedCertainty: 'selected',
          unsupportedFacts: ['houseProperty'],
        },
      },
    },
  )
  await page.goto('/check/other-income')
  await expect(page.locator('#taxableBankInterest')).toHaveValue('10,000')
  await expect(
    page
      .locator('#hasRentalIncome')
      .getByRole('radio', { name: 'No', exact: true }),
  ).toHaveAttribute('aria-checked', 'false')
  await expect(
    page.getByRole('checkbox', {
      name: 'House-property income needing a separate review',
      exact: true,
    }),
  ).toBeChecked()
  await enterRent(page)
  await expect(
    page.getByRole('checkbox', {
      name: 'House-property income needing a separate review',
      exact: true,
    }),
  ).toBeChecked()
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled()
  await page
    .getByRole('checkbox', {
      name: 'House-property income needing a separate review',
      exact: true,
    })
    .click()
  await page
    .getByRole('radio', { name: 'None of these apply', exact: true })
    .click()
  await choose(page, 'hasForeignAssets', 'No')
  await choose(page, 'hasBroughtForwardLosses', 'No')
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeEnabled()
})

test('captured workspace still opens its plan and upgrades through a normal save', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, saved }) => {
      if (sessionStorage.getItem('test:historical')) return
      sessionStorage.setItem('test:historical', 'yes')
      localStorage.setItem(key, JSON.stringify(saved))
    },
    { key: WORKSPACE_KEY, saved: workspaceV8 },
  )
  await page.goto('/plan')
  await expect(page.locator('.tax-summary h2')).toHaveText('₹55,160')
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
    active: {
      completions: workspaceV8.active.completions,
      profile: { otherIncome: { rentalIncome: { kind: 'none' } } },
    },
  })
})
