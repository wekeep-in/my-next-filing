import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import type { Location } from 'react-router-dom'

type PageLocation = Pick<Location, 'key' | 'pathname' | 'hash'>

export function shouldAnimatePage(
  previous: PageLocation,
  next: PageLocation,
  pointerActivated: boolean,
  reducedMotion: boolean,
) {
  return (
    pointerActivated &&
    !reducedMotion &&
    previous.key !== next.key &&
    !(previous.pathname === next.pathname && previous.hash !== next.hash)
  )
}

export function usePageTransition() {
  const location = useLocation()
  const previous = useRef(location)
  const content = useRef<HTMLElement>(null)
  const pointerActivated = useRef(false)
  const animations = useRef<Animation[]>([])

  useEffect(() => {
    const pointer = () => {
      pointerActivated.current = true
      document.documentElement.dataset.inputMethod = 'pointer'
    }
    const keyboard = () => {
      pointerActivated.current = false
      document.documentElement.dataset.inputMethod = 'keyboard'
      animations.current.forEach((animation) => animation.cancel())
    }
    document.addEventListener('pointerdown', pointer, true)
    document.addEventListener('keydown', keyboard, true)
    return () => {
      document.removeEventListener('pointerdown', pointer, true)
      document.removeEventListener('keydown', keyboard, true)
    }
  }, [])

  useLayoutEffect(() => {
    const animate = shouldAnimatePage(
      previous.current,
      location,
      pointerActivated.current,
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    )
    previous.current = location
    const element = content.current
    if (!animate || !element) return
    // Navigation lives in sibling asides; slide content without moving fixed controls.
    const targets = element.querySelectorAll<HTMLElement>(
      ':scope > :not(:has(> aside)), :scope > :has(> aside) > :not(aside)',
    )
    const easing = getComputedStyle(element)
      .getPropertyValue('--ease-app-out')
      .trim()
    document.documentElement.dataset.pageTransition = ''
    const running = [...targets]
      .filter(
        (target) =>
          !['fixed', 'absolute', 'sticky'].includes(
            getComputedStyle(target).position,
          ),
      )
      .map((target) =>
        target.animate(
          {
            opacity: [0, 1],
            transform: ['translateY(0.5rem)', 'translateY(0)'],
          },
          { duration: 180, easing },
        ),
      )
    animations.current = running
    const settled = () => {
      if (
        animations.current === running &&
        running.every(
          (item) => item.playState === 'finished' || item.playState === 'idle',
        )
      )
        delete document.documentElement.dataset.pageTransition
    }
    running.forEach((item) => {
      item.onfinish = item.oncancel = settled
    })
    settled()
    return () => {
      running.forEach((item) => item.cancel())
      settled()
    }
  }, [location])

  return content
}
