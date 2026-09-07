import type { Page } from '@playwright/test'
import {
  RECOVERY_KEY,
  WORKSPACE_KEY,
  expect,
  seedPersonal,
  test,
} from './fixtures'
import workspaceV7 from '../fixtures/workspace-v7.json' with { type: 'json' }
import recoveryV6 from '../fixtures/recovery-v6.json' with { type: 'json' }

async function openPortfolio(page: Page, ordinary = 1_000_000) {
  await seedPersonal(page)
  await page.goto('/check/receipts')
  await page.locator('#grossReceipts').fill(String(ordinary * 2))
  await page.locator('#declaredProfit').fill(String(ordinary))
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL(/\/check\/other-income$/)
  await page.locator('#taxableBankInterest').fill('0')
  await page.locator('#tds').fill('0')
  await page
    .locator('#hasEquityGains')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await page
    .locator('#equityGainsConfirmed')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
}
async function enterPortfolio(
  page: Page,
  gainsAndLosses: readonly [string, string, string, string],
) {
  for (const [index, id] of [
    'shortTermGains',
    'shortTermLosses',
    'longTermGains',
    'longTermLosses',
  ].entries())
    await page.locator(`#${id}`).fill(gainsAndLosses[index])
}
async function calculate(page: Page) {
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page).toHaveURL(/\/plan$/)
}
async function save(page: Page) {
  await page
    .getByRole('button', { name: 'Save data in this browser', exact: true })
    .click()
  await page
    .getByRole('dialog', { name: 'Save data in this browser?', exact: true })
    .getByRole('button', { name: 'Save data', exact: true })
    .click()
}

test('accepts positive net portfolios and exposes loss pairings through save and reload', async ({
  page,
}) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await openPortfolio(page)
  await enterPortfolio(page, ['200000', '50000', '300000', '75000'])
  await page.reload()
  await expect(page.locator('#shortTermLosses')).toHaveValue('50,000')
  await calculate(page)
  await expect(page.locator('.tax-summary h2')).toHaveText('₹85,800')
  await expect(
    page.getByRole('heading', { name: 'Unused capital losses' }),
  ).toHaveCount(0)
  await page
    .getByText('How this estimate was calculated', { exact: true })
    .click()
  const list = page.locator('.calculation-list')
  for (const [label, amount] of [
    ['Long-term losses used against long-term gains', '−₹75,000'],
    ['Short-term losses used against short-term gains', '−₹50,000'],
    ['Short-term losses used against long-term gains', '−₹0'],
    ['Short-term gains after loss adjustment', '₹1,50,000'],
    ['Long-term gains after loss adjustment', '₹2,25,000'],
    ['Long-term gains taxed at 12.5%', '₹1,00,000'],
  ])
    await expect(
      list
        .locator('div')
        .filter({ has: page.getByText(label, { exact: true }) })
        .locator('dd'),
    ).toHaveText(amount)
  await save(page)
  await page.reload()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹85,800')
  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
    WORKSPACE_KEY,
  )
  expect(stored).toMatchObject({
    schemaVersion: 9,
    active: {
      profile: {
        otherIncome: {
          equityGains: {
            shortTermGains: 200_000,
            shortTermLosses: 50_000,
            longTermGains: 300_000,
            longTermLosses: 75_000,
          },
        },
      },
    },
  })
  expect(
    requests.some((url) =>
      /shortTermLosses|longTermLosses|50000|75000|85800/.test(url),
    ),
  ).toBe(false)
  await expect(page).toHaveURL(/\/plan$/)
})

