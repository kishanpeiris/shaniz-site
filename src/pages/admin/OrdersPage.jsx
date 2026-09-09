import React, { useEffect, useState } from 'react'
import { apiGet, apiPut, API_URL } from '../../api/client.js'
import { formatLKR } from '../../lib/currency.js'

const STATUSES = ['pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded']

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = () => {
    const qs = statusFilter ? `?status=${statusFilter}` : ''
    apiGet(`/api/orders${qs}`).then((r) => setOrders(r.orders)).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [statusFilter])

  const updateStatus = async (id, status) => {
    setError('')
    try {
      await apiPut(`/api/orders/${id}/status`, { status })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl">Orders</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-sm border border-gold/30 bg-ivory px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <div className="overflow-x-auto rounded-sm border border-gold/30 bg-ivory">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/30 text-xs uppercase tracking-wide text-moss">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Gateway</th>
              <th className="p-3">Status</th>
              <th className="p-3">Placed</th>
              <th className="p-3">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gold/15 align-top">
                <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="p-3">{o.guest_email || o.user_id}</td>
                <td className="p-3">{formatLKR(o.total_lkr)}</td>
                <td className="p-3 capitalize">{o.gateway_used}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="rounded-sm border border-gold/30 bg-cream px-2 py-1 text-xs capitalize">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                <td className="p-3 text-xs">
                  {o.status === 'pending' ? (
                    <span className="text-[#8a8672]">—</span>
                  ) : (
                    <a
                      href={`${API_URL}/api/orders/${o.id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold uppercase tracking-wide text-gold underline"
                    >
                      Download
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-[#8a8672]">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
