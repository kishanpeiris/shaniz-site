import React from 'react'
import mask from '../assets/mask.jpg'
import fernTea from '../assets/textures/fern-tea.jpg'
import { useHomepageContent } from '../hooks/useHomepageContent.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { localizedField } from '../lib/localize.js'

const INGREDIENTS = [
  ['ingredient_amla_name', 'ingredient_amla_blurb'],
  ['ingredient_curry_leaf_name', 'ingredient_curry_leaf_blurb'],
  ['ingredient_neem_name', 'ingredient_neem_blurb'],
  ['ingredient_rosemary_name', 'ingredient_rosemary_blurb'],
]

export default function About() {
  const content = useHomepageContent()
  const { t, language } = useLanguage()
  const backgroundTexture = content.about_background_url || fernTea
  const sideImage = content.about_image_url || mask
  return (
    <section id="about" className="relative scroll-mt-24 overflow-hidden bg-forestDeep py-24 text-cream">
      {/* Same treatment as "See It Made": photo at a strong, clearly
          visible opacity with a dark tint on top, and light-colored text
          throughout — rather than a faint photo behind dark text, which
          is what kept causing legibility complaints no matter how the
          opacity was tuned. Non-tiled — a single fitted image, not a
          repeating pattern (Products.jsx below still tiles; only these
          two "Our Story"/"See it made" sections use the fitted version). */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.5]"
        style={{ backgroundImage: `url(${backgroundTexture})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-forestDeep/45" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-7">
        <div className="grid items-center gap-16 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-goldLight">
              {localizedField(content, 'about_eyebrow', language)}
            </p>
            <h2 className="mt-3 whitespace-pre-line text-4xl leading-snug text-ivory">
              {localizedField(content, 'about_headline', language)}
            </h2>
            <p className="mt-5 max-w-md text-cream/80">{localizedField(content, 'about_paragraph1', language)}</p>
            <p className="mt-4 max-w-md text-cream/80">{localizedField(content, 'about_paragraph2', language)}</p>

            <div className="mt-8 grid grid-cols-2 gap-5">
              {INGREDIENTS.map(([nameKey, blurbKey]) => (
                <div
                  key={nameKey}
                  className="rounded-sm border border-gold/30 bg-ivory p-4"
                >
                  <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-gold font-serif font-semibold text-moss">
                    ✦
                  </div>
                  <h4 className="font-serif text-lg text-forestDeep">{t(nameKey)}</h4>
                  <p className="text-sm text-[#6a6656]">{t(blurbKey)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-3.5 -z-10 rounded-sm border border-gold" />
            <img
              src={sideImage}
              alt="Shani'z Premium Herbal Hair Mask surrounded by fresh amla, rosemary and curry leaves"
              className="rounded-sm shadow-brand"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
