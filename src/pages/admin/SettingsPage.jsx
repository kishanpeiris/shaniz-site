import React, { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut } from '../../api/client.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { HOMEPAGE_CONTENT_DEFAULTS, migrateLegacyHomepage } from '../../hooks/useHomepageContent.js'
import RichTextEditor from '../../components/admin/RichTextEditor.jsx'
import ImageUploader from '../../components/admin/ImageUploader.jsx'
import TranslationFields from '../../components/admin/TranslationFields.jsx'

// A simple "list of uploaded videos, add more, remove any" control — no
// drag-to-reorder or per-video captions, just what's needed to build the
// homepage's "See It Made" row (RitualVideo.jsx) from the admin side.
function VideoListField({ label, hint, value = [], onChange, max = 9 }) {
  const addVideo = (url) => {
    if (!url || value.includes(url) || value.length >= max) return
    onChange([...value, url])
  }
  const removeVideo = (url) => onChange(value.filter((v) => v !== url))

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss">{label}</p>
      {hint && <p className="mb-2 text-xs text-[#6a6656]">{hint}</p>}
      {value.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((url) => (
            <div key={url} className="relative">
              <video src={url} muted className="aspect-[9/16] w-full rounded-sm border border-gold/30 object-cover" />
              <button
                type="button"
                onClick={() => removeVideo(url)}
                className="absolute right-1 top-1 rounded-full bg-forestDeep/80 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-cream"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      {value.length < max ? (
        <ImageUploader
          label={`Add a video (${value.length}/${max})`}
          value=""
          onChange={addVideo}
          accept="video/mp4,video/webm,video/quicktime"
          kind="video"
          endpoint="/api/uploads/video"
        />
      ) : (
        <p className="text-xs text-[#6a6656]">Maximum of {max} videos reached — remove one to add another.</p>
      )}
    </div>
  )
}

function BusinessInfoForm() {
  const [form, setForm] = useState({
    phone: '',
    email: '',
    facebook_url: '',
    instagram_url: '',
    tiktok_url: '',
    linkedin_url: '',
    whatsapp_number: '',
  })
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet('/api/admin/settings/business-info').then((r) => setForm({ ...form, ...r.business_info }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('saving')
    setError('')
    try {
      await apiPut('/api/admin/settings/business-info', form)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <section className="mb-10 rounded-sm border border-gold/30 bg-ivory p-6">
      <h3 className="mb-2 text-xl">Business Info</h3>
      <p className="mb-5 max-w-2xl text-sm text-[#6a6656]">
        Non-secret business info shown on the storefront (Visit Us section, footer). API keys and
        database credentials are not managed here — those stay in your hosting provider's
        environment variables, for security.
      </p>

      <form onSubmit={handleSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-moss">Phone</label>
          <input
            value={form.phone || ''}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-moss">Contact email</label>
          <input
            type="email"
            value={form.email || ''}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-moss">Social links</p>
          <p className="mb-3 text-xs text-[#6a6656]">
            Leave any of these blank to hide that icon in the footer — none are required.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[#6a6656]">Facebook URL</label>
              <input
                type="url"
                value={form.facebook_url || ''}
                onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
                placeholder="https://facebook.com/yourpage"
                className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6a6656]">Instagram URL</label>
              <input
                type="url"
                value={form.instagram_url || ''}
                onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                placeholder="https://instagram.com/yourpage"
                className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6a6656]">TikTok URL</label>
              <input
                type="url"
                value={form.tiktok_url || ''}
                onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })}
                placeholder="https://tiktok.com/@yourpage"
                className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6a6656]">LinkedIn URL</label>
              <input
                type="url"
                value={form.linkedin_url || ''}
                onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/company/yourpage"
                className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-moss">WhatsApp number</label>
          <input
            value={form.whatsapp_number || ''}
            onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value.replace(/[^\d]/g, '') })}
            placeholder="94771234567"
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-[#6a6656]">
            Digits only, with country code, no + or spaces. Leave blank to hide the WhatsApp button/icon on the site.
          </p>
        </div>

        <div className="sm:col-span-2">
          {status === 'error' && <p className="mb-3 text-sm text-[#a35a3a]">{error}</p>}
          {status === 'saved' && <p className="mb-3 text-sm text-moss">Saved.</p>}
          <button
            type="submit"
            disabled={status === 'saving'}
            className="rounded-full bg-forestDeep px-6 py-2.5 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
          >
            {status === 'saving' ? 'Saving…' : 'Save Business Info'}
          </button>
        </div>
      </form>
    </section>
  )
}

