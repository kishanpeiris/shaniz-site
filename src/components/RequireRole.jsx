import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RequireRole({ roles, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#8a8672]">Loading…</div>
  }
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}
