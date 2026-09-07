import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPut } from '../../api/client.js'
import { formatLKR } from '../../lib/currency.js'

const SEVERITY_STYLE = {
  high: 'text-[#a35a3a]',
  medium: 'text-[#8a6d3b]',
  low: 'text-moss',
}

export default function FraudPage() {
  const [flags, setFlags] = useState([])
  const [showResolved, setShowResolved] = useState(false)
  const [error, setError] = useState('')

  const load = () =>
    apiGet(`/api/admin/fraud-flags${showResolved ? '?status=all' : ''}`)
      .then((r) => setFlags(r.fraud_flags))
      .catch((e) => setError(e.message))

  useEffect(() => { load() }, [showResolved])

  const resolve = async (id) => {
    setError('')
    try {
      await apiPut(`/api/admin/fraud-flags/${id}/resolve`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-3xl">Fraud Alerts</h2>
        <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-moss">
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
          Show resolved
        </label>
      </div>
      <p className="mb-6 text-sm text-[#8a8672]">
        Rule-based checks that run automatically on every order (see the note on each flag). A flag means "worth a
        quick look," not confirmed fraud — most turn out to be perfectly normal orders.
      </p>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <div className="space-y-3">
        {flags.map((f) => (
          <div key={f.id} className="rounded-sm border border-gold/30 bg-ivory p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`text-xs font-semibold uppercase tracking-wide ${SEVERITY_STYLE[f.severity]}`}>
                  {f.severity}
                </span>
                <p className="mt-1">{f.message}</p>
                <p className="mt-1 text-xs text-[#8a8672]">
                  Order {f.order_id.slice(0, 8)} · {f.customer_first_name} {f.customer_last_name} ({f.customer_email}) ·{' '}
                  {formatLKR(f.total_lkr)} · {new Date(f.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-shrink-0 flex-col items-end gap-2">
                <Link to="/admin/orders" className="text-xs underline text-forestDeep">
                  View orders
                </Link>
                {!f.resolved && (
                  <button onClick={() => resolve(f.id)} className="text-xs underline text-forestDeep">
                    Mark resolved
                  </button>
                )}
                {f.resolved && <span className="text-xs text-moss">Resolved</span>}
              </div>
            </div>
          </div>
        ))}
        {flags.length === 0 && (
          <p className="text-sm text-[#8a8672]">
            {showResolved ? 'No fraud flags at all.' : 'No open fraud flags — nothing needs a look right now.'}
          </p>
        )}
      </div>
    </div>
  )
}
