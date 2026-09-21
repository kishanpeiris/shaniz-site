import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'

// Clickable 1-5 star picker for the "write a review" form. Hovering
// previews the star count before clicking commits it, same pattern as
// most shopping-site review forms.
export default function StarRatingInput({ value, onChange }) {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState(0)
  const shown = hovered || value

  return (
    <div className="flex gap-1 text-3xl text-gold" role="radiogroup" aria-label={t('aria_rating')}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="leading-none transition-transform hover:scale-110"
        >
          {n <= shown ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}
