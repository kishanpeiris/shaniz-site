import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatLKR } from '../lib/currency.js'
import { googleMapsUrl } from '../lib/maps.js'
import { useLanguage } from '../context/LanguageContext.jsx'

function todayPlus(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function BookingWidget({ service, open, onClose }) {
  const { t } = useLanguage()
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
  const [guestHomePhone, setGuestHomePhone] = useState('')

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
  // Signed-in customers who never saved a mobile number are asked for one here.
  const needsPhoneFields = Boolean(user && !user.mobile)
  const isValidPhone = (v) => {
    const digits = v.replace(/\D/g, '')
    return /^\+?[\d\s\-()]+$/.test(v) && digits.length >= 9 && digits.length <= 12
  }
  const recipientEmail = user ? user.email : guestEmail

  const handleBook = async () => {
    setErrorMsg('')
    // Check the form here first, so the customer gets a clear, friendly
    // message instead of a technical one from the server.
    const mobile = guestMobile.trim()
    const home = guestHomePhone.trim()
    if (!user && (!guestFirstName.trim() || !/^\S+@\S+\.\S+$/.test(guestEmail.trim()))) {
      setErrorMsg(t('book_name_email_required'))
      return
    }
    if ((!user || needsPhoneFields) && !mobile && !home) {
      setErrorMsg(t('book_phone_required'))
      return
    }
    if ((mobile && !isValidPhone(mobile)) || (home && !isValidPhone(home))) {
      setErrorMsg(t('book_phone_invalid'))
      return
    }
    setStatus('booking')
    try {
      await apiPost('/api/bookings', {
        service_id: service.id,
        booked_date: date,
        booked_time: selectedSlot,
        guest_mobile: mobile || undefined,
        guest_home_phone: home || undefined,
        ...(user
          ? {}
          : {
              guest_name: guestLastName.trim() ? `${guestFirstName} ${guestLastName}` : guestFirstName,
              guest_email: guestEmail.trim(),
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
        <button onClick={reset} className="absolute right-4 top-3.5 text-lg text-forestDeep" aria-label={t('common_close')}>
          ✕
        </button>

        {status === 'booked' ? (
          <div className="text-center">
            <h3 className="text-2xl">{t('book_booked')}</h3>
            <p className="mt-3 text-sm text-[#5c5949]">
              {service.name} on <strong>{date}</strong> at <strong>{selectedSlot?.slice(0, 5)}</strong>.
              A confirmation email is on its way to {recipientEmail}.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="rounded-full border border-gold/40 px-6 py-2.5 text-xs uppercase tracking-wide text-forestDeep"
              >
                {t('book_keep_shopping')}
              </button>
              <button
                onClick={goToBasket}
                className="rounded-full bg-forestDeep px-6 py-2.5 text-xs uppercase tracking-wide text-cream"
              >
                {t('book_go_basket')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-2xl">Reserve: {service.name}</h3>
            <p className="mt-1 text-sm text-[#5c5949]">
              {service.durationMinutes} minutes · {formatLKR(service.price)}
            </p>

            {service.branch && (
              <p className="mt-1 text-xs text-[#6a6656]">
                📍 {service.branch.name}, {service.branch.address}{' '}
                <a href={googleMapsUrl(service.branch)} target="_blank" rel="noopener noreferrer" className="underline text-forestDeep">
                  {t('common_get_directions')}
                </a>
              </p>
            )}

            <label className={labelClass}>{t('book_pick_date')}</label>
            <input
              type="date"
              value={date}
              min={todayPlus(0)}
              max={todayPlus(30)}
              onChange={(e) => setDate(e.target.value)}
              className={`mt-1.5 ${inputClass}`}
            />

            <label className={labelClass}>{t('book_available_times')}</label>
            <div className="mt-1.5 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
              {slotsLoading && <span className="text-sm text-[#6a6656]">{t('book_loading_slots')}</span>}
              {!slotsLoading && slots.length === 0 && (
                <span className="text-sm text-[#6a6656]">{t('book_no_slots')}</span>
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
                {t('book_booking_as')} <strong>{user.name}</strong> ({user.email})
              </p>
            )}

            {/* --- Signed out: choose how to continue --- */}
            {selectedSlot && !user && contactMode === 'choose' && (
              <div className="mt-4 rounded-sm border border-gold/20 bg-cream p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-moss">
                  {t('book_how_continue')}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setContactMode('login')}
                    className="rounded-full border border-gold/40 py-2 text-xs uppercase tracking-wide text-forestDeep hover:bg-gold/10"
                  >
                    {t('common_sign_in')}
                  </button>
                  <button
                    onClick={() => setContactMode('register')}
                    className="rounded-full border border-gold/40 py-2 text-xs uppercase tracking-wide text-forestDeep hover:bg-gold/10"
                  >
                    {t('book_create_account')}
                  </button>
                  <button
                    onClick={() => setContactMode('guest')}
                    className="rounded-full bg-forestDeep py-2 text-xs uppercase tracking-wide text-cream"
                  >
                    {t('book_continue_guest')}
                  </button>
                </div>
              </div>
            )}

            {/* --- Inline sign-in --- */}
            {selectedSlot && !user && contactMode === 'login' && (
              <form onSubmit={handleLogin} className="mt-4 rounded-sm border border-gold/20 bg-cream p-4">
                <button type="button" onClick={() => setContactMode('choose')} className="mb-2 text-xs underline text-moss">
                  {t('book_back')}
                </button>
                <label className="block text-xs font-semibold uppercase tracking-wide text-moss">{t('common_email')}</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={`mt-1 ${inputClass}`}
                />
                <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-moss">{t('common_password')}</label>
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
                    placeholder={t('common_first_name')}
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    className={`w-1/2 ${inputClass}`}
                  />
                  <input
                    placeholder={t('book_last_name_optional')}
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    className={`w-1/2 ${inputClass}`}
                  />
                </div>
                <input
                  type="email"
                  required
                  placeholder={t('common_email')}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
                <input
                  type="tel"
                  placeholder={t('book_mobile_optional')}
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
                <input
                  type="password"
                  required
                  placeholder={t('common_password')}
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
                    placeholder={t('common_first_name')}
                    value={guestFirstName}
                    onChange={(e) => setGuestFirstName(e.target.value)}
                    className={`w-1/2 ${inputClass}`}
                  />
                  <input
                    placeholder={t('book_last_name_optional')}
                    value={guestLastName}
                    onChange={(e) => setGuestLastName(e.target.value)}
                    className={`w-1/2 ${inputClass}`}
                  />
                </div>
                <input
                  type="email"
                  required
                  placeholder={t('common_email')}
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
                <input
                  type="tel"
                  aria-label={t('book_mobile_number')}
                  placeholder={t('book_mobile_number')}
                  value={guestMobile}
                  onChange={(e) => setGuestMobile(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
                <input
                  type="tel"
                  aria-label={t('book_home_phone')}
                  placeholder={t('book_home_phone')}
                  value={guestHomePhone}
                  onChange={(e) => setGuestHomePhone(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
                <p className="mt-2 text-xs text-[#6a6656]">{t('book_phone_note')}</p>
              </div>
            )}

            {selectedSlot && needsPhoneFields && (
              <div className="mt-4 rounded-sm border border-gold/20 bg-cream p-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-moss">{t('book_contact_for_booking')}</p>
                <input
                  type="tel"
                  aria-label={t('book_mobile_number')}
                  placeholder={t('book_mobile_number')}
                  value={guestMobile}
                  onChange={(e) => setGuestMobile(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="tel"
                  aria-label={t('book_home_phone')}
                  placeholder={t('book_home_phone')}
                  value={guestHomePhone}
                  onChange={(e) => setGuestHomePhone(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
                <p className="mt-2 text-xs text-[#6a6656]">{t('book_phone_note')}</p>
              </div>
            )}

            {errorMsg && <p role="alert" className="mt-3 text-sm text-[#a35a3a]">{errorMsg}</p>}

            {selectedSlot && (user || (contactMode === 'guest' && guestReady)) && (
              <button
                disabled={status === 'booking'}
                onClick={handleBook}
                className="mt-5 w-full rounded-full bg-gold py-3 text-xs font-semibold uppercase tracking-wide text-forestDeep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'booking' ? t('book_booking') : t('book_confirm')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
