import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.jpg'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { LANGUAGES } from '../i18n/translations.js'

const LINK_KEYS = [
  ['nav_home', '/'],
  ['nav_shop', '/shop'],
  ['nav_our_story', '/#about'],
  ['nav_the_ritual', '/#products'],
  ['nav_watch', '/#ritual-video'],
  ['nav_visit_us', '/#visit'],
]

// A small dropdown — flag-free, just the language's own name in its own
// script (easier to recognize than a flag would be, since Sinhala and
// Tamil don't map to a single country flag anyway) — English, Sinhala,
// or Tamil. Persists to the account if logged in, otherwise just this
// browser (see LanguageContext.jsx).
function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage } = useLanguage()
  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      aria-label="Language"
      className={`rounded-full border border-gold/30 bg-transparent px-2 py-1 text-xs text-forestDeep ${className}`}
    >
      {Object.entries(LANGUAGES).map(([code, { native }]) => (
        <option key={code} value={code}>
          {native}
        </option>
      ))}
    </select>
  )
}

export default function Nav() {
  const { totalQty } = useCart()
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')

  const accountHref = user ? (['admin', 'superadmin'].includes(user.role) ? '/admin' : '/account') : '/login'
  const accountLabel = user
    ? ['admin', 'superadmin'].includes(user.role)
      ? t('nav_admin_panel')
      : t('nav_my_account')
    : t('nav_sign_in')

  const submitSearch = (e) => {
    e.preventDefault()
    const q = search.trim()
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
    setSearchOpen(false)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gold/30 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-7">
        <Link to="/" className="flex items-center gap-3 sm:gap-3.5">
          <img
            src={logo}
            alt="Shani'z logo"
            className="h-12 w-12 rounded-full border border-gold/40 bg-white object-cover p-0.5 sm:h-16 sm:w-16"
          />
          <span className="font-serif text-xl font-semibold leading-none text-forestDeep sm:text-3xl">
            Shani'z
            <small className="mt-1 hidden font-sans text-[0.62rem] font-normal tracking-[0.16em] text-moss sm:block">
              HERBAL HAIR &amp; SKIN CARE
            </small>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINK_KEYS.map(([key, href]) => (
            <Link key={href} to={href} className="group relative text-sm text-forestDeep">
              {t(key)}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-4">
          <LanguageSwitcher className="hidden sm:inline-block" />
          {/* Desktop: an expanding search field so it doesn't permanently
              crowd the nav row. Click the icon to reveal an input. */}
          <div className="relative hidden items-center md:flex">
            {searchOpen ? (
              <form onSubmit={submitSearch} className="flex items-center">
                <input
                  autoFocus
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={() => !search && setSearchOpen(false)}
                  placeholder={t('nav_search_placeholder')}
                  className="w-48 rounded-full border border-gold/30 bg-ivory px-3.5 py-1.5 text-xs text-forestDeep placeholder:text-moss/70 focus:w-56 focus:outline-none"
                />
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="flex h-8 w-8 items-center justify-center rounded-full text-forestDeep hover:bg-gold/15"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          <Link
            to={accountHref}
            className="hidden text-xs uppercase tracking-wide text-moss underline decoration-gold/50 sm:inline"
          >
            {accountLabel}
          </Link>
          <Link
            to="/basket"
            className="flex items-center gap-2 rounded-full bg-forestDeep px-3.5 py-2 text-xs uppercase tracking-wide text-cream sm:px-4"
          >
            <span className="hidden sm:inline">{t('nav_basket')}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.7rem] font-semibold text-forestDeep">
              {totalQty}
            </span>
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-sm border border-gold/30 md:hidden"
          >
            <span className="h-px w-4 bg-forestDeep" />
            <span className="h-px w-4 bg-forestDeep" />
            <span className="h-px w-4 bg-forestDeep" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col border-t border-gold/20 bg-ivory px-5 py-4 md:hidden">
          <form onSubmit={submitSearch} className="mb-3 flex items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('nav_search_placeholder')}
              className="w-full rounded-full border border-gold/30 bg-cream px-4 py-2 text-sm text-forestDeep placeholder:text-moss/70 focus:outline-none"
            />
          </form>
          {LINK_KEYS.map(([key, href]) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-gold/10 py-3 text-sm text-forestDeep last:border-0"
            >
              {t(key)}
            </Link>
          ))}
          <Link
            to={accountHref}
            onClick={() => setMenuOpen(false)}
            className="pt-3 text-xs uppercase tracking-wide text-moss underline decoration-gold/50"
          >
            {accountLabel}
          </Link>
          <div className="mt-3 flex items-center gap-2 border-t border-gold/10 pt-3">
            <span className="text-xs uppercase tracking-wide text-moss">{t('account_language')}</span>
            <LanguageSwitcher />
          </div>
        </nav>
      )}
    </header>
  )
}
