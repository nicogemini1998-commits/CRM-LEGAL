'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { DetailHeader } from '@/components/ui/DetailHeader'
import { Badge } from '@/components/ui/Badge'
import { AlertBox } from '@/components/ui/AlertBox'

interface DocumentDetail {
  id: string
  title: string
  document_type: string
  storage_path: string | null
  confidential: boolean
  created_at: string
  updated_at?: string
  cases?: { id: string; title: string } | null
  content_markdown?: string | null
}

interface AnalysisContent {
  risk_level?: string
  summary?: string
  clauses_risks?: string[]
  recommendations?: string[]
  raw?: string
}

interface AnalysisData {
  id: string
  analysis_type: string
  content: AnalysisContent
  tokens_input?: number
  tokens_output?: number
  tokens_cache?: number
  created_at: string
}

type AnalysisStatus = 'pending' | 'done' | 'error' | 'missing'

const RISK_STYLES: Record<string, { bg: string; color: string; border: string; emoji: string; label: string }> = {
  ALTO:  { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', emoji: '🔴', label: 'Riesgo ALTO' },
  MEDIO: { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D', emoji: '🟡', label: 'Riesgo MEDIO' },
  BAJO:  { bg: '#DCFCE7', color: '#166534', border: '#86EFAC', emoji: '🟢', label: 'Riesgo BAJO' },
}

function RiskBanner({ level }: { level: string }) {
  const s = RISK_STYLES[level] || RISK_STYLES.BAJO
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '10px 18px',
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        border: `1.5px solid ${s.border}`,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '0.02em',
      }}
    >
      <span style={{ fontSize: 16 }}>{s.emoji}</span>
      {s.label}
    </div>
  )
}

function AnalyzingSkeleton() {
  return (
    <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #18181B 0%, #7C3AED 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#D9F99D', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 18,
          }}
        >L</motion.div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>LEXIA analizando…</p>
          <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0' }}>Detectando riesgos, cláusulas y recomendaciones</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[80, 95, 65, 75].map((w, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.35, 0.85, 0.35] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }}
            style={{ height: 12, width: `${w}%`, borderRadius: 6, background: 'linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%)' }}
          />
        ))}
      </div>
    </div>
  )
}

