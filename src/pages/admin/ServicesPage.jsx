import React, { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/client.js'
import MultiImageUploader from '../../components/admin/MultiImageUploader.jsx'
import ImageUploader from '../../components/admin/ImageUploader.jsx'
import CategoryPicker from '../../components/admin/CategoryPicker.jsx'
import BadgesInput from '../../components/admin/BadgesInput.jsx'
import FocalPointPicker from '../../components/admin/FocalPointPicker.jsx'
import RichTextEditor from '../../components/admin/RichTextEditor.jsx'
import ServiceProviderEditor from '../../components/admin/ServiceProviderEditor.jsx'
import TranslationFields from '../../components/admin/TranslationFields.jsx'
import { formatLKR } from '../../lib/currency.js'
import { formatCalendarDate } from '../../lib/date.js'
import DiscountFields, { emptyDiscount, discountFromRow, discountPayload } from '../../components/admin/DiscountFields.jsx'

// Same AI description helper as the Products page — the backend
// endpoint already writes naturally for either a retail product or a
// bookable service (see lib/ai.js), so this is just the same button
// wired to the Services form's name/category instead.
function AiDescriptionButton({ name, category, onGenerated }) {
  const [hint, setHint] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!name) {
      setError('Enter a service name first.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await apiPost('/api/admin/ai/product-description', { name, category: category || undefined, hint: hint || undefined })
      onGenerated(res.description)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        placeholder="What's included / notes for AI (optional)"
        value={hint}
        onChange={(e) => setHint(e.target.value)}
        className="flex-1 rounded-sm border border-gold/30 bg-cream px-3 py-1.5 text-xs"
      />
      <button
        type="button"
        onClick={generate}
        disabled={busy}
        className="whitespace-nowrap rounded-full border border-gold/40 px-3 py-1.5 text-xs uppercase tracking-wide text-forestDeep disabled:opacity-60"
      >
        {busy ? 'Writing…' : 'Generate description with AI'}
      </button>
      {error && <span className="text-xs text-[#a35a3a]">{error}</span>}
    </div>
  )
}

const emptyForm = {
  name: '',
  description: '',
  name_si: '',
  name_ta: '',
  description_si: '',
  description_ta: '',
  price_lkr: '',
  service_type: 'bookable',
  duration_minutes: '',
  category_id: null,
  badges: [],
  images: [],
  hover_video_url: '',
  hover_webp_url: '',
  detail_video_url: '',
  image_focal_x: 50,
  image_focal_y: 50,
  ...emptyDiscount,
}
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Same hover/detail media picker used in the Products admin page —
// video tried first on the storefront, then the animated webp.
function HoverMediaFields({ values, onChange }) {
  return (
    <div className="col-span-2 grid gap-3 sm:grid-cols-3 md:col-span-6">
      <ImageUploader
        label="Hover video — Shop grid (MP4/WebM)"
        value={values.hover_video_url}
        onChange={(url) => onChange({ hover_video_url: url })}
        accept="video/mp4,video/webm,video/quicktime"
        kind="video"
        endpoint="/api/uploads/video"
      />
      <ImageUploader
        label="Hover image (animated WebP)"
        value={values.hover_webp_url}
        onChange={(url) => onChange({ hover_webp_url: url })}
        accept="image/webp"
        endpoint="/api/uploads/hover-image"
      />
      <ImageUploader
        label="Detail page video (optional — hover video is used if empty)"
        value={values.detail_video_url}
        onChange={(url) => onChange({ detail_video_url: url })}
        accept="video/mp4,video/webm,video/quicktime"
        kind="video"
        endpoint="/api/uploads/video"
      />
    </div>
  )
}

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [branches, setBranches] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [expanded, setExpanded] = useState(null)
  const [windows, setWindows] = useState({})
  const [newWindow, setNewWindow] = useState({ day_of_week: 1, start_time: '09:00', end_time: '18:00' })
  const [editingWin, setEditingWin] = useState(null) // { id, day_of_week, start_time, end_time }
  const [blackouts, setBlackouts] = useState({})
  const [newBlackout, setNewBlackout] = useState({ blackout_date: '', reason: '' })

  const load = () => apiGet('/api/services?all=true').then((r) => setServices(r.services)).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])
  useEffect(() => { apiGet('/api/branches').then((r) => setBranches(r.branches)).catch(() => {}) }, [])

  // Same reasoning as ProductsPage.jsx's cancelCreate — only interrupts
  // with a confirmation if there's actually something typed to lose.
  const isFormEmpty = (f) => JSON.stringify(f) === JSON.stringify(emptyForm)
  const cancelCreate = () => {
    if (!isFormEmpty(form) && !window.confirm('Discard this new service? Anything you\u2019ve entered will be lost.')) return
    setForm(emptyForm)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiPost('/api/services', {
        name: form.name,
        description: form.description || undefined,
        name_si: form.name_si || undefined,
        name_ta: form.name_ta || undefined,
        description_si: form.description_si || undefined,
        description_ta: form.description_ta || undefined,
        price_lkr: Number(form.price_lkr),
        service_type: form.service_type,
        duration_minutes: form.service_type === 'bookable' ? Number(form.duration_minutes) : undefined,
        category_id: form.category_id || null,
        badges: form.badges,
        images: form.images,
        hover_video_url: form.hover_video_url || undefined,
        hover_webp_url: form.hover_webp_url || undefined,
        detail_video_url: form.detail_video_url || null,
        image_focal_x: form.image_focal_x,
        image_focal_y: form.image_focal_y,
        ...discountPayload(form),
      })
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    setEditForm({
      name: s.name,
      description: s.description || '',
      name_si: s.name_si || '',
      name_ta: s.name_ta || '',
      description_si: s.description_si || '',
      description_ta: s.description_ta || '',
      price_lkr: s.price_lkr,
      service_type: s.service_type,
      duration_minutes: s.duration_minutes || '',
      category_id: s.category_id || null,
      badges: s.badges || [],
      images: s.images || [],
      hover_video_url: s.hover_video_url || '',
      hover_webp_url: s.hover_webp_url || '',
      detail_video_url: s.detail_video_url || '',
      image_focal_x: s.image_focal_x ?? 50,
      image_focal_y: s.image_focal_y ?? 50,
      ...discountFromRow(s),
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(emptyForm)
  }

  const saveEdit = async (id) => {
    setError('')
    try {
      await apiPut(`/api/services/${id}`, {
        name: editForm.name,
        description: editForm.description || undefined,
        name_si: editForm.name_si || undefined,
        name_ta: editForm.name_ta || undefined,
        description_si: editForm.description_si || undefined,
        description_ta: editForm.description_ta || undefined,
        price_lkr: Number(editForm.price_lkr),
        duration_minutes: editForm.service_type === 'bookable' ? Number(editForm.duration_minutes) : undefined,
        category_id: editForm.category_id || null,
        badges: editForm.badges,
        images: editForm.images,
        hover_video_url: editForm.hover_video_url || undefined,
        hover_webp_url: editForm.hover_webp_url || undefined,
        detail_video_url: editForm.detail_video_url || null,
        image_focal_x: editForm.image_focal_x,
        image_focal_y: editForm.image_focal_y,
        ...discountPayload(editForm),
      })
      cancelEdit()
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

  // Permanent delete — blocked server-side if the service already has
  // bookings on record (see services.routes.js), surfaced here as a
  // normal error message rather than a crash.
  const permanentDelete = async (s) => {
    if (!window.confirm(`Permanently delete "${s.name}"? This can't be undone.`)) return
    setError('')
    try {
      await apiDelete(`/api/services/${s.id}/permanent`)
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
      // "all" = add the same times for every day of the week, Sun–Sat.
      const days = newWindow.day_of_week === 'all' ? [0, 1, 2, 3, 4, 5, 6] : [Number(newWindow.day_of_week)]
      for (const day of days) {
        await apiPost(`/api/services/${serviceId}/availability`, {
          day_of_week: day,
          start_time: newWindow.start_time,
          end_time: newWindow.end_time,
        })
      }
      loadWindows(serviceId)
    } catch (err) {
      setError(err.message)
      loadWindows(serviceId)
    }
  }

  const saveWindow = async (serviceId) => {
    setError('')
    try {
      await apiPut(`/api/services/${serviceId}/availability/${editingWin.id}`, {
        day_of_week: Number(editingWin.day_of_week),
        start_time: editingWin.start_time,
        end_time: editingWin.end_time,
      })
      setEditingWin(null)
      loadWindows(serviceId)
    } catch (err) {
      setError(err.message)
    }
  }

  // Remove every custom window so this service simply follows its
  // branch's opening hours.
  const useShopHours = async (serviceId) => {
    if (!window.confirm('Remove all custom times for this service and follow the shop opening hours instead?')) return
    setError('')
    try {
      for (const w of windows[serviceId] || []) {
        await apiDelete(`/api/services/${serviceId}/availability/${w.id}`)
      }
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

      <ServiceProviderEditor />

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
        <div>
          <CategoryPicker kind="service" value={form.category_id} onChange={(category_id) => setForm({ ...form, category_id })} />
        </div>
        <div className="col-span-2 md:col-span-6">
          <RichTextEditor value={form.description} onChange={(description) => setForm({ ...form, description })} placeholder="Description" rows={5} />
        </div>
        <div className="col-span-2 md:col-span-6">
          <AiDescriptionButton name={form.name} category={form.category_id} onGenerated={(description) => setForm({ ...form, description })} />
        </div>
        <TranslationFields
          values={form}
          onChange={(patch) => setForm({ ...form, ...patch })}
          spanClassName="md:col-span-6"
          fields={[
            { key: 'name', label: 'Name' },
            { key: 'description', label: 'Description', richText: true },
          ]}
        />

        <div className="col-span-2 md:col-span-6">
          <DiscountFields value={form} onChange={(d) => setForm({ ...form, ...d })} price={form.price_lkr} />
        </div>
        <p className="col-span-2 text-xs text-[#6a6656] md:col-span-6">
          Which branches offer this service is set under <strong>Branches → Services offered</strong>.
        </p>

        <div className="col-span-2 md:col-span-6">
          <BadgesInput value={form.badges} onChange={(badges) => setForm({ ...form, badges })} />
        </div>

        <div className="col-span-2 md:col-span-6">
          <MultiImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />
        </div>
        <FocalPointPicker
          imageUrl={form.images[0]}
          x={form.image_focal_x}
          y={form.image_focal_y}
          onChange={(image_focal_x, image_focal_y) => setForm({ ...form, image_focal_x, image_focal_y })}
        />
        <HoverMediaFields values={form} onChange={(patch) => setForm({ ...form, ...patch })} />
        <p className="col-span-2 text-xs text-[#6a6656] md:col-span-6">
          On hover, the shop tries the video first, then the animated WebP, then falls back to this service's main photo.
          The detail-page video (optional) shows in the gallery on the service page.
        </p>

        <div className="col-span-2 flex items-center gap-3 md:col-span-6">
          <button type="submit" className="rounded-full bg-forestDeep px-4 py-2 text-xs uppercase tracking-wide text-cream">
            Add Service
          </button>
          <button type="button" onClick={cancelCreate} className="text-xs underline text-[#6a6656]">Cancel</button>
        </div>
      </form>

      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id} className="rounded-sm border border-gold/30 bg-ivory p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {s.images?.[0] && (
                  <img src={s.images[0]} alt="" className="h-12 w-12 rounded-sm border border-gold/30 object-cover" />
                )}
                <div>
                  <p className="font-serif text-lg text-forestDeep">{s.name}</p>
                  <p className="text-xs text-[#6a6656]">
                    {s.service_type} {s.duration_minutes ? `· ${s.duration_minutes} min` : ''} ·{' '}
                    {formatLKR(s.price_lkr)} ·{' '}
                    <span className={s.is_active ? 'text-moss' : 'text-[#a35a3a]'}>{s.is_active ? 'Active' : 'Inactive'}</span>
                    {s.service_type === 'bookable' && (s.branches?.length ? <> · {s.branches.map((b) => b.name).join(', ')}</> : <span className="text-[#a35a3a]"> · no branch yet</span>)}
                    {s.category && <> · {s.category}</>}
                  </p>
                  {s.badges?.length > 0 && (
                    <p className="mt-0.5 flex flex-wrap gap-1">
                      {s.badges.map((b) => (
                        <span key={b} className="rounded-full bg-gold/25 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wide text-forestDeep">
                          {b}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <button onClick={() => (editingId === s.id ? cancelEdit() : startEdit(s))} className="underline text-forestDeep">
                  {editingId === s.id ? 'Cancel' : 'Edit'}
                </button>
                {s.service_type === 'bookable' && (
                  <button onClick={() => toggleExpand(s)} className="underline text-forestDeep">
                    {expanded === s.id ? 'Hide availability' : 'Manage availability'}
                  </button>
                )}
                <button onClick={() => toggleActive(s)} className="underline text-[#a35a3a]">
                  {s.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
                {!s.is_active && (
                  <button onClick={() => permanentDelete(s)} className="font-semibold underline text-[#a35a3a]">
                    Delete permanently
                  </button>
                )}
              </div>
            </div>

            {editingId === s.id && (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gold/20 pt-4 md:grid-cols-6">
                <input placeholder="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm md:col-span-2" />
                <input type="number" step="0.01" placeholder="Price (LKR)" value={editForm.price_lkr} onChange={(e) => setEditForm({ ...editForm, price_lkr: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
                {editForm.service_type === 'bookable' && (
                  <input type="number" placeholder="Duration (min)" value={editForm.duration_minutes} onChange={(e) => setEditForm({ ...editForm, duration_minutes: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
                )}
                <div>
                  <CategoryPicker kind="service" value={editForm.category_id} onChange={(category_id) => setEditForm({ ...editForm, category_id })} />
                </div>
                <div className="col-span-2 md:col-span-6">
                  <RichTextEditor value={editForm.description} onChange={(description) => setEditForm({ ...editForm, description })} placeholder="Description" rows={5} />
                </div>
                <div className="col-span-2 md:col-span-6">
                  <AiDescriptionButton
                    name={editForm.name}
                    category={editForm.category_id}
                    onGenerated={(description) => setEditForm({ ...editForm, description })}
                  />
                </div>
                <TranslationFields
                  values={editForm}
                  onChange={(patch) => setEditForm({ ...editForm, ...patch })}
                  spanClassName="md:col-span-6"
                  fields={[
                    { key: 'name', label: 'Name' },
                    { key: 'description', label: 'Description', richText: true },
                  ]}
                />

                <div className="col-span-2 md:col-span-6">
                  <DiscountFields value={editForm} onChange={(d) => setEditForm({ ...editForm, ...d })} price={editForm.price_lkr} />
                </div>
                <p className="col-span-2 text-xs text-[#6a6656] md:col-span-6">
                  Which branches offer this service is set under <strong>Branches → Services offered</strong>.
                </p>

                <div className="col-span-2 md:col-span-6">
                  <BadgesInput value={editForm.badges} onChange={(badges) => setEditForm({ ...editForm, badges })} />
                </div>

                <div className="col-span-2 md:col-span-6">
                  <MultiImageUploader images={editForm.images} onChange={(images) => setEditForm({ ...editForm, images })} />
                </div>
                <FocalPointPicker
                  imageUrl={editForm.images[0]}
                  x={editForm.image_focal_x}
                  y={editForm.image_focal_y}
                  onChange={(image_focal_x, image_focal_y) => setEditForm({ ...editForm, image_focal_x, image_focal_y })}
                />
                <HoverMediaFields values={editForm} onChange={(patch) => setEditForm({ ...editForm, ...patch })} />

                <button onClick={() => saveEdit(s.id)} className="col-span-2 rounded-full bg-forestDeep px-4 py-2 text-xs uppercase tracking-wide text-cream md:col-span-2">
                  Save changes
                </button>
              </div>
            )}

            {expanded === s.id && (
              <div className="mt-4 border-t border-gold/20 pt-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss">Booking times</p>
                {(() => {
                  const offered = s.branches || []
                  const custom = windows[s.id] || []
                  if (offered.length === 0) {
                    return <p className="mb-3 text-xs text-[#8a6d3b]">Not offered at any branch yet — tick it under Branches → Services offered, otherwise customers cannot book it online.</p>
                  }
                  const hoursOf = (b) => branches.find((x) => x.id === b.id)?.opening_hours
                  const withHours = offered.filter(hoursOf)
                  if (withHours.length === 0) {
                    return <p className="mb-3 text-xs text-[#8a6d3b]">{offered.map((b) => b.name).join(', ')} {offered.length > 1 ? 'have' : 'has'} no opening hours yet — set them under Branches → Opening hours to open up Sundays and other days in one go.</p>
                  }
                  const names = withHours.map((b) => b.name).join(', ')
                  return (
                    <p className="mb-3 max-w-2xl text-xs text-[#6a6656]">
                      {custom.length === 0
                        ? `No custom times — customers can book any time during each branch's opening hours (${names}).`
                        : `Custom times below are used, but never outside a branch's opening hours (${names}). A day with no custom time here (e.g. Sunday) is not bookable.`}
                      {custom.length > 0 && (
                        <button onClick={() => useShopHours(s.id)} className="ml-2 underline text-forestDeep">Use shop hours instead</button>
                      )}
                    </p>
                  )
                })()}
                <ul className="mb-3 space-y-1.5 text-sm">
                  {(windows[s.id] || []).map((w) => (
                    <li key={w.id} className="flex flex-wrap items-center gap-3">
                      {editingWin?.id === w.id ? (
                        <>
                          <select value={editingWin.day_of_week} onChange={(e) => setEditingWin({ ...editingWin, day_of_week: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-2 py-1">
                            {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                          </select>
                          <input type="time" value={editingWin.start_time} onChange={(e) => setEditingWin({ ...editingWin, start_time: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-2 py-1" />
                          <span>to</span>
                          <input type="time" value={editingWin.end_time} onChange={(e) => setEditingWin({ ...editingWin, end_time: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-2 py-1" />
                          <button onClick={() => saveWindow(s.id)} className="rounded-full bg-forestDeep px-3 py-1 text-xs text-cream">Save</button>
                          <button onClick={() => setEditingWin(null)} className="text-xs underline text-moss">Cancel</button>
                        </>
                      ) : (
                        <>
                          <span className="w-10">{DAYS[w.day_of_week]}</span>
                          <span>{w.start_time.slice(0, 5)}–{w.end_time.slice(0, 5)}</span>
                          <button
                            onClick={() => setEditingWin({ id: w.id, day_of_week: w.day_of_week, start_time: w.start_time.slice(0, 5), end_time: w.end_time.slice(0, 5) })}
                            className="text-xs underline text-forestDeep"
                          >
                            edit
                          </button>
                          <button onClick={() => removeWindow(s.id, w.id)} className="text-xs text-[#a35a3a] underline">remove</button>
                        </>
                      )}
                    </li>
                  ))}
                  {(windows[s.id] || []).length === 0 && (
                    <li className="text-[#6a6656]">
                      No custom times set{(s.branches || []).some((b) => branches.find((x) => x.id === b.id)?.opening_hours) ? ' — following the shop opening hours.' : ' — this service has no bookable slots yet.'}
                    </li>
                  )}
                </ul>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <select value={newWindow.day_of_week} onChange={(e) => setNewWindow({ ...newWindow, day_of_week: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-2 py-1">
                    <option value="all">Every day</option>
                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                  </select>
                  <input type="time" value={newWindow.start_time} onChange={(e) => setNewWindow({ ...newWindow, start_time: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-2 py-1" />
                  <span>to</span>
                  <input type="time" value={newWindow.end_time} onChange={(e) => setNewWindow({ ...newWindow, end_time: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-2 py-1" />
                  <button onClick={() => addWindow(s.id)} className="rounded-full bg-forestDeep px-3 py-1.5 text-xs text-cream">Add times</button>
                </div>

                <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-moss">
                  Blackout dates (days off)
                </p>
                <ul className="mb-3 space-y-1 text-sm">
                  {(blackouts[s.id] || []).map((b) => (
                    <li key={b.id} className="flex items-center gap-3">
                      <span className="w-28">{formatCalendarDate(b.blackout_date)}</span>
                      <span className="flex-1 text-[#6a6656]">{b.reason || '—'}</span>
                      <button onClick={() => removeBlackout(s.id, b.id)} className="text-xs text-[#a35a3a] underline">remove</button>
                    </li>
                  ))}
                  {(blackouts[s.id] || []).length === 0 && (
                    <li className="text-[#6a6656]">No days off scheduled — every window above stays bookable.</li>
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
        {services.length === 0 && <p className="text-sm text-[#6a6656]">No services yet.</p>}
      </div>
    </div>
  )
}
