// Cookie & storage consent.
//
// What the site stores on a visitor's device, and why:
//   necessary   (always on)  login session cookie, the basket, and this
//                            consent choice itself — the shop can't work
//                            without them, so they need no consent.
//   preferences (optional)   remembers the chosen language on this device.
//   thirdParty  (optional)   content from other companies: Google Maps
//                            (branch maps) and the Facebook video player.
//                            Those companies may set their own cookies, so
//                            nothing from them loads until the visitor agrees.
// There are NO analytics or advertising trackers on the site.

export const CONSENT_KEY = 'shaniz_cookie_consent'
const VERSION = 1 // bump if the categories change, to ask visitors again

export function readConsent() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null')
    if (saved && saved.v === VERSION) return saved
  } catch {
    /* unreadable or blocked storage — treat as "not decided yet" */
  }
  return null
}

export function writeConsent({ preferences, thirdParty }) {
  const record = { v: VERSION, preferences: Boolean(preferences), thirdParty: Boolean(thirdParty), decidedAt: new Date().toISOString() }
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record))
  } catch {
    /* if storage is blocked the choice simply lasts for this page view */
  }
  return record
}
