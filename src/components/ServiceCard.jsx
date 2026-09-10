import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { formatLKR as fmt } from '../lib/currency.js'
import { toPlainText } from './RichText.jsx'

export default function ServiceCard({ service, onReserve }) {
  const { addItem } = useCart()
  const { t } = useLanguage()
  const [hovering, setHovering] = useState(false)
  const isBookable = service.serviceType === 'bookable'

  // Same fallback order as ProductCard: video, then webp, then the
  // legacy gif field, then just the still photo (or the shared default
  // image if this service has no photo uploaded at all).
  const hoverImage = service.hoverWebp || service.hoverGif
  const showHoverVideo = hovering && service.hoverVideo
  const displayImage = hovering && hoverImage ? hoverImage : service.image

  // See ProductCard.jsx for why touch needs its own handlers — same
  // press-and-hold-to-preview behavior, mirrored here.
  const touchProps = {
    onTouchStart: () => setHovering(true),
    onTouchEnd: () => setHovering(false),
    onTouchCancel: () => setHovering(false),
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-sm border border-gold/30 bg-cream transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-brand">
      <Link
        to={`/service/${service.id}`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        {...touchProps}
        className="relative block aspect-square overflow-hidden bg-forestDeep"
      >
        {service.badges?.length > 0 && (
          <div className="absolute left-3.5 top-3.5 z-10 flex flex-wrap gap-1.5">
            {service.badges.map((b) => (
              <span key={b} className="rounded-full bg-gold px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide text-forestDeep">
                {b}
              </span>
            ))}
          </div>
        )}
        {showHoverVideo ? (
          <video
            key={service.hoverVideo}
            src={service.hoverVideo}
            poster={service.image}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={displayImage}
            alt={service.name}
            style={{ objectPosition: `${service.imageFocal.x}% ${service.imageFocal.y}%` }}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-[0.68rem] uppercase tracking-[0.14em] text-moss">{service.tagline}</span>
        <Link to={`/service/${service.id}`}>
          <h3 className="font-serif text-2xl text-forestDeep hover:text-moss">{service.name}</h3>
        </Link>
        <p className="flex-1 text-sm text-[#6a6656]">{toPlainText(service.description)}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-serif text-xl font-semibold text-forestDeep">{fmt(service.price)}</span>
          <button
            onClick={() => (isBookable ? onReserve?.() : addItem(service))}
            className="rounded-full bg-forestDeep px-4 py-2.5 text-[0.72rem] uppercase tracking-wide text-cream transition-colors hover:bg-gold hover:text-forestDeep"
          >
            {isBookable ? t('reserve_a_slot') : t('add_to_basket')}
          </button>
        </div>
      </div>
    </div>
  )
}
