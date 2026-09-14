import React, { useState } from 'react'
import { useBusinessInfo } from '../hooks/useBusinessInfo.js'
import { useBranches } from '../hooks/useBranches.js'
import { apiPost } from '../api/client.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import BranchLocator from './BranchLocator.jsx'

export default function Visit() {
  const info = useBusinessInfo()
  const branches = useBranches()
  const { t, language } = useLanguage()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      // Tells the backend which language the visitor had the site set
      // to, so it knows whether this message is worth auto-translating
      // to English for the admin (see site.routes.js) — not a claim
      // about what script the visitor actually typed in, just a
      // reasonable signal from the one language toggle the site has.
      await apiPost('/api/site/contact', { ...form, language })
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setError(err.message || 'Something went wrong — please try again.')
      setStatus('error')
    }
  }

  return (
    <section id="visit" className="bg-cream py-24">
      <div className="mx-auto max-w-6xl px-7">
        <div className="mx-auto mb-14 max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{t('contact_eyebrow')}</p>
          <h2 className="mt-3 text-4xl">{t('contact_headline')}</h2>
        </div>

        <div className="grid gap-14 md:grid-cols-2">
          <div>
            <h3 className="text-2xl">{t('contact_get_in_touch')}</h3>
            <p className="mt-3 mb-6 text-[#5c5949]">{t('contact_intro')}</p>
            <dl className="space-y-3 text-sm">
              {[
                [t('contact_phone_label'), info.phone],
                [t('contact_email_label'), info.email],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <dt className="w-20 shrink-0 font-semibold text-forestDeep">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 font-semibold text-forestDeep">{t('contact_facebook_label')}</dt>
                <dd>
                  <a href={info.facebook_url} target="_blank" rel="noopener noreferrer" className="underline">
                    @shaniz.herbal
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {status === 'sent' ? (
            <div className="flex flex-col items-start gap-2 rounded-sm border border-gold/30 bg-ivory p-6">
              <p className="font-medium text-forestDeep">{t('contact_sent_title')}</p>
              <p className="text-sm text-[#5c5949]">{t('contact_sent_subtitle')}</p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-2 text-xs font-semibold uppercase tracking-wide text-gold underline"
              >
                {t('contact_send_another')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={t('contact_name_placeholder')}
                required
                className="rounded-sm border border-gold/30 bg-ivory px-4 py-3 text-sm"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t('contact_email_placeholder')}
                required
                className="rounded-sm border border-gold/30 bg-ivory px-4 py-3 text-sm"
              />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder={t('contact_message_placeholder')}
                required
                rows={4}
                className="rounded-sm border border-gold/30 bg-ivory px-4 py-3 text-sm"
              />
              {error && <p className="text-sm text-[#a35a3a]">{error}</p>}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-fit rounded-full bg-gold px-7 py-3 text-xs font-semibold uppercase tracking-wide text-forestDeep disabled:opacity-60"
              >
                {status === 'sending' ? t('contact_sending') : t('contact_send')}
              </button>
            </form>
          )}
        </div>

        <BranchLocator branches={branches} />
      </div>
    </section>
  )
}
