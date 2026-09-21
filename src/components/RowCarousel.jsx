import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'

// Two different browsing patterns share this component:
//
// mode="page" (default) — a hard page boundary: shows exactly `perPage`
// items, "‹ 1/2 ›" jumps to a whole new set. Used by "See It Made"
// (process videos) and the branch locator, where a full page-swap reads
// naturally since each item is substantial on its own.
//
// mode="scroll" — a horizontal shelf: all items sit in one scrollable
// row, sized so exactly `visibleOnMobile` fit in view at once on a
// phone (with the next one peeking at the edge as a "there's more"
// hint), and the arrows nudge the shelf left/right by one screenful
// rather than swapping to a disconnected set. Used by "The Ritual"
// (products/services) — browsing a shelf of products benefits from
// staying anchored (you can feel roughly where you are) rather than
// being paged through in disconnected chunks of 6.
export default function RowCarousel({
  items,
  renderItem,
  perPage = 3,
  columnsClassName,
  mode = 'page',
  visibleOnMobile = 2,
}) {
  const { t } = useLanguage()
  if (mode === 'scroll') return <ScrollRow items={items} renderItem={renderItem} visibleOnMobile={visibleOnMobile} />

  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const showControls = items.length > perPage
  const clampedPage = Math.min(page, totalPages - 1)
  const start = clampedPage * perPage
  const visible = items.slice(start, start + perPage)

  const goTo = (dir) => setPage((p) => Math.max(0, Math.min(totalPages - 1, p + dir)))

  return (
    <div>
      <div className={columnsClassName || 'grid grid-cols-2 gap-4 sm:gap-7 lg:grid-cols-3'}>
        {visible.map((item, i) => renderItem(item, start + i))}
      </div>

      {showControls && (
        <div className="mt-6 flex items-center justify-center gap-5">
          <button
            onClick={() => goTo(-1)}
            disabled={clampedPage === 0}
            aria-label={t('aria_prev')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-ivory text-xl text-forestDeep shadow-brand disabled:cursor-not-allowed disabled:opacity-30"
          >
            ‹
          </button>
          <p className="text-xs uppercase tracking-wide text-[#6a6656]">
            {clampedPage + 1} / {totalPages}
          </p>
          <button
            onClick={() => goTo(1)}
            disabled={clampedPage === totalPages - 1}
            aria-label={t('aria_next')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-ivory text-xl text-forestDeep shadow-brand disabled:cursor-not-allowed disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

function ScrollRow({ items, renderItem, visibleOnMobile }) {
  const { t } = useLanguage()
  const trackRef = useRef(null)
  // Whether there's actually anything to scroll to, and which
  // direction — computed from real scroll geometry (scrollWidth vs
  // clientWidth) rather than a fixed item-count guess. A static
  // "items.length > visibleOnMobile" check only reflects how many fit
  // on a phone; a wide desktop screen might fit all of them already
  // (nothing to scroll, arrows would click and do nothing) or fit far
  // fewer proportionally on an ultra-narrow phone. Checking the actual
  // DOM geometry gets this right at every breakpoint automatically.
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = () => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateScrollState()
    const el = trackRef.current
    if (!el) return
    // Re-check on resize (rotating a phone, or resizing a desktop
    // window across a breakpoint changes how many cards fit) and after
    // images/videos inside finish loading, which can change scrollWidth
    // after the initial layout pass.
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  // visibleOnMobile=2 → each card is calc(50% - half a gap) so exactly
  // two sit in view with the edge of a third peeking in — that peek is
  // deliberate, it's what visually signals "swipe/scroll for more"
  // instead of the row looking like a dead-end after item 2.
  const cardWidthClass =
    visibleOnMobile === 2
      ? 'w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.85rem)]'
      : 'w-[calc(33.333%-0.75rem)] sm:w-[calc(25%-0.85rem)] lg:w-[calc(20%-0.9rem)]'

  const scrollByScreen = (dir) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.92, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={updateScrollState}
        className="flex flex-nowrap snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div key={i} className={`shrink-0 snap-start ${cardWidthClass}`}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>

      {(canScrollLeft || canScrollRight) && (
        <div className="mt-6 flex items-center justify-center gap-5">
          <button
            onClick={() => scrollByScreen(-1)}
            disabled={!canScrollLeft}
            aria-label={t('aria_scroll_left')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-ivory text-xl text-forestDeep shadow-brand disabled:cursor-not-allowed disabled:opacity-30"
          >
            ‹
          </button>
          <button
            onClick={() => scrollByScreen(1)}
            disabled={!canScrollRight}
            aria-label={t('aria_scroll_right')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-ivory text-xl text-forestDeep shadow-brand disabled:cursor-not-allowed disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
