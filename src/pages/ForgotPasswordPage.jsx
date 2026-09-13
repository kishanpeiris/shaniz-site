import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiPost } from '../api/client.js'
import BrandLockup from '../components/BrandLockup.jsx'

export default function ForgotPasswordPage() {
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
          <h1 className="text-2xl">Reset your password</h1>
        </div>

        {status === 'sent' ? (
          <p className="text-center text-sm text-[#5c5949]">
            If an account exists for <strong>{email}</strong>, we've sent a link to reset your
            password. It expires in 20 minutes.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <input
              type="email"
              required
              placeholder="Your account email"
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
              {status === 'sending' ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-[#6a6656]">
          <Link to="/login" className="underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
