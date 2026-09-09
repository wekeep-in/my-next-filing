import { expect, questionField, seedPersonal, test } from './fixtures'

test('closed cards retain incomplete feedback and completed answers get a tick', async ({
  page,
}, testInfo) => {
  await seedPersonal(page)
  await page.goto('/check/income')
  await expect(page.locator('.question-disclosure')).toHaveCount(7)
  const salary = page
    .locator('.question-disclosure')
    .filter({ has: page.locator('#salary-title') })
  const interest = page
    .locator('.question-disclosure')
    .filter({ has: page.locator('#other-interest-title') })
  await expect(
    salary.getByRole('img', { name: 'Salary: all answers complete' }),
  ).toBeVisible()
  await (
    await questionField(page, '#hasSalary')
  )
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await interest
    .locator('.question-card-trigger')
    .click({ position: { x: 12, y: 12 } })
  const status = salary.getByRole('button', {
    name: 'Salary: answers to check help',
    exact: true,
  })
  await status.click()
  await expect(page.getByRole('tooltip')).toContainText(
    'answers need attention',
  )
  await expect(salary.locator('.question-card-trigger')).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  await expect(interest.locator('.question-card-trigger')).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  await expect(salary.getByRole('img')).toHaveCount(0)
  expect(
    await status.evaluate((icon) => ({
      width: icon.getBoundingClientRect().width,
      background: getComputedStyle(icon).backgroundColor,
    })),
  ).toEqual({ width: 18, background: 'rgba(0, 0, 0, 0)' })
  await page.keyboard.press('Escape')
  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({
      path: testInfo.outputPath(`accordion-${width}.png`),
      fullPage: true,
    })
  }

  await (
    await questionField(page, '#hasSalary')
  )
    .getByRole('radio', { name: 'No', exact: true })
    .click()
  await expect(
    salary.getByRole('img', { name: 'Salary: all answers complete' }),
  ).toBeVisible()
})

test('question cards animate with a separator and preserve immediate input focus', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/income')
  const interest = page
    .locator('.question-disclosure')
    .filter({ has: page.locator('#other-interest-title') })
  const panel = interest.locator('.question-panel')
  await panel.evaluate((node) => {
    node.addEventListener('transitionrun', (event) => {
      if (event instanceof TransitionEvent && event.propertyName === 'height')
        node.setAttribute('data-test-animated', 'true')
    })
  })
  await interest
    .locator('.question-card-trigger')
    .click({ position: { x: 12, y: 12 } })
  await page.locator('#taxableBankInterest').fill('0')
  await expect(page.locator('#taxableBankInterest')).toHaveValue('0')
  await expect(panel).toHaveAttribute('data-test-animated', 'true')
  expect(
    await panel
      .locator('.question-section')
      .evaluate((node) => getComputedStyle(node).borderTopWidth),
  ).toBe('1px')
  const inset = await interest.evaluate((card) => {
    const outer = card.getBoundingClientRect()
    const inner = card
      .querySelector('.question-section')!
      .getBoundingClientRect()
    return { left: inner.left - outer.left, right: outer.right - inner.right }
  })
  expect(inset.left).toBeLessThanOrEqual(1)
  expect(inset.right).toBeLessThanOrEqual(1)
  expect(Math.abs(inset.left - inset.right)).toBeLessThan(1)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(
    await panel.evaluate((node) => getComputedStyle(node).transitionDuration),
  ).toBe('0s')
})

test('taxes and GST share a step with additional sections for a normal registration', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/taxes-and-gst')
  await expect(page.locator('.question-disclosure')).toHaveCount(3)
  await expect(await questionField(page, '#aggregateTurnover')).toBeVisible()
  await page
    .locator('#gstKind')
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await expect(page.locator('.question-disclosure')).toHaveCount(3)
  await page
    .locator('#gstStatus')
    .getByRole('radio', {
      name: 'One active GSTIN as a normal taxpayer',
      exact: true,
    })
    .click()
  await expect(page.locator('.question-disclosure')).toHaveCount(5)
  await expect(page.locator('#gstState')).toBeVisible()
  await page
    .locator('#gstKind')
    .getByRole('radio', { name: 'No', exact: true })
    .click()
  await expect(page.locator('.question-disclosure')).toHaveCount(3)
  await expect(await questionField(page, '#aggregateTurnover')).toBeVisible()
})
