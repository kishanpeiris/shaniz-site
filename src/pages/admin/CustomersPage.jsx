import React, { useEffect, useState } from 'react'
import { apiGet, apiPut } from '../../api/client.js'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [error, setError] = useState('')

  const load = () => apiGet('/api/admin/customers').then((r) => setCustomers(r.customers)).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const toggleDisabled = async (c) => {
    setError('')
    try {
      await apiPut(`/api/admin/customers/${c.id}/disabled`, { disabled: !c.disabled })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-3xl">Customers</h2>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <div className="overflow-x-auto rounded-sm border border-gold/30 bg-ivory">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/30 text-xs uppercase tracking-wide text-moss">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-gold/15">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={c.disabled ? 'text-[#a35a3a]' : 'text-moss'}>{c.disabled ? 'Disabled' : 'Active'}</span>
                </td>
                <td className="p-3">
                  <button onClick={() => toggleDisabled(c)} className="text-xs underline text-forestDeep">
                    {c.disabled ? 'Re-enable' : 'Disable'}
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-[#8a8672]">No customer accounts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
