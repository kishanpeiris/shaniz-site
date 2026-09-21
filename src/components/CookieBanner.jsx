import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useConsent } from '../context/ConsentContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

// A switch that works with keyboard and screen readers.
function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-forestDeep' : 'bg-[#c9c3ac]'} ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-[1.4rem]' : 'left-0.5'}`}
      />
    </button>
  )
}

function SettingsDialog() {
  const { consent, save, closeSettings } = useConsent()
  const { t } = useLanguage()
  const [prefs, setPrefs] = useState(Boolean(consent?.preferences))
  const [third, setThird] = useState(Boolean(consent?.thirdParty))
  const firstRef = useRef(null)

  useEffect(() => {
    firstRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && closeSettings()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeSettings])

  const rows = [
    { key: 'necessary', title: t('cookie_cat_necessary'), text: t('cookie_cat_necessary_text'), checked: true, locked: true },
    { key: 'preferences', title: t('cookie_cat_preferences'), text: t('cookie_cat_preferences_text'), checked: prefs, set: setPrefs },
    { key: 'third', title: t('cookie_cat_third'), text: t('cookie_cat_third_text'), checked: third, set: setThird },
  ]

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-forestDeep/60 p-4"
      onClick={(e) => e.target === e.currentTarget && closeSettings()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-sm bg-ivory p-6 shadow-2xl"
      >
        <h2 id="cookie-dialog-title" className="font-serif text-2xl text-forestDeep">
          {t('cookie_settings_title')}
        </h2>
        <p className="mt-2 text-sm text-[#5c5949]">{t('cookie_no_tracking')}</p>

        <ul className="mt-5 space-y-4">
          {rows.map((r, i) => (
            <li key={r.key} className="flex items-start justify-between gap-4 border-t border-gold/25 pt-4">
              <div>
                <p className="font-semibold text-forestDeep">
                  {r.title}
                  {r.locked && <span className="ml-2 text-xs font-normal text-moss">{t('cookie_always_on')}</span>}
                </p>
                <p className="mt-1 text-sm text-[#5c5949]">{r.text}</p>
              </div>
              <span ref={i === 1 ? firstRef : null} tabIndex={-1}>
                <Toggle checked={r.checked} disabled={r.locked} onChange={r.set || (() => {})} label={r.title} />
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-sm">
          <Link to="/cookies" onClick={closeSettings} className="underline text-forestDeep">
            {t('cookie_read_policy')}
          </Link>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => save({ preferences: prefs, thirdParty: third })}
            className="rounded-full bg-forestDeep px-6 py-2.5 text-xs uppercase tracking-wide text-cream"
          >
            {t('cookie_save')}
          </button>
          <button
            type="button"
            onClick={closeSettings}
            className="rounded-full border border-gold/50 px-6 py-2.5 text-xs uppercase tracking-wide text-forestDeep"
          >
            {t('common_close')}
          </button>
        </div>
      </div>
    </div>
  )
}

// The bottom bar shown on a first visit, plus the settings dialog (which
// the footer's "Cookie settings" link can also open at any time).
export default function CookieBanner() {
  const { hasDecided, acceptAll, rejectOptional, openSettings, settingsOpen } = useConsent()
  const { t } = useLanguage()

  return (
    <>
      {!hasDecided && !settingsOpen && (
        <div
          role="region"
          aria-label={t('cookie_banner_label')}
          className="fixed inset-x-0 bottom-0 z-[110] border-t border-gold/40 bg-ivory p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] sm:p-5"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-semibold text-forestDeep">{t('cookie_banner_title')}</p>
              <p className="mt-1 text-sm text-[#5c5949]">
                {t('cookie_banner_text')}{' '}
                <Link to="/cookies" className="underline text-forestDeep">
                  {t('cookie_read_policy')}
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-full bg-forestDeep px-5 py-2.5 text-xs uppercase tracking-wide text-cream"
              >
                {t('cookie_accept_all')}
              </button>
              <button
                type="button"
                onClick={rejectOptional}
                className="rounded-full border border-forestDeep/40 px-5 py-2.5 text-xs uppercase tracking-wide text-forestDeep"
              >
                {t('cookie_reject')}
              </button>
              <button type="button" onClick={openSettings} className="px-3 py-2.5 text-sm underline text-forestDeep">
                {t('cookie_choose')}
              </button>
            </div>
          </div>
        </div>
      )}
      {settingsOpen && <SettingsDialog />}
    </>
  )
}
