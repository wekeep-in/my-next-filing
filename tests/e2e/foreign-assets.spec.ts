import {
  RECOVERY_KEY,
  WORKSPACE_KEY,
  expect,
  seedPersonal,
  test,
} from './fixtures'
import type { Page } from '@playwright/test'
import recoveryV8 from '../fixtures/recovery-v8.json' with { type: 'json' }
import workspaceV9 from '../fixtures/workspace-v9.json' with { type: 'json' }

async function choose(page: Page, id: string, name: string) {
  await page.locator(`#${id}`).getByRole('radio', { name, exact: true }).click()
}

test('established foreign assets reach the disclosure card and survive saving and reload without changing tax', async ({
  page,
}) => {
  const remote: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).hostname !== '127.0.0.1')
      remote.push(request.url())
  })
  await seedPersonal(page)
  await page.goto('/check/other-income')
  await choose(page, 'hasForeignAssets', 'Yes')
  await choose(page, 'assetIncomeConfirmed', 'Yes')
  await page.reload()
  await expect(
    page
      .locator('#hasForeignAssets')
      .getByRole('radio', { name: 'Yes', exact: true }),
  ).toBeChecked()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(
    page.getByText('Foreign assets or signing authority', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹55,160')
  const card = page.getByRole('article').filter({
    has: page.getByRole('heading', {
      name: 'Foreign assets and accounts',
      exact: true,
    }),
  })
  await expect(card).toContainText('ITR-4')
  await expect(card).toContainText('reporting period')
  await expect(
    page.getByRole('heading', {
      name: 'Foreign-asset and receipt check',
      exact: true,
    }),
  ).toHaveCount(0)
  await page
    .getByRole('button', { name: 'Save data in this browser', exact: true })
    .click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Save data', exact: true })
    .click()
  await page.reload()
  await expect(card).toBeVisible()
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
      WORKSPACE_KEY,
    ),
  ).toMatchObject({
    schemaVersion: 10,
    active: {
      profile: {
        otherIncome: {
          foreignAssets: { kind: 'held', incomeConfirmed: 'yes' },
        },
      },
    },
  })
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), RECOVERY_KEY),
  ).toBeNull()
  expect(page.url()).not.toMatch(/foreignAssets|assetIncome|held|55160/)
  expect(await page.title()).not.toMatch(/foreignAssets|assetIncome|held|55160/)
  expect(remote).toEqual([])
})

test('classification uncertainty permits a partial plan but unresolved income blocks progress', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/other-income')
  const next = page.getByRole('button', { name: 'Continue', exact: true })
  await choose(page, 'hasForeignAssets', 'Not sure')
  await choose(page, 'assetIncomeConfirmed', 'Not sure')
  await expect(page.locator('#assetIncomeConfirmed-unsupported')).toBeVisible()
  await expect(next).toBeDisabled()
  await choose(page, 'assetIncomeConfirmed', 'Yes')
  await expect(page.locator('#hasForeignAssets-coverage')).toContainText(
    'classification',
  )
  await expect(next).toBeEnabled()
  await next.click()
  await next.click()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹55,160')
  const review = page.getByRole('article').filter({
    has: page.getByRole('heading', {
      name: 'Foreign-asset and receipt check',
      exact: true,
    }),
  })
  await expect(review).toContainText('unresolved')
  await review
    .getByRole('button', {
      name: 'Review income and tax paid',
      exact: true,
    })
    .click()
  await expect(page).toHaveURL(/\/check\/other-income$/)
  await choose(page, 'hasForeignAssets', 'No')
  await expect(page.locator('#assetIncomeConfirmed')).toHaveCount(0)
})

