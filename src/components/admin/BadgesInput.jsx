import React, { useState } from 'react'

// A handful of common banners to pick from with one click, plus a free
// text box for anything else — "ability to add more banners" just
// means typing a new one, no separate management screen needed for a
// feature this small.
const SUGGESTIONS = ['100% Natural', '100% Vegan', 'New Arrival', 'Best Seller', 'Limited Edition', 'Handmade']

export default function BadgesInput({ value = [], onChange }) {
  const [text, setText] = useState('')

  const add = (label) => {
    const clean = label.trim()
    if (!clean || value.includes(clean) || value.length >= 6) return
    onChange([...value, clean])
    setText('')
  }

  const remove = (label) => {
    onChange(value.filter((b) => b !== label))
  }

  return (
    <div>
      <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-moss">
        Special banners (up to 6)
      </p>
      {value.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {value.map((label) => (
            <span
              key={label}
              className="flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide text-forestDeep"
            >
              {label}
              <button type="button" onClick={() => remove(label)} aria-label={`Remove ${label}`} className="text-forestDeep/70 hover:text-forestDeep">
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add(text)
            }
          }}
          placeholder="Type a banner and press Enter"
          className="rounded-sm border border-gold/30 bg-cream px-2 py-1 text-xs"
        />
        {SUGGESTIONS.filter((s) => !value.includes(s)).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => add(s)}
            className="rounded-full border border-gold/40 px-2 py-1 text-[0.62rem] uppercase tracking-wide text-forestDeep hover:bg-gold/20"
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  )
}
