import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiGet, apiPut, API_URL } from '../../api/client.js'
import { formatLKR } from '../../lib/currency.js'

const STATUSES = ['pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded']
const GATEWAY_LABELS = { koko: 'Koko', intpay: 'IntPay', dialog_genie: 'Credit / Debit Card' }

export default function OrdersPage() {
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  // Which order's detail row is expanded — the list endpoint already
  // returns every column (items, shipping_address, etc. — it's a plain
  // `SELECT *`), so expanding a row is free: no second fetch needed,
  // just revealing data that was already sitting in `orders`.
  // Pre-expanded when arriving via a "View order" link (e.g. from the
  // Refund Requests queue) with ?highlight=<id> — otherwise that link
  // just dumped the admin on the full list with no way to spot the
  // right row without scanning/searching manually.
  const [expandedId, setExpandedId] = useState(highlightId)

  const load = () => {
    const qs = statusFilter ? `?status=${statusFilter}` : ''
    apiGet(`/api/orders${qs}`).then((r) => setOrders(r.orders)).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [statusFilter])

  useEffect(() => {
    if (!highlightId || orders.length === 0) return
    document.getElementById(`order-row-${highlightId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Only ever needs to happen once, right after the highlighted
    // order's row actually exists in the DOM — not on every re-render
    // or every time `orders` refreshes after a status change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.length > 0])

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
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-3xl">Orders</h2>
        <div className="flex items-center gap-3">
          <a
            href={`${API_URL}/api/admin/export/orders.csv`}
            className="rounded-full border border-forestDeep/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-forestDeep hover:bg-forestDeep hover:text-cream"
          >
            Export CSV
          </a>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-sm border border-gold/30 bg-ivory px-3 py-2 text-sm">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <div className="overflow-x-auto rounded-sm border border-gold/30 bg-ivory">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/30 text-xs uppercase tracking-wide text-moss">
            <tr>
              <th className="p-3"></th>
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
            {orders.map((o) => {
              const isOpen = expandedId === o.id
              return (
                <React.Fragment key={o.id}>
                  <tr id={`order-row-${o.id}`} className={`border-b border-gold/15 align-top ${o.id === highlightId ? 'bg-gold/10' : ''}`}>
                    <td className="p-3">
                      <button
                        onClick={() => setExpandedId(isOpen ? null : o.id)}
                        aria-label={isOpen ? 'Collapse order details' : 'Expand order details'}
                        aria-expanded={isOpen}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 text-forestDeep hover:bg-gold/10"
                      >
                        {isOpen ? '−' : '+'}
                      </button>
                    </td>
                    <td className="p-3 font-mono text-xs">
                      <button onClick={() => setExpandedId(isOpen ? null : o.id)} className="underline decoration-dotted">
                        {o.id.slice(0, 8)}
                      </button>
                    </td>
                    <td className="p-3">{o.guest_email || o.customer_email || o.user_id}</td>
                    <td className="p-3">{formatLKR(o.total_lkr)}</td>
                    <td className="p-3">{GATEWAY_LABELS[o.gateway_used] || o.gateway_used}</td>
                    <td className="p-3">
                      <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="rounded-sm border border-gold/30 bg-cream px-2 py-1 text-xs capitalize">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="p-3 text-xs">
                      {o.status === 'pending' ? (
                        <span className="text-[#6a6656]">—</span>
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
                  {isOpen && (
                    <tr className="border-b border-gold/15 bg-cream/60">
                      <td></td>
                      <td colSpan={7} className="p-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-moss">Items</p>
                            <ul className="space-y-1 text-sm text-[#5c5949]">
                              {(o.items || []).map((i, idx) => (
                                <li key={idx} className="flex justify-between gap-4">
                                  <span>{i.name} × {i.qty}</span>
                                  <span>{formatLKR(i.unit_price_lkr * i.qty)}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-2 flex justify-between border-t border-gold/20 pt-1 text-sm text-[#5c5949]">
                              <span>Delivery</span>
                              <span>{Number(o.delivery_fee_lkr) ? formatLKR(o.delivery_fee_lkr) : 'Free / Pickup'}</span>
                            </div>
                            {o.gateway_txn_id && (
                              <p className="mt-2 text-xs text-[#8a8672]">Gateway transaction: {o.gateway_txn_id}</p>
                            )}
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-moss">
                              {o.delivery_method === 'pickup' ? 'Pickup' : 'Delivery address'}
                            </p>
                            {o.shipping_address ? (
                              <p className="text-sm text-[#5c5949]">
                                {o.shipping_address.first_name} {o.shipping_address.last_name}
                                <br />
                                {o.shipping_address.line1}
                                <br />
                                {o.shipping_address.city} {o.shipping_address.postal_code}
                                <br />
                                {o.shipping_address.phone}
                              </p>
                            ) : (
                              <p className="text-sm text-[#8a8672]">No address on file (pickup order).</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
            {orders.length === 0 && (
              <tr><td colSpan={8} className="p-4 text-center text-[#6a6656]">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
