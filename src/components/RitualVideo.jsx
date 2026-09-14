import React from 'react'
import fernTea from '../assets/textures/fern-tea.jpg'
import RowCarousel from './RowCarousel.jsx'
import { useHomepageContent } from '../hooks/useHomepageContent.js'

const FB_SHARE_URL = 'https://www.facebook.com/share/r/18w79k89Zo/'
const EMBED_SRC = `https://www.facebook.com/plugins/video.php?height=476&href=${encodeURIComponent(
  FB_SHARE_URL
)}&show_text=false&width=350&t=0`

function VideoCard({ src }) {
  return (
    <div className="mx-auto w-full max-w-[300px] rounded-sm border border-gold/40 bg-white/[0.02] p-2">
      <video
        src={src}
        controls
        preload="metadata"
        playsInline
        className="aspect-[9/16] w-full rounded-sm bg-black object-contain"
      />
    </div>
  )
}

export default function RitualVideo() {
  const content = useHomepageContent()
  // Same fallback pattern as About/Products: an admin-uploaded override
  // if one's been set (Settings → Page Content → See It Made), fern-tea
  // otherwise — now the same default image as those two sections too,
  // rather than the much lighter, white-background product photo this
  // used before, which was the actual source of the three sections
  // visibly not matching each other.
  const backgroundTexture = content.ritual_video_background_url || fernTea
  // Admin-uploaded process videos (Settings → Page Content → See It
  // Made) take over once there's at least one — until then this keeps
  // showing the original single Facebook embed, so a fresh install
  // still has something here instead of an empty section.
  const videos = content.see_it_made_videos || []
  const hasUploadedVideos = videos.length > 0

  return (
    <section id="ritual-video" className="relative overflow-hidden bg-forestDeep py-24 text-cream">
      {/* Same treatment as About/Products now (opacity-[0.5] image +
          forestDeep/45 tint) — previously slightly different math
          (0.55/0.40) which, combined with a totally different photo,
          made this section visibly lighter/greyer than its neighbors. */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.5]"
        style={{ backgroundImage: `url(${backgroundTexture})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-forestDeep/45" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-7 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-goldLight">
          See it made
        </p>
        <h2 className="mt-3 text-4xl text-ivory">The ritual, start to finish.</h2>
        <p className="mx-auto mt-3 max-w-lg text-cream/75">
          A short look at how each batch is blended — from fresh leaf to finished bottle.
        </p>

        {hasUploadedVideos ? (
          <div className="mt-10">
            <RowCarousel
              items={videos}
              perPage={3}
              columnsClassName="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              renderItem={(src, i) => <VideoCard key={src + i} src={src} />}
            />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </section>
  )
}
