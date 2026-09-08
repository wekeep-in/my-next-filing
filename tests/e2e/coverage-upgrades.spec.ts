import type { Page } from '@playwright/test'
import {
  RECOVERY_KEY,
  WORKSPACE_KEY,
  expect,
  seedPersonal,
  test,
} from './fixtures'
import recoveryV9 from '../fixtures/recovery-v9.json' with { type: 'json' }
import workspaceV10 from '../fixtures/workspace-v10.json' with { type: 'json' }

async function choose(page: Page, id: string, name: string) {
  await page.locator(`#${id}`).getByRole('radio', { name, exact: true }).click()
}
async function calculate(page: Page) {
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
}

test('earlier loss balances combine with co-owned rent and survive Recovery and Saved workspace', async ({
  page,
}, testInfo) => {
  await seedPersonal(page)
  await page.goto('/check/other-income')
  await choose(page, 'hasRentalIncome', 'Yes')
  await expect(page.locator('#rentalIncomeConfirmed-help')).toContainText(
    'definite, documented share',
  )
  await expect(page.locator('#rentalIncomeConfirmed-help')).toContainText(
    'liability for borrowing',
  )
  await choose(page, 'rentalIncomeConfirmed', 'Yes')
  // A documented half share of annual value 600,000; deductions are separately established.
  await page
    .getByLabel('Your share of annual value before municipal taxes', {
      exact: true,
    })
    .fill('300000')
  await page.locator('#rentalMunicipalTaxes').fill('20000')
  await page.locator('#rentalInterest').fill('100000')
  await choose(page, 'rentalGstConfirmed', 'Yes')
  await choose(page, 'hasEquityGains', 'Yes')
  await choose(page, 'equityGainsConfirmed', 'Yes')
  for (const [id, value] of [
    ['shortTermGains', '200000'],
    ['shortTermLosses', '50000'],
    ['longTermGains', '300000'],
    ['longTermLosses', '75000'],
  ])
    await page.locator(`#${id}`).fill(value)
  await choose(page, 'hasBroughtForwardLosses', 'Yes')
  await choose(page, 'broughtForwardLossesConfirmed', 'Yes')
  await page
    .getByRole('combobox', {
      name: 'Loss 1: originating financial year',
      exact: true,
    })
    .click()
  await page.getByRole('option', { name: '2018-19', exact: true }).click()
  await page
    .getByLabel('Loss 1: remaining short-term balance', { exact: true })
    .fill('200000')
  await page
    .getByLabel('Loss 1: remaining long-term balance', { exact: true })
    .fill('250000')
  await page.reload()
  await expect(
    page.getByLabel('Loss 1: remaining short-term balance', { exact: true }),
  ).toHaveValue('2,00,000')
  await page.getByRole('button', { name: 'Add loss year', exact: true }).click()
  const remove = page.getByRole('button', {
    name: 'Remove loss year 2',
    exact: true,
  })
  await remove.focus()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('button', { name: 'Add loss year', exact: true }),
  ).toBeFocused()
  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page
      .getByLabel('Loss 1: remaining short-term balance', { exact: true })
      .scrollIntoViewIfNeeded()
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath(`earlier-loss-fields-${width}.png`),
    })
  }
  await calculate(page)
  await expect(page.locator('.tax-summary h2')).toHaveText('₹70,140')
  const balance = page.locator(
    'section[aria-labelledby="earlier-loss-balances-title"]',
  )
  await expect(balance).toContainText('short-term loss ₹50,000')
  await expect(balance).toContainText('long-term loss ₹25,000')
  await expect(balance).toContainText('Last usable year: 2026-27')
  await page
    .getByText('How this estimate was calculated', { exact: true })
    .click()
  await expect(page.locator('.calculation-list')).toContainText(
    'Taxable rental income',
  )
  await expect(page.locator('.calculation-list')).toContainText('₹96,000')
  await expect(page.locator('.calculation-list')).toContainText(
    'Long-term loss used against long-term gains',
  )
  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await balance.scrollIntoViewIfNeeded()
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath(`earlier-loss-plan-${width}.png`),
    })
  }
  await page
    .getByRole('button', { name: 'Save data in this browser', exact: true })
    .click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Save data', exact: true })
    .click()
  await page.reload()
  await expect(balance).toContainText('short-term loss ₹50,000')
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
      WORKSPACE_KEY,
    ),
  ).toMatchObject({
    schemaVersion: 11,
    active: {
      profile: {
        otherIncome: {
          broughtForwardLosses: {
            kind: 'eligible',
            years: [{ originYear: 2018, shortTerm: 200000, longTerm: 250000 }],
          },
        },
      },
    },
  })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page
    .getByRole('button', { name: '6. Other income and tax paid', exact: true })
    .click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await choose(page, 'hasBroughtForwardLosses', 'No')
  await choose(page, 'hasBroughtForwardLosses', 'Yes')
  await expect(
    page.getByLabel('Loss 1: remaining short-term balance', { exact: true }),
  ).toHaveValue('')
  expect(page.url()).not.toMatch(/200000|250000|300000/)
  expect(await page.title()).not.toMatch(/200000|250000|300000/)
})

