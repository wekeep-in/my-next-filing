import { afterEach, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { AutoSize } from '../../src/components/auto-size'

afterEach(() => {
  delete document.documentElement.dataset.inputMethod
})

// ResizeObserver delivers after layout. Observe two rendered frames rather than guessing a delay.
const layout = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })

test('resizes interrupts and collapses content while releasing clipping', async () => {
  const html = document.documentElement
  html.dataset.inputMethod = 'keyboard'
  const view = (height: number, width = 240) => (
    <div style={{ width }}>
      <AutoSize>
        {height > 0 && <div style={{ height }}>Temporary test content</div>}
      </AutoSize>
    </div>
  )
  const mounted = await render(view(48))
  const frame = mounted.container.querySelector<HTMLElement>('.auto-size')!
  await layout()
  expect(frame.getAnimations()).toHaveLength(0)

  html.dataset.inputMethod = 'pointer'
  await mounted.rerender(view(120))
  await layout()
  const expansion = frame.getAnimations()[0]
  expect(expansion).toBeDefined()
  expansion.pause()
  expansion.currentTime = 70
  expect(frame.getBoundingClientRect().height).toBeGreaterThan(48)
  expect(frame.getBoundingClientRect().height).toBeLessThan(120)

  await mounted.rerender(view(80))
  await layout()
  expect(expansion.playState).toBe('idle')
  frame.getAnimations()[0].finish()
  await expect.poll(() => frame.hasAttribute('data-resizing')).toBe(false)

  await mounted.rerender(view(0))
  expect(mounted.container.textContent).toBe('')
  await layout()
  expect(frame.getAnimations()).toHaveLength(1)

  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }),
  )
  html.dataset.inputMethod = 'keyboard'
  await mounted.rerender(view(96))
  await layout()
  expect(frame.getAnimations()).toHaveLength(0)

  html.dataset.inputMethod = 'pointer'
  await mounted.rerender(view(150, 320))
  await layout()
  expect(frame.getAnimations()).toHaveLength(0)
})

test('keeps reduced-motion content changes immediate', async () => {
  const matchMedia = window.matchMedia.bind(window)
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => {
    const media = matchMedia(query)
    if (query === '(prefers-reduced-motion: reduce)')
      Object.defineProperty(media, 'matches', { value: true })
    return media
  })
  document.documentElement.dataset.inputMethod = 'pointer'
  const mounted = await render(
    <AutoSize>
      <div style={{ height: 48 }}>Content</div>
    </AutoSize>,
  )
  await layout()
  await mounted.rerender(
    <AutoSize>
      <div style={{ height: 120 }}>Content</div>
    </AutoSize>,
  )
  await layout()
  expect(
    mounted.container.querySelector('.auto-size')!.getAnimations(),
  ).toHaveLength(0)
})
