import React, { useState } from 'react'

// A single row that shows at most `perPage` items at once — not a
// free-scrolling strip, a hard page boundary. Arrows only render at all
// once there's more than one page, and each one only shows on the side
// there's actually somewhere to go (no dead-end clicks). Used by both
// "The Ritual" (products/services) and "See It Made" (process videos)
// on the homepage, so both behave identically: one row, a firm cap per
// page, paging controls only when the list overflows that cap.
export default function RowCarousel({ items, renderItem, perPage = 3, columnsClassName }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const showArrows = items.length > perPage
  const clampedPage = Math.min(page, totalPages - 1)
  const start = clampedPage * perPage
  const visible = items.slice(start, start + perPage)

  const goTo = (dir) => setPage((p) => Math.max(0, Math.min(totalPages - 1, p + dir)))

  return (
    <div className="relative">
      {showArrows && clampedPage > 0 && (
        <button
          onClick={() => goTo(-1)}
          aria-label="Show previous"
          className="absolute -left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory text-xl text-forestDeep shadow-brand sm:flex"
        >
          ‹
        </button>
      )}

      <div className={columnsClassName || 'grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3'}>
        {visible.map((item, i) => renderItem(item, start + i))}
      </div>

      {showArrows && clampedPage < totalPages - 1 && (
        <button
          onClick={() => goTo(1)}
          aria-label="Show more"
          className="absolute -right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ivory text-xl text-forestDeep shadow-brand sm:flex"
        >
          ›
        </button>
      )}

      {showArrows && (
        <p className="mt-5 text-center text-xs uppercase tracking-wide text-[#8a8672]">
          {clampedPage + 1} / {totalPages}
        </p>
      )}
    </div>
  )
}
