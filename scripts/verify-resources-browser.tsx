// Run only in a fresh, isolated browser context at /resources with pnpm dev running:
// await (await import('/scripts/verify-resources-browser.tsx')).verifyResourcesBrowser(true)
// This exercises the real router/shell and writes synthetic data to its actual storage keys.
// After that check, block /src/routes/landing* in browser request blocking and run:
// await (await import('/scripts/verify-resources-browser.tsx')).verifyResourcesLoadFailure(true)
import { router } from '../src/app'
import { exampleProfile } from '../src/routes/check/model'
import { sessionFromProfile } from '../src/routes/check/session'
import {
  RECOVERY_KEY,
  recoveryFromSession,
  saveRecoveryDraft,
} from '../src/recovery-draft'
import { WORKSPACE_KEY, saveSavedWorkspace } from '../src/workspace'
import { TAX_YEAR, currentRules } from '../src/rules'

export async function verifyResourcesBrowser(isolatedContext: boolean) {
  const check = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message)
  }
  check(
    isolatedContext && window.location.pathname === '/resources',
    'Use a fresh isolated context at /resources.',
  )
  check(
    !localStorage.getItem(WORKSPACE_KEY) &&
      !sessionStorage.getItem(RECOVERY_KEY),
    'The test context must have no existing application data.',
  )
  const wait = () => new Promise((resolve) => window.setTimeout(resolve, 80))
  const go = async (path: string | number) => {
    if (typeof path === 'number') await router.navigate(path)
    else await router.navigate(path)
    await wait()
  }
  const control = (selector: string) => {
    const element = document.querySelector<HTMLElement>(selector)
    check(Boolean(element), `Missing control: ${selector}`)
    return element!
  }
  const clickText = async (selector: string, text: string) => {
    const element = [...document.querySelectorAll<HTMLElement>(selector)].find(
      (candidate) => candidate.textContent?.trim() === text,
    )
    check(Boolean(element), `Missing action: ${text}`)
    element!.click()
    await wait()
  }
  const fill = async (id: string, value: string) => {
    const element = control(`#${id}`) as HTMLInputElement
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!.call(element, value)
    element.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText' }),
    )
    await wait()
  }
  const amount = () =>
    (control('#grossReceipts') as HTMLInputElement).value.replace(/\D/g, '')
  const stored = () => ({
    local: localStorage.getItem(WORKSPACE_KEY),
    tab: sessionStorage.getItem(RECOVERY_KEY),
  })
  const unchanged = (before: ReturnType<typeof stored>) =>
    check(
      JSON.stringify(before) === JSON.stringify(stored()),
      'Browsing changed saved bytes.',
    )

  check(
    document.querySelectorAll('[aria-label="Resources"] > li').length === 22,
    'Browse must show 22 unique resources.',
  )
  const searchHelp = control('[aria-label="Search resources help"]')
  searchHelp.click()
  await wait()
  check(
    control('[role="tooltip"]').textContent ===
      'Try a topic, form name or section number.',
    'The search help button must open its tooltip.',
  )
  searchHelp.click()
  await wait()
  check(
    !document.querySelector('[role="tooltip"]'),
    'Pressing the help button again must close its tooltip.',
  )
  const emptyStores = stored()
  const startingUrl = window.location.href
  const startingTitle = document.title
  await fill('resource-search', 'advnace tax')
  await clickText('button', 'Did you mean “advance tax”?')
  check(
    (control('#resource-search') as HTMLInputElement).value === 'advance tax',
    'Suggestion must require a click and update the query.',
  )
  check(
    control('[role="status"]').textContent?.trim() === '4 resources',
    'Corrected search must find four references.',
  )
  control('form[role="search"]').dispatchEvent(
    new Event('submit', { bubbles: true, cancelable: true }),
  )
  check(
    window.location.href === startingUrl && document.title === startingTitle,
    'Search must not change URL or title.',
  )
  unchanged(emptyStores)
  await fill('resource-search', '')

  const now = new Date('2026-09-06T12:00:00+05:30')
  const personal = sessionFromProfile(
    {
      ...exampleProfile,
      incomePath: { ...exampleProfile.incomePath, grossReceipts: 2_000_000 },
    },
    { kind: 'personal' },
    '2026-09-06',
  )
  const envelope = recoveryFromSession(personal, TAX_YEAR)!
  check(
    saveRecoveryDraft(sessionStorage, envelope).kind === 'saved',
    'Synthetic recovery seed must validate.',
  )
  check(
    saveSavedWorkspace(
      localStorage,
      null,
      {
        noticeVersion: 2,
        consentDecidedAt: '2026-09-06T06:30:00.000Z',
        activeTaxYear: TAX_YEAR,
        active: {
          ruleDatasetId: currentRules.id,
          profile: exampleProfile,
          completions: [],
        },
        priorYears: [],
      },
      now,
    ).kind === 'saved',
    'Synthetic workspace seed must validate.',
  )
  await go('/plan')
  check(
    window.location.pathname === '/plan',
    'Leaving fresh resources must restore the complete personal plan.',
  )
  const completeStores = stored()
  await clickText('.plan-main a', 'Browse resources')
  await fill('resource-search', 'LUT')
  await go(-1)
  check(
    window.location.pathname === '/plan',
    'Complete plan return must preserve its route.',
  )
  unchanged(completeStores)
  await go(1)
  check(
    (control('#resource-search') as HTMLInputElement).value === 'LUT',
    'Forward must restore in-memory browse state.',
  )
  await go(-1)

  await go('/check/receipts')
  check(
    amount() === '2000000',
    'Personal recovery must have restored before synchronization.',
  )
  await fill('grossReceipts', '2100000')
  const personalStores = stored()
  await go('/resources')
  await go(-1)
  check(
    window.location.pathname.startsWith('/check/'),
    'Back must return to the incomplete personal questionnaire.',
  )
  await go('/check/receipts')
  check(amount() === '2100000', 'Resource return must preserve personal edits.')
  unchanged(personalStores)

  await go('/check/receipts?example=1')
  await fill('grossReceipts', '2300000')
  const exampleStores = stored()
  await go('/resources')
  check(
    !document
      .querySelector('.top-bars')
      ?.textContent?.includes('Fictional example'),
    'Resources must not inherit the fictional-example banner.',
  )
  await go(-1)
  check(amount() === '2300000', 'Back must retain edited fictional amounts.')
  await go(1)
  await go(-1)
  check(
    window.location.search === '?example=1',
    'History return must retain fictional mode.',
  )
  await go('/check/receipts?example=1')
  check(
    amount() === '2300000',
    'History return must preserve edited example answers.',
  )
  unchanged(exampleStores)
  await go('/check/receipts')
  check(
    amount() === '2100000',
    'Leaving the example must restore the personal return session.',
  )

  await go('/check/review')
  await clickText('button', 'Calculate my plan')
  await clickText('button', 'Open saved workspace')
  const selectedStores = stored()
  await clickText('.plan-main a', 'Browse resources')
  await go(-1)
  check(
    [...document.querySelectorAll('button')].some(
      (button) => button.textContent?.trim() === 'Return to your estimate',
    ),
    'Browsing must preserve workspace selection and its separate personal session.',
  )
  unchanged(selectedStores)
  await clickText('button', 'Return to your estimate')

  // oxlint-disable-next-line typescript/unbound-method -- Preserve the prototype method; calls below supply its Storage receiver explicitly.
  const originalSetItem = Storage.prototype.setItem
  try {
    Storage.prototype.setItem = function (key, value) {
      if (this === sessionStorage && key === RECOVERY_KEY)
        throw new Error('Synthetic quota failure')
      originalSetItem.call(this, key, value)
    }
    await go('/check/receipts')
    const beforeFailure = stored()
    await fill('grossReceipts', '2400000')
    unchanged(beforeFailure)
    await go('/resources')
    await go('/check/receipts')
    check(
      amount() === '2400000',
      'Resources must retain personal edits after a failed write.',
    )
    await go('/check/receipts?example=1')
    await fill('grossReceipts', '2500000')
    await go('/resources')
    await go('/check/receipts?example=1')
    check(
      amount() === '2500000',
      'Resources must retain the edited example during a personal write failure.',
    )
    await go('/check/receipts')
    check(
      amount() === '2400000',
      'Example return must restore the latest unsaved personal answers.',
    )
    unchanged(beforeFailure)
  } finally {
    Storage.prototype.setItem = originalSetItem
  }
  await go('/resources')
  check(
    (control('#resource-search') as HTMLInputElement).value === 'LUT',
    'Browse state must survive all internal journeys.',
  )
  check(
    control('.resources-page nav').getBoundingClientRect().top >=
      control('.top-bars').getBoundingClientRect().bottom,
    'Stored-data notices must not cover resources navigation.',
  )
  return 'Resources UI, personal/example/workspace round trips, history and failed-write checks passed.'
}

export async function verifyResourcesLoadFailure(isolatedContext: boolean) {
  if (!isolatedContext || window.location.pathname !== '/resources')
    throw new Error(
      'Run after verifyResourcesBrowser in its isolated context, with the landing module request blocked.',
    )
  const wait = () => new Promise((resolve) => window.setTimeout(resolve, 80))
  await router.navigate('/')
  await wait()
  if (document.querySelector('h1')?.textContent !== "This page couldn't load")
    throw new Error(
      'A rejected screen import must show the recoverable screen inside AppFrame.',
    )
  await router.navigate('/resources')
  await wait()
  await router.navigate('/check/receipts')
  await wait()
  const input = document.getElementById(
    'grossReceipts',
  ) as HTMLInputElement | null
  if (input?.value.replace(/\D/g, '') !== '2400000')
    throw new Error(
      'A failed screen import discarded the latest unsaved personal answers.',
    )
  return 'Failed screen-load recovery and in-memory answer preservation passed.'
}
