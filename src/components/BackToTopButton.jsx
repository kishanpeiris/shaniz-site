import React, { useEffect, useState } from 'react'

// Shows up once you've scrolled far enough that the top of the page
// (filters, search, sort) has scrolled out of view, and disappears again
// near the top — so it's only offered when it's actually useful.
//
// Sits directly above the WhatsApp button (components/WhatsAppButton.jsx,
// bottom-5 right-5, 56px tall) rather than on top of it.
//
// By default it scrolls the whole page back to the very top. Pass
// `onClick` to scroll somewhere more specific instead (e.g. ShopPage
// scrolls back to the filters/results row, not above the big hero
// banner — see resultsTopRef in ShopPage.jsx).
export default function BackToTopButton({ threshold = 480, onClick, label = 'Back to top' }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const handleClick = () => {
    if (onClick) onClick()
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className="fixed bottom-24 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-forestDeep text-cream shadow-lg ring-1 ring-gold/40 transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
        <path d="M10 15V5M10 5L5 10M10 5L15 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
