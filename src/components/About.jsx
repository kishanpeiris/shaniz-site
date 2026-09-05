import React from 'react'
import mask from '../assets/mask.jpg'
import fernTea from '../assets/textures/fern-tea.jpg'

const INGREDIENTS = [
  ['Amla', 'Strengthens from root to tip'],
  ['Curry Leaf', 'Restores natural shine'],
  ['Neem', 'Calms and clears the scalp'],
  ['Rosemary', 'Encourages new growth'],
]

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-cream py-24">
      {/* Dried-herb-tea photo, at a modest but genuinely visible opacity
          directly against the section's own cream base (no extra tint
          layer stacked on top — that combination compounds
          multiplicatively and crushes it to imperceptible). */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.14]"
        style={{ backgroundImage: `url(${fernTea})` }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-7">
        <div className="mx-auto mb-10 flex w-fit items-center gap-3">
          <svg viewBox="0 0 110 20" className="h-5 w-28">
            <path d="M0 10H110" stroke="#b8934a" strokeWidth="1" />
          </svg>
        </div>

        <div className="grid items-center gap-16 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Our story</p>
            <h2 className="mt-3 text-4xl leading-snug">
              Rooted in the same soil
              <br />
              as ayurveda itself.
            </h2>
            <p className="mt-5 max-w-md text-[#4a473c]">
              Shani&rsquo;z started at a kitchen table, boiling curry leaf and rosemary the way it
              had been done in our family for three generations — not as a trend, but as a habit
              of care. Every batch is still small enough to stir by hand, so the herbs stay whole
              and the oils stay honest.
            </p>
            <p className="mt-4 max-w-md text-[#4a473c]">
              We don&rsquo;t chase long ingredient lists. We chase the ones that work: amla for
              strength, neem for the scalp, curry leaf for shine, rosemary for growth. Nothing
              else needs to be in the jar.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-5">
              {INGREDIENTS.map(([name, blurb]) => (
                <div
                  key={name}
                  className="rounded-sm border border-gold/30 bg-ivory p-4"
                >
                  <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-gold font-serif font-semibold text-moss">
                    ✦
                  </div>
                  <h4 className="font-serif text-lg text-forestDeep">{name}</h4>
                  <p className="text-sm text-[#6a6656]">{blurb}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-3.5 -z-10 rounded-sm border border-gold" />
            <img
              src={mask}
              alt="Shani'z Premium Herbal Hair Mask surrounded by fresh amla, rosemary and curry leaves"
              className="rounded-sm shadow-brand"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
