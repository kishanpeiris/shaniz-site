// A deliberately small, hand-picked set of strings — the ones visible
// on every page (navigation, footer, common buttons/labels) — rather
// than an attempt to translate every word on the site in one pass.
// Admin-authored copy (homepage headlines, product/service descriptions)
// stays English-only for now, since that's free text the admin writes
// per-product, not a fixed UI string; translating that would mean
// storing a separate copy of every description per language, which is
// a bigger content-management change than this first pass covers.
//
// Sinhala and Tamil strings here were machine-translated for common,
// short e-commerce phrases — accurate enough to ship, but worth a
// native-speaker review pass before relying on them for anything legally
// sensitive (e.g. refund policy wording, if that's ever added here).
export const LANGUAGES = {
  en: { label: 'English', native: 'English' },
  si: { label: 'Sinhala', native: 'සිංහල' },
  ta: { label: 'Tamil', native: 'தமிழ்' },
}

export const TRANSLATIONS = {
  // Nav
  nav_home: { en: 'Home', si: 'මුල් පිටුව', ta: 'முகப்பு' },
  nav_shop: { en: 'Shop', si: 'සාප්පුව', ta: 'கடை' },
  nav_our_story: { en: 'Our Story', si: 'අපගේ කතාව', ta: 'எங்கள் கதை' },
  nav_the_ritual: { en: 'The Ritual', si: 'චාරිත්‍රය', ta: 'சடங்கு' },
  nav_watch: { en: 'Watch', si: 'නරඹන්න', ta: 'பார்க்க' },
  nav_visit_us: { en: 'Visit Us', si: 'අප වෙත පිවිසෙන්න', ta: 'எங்களை பார்வையிடவும்' },
  nav_search_placeholder: { en: 'Search products & services…', si: 'නිෂ්පාදන සහ සේවා සොයන්න…', ta: 'தயாரிப்புகள் & சேவைகளைத் தேடு…' },
  nav_sign_in: { en: 'Sign In', si: 'පිවිසෙන්න', ta: 'உள்நுழைக' },
  nav_my_account: { en: 'My Account', si: 'මගේ ගිණුම', ta: 'என் கணக்கு' },
  nav_admin_panel: { en: 'Admin Panel', si: 'පරිපාලක පැනලය', ta: 'நிர்வாக பலகம்' },
  nav_basket: { en: 'Basket', si: 'කූඩය', ta: 'கூடை' },

  // Footer
  footer_shop: { en: 'Shop', si: 'සාප්පුව', ta: 'கடை' },
  footer_company: { en: 'Company', si: 'සමාගම', ta: 'நிறுவனம்' },
  footer_follow: { en: 'Follow', si: 'අනුගමනය කරන්න', ta: 'பின்தொடரவும்' },
  footer_rights: { en: 'All rights reserved.', si: 'සියලුම හිමිකම් ඇවිරිණි.', ta: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.' },
  footer_made_in_sl: { en: 'Made in Sri Lanka', si: 'ශ්‍රී ලංකාවේ නිෂ්පාදිතයකි', ta: 'இலங்கையில் தயாரிக்கப்பட்டது' },

  // Common product/service actions
  add_to_basket: { en: 'Add to Basket', si: 'කූඩයට එක් කරන්න', ta: 'கூடையில் சேர்' },
  out_of_stock: { en: 'Out of Stock', si: 'තොග අවසන්', ta: 'கையிருப்பு இல்லை' },
  preorder_now: { en: 'Pre-order Now', si: 'කලින් ඇණවුම් කරන්න', ta: 'முன்பதிவு செய்யுங்கள்' },
  reserve_a_slot: { en: 'Reserve a Slot', si: 'වේලාවක් වෙන් කරගන්න', ta: 'நேரத்தை முன்பதிவு செய்யவும்' },

  // Basket / checkout
  view_basket: { en: 'View Basket', si: 'කූඩය බලන්න', ta: 'கூடையைப் பார்' },
  checkout: { en: 'Checkout', si: 'ගෙවීම් කරන්න', ta: 'செக்அவுட்' },
  proceed_to_checkout: { en: 'Proceed to Checkout', si: 'ගෙවීමට යන්න', ta: 'செக்அவுட் செய்யவும்' },
  continue_shopping: { en: 'Continue shopping', si: 'සාප්පු සවාරිය දිගටම කරගෙන යන්න', ta: 'தொடர்ந்து ஷாப்பிங் செய்யுங்கள்' },
  subtotal: { en: 'Subtotal', si: 'උප එකතුව', ta: 'கூட்டுத்தொகை' },
  browse_the_shop: { en: 'Browse the Shop', si: 'සාප්පුව බලන්න', ta: 'கடையை பார்வையிடவும்' },
  your_basket: { en: 'Your Basket', si: 'ඔබේ කූඩය', ta: 'உங்கள் கூடை' },
  basket_empty: { en: 'Your basket is empty.', si: 'ඔබේ කූඩය හිස්ය.', ta: 'உங்கள் கூடை காலியாக உள்ளது.' },

  // Account — language setting itself
  account_language: { en: 'Language', si: 'භාෂාව', ta: 'மொழி' },
  account_language_saved: { en: 'Saved.', si: 'සුරකින ලදී.', ta: 'சேமிக்கப்பட்டது.' },

  // Thank You page
  thankyou_title: { en: 'Thank you for your purchase.', si: 'ඔබගේ මිලදී ගැනීම සඳහා ස්තුතියි.', ta: 'உங்கள் கொள்முதலுக்கு நன்றி.' },
  thankyou_subtitle: {
    en: 'May this ritual bring you the same care our grandmothers put into every batch. Please visit us again.',
    si: 'මෙම චාරිත්‍රය අපගේ ආච්චිලා සෑම නිෂ්පාදනයකටම කැප කළ ආදරය ඔබටත් ගෙන එනු ඇතැයි අප විශ්වාස කරමු. නැවතත් අප වෙත පිවිසෙන්න.',
    ta: 'எங்கள் பாட்டிமார்கள் ஒவ்வொரு தொகுப்பிலும் காட்டிய அதே அக்கறையை இந்த சடங்கு உங்களுக்கும் தரட்டும். மீண்டும் எங்களைப் பார்வையிடவும்.',
  },
  order_label: { en: 'Order', si: 'ඇණවුම', ta: 'ஆர்டர்' },
  thankyou_preorder_arrival: {
    en: 'Pre-order — est. arrival {date}',
    si: 'කලින් ඇණවුම — ළඟාවීමේ අපේක්ෂිත දිනය {date}',
    ta: 'முன்பதிவு — வரவு தேதி (தோராயம்) {date}',
  },
  delivery_label: { en: 'Delivery', si: 'බෙදාහැරීම', ta: 'விநியோகம்' },
  free_pickup: { en: 'Free / Pickup', si: 'නොමිලේ / රැගෙන යාම', ta: 'இலவசம் / பிக்அப்' },
  total_label: { en: 'Total', si: 'එකතුව', ta: 'மொத்தம்' },
  thankyou_receipt_sent: {
    en: 'A receipt has been sent to {email}.',
    si: 'රිසිට්පත {email} වෙත යවා ඇත.',
    ta: 'ரசீது {email} க்கு அனுப்பப்பட்டுள்ளது.',
  },
  download_invoice: { en: 'Download Invoice', si: 'ඉන්වොයිසිය බාගන්න', ta: 'விவரப்பட்டியலைப் பதிவிறக்கவும்' },
  thankyou_loading_order: {
    en: 'Loading your order summary…',
    si: 'ඔබේ ඇණවුම් සාරාංශය පූරණය වෙමින්…',
    ta: 'உங்கள் ஆர்டர் சுருக்கம் ஏற்றப்படுகிறது…',
  },
  view_my_orders: { en: 'View My Orders', si: 'මගේ ඇණවුම් බලන්න', ta: 'எனது ஆர்டர்களைப் பார்க்க' },
  create_an_account: { en: 'Create an Account', si: 'ගිණුමක් සාදන්න', ta: 'கணக்கு உருவாக்கவும்' },
}

// vars is optional — e.g. translate('thankyou_receipt_sent', 'si', { email:
// 'x@y.com' }) replaces {email} in the translated string. Falls back to
// leaving {name} untouched if a var wasn't passed, rather than throwing —
// a missing var is a bug worth noticing in the UI, not a crash.
export function translate(key, lang, vars) {
  const entry = TRANSLATIONS[key]
  const template = entry ? entry[lang] || entry.en || key : key
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name) => (vars[name] !== undefined ? vars[name] : match))
}
