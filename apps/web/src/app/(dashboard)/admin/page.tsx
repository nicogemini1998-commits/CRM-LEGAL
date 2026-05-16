'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DetailHeader } from '@/components/ui/DetailHeader'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { AlertBox } from '@/components/ui/AlertBox'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'senior' | 'junior' | 'partner'
  cases_assigned: number
  cases_closed_this_month: number
  avg_days_to_close: number
  revenue_managed: number
}

const TEAM_DATA: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'María García López',
    email: 'maria@despacho.com',
    role: 'senior',
    cases_assigned: 8,
    cases_closed_this_month: 2,
    avg_days_to_close: 45,
    revenue_managed: 245000,
  },
  {
    id: 'tm-2',
    name: 'Juan Rodríguez Pérez',
    email: 'juan@despacho.com',
    role: 'senior',
    cases_assigned: 6,
    cases_closed_this_month: 1,
    avg_days_to_close: 52,
    revenue_managed: 180000,
  },
  {
    id: 'tm-3',
    name: 'Laura Martínez Silva',
    email: 'laura@despacho.com',
    role: 'junior',
    cases_assigned: 3,
    cases_closed_this_month: 0,
    avg_days_to_close: 0,
    revenue_managed: 42000,
  },
  {
    id: 'tm-4',
    name: 'Carlos Fernández López',
    email: 'carlos@despacho.com',
    role: 'junior',
    cases_assigned: 4,
    cases_closed_this_month: 1,
    avg_days_to_close: 38,
    revenue_managed: 85000,
  },
  {
    id: 'tm-5',
    name: 'Sofia Ruiz Álvarez',
    email: 'sofia@despacho.com',
    role: 'junior',
    cases_assigned: 2,
    cases_closed_this_month: 0,
    avg_days_to_close: 0,
    revenue_managed: 28000,
  },
]

const STATS = {
  total_cases: 23,
  active_cases: 17,
  closed_this_month: 4,
  total_revenue_managed: 580000,
  avg_case_duration: 48,
}

export default function AdminPanel() {
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null)

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      partner: 'Socio',
      senior: 'Abogado Senior',
      junior: 'Abogado Junior',
    }
    return labels[role] || role
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      partner: 'primary',
      senior: 'success',
      junior: 'info',
    }
    return colors[role] || 'secondary'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <DetailHeader
        title="Panel de Administración"
        subtitle="Gestión del despacho y equipo"
        breadcrumbs={[{ label: 'Admin' }]}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-slate-200 p-4"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Casos Totales</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{STATS.total_cases}</p>
          <p className="text-xs text-slate-500 mt-1">{STATS.active_cases} activos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-lg border border-slate-200 p-4"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Cerrados (Mes)</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{STATS.closed_this_month}</p>
          <p className="text-xs text-slate-500 mt-1">Este mes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-slate-200 p-4"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Ingresos Gestionados</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{(STATS.total_revenue_managed / 1000).toFixed(0)}K€</p>
          <p className="text-xs text-slate-500 mt-1">Total</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-lg border border-slate-200 p-4"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Duración Promedio</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{STATS.avg_case_duration}</p>
          <p className="text-xs text-slate-500 mt-1">días</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-slate-200 p-4"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Equipo</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{TEAM_DATA.length}</p>
          <p className="text-xs text-slate-500 mt-1">abogados</p>
        </motion.div>
      </div>

      {/* Team Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-slate-200 p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Desempeño del Equipo</h3>

        <div className="space-y-4">
          {TEAM_DATA.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedTeamMember(member)}
              className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100 cursor-pointer"
            >
              <div className="flex items-center gap-4 flex-1">
                <Avatar name={member.name} size="md" type="user" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900">{member.name}</h4>
                    <Badge variant={getRoleColor(member.role)} size="sm">
                      {getRoleLabel(member.role)}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-8 text-right">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Casos</p>
                  <p className="text-lg font-bold text-slate-900">{member.cases_assigned}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Cerrados</p>
                  <p className="text-lg font-bold text-slate-900">{member.cases_closed_this_month}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Días Promedio</p>
                  <p className="text-lg font-bold text-slate-900">{member.avg_days_to_close || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Ingresos</p>
                  <p className="text-lg font-bold text-slate-900">{(member.revenue_managed / 1000).toFixed(0)}K€</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Team Member Detail */}
      {selectedTeamMember && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-slate-200 p-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar name={selectedTeamMember.name} size="lg" type="user" />
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{selectedTeamMember.name}</h3>
                <p className="text-slate-600">{selectedTeamMember.email}</p>
                <Badge variant={getRoleColor(selectedTeamMember.role)} className="mt-2">
                  {getRoleLabel(selectedTeamMember.role)}
                </Badge>
              </div>
            </div>
            <button
              onClick={() => setSelectedTeamMember(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-semibold text-slate-600">Casos Asignados</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{selectedTeamMember.cases_assigned}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-semibold text-slate-600">Cerrados (Mes)</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{selectedTeamMember.cases_closed_this_month}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-semibold text-slate-600">Días Promedio</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{selectedTeamMember.avg_days_to_close || '-'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-semibold text-slate-600">Ingresos Gestionados</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{(selectedTeamMember.revenue_managed / 1000).toFixed(0)}K€</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
