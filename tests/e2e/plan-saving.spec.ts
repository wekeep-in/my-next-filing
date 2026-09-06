import { WORKSPACE_KEY, expect, seedPersonal, stored, test } from './fixtures'

test('cancels consent without saving and returns focus after a successful save', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/plan')
  const save = page.getByRole('button', {
    name: 'Save data in this browser',
    exact: true,
  })
  const dialog = page.getByRole('dialog', {
    name: 'Save data in this browser?',
    exact: true,
  })
  const before = await stored(page)
  await save.click()
  await expect(dialog.getByRole('heading')).toBeFocused()
  await expect(dialog).toContainText(
    'Anyone using this browser profile may be able to see them',
  )
  await expect(dialog).toContainText(
    'There is no account, sync, backup, or recovery',
  )
  await expect(dialog).toContainText(
    'Private browsing or clearing site data may remove them',
  )
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(save).toBeFocused()
  expect(await stored(page)).toEqual(before)
  await save.click()
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(save).toBeFocused()
  expect(await stored(page)).toEqual(before)
  await save.click()
  await dialog.getByRole('button', { name: 'Save data', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(save).toHaveCount(0)
  await expect(
    page
      .locator('.attention-action')
      .getByRole('button', { name: 'Update amount paid', exact: true }),
  ).toBeFocused()
  expect((await stored(page)).local).not.toBeNull()
})

test('keeps a saving failure and retry inside the consent dialog', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/plan')
  const before = await stored(page)
  await page.evaluate((workspaceKey) => {
    // oxlint-disable-next-line typescript/unbound-method -- The Storage receiver is supplied with call below.
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (this === localStorage && key === workspaceKey) {
        Storage.prototype.setItem = original
        throw new DOMException('Synthetic quota failure', 'QuotaExceededError')
      }
      original.call(this, key, value)
    }
  }, WORKSPACE_KEY)
  await page
    .getByRole('button', { name: 'Save data in this browser', exact: true })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Save data in this browser?',
    exact: true,
  })
  await dialog.getByRole('button', { name: 'Save data', exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText(
    'Your current work remains in this tab',
  )
  expect(await stored(page)).toEqual(before)
  await dialog.getByRole('button', { name: 'Save data', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  expect((await stored(page)).local).not.toBeNull()
})