function BookingRemindersForm() {
  const [enabled, setEnabled] = useState(true)
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet('/api/admin/settings/booking-reminders').then((r) => setEnabled(r.booking_reminders?.enabled !== false))
  }, [])

  const handleToggle = async (next) => {
    setEnabled(next) // update the switch immediately, then save in the background
    setStatus('saving')
    setError('')
    try {
      await apiPut('/api/admin/settings/booking-reminders', { enabled: next })
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setStatus('error')
      setError(err.message)
      setEnabled(!next) // saving failed — put the switch back
    }
  }

  return (
    <section className="mb-10 rounded-sm border border-gold/30 bg-ivory p-6">
      <h3 className="mb-2 text-xl">Booking Reminder Emails</h3>
      <p className="mb-4 max-w-2xl text-sm text-[#6a6656]">
        When on, customers with a confirmed appointment automatically get a reminder email the day
        before their booking — sent once a day, no action needed from you.
      </p>
      <label className="flex max-w-2xl items-center gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => handleToggle(e.target.checked)}
          className="h-5 w-5 accent-forestDeep"
        />
        <span className="text-sm">{enabled ? 'On — reminders will be sent' : 'Off — no reminders will be sent'}</span>
      </label>
      {status === 'error' && <p className="mt-3 text-sm text-[#a35a3a]">{error}</p>}
      {status === 'saved' && <p className="mt-3 text-sm text-moss">Saved.</p>}
    </section>
  )
}

function OrderPoliciesForm() {
  const [days, setDays] = useState(14)
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet('/api/admin/settings/order-policies').then((r) => setDays(r.order_policies?.return_window_days ?? 14))
  }, [])

  const handleSave = async () => {
    setStatus('saving')
    setError('')
    try {
      await apiPut('/api/admin/settings/order-policies', { return_window_days: Number(days) })
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <section className="mb-10 rounded-sm border border-gold/30 bg-ivory p-6">
      <h3 className="mb-2 text-xl">Order Cancellations &amp; Returns</h3>
      <p className="mb-4 max-w-2xl text-sm text-[#6a6656]">
        Customers can request a cancellation any time before an order ships (or, for pickup orders, before they
        collect it) — that part isn't adjustable, since it depends on the order's own status. This controls how many
        days after an order is marked <strong>completed</strong> a customer can still request a return/refund.
      </p>
      <div className="flex max-w-2xl items-center gap-3">
        <input
          type="number"
          min={0}
          max={365}
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="w-24 rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
        />
        <span className="text-sm text-[#6a6656]">days</span>
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className="ml-auto rounded-full bg-forestDeep px-5 py-2 text-xs uppercase tracking-wide text-cream disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>
      {status === 'error' && <p className="mt-3 text-sm text-[#a35a3a]">{error}</p>}
      {status === 'saved' && <p className="mt-3 text-sm text-moss">Saved.</p>}
    </section>
  )
}

function Field({ label, value, onChange, textarea, rich, hint }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-moss">{label}</label>
      {hint && <p className="mb-1 text-xs text-[#6a6656]">{hint}</p>}
      {rich ? (
        <RichTextEditor value={value || ''} onChange={onChange} rows={6} />
      ) : textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-base"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-base"
        />
      )}
    </div>
  )
}

