import React, { useEffect, useRef } from 'react'

// The public Site Key is safe to expose in frontend code — it's the
// SECRET key (backend-only, see shaniz-api/.env.example) that must
// never appear here.
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

let scriptPromise = null
function loadScript() {
  if (window.grecaptcha) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://www.google.com/recaptcha/api.js'
      script.async = true
      script.defer = true
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}

// Renders Google's "I'm not a robot" checkbox. Only mount this
// component once it's actually needed (e.g. after a couple of failed
// sign-in attempts) — loading Google's script on every page visit would
// slow the site down for no reason for the vast majority of visitors
// who never need it.
export default function Recaptcha({ onVerify, onExpire }) {
  const containerRef = useRef(null)
  const widgetId = useRef(null)

  useEffect(() => {
    let cancelled = false

    if (!SITE_KEY) {
      // Dev machine without a real key yet — don't crash the page, just
      // say so clearly in the console so it isn't missed before launch.
      console.warn('[Recaptcha] VITE_RECAPTCHA_SITE_KEY is not set.')
      return
    }

    loadScript().then(() => {
      if (cancelled || !containerRef.current || widgetId.current !== null) return
      widgetId.current = window.grecaptcha.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: onVerify,
        'expired-callback': () => onExpire?.(),
      })
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!SITE_KEY) {
    return (
      <p className="text-xs text-[#a35a3a]">
        Verification is not configured yet (missing VITE_RECAPTCHA_SITE_KEY).
      </p>
    )
  }

  return <div ref={containerRef} />
}
