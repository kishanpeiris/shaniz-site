import React, { useEffect, useId, useRef, useState } from 'react'
import { searchCities, findByPostalCode } from '../data/sriLankaCities.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { apiGet } from '../api/client.js'

// A small custom dropdown rather than a native <datalist> — the full
// Sri Lanka postal directory has 2,000+ towns, and rendering that many
// <option> elements can feel sluggish on the older/budget Android
// phones common here. This only ever renders the current top matches,
// so it stays fast regardless of list size.
function Suggestions({ id, items, highlight, onPick, render }) {
  if (items.length === 0) return null
  return (
    <ul id={id} role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-sm border border-gold/30 bg-ivory shadow-lg">
      {items.map((item, i) => (
        <li
          key={i}
          role="option"
          aria-selected={i === highlight}
          onMouseDown={(e) => e.preventDefault()} // keep focus so onBlur doesn't beat the click
          onClick={() => onPick(item)}
          className={`cursor-pointer px-3 py-2 text-sm ${i === highlight ? 'bg-gold/20' : 'hover:bg-gold/10'}`}
        >
          {render(item)}
        </li>
      ))}
    </ul>
  )
}

// "Address line 1" — a full street address (house number, street name,
// sometimes an apartment/floor), so it gets a multi-line textarea (not
// a single-line input) plus real suggestions from LocationIQ/Nominatim
// as the person types, via the backend's /api/site/address-autocomplete
// (never called directly from the browser — no API key exposed
// client-side, and the backend applies rate limiting).
function AddressLineAutocomplete({ value, onChange, placeholder, listboxId }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const debounceRef = useRef(null)
  const requestSeq = useRef(0)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (value.trim().length < 5) {
      setSuggestions([])
      return
    }
    const seq = ++requestSeq.current
    debounceRef.current = setTimeout(() => {
      apiGet(`/api/site/address-autocomplete?q=${encodeURIComponent(value)}`)
        .then((res) => {
          if (seq !== requestSeq.current) return // a newer keystroke already superseded this request
          setSuggestions(res.suggestions || [])
          setHighlight(-1)
        })
        .catch(() => {
          if (seq === requestSeq.current) setSuggestions([]) // fail quiet — free typing still works
        })
    }, 400) // wait for a pause in typing rather than firing on every keystroke
    return () => clearTimeout(debounceRef.current)
  }, [value])

  return (
    <div className="relative col-span-full">
      <textarea
        required
        rows={2}
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listboxId}
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
            onChange(suggestions[highlight])
            setOpen(false)
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        className="w-full resize-y rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm leading-snug"
      />
      {open && (
        <Suggestions
          id={listboxId}
          items={suggestions}
          highlight={highlight}
          onPick={(s) => {
            onChange(s)
            setOpen(false)
          }}
          render={(s) => <span className="text-forestDeep">{s}</span>}
        />
      )}
    </div>
  )
}

function CityAutocomplete({ value, onSelect, placeholder, listboxId }) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const matches = open ? searchCities(value, 8) : []

  const choose = (match) => {
    onSelect(match)
    setOpen(false)
  }

  return (
    <div className="relative">
      <input
        required
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        autoComplete="address-level2"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onSelect({ city: e.target.value, postalCode: null })
          setOpen(true)
          setHighlight(-1)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!open || matches.length === 0) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlight((h) => Math.min(h + 1, matches.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlight((h) => Math.max(h - 1, 0))
          } else if (e.key === 'Enter' && highlight >= 0) {
            e.preventDefault()
            choose(matches[highlight])
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm"
      />
      {open && (
        <Suggestions
          id={listboxId}
          items={matches}
          highlight={highlight}
          onPick={choose}
          render={(m) => (
            <>
              <span className="text-forestDeep">{m.city}</span>
              <span className="ml-2 text-xs text-[#6a6656]">{m.postalCode}</span>
            </>
          )}
        />
      )}
    </div>
  )
}

export default function AddressFields({ value, onChange, prefix, className = 'grid grid-cols-2 gap-3' }) {
  const { t } = useLanguage()
  const line1ListId = useId()
  const cityListId = useId()

  const handleCitySelect = ({ city, postalCode }) => {
    if (postalCode) {
      // Picked (or typed an exact match for) a real town — fill both.
      onChange({ ...value, city, postal_code: postalCode })
      return
    }
    // Free typing that doesn't match the directory yet — still update
    // the city text as-is; the postcode field stays whatever it was.
    onChange({ ...value, city })
  }

  const handlePostalCodeChange = (postal_code) => {
    const match = findByPostalCode(postal_code)
    onChange({
      ...value,
      postal_code,
      city: match ? match.city : value.city,
    })
  }

  return (
    <div className={className}>
      <AddressLineAutocomplete
        value={value.line1}
        onChange={(line1) => onChange({ ...value, line1 })}
        placeholder={t('address_line1_placeholder')}
        listboxId={line1ListId}
      />
      <CityAutocomplete
        value={value.city}
        onSelect={handleCitySelect}
        placeholder={t('address_city_placeholder')}
        listboxId={cityListId}
      />
      <input
        required
        placeholder={t('address_postal_code_placeholder')}
        inputMode="numeric"
        autoComplete="postal-code"
        value={value.postal_code}
        onChange={(e) => handlePostalCodeChange(e.target.value)}
        className="rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm"
      />
      {prefix && (
        <p className="col-span-full text-xs text-[#6a6656]">{t('address_sri_lanka_only', { prefix })}</p>
      )}
    </div>
  )
}
