import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHeroBand from '../components/PageHeroBand.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { apiGet, apiPost } from '../api/client.js'
import { CardBrandRow } from '../components/PaymentBadges.jsx'
import ritualScene from '../assets/textures/spice-spoons.jpg'
import herbsCitrus from '../assets/textures/herbs-citrus.jpg'
import { formatLKR as fmt } from '../lib/currency.js'
import AddressFields from '../components/AddressFields.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translateLabel } from '../i18n/translations.js'


const GATEWAYS = [
  // Customer-facing label is deliberately the generic "Credit / Debit
  // Card" rather than the underlying partner's brand name — the id
  // ('payhere') stays the same everywhere else (order records, the
  // admin "payment gateway split" dashboard chart, gateway_used in the
  // database) since that's a real, meaningful distinction for the
  // business; customers just don't need to know or care which specific
  // processor is behind a card payment.
  { id: 'payhere', label: 'Credit / Debit Card', hint: 'Visa, Mastercard & more', card: true },
  { id: 'koko', label: 'Koko', hint: 'Buy now, pay later' },
  { id: 'intpay', label: 'IntPay', hint: 'Bank & wallet transfer' },
]

// PayHere's real checkout isn't a redirect — it needs the browser to
// POST a signed set of fields straight to PayHere's own checkout page
// (see lib/gateways.js on the backend for why). This builds exactly
// that: an invisible form, filled in, submitted, then cleaned up. The
// user never sees this — the whole thing happens in the instant between
// clicking "Place Order" and leaving the page.
function submitPayHereForm(url, fields) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = url
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value ?? ''
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
}


