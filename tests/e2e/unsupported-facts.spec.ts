import { RECOVERY_KEY, expect, seedPersonal, test } from './fixtures'
import { unsupportedFactLabels } from '../../src/routes/check/model'
import recoveryV4 from '../fixtures/recovery-v4.json' with { type: 'json' }

test('card selections block navigation, survive reload, and clear through the global alternatives', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/other-income')
  const field = page.locator('#unsupportedCertainty')
  const next = page.getByRole('button', { name: 'Continue', exact: true })
  const gift = field.getByRole('checkbox', { name: 'Gift income', exact: true })
  const property = field.getByRole('checkbox', {
    name: 'House-property income needing a separate review',
    exact: true,
  })
  const none = field.getByRole('radio', {
    name: 'None of these apply',
    exact: true,
  })
  const unsure = field.getByRole('radio', { name: "I'm not sure", exact: true })
  await expect(field.locator('[data-slot="card"]')).toHaveCount(4)
  await expect(field.getByRole('radio')).toHaveCount(2)
  expect(
    await field
      .locator('input[name="unsupportedFacts"]')
      .evaluateAll((elements) =>
        elements
          .map((element) => element.getAttribute('value') ?? '')
          .sort((a, b) => a.localeCompare(b)),
      ),
  ).toEqual(
    Object.keys(unsupportedFactLabels)
      .filter(
        (key) =>
          key !== 'unsupportedFactsNotSure' && key !== 'dividendsOrGifts',
      )
      .sort((a, b) => a.localeCompare(b)),
  )
  await expect(none).toBeChecked()
  await expect(next).toBeEnabled()
  await field.locator('#situation-gifts-label').click()
  await expect(gift).not.toBeChecked()
  await gift.focus()
  await page.keyboard.press('Space')
  await property.check()
  await expect(none).not.toBeChecked()
  await expect(next).toBeDisabled()
  await expect(page.locator('#unsupportedCertainty-unsupported')).toBeVisible()
  await page.reload()
  await expect(gift).toBeChecked()
  await expect(property).toBeChecked()
  await expect(next).toBeDisabled()
  await unsure.check()
  await expect(gift).not.toBeChecked()
  await expect(property).not.toBeChecked()
  await page.reload()
  await expect(unsure).toBeChecked()
  await expect(next).toBeDisabled()
  await none.check()
  await expect(next).toBeEnabled()
  await gift.check()
  await gift.uncheck()
  await expect(none).not.toBeChecked()
  await expect(next).toBeDisabled()
  await none.check()
  await next.click()
  await expect(page).toHaveURL(/\/check\/gst$/)
  await page
    .getByRole('button', { name: '8. Review your answers', exact: true })
    .click()
  await expect(
    page.getByText('None of these apply', { exact: true }),
  ).toBeVisible()
})

test('a restored combined dividend and gift answer stays visible and blocked until reviewed', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, recovery }) => {
      sessionStorage.setItem(key, JSON.stringify(recovery))
    },
    {
      key: RECOVERY_KEY,
      recovery: {
        ...recoveryV4,
        draft: {
          ...recoveryV4.draft,
          unsupportedCertainty: 'selected',
          unsupportedFacts: ['dividendsOrGifts'],
        },
      },
    },
  )
  await page.goto('/check/other-income')
  const field = page.locator('#unsupportedCertainty')
  const legacy = field.getByRole('checkbox', {
    name: 'Dividends or gifts selected in an earlier version',
    exact: true,
  })
  const gift = field.getByRole('checkbox', { name: 'Gift income', exact: true })
  await expect(legacy).toBeChecked()
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled()
  await gift.check()
  await legacy.click()
  await expect(legacy).toHaveCount(0)
  await expect(gift).toBeChecked()
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled()
})
