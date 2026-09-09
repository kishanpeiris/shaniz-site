import React, { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/client.js'

const emptyForm = { name: '', address: '', latitude: '', longitude: '', phone: '' }

export default function BranchesPage() {
  const [branches, setBranches] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const load = () => apiGet('/api/branches').then((r) => setBranches(r.branches)).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const toPayload = (f) => ({
    name: f.name,
    address: f.address,
    latitude: f.latitude !== '' ? Number(f.latitude) : undefined,
    longitude: f.longitude !== '' ? Number(f.longitude) : undefined,
    phone: f.phone || undefined,
  })

  const create = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiPost('/api/branches', toPayload(form))
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const startEdit = (b) => {
    setEditingId(b.id)
    setEditForm({
      name: b.name,
      address: b.address,
      latitude: b.latitude ?? '',
      longitude: b.longitude ?? '',
      phone: b.phone || '',
    })
  }

  const saveEdit = async (id) => {
    setError('')
    try {
      await apiPut(`/api/branches/${id}`, toPayload(editForm))
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (id) => {
    await apiDelete(`/api/branches/${id}`)
    load()
  }

  return (
    <div>
      <h2 className="mb-2 text-3xl">Branches</h2>
      <p className="mb-6 text-sm text-[#8a8672]">
        Physical locations. Assign a branch to a bookable service (in Admin → Services) to show its address and a
        map link on the storefront. Latitude/longitude are optional — without them, the map link still works from
        the address text alone, just slightly less precisely.
      </p>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <form onSubmit={create} className="mb-8 grid grid-cols-2 gap-3 rounded-sm border border-gold/30 bg-ivory p-5 md:grid-cols-5">
        <input required placeholder="Name (e.g. Colombo Branch)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2 rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm md:col-span-2" />
        <input required placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="col-span-2 rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm md:col-span-3" />
        <input placeholder="Latitude (optional)" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        <input placeholder="Longitude (optional)" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        <button className="rounded-full bg-forestDeep px-4 py-2 text-xs uppercase tracking-wide text-cream">Add branch</button>
      </form>

      <div className="space-y-3">
        {branches.map((b) => (
          <div key={b.id} className="rounded-sm border border-gold/30 bg-ivory p-4">
            {editingId === b.id ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="col-span-2 rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm md:col-span-2" />
                <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="col-span-2 rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm md:col-span-3" />
                <input value={editForm.latitude} onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })} placeholder="Latitude" className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
                <input value={editForm.longitude} onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })} placeholder="Longitude" className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
                <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Phone" className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
                <div className="col-span-2 flex gap-3 md:col-span-5">
                  <button onClick={() => saveEdit(b.id)} className="rounded-full bg-forestDeep px-4 py-1.5 text-xs uppercase tracking-wide text-cream">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs underline text-moss">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-serif text-lg text-forestDeep">{b.name}</p>
                  <p className="text-sm text-[#6a6656]">{b.address}{b.phone ? ` · ${b.phone}` : ''}</p>
                  {(b.latitude == null || b.longitude == null) && (
                    <p className="mt-0.5 text-xs text-[#8a6d3b]">No coordinates set — map link will use the address text.</p>
                  )}
                </div>
                <div className="flex gap-3 text-xs">
                  <button onClick={() => startEdit(b)} className="underline text-forestDeep">Edit</button>
                  <button onClick={() => remove(b.id)} className="underline text-[#a35a3a]">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {branches.length === 0 && <p className="text-sm text-[#8a8672]">No branches yet — add one above.</p>}
      </div>
    </div>
  )
}
