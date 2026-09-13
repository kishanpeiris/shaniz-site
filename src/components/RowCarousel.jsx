import React, { useState } from 'react'

// A single row that shows at most `perPage` items at once — not a
// free-scrolling strip, a hard page boundary. Arrows only render at all
// once there's more than one page, and each one only shows on the side
// there's actually somewhere to go (no dead-end clicks). Used by both
// "The Ritual" (products/services) and "See It Made" (process videos)
// on the homepage, so both behave identically: one row, a firm cap per
// page, paging controls only when the list overflows that cap.
//
// Paging controls live in one inline bar under the grid — "‹  1 / 2  ›"
// — on every breakpoint, rather than floating side arrows that only
// appeared from `sm` up: on mobile those side arrows never rendered at
// all (no "next" control reachable), so this bar is the only way to
// page through the list on a phone, and stays as the single consistent
// control on desktop too instead of having two ways to do the same
// thing.
export default function RowCarousel({ items, renderItem, perPage = 3, columnsClassName }) {
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
            aria-label="Show previous"
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
            aria-label="Show next"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-ivory text-xl text-forestDeep shadow-brand disabled:cursor-not-allowed disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
