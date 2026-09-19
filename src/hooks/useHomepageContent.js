import { useEffect, useState } from 'react'
import { apiGet } from '../api/client.js'

// The exact copy that used to be hardcoded directly in Hero.jsx/
// About.jsx/Products.jsx — kept here as the fallback so the site looks
// identical until an admin actually changes something in Admin →
// Homepage Content, and so it still looks right even if the content
// API is ever unreachable.
export const HOMEPAGE_CONTENT_DEFAULTS = {
  hero_eyebrow: 'Small-batch · Sri Lankan grown',
  hero_headline: "Sri Lanka's herbal ritual, bottled by hand.",
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
  // "See It Made" section text (RitualVideo.jsx) — previously hardcoded
  // directly in that component (which is also why it never translated
  // into Sinhala/Tamil until now).
  ritual_video_eyebrow: 'See it made',
  ritual_video_headline: 'The ritual, start to finish.',
  ritual_video_subtext: 'A short look at how each batch is blended — from fresh leaf to finished bottle.',
  // "See It Made" process-video row (RitualVideo.jsx) — a plain array of
  // uploaded video URLs rather than one field, since there can be
  // several. Empty array = keep showing the original Facebook embed.
  see_it_made_videos: [],

  // ---- Built-in Sinhala & Tamil copy ----------------------------------
  // Shown until an admin types their own translation in Admin → Settings
  // → Homepage Content. Machine-quality: worth a native-speaker review.
  hero_eyebrow_si: 'කුඩා කාණ්ඩ නිෂ්පාදනය · ශ්‍රී ලංකාවේ වගා කළ',
  hero_eyebrow_ta: 'சிறு தொகுதி · இலங்கையில் விளைந்தது',
  hero_headline_si: 'ශ්‍රී ලංකාවේ ඖෂධීය චාරිත්‍රය, අතින්ම බෝතල්ගත කළ.',
  hero_headline_ta: 'இலங்கையின் மூலிகைச் சடங்கு, கையால் புட்டியில் அடைக்கப்பட்டது.',
  hero_subtext_si:
    'නෙල්ලි, කරපිංචා, කොහොඹ සහ රෝස්මරි — අපේ ආච්චිලා මුත්තන් කළ ආකාරයටම මිශ්‍ර කළ, රැකවරණය ලැබීම කෙබඳුදැයි මතක තබාගන්නා කෙස් සඳහා.',
  hero_subtext_ta:
    'நெல்லிக்காய், கறிவேப்பிலை, வேம்பு மற்றும் ரோஸ்மேரி — எங்கள் பாட்டிமார் செய்தது போலவே கலக்கப்பட்டது, அக்கறையுடன் பராமரிக்கப்படுவது எப்படி இருக்கும் என்பதை நினைவில் வைத்திருக்கும் கூந்தலுக்காக.',
  hero_cta1_label_si: 'චාරිත්‍රය මිලදී ගන්න',
  hero_cta1_label_ta: 'சடங்கை வாங்குங்கள்',
  hero_cta2_label_si: 'නිෂ්පාදනය නරඹන්න',
  hero_cta2_label_ta: 'தயாராவதைப் பாருங்கள்',
  about_eyebrow_si: 'අපගේ කතාව',
  about_eyebrow_ta: 'எங்கள் கதை',
  about_headline_si: 'ආයුර්වේදයටම අයත්\nඑකම පසෙහි මුල් බැසගත්.',
  about_headline_ta: 'ஆயுர்வேதத்தின் அதே\nமண்ணில் வேரூன்றியது.',
  about_paragraph1_si:
    "Shani'z ආරම්භ වූයේ කුස්සියේ මේසයක් මත, අපේ පවුලේ පරම්පරා තුනක් තිස්සේ කළාක් මෙන් කරපිංචා සහ රෝස්මරි තම්බමිනි — එය විලාසිතාවක් ලෙස නොව, රැකවරණයේ පුරුද්දක් ලෙසිනි. සෑම කාණ්ඩයක්ම තවමත් අතින් කලවම් කළ හැකි තරම් කුඩා බැවින්, ඖෂධ පැළෑටි සම්පූර්ණව ඉතිරි වන අතර තෙල් අව්‍යාජව පවතී.",
  about_paragraph1_ta:
    "Shani'z ஒரு சமையலறை மேசையில் தொடங்கியது — எங்கள் குடும்பத்தில் மூன்று தலைமுறைகளாகச் செய்து வந்ததைப் போலவே கறிவேப்பிலையையும் ரோஸ்மேரியையும் கொதிக்க வைத்து; இது ஒரு நாகரிகப் போக்காக அல்ல, அக்கறையின் பழக்கமாக. ஒவ்வொரு தொகுதியும் இன்னும் கையால் கிளறக்கூடிய அளவுக்குச் சிறியது, அதனால் மூலிகைகள் முழுமையாகவும் எண்ணெய்கள் தூய்மையாகவும் இருக்கும்.",
  about_paragraph2_si:
    'අපි දිගු අමුද්‍රව්‍ය ලැයිස්තු පස්සේ නොයමු. ඵලදායී ඒවා පස්සේ යමු: ශක්තිය සඳහා නෙල්ලි, හිස්මුදුන සඳහා කොහොඹ, දිලිසීම සඳහා කරපිංචා, වර්ධනය සඳහා රෝස්මරි. භාජනයේ වෙන කිසිවක් තිබිය යුතු නැත.',
  about_paragraph2_ta:
    'நாங்கள் நீண்ட பொருள் பட்டியல்களைத் துரத்துவதில்லை. பலனளிப்பவற்றையே நாடுகிறோம்: வலிமைக்கு நெல்லிக்காய், உச்சந்தலைக்கு வேம்பு, பளபளப்புக்கு கறிவேப்பிலை, வளர்ச்சிக்கு ரோஸ்மேரி. ஜாடியில் வேறு எதுவும் இருக்கத் தேவையில்லை.',
  ritual_eyebrow_si: 'චාරිත්‍රය',
  ritual_eyebrow_ta: 'சடங்கு',
  ritual_headline_si: 'භාජනයේ ඇති දේ මිලදී ගන්න.',
  ritual_headline_ta: 'ஜாடியில் உள்ளதை வாங்குங்கள்.',
  ritual_subtext_si:
    'ආරම්භයට ප්‍රධාන දෙකක් — හිස්මුදුනට තෙලක්, කෙස් නූල් සඳහා මාස්ක් එකක්. ඇතුළත ඇති දේ බැලීමට නිෂ්පාදනය මතට කර්සරය ගෙන යන්න.',
  ritual_subtext_ta:
    'தொடங்குவதற்கு இரண்டு அடிப்படைப் பொருட்கள் — உச்சந்தலைக்கு ஒரு எண்ணெய், கூந்தலிழைகளுக்கு ஒரு மாஸ்க். உள்ளே என்ன இருக்கிறது என்பதைப் பார்க்க ஒரு தயாரிப்பின் மேல் சுட்டியை வைக்கவும்.',
  ritual_video_eyebrow_si: 'නිෂ්පාදනය බලන්න',
  ritual_video_eyebrow_ta: 'தயாரிப்பைப் பாருங்கள்',
  ritual_video_headline_si: 'චාරිත්‍රය, ආරම්භයේ සිට අවසානය දක්වා.',
  ritual_video_headline_ta: 'சடங்கு, தொடக்கம் முதல் முடிவு வரை.',
  ritual_video_subtext_si: 'සෑම කාණ්ඩයක්ම මිශ්‍ර කරන ආකාරය පිළිබඳ කෙටි බැල්මක් — නැවුම් කොළයේ සිට අවසන් බෝතලය දක්වා.',
  ritual_video_subtext_ta: 'ஒவ்வொரு தொகுதியும் எப்படிக் கலக்கப்படுகிறது என்பதன் சிறு பார்வை — புதிய இலையிலிருந்து முடிக்கப்பட்ட புட்டி வரை.',
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
      const saved = { ...(res.homepage_content || {}) }
      // A blank Sinhala/Tamil box in the admin form means "not translated
      // yet" — keep our built-in translation instead of falling back to English.
      for (const key of Object.keys(saved)) {
        if (/_(si|ta)$/.test(key) && !String(saved[key] ?? '').trim() && HOMEPAGE_CONTENT_DEFAULTS[key]) {
          delete saved[key]
        }
      }
      // The old default headline may already be saved in the database
      // (the admin form saves every field) — upgrade it automatically.
      if (saved.hero_headline === "Ceylon's herbal ritual, bottled by hand.") {
        delete saved.hero_headline
      }
      setContent({ ...HOMEPAGE_CONTENT_DEFAULTS, ...saved })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return content
}
