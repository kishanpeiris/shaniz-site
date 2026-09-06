import React, { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut } from '../../api/client.js'

export default function MaintenancePage() {
  const [status, setStatus] = useState(null)
  const [outages, setOutages] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ starts_at: '', ends_at: '', reason: '' })
  const [scheduleForm, setScheduleForm] = useState({ starts_at: '', ends_at: '', reason: '' })
  const [busy, setBusy] = useState(false)

  const load = () => {
    apiGet('/api/site/status').then(setStatus).catch((e) => setError(e.message))
    apiGet('/api/admin/outages').then((r) => setOutages(r.outages)).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  const schedule = status?.maintenance_schedule
  const isScheduledOrActive = Boolean(schedule?.enabled)

  const scheduleMaintenance = async (e) => {
    e.preventDefault()
    if (!scheduleForm.starts_at) {
      setError('A start date/time is required — maintenance mode can no longer be turned on instantly.')
      return
    }
    setError('')
    setBusy(true)
    try {
      await apiPut('/api/admin/maintenance-mode', {
        enabled: true,
        starts_at: new Date(scheduleForm.starts_at).toISOString(),
        ends_at: scheduleForm.ends_at ? new Date(scheduleForm.ends_at).toISOString() : undefined,
        reason: scheduleForm.reason || undefined,
      })
      setScheduleForm({ starts_at: '', ends_at: '', reason: '' })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const turnOffNow = async () => {
    setError('')
    setBusy(true)
    try {
      await apiPut('/api/admin/maintenance-mode', { enabled: false })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const scheduleOutage = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiPost('/api/admin/outages', {
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        reason: form.reason || undefined,
      })
      setForm({ starts_at: '', ends_at: '', reason: '' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-3xl">Maintenance</h2>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <div className="mb-8 rounded-sm border border-gold/30 bg-ivory p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-serif text-lg text-forestDeep">Maintenance mode</p>
            <p className="text-sm text-[#8a8672]">
              When active, customer-facing pages show a "we'll be back shortly" placeholder.
              Admin routes and the sign-in page always stay reachable — including this page —
              so you can turn it off from here even while it's showing to everyone else.
            </p>
          </div>
          {isScheduledOrActive && (
            <button
              onClick={turnOffNow}
              disabled={busy}
              className="shrink-0 rounded-full bg-[#a35a3a] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-cream disabled:opacity-60"
            >
              Turn Off Now
            </button>
          )}
        </div>

        {/* Current status readout */}
        <div className="mb-5 rounded-sm bg-cream px-4 py-3 text-sm">
          {!isScheduledOrActive && <p className="text-[#8a8672]">Currently off — nothing scheduled.</p>}
          {isScheduledOrActive && status?.maintenance_mode && (
            <p className="font-semibold text-[#a35a3a]">
              Active now{schedule?.reason ? ` — ${schedule.reason}` : ''}
              {schedule?.ends_at
                ? ` · auto-clears at ${new Date(schedule.ends_at).toLocaleString()}`
                : ' · will stay on until you turn it off'}
            </p>
          )}
          {isScheduledOrActive && !status?.maintenance_mode && (
            <p className="font-semibold text-forestDeep">
              Scheduled — will activate at {new Date(schedule.starts_at).toLocaleString()}
              {schedule?.reason ? ` (${schedule.reason})` : ''}
            </p>
          )}
        </div>

        {/* Scheduling form — the only way to turn it ON; instant on/off is
            gone by design (spec change: must be scheduled). */}
        <form onSubmit={scheduleMaintenance} className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-moss">Starts (required)</label>
            <input
              required
              type="datetime-local"
              value={scheduleForm.starts_at}
              onChange={(e) => setScheduleForm({ ...scheduleForm, starts_at: e.target.value })}
              className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-moss">Ends (optional)</label>
            <input
              type="datetime-local"
              value={scheduleForm.ends_at}
              onChange={(e) => setScheduleForm({ ...scheduleForm, ends_at: e.target.value })}
              className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-moss">Reason (optional)</label>
            <input
              placeholder="Site updates"
              value={scheduleForm.reason}
              onChange={(e) => setScheduleForm({ ...scheduleForm, reason: e.target.value })}
              className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="self-end rounded-full bg-forestDeep px-4 py-2 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
          >
            Schedule Maintenance
          </button>
        </form>
        <p className="mt-2 text-xs text-[#8a8672]">
          Leaving "Ends" blank means it stays active until you click Turn Off Now — useful when you
          don't know exactly how long the work will take.
        </p>
      </div>

      <h3 className="mb-3 font-serif text-xl">Outage calendar</h3>
      <p className="mb-3 text-sm text-[#8a8672]">
        Separate from maintenance mode above — this only shows a heads-up banner on customer pages
        ahead of time ("Site will be briefly unavailable on...") without actually blocking access.
      </p>
      <form onSubmit={scheduleOutage} className="mb-6 grid grid-cols-2 gap-3 rounded-sm border border-gold/30 bg-ivory p-5 md:grid-cols-4">
        <input required type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        <input required type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        <input placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        <button type="submit" className="rounded-full bg-forestDeep px-4 py-2 text-xs uppercase tracking-wide text-cream">Schedule Outage</button>
      </form>

      <div className="overflow-x-auto rounded-sm border border-gold/30 bg-ivory">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/30 text-xs uppercase tracking-wide text-moss">
            <tr><th className="p-3">Starts</th><th className="p-3">Ends</th><th className="p-3">Reason</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {outages.map((o) => (
              <tr key={o.id} className="border-b border-gold/15">
                <td className="p-3">{new Date(o.starts_at).toLocaleString()}</td>
                <td className="p-3">{new Date(o.ends_at).toLocaleString()}</td>
                <td className="p-3">{o.reason}</td>
                <td className="p-3 capitalize">{o.status}</td>
              </tr>
            ))}
            {outages.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-[#8a8672]">No outages scheduled.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
