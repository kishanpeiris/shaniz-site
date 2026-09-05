import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/admins', label: 'Admins', superadminOnly: true },
  { to: '/admin/logs', label: 'Logs' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/maintenance', label: 'Maintenance' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="flex w-60 flex-col border-r border-gold/25 bg-forestDeep px-5 py-6 text-cream">
        <div className="mb-8 px-1">
          <h1 className="font-serif text-2xl">Shani&rsquo;z</h1>
          <p className="text-[0.65rem] uppercase tracking-widest text-goldLight">Admin Panel</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {LINKS.filter((l) => !l.superadminOnly || user?.role === 'superadmin').map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
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
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
