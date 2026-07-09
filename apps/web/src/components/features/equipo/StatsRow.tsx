'use client'

import { motion } from 'framer-motion'
import { Users, CheckCircle2, Clock, Shield } from 'lucide-react'

interface StatsRowProps {
  total: number
  active: number
  pending: number
  roles: number
}

const STATS = [
  { key: 'total', label: 'Total miembros', icon: Users, accent: 'text-[#6A5BC1] bg-[#F1EEFB]' },
  { key: 'active', label: 'Activos', icon: CheckCircle2, accent: 'text-emerald-600 bg-emerald-50' },
  { key: 'pending', label: 'Pendientes invitación', icon: Clock, accent: 'text-amber-600 bg-amber-50' },
  { key: 'roles', label: 'Roles configurados', icon: Shield, accent: 'text-[#1E2839] bg-slate-100' },
] as const

export function StatsRow(props: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat, i) => {
        const Icon = stat.icon
        const value = props[stat.key]
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {stat.label}
              </span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.accent}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-slate-900 tabular-nums">{value}</p>
          </motion.div>
        )
      })}
    </div>
  )
}
