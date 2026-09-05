import React from 'react'
import cinnamonMint from '../assets/textures/cinnamon-mint.jpg'

const FB_SHARE_URL = 'https://www.facebook.com/share/r/18w79k89Zo/'
const EMBED_SRC = `https://www.facebook.com/plugins/video.php?height=476&href=${encodeURIComponent(
  FB_SHARE_URL
)}&show_text=false&width=350&t=0`

export default function RitualVideo() {
  return (
    <section id="ritual-video" className="relative overflow-hidden bg-forestDeep py-24 text-cream">
      {/* Two layers, but with non-crushing math this time: image at a
          strong 55% directly, then a moderate 45% dark tint on top —
          net effect is roughly a 30% visible image over a dark base,
          verified by eye and by sampling actual pixel values. */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.55]"
        style={{ backgroundImage: `url(${cinnamonMint})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-forestDeep/40" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-7 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-goldLight">
          See it made
        </p>
        <h2 className="mt-3 text-4xl text-ivory">The ritual, start to finish.</h2>
        <p className="mx-auto mt-3 max-w-lg text-cream/75">
          A short look at how each batch is blended — from fresh leaf to finished bottle.
        </p>

        <div className="mx-auto mt-10 max-w-[540px] rounded-sm border border-gold/40 bg-white/[0.02] p-2.5">
          <div className="relative w-full pb-[125%]">
            <iframe
              src={EMBED_SRC}
              title="Shani'z ritual video"
              className="absolute inset-0 h-full w-full border-0"
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>
        </div>
        <p className="mt-4 text-sm">
          Video not loading?{' '}
          <a
            href={FB_SHARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-goldLight text-goldLight"
          >
            Watch it directly on Facebook →
          </a>
        </p>
      </div>
    </section>
  )
}