export default function DocumentDetailPage({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = use(params)
  const [docData, setDocData] = useState<DocumentDetail | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        // Try single-doc endpoint first (includes content_markdown)
        const res = await fetch(`/api/documents/${docId}`)
        if (res.ok) {
          const data = await res.json()
          setDocData(data.document || null)
        } else {
          // Fallback to list endpoint
          const list = await fetch(`/api/documents`)
          const data = await list.json()
          const foundDoc = data.documents?.find((d: DocumentDetail) => d.id === docId)
          setDocData(foundDoc || null)
        }
      } catch (error) {
        console.error('Error fetching document:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDocument()
  }, [docId])

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setInterval> | null = null
    const fetchAnalysis = async () => {
      try {
        const r = await fetch(`/api/documents/${docId}/analysis`)
        if (!r.ok) { if (!cancelled) setAnalysisStatus('error'); return }
        const j = await r.json()
        if (cancelled) return
        const status: AnalysisStatus = (j.status as AnalysisStatus) || 'missing'
        setAnalysisStatus(status)
        if (j.analysis) setAnalysis(j.analysis as AnalysisData)
        if (status !== 'pending' && timer) { clearInterval(timer); timer = null }
      } catch {
        if (!cancelled) setAnalysisStatus('error')
      }
    }
    fetchAnalysis()
    timer = setInterval(fetchAnalysis, 2500)
    return () => { cancelled = true; if (timer) clearInterval(timer) }
  }, [docId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 rounded-xl animate-pulse" />
        <div className="h-20 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!docData) {
    return (
      <div className="text-center py-20">
        <AlertBox type="error" title="Documento no encontrado" message="El documento solicitado no existe." />
      </div>
    )
  }

  const documentTypeLabel: Record<string, string> = {
    contract: 'Contrato',
    brief: 'Escrito',
    motion: 'Demanda / Recurso',
    agreement: 'Acuerdo',
    other: 'Otro',
  }

  const createdDate = new Date(docData.created_at).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const fileType = docData.storage_path?.split('.').pop()?.toUpperCase() || 'PDF'

  const c = analysis?.content
  const isDone = analysisStatus === 'done' && !!c
  const riskLevel = c?.risk_level || 'BAJO'

  return (
    <div className="space-y-8">
      <DetailHeader
        title={docData.title}
        subtitle={documentTypeLabel[docData.document_type] || 'Documento'}
        badge={
          <div className="flex gap-2">
            {docData.confidential && <Badge variant="danger" icon="🔒">Confidencial</Badge>}
            <Badge variant="primary">{fileType}</Badge>
          </div>
        }
        breadcrumbs={[
          { label: 'Documentos', href: '/documents' },
          ...(docData.cases ? [{ label: docData.cases.title, href: `/cases/${docData.cases.id}` }] : []),
          { label: docData.title },
        ]}
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              Descargar
            </button>
          </div>
        }
      />

      {/* Document metadata strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Tipo</p>
          <p className="font-semibold text-slate-900 mt-2">{documentTypeLabel[docData.document_type] || docData.document_type}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Formato</p>
          <p className="font-semibold text-slate-900 mt-2">{fileType}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Confidencial</p>
          <p className="font-semibold text-slate-900 mt-2">{docData.confidential ? 'Sí 🔒' : 'No'}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Subido</p>
          <p className="font-semibold text-slate-900 mt-2">{createdDate}</p>
        </motion.div>
      </div>

      {/* Analysis section — auto-displayed */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Análisis LEXIA
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
              {isDone
                ? `Generado el ${new Date(analysis!.created_at).toLocaleDateString('es-ES')} · ${analysis!.analysis_type}`
                : 'En curso — los resultados aparecen automáticamente al completarse'}
            </p>
          </div>
          {isDone && <RiskBanner level={riskLevel} />}
        </div>

        {analysisStatus === 'pending' && <AnalyzingSkeleton />}

        {analysisStatus === 'error' && (
          <AlertBox type="error" title="Error en el análisis" message="LEXIA no pudo completar el análisis automático. Intenta más tarde." />
        )}

        {analysisStatus === 'missing' && (
          <AlertBox type="info" title="Sin análisis" message="No hay análisis IA disponible aún para este documento." />
        )}

        {isDone && (
          <>
            {c!.summary && (
              <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  Resumen ejecutivo
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: '#1E293B', marginTop: 10 }}>
                  {c!.summary}
                </p>
              </div>
            )}

            {Array.isArray(c!.clauses_risks) && c!.clauses_risks.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, marginBottom: 14 }}>
                  Riesgos y cláusulas detectadas
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {c!.clauses_risks.map((risk, i) => (
                    <li key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 14px',
                      background: '#FEF3C7',
                      borderRadius: 10,
                      border: '1px solid #FCD34D',
                    }}>
                      <span style={{ fontSize: 16, lineHeight: 1.4 }}>⚠️</span>
                      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#78350F', margin: 0 }}>{risk}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(c!.recommendations) && c!.recommendations.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, marginBottom: 14 }}>
                  Recomendaciones
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {c!.recommendations.map((rec, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ color: '#7C3AED', fontWeight: 700, fontSize: 15 }}>→</span>
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: '#0F172A', margin: 0 }}>{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {c!.raw && !c!.summary && (
              <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, marginBottom: 10 }}>
                  Análisis
                </h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#1E293B', whiteSpace: 'pre-wrap' }}>{c!.raw}</p>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Contenido del documento — texto íntegro */}
      {docData.content_markdown && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="space-y-4"
        >
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Contenido del documento
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
              Texto íntegro del documento original
            </p>
          </div>
          <article
            className="prose-doc"
            style={{
              background: '#FBFAF7',
              border: '1px solid #E5E1D6',
              borderLeft: '4px solid #8F7EE9',
              borderRadius: 12,
              padding: '40px 56px',
              boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
            }}
          >
            <DocumentMarkdown source={docData.content_markdown} />
          </article>
        </motion.section>
      )}
    </div>
  )
}

