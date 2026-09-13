import React, { useEffect, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '../../api/client.js'

export default function BlacklistPage() {
  const [entries, setEntries] = useState([])
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => apiGet('/api/admin/blacklist').then((r) => setEntries(r.blacklist)).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await apiPost('/api/admin/blacklist', { email, reason: reason || undefined })
      setEmail('')
      setReason('')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    await apiDelete(`/api/admin/blacklist/${id}`)
    load()
  }

  return (
    <div>
      <h2 className="mb-2 text-3xl">Blacklist</h2>
      <p className="mb-6 text-sm text-[#6a6656]">
        Emails listed here can never register a new account. Existing accounts are not affected.
      </p>

      <form onSubmit={add} className="mb-6 flex flex-wrap items-end gap-3 rounded-sm border border-gold/30 bg-ivory p-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">Reason (optional)</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
          />
        </div>
        <button disabled={busy} className="rounded-full bg-forestDeep px-5 py-2 text-xs uppercase tracking-wide text-cream disabled:opacity-60">
          {busy ? 'Adding…' : 'Add to blacklist'}
        </button>
      </form>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <div className="overflow-x-auto rounded-sm border border-gold/30 bg-ivory">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/30 text-xs uppercase tracking-wide text-moss">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Added by</th>
              <th className="p-3">Added</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-gold/15">
                <td className="p-3">{e.email}</td>
                <td className="p-3">{e.reason || '—'}</td>
                <td className="p-3">{e.created_by_name || '—'}</td>
                <td className="p-3 text-xs">{new Date(e.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <button onClick={() => remove(e.id)} className="text-xs underline text-[#a35a3a]">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-[#6a6656]">No blacklisted emails.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
