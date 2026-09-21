import React from 'react'
import logo from '../assets/logo.jpg'
import { useBusinessInfo } from '../hooks/useBusinessInfo.js'
import { useLanguage } from '../context/LanguageContext.jsx'

// Shown across all customer-facing routes while maintenance mode is
// active. Admin routes and /login never render this — see the bypass
// check in App.jsx — so an admin can always get back in to turn it off.
export default function MaintenancePlaceholder({ schedule }) {
  const info = useBusinessInfo()
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-forestDeep px-6 text-center text-cream">
      <img
        src={logo}
        alt="Shani'z logo"
        className="mb-6 h-20 w-20 rounded-full border border-gold/40 bg-white object-cover p-1"
      />
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-goldLight">
        Shani&rsquo;z Herbal Hair &amp; Skin Care
      </p>
      <h1 className="max-w-lg font-serif text-3xl text-ivory sm:text-4xl">{t('maint_title')}</h1>
      <p className="mt-4 max-w-md text-sm text-cream/75">
        {schedule?.reason || t('maint_default_reason')}
      </p>
      {schedule?.ends_at && (
        <p className="mt-2 text-xs uppercase tracking-wide text-goldLight">
          {t('maint_back_by', { time: new Date(schedule.ends_at).toLocaleString() })}
        </p>
      )}
      <p className="mt-8 text-xs text-cream/50">
        {t('maint_urgent')} {info.email} · {info.phone}
      </p>
    </div>
  )
}
