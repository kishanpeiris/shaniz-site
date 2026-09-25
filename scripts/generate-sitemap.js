// Rebuilds public/sitemap.xml with the site's static pages plus one
// <url> entry per product and service currently in the catalog.
//
// Run this:
//   - once before launch (after the real catalog is loaded)
//   - again any time you add/remove several products or services
//
// Usage (from the shaniz-site folder):
//   SITE_URL=https://shaniz.lk API_URL=https://shaniz-api.onrender.com node scripts/generate-sitemap.js
// Both env vars are optional — they default to the values below, which
// match this project's current Vercel/Render URLs.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const SITE_URL = (process.env.SITE_URL || 'https://shaniz-site.vercel.app').replace(/\/$/, '')
const API_URL = (process.env.API_URL || 'https://shaniz-api.onrender.com').replace(/\/$/, '')

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} responded ${res.status}`)
  return res.json()
}

function urlEntry(loc, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`
}

async function main() {
  console.log(`Fetching catalog from ${API_URL} ...`)
  const [products, services] = await Promise.all([
    fetchJson(`${API_URL}/api/products`).catch((err) => {
      console.warn('Could not fetch products, skipping:', err.message)
      return []
    }),
    fetchJson(`${API_URL}/api/services`).catch((err) => {
      console.warn('Could not fetch services, skipping:', err.message)
      return []
    }),
  ])

  const entries = [
    urlEntry(`${SITE_URL}/`, '1.0'),
    urlEntry(`${SITE_URL}/shop`, '0.9'),
    ...(products.products || []).map((p) => urlEntry(`${SITE_URL}/product/${p.id}`, '0.7')),
    ...(services.services || []).map((s) => urlEntry(`${SITE_URL}/service/${s.id}`, '0.7')),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`

  const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml')
  writeFileSync(outPath, xml)
  console.log(`Wrote ${entries.length} URLs to ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
