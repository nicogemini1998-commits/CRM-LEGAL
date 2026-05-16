'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  type: 'individual' | 'company'
  nif_cif: string | null
  created_at: string
}

function NewClientModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: 'individual', nif_cif: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(typeof d.error === 'string' ? d.error : 'Error al guardar') }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <h2 className="text-2xl font-bold text-slate-900">Nuevo cliente</h2>
          <p className="text-slate-500 mt-1">Añade la información de contacto</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">Tipo de cliente</label>
            <div className="flex gap-3">
              {(['individual', 'company'] as const).map(t => (
                <motion.button
                  key={t}
                  type="button"
                  onClick={() => set('type', t)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition ${
                    form.type === t
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white border-transparent shadow-lg shadow-indigo-500/30'
                      : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
                  whileHover={form.type !== t ? { scale: 1.02 } : {}}
                  whileTap={{ scale: 0.98 }}
                >
                  {t === 'individual' ? '👤 Persona' : '🏢 Empresa'}
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Nombre *</label>
            <motion.input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder={form.type === 'company' ? 'Empresa S.L.' : 'Juan García López'}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
              whileFocus={{ scale: 1.01 }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">{form.type === 'company' ? 'CIF' : 'DNI'}</label>
              <input
                value={form.nif_cif}
                onChange={e => set('nif_cif', e.target.value)}
                placeholder={form.type === 'company' ? 'B12345678' : '12345678A'}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Teléfono</label>
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="600 123 456"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="cliente@email.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            />
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-700 text-sm bg-red-50 border border-red-200 p-4 rounded-xl"
            >
              {error}
            </motion.div>
          )}
          <div className="flex gap-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-600 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg shadow-indigo-500/30 transition disabled:opacity-50"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? 'Guardando...' : 'Añadir cliente'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function ClientAvatar({ name, type }: { name: string; type: string }) {
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${type === 'company' ? 'bg-purple-50' : 'bg-blue-50'}`}>
      <span className={`text-sm font-bold ${type === 'company' ? 'text-purple-600' : 'text-blue-600'}`}>
        {name[0].toUpperCase()}
      </span>
    </div>
  )
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [search, setSearch] = useState('')

  const fetch_ = async () => {
    const res = await fetch('/api/clients')
    const data = await res.json()
    setClients(data.clients || [])
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [])

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.nif_cif?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-end justify-between gap-6"
      >
        <div>
          <h1 className="display-2" style={{ color: 'var(--ink-primary)' }}>
            Clientes
          </h1>
          <p className="text-[13px] mt-2 font-mono" style={{ color: 'var(--ink-tertiary)' }}>
            {clients.length} {clients.length === 1 ? 'cliente registrado' : 'clientes registrados'}
          </p>
        </div>
        <motion.button
          onClick={() => setShowNew(true)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
          style={{ background: 'var(--obsidian)', color: 'var(--lime)', boxShadow: 'var(--shadow-md)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Añadir cliente
        </motion.button>
      </motion.div>

      {clients.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--ink-tertiary)' }}>
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-4-4" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email, NIF/CIF…"
              className="w-full pl-10 pr-4 py-2.5 text-[13.5px] rounded-xl focus:outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', color: 'var(--ink-primary)' }}
            />
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map(i => <div key={i} className="shimmer rounded-xl h-[68px]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 rounded-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}
        >
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--lime-bg-soft)' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--lime-text-soft)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-display text-[22px]" style={{ color: 'var(--ink-primary)' }}>{search ? 'Sin resultados' : 'Sin clientes'}</h3>
          {!search && (
            <>
              <p className="text-[13px] mt-1 mb-6" style={{ color: 'var(--ink-secondary)' }}>Añade tu primer cliente para vincularlo a expedientes.</p>
              <motion.button
                onClick={() => setShowNew(true)}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium"
                style={{ background: 'var(--obsidian)', color: 'var(--lime)' }}
              >
                Añadir cliente
              </motion.button>
            </>
          )}
        </motion.div>
      ) : (
        <motion.div layout className="grid gap-3">
          {filtered.map((c, idx) => {
            const hash = c.name.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)
            const hue = (hash * 47) % 360
            const gradient = `linear-gradient(135deg, hsl(${hue},65%,55%) 0%, hsl(${(hue+30)%360},65%,40%) 100%)`
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.32 }}
                whileHover={{ y: -2 }}
                onClick={() => router.push(`/clients/${c.id}`)}
                className="p-4 group cursor-pointer transition-colors duration-200"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-xl)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--lime-hover)'
                  e.currentTarget.style.boxShadow = '0 6px 20px -10px rgba(10,10,10,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--hairline)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-display italic"
                    style={{ background: gradient, fontSize: 18, paddingBottom: 2 }}
                  >
                    {c.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-[14.5px]" style={{ color: 'var(--ink-primary)' }}>{c.name}</p>
                      <span
                        className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{
                          background: c.type === 'company' ? 'var(--plum-bg)' : 'var(--info-bg)',
                          color: c.type === 'company' ? 'var(--plum)' : '#1E40AF',
                        }}
                      >
                        {c.type === 'company' ? 'Empresa' : 'Particular'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-[12px]">
                      {c.email && (
                        <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="transition-colors" style={{ color: 'var(--ink-secondary)' }}>
                          {c.email}
                        </a>
                      )}
                      {c.nif_cif && (
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-elevated)', color: 'var(--ink-secondary)' }}>
                          {c.nif_cif}
                        </span>
                      )}
                      {c.phone && (
                        <span className="font-mono text-[11px]" style={{ color: 'var(--ink-tertiary)' }}>{c.phone}</span>
                      )}
                    </div>
                  </div>
                  <svg className="w-4 h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--ink-tertiary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {showNew && <NewClientModal onClose={() => setShowNew(false)} onSuccess={() => { setShowNew(false); fetch_() }} />}
      </AnimatePresence>
    </div>
  )
}
