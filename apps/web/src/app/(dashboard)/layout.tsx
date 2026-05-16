'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { CommandPalette } from '@/components/features/command-palette'
import { DuotoneIcon } from '@/components/ui/duotone-icon'
import { CommandShortcut } from '@/components/ui/command-shortcut'

type NavItem = { href: string; label: string; icon: 'home' | 'briefcase' | 'document' | 'users' | 'feather' | 'sparkles' | 'settings' | 'compass' | 'bolt' | 'clock' | 'book-open'; signature?: boolean; badge?: string }

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',  label: 'Inicio',           icon: 'home' },
  { href: '/cases',      label: 'Expedientes',      icon: 'briefcase' },
  { href: '/documents',  label: 'Documentos',       icon: 'document' },
  { href: '/clients',    label: 'Clientes',         icon: 'users' },
  { href: '/acciones',   label: 'Acciones',         icon: 'bolt',       badge: '80+' },
  { href: '/plantillas', label: 'Plantillas',       icon: 'book-open',  badge: '50+' },
  { href: '/plazos',     label: 'Plazos',           icon: 'clock' },
  { href: '/generate',   label: 'Generar',          icon: 'feather' },
  { href: '/chat',       label: 'LEXIA',            icon: 'sparkles', signature: true },
]

const BOTTOM_ITEMS: NavItem[] = [
  { href: '/admin/equipo', label: 'Equipo',         icon: 'settings' },
  { href: '/settings', label: 'Configuración',  icon: 'compass' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState('abogado@despacho.com')
  const [userRole, setUserRole] = useState('Abogado')
  const [userName, setUserName] = useState('Nicolas')
  const [cmdOpen, setCmdOpen] = useState(false)

  const userInitial = (userName || userEmail)[0]?.toUpperCase() || 'I'

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(session => {
        if (session.user?.email) setUserEmail(session.user.email)
        if (session.user?.role) setUserRole(session.user.role === 'admin' ? 'Administrador' : 'Abogado')
        if (session.user?.name) setUserName(session.user.name.split(' ')[0])
        else if (session.user?.email) {
          const local = session.user.email.split('@')[0]
          setUserName(local.charAt(0).toUpperCase() + local.slice(1))
        }
      })
      .catch(() => {})
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
              whileHover={{ rotate: -4, scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
              style={{
                background: 'var(--lime)',
                boxShadow: '0 4px 14px -2px rgba(124, 58, 237, 0.45)',
              }}
            >
              <span
                className="font-display italic"
                style={{
                  color: 'var(--lime-text-on)',
                  fontSize: 18,
                  lineHeight: 1,
                  paddingBottom: 2,
                }}
              >
                I
              </span>
            </motion.div>
            <div>
              <p className="text-white text-[15px] font-semibold tracking-tight leading-none">IURALEX</p>
              <p className="text-[10px] mt-1 font-medium tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
            {[...NAV_ITEMS, ...BOTTOM_ITEMS].map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href}>
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
          <p className="text-[10px] mt-2 text-center font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © 2025 Cliender
          </p>
        </div>
      </aside>

      {/* Command palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Main */}
      <div className="flex-1 ml-60 relative">
        <main className="w-full max-w-6xl mx-auto px-12 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