/**
 * Minimal markdown renderer for legal document body.
 * Supports headings (#, ##, ###), tables (| ... |), bold (**x**),
 * italics (*x*), blockquote-style emphasis (lines starting with "*Fdo."),
 * and paragraph breaks.
 */
function DocumentMarkdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: React.ReactElement[] = []
  let i = 0
  let key = 0

  const renderInline = (text: string): React.ReactNode => {
    const out: React.ReactNode[] = []
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = regex.exec(text))) {
      if (m.index > last) out.push(text.slice(last, m.index))
      const token = m[0]
      if (token.startsWith('**')) {
        out.push(<strong key={`b-${m.index}`} style={{ color: '#0F172A' }}>{token.slice(2, -2)}</strong>)
      } else {
        out.push(<em key={`i-${m.index}`}>{token.slice(1, -1)}</em>)
      }
      last = m.index + token.length
    }
    if (last < text.length) out.push(text.slice(last))
    return out
  }

  while (i < lines.length) {
    const line = lines[i]

    // Table block
    if (line.trim().startsWith('|') && lines[i + 1]?.trim().startsWith('|')) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].trim().slice(1, -1).split('|').map(c => c.trim())
        // skip separator rows (---)
        if (!cells.every(c => /^-+$/.test(c.replace(/:/g, '')))) {
          rows.push(cells)
        }
        i++
      }
      const [head, ...body] = rows
      blocks.push(
        <table
          key={`t-${key++}`}
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            margin: '20px 0',
            fontSize: 14,
            fontFamily: 'Georgia, serif',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #0F172A' }}>
              {head.map((h, idx) => (
                <th key={idx} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: '#0F172A' }}>
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: '1px solid #E5E1D6' }}>
                {row.map((c, cIdx) => (
                  <td key={cIdx} style={{ padding: '8px 12px', color: '#1E293B' }}>
                    {renderInline(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
      continue
    }

    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={`h1-${key++}`} style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#0F172A', textAlign: 'center', margin: '0 0 28px', lineHeight: 1.25, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          {renderInline(line.slice(2))}
        </h1>
      )
      i++; continue
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${key++}`} style={{ fontFamily: 'Georgia, serif', fontSize: 19, fontWeight: 700, color: '#0F172A', margin: '28px 0 14px', borderBottom: '1px solid #E5E1D6', paddingBottom: 6 }}>
          {renderInline(line.slice(3))}
        </h2>
      )
      i++; continue
    }
    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${key++}`} style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: '#1E293B', margin: '20px 0 10px' }}>
          {renderInline(line.slice(4))}
        </h3>
      )
      i++; continue
    }
    if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      blocks.push(
        <ul key={`ul-${key++}`} style={{ margin: '12px 0', paddingLeft: 28, color: '#1E293B', fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.7 }}>
          {items.map((it, idx) => <li key={idx} style={{ marginBottom: 4 }}>{renderInline(it)}</li>)}
        </ul>
      )
      continue
    }
    if (line.trim() === '') {
      i++; continue
    }
    // Paragraph: collect contiguous non-empty lines until blank/special
    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('- ') &&
      !lines[i].trim().startsWith('|')
    ) {
      para.push(lines[i])
      i++
    }
    const joined = para.join(' ')
    const isSignature = /^\*Fdo\./.test(joined.trim()) || /^\*Por /.test(joined.trim())
    blocks.push(
      <p
        key={`p-${key++}`}
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 15,
          lineHeight: 1.85,
          color: '#1E293B',
          textAlign: isSignature ? 'right' : 'justify',
          textIndent: isSignature ? 0 : '2em',
          margin: '0 0 14px',
          fontStyle: isSignature ? 'italic' : 'normal',
        }}
      >
        {renderInline(joined)}
      </p>
    )
  }

  return <>{blocks}</>
}
