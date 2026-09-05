import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Smooth-scrolls to the element matching the current URL hash (e.g. "#about")
 * whenever the location changes. Needed because client-side routing doesn't
 * trigger the browser's native anchor-scroll the way a full page load does.
 *
 * Paired with `scroll-margin-top` on every section (see index.css) so the
 * sticky header never covers the heading it scrolls to.
 *
 * Retries briefly on mount: images/fonts/catalog data can still be loading
 * right after route change, which shifts section positions. A couple of
 * follow-up scrolls a beat later correct for that without a visible jump
 * (same target, same smooth scroll — it just re-settles if layout moved).
 */
export function useScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const id = decodeURIComponent(location.hash.slice(1))

    const scroll = () => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const raf = requestAnimationFrame(scroll)
    const retry1 = setTimeout(scroll, 300)
    const retry2 = setTimeout(scroll, 900)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(retry1)
      clearTimeout(retry2)
    }
  }, [location.pathname, location.hash])
}
