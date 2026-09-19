import React, { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { apiGet, apiPost, API_URL } from '../api/client.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { formatLKR as fmt } from '../lib/currency.js'
import { formatCalendarDate } from '../lib/date.js'

const GATEWAY_LABELS = { koko: 'Koko', intpay: 'IntPay', payhere: 'Credit / Debit Card', dialog_genie: 'Credit / Debit Card (legacy)' }

// Cancellation/return request UI — a separate component mainly so its
// own local form state (reason text, submitting, which type is being
// requested) doesn't clutter the page component above it. Talks
// directly to the two endpoints in orders.routes.js
// (cancel-request/return-request); order.can_cancel/can_return and
// order.refund_request are computed server-side (see GET /:id there)
// rather than re-derived here, so the eligibility rule only ever lives
// in one place.
function RefundRequestSection({ order, guestEmail, onSubmitted }) {
  const { t } = useLanguage()
  const [openType, setOpenType] = useState(null) // null | 'cancellation' | 'return'
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const existing = order.refund_request

  if (existing && existing.status === 'pending') {
    return (
      <div className="mb-6 rounded-sm border border-gold/30 bg-cream p-4 text-sm text-[#5c5949]">
        {existing.type === 'cancellation' ? t('refund_cancellation_pending') : t('refund_return_pending')}
      </div>
    )
  }
  if (existing && existing.status === 'approved') {
    return (
      <div className="mb-6 rounded-sm border border-moss/30 bg-cream p-4 text-sm text-moss">
        {existing.type === 'cancellation' ? t('refund_cancellation_approved') : t('refund_return_approved')}
        {existing.admin_note && <p className="mt-1 text-[#5c5949]">{existing.admin_note}</p>}
      </div>
    )
  }
  if (existing && existing.status === 'rejected') {
    return (
      <div className="mb-6 rounded-sm border border-[#a35a3a]/30 bg-cream p-4 text-sm text-[#a35a3a]">
        {t('refund_request_rejected')}
        {existing.admin_note && <p className="mt-1 text-[#5c5949]">{existing.admin_note}</p>}
      </div>
    )
  }

  if (!order.can_cancel && !order.can_return) return null

  const submit = async (type) => {
    if (!reason.trim()) return setError(t('refund_reason_required'))
    setBusy(true)
    setError('')
    try {
      const qs = guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : ''
      const res = await apiPost(`/api/orders/${order.id}/${type === 'cancellation' ? 'cancel-request' : 'return-request'}${qs}`, { reason })
      onSubmitted(res.refund_request)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (openType) {
    return (
      <div className="mb-6 rounded-sm border border-gold/30 bg-ivory p-4">
        <p className="mb-2 text-sm font-semibold text-forestDeep">
          {openType === 'cancellation' ? t('refund_cancel_form_title') : t('refund_return_form_title')}
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('refund_reason_placeholder')}
          rows={3}
          className="mb-2 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
        />
        {error && <p className="mb-2 text-sm text-[#a35a3a]">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={() => submit(openType)}
            disabled={busy}
            className="rounded-full bg-forestDeep px-5 py-2.5 text-xs uppercase tracking-wide text-cream disabled:opacity-50"
          >
            {busy ? t('refund_submitting') : t('refund_submit')}
          </button>
          <button
            onClick={() => { setOpenType(null); setReason(''); setError('') }}
            className="rounded-full border border-gold/40 px-5 py-2.5 text-xs uppercase tracking-wide text-forestDeep"
          >
            {t('refund_cancel_form')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {order.can_cancel && (
        <button
          onClick={() => { setOpenType('cancellation'); setReason(''); setError('') }}
          className="rounded-full border border-[#a35a3a]/50 px-5 py-3 text-xs uppercase tracking-wide text-[#a35a3a] hover:bg-[#a35a3a] hover:text-cream"
        >
          {t('refund_request_cancellation')}
        </button>
      )}
      {order.can_return && (
        <button
          onClick={() => { setOpenType('return'); setReason(''); setError('') }}
          className="rounded-full border border-gold/40 px-5 py-3 text-xs uppercase tracking-wide text-forestDeep hover:bg-forestDeep hover:text-cream"
        >
          {t('refund_request_return')}
        </button>
      )}
    </div>
  )
}

// A single order's full detail — items, delivery/billing address, and
// the invoice download all in one place. Reached from the account
// page's order history list, and from the Thank You page's "View
// Order" button right after checkout, rather than dropping the
// customer on the general account page and making them hunt for the
// order they just placed.
//
// Supports guests the same way ThankYouPage and the invoice endpoint
// already do (an ?email= match against the order's guest_email) — a
// guest who just checked out can still open this from their Thank You
// page without needing an account.
export default function OrderDetailPage() {
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const guestEmail = searchParams.get('email') || ''
  const { t } = useLanguage()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const qs = guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : ''
    apiGet(`/api/orders/${orderId}${qs}`)
      .then((r) => setOrder(r.order))
      .catch((e) => setError(e.message))
  }, [orderId, guestEmail])

  if (error) {
    return (
      <>
        <Nav />
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="mb-3 text-3xl">{t('payment_return_not_found_title')}</h1>
          <p className="mb-6 text-sm text-[#6a6656]">{error}</p>
          <Link to="/account" className="rounded-full bg-forestDeep px-6 py-3 text-xs uppercase tracking-wide text-cream">
            {t('view_my_orders')}
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Nav />
        <div className="py-24 text-center text-sm text-[#6a6656]">{t('thankyou_loading_order')}</div>
        <Footer />
      </>
    )
  }

  const address = order.shipping_address

  return (
    <>
      <Nav />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link to="/account" className="mb-6 inline-block text-xs uppercase tracking-wide text-moss underline">
          ← {t('view_my_orders')}
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl">{t('order_label')} {order.id.slice(0, 8)}</h1>
          <span className="rounded-full bg-forestDeep px-3 py-1 text-xs uppercase tracking-wide text-cream">
            {order.status}
          </span>
        </div>
        <p className="mb-8 text-sm text-[#6a6656]">
          {formatCalendarDate(order.created_at)} · {GATEWAY_LABELS[order.gateway_used] || order.gateway_used}
        </p>

        <div className="mb-6 rounded-sm border border-gold/30 bg-ivory p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forestDeep">{t('od_items')}</h2>
          <ul className="mb-4 space-y-2 text-sm text-[#5c5949]">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between">
                <span>
                  {i.name} × {i.qty}
                  {i.is_preorder && (
                    <span className="block text-xs text-[#8a6d3b]">
                      {t('thankyou_preorder_arrival', { date: formatCalendarDate(i.preorder_eta_date) })}
                    </span>
                  )}
                </span>
                <span>{fmt(i.unit_price_lkr * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-gold/20 pt-2 text-sm text-[#5c5949]">
            <span>{t('delivery_label')}</span>
            <span>{Number(order.delivery_fee_lkr) ? fmt(order.delivery_fee_lkr) : t('free_pickup')}</span>
          </div>
          <div className="flex justify-between pt-1 font-serif text-lg font-semibold text-forestDeep">
            <span>{t('total_label')}</span>
            <span>{fmt(order.total_lkr)}</span>
          </div>
        </div>

        {order.delivery_method === 'pickup' && order.pickup_branch && (
          <div className="mb-6 rounded-sm border border-gold/30 bg-ivory p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forestDeep">{t('od_collect_from')}</h2>
            <p className="text-sm text-[#5c5949]">
              {order.pickup_branch.name}
              <br />
              {order.pickup_branch.address}
              {order.pickup_branch.phone && (
                <>
                  <br />
                  {order.pickup_branch.phone}
                </>
              )}
            </p>
            <a
              href={
                order.pickup_branch.latitude != null && order.pickup_branch.longitude != null
                  ? `https://www.google.com/maps/search/?api=1&query=${order.pickup_branch.latitude},${order.pickup_branch.longitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.pickup_branch.address)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-forestDeep underline"
            >
              {t('od_directions')}
            </a>
          </div>
        )}

        {address && (
          <div className="mb-6 rounded-sm border border-gold/30 bg-ivory p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forestDeep">
              {order.delivery_method === 'pickup' ? 'Pickup' : 'Delivery address'}
            </h2>
            <p className="text-sm text-[#5c5949]">
              {address.first_name} {address.last_name}
              <br />
              {address.line1}
              <br />
              {address.city} {address.postal_code}
              <br />
              {address.phone}
            </p>
          </div>
        )}

        {order.status !== 'pending' && (
          <a
            href={`${API_URL}/api/orders/${order.id}/invoice${guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 inline-block rounded-full border border-forestDeep px-6 py-3 text-xs font-semibold uppercase tracking-wide text-forestDeep hover:bg-forestDeep hover:text-cream"
          >
            {t('download_invoice')}
          </a>
        )}

        <RefundRequestSection
          order={order}
          guestEmail={guestEmail}
          onSubmitted={(refund_request) => setOrder((o) => ({ ...o, refund_request, can_cancel: false, can_return: false }))}
        />
      </div>
      <Footer />
    </>
  )
}
