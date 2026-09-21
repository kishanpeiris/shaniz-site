import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { apiPut } from '../api/client.js'
import { useAuth } from './AuthContext.jsx'
import { translate } from '../i18n/translations.js'
import { useConsent } from './ConsentContext.jsx'

const STORAGE_KEY = 'shaniz_language'
const LanguageContext = createContext(null)

function loadLocal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'si' || saved === 'ta' ? saved : 'en'
  } catch {
    return 'en'
  }
}

// Language choice lives in three places, in priority order: (1) this
// session's explicit choice, (2) the logged-in account's saved
// preference (adopted once, on login — see the effect below), (3) the
// browser's localStorage from a previous visit, defaulting to English.
// A guest who picks Sinhala or Tamil keeps that choice in their browser
// even without an account; logging in on a *different* browser later
// still gets their saved account preference there.
export function LanguageProvider({ children }) {
  const { user } = useAuth()
  const { allowed, hasDecided } = useConsent()
  const canRemember = allowed('preferences')
  const [language, setLanguageState] = useState(loadLocal)
  const syncedForUserRef = useRef(null)

  // The language is only remembered on this device if the visitor allowed
  // "Preferences" cookies; if they decline (or later withdraw), it is erased.
  const remember = (lang) => {
    try {
      if (canRemember) localStorage.setItem(STORAGE_KEY, lang)
      else if (hasDecided) localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* not critical (private browsing, etc.) */
    }
  }
  useEffect(() => {
    remember(language)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRemember, hasDecided])

  useEffect(() => {
    if (!user) {
      syncedForUserRef.current = null
      return
    }
    if (syncedForUserRef.current === user.id) return
    syncedForUserRef.current = user.id
    if (user.languagePref && user.languagePref !== language) {
      setLanguageState(user.languagePref)
      remember(user.languagePref)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const setLanguage = (lang) => {
    setLanguageState(lang)
    remember(lang)
    if (user) {
      apiPut('/api/account/language', { languagePref: lang }).catch(() => {
        /* the UI already switched — a failed save just means it won't
           persist to their account for next time, not worth blocking on */
      })
    }
  }

  // Tell the browser which language the page is in (also lets CSS tune
  // spacing for Sinhala/Tamil — see index.css).
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const t = (key, vars) => translate(key, language, vars)

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
