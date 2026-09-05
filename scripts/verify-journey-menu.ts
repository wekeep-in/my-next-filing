// With pnpm dev running, call on a questionnaire or plan page at each viewport:
// await (await import('/scripts/verify-journey-menu.ts')).verifyJourneyMenu()
export async function verifyJourneyMenu() {
  const trigger = document.querySelector<HTMLButtonElement>(
    '.journey-menu-trigger',
  )!
  const check = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message)
  }
  const wait = () => new Promise((resolve) => window.setTimeout(resolve, 200))
  const popup = () =>
    document.querySelector<HTMLElement>('.journey-menu-content')!
  const desktopList = document.querySelector<HTMLElement>(
    '.journey-nav > .journey-list',
  )!
  check(Boolean(trigger && desktopList), 'Open a questionnaire or plan first')
  if (window.innerWidth > 1100) {
    check(!trigger.checkVisibility(), 'Desktop must hide the mobile trigger')
    check(desktopList.checkVisibility(), 'Desktop must retain its step list')
    return 'Desktop journey checks passed.'
  }
  check(
    !desktopList.checkVisibility(),
    'Mobile must hide the desktop step list',
  )
  const nav = trigger.closest('.journey-nav')!
  const alerts = document.querySelector('.top-bars')!
  const checkSpacing = () =>
    check(
      Math.abs(
        nav.getBoundingClientRect().top - alerts.getBoundingClientRect().bottom,
      ) < 1,
      'Navigation must sit directly below the visible alerts, including when empty',
    )
  checkSpacing()
  const notice = document.createElement('div')
  notice.className = 'top-bar'
  try {
    for (const text of [
      'Temporary layout check.',
      'Temporary layout check. '.repeat(10),
    ]) {
      notice.textContent = text
      alerts.append(notice)
      await wait()
      checkSpacing()
    }
  } finally {
    notice.remove()
  }
  await wait()
  checkSpacing()
  check(
    trigger.getBoundingClientRect().height >= 44,
    'Trigger must be tappable',
  )
  check(
    trigger.scrollWidth <= trigger.clientWidth,
    'Step name must not overflow',
  )
  const inputMethod = document.documentElement.dataset.inputMethod
  try {
    document.documentElement.dataset.inputMethod = 'keyboard'
    trigger.focus()
    trigger.click()
    await wait()
    check(trigger.getAttribute('aria-expanded') === 'true', 'Menu must open')
    const steps = [...popup().querySelectorAll<HTMLButtonElement>('li button')]
    check(
      steps.length === desktopList.children.length,
      'Menu must retain every journey step',
    )
    const bounds = popup().getBoundingClientRect()
    check(
      Math.abs(bounds.left) < 1 &&
        Math.abs(bounds.right - document.documentElement.clientWidth) < 1,
      'Step panel must span the viewport',
    )
    check(
      Math.abs(bounds.top - nav.getBoundingClientRect().bottom) < 1,
      'Step panel must meet the bottom of the navigation bar',
    )
    check(
      steps.every((step) => step.getBoundingClientRect().height >= 56),
      'Each step needs a 56px touch target',
    )
    check(
      trigger.querySelector('.journey-number')?.textContent ===
        popup().querySelector('[aria-current] .journey-number')?.textContent,
      'The header circle must show the current step number',
    )
    check(
      document.activeElement === popup().querySelector('[aria-current] button'),
      'Opening must focus the current step',
    )
    check(
      getComputedStyle(popup()).animationName === 'none' &&
        getComputedStyle(popup()).transitionDuration === '0s',
      'Keyboard opening must not animate',
    )
    const path = window.location.pathname
    for (const step of steps.filter((button) => button.disabled)) step.click()
    await wait()
    check(
      window.location.pathname === path,
      'Unavailable steps cannot navigate',
    )
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await wait()
    check(
      trigger.getAttribute('aria-expanded') === 'false',
      'Escape must close',
    )
    check(
      document.activeElement === trigger,
      'Escape must return trigger focus',
    )
    trigger.click()
    await wait()
    popup().querySelector<HTMLButtonElement>('[aria-current] button')!.click()
    await wait()
    check(
      trigger.getAttribute('aria-expanded') === 'false',
      'Selection must close',
    )
    return 'Mobile journey menu checks passed.'
  } finally {
    if (trigger.getAttribute('aria-expanded') === 'true') trigger.click()
    if (inputMethod) document.documentElement.dataset.inputMethod = inputMethod
    else delete document.documentElement.dataset.inputMethod
  }
}
