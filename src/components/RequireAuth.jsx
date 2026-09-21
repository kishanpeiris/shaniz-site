import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

// Unlike RequireRole, this just checks the user is signed in at all —
// used for /account, which any customer, admin, or superadmin can view.
export default function RequireAuth({ children }) {
  const { t } = useLanguage()
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#6a6656]">{t('common_loading')}</div>
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}
