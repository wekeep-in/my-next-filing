import {
  RECOVERY_KEY,
  expect,
  questionField,
  seedPersonal,
  test,
} from './fixtures'
import recoveryV4 from '../fixtures/recovery-v4.json' with { type: 'json' }

const situationKeys = [
  'otherIncome',
  'salaryInvestments',
  'overseasIncomeTax',
  'businessTax',
] as const

test('fit scope questions replace checkboxes and block an unsupported answer', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/fit')
  await expect(page.locator('.question-disclosure')).toHaveCount(8)
  for (const key of situationKeys)
    await expect(
      (
        await questionField(page, `#unsupportedSituationAnswers-${key}`)
      ).getByRole('radio', { name: 'No', exact: true }),
    ).toBeChecked()
  await expect(page.locator('input[type="checkbox"]')).toHaveCount(0)

  await (
    await questionField(page, '#unsupportedSituationAnswers-otherIncome')
  )
    .getByRole('radio', { name: 'Yes', exact: true })
    .check()
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled()
  await page.reload()
  await expect(
    (
      await questionField(page, '#unsupportedSituationAnswers-otherIncome')
    ).getByRole('radio', { name: 'Yes', exact: true }),
  ).toBeChecked()
})

test('each fit scope group accepts Not sure and retains its answer', async ({
  page,
}) => {
  await seedPersonal(page)
  await page.goto('/check/fit')
  for (const key of situationKeys) {
    await (
      await questionField(page, `#unsupportedSituationAnswers-${key}`)
    )
      .getByRole('radio', { name: 'Not sure', exact: true })
      .check()
  }
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled()
  await page.reload()
  await expect(
    (
      await questionField(page, '#unsupportedSituationAnswers-businessTax')
    ).getByRole('radio', { name: 'Not sure', exact: true }),
  ).toBeChecked()
})

test('legacy unsupported facts migrate into the relevant fit question', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => sessionStorage.setItem(key, JSON.stringify(value)),
    {
      key: RECOVERY_KEY,
      value: {
        ...recoveryV4,
        draft: {
          ...recoveryV4.draft,
          unsupportedCertainty: 'selected',
          unsupportedFacts: ['salary'],
        },
      },
    },
  )
  await page.goto('/check/fit')
  await expect(
    (
      await questionField(
        page,
        '#unsupportedSituationAnswers-salaryInvestments',
      )
    ).getByRole('radio', { name: 'Yes', exact: true }),
  ).toBeChecked()
})
