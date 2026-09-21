import React from 'react'
import { useConsent } from '../context/ConsentContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

// Wraps content supplied by another company (a Google map, a Facebook
// video). Until the visitor allows third-party content, only a short
// explanation and a button are shown — nothing is requested from that company.
// kind: 'map' | 'video'
export default function ConsentGate({ kind, children, className = '', tone = 'dark' }) {
  const { allowed, save, consent, openSettings } = useConsent()
  const { t } = useLanguage()
  if (allowed('thirdParty')) return children

  const text = tone === 'light' ? 'text-cream/85' : 'text-[#5c5949]'
  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-5 text-center ${text} ${className}`}>
      <p className="max-w-xs text-sm">{t(`cookie_gate_text_${kind}`)}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => save({ preferences: Boolean(consent?.preferences), thirdParty: true })}
          className="rounded-full bg-gold px-4 py-2 text-xs uppercase tracking-wide text-forestDeep"
        >
          {t(`cookie_gate_show_${kind}`)}
        </button>
        <button type="button" onClick={openSettings} className="text-sm underline">
          {t('cookie_manage')}
        </button>
      </div>
    </div>
  )
}
