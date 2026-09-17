import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useIsMobile } from '../hooks/useIsMobile.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import CartDrawer from '../components/CartDrawer.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import BookingWidget from '../components/BookingWidget.jsx'
import PageHeroBand from '../components/PageHeroBand.jsx'
import { useCatalog } from '../hooks/useCatalog.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { localizedField } from '../lib/localize.js'
import shopHero from '../assets/textures/shop-hero-spices.jpg'

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
  // 'name' has no static fn here — unlike the others, it needs to know
  // the CURRENT language to sort by the right translated name, so it's
  // handled as a special case (like best_match) inside the component
  // below rather than as a fixed comparator.
  name: { label: 'Name: A to Z' },
}

// lang is threaded through here (rather than defaulting to English)
// specifically so a Sinhala/Tamil search actually matches products that
// have been translated — matching only the English name/description
// regardless of the site's current language would mean search silently
// stops working the moment someone switches languages.
function relevance(item, q, lang) {
  if (!q) return 0
  const name = localizedField(item, 'name', lang).toLowerCase()
  if (name.startsWith(q)) return 3
  if (name.includes(q)) return 2
  if (localizedField(item, 'description', lang).toLowerCase().includes(q)) return 1
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
  const { language } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [priceBand, setPriceBand] = useState('all')
  const [sort, setSort] = useState('best_match')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  const isMobile = useIsMobile()
  // On phones, the grid grows as you scroll instead of showing numbered
  // page buttons — this tracks how many items are currently shown.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loadMoreRef = useRef(null)
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
        (item) =>
          localizedField(item, 'name', language).toLowerCase().includes(q) ||
          localizedField(item, 'description', language).toLowerCase().includes(q)
      )
    }

    if (sort === 'best_match') {
      list.sort((a, b) => relevance(b, q, language) - relevance(a, q, language) || b.unitsSold - a.unitsSold)
    } else if (sort === 'name') {
      list.sort((a, b) => localizedField(a, 'name', language).localeCompare(localizedField(b, 'name', language)))
    } else {
      list.sort(SORTS[sort].fn)
    }
    return list
  }, [products, services, type, category, priceBand, sort, inStockOnly, search, language])

  // Any filter/sort change can shrink the result set below the current
  // page — reset to page 1 (or, on mobile, back to the first batch of
  // results) rather than showing a stranded empty page.
  useEffect(() => {
    setPage(1)
    setVisibleCount(PAGE_SIZE)
  }, [type, category, priceBand, sort, inStockOnly, search])

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Mobile infinite scroll: grow the visible list instead of paging.
  // A tiny invisible "sentinel" div sits just below the grid; once it
  // scrolls into view, we reveal the next batch — no click needed, and
  // no separate "Load more" button to design/maintain.
  const mobileItems = visible.slice(0, visibleCount)
  const hasMoreMobile = visibleCount < visible.length

  useEffect(() => {
    if (!isMobile || !hasMoreMobile) return
    const node = loadMoreRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(visible.length, c + PAGE_SIZE))
        }
      },
      { rootMargin: '400px' } // start loading a bit before it's actually on-screen
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [isMobile, hasMoreMobile, visible.length])

  const itemsToShow = isMobile ? mobileItems : pageItems

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
        image={shopHero}
        eyebrow="Shop All"
        title="The full collection."
        subtitle="Every product we make, in one place — new additions to the catalog show up here automatically."
      />

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

              {loading && <p className="text-center text-sm text-[#6a6656]">Loading the catalog…</p>}
              {error && (
                <p className="mx-auto max-w-md text-center text-sm text-[#a35a3a]">
                  Couldn&rsquo;t reach the catalog API ({error}).
                </p>
              )}

              {!loading && !error && visible.length === 0 && (
                <p className="text-center text-sm text-[#6a6656]">Nothing matches those filters.</p>
              )}

              {!loading && !error && visible.length > 0 && (
                <>
                  <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                    {itemsToShow.map((item) =>
                      item.type === 'service' ? (
                        <ServiceCard
                          key={item.id}
                          service={item}
                          large
                          onReserve={item.serviceType === 'bookable' ? () => setBookingService(item) : undefined}
                        />
                      ) : (
                        <ProductCard key={item.id} product={item} large />
                      )
                    )}
                  </div>

                  {/* Phones: an invisible sentinel that loads the next
                      batch of products as it scrolls into view, so the
                      page keeps growing instead of stopping at numbered
                      page buttons. */}
                  {isMobile && (
                    <div ref={loadMoreRef} className="mt-8 flex justify-center">
                      {hasMoreMobile && <p className="text-xs uppercase tracking-wide text-moss">Loading more…</p>}
                    </div>
                  )}

                  {!isMobile && pageCount > 1 && (
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
                          className={`h-10 w-10 rounded-full text-xs transition-colors ${
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
