const allowedRoutes = new Set(['/', '/check', '/plan'])

let tagLoaded = false

function measurementId() {
  return import.meta.env.PROD
    ? import.meta.env.VITE_GA_MEASUREMENT_ID
    : undefined
}

function loadTag(id: string) {
  if (tagLoaded) return
  tagLoaded = true
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.append(script)
  const windowWithGtag = window as typeof window & {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
  windowWithGtag.dataLayer = windowWithGtag.dataLayer ?? []
  windowWithGtag.gtag = (...args) => windowWithGtag.dataLayer?.push(args)
  windowWithGtag.gtag('js', new Date())
  windowWithGtag.gtag('config', id, {
    send_page_view: false,
    anonymize_ip: true,
  })
}

export function trackPageView(pathname: string) {
  const id = measurementId()
  if (!id || !allowedRoutes.has(pathname)) return
  loadTag(id)
  const windowWithGtag = window as typeof window & {
    gtag?: (...args: unknown[]) => void
  }
  windowWithGtag.gtag?.('event', 'page_view', {
    page_location: `https://mynextfiling.wekeep.in${pathname}`,
    page_path: pathname,
    page_title: 'My Next Filing',
  })
}
