import { useEffect, useState } from 'react'

// Matches Tailwind's `md` breakpoint (768px) — anything narrower counts
// as "mobile" for behavior that can't be done in CSS alone (like
// switching between numbered pagination and infinite scroll).
const QUERY = '(max-width: 767px)'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
  )

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
