import React, { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatLKR } from '../lib/currency.js'

function todayPlus(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function BookingWidget({ service, open, onClose }) {
  const { user } = useAuth()
  const [date, setDate] = useState(todayPlus(1))
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | booking | booked | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (user) setEmail(user.email)
  }, [user])

  useEffect(() => {
    if (!open || !service) return
    setSlotsLoading(true)
    setSelectedSlot(null)
    apiGet(`/api/bookings/services/${service.id}/slots?date=${date}`)
      .then((res) => setSlots(res.slots))
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setSlotsLoading(false))
  }, [open, service, date])

  if (!open || !service) return null

  const handleBook = async () => {
    setStatus('booking')
    setErrorMsg('')
    try {
      await apiPost('/api/bookings', {
        service_id: service.id,
        booked_date: date,
        booked_time: selectedSlot,
        ...(user ? {} : { guest_email: email }),
      })
      setStatus('booked')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
      // the slot may have just been taken — refresh the list
      apiGet(`/api/bookings/services/${service.id}/slots?date=${date}`).then((res) => setSlots(res.slots))
    }
  }

  const reset = () => {
    setStatus('idle')
    setSelectedSlot(null)
    setEmail('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-forestDeep/55 p-5"
      onClick={(e) => e.target === e.currentTarget && reset()}
    >
      <div className="relative w-full max-w-md rounded-sm bg-ivory p-8">
        <button onClick={reset} className="absolute right-4 top-3.5 text-lg text-forestDeep" aria-label="Close">
          ✕
        </button>

        {status === 'booked' ? (
          <div className="text-center">
            <h3 className="text-2xl">You&rsquo;re booked!</h3>
            <p className="mt-3 text-sm text-[#5c5949]">
              {service.name} on <strong>{date}</strong> at <strong>{selectedSlot?.slice(0, 5)}</strong>.
              A confirmation email is on its way to {email}.
            </p>
            <button
              onClick={reset}
              className="mt-6 rounded-full bg-forestDeep px-6 py-2.5 text-xs uppercase tracking-wide text-cream"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-2xl">Reserve: {service.name}</h3>
            <p className="mt-1 text-sm text-[#5c5949]">
              {service.durationMinutes} minutes · {formatLKR(service.price)}
            </p>

            <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-moss">
              Pick a date
            </label>
            <input
              type="date"
              value={date}
              min={todayPlus(0)}
              max={todayPlus(30)}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
            />

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-moss">
              Available times
            </label>
            <div className="mt-1.5 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
              {slotsLoading && <span className="text-sm text-[#8a8672]">Loading slots…</span>}
              {!slotsLoading && slots.length === 0 && (
                <span className="text-sm text-[#8a8672]">No open slots this day — try another date.</span>
              )}
              {!slotsLoading &&
                slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSlot(s)}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      selectedSlot === s
                        ? 'border-forestDeep bg-forestDeep text-cream'
                        : 'border-gold/30 bg-cream text-forestDeep'
                    }`}
                  >
                    {s.slice(0, 5)}
                  </button>
                ))}
            </div>

            {selectedSlot && !user && (
              <>
                <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-moss">
                  Your email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm"
                />
              </>
            )}
            {selectedSlot && user && (
              <p className="mt-4 text-xs text-[#5c5949]">
                Booking as <strong>{user.email}</strong>
              </p>
            )}

            {errorMsg && <p className="mt-3 text-sm text-[#a35a3a]">{errorMsg}</p>}

            <button
              disabled={!selectedSlot || !email || status === 'booking'}
              onClick={handleBook}
              className="mt-5 w-full rounded-full bg-gold py-3 text-xs font-semibold uppercase tracking-wide text-forestDeep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'booking' ? 'Booking…' : 'Confirm Reservation'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
