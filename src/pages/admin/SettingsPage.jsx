import React, { useEffect, useState } from 'react'
import { apiGet, apiPut } from '../../api/client.js'
import { HOMEPAGE_CONTENT_DEFAULTS } from '../../hooks/useHomepageContent.js'
import ImageUploader from '../../components/admin/ImageUploader.jsx'

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
      {hint && <p className="mb-2 text-xs text-[#8a8672]">{hint}</p>}
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
        <p className="text-xs text-[#8a8672]">Maximum of {max} videos reached — remove one to add another.</p>
      )}
    </div>
  )
}

function BusinessInfoForm() {
  const [form, setForm] = useState({ phone: '', email: '', address: '', facebook_url: '', whatsapp_number: '' })
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
      <p className="mb-5 max-w-2xl text-sm text-[#8a8672]">
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
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-moss">Address / studio location</label>
          <input
            value={form.address || ''}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-moss">Facebook URL</label>
          <input
            type="url"
            value={form.facebook_url || ''}
            onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-moss">WhatsApp number</label>
          <input
            value={form.whatsapp_number || ''}
            onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value.replace(/[^\d]/g, '') })}
            placeholder="94771234567"
            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-[#8a8672]">
            Digits only, with country code, no + or spaces. Leave blank to hide the WhatsApp button on the site.
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

function Field({ label, value, onChange, textarea, hint }) {
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-moss">{label}</label>
      {hint && <p className="mb-1 text-xs text-[#8a8672]">{hint}</p>}
      <Tag
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={textarea ? 3 : undefined}
        className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
      />
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
      {hint && <p className="mb-1 text-xs text-[#8a8672]">{hint}</p>}
      <div className="flex items-center gap-3">
        {value && kind === 'video' && (
          <video src={value} muted loop autoPlay playsInline className="h-14 w-14 rounded-sm border border-gold/30 object-cover" />
        )}
        {value && kind === 'image' && (
          <img src={value} alt="" className="h-14 w-14 rounded-sm border border-gold/30 object-cover" />
        )}
        {!value && (
          <span className="flex h-14 w-14 items-center justify-center rounded-sm border border-dashed border-gold/40 text-center text-[0.6rem] text-[#8a8672]">
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

function Section({ title, children }) {
  return (
    <section className="mb-8 rounded-sm border border-gold/30 bg-ivory p-6">
      <h4 className="mb-4 text-lg">{title}</h4>
      <div className="grid gap-4">{children}</div>
    </section>
  )
}

function PageContentEditor() {
  const [form, setForm] = useState(HOMEPAGE_CONTENT_DEFAULTS)
  const [status, setStatus] = useState('idle') // idle | loading | saving | saved
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet('/api/admin/settings/homepage-content')
      .then((res) => setForm({ ...HOMEPAGE_CONTENT_DEFAULTS, ...res.homepage_content }))
      .catch((e) => setError(e.message))
  }, [])

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const save = async (e) => {
    e.preventDefault()
    setStatus('saving')
    setError('')
    try {
      const res = await apiPut('/api/admin/settings/homepage-content', form)
      setForm({ ...HOMEPAGE_CONTENT_DEFAULTS, ...res.homepage_content })
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 1800)
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  return (
    <section>
      <h3 className="mb-2 text-xl">Page Content</h3>
      <p className="mb-6 max-w-2xl text-sm text-[#8a8672]">
        Edit the headlines, copy, photos, and background images on the homepage — no code changes
        needed. Changes go live as soon as you save. Product/service photos and hover videos are
        still edited from their own Products/Services pages, not here.
      </p>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <form onSubmit={save}>
        <Section title="Hero (top of homepage)">
          <Field label="Eyebrow (small text above the headline)" value={form.hero_eyebrow} onChange={set('hero_eyebrow')} />
          <Field label="Headline" value={form.hero_headline} onChange={set('hero_headline')} textarea />
          <Field label="Subtext" value={form.hero_subtext} onChange={set('hero_subtext')} textarea />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button 1 label" value={form.hero_cta1_label} onChange={set('hero_cta1_label')} />
            <Field label="Button 2 label" value={form.hero_cta2_label} onChange={set('hero_cta2_label')} />
          </div>
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

        <Section title="Our Story (About section)">
          <Field label="Eyebrow" value={form.about_eyebrow} onChange={set('about_eyebrow')} />
          <Field
            label="Headline"
            value={form.about_headline}
            onChange={set('about_headline')}
            textarea
            hint="A line break here (press Enter) shows as a line break on the page."
          />
          <Field label="Paragraph 1" value={form.about_paragraph1} onChange={set('about_paragraph1')} textarea />
          <Field label="Paragraph 2" value={form.about_paragraph2} onChange={set('about_paragraph2')} textarea />
          <div className="grid gap-4 border-t border-gold/20 pt-4 sm:grid-cols-2">
            <BackgroundField label="Side photo (next to the text)" value={form.about_image_url} onChange={set('about_image_url')} />
            <BackgroundField label="Background texture" value={form.about_background_url} onChange={set('about_background_url')} />
          </div>
        </Section>

        <Section title="The Ritual (shop preview section)">
          <Field label="Eyebrow" value={form.ritual_eyebrow} onChange={set('ritual_eyebrow')} />
          <Field label="Headline" value={form.ritual_headline} onChange={set('ritual_headline')} />
          <Field label="Subtext" value={form.ritual_subtext} onChange={set('ritual_subtext')} textarea />
          <div className="border-t border-gold/20 pt-4 sm:max-w-xs">
            <BackgroundField label="Background texture" value={form.ritual_background_url} onChange={set('ritual_background_url')} />
          </div>
        </Section>

        <Section title="See It Made (process videos)">
          <p className="-mt-2 text-xs text-[#8a8672]">
            Shows as a row of up to 3 videos on the homepage, with arrows to page through more if
            you add more than 3. Leave this empty to keep showing the original Facebook video.
          </p>
          <VideoListField
            label="Process videos"
            value={form.see_it_made_videos}
            onChange={set('see_it_made_videos')}
          />
        </Section>

        <button
          type="submit"
          disabled={status === 'saving'}
          className="rounded-full bg-forestDeep px-6 py-2.5 text-xs uppercase tracking-wide text-cream disabled:opacity-60"
        >
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Save Page Content'}
        </button>
      </form>
    </section>
  )
}

export default function SettingsPage() {
  return (
    <div>
      <h2 className="mb-6 text-3xl">Settings</h2>
      <BusinessInfoForm />
      <PageContentEditor />
    </div>
  )
}
