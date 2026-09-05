import React, { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/client.js'
import MultiImageUploader from '../../components/admin/MultiImageUploader.jsx'
import ImageUploader from '../../components/admin/ImageUploader.jsx'
import { formatLKR } from '../../lib/currency.js'

const emptyForm = {
  name: '',
  description: '',
  price_lkr: '',
  stock_qty: '',
  category: '',
  images: [],
  hover_gif_url: '',
  availability_mode: 'in_stock',
  preorder_eta_days: '',
}

// Small pill shown in the table so admins can see at a glance what a
// customer will see on the product page, without opening the row.
function AvailabilityBadge({ product }) {
  const styles = {
    in_stock: 'bg-moss/15 text-moss',
    preorder: 'bg-gold/20 text-[#8a6d1f]',
    out_of_stock: 'bg-[#a35a3a]/15 text-[#a35a3a]',
  }
  const labels = {
    in_stock: 'In stock',
    preorder: `Pre-order${product.preorder_eta_days ? ` · ~${product.preorder_eta_days}d` : ''}`,
    out_of_stock: 'Sold out',
  }
  const key = product.availability || (product.stock_qty > 0 ? 'in_stock' : product.availability_mode)
  return (
    <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${styles[key]}`}>
      {labels[key]}
    </span>
  )
}

// Shared fields for "what happens when stock hits 0" — used in both the
// create form and the inline edit row so they stay identical.
function AvailabilityFields({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div>
        <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-moss">When sold out</p>
        <select
          value={value.availability_mode}
          onChange={(e) => onChange({ ...value, availability_mode: e.target.value })}
          className="rounded-sm border border-gold/30 bg-cream px-2 py-1.5 text-xs"
        >
          <option value="out_of_stock">Show "Sold Out"</option>
          <option value="preorder">Allow pre-order</option>
        </select>
      </div>
      {value.availability_mode === 'preorder' && (
        <div>
          <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-moss">
            Production time (days)
          </p>
          <input
            type="number"
            min="1"
            placeholder="e.g. 14"
            value={value.preorder_eta_days}
            onChange={(e) => onChange({ ...value, preorder_eta_days: e.target.value })}
            className="w-28 rounded-sm border border-gold/30 bg-cream px-2 py-1.5 text-xs"
          />
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [stockDeltas, setStockDeltas] = useState({})

  const load = () => apiGet('/api/products').then((r) => setProducts(r.products)).catch((e) => setError(e.message))

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiPost('/api/products', {
        name: form.name,
        description: form.description || undefined,
        price_lkr: Number(form.price_lkr),
        stock_qty: Number(form.stock_qty || 0),
        category: form.category || undefined,
        images: form.images,
        hover_gif_url: form.hover_gif_url || undefined,
        availability_mode: form.availability_mode,
        preorder_eta_days:
          form.availability_mode === 'preorder' && form.preorder_eta_days
            ? Number(form.preorder_eta_days)
            : null,
      })
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setEditForm({
      name: p.name,
      description: p.description || '',
      price_lkr: p.price_lkr,
      category: p.category || '',
      images: p.images || [],
      hover_gif_url: p.hover_gif_url || '',
      availability_mode: p.availability_mode || 'out_of_stock',
      preorder_eta_days: p.preorder_eta_days || '',
    })
  }

  const saveEdit = async (id) => {
    setError('')
    try {
      await apiPut(`/api/products/${id}`, {
        name: editForm.name,
        description: editForm.description,
        price_lkr: Number(editForm.price_lkr),
        category: editForm.category,
        images: editForm.images,
        hover_gif_url: editForm.hover_gif_url || undefined,
        availability_mode: editForm.availability_mode,
        preorder_eta_days:
          editForm.availability_mode === 'preorder' && editForm.preorder_eta_days
            ? Number(editForm.preorder_eta_days)
            : null,
      })
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleActive = async (p) => {
    setError('')
    try {
      if (p.is_active) {
        await apiDelete(`/api/products/${p.id}`)
      } else {
        await apiPut(`/api/products/${p.id}`, { is_active: true })
      }
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const applyStockDelta = async (id) => {
    const delta = Number(stockDeltas[id])
    if (!delta) return
    setError('')
    try {
      await apiPost(`/api/products/${id}/stock`, { delta })
      setStockDeltas((s) => ({ ...s, [id]: '' }))
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-3xl">Products</h2>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <form onSubmit={handleCreate} className="mb-8 grid grid-cols-2 gap-3 rounded-sm border border-gold/30 bg-ivory p-5 md:grid-cols-5">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm md:col-span-2" />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        <input required type="number" step="0.01" placeholder="Price (LKR)" value={form.price_lkr} onChange={(e) => setForm({ ...form, price_lkr: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        <input type="number" placeholder="Stock qty" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="col-span-2 rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm md:col-span-4" />
        <div className="col-span-2 md:col-span-5 border-t border-gold/20 pt-3">
          <AvailabilityFields value={form} onChange={setForm} />
          <p className="mt-1.5 text-[0.65rem] text-[#8a8672]">
            Only matters once stock qty reaches 0 — while stock is available, the product always shows as in stock.
          </p>
        </div>
        <div className="col-span-2 flex flex-wrap gap-6 border-t border-gold/20 pt-3 md:col-span-5">
          <MultiImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />
          <ImageUploader label="Hover-loop GIF" value={form.hover_gif_url} onChange={(url) => setForm({ ...form, hover_gif_url: url })} accept="image/gif" />
        </div>
        <button type="submit" className="rounded-full bg-forestDeep px-4 py-2 text-xs uppercase tracking-wide text-cream">Add Product</button>
      </form>

      <div className="overflow-x-auto rounded-sm border border-gold/30 bg-ivory">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/30 text-xs uppercase tracking-wide text-moss">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Availability</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gold/15 align-top">
                {editingId === p.id ? (
                  <>
                    <td className="p-3">
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-sm border border-gold/30 bg-cream px-2 py-1" />
                      <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" className="mt-1 w-full rounded-sm border border-gold/30 bg-cream px-2 py-1 text-xs" />
                      <div className="mt-2 flex flex-wrap gap-4">
                        <MultiImageUploader images={editForm.images} onChange={(images) => setEditForm({ ...editForm, images })} />
                        <ImageUploader label="Hover GIF" value={editForm.hover_gif_url} onChange={(url) => setEditForm({ ...editForm, hover_gif_url: url })} accept="image/gif" />
                      </div>
                    </td>
                    <td className="p-3">
                      <input type="number" step="0.01" value={editForm.price_lkr} onChange={(e) => setEditForm({ ...editForm, price_lkr: e.target.value })} className="w-24 rounded-sm border border-gold/30 bg-cream px-2 py-1" />
                    </td>
                    <td className="p-3">{p.stock_qty}</td>
                    <td className="p-3">
                      <AvailabilityFields value={editForm} onChange={setEditForm} />
                    </td>
                    <td className="p-3">{p.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="p-3">
                      <button onClick={() => saveEdit(p.id)} className="mr-2 text-xs underline text-forestDeep">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-xs underline text-[#8a8672]">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt="" className="h-10 w-10 rounded-sm border border-gold/30 object-cover" />
                        )}
                        <div>
                          <p className="font-medium text-forestDeep">{p.name}</p>
                          <p className="text-xs text-[#8a8672]">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{formatLKR(p.price_lkr)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className={p.out_of_stock ? 'text-[#a35a3a]' : ''}>{p.stock_qty}</span>
                        <input
                          type="number"
                          placeholder="±"
                          value={stockDeltas[p.id] || ''}
                          onChange={(e) => setStockDeltas((s) => ({ ...s, [p.id]: e.target.value }))}
                          className="w-14 rounded-sm border border-gold/30 bg-cream px-1.5 py-0.5 text-xs"
                        />
                        <button onClick={() => applyStockDelta(p.id)} className="text-xs underline text-forestDeep">Apply</button>
                      </div>
                    </td>
                    <td className="p-3">
                      <AvailabilityBadge product={p} />
                    </td>
                    <td className="p-3">
                      <span className={p.is_active ? 'text-moss' : 'text-[#a35a3a]'}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button onClick={() => startEdit(p)} className="mr-2 text-xs underline text-forestDeep">Edit</button>
                      <button onClick={() => toggleActive(p)} className="text-xs underline text-[#a35a3a]">
                        {p.is_active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-[#8a8672]">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
