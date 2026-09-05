import React, { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut } from '../../api/client.js'

export default function MaintenancePage() {
  const [status, setStatus] = useState(null)
  const [outages, setOutages] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ starts_at: '', ends_at: '', reason: '' })

  const load = () => {
    apiGet('/api/site/status').then(setStatus).catch((e) => setError(e.message))
    apiGet('/api/admin/outages').then((r) => setOutages(r.outages)).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  const toggleMaintenance = async () => {
    setError('')
    try {
      await apiPut('/api/admin/maintenance-mode', { enabled: !status?.maintenance_mode })
      load()
    } catch (err) {
      setError(err.message)
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

      <div className="mb-8 flex items-center justify-between rounded-sm border border-gold/30 bg-ivory p-5">
        <div>
          <p className="font-serif text-lg text-forestDeep">Maintenance mode</p>
          <p className="text-sm text-[#8a8672]">
            When on, customer-facing pages show a "we'll be back shortly" placeholder. Admin
            routes stay accessible.
          </p>
        </div>
        <button
          onClick={toggleMaintenance}
          className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wide ${
            status?.maintenance_mode ? 'bg-[#a35a3a] text-cream' : 'bg-forestDeep text-cream'
          }`}
        >
          {status?.maintenance_mode ? 'Turn Off' : 'Turn On'}
        </button>
      </div>

      <h3 className="mb-3 font-serif text-xl">Outage calendar</h3>
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
