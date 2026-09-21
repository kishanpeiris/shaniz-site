import React, { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { apiGet } from '../api/client.js'
import { normalizeService } from '../lib/normalizeService.js'
import { formatCalendarDate } from '../lib/date.js'
import BookingWidget from './BookingWidget.jsx'
import { useServiceProvider } from '../hooks/useServiceProvider.js'
import { providerBranchLabel } from '../lib/serviceProvider.js'

function useCountdown(expiresAt) {
  const [left, setLeft] = useState(() => Math.max(0, new Date(expiresAt) - Date.now()))
  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, new Date(expiresAt) - Date.now())), 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  const m = Math.floor(left / 60000)
  const s = Math.floor((left % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

// The appointment details shown under a bookable service in the basket:
// when, where, how long the slot is held, and a button to change branch/time.
export default function BookingLine({ item, tone = 'light' }) {
  const { t } = useLanguage()
  const { provider } = useServiceProvider()
  const [service, setService] = useState(null) // loaded when "Change" is pressed
  const left = useCountdown(item.booking.expiresAt)
  const muted = tone === 'dark' ? 'text-cream/75' : 'text-[#5c5949]'

  return (
    <div className={`mt-1 space-y-0.5 text-sm ${muted}`}>
      <p>
        📅 {formatCalendarDate(item.booking.date)} · {item.booking.time}
        {item.booking.durationMinutes ? ` · ${t('book_minutes', { n: item.booking.durationMinutes })}` : ''}
      </p>
      <p>📍 {providerBranchLabel(provider, item.booking.branchName)}</p>
      <p className="text-xs">⏳ {t('cart_reserved_for', { time: left })}</p>
      <button
        type="button"
        onClick={() => apiGet(`/api/services/${item.serviceId}`).then((r) => setService(normalizeService(r.service))).catch(() => {})}
        className="text-sm underline"
      >
        {t('cart_change_booking')}
      </button>
      {service && <BookingWidget service={service} open replacing={item} onClose={() => setService(null)} />}
    </div>
  )
}