export default function CheckoutPage() {
  const { language, t } = useLanguage()
  const L = (text) => translateLabel(text, language)
  const { items, subtotal, clearCart, addresses } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '')
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '')
  const [phone, setPhone] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  const [deliveryMethod, setDeliveryMethod] = useState('delivery')
  const [regions, setRegions] = useState([])
  const [deliveryRegion, setDeliveryRegion] = useState('')
  const [branches, setBranches] = useState([])
  const [pickupBranchId, setPickupBranchId] = useState('')

  const [shippingMode, setShippingMode] = useState('new') // 'new' | saved address id
  const [shippingAddr, setShippingAddr] = useState({ line1: '', city: '', postal_code: '' })

  const [billingSame, setBillingSame] = useState(true)
  const [billingMode, setBillingMode] = useState('new')
  const [billingAddr, setBillingAddr] = useState({ line1: '', city: '', postal_code: '' })

  const [gateway, setGateway] = useState('payhere')
  const [saveCard, setSaveCard] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet('/api/site/delivery-options')
      .then((r) => {
        setRegions(r.regions)
        if (r.regions[0]) setDeliveryRegion(r.regions[0].id)
      })
      .catch(() => setRegions([]))
  }, [])

  useEffect(() => {
    apiGet('/api/branches')
      .then((r) => {
        setBranches(r.branches)
        // /api/branches already sorts the main branch first (see
        // branches.routes.js), so this pre-selects it — a guest ready
        // to pick up shouldn't have to know or care which branch is
        // "the" one before picking a different one is even possible.
        const main = r.branches.find((b) => b.is_main) || r.branches[0]
        if (main) setPickupBranchId(main.id)
      })
      .catch(() => setBranches([]))
  }, [])

  useEffect(() => {
    if (user && addresses.length > 0) {
      setShippingMode(addresses[0].id)
      setBillingMode(addresses[0].id)
    }
  }, [user, addresses])

  const selectedRegion = regions.find((r) => r.id === deliveryRegion)
  const deliveryFee = deliveryMethod === 'pickup' ? 0 : selectedRegion?.fee_lkr ?? 0
  const total = subtotal + deliveryFee

  if (items.length === 0) {
    return (
      <>
        <Nav />
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="mb-4 text-3xl">Your basket is empty</h1>
          <Link to="/shop" className="rounded-full bg-forestDeep px-6 py-3 text-xs uppercase tracking-wide text-cream">
            {t('browse_the_shop')}
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (deliveryMethod === 'pickup' && !pickupBranchId) {
      setError('Please choose a branch to collect your order from.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        items: items.map((i) => ({ type: i.type, id: i.id, qty: i.qty })),
        gateway,
        first_name: firstName,
        last_name: lastName,
        phone,
        delivery_method: deliveryMethod,
        billing_same_as_shipping: deliveryMethod === 'delivery' ? billingSame : false,
        save_card: saveCard,
      }
      if (!user) payload.guest_email = guestEmail

      if (deliveryMethod === 'delivery') {
        payload.delivery_region = deliveryRegion
        if (user && shippingMode !== 'new') {
          payload.shipping_address_id = shippingMode
        } else {
          payload.shipping_address = { first_name: firstName, last_name: lastName, phone, ...shippingAddr }
        }
      } else {
        payload.pickup_branch_id = pickupBranchId
      }

      if (deliveryMethod === 'pickup' || !billingSame) {
        if (user && billingMode !== 'new') {
          payload.billing_address_id = billingMode
        } else {
          payload.billing_address = { first_name: firstName, last_name: lastName, phone, ...billingAddr }
        }
      }

      const res = await apiPost('/api/orders', payload)
      clearCart()
      const emailParam = !user ? `?email=${encodeURIComponent(guestEmail)}` : ''
      if (res.gateway_live && res.checkout_method === 'POST') {
        // PayHere: a real form POST straight to their checkout page, not
        // a plain redirect (see submitPayHereForm above for why).
        submitPayHereForm(res.checkout_redirect_url, res.checkout_fields)
      } else if (res.gateway_live) {
        // A real gateway is configured — leave the site entirely for its
        // hosted checkout page, which is also where the customer's own
        // bank handles OTP/3-D Secure verification (never built by us;
        // it lives inside this page). They land back on our own
        // /payment/return afterward (see lib/gateways.js's return_url).
        window.location.href = res.checkout_redirect_url
      } else {
        // No live credentials yet — the sandbox flow simulates the same
        // "leave, then come back" shape entirely within the app so it's
        // testable without real gateway access.
        navigate(`/payment/${res.order.id}${emailParam}`)
      }
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <>
      <Nav />
      <PageHeroBand image={ritualScene} eyebrow={t('checkout')} title={t('checkout_title')} compact />
      <div className="relative overflow-hidden bg-forestDeep">
        {/* Same texture family as the Basket page and cart drawer,
            applied once across the whole page, same treatment as "See
            It Made" — strong photo opacity + dark tint. Every piece of
            text on this page sits inside its own ivory card, so there's
            nothing here that needs a text-color change to match. */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.5]"
          style={{ backgroundImage: `url(${herbsCitrus})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-forestDeep/45" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-6 py-12">
        {!user && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-gold/30 bg-ivory px-5 py-4 text-sm">
            <span className="text-[#5c5949]">{t('checkout_guest_note')}</span>
            <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="underline text-forestDeep">
              {t('checkout_have_account')} {t('common_sign_in')}
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-3">
          <div className="space-y-8 md:col-span-2">
            {/* Contact */}
            <section className="rounded-sm border border-gold/30 bg-ivory p-6">
              <h2 className="mb-4 text-xl">{t('checkout_contact_details')}</h2>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder={t('common_first_name')} value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm" />
                <input required placeholder={t('common_last_name')} value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm" />
                <input required type="tel" placeholder={t('common_mobile_number')} value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm" />
                {user ? (
                  <input disabled value={user.email} className="rounded-sm border border-gold/30 bg-cream/60 px-3 py-2.5 text-sm text-[#6a6656]" />
                ) : (
                  <input required type="email" placeholder={t('common_email')} value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm" />
                )}
              </div>
            </section>

            {/* Delivery */}
            <section className="rounded-sm border border-gold/30 bg-ivory p-6">
              <h2 className="mb-4 text-xl">{t('delivery_label')}</h2>
              <div className="mb-4 flex gap-3">
                {[
                  ['pickup', L('Pickup (Free)')],
                  ['delivery', L('Home Delivery')],
                ].map(([id, label]) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setDeliveryMethod(id)}
                    className={`flex-1 rounded-sm border px-4 py-3 text-sm ${
                      deliveryMethod === id
                        ? 'border-forestDeep bg-forestDeep text-cream'
                        : 'border-gold/30 text-forestDeep'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {deliveryMethod === 'delivery' ? (
                <>
                  <select
                    value={deliveryRegion}
                    onChange={(e) => setDeliveryRegion(e.target.value)}
                    className="mb-4 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm"
                  >
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label} — {fmt(r.fee_lkr)}
                      </option>
                    ))}
                  </select>
                  {selectedRegion && (
                    <p className="mb-4 -mt-2 text-xs text-[#6a6656]">e.g. {selectedRegion.example}</p>
                  )}

                  {user && addresses.length > 0 && (
                    <select
                      value={shippingMode}
                      onChange={(e) => setShippingMode(e.target.value)}
                      className="mb-3 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm"
                    >
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.line1}, {a.city}
                        </option>
                      ))}
                      <option value="new">+ Use a new address</option>
                    </select>
                  )}

                  {(shippingMode === 'new' || addresses.length === 0) && (
                    <AddressFields value={shippingAddr} onChange={setShippingAddr} prefix="delivery address" />
                  )}
                </>
              ) : (
                <div>
                  <p className="mb-3 text-sm text-[#5c5949]">{t('checkout_collect_from')}</p>
                  {branches.length === 0 ? (
                    <p className="text-sm text-[#6a6656]">
                      {t('checkout_no_branches')}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {branches.map((b) => (
                        <label
                          key={b.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-sm border p-3 text-sm ${
                            pickupBranchId === b.id ? 'border-forestDeep bg-cream' : 'border-gold/30'
                          }`}
                        >
                          <input
                            type="radio"
                            name="pickup_branch"
                            checked={pickupBranchId === b.id}
                            onChange={() => setPickupBranchId(b.id)}
                            className="mt-1 accent-forestDeep"
                          />
                          <span>
                            <span className="font-medium text-forestDeep">
                              {b.name}
                              {b.is_main && <span className="ml-2 text-xs uppercase tracking-wide text-moss">{t('checkout_main')}</span>}
                            </span>
                            <br />
                            <span className="text-[#6a6656]">{b.address}</span>
                            {b.phone && <span className="text-[#6a6656]"> · {b.phone}</span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Billing */}
            <section className="rounded-sm border border-gold/30 bg-ivory p-6">
              <h2 className="mb-4 text-xl">{t('checkout_billing_address')}</h2>
              {deliveryMethod === 'delivery' && (
                <label className="mb-4 flex items-center gap-2 text-sm text-[#5c5949]">
                  <input
                    type="checkbox"
                    checked={billingSame}
                    onChange={(e) => setBillingSame(e.target.checked)}
                    className="accent-forestDeep"
                  />
                  {t('checkout_same_as_delivery')}
                </label>
              )}
              {(deliveryMethod === 'pickup' || !billingSame) && (
                <>
                  {user && addresses.length > 0 && (
                    <select
                      value={billingMode}
                      onChange={(e) => setBillingMode(e.target.value)}
                      className="mb-3 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm"
                    >
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.line1}, {a.city}
                        </option>
                      ))}
                      <option value="new">+ Use a new address</option>
                    </select>
                  )}
                  {(billingMode === 'new' || addresses.length === 0) && (
                    <AddressFields value={billingAddr} onChange={setBillingAddr} prefix="billing address" />
                  )}
                </>
              )}
            </section>

            {/* Payment */}
            <section className="rounded-sm border border-gold/30 bg-ivory p-6">
              <h2 className="mb-4 text-xl">{t('checkout_payment_method')}</h2>
              <div className="space-y-2.5">
                {GATEWAYS.map((g) => (
                  <label
                    key={g.id}
                    className={`flex cursor-pointer items-center justify-between rounded-sm border px-4 py-3 text-sm ${
                      gateway === g.id ? 'border-forestDeep bg-cream' : 'border-gold/30'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="gateway"
                        checked={gateway === g.id}
                        onChange={() => setGateway(g.id)}
                        className="accent-forestDeep"
                      />
                      <span>
                        <span className="block font-medium text-forestDeep">{L(g.label)}</span>
                        <span className="block text-xs text-[#6a6656]">{L(g.hint)}</span>
                      </span>
                    </span>
                    {g.card && <CardBrandRow />}
                  </label>
                ))}
              </div>
              {gateway === 'payhere' && user && (
                <label className="mt-3 flex items-center gap-2 text-sm text-[#5c5949]">
                  <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} className="accent-forestDeep" />
                  {t('checkout_save_card')}
                </label>
              )}
            </section>
          </div>

          {/* Summary */}
          <div className="h-fit space-y-4">
            <div className="rounded-sm border border-gold/30 bg-ivory p-6">
              <h2 className="mb-5 text-xl">{t('checkout_order_summary')}</h2>
            <ul className="space-y-2.5 text-sm text-[#5c5949]">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4">
                  <span className="min-w-0 flex-1">{i.name} × {i.qty}</span>
                  <span className="shrink-0 whitespace-nowrap text-right">{fmt(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2.5 border-t border-gold/20 pt-4 text-sm">
              <div className="flex justify-between text-[#5c5949]">
                <span>{t('subtotal')}</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5c5949]">
                <span>{t('delivery_label')}</span>
                <span>{deliveryFee ? fmt(deliveryFee) : 'Free'}</span>
              </div>
              <div className="flex justify-between border-t border-gold/20 pt-3 text-base font-semibold text-forestDeep">
                <span>{t('total_label')}</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-[#a35a3a]">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-forestDeep py-3.5 text-sm uppercase tracking-wide text-cream disabled:opacity-60"
            >
              {submitting ? 'Placing order…' : 'Place Order'}
            </button>
            <p className="mt-3 text-center text-xs text-[#6a6656]">
              {t('checkout_prices_note')}
            </p>
            </div>
          </div>
        </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
