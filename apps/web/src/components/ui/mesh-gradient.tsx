'use client'

import { motion } from 'framer-motion'

interface MeshGradientProps {
  variant?: 'lime' | 'plum' | 'chat'
  className?: string
}

export function MeshGradient({ variant = 'lime', className = '' }: MeshGradientProps) {
  const gradients = {
    lime: `
      radial-gradient(at 92% 4%, rgba(124, 58, 237, 0.26) 0px, transparent 50%),
      radial-gradient(at 4% 96%, rgba(124, 58, 237, 0.10) 0px, transparent 45%),
      radial-gradient(at 60% 40%, rgba(24, 24, 27, 0.02) 0px, transparent 50%)
    `,
    plum: `
      radial-gradient(at 8% 8%, rgba(131, 24, 67, 0.10) 0px, transparent 45%),
      radial-gradient(at 88% 92%, rgba(124, 58, 237, 0.18) 0px, transparent 50%)
    `,
    chat: `
      radial-gradient(at 50% -10%, rgba(124, 58, 237, 0.20) 0px, transparent 55%),
      radial-gradient(at 10% 100%, rgba(124, 58, 237, 0.06) 0px, transparent 50%),
      radial-gradient(at 90% 100%, rgba(131, 24, 67, 0.04) 0px, transparent 50%)
    `,
  }

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-none absolute inset-0 mesh-drift ${className}`}
      style={{
        background: gradients[variant],
        filter: 'blur(40px) saturate(120%)',
        zIndex: 0,
      }}
    />
  )
}
