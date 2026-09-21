import React, { createContext, useContext, useState } from 'react'
import { readConsent, writeConsent } from '../lib/consent.js'

const ConsentContext = createContext(null)

// Holds the visitor's cookie choices for the whole app.
//   consent === null  -> they haven't chosen yet (the banner is shown)
export function ConsentProvider({ children }) {
  const [consent, setConsent] = useState(readConsent)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const save = (choices) => {
    setConsent(writeConsent(choices))
    setSettingsOpen(false)
  }

  const value = {
    consent,
    hasDecided: consent !== null,
    allowed: (category) => Boolean(consent?.[category]),
    acceptAll: () => save({ preferences: true, thirdParty: true }),
    rejectOptional: () => save({ preferences: false, thirdParty: false }),
    save,
    settingsOpen,
    openSettings: () => setSettingsOpen(true),
    closeSettings: () => setSettingsOpen(false),
  }
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used within a ConsentProvider')
  return ctx
}
