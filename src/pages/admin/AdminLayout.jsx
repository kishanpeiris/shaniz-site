import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

// Grouped into collapsible sections (rather than one long flat list) so
// the sidebar stays scannable as more admin pages get added. Each group
// has a short id used only to remember which sections are expanded.
const GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    links: [{ to: '/admin', label: 'Dashboard', end: true }],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    links: [
      { to: '/admin/products', label: 'Products' },
      { to: '/admin/services', label: 'Services' },
      { to: '/admin/branches', label: 'Branches' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    links: [
      { to: '/admin/bookings', label: 'Bookings' },
      { to: '/admin/orders', label: 'Orders' },
      { to: '/admin/delivery', label: 'Delivery' },
    ],
  },
  {
    id: 'people',
    label: 'People',
    links: [
      { to: '/admin/customers', label: 'Customers' },
      { to: '/admin/blacklist', label: 'Blacklist' },
      { to: '/admin/admins', label: 'Admins', superadminOnly: true },
    ],
  },
  {
    id: 'risk',
    label: 'Risk & Support',
    links: [
      { to: '/admin/fraud', label: 'Fraud Alerts' },
      { to: '/admin/refunds', label: 'Refund Requests' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    links: [
      { to: '/admin/logs', label: 'Logs' },
      { to: '/admin/settings', label: 'Settings' },
      { to: '/admin/maintenance', label: 'Maintenance' },
    ],
  },
]

const ALL_LINKS = GROUPS.flatMap((g) => g.links)

function groupIdForPath(pathname) {
  const group = GROUPS.find((g) =>
    g.links.some((l) => (l.end ? pathname === l.to : pathname.startsWith(l.to)))
  )
  return group?.id
}

// One link, two color variants: 'bar' sits on the dark mobile top bar
// (needs light text/border), 'panel' sits on the cream admin content
// area (needs dark text/border). No target="_blank" — this stays a
// normal in-app navigation back to the storefront, not a new tab.
function ViewStoreLink({ variant = 'panel' }) {
  const colors =
    variant === 'bar'
      ? 'border-cream/50 px-3 py-1 text-[11px] text-cream hover:bg-cream hover:text-forestDeep'
      : 'border-forestDeep/30 px-4 py-1.5 text-xs text-forestDeep hover:bg-forestDeep hover:text-cream'
  return (
    <NavLink
      to="/"
      className={`rounded-full border font-semibold uppercase tracking-wide transition-colors ${colors}`}
    >
      View Store
    </NavLink>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
      aria-hidden="true"
    >
      <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Sidebar is an off-canvas drawer below the md breakpoint, permanently
  // visible at md+ (see the `md:translate-x-0 md:static` overrides below).
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Which sidebar sections are expanded. Starts with just the section
  // containing the current page open, so a fresh admin session isn't
  // one long scroll of every link at once.
  const [openGroups, setOpenGroups] = useState(() => {
    const active = groupIdForPath(location.pathname)
    return new Set(active ? [active] : [])
  })

  // If navigation lands on a page whose section isn't already expanded
  // (e.g. a link elsewhere in the app deep-links straight into
  // Delivery), auto-expand that section too — without collapsing
  // anything the admin already had open themselves.
  useEffect(() => {
    const active = groupIdForPath(location.pathname)
    if (active) setOpenGroups((prev) => (prev.has(active) ? prev : new Set(prev).add(active)))
  }, [location.pathname])

  const toggleGroup = (id) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const currentLabel =
    ALL_LINKS.find((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)))?.label ?? 'Admin'

  const NavContents = (
    <>
      <div className="mb-8 px-1">
        <h1 className="font-serif text-2xl">Shani&rsquo;z</h1>
        <p className="text-[0.65rem] uppercase tracking-widest text-goldLight">Admin Panel</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {GROUPS.map((group) => {
          const visibleLinks = group.links.filter((l) => !l.superadminOnly || user?.role === 'superadmin')
          if (visibleLinks.length === 0) return null
          // A group with exactly one link (Overview → Dashboard) is just
          // noise to collapse/expand — render it as a single plain link.
          if (visibleLinks.length === 1) {
            const link = visibleLinks[0]
            return (
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
            )
          }
          const isOpen = openGroups.has(group.id)
          return (
            <div key={group.id}>
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-goldLight/90 hover:bg-white/5"
              >
                {group.label}
                <ChevronIcon open={isOpen} />
              </button>
              {isOpen && (
                <div className="mb-1 ml-1 flex flex-col gap-0.5 border-l border-gold/20 pl-3">
                  {visibleLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) =>
                        `rounded-sm px-3 py-1.5 text-sm transition-colors ${
                          isActive ? 'bg-gold text-forestDeep' : 'text-cream/80 hover:bg-white/5'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div className="border-t border-gold/20 pt-4 text-xs">
        <p className="text-cream/70">{user?.name}</p>
        <p className="text-goldLight">{user?.role}</p>
        <button onClick={handleLogout} className="mt-2 underline text-cream/70 hover:text-cream">
          Sign out
        </button>
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
        <ViewStoreLink variant="bar" />
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
        <div className="mb-4 hidden justify-end md:flex">
          <ViewStoreLink variant="panel" />
        </div>
        <Outlet />
      </main>
    </div>
  )
}
