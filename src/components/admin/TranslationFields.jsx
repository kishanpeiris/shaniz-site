import React, { useState } from 'react'
import RichTextEditor from './RichTextEditor.jsx'
import { apiPost } from '../../api/client.js'

const LANGUAGES = [
  { code: 'si', label: 'Sinhala' },
  { code: 'ta', label: 'Tamil' },
]

// One-click AI translation for a single field/language pair, sitting
// right next to that field's input. Translates FROM the English value
// already typed into the matching base field (`values[f.key]`) — if
// that's empty there's nothing to translate yet, so the button stays
// disabled with a hint rather than silently doing nothing.
function TranslateButton({ sourceText, targetLang, onTranslated }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleClick = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await apiPost('/api/admin/ai/translate', { text: sourceText, targetLang })
      onTranslated(res.translation)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy || !sourceText?.trim()}
        title={!sourceText?.trim() ? 'Fill in the English version first' : 'Auto-translate from the English text with AI'}
        className="whitespace-nowrap rounded-full border border-gold/40 px-2.5 py-1 text-[0.65rem] uppercase tracking-wide text-forestDeep disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? 'Translating…' : 'Auto-translate'}
      </button>
      {error && <span className="text-[0.65rem] text-[#a35a3a]">{error}</span>}
    </span>
  )
}

// Reusable admin block for typing per-language versions of a set of
// fields (e.g. name/description) — used on Products, Services, and the
// homepage content editor. Each field gets an "Auto-translate" button
// (Gemini, via /api/admin/ai/translate) that fills the field from the
// English source text — the admin can still edit the result afterward,
// this only removes the "type it twice" friction, never saves anything
// on its own.
//
// `fields`: [{ key: 'name', label: 'Name' }, { key: 'description', label: 'Description', richText: true }]
// Reads/writes values[`${key}_si']` / `${key}_ta`] — matches the plain
// suffixed-column approach used in the database (see schema.sql), not a
// nested object, so this drops straight into the same flat form state
// every other field on these forms already uses.
export default function TranslationFields({ values, onChange, fields, spanClassName = 'md:col-span-5' }) {
  const [open, setOpen] = useState(false)
  const hasAnyTranslation = LANGUAGES.some((lang) => fields.some((f) => values[`${f.key}_${lang.code}`]))

  return (
    <div className={`col-span-2 rounded-sm border border-gold/20 bg-cream/50 p-3 ${spanClassName}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-moss"
      >
        <span>Translations (Sinhala / Tamil){hasAnyTranslation && !open ? ' — filled in' : ''}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-4">
          {LANGUAGES.map((lang) => (
            <div key={lang.code}>
              <p className="mb-2 text-xs font-semibold text-[#6a6656]">{lang.label}</p>
              <div className="space-y-2">
                {fields.map((f) => {
                  const key = `${f.key}_${lang.code}`
                  return (
                    <div key={key} className="flex flex-col gap-1.5 sm:flex-row sm:items-start">
                      <div className="flex-1">
                        {f.richText ? (
                          <RichTextEditor
                            value={values[key] || ''}
                            onChange={(v) => onChange({ [key]: v })}
                            placeholder={`${f.label} (${lang.label})`}
                            rows={3}
                          />
                        ) : (
                          <input
                            value={values[key] || ''}
                            onChange={(e) => onChange({ [key]: e.target.value })}
                            placeholder={`${f.label} (${lang.label})`}
                            className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
                          />
                        )}
                      </div>
                      <TranslateButton
                        sourceText={values[f.key]}
                        targetLang={lang.code}
                        onTranslated={(translation) => onChange({ [key]: translation })}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          <p className="text-[0.7rem] text-[#6a6656]">
            Leave any of these blank — the site automatically shows the English version instead for whichever
            language isn&rsquo;t filled in yet. Auto-translate uses AI as a starting point — always worth a quick
            read-through before saving.
          </p>
        </div>
      )}
    </div>
  )
}
