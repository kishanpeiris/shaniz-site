import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'
import { normalizeService } from '../lib/normalizeService.js'

export function useService(id) {
  const [state, setState] = useState({ loading: true, error: null, service: null })

  useEffect(() => {
    let cancelled = false
    setState({ loading: true, error: null, service: null })

    apiGet(`/api/services/${id}`)
      .then((res) => {
        if (cancelled) return
        setState({ loading: false, error: null, service: normalizeService(res.service) })
      })
      .catch((err) => {
        if (cancelled) return
        setState({ loading: false, error: err.message, service: null })
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return state
}
