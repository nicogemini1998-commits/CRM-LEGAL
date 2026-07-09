'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface DetailHeaderProps {
  title: string
  subtitle?: string
  description?: string
  badge?: ReactNode
  actions?: ReactNode
  icon?: ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function DetailHeader({
  title,
  subtitle,
  description,
  badge,
  actions,
  icon,
  breadcrumbs,
}: DetailHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-slate-700 transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span>{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          {icon && (
            <div className="flex-shrink-0 w-12 h-12 bg-[#F1EEFB] text-[#6A5BC1] rounded-xl flex items-center justify-center">
              {icon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-4xl font-display font-semibold tracking-tight text-slate-900 truncate">{title}</h1>
              {badge && <div>{badge}</div>}
            </div>

            {subtitle && (
              <p className="text-lg text-slate-600 mb-2">{subtitle}</p>
            )}

            {description && (
              <p className="text-slate-500 leading-relaxed">{description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="h-px bg-slate-200" />
    </motion.div>
  )
}
