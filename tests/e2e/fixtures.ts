import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { exampleProfile } from '../../src/routes/check/model'
import { sessionFromProfile } from '../../src/routes/check/session'
import { RECOVERY_KEY, recoveryFromSession } from '../../src/recovery-draft'
import { TAX_YEAR, currentRules } from '../../src/rules'
import { WORKSPACE_KEY, saveSavedWorkspace } from '../../src/workspace'
import { TestStorage } from '../helpers/storage'

export { expect, RECOVERY_KEY, WORKSPACE_KEY }
export const now = new Date('2026-09-06T12:00:00+05:30')

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
    '2026-09-06',
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
    .getByRole('button', { name: '8. Review your answers', exact: true })
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
  await page
    .getByRole('button', { name: '4. Receipts and profit', exact: true })
    .click()
}
