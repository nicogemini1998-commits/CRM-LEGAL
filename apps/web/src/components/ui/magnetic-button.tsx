'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, type MouseEvent, type ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  strength?: number
  type?: 'button' | 'submit'
  disabled?: boolean
  ariaLabel?: string
}

export function MagneticButton({
  children,
  onClick,
  className = '',
  strength = 0.25,
  type = 'button',
  disabled = false,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xSpring = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 })
  const ySpring = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 })
  const tx = useTransform(xSpring, (v) => `${v}px`)
  const ty = useTransform(ySpring, (v) => `${v}px`)

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return
    const rect = ref.current.getBoundingClientRect()
    const offsetX = (e.clientX - rect.left - rect.width / 2) * strength
    const offsetY = (e.clientY - rect.top - rect.height / 2) * strength
    x.set(offsetX)
    y.set(offsetY)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      whileTap={{ scale: 0.97 }}
      style={{ x: tx, y: ty }}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </motion.button>
  )
}
