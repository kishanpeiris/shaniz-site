import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import herbsCitrus from '../assets/textures/herbs-citrus.jpg'
import { formatLKR as fmt } from '../lib/currency.js'

// Quick slide-in preview after "Add to Basket" — full basket management
// (quantities, removing items) and checkout itself live on their own
// pages (/basket, /checkout) now, so this stays a lightweight glance.
export default function CartDrawer() {
  const { items, subtotal, isOpen, close, changeQty, removeItem, totalQty } = useCart()

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-[60] bg-forestDeep/40 transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col overflow-hidden bg-ivory shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Same texture used on the Basket page and Checkout sidebar,
            but kept much more subtle here specifically — this panel is
            narrow and packed with small text (item names, prices, qty
            controls) with no per-row card to sit on, unlike those
            pages, so there's much less room for a busy background
            before it starts fighting with the text. */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.12]"
          style={{ backgroundImage: `url(${herbsCitrus})` }}
          aria-hidden="true"
        />

        <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gold/25 px-6 py-5">
          <h3 className="font-serif text-2xl text-forestDeep">Your Basket</h3>
          <button onClick={close} className="text-2xl leading-none text-forestDeep">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[#8a8672]">Your basket is empty.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 border-b border-gold/15 pb-4">
                  <div>
                    <p className="font-serif text-lg text-forestDeep">{item.name}</p>
                    <p className="text-sm text-[#8a8672]">{fmt(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="h-7 w-7 rounded-full border border-gold/40 text-forestDeep"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm">{item.qty}</span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className="h-7 w-7 rounded-full border border-gold/40 text-forestDeep"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-2 text-xs text-[#a35a3a] underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gold/25 px-6 py-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-[#8a8672]">Subtotal ({totalQty} item{totalQty === 1 ? '' : 's'})</span>
              <span className="font-serif text-xl font-semibold text-forestDeep">{fmt(subtotal)}</span>
            </div>
            <p className="mb-3 text-center text-xs text-[#8a8672]">
              Delivery fees are calculated at checkout based on your location.
            </p>
            <Link
              to="/basket"
              onClick={close}
              className="mb-2.5 block w-full rounded-full border border-forestDeep py-3 text-center text-sm uppercase tracking-wide text-forestDeep"
            >
              View Basket
            </Link>
            <Link
              to="/checkout"
              onClick={close}
              className="block w-full rounded-full bg-forestDeep py-3.5 text-center text-sm uppercase tracking-wide text-cream"
            >
              Checkout
            </Link>
          </div>
        )}
        </div>
      </aside>
    </>
  )
}
