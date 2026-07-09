'use client'

/**
 * useRole — hook React que lee el rol del usuario activo desde la sesión.
 *
 * Fuente única de verdad: /api/auth/session (cookie next-auth).
 * El rol viene firmado en el JWT — imposible falsificarlo desde frontend.
 */

import { useState, useEffect, useCallback } from 'react'
import { Role, Permissions, hasPermission as checkPerm } from './rbac'

interface SessionUser {
  id: string
  email: string
  name?: string
  role?: Role | string
}

export function useRole() {
  const [role, setRole] = useState<Role | undefined>(undefined)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        const u = data?.user as SessionUser | undefined
        if (u) {
          setUser(u)
          // Normaliza role legacy 'admin' -> 'Admin'
          const r = (u.role || '') as string
          const normalized = (r.charAt(0).toUpperCase() + r.slice(1)) as Role
          setRole(normalized as Role)
        }
        setLoading(false)
      })
      .catch(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const can = useCallback((perm: keyof Permissions) => checkPerm(role, perm), [role])

  return { role, user, can, loading }
}
