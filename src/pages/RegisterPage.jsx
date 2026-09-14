import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import BrandLockup from '../components/BrandLockup.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import matchaRitual from '../assets/textures/matcha-slate.jpg'

export default function RegisterPage() {
  const { register } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      // lastName and mobile are both optional — omit them entirely rather
      // than sending empty strings, so the backend's `.optional()` schema
      // treats "didn't fill this in" the same way whether it's a single
      // name or no phone number.
      await register({
        firstName,
        lastName: lastName.trim() || undefined,
        email,
        password,
        mobile: mobile.trim() || undefined,
      })
      navigate('/account', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Nav />
      <div
        className="relative flex min-h-[calc(100vh-73px)] items-center justify-center overflow-hidden bg-cover bg-center px-6 py-16"
        style={{ backgroundImage: `url(${matchaRitual})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-forestDeep/90 via-forestDeep/80 to-forestDeep/90" />

        <div className="relative w-full max-w-sm rounded-sm border border-gold/30 bg-ivory p-9 shadow-brand">
          <div className="mb-7 flex flex-col items-center">
            <div className="mb-4 flex items-center gap-3">
              <BrandLockup size="sm" />
            </div>
            <h1 className="text-2xl">{t('auth_create_account_heading')}</h1>
            <p className="mt-1 text-xs uppercase tracking-wide text-moss">{t('auth_save_details_subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex gap-3">
              <input
                required
                placeholder={t('auth_first_name_placeholder')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-1/2 rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
              />
              <input
                placeholder={t('auth_last_name_placeholder')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-1/2 rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
              />
            </div>
            <input
              type="email"
              required
              placeholder={t('auth_email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
            />
            <input
              type="tel"
              placeholder={t('auth_mobile_placeholder')}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
            />
            <input
              type="password"
              required
              placeholder={t('auth_password_placeholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
            />
            <p className="text-xs text-[#6a6656]">{t('auth_password_hint')}</p>
            {error && <p className="text-sm text-[#a35a3a]">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-full bg-forestDeep py-3 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
            >
              {busy ? t('auth_creating_account') : t('auth_create_account_button')}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#6a6656]">
            {t('auth_already_have_account')}{' '}
            <Link to="/login" className="underline">
              {t('auth_sign_in_heading')}
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-[#6a6656]">
            <Link to="/" className="underline">
              {t('auth_back_to_storefront')}
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
