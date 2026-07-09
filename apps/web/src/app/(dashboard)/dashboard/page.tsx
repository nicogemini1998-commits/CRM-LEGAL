'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MeshGradient } from '@/components/ui/mesh-gradient'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Sparkline } from '@/components/ui/sparkline'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'
import { DuotoneIcon } from '@/components/ui/duotone-icon'
import { StatusPill } from '@/components/ui/status-pill'
import { staggerContainer, staggerItem, ease } from '@/lib/motion'
import { cachedFetchJSON } from '@/lib/hooks/useCachedFetch'

interface DashboardStats {
  cases: number
  documents: number
  clients: number
  contracts_generated: number
  trend?: number[]
}

export default function DashboardPage() {
  const [today, setToday] = useState('')
  const [stats, setStats] = useState<DashboardStats>({
    cases: 0, documents: 0, clients: 0, contracts_generated: 0,
    trend: [3, 5, 4, 7, 6, 8, 5],
  })
  const [recent, setRecent] = useState<any[]>([])
  const [firstName, setFirstName] = useState('Abogado')
  const [loading, setLoading] = useState(true)
  const [showDemoBanner, setShowDemoBanner] = useState(false)

  useEffect(() => {
    setToday(new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }))
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem('iuralex-demo-banner-dismissed') === '1'
    const isDemo =
      process.env.NEXT_PUBLIC_DEMO_MODE === '1' ||
      window.location.search.includes('demo=1') ||
      /demo|preview/i.test(window.location.hostname)
    setShowDemoBanner(!dismissed && isDemo)
  }, [])

  const dismissDemoBanner = () => {
    setShowDemoBanner(false)
    try { localStorage.setItem('iuralex-demo-banner-dismissed', '1') } catch {}
  }

  const isEmpty = !loading && stats.cases === 0 && stats.documents === 0 && stats.clients === 0

  useEffect(() => {
    let cancelled = false

    // Each fetch resolves independently — one failure must NOT block the rest.
    const safe = <T,>(p: Promise<T>, label: string): Promise<T | null> =>
      p.catch((err) => {
        console.error(`[dashboard] ${label} failed:`, err)
        return null
      })

    Promise.all([
      safe(cachedFetchJSON<any>('/api/cases'), 'cases'),
      safe(cachedFetchJSON<any>('/api/documents'), 'documents'),
      safe(cachedFetchJSON<any>('/api/clients'), 'clients'),
      safe(cachedFetchJSON<any>('/api/auth/session'), 'session'),
    ])
      .then(([cases, docs, clients, session]) => {
        if (cancelled) return
        try {
          const casesList: any[] = cases?.cases || []
          const docsList: any[] = docs?.documents || []
          const clientsList: any[] = clients?.clients || []

          const openCount = casesList.filter((c) => c?.status === 'open').length
          setStats({
            cases: openCount,
            documents: docsList.length,
            clients: clientsList.length,
            contracts_generated: docsList.filter((d) => d?.document_type === 'contract').length,
            trend: [
              Math.max(1, openCount - 2),
              Math.max(1, openCount - 1),
              Math.max(1, openCount),
              Math.max(1, openCount + 1),
              Math.max(1, openCount),
              Math.max(1, openCount + 2),
              Math.max(1, openCount),
            ],
          })
          setRecent(casesList.slice(0, 5))

          const rawName: string | undefined =
            session?.user?.name?.split(' ')[0] ||
            session?.user?.email?.split('@')[0] ||
            'Abogado'
          const name = rawName || 'Abogado'
          setFirstName(name.charAt(0).toUpperCase() + name.slice(1))
        } catch (err) {
          // Never let a render-prep error leave the dashboard blank.
          console.error('[dashboard] render-prep error:', err)
        }
      })
      .catch((err) => {
        // Defensive: Promise.all should never reject here (we caught individually).
        console.error('[dashboard] unexpected fetch error:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="relative space-y-12">
      <MeshGradient variant="lime" />

      {/* ── Demo banner (dismissible) ────────────────────────────── */}
      {showDemoBanner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: ease.outExpo }}
          className="relative z-20 flex items-center gap-3 px-4 py-2.5"
          style={{
            background: 'var(--lime-bg-soft)',
            border: '1px solid rgba(124,58,237,0.18)',
            borderRadius: 'var(--r-lg)',
            color: 'var(--lime-text-soft)',
          }}
        >
          <span className="text-[14px]" aria-hidden>👋</span>
          <p className="text-[12.5px] font-medium flex-1" style={{ color: 'var(--lime-text-soft)' }}>
            Bienvenido a la demo. Datos cargados para previa.
          </p>
          <button
            onClick={dismissDemoBanner}
            aria-label="Cerrar aviso de demo"
            className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
            style={{ color: 'var(--lime-text-soft)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(91,33,182,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </motion.div>
      )}

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: ease.outExpo }}
        className="relative z-10"
      >
        <p className="label-micro mb-3 capitalize">{today}</p>
        <h1 className="display-1" style={{ color: 'var(--ink-primary)' }}>
          Buenos días,{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--ink-primary)' }}>
            {firstName}
          </span>
          <span style={{ color: 'var(--lime-hover)' }}>.</span>
        </h1>
        <p className="mt-3 text-[15px]" style={{ color: 'var(--ink-secondary)' }}>
          Tu despacho al día. Esto es lo que tienes en marcha hoy.
        </p>
      </motion.div>

      {/* ── Stats bento (asymmetric) ──────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative z-10 grid grid-cols-12 gap-4"
      >
        {/* Hero stat — Expedientes activos */}
        <motion.div variants={staggerItem} className="col-span-12 lg:col-span-6">
          <Link href="/cases">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, ease: ease.outQuart }}
              className="relative overflow-hidden p-7 cursor-pointer h-full"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--r-2xl)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="label-meta mb-2">EXPEDIENTES · ACTIVOS</p>
                  <p className="text-[12px]" style={{ color: 'var(--ink-tertiary)' }}>
                    Casos abiertos en tu despacho
                  </p>
                </div>
                <DuotoneIcon name="briefcase" size={20} primary="var(--ink-tertiary)" secondary="var(--lime)" />
              </div>

              <div className="flex items-end justify-between">
                <div className="display-hero leading-none" style={{ color: 'var(--ink-primary)', fontSize: 88 }}>
                  {loading ? <ShimmerSkeleton className="h-[72px] w-24" /> : <NumberTicker value={stats.cases} />}
                </div>
                {!loading && stats.trend && (
                  <Sparkline data={stats.trend} width={140} height={48} color="#7C3AED" />
                )}
              </div>

              <div className="mt-6 pt-5 flex items-center gap-2 text-[13px] font-medium hairline-t" style={{ color: 'var(--ink-secondary)' }}>
                Ver expedientes
                <DuotoneIcon name="arrow-right" size={14} primary="var(--ink-secondary)" />
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* 3 small stats stacked */}
        <div className="col-span-12 lg:col-span-6 grid grid-cols-3 gap-4">
          {[
            { key: 'documents' as const, label: 'Documentos', icon: 'document' as const, href: '/documents' },
            { key: 'clients' as const, label: 'Clientes', icon: 'users' as const, href: '/clients' },
            { key: 'contracts_generated' as const, label: 'Contratos', icon: 'feather' as const, href: '/generate' },
          ].map((card) => (
            <motion.div key={card.key} variants={staggerItem}>
              <Link href={card.href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2, ease: ease.outQuart }}
                  className="p-5 cursor-pointer h-full flex flex-col justify-between"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--r-xl)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <DuotoneIcon
                    name={card.icon}
                    size={18}
                    primary="var(--ink-tertiary)"
                    secondary="var(--lime)"
                  />
                  <div className="mt-6">
                    <div className="font-display leading-none" style={{ fontSize: 40, color: 'var(--ink-primary)' }}>
                      {loading ? (
                        <ShimmerSkeleton className="h-9 w-12" />
                      ) : (
                        <NumberTicker value={stats[card.key]} />
                      )}
                    </div>
                    <p className="label-micro mt-2">{card.label}</p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Quick Actions bento ───────────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative z-10"
      >
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="display-3" style={{ color: 'var(--ink-primary)', fontSize: 24 }}>
            Acciones rápidas
          </h2>
          <span className="label-meta">{loading ? '' : `${stats.cases} activos hoy`}</span>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Hero action — Analizar (col-span-6) */}
          <motion.div variants={staggerItem} className="col-span-12 md:col-span-6">
            <Link href="/documents">
              <motion.div
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.2, ease: ease.outQuart }}
                className="relative overflow-hidden h-full p-7 cursor-pointer group"
                style={{
                  background: 'var(--obsidian)',
                  borderRadius: 'var(--r-2xl)',
                  border: '1px solid var(--obsidian-hover)',
                }}
              >
                {/* lime glow accent */}
                <div
                  aria-hidden
                  className="absolute -top-16 -right-16 w-56 h-56 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(199,242,132,0.22), transparent 70%)' }}
                />
                <div className="relative">
                  <div className="flex items-start justify-between mb-12">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--lime)' }}
                    >
                      <DuotoneIcon name="sparkles" size={20} primary="var(--lime-text-on)" secondary="var(--lime-text-on)" />
                    </div>
                    <DuotoneIcon
                      name="arrow-up-right"
                      size={18}
                      primary="rgba(255,255,255,0.45)"
                      className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                    />
                  </div>
                  <h3 className="font-display italic leading-tight" style={{ fontSize: 36, color: 'var(--lime)' }}>
                    Analizar
                  </h3>
                  <h3 className="font-display leading-tight" style={{ fontSize: 36, color: '#fff', marginTop: -4 }}>
                    documento
                  </h3>
                  <p className="text-[13px] mt-4 max-w-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Sube un contrato y LEXIA detecta cláusulas críticas, riesgos y obligaciones en segundos.
                  </p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Generar contrato */}
          <motion.div variants={staggerItem} className="col-span-12 md:col-span-3">
            <Link href="/generate">
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.2, ease: ease.outQuart }}
                className="h-full p-6 cursor-pointer group"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-2xl)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--lime-hover)'; e.currentTarget.style.boxShadow = '0 12px 32px -12px rgba(124,58,237,0.22)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="flex items-start justify-between mb-8">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--surface-elevated)' }}
                  >
                    <DuotoneIcon name="feather" size={18} primary="var(--ink-primary)" secondary="var(--lime)" />
                  </div>
                  <DuotoneIcon name="arrow-up-right" size={16} primary="var(--ink-tertiary)" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <h3 className="font-display leading-tight" style={{ fontSize: 22, color: 'var(--ink-primary)' }}>
                  Generar contrato
                </h3>
                <p className="text-[12.5px] mt-2" style={{ color: 'var(--ink-secondary)' }}>
                  NDA, arrendamiento, compraventa…
                </p>
              </motion.div>
            </Link>
          </motion.div>

          {/* Consultar LEXIA */}
          <motion.div variants={staggerItem} className="col-span-12 md:col-span-3">
            <Link href="/chat">
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.2, ease: ease.outQuart }}
                className="h-full p-6 cursor-pointer group relative overflow-hidden"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-2xl)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--lime-hover)'; e.currentTarget.style.boxShadow = '0 12px 32px -12px rgba(124,58,237,0.22)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="flex items-start justify-between mb-8">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--surface-elevated)' }}
                  >
                    <DuotoneIcon name="chat" size={18} primary="var(--ink-primary)" secondary="var(--lime)" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[5px]" style={{ background: 'var(--obsidian)', color: 'var(--lime)' }}>
                    IA
                  </span>
                </div>
                <h3 className="font-display leading-tight" style={{ fontSize: 22, color: 'var(--ink-primary)' }}>
                  Consultar LEXIA
                </h3>
                <p className="text-[12.5px] mt-2" style={{ color: 'var(--ink-secondary)' }}>
                  Dudas jurídicas al instante.
                </p>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Recent cases — Linear-style table ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: ease.outExpo }}
        className="relative z-10"
      >
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="display-3" style={{ color: 'var(--ink-primary)', fontSize: 24 }}>
            Expedientes recientes
          </h2>
          <Link href="/cases" className="text-[13px] font-medium flex items-center gap-1 group" style={{ color: 'var(--ink-secondary)' }}>
            Ver todos
            <DuotoneIcon name="arrow-right" size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div
          className="overflow-hidden"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-xl)',
          }}
        >
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map(i => <ShimmerSkeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : recent.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: ease.outExpo }}
              className="px-6 py-14 text-center"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{
                  background: 'var(--lime-bg-soft)',
                  boxShadow: '0 8px 24px -10px rgba(124,58,237,0.25), inset 0 0 0 1px rgba(124,58,237,0.10)',
                }}
              >
                <DuotoneIcon name="briefcase" size={26} primary="var(--lime-text-soft)" secondary="var(--lime-hover)" />
              </motion.div>
              <h3 className="font-display text-[24px] leading-tight" style={{ color: 'var(--ink-primary)' }}>
                Tu despacho está <em style={{ fontStyle: 'italic' }}>impoluto</em>.
              </h3>
              <p className="text-[13px] mt-2 max-w-sm mx-auto" style={{ color: 'var(--ink-secondary)' }}>
                Crea tu primer expediente y LEXIA te acompaña desde el primer escrito.
              </p>
              <div className="mt-6 inline-flex items-center gap-2">
                <Link href="/cases">
                  <motion.span
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium"
                    style={{ background: 'var(--obsidian)', color: 'var(--lime)' }}
                  >
                    <DuotoneIcon name="plus" size={13} primary="var(--lime)" />
                    Crear primer expediente
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          ) : (
            recent.map((c, idx) => (
              <Link key={c.id} href={`/cases/${c.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.32, ease: ease.outExpo }}
                  className="flex items-center gap-4 px-5 h-[52px] cursor-pointer transition-colors duration-120 group"
                  style={{ borderBottom: idx < recent.length - 1 ? '1px solid var(--hairline)' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--surface-elevated)' }}
                  >
                    <DuotoneIcon name="briefcase" size={13} primary="var(--ink-secondary)" secondary="var(--lime)" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-medium truncate" style={{ color: 'var(--ink-primary)' }}>
                      {c.title}
                    </p>
                  </div>

                  {c.case_number && (
                    <span className="label-meta px-1.5 py-0.5 rounded text-[10.5px] hidden md:inline" style={{ background: 'var(--surface-elevated)' }}>
                      {c.case_number}
                    </span>
                  )}

                  <StatusPill status={c.status || 'open'} />

                  <span className="label-meta hidden md:inline-block w-[78px] text-right">
                    {new Date(c.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </span>

                  <DuotoneIcon
                    name="arrow-right"
                    size={14}
                    primary="var(--ink-tertiary)"
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