test('foreign-asset help and guidance fit desktop tablet and mobile with keyboard focus', async ({
  page,
}, testInfo) => {
  await seedPersonal(page)
  await page.goto('/check/other-income')
  await choose(page, 'hasForeignAssets', 'Yes')
  const help = page.getByRole('button', {
    name: 'Learn more about foreign assets and signing authority',
    exact: true,
  })
  await help.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', {
    name: 'Which overseas arrangements count?',
  })
  await expect(dialog.getByRole('heading')).toBeFocused()
  await expect(dialog).toContainText('provider brand')
  await page.keyboard.press('Escape')
  await expect(help).toBeFocused()
  await choose(page, 'assetIncomeConfirmed', 'Yes')
  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    await page.locator('#assetIncomeConfirmed').scrollIntoViewIfNeeded()
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath(`foreign-assets-${width}.png`),
    })
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await choose(page, 'hasForeignAssets', 'No')
  await choose(page, 'hasForeignAssets', 'Yes')
  await expect(
    page
      .locator('#assetIncomeConfirmed')
      .getByRole('radio', { name: 'Yes', exact: true }),
  ).not.toBeChecked()
})

test('historical Recovery retains the foreign-assets exclusion until the new scope is reviewed', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem('test:historical')) return
      sessionStorage.setItem('test:historical', 'yes')
      sessionStorage.setItem(key, JSON.stringify(value))
    },
    {
      key: RECOVERY_KEY,
      value: {
        ...recoveryV8,
        draft: {
          ...recoveryV8.draft,
          unsupportedCertainty: 'selected',
          unsupportedFacts: ['foreignAssets'],
        },
      },
    },
  )
  await page.goto('/check/other-income')
  await expect(page.locator('#taxableBankInterest')).toHaveValue('10,000')
  await expect(
    page
      .locator('#hasForeignAssets')
      .getByRole('radio', { name: 'No', exact: true }),
  ).not.toBeChecked()
  await choose(page, 'hasForeignAssets', 'Yes')
  await choose(page, 'assetIncomeConfirmed', 'Yes')
  const legacy = page.getByRole('checkbox', {
    name: 'Foreign assets needing a separate review',
    exact: true,
  })
  await expect(legacy).toBeChecked()
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled()
  await legacy.uncheck()
  await page
    .getByRole('radio', { name: 'None of these apply', exact: true })
    .check()
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeEnabled()
})

test('historical saved data remains unchanged on load and upgrades only through a normal write', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem('test:historical')) return
      sessionStorage.setItem('test:historical', 'yes')
      localStorage.setItem(key, JSON.stringify(value))
    },
    { key: WORKSPACE_KEY, value: workspaceV9 },
  )
  await page.goto('/plan')
  await expect(page.locator('.tax-summary h2')).toHaveText('₹55,160')
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
      WORKSPACE_KEY,
    ),
  ).toMatchObject({ schemaVersion: 9 })
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
    schemaVersion: 10,
    active: {
      completions: workspaceV9.active.completions,
      profile: { otherIncome: { foreignAssets: { kind: 'none' } } },
    },
  })
})

test('a nil-tax freelancer with foreign assets sees the annual return as the next action', async ({
  page,
}, testInfo) => {
  await seedPersonal(page)
  await page.goto('/check/receipts')
  await page.locator('#grossReceipts').fill('0')
  await page.locator('#declaredProfit').fill('0')
  await page.goto('/check/other-income')
  await page.locator('#taxableBankInterest').fill('0')
  await page.locator('#tds').fill('0')
  await choose(page, 'hasForeignAssets', 'Yes')
  await choose(page, 'assetIncomeConfirmed', 'Yes')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.locator('#aggregateTurnover').fill('0')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹0')
  const nextAction = page.getByRole('region', {
    name: 'File the annual income-tax return',
    exact: true,
  })
  await expect(
    nextAction.getByRole('heading', {
      name: 'File the annual income-tax return',
      exact: true,
    }),
  ).toBeVisible()
  await expect(nextAction).toContainText('31 August 2027')
  const card = page.getByRole('article').filter({
    has: page.getByRole('heading', {
      name: 'Foreign assets and accounts',
      exact: true,
    }),
  })
  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    await card.scrollIntoViewIfNeeded()
    await expect(card).toContainText('ITR-4')
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath(`asset-plan-${width}.png`),
    })
  }
})
