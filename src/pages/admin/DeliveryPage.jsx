import React, { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/client.js'
import { formatLKR as fmt } from '../../lib/currency.js'

const EMPTY_FORM = { label: '', fee_lkr: '', example: '' }

export default function DeliveryPage() {
  const [regions, setRegions] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)

  const load = () =>
    apiGet('/api/admin/delivery-regions')
      .then((r) => setRegions(r.regions))
      .catch((e) => setError(e.message))

  useEffect(() => {
    load()
  }, [])

  const addRegion = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiPost('/api/admin/delivery-regions', {
        label: form.label,
        fee_lkr: Number(form.fee_lkr),
        example: form.example || undefined,
      })
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const startEdit = (region) => {
    setEditingId(region.id)
    setEditForm({ label: region.label, fee_lkr: String(region.fee_lkr), example: region.example || '' })
  }

  const saveEdit = async (id) => {
    setError('')
    try {
      await apiPut(`/api/admin/delivery-regions/${id}`, {
        label: editForm.label,
        fee_lkr: Number(editForm.fee_lkr),
        example: editForm.example || undefined,
      })
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleActive = async (region) => {
    setError('')
    try {
      await apiPut(`/api/admin/delivery-regions/${region.id}`, { is_active: !region.is_active })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this delivery region? Any past orders will keep showing their original rate, but this option disappears from checkout immediately.')) return
    setError('')
    try {
      await apiDelete(`/api/admin/delivery-regions/${id}`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="mb-2 text-3xl">Delivery</h2>
      <p className="mb-6 max-w-2xl text-sm text-[#6a6656]">
        These are the Home Delivery zones and fees customers see at checkout. Add a new zone, change a
        fee, or remove one — changes apply immediately, no code changes or redeploy needed.
      </p>

      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      {!regions ? (
        <p className="text-sm text-[#6a6656]">Loading…</p>
      ) : (
        <div className="mb-8 overflow-hidden rounded-sm border border-gold/30 bg-ivory">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gold/30 bg-cream text-xs uppercase tracking-wide text-moss">
              <tr>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Example areas</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {regions.map((r) => (
                <tr key={r.id} className="border-b border-gold/15 last:border-0 align-top">
                  {editingId === r.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          value={editForm.label}
                          onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                          className="w-full rounded-sm border border-gold/30 bg-cream px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={editForm.example}
                          onChange={(e) => setEditForm({ ...editForm, example: e.target.value })}
                          placeholder="e.g. Kandy, Galle, Jaffna"
                          className="w-full rounded-sm border border-gold/30 bg-cream px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={editForm.fee_lkr}
                          onChange={(e) => setEditForm({ ...editForm, fee_lkr: e.target.value })}
                          className="w-24 rounded-sm border border-gold/30 bg-cream px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-moss">{r.is_active ? 'Active' : 'Hidden'}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button onClick={() => saveEdit(r.id)} className="mr-3 text-xs text-moss underline">
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-[#6a6656] underline">
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-forestDeep">{r.label}</td>
                      <td className="px-4 py-3 text-[#6a6656]">{r.example || '—'}</td>
                      <td className="px-4 py-3">{fmt(r.fee_lkr)}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={r.is_active ? 'text-moss' : 'text-[#8a6d3b]'}>
                          {r.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button onClick={() => startEdit(r)} className="mr-3 text-xs text-forestDeep underline">
                          Edit
                        </button>
                        <button onClick={() => toggleActive(r)} className="mr-3 text-xs text-forestDeep underline">
                          {r.is_active ? 'Hide' : 'Unhide'}
                        </button>
                        <button onClick={() => remove(r.id)} className="text-xs text-[#a35a3a] underline">
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="max-w-lg rounded-sm border border-gold/30 bg-ivory p-5">
        <h3 className="mb-3 text-lg text-forestDeep">Add a new delivery zone</h3>
        <form onSubmit={addRegion} className="grid grid-cols-2 gap-3">
          <input
            required
            placeholder="Zone name (e.g. Central Province)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="col-span-2 rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
          />
          <input
            placeholder="Example towns (optional)"
            value={form.example}
            onChange={(e) => setForm({ ...form, example: e.target.value })}
            className="col-span-2 rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
          />
          <input
            required
            type="number"
            min="0"
            placeholder="Fee in LKR"
            value={form.fee_lkr}
            onChange={(e) => setForm({ ...form, fee_lkr: e.target.value })}
            className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
          />
          <button className="rounded-full bg-forestDeep px-4 py-2 text-xs uppercase tracking-wide text-cream">
            Add zone
          </button>
        </form>
      </div>
    </div>
  )
}
