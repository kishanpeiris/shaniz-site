import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'
import { normalizeProduct } from '../lib/normalizeProduct.js'
import { normalizeService } from '../lib/normalizeService.js'

export function useCatalog() {
  const [state, setState] = useState({ loading: true, error: null, products: [], services: [] })

  useEffect(() => {
    let cancelled = false

    Promise.all([apiGet('/api/products'), apiGet('/api/services')])
      .then(([productsRes, servicesRes]) => {
        if (cancelled) return
        const products = productsRes.products.map(normalizeProduct)
        const services = servicesRes.services.map(normalizeService)
        setState({ loading: false, error: null, products, services })
      })
      .catch((err) => {
        if (cancelled) return
        setState({ loading: false, error: err.message, products: [], services: [] })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
