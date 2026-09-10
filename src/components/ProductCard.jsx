import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { formatLKR as fmt } from '../lib/currency.js'
import { toPlainText } from './RichText.jsx'

export default function ProductCard({ product, large = false }) {
  const { addItem } = useCart()
  const { t } = useLanguage()
  const [hovering, setHovering] = useState(false)
  // Preference order on hover: looping WebM/MP4 video, then animated
  // WebP, then the legacy GIF field (older uploads), then just the
  // still photo. Nothing ever renders broken — a product with none of
  // the first three simply shows its normal image, same as before this
  // feature existed.
  const hoverImage = product.hoverWebp || product.hoverGif
  const showHoverVideo = hovering && product.hoverVideo
  const displayImage = hovering && hoverImage ? hoverImage : product.image
  const hasHoverMedia = Boolean(product.hoverVideo || hoverImage)
  const isPreorder = product.availability === 'preorder'
  const isSoldOut = product.availability === 'out_of_stock' || (!isPreorder && product.outOfStock)

  // Touch devices have no hover state, so "hover to preview" needs an
  // explicit stand-in: press and hold the thumbnail to play the video
  // (or show the alternate hover image), release to go back to the
  // normal photo. Mouse and touch both just flip the same `hovering`
  // flag, so the rest of the card's logic above doesn't need to know
  // which input triggered it.
  const touchProps = {
    onTouchStart: () => setHovering(true),
    onTouchEnd: () => setHovering(false),
    onTouchCancel: () => setHovering(false),
  }

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="group relative flex flex-col overflow-hidden rounded-sm border border-gold/30 bg-cream transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-brand"
    >
      {product.badges?.length > 0 && (
        <div className="absolute left-3.5 top-3.5 z-10 flex flex-wrap gap-1.5">
          {product.badges.map((b) => (
            <span key={b} className="rounded-full bg-gold px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide text-forestDeep">
              {b}
            </span>
          ))}
        </div>
      )}

      <Link
        to={`/product/${product.id}`}
        {...touchProps}
        className={`card-media relative block overflow-hidden bg-[#e9e2cd] ${large ? 'aspect-[4/5]' : 'aspect-square'}`}
      >
        {showHoverVideo ? (
          // key={product.hoverVideo} forces a fresh <video> element per
          // product, so the browser always starts playback from frame 0
          // instead of possibly reusing a paused element from another
          // card if React ever recycled the DOM node.
          <video
            key={product.hoverVideo}
            src={product.hoverVideo}
            poster={product.image}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={displayImage}
            alt={product.name}
            style={{ objectPosition: `${product.imageFocal.x}% ${product.imageFocal.y}%` }}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
        )}
        {!hasHoverMedia && product.ingredients?.length > 0 && (
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-b from-forest/5 to-forestDeep/95 p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-goldLight">
              Inside
            </p>
            <ul className="space-y-0.5 text-sm text-cream">
              {product.ingredients.map((ing) => (
                <li key={ing}>{ing}</li>
              ))}
            </ul>
          </div>
        )}
        {isSoldOut && (
          <span className="absolute bottom-3 left-3 rounded-full bg-forestDeep/90 px-2.5 py-1 text-[0.62rem] uppercase tracking-wide text-cream">
            {t('out_of_stock')}
          </span>
        )}
        {isPreorder && (
          <span className="absolute bottom-3 left-3 rounded-full bg-gold px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide text-forestDeep">
            Pre-order
          </span>
        )}
      </Link>

      <div className={`flex flex-1 flex-col gap-2 ${large ? 'p-6' : 'p-5'}`}>
        <span className="text-[0.68rem] uppercase tracking-[0.14em] text-moss">
          {product.tagline}
        </span>
        <Link to={`/product/${product.id}`}>
          <h3 className={`font-serif text-forestDeep hover:text-moss ${large ? 'text-3xl' : 'text-2xl'}`}>{product.name}</h3>
        </Link>
        <p className="flex-1 text-sm text-[#6a6656]">{toPlainText(product.description)}</p>
        {isPreorder && (
          <p className="text-xs text-[#8a6d1f]">
            Ships in ~{product.preorderEtaDays || 14} days
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className={`font-serif font-semibold text-forestDeep ${large ? 'text-2xl' : 'text-xl'}`}>
            {fmt(product.price)}
          </span>
          <button
            onClick={() => addItem(product)}
            disabled={isSoldOut}
            className="rounded-full bg-forestDeep px-4 py-2.5 text-[0.72rem] uppercase tracking-wide text-cream transition-colors hover:bg-gold hover:text-forestDeep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSoldOut ? t('out_of_stock') : isPreorder ? t('preorder_now') : t('add_to_basket')}
          </button>
        </div>
      </div>
    </div>
  )
}
