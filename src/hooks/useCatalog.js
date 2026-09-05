import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'
import { normalizeProduct } from '../lib/normalizeProduct.js'

export function useCatalog() {
  const [state, setState] = useState({ loading: true, error: null, products: [], services: [] })

  useEffect(() => {
    let cancelled = false

    Promise.all([apiGet('/api/products'), apiGet('/api/services')])
      .then(([productsRes, servicesRes]) => {
        if (cancelled) return
        const products = productsRes.products.map(normalizeProduct)
        const services = servicesRes.services.map((s) => ({
          id: s.id,
          type: 'service',
          name: s.name,
          tagline: `${s.service_type === 'bookable' ? 'In-Studio' : 'Add to Basket'} · ${
            s.duration_minutes ? `${s.duration_minutes} Minutes` : ''
          }`,
          description: s.description,
          price: Number(s.price_lkr),
          serviceType: s.service_type,
          durationMinutes: s.duration_minutes,
          unitsSold: Number(s.units_sold) || 0,
        }))
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
