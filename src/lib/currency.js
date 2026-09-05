// Single source of truth for displaying money across the site.
// Sri Lanka only sells in LKR, so this always formats as "LKR 1,850.00".
export function formatLKR(amount) {
  const n = Number(amount) || 0
  return 'LKR ' + n.toLocaleString('en-US', { minimumFractionDigits: 2 })
}
