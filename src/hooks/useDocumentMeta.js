import { useEffect } from 'react'

const SITE_NAME = "Shani'z"
const DEFAULT_TITLE = "Shani'z — Herbal Hair & Skin Care"

function setMetaTag(attr, key, content) {
  if (!content) return
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(path) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  // Query strings (?q=..., filters, etc.) intentionally left off — the
  // canonical URL should point at the "clean" version of the page so
  // Google doesn't treat every filter combination as a separate page.
  link.setAttribute('href', `${window.location.origin}${path}`)
}

// Sets document.title, <meta name="description">, and a canonical link
// for the CURRENT page — only useful to Google (which does execute this
// site's JavaScript when it crawls). It does NOT help WhatsApp/Facebook
// link previews, since those bots read the raw HTML without running any
// JS — that would need server-side rendering, a bigger change than this.
//
// Usage: call once near the top of a page component.
//   useDocumentMeta({ title: 'Amla Hair Oil', description: '...' })
export function useDocumentMeta({ title, description, path }) {
  useEffect(() => {
    // Always sets a title, even when the caller doesn't pass one — a
    // page navigated to straight from another page (client-side routing,
    // no full reload) would otherwise silently keep showing whatever the
    // PREVIOUS page's title was, since there's no fresh document.title
    // being set by the browser the way there would be on a real page load.
    document.title = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE
    setMetaTag('name', 'description', description)
    setCanonical(path ?? window.location.pathname)
    // No cleanup needed — the next page that calls this hook will just
    // overwrite these same tags on its own mount.
  }, [title, description, path])
}

// Injects (or replaces) a single JSON-LD <script type="application/ld+json">
// block in <head> — this is what lets Google show price/availability/
// rating directly in search results for a product page. Pass `null` to
// remove it (e.g. while a product is still loading).
export function useJsonLd(data) {
  useEffect(() => {
    const id = 'jsonld-page-data'
    let script = document.getElementById(id)
    if (!data) {
      script?.remove()
      return
    }
    if (!script) {
      script = document.createElement('script')
      script.id = id
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(data)
    return () => script?.remove()
  }, [data])
}
