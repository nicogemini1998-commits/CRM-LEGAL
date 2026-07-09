'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { type RoleType } from './data'

interface RoleCardProps {
  role: RoleType
  description: string
  permissions: string[]
  accent: string
  index?: number
}

export function RoleCard({ role, description, permissions, accent, index = 0 }: RoleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
          {role[0]}
        </div>
        <h3 className="text-base font-semibold text-slate-900">{role}</h3>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{description}</p>
      <ul className="space-y-1.5 mt-auto">
        {permissions.map((p) => (
          <li key={p} className="flex items-center gap-2 text-xs text-slate-600">
            <Check size={12} className="text-emerald-600 flex-shrink-0" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
