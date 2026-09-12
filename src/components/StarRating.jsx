import React from 'react'

// Display-only star row (rounds to the nearest half star) — used on
// product cards and the detail page summary. See StarRatingInput.jsx
// for the clickable version used in the "write a review" form.
export default function StarRating({ rating = 0, count, size = 'text-sm' }) {
  const rounded = Math.round(rating)

  return (
    <div className={`flex items-center gap-1.5 ${size}`}>
      <span className="text-gold" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n}>{n <= rounded ? '★' : '☆'}</span>
        ))}
      </span>
      {typeof count === 'number' && (
        <span className="text-[#8a8672]">
          {rating > 0 ? rating.toFixed(1) : 'No reviews yet'}
          {count > 0 ? ` (${count})` : ''}
        </span>
      )}
    </div>
  )
}
