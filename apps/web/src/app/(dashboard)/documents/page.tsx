'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/ui/toast'
import { ShareDocumentModal } from '@/components/features/share-document'
import { DuotoneIcon } from '@/components/ui/duotone-icon'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'
import { SkillPanel } from '@/components/features/skill-panel'
import { ease } from '@/lib/motion'
import { cachedFetchJSON, invalidate as invalidateCache } from '@/lib/hooks/useCachedFetch'

interface Document {
  id: string
  title: string
  document_type: string
  doc_type?: string
  confidential: boolean
  created_at: string
  storage_path: string | null
  case_id: string | null
  client_id: string | null
  client_name?: string
}

interface ClientOption { id: string; name: string; nif_cif: string | null }
interface CaseOption  { id: string; title: string; client_id: string }

interface Analysis {
  id: string
  analysis_type: string
  content: Record<string, unknown>
  tokens_input: number
  tokens_output: number
  tokens_cache: number
  created_at: string
}

type RiskLevel = 'ALTO' | 'MEDIO' | 'BAJO'

function RiskBadge({ level }: { level: RiskLevel }) {
  const colors: Record<RiskLevel, string> = {
    ALTO: 'bg-red-50 text-red-700 border-red-200',
    MEDIO: 'bg-amber-50 text-amber-700 border-amber-200',
    BAJO: 'bg-green-50 text-green-700 border-green-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[level] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {level}
    </span>
  )
}

