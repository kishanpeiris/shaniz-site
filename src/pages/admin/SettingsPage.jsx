import React, { useEffect, useState } from 'react'
import { apiGet, apiPut } from '../../api/client.js'

export default function SettingsPage() {
  const [form, setForm] = useState({ phone: '', email: '', address: '', facebook_url: '' })
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet('/api/admin/settings/business-info').then((r) => setForm({ ...form, ...r.business_info }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('saving')
    setError('')
    try {
      await apiPut('/api/admin/settings/business-info', form)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="mb-2 text-3xl">Settings</h2>
      <p className="mb-6 max-w-lg text-sm text-[#8a8672]">
        Non-secret business info shown on the storefront (Visit Us section, footer). API keys and
        database credentials are not managed here — those stay in your hosting provider's
        environment variables, for security.
      </p>

      <form onSubmit={handleSubmit} className="max-w-md rounded-sm border border-gold/30 bg-ivory p-6">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-moss">Phone</label>
        <input
          value={form.phone || ''}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="mb-4 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
        />
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-moss">Contact email</label>
        <input
          type="email"
          value={form.email || ''}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mb-4 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
        />
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-moss">Address / studio location</label>
        <input
          value={form.address || ''}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="mb-4 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
        />
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-moss">Facebook URL</label>
        <input
          type="url"
          value={form.facebook_url || ''}
          onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
          className="mb-5 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
        />

        {status === 'error' && <p className="mb-3 text-sm text-[#a35a3a]">{error}</p>}
        {status === 'saved' && <p className="mb-3 text-sm text-moss">Saved.</p>}

        <button
          type="submit"
          disabled={status === 'saving'}
          className="rounded-full bg-forestDeep px-6 py-2.5 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
        >
          {status === 'saving' ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
