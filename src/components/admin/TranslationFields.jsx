import React, { useState } from 'react'
import RichTextEditor from './RichTextEditor.jsx'

const LANGUAGES = [
  { code: 'si', label: 'Sinhala' },
  { code: 'ta', label: 'Tamil' },
]

// Reusable admin block for typing per-language versions of a set of
// fields (e.g. name/description) — used on Products, Services, and the
// homepage content editor. Manual only, no auto-translate (see
// SESSION-SUMMARY.md's "no auto-translate" decision) — collapsed by
// default so admins who aren't ready to translate yet aren't confronted
// with 4+ extra fields on every single product/service.
//
// `fields`: [{ key: 'name', label: 'Name' }, { key: 'description', label: 'Description', richText: true }]
// Reads/writes values[`${key}_si']` / `${key}_ta`] — matches the plain
// suffixed-column approach used in the database (see schema.sql), not a
// nested object, so this drops straight into the same flat form state
// every other field on these forms already uses.
export default function TranslationFields({ values, onChange, fields }) {
  const [open, setOpen] = useState(false)
  const hasAnyTranslation = LANGUAGES.some((lang) => fields.some((f) => values[`${f.key}_${lang.code}`]))

  return (
    <div className="col-span-2 rounded-sm border border-gold/20 bg-cream/50 p-3 md:col-span-5">
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
              <p className="mb-2 text-xs font-semibold text-[#8a8672]">{lang.label}</p>
              <div className="space-y-2">
                {fields.map((f) => {
                  const key = `${f.key}_${lang.code}`
                  return f.richText ? (
                    <RichTextEditor
                      key={key}
                      value={values[key] || ''}
                      onChange={(v) => onChange({ [key]: v })}
                      placeholder={`${f.label} (${lang.label})`}
                      rows={3}
                    />
                  ) : (
                    <input
                      key={key}
                      value={values[key] || ''}
                      onChange={(e) => onChange({ [key]: e.target.value })}
                      placeholder={`${f.label} (${lang.label})`}
                      className="w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
                    />
                  )
                })}
              </div>
            </div>
          ))}
          <p className="text-[0.7rem] text-[#8a8672]">
            Leave any of these blank — the site automatically shows the English version instead for whichever
            language isn&rsquo;t filled in yet.
          </p>
        </div>
      )}
    </div>
  )
}
