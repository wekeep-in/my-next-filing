import { expect, questionField, seedPersonal, stored, test } from './fixtures'

test('validates amounts and keeps fictional navigation separate from personal Recovery', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/income?example=1')
  const before = await stored(page)
  const profit = page.locator('#declaredProfit')
  const original = await profit.inputValue()
  const review = page.getByRole('button', {
    name: '5. Review your answers',
    exact: true,
  })
  const next = page.getByRole('button', { name: 'Continue', exact: true })
  await profit.fill('100')
  await expect(page.locator('#declaredProfit-unsupported')).toBeVisible()
  await expect(next).toBeDisabled()
  await expect(review).toBeDisabled()
  for (const invalid of ['abc', '1e6', '-100', '12.5']) {
    await profit.fill(invalid)
    await expect(profit).toHaveValue('100')
  }
  await profit.fill('')
  await profit.blur()
  await expect(page.locator('#declaredProfit-error')).toBeVisible()
  await profit.fill(original)
  await expect(next).toBeEnabled()
  await expect(review).toBeEnabled()
  await next.click()
  await expect(page).toHaveURL(/\/check\/clients\?example=1$/)
  await page
    .getByRole('button', {
      name: '4. Taxes and GST',
      exact: true,
    })
    .click()
  await (
    await questionField(page, '#compulsoryRegistration')
  )
    .getByText('Not sure', { exact: true })
    .click()
  await expect(page.locator('#compulsoryRegistration-coverage')).toBeVisible()
  await expect(next).toBeEnabled()
  await expect(review).toBeEnabled()
  await next.click()
  await expect(page).toHaveURL(/\/check\/review\?example=1$/)
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page).toHaveURL(/\/plan\?example=1$/)
  await page.getByRole('button', { name: 'Start over', exact: true }).click()
  await expect(page).toHaveURL(/\?example=1$/)
  expect(await stored(page)).toEqual(before)
  await page
    .getByRole('button', { name: 'Return to your estimate', exact: true })
    .click()
  await expect(page).toHaveURL(/\/plan$/)
  await page.goBack()
  await expect(page).toHaveURL(/\?example=1$/)
  await expect(
    page.getByText('Fictional example.', { exact: true }),
  ).toBeVisible()
  await page.goForward()
  await expect(page).toHaveURL(/\/plan$/)
  await expect(
    page.getByText('Fictional example.', { exact: true }),
  ).toHaveCount(0)
  expect(await stored(page)).toEqual(before)
})
