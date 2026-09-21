import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiPost } from '../api/client.js'
import BrandLockup from '../components/BrandLockup.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      // The backend always returns the same response whether or not the
      // email exists, to avoid confirming which emails are registered.
      await apiPost('/api/auth/forgot-password', { email })
      setStatus('sent')
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm rounded-sm border border-gold/30 bg-ivory p-9">
        <div className="mb-7 flex flex-col items-center">
          <BrandLockup size="sm" className="mb-3" />
          <h1 className="text-2xl">{t('auth_reset_password_heading')}</h1>
        </div>

        {status === 'sent' ? (
          <p className="text-center text-sm text-[#5c5949]">
            {t('auth_reset_sent_message', { email })}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <input
              type="email"
              required
              placeholder={t('auth_account_email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
            />
            {error && <p className="text-sm text-[#a35a3a]">{error}</p>}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-1 rounded-full bg-forestDeep py-3 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
            >
              {status === 'sending' ? t('auth_sending') : t('auth_send_reset_link')}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#6a6656]">
          <Link to="/login" className="underline">
            {t('auth_back_to_sign_in')}
          </Link>
        </p>
      </div>
    </div>
  )
}
