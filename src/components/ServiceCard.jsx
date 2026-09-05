import React from 'react'
import { useCart } from '../context/CartContext.jsx'
import { formatLKR as fmt } from '../lib/currency.js'

export default function ServiceCard({ service, onReserve }) {
  const { addItem } = useCart()
  const isBookable = service.serviceType === 'bookable'

  return (
    <div className="flex flex-col overflow-hidden rounded-sm border border-gold/30 bg-cream transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-brand">
      <div className="flex aspect-square items-center justify-center bg-forestDeep">
        <svg viewBox="0 0 24 24" fill="none" stroke="#e3c98a" strokeWidth="1.2" className="h-16 w-16 opacity-85">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-[0.68rem] uppercase tracking-[0.14em] text-moss">{service.tagline}</span>
        <h3 className="font-serif text-2xl text-forestDeep">{service.name}</h3>
        <p className="flex-1 text-sm text-[#6a6656]">{service.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-serif text-xl font-semibold text-forestDeep">{fmt(service.price)}</span>
          <button
            onClick={() => (isBookable ? onReserve?.() : addItem(service))}
            className="rounded-full bg-forestDeep px-4 py-2.5 text-[0.72rem] uppercase tracking-wide text-cream transition-colors hover:bg-gold hover:text-forestDeep"
          >
            {isBookable ? 'Reserve a Slot' : 'Add to Basket'}
          </button>
        </div>
      </div>
    </div>
  )
}
