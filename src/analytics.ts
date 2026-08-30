const measurementId = 'G-94S2KGJFNL'
const productionOrigin = 'https://mynextfiling.wekeep.in'
const productionHostname = 'mynextfiling.wekeep.in'
const allowedRoutes = new Set(['/', '/check', '/plan'])

let tagLoaded = false
let previousPathname: string | null = null

type AnalyticsWindow = typeof window & {
  dataLayer?: IArguments[]
  gtag?: (...args: unknown[]) => void
}

function loadTag() {
  if (tagLoaded) return
  tagLoaded = true

  const analyticsWindow = window as AnalyticsWindow
  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? []
  analyticsWindow.gtag = function () {
    analyticsWindow.dataLayer?.push(arguments)
  }
  analyticsWindow.gtag('js', new Date())
  analyticsWindow.gtag('config', measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.append(script)
}

export function trackPageView(pathname: string) {
  if (
    window.location.hostname !== productionHostname ||
    !allowedRoutes.has(pathname) ||
    pathname === previousPathname
  )
    return

  loadTag()
  const analyticsWindow = window as AnalyticsWindow
  analyticsWindow.gtag?.('event', 'page_view', {
    page_title: 'My Next Filing',
    page_location: `${productionOrigin}${pathname}`,
    ...(previousPathname
      ? { page_referrer: `${productionOrigin}${previousPathname}` }
      : {}),
  })
  previousPathname = pathname
}
