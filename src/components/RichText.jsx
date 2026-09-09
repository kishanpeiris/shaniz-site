import React from 'react'

// A deliberately tiny markdown subset — just enough for "a couple of
// sentences, a heading, a few bullet points" (what the AI description
// generator writes, and what the admin's formatting toolbar inserts).
// Not a general markdown renderer: no links, no nested lists, no
// tables. Supported, line by line:
//   ### Heading       -> a small uppercase sub-heading
//   - bullet text      -> grouped into a bulleted list
//   **bold**            -> inline bold, anywhere in a line
//   blank line          -> paragraph break
// Anything else is a plain paragraph line.
function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>
  })
}

// Card previews show a short one-line blurb, not the full formatted
// description — this strips the lightweight markdown back down to
// plain text (drops heading markers and bullet dashes, unwraps bold)
// so a raw "### Why you'll like it" never leaks into a product card.
export function toPlainText(text) {
  if (!text) return ''
  return text
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('### '))
    .map((l) => l.trim().replace(/^[-\u2022]\s+/, '').replace(/\*\*/g, ''))
    .join(' ')
}

export default function RichText({ text, className = '' }) {
  if (!text) return null
  const lines = text.split('\n')

  const blocks = []
  let currentList = null

  const flushList = () => {
    if (currentList) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="mb-3 ml-4 list-disc space-y-1 last:mb-0">
          {currentList.map((item, i) => (
            <li key={i}>{renderInline(item, `li-${blocks.length}-${i}`)}</li>
          ))}
        </ul>
      )
      currentList = null
    }
  }

  lines.forEach((rawLine, i) => {
    const line = rawLine.trim()
    if (!line) {
      flushList()
      return
    }
    if (line.startsWith('### ')) {
      flushList()
      blocks.push(
        <p key={`h-${i}`} className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-moss first:mt-0">
          {line.slice(4)}
        </p>
      )
      return
    }
    if (line.startsWith('- ') || line.startsWith('\u2022 ')) {
      currentList = currentList || []
      currentList.push(line.slice(2))
      return
    }
    flushList()
    blocks.push(
      <p key={`p-${i}`} className="mb-3 last:mb-0">
        {renderInline(line, `p-${i}`)}
      </p>
    )
  })
  flushList()

  return <div className={className}>{blocks}</div>
}