// A slightly different flavor of ImageUploader usage than the
// Products/Services pages: here, an empty value is meaningful (it means
// "use the site's original default photo," not "no photo set"), so the
// label always makes that explicit and Remove is phrased as "Reset to
// default" instead of just clearing the field to blank/nothing.
function BackgroundField({ label, value, onChange, hint, accept = 'image/jpeg,image/png,image/webp', kind = 'image', endpoint = '/api/uploads' }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss">{label}</p>
      {hint && <p className="mb-1 text-xs text-[#6a6656]">{hint}</p>}
      <div className="flex items-center gap-3">
        {value && kind === 'video' && (
          <video src={value} muted loop autoPlay playsInline className="h-14 w-14 rounded-sm border border-gold/30 object-cover" />
        )}
        {value && kind === 'image' && (
          <img src={value} alt="" className="h-14 w-14 rounded-sm border border-gold/30 object-cover" />
        )}
        {!value && (
          <span className="flex h-14 w-14 items-center justify-center rounded-sm border border-dashed border-gold/40 text-center text-[0.6rem] text-[#6a6656]">
            Using default
          </span>
        )}
        <div className="flex-1">
          <ImageUploader value="" onChange={onChange} accept={accept} kind={kind} endpoint={endpoint} />
          {value && (
            <button type="button" onClick={() => onChange('')} className="mt-1 block text-xs text-[#a35a3a] underline">
              Reset to default photo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children, onSave, status = 'idle', error = '' }) {
  return (
    <section className="mb-8 rounded-sm border border-gold/30 bg-ivory p-6">
      <h4 className="mb-4 text-lg">{title}</h4>
      <div className="grid gap-4">{children}</div>
      {onSave && (
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gold/20 pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={status === 'saving'}
            className="rounded-full bg-forestDeep px-6 py-2.5 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
          >
            {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : `Save ${title.split(' (')[0]}`}
          </button>
          {status === 'saved' && <span role="status" className="text-sm text-moss">Saved — live on the website now.</span>}
          {error && <span role="alert" className="text-sm text-[#a35a3a]">{error}</span>}
        </div>
      )}
    </section>
  )
}

function PageContentEditor() {
  const [form, setForm] = useState(HOMEPAGE_CONTENT_DEFAULTS)
  const [statuses, setStatuses] = useState({}) // per section: idle | saving | saved
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet('/api/admin/settings/homepage-content')
      .then((res) => setForm({ ...HOMEPAGE_CONTENT_DEFAULTS, ...migrateLegacyHomepage(res.homepage_content || {}) }))
      .catch((e) => setError(e.message))
  }, [])

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const patch = (fields) => setForm((f) => ({ ...f, ...fields }))

  // Each section saves ONLY its own fields, so a problem in one section can
  // never stop another section from saving — and the message appears right
  // beside the button that was pressed.
  const saveSection = async (id, match) => {
    setStatuses((x) => ({ ...x, [id]: 'saving' }))
    setErrors((x) => ({ ...x, [id]: '' }))
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([k]) => match(k)))
      const res = await apiPut('/api/admin/settings/homepage-content', payload)
      const saved = res.homepage_content || {}
      setForm((f) => ({ ...f, ...Object.fromEntries(Object.entries(saved).filter(([k]) => match(k))) }))
      setStatuses((x) => ({ ...x, [id]: 'saved' }))
      setTimeout(() => setStatuses((x) => ({ ...x, [id]: 'idle' })), 3000)
    } catch (err) {
      setErrors((x) => ({ ...x, [id]: err.message }))
      setStatuses((x) => ({ ...x, [id]: 'idle' }))
    }
  }
  const saver = (id, match) => ({ onSave: () => saveSection(id, match), status: statuses[id] || 'idle', error: errors[id] || '' })
  const isHero = (k) => k.startsWith('hero_')
  const isAbout = (k) => k.startsWith('about_')
  const isRitual = (k) => k.startsWith('ritual_') && !k.startsWith('ritual_video')
  const isVideos = (k) => k.startsWith('ritual_video') || k === 'see_it_made_videos'

  return (
    <section>
      <h3 className="mb-2 text-xl">Page Content</h3>
      <p className="mb-6 max-w-2xl text-sm text-[#6a6656]">
        Edit the headlines, copy, photos, and background images on the homepage — no code changes
        needed. Changes go live as soon as you save. Product/service photos and hover videos are
        still edited from their own Products/Services pages, not here.
      </p>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <div>
        <Section title="Hero (top of homepage)" {...saver('hero', isHero)}>
          <Field label="Eyebrow (small text above the headline)" value={form.hero_eyebrow} onChange={set('hero_eyebrow')} />
          <Field label="Headline" value={form.hero_headline} onChange={set('hero_headline')} textarea />
          <Field label="Subtext" value={form.hero_subtext} onChange={set('hero_subtext')} rich />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button 1 label" value={form.hero_cta1_label} onChange={set('hero_cta1_label')} />
            <Field label="Button 2 label" value={form.hero_cta2_label} onChange={set('hero_cta2_label')} />
          </div>
          <TranslationFields
            values={form}
            onChange={patch}
            fields={[
              { key: 'hero_eyebrow', label: 'Eyebrow' },
              { key: 'hero_headline', label: 'Headline' },
              { key: 'hero_subtext', label: 'Subtext', richText: true },
              { key: 'hero_cta1_label', label: 'Button 1 label' },
              { key: 'hero_cta2_label', label: 'Button 2 label' },
            ]}
          />
          <div className="grid gap-4 border-t border-gold/20 pt-4 sm:grid-cols-2">
            <BackgroundField
              label="Background photo (fallback if video doesn't load)"
              value={form.hero_background_url}
              onChange={set('hero_background_url')}
            />
            <BackgroundField
              label="Background video"
              value={form.hero_video_url}
              onChange={set('hero_video_url')}
              accept="video/mp4,video/webm,video/quicktime"
              kind="video"
              endpoint="/api/uploads/video"
            />
          </div>
        </Section>

        <Section title="Our Story (About section)" {...saver('about', isAbout)}>
          <Field label="Eyebrow" value={form.about_eyebrow} onChange={set('about_eyebrow')} />
          <Field
            label="Headline"
            value={form.about_headline}
            onChange={set('about_headline')}
            textarea
            hint="A line break here (press Enter) shows as a line break on the page."
          />
          <Field label="Paragraph 1" value={form.about_paragraph1} onChange={set('about_paragraph1')} rich />
          <Field label="Paragraph 2" value={form.about_paragraph2} onChange={set('about_paragraph2')} rich />
          <TranslationFields
            values={form}
            onChange={patch}
            fields={[
              { key: 'about_eyebrow', label: 'Eyebrow' },
              { key: 'about_headline', label: 'Headline' },
              { key: 'about_paragraph1', label: 'Paragraph 1', richText: true },
              { key: 'about_paragraph2', label: 'Paragraph 2', richText: true },
            ]}
          />
          <div className="grid gap-4 border-t border-gold/20 pt-4 sm:grid-cols-2">
            <BackgroundField label="Side photo (next to the text)" value={form.about_image_url} onChange={set('about_image_url')} />
            <BackgroundField
              label="Background texture (behind this whole band — Our Story, The Ritual, and See It Made together)"
              value={form.about_background_url}
              onChange={set('about_background_url')}
            />
          </div>
        </Section>

        <Section title="The Ritual (shop preview section)" {...saver('ritual', isRitual)}>
          <Field label="Eyebrow" value={form.ritual_eyebrow} onChange={set('ritual_eyebrow')} />
          <Field label="Headline" value={form.ritual_headline} onChange={set('ritual_headline')} />
          <Field label="Subtext" value={form.ritual_subtext} onChange={set('ritual_subtext')} rich />
          <TranslationFields
            values={form}
            onChange={patch}
            fields={[
              { key: 'ritual_eyebrow', label: 'Eyebrow' },
              { key: 'ritual_headline', label: 'Headline' },
              { key: 'ritual_subtext', label: 'Subtext', richText: true },
            ]}
          />
        </Section>

        <Section title="See It Made (process videos)" {...saver('videos', isVideos)}>
          <Field label="Eyebrow" value={form.ritual_video_eyebrow} onChange={set('ritual_video_eyebrow')} />
          <Field label="Headline" value={form.ritual_video_headline} onChange={set('ritual_video_headline')} />
          <Field label="Subtext" value={form.ritual_video_subtext} onChange={set('ritual_video_subtext')} rich />
          <TranslationFields
            values={form}
            onChange={patch}
            fields={[
              { key: 'ritual_video_eyebrow', label: 'Eyebrow' },
              { key: 'ritual_video_headline', label: 'Headline' },
              { key: 'ritual_video_subtext', label: 'Subtext', richText: true },
            ]}
          />
          <p className="border-t border-gold/20 pt-4 text-xs text-[#6a6656]">
            Shows as a row of up to 3 videos on the homepage, with arrows to page through more if
            you add more than 3. Leave this empty to keep showing the original Facebook video.
          </p>
          <VideoListField
            label="Process videos"
            value={form.see_it_made_videos}
            onChange={set('see_it_made_videos')}
          />
        </Section>

      </div>
    </section>
  )
}

