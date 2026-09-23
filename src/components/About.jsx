import React from 'react'
import herbalMap from '../assets/sri-lanka-herbal-map.webp'
import RichText from './RichText.jsx'
import { useHomepageContent } from '../hooks/useHomepageContent.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { localizedField } from '../lib/localize.js'

export default function About() {
  const content = useHomepageContent()
  const { language } = useLanguage()
  // A photo uploaded in Admin → Settings → Our Story wins; otherwise the
  // illustrated herbal map of Sri Lanka is shown.
  const usingDefaultMap = !content.about_image_url
  const sideImage = content.about_image_url || herbalMap
  return (
    <section id="about" className="relative scroll-mt-24 py-24">
      <div className="relative mx-auto max-w-6xl px-7">
        <div className="grid items-center gap-16 md:grid-cols-[0.9fr_1.1fr]">
          <div className="order-1 md:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-goldLight">
              {localizedField(content, 'about_eyebrow', language)}
            </p>
            <h2 className="mt-3 whitespace-pre-line text-4xl leading-snug text-ivory">
              {localizedField(content, 'about_headline', language)}
            </h2>
            <RichText text={localizedField(content, 'about_paragraph1', language)} className="mt-5 max-w-lg text-cream/80" />
            <RichText text={localizedField(content, 'about_paragraph2', language)} className="mt-4 max-w-lg text-cream/80" />
          </div>

          <div className="relative order-2 md:order-1">
            {usingDefaultMap ? (
              // The default map is an illustration, not a photo, so a
              // crisp rectangular frame makes it look pasted on top of
              // this section's deep green background rather than part
              // of it. A soft glow behind it, the illustration's own
              // edges fading out (mask-image below), and slightly
              // muted colors tie it into the page instead. Once a real
              // photo is uploaded in Admin -> Settings -> Our Story,
              // none of this applies -- it gets the classic crisp frame.
              <div aria-hidden="true" className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-gold/25 blur-3xl" />
            ) : (
              <div className="pointer-events-none absolute -inset-3.5 -z-10 rounded-sm border border-gold" />
            )}
            <img
              src={sideImage}
              alt="Illustrated map of Sri Lanka showing the ayurvedic herbs grown across the island"
              className="w-full rounded-sm shadow-brand"
              style={
                usingDefaultMap
                  ? {
                      filter: 'saturate(0.88) contrast(1.03)',
                      WebkitMaskImage: 'radial-gradient(ellipse 82% 82% at center, black 58%, transparent 100%)',
                      maskImage: 'radial-gradient(ellipse 82% 82% at center, black 58%, transparent 100%)',
                    }
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}
