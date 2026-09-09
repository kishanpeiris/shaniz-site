import React, { useState } from 'react'
import ProductCard from './ProductCard.jsx'
import ServiceCard from './ServiceCard.jsx'
import BookingWidget from './BookingWidget.jsx'
import RowCarousel from './RowCarousel.jsx'
import { useCatalog } from '../hooks/useCatalog.js'
import { useHomepageContent } from '../hooks/useHomepageContent.js'
import matchaSlate from '../assets/textures/matcha-slate.jpg'

export default function Products() {
  const { loading, error, products, services } = useCatalog()
  const content = useHomepageContent()
  const backgroundTexture = content.ritual_background_url || matchaSlate
  const [bookingService, setBookingService] = useState(null)
  const items = [...products, ...services]

  return (
    <section id="products" className="relative overflow-hidden bg-ivory py-24">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.16]"
        style={{ backgroundImage: `url(${backgroundTexture})` }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-7">
        <div className="mx-auto mb-14 max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{content.ritual_eyebrow}</p>
          <h2 className="mt-3 text-4xl">{content.ritual_headline}</h2>
          <p className="mt-3 text-[#5c5949]">{content.ritual_subtext}</p>
        </div>

        {loading && <p className="text-center text-sm text-[#8a8672]">Loading the catalog…</p>}

        {error && (
          <p className="mx-auto max-w-md text-center text-sm text-[#a35a3a]">
            Couldn&rsquo;t reach the catalog API ({error}). Is the backend running at the URL in{' '}
            <code>VITE_API_URL</code>?
          </p>
        )}

        {!loading && !error && (
          <RowCarousel
            items={items}
            perPage={3}
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
