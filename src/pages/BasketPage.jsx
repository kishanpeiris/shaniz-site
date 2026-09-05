import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHeroBand from '../components/PageHeroBand.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import ritualScene from '../assets/textures/spice-spoons.jpg'
import herbsCitrus from '../assets/textures/herbs-citrus.jpg'
import { formatLKR as fmt } from '../lib/currency.js'


export default function BasketPage() {
  const { items, subtotal, totalQty, changeQty, removeItem } = useCart()
  const { user } = useAuth()

  return (
    <>
      <Nav />
      <PageHeroBand image={ritualScene} eyebrow="Your Basket" title="Almost there." compact />
      <div className="relative overflow-hidden">
        {/* Unique texture for the basket → checkout family, distinct from
            the Home and Shop backgrounds — kept subtle so it never
            competes with product rows or the summary card. */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.14]"
          style={{ backgroundImage: `url(${herbsCitrus})` }}
          aria-hidden="true"
        />
        <div className="relative mx-auto min-h-[50vh] max-w-4xl px-6 py-12">
        <p className="mb-8 text-sm text-[#8a8672]">
          {totalQty === 0 ? 'Nothing here yet.' : `${totalQty} item${totalQty === 1 ? '' : 's'} ready for checkout.`}
        </p>

        {!user && items.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-gold/30 bg-ivory px-5 py-4 text-sm">
            <span className="text-[#5c5949]">
              <Link to="/login" state={{ from: { pathname: '/basket' } }} className="underline">
                Sign in
              </Link>{' '}
              to save this basket to your account, or continue as a guest at checkout.
            </span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-sm border border-gold/30 bg-ivory p-12 text-center">
            <p className="mb-5 text-[#8a8672]">Your basket is empty.</p>
            <Link
              to="/shop"
              className="inline-block rounded-full bg-forestDeep px-6 py-3 text-xs uppercase tracking-wide text-cream"
            >
              Browse the Shop
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <ul className="divide-y divide-gold/20 rounded-sm border border-gold/30 bg-ivory">
                {items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-serif text-xl text-forestDeep">{item.name}</p>
                      <p className="text-sm text-[#8a8672]">{fmt(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeQty(item.id, -1)}
                          className="h-8 w-8 rounded-full border border-gold/40 text-forestDeep"
                        >
                          −
                        </button>
                        <span className="w-6 text-center">{item.qty}</span>
                        <button
                          onClick={() => changeQty(item.id, 1)}
                          className="h-8 w-8 rounded-full border border-gold/40 text-forestDeep"
                        >
                          +
                        </button>
                      </div>
                      <span className="w-24 text-right font-serif text-lg text-forestDeep">
                        {fmt(item.price * item.qty)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-[#a35a3a] underline"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/shop" className="mt-4 inline-block text-sm text-forestDeep underline">
                ← Continue shopping
              </Link>
            </div>

            <div className="h-fit rounded-sm border border-gold/30 bg-ivory p-6">
              <div className="mb-2 flex items-center justify-between text-sm text-[#5c5949]">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <p className="mb-5 text-xs text-[#8a8672]">
                Delivery fees (or pickup) are calculated at checkout based on your location.
              </p>
              <Link
                to="/checkout"
                className="block w-full rounded-full bg-forestDeep py-3.5 text-center text-sm uppercase tracking-wide text-cream"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </>
  )
}
