import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatLKR } from '../lib/currency.js'

function todayPlus(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function BookingWidget({ service, open, onClose }) {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()

  const [date, setDate] = useState(todayPlus(1))
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)

  // 'choose' | 'login' | 'register' | 'guest' — only relevant while
  // signed out. Reset to 'choose' whenever the slot changes so a
  // half-filled login/guest form doesn't linger against a new time.
  const [contactMode, setContactMode] = useState('choose')
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regMobile, setRegMobile] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const [guestFirstName, setGuestFirstName] = useState('')
  const [guestLastName, setGuestLastName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestMobile, setGuestMobile] = useState('')

  const [status, setStatus] = useState('idle') // idle | booking | booked | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!open || !service) return
    setSlotsLoading(true)
    setSelectedSlot(null)
    setContactMode('choose')
    apiGet(`/api/bookings/services/${service.id}/slots?date=${date}`)
      .then((res) => setSlots(res.slots))
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setSlotsLoading(false))
  }, [open, service, date])

  if (!open || !service) return null

  const selectSlot = (s) => {
    setSelectedSlot(s)
    setContactMode('choose')
    setAuthError('')
  }

  const guestReady = guestFirstName.trim() && guestEmail.trim()
  const recipientEmail = user ? user.email : guestEmail

  const handleBook = async () => {
    setStatus('booking')
    setErrorMsg('')
    try {
      await apiPost('/api/bookings', {
        service_id: service.id,
        booked_date: date,
        booked_time: selectedSlot,
        ...(user
          ? {}
          : {
              guest_name: guestLastName.trim() ? `${guestFirstName} ${guestLastName}` : guestFirstName,
              guest_email: guestEmail,
              guest_mobile: guestMobile.trim() || undefined,
            }),
      })
      setStatus('booked')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
      // the slot may have just been taken — refresh the list
      apiGet(`/api/bookings/services/${service.id}/slots?date=${date}`).then((res) => setSlots(res.slots))
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthBusy(true)
    setAuthError('')
    try {
      await login(loginEmail, loginPassword)
      // Once `user` is set, this component re-renders straight into the
      // signed-in confirm view below — no extra step needed here.
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setAuthBusy(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setAuthBusy(true)
    setAuthError('')
    try {
      await register({
        firstName: regFirstName,
        lastName: regLastName.trim() || undefined,
        email: regEmail,
        password: regPassword,
        mobile: regMobile.trim() || undefined,
      })
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setAuthBusy(false)
    }
  }

  const reset = () => {
    setStatus('idle')
    setSelectedSlot(null)
    setContactMode('choose')
    setGuestFirstName('')
    setGuestLastName('')
    setGuestEmail('')
    setGuestMobile('')
    onClose()
  }

  const goToBasket = () => {
    reset()
    navigate('/basket')
  }

  const inputClass = 'w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm'
  const labelClass = 'mt-3 block text-xs font-semibold uppercase tracking-wide text-moss'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-forestDeep/55 p-5"
      onClick={(e) => e.target === e.currentTarget && reset()}
    >
      <div className="relative w-full max-w-md overflow-y-auto rounded-sm bg-ivory p-8" style={{ maxHeight: '90vh' }}>
        <button onClick={reset} className="absolute right-4 top-3.5 text-lg text-forestDeep" aria-label="Close">
          ✕
        </button>

        {status === 'booked' ? (
          <div className="text-center">
            <h3 className="text-2xl">You&rsquo;re booked!</h3>
            <p className="mt-3 text-sm text-[#5c5949]">
              {service.name} on <strong>{date}</strong> at <strong>{selectedSlot?.slice(0, 5)}</strong>.
              A confirmation email is on its way to {recipientEmail}.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="rounded-full border border-gold/40 px-6 py-2.5 text-xs uppercase tracking-wide text-forestDeep"
              >
                Keep Shopping
              </button>
              <button
                onClick={goToBasket}
                className="rounded-full bg-forestDeep px-6 py-2.5 text-xs uppercase tracking-wide text-cream"
              >
                Go to Basket
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-2xl">Reserve: {service.name}</h3>
            <p className="mt-1 text-sm text-[#5c5949]">
              {service.durationMinutes} minutes · {formatLKR(service.price)}
            </p>

            <label className={labelClass}>Pick a date</label>
            <input
              type="date"
              value={date}
              min={todayPlus(0)}
              max={todayPlus(30)}
              onChange={(e) => setDate(e.target.value)}
              className={`mt-1.5 ${inputClass}`}
            />

            <label className={labelClass}>Available times</label>
            <div className="mt-1.5 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
              {slotsLoading && <span className="text-sm text-[#8a8672]">Loading slots…</span>}
              {!slotsLoading && slots.length === 0 && (
                <span className="text-sm text-[#8a8672]">No open slots this day — try another date.</span>
              )}
              {!slotsLoading &&
                slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => selectSlot(s)}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      selectedSlot === s
                        ? 'border-forestDeep bg-forestDeep text-cream'
                        : 'border-gold/30 bg-cream text-forestDeep'
                    }`}
                  >
                    {s.slice(0, 5)}
                  </button>
                ))}
            </div>

            {selectedSlot && user && (
              <p className="mt-4 rounded-sm border border-gold/20 bg-cream px-3 py-2 text-sm text-[#5c5949]">
                Booking as <strong>{user.name}</strong> ({user.email})
              </p>
            )}

            {/* --- Signed out: choose how to continue --- */}
            {selectedSlot && !user && contactMode === 'choose' && (
              <div className="mt-4 rounded-sm border border-gold/20 bg-cream p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-moss">
                  How would you like to continue?
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setContactMode('login')}
                    className="rounded-full border border-gold/40 py-2 text-xs uppercase tracking-wide text-forestDeep hover:bg-gold/10"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setContactMode('register')}
                    className="rounded-full border border-gold/40 py-2 text-xs uppercase tracking-wide text-forestDeep hover:bg-gold/10"
                  >
                    Create an Account
                  </button>
                  <button
                    onClick={() => setContactMode('guest')}
                    className="rounded-full bg-forestDeep py-2 text-xs uppercase tracking-wide text-cream"
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>
            )}

            {/* --- Inline sign-in --- */}
            {selectedSlot && !user && contactMode === 'login' && (
              <form onSubmit={handleLogin} className="mt-4 rounded-sm border border-gold/20 bg-cream p-4">
                <button type="button" onClick={() => setContactMode('choose')} className="mb-2 text-xs underline text-moss">
                  ← Back
                </button>
                <label className="block text-xs font-semibold uppercase tracking-wide text-moss">Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={`mt-1 ${inputClass}`}
                />
                <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-moss">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`mt-1 ${inputClass}`}
                />
                {authError && <p className="mt-2 text-sm text-[#a35a3a]">{authError}</p>}
                <button
                  type="submit"
                  disabled={authBusy}
                  className="mt-3 w-full rounded-full bg-forestDeep py-2.5 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
                >
                  {authBusy ? 'Signing in…' : 'Sign In & Continue'}
                </button>
              </form>
            )}

            {/* --- Inline create account --- */}
            {selectedSlot && !user && contactMode === 'register' && (
              <form onSubmit={handleRegister} className="mt-4 rounded-sm border border-gold/20 bg-cream p-4">
                <button type="button" onClick={() => setContactMode('choose')} className="mb-2 text-xs underline text-moss">
                  ← Back
                </button>
                <div className="flex gap-2">
                  <input
                    required
                    placeholder="First name"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    className={`w-1/2 ${inputClass}`}
                  />
                  <input
                    placeholder="Last name (optional)"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    className={`w-1/2 ${inputClass}`}
                  />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
                <input
                  type="tel"
                  placeholder="Mobile (optional)"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
                {authError && <p className="mt-2 text-sm text-[#a35a3a]">{authError}</p>}
                <button
                  type="submit"
                  disabled={authBusy}
                  className="mt-3 w-full rounded-full bg-forestDeep py-2.5 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
                >
                  {authBusy ? 'Creating account…' : 'Create Account & Continue'}
                </button>
              </form>
            )}

            {/* --- Guest details --- */}
            {selectedSlot && !user && contactMode === 'guest' && (
              <div className="mt-4 rounded-sm border border-gold/20 bg-cream p-4">
                <button type="button" onClick={() => setContactMode('choose')} className="mb-2 text-xs underline text-moss">
                  ← Back
                </button>
                <div className="flex gap-2">
                  <input
                    required
                    placeholder="First name"
                    value={guestFirstName}
                    onChange={(e) => setGuestFirstName(e.target.value)}
                    className={`w-1/2 ${inputClass}`}
                  />
                  <input
                    placeholder="Last name (optional)"
                    value={guestLastName}
                    onChange={(e) => setGuestLastName(e.target.value)}
                    className={`w-1/2 ${inputClass}`}
                  />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
                <input
                  type="tel"
                  placeholder="Mobile (optional)"
                  value={guestMobile}
                  onChange={(e) => setGuestMobile(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
              </div>
            )}

            {errorMsg && <p className="mt-3 text-sm text-[#a35a3a]">{errorMsg}</p>}

            {selectedSlot && (user || (contactMode === 'guest' && guestReady)) && (
              <button
                disabled={status === 'booking'}
                onClick={handleBook}
                className="mt-5 w-full rounded-full bg-gold py-3 text-xs font-semibold uppercase tracking-wide text-forestDeep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'booking' ? 'Booking…' : 'Confirm Reservation'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
