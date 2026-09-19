import React, { useState } from 'react'
import { apiPut } from '../../api/client.js'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
// Show Monday first, Sunday last (the way most shops think of a week).
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

const timeInput = 'rounded-sm border border-gold/30 bg-cream px-2 py-1 text-sm disabled:opacity-40'

// Turns the saved hours ({"0": {open, close}, ...}) into one editable row per day.
function toRows(hours) {
  return Array.from({ length: 7 }, (_, d) => {
    const h = hours?.[String(d)]
    return { open: Boolean(h), start: h?.open || '09:00', end: h?.close || '18:00' }
  })
}

/**
 * Opening hours for one branch. Tick a day = open that day; untick = closed.
 * Online bookings for services at this branch only ever offer times
 * inside these hours (and never on a closed day).
 */
export default function BranchHoursEditor({ branch, onSaved }) {
  const [rows, setRows] = useState(() => toRows(branch.opening_hours))
  const [quick, setQuick] = useState({ start: '09:00', end: '18:00' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const configured = Boolean(branch.opening_hours)

  const update = (day, patch) => setRows((r) => r.map((row, i) => (i === day ? { ...row, ...patch } : row)))
  const applyToAll = () => setRows((r) => r.map(() => ({ open: true, start: quick.start, end: quick.end })))

  const save = async (hours) => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await apiPut(`/api/branches/${branch.id}/hours`, { hours })
      setMessage(hours ? 'Opening hours saved.' : 'Opening hours cleared.')
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const saveHours = () => {
    const hours = {}
    rows.forEach((row, d) => {
      if (row.open) hours[String(d)] = { open: row.start, close: row.end }
    })
    save(hours)
  }

  return (
    <div className="mt-4 border-t border-gold/20 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-moss">Opening hours</p>
      <p className="mb-3 mt-1 max-w-2xl text-xs text-[#6a6656]">
        {configured
          ? 'Customers can only book services at this branch during these hours. Untick a day to close it.'
          : 'Not set yet — until you save hours, bookings follow each service’s own weekly times only.'}
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-xs text-[#6a6656]">Quick fill:</span>
        <input type="time" aria-label="Opening time for all days" value={quick.start} onChange={(e) => setQuick({ ...quick, start: e.target.value })} className={timeInput} />
        <span>to</span>
        <input type="time" aria-label="Closing time for all days" value={quick.end} onChange={(e) => setQuick({ ...quick, end: e.target.value })} className={timeInput} />
        <button type="button" onClick={applyToAll} className="rounded-full border border-forestDeep/30 px-3 py-1 text-xs text-forestDeep">
          Apply to every day
        </button>
      </div>

      <ul className="space-y-1.5 text-sm">
        {DAY_ORDER.map((d) => (
          <li key={d} className="flex flex-wrap items-center gap-3">
            <label className="flex w-36 items-center gap-2">
              <input type="checkbox" checked={rows[d].open} onChange={(e) => update(d, { open: e.target.checked })} />
              {DAY_NAMES[d]}
            </label>
            {rows[d].open ? (
              <>
                <input type="time" aria-label={`${DAY_NAMES[d]} opens`} value={rows[d].start} onChange={(e) => update(d, { start: e.target.value })} className={timeInput} />
                <span>to</span>
                <input type="time" aria-label={`${DAY_NAMES[d]} closes`} value={rows[d].end} onChange={(e) => update(d, { end: e.target.value })} className={timeInput} />
              </>
            ) : (
              <span className="text-[#6a6656]">Closed</span>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy} onClick={saveHours} className="rounded-full bg-forestDeep px-5 py-2 text-xs uppercase tracking-wide text-cream disabled:opacity-60">
          {busy ? 'Saving…' : 'Save opening hours'}
        </button>
        {configured && (
          <button type="button" disabled={busy} onClick={() => save(null)} className="text-xs underline text-[#a35a3a]">
            Clear hours (no restriction)
          </button>
        )}
        {message && <span role="status" className="text-sm text-moss">{message}</span>}
        {error && <span role="alert" className="text-sm text-[#a35a3a]">{error}</span>}
      </div>
    </div>
  )
}
