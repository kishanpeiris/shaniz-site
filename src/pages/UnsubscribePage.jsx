import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { apiPost } from '../api/client.js'
import { useLanguage } from '../context/LanguageContext.jsx'

// Opened from the "Stop … emails" link at the bottom of a reminder email.
// Nothing changes until the person presses the button, so an email
// scanner that merely opens the link can't unsubscribe anyone.
export default function UnsubscribePage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const { t } = useLanguage()
  const [info, setInfo] = useState(null) // { type, email, unsubscribed }
  const [state, setState] = useState('loading') // loading | ask | done | undone | invalid
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!token) return setState('invalid')
    apiPost('/api/email-prefs/preview', { token })
      .then((r) => {
        setInfo(r)
        setState(r.unsubscribed ? 'done' : 'ask')
      })
      .catch(() => setState('invalid'))
  }, [token])

  const act = async (path, next) => {
    setBusy(true)
    try {
      await apiPost(`/api/email-prefs/${path}`, { token })
      setState(next)
    } catch {
      setState('invalid')
    } finally {
      setBusy(false)
    }
  }

  const label = info ? t(`email_type_${info.type}`) : ''
  const btn = 'rounded-full bg-forestDeep px-6 py-2.5 text-xs uppercase tracking-wide text-cream disabled:opacity-60'

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-lg px-5 py-14 text-center">
        <h1 className="text-3xl text-forestDeep">{t('unsub_heading')}</h1>
        <div className="mt-6 text-base text-[#4a4739]" aria-live="polite">
          {state === 'loading' && <p>{t('unsub_checking')}</p>}
          {state === 'invalid' && <p>{t('unsub_invalid')}</p>}
          {state === 'ask' && (
            <>
              <p>{t('unsub_confirm_text', { label, email: info.email })}</p>
              <button disabled={busy} onClick={() => act('unsubscribe', 'done')} className={`mt-5 ${btn}`}>
                {t('unsub_button')}
              </button>
            </>
          )}
          {state === 'done' && (
            <>
              <p className="font-semibold text-forestDeep">{t('unsub_done', { label })}</p>
              <p className="mt-2 text-sm text-[#6a6656]">{t('unsub_still')}</p>
              <button disabled={busy} onClick={() => act('resubscribe', 'undone')} className="mt-5 text-base underline text-forestDeep">
                {t('unsub_undo')}
              </button>
            </>
          )}
          {state === 'undone' && <p className="font-semibold text-forestDeep">{t('unsub_resubbed')}</p>}
        </div>
        <p className="mt-8 space-x-6 text-base">
          <Link to="/account" className="underline text-forestDeep">{t('unsub_manage')}</Link>
          <Link to="/" className="underline text-forestDeep">{t('auth_back_to_storefront')}</Link>
        </p>
      </main>
      <Footer />
    </>
  )
}
