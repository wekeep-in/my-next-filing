import {
  RECOVERY_KEY,
  WORKSPACE_KEY,
  expect,
  questionField,
  seedPersonal,
  test,
} from './fixtures'
import workspaceV5 from '../fixtures/workspace-v5.json' with { type: 'json' }
import recoveryV4 from '../fixtures/recovery-v4.json' with { type: 'json' }

test.use({ hasTouch: true })

test('keeps employer NPS through Recovery, review, saving and reload', async ({
  page,
}) => {
  const requests: string[] = []
  page.on('request', (request) =>
    requests.push(`${request.url()} ${request.postData() ?? ''}`),
  )
  await seedPersonal(page)
  await page.goto('/check/income')
  for (const id of [
    'hasSalary',
    'salaryConfirmed',
    'hasEmployerNps',
    'employerNpsConfirmed',
  ])
    await (
      await questionField(page, `#${id}`)
    )
      .getByRole('radio', { name: 'Yes', exact: true })
      .click()
  await page
    .getByLabel('Annual salary before standard deduction', { exact: true })
    .fill('1140000')
  await page
    .getByLabel('Employer 1 NPS contribution', { exact: true })
    .fill('70000')
  await page
    .getByLabel('Employer 1 Basic pay and eligible DA', { exact: true })
    .fill('500000')
  await page
    .getByRole('button', { name: 'Add another employer', exact: true })
    .click()
  await page
    .getByLabel('Employer 2 NPS contribution', { exact: true })
    .fill('70000')
  await page
    .getByLabel('Employer 2 Basic pay and eligible DA', { exact: true })
    .fill('500000')
  await page.reload()
  await expect(
    page.getByLabel('Employer 2 NPS contribution', { exact: true }),
  ).toHaveValue('70,000')
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page).toHaveURL(/\/check\/clients$/)
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page).toHaveURL(/\/check\/taxes-and-gst$/)
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByRole('button', { name: 'Other income', exact: true }).click()
  await expect(
    page.getByText('Employer 2 basic pay and eligible DA', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await expect(page).toHaveURL(/\/plan$/)
  await expect(page.locator('.tax-summary h2')).toHaveText('₹2,55,100')
  await page
    .getByText('How this estimate was calculated', { exact: true })
    .click()
  const breakdown = page.locator('.calculation-list')
  await expect(breakdown).toContainText('Income before employer NPS deduction')
  await expect(breakdown).toContainText('₹24,75,000')
  await expect(breakdown).toContainText('₹23,35,000')
  await expect(breakdown).toContainText('−₹1,40,000')
  await page
    .getByRole('button', { name: 'Save data in this browser', exact: true })
    .click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Save data', exact: true })
    .click()
  await page.reload()
  await expect(page.locator('.tax-summary h2')).toHaveText('₹2,55,100')
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
    WORKSPACE_KEY,
  )
  expect(saved).toMatchObject({
    schemaVersion: 11,
    active: {
      profile: {
        otherIncome: {
          salary: {
            employerNps: {
              kind: 'contributions',
              employers: [
                { contribution: 70_000, eligibleSalary: 500_000 },
                { contribution: 70_000, eligibleSalary: 500_000 },
              ],
            },
          },
        },
      },
    },
  })
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), RECOVERY_KEY),
  ).toBeNull()
  expect(page.url()).not.toMatch(/70000|500000|1140000/)
  expect(await page.title()).not.toMatch(/70000|500000|1140000/)
  expect(requests.join('\n')).not.toMatch(/70000|500000|1140000/)
  for (const href of await page
    .locator('a[href^="https:"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!)))
    expect(href).not.toMatch(/70000|500000|1140000/)
})

