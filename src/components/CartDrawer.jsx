import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import herbsCitrus from '../assets/textures/herbs-citrus.jpg'
import { formatLKR as fmt } from '../lib/currency.js'

// Quick slide-in preview after "Add to Basket" — full basket management
// (quantities, removing items) and checkout itself live on their own
// pages (/basket, /checkout) now, so this stays a lightweight glance.
export default function CartDrawer() {
  const { items, subtotal, isOpen, close, changeQty, removeItem, totalQty } = useCart()
  const { t } = useLanguage()

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-[60] bg-forestDeep/40 transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col overflow-hidden bg-forestDeep text-cream shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Same treatment as "See It Made": photo at a strong, clearly
            visible opacity with a dark tint on top, and every piece of
            text in this panel flipped to a light color to match —
            rather than the previous approach of just turning the photo
            down low enough to peek through behind dark text. */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.4]"
          style={{ backgroundImage: `url(${herbsCitrus})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-forestDeep/55" aria-hidden="true" />

        <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gold/25 px-6 py-5">
          <h3 className="font-serif text-2xl text-ivory">{t('your_basket')}</h3>
          <button onClick={close} className="text-2xl leading-none text-cream">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-cream/70">{t('basket_empty')}</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 border-b border-gold/20 pb-4">
                  <div>
                    <p className="font-serif text-lg text-ivory">{item.name}</p>
                    <p className="text-sm text-cream/70">{fmt(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="h-7 w-7 rounded-full border border-gold/50 text-cream"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm">{item.qty}</span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className="h-7 w-7 rounded-full border border-gold/50 text-cream"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-2 text-xs text-[#e2947a] underline"
                    >
                      {t('common_remove')}
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
              <span className="text-cream/70">{t('subtotal')} ({totalQty} item{totalQty === 1 ? '' : 's'})</span>
              <span className="font-serif text-xl font-semibold text-ivory">{fmt(subtotal)}</span>
            </div>
            <p className="mb-3 text-center text-xs text-cream/70">
              {t('cart_delivery_note')}
            </p>
            <Link
              to="/basket"
              onClick={close}
              className="mb-2.5 block w-full rounded-full border border-goldLight py-3 text-center text-sm uppercase tracking-wide text-goldLight"
            >
              {t('view_basket')}
            </Link>
            <Link
              to="/checkout"
              onClick={close}
              className="block w-full rounded-full bg-gold py-3.5 text-center text-sm uppercase tracking-wide text-forestDeep"
            >
              {t('checkout')}
            </Link>
          </div>
        )}
        </div>
      </aside>
    </>
  )
}
