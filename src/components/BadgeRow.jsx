import React, { useEffect, useRef, useState } from 'react'

// Shared pill styling — identical to how badges always looked, just
// centralized here so the card version, the detail-page version, and
// the "+N more" overflow chip all match exactly.
const CHIP_CLASS =
  'whitespace-nowrap rounded-full bg-gold px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide text-forestDeep'

// Renders special banners ("100% Natural", "New Arrival", etc.) on a
// single line, never wrapping to a second row. Anything that doesn't
// fit collapses into a "+N" chip; tapping/clicking it reveals the rest
// in a small dropdown. Measures actual rendered widths (via an
// invisible copy of the chips) rather than guessing a fixed count, so
// it's correct whether there are 2 short badges or 15 long ones, and on
// any screen size — a fixed cutoff would either waste space on wide
// cards or still overflow on narrow ones.
export default function BadgeRow({ badges = [] }) {
  const containerRef = useRef(null)
  const measureRef = useRef(null)
  const [visibleCount, setVisibleCount] = useState(badges.length)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const measureRow = measureRef.current
    if (!container || !measureRow) return

    const MORE_CHIP_WIDTH = 40 // generous estimate for a "+N" pill, so it never gets crowded out at the last second
    const GAP = 6 // matches gap-1.5

    const recalculate = () => {
      const availableWidth = container.offsetWidth
      const chipEls = Array.from(measureRow.children)
      let used = 0
      let count = 0
      for (let i = 0; i < chipEls.length; i++) {
        const isLast = i === chipEls.length - 1
        const width = chipEls[i].offsetWidth
        const reserve = isLast ? 0 : MORE_CHIP_WIDTH + GAP // don't reserve space for "+N" after the very last chip — if it fits, everything fits
        const next = used + (count > 0 ? GAP : 0) + width
        if (next + reserve <= availableWidth) {
          used = next
          count++
        } else {
          break
        }
      }
      // Showing exactly one badge with no room even for that is an edge
      // case (a genuinely tiny container) — always show at least one so
      // the row isn't just an empty "+N" chip.
      setVisibleCount(Math.max(count, 1))
    }

    recalculate()
    const observer = new ResizeObserver(recalculate)
    observer.observe(container)
    return () => observer.disconnect()
  }, [badges])

  // Close the overflow dropdown on an outside click/tap — otherwise it
  // stays open until the next unrelated re-render.
  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [open])

  if (badges.length === 0) return null

  const visible = badges.slice(0, visibleCount)
  const hidden = badges.slice(visibleCount)

  return (
    <div ref={wrapperRef} className="relative min-w-0">
      {/* Invisible measuring copy: same chips, same classes, so their
          natural widths are accurate — kept off-screen and out of the
          tab/click order. */}
      <div ref={measureRef} className="pointer-events-none absolute left-0 top-0 -z-10 flex gap-1.5 opacity-0" aria-hidden="true">
        {badges.map((b, i) => (
          <span key={`measure-${b}-${i}`} className={CHIP_CLASS}>
            {b}
          </span>
        ))}
      </div>

      <div ref={containerRef} className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
        {visible.map((b) => (
          <span key={b} className={CHIP_CLASS}>
            {b}
          </span>
        ))}
        {hidden.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setOpen((o) => !o)
            }}
            className={`${CHIP_CLASS} cursor-pointer hover:bg-goldLight`}
            aria-label={`${hidden.length} more special banners`}
          >
            +{hidden.length}
          </button>
        )}
      </div>

      {open && hidden.length > 0 && (
        <div className="absolute left-0 top-full z-20 mt-1.5 flex flex-col gap-1.5 rounded-sm border border-gold/30 bg-cream p-2 shadow-brand">
          {hidden.map((b) => (
            <span key={b} className={CHIP_CLASS}>
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
