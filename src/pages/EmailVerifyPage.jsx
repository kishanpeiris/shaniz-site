import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiGet } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

export default function EmailVerifyPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { refreshUser } = useAuth()
  // 'checking' | 'success' | 'error'
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('This link is missing its verification code.')
      return
    }
    apiGet(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async () => {
        // If the person is already logged in, this makes the green
        // "verified" banner on the Account page disappear immediately
        // instead of only after their next page load.
        await refreshUser().catch(() => {})
        setStatus('success')
      })
      .catch((err) => {
        setStatus('error')
        setError(err.message)
      })
  }, [token])

  return (
    <>
      <Nav />
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        {status === 'checking' && <p className="text-sm text-[#6a6656]">Confirming your email…</p>}

        {status === 'success' && (
          <>
            <h1 className="text-2xl text-forestDeep">Email confirmed ✓</h1>
            <p className="mt-3 text-sm text-[#5c5949]">
              Thanks — your email address is now verified.
            </p>
            <Link
              to="/account"
              className="mt-6 rounded-full bg-forestDeep px-6 py-2.5 text-xs uppercase tracking-wide text-cream"
            >
              Go to my account
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl text-[#a35a3a]">Couldn&rsquo;t confirm your email</h1>
            <p className="mt-3 text-sm text-[#5c5949]">{error}</p>
            <p className="mt-1 text-xs text-[#6a6656]">
              Verification links expire after 24 hours. You can request a new one from your account page.
            </p>
            <Link to="/account" className="mt-6 text-xs underline text-forestDeep">
              Go to my account
            </Link>
          </>
        )}
      </div>
      <Footer />
    </>
  )
}
