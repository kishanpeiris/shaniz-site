import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import RichText from '../components/RichText.jsx'
import BadgeRow from '../components/BadgeRow.jsx'
import { useService } from '../hooks/useService.js'
import { useCart } from '../context/CartContext.jsx'
import BookingWidget from '../components/BookingWidget.jsx'
import { formatLKR as fmt } from '../lib/currency.js'
import { googleMapsUrl } from '../lib/maps.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { localizedField } from '../lib/localize.js'
import Price from '../components/Price.jsx'
import ProviderBadge from '../components/ProviderBadge.jsx'
import { useServiceProvider } from '../hooks/useServiceProvider.js'
import { providerBranchLabel } from '../lib/serviceProvider.js'
import { useDocumentMeta, useJsonLd } from '../hooks/useDocumentMeta.js'

// Same full-screen gallery viewer as ProductDetailPage — kept as a
// separate copy rather than a shared import so either page's gallery can
// diverge later without the two dragging each other along. Handles both
// photos and the optional detail video, same as ProductDetailPage.
function Lightbox({ media, index, onClose, onNavigate }) {
  const { t } = useLanguage()
  const item = media[index]
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-forestDeep/95 p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button onClick={onClose} aria-label={t('common_close')} className="absolute right-5 top-5 text-3xl leading-none text-cream">
        &times;
      </button>
      {media.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(-1) }}
          aria-label={t('common_previous')}
          className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-4 text-3xl text-cream sm:left-6"
        >
          ‹
        </button>
      )}
      {item.type === 'video' ? (
        <video src={item.src} controls autoPlay playsInline onClick={(e) => e.stopPropagation()} className="max-h-[85vh] max-w-[90vw] rounded-sm shadow-2xl" />
      ) : (
        <img src={item.src} alt="" onClick={(e) => e.stopPropagation()} className="max-h-[85vh] max-w-[90vw] rounded-sm object-contain shadow-2xl" />
      )}
      {media.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(1) }}
          aria-label={t('common_next')}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-4 text-3xl text-cream sm:right-6"
        >
          ›
        </button>
      )}
      {media.length > 1 && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-wide text-cream/70">
          {index + 1} / {media.length}
        </p>
      )}
    </div>
  )
}

export default function ServiceDetailPage() {
  const { id } = useParams()
  const { loading, error, service } = useService(id)
  const { addItem } = useCart()
  const { language, t } = useLanguage()
  const { provider } = useServiceProvider()
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)

  // Same rule as ProductDetailPage: hooks must run before the
  // loading/error early returns below, so safe fallbacks are used here.
  const seoName = service ? localizedField(service, 'name', language) : ''
  const seoDescription = service ? localizedField(service, 'description', language) : ''
  useDocumentMeta({
    title: seoName || undefined,
    description: seoDescription ? seoDescription.slice(0, 160) : undefined,
  })
  useJsonLd(
    service
      ? {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: seoName,
          description: seoDescription,
          image: service.images,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'LKR',
            price: service.price,
          },
        }
      : null
  )

  if (loading) {
    return (
      <>
        <Nav />
        <div className="py-24 text-center text-sm text-[#6a6656]">{t('common_loading')}</div>
        <Footer />
      </>
    )
  }

  if (error || !service) {
    return (
      <>
        <Nav />
        <div className="py-24 text-center">
          <h1 className="mb-2 text-2xl">{t('sd_not_found')}</h1>
          <p className="mb-6 text-sm text-[#6a6656]">{error}</p>
          <Link to="/shop" className="rounded-full bg-forestDeep px-5 py-2.5 text-xs uppercase tracking-wide text-cream">
            {t('common_back_to_shop')}
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const isBookable = service.serviceType === 'bookable'
  const displayName = localizedField(service, 'name', language)
  const displayDescription = localizedField(service, 'description', language)
  // Detail-page video first; fall back to the hover video so an
  // uploaded video always shows up on this page.
  const videoSrc = service.detailVideo || service.hoverVideo
  const media = [
    ...service.images.map((src) => ({ type: 'image', src })),
    ...(videoSrc ? [{ type: 'video', src: videoSrc }] : []),
  ]
  const active = media[activeIndex] || media[0]
  const navigateLightbox = (dir) => setActiveIndex((i) => (i + dir + media.length) % media.length)

  return (
    <>
      <Nav />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Link to="/shop" className="mb-6 inline-block text-sm uppercase tracking-wide text-moss underline">
          ← {t('common_back_to_shop')}
        </Link>

        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <button
              onClick={() => setLightboxOpen(true)}
              className="block aspect-square w-full overflow-hidden rounded-sm border border-gold/30 bg-forestDeep"
              aria-label={t('common_view_full_size')}
            >
              {active.type === 'video' ? (
                <video src={active.src} muted loop autoPlay playsInline className="h-full w-full object-cover" />
              ) : (
                <img
                  src={active.src}
                  alt={displayName}
                  style={activeIndex === 0 ? { objectPosition: `${service.imageFocal.x}% ${service.imageFocal.y}%` } : undefined}
                  className="h-full w-full object-cover"
                />
              )}
            </button>
            {media.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2.5">
                {media.map((m, i) => (
                  <button
                    key={m.src + i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative h-16 w-16 overflow-hidden rounded-sm border-2 ${i === activeIndex ? 'border-gold' : 'border-gold/25'}`}
                  >
                    {m.type === 'video' ? (
                      <>
                        <video src={m.src} muted className="h-full w-full object-cover" />
                        <span className="absolute inset-0 flex items-center justify-center bg-forestDeep/30 text-cream">▶</span>
                      </>
                    ) : (
                      <img src={m.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {service.badges?.length > 0 && (
              <div className="mb-3">
                <BadgeRow badges={service.badges} />
              </div>
            )}
            <span className="block text-xs uppercase tracking-[0.14em] text-moss">{service.tagline}</span>
            <h1 className="mt-1 text-4xl">{displayName}</h1>
            <p className="mt-4 text-2xl font-semibold text-forestDeep"><Price item={service} /></p>
            <RichText text={displayDescription} className="mt-5 text-[#5c5949]" />

            {/* Which company provides this service (name/logo/wording set in Admin -> Services) */}
            <ProviderBadge variant="block" className="mt-5" />

            {isBookable && (
              <p className="mt-5 rounded-sm border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-[#8a6d1f]">
                Duration: ~{service.durationMinutes} minutes. Pick a date and time on the next step.
              </p>
            )}

            {service.branches.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">{t('sd_available_at')}</p>
                <ul className="mt-2 space-y-3">
                  {service.branches.map((b) => (
                    <li key={b.id} className="text-sm text-[#5c5949]">
                      <p className="font-semibold text-forestDeep">{providerBranchLabel(provider, b.name)}</p>
                      <p>{b.address}</p>
                      {b.phone && <p>{b.phone}</p>}
                      <a href={googleMapsUrl(b)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-base uppercase tracking-wide text-forestDeep underline">
                        {t('sd_open_maps')}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
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
        <Lightbox media={media} index={activeIndex} onClose={() => setLightboxOpen(false)} onNavigate={navigateLightbox} />
      )}

      <BookingWidget service={service} open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  )
}
