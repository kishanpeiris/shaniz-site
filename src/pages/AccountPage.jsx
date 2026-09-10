import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPost, apiPut, apiDelete, API_URL } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { LANGUAGES } from '../i18n/translations.js'
import { formatLKR as fmt } from '../lib/currency.js'
import { formatCalendarDate } from '../lib/date.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'


function Section({ title, children }) {
  return (
    <section className="mb-8 rounded-sm border border-gold/30 bg-ivory p-6">
      <h2 className="mb-4 text-xl">{title}</h2>
      {children}
    </section>
  )
}

// Shown only to logged-in customers whose email isn't verified yet. Lets
// them fire off a fresh verification email without leaving the page —
// useful since the original one (sent at registration) may have expired
// (24 hours) or landed in spam.
function VerificationBanner() {
  const { user } = useAuth()
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [error, setError] = useState('')

  if (!user || user.emailVerified) return null

  const resend = async () => {
    setStatus('sending')
    setError('')
    try {
      await apiPost('/api/auth/resend-verification')
      setStatus('sent')
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[#c9a35c]/50 bg-[#fbf3df] px-5 py-3 text-sm">
      <div>
        <p className="font-medium text-[#8a6d3b]">Please verify your email address</p>
        {status === 'sent' ? (
          <p className="text-xs text-[#8a6d3b]">
            Verification email sent to {user.email} — check your inbox (and spam folder).
          </p>
        ) : (
          <p className="text-xs text-[#8a6d3b]">
            We sent a link to {user.email} when you registered. Didn&rsquo;t get it, or has it expired?
          </p>
        )}
        {error && <p className="text-xs text-[#a35a3a]">{error}</p>}
      </div>
      <button
        onClick={resend}
        disabled={status === 'sending'}
        className="whitespace-nowrap rounded-full border border-[#c9a35c] px-4 py-1.5 text-xs uppercase tracking-wide text-[#8a6d3b] disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Resend email'}
      </button>
    </div>
  )
}

function ProfileSection() {
  const { user, refreshUser } = useAuth()
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [mobile, setMobile] = useState(user?.mobile || '')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const save = async (e) => {
    e.preventDefault()
    setStatus('saving')
    setError('')
    try {
      await apiPut('/api/account/profile', {
        firstName,
        lastName: lastName.trim() || undefined,
        mobile: mobile.trim() || undefined,
      })
      await refreshUser()
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 1500)
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  return (
    <Section title="Profile">
      <form onSubmit={save} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">First name</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm sm:w-auto"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">Last name</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm sm:w-auto"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">Mobile</label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm sm:w-auto"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">Email</label>
          <input
            value={user?.email || ''}
            disabled
            className="w-full rounded-sm border border-gold/30 bg-cream/60 px-3 py-2 text-sm text-[#8a8672] sm:w-auto"
          />
        </div>
        <button className="w-full rounded-full bg-forestDeep px-5 py-2.5 text-xs uppercase tracking-wide text-cream sm:w-auto sm:py-2">
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Save'}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-[#a35a3a]">{error}</p>}
    </Section>
  )
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const save = async (e) => {
    e.preventDefault()
    setStatus('saving')
    setError('')
    try {
      await apiPut('/api/account/password', { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 1500)
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  return (
    <Section title="Password">
      <form onSubmit={save} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">Current password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm sm:w-auto"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">New password</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm sm:w-auto"
          />
        </div>
        <button className="w-full rounded-full bg-forestDeep px-5 py-2.5 text-xs uppercase tracking-wide text-cream sm:w-auto sm:py-2">
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Change password'}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-[#a35a3a]">{error}</p>}
    </Section>
  )
}

function AddressesSection() {
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState({ line1: '', city: '', postal_code: '', phone: '' })
  const [error, setError] = useState('')

  const load = () => apiGet('/api/account/addresses').then((r) => setAddresses(r.addresses))
  useEffect(() => {
    load()
  }, [])

  const add = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await apiPost('/api/account/addresses', form)
      setForm({ line1: '', city: '', postal_code: '', phone: '' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (id) => {
    await apiDelete(`/api/account/addresses/${id}`)
    load()
  }

  return (
    <Section title="Saved addresses">
      {addresses.length === 0 && <p className="mb-4 text-sm text-[#8a8672]">No saved addresses yet.</p>}
      <ul className="mb-4 space-y-2">
        {addresses.map((a) => (
          <li key={a.id} className="flex flex-col gap-2 rounded-sm border border-gold/20 bg-cream px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>
              {a.line1}, {a.city} {a.postal_code} {a.phone ? `· ${a.phone}` : ''}
            </span>
            <button onClick={() => remove(a.id)} className="text-xs text-[#a35a3a] underline">
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <input required placeholder="Address line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="col-span-2 rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm" />
        <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm sm:w-auto" />
        <input placeholder="Postal code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm sm:w-auto" />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm sm:w-auto" />
        <button className="rounded-full bg-forestDeep px-4 py-2 text-xs uppercase tracking-wide text-cream">Add address</button>
      </form>
      {error && <p className="mt-2 text-sm text-[#a35a3a]">{error}</p>}
    </Section>
  )
}

function PaymentMethodsSection() {
  const [methods, setMethods] = useState([])

  const load = () => apiGet('/api/account/payment-methods').then((r) => setMethods(r.payment_methods))
  useEffect(() => {
    load()
  }, [])

  const remove = async (id) => {
    await apiDelete(`/api/account/payment-methods/${id}`)
    load()
  }

  return (
    <Section title="Saved payment methods">
      {methods.length === 0 ? (
        <p className="text-sm text-[#8a8672]">
          No saved cards yet. A card is saved automatically the next time you check out with a
          gateway that supports "remember this card."
        </p>
      ) : (
        <ul className="space-y-2">
          {methods.map((m) => (
            <li key={m.id} className="flex flex-col gap-2 rounded-sm border border-gold/20 bg-cream px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="capitalize">
                {m.gateway.replace('_', ' ')} •••• {m.last4} {m.expiry ? `(exp ${m.expiry})` : ''}
              </span>
              <button onClick={() => remove(m.id)} className="text-xs text-[#a35a3a] underline">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

function OrderHistorySection() {
  const [orders, setOrders] = useState([])
  useEffect(() => {
    apiGet('/api/orders/mine').then((r) => setOrders(r.orders))
  }, [])

  return (
    <Section title="Order history">
      {orders.length === 0 ? (
        <p className="text-sm text-[#8a8672]">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-sm border border-gold/20 bg-cream p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-forestDeep">Order {o.id.slice(0, 8)}</span>
                <span className="capitalize text-moss">{o.status}</span>
              </div>
              {o.status !== 'pending' && (
                <a
                  href={`${API_URL}/api/orders/${o.id}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-semibold uppercase tracking-wide text-gold underline"
                >
                  Download Invoice
                </a>
              )}
              <p className="mt-1 text-xs text-[#8a8672]">
                {new Date(o.created_at).toLocaleDateString()} · {fmt(o.total_lkr)} · via {o.gateway_used}
              </p>
              <ul className="mt-2 text-xs text-[#5c5949]">
                {o.items.map((i, idx) => (
                  <li key={idx}>
                    {i.name} × {i.qty} — {fmt(i.unit_price_lkr * i.qty)}
                    {i.is_preorder && (
                      <span className="ml-1 text-[#8a6d3b]">
                        (pre-order — est. arrival {formatCalendarDate(i.preorder_eta_date)})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

function BookingsSection() {
  const [bookings, setBookings] = useState([])
  useEffect(() => {
    apiGet('/api/account/bookings').then((r) => setBookings(r.bookings))
  }, [])

  return (
    <Section title="Your bookings">
      {bookings.length === 0 ? (
        <p className="text-sm text-[#8a8672]">No bookings yet.</p>
      ) : (
        <ul className="space-y-2">
          {bookings.map((b) => (
            <li key={b.id} className="flex flex-col gap-2 rounded-sm border border-gold/20 bg-cream px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span>
                {b.service_name} — {formatCalendarDate(b.booked_date)} at {b.booked_time.slice(0, 5)}
              </span>
              <span className="capitalize text-moss">{b.status}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

function LanguageSection() {
  const { language, setLanguage, t } = useLanguage()
  const [saved, setSaved] = useState(false)

  const handleChange = (lang) => {
    setLanguage(lang)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <Section title={t('account_language')}>
      <div className="flex flex-wrap gap-2">
        {Object.entries(LANGUAGES).map(([code, { native }]) => (
          <button
            key={code}
            onClick={() => handleChange(code)}
            className={`rounded-full border px-4 py-2 text-sm ${
              language === code
                ? 'border-forestDeep bg-forestDeep text-cream'
                : 'border-gold/30 text-forestDeep hover:bg-gold/10'
            }`}
          >
            {native}
          </button>
        ))}
      </div>
      {saved && <p className="mt-2 text-xs text-moss">{t('account_language_saved')}</p>}
    </Section>
  )
}

export default function AccountPage() {
  const { user, logout } = useAuth()

  return (
    <>
      <Nav />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl">My Account</h1>
            <p className="text-sm text-[#8a8672]">Signed in as {user?.email}</p>
          </div>
          <button onClick={logout} className="self-start text-xs uppercase tracking-wide text-[#a35a3a] underline sm:self-auto">
            Sign out
          </button>
        </div>

        <VerificationBanner />
        <ProfileSection />
        <LanguageSection />
        <PasswordSection />
        <AddressesSection />
        <PaymentMethodsSection />
        <OrderHistorySection />
        <BookingsSection />

        <p className="text-center text-xs text-[#8a8672]">
          <Link to="/" className="underline">
            ← Back to the storefront
          </Link>
        </p>
      </div>
      <Footer />
    </>
  )
}