test('keeps NPS fields and help usable across viewports and clears deselected contributions', async ({
  page,
}, testInfo) => {
  await seedPersonal(page)
  await page.goto('/check/income')
  await (
    await questionField(page, '#hasSalary')
  )
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  // The temporary Recovery banner changes page geometry when it disappears.
  const recoveryNotice = page.getByText(
    'Your answers will stay available if you refresh this tab. Closing the tab may remove them.',
    { exact: true },
  )
  await expect(recoveryNotice).toBeVisible()
  await expect(recoveryNotice).toHaveCount(0)
  await (
    await questionField(page, '#hasEmployerNps')
  )
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  const help = page.getByRole('button', {
    name: 'Which NPS amounts are covered?',
    exact: true,
  })
  await help.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', {
    name: 'Which NPS amounts are covered?',
    exact: true,
  })
  await expect(dialog.getByRole('heading')).toBeFocused()
  await expect(dialog).toContainText('14%')
  await page.keyboard.press('Escape')
  await expect(help).toBeFocused()
  const contributionHelp = page.getByRole('button', {
    name: 'Employer 1 NPS contribution help',
    exact: true,
  })
  await page
    .getByLabel('Employer 1 NPS contribution', { exact: true })
    .fill('0')
  await page.keyboard.press('Shift+Tab')
  await expect(contributionHelp).toBeFocused()
  await expect(page.getByRole('tooltip')).toContainText(
    'not your account balance or your own contribution',
  )
  await page.keyboard.press('Escape')
  await expect(page.getByRole('tooltip')).toHaveCount(0)
  await expect(contributionHelp).toBeFocused()
  for (const width of [1440, 1024, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    await (
      await questionField(page, '#hasEmployerNps')
    ).scrollIntoViewIfNeeded()
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    const sections = await page
      .locator('.question-disclosure')
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          gap: getComputedStyle(node.querySelector('.question-section')!)
            .rowGap,
          headingSize: getComputedStyle(node.querySelector('h2')!).fontSize,
        })),
      )
    expect(new Set(sections.map((section) => section.gap)).size).toBe(1)
    expect(new Set(sections.map((section) => section.headingSize)).size).toBe(1)
    await page.screenshot({ path: testInfo.outputPath(`nps-${width}.png`) })
    await page
      .getByLabel('Employer 1 Basic pay and eligible DA', { exact: true })
      .scrollIntoViewIfNeeded()
    await page.screenshot({
      path: testInfo.outputPath(`nps-amounts-${width}.png`),
    })
    const card = page.getByRole('group', { name: 'Employer 1', exact: true })
    await expect(card).toBeVisible()
    await expect(card.locator('.field-help')).toHaveCount(0)
    const fields = await card.locator('input').evaluateAll((inputs) =>
      inputs.map((input) => {
        const rect = input.getBoundingClientRect()
        return { top: rect.top, left: rect.left, bottom: rect.bottom }
      }),
    )
    if (width >= 1024) {
      expect(Math.abs(fields[0].top - fields[1].top)).toBeLessThan(1)
      expect(fields[1].left).toBeGreaterThan(fields[0].left)
    } else {
      expect(fields[1].top).toBeGreaterThan(fields[0].bottom)
      expect(Math.abs(fields[0].left - fields[1].left)).toBeLessThan(1)
    }
    await card.screenshot({
      path: testInfo.outputPath(`nps-card-${width}.png`),
    })
    if (width === 320) {
      const salaryHelp = card.getByRole('button', {
        name: 'Employer 1 basic pay and eligible DA help',
        exact: true,
      })
      await salaryHelp.tap()
      await expect(page.getByRole('tooltip')).toContainText(
        'qualifies under your employment terms',
      )
      await page.screenshot({
        path: testInfo.outputPath('nps-tooltip-mobile.png'),
      })
      await salaryHelp.tap()
      await expect(page.getByRole('tooltip')).toHaveCount(0)
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const contribution = page.getByLabel('Employer 1 NPS contribution', {
    exact: true,
  })
  await contribution.fill('12345')
  await page
    .getByRole('button', { name: 'Add another employer', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Remove employer 2', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Add another employer', exact: true }),
  ).toBeFocused()
  await expect(contribution).toHaveValue('12,345')
  await (
    await questionField(page, '#hasEmployerNps')
  )
    .getByRole('radio', { name: 'No', exact: true })
    .click()
  await expect(contribution).toHaveCount(0)
  await (
    await questionField(page, '#hasEmployerNps')
  )
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await expect(contribution).toHaveValue('')
  await (
    await questionField(page, '#hasSalary')
  )
    .getByRole('radio', { name: 'No', exact: true })
    .click()
  // Recovery writes follow the React commit; reload only after this answer is stored.
  await expect
    .poll(async () => {
      const raw = await page.evaluate(
        (key) => sessionStorage.getItem(key),
        RECOVERY_KEY,
      )
      return raw ? (JSON.parse(raw) as unknown) : null
    })
    .toMatchObject({
      draft: { hasSalary: 'no', hasEmployerNps: '', employerNpsEmployers: [] },
    })
  await page.reload()
  await expect(page.locator('#hasEmployerNps')).toHaveCount(0)
})

test('migrates the captured salary workspace without changing consent or completion dates', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem('test:historical')) return
      localStorage.setItem(key, value)
      sessionStorage.setItem('test:historical', 'yes')
    },
    { key: WORKSPACE_KEY, value: JSON.stringify(workspaceV5) },
  )
  await page.goto('/plan')
  await expect(
    page.getByRole('heading', { name: 'Your plan', exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate((key) => localStorage.getItem(key), WORKSPACE_KEY),
  ).toBe(JSON.stringify(workspaceV5))
  await page
    .locator('.attention-action')
    .getByRole('button', { name: 'Update amount paid', exact: true })
    .click()
  await (await questionField(page, '#advance-tax-update')).fill('1000')
  await page
    .getByRole('button', { name: 'Update and recalculate', exact: true })
    .click()
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!) as unknown,
    WORKSPACE_KEY,
  )
  expect(saved).toMatchObject({
    schemaVersion: 11,
    consentDecidedAt: workspaceV5.consentDecidedAt,
    active: {
      completions: workspaceV5.active.completions,
      profile: {
        otherIncome: {
          salary: { grossSalary: 1_000_000, employerNps: { kind: 'none' } },
        },
      },
    },
  })
})

test('restores historical salary Recovery with the new NPS answer blank', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem('test:historical')) return
      sessionStorage.setItem(key, value)
      sessionStorage.setItem('test:historical', 'yes')
    },
    { key: RECOVERY_KEY, value: JSON.stringify(recoveryV4) },
  )
  await page.goto('/check/income')
  await expect(
    page.getByLabel('Annual salary before standard deduction', { exact: true }),
  ).toHaveValue('10,00,000')
  const no = (await questionField(page, '#hasEmployerNps')).getByRole('radio', {
    name: 'No',
    exact: true,
  })
  await expect(no).toHaveAttribute('aria-checked', 'false')
  await no.click()
  await page.reload()
  await expect(
    (await questionField(page, '#hasEmployerNps')).getByRole('radio', {
      name: 'No',
      exact: true,
    }),
  ).toHaveAttribute('aria-checked', 'true')
})
