import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  errorStep,
  exampleProfile,
  questionnaireGroups,
  questionnaireRouteForGroup,
  questionnaireRoutes,
} from '../../src/routes/check/model'
import { sessionFromProfile } from '../../src/routes/check/session'
import { RECOVERY_KEY, recoveryFromSession } from '../../src/recovery-draft'
import { TAX_YEAR, currentRules } from '../../src/rules'
import { WORKSPACE_KEY, saveSavedWorkspace } from '../../src/workspace'
import { TestStorage } from '../helpers/storage'

export { expect, RECOVERY_KEY, WORKSPACE_KEY }

export async function openQuestionStep(page: Page, step: number) {
  const route = questionnaireRoutes[step]
  if (new URL(page.url()).pathname === `/check/${route.id}`) return
  const menu = page.getByRole('button', { name: /^Show journey steps/ })
  if (
    (await menu.isVisible()) &&
    (await menu.getAttribute('aria-expanded')) !== 'true'
  )
    await menu.click()
  await page
    .getByRole('button', { name: `${step + 1}. ${route.label}`, exact: true })
    .click()
  await expect(page).toHaveURL(new RegExp(`/check/${route.id}(?:\\?|$)`))
}

// Follow the same disclosure controls as a person before interacting with a field.
export async function questionField(page: Page, selector: string) {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const field = page.locator(selector)
  const path = new URL(page.url()).pathname
  if (path.startsWith('/check/') && !(await field.count())) {
    const name = selector
      .slice(1)
      .replace(/-(?:error|unsupported|coverage|help)$/, '')
    const group = questionnaireGroups[errorStep(name)]
    const route = questionnaireRouteForGroup(group.id)
    const step = questionnaireRoutes.findIndex(({ id }) => id === route)
    if (path !== `/check/${route}`) await openQuestionStep(page, step)
  }
  await field.waitFor({ state: 'attached' })
  const section = page
    .locator('.question-disclosure')
    .filter({ has: field })
    .first()
  if (
    (await section.count()) &&
    !(await section.evaluate((element) => element.hasAttribute('data-open')))
  )
    await section
      .locator('.question-card-trigger')
      .click({ position: { x: 12, y: 12 } })
  return field
}
export const now = new Date('2026-09-08T12:00:00+05:30')

export const test = base.extend({
  page: async ({ page }, run) => {
    await page.clock.setFixedTime(now)
    await run(page)
  },
})

export async function seedPersonal(page: Page, withWorkspace = false) {
  const personal = sessionFromProfile(
    {
      ...exampleProfile,
      incomePath: { ...exampleProfile.incomePath, grossReceipts: 2_000_000 },
    },
    { kind: 'personal' },
    '2026-09-08',
  )
  const recovery = recoveryFromSession(personal, TAX_YEAR)
  const saved = saveSavedWorkspace(
    new TestStorage(),
    null,
    {
      noticeVersion: 2,
      consentDecidedAt: now.toISOString(),
      activeTaxYear: TAX_YEAR,
      active: {
        profile: exampleProfile,
        completions: [],
        ruleDatasetId: currentRules.id,
      },
      priorYears: [],
    },
    now,
  )
  expect(recovery).not.toBeNull()
  expect(saved.kind).toBe('saved')
  if (saved.kind !== 'saved')
    throw new Error('Synthetic workspace did not validate')
  await page.addInitScript(
    ({ recoveryKey, workspaceKey, draft, workspace }) => {
      // Seed once per tab; reload and deletion must exercise the data the app actually left behind.
      if (sessionStorage.getItem('test:seeded')) return
      sessionStorage.setItem('test:seeded', 'yes')
      sessionStorage.setItem(recoveryKey, draft)
      if (workspace) localStorage.setItem(workspaceKey, workspace)
    },
    {
      recoveryKey: RECOVERY_KEY,
      workspaceKey: WORKSPACE_KEY,
      draft: JSON.stringify(recovery),
      workspace: withWorkspace ? JSON.stringify(saved.workspace) : null,
    },
  )
}

export const stored = (page: Page) =>
  page.evaluate(
    ({ recoveryKey, workspaceKey }) => ({
      local: localStorage.getItem(workspaceKey),
      tab: sessionStorage.getItem(recoveryKey),
    }),
    { recoveryKey: RECOVERY_KEY, workspaceKey: WORKSPACE_KEY },
  )

export async function failRecoveryWrites(page: Page) {
  await page.evaluate((key) => {
    // oxlint-disable-next-line typescript/unbound-method -- The Storage receiver is supplied with call below.
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (name, value) {
      if (this === sessionStorage && name === key)
        throw new DOMException('Synthetic quota failure', 'QuotaExceededError')
      original.call(this, name, value)
    }
  }, RECOVERY_KEY)
}

export async function openResources(page: Page) {
  await page
    .getByRole('button', { name: '5. Review your answers', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Calculate my plan', exact: true })
    .click()
  await browseResourcesFromPlan(page)
}

export async function browseResourcesFromPlan(page: Page) {
  await page.getByRole('link', { name: 'Read the FAQs', exact: true }).click()
  await page
    .getByRole('link', { name: 'Browse all resources', exact: true })
    .click()
  await expect(page).toHaveURL(/\/resources$/)
}

export async function returnFromResources(page: Page) {
  await page.goBack()
  await expect(page).toHaveURL(/\/#faqs$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/plan(?:\?example=1)?$/)
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await page
    .getByRole('button', { name: '2. Income and profit', exact: true })
    .click()
}
