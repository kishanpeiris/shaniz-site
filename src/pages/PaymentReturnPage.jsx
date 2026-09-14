import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { apiGet } from '../api/client.js'
import { useLanguage } from '../context/LanguageContext.jsx'

// Where the customer's browser lands after a real gateway's hosted
// checkout — which, for a Sri Lankan card payment, includes their
// bank's own OTP/3-D Secure step inside that flow. We never build any
// OTP UI ourselves; this page's only job is what happens *after*
// they're handed back to us.
//
// Deliberately does NOT trust query params the gateway may attach to
// this return URL (their exact shape differs per provider and isn't in
// the placeholder docs in lib/gateways.js yet) — it re-checks the
// order's real status instead, which only ever changes via the
// server-to-server webhook (the reliable source of truth). Because the
// webhook can arrive a moment before or after the browser redirect
// does, this polls briefly rather than checking once and giving up.
const POLL_INTERVAL_MS = 2000
const MAX_POLLS = 10 // ~20 seconds total before giving up and asking the customer to wait

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order') || ''
  const guestEmail = searchParams.get('email') || ''
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [status, setStatus] = useState('checking') // checking | timeout | not_found
  const pollCount = useRef(0)

  useEffect(() => {
    if (!orderId) {
      setStatus('not_found')
      return
    }
    let cancelled = false
    const qs = guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : ''

    const check = async () => {
      try {
        const res = await apiGet(`/api/orders/${orderId}${qs}`)
        if (cancelled) return
        if (['paid', 'shipped', 'completed'].includes(res.order.status)) {
          navigate(`/thank-you/${orderId}${qs}`, { replace: true })
          return
        }
        if (res.order.status === 'cancelled') {
          setStatus('failed')
          return
        }
        // Still 'pending' — the webhook may just not have landed yet.
        pollCount.current += 1
        if (pollCount.current >= MAX_POLLS) {
          setStatus('timeout')
        } else {
          setTimeout(check, POLL_INTERVAL_MS)
        }
      } catch {
        if (!cancelled) setStatus('not_found')
      }
    }

    check()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  return (
    <>
      <Nav />
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        {status === 'checking' && (
          <>
            <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <h1 className="mb-2 text-2xl">{t('payment_return_checking_title')}</h1>
            <p className="text-sm text-[#6a6656]">{t('payment_return_checking_subtitle')}</p>
          </>
        )}

        {status === 'timeout' && (
          <>
            <h1 className="mb-2 text-2xl">{t('payment_return_timeout_title')}</h1>
            <p className="mb-6 text-sm text-[#6a6656]">{t('payment_return_timeout_subtitle')}</p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => {
                  pollCount.current = 0
                  setStatus('checking')
                }}
                className="rounded-full bg-forestDeep px-6 py-3 text-xs uppercase tracking-wide text-cream"
              >
                {t('payment_return_check_again')}
              </button>
              <Link to="/account" className="rounded-full border border-gold/40 px-6 py-3 text-xs uppercase tracking-wide text-forestDeep">
                {t('view_my_orders')}
              </Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <h1 className="mb-2 text-2xl">{t('payment_return_failed_title')}</h1>
            <p className="mb-6 text-sm text-[#6a6656]">{t('payment_return_failed_subtitle')}</p>
            <Link to="/checkout" className="rounded-full bg-forestDeep px-6 py-3 text-xs uppercase tracking-wide text-cream">
              {t('payment_return_try_again')}
            </Link>
          </>
        )}

        {status === 'not_found' && (
          <>
            <h1 className="mb-2 text-2xl">{t('payment_return_not_found_title')}</h1>
            <Link to="/shop" className="rounded-full bg-forestDeep px-6 py-3 text-xs uppercase tracking-wide text-cream">
              {t('continue_shopping')}
            </Link>
          </>
        )}
      </div>
      <Footer />
    </>
  )
}
