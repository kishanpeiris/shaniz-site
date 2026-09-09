import React, { useRef } from 'react'

// A plain <textarea> with a small formatting toolbar above it, rather
// than a full WYSIWYG editor — it writes the same lightweight markdown
// subset that RichText.jsx (the customer-facing renderer) understands
// and that the AI description generator already outputs, so "what you
// type is what shows up" without pulling in a heavy rich-text editor
// dependency for four formatting options.
const TOOLS = [
  { label: 'B', title: 'Bold', wrap: '**' },
  { label: 'H', title: 'Heading', line: '### ' },
  { label: '\u2022 List', title: 'Bullet point', line: '- ' },
]

export default function RichTextEditor({ value, onChange, placeholder, rows = 6, className = '' }) {
  const ref = useRef(null)

  const applyWrap = (marker) => {
    const el = ref.current
    if (!el) return
    const { selectionStart: start, selectionEnd: end } = el
    const selected = value.slice(start, end) || 'text'
    const next = value.slice(0, start) + marker + selected + marker + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + marker.length, start + marker.length + selected.length)
    })
  }

  const applyLinePrefix = (prefix) => {
    const el = ref.current
    if (!el) return
    const { selectionStart: start } = el
    // Find the start of the current line so the prefix lands at the
    // beginning of it, not wherever the cursor happens to be.
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, start + prefix.length)
    })
  }

  return (
    <div>
      <div className="mb-1 flex gap-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.label}
            type="button"
            title={tool.title}
            onClick={() => (tool.wrap ? applyWrap(tool.wrap) : applyLinePrefix(tool.line))}
            className="rounded-sm border border-gold/30 bg-cream px-2 py-1 text-xs font-semibold text-forestDeep hover:bg-gold/20"
          >
            {tool.label}
          </button>
        ))}
        <span className="ml-1 self-center text-[0.65rem] text-[#8a8672]">
          Select text first for Bold, or place your cursor on a line for Heading/List.
        </span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full rounded-sm border border-gold/30 bg-cream px-3 py-2 text-sm leading-relaxed ${className}`}
      />
    </div>
  )
}
