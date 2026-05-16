'use client'

import { useState, useEffect, use, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  nif_cif: string | null
  type: 'individual' | 'company'
  created_at: string
}

interface Case {
  id: string
  title: string
  status: 'open' | 'closed' | 'archived'
  case_number: string | null
  description: string | null
  created_at: string
  client_id: string | null
  clients?: { name: string; email: string }
}

interface HonorarioEntry {
  id: string
  concepto: string
  importe: number
  fecha: string
  estado: 'cobrado' | 'pendiente'
}

type Tab = 'info' | 'cases' | 'documents' | 'activity' | 'honorarios'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function getAvatarGradient(name: string, type: string) {
  if (type === 'company') return 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const hue = (hash * 47) % 360
  return `linear-gradient(135deg, hsl(${hue},65%,55%) 0%, hsl(${(hue + 40) % 360},65%,40%) 100%)`
}

function relativeDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  if (diff < 86400 * 7) return `hace ${Math.floor(diff / 86400)} días`
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatSpanishDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string; stripe: string }> = {
  open:     { bg: '#DCFCE7', color: '#166534', label: 'Activo',    stripe: '#22C55E' },
  closed:   { bg: '#F1F5F9', color: '#475569', label: 'Cerrado',   stripe: '#94A3B8' },
  archived: { bg: '#FEF3C7', color: '#92400E', label: 'Archivado', stripe: '#F59E0B' },
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'info',       label: 'Resumen',      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'cases',      label: 'Expedientes',  icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { id: 'documents',  label: 'Documentos',   icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'activity',   label: 'Actividad',    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'honorarios', label: 'Honorarios',   icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
]

// ─── Shared input focus handlers ──────────────────────────────────────────────

const focusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.target.style.borderColor = '#7C3AED'
  e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'
}
const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'var(--hairline)'
  e.target.style.boxShadow = 'none'
}

// ─── New Case Modal ───────────────────────────────────────────────────────────

function NewCaseModal({
  client,
  onClose,
  onSuccess,
}: {
  client: Client
  onClose: () => void
  onSuccess: (c: Case) => void
}) {
  const [form, setForm] = useState({ title: '', description: '', case_number: '', status: 'open' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('El título es obligatorio'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, client_id: client.id }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(typeof d.error === 'string' ? d.error : 'Error al guardar')
      }
      const data = await res.json()
      onSuccess(data.case)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    border: '1px solid var(--hairline)', borderRadius: 8,
    background: 'var(--surface)', color: 'var(--ink-primary)',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.5)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          position: 'relative', background: 'var(--surface)', borderRadius: 16,
          width: '100%', maxWidth: 520,
          boxShadow: '0 32px 72px -12px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" fill="none" stroke="#7C3AED" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>Nuevo expediente</p>
            <p style={{ fontSize: 12, color: 'var(--ink-tertiary)', marginTop: 2 }}>Para: <span style={{ color: 'var(--ink-secondary)', fontWeight: 500 }}>{client.name}</span></p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--hairline)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-tertiary)' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Título del expediente *
            </label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="Ej: Despido improcedente — García vs. Empresa S.L."
              style={inputBase} onFocus={focusIn} onBlur={focusOut} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                N.º Expediente
              </label>
              <input value={form.case_number} onChange={(e) => set('case_number', e.target.value)}
                placeholder="EXP-2026-001"
                style={{ ...inputBase, fontFamily: 'monospace' }} onFocus={focusIn} onBlur={focusOut} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Estado
              </label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)}
                style={inputBase} onFocus={focusIn} onBlur={focusOut}>
                <option value="open">Activo</option>
                <option value="closed">Cerrado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Descripción
            </label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Describe el caso brevemente…" rows={3}
              style={{ ...inputBase, resize: 'vertical', fontFamily: 'inherit' }}
              onFocus={focusIn as any} onBlur={focusOut as any} />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
              {error}
            </motion.div>
          )}

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '11px 16px', border: '1px solid var(--hairline)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: 'var(--ink-secondary)', background: 'var(--surface)', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: '11px 16px', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', background: loading ? '#9CA3AF' : 'var(--obsidian)', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creando…' : 'Crear expediente'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Tab: Resumen (Info) ──────────────────────────────────────────────────────

