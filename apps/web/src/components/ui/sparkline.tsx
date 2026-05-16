'use client'

import { motion } from 'framer-motion'
import { useId } from 'react'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  fillOpacity?: number
  strokeWidth?: number
  className?: string
}

export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = '#7C3AED',
  fillOpacity = 0.18,
  strokeWidth = 1.5,
  className = '',
}: SparklineProps) {
  const id = useId().replace(/:/g, '')
  if (!data.length) return null

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const stepX = data.length > 1 ? width / (data.length - 1) : width

  const points = data.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }))

  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
    .join(' ')

  const areaPath = `${path} L ${points[points.length - 1].x},${height} L 0,${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath}
        fill={`url(#grad-${id})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2.5}
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}
