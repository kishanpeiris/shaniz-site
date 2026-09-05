import React, { useRef, useState } from 'react'
import { apiUpload } from '../../api/client.js'

// Used in the admin panel to upload a product photo or hover-loop GIF and
// hand the resulting URL back to the parent form. Handles the upload
// itself (server re-encodes and validates — see shaniz-api
// src/lib/uploads.js) so callers just get a URL string back.
export default function ImageUploader({ label, value, onChange, accept = 'image/*' }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const res = await apiUpload('/api/uploads', file)
      onChange(res.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      {label && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss">{label}</p>}
      <div className="flex items-center gap-3">
        {value && (
          <img src={value} alt="" className="h-14 w-14 rounded-sm border border-gold/30 object-cover" />
        )}
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFile}
            disabled={busy}
            className="text-xs"
          />
          {busy && <p className="mt-1 text-xs text-[#8a8672]">Uploading…</p>}
          {error && <p className="mt-1 text-xs text-[#a35a3a]">{error}</p>}
          {value && !busy && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="mt-1 block text-xs text-[#a35a3a] underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
