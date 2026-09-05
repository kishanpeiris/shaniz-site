import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.jpg'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const LINKS = [
  ['Home', '/'],
  ['Shop', '/shop'],
  ['Our Story', '/#about'],
  ['The Ritual', '/#products'],
  ['Watch', '/#ritual-video'],
  ['Visit Us', '/#visit'],
]

export default function Nav() {
  const { totalQty } = useCart()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const accountHref = user ? (['admin', 'superadmin'].includes(user.role) ? '/admin' : '/account') : '/login'
  const accountLabel = user ? (['admin', 'superadmin'].includes(user.role) ? 'Admin Panel' : 'My Account') : 'Sign In'

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
          {LINKS.map(([label, href]) => (
            <Link key={href} to={href} className="group relative text-sm text-forestDeep">
              {label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-4">
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
            <span className="hidden sm:inline">Basket</span>
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
          {LINKS.map(([label, href]) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-gold/10 py-3 text-sm text-forestDeep last:border-0"
            >
              {label}
            </Link>
          ))}
          <Link
            to={accountHref}
            onClick={() => setMenuOpen(false)}
            className="pt-3 text-xs uppercase tracking-wide text-moss underline decoration-gold/50"
          >
            {accountLabel}
          </Link>
        </nav>
      )}
    </header>
  )
}
