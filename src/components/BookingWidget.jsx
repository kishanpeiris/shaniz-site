import React, { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../api/client.js'
import { useCart } from '../context/CartContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { googleMapsUrl } from '../lib/maps.js'
import Price from './Price.jsx'
import ProviderBadge from './ProviderBadge.jsx'
import { useServiceProvider } from '../hooks/useServiceProvider.js'
import { providerBranchLabel } from '../lib/serviceProvider.js'

// Today's date in the visitor's own time zone (toISOString would use UTC and
// show "yesterday's" or "tomorrow's" date for part of the day in Sri Lanka).
function localDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Booking a service: choose a branch (if it is offered at several), a date
 * and a time, then "Add to basket". The slot is held for a few minutes while
 * the customer checks out and pays; the booking is confirmed after payment.
 *
 * `replacing` (optional) = an existing basket line being changed.
 */
export default function BookingWidget({ service, open, onClose, replacing }) {
  const { t } = useLanguage()
  const { provider } = useServiceProvider()
  const { addBooking, removeItem } = useCart()
  const branches = service?.branches || []

  const [branchId, setBranchId] = useState('')
  const [date, setDate] = useState(localDate(1))
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Start fresh each time it opens (or pre-fill when changing a basket line).
  useEffect(() => {
    if (!open) return
    setError('')
    setSelectedSlot(null)
    if (replacing) {
      setBranchId(replacing.booking.branchId)
      setDate(replacing.booking.date)
    } else {
      setBranchId(branches.length === 1 ? branches[0].id : '')
      setDate(localDate(1))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, service?.id, replacing?.id])

  useEffect(() => {
    if (!open || !service || !branchId) {
      setSlots([])
      return
    }
    let cancelled = false
    setSlotsLoading(true)
    setSlotsError('')
    setSelectedSlot(null)
    apiGet(`/api/bookings/services/${service.id}/slots?date=${date}&branch_id=${branchId}`)
      .then((r) => !cancelled && setSlots(r.slots))
      .catch((e) => {
        if (cancelled) return
        setSlots([])
        setSlotsError(e.message)
      })
      .finally(() => !cancelled && setSlotsLoading(false))
    return () => {
      cancelled = true
    }
  }, [open, service?.id, date, branchId])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !service) return null

  const branch = branches.find((b) => b.id === branchId)

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      const { hold } = await apiPost('/api/bookings/hold', {
        service_id: service.id,
        branch_id: branchId,
        booked_date: date,
        booked_time: selectedSlot,
      })
      addBooking(service, {
        holdId: hold.id,
        holdToken: hold.token,
        expiresAt: hold.expires_at,
        date,
        time: selectedSlot.slice(0, 5),
        branchId,
        branchName: branch?.name,
        branchAddress: branch?.address,
        durationMinutes: service.durationMinutes,
      })
      // Changing an existing line: let go of the old slot now the new one is safe.
      if (replacing) removeItem(replacing.id)
      onClose()
    } catch (err) {
      setError(err.message)
      // the slot list may be out of date — refresh it
      setDate((d) => d)
    } finally {
      setBusy(false)
    }
  }

  const inputClass = 'w-full rounded-sm border border-gold/30 bg-cream px-3 py-2.5 text-base'
  const labelClass = 'mt-4 block text-xs font-semibold uppercase tracking-wide text-moss'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-forestDeep/55 p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="relative w-full max-w-md overflow-y-auto rounded-sm bg-ivory p-7 sm:p-8"
        style={{ maxHeight: '90vh' }}
      >
        <button onClick={onClose} className="absolute right-4 top-3.5 text-lg text-forestDeep" aria-label={t('common_close')}>
          ✕
        </button>

        <h3 id="booking-title" className="pr-6 text-2xl">
          {t(replacing ? 'book_change_title' : 'book_reserve_title', { name: service.name })}
        </h3>
        <p className="mt-1 text-sm text-[#5c5949]">
          {t('book_minutes', { n: service.durationMinutes })} · <Price item={service} />
        </p>
        <ProviderBadge variant="block" className="mt-4" />

        {branches.length === 0 ? (
          <p className="mt-6 text-sm text-[#a35a3a]">{t('book_no_branches')}</p>
        ) : (
          <>
            {branches.length > 1 && (
              <fieldset className="mt-4">
                <legend className="text-xs font-semibold uppercase tracking-wide text-moss">{t('book_choose_branch')}</legend>
                <div className="mt-2 space-y-2">
                  {branches.map((b) => (
                    <label
                      key={b.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-sm border p-3 ${
                        branchId === b.id ? 'border-forestDeep bg-cream' : 'border-gold/30'
                      }`}
                    >
                      <input type="radio" name="branch" checked={branchId === b.id} onChange={() => setBranchId(b.id)} className="mt-1" />
                      <span className="text-sm">
                        <span className="block font-semibold text-forestDeep">{providerBranchLabel(provider, b.name)}</span>
                        <span className="block text-[#5c5949]">{b.address}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {branches.length === 1 && (
              <p className="mt-2 text-sm text-[#5c5949]">
                📍 {providerBranchLabel(provider, branches[0].name)}, {branches[0].address}{' '}
                <a href={googleMapsUrl(branches[0])} target="_blank" rel="noopener noreferrer" className="underline text-forestDeep">
                  {t('common_get_directions')}
                </a>
              </p>
            )}

            {branchId && (
              <>
                <label htmlFor="booking-date" className={labelClass}>{t('book_pick_date')}</label>
                <input
                  id="booking-date"
                  type="date"
                  value={date}
                  min={localDate(0)}
                  max={localDate(60)}
                  onChange={(e) => setDate(e.target.value)}
                  className={`mt-1.5 ${inputClass}`}
                />

                <p className={labelClass}>{t('book_available_times')}</p>
                <div className="mt-1.5 flex max-h-40 flex-wrap gap-2 overflow-y-auto" role="group" aria-label={t('book_available_times')}>
                  {slotsLoading && <span className="text-sm text-[#6a6656]">{t('book_loading_slots')}</span>}
                  {!slotsLoading && slotsError && <span className="text-sm text-[#a35a3a]">{slotsError}</span>}
                  {!slotsLoading && !slotsError && slots.length === 0 && (
                    <span className="text-sm text-[#6a6656]">{t('book_no_slots')}</span>
                  )}
                  {slots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSlot(s)}
                      aria-pressed={selectedSlot === s}
                      className={`rounded-full border px-4 py-2 text-sm ${
                        selectedSlot === s ? 'border-forestDeep bg-forestDeep text-cream' : 'border-gold/40 bg-cream text-forestDeep hover:bg-gold/20'
                      }`}
                    >
                      {s.slice(0, 5)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {error && <p role="alert" className="mt-4 text-sm text-[#a35a3a]">{error}</p>}

            <button
              type="button"
              onClick={submit}
              disabled={!selectedSlot || busy}
              className="mt-6 w-full rounded-full bg-gold py-3.5 text-xs uppercase tracking-wide text-forestDeep disabled:opacity-50"
            >
              {busy ? t('book_adding') : t(replacing ? 'book_change_button' : 'book_add_to_basket')}
            </button>
            <p className="mt-3 text-center text-xs text-[#6a6656]">{t('book_reserve_note', { minutes: 20 })}</p>
          </>
        )}
      </div>
    </div>
  )
}
