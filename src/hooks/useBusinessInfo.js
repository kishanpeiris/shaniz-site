import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'

const FALLBACK = {
  phone: '+94 XX XXX XXXX',
  email: 'hello@shaniz.lk',
  address: 'Colombo, Sri Lanka',
  facebook_url: 'https://www.facebook.com/share/r/18w79k89Zo/',
  whatsapp_number: '',
}

// Business info is editable from the admin Settings page — this hook is
// how the public storefront picks up whatever the admin last saved,
// falling back to sensible placeholders if the API isn't reachable yet.
export function useBusinessInfo() {
  const [info, setInfo] = useState(FALLBACK)

  useEffect(() => {
    apiGet('/api/site/status')
      .then((res) => {
        if (res.business_info) setInfo({ ...FALLBACK, ...res.business_info })
      })
      .catch(() => {
        // keep fallback values — not worth surfacing an error for this
      })
  }, [])

  return info
}
