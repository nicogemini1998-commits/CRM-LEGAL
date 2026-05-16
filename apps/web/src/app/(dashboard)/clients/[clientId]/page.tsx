'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { DetailHeader } from '@/components/ui/DetailHeader'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { AlertBox } from '@/components/ui/AlertBox'

interface ClientDetail {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  nif_cif: string | null
  type: 'individual' | 'company'
  created_at: string
}

export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)
  const [clientData, setClientData] = useState<ClientDetail | null>(null)
  const [clientCases, setClientCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch(`/api/clients`)
        const data = await res.json()
        const foundClient = data.clients?.find((c: ClientDetail) => c.id === clientId)
        setClientData(foundClient || null)

        if (foundClient) {
          const casesRes = await fetch(`/api/cases`)
          const casesData = await casesRes.json()
          const clientCases = casesData.cases?.filter((c: any) => c.clients?.email === foundClient.email)
          setClientCases(clientCases || [])
        }
      } catch (error) {
        console.error('Error fetching client:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [clientId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!clientData) {
    return (
      <div className="text-center py-20">
        <AlertBox type="error" title="Cliente no encontrado" message="El cliente solicitado no existe." />
      </div>
    )
  }

  const clientType = clientData.type === 'company' ? '🏢 Empresa' : '👤 Particular'
  const memberSince = new Date(clientData.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <DetailHeader
        title={clientData.name}
        subtitle={clientType}
        badge={
          <Badge variant={clientData.type === 'company' ? 'primary' : 'info'}>
            {clientData.type === 'company' ? 'Empresa' : 'Particular'}
          </Badge>
        }
        breadcrumbs={[
          { label: 'Clientes', href: '/clients' },
          { label: clientData.name },
        ]}
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              Editar
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              + Nuevo Caso
            </button>
          </div>
        }
      />

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Información de Contacto</h3>
          <div className="space-y-3">
            {clientData.email && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                <a
                  href={`mailto:${clientData.email}`}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {clientData.email}
                </a>
              </div>
            )}

            {clientData.phone && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Teléfono</p>
                <a
                  href={`tel:${clientData.phone}`}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {clientData.phone}
                </a>
              </div>
            )}

            {clientData.address && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Dirección</p>
                <p className="text-slate-900">{clientData.address}</p>
              </div>
            )}

            {clientData.nif_cif && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">NIF/CIF</p>
                <p className="font-mono text-slate-900">{clientData.nif_cif}</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Estadísticas</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Casos Activos</span>
              <span className="text-2xl font-bold text-indigo-600">
                {clientCases.filter((c) => c.status === 'open').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Casos Totales</span>
              <span className="text-2xl font-bold text-slate-900">{clientCases.length}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <span className="text-slate-600">Cliente desde</span>
              <span className="font-semibold text-slate-900">{memberSince}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg border border-slate-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Expedientes del Cliente</h3>
          <Badge variant="primary">{clientCases.length} casos</Badge>
        </div>

        {clientCases.length > 0 ? (
          <div className="space-y-3">
            {clientCases.map((caseItem: any, idx: number) => {
              const statusColors: Record<string, string> = {
                open: 'bg-green-100 text-green-700',
                closed: 'bg-slate-100 text-slate-600',
                archived: 'bg-amber-100 text-amber-700',
              }
              const statusLabels: Record<string, string> = {
                open: 'Activo',
                closed: 'Cerrado',
                archived: 'Archivado',
              }

              return (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
                >
                  <div className="flex-1 min-w-0">
                    <Link href={`/cases/${caseItem.id}`}>
                      <h4 className="font-semibold text-indigo-600 hover:text-indigo-700 truncate">
                        {caseItem.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-slate-500 mt-1">
                      Creado el {new Date(caseItem.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${statusColors[caseItem.status]}`}>
                    {statusLabels[caseItem.status]}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <AlertBox type="info" title="Sin casos" message="Este cliente aún no tiene expedientes asociados." />
        )}
      </motion.div>
    </div>
  )
}
