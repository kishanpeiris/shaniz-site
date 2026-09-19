import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiGet, apiPut, apiPost } from '../../api/client.js'
import { formatLKR } from '../../lib/currency.js'
import { formatCalendarDate } from '../../lib/date.js'
import { useAuth } from '../../context/AuthContext.jsx'
import AccountEditor from './AccountEditor.jsx'

function Card({ title, children }) {
  return (
    <section className="mb-6 rounded-sm border border-gold/30 bg-ivory p-5">
      <h3 className="mb-3 text-lg text-forestDeep">{title}</h3>
      {children}
    </section>
  )
}

export default function CustomerDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [resendStatus, setResendStatus] = useState('')
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)

  const load = () =>
    apiGet(`/api/admin/customers/${id}`)
      .then(setData)
      .catch((e) => setError(e.message))

  useEffect(() => {
    load()
  }, [id])

  const toggleDisabled = async () => {
    if (!data) return
    setError('')
    try {
      await apiPut(`/api/admin/customers/${id}/disabled`, { disabled: !data.customer.disabled })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const resendVerification = async () => {
    setResendStatus('')
    setError('')
    try {
      const res = await apiPost(`/api/admin/customers/${id}/resend-verification`)
      setResendStatus(res.message)
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <p className="text-sm text-[#a35a3a]">{error}</p>
  if (!data) return <p className="text-sm text-[#6a6656]">Loading…</p>

  const { customer, addresses, orders, bookings } = data

  return (
    <div>
      <Link to="/admin/customers" className="mb-4 inline-block text-xs underline text-forestDeep">
        ← Back to customers
      </Link>
      <h2 className="mb-6 text-3xl">{customer.name}</h2>

      <div className="mb-6">
        {editing ? (
          <AccountEditor
            account={customer}
            kind="customer"
            canSetPassword={user?.role === 'superadmin'}
            onSaved={load}
            onClose={() => setEditing(false)}
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded-full border border-forestDeep/30 px-4 py-1.5 text-xs uppercase tracking-wide text-forestDeep hover:bg-forestDeep hover:text-cream"
          >
            Edit account{user?.role === 'superadmin' ? ' / set password' : ''}
          </button>
        )}
      </div>

      <Card title="Profile">
        <dl className="grid grid-cols-2 gap-y-2 text-sm md:grid-cols-4">
          <dt className="text-xs uppercase tracking-wide text-moss">Email</dt>
          <dd>{customer.email}</dd>
          <dt className="text-xs uppercase tracking-wide text-moss">Mobile</dt>
          <dd>{customer.mobile || '—'}</dd>
          <dt className="text-xs uppercase tracking-wide text-moss">Verified</dt>
          <dd className={customer.email_verified ? 'text-moss' : 'text-[#8a6d3b]'}>
            {customer.email_verified ? 'Verified' : 'Unverified'}
          </dd>
          <dt className="text-xs uppercase tracking-wide text-moss">Joined</dt>
          <dd>{new Date(customer.created_at).toLocaleDateString()}</dd>
        </dl>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={toggleDisabled}
            className="rounded-full border border-gold/40 px-4 py-1.5 text-xs uppercase tracking-wide text-forestDeep"
          >
            {customer.disabled ? 'Re-enable account' : 'Disable account'}
          </button>
          {!customer.email_verified && (
            <button
              onClick={resendVerification}
              className="rounded-full border border-gold/40 px-4 py-1.5 text-xs uppercase tracking-wide text-forestDeep"
            >
              Resend activation email
            </button>
          )}
        </div>
        {resendStatus && <p className="mt-2 text-xs text-moss">{resendStatus}</p>}
      </Card>

      <Card title="Saved addresses">
        {addresses.length === 0 ? (
          <p className="text-sm text-[#6a6656]">No saved addresses.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {addresses.map((a) => (
              <li key={a.id} className="rounded-sm border border-gold/20 bg-cream px-3 py-2">
                {a.line1}, {a.city} {a.postal_code} {a.phone ? `· ${a.phone}` : ''}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Recent orders">
        {orders.length === 0 ? (
          <p className="text-sm text-[#6a6656]">No orders yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between rounded-sm border border-gold/20 bg-cream px-3 py-2">
                <span>
                  Order {o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString()}
                </span>
                <span className="capitalize text-moss">{o.status}</span>
                <span>{formatLKR(o.total_lkr)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Recent bookings">
        {bookings.length === 0 ? (
          <p className="text-sm text-[#6a6656]">No bookings yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {bookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-sm border border-gold/20 bg-cream px-3 py-2">
                <span>
                  {b.service_name} — {formatCalendarDate(b.booked_date)} at {String(b.booked_time).slice(0, 5)}
                </span>
                <span className="capitalize text-moss">{b.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
