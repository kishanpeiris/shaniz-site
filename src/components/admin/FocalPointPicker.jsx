import React from 'react'

// Answers "the thumbnail crop is cutting off the wrong part of the
// photo" without ever touching the original file: click anywhere on
// this square preview (already cropped exactly the way the Shop grid
// crops it) to move the crop's focus point. Under the hood this is just
// CSS object-position, stored as an x/y percentage — nothing is
// re-uploaded or re-processed, so it's instant and fully reversible.
export default function FocalPointPicker({ imageUrl, x = 50, y = 50, onChange }) {
  const pick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const nextX = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const nextY = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    onChange(Math.min(100, Math.max(0, nextX)), Math.min(100, Math.max(0, nextY)))
  }

  if (!imageUrl) return null

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss">Thumbnail crop</p>
      <p className="mb-1.5 text-[0.65rem] text-[#8a8672]">
        Click the part of the photo that should stay visible in the square Shop-grid thumbnail.
      </p>
      <div
        onClick={pick}
        className="relative aspect-square w-28 cursor-crosshair overflow-hidden rounded-sm border border-gold/40"
        title="Click to set the crop focus point"
      >
        <img
          src={imageUrl}
          alt=""
          style={{ objectPosition: `${x}% ${y}%` }}
          className="h-full w-full object-cover"
        />
        <div
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold bg-white/80 shadow"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      </div>
      {(x !== 50 || y !== 50) && (
        <button
          type="button"
          onClick={() => onChange(50, 50)}
          className="mt-1 text-[0.65rem] uppercase tracking-wide text-forestDeep underline"
        >
          Reset to center
        </button>
      )}
    </div>
  )
}
