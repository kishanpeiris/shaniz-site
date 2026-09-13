import React, { useRef, useState } from 'react'
import { apiUpload } from '../../api/client.js'

// Manages a product's full photo set. The first image in the array is
// always the "main" / cover photo shown on the Shop grid and cart —
// there's no separate thumbnail field to go stale, "set as main" just
// reorders the array so the chosen photo becomes images[0].
export default function MultiImageUploader({ label = 'Photos', images = [], onChange }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setBusy(true)
    setError('')
    try {
      // Sequential, not Promise.all — keeps upload order predictable
      // (matches the order the admin picked them in) and avoids hammering
      // the server with a burst of large-image re-encodes at once.
      const uploaded = []
      for (const file of files) {
        const res = await apiUpload('/api/uploads', file)
        uploaded.push(res.url)
      }
      onChange([...images, ...uploaded])
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const setAsMain = (index) => {
    if (index === 0) return
    const next = [...images]
    const [chosen] = next.splice(index, 1)
    next.unshift(chosen)
    onChange(next)
  }

  const remove = (index) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const move = (index, dir) => {
    const target = index + dir
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div>
      {label && <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-moss">{label}</p>}

      {images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={url + i} className="relative w-24">
              <div
                className={`overflow-hidden rounded-sm border-2 ${
                  i === 0 ? 'border-gold' : 'border-gold/25'
                }`}
              >
                <img src={url} alt="" className="h-24 w-24 object-cover" />
              </div>
              {i === 0 ? (
                <span className="mt-1 block rounded-full bg-gold px-2 py-0.5 text-center text-[0.6rem] font-semibold uppercase tracking-wide text-forestDeep">
                  Main photo
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAsMain(i)}
                  className="mt-1 block w-full rounded-full border border-gold/40 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-forestDeep hover:bg-cream"
                >
                  Set as main
                </button>
              )}
              <div className="mt-1 flex items-center justify-between text-[0.65rem]">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-forestDeep underline disabled:pointer-events-none disabled:opacity-30"
                >
                  ←
                </button>
                <button type="button" onClick={() => remove(i)} className="text-[#a35a3a] underline">
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  className="text-forestDeep underline disabled:pointer-events-none disabled:opacity-30"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        disabled={busy}
        className="text-xs"
      />
      {busy && <p className="mt-1 text-xs text-[#6a6656]">Uploading &amp; resizing…</p>}
      {error && <p className="mt-1 text-xs text-[#a35a3a]">{error}</p>}
      <p className="mt-1 text-[0.65rem] text-[#6a6656]">
        Photos are automatically resized to fit the site. The main photo is what shows on the Shop grid.
      </p>
    </div>
  )
}
