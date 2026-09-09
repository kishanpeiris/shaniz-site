import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'

// The exact copy that used to be hardcoded directly in Hero.jsx/
// About.jsx/Products.jsx — kept here as the fallback so the site looks
// identical until an admin actually changes something in Admin →
// Homepage Content, and so it still looks right even if the content
// API is ever unreachable.
export const HOMEPAGE_CONTENT_DEFAULTS = {
  hero_eyebrow: 'Small-batch · Sri Lankan grown',
  hero_headline: "Ceylon's herbal ritual, bottled by hand.",
  hero_subtext:
    "Amla, curry leaf, neem and rosemary — blended the way our grandmothers did, for hair that remembers what it's like to be cared for.",
  hero_cta1_label: 'Shop the Ritual',
  hero_cta2_label: 'Watch It Being Made',
  // Empty string means "use the bundled default image/video that ships
  // with the site" (see Hero.jsx/About.jsx/Products.jsx — each falls
  // back to its own imported asset when the matching *_url field here
  // is blank). An admin only needs to upload something once they
  // actually want to replace a photo or background.
  hero_background_url: '',
  hero_video_url: '',
  about_eyebrow: 'Our story',
  about_headline: 'Rooted in the same soil\nas ayurveda itself.',
  about_paragraph1:
    "Shani'z started at a kitchen table, boiling curry leaf and rosemary the way it had been done in our family for three generations — not as a trend, but as a habit of care. Every batch is still small enough to stir by hand, so the herbs stay whole and the oils stay honest.",
  about_paragraph2:
    "We don't chase long ingredient lists. We chase the ones that work: amla for strength, neem for the scalp, curry leaf for shine, rosemary for growth. Nothing else needs to be in the jar.",
  about_image_url: '',
  about_background_url: '',
  ritual_eyebrow: 'The Ritual',
  ritual_headline: "Shop what's in the jar.",
  ritual_subtext:
    "Two staples to start with — an oil for the scalp, a mask for the strands. Hover a product to see what's inside.",
  ritual_background_url: '',
  // "See It Made" process-video row (RitualVideo.jsx) — a plain array of
  // uploaded video URLs rather than one field, since there can be
  // several. Empty array = keep showing the original Facebook embed.
  see_it_made_videos: [],
}

// Module-level cache so Hero/About/Products (three separate components,
// all mounted together on the homepage) share ONE network request
// instead of each firing their own on mount.
let sharedFetch = null

export function useHomepageContent() {
  const [content, setContent] = useState(HOMEPAGE_CONTENT_DEFAULTS)

  useEffect(() => {
    if (!sharedFetch) {
      sharedFetch = apiGet('/api/site/homepage-content').catch(() => ({ homepage_content: {} }))
    }
    let cancelled = false
    sharedFetch.then((res) => {
      if (cancelled) return
      setContent({ ...HOMEPAGE_CONTENT_DEFAULTS, ...(res.homepage_content || {}) })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return content
}
