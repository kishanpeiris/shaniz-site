import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import apothecary from '../assets/textures/ayurveda-bowls.jpg'
import heroVideo from '../assets/video/hero-ritual.mp4'
import { useHomepageContent } from '../hooks/useHomepageContent.js'

// This clip has no dramatic "intro" moment (unlike the earlier footage
// it replaces) — it's a steady ambient shot, so a plain native loop
// works: play to the end, jump back to 0, keep going, forever, at
// PLAYBACK_RATE speed throughout.
const PLAYBACK_RATE = 0.8

export default function Hero() {
  const [videoFailed, setVideoFailed] = useState(false)
  const videoRef = useRef(null)
  const content = useHomepageContent()
  // Falls back to the bundled defaults until/unless an admin uploads a
  // replacement from Admin → Settings → Page Content.
  const backgroundImage = content.hero_background_url || apothecary
  const videoSrc = content.hero_video_url || heroVideo

  useEffect(() => {
    const video = videoRef.current
    if (!video || videoFailed) return

    // Applied on mount and again on loadedmetadata (covers the case
    // where the ref attaches before metadata/duration is known) —
    // playbackRate persists across the native loop's restart on its own,
    // so nothing further is needed once this is set.
    const applyPlaybackRate = () => {
      video.playbackRate = PLAYBACK_RATE
    }
    applyPlaybackRate()
    video.addEventListener('loadedmetadata', applyPlaybackRate)

    return () => {
      video.removeEventListener('loadedmetadata', applyPlaybackRate)
    }
  }, [videoFailed])

  return (
    <section id="top" className="hero-viewport relative flex items-center overflow-hidden bg-forestDeep">
      {/* Still image — always rendered first. It's the fail-safe: if the
          video can't load or play (slow connection, autoplay blocked,
          unsupported format), this stays visible underneath. On mobile
          this uses object-contain (full frame visible, letterboxed)
          instead of object-cover, since a cover-cropped frame on a tall
          narrow screen was cutting off the moving leaves in the
          bottom-right corner of the shot — sm: and up go back to the
          full-bleed cover treatment where there's room to crop safely. */}
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat saturate-[0.95] sm:bg-cover"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {!videoFailed && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain saturate-[0.95] sm:object-cover"
          src={videoSrc}
          poster={backgroundImage}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={() => setVideoFailed(true)}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(100deg, rgba(14,34,22,0.96) 30%, rgba(14,34,22,0.82) 55%, rgba(14,34,22,0.45) 82%)',
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-goldLight">
          {content.hero_eyebrow}
        </p>
        <h1 className="mt-4 max-w-xl text-4xl leading-tight text-ivory sm:text-5xl md:text-6xl">
          {content.hero_headline}
        </h1>
        <p className="mt-5 max-w-md text-base text-cream/80">{content.hero_subtext}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/shop"
            className="rounded-full bg-gold px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-forestDeep transition-transform hover:-translate-y-0.5"
          >
            {content.hero_cta1_label}
          </Link>
          <Link
            to="/#ritual-video"
            className="rounded-full border border-cream/50 px-7 py-3.5 text-xs uppercase tracking-wide text-ivory transition-transform hover:-translate-y-0.5"
          >
            {content.hero_cta2_label}
          </Link>
        </div>
      </div>
    </section>
  )
}
