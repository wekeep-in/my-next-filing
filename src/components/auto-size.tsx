import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'

export function AutoSize({ children }: { readonly children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const outer = frame.current!
    const inner = content.current!
    const root = document.documentElement
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let previous: { width: number; height: number } | undefined
    let animation: Animation | undefined
    let nativeDisclosure = false
    let settledFrame = 0
    const stop = () => {
      const running = animation
      animation = undefined
      running?.cancel()
      delete outer.dataset.resizing
    }
    const settleDisclosure = () => {
      cancelAnimationFrame(settledFrame)
      settledFrame = requestAnimationFrame(() => {
        settledFrame = requestAnimationFrame(() => {
          nativeDisclosure = false
        })
      })
    }
    const onToggle = (event: Event) => {
      if (
        event.target instanceof HTMLElement &&
        (event.target.matches('.question-panel') ||
          (event.target instanceof HTMLDetailsElement &&
            CSS.supports('interpolate-size: allow-keywords') &&
            CSS.supports('selector(::details-content)')))
      ) {
        nativeDisclosure = true
        stop()
        settleDisclosure()
      }
    }
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize[0]
      const next = { width: box.inlineSize, height: box.blockSize }
      const before = previous
      previous = next
      // Native disclosures own their sizing until their content has settled.
      if (nativeDisclosure) settleDisclosure()
      if (
        root.dataset.inputMethod !== 'pointer' ||
        root.hasAttribute('data-page-transition') ||
        reducedMotion.matches ||
        (before && Math.abs(before.width - next.width) > 1) ||
        nativeDisclosure
      ) {
        stop()
        return
      }
      if (before?.height === next.height) return
      const from = animation
        ? outer.getBoundingClientRect().height
        : (before?.height ?? 0)
      stop()
      outer.dataset.resizing = ''
      const running = outer.animate(
        { blockSize: [`${from}px`, `${next.height}px`] },
        {
          duration: 160,
          easing: getComputedStyle(outer)
            .getPropertyValue('--ease-app-out')
            .trim(),
        },
      )
      animation = running
      running.onfinish = running.oncancel = () => {
        if (animation === running) stop()
      }
    })
    // Measure natural content; animating this observed box would create a resize loop.
    observer.observe(inner, { box: 'border-box' })
    inner.addEventListener('toggle', onToggle, true)
    inner.addEventListener('transitionrun', onToggle, true)
    document.addEventListener('keydown', stop, true)
    reducedMotion.addEventListener('change', stop)
    return () => {
      observer.disconnect()
      inner.removeEventListener('toggle', onToggle, true)
      inner.removeEventListener('transitionrun', onToggle, true)
      cancelAnimationFrame(settledFrame)
      document.removeEventListener('keydown', stop, true)
      reducedMotion.removeEventListener('change', stop)
      stop()
    }
  }, [])

  return (
    <div className="auto-size" ref={frame}>
      <div className="auto-size-content" ref={content}>
        {children}
      </div>
    </div>
  )
}
