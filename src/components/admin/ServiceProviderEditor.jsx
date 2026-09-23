import React, { useEffect, useState } from 'react'
import { apiGet, apiPut } from '../../api/client.js'
import ImageUploader from './ImageUploader.jsx'
import ProviderBadge from '../ProviderBadge.jsx'
import { setServiceProvider } from '../../hooks/useServiceProvider.js'
import { DEFAULT_PROVIDER } from '../../lib/serviceProvider.js'

// Admin -> Services -> "Service provider".
// Every service on the site is delivered by one company (a Shani'z
// subsidiary, e.g. Miracles Hair and Skin Clinic). What is set here shows
// on service thumbnails, service pages, the booking pop-up, basket,
// checkout, order pages, emails, SMS and invoices. Branches (Admin ->
// Branches) are that company's branches.

const inputClass = 'w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm'
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-moss'

export default function ServiceProviderEditor() {
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(null) // last saved copy, to know if there are unsaved changes
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showEdit, setShowEdit] = useState(false) // the fields are hidden until "Edit Service Provider" is clicked

  useEffect(() => {
    apiGet('/api/site/service-provider')
      .then((r) => {
        const value = { ...DEFAULT_PROVIDER, ...r.service_provider }
        setForm(value)
        setSaved(value)
      })
      .catch((e) => setError(e.message))
  }, [])

  if (!form) return error ? <p className="mb-6 text-sm text-[#a35a3a]">{error}</p> : null

  const set = (patch) => {
    setMessage('')
    setForm((f) => ({ ...f, ...patch }))
  }
  const dirty = JSON.stringify(form) !== JSON.stringify(saved)

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const res = await apiPut('/api/site/service-provider', {
        name: form.name,
        logo_url: form.logo_url || '',
        wording_en: form.wording_en,
        wording_si: form.wording_si || '',
        wording_ta: form.wording_ta || '',
      })
      const value = { ...DEFAULT_PROVIDER, ...res.service_provider }
      setForm(value)
      setSaved(value)
      setServiceProvider(value) // update the rest of the admin panel straight away
      setMessage('Saved. The website now shows this on every service.')
      setShowEdit(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // Collapsed: just enough to see who the provider is set to right now,
  // plus a button to open the full editor below.
  if (!showEdit) {
    return (
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-gold/30 bg-ivory p-5">
        <div className="flex items-center gap-3">
          {form.logo_url ? (
            <img src={form.logo_url} alt="" className="h-10 w-auto max-w-[7rem] rounded-sm border border-gold/30 bg-white object-contain p-1" />
          ) : (
            <span className="rounded-sm border border-gold/30 bg-cream px-2 py-1 text-xs text-[#6a6656]">No logo yet</span>
          )}
          <div>
            <h3 className="text-lg">Service provider: {form.name}</h3>
            <p className="text-xs text-[#6a6656]">Shown on every service — logo, wording, and appointment locations.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowEdit(true)}
          className="rounded-full bg-forestDeep px-5 py-2 text-xs uppercase tracking-wide text-cream"
        >
          Edit Service Provider
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={save} className="mb-8 rounded-sm border border-gold/30 bg-ivory p-5" aria-labelledby="provider-heading">
      <h3 id="provider-heading" className="text-xl">Service provider</h3>
      <p className="mb-4 mt-1 text-sm text-[#6a6656]">
        All services are provided by this company (a Shani'z subsidiary). Its logo appears on every service
        thumbnail and description, and its name appears on every appointment location (booking, basket, checkout,
        emails, invoices). Add its branches in <strong>Admin → Branches</strong>.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="provider-name" className={labelClass}>Company name</label>
          <input id="provider-name" required maxLength={120} value={form.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} />
        </div>
        <div>
          <ImageUploader
            label="Logo (transparent PNG works best)"
            value={form.logo_url}
            onChange={(url) => set({ logo_url: url })}
            accept="image/png,image/jpeg,image/webp"
            endpoint="/api/uploads/logo"
            previewClassName="h-14 w-24 rounded-sm border border-gold/30 bg-white object-contain p-1"
          />
          <p className="mt-1 text-xs text-[#6a6656]">No logo? The company name is shown as text instead.</p>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className={labelClass}>Wording next to the logo</legend>
        <p className="mb-2 text-xs text-[#6a6656]">
          Type <code className="rounded bg-cream px-1">{'{name}'}</code> where the company name should go — for example
          “A service by {'{name}'}”. Sinhala/Tamil are optional; English is shown if left empty.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="provider-wording-en" className="mb-1 block text-xs text-moss">English</label>
            <input id="provider-wording-en" required maxLength={160} value={form.wording_en} onChange={(e) => set({ wording_en: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="provider-wording-si" className="mb-1 block text-xs text-moss">Sinhala (සිංහල)</label>
            <input id="provider-wording-si" maxLength={160} value={form.wording_si || ''} onChange={(e) => set({ wording_si: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="provider-wording-ta" className="mb-1 block text-xs text-moss">Tamil (தமிழ்)</label>
            <input id="provider-wording-ta" maxLength={160} value={form.wording_ta || ''} onChange={(e) => set({ wording_ta: e.target.value })} className={inputClass} />
          </div>
        </div>
      </fieldset>

      {/* Live preview of what customers will see (uses the unsaved values). */}
      <div className="mt-5">
        <p className={labelClass}>Preview</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-gradient-to-br from-forestDeep to-moss" role="img" aria-label="Preview of a service thumbnail">
            <ProviderBadge variant="overlay" decorative override={form} />
          </div>
          <div className="space-y-2">
            <ProviderBadge variant="block" override={form} />
            <p className="text-xs text-[#6a6656]">
              Appointment location example: <strong>{form.name} — Kandy</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy || !dirty} className="rounded-full bg-forestDeep px-5 py-2 text-xs uppercase tracking-wide text-cream disabled:opacity-50">
          {busy ? 'Saving…' : 'Save service provider'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (dirty && !window.confirm('Discard these changes?')) return
            setForm(saved)
            setShowEdit(false)
          }}
          className="text-xs underline text-[#6a6656]"
        >
          Cancel
        </button>
        {dirty && !busy && <span className="text-xs text-[#8a6d3b]">Unsaved changes</span>}
        <span role="status" className="text-sm text-moss">{message}</span>
        {error && <span role="alert" className="text-sm text-[#a35a3a]">{error}</span>}
      </div>
    </form>
  )
}
