'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
export type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: ReactNode
  className?: string
  animate?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-blue-100 text-blue-700 border border-blue-200',
  secondary: 'bg-slate-100 text-slate-600 border border-slate-200',
  success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border border-amber-200',
  danger: 'bg-red-100 text-red-700 border border-red-200',
  info: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  default: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs font-semibold',
  md: 'px-3 py-1.5 text-sm font-semibold',
  lg: 'px-4 py-2 text-base font-semibold',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  animate = false,
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center gap-2 rounded-full transition-all duration-200'
  const variantStyle = variantStyles[variant]
  const sizeStyle = sizeStyles[size]

  const content = (
    <div className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.div>
    )
  }

  return content
}