test('shows unused losses and timely filing guidance even when tax is zero at all supported widths', async ({
  page,
}, testInfo) => {
  await openPortfolio(page, 100_000)
  await enterPortfolio(page, ['10000', '50000', '20000', '40000'])
  await calculate(page)
  await expect(page.locator('.tax-summary h2')).toHaveText('₹0')
  const notice = page.getByRole('region', { name: 'Unused capital losses' })
  await expect(notice).toContainText('Short-term: ₹40,000. Long-term: ₹20,000.')
  await expect(notice).toContainText('31 August 2027')
  await expect(notice).toContainText('8 tax years immediately following')
  await expect(notice).toContainText('determination of the loss')
  await expect(
    page.getByRole('heading', {
      name: 'File a return to claim capital-loss carry-forward',
      level: 2,
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    page.getByText('How this estimate was calculated', { exact: true }),
  ).toBeVisible()
  expect(
    await page.locator('.calculation-details').getAttribute('open'),
  ).toBeNull()
  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    await notice
      .getByRole('heading')
      .evaluate((element) => element.scrollIntoView({ block: 'center' }))
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath(`unused-loss-${width}.png`),
    })
  }
  await save(page)
  await page.reload()
  await expect(notice).toContainText('₹40,000')
  await expect(page.locator('.tax-summary h2')).toHaveText('₹0')
})

test('reassesses basic exemption after loss set-off and clears all four amounts', async ({
  page,
}, testInfo) => {
  await openPortfolio(page, 300_000)
  await enterPortfolio(page, ['50000', '25000', '300000', '0'])
  await expect(page.locator('#equityGainsConfirmed-unsupported')).toContainText(
    'remaining after loss adjustment',
  )
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled()
  await page.locator('#shortTermLosses').fill('75000')
  await expect(page.locator('#equityGainsConfirmed-unsupported')).toHaveCount(0)
  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page
      .locator('#longTermLosses')
      .evaluate((element) => element.scrollIntoView({ block: 'center' }))
    await expect(page.locator('#longTermLosses')).toBeInViewport()
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath(`loss-fields-${width}.png`),
    })
  }
  await calculate(page)
  await expect(page.locator('.tax-summary h2')).toHaveText('₹6,500')
  await page.goto('/check/other-income')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const no = page
    .locator('#hasEquityGains')
    .getByRole('radio', { name: 'No', exact: true })
  await no.focus()
  await page.keyboard.press('Space')
  await expect(page.locator('#shortTermLosses')).toHaveCount(0)
  await page
    .locator('#hasEquityGains')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  for (const id of [
    'shortTermGains',
    'shortTermLosses',
    'longTermGains',
    'longTermLosses',
  ])
    await expect(page.locator(`#${id}`)).toHaveValue('')
  await expect(
    page
      .locator('#equityGainsConfirmed')
      .getByRole('radio', { name: 'Yes', exact: true }),
  ).toHaveAttribute('aria-checked', 'false')
})

test('migrates the captured equity workspace without changing its gains or completion records', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem('test:loss-history')) return
      localStorage.setItem(key, value)
      sessionStorage.setItem('test:loss-history', 'yes')
    },
    { key: WORKSPACE_KEY, value: JSON.stringify(workspaceV7) },
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
  ).toMatchObject({ schemaVersion: 7 })
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
    schemaVersion: 9,
    consentDecidedAt: workspaceV7.consentDecidedAt,
    active: {
      completions: workspaceV7.active.completions,
      profile: {
        otherIncome: {
          equityGains: {
            shortTermGains: 100_000,
            longTermGains: 200_000,
            shortTermLosses: 0,
            longTermLosses: 0,
          },
        },
      },
    },
  })
})

test('restores historical Recovery with gains preserved but loss amounts and expanded confirmation unanswered', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem('test:loss-history')) return
      sessionStorage.setItem(key, value)
      sessionStorage.setItem('test:loss-history', 'yes')
    },
    { key: RECOVERY_KEY, value: JSON.stringify(recoveryV6) },
  )
  await page.goto('/check/other-income')
  await expect(page.locator('#shortTermGains')).toHaveValue('1,00,000')
  await expect(page.locator('#shortTermLosses')).toHaveValue('')
  await expect(page.locator('#longTermLosses')).toHaveValue('')
  await expect(
    page
      .locator('#equityGainsConfirmed')
      .getByRole('radio', { name: 'Yes', exact: true }),
  ).toHaveAttribute('aria-checked', 'false')
  await page.locator('#shortTermLosses').fill('12000')
  await page.reload()
  await expect(page.locator('#shortTermLosses')).toHaveValue('12,000')
  await expect(page.locator('#longTermLosses')).toHaveValue('')
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled()
})
