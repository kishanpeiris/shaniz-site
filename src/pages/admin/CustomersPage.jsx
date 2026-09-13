import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPut, API_URL } from '../../api/client.js'
import { formatLKR } from '../../lib/currency.js'

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
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-3xl">Customers</h2>
        <a
          href={`${API_URL}/api/admin/export/customers.csv`}
          className="rounded-full border border-forestDeep/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-forestDeep hover:bg-forestDeep hover:text-cream"
        >
          Export CSV
        </a>
      </div>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <div className="overflow-x-auto rounded-sm border border-gold/30 bg-ivory">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/30 text-xs uppercase tracking-wide text-moss">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Verified</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Spent</th>
              <th className="p-3">Bookings</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-gold/15">
                <td className="p-3">
                  <Link to={`/admin/customers/${c.id}`} className="underline decoration-gold/40 hover:text-forestDeep">
                    {c.name}
                  </Link>
                </td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">
                  {c.email_verified ? (
                    <span className="text-moss">Verified</span>
                  ) : (
                    <span className="text-[#8a6d3b]">Unverified</span>
                  )}
                </td>
                <td className="p-3">{c.order_count}</td>
                <td className="p-3">{formatLKR(c.total_spent_lkr)}</td>
                <td className="p-3">{c.booking_count}</td>
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
              <tr><td colSpan={9} className="p-4 text-center text-[#6a6656]">No customer accounts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
