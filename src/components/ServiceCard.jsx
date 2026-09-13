import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { formatLKR as fmt } from '../lib/currency.js'
import { toPlainText } from './RichText.jsx'
import BadgeRow from './BadgeRow.jsx'
import { localizedField } from '../lib/localize.js'

export default function ServiceCard({ service, onReserve }) {
  const { addItem } = useCart()
  const { t, language } = useLanguage()
  const [hovering, setHovering] = useState(false)
  const isBookable = service.serviceType === 'bookable'
  const displayName = localizedField(service, 'name', language)
  const displayDescription = localizedField(service, 'description', language)

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
          <div className="absolute left-3.5 right-3.5 top-3.5 z-10">
            <BadgeRow badges={service.badges} />
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
            alt={displayName}
            loading="lazy"
            decoding="async"
            style={{ objectPosition: `${service.imageFocal.x}% ${service.imageFocal.y}%` }}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-[0.68rem] uppercase tracking-[0.14em] text-moss">{service.tagline}</span>
        <Link to={`/service/${service.id}`}>
          <h3 className="font-serif text-2xl text-forestDeep hover:text-moss">{displayName}</h3>
        </Link>
        <p className="line-clamp-2 flex-1 text-sm text-[#6a6656]">{toPlainText(displayDescription)}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="whitespace-nowrap font-serif text-xl font-semibold text-forestDeep">{fmt(service.price)}</span>
          <button
            onClick={() => (isBookable ? onReserve?.() : addItem(service))}
            className="shrink-0 rounded-full bg-forestDeep px-4 py-2.5 text-[0.72rem] uppercase tracking-wide text-cream transition-colors hover:bg-gold hover:text-forestDeep"
          >
            {isBookable ? t('reserve_a_slot') : t('add_to_basket')}
          </button>
        </div>
      </div>
    </div>
  )
}
