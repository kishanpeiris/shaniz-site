import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import logo from '../assets/logo.jpg'
import matchaRitual from '../assets/textures/matcha-slate.jpg'

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const loggedInUser = await login(email, password)
      const dest =
        location.state?.from?.pathname ||
        (['admin', 'superadmin'].includes(loggedInUser.role) ? '/admin' : '/account')
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.message)
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
    navigate(['admin', 'superadmin'].includes(user.role) ? '/admin' : '/account', { replace: true })
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
            <img
              src={logo}
              alt="Shani'z"
              className="mb-3 h-20 w-20 rounded-full border border-gold/40 bg-white p-1"
            />
            <h1 className="text-2xl">Sign in</h1>
            <p className="mt-1 text-xs uppercase tracking-wide text-moss">Your account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
            />
            {error && <p className="text-sm text-[#a35a3a]">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-full bg-forestDeep py-3 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
            >
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-[#8a8672]">
            <Link to="/forgot-password" className="underline">
              Forgot your password?
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-[#8a8672]">
            New here?{' '}
            <Link to="/register" className="underline">
              Create an account
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-[#8a8672]">
            <Link to="/" className="underline">
              ← Back to the storefront
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
