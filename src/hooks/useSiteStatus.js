import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'

// Polls the public status endpoint so a maintenance window an admin
// schedules actually takes effect for everyone browsing right now,
// without requiring a hard refresh — and so it also turns itself back
// off automatically once ends_at passes, without the admin needing to
// remember to log back in.
const POLL_INTERVAL_MS = 30_000

export function useSiteStatus() {
  const [state, setState] = useState({
    loading: true,
    maintenanceMode: false,
    maintenanceSchedule: null,
    upcomingOutage: null,
  })

  useEffect(() => {
    let cancelled = false

    const poll = () => {
      apiGet('/api/site/status')
        .then((res) => {
          if (cancelled) return
          setState({
            loading: false,
            maintenanceMode: Boolean(res.maintenance_mode),
            maintenanceSchedule: res.maintenance_schedule || null,
            upcomingOutage: res.upcoming_outage || null,
          })
        })
        .catch(() => {
          // If the API is briefly unreachable, don't flip into maintenance
          // mode as a side effect — fail open, not closed, so a network
          // hiccup for one visitor doesn't look like the whole site is
          // down for them.
          if (!cancelled) setState((s) => ({ ...s, loading: false }))
        })
    }

    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return state
}
