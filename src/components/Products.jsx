import React, { useState } from 'react'
import ProductCard from './ProductCard.jsx'
import ServiceCard from './ServiceCard.jsx'
import BookingWidget from './BookingWidget.jsx'
import { useCatalog } from '../hooks/useCatalog.js'
import matchaSlate from '../assets/textures/matcha-slate.jpg'

export default function Products() {
  const { loading, error, products, services } = useCatalog()
  const [bookingService, setBookingService] = useState(null)

  return (
    <section id="products" className="relative overflow-hidden bg-ivory py-24">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.12]"
        style={{ backgroundImage: `url(${matchaSlate})` }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-7">
        <div className="mx-auto mb-14 max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">The Ritual</p>
          <h2 className="mt-3 text-4xl">Shop what&rsquo;s in the jar.</h2>
          <p className="mt-3 text-[#5c5949]">
            Two staples to start with — an oil for the scalp, a mask for the strands. Hover a
            product to see what&rsquo;s inside.
          </p>
        </div>

        {loading && <p className="text-center text-sm text-[#8a8672]">Loading the catalog…</p>}

        {error && (
          <p className="mx-auto max-w-md text-center text-sm text-[#a35a3a]">
            Couldn&rsquo;t reach the catalog API ({error}). Is the backend running at the URL in{' '}
            <code>VITE_API_URL</code>?
          </p>
        )}

        {!loading && !error && (
          <div className="grid gap-7 md:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {services.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                onReserve={s.serviceType === 'bookable' ? () => setBookingService(s) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <BookingWidget
        service={bookingService}
        open={Boolean(bookingService)}
        onClose={() => setBookingService(null)}
      />
    </section>
  )
}