// Super admin only: sends a real test email and shows exactly what happened,
// so email problems (wrong key, unverified domain…) are visible straight away.
function EmailCheckCard() {
  const { user } = useAuth()
  const [to, setTo] = useState(user?.email || '')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const send = async () => {
    setBusy(true)
    setResult(null)
    setError('')
    try {
      setResult(await apiPost('/api/admin/email-test', { to }))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mb-8 rounded-sm border border-gold/30 bg-ivory p-6">
      <h4 className="mb-1 text-lg">Email check</h4>
      <p className="mb-4 text-sm text-[#5c5949]">
        Sends a test message using the same settings as order, booking and password-reset emails.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[16rem] flex-1 text-xs font-semibold uppercase tracking-wide text-moss">
          Send test to
          <input type="email" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-base font-normal normal-case" />
        </label>
        <button type="button" onClick={send} disabled={busy || !to} className="rounded-full bg-forestDeep px-6 py-2.5 text-xs uppercase tracking-wide text-cream disabled:opacity-60">
          {busy ? 'Sending…' : 'Send test email'}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-[#a35a3a]">{error}</p>}
      {result && (
        <div role="status" className={`mt-4 rounded-sm border p-3 text-sm ${result.ok ? 'border-moss/40 bg-cream text-moss' : 'border-[#a35a3a]/40 bg-cream text-[#a35a3a]'}`}>
          <p className="font-semibold">{result.ok ? 'Sent — check that inbox (and spam).' : 'Not sent.'}</p>
          <p className="mt-1 text-[#5c5949]">Sending from: {result.from}</p>
          {result.error && <p className="mt-1">Reason: {result.error}</p>}
          {result.hint && <p className="mt-1 text-[#5c5949]">{result.hint}</p>}
        </div>
      )}
    </section>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  return (
    <div>
      <h2 className="mb-6 text-3xl">Settings</h2>
      <BusinessInfoForm />
      {user?.role === 'superadmin' && <EmailCheckCard />}
      <BookingRemindersForm />
      <OrderPoliciesForm />
      <PageContentEditor />
    </div>
  )
}
