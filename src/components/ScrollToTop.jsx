import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Resets scroll position to the top on every navigation — including
 * clicking a nav link to the page you're already ON (e.g. "Home" while
 * already at "/" but scrolled down), which pathname/hash alone can't
 * detect since neither value changes in that case. location.key is
 * unique per navigation event even when the URL itself is identical, so
 * it fires every time.
 *
 * Steps aside when the URL has a #hash (e.g. "/#about") — that case is
 * already handled by useScrollToHash on the storefront, which scrolls to
 * the specific section rather than the top.
 */
export default function ScrollToTop() {
  const { hash, key } = useLocation()

  useEffect(() => {
    if (hash) return

    // Scroll immediately, then a couple of follow-up attempts shortly
    // after. Pages with async content (Shop's catalog fetch, images
    // loading) can shift the page's height right after mount, and on
    // mobile browsers in particular that shift sometimes lands after our
    // first scrollTo — the retries catch that instead of leaving the
    // page stranded mid-scroll.
    window.scrollTo(0, 0)
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0))
    const t = setTimeout(() => window.scrollTo(0, 0), 150)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [key, hash])

  return null
}
