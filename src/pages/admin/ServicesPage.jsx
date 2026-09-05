import React, { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/client.js'
import ImageUploader from '../../components/admin/ImageUploader.jsx'
import { formatLKR } from '../../lib/currency.js'
import { formatCalendarDate } from '../../lib/date.js'

const emptyForm = { name: '', description: '', price_lkr: '', service_type: 'bookable', duration_minutes: '', image_url: '' }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [expanded, setExpanded] = useState(null)
  const [windows, setWindows] = useState({})
  const [newWindow, setNewWindow] = useState({ day_of_week: 1, start_time: '09:00', end_time: '18:00' })
  const [blackouts, setBlackouts] = useState({})
  const [newBlackout, setNewBlackout] = useState({ blackout_date: '', reason: '' })

  const load = () => apiGet('/api/services').then((r) => setServices(r.services)).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiPost('/api/services', {
        name: form.name,
        description: form.description || undefined,
        price_lkr: Number(form.price_lkr),
        service_type: form.service_type,
        duration_minutes: form.service_type === 'bookable' ? Number(form.duration_minutes) : undefined,
        images: form.image_url ? [form.image_url] : undefined,
      })
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleActive = async (s) => {
    setError('')
    try {
      if (s.is_active) await apiDelete(`/api/services/${s.id}`)
      else await apiPut(`/api/services/${s.id}`, { is_active: true })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const loadWindows = async (serviceId) => {
    const res = await apiGet(`/api/services/${serviceId}/availability`)
    setWindows((w) => ({ ...w, [serviceId]: res.windows }))
  }

  const loadBlackouts = async (serviceId) => {
    const res = await apiGet(`/api/services/${serviceId}/blackouts`)
    setBlackouts((b) => ({ ...b, [serviceId]: res.blackouts }))
  }

  const toggleExpand = (s) => {
    if (expanded === s.id) {
      setExpanded(null)
    } else {
      setExpanded(s.id)
      loadWindows(s.id)
      loadBlackouts(s.id)
    }
  }

  const addWindow = async (serviceId) => {
    setError('')
    try {
      await apiPost(`/api/services/${serviceId}/availability`, {
        day_of_week: Number(newWindow.day_of_week),
        start_time: newWindow.start_time,
        end_time: newWindow.end_time,
      })
      loadWindows(serviceId)
    } catch (err) {
      setError(err.message)
    }
  }

  const removeWindow = async (serviceId, windowId) => {
    await apiDelete(`/api/services/${serviceId}/availability/${windowId}`)
    loadWindows(serviceId)
  }

  const addBlackout = async (serviceId) => {
    setError('')
    if (!newBlackout.blackout_date) return
    try {
      await apiPost(`/api/services/${serviceId}/blackouts`, {
        blackout_date: newBlackout.blackout_date,
        reason: newBlackout.reason || undefined,
      })
      setNewBlackout({ blackout_date: '', reason: '' })
      loadBlackouts(serviceId)
    } catch (err) {
      setError(err.message)
    }
  }

  const removeBlackout = async (serviceId, blackoutId) => {
    await apiDelete(`/api/services/${serviceId}/blackouts/${blackoutId}`)
    loadBlackouts(serviceId)
  }

  return (
    <div>
      <h2 className="mb-6 text-3xl">Services</h2>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <form onSubmit={handleCreate} className="mb-8 grid grid-cols-2 gap-3 rounded-sm border border-gold/30 bg-ivory p-5 md:grid-cols-6">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm md:col-span-2" />
        <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm">
          <option value="bookable">Bookable</option>
          <option value="purchasable">Purchasable</option>
        </select>
        <input required type="number" step="0.01" placeholder="Price (LKR)" value={form.price_lkr} onChange={(e) => setForm({ ...form, price_lkr: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        {form.service_type === 'bookable' && (
          <input required type="number" placeholder="Duration (min)" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        )}
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="col-span-2 rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm md:col-span-6" />
        <button type="submit" className="rounded-full bg-forestDeep px-4 py-2 text-xs uppercase tracking-wide text-cream">Add Service</button>
      </form>

      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id} className="rounded-sm border border-gold/30 bg-ivory p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-serif text-lg text-forestDeep">{s.name}</p>
                <p className="text-xs text-[#8a8672]">
                  {s.service_type} {s.duration_minutes ? `· ${s.duration_minutes} min` : ''} ·{' '}
                  {formatLKR(s.price_lkr)} ·{' '}
                  <span className={s.is_active ? 'text-moss' : 'text-[#a35a3a]'}>{s.is_active ? 'Active' : 'Inactive'}</span>
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                {s.service_type === 'bookable' && (
                  <button onClick={() => toggleExpand(s)} className="underline text-forestDeep">
                    {expanded === s.id ? 'Hide availability' : 'Manage availability'}
                  </button>
                )}
                <button onClick={() => toggleActive(s)} className="underline text-[#a35a3a]">
                  {s.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>

            {expanded === s.id && (
              <div className="mt-4 border-t border-gold/20 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-moss">Weekly windows</p>
                <ul className="mb-3 space-y-1 text-sm">
                  {(windows[s.id] || []).map((w) => (
                    <li key={w.id} className="flex items-center gap-3">
                      <span className="w-10">{DAYS[w.day_of_week]}</span>
                      <span>{w.start_time.slice(0, 5)}–{w.end_time.slice(0, 5)}</span>
                      <button onClick={() => removeWindow(s.id, w.id)} className="text-xs text-[#a35a3a] underline">remove</button>
                    </li>
                  ))}
                  {(windows[s.id] || []).length === 0 && <li className="text-[#8a8672]">No windows set — this service has no bookable slots yet.</li>}
                </ul>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <select value={newWindow.day_of_week} onChange={(e) => setNewWindow({ ...newWindow, day_of_week: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-2 py-1">
                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                  </select>
                  <input type="time" value={newWindow.start_time} onChange={(e) => setNewWindow({ ...newWindow, start_time: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-2 py-1" />
                  <span>to</span>
                  <input type="time" value={newWindow.end_time} onChange={(e) => setNewWindow({ ...newWindow, end_time: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-2 py-1" />
                  <button onClick={() => addWindow(s.id)} className="rounded-full bg-forestDeep px-3 py-1.5 text-xs text-cream">Add window</button>
                </div>

                <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-moss">
                  Blackout dates (days off)
                </p>
                <ul className="mb-3 space-y-1 text-sm">
                  {(blackouts[s.id] || []).map((b) => (
                    <li key={b.id} className="flex items-center gap-3">
                      <span className="w-28">{formatCalendarDate(b.blackout_date)}</span>
                      <span className="flex-1 text-[#8a8672]">{b.reason || '—'}</span>
                      <button onClick={() => removeBlackout(s.id, b.id)} className="text-xs text-[#a35a3a] underline">remove</button>
                    </li>
                  ))}
                  {(blackouts[s.id] || []).length === 0 && (
                    <li className="text-[#8a8672]">No days off scheduled — every window above stays bookable.</li>
                  )}
                </ul>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <input
                    type="date"
                    value={newBlackout.blackout_date}
                    onChange={(e) => setNewBlackout({ ...newBlackout, blackout_date: e.target.value })}
                    className="rounded-sm border border-gold/30 bg-cream px-2 py-1"
                  />
                  <input
                    placeholder="Reason (optional)"
                    value={newBlackout.reason}
                    onChange={(e) => setNewBlackout({ ...newBlackout, reason: e.target.value })}
                    className="rounded-sm border border-gold/30 bg-cream px-2 py-1"
                  />
                  <button onClick={() => addBlackout(s.id)} className="rounded-full bg-forestDeep px-3 py-1.5 text-xs text-cream">
                    Block out day
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {services.length === 0 && <p className="text-sm text-[#8a8672]">No services yet.</p>}
      </div>
    </div>
  )
}
