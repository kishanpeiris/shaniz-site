import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiPost } from '../api/client.js'
import BrandLockup from '../components/BrandLockup.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function ResetPasswordPage() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [status, setStatus] = useState('idle') // idle | resetting | done
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('resetting')
    setError('')
    try {
      await apiPost('/api/auth/reset-password', { token, newPassword })
      setStatus('done')
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
          <h1 className="text-2xl">{t('auth_set_new_password_heading')}</h1>
        </div>

        {!token && (
          <p className="text-center text-sm text-[#a35a3a]">
            {t('auth_missing_token_message')}{' '}
            <Link to="/forgot-password" className="underline">
              {t('auth_forgot_password_link_text')}
            </Link>{' '}
            page.
          </p>
        )}

        {token && status === 'done' && (
          <div className="text-center">
            <p className="text-sm text-[#5c5949]">{t('auth_password_reset_done')}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-5 rounded-full bg-forestDeep px-6 py-2.5 text-xs uppercase tracking-wide text-cream"
            >
              {t('auth_sign_in_heading')}
            </button>
          </div>
        )}

        {token && status !== 'done' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <input
              type="password"
              required
              placeholder={t('auth_new_password_placeholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
            />
            <p className="text-xs text-[#6a6656]">{t('auth_password_hint')}</p>
            {error && <p className="text-sm text-[#a35a3a]">{error}</p>}
            <button
              type="submit"
              disabled={status === 'resetting'}
              className="mt-1 rounded-full bg-forestDeep py-3 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
            >
              {status === 'resetting' ? t('auth_resetting') : t('auth_reset_password_button')}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-[#6a6656]">
          <Link to="/login" className="underline">
            {t('auth_back_to_sign_in')}
          </Link>
        </p>
      </div>
    </div>
  )
}
