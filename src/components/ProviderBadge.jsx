import React from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useServiceProvider } from '../hooks/useServiceProvider.js'
import { providerWording } from '../lib/serviceProvider.js'

/**
 * Shows which company provides a service (the Shani'z subsidiary set in
 * Admin -> Services). Three looks:
 *
 *   overlay - a small pill with the LOGO, sits on top of a thumbnail photo
 *   text    - one short line of wording, e.g. "Provided by <name>"
 *   block   - logo + wording in a framed box (service page, booking pop-up)
 *
 * Accessibility: a logo is a picture, so the wording is always also in the
 * page as text for screen readers; the picture itself is marked decorative.
 * If no logo has been uploaded, the company name is shown as text instead.
 */
export default function ProviderBadge({ variant = 'text', tone = 'light', decorative = false, override = null, className = '' }) {
  const { language } = useLanguage()
  const shared = useServiceProvider()
  // `override` lets the admin editor preview unsaved changes.
  const provider = override || shared.provider
  if (!override && !shared.loaded) return null
  if (!provider.name) return null

  const wording = providerWording(provider, language)
  const logo = provider.logo_url

  if (variant === 'overlay') {
    // No logo yet: the company name has to sit in this small pill
    // instead, and a long name (e.g. "Miracles Hair and Skin Clinic")
    // does not fit on one line on a narrow mobile card without
    // truncating. Wrapping to up to two lines, in a rounded rectangle
    // rather than a full pill, fixes that; a real logo (once uploaded
    // in Admin -> Services) replaces this text entirely and doesn’t
    // have the problem.
    return (
      <span
        className={`absolute bottom-3 left-3 z-10 flex max-w-[85%] items-center shadow-md ${logo ? 'rounded-full bg-ivory/95 px-3 py-1.5' : 'rounded-md bg-ivory/95 px-2.5 py-1.5'} ${className}`}
        title={wording}
        aria-hidden={decorative ? 'true' : undefined}
      >
        {logo ? (
          <img src={logo} alt="" loading="lazy" decoding="async" className="h-7 w-auto max-w-[9rem] object-contain" />
        ) : (
          <span aria-hidden="true" className="line-clamp-2 text-[0.62rem] font-semibold uppercase leading-tight tracking-wide text-forestDeep">
            {provider.name}
          </span>
        )}
        {!decorative && <span className="sr-only">{wording}</span>}
      </span>
    )
  }

  if (variant === 'block') {
    return (
      <div className={`flex items-center gap-3 rounded-sm border border-gold/30 bg-cream px-4 py-3 ${className}`}>
        {logo && <img src={logo} alt="" loading="lazy" decoding="async" className="h-10 w-auto max-w-[8rem] shrink-0 object-contain" />}
        <p className="text-sm text-[#5c5949]">{wording}</p>
      </div>
    )
  }

  const color = tone === 'dark' ? 'text-cream/75' : 'text-[#5c5949]'
  return <p className={`text-xs ${color} ${className}`}>{wording}</p>
}
