import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import BrandLockup from './BrandLockup.jsx'
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
  const { language, setLanguage, t } = useLanguage()
  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      aria-label={t('aria_language')}
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


// The signed-in "user" button: a round badge with the person's initial.
// Clicking it opens a small menu — Profile, (Admin Panel for staff), and
// Sign out. Closes on outside click or the Escape key.
function UserMenu({ user, isStaff }) {
  const { logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase()
  const itemClass = 'block w-full px-4 py-2.5 text-left text-sm text-forestDeep hover:bg-gold/15'

  const signOut = async () => {
    setOpen(false)
    await logout()
    // Signed-in-only pages would bounce to the login screen; go home instead.
    if (location.pathname.startsWith('/account') || location.pathname.startsWith('/admin')) {
      navigate('/', { replace: true })
    }
  }

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={user.name || user.email}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-forestDeep text-sm font-semibold text-cream ring-1 ring-gold/40 hover:ring-gold"
      >
        {initial}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-sm border border-gold/30 bg-ivory shadow-brand"
        >
          <div className="border-b border-gold/20 px-4 py-3">
            <p className="truncate text-sm font-medium text-forestDeep">{user.name}</p>
            <p className="truncate text-xs text-[#6a6656]">{user.email}</p>
          </div>
          <Link to="/account" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            {t('acct_profile')}
          </Link>
          {isStaff && (
            <Link to="/admin" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
              {t('nav_admin_panel')}
            </Link>
          )}
          <button type="button" role="menuitem" onClick={signOut} className={`${itemClass} border-t border-gold/20 text-[#a35a3a]`}>
            {t('acct_sign_out')}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Nav() {
  const { totalQty } = useCart()
  const { user, logout } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')

  // The full menu is only shown when it genuinely fits. Rather than guess
  // with fixed screen sizes (Sinhala and Tamil words are much wider than
  // English, and the width depends on the fonts on each person's computer),
  // the header measures itself: a hidden copy of the menu tells us how wide
  // it needs to be, and if the row can't hold it we use the compact menu.
  const rowRef = useRef(null)
  const logoRef = useRef(null)
  const measureRef = useRef(null)
  const rightRef = useRef(null)
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024)

  useLayoutEffect(() => {
    const check = () => {
      const row = rowRef.current
      if (!row || !measureRef.current || !logoRef.current || !rightRef.current) return
      const cs = getComputedStyle(row)
      const avail = row.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const gap = parseFloat(cs.columnGap) || 16
      const needed =
        logoRef.current.getBoundingClientRect().width +
        measureRef.current.getBoundingClientRect().width +
        rightRef.current.getBoundingClientRect().width +
        gap * 2 +
        16 // a little breathing room
      setCollapsed(needed > avail)
    }
    check()
    const ro = new ResizeObserver(check)
    ;[rowRef, logoRef, rightRef].forEach((r) => r.current && ro.observe(r.current))
    window.addEventListener('resize', check)
    document.fonts?.ready?.then(check)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', check)
    }
  }, [language, user, totalQty])

  const isStaff = ['admin', 'superadmin'].includes(user?.role)

  const submitSearch = (e) => {
    e.preventDefault()
    const q = search.trim()
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
    setSearchOpen(false)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gold/30 bg-cream/90 backdrop-blur">
      <div ref={rowRef} className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-7">
        <Link to="/" ref={logoRef} className="shrink-0">
          <BrandLockup size="nav" taglineClassName="hidden 2xl:block" />
        </Link>

        {/* Invisible copy of the menu, used only to measure how wide it is. */}
        <nav ref={measureRef} aria-hidden="true" className="pointer-events-none invisible fixed -left-[9999px] top-0 -z-10 flex items-center gap-5 whitespace-nowrap xl:gap-8">
          {LINK_KEYS.map(([key, href]) => (
            <span key={href} className="text-sm leading-normal">{t(key)}</span>
          ))}
        </nav>

        <nav className={`items-center gap-5 xl:gap-8 ${collapsed ? 'hidden' : 'flex'}`}>
          {LINK_KEYS.map(([key, href]) => (
            <Link key={href} to={href} className="group relative whitespace-nowrap text-sm leading-normal text-forestDeep">
              {t(key)}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div ref={rightRef} className="flex shrink-0 items-center gap-2.5 sm:gap-4">
          <LanguageSwitcher className="hidden sm:inline-block" />
          {/* Desktop: an expanding search field so it doesn't permanently
              crowd the nav row. Click the icon to reveal an input. */}
          {/* The search icon keeps a fixed width; when opened, the field FLOATS
              over the menu instead of pushing the header wider (a wider header
              would make the menu collapse, which would close the search). */}
          <div className={`relative h-11 w-11 shrink-0 items-center justify-center ${collapsed ? 'hidden' : 'flex'}`}>
            {searchOpen ? (
              <form
                onSubmit={submitSearch}
                role="search"
                className="absolute right-0 top-1/2 z-30 flex -translate-y-1/2 items-center rounded-full bg-ivory shadow-brand"
              >
                <input
                  autoFocus
                  type="search"
                  aria-label={t('aria_search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={() => !search && setSearchOpen(false)}
                  onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                  placeholder={t('nav_search_placeholder')}
                  className="w-56 rounded-full border border-gold/40 bg-ivory px-4 py-2 text-sm text-forestDeep placeholder:text-moss/70 focus:outline-none focus:ring-1 focus:ring-gold xl:w-72"
                />
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label={t('aria_search')}
                className="flex h-11 w-11 items-center justify-center rounded-full text-forestDeep hover:bg-gold/15"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {user ? (
            <UserMenu user={user} isStaff={isStaff} />
          ) : (
            <Link
              to="/login"
              className="hidden whitespace-nowrap text-xs uppercase leading-normal tracking-wide text-moss underline decoration-gold/50 sm:inline"
            >
              {t('nav_sign_in')}
            </Link>
          )}
          <Link
            to="/basket"
            className="flex items-center gap-2 whitespace-nowrap rounded-full bg-forestDeep px-3.5 py-2 text-xs uppercase leading-normal tracking-wide text-cream sm:px-4"
          >
            <span className="hidden sm:inline">{t('nav_basket')}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.7rem] font-semibold text-forestDeep">
              {totalQty}
            </span>
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t('aria_menu')}
            className={`flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-sm border border-gold/30 ${collapsed ? '' : 'hidden'}`}
          >
            <span className="h-px w-4 bg-forestDeep" />
            <span className="h-px w-4 bg-forestDeep" />
            <span className="h-px w-4 bg-forestDeep" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className={`flex flex-col border-t border-gold/20 bg-ivory px-5 py-4 ${collapsed ? '' : 'hidden'}`}>
          <form onSubmit={submitSearch} className="mb-3 flex items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('nav_search_placeholder')}
              className="w-full rounded-full border border-gold/30 bg-cream px-4 py-2 text-sm text-forestDeep placeholder:text-moss/70 focus:outline-none focus:ring-1 focus:ring-gold"
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
          {user ? (
            <>
              <Link
                to="/account"
                onClick={() => setMenuOpen(false)}
                className="pt-3 text-xs uppercase tracking-wide text-moss underline decoration-gold/50"
              >
                {t('acct_profile')}
              </Link>
              {isStaff && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="pt-3 text-xs uppercase tracking-wide text-moss underline decoration-gold/50"
                >
                  {t('nav_admin_panel')}
                </Link>
              )}
              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false)
                  await logout()
                  navigate('/', { replace: true })
                }}
                className="self-start pt-3 text-xs uppercase tracking-wide text-[#a35a3a] underline"
              >
                {t('acct_sign_out')}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="pt-3 text-xs uppercase tracking-wide text-moss underline decoration-gold/50"
            >
              {t('nav_sign_in')}
            </Link>
          )}
          <div className="mt-3 flex items-center gap-2 border-t border-gold/10 pt-3">
            <span className="text-xs uppercase tracking-wide text-moss">{t('account_language')}</span>
            <LanguageSwitcher />
          </div>
        </nav>
      )}
    </header>
  )
}
