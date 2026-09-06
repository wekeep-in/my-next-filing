import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { ActionLinks } from '../../src/routes/plan/action-links'

test.each([
  [
    'advance-tax',
    'eportal.incometax.gov.in',
    '/e-pay-tax-prelogin/user-details',
    'generate-challan-form',
  ],
  [
    'annual-return',
    'eportal.incometax.gov.in',
    '/login',
    'quick-glance-first-time-UM',
  ],
  [
    'gst-registration',
    'reg.gst.gov.in',
    '/registration/',
    'Apply_for_Registration_Normal_Taxpayer.htm',
  ],
  [
    'gst-gstr1',
    'services.gst.gov.in',
    '/services/login',
    'Creation_of_Outward_Supplies_Return_in_GSTR-1.htm',
  ],
  [
    'gst-gstr3b',
    'services.gst.gov.in',
    '/services/login',
    'Create_and_Submit_GSTR3B.htm',
  ],
  [
    'gst-qrmp-payment',
    'services.gst.gov.in',
    '/services/login',
    'Create_Challan_(Post_Login).htm',
  ],
  [
    'gst-lut',
    'services.gst.gov.in',
    '/services/login',
    'Furnishing_of_Letter_of_Undertaking.htm',
  ],
] as const)(
  'discloses agenda guidance and keeps next-action portal links visible for %s',
  async (kind, host, entry, guide) => {
    const view = await render(<ActionLinks kind={kind} />)
    const disclosure = view.container.querySelector('details')!
    expect(disclosure.open).toBe(false)
    expect(getComputedStyle(disclosure).borderTopWidth).toBe('1px')
    disclosure.querySelector('summary')!.click()
    expect(disclosure.open).toBe(true)
    const links = view.container.querySelectorAll('a')
    expect(links).toHaveLength(2)
    const portal = new URL(links[1].href)
    expect(portal.hostname).toBe(host)
    expect(portal.href.endsWith(entry)).toBe(true)
    expect(links[0].href.endsWith(guide)).toBe(true)
    expect(['www.incometax.gov.in', 'tutorial.gst.gov.in']).toContain(
      new URL(links[0].href).hostname,
    )
    for (const link of links) {
      expect(new URL(link.href).protocol).toBe('https:')
      expect(new URL(link.href).search).toBe('')
      expect(link.target).toBe('_blank')
      expect(link.relList.contains('noreferrer')).toBe(true)
      expect(link.relList.contains('noopener')).toBe(true)
      expect(link.textContent).toContain('opens in a new tab')
    }
    expect(links[0].closest('p')).not.toBeNull()
    expect(links[1].closest('p')).toBe(links[0].closest('p'))
    if (kind === 'annual-return')
      expect(view.container.textContent).toContain(
        'does not choose a return form',
      )
    if (kind === 'gst-qrmp-payment')
      expect(view.container.textContent).toContain('If a deposit is needed')
    disclosure.querySelector('summary')!.click()
    await view.rerender(<ActionLinks kind={kind} prominent />)
    const button = view.container.querySelectorAll('a')[0]
    expect(button.closest('p')).toBeNull()
    expect(button.closest('details')).toBeNull()
    expect(
      view.container.querySelectorAll('a')[1].closest('details'),
    ).not.toBeNull()
    expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44)
    expect(button.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      view.container.querySelector('summary')!.getBoundingClientRect().top,
    )
  },
)
