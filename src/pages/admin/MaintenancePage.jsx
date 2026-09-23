import React, { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut } from '../../api/client.js'

export default function MaintenancePage() {
  const [status, setStatus] = useState(null)
  const [outages, setOutages] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ starts_at: '', ends_at: '', reason: '' })
  const [scheduleForm, setScheduleForm] = useState({ starts_at: '', ends_at: '', reason: '' })
  const [extendTo, setExtendTo] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => {
    apiGet('/api/site/status').then(setStatus).catch((e) => setError(e.message))
    apiGet('/api/admin/outages').then((r) => setOutages(r.outages)).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  const schedule = status?.maintenance_schedule
  const isScheduledOrActive = Boolean(schedule?.enabled)
  const now = Date.now()
  const startsAtMs = schedule?.starts_at ? new Date(schedule.starts_at).getTime() : null
  const endsAtMs = schedule?.ends_at ? new Date(schedule.ends_at).getTime() : null
  // The backend computes maintenance_mode live from now vs the
  // start/end times, so once ends_at passes the site itself is already
  // back to normal — but the schedule row stays "enabled" until someone
  // explicitly turns it off. Without this check, "Turn Off Now" (and a
  // stale "Scheduled — will activate at [a time in the past]" message)
  // would keep showing indefinitely for an outage that's long over.
  const hasExpired = isScheduledOrActive && endsAtMs !== null && now > endsAtMs
  const notYetStarted = isScheduledOrActive && startsAtMs !== null && now < startsAtMs

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

  // Pushes the existing schedule's end time further out (or removes it
  // entirely, for "stay on until I turn it off"), keeping the same
  // starts_at/reason. This is what brings an expired schedule back to
  // "active" — and with it, the Turn Off Now button.
  const extendOutage = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await apiPut('/api/admin/maintenance-mode', {
        enabled: true,
        starts_at: schedule.starts_at,
        ends_at: extendTo ? new Date(extendTo).toISOString() : undefined,
        reason: schedule.reason || undefined,
      })
      setExtendTo('')
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
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-serif text-lg text-forestDeep">Maintenance mode</p>
            <p className="text-sm text-[#6a6656]">
              When active, customer-facing pages show a "we'll be back shortly" placeholder.
              Admin routes and the sign-in page always stay reachable — including this page —
              so you can turn it off from here even while it's showing to everyone else.
            </p>
          </div>
          {isScheduledOrActive && (
            <div className="flex shrink-0 gap-2">
              {/* Once the scheduled end time has passed, the site is
                  already back to normal (see hasExpired above) — Turn
                  Off Now would just be a no-op, so it's disabled and
                  labelled to say so, rather than disappearing outright.
                  Extend is always available while a schedule exists. */}
              <button
                onClick={turnOffNow}
                disabled={busy || hasExpired}
                title={hasExpired ? 'This schedule already ended \u2014 nothing to turn off.' : undefined}
                className="rounded-full bg-[#a35a3a] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-cream disabled:cursor-not-allowed disabled:opacity-40"
              >
                {hasExpired ? 'Already Ended' : 'Turn Off Now'}
              </button>
            </div>
          )}
        </div>

        {/* Current status readout */}
        <div className="mb-5 rounded-sm bg-cream px-4 py-3 text-sm">
          {!isScheduledOrActive && <p className="text-[#6a6656]">Currently off — nothing scheduled.</p>}
          {isScheduledOrActive && hasExpired && (
            <p className="font-semibold text-forestDeep">
              This scheduled outage ended at {new Date(schedule.ends_at).toLocaleString()} — the site is
              back to normal. Extend it below if the work isn't actually done yet.
            </p>
          )}
          {isScheduledOrActive && !hasExpired && status?.maintenance_mode && (
            <p className="font-semibold text-[#a35a3a]">
              Active now{schedule?.reason ? ` — ${schedule.reason}` : ''}
              {schedule?.ends_at
                ? ` · auto-clears at ${new Date(schedule.ends_at).toLocaleString()}`
                : ' · will stay on until you turn it off'}
            </p>
          )}
          {isScheduledOrActive && notYetStarted && (
            <p className="font-semibold text-forestDeep">
              Scheduled — will activate at {new Date(schedule.starts_at).toLocaleString()}
              {schedule?.reason ? ` (${schedule.reason})` : ''}
            </p>
          )}
        </div>

        {isScheduledOrActive && (hasExpired || (!notYetStarted && status?.maintenance_mode)) && (
          <form onSubmit={extendOutage} className="mb-5 flex flex-wrap items-end gap-3 rounded-sm border border-gold/20 bg-cream/60 p-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-moss">
                Extend to (leave blank for "until I turn it off")
              </label>
              <input
                type="datetime-local"
                value={extendTo}
                onChange={(e) => setExtendTo(e.target.value)}
                className="rounded-sm border border-gold/30 bg-ivory px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-forestDeep px-4 py-2 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
            >
              Extend Outage
            </button>
          </form>
        )}

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
        <p className="mt-2 text-xs text-[#6a6656]">
          Leaving "Ends" blank means it stays active until you click Turn Off Now — useful when you
          don't know exactly how long the work will take.
        </p>
      </div>

      <h3 className="mb-3 font-serif text-xl">Outage calendar</h3>
      <p className="mb-3 text-sm text-[#6a6656]">
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
        <table className="w-full min-w-[720px] text-left text-sm">
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
            {outages.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-[#6a6656]">No outages scheduled.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
