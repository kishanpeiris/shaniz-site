import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiPost } from '../api/client.js'
import logo from '../assets/logo.jpg'

export default function ResetPasswordPage() {
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
          <img src={logo} alt="Shani'z" className="mb-3 h-14 w-14 rounded-full border border-gold/40 bg-white p-0.5" />
          <h1 className="text-2xl">Set a new password</h1>
        </div>

        {!token && (
          <p className="text-center text-sm text-[#a35a3a]">
            This link is missing its reset token. Request a new one from the{' '}
            <Link to="/forgot-password" className="underline">
              forgot password
            </Link>{' '}
            page.
          </p>
        )}

        {token && status === 'done' && (
          <div className="text-center">
            <p className="text-sm text-[#5c5949]">Your password has been reset.</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-5 rounded-full bg-forestDeep px-6 py-2.5 text-xs uppercase tracking-wide text-cream"
            >
              Sign in
            </button>
          </div>
        )}

        {token && status !== 'done' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <input
              type="password"
              required
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
            />
            <p className="text-xs text-[#8a8672]">
              At least 10 characters, with an uppercase letter and a number.
            </p>
            {error && <p className="text-sm text-[#a35a3a]">{error}</p>}
            <button
              type="submit"
              disabled={status === 'resetting'}
              className="mt-1 rounded-full bg-forestDeep py-3 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
            >
              {status === 'resetting' ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-[#8a8672]">
          <Link to="/login" className="underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
