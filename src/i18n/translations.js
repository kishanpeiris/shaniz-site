// A deliberately small, hand-picked set of strings — the ones visible
// on every page (navigation, footer, common buttons/labels) — rather
// than an attempt to translate every word on the site in one pass.
// Admin-authored copy (homepage headlines, product/service
// descriptions) is translated separately: each of those has its own
// name_si/name_ta (etc.) column the admin fills in — by hand or with
// the "Auto-translate" AI button — rather than living in this file. See
// TranslationFields.jsx (Products/Services) and SettingsPage.jsx's
// PageContentEditor (homepage).
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

  // Homepage "Our Story" — the 4 fixed ingredient cards (not admin-editable
  // CMS content like the rest of the About section, so these live here
  // as regular UI strings rather than needing _si/_ta database columns).
  ingredient_amla_name: { en: 'Amla', si: 'නෙල්ලි', ta: 'நெல்லிக்காய்' },
  ingredient_amla_blurb: {
    en: 'Strengthens from root to tip',
    si: 'මුල සිට කෙළවර දක්වා ශක්තිමත් කරයි',
    ta: 'வேர் முதல் நுனி வரை வலுப்படுத்துகிறது',
  },
  ingredient_curry_leaf_name: { en: 'Curry Leaf', si: 'කරපිංචා', ta: 'கறிவேப்பிலை' },
  ingredient_curry_leaf_blurb: {
    en: 'Restores natural shine',
    si: 'ස්වාභාවික දීප්තිය ප්‍රතිසාධනය කරයි',
    ta: 'இயற்கை பொலிவை மீட்டெடுக்கிறது',
  },
  ingredient_neem_name: { en: 'Neem', si: 'කොහොඹ', ta: 'வேம்பு' },
  ingredient_neem_blurb: {
    en: 'Calms and clears the scalp',
    si: 'හිස්කබල සන්සුන් කර පවිත්‍ර කරයි',
    ta: 'உச்சந்தலையை அமைதிப்படுத்தி தெளிவாக்குகிறது',
  },
  ingredient_rosemary_name: { en: 'Rosemary', si: 'රෝස්මරී', ta: 'ரோஸ்மேரி' },
  ingredient_rosemary_blurb: {
    en: 'Encourages new growth',
    si: 'නව වර්ධනයට දිරිගන්වයි',
    ta: 'புதிய வளர்ச்சியை ஊக்குவிக்கிறது',
  },

  // "Visit us" contact form (Visit.jsx) — the textarea/inputs themselves
  // accept any language regardless of these labels (there's no such
  // thing as an "English-only" text input), so this is what actually
  // makes the form feel native to a Sinhala/Tamil visitor: the labels,
  // placeholders, and confirmation copy around it.
  contact_eyebrow: { en: 'Visit us', si: 'අප වෙත පිවිසෙන්න', ta: 'எங்களை பார்வையிடவும்' },
  contact_headline: { en: 'Say hello.', si: 'ආයුබෝවන්.', ta: 'வணக்கம் சொல்லுங்கள்.' },
  contact_get_in_touch: { en: 'Get in touch', si: 'සම්බන්ධ වන්න', ta: 'தொடர்பு கொள்ளுங்கள்' },
  contact_intro: {
    en: 'Have a question about an order, an ingredient, or want to book the scalp ritual in person? Reach out — we reply within a day.',
    si: 'ඇණවුමක් ගැන හෝ අමුද්‍රව්‍යයක් ගැන ප්‍රශ්නයක් තිබේද, නැතහොත් සෘජුවම ස්කැල්ප් චිකිත්සාව වෙන්කරවා ගැනීමට අවශ්‍යද? අප හා සම්බන්ධ වන්න — දිනකින් පිළිතුරු දෙන්නෙමු.',
    ta: 'ஆர்டர் அல்லது பொருள் பற்றி கேள்வியா, அல்லது நேரடியாக தலை சிகிச்சையை முன்பதிவு செய்ய விரும்புகிறீர்களா? எங்களை தொடர்பு கொள்ளுங்கள் — ஒரு நாளுக்குள் பதிலளிப்போம்.',
  },
  contact_phone_label: { en: 'Phone', si: 'දුරකථනය', ta: 'தொலைபேசி' },
  contact_email_label: { en: 'Email', si: 'ඊමේල්', ta: 'மின்னஞ்சல்' },
  contact_facebook_label: { en: 'Facebook', si: 'ෆේස්බුක්', ta: 'பேஸ்புக்' },
  contact_name_placeholder: { en: 'Your name', si: 'ඔබේ නම', ta: 'உங்கள் பெயர்' },
  contact_email_placeholder: { en: 'Your email', si: 'ඔබේ ඊමේල් ලිපිනය', ta: 'உங்கள் மின்னஞ்சல்' },
  contact_message_placeholder: { en: 'How can we help?', si: 'අපට ඔබට උදව් කළ හැක්කේ කෙසේද?', ta: 'நாங்கள் எப்படி உதவலாம்?' },
  contact_send: { en: 'Send Message', si: 'පණිවිඩය යවන්න', ta: 'செய்தியை அனுப்பவும்' },
  contact_sending: { en: 'Sending…', si: 'යවමින්...', ta: 'அனுப்புகிறது...' },
  contact_sent_title: {
    en: 'Thanks — your message is on its way!',
    si: 'ස්තූතියි — ඔබේ පණිවිඩය යවා ඇත!',
    ta: 'நன்றி — உங்கள் செய்தி அனுப்பப்பட்டது!',
  },
  contact_sent_subtitle: { en: 'We reply within a day.', si: 'අපි දිනකින් පිළිතුරු දෙන්නෙමු.', ta: 'ஒரு நாளுக்குள் பதிலளிப்போம்.' },
  contact_send_another: { en: 'Send another message', si: 'තවත් පණිවිඩයක් යවන්න', ta: 'மற்றொரு செய்தியை அனுப்பவும்' },

  // Auth pages (Login/Register/Forgot/Reset Password) — these had never
  // been wired into the translation system at all (unlike most of the
  // storefront), so they stayed English-only regardless of the language
  // switcher. `create_an_account` above is reused here rather than
  // duplicated, since it's the exact same phrase in both places.
  auth_sign_in_heading: { en: 'Sign in', si: 'පිවිසෙන්න', ta: 'உள்நுழையவும்' },
  auth_your_account: { en: 'Your account', si: 'ඔබේ ගිණුම', ta: 'உங்கள் கணக்கு' },
  auth_email_placeholder: { en: 'Email', si: 'ඊමේල්', ta: 'மின்னஞ்சல்' },
  auth_password_placeholder: { en: 'Password', si: 'මුරපදය', ta: 'கடவுச்சொல்' },
  auth_sign_in_button: { en: 'Sign In', si: 'පිවිසෙන්න', ta: 'உள்நுழையவும்' },
  auth_signing_in: { en: 'Signing in…', si: 'පිවිසෙමින්...', ta: 'உள்நுழைகிறது...' },
  auth_forgot_password: { en: 'Forgot your password?', si: 'මුරපදය අමතක වුණාද?', ta: 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?' },
  auth_new_here: { en: 'New here?', si: 'අලුතින් පැමිණියාද?', ta: 'புதியவரா?' },
  auth_back_to_storefront: { en: '← Back to the storefront', si: '← වෙළඳසැලට ආපසු', ta: '← கடைக்குத் திரும்பு' },

  auth_create_account_heading: { en: 'Create an account', si: 'ගිණුමක් සාදන්න', ta: 'கணக்கு உருவாக்கவும்' },
  auth_save_details_subtitle: {
    en: 'Save your details for faster checkout',
    si: 'වේගවත් ගෙවීම් සඳහා ඔබේ විස්තර සුරකින්න',
    ta: 'விரைவான செக்அவுட்டிற்கு உங்கள் விவரங்களைச் சேமிக்கவும்',
  },
  auth_first_name_placeholder: { en: 'First name', si: 'මුල් නම', ta: 'முதல் பெயர்' },
  auth_last_name_placeholder: {
    en: 'Last name (optional)',
    si: 'අවසාන නම (විකල්ප)',
    ta: 'கடைசி பெயர் (விருப்பத்திற்குரியது)',
  },
  auth_mobile_placeholder: {
    en: 'Mobile number (optional)',
    si: 'ජංගම දුරකථන අංකය (විකල්ප)',
    ta: 'மொபைல் எண் (விருப்பத்திற்குரியது)',
  },
  auth_password_hint: {
    en: 'At least 10 characters, with an uppercase letter and a number.',
    si: 'අවම වශයෙන් අකුරු 10ක්, ලොකු අකුරක් සහ අංකයක් සමඟ.',
    ta: 'குறைந்தது 10 எழுத்துக்கள், ஒரு பெரிய எழுத்து மற்றும் ஒரு எண்ணுடன்.',
  },
  auth_create_account_button: { en: 'Create Account', si: 'ගිණුම සාදන්න', ta: 'கணக்கை உருவாக்கவும்' },
  auth_creating_account: { en: 'Creating account…', si: 'ගිණුම සාදමින්...', ta: 'கணக்கை உருவாக்குகிறது...' },
  auth_already_have_account: { en: 'Already have an account?', si: 'දැනටමත් ගිණුමක් තිබේද?', ta: 'ஏற்கனவே கணக்கு உள்ளதா?' },

  auth_reset_password_heading: { en: 'Reset your password', si: 'ඔබේ මුරපදය යළි සකසන්න', ta: 'உங்கள் கடவுச்சொல்லை மீட்டமைக்கவும்' },
  auth_account_email_placeholder: { en: 'Your account email', si: 'ඔබේ ගිණුමේ ඊමේල්', ta: 'உங்கள் கணக்கு மின்னஞ்சல்' },
  auth_send_reset_link: { en: 'Send reset link', si: 'යළි සැකසුම් සබැඳිය යවන්න', ta: 'மீட்டமைப்பு இணைப்பை அனுப்பவும்' },
  auth_sending: { en: 'Sending…', si: 'යවමින්...', ta: 'அனுப்புகிறது...' },
  auth_reset_sent_message: {
    en: "If an account exists for {email}, we've sent a link to reset your password. It expires in 20 minutes.",
    si: '{email} සඳහා ගිණුමක් තිබේ නම්, මුරපදය යළි සැකසීමට සබැඳියක් අප එවා ඇත. එය මිනිත්තු 20කින් කල් ඉකුත් වේ.',
    ta: '{email} க்கான கணக்கு இருந்தால், கடவுச்சொல்லை மீட்டமைக்க இணைப்பை அனுப்பியுள்ளோம். இது 20 நிமிடங்களில் காலாவதியாகும்.',
  },
  auth_back_to_sign_in: { en: '← Back to sign in', si: '← පිවිසීමට ආපසු', ta: '← உள்நுழைவுக்குத் திரும்பு' },

  auth_set_new_password_heading: { en: 'Set a new password', si: 'නව මුරපදයක් සකසන්න', ta: 'புதிய கடவுச்சொல்லை அமைக்கவும்' },
  auth_missing_token_message: {
    en: 'This link is missing its reset token. Request a new one from the',
    si: 'මෙම සබැඳියේ යළි සැකසුම් කේතය නොමැත. අලුත් එකක් ඉල්ලන්න —',
    ta: 'இந்த இணைப்பில் மீட்டமைப்பு டோக்கன் இல்லை. புதிதாக ஒன்றைக் கோரவும் —',
  },
  auth_forgot_password_link_text: { en: 'forgot password', si: 'මුරපදය අමතක විය', ta: 'கடவுச்சொல் மறந்துவிட்டது' },
  auth_password_reset_done: { en: 'Your password has been reset.', si: 'ඔබේ මුරපදය යළි සකසන ලදී.', ta: 'உங்கள் கடவுச்சொல் மீட்டமைக்கப்பட்டது.' },
  auth_new_password_placeholder: { en: 'New password', si: 'නව මුරපදය', ta: 'புதிய கடவுச்சொல்' },
  auth_reset_password_button: { en: 'Reset password', si: 'මුරපදය යළි සකසන්න', ta: 'கடவுச்சொல்லை மீட்டமைக்கவும்' },
  auth_resetting: { en: 'Resetting…', si: 'යළි සකසමින්...', ta: 'மீட்டமைக்கிறது...' },

  // PaymentReturnPage — landed on after a real gateway's hosted
  // checkout (which includes the bank's own OTP step) hands the
  // customer's browser back to us.
  payment_return_checking_title: { en: 'Confirming your payment…', si: 'ඔබේ ගෙවීම තහවුරු කරමින්...', ta: 'உங்கள் கட்டணத்தை உறுதிப்படுத்துகிறோம்...' },
  payment_return_checking_subtitle: {
    en: "This only takes a moment — please don't close this page.",
    si: 'මෙයට මොහොතක් ගතවේ — කරුණාකර මෙම පිටුව වසා නොදමන්න.',
    ta: 'இதற்கு ஒரு கணம் மட்டுமே ஆகும் — இந்தப் பக்கத்தை மூடாதீர்கள்.',
  },
  payment_return_timeout_title: { en: "We're still confirming with your bank", si: 'අපි තවමත් ඔබේ බැංකුව සමඟ තහවුරු කරමින් සිටිමු', ta: 'நாங்கள் இன்னும் உங்கள் வங்கியுடன் உறுதிப்படுத்துகிறோம்' },
  payment_return_timeout_subtitle: {
    en: "This can occasionally take a little longer. You'll get an email as soon as it's confirmed, or check again now.",
    si: 'මෙයට සමහර විට තව ටිකක් කාලය ගත විය හැක. එය තහවුරු වූ විගසම ඔබට ඊමේල් පණිවිඩයක් ලැබෙනු ඇත, නැතහොත් දැන් නැවත පරීක්ෂා කරන්න.',
    ta: 'இது சில நேரங்களில் சற்று அதிக நேரம் எடுக்கலாம். உறுதிப்படுத்தப்பட்டவுடன் உங்களுக்கு மின்னஞ்சல் வரும், அல்லது இப்போது மீண்டும் சரிபார்க்கவும்.',
  },
  payment_return_check_again: { en: 'Check again', si: 'නැවත පරීක්ෂා කරන්න', ta: 'மீண்டும் சரிபார்க்கவும்' },
  payment_return_failed_title: { en: 'Payment was not completed', si: 'ගෙවීම සම්පූර්ණ නොවීය', ta: 'கட்டணம் முடிக்கப்படவில்லை' },
  payment_return_failed_subtitle: {
    en: "Your bank or card didn't approve this payment, or the process was cancelled. No charge was made.",
    si: 'ඔබේ බැංකුව හෝ කාඩ්පත මෙම ගෙවීම අනුමත නොකළේය, නැතහොත් ක්‍රියාවලිය අවලංගු කරන ලදී. කිසිදු ගාස්තුවක් අය කර නොමැත.',
    ta: 'உங்கள் வங்கி அல்லது கார்டு இந்தக் கட்டணத்தை அங்கீகரிக்கவில்லை, அல்லது செயல்முறை ரத்து செய்யப்பட்டது. கட்டணம் எதுவும் வசூலிக்கப்படவில்லை.',
  },
  payment_return_try_again: { en: 'Try again', si: 'නැවත උත්සාහ කරන්න', ta: 'மீண்டும் முயற்சிக்கவும்' },
  payment_return_not_found_title: { en: "We couldn't find that order", si: 'එම ඇණවුම සොයාගත නොහැකි විය', ta: 'அந்த ஆர்டரைக் கண்டுபிடிக்க முடியவில்லை' },

  // Order cancellation / return requests (OrderDetailPage.jsx)
  refund_request_cancellation: { en: 'Request Cancellation', si: 'අවලංගු කිරීමට ඉල්ලන්න', ta: 'ரத்து செய்ய கோரவும்' },
  refund_request_return: { en: 'Request Return / Refund', si: 'ආපසු දීම / මුදල් ආපසු ගැනීමට ඉල්ලන්න', ta: 'திரும்பப்பெறல் / பணத்தைத் திரும்பப் பெற கோரவும்' },
  refund_cancel_form_title: { en: 'Why would you like to cancel?', si: 'ඔබ අවලංගු කිරීමට කැමති ඇයි?', ta: 'நீங்கள் ஏன் ரத்து செய்ய விரும்புகிறீர்கள்?' },
  refund_return_form_title: { en: 'Tell us about the issue', si: 'ගැටලුව ගැන අපට කියන්න', ta: 'சிக்கலைப் பற்றி எங்களிடம் கூறுங்கள்' },
  refund_reason_placeholder: { en: 'A few words on why…', si: 'ඇයි කියා කෙටියෙන්...', ta: 'ஏன் என்பதை சுருக்கமாக...' },
  refund_reason_required: { en: 'Please tell us why.', si: 'කරුණාකර හේතුව සඳහන් කරන්න.', ta: 'தயவுசெய்து காரணத்தைக் கூறுங்கள்.' },
  refund_submit: { en: 'Submit Request', si: 'ඉල්ලීම යවන්න', ta: 'கோரிக்கையை அனுப்பவும்' },
  refund_submitting: { en: 'Submitting…', si: 'යවමින්...', ta: 'சமர்ப்பிக்கிறது...' },
  refund_cancel_form: { en: 'Never mind', si: 'අවශ්‍ය නැත', ta: 'வேண்டாம்' },
  refund_cancellation_pending: {
    en: 'Your cancellation request has been sent and is awaiting review — we usually respond within a day.',
    si: 'ඔබේ අවලංගු කිරීමේ ඉල්ලීම යවා ඇති අතර සමාලෝචනය සඳහා රැඳී සිටී — අපි සාමාන්‍යයෙන් දිනකින් පිළිතුරු දෙන්නෙමු.',
    ta: 'உங்கள் ரத்து கோரிக்கை அனுப்பப்பட்டு மதிப்பாய்வுக்காக காத்திருக்கிறது — நாங்கள் பொதுவாக ஒரு நாளுக்குள் பதிலளிப்போம்.',
  },
  refund_return_pending: {
    en: 'Your return request has been sent and is awaiting review — we usually respond within a day.',
    si: 'ඔබේ ආපසු දීමේ ඉල්ලීම යවා ඇති අතර සමාලෝචනය සඳහා රැඳී සිටී — අපි සාමාන්‍යයෙන් දිනකින් පිළිතුරු දෙන්නෙමු.',
    ta: 'உங்கள் திரும்பப் பெறும் கோரிக்கை அனுப்பப்பட்டு மதிப்பாய்வுக்காக காத்திருக்கிறது — நாங்கள் பொதுவாக ஒரு நாளுக்குள் பதிலளிப்போம்.',
  },
  refund_cancellation_approved: {
    en: 'Your cancellation was approved.',
    si: 'ඔබේ අවලංගු කිරීම අනුමත කරන ලදී.',
    ta: 'உங்கள் ரத்து ஒப்புதல் அளிக்கப்பட்டது.',
  },
  refund_return_approved: {
    en: 'Your return was approved — your refund is on its way to your original payment method.',
    si: 'ඔබේ ආපසු දීම අනුමත කරන ලදී — ඔබේ මුදල් ආපසු ගෙවීම ඔබේ මුල් ගෙවීම් ක්‍රමය වෙත එවමින් පවතී.',
    ta: 'உங்கள் திரும்பப் பெறல் ஒப்புதல் அளிக்கப்பட்டது — உங்கள் பணம் அசல் கட்டண முறைக்கு திரும்பப் அனுப்பப்படுகிறது.',
  },
  refund_request_rejected: {
    en: 'This request was not approved.',
    si: 'මෙම ඉල්ලීම අනුමත නොකළේය.',
    ta: 'இந்த கோரிக்கை ஒப்புதல் அளிக்கப்படவில்லை.',
  },

  // Address form (checkout + saved addresses) — city/postcode names
  // themselves stay in English/Romanized form in every language mode.
  // That's deliberate, not a gap: Sri Lanka Post's own addressing
  // (and the postcode directory this list is built from) is
  // Romanized, and that's what actually gets read by delivery riders
  // regardless of what language the site is shown in.
  address_line1_placeholder: {
    en: 'Address line 1',
    si: 'ලිපිනය පේළිය 1',
    ta: 'முகவரி வரி 1',
  },
  address_city_placeholder: {
    en: 'City / Town',
    si: 'නගරය',
    ta: 'நகரம் / ஊர்',
  },
  address_postal_code_placeholder: {
    en: 'Postal code',
    si: 'තැපැල් කේතය',
    ta: 'அஞ்சல் குறியீடு',
  },
  address_sri_lanka_only: {
    en: 'Sri Lanka only, at this time — {prefix}.',
    si: 'මේ අවස්ථාවේදී ශ්‍රී ලංකාව සඳහා පමණි — {prefix}.',
    ta: 'தற்போது இலங்கைக்கு மட்டும் — {prefix}.',
  },
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
