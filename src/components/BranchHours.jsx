import React from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'

// Weekday names in the visitor's language (Jan 7 2024 was a Sunday, so
// day 0 = Sunday matches the database).
const dayName = (d, lang) =>
  new Date(2024, 0, 7 + d).toLocaleDateString(lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-LK' : 'en-GB', {
    weekday: 'short',
  })

// Sri Lankan Mon → Sun order, with consecutive days that share the same
// hours grouped into one line ("Mon – Sat  09:00 – 18:00").
const ORDER = [1, 2, 3, 4, 5, 6, 0]

export default function BranchHours({ hours }) {
  const { t, language } = useLanguage()
  if (!hours) return null

  const value = (d) => (hours[String(d)] ? `${hours[String(d)].open} – ${hours[String(d)].close}` : null)
  const groups = []
  for (const d of ORDER) {
    const v = value(d)
    const last = groups[groups.length - 1]
    if (last && last.value === v) last.days.push(d)
    else groups.push({ value: v, days: [d] })
  }

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-moss">{t('hours_title')}</p>
      <ul className="mt-1 space-y-0.5 text-sm text-[#5c5949]">
        {groups.map((g) => (
          <li key={g.days.join('-')} className="flex justify-between gap-4">
            <span>
              {g.days.length > 1
                ? `${dayName(g.days[0], language)} – ${dayName(g.days[g.days.length - 1], language)}`
                : dayName(g.days[0], language)}
            </span>
            <span className={g.value ? '' : 'text-[#8a6d3b]'}>{g.value || t('hours_closed')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
