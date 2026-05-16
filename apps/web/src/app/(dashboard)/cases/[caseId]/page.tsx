'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { DetailHeader } from '@/components/ui/DetailHeader'
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
  created_at: string
  updated_at: string
  clients: { name: string; email: string } | null
  documents?: any[]
  analyses?: any[]
}

type TabType = 'info' | 'documents' | 'chat' | 'timeline' | 'analysis'

const STATUS_CONFIG = {
  open: { label: 'Activo', color: 'bg-green-50 text-green-700 border-green-200', icon: '●' },
  closed: { label: 'Cerrado', color: 'bg-slate-50 text-slate-600 border-slate-200', icon: '✓' },
  archived: { label: 'Archivado', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '📦' },
}

export default function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params)
  const [caseData, setCaseData] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('info')

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await fetch(`/api/cases`)
        const data = await res.json()
        const foundCase = data.cases?.find((c: CaseDetail) => c.id === caseId)
        setCaseData(foundCase || null)
      } catch (error) {
        console.error('Error fetching case:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCase()
  }, [caseId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="text-center py-20">
        <AlertBox type="error" title="Caso no encontrado" message="El caso solicitado no existe." />
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
      {/* Header */}
      <DetailHeader
        title={caseData.title}
        subtitle={caseData.case_number || undefined}
        badge={
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
        }
        breadcrumbs={[
          { label: 'Expedientes', href: '/cases' },
          { label: caseData.title },
        ]}
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              Editar
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              Compartir
            </button>
          </div>
        }
      />

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Cliente</p>
          <div className="flex items-center gap-2 mt-2">
            {caseData.clients && <Avatar name={caseData.clients.name} size="sm" type="client" />}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{caseData.clients?.name || 'Sin cliente'}</p>
              <p className="text-xs text-slate-500 truncate">{caseData.clients?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Creado</p>
          <p className="font-semibold text-slate-900 mt-2">{formattedDate}</p>
          <p className="text-xs text-slate-500 mt-1">Hace {Math.floor((Date.now() - new Date(caseData.created_at).getTime()) / (1000 * 60 * 60 * 24))} días</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Documentos</p>
          <p className="font-semibold text-slate-900 mt-2">{caseData.documents?.length || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Archivos adjuntos</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Estado</p>
          <p className="font-semibold text-slate-900 mt-2">{statusConfig.label}</p>
          <p className="text-xs text-slate-500 mt-1">Última actualización</p>
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
                  ? 'border-indigo-600 text-indigo-600'
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
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Asignación</h3>
                <CaseAssignment caseId={caseData.id} />
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Descripción</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {caseData.description || 'Sin descripción disponible'}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Detalles Técnicos</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">ID del Expediente:</span>
                    <code className="text-xs bg-slate-100 px-3 py-1 rounded text-slate-900 font-mono">{caseData.id}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Nº de Expediente:</span>
                    <span className="font-semibold text-slate-900">{caseData.case_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Última Actualización:</span>
                    <span className="text-slate-900">{new Date(caseData.updated_at).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Documentos del Caso</h3>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                  + Añadir Documento
                </button>
              </div>
              {caseData.documents && caseData.documents.length > 0 ? (
                <div className="space-y-3">
                  {caseData.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-indigo-600">📄</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{doc.title}</p>
                          <p className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
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
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Chat Jurídico LEXIA</h3>
              <AlertBox type="info" title="Chat integrado" message="Haz preguntas jurídicas sobre este caso. LEXIA tiene acceso completo al contexto." />
              <div className="mt-6 h-96 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
                <p className="text-slate-500">Chat interface será implementado próximamente</p>
              </div>
            </div>
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
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Análisis Guardados</h3>
              {caseData.analyses && caseData.analyses.length > 0 ? (
                <div className="space-y-4">
                  {caseData.analyses.map((analysis: any) => (
                    <div key={analysis.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-slate-900">{analysis.title}</h4>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-3">{analysis.summary}</p>
                      <div className="flex items-center justify-between mt-4 text-xs">
                        <span className="text-slate-500">{new Date(analysis.created_at).toLocaleDateString('es-ES')}</span>
                        <button className="text-indigo-600 hover:text-indigo-700 font-medium">
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
    </div>
  )
}
