import React from 'react'

// Advance-warning banner — separate from maintenance mode itself. The
// backend only returns an outage here if it starts within 48 hours or is
// already in progress (see site.routes.js), so this component just
// renders whatever it's given without re-checking timing.
export default function OutageBanner({ outage }) {
  if (!outage) return null

  const starts = new Date(outage.starts_at)
  const isActive = outage.status === 'in_progress' || Date.now() >= starts.getTime()

  return (
    <div className="bg-gold/90 px-4 py-2 text-center text-xs font-medium text-forestDeep">
      {isActive
        ? `Site will be briefly unavailable shortly${outage.reason ? ` — ${outage.reason}` : ''}.`
        : `Heads up: the site will be briefly unavailable on ${starts.toLocaleString()}${
            outage.reason ? ` for ${outage.reason}` : ''
          }.`}
    </div>
  )
}
