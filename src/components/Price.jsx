import React from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { formatLKR } from '../lib/currency.js'

// A price. When there is a live discount it shows the new price, the old
// price crossed out, and a small badge (e.g. -20%).
export default function Price({ item, className = '' }) {
  const { t } = useLanguage()
  if (item.listPrice == null) return <span className={className}>{formatLKR(item.price)}</span>
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      <span>{formatLKR(item.price)}</span>
      <s className="text-[0.7em] font-normal opacity-60">
        <span className="sr-only">{t('price_was')} </span>
        {formatLKR(item.listPrice)}
      </s>
      <span className="rounded-full bg-[#a35a3a] px-2 py-0.5 text-[0.6em] font-semibold tracking-wide text-white">
        {item.discountLabel}
      </span>
    </span>
  )
}
