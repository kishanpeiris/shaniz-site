import React, { useEffect, useState } from 'react'
import { apiGet, apiPut } from '../../api/client.js'

/**
 * Tick the services this branch offers. Customers booking a service can only
 * choose among the branches that offer it, so a service needs at least one
 * branch ticked before it can be booked online.
 */
export default function BranchServicesEditor({ branch, onSaved }) {
  const [services, setServices] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([apiGet('/api/services?all=true'), apiGet(`/api/branches/${branch.id}/services`)])
      .then(([s, b]) => {
        setServices(s.services.filter((x) => x.service_type === 'bookable'))
        setSelected(new Set(b.service_ids))
      })
      .catch((e) => setError(e.message))
  }, [branch.id])

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const save = async () => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await apiPut(`/api/branches/${branch.id}/services`, { service_ids: [...selected] })
      setMessage('Saved — customers can now book these services at this branch.')
      onSaved?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 border-t border-gold/20 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-moss">Services offered at this branch</p>
      <p className="mb-3 mt-1 max-w-2xl text-xs text-[#6a6656]">
        Tick every bookable service this branch provides. When a service is ticked at several branches, the customer
        chooses which branch to attend.
      </p>
      {!services && !error && <p className="text-sm text-[#6a6656]">Loading…</p>}
      {services && services.length === 0 && (
        <p className="text-sm text-[#6a6656]">No bookable services yet — add one under Services first.</p>
      )}
      <ul className="space-y-1.5 text-sm">
        {(services || []).map((s) => (
          <li key={s.id}>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
              <span className={s.is_active ? '' : 'text-[#6a6656] line-through'}>{s.name}</span>
              <span className="text-xs text-[#6a6656]">{s.duration_minutes} min</span>
            </label>
          </li>
        ))}
      </ul>
      {services && services.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" disabled={busy} onClick={save} className="rounded-full bg-forestDeep px-5 py-2 text-xs uppercase tracking-wide text-cream disabled:opacity-60">
            {busy ? 'Saving…' : 'Save services'}
          </button>
          {message && <span role="status" className="text-sm text-moss">{message}</span>}
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-[#a35a3a]">{error}</p>}
    </div>
  )
}
