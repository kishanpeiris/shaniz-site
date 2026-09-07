import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import logo from '../assets/logo.jpg'
import matchaRitual from '../assets/textures/matcha-slate.jpg'

export default function RegisterPage() {
  const { register } = useAuth()
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
              <img
                src={logo}
                alt="Shani'z logo"
                className="h-14 w-14 rounded-full border border-gold/40 bg-white object-cover p-0.5"
              />
              <span className="font-serif text-2xl font-semibold leading-none text-forestDeep">
                Shani&rsquo;z
                <small className="mt-1 block font-sans text-[0.6rem] font-normal tracking-[0.16em] text-moss">
                  HERBAL HAIR &amp; SKIN CARE
                </small>
              </span>
            </div>
            <h1 className="text-2xl">Create an account</h1>
            <p className="mt-1 text-xs uppercase tracking-wide text-moss">Save your details for faster checkout</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex gap-3">
              <input
                required
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-1/2 rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
              />
              <input
                placeholder="Last name (optional)"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-1/2 rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
              />
            </div>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
            />
            <input
              type="tel"
              placeholder="Mobile number (optional)"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
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
            <p className="text-xs text-[#8a8672]">
              At least 10 characters, with an uppercase letter and a number.
            </p>
            {error && <p className="text-sm text-[#a35a3a]">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-full bg-forestDeep py-3 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
            >
              {busy ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#8a8672]">
            Already have an account?{' '}
            <Link to="/login" className="underline">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-[#8a8672]">
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
