import React from 'react'
import { formatLKR } from '../../lib/currency.js'

// Discount helpers shared by the Products and Services forms.

export const emptyDiscount = { discount_type: '', discount_value: '', discount_starts_at: '', discount_ends_at: '' }

// datetime-local inputs want "YYYY-MM-DDTHH:mm" in local time.
const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Form values from a saved product/service row.
export const discountFromRow = (row) => ({
  discount_type: row.discount_type || '',
  discount_value: row.discount_value ?? '',
  discount_starts_at: toLocalInput(row.discount_starts_at),
  discount_ends_at: toLocalInput(row.discount_ends_at),
})

// What the API expects (nulls clear the discount).
export const discountPayload = (f) =>
  f.discount_type
    ? {
        discount_type: f.discount_type,
        discount_value: Number(f.discount_value),
        discount_starts_at: f.discount_starts_at ? new Date(f.discount_starts_at).toISOString() : null,
        discount_ends_at: f.discount_ends_at ? new Date(f.discount_ends_at).toISOString() : null,
      }
    : { discount_type: null, discount_value: null, discount_starts_at: null, discount_ends_at: null }

function salePreview(price, f) {
  const base = Number(price)
  const v = Number(f.discount_value)
  if (!f.discount_type || !(base > 0) || !(v > 0)) return null
  const off = f.discount_type === 'percent' ? (base * v) / 100 : v
  const sale = Math.max(0, Math.round((base - off) * 100) / 100)
  return sale < base ? sale : null
}

const input = 'rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm'

/** Discount controls: none / percentage / fixed amount, with an optional schedule. */
export default function DiscountFields({ value, onChange, price }) {
  const set = (patch) => onChange({ ...value, ...patch })
  const sale = salePreview(price, value)
  return (
    <fieldset className="rounded-sm border border-gold/25 bg-cream/60 p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-moss">Discount</legend>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-[#5c5949]">
          Type
          <select value={value.discount_type} onChange={(e) => set({ discount_type: e.target.value })} className={`mt-1 block ${input}`}>
            <option value="">No discount</option>
            <option value="percent">Percentage off (%)</option>
            <option value="fixed">Fixed amount off (Rs.)</option>
          </select>
        </label>
        {value.discount_type && (
          <label className="text-xs text-[#5c5949]">
            {value.discount_type === 'percent' ? 'Percent off (1–95)' : 'Rupees off'}
            <input
              type="number"
              min="0"
              step={value.discount_type === 'percent' ? '1' : '0.01'}
              max={value.discount_type === 'percent' ? 95 : undefined}
              value={value.discount_value}
              onChange={(e) => set({ discount_value: e.target.value })}
              className={`mt-1 block w-32 ${input}`}
            />
          </label>
        )}
        {sale != null && (
          <p className="pb-2 text-sm text-forestDeep">
            Customers pay <strong>{formatLKR(sale)}</strong> <span className="text-[#6a6656]">(was {formatLKR(price)})</span>
          </p>
        )}
      </div>
      {value.discount_type && (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-xs text-[#5c5949]">
            Starts (optional)
            <input type="datetime-local" value={value.discount_starts_at} onChange={(e) => set({ discount_starts_at: e.target.value })} className={`mt-1 block ${input}`} />
          </label>
          <label className="text-xs text-[#5c5949]">
            Ends (optional)
            <input type="datetime-local" value={value.discount_ends_at} onChange={(e) => set({ discount_ends_at: e.target.value })} className={`mt-1 block ${input}`} />
          </label>
          <p className="max-w-xs pb-2 text-xs text-[#6a6656]">Leave the dates blank to keep the discount on until you remove it.</p>
        </div>
      )}
    </fieldset>
  )
}
