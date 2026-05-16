'use client'

import { useEffect, useState } from 'react'
import { animate, useMotionValue, useTransform, motion } from 'framer-motion'

interface NumberTickerProps {
  value: number
  duration?: number
  className?: string
  format?: (v: number) => string
}

export function NumberTicker({
  value,
  duration = 0.9,
  className = '',
  format,
}: NumberTickerProps) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) =>
    format ? format(v) : Math.round(v).toLocaleString('es-ES')
  )
  const [display, setDisplay] = useState(format ? format(0) : '0')

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    })
    const unsubscribe = rounded.on('change', (v) => setDisplay(v))
    return () => {
      controls.stop()
      unsubscribe()
    }
  }, [value, duration, motionValue, rounded])

  return <motion.span className={`tabular ${className}`}>{display}</motion.span>
}
