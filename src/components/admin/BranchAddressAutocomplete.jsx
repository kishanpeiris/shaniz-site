import React, { useEffect, useId, useRef, useState } from 'react'
import { apiGet } from '../../api/client.js'

// "Address" field on Admin -> Branches: real Sri Lanka address
// suggestions as the admin types (same idea as the checkout/account
// address field), via GET /api/branches/address-autocomplete. Picking a
// suggestion fills the address text AND moves the map pin in one step
// (onPickCoordinates), so admins usually don't need "Find on map" at all
// afterwards — it's still there underneath for fine-tuning or a manual
// pin drop.
export default function BranchAddressAutocomplete({ value, onChange, onPickCoordinates, placeholder = 'Address', className = '' }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const debounceRef = useRef(null)
  const requestSeq = useRef(0)
  const listboxId = useId()

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!value || value.trim().length < 4) {
      setSuggestions([])
      return
    }
    const seq = ++requestSeq.current
    debounceRef.current = setTimeout(() => {
      apiGet(`/api/branches/address-autocomplete?q=${encodeURIComponent(value)}`)
        .then((res) => {
          if (seq !== requestSeq.current) return // a newer keystroke already superseded this
          setSuggestions(res.suggestions || [])
          setHighlight(-1)
        })
        .catch(() => {
          if (seq === requestSeq.current) setSuggestions([]) // fail quiet — typing by hand still works
        })
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [value])

  const choose = (s) => {
    onChange(s.label)
    onPickCoordinates?.(s.latitude, s.longitude)
    setOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <input
        required
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listboxId}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlight((h) => Math.min(h + 1, suggestions.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlight((h) => Math.max(h - 1, 0))
          } else if (e.key === 'Enter' && highlight >= 0) {
            e.preventDefault()
            choose(suggestions[highlight])
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
      />
      {open && suggestions.length > 0 && (
        <ul id={listboxId} role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-sm border border-gold/30 bg-ivory shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={i}
              role="option"
              aria-selected={i === highlight}
              onMouseDown={(e) => e.preventDefault()} // keep focus so onBlur doesn't beat the click
              onClick={() => choose(s)}
              className={`cursor-pointer px-3 py-2 text-sm text-forestDeep ${i === highlight ? 'bg-gold/20' : 'hover:bg-gold/10'}`}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
