import React, { useState } from 'react'

/**
 * The "Inside the jar" list shown on a product's page. Type an ingredient and
 * press Enter (or Add); click × to remove one. Leave it empty and the
 * section is simply not shown on the website.
 */
export default function IngredientsInput({ value = [], onChange }) {
  const [text, setText] = useState('')

  const add = () => {
    const clean = text.trim()
    if (!clean || value.includes(clean) || value.length >= 30) return
    onChange([...value, clean])
    setText('')
  }

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss">Ingredients (“Inside the jar”)</p>
      <p className="mb-2 text-xs text-[#6a6656]">Shown as a list on the product page. Leave empty to hide the section.</p>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {value.map((ing) => (
            <li key={ing} className="flex items-center gap-2 rounded-full border border-gold/40 bg-cream px-3 py-1 text-sm text-forestDeep">
              {ing}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== ing))} aria-label={`Remove ${ing}`} className="text-[#a35a3a]">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="e.g. Amla"
          className="min-w-[12rem] flex-1 rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
        />
        <button type="button" onClick={add} className="rounded-full border border-forestDeep/40 px-4 py-2 text-xs uppercase tracking-wide text-forestDeep">
          Add
        </button>
      </div>
    </div>
  )
}
