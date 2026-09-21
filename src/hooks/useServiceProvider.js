import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'
import { DEFAULT_PROVIDER } from '../lib/serviceProvider.js'

// One shared copy of the provider settings for the whole page. A Shop page
// can show dozens of service cards, and they must not each call the server:
// the first component to ask starts a single request and everyone shares
// the answer. `loaded` stays false until it arrives (or fails), so a card
// never flashes the wrong name for a moment.
let current = null
let inflight = null
const listeners = new Set()

function publish(value) {
  current = { ...DEFAULT_PROVIDER, ...value }
  listeners.forEach((fn) => fn(current))
}

function load() {
  if (inflight) return inflight
  inflight = apiGet('/api/site/service-provider')
    .then((res) => publish(res.service_provider || {}))
    // If the server can't be reached, fall back to the built-in defaults
    // rather than showing nothing at all.
    .catch(() => publish({}))
    .finally(() => {
      inflight = null
    })
  return inflight
}

// Called by the admin editor right after a successful save, so every open
// component updates immediately without a page refresh.
export function setServiceProvider(value) {
  publish(value)
}

export function useServiceProvider() {
  const [provider, setProvider] = useState(current)

  useEffect(() => {
    listeners.add(setProvider)
    if (current) setProvider(current)
    else load()
    return () => listeners.delete(setProvider)
  }, [])

  return { provider: provider || DEFAULT_PROVIDER, loaded: Boolean(provider) }
}
