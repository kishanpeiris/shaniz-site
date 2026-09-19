import React, { useState } from 'react'
import ProductCard from './ProductCard.jsx'
import ServiceCard from './ServiceCard.jsx'
import BookingWidget from './BookingWidget.jsx'
import RowCarousel from './RowCarousel.jsx'
import { useCatalog } from '../hooks/useCatalog.js'
import { useHomepageContent } from '../hooks/useHomepageContent.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { localizedField } from '../lib/localize.js'

export default function Products() {
  const { loading, error, products, services } = useCatalog()
  const content = useHomepageContent()
  const { language } = useLanguage()
  const [bookingService, setBookingService] = useState(null)
  // Most-popular-first — units sold is already computed server-side for
  // both products and services (see UNITS_SOLD_SUBQUERY in
  // products.routes.js/services.routes.js), so this is just ordering
  // what's already there, not a new calculation. A plain spread of
  // [...products, ...services] previously left this in whatever order
  // the two API calls happened to return (created-date order), so
  // there was no real "most popular" story to it at all.
  const items = [...products, ...services].sort((a, b) => b.unitsSold - a.unitsSold)

  return (
    <section id="products" className="relative py-24">
      <div className="relative mx-auto max-w-6xl px-7">
        <div className="mx-auto mb-14 max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-goldLight">
            {localizedField(content, 'ritual_eyebrow', language)}
          </p>
          <h2 className="mt-3 text-4xl text-ivory">{localizedField(content, 'ritual_headline', language)}</h2>
          <p className="mt-3 text-cream/80">{localizedField(content, 'ritual_subtext', language)}</p>
        </div>

        {loading && <p className="text-center text-sm text-cream/70">Loading the catalog…</p>}

        {error && (
          <p className="mx-auto max-w-md text-center text-sm text-[#e2947a]">
            Couldn&rsquo;t reach the catalog API ({error}). Is the backend running at the URL in{' '}
            <code>VITE_API_URL</code>?
          </p>
        )}

        {!loading && !error && (
          <RowCarousel
            items={items}
            mode="scroll"
            visibleOnMobile={2}
            renderItem={(item) =>
              item.type === 'service' ? (
                <ServiceCard
                  key={item.id}
                  service={item}
                  onReserve={item.serviceType === 'bookable' ? () => setBookingService(item) : undefined}
                />
              ) : (
                <ProductCard key={item.id} product={item} />
              )
            }
          />
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
