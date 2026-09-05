import React from 'react'
import { useBusinessInfo } from '../hooks/useBusinessInfo.js'

export default function Visit() {
  const info = useBusinessInfo()
  const handleSubmit = (e) => {
    e.preventDefault()
    // NOTE: front-end demo only. Wire this up to Resend/SendGrid, or a
    // form endpoint on the Express backend, to receive real messages.
    alert(
      "Thanks! This form is a front-end demo — connect it to Resend/SendGrid or the backend to receive real messages."
    )
    e.target.reset()
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <input
              type="text"
              placeholder="Your name"
              required
              className="rounded-sm border border-gold/30 bg-ivory px-4 py-3 text-sm"
            />
            <input
              type="email"
              placeholder="Your email"
              required
              className="rounded-sm border border-gold/30 bg-ivory px-4 py-3 text-sm"
            />
            <textarea
              placeholder="How can we help?"
              required
              rows={4}
              className="rounded-sm border border-gold/30 bg-ivory px-4 py-3 text-sm"
            />
            <button
              type="submit"
              className="w-fit rounded-full bg-gold px-7 py-3 text-xs font-semibold uppercase tracking-wide text-forestDeep"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
