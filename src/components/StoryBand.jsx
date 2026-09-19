import React from 'react'
import fernTea from '../assets/textures/fern-tea.jpg'
import { useHomepageContent } from '../hooks/useHomepageContent.js'

// About, Products ("the Ritual"), and RitualVideo ("See it made") used to
// each fit their own copy of the same background image independently,
// which meant the pattern visibly restarted at every section boundary
// instead of reading as one continuous backdrop behind all three. This
// wraps all three in a single relatively-positioned box with ONE
// background image sized to the combined height of everything inside
// it, so the seam disappears.
//
// Worth knowing: on a typical desktop viewport this covers nicely with
// very little cropping (the combined section height and this portrait
// image happen to be similarly proportioned), but on a narrow, very
// tall phone layout, "cover" has to zoom in a lot further to fill the
// width — you'll see much more solid dark background and much less of
// the leaf pattern than on desktop. If that's too subtle once you see
// it live, the fix is switching this one background-size below from
// "cover" to a repeating tile (same tradeoff discussed earlier in this
// project: tiling never over-zooms, but restarts the pattern instead of
// framing it once).
export default function StoryBand({ children }) {
  const content = useHomepageContent()
  const backgroundTexture = content.about_background_url || fernTea

  return (
    <div className="relative overflow-hidden bg-forestDeep text-cream">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.5]"
        style={{ backgroundImage: `url(${backgroundTexture})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-forestDeep/45" aria-hidden="true" />
      <div className="relative">{children}</div>
    </div>
  )
}
