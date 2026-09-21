import DOMPurify from 'dompurify'

// Formatted text (descriptions, story paragraphs) is stored as small,
// safe HTML. Older entries were written in a tiny markdown-like style
// (### Heading, **bold**, - bullets); those are converted on the fly, so
// nothing already saved has to be redone.

const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'span', 'mark', 'a', 'div']
const COLOR_RE = /^(#[0-9a-fA-F]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)|[a-zA-Z]{3,20})$/

// Keep only harmless style properties (text colour, highlight, alignment).
function cleanStyle(style) {
  return style
    .split(';')
    .map((decl) => decl.split(':').map((s) => s.trim()))
    .filter(([prop, val]) => {
      if (!prop || !val) return false
      if (prop === 'color' || prop === 'background-color') return COLOR_RE.test(val)
      if (prop === 'text-align') return ['left', 'center', 'right', 'justify'].includes(val)
      return false
    })
    .map(([p, v]) => `${p}: ${v}`)
    .join('; ')
}

let hooked = false
function ensureHooks() {
  if (hooked) return
  hooked = true
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.hasAttribute && node.hasAttribute('style')) {
      const cleaned = cleanStyle(node.getAttribute('style') || '')
      if (cleaned) node.setAttribute('style', cleaned)
      else node.removeAttribute('style')
    }
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

export function sanitizeHtml(html) {
  ensureHooks()
  return DOMPurify.sanitize(html || '', {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['style', 'href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:)/i,
  })
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const looksLikeHtml = (text) => /<\/?(p|h[1-6]|ul|ol|li|strong|em|b|i|u|s|span|div|br|a|mark|blockquote)\b/i.test(text || '')

// Old markdown-ish text -> HTML. Stray * and # marks that don't form a
// proper pair (a common cause of "**" showing up on the page) are removed.
export function legacyToHtml(text) {
  if (!text) return ''
  const inline = (raw) => {
    let s = escapeHtml(raw)
    s = s.replace(/\*\*\*([^*]+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    s = s.replace(/\*([^*\s][^*]*?)\*/g, '<em>$1</em>')
    return s.replace(/\*+/g, '') // anything left over is a typo, not content
  }
  const html = []
  let list = null
  const flush = () => {
    if (list) {
      html.push(`<ul>${list.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`)
      list = null
    }
  }
  for (const rawLine of String(text).split('\n')) {
    const line = rawLine.trim()
    if (!line) {
      flush()
      continue
    }
    const h = line.match(/^#{1,4}\s+(.*)$/)
    if (h) {
      flush()
      html.push(`<h3>${inline(h[1])}</h3>`)
    } else if (/^[-•]\s+/.test(line)) {
      list = list || []
      list.push(line.replace(/^[-•]\s+/, ''))
    } else {
      flush()
      html.push(`<p>${inline(line)}</p>`)
    }
  }
  flush()
  return html.join('')
}

// What to show on the storefront / load into the editor.
export const toDisplayHtml = (text) => sanitizeHtml(looksLikeHtml(text) ? text : legacyToHtml(text))

// Plain one-line text, for card previews.
export function htmlToPlain(text) {
  if (!text) return ''
  const html = looksLikeHtml(text) ? text : legacyToHtml(text)
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('h2, h3, h4').forEach((h) => h.remove()) // headings aren't blurb material
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
}
