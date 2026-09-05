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


const GATEWAYS = [
  { id: 'koko', label: 'Koko', hint: 'Buy now, pay later' },
  { id: 'intpay', label: 'IntPay', hint: 'Bank & wallet transfer' },
  { id: 'dialog_genie', label: 'Dialog Genie', hint: 'Credit / Debit Card', card: true },
]

function AddressFields({ value, onChange, prefix }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        required
        placeholder="Address line 1"
        value={value.line1}
        onChange={(e) => onChange({ ...value, line1: e.target.value })}
        className="col-span-2 rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm"
      />
      <input
        required
        placeholder="City / Town"
        value={value.city}
        onChange={(e) => onChange({ ...value, city: e.target.value })}
        className="rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm"
      />
      <input
        required
        placeholder="Postal code"
        value={value.postal_code}
        onChange={(e) => onChange({ ...value, postal_code: e.target.value })}
        className="rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm"
      />
      <p className="col-span-2 text-xs text-[#8a8672]">Sri Lanka only, at this time — {prefix}.</p>
    </div>
  )
}

export default function CheckoutPage() {
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

  const [shippingMode, setShippingMode] = useState('new') // 'new' | saved address id
  const [shippingAddr, setShippingAddr] = useState({ line1: '', city: '', postal_code: '' })

  const [billingSame, setBillingSame] = useState(true)
  const [billingMode, setBillingMode] = useState('new')
  const [billingAddr, setBillingAddr] = useState({ line1: '', city: '', postal_code: '' })

  const [gateway, setGateway] = useState('koko')
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
            Browse the Shop
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      navigate(`/payment/${res.order.id}${emailParam}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <>
      <Nav />
      <PageHeroBand image={ritualScene} eyebrow="Checkout" title="Complete your ritual." compact />
      <div className="relative overflow-hidden">
        {/* Same unique texture used on the Basket page and cart drawer,
            applied once across the whole page — not boxed into any one
            section — so the basket → checkout family reads as one
            consistent background rather than separate image tiles. */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.14]"
          style={{ backgroundImage: `url(${herbsCitrus})` }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-5xl px-6 py-12">
        {!user && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-gold/30 bg-ivory px-5 py-4 text-sm">
            <span className="text-[#5c5949]">Checking out as a guest.</span>
            <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="underline text-forestDeep">
              Already have an account? Sign in
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-3">
          <div className="space-y-8 md:col-span-2">
            {/* Contact */}
            <section className="rounded-sm border border-gold/30 bg-ivory p-6">
              <h2 className="mb-4 text-xl">Contact details</h2>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm" />
                <input required placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm" />
                <input required type="tel" placeholder="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm" />
                {user ? (
                  <input disabled value={user.email} className="rounded-sm border border-gold/30 bg-cream/60 px-3 py-2.5 text-sm text-[#8a8672]" />
                ) : (
                  <input required type="email" placeholder="Email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-sm" />
                )}
              </div>
            </section>

            {/* Delivery */}
            <section className="rounded-sm border border-gold/30 bg-ivory p-6">
              <h2 className="mb-4 text-xl">Delivery</h2>
              <div className="mb-4 flex gap-3">
                {[
                  ['pickup', 'Pickup (Free)'],
                  ['delivery', 'Home Delivery'],
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

              {deliveryMethod === 'delivery' && (
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
                    <p className="mb-4 -mt-2 text-xs text-[#8a8672]">e.g. {selectedRegion.example}</p>
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
              )}
            </section>

            {/* Billing */}
            <section className="rounded-sm border border-gold/30 bg-ivory p-6">
              <h2 className="mb-4 text-xl">Billing address</h2>
              {deliveryMethod === 'delivery' && (
                <label className="mb-4 flex items-center gap-2 text-sm text-[#5c5949]">
                  <input
                    type="checkbox"
                    checked={billingSame}
                    onChange={(e) => setBillingSame(e.target.checked)}
                    className="accent-forestDeep"
                  />
                  Same as delivery address
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
              <h2 className="mb-4 text-xl">Payment method</h2>
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
                        <span className="block font-medium text-forestDeep">{g.label}</span>
                        <span className="block text-xs text-[#8a8672]">{g.hint}</span>
                      </span>
                    </span>
                    {g.card && <CardBrandRow />}
                  </label>
                ))}
              </div>
              {gateway === 'dialog_genie' && user && (
                <label className="mt-3 flex items-center gap-2 text-sm text-[#5c5949]">
                  <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} className="accent-forestDeep" />
                  Save this card to my account for next time
                </label>
              )}
            </section>
          </div>

          {/* Summary */}
          <div className="h-fit space-y-4">
            <div className="rounded-sm border border-gold/30 bg-ivory p-6">
              <h2 className="text-xl">Order Summary</h2>
            <ul className="space-y-1.5 text-sm text-[#5c5949]">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span>{i.name} × {i.qty}</span>
                  <span>{fmt(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-1.5 border-t border-gold/20 pt-3 text-sm">
              <div className="flex justify-between text-[#5c5949]">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5c5949]">
                <span>Delivery</span>
                <span>{deliveryFee ? fmt(deliveryFee) : 'Free'}</span>
              </div>
              <div className="flex justify-between border-t border-gold/20 pt-2 text-base font-semibold text-forestDeep">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
            {error && <p className="text-sm text-[#a35a3a]">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-forestDeep py-3.5 text-sm uppercase tracking-wide text-cream disabled:opacity-60"
            >
              {submitting ? 'Placing order…' : 'Place Order'}
            </button>
            <p className="text-center text-xs text-[#8a8672]">
              All prices in LKR. You'll enter payment details on the next step.
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
