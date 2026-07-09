'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export type TimelineEventType = 'info' | 'success' | 'warning' | 'error' | 'document' | 'chat'

interface TimelineEventProps {
  type?: TimelineEventType
  title: string
  description?: string
  timestamp: string
  icon?: ReactNode
  meta?: string
  isLast?: boolean
}

const typeColors: Record<TimelineEventType, { bg: string; text: string; dot: string }> = {
  info: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  error: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  document: { bg: 'bg-[#F1EEFB]', text: 'text-[#6A5BC1]', dot: 'bg-[#8F7EE9]' },
  chat: { bg: 'bg-cyan-50', text: 'text-cyan-600', dot: 'bg-cyan-500' },
}

export function TimelineEvent({
  type = 'info',
  title,
  description,
  timestamp,
  icon,
  meta,
  isLast = false,
}: TimelineEventProps) {
  const colors = typeColors[type]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative flex gap-4"
    >
      {/* Timeline Line + Dot */}
      <div className="flex flex-col items-center">
        <motion.div
          className={`w-3 h-3 rounded-full ${colors.dot} shadow-md`}
          whileHover={{ scale: 1.3 }}
        />
        {!isLast && (
          <div className={`w-0.5 h-24 ${colors.dot} opacity-30 mt-2`} />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-8 ${!isLast ? '' : 'pb-0'}`}>
        <motion.div
          className={`${colors.bg} rounded-lg p-4 border border-slate-200`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-1">
              {icon && <div className={`flex-shrink-0 ${colors.text}`}>{icon}</div>}
              <h3 className="font-semibold text-slate-900">{title}</h3>
            </div>
            <span className="text-xs text-slate-500 flex-shrink-0">{timestamp}</span>
          </div>

          {description && (
            <p className="text-sm text-slate-600 mb-2">{description}</p>
          )}

          {meta && (
            <p className={`text-xs ${colors.text} font-medium`}>{meta}</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
