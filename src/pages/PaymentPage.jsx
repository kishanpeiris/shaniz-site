import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHeroBand from '../components/PageHeroBand.jsx'
import { apiGet, apiPost } from '../api/client.js'
import { CardBrandRow, guessBrand } from '../components/PaymentBadges.jsx'
import ritualScene from '../assets/textures/spice-spoons.jpg'
import { formatLKR as fmt } from '../lib/currency.js'


const GATEWAY_LABELS = { koko: 'Koko', intpay: 'IntPay', dialog_genie: 'Dialog Genie' }

export default function PaymentPage() {
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const guestEmail = searchParams.get('email') || ''
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  // Card fields — captured here in the browser only. Per the security
  // spec (Section 0/7), the full card number and CVV are never sent to
  // our own server; only the last 4 digits + guessed brand + expiry go
  // to /sandbox-pay, mirroring what a real gateway's hosted-checkout
  // tokenization callback would give us.
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  useEffect(() => {
    const qs = guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : ''
    apiGet(`/api/orders/${orderId}${qs}`)
      .then((r) => setOrder(r.order))
      .catch((e) => setLoadError(e.message))
  }, [orderId, guestEmail])

  const finishPayment = async (outcome, cardDetails) => {
    setPaying(true)
    setPayError('')
    try {
      const qs = guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : ''
      await apiPost(`/api/orders/${orderId}/sandbox-pay${qs}`, {
        outcome,
        ...cardDetails,
      })
      if (outcome === 'success') {
        navigate(`/thank-you/${orderId}${qs}`)
      } else {
        setPayError('Payment was declined. You can try again below.')
        setPaying(false)
      }
    } catch (err) {
      setPayError(err.message)
      setPaying(false)
    }
  }

  const handleCardSubmit = (e) => {
    e.preventDefault()
    const digits = cardNumber.replace(/\D/g, '')
    const brand = guessBrand(digits)
    finishPayment('success', {
      card_last4: digits.slice(-4),
      card_brand: brand ?? undefined,
      card_expiry: cardExpiry,
    })
  }

  if (loadError) {
    return (
      <>
        <Nav />
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <h1 className="mb-3 text-3xl">We couldn&rsquo;t find that order</h1>
          <p className="mb-6 text-sm text-[#6a6656]">{loadError}</p>
          <Link to="/shop" className="rounded-full bg-forestDeep px-6 py-3 text-xs uppercase tracking-wide text-cream">
            Back to Shop
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
        <div className="py-24 text-center text-sm text-[#6a6656]">Loading your order…</div>
        <Footer />
      </>
    )
  }

  if (order.status !== 'pending') {
    return (
      <>
        <Nav />
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <h1 className="mb-3 text-3xl">This order is already {order.status}</h1>
          <Link to="/shop" className="rounded-full bg-forestDeep px-6 py-3 text-xs uppercase tracking-wide text-cream">
            Continue shopping
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Nav />
      <PageHeroBand
        image={ritualScene}
        eyebrow="Sandbox Payment"
        title={`Pay with ${GATEWAY_LABELS[order.gateway_used]}`}
        compact
      />
      <div className="mx-auto max-w-lg px-6 py-14">
        <p className="mb-8 text-center text-sm text-[#6a6656]">
          Order {order.id.slice(0, 8)} · Total <strong>{fmt(order.total_lkr)}</strong>
        </p>

        <div className="rounded-sm border border-gold/30 bg-ivory p-7">
          {order.gateway_used === 'dialog_genie' ? (
            <>
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm text-[#5c5949]">Card details</span>
                <CardBrandRow />
              </div>
              <form onSubmit={handleCardSubmit} className="space-y-3">
                <input
                  required
                  placeholder="Name on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm"
                />
                <input
                  required
                  inputMode="numeric"
                  placeholder="Card number"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm"
                  />
                  <input
                    required
                    inputMode="numeric"
                    placeholder="CVV"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm"
                  />
                </div>
                {payError && <p className="text-sm text-[#a35a3a]">{payError}</p>}
                <button
                  type="submit"
                  disabled={paying}
                  className="w-full rounded-full bg-forestDeep py-3.5 text-sm uppercase tracking-wide text-cream disabled:opacity-60"
                >
                  {paying ? 'Processing…' : `Pay ${fmt(order.total_lkr)}`}
                </button>
              </form>
              <p className="mt-4 text-center text-xs text-[#6a6656]">
                Sandbox mode — no real charge is made, and your card number is never sent to our
                servers. Once live gateway credentials are configured, this step redirects to
                Dialog Genie&rsquo;s own secure hosted payment page.
              </p>
            </>
          ) : (
            <>
              <p className="mb-6 text-center text-sm text-[#5c5949]">
                In production, you&rsquo;d be redirected to {GATEWAY_LABELS[order.gateway_used]}&rsquo;s
                own secure payment page to complete this. This sandbox screen simulates that step.
              </p>
              {payError && <p className="mb-3 text-center text-sm text-[#a35a3a]">{payError}</p>}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => finishPayment('success', {})}
                  disabled={paying}
                  className="w-full rounded-full bg-forestDeep py-3.5 text-sm uppercase tracking-wide text-cream disabled:opacity-60"
                >
                  {paying ? 'Processing…' : `Simulate Successful Payment — ${fmt(order.total_lkr)}`}
                </button>
                <button
                  onClick={() => finishPayment('failed', {})}
                  disabled={paying}
                  className="w-full rounded-full border border-gold/40 py-3 text-xs uppercase tracking-wide text-forestDeep"
                >
                  Simulate Failed Payment
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
