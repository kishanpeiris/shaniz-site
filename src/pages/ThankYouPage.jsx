import React, { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import AyubowanGraphic from '../components/AyubowanGraphic.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { formatLKR as fmt } from '../lib/currency.js'
import { formatCalendarDate } from '../lib/date.js'
import { apiGet, API_URL } from '../api/client.js'
import ritualScene from '../assets/textures/thankyou-candles.jpg'
import ProviderBadge from '../components/ProviderBadge.jsx'
import { useServiceProvider } from '../hooks/useServiceProvider.js'
import { providerBranchLabel } from '../lib/serviceProvider.js'


export default function ThankYouPage() {
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const guestEmail = searchParams.get('email') || ''
  const { user } = useAuth()
  const { t } = useLanguage()
  const { provider } = useServiceProvider()
  const [order, setOrder] = useState(null)
  // Distinct from "still loading" (order === null before this ever
  // resolves) — without this, a failed lookup (bad id, wrong guest
  // email) left the page stuck on "Loading your order details…"
  // forever, since the catch handler set order to the exact same null
  // value the initial state already had.
  const [error, setError] = useState('')

  useEffect(() => {
    const qs = guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : ''
    apiGet(`/api/orders/${orderId}${qs}`)
      .then((r) => setOrder(r.order))
      .catch((e) => setError(e.message || 'We could not find this order.'))
  }, [orderId, guestEmail])

  return (
    <>
      <Nav />

      {/* Background photo runs behind the whole page (not just the
          greeting band) per the brief. A single dark scrim is layered
          over the full height so text stays legible everywhere — the
          photo's busy, colourful edges (candles, flowers) would
          otherwise fight with the copy lower on the page. */}
      <div className="relative overflow-hidden bg-forestDeep bg-cover bg-center" style={{ backgroundImage: `url(${ritualScene})` }}>
        <div className="absolute inset-0 bg-forestDeep/88" />

        <section className="relative py-20">
          <div className="mx-auto max-w-2xl px-6 text-center text-cream">
            <AyubowanGraphic className="mx-auto mb-6 h-28 w-28" />
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-goldLight">
              ආයුබෝවන් · Ayubowan
            </p>
            <h1 className="mb-4 text-4xl text-cream">{t('thankyou_title')}</h1>
            <p className="text-cream/80">{t('thankyou_subtitle')}</p>
          </div>
        </section>

        <div className="relative mx-auto max-w-lg px-6 py-14 text-center">
          {order ? (
            <div className="mb-10 rounded-sm border border-gold/30 bg-ivory p-6 text-left">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-[#6a6656]">{t('order_label')} {order.id.slice(0, 8)}</span>
                <span className="rounded-full bg-forestDeep px-3 py-1 text-xs uppercase tracking-wide text-cream">
                  {order.status}
                </span>
              </div>
              <ul className="mb-3 space-y-1 text-sm text-[#5c5949]">
                {order.items.map((i, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>
                      {i.name} × {i.qty}
                      {i.booking && (
                        <span className="block text-xs text-[#5c5949]">
                          📅 {formatCalendarDate(i.booking.date)} · {i.booking.time} · 📍 {providerBranchLabel(provider, i.booking.branch_name)}
                        </span>
                      )}
                      {i.type === 'service' && !i.booking && <ProviderBadge variant="text" className="mt-0.5" />}
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
              {order.items.some((i) => i.type === 'product') && (
                <div className="flex justify-between border-t border-gold/20 pt-2 text-sm text-[#5c5949]">
                  <span>{t('delivery_label')}</span>
                  <span>{Number(order.delivery_fee_lkr) ? fmt(order.delivery_fee_lkr) : t('free_pickup')}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 font-serif text-lg font-semibold text-forestDeep">
                <span>{t('total_label')}</span>
                <span>{fmt(order.total_lkr)}</span>
              </div>
              <p className="mt-3 text-xs text-[#6a6656]">
                {t('thankyou_receipt_sent', { email: order.customer_email })}
              </p>
              {order.status !== 'pending' && (
                <a
                  href={`${API_URL}/api/orders/${order.id}/invoice${guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-[44px] items-center rounded-full border border-forestDeep px-4 text-xs font-semibold uppercase tracking-wide text-forestDeep hover:bg-forestDeep hover:text-cream"
                >
                  {t('download_invoice')}
                </a>
              )}
            </div>
          ) : error ? (
            <div className="mb-10 rounded-sm border border-gold/30 bg-ivory p-6 text-sm text-[#a35a3a]">
              {error}
            </div>
          ) : (
            <p className="mb-10 text-sm text-cream/70">{t('thankyou_loading_order')}</p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/shop" className="rounded-full bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-wide text-forestDeep">
              {t('continue_shopping')}
            </Link>
            {order ? (
              <Link
                to={`/orders/${order.id}${!user && guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : ''}`}
                className="rounded-full border border-cream/50 px-6 py-3 text-xs uppercase tracking-wide text-cream"
              >
                {t('view_my_orders')}
              </Link>
            ) : !user ? (
              <Link to="/register" className="rounded-full border border-cream/50 px-6 py-3 text-xs uppercase tracking-wide text-cream">
                {t('create_an_account')}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
