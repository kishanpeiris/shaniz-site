import React from 'react'
import logo from '../assets/logo.jpg'

// Single source of truth for the "logo + Shani'z + tagline" lockup —
// used by Nav, Footer, and the auth pages (Register/Forgot/Reset
// Password). Before this, each place re-implemented it slightly
// differently: some had the tagline, some didn't (Footer/auth pages),
// and the ones that did used `mt-1` between "Shani'z" and the tagline,
// which reads as an oversized gap relative to how tight the two lines
// are meant to sit together as one lockup.
//
// `size`: 'sm' (auth-page cards) | 'md' (footer) | 'nav' (header, which
// needs its own responsive step-up at the sm breakpoint).
// `variant`: 'dark' text for light backgrounds (Nav, auth cards) |
// 'light' text for the dark forestDeep background (Footer, Maintenance).
// `taglineClassName`: Tailwind visibility classes for the tagline only —
// Nav passes 'hidden lg:block' since the header also has to fit nav
// links + the language switcher, and those get noticeably wider in
// Sinhala/Tamil; everywhere else just wants it always visible.
const SIZES = {
  sm: { logo: 'h-14 w-14', name: 'text-2xl', tagline: 'text-[0.6rem]' },
  md: { logo: 'h-12 w-12 sm:h-16 sm:w-16', name: 'text-2xl', tagline: 'text-[0.62rem]' },
  nav: { logo: 'h-12 w-12 sm:h-16 sm:w-16', name: 'text-xl sm:text-3xl', tagline: 'text-[0.6rem]' },
}

export default function BrandLockup({ size = 'md', variant = 'dark', taglineClassName = 'block', className = '' }) {
  const s = SIZES[size]
  const nameColor = variant === 'dark' ? 'text-forestDeep' : 'text-ivory'
  const taglineColor = variant === 'dark' ? 'text-moss' : 'text-goldLight'

  return (
    <div className={`flex items-center gap-3 sm:gap-3.5 ${className}`}>
      <img
        src={logo}
        alt="Shani'z logo"
        className={`${s.logo} shrink-0 rounded-full border border-gold/40 bg-white object-cover p-0.5`}
      />
      {/* leading-tight (not leading-none + a manual margin) is what
          actually keeps the two lines close — a fixed margin on the
          <small> doesn't account for the line-height already baked
          into the larger "Shani'z" line above it. */}
      <span className={`font-serif font-semibold leading-tight ${s.name} ${nameColor}`}>
        Shani&rsquo;z
        <small
          className={`${taglineClassName} whitespace-nowrap font-sans font-normal leading-tight tracking-[0.1em] ${s.tagline} ${taglineColor}`}
        >
          HERBAL HAIR &amp; SKIN CARE
        </small>
      </span>
    </div>
  )
}
