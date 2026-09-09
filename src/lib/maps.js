// Google's documented "universal" maps link format: opens the native
// Google Maps app on iOS/Android (if installed) and the Maps website on
// desktop — from the same URL, no user-agent sniffing needed.
export function googleMapsUrl(branch) {
  if (!branch) return null
  const query =
    branch.latitude != null && branch.longitude != null ? `${branch.latitude},${branch.longitude}` : branch.address
  if (!query) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
