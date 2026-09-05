import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { apiGet, apiPut } from '../api/client.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)
const STORAGE_KEY = 'shaniz_cart'

function loadLocal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState(loadLocal)
  const [isOpen, setIsOpen] = useState(false)
  const [addresses, setAddresses] = useState([])
  const mergedForUserRef = useRef(null) // which user id we've already merged the server cart for

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // "Logging in will save their basket" — on login, pull the basket saved
  // from a previous session and merge it with whatever's in this browser
  // right now (e.g. items added before signing in), so nothing is lost
  // either way. Runs once per login, not on every render.
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      mergedForUserRef.current = null
      return
    }
    if (mergedForUserRef.current === user.id) return
    mergedForUserRef.current = user.id

    apiGet('/api/account/cart')
      .then((res) => {
        const serverItems = res.cart?.items ?? []
        if (serverItems.length === 0) return
        setItems((prev) => {
          const merged = { ...prev }
          for (const si of serverItems) {
            const existing = merged[si.id]
            merged[si.id] = existing
              ? { ...existing, qty: existing.qty + si.qty }
              : { id: si.id, type: si.type, name: si.name, price: si.price, qty: si.qty }
          }
          return merged
        })
      })
      .catch(() => {
        /* saved cart is a convenience, not critical — fail quietly */
      })

    apiGet('/api/account/addresses')
      .then((r) => setAddresses(r.addresses))
      .catch(() => setAddresses([]))
  }, [user, authLoading])

  // Keep the server copy in sync while logged in, so the basket survives
  // switching devices or just closing the tab. Cheap enough to call on
  // every change — this is a small JSON blob, not a heavy write.
  useEffect(() => {
    if (authLoading || !user) return
    const list = Object.values(items)
    const handle = setTimeout(() => {
      apiPut('/api/account/cart', { items: list }).catch(() => {})
    }, 600)
    return () => clearTimeout(handle)
  }, [items, user, authLoading])

  const addItem = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev[item.id]
      return {
        ...prev,
        [item.id]: {
          id: item.id,
          type: item.type, // 'product' | 'service' — required by the orders API
          name: item.name,
          price: item.price,
          qty: existing ? existing.qty + qty : qty,
        },
      }
    })
    setIsOpen(true)
  }

  const changeQty = (id, delta) => {
    setItems((prev) => {
      const item = prev[id]
      if (!item) return prev
      const nextQty = item.qty + delta
      const next = { ...prev }
      if (nextQty <= 0) delete next[id]
      else next[id] = { ...item, qty: nextQty }
      return next
    })
  }

  const removeItem = (id) => {
    setItems((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const clearCart = () => setItems({})

  const list = Object.values(items)
  const totalQty = list.reduce((sum, i) => sum + i.qty, 0)
  const subtotal = list.reduce((sum, i) => sum + i.qty * i.price, 0)

  const value = {
    items: list,
    totalQty,
    subtotal,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    addItem,
    changeQty,
    removeItem,
    clearCart,
    addresses,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
