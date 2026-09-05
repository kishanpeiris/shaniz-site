import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import apothecary from '../assets/textures/ayurveda-bowls.jpg'
import heroVideo from '../assets/video/hero-ritual.mp4'

// This clip has no dramatic "intro" moment (unlike the earlier footage
// it replaces) — it's a steady ambient shot, so a plain native loop
// works: play to the end, jump back to 0, keep going, forever, at
// PLAYBACK_RATE speed throughout.
const PLAYBACK_RATE = 0.8

export default function Hero() {
  const [videoFailed, setVideoFailed] = useState(false)
  const videoRef = useRef(null)

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
    <section id="top" className="relative flex min-h-[88vh] items-center overflow-hidden bg-forestDeep">
      {/* Still image — always rendered first. It's the fail-safe: if the
          video can't load or play (slow connection, autoplay blocked,
          unsupported format), this stays visible underneath. */}
      <div
        className="absolute inset-0 bg-cover bg-center saturate-[0.95]"
        style={{ backgroundImage: `url(${apothecary})` }}
      />
      {!videoFailed && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover saturate-[0.95]"
          src={heroVideo}
          poster={apothecary}
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
          Small-batch · Sri Lankan grown
        </p>
        <h1 className="mt-4 max-w-xl text-4xl leading-tight text-ivory sm:text-5xl md:text-6xl">
          Ceylon&rsquo;s herbal ritual, <em className="italic text-goldLight">bottled by hand.</em>
        </h1>
        <p className="mt-5 max-w-md text-base text-cream/80">
          Amla, curry leaf, neem and rosemary — blended the way our grandmothers did, for hair
          that remembers what it&rsquo;s like to be cared for.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/shop"
            className="rounded-full bg-gold px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-forestDeep transition-transform hover:-translate-y-0.5"
          >
            Shop the Ritual
          </Link>
          <Link
            to="/#ritual-video"
            className="rounded-full border border-cream/50 px-7 py-3.5 text-xs uppercase tracking-wide text-ivory transition-transform hover:-translate-y-0.5"
          >
            Watch It Being Made
          </Link>
        </div>
      </div>
    </section>
  )
}
