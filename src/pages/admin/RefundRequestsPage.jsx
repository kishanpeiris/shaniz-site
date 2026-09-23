import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPut } from '../../api/client.js'
import { formatLKR } from '../../lib/currency.js'

const TYPE_LABEL = { cancellation: 'Cancellation', return: 'Return / Refund' }

function ResolveForm({ request, onResolved }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const resolve = async (action) => {
    setBusy(true)
    setError('')
    try {
      const res = await apiPut(`/api/admin/refund-requests/${request.id}`, { action, admin_note: note || undefined })
      onResolved(res.refund_request)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 border-t border-gold/20 pt-3">
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note to customer (optional, shown in their email)"
        className="mb-2 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
      />
      {error && <p className="mb-2 text-sm text-[#a35a3a]">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => resolve('approve')}
          disabled={busy}
          className="rounded-full bg-forestDeep px-4 py-2 text-xs uppercase tracking-wide text-cream disabled:opacity-50"
        >
          {request.order_status === 'pending' ? 'Approve (cancel order)' : 'Approve (refund)'}
        </button>
        <button
          onClick={() => resolve('reject')}
          disabled={busy}
          className="rounded-full border border-gold/40 px-4 py-2 text-xs uppercase tracking-wide text-forestDeep disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  )
}

export default function RefundRequestsPage() {
  const [requests, setRequests] = useState([])
  const [showResolved, setShowResolved] = useState(false)
  const [error, setError] = useState('')

  const load = () =>
    apiGet(`/api/admin/refund-requests${showResolved ? '?status=all' : ''}`)
      .then((r) => setRequests(r.refund_requests))
      .catch((e) => setError(e.message))

  useEffect(() => { load() }, [showResolved])

  const handleResolved = () => {
    // Re-fetches rather than patching the row in place — `updated` (the
    // PUT response) is just the refund_requests row itself, without the
    // joined order fields (total_lkr, order_status, customer name) this
    // list also shows. Patching in place left order_status showing its
    // pre-approval value (e.g. still "paid" right after a refund) until
    // the next full reload — a real, if cosmetic, staleness bug.
    load()
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl">Refund Requests</h2>
        <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-moss">
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
          Show resolved
        </label>
      </div>
      <p className="mb-6 text-sm text-[#6a6656]">
        Customer-submitted cancellation and return requests. Approving a request on an order that hasn't been paid
        yet just cancels it; approving one on a paid order attempts a refund through that order's payment gateway
        (or completes instantly in sandbox mode if no live gateway is configured yet).
      </p>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="rounded-sm border border-gold/30 bg-ivory p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-forestDeep">
                  {TYPE_LABEL[r.type]}
                </span>
                <p className="mt-1 break-words text-sm text-[#5c5949]">{r.reason}</p>
                <p className="mt-1 break-words text-xs text-[#6a6656]">
                  Order {r.order_id.slice(0, 8)} · {r.customer_first_name} {r.customer_last_name} (
                  {r.requested_by_email}) · {formatLKR(r.total_lkr)} · order status: {r.order_status} ·{' '}
                  {new Date(r.created_at).toLocaleString()}
                </p>
                {r.status !== 'pending' && (
                  <p className={`mt-1 text-xs font-semibold uppercase tracking-wide ${r.status === 'approved' ? 'text-moss' : 'text-[#a35a3a]'}`}>
                    {r.status}
                    {r.admin_note && <span className="ml-1 font-normal normal-case text-[#6a6656]">— {r.admin_note}</span>}
                  </p>
                )}
              </div>
              <Link to={`/admin/orders?highlight=${r.order_id}`} className="shrink-0 text-xs underline text-forestDeep">
                View order
              </Link>
            </div>
            {r.status === 'pending' && <ResolveForm request={r} onResolved={handleResolved} />}
          </div>
        ))}
        {requests.length === 0 && (
          <p className="text-sm text-[#6a6656]">
            {showResolved ? 'No refund requests at all.' : 'No pending requests — nothing needs a look right now.'}
          </p>
        )}
      </div>
    </div>
  )
}
