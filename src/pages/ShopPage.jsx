import React, { useEffect, useMemo, useState } from 'react'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import CartDrawer from '../components/CartDrawer.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import BookingWidget from '../components/BookingWidget.jsx'
import PageHeroBand from '../components/PageHeroBand.jsx'
import { useCatalog } from '../hooks/useCatalog.js'
import fernTea from '../assets/textures/fern-tea.jpg'
import triphala from '../assets/textures/triphala.jpg'
import cardamom from '../assets/textures/cardamom.jpg'
import ayurvedaBowls from '../assets/textures/ayurveda-bowls.jpg'

const SORTS = {
  popularity: { label: 'Popularity', fn: (a, b) => b.unitsSold - a.unitsSold },
  newest: { label: 'Newest', fn: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0) },
  price_low: { label: 'Price: Low to High', fn: (a, b) => a.price - b.price },
  price_high: { label: 'Price: High to Low', fn: (a, b) => b.price - a.price },
  name: { label: 'Name: A to Z', fn: (a, b) => a.name.localeCompare(b.name) },
}

const TYPES = {
  all: 'All',
  product: 'Products',
  service: 'Services',
}

const PAGE_SIZE = 9

export default function ShopPage() {
  const { loading, error, products, services } = useCatalog()
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('popularity')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [bookingService, setBookingService] = useState(null)

  // Categories only ever apply to products — services don't have one, so
  // the pill bar disappears entirely once "Services" is selected rather
  // than showing an always-empty "all" option.
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [products])

  const visible = useMemo(() => {
    let list = []
    if (type !== 'service') list = list.concat(products.map((p) => ({ ...p })))
    if (type !== 'product') list = list.concat(services.map((s) => ({ ...s })))

    if (category !== 'all') list = list.filter((item) => item.type !== 'product' || item.category === category)
    if (inStockOnly) list = list.filter((item) => item.type !== 'product' || !item.outOfStock)

    list.sort(SORTS[sort].fn)
    return list
  }, [products, services, type, category, sort, inStockOnly])

  // Any filter/sort change can shrink the result set below the current
  // page — reset to page 1 rather than showing a stranded empty page.
  useEffect(() => {
    setPage(1)
  }, [type, category, sort, inStockOnly])

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <Nav />
      <PageHeroBand
        image={fernTea}
        eyebrow="Shop All"
        title="The full collection."
        subtitle="Every product we make, in one place — new additions to the catalog show up here automatically."
      />

      {/* Decorative ingredient strip — purely visual, sits above the
          functional filter bar so it never competes with buttons/text. */}
      <div className="relative z-10 mx-auto -mt-8 mb-2 flex max-w-3xl justify-center gap-4 px-6">
        {[triphala, cardamom, ayurvedaBowls].map((src, i) => (
          <div
            key={i}
            className="h-16 w-16 overflow-hidden rounded-full border-4 border-ivory shadow-md sm:h-20 sm:w-20"
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>

      <section className="bg-ivory pb-16 pt-10">
        <div className="mx-auto max-w-6xl px-7">
          {/* Single filter bar — type, category, in-stock, and sort all
              live in one row (wrapping naturally on small screens)
              rather than stacked as separate filter levels. */}
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-gold/25 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(TYPES).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setType(id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    type === id
                      ? 'bg-gold text-forestDeep'
                      : 'bg-transparent text-moss hover:text-forestDeep'
                  }`}
                >
                  {label}
                </button>
              ))}

              {type !== 'service' && (
                <span className="mx-1 h-4 w-px bg-gold/30" aria-hidden="true" />
              )}

              {type !== 'service' &&
                categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-wide transition-colors ${
                      category === c
                        ? 'border-forestDeep bg-forestDeep text-cream'
                        : 'border-gold/40 text-forestDeep hover:border-forestDeep'
                    }`}
                  >
                    {c === 'all' ? 'All Categories' : c.replace('-', ' ')}
                  </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {type !== 'service' && (
                <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-moss">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-forestDeep"
                  />
                  In stock only
                </label>
              )}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-sm border border-gold/30 bg-cream px-3 py-1.5 text-xs uppercase tracking-wide text-forestDeep"
              >
                {Object.entries(SORTS).map(([id, s]) => (
                  <option key={id} value={id}>
                    Sort: {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && <p className="text-center text-sm text-[#8a8672]">Loading the catalog…</p>}
          {error && (
            <p className="mx-auto max-w-md text-center text-sm text-[#a35a3a]">
              Couldn&rsquo;t reach the catalog API ({error}).
            </p>
          )}

          {!loading && !error && visible.length === 0 && (
            <p className="text-center text-sm text-[#8a8672]">Nothing matches those filters.</p>
          )}

          {!loading && !error && visible.length > 0 && (
            <>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {pageItems.map((item) =>
                  item.type === 'service' ? (
                    <ServiceCard
                      key={item.id}
                      service={item}
                      onReserve={item.serviceType === 'bookable' ? () => setBookingService(item) : undefined}
                    />
                  ) : (
                    <ProductCard key={item.id} product={item} large />
                  )
                )}
              </div>

              {pageCount > 1 && (
                <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Shop pagination">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-full border border-gold/40 px-3 py-1.5 text-xs uppercase tracking-wide text-forestDeep transition-colors hover:border-forestDeep disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Prev
                  </button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      aria-current={page === n ? 'page' : undefined}
                      className={`h-8 w-8 rounded-full text-xs transition-colors ${
                        page === n
                          ? 'bg-forestDeep text-cream'
                          : 'text-forestDeep hover:bg-gold/20'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={page === pageCount}
                    className="rounded-full border border-gold/40 px-3 py-1.5 text-xs uppercase tracking-wide text-forestDeep transition-colors hover:border-forestDeep disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
      <CartDrawer />

      <BookingWidget
        service={bookingService}
        open={Boolean(bookingService)}
        onClose={() => setBookingService(null)}
      />
    </>
  )
}
