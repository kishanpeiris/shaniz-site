import React, { useEffect, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '../../api/client.js'
import { useAuth } from '../../context/AuthContext.jsx'
import AccountEditor from './AccountEditor.jsx'

const emptyForm = { name: '', email: '', password: '', role: 'admin' }

export default function AdminsPage() {
  const [admins, setAdmins] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const { user } = useAuth()
  const [editingId, setEditingId] = useState(null)

  const load = () => apiGet('/api/admin/admins').then((r) => setAdmins(r.admins)).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiPost('/api/admin/admins', form)
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (admin) => {
    if (admin.is_primary_superadmin) return
    if (!confirm(`Remove admin access for ${admin.name}?`)) return
    setError('')
    try {
      await apiDelete(`/api/admin/admins/${admin.id}`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-3xl">Admins</h2>
      <p className="mb-4 max-w-lg text-sm text-[#6a6656]">
        Superadmin-only. The primary super admin account (seeded at deploy) can never be removed
        here — that's enforced by the database itself, not just this screen.
      </p>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <form onSubmit={handleCreate} className="mb-8 grid grid-cols-2 gap-3 rounded-sm border border-gold/30 bg-ivory p-5 md:grid-cols-5">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        <input required type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm">
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>
        <button type="submit" className="rounded-full bg-forestDeep px-4 py-2 text-xs uppercase tracking-wide text-cream">Create Admin</button>
      </form>

      <div className="overflow-x-auto rounded-sm border border-gold/30 bg-ivory">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/30 text-xs uppercase tracking-wide text-moss">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <React.Fragment key={a.id}>
              <tr className="border-b border-gold/15">
                <td className="p-3">{a.name} {a.is_primary_superadmin && <span className="ml-1 text-xs text-gold">(primary)</span>}</td>
                <td className="p-3">{a.email}</td>
                <td className="p-3 capitalize">{a.role}</td>
                <td className="p-3">
                  <button
                    onClick={() => setEditingId(editingId === a.id ? null : a.id)}
                    className="mr-4 text-xs underline text-forestDeep"
                  >
                    {editingId === a.id ? 'Close' : 'Edit / password'}
                  </button>
                  {!a.is_primary_superadmin && (
                    <button onClick={() => remove(a)} className="text-xs underline text-[#a35a3a]">Remove</button>
                  )}
                </td>
              </tr>
              {editingId === a.id && (
                <tr className="border-b border-gold/15">
                  <td colSpan={4} className="p-3">
                    <AccountEditor
                      account={a}
                      kind="admin"
                      canSetPassword
                      canSendReset
                      isSelf={a.id === user?.id}
                      onSaved={load}
                      onClose={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
