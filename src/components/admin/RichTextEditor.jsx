import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toDisplayHtml, sanitizeHtml } from '../../lib/richText.js'

// A visual ("what you see is what you get") text editor. Type, then use the
// toolbar to make text bold, coloured, highlighted, a heading, a list…
// The box is styled like the live website, so it looks the way customers
// will see it. Saved as small, safe HTML.

const CSS_COMMANDS = new Set(['foreColor', 'hiliteColor', 'justifyLeft', 'justifyCenter'])
const TEXT_COLORS = ['#1f2d24', '#4a6b45', '#b8933f', '#a35a3a', '#b23a48', '#1d4ed8', '#6b7280', '#ffffff']
const HIGHLIGHTS = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa']

function Btn({ label, title, onClick, active, children, className = '' }) {
  return (
    <button
      type="button"
      title={title || label}
      aria-label={label}
      aria-pressed={active}
      // mousedown would move focus out of the text and lose the selection
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-sm border px-2 text-sm ${
        active ? 'border-forestDeep bg-forestDeep text-cream' : 'border-gold/30 bg-cream text-forestDeep hover:bg-gold/15'
      } ${className}`}
    >
      {children}
    </button>
  )
}

function Swatches({ colors, onPick, onClear, clearLabel }) {
  return (
    <>
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={c}
          title={c}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(c)}
          className="h-6 w-6 rounded-full border border-black/20"
          style={{ backgroundColor: c }}
        />
      ))}
      {onClear && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClear}
          className="rounded-sm border border-gold/30 px-1.5 py-0.5 text-[0.7rem] text-forestDeep"
        >
          {clearLabel}
        </button>
      )}
    </>
  )
}

export default function RichTextEditor({ value, onChange, placeholder, rows = 6, className = '' }) {
  const ref = useRef(null)
  const lastEmitted = useRef(null)
  const savedRange = useRef(null)
  const [panel, setPanel] = useState(null) // 'color' | 'highlight' | null

  // Load (or reload, if changed from outside) the content into the editor.
  useEffect(() => {
    if (!ref.current || value === lastEmitted.current) return
    ref.current.innerHTML = toDisplayHtml(value || '')
    lastEmitted.current = value
  }, [value])

  const emit = useCallback(() => {
    if (!ref.current) return
    let html = sanitizeHtml(ref.current.innerHTML)
    if (!ref.current.textContent.trim() && !/<(ul|ol|li|img)/i.test(html)) html = ''
    lastEmitted.current = html
    onChange(html)
  }, [onChange])

  // Remember where the cursor/selection is, so colour choices still apply
  // to the right words after the pop-out panel is used.
  useEffect(() => {
    const onSel = () => {
      const sel = window.getSelection()
      if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) savedRange.current = sel.getRangeAt(0).cloneRange()
    }
    document.addEventListener('selectionchange', onSel)
    return () => document.removeEventListener('selectionchange', onSel)
  }, [])

  const restore = () => {
    ref.current?.focus()
    const r = savedRange.current
    if (r) {
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(r)
    }
  }

  const exec = (cmd, arg = null) => {
    restore()
    // Colours, highlights and alignment are saved as safe inline styles;
    // bold / italic / underline / lists use real tags (<b>, <i>, <u>…).
    document.execCommand('styleWithCSS', false, CSS_COMMANDS.has(cmd))
    document.execCommand(cmd, false, arg)
    emit()
  }

  const block = (tag) => exec('formatBlock', `<${tag}>`)
  const isBlock = (tag) => {
    try {
      return document.queryCommandValue('formatBlock').toLowerCase() === tag
    } catch {
      return false
    }
  }
  const active = (cmd) => {
    try {
      return document.queryCommandState(cmd)
    } catch {
      return false
    }
  }

  const addLink = () => {
    restore()
    const url = window.prompt('Link address (must start with https://):', 'https://')
    if (url && /^(https?:\/\/|mailto:|tel:)/i.test(url.trim())) exec('createLink', url.trim())
  }

  const onPaste = (e) => {
    // Paste as plain text so junk formatting from Word/websites doesn't sneak in.
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const minHeight = `${Math.max(rows, 8) * 1.9}rem`

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1.5 rounded-t-sm border border-b-0 border-gold/30 bg-ivory p-2">
        <Btn label="Bold" onClick={() => exec('bold')} active={active('bold')}><strong>B</strong></Btn>
        <Btn label="Italic" onClick={() => exec('italic')} active={active('italic')}><em>I</em></Btn>
        <Btn label="Underline" onClick={() => exec('underline')} active={active('underline')}><span className="underline">U</span></Btn>
        <Btn label="Strikethrough" onClick={() => exec('strikeThrough')} active={active('strikeThrough')}><span className="line-through">S</span></Btn>
        <span className="mx-1 h-6 w-px bg-gold/30" aria-hidden="true" />
        <Btn label="Large title" title="Large title" onClick={() => (isBlock('h2') ? block('p') : block('h2'))} active={isBlock('h2')}>Title</Btn>
        <Btn label="Small heading" title="Small heading (uppercase label)" onClick={() => (isBlock('h3') ? block('p') : block('h3'))} active={isBlock('h3')}>H</Btn>
        <Btn label="Normal paragraph" onClick={() => block('p')}>¶</Btn>
        <span className="mx-1 h-6 w-px bg-gold/30" aria-hidden="true" />
        <Btn label="Bulleted list" onClick={() => exec('insertUnorderedList')} active={active('insertUnorderedList')}>• List</Btn>
        <Btn label="Numbered list" onClick={() => exec('insertOrderedList')} active={active('insertOrderedList')}>1. List</Btn>
        <Btn label="Align left" onClick={() => exec('justifyLeft')}>⇤</Btn>
        <Btn label="Align centre" onClick={() => exec('justifyCenter')}>↔</Btn>
        <span className="mx-1 h-6 w-px bg-gold/30" aria-hidden="true" />
        <Btn label="Text colour" title="Text colour" onClick={() => setPanel(panel === 'color' ? null : 'color')} active={panel === 'color'}>
          <span className="flex flex-col items-center leading-none"><span className="font-bold">A</span><span className="mt-0.5 h-1 w-4 rounded bg-[#b23a48]" /></span>
        </Btn>
        <Btn label="Highlight" title="Highlight" onClick={() => setPanel(panel === 'highlight' ? null : 'highlight')} active={panel === 'highlight'}>
          <span className="rounded bg-[#fde68a] px-1 font-bold">ab</span>
        </Btn>
        <Btn label="Add link" onClick={addLink}>🔗</Btn>
        <Btn label="Clear formatting" title="Clear formatting (back to plain text)" onClick={() => { exec('removeFormat'); block('p') }}>Tx</Btn>
        <span className="mx-1 h-6 w-px bg-gold/30" aria-hidden="true" />
        <Btn label="Undo" onClick={() => exec('undo')}>↶</Btn>
        <Btn label="Redo" onClick={() => exec('redo')}>↷</Btn>
      </div>

      {panel && (
        <div className="flex flex-wrap items-center gap-2 border border-b-0 border-gold/30 bg-cream px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-moss">{panel === 'color' ? 'Text colour' : 'Highlight'}</span>
          <Swatches
            colors={panel === 'color' ? TEXT_COLORS : HIGHLIGHTS}
            onPick={(c) => exec(panel === 'color' ? 'foreColor' : 'hiliteColor', c)}
            onClear={panel === 'highlight' ? () => exec('hiliteColor', 'transparent') : undefined}
            clearLabel="No highlight"
          />
          <label className="ml-1 flex items-center gap-1.5 text-xs text-[#5c5949]">
            Custom
            <input
              type="color"
              aria-label="Pick any colour"
              defaultValue={panel === 'color' ? '#b23a48' : '#fde68a'}
              onChange={(e) => exec(panel === 'color' ? 'foreColor' : 'hiliteColor', e.target.value)}
              className="h-7 w-9 cursor-pointer rounded border border-gold/30 bg-transparent p-0"
            />
          </label>
        </div>
      )}

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Text editor"
        data-placeholder={placeholder || 'Start typing…'}
        onInput={emit}
        onBlur={emit}
        onPaste={onPaste}
        onFocus={() => document.execCommand('defaultParagraphSeparator', false, 'p')}
        className="rich-content rich-editor w-full overflow-auto rounded-b-sm border border-gold/30 bg-white px-4 py-3 text-base text-[#3d3a2e] focus:border-forestDeep focus:outline-none"
        style={{ minHeight, resize: 'vertical' }}
      />
      <p className="mt-1 text-xs text-[#6a6656]">
        Select some text, then use the buttons above. What you see here is how it will look on the website.
      </p>
    </div>
  )
}
