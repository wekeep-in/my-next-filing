import { expect, questionField, seedPersonal, test } from './fixtures'

test('tax-paid choices control fields, validation, recovery and later plan payment updates', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/income')
  await expect(page.locator('#hasTaxPaid')).toHaveCount(0)
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page).toHaveURL(/\/check\/clients$/)
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page).toHaveURL(/\/check\/taxes-and-gst$/)
  const choose = async (name: string) =>
    (await questionField(page, '#hasTaxPaid'))
      .getByRole('radio', { name, exact: true })
      .click()
  const next = page.getByRole('button', { name: 'Next', exact: true })
  await choose('Not sure')
  await expect(page.locator('#tds')).toHaveCount(0)
  await expect(next).toBeDisabled()
  await expect(page.locator('#hasTaxPaid-error')).toContainText(
    'from your records',
  )
  await page.reload()
  await expect(
    (await questionField(page, '#hasTaxPaid')).getByRole('radio', {
      name: 'Not sure',
      exact: true,
    }),
  ).toBeChecked()
  await choose('Yes')
  for (const id of ['tds', 'tcs', 'advanceTaxPaid'])
    await expect(page.locator(`#${id}`)).toHaveValue('')
  await expect(next).toBeDisabled()
  await page.locator('#tds').fill('1000')
  await page.locator('#tcs').fill('0')
  await page.locator('#advanceTaxPaid').fill('0')
  await expect(next).toBeEnabled()
  await choose('No')
  await expect(page.locator('#tds')).toHaveCount(0)
  await expect(next).toBeEnabled()
  await choose('Yes')
  await expect(page.locator('#tds')).toHaveValue('')
  await expect(next).toBeDisabled()
  await choose('No')
  await page.reload()
  await expect(
    (await questionField(page, '#hasTaxPaid')).getByRole('radio', {
      name: 'No',
      exact: true,
    }),
  ).toBeChecked()
  await next.click()
  await page.getByRole('button', { name: 'Taxes and GST', exact: true }).click()
  await expect(
    page.getByText('Tax credits or advance tax payments', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await page
    .locator('.attention-action')
    .getByRole('button', { name: 'Update amount paid', exact: true })
    .click()
  await page.locator('#advance-tax-update').fill('1000')
  await page
    .getByRole('button', { name: 'Update and recalculate', exact: true })
    .click()
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await page
    .getByRole('button', { name: '4. Taxes and GST', exact: true })
    .click()
  await expect(
    (await questionField(page, '#hasTaxPaid')).getByRole('radio', {
      name: 'Yes',
      exact: true,
    }),
  ).toBeChecked()
  await expect(page.locator('#advanceTaxPaid')).toHaveValue('1,000')
  await expect(page.locator('#tds')).toHaveValue('0')
})
