import React from 'react'
import { useBusinessInfo } from '../hooks/useBusinessInfo.js'
import { useLanguage } from '../context/LanguageContext.jsx'

// A floating click-to-chat button, shown site-wide (mounted once in
// App.jsx, same pattern as CartDrawer) — a very common, often-expected
// contact option for Sri Lankan customers, frequently converting better
// than a contact form. Hides itself entirely if no WhatsApp number has
// been set in Settings, rather than showing a broken/dead button.
export default function WhatsAppButton() {
  const { t } = useLanguage()
  const info = useBusinessInfo()
  if (!info.whatsapp_number) return null

  const href = `https://wa.me/${info.whatsapp_number}?text=${encodeURIComponent(
    "Hi Shani'z! I have a question about your products/services."
  )}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('aria_whatsapp')}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white">
        <path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.353.615 4.65 1.784 6.671L2.667 29.333l6.83-1.756a13.27 13.27 0 0 0 6.507 1.706h.006c7.363 0 13.333-5.97 13.333-13.333 0-3.56-1.386-6.907-3.904-9.425a13.24 13.24 0 0 0-9.425-3.904zm0 24.4h-.005a11.06 11.06 0 0 1-5.636-1.543l-.404-.24-4.053 1.042 1.08-3.951-.263-.406a11.05 11.05 0 0 1-1.696-5.892c0-6.113 4.974-11.087 11.089-11.087a11.02 11.02 0 0 1 7.842 3.25 11.02 11.02 0 0 1 3.245 7.843c-.002 6.114-4.976 11.087-11.089 11.087zm6.083-8.301c-.334-.167-1.97-.972-2.274-1.083-.305-.111-.527-.167-.75.167-.222.334-.86 1.083-1.054 1.306-.194.222-.389.25-.723.083-.334-.167-1.41-.52-2.686-1.657-.993-.885-1.663-1.979-1.858-2.313-.194-.334-.021-.514.146-.68.15-.15.334-.389.5-.583.167-.194.222-.334.334-.556.111-.222.056-.417-.028-.583-.083-.167-.75-1.807-1.028-2.475-.271-.65-.546-.562-.75-.573-.194-.01-.417-.012-.64-.012-.222 0-.583.083-.889.417-.305.334-1.166 1.14-1.166 2.78s1.194 3.226 1.36 3.448c.167.222 2.35 3.588 5.693 5.032.796.344 1.417.55 1.901.703.799.254 1.526.218 2.101.132.641-.096 1.97-.805 2.248-1.583.278-.778.278-1.445.194-1.584-.083-.139-.305-.222-.639-.389z" />
      </svg>
    </a>
  )
}
