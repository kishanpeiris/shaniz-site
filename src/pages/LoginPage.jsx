import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { resolveReturnTo, queueScrollRestore } from '../lib/returnTo.js'
import Recaptcha from '../components/Recaptcha.jsx'
import matchaRitual from '../assets/textures/matcha-slate.jpg'

export default function LoginPage() {
  const { login, user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // Stays hidden for everyone until the backend says otherwise (a
  // couple of failed attempts for this email) — see
  // shaniz-api/src/routes/auth.routes.js.
  const [captchaRequired, setCaptchaRequired] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (captchaRequired && !recaptchaToken) {
      setError('Please complete the verification below.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const loggedInUser = await login(email, password, recaptchaToken)
      // Go back to the page (and scroll spot) they were on, not
      // automatically to the account/admin page.
      const dest = resolveReturnTo(location.state?.from, loggedInUser)
      queueScrollRestore(dest.url, dest.y)
      navigate(dest.url, { replace: true })
    } catch (err) {
      setError(err.message)
      if (err.captchaRequired) setCaptchaRequired(true)
      setRecaptchaToken('')
    } finally {
      setBusy(false)
    }
  }

  // Redirect away if the user is already logged in (e.g. they hit /login
  // directly with a valid session). This has to run in an effect, not
  // directly in the render body — calling navigate() during render
  // updates the router's state while React is still rendering this
  // component, which React explicitly warns against (it can cause extra
  // renders or, in stricter React versions, break entirely).
  useEffect(() => {
    if (!user) return
    const dest = resolveReturnTo(location.state?.from, user)
    queueScrollRestore(dest.url, dest.y)
    navigate(dest.url, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate])

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
            <h1 className="text-2xl">{t('auth_sign_in_heading')}</h1>
            <p className="mt-1 text-xs uppercase tracking-wide text-moss">{t('auth_your_account')}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <input
              type="email"
              required
              placeholder={t('auth_email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {captchaRequired && (
              <div className="flex justify-center">
                <Recaptcha
                  onVerify={setRecaptchaToken}
                  onExpire={() => setRecaptchaToken('')}
                />
              </div>
            )}
            {error && <p className="text-sm text-[#a35a3a]">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-full bg-forestDeep py-3 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
            >
              {busy ? t('auth_signing_in') : t('auth_sign_in_button')}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-[#6a6656]">
            <Link to="/forgot-password" className="underline">
              {t('auth_forgot_password')}
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-[#6a6656]">
            {t('auth_new_here')}{' '}
            <Link to="/register" className="underline">
              {t('create_an_account')}
            </Link>
          </p>

          <p className="mt-6 text-center text-sm text-[#6a6656]">
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
