'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface AuthUser {
  id: string
  email: string
  name?: string
  role: string
}

interface AuthSession {
  user: AuthUser | null
  expires?: string
  status: 'loading' | 'authenticated' | 'unauthenticated'
}

const AuthContext = createContext<AuthSession>({ user: null, status: 'loading' })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>({ user: null, status: 'loading' })

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' })
      const data = await res.json()
      setSession({
        user: data.user,
        expires: data.expires,
        status: data.user ? 'authenticated' : 'unauthenticated',
      })
    } catch {
      setSession({ user: null, status: 'unauthenticated' })
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
}

export function useSession() {
  return useContext(AuthContext)
}

export async function signOut() {
  await fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/login'
}
