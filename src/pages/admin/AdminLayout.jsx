import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/branches', label: 'Branches' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/blacklist', label: 'Blacklist' },
  { to: '/admin/fraud', label: 'Fraud Alerts' },
  { to: '/admin/admins', label: 'Admins', superadminOnly: true },
  { to: '/admin/logs', label: 'Logs' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/maintenance', label: 'Maintenance' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Sidebar is an off-canvas drawer below the md breakpoint, permanently
  // visible at md+ (see the `md:translate-x-0 md:static` overrides below).
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const currentLabel = LINKS.find((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)))?.label ?? 'Admin'

  const NavContents = (
    <>
      <div className="mb-8 px-1">
        <h1 className="font-serif text-2xl">Shani&rsquo;z</h1>
        <p className="text-[0.65rem] uppercase tracking-widest text-goldLight">Admin Panel</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {LINKS.filter((l) => !l.superadminOnly || user?.role === 'superadmin').map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setMobileNavOpen(false)}
            className={({ isActive }) =>
              `rounded-sm px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-gold text-forestDeep' : 'text-cream/80 hover:bg-white/5'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gold/20 pt-4 text-xs">
        <p className="text-cream/70">{user?.name}</p>
        <p className="text-goldLight">{user?.role}</p>
        <button onClick={handleLogout} className="mt-2 underline text-cream/70 hover:text-cream">
          Sign out
        </button>
        <NavLink to="/" className="mt-1 block underline text-cream/70 hover:text-cream">
          View storefront
        </NavLink>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-cream md:flex">
      {/* Mobile top bar — hidden at md+ where the sidebar is always visible instead. */}
      <div className="flex items-center justify-between border-b border-gold/25 bg-forestDeep px-4 py-3 text-cream md:hidden">
        <button
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
          className="rounded-sm p-1.5 text-2xl leading-none hover:bg-white/10"
        >
          ☰
        </button>
        <span className="font-serif text-lg">{currentLabel}</span>
        <NavLink to="/" className="text-xs underline text-cream/70">
          Storefront
        </NavLink>
      </div>

      {/* Backdrop, mobile only, shown while the drawer is open. */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-forestDeep/60 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 max-w-[80vw] transform flex-col border-r border-gold/25 bg-forestDeep px-5 py-6 text-cream transition-transform duration-200 md:static md:z-auto md:w-60 md:max-w-none md:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-3 text-xl text-cream/70 md:hidden"
        >
          ✕
        </button>
        {NavContents}
      </aside>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {/* Sits above every admin page's own heading — a quick way back
            to see the site as a customer would, without digging into
            the sidebar. */}
        <div className="mb-4 flex justify-end">
          <NavLink
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-forestDeep/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-forestDeep hover:bg-forestDeep hover:text-cream"
          >
            View Store ↗
          </NavLink>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
