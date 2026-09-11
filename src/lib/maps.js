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

// A visual map PREVIEW box, not a link — this is Google's long-standing
// unofficial "output=embed" iframe trick, which (unlike the Maps Embed
// API) needs no API key or Cloud billing account, just an address or
// lat/lng in the URL. Used purely for the little map image in the
// branch locator card; the click-through still goes through
// googleMapsUrl() above via an overlay link, since the embedded map's
// own dragging/zooming is intentionally disabled there (see
// BranchLocator.jsx) — this is a preview, not an interactive map.
export function googleMapsEmbedUrl(branch) {
  if (!branch) return null
  const query =
    branch.latitude != null && branch.longitude != null ? `${branch.latitude},${branch.longitude}` : branch.address
  if (!query) return null
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`
}
