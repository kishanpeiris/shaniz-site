import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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

// "Best Match" isn't a static comparator like the others — its ranking
// depends on the current search text, so it's handled separately in the
// sorting step below. It's still listed here (with a label only) so it
// shows up in the dropdown in the right position, as the default.
const SORTS = {
  best_match: { label: 'Best Match' },
  popularity: { label: 'Popularity', fn: (a, b) => b.unitsSold - a.unitsSold },
  newest: { label: 'Newest', fn: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0) },
  price_low: { label: 'Price: Low to High', fn: (a, b) => a.price - b.price },
  price_high: { label: 'Price: High to Low', fn: (a, b) => b.price - a.price },
  name: { label: 'Name: A to Z', fn: (a, b) => a.name.localeCompare(b.name) },
}

// Simple relevance score for "Best Match" — no search text means every
// item ties, so it falls back to popularity (below). With search text,
// a name starting with the query ranks above a name merely containing
// it, which ranks above a match only in the description.
function relevance(item, q) {
  if (!q) return 0
  const name = item.name.toLowerCase()
  if (name.startsWith(q)) return 3
  if (name.includes(q)) return 2
  if ((item.description || '').toLowerCase().includes(q)) return 1
  return 0
}

const TYPES = {
  all: 'All',
  product: 'Products',
  service: 'Services',
}

// Preset bands rather than a min/max slider — simpler to scan in a
// dropdown, and matches the "options like ... price range" ask directly.
const PRICE_BANDS = {
  all: { label: 'Any Price', test: () => true },
  under_2000: { label: 'Under Rs. 2,000', test: (p) => p < 2000 },
  '2000_4000': { label: 'Rs. 2,000 – 4,000', test: (p) => p >= 2000 && p < 4000 },
  '4000_6000': { label: 'Rs. 4,000 – 6,000', test: (p) => p >= 4000 && p < 6000 },
  over_6000: { label: 'Over Rs. 6,000', test: (p) => p >= 6000 },
}

const PAGE_SIZE = 9

export default function ShopPage() {
  const { loading, error, products, services } = useCatalog()
  const [searchParams, setSearchParams] = useSearchParams()
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [priceBand, setPriceBand] = useState('all')
  const [sort, setSort] = useState('best_match')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [bookingService, setBookingService] = useState(null)
  // Seeded from ?q= (e.g. arriving from the nav search box) and kept in
  // sync with it, so the URL stays shareable/bookmarkable.
  const [search, setSearch] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (search) next.set('q', search)
    else next.delete('q')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  // Categories can apply to both products and services now (each is its
  // own list in the database — see schema.sql), so the dropdown is built
  // from whichever type is currently in view rather than being
  // products-only.
  const categories = useMemo(() => {
    const set = new Set()
    if (type !== 'service') products.forEach((p) => p.category && set.add(p.category))
    if (type !== 'product') services.forEach((s) => s.category && set.add(s.category))
    return ['all', ...Array.from(set)]
  }, [products, services, type])

  const visible = useMemo(() => {
    let list = []
    if (type !== 'service') list = list.concat(products.map((p) => ({ ...p })))
    if (type !== 'product') list = list.concat(services.map((s) => ({ ...s })))

    if (category !== 'all') list = list.filter((item) => item.category === category)
    if (inStockOnly) list = list.filter((item) => item.type !== 'product' || !item.outOfStock)
    if (priceBand !== 'all') list = list.filter((item) => PRICE_BANDS[priceBand].test(item.price))

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (item) => item.name.toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q)
      )
    }

    if (sort === 'best_match') {
      list.sort((a, b) => relevance(b, q) - relevance(a, q) || b.unitsSold - a.unitsSold)
    } else {
      list.sort(SORTS[sort].fn)
    }
    return list
  }, [products, services, type, category, priceBand, sort, inStockOnly, search])

  // Any filter/sort change can shrink the result set below the current
  // page — reset to page 1 rather than showing a stranded empty page.
  useEffect(() => {
    setPage(1)
  }, [type, category, priceBand, sort, inStockOnly, search])

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const clearFilters = () => {
    setType('all')
    setCategory('all')
    setPriceBand('all')
    setInStockOnly(false)
    setSearch('')
  }
  const filtersActive = type !== 'all' || category !== 'all' || priceBand !== 'all' || inStockOnly || Boolean(search)

  const selectClass =
    'w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-xs uppercase tracking-wide text-forestDeep disabled:cursor-not-allowed disabled:opacity-40'

  const FilterFields = (
    <div className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-moss">
          Product Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={selectClass}
        >
          {Object.entries(TYPES).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-moss">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={selectClass}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : c.replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-moss">
          Price Range
        </label>
        <select value={priceBand} onChange={(e) => setPriceBand(e.target.value)} className={selectClass}>
          {Object.entries(PRICE_BANDS).map(([id, b]) => (
            <option key={id} value={id}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <label
        className={`flex items-center gap-2 text-xs uppercase tracking-wide text-moss ${
          type === 'service' ? 'cursor-not-allowed opacity-40' : ''
        }`}
      >
        <input
          type="checkbox"
          checked={inStockOnly}
          disabled={type === 'service'}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="accent-forestDeep"
        />
        In stock only
      </label>

      {filtersActive && (
        <button
          onClick={clearFilters}
          className="self-start text-xs uppercase tracking-wide text-moss underline decoration-gold/50 hover:text-forestDeep"
        >
          Clear filters
        </button>
      )}
    </div>
  )

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
          <div className="flex flex-col gap-10 md:flex-row">
            {/* Filters — a fixed sidebar on desktop, a collapsible
                <details> panel on mobile so it doesn't push the results
                far down the page on small screens. */}
            <aside className="w-full shrink-0 md:w-56">
              <div className="hidden rounded-sm border border-gold/25 bg-cream/60 p-5 md:block">
                <h2 className="mb-4 font-serif text-lg text-forestDeep">Filters</h2>
                {FilterFields}
              </div>
              <details className="rounded-sm border border-gold/25 bg-cream/60 p-5 md:hidden">
                <summary className="cursor-pointer font-serif text-lg text-forestDeep">Filters</summary>
                <div className="mt-4">{FilterFields}</div>
              </details>
            </aside>

            <div className="min-w-0 flex-1">
              <div className="mb-5">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products &amp; services…"
                  className="w-full rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm text-forestDeep placeholder:text-moss/70 focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gold/25 pb-4">
                <p className="text-xs uppercase tracking-wide text-moss">
                  {visible.length} {visible.length === 1 ? 'result' : 'results'}
                  {search && <> for &ldquo;{search}&rdquo;</>}
                </p>
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
                  <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
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
                            page === n ? 'bg-forestDeep text-cream' : 'text-forestDeep hover:bg-gold/20'
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
          </div>
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
