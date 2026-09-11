import React from 'react'
import RowCarousel from './RowCarousel.jsx'
import { googleMapsUrl, googleMapsEmbedUrl } from '../lib/maps.js'

function BranchCard({ branch }) {
  const mapsUrl = googleMapsUrl(branch)
  const embedUrl = googleMapsEmbedUrl(branch)

  return (
    <div className="overflow-hidden rounded-sm border border-gold/30 bg-ivory">
      {/* Map preview — deliberately non-interactive (pointer-events-none
          on the iframe itself). A real map you can accidentally drag
          around inside a small box is a worse experience on a phone
          than a plain "tap to open in Maps" image would be, so all
          clicks are caught by the transparent link layered on top
          instead, opening the full Google Maps app/site in a new tab. */}
      <div className="relative aspect-[16/9] w-full bg-forestDeep/10">
        {embedUrl && (
          <iframe
            title={`Map showing ${branch.name}`}
            src={embedUrl}
            loading="lazy"
            className="pointer-events-none absolute inset-0 h-full w-full border-0"
            aria-hidden="true"
            tabIndex={-1}
          />
        )}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${branch.name} in Google Maps`}
            className="absolute inset-0 flex items-end justify-end p-3"
          >
            <span className="rounded-full bg-forestDeep/90 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-cream shadow-brand">
              Get Directions ↗
            </span>
          </a>
        )}
      </div>

      <div className="p-5">
        <h4 className="text-lg">{branch.name}</h4>
        <p className="mt-1 text-sm text-[#5c5949]">{branch.address}</p>
        {branch.phone && (
          <a href={`tel:${branch.phone}`} className="mt-2 inline-block text-sm underline text-forestDeep">
            {branch.phone}
          </a>
        )}
      </div>
    </div>
  )
}

// One branch at a time, in a single row, with prev/next arrows —
// deliberately perPage=1 (rather than the 3-up grid other RowCarousel
// sections use) so this never turns into a stack of cards on a narrow
// phone screen; it's always exactly one row, on any screen size.
export default function BranchLocator({ branches }) {
  if (!branches || branches.length === 0) return null

  return (
    <div className="mt-16">
      <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-gold">Our Locations</p>
      <RowCarousel
        items={branches}
        perPage={1}
        columnsClassName="grid grid-cols-1"
        renderItem={(branch) => <BranchCard key={branch.id} branch={branch} />}
      />
    </div>
  )
}
