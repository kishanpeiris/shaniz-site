import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useIsMobile } from '../hooks/useIsMobile.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import BookingWidget from '../components/BookingWidget.jsx'
import PageHeroBand from '../components/PageHeroBand.jsx'
import BackToTopButton from '../components/BackToTopButton.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { useCatalog } from '../hooks/useCatalog.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { localizedField } from '../lib/localize.js'
import { translateLabel } from '../i18n/translations.js'
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

const PAGE_SIZE_OPTIONS = [20, 100, 'all']

export default function ShopPage() {
  const { loading, error, products, services } = useCatalog()
  const { language, t } = useLanguage()
  const L = (text) => translateLabel(text, language)
  const [searchParams, setSearchParams] = useSearchParams()
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [priceBand, setPriceBand] = useState('all')
  const [sort, setSort] = useState('best_match')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  // How many results per page — 20 / 100 / "all" — the same control and
  // the same numbered pagination now works the same way on phones as on
  // desktop (previously phones got an infinite-scroll list instead;
  // that's gone in favour of one consistent, predictable pattern).
  const [pageSize, setPageSize] = useState(20)
  const isMobile = useIsMobile()
  const [bookingService, setBookingService] = useState(null)
  // Seeded from ?q= (e.g. arriving from the nav search box) and kept in
  // sync with it, so the URL stays shareable/bookmarkable.
  const [search, setSearch] = useState(searchParams.get('q') || '')
  // Where "back to top" (page changes, and the floating button below)
  // scrolls to — the top of the filters/search/results row, not all the
  // way up past the big hero banner.
  const resultsTopRef = useRef(null)
  const scrollToResultsTop = () => resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  useDocumentMeta({
    title: search ? `Search: ${search}` : 'Shop',
    description:
      'The full Shani\'z collection — small-batch herbal hair oils, masks, and spa services made in Sri Lanka.',
    path: '/shop',
  })

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
  }, [type, category, priceBand, sort, inStockOnly, search, pageSize])

  const pageCount = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(visible.length / pageSize))
  const pageItems = pageSize === 'all' ? visible : visible.slice((page - 1) * pageSize, page * pageSize)
  const itemsToShow = pageItems

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
          {t('shop_product_type')}
        </label>
        <select
          value={type}
          aria-label={t('shop_product_type')}
          onChange={(e) => setType(e.target.value)}
          className={selectClass}
        >
          {Object.entries(TYPES).map(([id, label]) => (
            <option key={id} value={id}>
              {L(label)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-moss">
          {t('shop_category')}
        </label>
        <select
          value={category}
          aria-label={t('shop_category')}
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
          {t('shop_price_range')}
        </label>
        <select value={priceBand} onChange={(e) => setPriceBand(e.target.value)} aria-label={t('shop_price_range')} className={selectClass}>
          {Object.entries(PRICE_BANDS).map(([id, b]) => (
            <option key={id} value={id}>
              {L(b.label)}
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
        {t('shop_in_stock_only')}
      </label>

      {filtersActive && (
        <button
          onClick={clearFilters}
          className="self-start text-sm uppercase tracking-wide text-moss underline decoration-gold/50 hover:text-forestDeep"
        >
          {t('shop_clear_filters')}
        </button>
      )}
    </div>
  )

  return (
    <>
      <Nav />
      <PageHeroBand
        image={shopHero}
        eyebrow={t('shop_eyebrow')}
        title={t('shop_full_collection')}
        subtitle={t('shop_subtitle')}
      />

      <section className="bg-ivory pb-16 pt-6 sm:pt-10">
        <div className="mx-auto max-w-6xl px-7">
          <div className="flex flex-col gap-6 md:flex-row md:gap-10">
            {/* Filters — a fixed sidebar on desktop, a collapsible
                <details> panel on mobile so it doesn't push the results
                far down the page on small screens. */}
            <aside className="w-full shrink-0 md:w-56">
              <div className="hidden rounded-sm border border-gold/25 bg-cream/60 p-5 md:block">
                <h2 className="mb-4 font-serif text-lg text-forestDeep">{t('shop_filters')}</h2>
                {FilterFields}
              </div>
              <details className="rounded-sm border border-gold/25 bg-cream/60 p-5 md:hidden">
                <summary className="cursor-pointer font-serif text-lg text-forestDeep">{t('shop_filters')}</summary>
                <div className="mt-4">{FilterFields}</div>
              </details>
            </aside>

            <div className="min-w-0 flex-1">
              <div ref={resultsTopRef} className="mb-5 scroll-mt-24">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('nav_search_placeholder')}
                  className="w-full rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm text-forestDeep placeholder:text-moss/70 focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gold/25 pb-4">
                <p className="text-xs uppercase tracking-wide text-moss">
                  {visible.length} {visible.length === 1 ? 'result' : 'results'}
                  {search && <> for &ldquo;{search}&rdquo;</>}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {/* "Show" isn't run through the translation system yet —
                      same known gap as a few other newer controls (see
                      SESSION-SUMMARY.md). */}
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    aria-label="Results per page"
                    className="rounded-sm border border-gold/30 bg-cream px-3 py-1.5 text-xs uppercase tracking-wide text-forestDeep"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        Show: {size === 'all' ? 'All' : size}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    aria-label={t('shop_sort')}
                    className="rounded-sm border border-gold/30 bg-cream px-3 py-1.5 text-xs uppercase tracking-wide text-forestDeep"
                  >
                    {Object.entries(SORTS).map(([id, s]) => (
                      <option key={id} value={id}>
                        {t('shop_sort')}: {L(s.label)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading && <p className="text-center text-sm text-[#6a6656]">{t('shop_loading_catalog')}</p>}
              {error && (
                <p className="mx-auto max-w-md text-center text-sm text-[#a35a3a]">
                  Couldn&rsquo;t reach the catalog API ({error}).
                </p>
              )}

              {!loading && !error && visible.length === 0 && (
                <p className="text-center text-sm text-[#6a6656]">{t('shop_no_matches')}</p>
              )}

              {!loading && !error && visible.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-3">
                    {itemsToShow.map((item) =>
                      item.type === 'service' ? (
                        <ServiceCard
                          key={item.id}
                          service={item}
                          large={!isMobile}
                          onReserve={item.serviceType === 'bookable' ? () => setBookingService(item) : undefined}
                        />
                      ) : (
                        <ProductCard key={item.id} product={item} large={!isMobile} />
                      )
                    )}
                  </div>

                  {pageCount > 1 && (
                    <nav
                      id="shop-pagination"
                      className="mt-12 flex flex-wrap items-center justify-center gap-2"
                      aria-label={t('shop_pagination_label')}
                    >
                      <button
                        onClick={() => {
                          setPage((p) => Math.max(1, p - 1))
                          scrollToResultsTop()
                        }}
                        disabled={page === 1}
                        className="rounded-full border border-gold/40 px-3 py-1.5 text-xs uppercase tracking-wide text-forestDeep transition-colors hover:border-forestDeep disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        {t('common_prev')}
                      </button>
                      {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          onClick={() => {
                            setPage(n)
                            scrollToResultsTop()
                          }}
                          aria-current={page === n ? 'page' : undefined}
                          className={`h-10 w-10 rounded-full text-xs transition-colors ${
                            page === n ? 'bg-forestDeep text-cream' : 'text-forestDeep hover:bg-gold/20'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setPage((p) => Math.min(pageCount, p + 1))
                          scrollToResultsTop()
                        }}
                        disabled={page === pageCount}
                        className="rounded-full border border-gold/40 px-3 py-1.5 text-xs uppercase tracking-wide text-forestDeep transition-colors hover:border-forestDeep disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        {t('common_next')}
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

      <BackToTopButton onClick={scrollToResultsTop} />

      <BookingWidget
        service={bookingService}
        open={Boolean(bookingService)}
        onClose={() => setBookingService(null)}
      />
    </>
  )
}

