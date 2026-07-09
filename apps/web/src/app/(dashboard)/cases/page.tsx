'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { DuotoneIcon } from '@/components/ui/duotone-icon'
import { StatusPill } from '@/components/ui/status-pill'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'
import { CommandShortcut } from '@/components/ui/command-shortcut'
import { ease } from '@/lib/motion'
import { cachedFetchJSON, invalidate as invalidateCache } from '@/lib/hooks/useCachedFetch'

interface Case {
  id: string
  title: string
  description: string | null
  status: 'open' | 'closed' | 'archived'
  case_number: string | null
  created_at: string
  clients: { name: string; email: string } | null
}

interface Client { id: string; name: string }

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'open', label: 'Activos' },
  { key: 'closed', label: 'Cerrados' },
  { key: 'archived', label: 'Archivados' },
] as const

type Filter = typeof FILTERS[number]['key']

function clientAvatar(name?: string | null) {
  if (!name) return null
  const ch = name[0].toUpperCase()
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const hue = (hash * 47) % 360
  return { ch, gradient: `linear-gradient(135deg, hsl(${hue},65%,55%) 0%, hsl(${(hue+30)%360},65%,40%) 100%)` }
}

function NewCaseModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [caseNumber, setCaseNumber] = useState('')
  const [clientId, setClientId] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    cachedFetchJSON<any>('/api/clients')
      .then((d) => setClients(d?.clients || []))
      .catch((err) => console.error('[cases:new-modal] clients fetch failed:', err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('El título es obligatorio'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, case_number: caseNumber, client_id: clientId || undefined }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear expediente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: 'rgba(10,10,10,0.4)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.24, ease: ease.outExpo }}
        className="relative w-full max-w-lg overflow-hidden"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--r-2xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--hairline)',
        }}
      >
        <div className="p-6 hairline-b">
          <h2 className="font-display text-[26px] leading-tight" style={{ color: 'var(--ink-primary)' }}>
            Nuevo <span style={{ fontStyle: 'italic' }}>expediente</span>
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label-micro block mb-2">Título *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Divorcio López-García, Reclamación laboral…"
              className="w-full px-3 py-2.5 text-[14px] rounded-lg focus:outline-none transition-all"
              style={{ border: '1px solid var(--hairline)', background: 'var(--surface)' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-micro block mb-2">Nº Expediente</label>
              <input
                value={caseNumber}
                onChange={e => setCaseNumber(e.target.value)}
                placeholder="EXP-2025-0001"
                className="w-full px-3 py-2.5 text-[14px] font-mono rounded-lg focus:outline-none"
                style={{ border: '1px solid var(--hairline)', background: 'var(--surface)' }}
              />
            </div>
            <div>
              <label className="label-micro block mb-2">Cliente</label>
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full px-3 py-2.5 text-[14px] rounded-lg focus:outline-none bg-white"
                style={{ border: '1px solid var(--hairline)' }}
              >
                <option value="">Sin cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label-micro block mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Contexto del expediente, partes implicadas, importes en liza…"
              className="w-full px-3 py-2.5 text-[14px] rounded-lg focus:outline-none resize-none"
              style={{ border: '1px solid var(--hairline)', background: 'var(--surface)' }}
            />
          </div>
          {error && (
            <p className="text-[13px] p-3 rounded-lg" style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}>{error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <motion.button
              type="button" onClick={onClose}
              whileTap={{ scale: 0.97 }}
              className="flex-1 px-4 py-2.5 text-[13px] font-medium rounded-lg transition-colors"
              style={{ color: 'var(--ink-secondary)', border: '1px solid var(--hairline)' }}
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit" disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="flex-1 px-4 py-2.5 text-[13px] font-medium rounded-lg transition-colors disabled:opacity-50"
              style={{ background: 'var(--obsidian)', color: 'var(--lime)' }}
            >
              {loading ? 'Creando…' : 'Crear expediente'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function CasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const refresh = async (force = false) => {
    try {
      if (force) invalidateCache('/api/cases')
      const data = await cachedFetchJSON<any>('/api/cases')
      setCases(data?.cases || [])
    } catch (err) {
      console.error('[cases] refresh failed:', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { refresh() }, [])

  // Cmd+N to create
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setShowNew(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const counts = {
    all: cases.length,
    open: cases.filter(c => c.status === 'open').length,
    closed: cases.filter(c => c.status === 'closed').length,
    archived: cases.filter(c => c.status === 'archived').length,
  }

  const filtered = cases.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch = !q ||
      c.title.toLowerCase().includes(q) ||
      c.case_number?.toLowerCase().includes(q) ||
      c.clients?.name.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: ease.outExpo }}
        className="flex items-end justify-between gap-6"
      >
        <div>
          <h1 className="display-2" style={{ color: 'var(--ink-primary)' }}>
            Expedientes
          </h1>
          <p className="text-[13px] mt-2 font-mono" style={{ color: 'var(--ink-tertiary)' }}>
            {counts.open} activos · {counts.closed} cerrados · {counts.archived} archivados
          </p>
        </div>
        <motion.button
          onClick={() => setShowNew(true)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
          style={{ background: 'var(--obsidian)', color: 'var(--lime)', boxShadow: 'var(--shadow-md)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--obsidian-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--obsidian)'}
        >
          <DuotoneIcon name="plus" size={14} primary="var(--lime)" />
          Nuevo expediente
          <CommandShortcut keys={['⌘', 'N']} variant="dark" />
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="relative"
      >
        <DuotoneIcon
          name="search" size={15}
          primary="var(--ink-tertiary)"
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
        />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar por título, nº expediente, cliente, descripción…"
          className="w-full pl-10 pr-4 py-2.5 text-[13.5px] rounded-xl focus:outline-none transition-colors"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            color: 'var(--ink-primary)',
          }}
        />
      </motion.div>

      {/* Filters — segmented underline */}
      <div className="relative flex items-center gap-1 -mt-2" style={{ borderBottom: '1px solid var(--hairline)' }}>
        {FILTERS.map(f => {
          const isActive = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="relative px-4 py-2.5 text-[13px] font-medium transition-colors duration-150"
              style={{ color: isActive ? 'var(--ink-primary)' : 'var(--ink-tertiary)' }}
            >
              {f.label}
              <span className="ml-1.5 label-meta text-[10.5px]">
                {counts[f.key]}
              </span>
              {isActive && (
                <motion.span
                  layoutId="filterUnderline"
                  className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full"
                  style={{ background: 'var(--lime-hover)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <ShimmerSkeleton key={i} className="h-24 w-full" rounded="xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 rounded-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--lime-bg-soft)' }}
          >
            <DuotoneIcon name="briefcase" size={22} primary="var(--lime-text-soft)" secondary="var(--lime-hover)" />
          </div>
          <h3 className="font-display text-[22px]" style={{ color: 'var(--ink-primary)' }}>Sin expedientes</h3>
          <p className="text-[13px] mt-1 mb-6" style={{ color: 'var(--ink-secondary)' }}>
            {searchQuery ? `No hay resultados para "${searchQuery}"` : 'Crea tu primer expediente para empezar'}
          </p>
          <motion.button
            onClick={() => setShowNew(true)}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium"
            style={{ background: 'var(--obsidian)', color: 'var(--lime)' }}
          >
            <DuotoneIcon name="plus" size={14} primary="var(--lime)" />
            Crear expediente
          </motion.button>
        </motion.div>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence>
            {filtered.map((c, idx) => {
              const avatar = clientAvatar(c.clients?.name)
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.32, ease: ease.outExpo }}
                  whileHover={{ y: -2 }}
                  onClick={() => router.push(`/cases/${c.id}`)}
                  className="p-5 cursor-pointer group transition-colors duration-200"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--r-xl)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--lime-hover)'
                    e.currentTarget.style.boxShadow = '0 8px 24px -10px rgba(10,10,10,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--hairline)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        <p className="font-medium text-[15.5px] leading-snug" style={{ color: 'var(--ink-primary)' }}>
                          {c.title}
                        </p>
                        {c.case_number && (
                          <span
                            className="font-mono text-[10.5px] px-1.5 py-0.5 rounded-md"
                            style={{ background: 'var(--surface-elevated)', color: 'var(--ink-secondary)' }}
                          >
                            {c.case_number}
                          </span>
                        )}
                        <StatusPill status={c.status} />
                      </div>
                      {c.description && (
                        <p className="text-[13px] mb-3 line-clamp-2" style={{ color: 'var(--ink-secondary)' }}>
                          {c.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-[12px]">
                        {avatar && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
                              style={{ background: avatar.gradient }}
                            >
                              {avatar.ch}
                            </div>
                            <span style={{ color: 'var(--ink-secondary)' }}>{c.clients?.name}</span>
                          </div>
                        )}
                        <span className="font-mono ml-auto" style={{ color: 'var(--ink-tertiary)' }}>
                          {new Date(c.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <DuotoneIcon
                      name="arrow-right"
                      size={16}
                      primary="var(--ink-tertiary)"
                      className="flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {showNew && <NewCaseModal onClose={() => setShowNew(false)} onSuccess={() => { setShowNew(false); refresh(true) }} />}
      </AnimatePresence>
    </div>
  )
}
