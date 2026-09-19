import React, { useState } from 'react'
import { apiPut } from '../../api/client.js'

const inputClass = 'w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm'

// A strong random password that always passes the site's rules
// (10+ characters, an uppercase letter and a number). Uses the browser's
// secure random generator, not Math.random().
function generatePassword(length = 14) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const all = upper + lower + digits
  const pick = (chars) => chars[crypto.getRandomValues(new Uint32Array(1))[0] % chars.length]
  const chars = [pick(upper), pick(digits), pick(lower)]
  while (chars.length < length) chars.push(pick(all))
  // shuffle so the guaranteed characters aren't always first
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

/**
 * Edit one account's details and (super admin only) set a new password.
 *
 * kind: 'admin' | 'customer'
 * canSetPassword: true only for super admins
 * Passwords are stored as one-way hashes, so an existing password can
 * never be displayed — this only lets you choose a NEW one.
 */
export default function AccountEditor({ account, kind, canSetPassword, isSelf, onSaved, onClose }) {
  const [form, setForm] = useState({
    name: account.name || '',
    first_name: account.first_name || '',
    last_name: account.last_name || '',
    email: account.email || '',
    mobile: account.mobile || '',
    role: account.role || 'admin',
  })
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [busy, setBusy] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pwBusy, setPwBusy] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwDone, setPwDone] = useState('') // the password just set — shown once
  const [copied, setCopied] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const base = kind === 'admin' ? `/api/admin/admins/${account.id}` : `/api/admin/customers/${account.id}`

  // Primary super admin's password can only be changed by themselves.
  const passwordLocked = account.is_primary_superadmin && !isSelf

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved('')
    try {
      const body =
        kind === 'admin'
          ? { name: form.name, email: form.email, mobile: form.mobile, role: form.role }
          : { first_name: form.first_name, last_name: form.last_name, email: form.email, mobile: form.mobile }
      await apiPut(base, body)
      setSaved('Saved.')
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const setPassword = async (e) => {
    e.preventDefault()
    setPwBusy(true)
    setPwError('')
    setPwDone('')
    setCopied(false)
    try {
      await apiPut(`/api/admin/users/${account.id}/password`, { password: newPassword })
      setPwDone(newPassword)
      setNewPassword('')
      setShowPassword(false)
    } catch (err) {
      setPwError(err.message)
    } finally {
      setPwBusy(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pwDone)
      setCopied(true)
    } catch {
      /* clipboard blocked — the password is still on screen to copy by hand */
    }
  }

  return (
    <div className="rounded-sm border border-gold/30 bg-cream p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg text-forestDeep">Edit {account.name}</h3>
        <button type="button" onClick={onClose} className="text-xs underline text-forestDeep">
          Close
        </button>
      </div>

      <form onSubmit={save} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {kind === 'admin' ? (
          <label className="text-xs uppercase tracking-wide text-moss">
            Name
            <input required value={form.name} onChange={set('name')} className={`mt-1 ${inputClass}`} />
          </label>
        ) : (
          <>
            <label className="text-xs uppercase tracking-wide text-moss">
              First name
              <input required value={form.first_name} onChange={set('first_name')} className={`mt-1 ${inputClass}`} />
            </label>
            <label className="text-xs uppercase tracking-wide text-moss">
              Last name
              <input value={form.last_name} onChange={set('last_name')} className={`mt-1 ${inputClass}`} />
            </label>
          </>
        )}
        <label className="text-xs uppercase tracking-wide text-moss">
          Email
          <input required type="email" value={form.email} onChange={set('email')} className={`mt-1 ${inputClass}`} />
        </label>
        <label className="text-xs uppercase tracking-wide text-moss">
          Mobile
          <input value={form.mobile} onChange={set('mobile')} className={`mt-1 ${inputClass}`} />
        </label>
        {kind === 'admin' && (
          <label className="text-xs uppercase tracking-wide text-moss">
            Role
            <select
              value={form.role}
              onChange={set('role')}
              disabled={account.is_primary_superadmin}
              className={`mt-1 ${inputClass} disabled:opacity-60`}
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </label>
        )}
        <div className="flex items-center gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-forestDeep px-5 py-2 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span role="status" className="text-sm text-moss">{saved}</span>}
          {error && <span role="alert" className="text-sm text-[#a35a3a]">{error}</span>}
        </div>
      </form>

      {canSetPassword && (
        <div className="mt-6 border-t border-gold/30 pt-5">
          <h4 className="text-sm font-semibold text-forestDeep">Set a new password</h4>
          <p className="mt-1 max-w-xl text-xs text-[#6a6656]">
            Existing passwords can't be viewed — they're stored scrambled, by design. You can set a new one
            instead. It's shown once after saving so you can pass it on securely; ask the person to change it
            after signing in.
          </p>
          {passwordLocked ? (
            <p className="mt-3 text-sm text-[#8a6d3b]">
              Only the primary super admin can change their own password.
            </p>
          ) : (
            <form onSubmit={setPassword} className="mt-3 flex flex-wrap items-end gap-3">
              <label className="min-w-[14rem] flex-1 text-xs uppercase tracking-wide text-moss">
                New password
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="10+ characters, 1 capital, 1 number"
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setNewPassword(generatePassword())
                  setShowPassword(true)
                }}
                className="rounded-full border border-forestDeep/30 px-4 py-2 text-xs uppercase tracking-wide text-forestDeep"
              >
                Generate
              </button>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-xs underline text-forestDeep"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              <button
                type="submit"
                disabled={pwBusy}
                className="rounded-full bg-forestDeep px-5 py-2 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
              >
                {pwBusy ? 'Saving…' : 'Set password'}
              </button>
            </form>
          )}
          {pwError && <p role="alert" className="mt-2 text-sm text-[#a35a3a]">{pwError}</p>}
          {pwDone && (
            <div role="status" className="mt-3 rounded-sm border border-moss/40 bg-ivory p-3 text-sm">
              Password updated. <strong>Copy it now — it won't be shown again:</strong>
              <div className="mt-2 flex items-center gap-3">
                <code className="rounded-sm bg-cream px-2 py-1 font-mono">{pwDone}</code>
                <button type="button" onClick={copy} className="text-xs underline text-forestDeep">
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
                <button type="button" onClick={() => setPwDone('')} className="text-xs underline text-forestDeep">
                  Hide
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
