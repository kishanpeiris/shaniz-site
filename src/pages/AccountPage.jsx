import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useConsent } from '../context/ConsentContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { LANGUAGES } from '../i18n/translations.js'
import { formatLKR as fmt } from '../lib/currency.js'
import { formatCalendarDate } from '../lib/date.js'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import AddressFields from '../components/AddressFields.jsx'
import { useServiceProvider } from '../hooks/useServiceProvider.js'
import { providerBranchLabel } from '../lib/serviceProvider.js'


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
  const { t } = useLanguage()
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
        <p className="font-medium text-[#8a6d3b]">{t('acct_verify_email')}</p>
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
  const { t } = useLanguage()
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
    <Section title={t('acct_profile')}>
      <form onSubmit={save} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">{t('common_first_name')}</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm sm:w-auto"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">{t('common_last_name')}</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={t('common_optional')}
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm sm:w-auto"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">{t('common_mobile')}</label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder={t('common_optional')}
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm sm:w-auto"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">{t('common_email')}</label>
          <input
            value={user?.email || ''}
            disabled
            className="w-full rounded-sm border border-gold/30 bg-cream/60 px-3 py-2 text-sm text-[#6a6656] sm:w-auto"
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
  const { t } = useLanguage()
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
    <Section title={t('common_password')}>
      <form onSubmit={save} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">{t('acct_current_password')}</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm sm:w-auto"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-moss">{t('acct_new_password')}</label>
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
  const { t } = useLanguage()
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
    <Section title={t('acct_saved_addresses')}>
      {addresses.length === 0 && <p className="mb-4 text-sm text-[#6a6656]">{t('acct_no_addresses')}</p>}
      <ul className="mb-4 space-y-2">
        {addresses.map((a) => (
          <li key={a.id} className="flex flex-col gap-2 rounded-sm border border-gold/20 bg-cream px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>
              {a.line1}, {a.city} {a.postal_code} {a.phone ? `· ${a.phone}` : ''}
            </span>
            <button onClick={() => remove(a.id)} className="text-sm text-[#a35a3a] underline">
              {t('common_remove')}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AddressFields
          value={{ line1: form.line1, city: form.city, postal_code: form.postal_code }}
          onChange={(addr) => setForm({ ...form, ...addr })}
          className="col-span-2 grid grid-cols-2 gap-3 md:col-span-4 md:grid-cols-4"
        />
        <input placeholder={t('common_phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm sm:w-auto" />
        <button className="rounded-full bg-forestDeep px-4 py-2 text-xs uppercase tracking-wide text-cream">{t('acct_add_address')}</button>
      </form>
      {error && <p className="mt-2 text-sm text-[#a35a3a]">{error}</p>}
    </Section>
  )
}

function PaymentMethodsSection() {
  const { t } = useLanguage()
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
    <Section title={t('acct_saved_cards')}>
      {methods.length === 0 ? (
        <p className="text-sm text-[#6a6656]">
          {t('acct_no_cards')}
        </p>
      ) : (
        <ul className="space-y-2">
          {methods.map((m) => (
            <li key={m.id} className="flex flex-col gap-2 rounded-sm border border-gold/20 bg-cream px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="capitalize">
                {m.gateway.replace('_', ' ')} •••• {m.last4} {m.expiry ? `(exp ${m.expiry})` : ''}
              </span>
              <button onClick={() => remove(m.id)} className="text-sm text-[#a35a3a] underline">
                {t('common_remove')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

function OrderHistorySection() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState([])
  useEffect(() => {
    apiGet('/api/orders/mine').then((r) => setOrders(r.orders))
  }, [])

  return (
    <Section title={t('acct_order_history')}>
      {orders.length === 0 ? (
        <p className="text-sm text-[#6a6656]">{t('acct_no_orders')}</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-sm border border-gold/20 bg-cream p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-forestDeep">Order {o.id.slice(0, 8)}</span>
                <span className="capitalize text-moss">{o.status}</span>
              </div>
              <p className="mt-1 text-xs text-[#6a6656]">
                {new Date(o.created_at).toLocaleDateString()} · {fmt(o.total_lkr)} · via {o.gateway_used}
              </p>
              <ul className="mt-2 text-xs text-[#5c5949]">
                {o.items.slice(0, 3).map((i, idx) => (
                  <li key={idx}>{i.name} × {i.qty}</li>
                ))}
                {o.items.length > 3 && <li>+{o.items.length - 3} more</li>}
              </ul>
              <Link
                to={`/orders/${o.id}`}
                className="mt-2 inline-block text-sm font-semibold uppercase tracking-wide text-gold underline"
              >
                {t('acct_view_details')}
              </Link>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

function BookingsSection() {
  const { t } = useLanguage()
  const { provider } = useServiceProvider()
  const [bookings, setBookings] = useState([])
  useEffect(() => {
    apiGet('/api/account/bookings').then((r) => setBookings(r.bookings))
  }, [])

  return (
    <Section title={t('acct_your_bookings')}>
      {bookings.length === 0 ? (
        <p className="text-sm text-[#6a6656]">{t('acct_no_bookings')}</p>
      ) : (
        <ul className="space-y-2">
          {bookings.map((b) => (
            <li key={b.id} className="flex flex-col gap-2 rounded-sm border border-gold/20 bg-cream px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span>
                {b.service_name} — {formatCalendarDate(b.booked_date)} at {b.booked_time.slice(0, 5)}{b.branch_name ? ` · ${providerBranchLabel(provider, b.branch_name)}` : ''}
              </span>
              <span className="capitalize text-moss">{b.status}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

// Which optional emails the customer receives. Each toggle saves straight
// away. Order, booking and account-security emails can't be switched off.
function EmailNotificationsSection() {
  const { t } = useLanguage()
  const { openSettings } = useConsent()
  const [prefs, setPrefs] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet('/api/account/email-prefs').then(setPrefs).catch((e) => setError(e.message))
  }, [])

  const toggle = async (type, enabled) => {
    setPrefs((p) => ({ ...p, optional: p.optional.map((o) => (o.type === type ? { ...o, enabled } : o)) }))
    try {
      await apiPut('/api/account/email-prefs', { type, enabled })
    } catch (e) {
      setError(e.message)
      apiGet('/api/account/email-prefs').then(setPrefs)
    }
  }

  return (
    <Section title={t('acct_notifications')}>
      <p className="mb-4 text-sm text-[#5c5949]">{t('acct_notif_intro')}</p>
      {error && <p role="alert" className="mb-3 text-sm text-[#a35a3a]">{error}</p>}
      {!prefs ? (
        <p className="text-sm text-[#6a6656]">{t('common_loading')}</p>
      ) : (
        <>
          <ul className="space-y-3">
            {prefs.optional.map((o) => (
              <li key={o.type} className="flex items-start justify-between gap-4 border-t border-gold/20 pt-3">
                <div>
                  <p className="font-semibold text-forestDeep">{t(`email_type_${o.type}`)}</p>
                  <p className="text-sm text-[#5c5949]">{t(`email_type_${o.type}_desc`)}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={o.enabled}
                  aria-label={t(`email_type_${o.type}`)}
                  onClick={() => toggle(o.type, !o.enabled)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${o.enabled ? 'bg-forestDeep' : 'bg-[#c9c3ac]'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${o.enabled ? 'left-[1.4rem]' : 'left-0.5'}`} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-moss">{t('acct_always_title')}</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-[#5c5949]">
            {[1, 2, 3].map((n) => (
              <li key={n}>{t(`email_always_${n}`)}</li>
            ))}
          </ul>
        </>
      )}
      <button type="button" onClick={openSettings} className="mt-5 text-base underline text-forestDeep">
        {t('acct_cookie_settings')}
      </button>
    </Section>
  )
}

// Privacy rights: get a copy of your data, or delete the account.
function PrivacyDataSection() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (user && user.role !== 'customer') return null

  const download = async () => {
    setError('')
    try {
      const data = await apiGet('/api/account/export')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-shaniz-data.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message)
    }
  }

  const remove = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await apiDelete('/api/account', { password })
      localStorage.removeItem('shaniz_cart')
      window.location.assign('/')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Section title={t('acct_privacy_title')}>
      <p className="mb-4 text-sm text-[#5c5949]">{t('acct_privacy_intro')}</p>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={download} className="rounded-full border border-forestDeep/40 px-5 py-2.5 text-xs uppercase tracking-wide text-forestDeep">
          {t('acct_download_data')}
        </button>
        <Link to="/privacy" className="text-base underline text-forestDeep">{t('footer_privacy')}</Link>
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-base underline text-[#a35a3a]">
          {t('acct_delete_title')}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-[#a35a3a]">{error}</p>}
      {open && (
        <form onSubmit={remove} className="mt-5 rounded-sm border border-[#a35a3a]/40 bg-cream p-4">
          <p className="text-sm text-[#5c5949]">{t('acct_delete_warning')}</p>
          <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-moss">
            {t('acct_delete_password')}
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-sm border border-gold/30 bg-ivory px-3 py-2 text-sm normal-case"
            />
          </label>
          <button type="submit" disabled={busy} className="mt-4 rounded-full bg-[#a35a3a] px-5 py-2.5 text-xs uppercase tracking-wide text-white disabled:opacity-60">
            {t('acct_delete_button')}
          </button>
        </form>
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
  const { t } = useLanguage()
  const { user, logout } = useAuth()

  return (
    <>
      <Nav />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl">{t('nav_my_account')}</h1>
            <p className="text-sm text-[#6a6656]">Signed in as {user?.email}</p>
          </div>
          <button onClick={logout} className="self-start text-sm uppercase tracking-wide text-[#a35a3a] underline sm:self-auto">
            {t('acct_sign_out')}
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
        <EmailNotificationsSection />
        <PrivacyDataSection />

        <p className="text-center text-xs text-[#6a6656]">
          <Link to="/" className="underline">
            ← Back to the storefront
          </Link>
        </p>
      </div>
      <Footer />
    </>
  )
}
