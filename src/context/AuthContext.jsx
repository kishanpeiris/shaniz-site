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

  const register = async (name, email, password) => {
    const res = await apiPost('/api/auth/register', { name, email, password })
    setUser(res.user)
    return res.user
  }

  const logout = async () => {
    await apiPost('/api/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
