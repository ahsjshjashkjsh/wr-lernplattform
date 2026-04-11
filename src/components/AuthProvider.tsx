'use client'
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

export interface AuthUser {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isBanned: boolean
  isPremium: boolean
  premiumUntil: string | null
  buchungstrainerRole: boolean
  isAyri: boolean
  isCreator: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  refresh: () => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Heartbeat: sendet alle 30s eine Anfrage um lastOnline + lastIp zu aktualisieren
  // Alle 60s auch User-Daten neu laden (damit Rollen-Änderungen sofort wirken)
  useEffect(() => {
    if (!user) {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      return
    }

    let tick = 0
    const ping = () => {
      fetch('/api/heartbeat', { method: 'POST' }).catch(() => {})
      tick++
      if (tick % 2 === 0) refresh() // alle 60s User-Daten neu laden
    }

    ping()
    heartbeatRef.current = setInterval(ping, 30_000)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    }
  }, [user?.id, refresh]) // eslint-disable-line react-hooks/exhaustive-deps

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
