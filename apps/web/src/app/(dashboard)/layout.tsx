'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { CommandPalette } from '@/components/features/command-palette'
import { DuotoneIcon } from '@/components/ui/duotone-icon'
import { CommandShortcut } from '@/components/ui/command-shortcut'
import { PoweredByCliender } from '@/components/ui/PoweredByCliender'
import { ClienderLogo } from '@/components/brand/ClienderLogo'
import { cachedFetchJSON } from '@/lib/hooks/useCachedFetch'
import { useRole } from '@/lib/rbac/useRole'
import { hasPermission } from '@/lib/rbac/rbac'

type NavItem = {
  href: string
  label: string
  icon: 'home' | 'briefcase' | 'document' | 'users' | 'feather' | 'sparkles' | 'settings' | 'compass' | 'bolt' | 'clock' | 'book-open' | 'euro'
  signature?: boolean
  badge?: string
  perm?: 'viewDashboard' | 'viewCases' | 'viewDocuments' | 'viewClients' | 'viewTemplates' | 'viewDeadlines' | 'viewFinanzas' | 'viewChat' | 'viewAdmin' | 'viewSettings' | 'viewTeam'
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',  label: 'Inicio',      icon: 'home',      perm: 'viewDashboard' },
  { href: '/cases',      label: 'Expedientes', icon: 'briefcase', perm: 'viewCases' },
  { href: '/documents',  label: 'Documentos',  icon: 'document',  perm: 'viewDocuments' },
  { href: '/clients',    label: 'Clientes',    icon: 'users',     perm: 'viewClients' },
  { href: '/acciones',   label: 'Acciones',    icon: 'bolt',      badge: '17', perm: 'viewDashboard' },
  { href: '/plantillas', label: 'Plantillas',  icon: 'book-open', badge: '20', perm: 'viewTemplates' },
  { href: '/plazos',     label: 'Plazos',      icon: 'clock',     perm: 'viewDeadlines' },
  { href: '/finanzas',   label: 'Finanzas',    icon: 'euro',      perm: 'viewFinanzas' },
  { href: '/generate',   label: 'Generar',     icon: 'feather',   perm: 'viewTemplates' },
  { href: '/chat',       label: 'LEXIA',       icon: 'sparkles',  signature: true, perm: 'viewChat' },
]

const BOTTOM_ITEMS: NavItem[] = [
  { href: '/admin/equipo', label: 'Equipo',        icon: 'settings', perm: 'viewTeam' },
  { href: '/settings',     label: 'Configuración', icon: 'compass',  perm: 'viewSettings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('abogado@despacho.com')
  const [userRole, setUserRole] = useState('Abogado')
  const [userName, setUserName] = useState('Nicolas')
  const [cmdOpen, setCmdOpen] = useState(false)
  const { role } = useRole()

  const userInitial = (userName || userEmail)[0]?.toUpperCase() || 'I'

  useEffect(() => {
    let cancelled = false
    cachedFetchJSON<any>('/api/auth/session')
      .then((session) => {
        if (cancelled) return
        if (session?.user?.email) setUserEmail(session.user.email)
        if (session?.user?.role) setUserRole(session.user.role)
        if (session?.user?.name) setUserName(session.user.name.split(' ')[0])
        else if (session?.user?.email) {
          const local = session.user.email.split('@')[0]
          setUserName(local.charAt(0).toUpperCase() + local.slice(1))
        }
      })
      .catch((err) => {
        console.error('[layout] session fetch failed:', err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCmdOpen(true)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore — proceed to redirect
    } finally {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside
        className="w-60 flex-shrink-0 fixed inset-y-0 left-0 z-30 flex flex-col"
        style={{ background: 'var(--obsidian)' }}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: -4, scale: 1.06 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
              style={{
                background: '#8F7EE9',
                boxShadow: '0 4px 14px -2px rgba(143, 126, 233, 0.45)',
              }}
            >
              <ClienderLogo variant="symbol" color="white" size={16} title="Cliender" />
            </motion.div>
            <div>
              <p className="text-white text-[15px] font-semibold tracking-tight leading-none">IURALEX</p>
              <p
                className="text-[9.5px] mt-1 font-medium tracking-[0.18em] uppercase"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                by Cliender
              </p>
            </div>
          </Link>
        </div>

        {/* Search trigger */}
        <div className="px-3 pb-3">
          <button
            onClick={() => setCmdOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-150 group"
            style={{ background: 'rgba(255,255,255,0.04)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            <DuotoneIcon name="search" size={15} primary="rgba(255,255,255,0.6)" secondary="rgba(255,255,255,0.6)" />
            <span className="text-[13px] flex-1 text-left" style={{ color: 'rgba(255,255,255,0.5)' }}>Buscar…</span>
            <CommandShortcut keys={['⌘', 'K']} variant="dark" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Workspace
          </p>
          <div className="space-y-0.5">
            {[...NAV_ITEMS, ...BOTTOM_ITEMS].filter(item => !item.perm || hasPermission(role as any, item.perm as any)).map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href} prefetch={true}>
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150"
                    style={{
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                      background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.color = '#fff'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                      }
                    }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebarActive"
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                        style={{ background: 'var(--lime)' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <DuotoneIcon
                      name={item.icon}
                      size={17}
                      primary={isActive ? '#fff' : 'rgba(255,255,255,0.7)'}
                      secondary={isActive ? 'var(--lime)' : 'rgba(255,255,255,0.5)'}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.signature && (
                      <span
                        className="px-1.5 h-4 inline-flex items-center text-[9px] font-bold rounded-[4px] tracking-wider"
                        style={{ background: 'var(--lime)', color: 'var(--lime-text-on)' }}
                      >
                        IA
                      </span>
                    )}
                    {item.badge && !item.signature && (
                      <span className="px-1.5 h-4 inline-flex items-center text-[9px] font-bold rounded-[4px] tracking-wider bg-white/10 text-white/60">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User footer */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors duration-150"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div className="relative">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-display italic"
                style={{
                  background: 'var(--lime)',
                  color: 'var(--lime-text-on)',
                  fontSize: 14,
                  paddingBottom: 1,
                }}
              >
                {userInitial}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                style={{ background: '#22C55E', boxShadow: '0 0 0 1.5px var(--obsidian)' }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium text-white truncate leading-tight">{userName}</p>
              <p className="text-[10.5px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{userEmail}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.7)', background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
            }}
          >
            <LogOut size={14} />
            <span>Cerrar sesión</span>
          </button>

          <p className="text-[10px] mt-2 text-center font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © 2025 Cliender
          </p>
          <p className="text-[9.5px] mt-0.5 text-center tracking-wide" style={{ color: 'rgba(255,255,255,0.2)' }}>
            v1.0.0 · by Cliender Tech
          </p>
        </div>
      </aside>

      {/* Command palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Main */}
      <div className="flex-1 ml-60 relative flex flex-col min-h-screen">
        <main className="flex-1 w-full max-w-6xl mx-auto px-12 py-10">
          {children}
        </main>

        {/* Global footer — pegado al fondo después del contenido, no sticky */}
        <PoweredByCliender variant="footer" />
      </div>
    </div>
  )
}
