import React from 'react'

// A consistent "photo band" header used across Shop/Basket/Checkout —
// always a dark gradient scrim between the photo and the text, so
// headings stay fully readable regardless of what's in the image
// underneath. Never place form fields or buttons directly on this band —
// it's for the heading/intro only; real content sits on plain
// cream/ivory panels below it.
export default function PageHeroBand({ image, eyebrow, title, subtitle, compact = false, tile = false }) {
  return (
    <section
      className={`relative overflow-hidden bg-forestDeep ${tile ? 'bg-repeat bg-top' : 'bg-cover bg-center'} ${compact ? 'py-12' : 'py-16'}`}
      style={{ backgroundImage: `url(${image})`, ...(tile ? { backgroundSize: '260px auto' } : {}) }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-forestDeep/90 via-forestDeep/90 to-forestDeep/95" />
      <div className="relative mx-auto max-w-3xl px-6 text-center text-cream">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-goldLight">
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl text-cream">{title}</h1>
        {subtitle && <p className="mt-3 text-cream/80">{subtitle}</p>}
      </div>
    </section>
  )
}
