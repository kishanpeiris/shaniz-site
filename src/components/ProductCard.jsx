import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { formatLKR as fmt } from '../lib/currency.js'

export default function ProductCard({ product, large = false }) {
  const { addItem } = useCart()
  const [hovering, setHovering] = useState(false)
  const displayImage = hovering && product.hoverGif ? product.hoverGif : product.image
  const isPreorder = product.availability === 'preorder'
  const isSoldOut = product.availability === 'out_of_stock' || (!isPreorder && product.outOfStock)

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="group relative flex flex-col overflow-hidden rounded-sm border border-gold/30 bg-cream transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-brand"
    >
      {product.badge && (
        <span className="absolute left-3.5 top-3.5 z-10 rounded-full bg-gold px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide text-forestDeep">
          {product.badge}
        </span>
      )}

      <Link to={`/product/${product.id}`} className={`card-media relative block overflow-hidden bg-[#e9e2cd] ${large ? 'aspect-[4/5]' : 'aspect-square'}`}>
        <img src={displayImage} alt={product.name} className="h-full w-full object-cover transition-opacity duration-300" />
        {!product.hoverGif && product.ingredients?.length > 0 && (
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
            Out of stock
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
        <p className="flex-1 text-sm text-[#6a6656]">{product.description}</p>
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
            {isSoldOut ? 'Out of Stock' : isPreorder ? 'Pre-order Now' : 'Add to Basket'}
          </button>
        </div>
      </div>
    </div>
  )
}
