import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

// Shown for any address that doesn't exist (a mistyped link, an old bookmark).
export default function NotFoundPage() {
  const { t } = useLanguage()
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">404</p>
        <h1 className="mt-3 text-4xl text-forestDeep">{t('nf_title')}</h1>
        <p className="mt-4 text-base text-[#5c5949]">{t('nf_text')}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="rounded-full bg-forestDeep px-6 py-3 text-xs uppercase tracking-wide text-cream">
            {t('nf_home')}
          </Link>
          <Link to="/shop" className="text-base underline text-forestDeep">
            {t('browse_the_shop')}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
