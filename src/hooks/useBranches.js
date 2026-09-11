import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'

// Public branch list (name, address, phone, optional lat/lng), used by
// the storefront's "Visit Us" branch locator. Fails quietly to an empty
// list — the locator section simply hides itself if this can't load or
// no branches have been added yet, same "don't show a broken section"
// philosophy as useBusinessInfo.js.
export function useBranches() {
  const [branches, setBranches] = useState([])

  useEffect(() => {
    apiGet('/api/branches')
      .then((res) => setBranches(res.branches ?? []))
      .catch(() => setBranches([]))
  }, [])

  return branches
}
