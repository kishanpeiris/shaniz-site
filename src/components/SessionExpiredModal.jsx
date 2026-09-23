import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

// Shown ON TOP of whatever page the admin was on when their session
// quietly expired — never a redirect, so a half-filled Add Service form
// (or anything else) is still sitting there underneath, untouched, once
// this closes. Signing in here just refreshes the session in place;
// choosing "Sign out instead" is the only path that actually navigates
// away (a deliberate choice, not something that happens to them).
export default function SessionExpiredModal() {
  const { sessionExpired, user, login, logout } = useAuth()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!sessionExpired) return null

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(user.email, password)
      setPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-forestDeep/60 px-4" role="dialog" aria-modal="true" aria-labelledby="session-expired-heading">
      <div className="w-full max-w-sm rounded-sm border border-gold/30 bg-ivory p-6 shadow-brand">
        <h2 id="session-expired-heading" className="text-xl text-forestDeep">Your session has expired</h2>
        <p className="mt-2 text-sm text-[#5c5949]">
          Sign in again to keep going — anything you were typing on this page is still here and won&rsquo;t be lost.
        </p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input value={user?.email || ''} disabled className="w-full rounded-sm border border-gold/30 bg-cream/60 px-3 py-2 text-sm text-[#6a6656]" />
          <input
            type="password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
          />
          {error && <p role="alert" className="text-sm text-[#a35a3a]">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-full bg-forestDeep px-5 py-2.5 text-xs uppercase tracking-wide text-cream disabled:opacity-50">
            {busy ? 'Signing in…' : 'Sign in and continue'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-3 w-full text-center text-xs uppercase tracking-wide text-[#a35a3a] underline"
        >
          Sign out instead
        </button>
      </div>
    </div>
  )
}
