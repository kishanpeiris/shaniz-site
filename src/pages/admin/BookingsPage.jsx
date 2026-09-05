import React, { useEffect, useState } from 'react'
import { apiGet, apiPut } from '../../api/client.js'
import { formatCalendarDate } from '../../lib/date.js'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')

  const load = () => apiGet('/api/bookings').then((r) => setBookings(r.bookings)).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const cancel = async (id) => {
    setError('')
    try {
      await apiPut(`/api/bookings/${id}`, { status: 'cancelled' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const complete = async (id) => {
    setError('')
    try {
      await apiPut(`/api/bookings/${id}`, { status: 'completed' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-3xl">Upcoming Bookings</h2>
      {error && <p className="mb-4 text-sm text-[#a35a3a]">{error}</p>}

      <div className="overflow-x-auto rounded-sm border border-gold/30 bg-ivory">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/30 text-xs uppercase tracking-wide text-moss">
            <tr>
              <th className="p-3">Service</th>
              <th className="p-3">Date</th>
              <th className="p-3">Time</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-gold/15">
                <td className="p-3">{b.service_name}</td>
                <td className="p-3">{formatCalendarDate(b.booked_date)}</td>
                <td className="p-3">{b.booked_time.slice(0, 5)}</td>
                <td className="p-3">{b.guest_email || b.user_id}</td>
                <td className="p-3 capitalize">{b.status}</td>
                <td className="p-3 whitespace-nowrap">
                  {b.status === 'confirmed' && (
                    <>
                      <button onClick={() => complete(b.id)} className="mr-2 text-xs underline text-forestDeep">Mark completed</button>
                      <button onClick={() => cancel(b.id)} className="text-xs underline text-[#a35a3a]">Cancel</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-[#8a8672]">No upcoming bookings.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
