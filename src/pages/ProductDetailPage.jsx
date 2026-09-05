import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { useProduct } from '../hooks/useProduct.js'
import { useCart } from '../context/CartContext.jsx'
import { formatLKR as fmt } from '../lib/currency.js'

function AvailabilityNote({ product }) {
  if (product.availability === 'preorder') {
    return (
      <p className="rounded-sm border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-[#8a6d1f]">
        <strong>Pre-order.</strong> Ships in ~{product.preorderEtaDays || 14} days — we'll email your
        estimated delivery date once you check out.
      </p>
    )
  }
  if (product.availability === 'out_of_stock') {
    return (
      <p className="rounded-sm border border-[#a35a3a]/30 bg-[#a35a3a]/10 px-3 py-2 text-sm text-[#a35a3a]">
        Currently sold out. Check back soon, or follow us for restock updates.
      </p>
    )
  }
  return null
}

// Full-screen viewer: click the main image to open, arrow through every
// photo, close before doing anything else (matches "maximize and scroll
// through multiple images before next close").
function Lightbox({ images, index, onClose, onNavigate }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-forestDeep/95 p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 text-3xl leading-none text-cream"
      >
        &times;
      </button>

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(-1)
          }}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-4 text-3xl text-cream sm:left-6"
        >
          ‹
        </button>
      )}

      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] rounded-sm object-contain shadow-2xl"
      />

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(1)
          }}
          aria-label="Next image"
          className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-4 text-3xl text-cream sm:right-6"
        >
          ›
        </button>
      )}

      {images.length > 1 && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-wide text-cream/70">
          {index + 1} / {images.length}
        </p>
      )}
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { loading, error, product } = useProduct(id)
  const { addItem } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (loading) {
    return (
      <>
        <Nav />
        <div className="py-24 text-center text-sm text-[#8a8672]">Loading…</div>
        <Footer />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <Nav />
        <div className="py-24 text-center">
          <h1 className="mb-2 text-2xl">We couldn't find that product</h1>
          <p className="mb-6 text-sm text-[#8a8672]">{error}</p>
          <Link to="/shop" className="rounded-full bg-forestDeep px-5 py-2.5 text-xs uppercase tracking-wide text-cream">
            Back to Shop
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const isPreorder = product.availability === 'preorder'
  const isSoldOut = product.availability === 'out_of_stock'
  const images = product.images

  const navigateLightbox = (dir) => {
    setActiveImage((i) => (i + dir + images.length) % images.length)
  }

  return (
    <>
      <Nav />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Link to="/shop" className="mb-6 inline-block text-xs uppercase tracking-wide text-moss underline">
          ← Back to Shop
        </Link>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Gallery */}
          <div>
            <button
              onClick={() => setLightboxOpen(true)}
              className="block aspect-square w-full overflow-hidden rounded-sm border border-gold/30 bg-[#e9e2cd]"
              aria-label="View full size"
            >
              <img src={images[activeImage]} alt={product.name} className="h-full w-full object-cover" />
            </button>
            {images.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2.5">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-16 overflow-hidden rounded-sm border-2 ${
                      i === activeImage ? 'border-gold' : 'border-gold/25'
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-[#8a8672]">Click the photo to view full size and scroll through all images.</p>
          </div>

          {/* Details */}
          <div>
            {product.badge && (
              <span className="mb-3 inline-block rounded-full bg-gold px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide text-forestDeep">
                {product.badge}
              </span>
            )}
            <span className="block text-xs uppercase tracking-[0.14em] text-moss">{product.tagline}</span>
            <h1 className="mt-1 text-4xl">{product.name}</h1>
            <p className="mt-4 text-2xl font-semibold text-forestDeep">{fmt(product.price)}</p>

            <p className="mt-5 text-[#5c5949]">{product.description}</p>

            {product.ingredients?.length > 0 && (
              <div className="mt-5">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-moss">Inside the jar</p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#5c5949]">
                  {product.ingredients.map((ing) => (
                    <li key={ing}>· {ing}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <AvailabilityNote product={product} />
            </div>

            <div className="mt-6 flex items-center gap-4">
              {!isSoldOut && (
                <div className="flex items-center gap-2 rounded-full border border-gold/40 px-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-9 w-9 items-center justify-center text-lg text-forestDeep"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="flex h-9 w-9 items-center justify-center text-lg text-forestDeep"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              )}
              <button
                onClick={() => addItem(product, qty)}
                disabled={isSoldOut}
                className="flex-1 rounded-full bg-forestDeep px-6 py-3.5 text-xs uppercase tracking-wide text-cream transition-colors hover:bg-gold hover:text-forestDeep disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                {isSoldOut ? 'Out of Stock' : isPreorder ? 'Pre-order Now' : 'Add to Basket'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {lightboxOpen && (
        <Lightbox
          images={images}
          index={activeImage}
          onClose={() => setLightboxOpen(false)}
          onNavigate={navigateLightbox}
        />
      )}
    </>
  )
}
