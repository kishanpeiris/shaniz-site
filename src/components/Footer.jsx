import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.jpg'
import { useBusinessInfo } from '../hooks/useBusinessInfo.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { FacebookIcon, InstagramIcon, TikTokIcon, LinkedInIcon, WhatsAppIcon } from './SocialIcons.jsx'

export default function Footer() {
  const info = useBusinessInfo()
  const { t } = useLanguage()
  return (
    <footer className="bg-forestDeep pb-6 pt-12 text-cream/70">
      <div className="mx-auto max-w-6xl px-7">
        <div className="flex flex-wrap justify-between gap-8 border-b border-gold/25 pb-8">
          <div className="flex items-center gap-3.5">
            <img
              src={logo}
              alt="Shani'z logo"
              className="h-12 w-12 rounded-full border border-gold/40 bg-white object-cover p-0.5 sm:h-16 sm:w-16"
            />
            <span className="font-serif text-2xl text-ivory">Shani&rsquo;z</span>
          </div>

          <div className="flex flex-wrap gap-10">
            <div>
              <h5 className="mb-2.5 text-xs uppercase tracking-[0.14em] text-goldLight">{t('footer_shop')}</h5>
              <Link to="/#products" className="block py-0.5 text-sm hover:text-goldLight">Hair Oil</Link>
              <Link to="/#products" className="block py-0.5 text-sm hover:text-goldLight">Hair Mask</Link>
              <Link to="/#products" className="block py-0.5 text-sm hover:text-goldLight">Scalp Ritual</Link>
            </div>
            <div>
              <h5 className="mb-2.5 text-xs uppercase tracking-[0.14em] text-goldLight">{t('footer_company')}</h5>
              <Link to="/#about" className="block py-0.5 text-sm hover:text-goldLight">{t('nav_our_story')}</Link>
              <Link to="/#ritual-video" className="block py-0.5 text-sm hover:text-goldLight">{t('nav_watch')}</Link>
              <Link to="/#visit" className="block py-0.5 text-sm hover:text-goldLight">{t('nav_visit_us')}</Link>
            </div>
            {(() => {
              const socialLinks = [
                { url: info.facebook_url, label: 'Facebook', Icon: FacebookIcon },
                { url: info.instagram_url, label: 'Instagram', Icon: InstagramIcon },
                { url: info.tiktok_url, label: 'TikTok', Icon: TikTokIcon },
                { url: info.linkedin_url, label: 'LinkedIn', Icon: LinkedInIcon },
                {
                  url: info.whatsapp_number ? `https://wa.me/${info.whatsapp_number}` : '',
                  label: 'WhatsApp',
                  Icon: WhatsAppIcon,
                },
              ].filter((s) => s.url)

              if (socialLinks.length === 0) return null

              return (
                <div>
                  <h5 className="mb-2.5 text-xs uppercase tracking-[0.14em] text-goldLight">{t('footer_follow')}</h5>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map(({ url, label, Icon }) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-cream/80 transition-colors hover:border-goldLight hover:text-goldLight"
                      >
                        <Icon className="h-4 w-4 fill-current" />
                      </a>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-2 pt-5 text-xs">
          <span>© {new Date().getFullYear()} Shani&rsquo;z Herbal Hair &amp; Skin Care. {t('footer_rights')}</span>
          <span>{t('footer_made_in_sl')} 🇱🇰</span>
        </div>
      </div>
    </footer>
  )
}
