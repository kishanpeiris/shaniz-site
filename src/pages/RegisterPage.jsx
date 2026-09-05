import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import logo from '../assets/logo.jpg'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await register(name, email, password)
      navigate('/account', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm rounded-sm border border-gold/30 bg-ivory p-9">
        <div className="mb-7 flex flex-col items-center">
          <img src={logo} alt="Shani'z" className="mb-3 h-14 w-14 rounded-full border border-gold/40 bg-white p-0.5" />
          <h1 className="text-2xl">Create an account</h1>
          <p className="mt-1 text-xs uppercase tracking-wide text-moss">Save your details for faster checkout</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <input
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-sm border border-gold/30 bg-cream px-4 py-2.5 text-sm"
          />
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
  )
}
