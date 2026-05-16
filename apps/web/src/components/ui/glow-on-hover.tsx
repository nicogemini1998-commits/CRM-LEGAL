'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlowOnHoverProps {
  children: ReactNode
  color?: 'lime' | 'plum' | 'obsidian'
  className?: string
}

export function GlowOnHover({ children, color = 'lime', className = '' }: GlowOnHoverProps) {
  const colors = {
    lime: '0 0 0 1px rgba(124, 58, 237, 0.5), 0 8px 24px -8px rgba(124, 58, 237, 0.4)',
    plum: '0 0 0 1px rgba(131, 24, 67, 0.4), 0 8px 24px -8px rgba(131, 24, 67, 0.3)',
    obsidian: '0 0 0 1px rgba(24, 24, 27, 0.4), 0 8px 24px -8px rgba(24, 24, 27, 0.3)',
  }

  return (
    <motion.div
      className={className}
      initial={{ boxShadow: '0 0 0 0px rgba(0,0,0,0)' }}
      whileHover={{ boxShadow: colors[color] }}
      transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  )
}
