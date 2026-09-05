import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'
import { normalizeProduct } from '../lib/normalizeProduct.js'

export function useProduct(id) {
  const [state, setState] = useState({ loading: true, error: null, product: null })

  useEffect(() => {
    let cancelled = false
    setState({ loading: true, error: null, product: null })

    apiGet(`/api/products/${id}`)
      .then((res) => {
        if (cancelled) return
        setState({ loading: false, error: null, product: normalizeProduct(res.product) })
      })
      .catch((err) => {
        if (cancelled) return
        setState({ loading: false, error: err.message, product: null })
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return state
}
