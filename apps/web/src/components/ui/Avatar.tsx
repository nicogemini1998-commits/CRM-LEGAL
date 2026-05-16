'use client'

import { motion } from 'framer-motion'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarType = 'user' | 'client' | 'company'

interface AvatarProps {
  name: string
  email?: string
  size?: AvatarSize
  type?: AvatarType
  image?: string
  className?: string
}

const sizeStyles: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-14 h-14', text: 'text-base' },
  xl: { container: 'w-20 h-20', text: 'text-lg' },
}

const typeStyles: Record<AvatarType, string> = {
  user: 'bg-gradient-to-br from-indigo-500 to-cyan-500',
  client: 'bg-gradient-to-br from-indigo-400 to-blue-500',
  company: 'bg-gradient-to-br from-purple-500 to-pink-500',
}

export function Avatar({
  name,
  email,
  size = 'md',
  type = 'user',
  image,
  className = '',
}: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const { container, text } = sizeStyles[size]
  const bgGradient = typeStyles[type]

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${container} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <motion.div
      className={`${container} ${bgGradient} rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <span className={`${text} font-bold text-white`}>{initials}</span>
    </motion.div>
  )
}
