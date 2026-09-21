import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function RequireRole({ roles, children }) {
  const { t } = useLanguage()
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#6a6656]">{t('common_loading')}</div>
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (!roles.includes(user.role)) {
    // Signed in, but not allowed here (e.g. a regular admin opening a
    // super-admin-only page): send them to their own home, never to the
    // login page (which would just send them straight back here).
    return <Navigate to={['admin', 'superadmin'].includes(user.role) ? '/admin' : '/account'} replace />
  }
  return children
}