function TabInfo({ client, onSaved, cases }: { client: Client; onSaved: (c: Client) => void; cases: Case[] }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Client>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const startEdit = () => {
    setForm({ name: client.name, email: client.email ?? '', phone: client.phone ?? '', nif_cif: client.nif_cif ?? '', address: client.address ?? '', type: client.type })
    setSaveError('')
    setEditing(true)
  }

  const handleSave = async () => {
    if (!form.name?.trim()) { setSaveError('El nombre es obligatorio'); return }
    setSaving(true); setSaveError('')
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Error al guardar')
      const data = await res.json()
      onSaved(data.client ?? { ...client, ...form })
      setEditing(false); setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setSaveError('No se pudo guardar. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    border: '1px solid var(--hairline)', borderRadius: 8,
    background: 'var(--surface)', color: 'var(--ink-primary)',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: 'var(--ink-tertiary)', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: '0.07em',
  }

  const recentEvents = [
    { title: 'Cliente registrado', detail: `${client.name} añadido al despacho`, date: client.created_at, type: 'client' },
    ...cases.slice(0, 4).map((c) => ({ title: 'Expediente abierto', detail: c.title, date: c.created_at, type: 'case' })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  const eventIconColors: Record<string, { bg: string; color: string; path: string }> = {
    client: { bg: 'rgba(124,58,237,0.12)', color: '#7C3AED', path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    case:   { bg: 'rgba(3,105,161,0.1)',   color: '#0369A1', path: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
      {/* ── Left: editable info ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Info card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                {client.type === 'company' ? 'Datos de la empresa' : 'Datos personales'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--ink-tertiary)', marginTop: 2 }}>Información de contacto y legal</p>
            </div>
            {!editing ? (
              <button onClick={startEdit}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid var(--hairline)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--ink-secondary)', background: 'var(--surface)', cursor: 'pointer' }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditing(false)}
                  style={{ padding: '7px 14px', border: '1px solid var(--hairline)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--ink-secondary)', background: 'var(--surface)', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ padding: '7px 16px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', background: saving ? '#9CA3AF' : '#7C3AED', cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: 24 }}>
            <AnimatePresence>
              {saved && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginBottom: 16, padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Cambios guardados correctamente
                </motion.div>
              )}
            </AnimatePresence>
            {saveError && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>{saveError}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Nombre completo / Razón social</label>
                {editing ? (
                  <input value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                ) : (
                  <p style={{ fontSize: 14, color: 'var(--ink-primary)', padding: '8px 0' }}>{client.name}</p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Tipo de cliente</label>
                {editing ? (
                  <select value={form.type ?? client.type} onChange={(e) => set('type', e.target.value)} style={{ ...inputBase, cursor: 'pointer' }} onFocus={focusIn} onBlur={focusOut}>
                    <option value="individual">Persona física</option>
                    <option value="company">Empresa</option>
                  </select>
                ) : (
                  <p style={{ fontSize: 14, color: 'var(--ink-primary)', padding: '8px 0' }}>{client.type === 'company' ? 'Empresa' : 'Persona física'}</p>
                )}
              </div>

              <div>
                <label style={labelStyle}>{client.type === 'company' ? 'CIF' : 'NIF / DNI'}</label>
                {editing ? (
                  <input value={form.nif_cif ?? ''} onChange={(e) => set('nif_cif', e.target.value)} style={{ ...inputBase, fontFamily: 'monospace' }} onFocus={focusIn} onBlur={focusOut} />
                ) : (
                  <p style={{ fontSize: 14, color: 'var(--ink-primary)', fontFamily: 'monospace', padding: '8px 0' }}>{client.nif_cif || '—'}</p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                {editing ? (
                  <input type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                ) : (
                  <p style={{ fontSize: 14, color: 'var(--ink-primary)', padding: '8px 0' }}>
                    {client.email ? <a href={`mailto:${client.email}`} style={{ color: '#7C3AED', textDecoration: 'none' }}>{client.email}</a> : '—'}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Teléfono</label>
                {editing ? (
                  <input value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                ) : (
                  <p style={{ fontSize: 14, color: 'var(--ink-primary)', padding: '8px 0' }}>{client.phone || '—'}</p>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Dirección</label>
                {editing ? (
                  <input value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                ) : (
                  <p style={{ fontSize: 14, color: 'var(--ink-primary)', padding: '8px 0' }}>{client.address || '—'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--hairline)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>Actividad reciente</p>
            <p style={{ fontSize: 12, color: 'var(--ink-tertiary)', marginTop: 2 }}>Últimos 5 eventos</p>
          </div>
          <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentEvents.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--ink-tertiary)', textAlign: 'center', padding: '20px 0' }}>Sin actividad aún.</p>
            ) : recentEvents.map((ev, idx) => {
              const evStyle = eventIconColors[ev.type] ?? eventIconColors.client
              return (
                <div key={idx} style={{ display: 'flex', gap: 14, paddingBottom: idx < recentEvents.length - 1 ? 16 : 0, position: 'relative' }}>
                  {idx < recentEvents.length - 1 && (
                    <div style={{ position: 'absolute', left: 15, top: 34, bottom: 0, width: 1, background: 'var(--hairline)' }} />
                  )}
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: evStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                    <svg width="14" height="14" fill="none" stroke={evStyle.color} strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={evStyle.path} />
                    </svg>
                  </div>
                  <div style={{ flex: 1, paddingTop: 5 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-primary)', margin: 0 }}>{ev.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.detail}</p>
                    <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 3 }}>{formatSpanishDate(ev.date)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Right: LEXIA panel ── */}
      <div style={{
        borderRadius: 12, overflow: 'hidden',
        border: '1.5px solid rgba(124,58,237,0.2)',
        background: 'linear-gradient(160deg, rgba(124,58,237,0.04) 0%, rgba(91,33,182,0.08) 100%)',
        boxShadow: '0 4px 24px -8px rgba(124,58,237,0.15)',
      }}>
        {/* Panel header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" fill="none" stroke="#7C3AED" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#5B21B6', margin: 0 }}>LEXIA Intelligence</p>
            <p style={{ fontSize: 11, color: '#7C3AED', marginTop: 1, opacity: 0.8 }}>Análisis automático · IA legal</p>
          </div>
          <span style={{ padding: '3px 8px', background: 'rgba(124,58,237,0.15)', borderRadius: 20, fontSize: 10, fontWeight: 700, color: '#7C3AED', letterSpacing: '0.05em' }}>
            BETA
          </span>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Profile summary */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Perfil legal</p>
            <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.65)', borderRadius: 8, border: '1px solid rgba(124,58,237,0.12)' }}>
              <p style={{ fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.65, margin: 0 }}>
                {client.type === 'company'
                  ? `${client.name} es una empresa cliente. El perfil se genera automáticamente a partir de expedientes activos, documentos procesados e historial de actividad.`
                  : `${client.name} es cliente particular. LEXIA analiza expedientes, documentos y comunicaciones para un perfil de riesgo personalizado.`}
              </p>
            </div>
          </div>

          {/* Risk level */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Nivel de riesgo</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.6)', borderRadius: 8, border: '1px solid rgba(124,58,237,0.1)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: 'var(--ink-secondary)', margin: 0, flex: 1 }}>Pendiente de análisis</p>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#FEF3C7', color: '#92400E' }}>Medio</span>
            </div>
          </div>

          {/* Recommended actions */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Acciones recomendadas</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { action: 'Abrir primer expediente', desc: 'Vincular un caso para activar el análisis' },
                { action: 'Subir documentación', desc: 'Añadir contratos o escritos al expediente' },
                { action: 'Completar datos de contacto', desc: 'Email y teléfono para comunicaciones' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 12px', background: 'rgba(255,255,255,0.55)', borderRadius: 8, border: '1px solid rgba(124,58,237,0.08)', alignItems: 'flex-start' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED' }}>{i + 1}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)', margin: 0 }}>{item.action}</p>
                    <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 2 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detected risks */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Alertas activas</p>
            {[
              { icon: '⚡', label: 'Plazos procesales', detail: 'Sin expedientes activos' },
              { icon: '📋', label: 'Documentación', detail: 'Sin archivos vinculados' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', marginBottom: i === 0 ? 6 : 0, background: 'rgba(255,255,255,0.5)', borderRadius: 8, border: '1px solid rgba(124,58,237,0.08)' }}>
                <span style={{ fontSize: 14 }}>{r.icon}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)', margin: 0 }}>{r.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 1 }}>{r.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Expedientes ─────────────────────────────────────────────────────────

function TabCases({
  cases,
  client,
  loading,
  onNewCase,
}: {
  cases: Case[]
  client: Client
  loading: boolean
  onNewCase: () => void
}) {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'archived'>('all')

  const filtered = cases.filter((c) => filter === 'all' || c.status === filter)

  const filterOptions: { id: typeof filter; label: string }[] = [
    { id: 'all',      label: 'Todos' },
    { id: 'open',     label: 'Activo' },
    { id: 'closed',   label: 'Cerrado' },
    { id: 'archived', label: 'Archivado' },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 80, borderRadius: 12, background: 'var(--surface-elevated)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6, padding: '4px', background: 'var(--surface-elevated)', borderRadius: 10, border: '1px solid var(--hairline)' }}>
          {filterOptions.map((opt) => (
            <button key={opt.id} onClick={() => setFilter(opt.id)}
              style={{
                padding: '5px 14px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                background: filter === opt.id ? 'var(--surface)' : 'transparent',
                color: filter === opt.id ? 'var(--ink-primary)' : 'var(--ink-tertiary)',
                boxShadow: filter === opt.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              {opt.label}
            </button>
          ))}
        </div>

        <button onClick={onNewCase}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--obsidian)', cursor: 'pointer' }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo expediente
        </button>
      </div>

      {/* Count */}
      <p style={{ fontSize: 12, color: 'var(--ink-tertiary)', margin: 0 }}>
        {filtered.length} {filtered.length === 1 ? 'expediente' : 'expedientes'}
        {filter !== 'all' && ` · Filtro: ${filterOptions.find(o => o.id === filter)?.label}`}
      </p>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', border: '2px dashed var(--hairline)', borderRadius: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24" style={{ color: 'var(--ink-tertiary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 6px' }}>
            {filter === 'all' ? 'Sin expedientes' : `Sin expedientes ${filterOptions.find(o => o.id === filter)?.label?.toLowerCase()}`}
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-tertiary)', marginBottom: 20 }}>
            {filter === 'all' ? 'Este cliente aún no tiene expedientes vinculados.' : 'Prueba con otro filtro.'}
          </p>
          {filter === 'all' && (
            <button onClick={onNewCase}
              style={{ padding: '10px 22px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', background: '#7C3AED', cursor: 'pointer' }}>
              Crear primer expediente
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((c, idx) => {
            const st = STATUS_STYLES[c.status] ?? STATUS_STYLES.closed
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                <Link href={`/cases/${c.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, display: 'flex', alignItems: 'stretch', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    {/* Status stripe */}
                    <div style={{ width: 4, flexShrink: 0, background: st.stripe }} />

                    <div style={{ flex: 1, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                          {c.title}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                          {c.case_number && (
                            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--ink-tertiary)', background: 'var(--surface-elevated)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--hairline)' }}>
                              {c.case_number}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: 'var(--ink-tertiary)' }}>{formatSpanishDate(c.created_at)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--ink-tertiary)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Tab: Documentos ──────────────────────────────────────────────────────────

function TabDocuments({ clientId }: { clientId: string }) {
  const [dragging, setDragging] = useState(false)

  const DEMO_DOCS = [
    { id: 'd1', title: 'Contrato de servicios jurídicos', type: 'contrato', date: '2025-11-10T10:00:00Z', case: 'EXP-2025-0142', size: '142 KB' },
    { id: 'd2', title: 'Demanda inicial — primera instancia', type: 'demanda', date: '2025-12-01T10:00:00Z', case: 'EXP-2025-0142', size: '380 KB' },
    { id: 'd3', title: 'Escrito de contestación', type: 'escrito', date: '2026-01-15T10:00:00Z', case: 'EXP-2025-0143', size: '210 KB' },
  ]

  const TYPE_ICON_COLORS: Record<string, { bg: string; color: string }> = {
    contrato: { bg: '#EDE9FE', color: '#5B21B6' },
    demanda:  { bg: '#FEE2E2', color: '#991B1B' },
    escrito:  { bg: '#E0F2FE', color: '#0369A1' },
    informe:  { bg: '#FEF3C7', color: '#92400E' },
    otro:     { bg: '#F1F5F9', color: '#475569' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Upload area */}
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDrop={() => setDragging(false)}
        style={{
          padding: '28px 24px', textAlign: 'center',
          border: `2px dashed ${dragging ? '#7C3AED' : 'var(--hairline)'}`,
          borderRadius: 12,
          background: dragging ? 'rgba(124,58,237,0.04)' : 'var(--surface)',
          transition: 'all 0.2s', cursor: 'pointer',
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--ink-tertiary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-primary)', margin: '0 0 4px' }}>Arrastra archivos aquí</p>
        <p style={{ fontSize: 12, color: 'var(--ink-tertiary)', margin: '0 0 14px' }}>PDF, DOCX, imágenes — máx. 50 MB</p>
        <button style={{ padding: '8px 18px', border: '1px solid var(--hairline)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--ink-secondary)', background: 'var(--surface)', cursor: 'pointer' }}>
          Seleccionar archivo
        </button>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--ink-tertiary)', margin: 0 }}>
          {DEMO_DOCS.length} documentos vinculados
        </p>
      </div>

      {/* Document grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {DEMO_DOCS.map((doc, idx) => {
          const typeStyle = TYPE_ICON_COLORS[doc.type] ?? TYPE_ICON_COLORS.otro
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.06 }}
              style={{
                padding: 18, background: 'var(--surface)', border: '1px solid var(--hairline)',
                borderRadius: 12, cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--hairline)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: typeStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" fill="none" stroke={typeStyle.color} strokeWidth={1.4} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: typeStyle.bg, color: typeStyle.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {doc.type}
                </span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-primary)', margin: '0 0 8px', lineHeight: 1.4 }}>{doc.title}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--ink-tertiary)', background: 'var(--surface-elevated)', padding: '2px 6px', borderRadius: 4 }}>
                  {doc.case}
                </span>
                <span style={{ fontSize: 11, color: 'var(--ink-tertiary)' }}>{doc.size}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Empty state note */}
      <div style={{ padding: '12px 16px', background: 'var(--surface-elevated)', borderRadius: 8, fontSize: 12, color: 'var(--ink-tertiary)', textAlign: 'center' }}>
        Los documentos se asocian automáticamente a través de los expedientes del cliente.
      </div>
    </div>
  )
}

// ─── Tab: Actividad ───────────────────────────────────────────────────────────

function TabActivity({ client, cases }: { client: Client; cases: Case[] }) {
  type EventType = 'case_created' | 'document_added' | 'analysis_run' | 'note_added' | 'client_created'

  const EVENT_STYLES: Record<EventType, { bg: string; color: string; path: string }> = {
    client_created:  { bg: 'rgba(124,58,237,0.12)', color: '#7C3AED', path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    case_created:    { bg: 'rgba(3,105,161,0.1)',   color: '#0369A1', path: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    document_added:  { bg: 'rgba(22,101,52,0.1)',   color: '#166534', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    analysis_run:    { bg: 'rgba(124,58,237,0.1)',  color: '#7C3AED', path: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    note_added:      { bg: 'rgba(146,64,14,0.1)',   color: '#92400E', path: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  }

  const events: { title: string; detail: string; date: string; type: EventType }[] = [
    { title: 'Cliente registrado', detail: `${client.name} añadido al despacho`, date: client.created_at, type: 'client_created' as EventType },
    ...cases.map((c) => ({ title: 'Expediente abierto', detail: c.title, date: c.created_at, type: 'case_created' as EventType })),
    ...cases.filter((c) => c.status === 'closed').map((c) => ({ title: 'Expediente cerrado', detail: c.title, date: c.created_at, type: 'note_added' as EventType })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <p style={{ fontSize: 13, color: 'var(--ink-tertiary)', marginBottom: 24, marginTop: 0 }}>
        Historial completo de actividad · {events.length} eventos
      </p>

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', border: '2px dashed var(--hairline)', borderRadius: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24" style={{ color: 'var(--ink-tertiary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-primary)', margin: '0 0 6px' }}>Sin actividad registrada</p>
          <p style={{ fontSize: 13, color: 'var(--ink-tertiary)', margin: 0 }}>Los eventos aparecerán aquí cuando se realicen acciones.</p>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 19, top: 20, bottom: 20, width: 1, background: 'var(--hairline)', zIndex: 0 }} />

          {events.map((ev, idx) => {
            const evStyle = EVENT_STYLES[ev.type] ?? EVENT_STYLES.note_added
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                style={{ display: 'flex', gap: 16, marginBottom: idx < events.length - 1 ? 20 : 0, position: 'relative', zIndex: 1 }}
              >
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: evStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1.5px solid ${evStyle.color}22`,
                }}>
                  <svg width="16" height="16" fill="none" stroke={evStyle.color} strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={evStyle.path} />
                  </svg>
                </div>

                {/* Content card */}
                <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-primary)', margin: 0 }}>{ev.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', margin: 0, flexShrink: 0, whiteSpace: 'nowrap' }}>{formatSpanishDate(ev.date)}</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--ink-secondary)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ev.detail}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Tab: Honorarios ──────────────────────────────────────────────────────────

function TabHonorarios({ client }: { client: Client }) {
  const [entries, setEntries] = useState<HonorarioEntry[]>([
    { id: '1', concepto: 'Consulta inicial', importe: 250, fecha: '2025-11-10', estado: 'cobrado' },
    { id: '2', concepto: 'Redacción de contrato', importe: 800, fecha: '2025-12-01', estado: 'cobrado' },
    { id: '3', concepto: 'Representación en juicio', importe: 1500, fecha: '2026-02-15', estado: 'pendiente' },
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [newEntry, setNewEntry] = useState<{ concepto: string; importe: string; fecha: string; estado: 'pendiente' | 'cobrado' }>({ concepto: '', importe: '', fecha: new Date().toISOString().split('T')[0], estado: 'pendiente' })

  const total     = entries.reduce((s, e) => s + e.importe, 0)
  const cobrado   = entries.filter((e) => e.estado === 'cobrado').reduce((s, e) => s + e.importe, 0)
  const pendiente = entries.filter((e) => e.estado === 'pendiente').reduce((s, e) => s + e.importe, 0)

  const fmt = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

  const addEntry = () => {
    if (!newEntry.concepto || !newEntry.importe) return
    setEntries((p) => [...p, { id: Date.now().toString(), concepto: newEntry.concepto, importe: parseFloat(newEntry.importe), fecha: newEntry.fecha, estado: newEntry.estado }])
    setNewEntry({ concepto: '', importe: '', fecha: new Date().toISOString().split('T')[0], estado: 'pendiente' })
    setShowAdd(false)
  }

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '8px 12px', fontSize: 13,
    border: '1px solid var(--hairline)', borderRadius: 8,
    background: 'var(--surface)', color: 'var(--ink-primary)',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Total facturado', value: fmt(total),     color: 'var(--ink-primary)', bg: 'var(--surface)',  border: 'var(--hairline)', icon: '💼' },
          { label: 'Cobrado',         value: fmt(cobrado),   color: '#166534',            bg: '#F0FDF4',          border: '#BBF7D0',         icon: '✅' },
          { label: 'Pendiente',       value: fmt(pendiente), color: '#92400E',            bg: '#FFFBEB',          border: '#FDE68A',         icon: '⏳' },
        ].map((card) => (
          <div key={card.label} style={{ padding: '20px', background: card.bg, border: `1px solid ${card.border}`, borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                {card.label}
              </p>
              <span style={{ fontSize: 16 }}>{card.icon}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: card.color, fontVariantNumeric: 'tabular-nums', margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>Registros de honorarios</p>
          <button onClick={() => setShowAdd(!showAdd)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', background: '#7C3AED', cursor: 'pointer' }}>
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Registrar cobro
          </button>
        </div>

        {/* Add row */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', borderBottom: '1px solid var(--hairline)' }}
            >
              <div style={{ padding: '16px 20px', background: 'rgba(124,58,237,0.03)', display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: 160 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Concepto</label>
                  <input value={newEntry.concepto} onChange={(e) => setNewEntry((p) => ({ ...p, concepto: e.target.value }))}
                    placeholder="Ej: Consulta telefónica" style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div style={{ flex: 1, minWidth: 100 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Importe (€)</label>
                  <input type="number" value={newEntry.importe} onChange={(e) => setNewEntry((p) => ({ ...p, importe: e.target.value }))}
                    placeholder="0.00" style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fecha</label>
                  <input type="date" value={newEntry.fecha} onChange={(e) => setNewEntry((p) => ({ ...p, fecha: e.target.value }))}
                    style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div style={{ flex: 1, minWidth: 110 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estado</label>
                  <select value={newEntry.estado} onChange={(e) => setNewEntry((p) => ({ ...p, estado: e.target.value as 'cobrado' | 'pendiente' }))}
                    style={{ ...inputBase, cursor: 'pointer' }} onFocus={focusIn} onBlur={focusOut}>
                    <option value="pendiente">Pendiente</option>
                    <option value="cobrado">Cobrado</option>
                  </select>
                </div>
                <button onClick={addEntry}
                  style={{ padding: '8px 16px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', background: '#7C3AED', cursor: 'pointer', flexShrink: 0 }}>
                  Guardar
                </button>
                <button onClick={() => setShowAdd(false)}
                  style={{ padding: '8px 12px', border: '1px solid var(--hairline)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--ink-secondary)', background: 'var(--surface)', cursor: 'pointer', flexShrink: 0 }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Column headers */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', background: 'var(--surface-elevated)', borderBottom: '1px solid var(--hairline)' }}>
          <p style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Concepto</p>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0, minWidth: 100, textAlign: 'right' }}>Fecha</p>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0, minWidth: 100, textAlign: 'right' }}>Importe</p>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0, minWidth: 90, textAlign: 'right' }}>Estado</p>
        </div>

        {/* Rows */}
        {entries.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-tertiary)', fontSize: 13 }}>Sin registros todavía.</div>
        ) : (
          entries.map((entry, idx) => (
            <div
              key={entry.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 0, padding: '14px 20px',
                borderTop: '1px solid var(--hairline)', transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <p style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--ink-primary)', margin: 0 }}>{entry.concepto}</p>
              <p style={{ fontSize: 13, color: 'var(--ink-tertiary)', minWidth: 100, textAlign: 'right', margin: 0 }}>
                {new Date(entry.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-primary)', minWidth: 100, textAlign: 'right', fontVariantNumeric: 'tabular-nums', margin: 0 }}>
                {fmt(entry.importe)}
              </p>
              <div style={{ minWidth: 90, textAlign: 'right' }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  background: entry.estado === 'cobrado' ? '#DCFCE7' : '#FEF3C7',
                  color: entry.estado === 'cobrado' ? '#166534' : '#92400E',
                }}>
                  {entry.estado === 'cobrado' ? 'Cobrado' : 'Pendiente'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Holded notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--surface-elevated)', border: '1px solid var(--hairline)', borderRadius: 8 }}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--ink-tertiary)', flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p style={{ fontSize: 12, color: 'var(--ink-tertiary)', margin: 0 }}>
          Integración con <strong>Holded</strong> disponible en el Plan Enterprise. Sincroniza facturas y pagos automáticamente.
        </p>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)
  const [client, setClient] = useState<Client | null>(null)
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [casesLoading, setCasesLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [showNewCase, setShowNewCase] = useState(false)

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch('/api/clients')
        const data = await res.json()
        const found = data.clients?.find((c: Client) => c.id === clientId) ?? null
        setClient(found)

        if (found) {
          const casesRes = await fetch('/api/cases')
          const casesData = await casesRes.json()
          const clientCases = (casesData.cases ?? []).filter(
            (c: Case) => c.client_id === clientId || c.clients?.email === found.email
          )
          setCases(clientCases)
        }
      } catch (err) {
        console.error('Error fetching client:', err)
      } finally {
        setLoading(false)
        setCasesLoading(false)
      }
    }
    fetchClient()
  }, [clientId])

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ height: 36, width: 100, borderRadius: 8, background: 'var(--surface-elevated)', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: 200, borderRadius: 16, background: 'var(--surface-elevated)', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: 44, borderRadius: 10, background: 'var(--surface-elevated)', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: 320, borderRadius: 16, background: 'var(--surface-elevated)', animation: 'pulse 1.5s infinite' }} />
      </div>
    )
  }

  // ── Not found ──
  if (!client) {
    return (
      <div style={{ textAlign: 'center', padding: '96px 24px' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="28" height="28" fill="none" stroke="#DC2626" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 8 }}>Cliente no encontrado</p>
        <p style={{ fontSize: 14, color: 'var(--ink-tertiary)', marginBottom: 24 }}>El cliente solicitado no existe o fue eliminado.</p>
        <Link href="/clients"
          style={{ padding: '10px 22px', background: 'var(--obsidian)', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
          ← Volver a clientes
        </Link>
      </div>
    )
  }

  const avatarGrad = getAvatarGradient(client.name, client.type)
  const initials   = getInitials(client.name)
  const activeCases = cases.filter((c) => c.status === 'open').length
  const memberSince = new Date(client.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })

  // Derive city from address
  const city = client.address?.split(',').at(-1)?.trim() ?? null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* ─── Back nav ─── */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/clients"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--ink-tertiary)', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-primary)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-tertiary)' }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Clientes
        </Link>
      </div>

      {/* ─── Hero header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 16,
          padding: '32px',
          marginBottom: 24,
        }}
      >
        {/* Avatar + name row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 28 }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: 18, flexShrink: 0,
            background: avatarGrad, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px',
            boxShadow: '0 4px 16px -4px rgba(0,0,0,0.22)',
          }}>
            {initials}
          </div>

          {/* Name + type + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink-primary)', lineHeight: 1.1, margin: 0, letterSpacing: '-0.5px', fontFamily: 'Georgia, "Times New Roman", serif' }}>
                {client.name}
              </h1>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: client.type === 'company' ? '#EDE9FE' : '#E0F2FE',
                color: client.type === 'company' ? '#5B21B6' : '#0369A1',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {client.type === 'company' ? 'Empresa' : 'Persona'}
              </span>
            </div>

            {/* Meta row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {client.nif_cif && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: 'monospace', padding: '4px 10px', borderRadius: 6, background: 'var(--surface-elevated)', color: 'var(--ink-secondary)', border: '1px solid var(--hairline)' }}>
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" /></svg>
                  {client.nif_cif}
                </span>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'var(--surface-elevated)', color: '#7C3AED', border: '1px solid var(--hairline)', textDecoration: 'none' }}>
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {client.email}
                </a>
              )}
              {client.phone && (
                <a href={`tel:${client.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'var(--surface-elevated)', color: 'var(--ink-secondary)', border: '1px solid var(--hairline)', textDecoration: 'none' }}>
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {client.phone}
                </a>
              )}
              {city && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'var(--surface-elevated)', color: 'var(--ink-tertiary)', border: '1px solid var(--hairline)' }}>
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {city}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            <button
              onClick={() => { setActiveTab('cases'); setShowNewCase(true) }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--obsidian)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Nuevo expediente
            </button>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid var(--hairline)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--ink-secondary)', background: 'var(--surface)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Documento
            </button>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#7C3AED', background: 'rgba(124,58,237,0.05)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              Chat LEXIA
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1px solid var(--hairline)', paddingTop: 24 }}>
          {[
            { label: 'Expedientes',    value: cases.length,   icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', highlight: false },
            { label: 'Casos activos',  value: activeCases,    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', highlight: activeCases > 0 },
            { label: 'Documentos',     value: '—',            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', highlight: false },
            { label: 'Cliente desde',  value: memberSince,    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', highlight: false },
          ].map((stat, i) => (
            <div key={stat.label}
              style={{
                padding: '0 24px 0 0',
                borderRight: i < 3 ? '1px solid var(--hairline)' : 'none',
                paddingLeft: i > 0 ? 24 : 0,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: stat.highlight ? 'rgba(124,58,237,0.1)' : 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" fill="none" stroke={stat.highlight ? '#7C3AED' : 'var(--ink-tertiary)'} strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                  </svg>
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                  {stat.label}
                </p>
              </div>
              <p style={{ fontSize: typeof stat.value === 'string' && stat.value.length > 6 ? 14 : 24, fontWeight: 800, color: stat.highlight ? '#7C3AED' : 'var(--ink-primary)', fontVariantNumeric: 'tabular-nums', margin: 0, lineHeight: 1.2 }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Tab bar ─── */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '1px solid var(--hairline)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 16px',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? '#7C3AED' : 'transparent'}`,
              background: 'transparent',
              fontSize: 13.5, fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#7C3AED' : 'var(--ink-tertiary)',
              cursor: 'pointer', transition: 'all 0.15s',
              marginBottom: -1,
            }}
            onMouseEnter={(e) => { if (activeTab !== tab.id) (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-secondary)' }}
            onMouseLeave={(e) => { if (activeTab !== tab.id) (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-tertiary)' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ opacity: activeTab === tab.id ? 1 : 0.55 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab content ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {activeTab === 'info' && <TabInfo client={client} onSaved={setClient} cases={cases} />}
          {activeTab === 'cases' && (
            <TabCases cases={cases} client={client} loading={casesLoading} onNewCase={() => setShowNewCase(true)} />
          )}
          {activeTab === 'documents' && <TabDocuments clientId={clientId} />}
          {activeTab === 'activity' && <TabActivity client={client} cases={cases} />}
          {activeTab === 'honorarios' && <TabHonorarios client={client} />}
        </motion.div>
      </AnimatePresence>

      {/* ─── New case modal ─── */}
      <AnimatePresence>
        {showNewCase && (
          <NewCaseModal
            client={client}
            onClose={() => setShowNewCase(false)}
            onSuccess={(newCase) => {
              setCases((p) => [newCase, ...p])
              setShowNewCase(false)
              setActiveTab('cases')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
