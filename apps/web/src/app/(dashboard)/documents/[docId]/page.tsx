'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { DetailHeader } from '@/components/ui/DetailHeader'
import { Badge } from '@/components/ui/Badge'
import { TimelineEvent } from '@/components/ui/TimelineEvent'
import { AlertBox } from '@/components/ui/AlertBox'

interface DocumentDetail {
  id: string
  title: string
  document_type: string
  storage_path: string | null
  confidential: boolean
  created_at: string
  updated_at: string
  cases?: { id: string; title: string } | null
}

export default function DocumentDetailPage({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = use(params)
  const [docData, setDocData] = useState<DocumentDetail | null>(null)
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await fetch(`/api/documents`)
        const data = await res.json()
        const foundDoc = data.documents?.find((d: DocumentDetail) => d.id === docId)
        setDocData(foundDoc || null)

        // Mock analyses data
        if (foundDoc) {
          setAnalyses([
            {
              id: '1',
              type: 'FULL',
              created_at: new Date().toISOString(),
              summary: 'Análisis completo del documento. Identificadas 5 cláusulas de riesgo.',
            },
          ])
        }
      } catch (error) {
        console.error('Error fetching document:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [docId])

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      AlertBox.showSuccess = true
    } finally {
      setAnalyzing(false)
    }
  }

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
    motion: 'Moción',
    agreement: 'Acuerdo',
    other: 'Otro',
  }

  const createdDate = new Date(docData.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const fileSize = '2.4 MB' // Mock data
  const fileType = docData.storage_path?.split('.').pop()?.toUpperCase() || 'PDF'

  return (
    <div className="space-y-8">
      {/* Header */}
      <DetailHeader
        title={docData.title}
        subtitle={documentTypeLabel[docData.document_type] || 'Documento'}
        badge={
          <div className="flex gap-2">
            {docData.confidential && (
              <Badge variant="danger" icon="🔒">
                Confidencial
              </Badge>
            )}
            <Badge variant="primary">{fileType}</Badge>
          </div>
        }
        breadcrumbs={[
          { label: 'Documentos', href: '/documents' },
          docData.cases
            ? { label: docData.cases.title, href: `/cases/${docData.cases.id}` }
            : undefined,
          { label: docData.title },
        ].filter(Boolean)}
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              Descargar
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
            >
              {analyzing ? 'Analizando...' : 'Analizar'}
            </button>
          </div>
        }
      />

      {/* Document Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-slate-200 p-4"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Tipo</p>
          <p className="font-semibold text-slate-900 mt-2">{documentTypeLabel[docData.document_type]}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-lg border border-slate-200 p-4"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Formato</p>
          <p className="font-semibold text-slate-900 mt-2">{fileType}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-slate-200 p-4"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Tamaño</p>
          <p className="font-semibold text-slate-900 mt-2">{fileSize}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-lg border border-slate-200 p-4"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Creado</p>
          <p className="font-semibold text-slate-900 mt-2">{createdDate}</p>
        </motion.div>
      </div>

      {/* Analyses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-slate-900">Análisis Guardados</h3>

        {analyses.length > 0 ? (
          analyses.map((analysis, idx) => (
            <TimelineEvent
              key={analysis.id}
              type="document"
              title={`Análisis ${analysis.type}`}
              description={analysis.summary}
              timestamp={new Date(analysis.created_at).toLocaleDateString('es-ES')}
              meta="LEXIA IA"
              isLast={idx === analyses.length - 1}
            />
          ))
        ) : (
          <AlertBox type="info" title="Sin análisis" message="Analiza este documento con LEXIA para ver los resultados aquí." />
        )}
      </motion.div>

      {/* Analysis Preview */}
      {analyses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Último Análisis</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900">Resumen Ejecutivo</h4>
              <p className="text-slate-600 mt-2">
                Contrato de servicios profesionales con cláusulas estándar de confidencialidad y
                responsabilidad limitada. Identificadas 2 cláusulas que requieren negociación.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-3">Riesgos Identificados</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <p className="font-semibold text-amber-900">Cláusula de Resolución</p>
                    <p className="text-sm text-amber-800">Permite rescisión unilateral sin causa. Requiere negociación.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                Ver Análisis Completo
              </button>
              <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Compartir Análisis
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
