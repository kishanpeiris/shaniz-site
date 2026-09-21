import React from 'react'
import { toDisplayHtml, htmlToPlain } from '../lib/richText.js'

// Shows formatted text (bold, colours, highlights, lists, headings...).
// Works with both new HTML entries and older markdown-style ones; either
// way the result is sanitised before it reaches the page.
export function toPlainText(text) {
  return htmlToPlain(text)
}

export default function RichText({ text, className = '' }) {
  if (!text) return null
  return <div className={`rich-content ${className}`} dangerouslySetInnerHTML={{ __html: toDisplayHtml(text) }} />
}
