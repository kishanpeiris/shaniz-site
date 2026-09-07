import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiGet, apiPost } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('/api/auth/me')
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await apiPost('/api/auth/login', { email, password })
    setUser(res.user)
    return res.user
  }

  // fields: { firstName, lastName?, email, password, mobile? }
  const register = async (fields) => {
    const res = await apiPost('/api/auth/register', fields)
    setUser(res.user)
    return res.user
  }

  // Lets AccountPage refresh `user` in place after a profile edit or an
  // email-verification confirmation, without a full page reload.
  const refreshUser = async () => {
    const res = await apiGet('/api/auth/me')
    setUser(res.user)
    return res.user
  }

  const logout = async () => {
    await apiPost('/api/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
