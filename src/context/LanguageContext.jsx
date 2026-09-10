import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { apiPut } from '../api/client.js'
import { useAuth } from './AuthContext.jsx'
import { translate } from '../i18n/translations.js'

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
  const [language, setLanguageState] = useState(loadLocal)
  const syncedForUserRef = useRef(null)

  useEffect(() => {
    if (!user) {
      syncedForUserRef.current = null
      return
    }
    if (syncedForUserRef.current === user.id) return
    syncedForUserRef.current = user.id
    if (user.languagePref && user.languagePref !== language) {
      setLanguageState(user.languagePref)
      try {
        localStorage.setItem(STORAGE_KEY, user.languagePref)
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const setLanguage = (lang) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* not critical if this fails (private browsing, etc.) */
    }
    if (user) {
      apiPut('/api/account/language', { languagePref: lang }).catch(() => {
        /* the UI already switched — a failed save just means it won't
           persist to their account for next time, not worth blocking on */
      })
    }
  }

  const t = (key) => translate(key, language)

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
