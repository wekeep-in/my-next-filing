// With pnpm dev running, call in the browser console:
// await (await import('/scripts/verify-motion.tsx')).verifyMotion()
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { AutoSize } from '../src/components/auto-size'

export async function verifyMotion() {
  const host = document.createElement('div')
  host.style.cssText = 'position:absolute;left:-10000px;width:240px'
  host.setAttribute('aria-hidden', 'true')
  document.body.append(host)
  const app = createRoot(host)
  const html = document.documentElement
  const inputMethod = html.dataset.inputMethod
  const matchMedia = window.matchMedia.bind(window)
  const wait = () => new Promise((resolve) => window.setTimeout(resolve, 40))
  const check = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message)
  }
  const render = (height: number, key = 'normal') =>
    flushSync(() =>
      app.render(
        <AutoSize key={key}>
          {height > 0 && <div style={{ height }}>Temporary test content</div>}
        </AutoSize>,
      ),
    )
  const frame = () => host.querySelector<HTMLElement>('.auto-size')!
  try {
    html.dataset.inputMethod = 'keyboard'
    render(48)
    await wait()
    check(
      frame().getAnimations().length === 0,
      'Initial content must stay still',
    )
    html.dataset.inputMethod = 'pointer'
    render(120)
    await wait()
    const expansion = frame().getAnimations()[0]
    check(
      Boolean(expansion),
      'Nested content changes must animate the container',
    )
    expansion.pause()
    expansion.currentTime = 70
    const intermediate = frame().getBoundingClientRect().height
    check(
      intermediate > 48 && intermediate < 120,
      'Expansion must pass through intermediate heights',
    )
    render(80)
    await wait()
    check(
      expansion.playState === 'idle',
      'A second resize must cancel the first',
    )
    frame().getAnimations()[0].finish()
    await wait()
    check(
      !frame().hasAttribute('data-resizing'),
      'Finished resizing must release clipping',
    )
    render(0)
    check(host.textContent === '', 'Removed content must disappear immediately')
    await wait()
    check(
      frame().getAnimations().length === 1,
      'The remaining container must collapse',
    )
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }),
    )
    html.dataset.inputMethod = 'keyboard'
    render(96)
    await wait()
    check(
      frame().getAnimations().length === 0,
      'Keyboard input must cancel resizing',
    )
    html.dataset.inputMethod = 'pointer'
    host.style.width = '320px'
    render(150)
    await wait()
    check(
      frame().getAnimations().length === 0,
      'Responsive width changes must not tween height',
    )
    window.matchMedia = (query) => {
      const media = matchMedia(query)
      if (query === '(prefers-reduced-motion: reduce)')
        Object.defineProperty(media, 'matches', { value: true })
      return media
    }
    render(48, 'reduced')
    await wait()
    render(120, 'reduced')
    await wait()
    check(
      frame().getAnimations().length === 0,
      'Reduced motion must stay immediate',
    )
    return 'Default motion checks passed.'
  } finally {
    app.unmount()
    host.remove()
    window.matchMedia = matchMedia
    if (inputMethod) html.dataset.inputMethod = inputMethod
    else delete html.dataset.inputMethod
  }
}