test('platform GST uncertainty permits tax and confirmed RCM produces a registration deadline', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/clients')
  await choose(page, 'delivery', 'Through a platform')
  for (const id of [
    'platformOwnAccount',
    'platformRecipientIdentifiable',
    'platformGrossBeforeFees',
    'platformIncomeCharacter',
  ])
    await choose(page, id, 'Yes')
  await choose(page, 'platformForeignFeeGstTreatment', 'Not sure')
  await choose(page, 'platformReverseCharge', 'Not sure')
  await expect(page.locator('#platformReverseCharge-coverage')).toContainText(
    'Partial plan',
  )
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await calculate(page)
  await expect(page.locator('.tax-summary h2')).toHaveText('₹55,160')
  await expect(
    page.getByRole('heading', {
      name: 'GST check',
      exact: true,
    }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: '5. Clients and payments', exact: true })
    .click()
  await choose(
    page,
    'platformForeignFeeGstTreatment',
    'Yes, and I have confirmed how GST applies',
  )
  await choose(page, 'platformReverseCharge', 'Confirmed: I must pay GST')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.locator('#platformRcmLiabilityDate').click()
  // The new picker opens at the beginning of the Tax Year.
  await page.getByRole('button', { name: '15 April 2026', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹55,160')
  await expect(
    page
      .getByRole('heading', {
        name: 'Apply for GST registration',
        exact: true,
      })
      .first(),
  ).toBeVisible()
  await expect(
    page.getByText('15 May 2026', { exact: true }).first(),
  ).toBeVisible()
  await page.reload()
  await expect(
    page
      .getByRole('heading', {
        name: 'Apply for GST registration',
        exact: true,
      })
      .first(),
  ).toBeVisible()
})

test('captured Recovery asks about prior balances and captured workspace remains untouched until save', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem('test:upgrades-history')) return
      sessionStorage.setItem('test:upgrades-history', 'yes')
      sessionStorage.setItem(key, value)
    },
    { key: RECOVERY_KEY, value: JSON.stringify(recoveryV9) },
  )
  await page.goto('/check/other-income')
  await expect(
    page
      .locator('#hasBroughtForwardLosses')
      .getByRole('radio', { name: 'No', exact: true }),
  ).toHaveAttribute('aria-checked', 'false')
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled()
  await choose(page, 'hasBroughtForwardLosses', 'No')
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeEnabled()
  await page.evaluate(
    ({ key, value, recoveryKey }) => {
      sessionStorage.removeItem(recoveryKey)
      localStorage.setItem(key, value)
    },
    {
      key: WORKSPACE_KEY,
      value: JSON.stringify(workspaceV10),
      recoveryKey: RECOVERY_KEY,
    },
  )
  await page.goto('/plan')
  await expect(page.locator('.tax-summary h2')).toBeVisible()
  expect(
    await page.evaluate((key) => localStorage.getItem(key), WORKSPACE_KEY),
  ).toBe(JSON.stringify(workspaceV10))
})
