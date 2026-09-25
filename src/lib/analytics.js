// Google Analytics 4. Does nothing if VITE_GA_MEASUREMENT_ID isn't set —
// so local dev and any deploy that hasn't configured this yet sends no
// data anywhere, rather than silently reporting to a placeholder/shared
// account.
//
// This is a single-page app, so the default gtag.js snippet (which only
// fires once, on the real page load) isn't enough on its own — a visitor
// clicking from Home to Shop to a product never triggers another full
// page load. initAnalytics() sets GA up WITHOUT its automatic pageview
// (send_page_view: false), and trackPageView() is called manually on
// every React Router navigation instead — see the useEffect in App.jsx.
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

let initialized = false

export function initAnalytics() {
  if (!GA_ID || initialized || typeof window === 'undefined') return
  initialized = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })

  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  script.async = true
  document.head.appendChild(script)
}

export function trackPageView(path) {
  if (!GA_ID || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    // Read AFTER the page component's own useDocumentMeta has run (see
    // the effect-ordering note in App.jsx) so this is the real title,
    // not whatever the previous page left behind.
    page_title: document.title,
  })
}
