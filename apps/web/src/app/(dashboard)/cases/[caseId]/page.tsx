'use client'

import { useState, useEffect, useRef, useCallback, use, type ReactNode } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Edit2, X, Euro, Sparkles, Copy, Check, Send, Bot, User } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { TimelineEvent } from '@/components/ui/TimelineEvent'
import { AlertBox } from '@/components/ui/AlertBox'
import { CaseAssignment } from '@/components/features/case-assignment'

interface CaseDetail {
  id: string
  title: string
  case_number: string | null
  status: 'open' | 'closed' | 'archived'
  description: string | null
  area?: string | null
  amount?: number | null
  client_id?: string | null
  created_at: string
  updated_at: string
  clients: { name: string; email: string } | null
  documents?: any[]
  analyses?: any[]
}

interface ClientOption {
  id: string
  name: string
}

type TabType = 'info' | 'documents' | 'chat' | 'timeline' | 'analysis'

const STATUS_CONFIG = {
  open: { label: 'Activo' },
  closed: { label: 'Cerrado' },
  archived: { label: 'Archivado' },
}

export default function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params)
  const [caseData, setCaseData] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [editOpen, setEditOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summaryText, setSummaryText] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryCopied, setSummaryCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'open' as 'open' | 'closed' | 'archived',
    area: '',
    amount: '',
    client_id: '',
  })

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await fetch(`/api/cases/${caseId}`)
        const data = await res.json()
        setCaseData(data.case || null)
      } catch (error) {
        console.error('Error fetching case:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCase()
  }, [caseId])

  useEffect(() => {
    if (!editOpen) return
    fetch('/api/clients')
      .then((r) => r.json())
      .then((d) => setClients(d.clients || []))
      .catch(() => setClients([]))
  }, [editOpen])

  const openEdit = () => {
    if (!caseData) return
    setForm({
      title: caseData.title || '',
      description: caseData.description || '',
      status: caseData.status,
      area: caseData.area || '',
      amount: caseData.amount != null ? String(caseData.amount) : '',
      client_id: caseData.client_id || '',
    })
    setEditOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description || null,
        status: form.status,
        area: form.area || null,
        client_id: form.client_id || null,
      }
      if (form.amount.trim() !== '') {
        const n = Number(form.amount)
        if (Number.isFinite(n)) payload.amount = n
      } else {
        payload.amount = null
      }
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Error al guardar')
      setCaseData(data.case)
      setEditOpen(false)
    } catch (err) {
      console.error(err)
      alert((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-slate-100 rounded animate-pulse" />
        <div className="h-20 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="space-y-6">
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 transition-colors"
        >
          <ArrowLeft size={16} /> Volver a expedientes
        </Link>
        <div className="text-center py-20">
          <AlertBox type="error" title="Caso no encontrado" message="El caso solicitado no existe." />
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[caseData.status]
  const formattedDate = new Date(caseData.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'info', label: 'Información', icon: '📋' },
    { id: 'documents', label: 'Documentos', icon: '📄' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'timeline', label: 'Timeline', icon: '⏱️' },
    { id: 'analysis', label: 'Análisis', icon: '🔍' },
  ]

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/cases"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 transition-colors w-fit"
      >
        <ArrowLeft size={16} /> Volver a expedientes
      </Link>

      {/* Compact header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-6 pb-4 border-b border-slate-200"
      >
        <div className="flex-1 min-w-0">
          {caseData.case_number && (
            <p className="text-xs font-mono text-slate-500 mb-1">{caseData.case_number}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-sans font-semibold text-slate-900 leading-tight truncate">
              {caseData.title}
            </h1>
            <Badge
              variant={
                caseData.status === 'open'
                  ? 'success'
                  : caseData.status === 'closed'
                    ? 'secondary'
                    : 'warning'
              }
            >
              {statusConfig.label}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setSummaryOpen(true)}
            className="bg-white border border-[#8F7EE9]/40 text-[#5B4FB8] hover:bg-[#8F7EE9]/5 px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Sparkles size={16} /> Resumir con IA
          </button>
          <Link
            href={`/finanzas?new_budget=1&case_id=${caseId}`}
            className="bg-white border border-[#8F7EE9]/40 text-[#5B4FB8] hover:bg-[#8F7EE9]/5 px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Euro size={16} /> Presupuesto
          </Link>
          <button
            onClick={openEdit}
            className="bg-[#8F7EE9] hover:bg-[#7C6BD6] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Edit2 size={16} /> Editar
          </button>
        </div>
      </motion.div>

      {/* Quick Info Cards */}
      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Cliente</p>
          <div className="flex items-center gap-2">
            {caseData.clients && <Avatar name={caseData.clients.name} size="sm" type="client" />}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 truncate text-sm">{caseData.clients?.name || 'Sin cliente'}</p>
              <p className="text-xs text-slate-500 truncate">{caseData.clients?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Creado</p>
          <p className="font-semibold text-slate-900 text-sm">{formattedDate}</p>
          <p className="text-xs text-slate-500 mt-1">
            Hace {Math.floor((Date.now() - new Date(caseData.created_at).getTime()) / (1000 * 60 * 60 * 24))} días
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Área · Cuantía</p>
          <p className="font-semibold text-slate-900 text-sm">{caseData.area || '—'}</p>
          <p className="text-xs text-slate-500 mt-1">
            {caseData.amount != null
              ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseData.amount)
              : 'Sin cuantía'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Estado</p>
          <p className="font-semibold text-slate-900 text-sm">{statusConfig.label}</p>
          <p className="text-xs text-slate-500 mt-1">Exp. {caseData.case_number || '—'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
              whileHover={{ y: -2 }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Asignación</h3>
                <CaseAssignment caseId={caseData.id} />
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Descripción</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {caseData.description || 'Sin descripción disponible'}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Datos del expediente</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Número</p>
                    <p className="text-sm font-mono font-semibold text-slate-800">{caseData.case_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Estado</p>
                    <p className="text-sm text-slate-800">{statusConfig.label}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Área jurídica</p>
                    <p className="text-sm text-slate-800">{caseData.area || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Cuantía</p>
                    <p className="text-sm text-slate-800">
                      {caseData.amount != null
                        ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(caseData.amount)
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Fecha apertura</p>
                    <p className="text-sm text-slate-800">{formattedDate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Última actualización</p>
                    <p className="text-sm text-slate-800">
                      {new Date(caseData.updated_at || caseData.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Documentos del Caso</h3>
                <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium text-sm">
                  + Añadir Documento
                </button>
              </div>
              {caseData.documents && caseData.documents.length > 0 ? (
                <div className="space-y-3">
                  {caseData.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-violet-600">📄</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{doc.title}</p>
                          <p className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-sm text-violet-600 hover:bg-violet-50 rounded transition-colors">
                        Analizar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <AlertBox type="info" title="Sin documentos" message="Añade documentos para comenzar a analizar." />
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <CaseChat caseId={caseId} caseTitle={caseData.title} />
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <TimelineEvent
                type="document"
                title="Documento añadido: Contrato de servicios"
                description="Se añadió un nuevo documento al expediente"
                timestamp="Hoy, 14:32"
                meta="Por tu usuario"
              />
              <TimelineEvent
                type="success"
                title="Análisis completado"
                description="El análisis de 'NDA.pdf' fue completado con éxito"
                timestamp="Ayer, 10:15"
                meta="LEXIA IA"
              />
              <TimelineEvent
                type="info"
                title="Expediente creado"
                description={caseData.description ?? undefined}
                timestamp={formattedDate}
                meta="Creado por ti"
                isLast
              />
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Análisis Guardados</h3>
              {caseData.analyses && caseData.analyses.length > 0 ? (
                <div className="space-y-4">
                  {caseData.analyses.map((analysis: any) => (
                    <div key={analysis.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-slate-900">{analysis.title}</h4>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-3">{analysis.summary}</p>
                      <div className="flex items-center justify-between mt-4 text-xs">
                        <span className="text-slate-500">{new Date(analysis.created_at).toLocaleDateString('es-ES')}</span>
                        <button className="text-violet-600 hover:text-violet-700 font-medium">
                          Ver análisis →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <AlertBox type="info" title="Sin análisis" message="Sube documentos y analízalos con LEXIA para ver los resultados aquí." />
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => !saving && setEditOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-semibold text-slate-900">Editar expediente</h2>
                <button
                  onClick={() => setEditOpen(false)}
                  disabled={saving}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Título *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estado</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="open">Activo</option>
                      <option value="closed">Cerrado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Área</label>
                    <select
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">Sin área</option>
                      <option value="Civil">Civil</option>
                      <option value="Mercantil">Mercantil</option>
                      <option value="Laboral">Laboral</option>
                      <option value="Penal">Penal</option>
                      <option value="Familia">Familia</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Inmobiliario">Inmobiliario</option>
                      <option value="Fiscal">Fiscal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cuantía (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cliente</label>
                    <select
                      value={form.client_id}
                      onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">Sin cliente</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditOpen(false)}
                    disabled={saving}
                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-[#8F7EE9] hover:bg-[#7C6BD6] disabled:opacity-60 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                  >
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {summaryOpen && (
          <SummaryModal
            caseId={caseId}
            text={summaryText}
            setText={setSummaryText}
            loading={summaryLoading}
            setLoading={setSummaryLoading}
            copied={summaryCopied}
            setCopied={setSummaryCopied}
            onClose={() => setSummaryOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function SummaryModal({
  caseId, text, setText, loading, setLoading, copied, setCopied, onClose,
}: {
  caseId: string
  text: string
  setText: (s: string | ((p: string) => string)) => void
  loading: boolean
  setLoading: (b: boolean) => void
  copied: boolean
  setCopied: (b: boolean) => void
  onClose: () => void
}) {
  useEffect(() => {
    if (text) return
    setLoading(true)
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(`/api/cases/${caseId}/summary`)
        if (!r.body) throw new Error('No body')
        const reader = r.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''
        while (!cancelled) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() || ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const evt = JSON.parse(line.slice(6))
              if (evt.type === 'delta' && evt.text) {
                setText((prev: string) => prev + evt.text)
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error(err)
        setText('Error al generar resumen. Inténtalo de nuevo.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId])

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const cleanText = text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#8F7EE9' }}>
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Resumen del expediente</h2>
              <p className="text-xs text-slate-500">Generado por LEXIA · Claude Haiku 4.5</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && !cleanText ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="text-xs">LEXIA está analizando el expediente</span>
              {[0,1,2].map(i => (
                <span key={i} className="inline-block h-2 w-2 rounded-full" style={{
                  backgroundColor: '#8F7EE9',
                  animation: `lexiaDot 1.2s ${i * 0.15}s infinite ease-in-out`,
                }} />
              ))}
              <style>{`@keyframes lexiaDot { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8) } 40% { opacity: 1; transform: scale(1.1) } }`}</style>
            </div>
          ) : (
            <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
              {cleanText.split('\n').map((line, idx) => {
                if (line.startsWith('## ')) {
                  return <h3 key={idx} className="text-base font-semibold text-slate-900 mt-5 mb-2">{line.slice(3)}</h3>
                }
                if (line.startsWith('- ')) {
                  return <p key={idx} className="ml-3">• {line.slice(2)}</p>
                }
                return <p key={idx}>{line || ' '}</p>
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-200">
          <button
            onClick={copyText}
            disabled={loading || !cleanText}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm bg-[#8F7EE9] hover:bg-[#7C6BD6] text-white rounded-lg font-medium"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}


// ─── CaseChat: embedded LEXIA chat scoped to one expediente ────────────────
interface ChatMsg { role: 'user' | 'assistant'; content: string; streaming?: boolean }

function CaseChat({ caseId, caseTitle }: { caseId: string; caseTitle: string }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [convId, setConvId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return
    const userMsg: ChatMsg = { role: 'user', content: text }
    setMsgs(prev => [...prev, userMsg])
    setInput('')
    setStreaming(true)

    setMsgs(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    try {
      const res = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, caseId, conversationId: convId }),
      })
      if (!res.ok || !res.body) throw new Error('Error de red')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          const line = part.startsWith('data: ') ? part.slice(6) : part
          if (!line.trim()) continue
          try {
            const evt = JSON.parse(line)
            if (evt.type === 'delta') {
              fullText += evt.text
              setMsgs(prev => prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: fullText } : m
              ))
            } else if (evt.type === 'done') {
              if (evt.conversation_id) setConvId(evt.conversation_id)
            } else if (evt.type === 'error') {
              throw new Error(evt.message)
            }
          } catch { /* ignore json parse errors */ }
        }
      }

      setMsgs(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, streaming: false } : m))
    } catch (err) {
      setMsgs(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { ...m, content: `Error: ${err instanceof Error ? err.message : 'Error desconocido'}`, streaming: false } : m
      ))
    } finally {
      setStreaming(false)
    }
  }, [streaming, msgs.length, caseId, convId])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function renderContent(text: string): ReactNode {
    const lines = text.split('\n')
    const result: ReactNode[] = []
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      if (line.trimStart().startsWith('|')) {
        const tableLines: string[] = []
        while (i < lines.length && lines[i].trimStart().startsWith('|')) {
          tableLines.push(lines[i])
          i++
        }
        const dataRows = tableLines.filter(l => !/^\|[\s\-|:]+\|$/.test(l.trim()))
        if (dataRows.length > 0) {
          result.push(
            <div key={`t${i}`} className="overflow-x-auto my-2 rounded-lg border border-slate-200">
              <table className="text-xs w-full border-collapse">
                <tbody>
                  {dataRows.map((row, ri) => {
                    const cells = row.split('|').slice(1, -1)
                    return (
                      <tr key={ri} className={ri === 0 ? 'bg-[#8F7EE9]/10 font-semibold text-slate-900' : 'border-t border-slate-100 text-slate-700'}>
                        {cells.map((cell, ci) => (
                          <td key={ci} className="px-2.5 py-1.5">{cell.trim()}</td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        }
        continue
      }
      if (line.trim() === '---') {
        result.push(<hr key={`hr${i}`} className="border-slate-200 my-2" />)
        i++; continue
      }
      if (line.startsWith('## ')) {
        result.push(<p key={`h2${i}`} className="font-semibold text-slate-900 mt-3 mb-1 text-sm">{line.slice(3)}</p>)
        i++; continue
      }
      if (line.startsWith('### ')) {
        result.push(<p key={`h3${i}`} className="font-medium text-slate-800 mt-2 mb-0.5 text-sm">{line.slice(4)}</p>)
        i++; continue
      }
      if (line.trim() === '') {
        result.push(<br key={`br${i}`} />)
        i++; continue
      }
      const clean = line.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1')
      result.push(<span key={`l${i}`} className="block">{clean}</span>)
      i++
    }
    return <>{result}</>
  }

  const SUGGESTIONS = [
    '¿Cuál es el estado actual y los próximos pasos?',
    '¿Qué documentos necesito para este expediente?',
    '¿Cuáles son los riesgos más importantes?',
    'Resume los hechos clave del caso',
  ]

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-[#8F7EE9]/5 to-white">
        <div className="w-8 h-8 rounded-full bg-[#8F7EE9] flex items-center justify-center flex-shrink-0">
          <Bot size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">LEXIA — Asistente IA</p>
          <p className="text-xs text-slate-500 truncate max-w-xs">Contexto activo: {caseTitle}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-slate-400">Conectado</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {msgs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8F7EE9]/10 flex items-center justify-center">
              <Bot size={22} className="text-[#8F7EE9]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">LEXIA tiene acceso completo a este expediente</p>
              <p className="text-xs text-slate-400 mt-1">Pregunta sobre hechos, documentos, riesgos o próximos pasos</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#8F7EE9]/30 text-[#5B4FB8] hover:bg-[#8F7EE9]/5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-[#8F7EE9] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={13} className="text-white" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#8F7EE9] text-white rounded-br-sm'
                : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-bl-sm'
            }`}>
              {msg.role === 'assistant' && msg.streaming && !msg.content && (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8F7EE9] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8F7EE9] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8F7EE9] animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              )}
              {msg.content && (
                <div className="text-sm leading-relaxed">{renderContent(msg.content)}</div>
              )}
              {msg.role === 'assistant' && msg.streaming && msg.content && (
                <span className="inline-block w-1 h-4 bg-[#8F7EE9] ml-0.5 animate-pulse" />
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={13} className="text-slate-600" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-100">
        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-[#8F7EE9] focus-within:ring-2 focus-within:ring-[#8F7EE9]/10 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta a LEXIA sobre este expediente… (Enter para enviar)"
            rows={1}
            disabled={streaming}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none min-h-[24px] max-h-[120px] disabled:opacity-60"
            style={{ height: 'auto' }}
            onInput={e => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="p-1.5 rounded-lg bg-[#8F7EE9] hover:bg-[#7C6BD6] disabled:opacity-40 text-white transition-colors flex-shrink-0"
          >
            {streaming
              ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send size={14} />}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 text-center">
          LEXIA puede cometer errores. Verifica la información jurídica importante con fuentes oficiales.
        </p>
      </div>
    </div>
  )
}