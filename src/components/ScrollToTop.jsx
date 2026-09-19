import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { rememberPage, rememberScroll, takeScrollRestore } from '../lib/returnTo.js'

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
  const location = useLocation()
  const { hash, key, pathname } = location

  // Remember the current page (and how far down it is scrolled) so that
  // signing in can send the visitor straight back here.
  useEffect(() => {
    rememberPage(location)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  useEffect(() => {
    let timer = null
    const onScroll = () => {
      if (timer) return
      timer = setTimeout(() => {
        timer = null
        rememberScroll(window.scrollY)
      }, 200)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (hash) return

    // Just came back from signing in? Restore the old scroll position
    // instead of jumping to the top. Retries cover pages whose content
    // (catalog, images) finishes loading a moment after mount.
    const restoreY = takeScrollRestore(pathname)
    if (restoreY) {
      const go = () => window.scrollTo(0, restoreY)
      go()
      const timers = [150, 400, 900].map((ms) => setTimeout(go, ms))
      return () => timers.forEach(clearTimeout)
    }

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