function AnalysisModal({ analysis, onClose }: { analysis: Analysis; onClose: () => void }) {
  const content = analysis.content as Record<string, unknown>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Análisis Jurídico</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {analysis.tokens_input.toLocaleString()} tokens entrada · {analysis.tokens_output.toLocaleString()} tokens salida
              {analysis.tokens_cache > 0 && ` · ${analysis.tokens_cache.toLocaleString()} en caché`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {!!content.resumen_ejecutivo && (
            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Resumen ejecutivo</h3>
              <p className="text-slate-700 leading-relaxed">{String(content.resumen_ejecutivo)}</p>
            </section>
          )}

          {Array.isArray(content.riesgos_identificados) && content.riesgos_identificados.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Riesgos identificados</h3>
              <div className="space-y-3">
                {(content.riesgos_identificados as Array<Record<string, unknown>>).map((risk, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-slate-800 font-medium text-sm">{String(risk.riesgo)}</p>
                      <RiskBadge level={String(risk.probabilidad) as RiskLevel} />
                    </div>
                    {!!risk.impacto && <p className="text-slate-600 text-sm mt-1.5">{String(risk.impacto)}</p>}
                    {!!risk.recomendacion && (
                      <p className="text-sm mt-2 font-medium" style={{ color: 'var(--lime-hover)' }}>→ {String(risk.recomendacion)}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {Array.isArray(content.clauses_clave) && content.clauses_clave.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Cláusulas clave</h3>
              <div className="space-y-2">
                {(content.clauses_clave as Array<Record<string, unknown>>).map((clause, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100">
                    <RiskBadge level={String(clause.riesgo_nivel) as RiskLevel} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 text-sm font-medium">{String(clause.nombre)}</p>
                      {!!clause.justificacion && <p className="text-slate-500 text-xs mt-0.5">{String(clause.justificacion)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {Array.isArray(content.recomendaciones) && content.recomendaciones.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Recomendaciones</h3>
              <ul className="space-y-1.5">
                {(content.recomendaciones as string[]).map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--lime-hover)' }}>•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!!content.raw && !content.resumen_ejecutivo && (
            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Análisis</h3>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{String(content.raw)}</p>
            </section>
          )}

          {!!content.disclaimer && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-xs">{String(content.disclaimer)}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function UploadModal({ onClose, onSuccess, initialClientId }: { onClose: () => void; onSuccess: () => void; initialClientId?: string }) {
  const [title, setTitle] = useState('')
  const [docType, setDocType] = useState('contract')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { success, error: toastError } = useToast()
  const [clients, setClients] = useState<ClientOption[]>([])
  const [cases, setCases] = useState<CaseOption[]>([])
  const [selectedClientId, setSelectedClientId] = useState(initialClientId || '')
  const [selectedCaseId, setSelectedCaseId] = useState('')

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || [])).catch(() => {})
    fetch('/api/cases').then(r => r.json()).then(d => setCases(d.cases || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedClientId) { setSelectedCaseId(''); return }
    const clientCases = cases.filter(c => c.client_id === selectedClientId)
    setSelectedCaseId(clientCases[0]?.id || '')
  }, [selectedClientId, cases])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) { setError('Completa todos los campos'); return }
    if (!selectedClientId) { setError('Selecciona un cliente'); return }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', title)
      fd.append('document_type', docType)
      if (selectedCaseId) fd.append('case_id', selectedCaseId)
      fd.append('client_id', selectedClientId)
      const res = await fetch('/api/documents', { method: 'POST', body: fd })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      success('Documento subido y vinculado al cliente')
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al subir documento'
      setError(msg)
      toastError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <h2 className="text-2xl font-bold text-slate-900">Subir documento</h2>
          <p className="text-slate-500 mt-1">PDF, DOCX o TXT — máximo 10MB</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Título</label>
            <motion.input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contrato de arrendamiento..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              whileFocus={{ scale: 1.01 }}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Cliente</label>
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition bg-white"
            >
              <option value="">— Selecciona cliente —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}{c.nif_cif ? ` · ${c.nif_cif}` : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Tipo</label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition bg-white"
            >
              <option value="contract">Contrato</option>
              <option value="brief">Escrito</option>
              <option value="motion">Demanda / Recurso</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Archivo</label>
            <motion.div
              onMouseEnter={() => setIsDragging(true)}
              onMouseLeave={() => setIsDragging(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging || file
                  ? 'border-violet-400 bg-violet-50'
                  : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/50'
              }`}
              animate={{ scale: isDragging ? 1.02 : 1 }}
            >
              {file ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                  <p className="text-slate-900 font-bold">{file.name}</p>
                  <p className="text-slate-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </motion.div>
              ) : (
                <div>
                  <motion.svg
                    className="w-10 h-10 text-violet-500 mx-auto mb-3"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </motion.svg>
                  <p className="text-slate-900 font-semibold">Arrastra tu archivo aquí</p>
                  <p className="text-slate-500 text-sm mt-1">o haz clic para seleccionar</p>
                </div>
              )}
            </motion.div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="hidden"
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg shadow-violet-500/30 transition disabled:opacity-50"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? 'Subiendo...' : 'Subir documento'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}


type AnalysisStatus = 'pending' | 'done' | 'error' | 'missing'

const DOC_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  sentencia:       { label: 'Sentencia',      color: 'bg-blue-50 text-blue-700 border-blue-200' },
  citacion:        { label: 'Citación',       color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  contrato:        { label: 'Contrato',       color: 'bg-violet-50 text-violet-700 border-violet-200' },
  hoja_encargo:    { label: 'Hoja encargo',   color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  demanda:         { label: 'Demanda',        color: 'bg-rose-50 text-rose-700 border-rose-200' },
  recurso:         { label: 'Recurso',        color: 'bg-orange-50 text-orange-700 border-orange-200' },
  informe_pericial:{ label: 'Pericial',       color: 'bg-amber-50 text-amber-700 border-amber-200' },
  escritura:       { label: 'Escritura',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  escrito:         { label: 'Escrito',        color: 'bg-slate-100 text-slate-700 border-slate-200' },
  informe:         { label: 'Informe',        color: 'bg-teal-50 text-teal-700 border-teal-200' },
  brief:           { label: 'Informe',        color: 'bg-teal-50 text-teal-700 border-teal-200' },
  otro:            { label: 'Otro',           color: 'bg-slate-50 text-slate-600 border-slate-200' },
}

function DocTypeBadge({ type }: { type: string }) {
  const meta = DOC_TYPE_LABELS[type] || DOC_TYPE_LABELS.otro
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${meta.color}`}>
      {meta.label}
    </span>
  )
}


function AnalysisStatusBadge({ status }: { status: AnalysisStatus; riskLevel?: string }) {
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
        ✓ Analizado
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>🔄</motion.span>
        Analizando…
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
        ⚠ Error
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
      Sin analizar
    </span>
  )
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [activeAnalysis, setActiveAnalysis] = useState<Analysis | null>(null)
  const [sharingDoc, setSharingDoc] = useState<Document | null>(null)
  const [skillDoc, setSkillDoc] = useState<Document | null>(null)
  const [analysisMap, setAnalysisMap] = useState<Record<string, { status: AnalysisStatus; riskLevel?: string }>>({})
  const [clientFilter, setClientFilter] = useState('')
  const [clients, setClients] = useState<ClientOption[]>([])
  const { success, error: toastError } = useToast()

  // Filtro: documentos del cliente seleccionado
  const filteredDocuments = useMemo(() => {
    if (!clientFilter) return documents
    return documents.filter(d => d.client_id === clientFilter)
  }, [documents, clientFilter])

  const fetchDocuments = async (force = false) => {
    let docs: Document[] = []
    try {
      if (force) invalidateCache('/api/documents')
      const data = await cachedFetchJSON<any>('/api/documents')
      docs = data?.documents || []
      setDocuments(docs)
    } catch (err) {
      console.error('[documents] fetch failed:', err)
    } finally {
      setLoading(false)
    }
    docs.forEach(async (doc) => {
      try {
        const r = await fetch(`/api/documents/${doc.id}/analysis`)
        if (!r.ok) return
        const j = await r.json()
        const status: AnalysisStatus = j.status || 'missing'
        const risk = j.analysis?.content?.risk_level
        setAnalysisMap(prev => ({ ...prev, [doc.id]: { status, riskLevel: typeof risk === 'string' ? risk : undefined } }))
      } catch { /* ignore */ }
    })
  }

  useEffect(() => { fetchDocuments() }, [])
  useEffect(() => {
    if (clientFilter !== undefined) fetchDocuments(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientFilter])
  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const pendingIds = Object.entries(analysisMap).filter(([, v]) => v.status === 'pending').map(([k]) => k)
    if (pendingIds.length === 0) return
    const t = setInterval(async () => {
      for (const id of pendingIds) {
        try {
          const r = await fetch(`/api/documents/${id}/analysis`)
          if (!r.ok) continue
          const j = await r.json()
          if (j.status === 'done') {
            const risk = j.analysis?.content?.risk_level
            setAnalysisMap(prev => ({ ...prev, [id]: { status: 'done', riskLevel: typeof risk === 'string' ? risk : undefined } }))
          }
        } catch { /* ignore */ }
      }
    }, 2000)
    return () => clearInterval(t)
  }, [analysisMap])

  const handleViewAnalysis = async (docId: string) => {
    try {
      const r = await fetch(`/api/documents/${docId}/analysis`)
      if (!r.ok) { toastError('No se pudo obtener el análisis'); return }
      const j = await r.json()
      if (j.analysis && j.status === 'done') setActiveAnalysis(j.analysis as Analysis)
      else success('El análisis todavía está en curso…')
    } catch {
      toastError('Error de conexión')
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: ease.outExpo }}
        className="flex items-end justify-between gap-6"
      >
        <div>
          <h1 className="display-2" style={{ color: 'var(--ink-primary)' }}>
            Documentos
          </h1>
          <p className="text-[13px] mt-2" style={{ color: 'var(--ink-tertiary)' }}>
            Sube un contrato y deja que LEXIA detecte riesgos en segundos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {clients.length > 0 && (
            <select
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              style={{ color: clientFilter ? '#5B4FB8' : undefined }}
            >
              <option value="">Todos los clientes</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          <motion.button
            onClick={() => setShowUpload(true)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors bg-[#8F7EE9] hover:bg-[#7C6BD6] text-white shadow-md"
          >
            <DuotoneIcon name="plus" size={14} primary="#ffffff" />
            Subir documento
          </motion.button>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map(i => <ShimmerSkeleton key={i} className="h-20 w-full" rounded="xl" />)}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: ease.outExpo }}
          className="text-center py-20 rounded-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}
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
            <DuotoneIcon name="document" size={26} primary="var(--lime-text-soft)" secondary="var(--lime-hover)" />
          </motion.div>
          <h3 className="font-display text-[24px] leading-tight" style={{ color: 'var(--ink-primary)' }}>
            Aún <em style={{ fontStyle: 'italic' }}>sin documentos</em>.
          </h3>
          <p className="text-[13px] mt-2 max-w-sm mx-auto" style={{ color: 'var(--ink-secondary)' }}>
            Sube tu primer contrato y LEXIA lo analizará en segundos.
          </p>
          <motion.button
            onClick={() => setShowUpload(true)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-[#8F7EE9] hover:bg-[#7C6BD6] text-white"
          >
            <DuotoneIcon name="plus" size={14} primary="#ffffff" />
            Subir primer documento
          </motion.button>
        </motion.div>
      ) : (
        <motion.div layout className="grid gap-3">
          {filteredDocuments.map((doc, idx) => (
            <motion.div
              key={doc.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.32, ease: ease.outExpo }}
              whileHover={{ y: -2 }}
              className="p-4 flex items-center justify-between gap-4 group transition-colors duration-200"
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
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                  style={{ background: 'var(--surface-elevated)' }}
                >
                  <DuotoneIcon name="document" size={18} primary="var(--ink-primary)" secondary="var(--lime)" />
                  {/* lime corner */}
                  <span
                    className="absolute top-0 right-0 w-0 h-0"
                    style={{
                      borderTop: '8px solid var(--lime)',
                      borderLeft: '8px solid transparent',
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[14px] truncate" style={{ color: 'var(--ink-primary)' }}>
                    {doc.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className="text-[10.5px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider"
                      style={{ background: 'var(--surface-elevated)', color: 'var(--ink-secondary)' }}
                    >
                      {DOC_TYPE_LABELS[doc.document_type]?.label || doc.document_type}
                    </span>
                    <span className="text-[11px] font-mono" style={{ color: 'var(--ink-tertiary)' }}>
                      {new Date(doc.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                    {doc.confidential && (
                      <span
                        className="inline-flex items-center gap-1 text-[10.5px] font-medium px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--plum-bg)', color: 'var(--plum)' }}
                      >
                        <DuotoneIcon name="lock" size={10} primary="var(--plum)" secondary="var(--plum)" />
                        Confidencial
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleViewAnalysis(doc.id)}
                  className="cursor-pointer"
                  title="Ver análisis IA"
                >
                  <div className="flex items-center gap-2">
                    <AnalysisStatusBadge
                      status={analysisMap[doc.id]?.status || 'pending'}
                      riskLevel={analysisMap[doc.id]?.riskLevel}
                    />
                    {doc.doc_type && <DocTypeBadge type={doc.doc_type} />}
                  </div>
                </button>
                <motion.button
                  onClick={() => setSharingDoc(doc)}
                  whileTap={{ scale: 0.96 }}
                  className="px-3 py-2 text-[12.5px] font-medium rounded-lg flex items-center gap-1.5 transition-colors duration-150"
                  style={{
                    color: 'var(--ink-secondary)',
                    border: '1px solid var(--hairline)',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  Compartir
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onSuccess={() => { setShowUpload(false); fetchDocuments(true) }}
          />
        )}
        {activeAnalysis && (
          <AnalysisModal
            analysis={activeAnalysis}
            onClose={() => setActiveAnalysis(null)}
          />
        )}
        {sharingDoc && (
          <ShareDocumentModal
            documentTitle={sharingDoc.title}
            documentId={sharingDoc.id}
            onClose={() => setSharingDoc(null)}
          />
        )}
        {skillDoc && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSkillDoc(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.28, ease: ease.outExpo }}
              className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl"
              style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-xl)' }}
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--hairline)' }}>
                <div>
                  <h2 className="font-display text-[20px]" style={{ color: 'var(--ink-primary)' }}>
                    Analizar con LEXIA
                  </h2>
                  <p className="text-[12px] mt-0.5 truncate max-w-[280px]" style={{ color: 'var(--ink-tertiary)' }}>
                    {skillDoc.title}
                  </p>
                </div>
                <button
                  onClick={() => setSkillDoc(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150"
                  style={{ color: 'var(--ink-tertiary)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              {/* SkillPanel — upload a fresh file or analyze by docId */}
              <div className="p-6">
                <SkillPanel
                  filename={skillDoc.title}
                  onResult={() => { success('Análisis completado y guardado') }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
