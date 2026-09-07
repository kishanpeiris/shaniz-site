import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { useService } from '../hooks/useService.js'
import { useCart } from '../context/CartContext.jsx'
import BookingWidget from '../components/BookingWidget.jsx'
import { formatLKR as fmt } from '../lib/currency.js'

// Same full-screen gallery viewer as ProductDetailPage — kept as a
// separate copy rather than a shared import so either page's gallery can
// diverge later without the two dragging each other along.
function Lightbox({ images, index, onClose, onNavigate }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-forestDeep/95 p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button onClick={onClose} aria-label="Close" className="absolute right-5 top-5 text-3xl leading-none text-cream">
        &times;
      </button>
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(-1) }}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-4 text-3xl text-cream sm:left-6"
        >
          ‹
        </button>
      )}
      <img src={images[index]} alt="" onClick={(e) => e.stopPropagation()} className="max-h-[85vh] max-w-[90vw] rounded-sm object-contain shadow-2xl" />
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(1) }}
          aria-label="Next image"
          className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-4 text-3xl text-cream sm:right-6"
        >
          ›
        </button>
      )}
    </div>
  )
}

export default function ServiceDetailPage() {
  const { id } = useParams()
  const { loading, error, service } = useService(id)
  const { addItem } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)

  if (loading) {
    return (
      <>
        <Nav />
        <div className="py-24 text-center text-sm text-[#8a8672]">Loading…</div>
        <Footer />
      </>
    )
  }

  if (error || !service) {
    return (
      <>
        <Nav />
        <div className="py-24 text-center">
          <h1 className="mb-2 text-2xl">We couldn't find that service</h1>
          <p className="mb-6 text-sm text-[#8a8672]">{error}</p>
          <Link to="/shop" className="rounded-full bg-forestDeep px-5 py-2.5 text-xs uppercase tracking-wide text-cream">
            Back to Shop
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const isBookable = service.serviceType === 'bookable'
  const images = service.images
  const navigateLightbox = (dir) => setActiveImage((i) => (i + dir + images.length) % images.length)

  return (
    <>
      <Nav />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Link to="/shop" className="mb-6 inline-block text-xs uppercase tracking-wide text-moss underline">
          ← Back to Shop
        </Link>

        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <button
              onClick={() => setLightboxOpen(true)}
              className="block aspect-square w-full overflow-hidden rounded-sm border border-gold/30 bg-forestDeep"
              aria-label="View full size"
            >
              <img src={images[activeImage]} alt={service.name} className="h-full w-full object-cover" />
            </button>
            {images.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2.5">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-16 overflow-hidden rounded-sm border-2 ${i === activeImage ? 'border-gold' : 'border-gold/25'}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="block text-xs uppercase tracking-[0.14em] text-moss">{service.tagline}</span>
            <h1 className="mt-1 text-4xl">{service.name}</h1>
            <p className="mt-4 text-2xl font-semibold text-forestDeep">{fmt(service.price)}</p>
            <p className="mt-5 text-[#5c5949]">{service.description}</p>

            {isBookable && (
              <p className="mt-5 rounded-sm border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-[#8a6d1f]">
                Duration: ~{service.durationMinutes} minutes. Pick a date and time on the next step.
              </p>
            )}

            <div className="mt-6">
              <button
                onClick={() => (isBookable ? setBookingOpen(true) : addItem(service))}
                className="rounded-full bg-forestDeep px-6 py-3.5 text-xs uppercase tracking-wide text-cream transition-colors hover:bg-gold hover:text-forestDeep"
              >
                {isBookable ? 'Reserve a Slot' : 'Add to Basket'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {lightboxOpen && (
        <Lightbox images={images} index={activeImage} onClose={() => setLightboxOpen(false)} onNavigate={navigateLightbox} />
      )}

      <BookingWidget service={service} open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  )
}
