import React, { useState } from 'react'
import ProductCard from './ProductCard.jsx'
import ServiceCard from './ServiceCard.jsx'
import BookingWidget from './BookingWidget.jsx'
import RowCarousel from './RowCarousel.jsx'
import { useCatalog } from '../hooks/useCatalog.js'
import { useHomepageContent } from '../hooks/useHomepageContent.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { localizedField } from '../lib/localize.js'
import matchaSlate from '../assets/textures/matcha-slate.jpg'

export default function Products() {
  const { loading, error, products, services } = useCatalog()
  const content = useHomepageContent()
  const { language } = useLanguage()
  const backgroundTexture = content.ritual_background_url || matchaSlate
  const [bookingService, setBookingService] = useState(null)
  const items = [...products, ...services]

  return (
    <section id="products" className="relative overflow-hidden bg-forestDeep py-24 text-cream">
      {/* Same treatment as "See It Made" / About: photo at a strong,
          clearly visible opacity with a dark tint on top, light text
          throughout. The product/service cards below keep their own
          bright ivory background regardless — they're self-contained,
          so they read fine floating on a dark backdrop. */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.5]"
        style={{ backgroundImage: `url(${backgroundTexture})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-forestDeep/45" aria-hidden="true" />
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
            perPage={6}
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
