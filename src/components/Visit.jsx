import React, { useState } from 'react'
import { useBusinessInfo } from '../hooks/useBusinessInfo.js'
import { apiPost } from '../api/client.js'

export default function Visit() {
  const info = useBusinessInfo()
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
      await apiPost('/api/site/contact', form)
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Visit us</p>
          <h2 className="mt-3 text-4xl">Say hello.</h2>
        </div>

        <div className="grid gap-14 md:grid-cols-2">
          <div>
            <h3 className="text-2xl">Get in touch</h3>
            <p className="mt-3 mb-6 text-[#5c5949]">
              Have a question about an order, an ingredient, or want to book the scalp ritual in
              person? Reach out — we reply within a day.
            </p>
            <dl className="space-y-3 text-sm">
              {[
                ['Studio', info.address],
                ['Phone', info.phone],
                ['Email', info.email],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <dt className="w-20 shrink-0 font-semibold text-forestDeep">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 font-semibold text-forestDeep">Facebook</dt>
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
              <p className="font-medium text-forestDeep">Thanks — your message is on its way!</p>
              <p className="text-sm text-[#5c5949]">We reply within a day.</p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-2 text-xs font-semibold uppercase tracking-wide text-gold underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                className="rounded-sm border border-gold/30 bg-ivory px-4 py-3 text-sm"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your email"
                required
                className="rounded-sm border border-gold/30 bg-ivory px-4 py-3 text-sm"
              />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help?"
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
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
