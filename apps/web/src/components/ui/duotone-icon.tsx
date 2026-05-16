'use client'

import type { SVGProps } from 'react'

type IconName =
  | 'home'
  | 'briefcase'
  | 'document'
  | 'users'
  | 'sparkles'
  | 'chat'
  | 'settings'
  | 'gavel'
  | 'scales'
  | 'shield'
  | 'search'
  | 'plus'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'send'
  | 'check'
  | 'clock'
  | 'lock'
  | 'file-text'
  | 'building'
  | 'user-circle'
  | 'feather'
  | 'compass'
  | 'bolt'
  | 'book-open'

interface DuotoneIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
  primary?: string
  secondary?: string
}

export function DuotoneIcon({
  name,
  size = 18,
  primary = 'currentColor',
  secondary = 'currentColor',
  ...props
}: DuotoneIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.5,
    ...props,
  }

  const fillSec = { fill: secondary, fillOpacity: 0.18 }

  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path stroke={primary} d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1v-8.5Z" />
          <path {...fillSec} d="M9 21v-7h6v7H9Z" />
        </svg>
      )
    case 'briefcase':
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" stroke={primary} />
          <path {...fillSec} d="M3 12h18v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-5Z" />
          <path stroke={primary} d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      )
    case 'document':
    case 'file-text':
      return (
        <svg {...common}>
          <path stroke={primary} d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
          <path {...fillSec} d="M14 3v5h5" />
          <path stroke={primary} d="M9 13h6M9 17h4" strokeOpacity="0.6" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.5" stroke={primary} />
          <path {...fillSec} d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="9" r="2.5" stroke={primary} strokeOpacity="0.55" />
          <path stroke={primary} strokeOpacity="0.55" d="M15.5 13.5c2 .3 3.5 1.8 3.5 3.8v2" />
        </svg>
      )
    case 'sparkles':
      return (
        <svg {...common}>
          <path {...fillSec} d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" />
          <path stroke={primary} d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" />
          <path stroke={primary} d="M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" strokeOpacity="0.7" />
        </svg>
      )
    case 'chat':
      return (
        <svg {...common}>
          <path {...fillSec} d="M21 12a8 8 0 0 1-12.4 6.6L4 20l1.4-4.5A8 8 0 1 1 21 12Z" />
          <path stroke={primary} d="M21 12a8 8 0 0 1-12.4 6.6L4 20l1.4-4.5A8 8 0 1 1 21 12Z" />
          <circle cx="9" cy="12" r="0.8" fill={primary} />
          <circle cx="13" cy="12" r="0.8" fill={primary} />
          <circle cx="17" cy="12" r="0.8" fill={primary} />
        </svg>
      )
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" stroke={primary} />
          <path {...fillSec} d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
      )
    case 'gavel':
      return (
        <svg {...common}>
          <path {...fillSec} d="m14 13-4-4 6-6 4 4-6 6Z" />
          <path stroke={primary} d="m14 13-4-4 6-6 4 4-6 6Zm0 0-7 7-3-3 7-7M11 21h10" />
        </svg>
      )
    case 'scales':
      return (
        <svg {...common}>
          <path stroke={primary} d="M12 3v18M5 21h14" />
          <path {...fillSec} d="m6 9-3 5a3 3 0 0 0 6 0L6 9Zm12 0-3 5a3 3 0 0 0 6 0l-3-5Z" />
          <path stroke={primary} d="M6 9 4 6h16l-2 3M6 9l-3 5a3 3 0 0 0 6 0L6 9Zm12 0-3 5a3 3 0 0 0 6 0l-3-5Z" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path {...fillSec} d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
          <path stroke={primary} d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
        </svg>
      )
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" stroke={primary} />
          <circle cx="11" cy="11" r="4" {...fillSec} />
          <path stroke={primary} d="m20 20-4-4" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...common}>
          <path stroke={primary} strokeWidth="2" d="M12 5v14M5 12h14" />
        </svg>
      )
    case 'arrow-right':
      return (
        <svg {...common}>
          <path stroke={primary} strokeWidth="1.8" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )
    case 'arrow-up-right':
      return (
        <svg {...common}>
          <path stroke={primary} strokeWidth="1.8" d="M7 17 17 7M9 7h8v8" />
        </svg>
      )
    case 'send':
      return (
        <svg {...common}>
          <path {...fillSec} d="m3 11 18-8-8 18-2-8-8-2Z" />
          <path stroke={primary} d="m3 11 18-8-8 18-2-8-8-2Z" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <path stroke={primary} strokeWidth="2" d="m4 12 5 5L20 6" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke={primary} />
          <circle cx="12" cy="12" r="9" {...fillSec} />
          <path stroke={primary} d="M12 7v5l3 2" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common}>
          <rect x="4" y="11" width="16" height="10" rx="2" stroke={primary} />
          <rect x="4" y="11" width="16" height="10" rx="2" {...fillSec} />
          <path stroke={primary} d="M8 11V8a4 4 0 1 1 8 0v3" />
        </svg>
      )
    case 'building':
      return (
        <svg {...common}>
          <path {...fillSec} d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16H4Z" />
          <path stroke={primary} d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M4 21h16M9 7h2M9 11h2M9 15h2M13 7h2M13 11h2M13 15h2" />
        </svg>
      )
    case 'user-circle':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke={primary} />
          <circle cx="12" cy="10" r="3" {...fillSec} />
          <path stroke={primary} d="M5.5 19a7 7 0 0 1 13 0" />
        </svg>
      )
    case 'feather':
      return (
        <svg {...common}>
          <path {...fillSec} d="M20 4c-7 0-14 4-14 14v2h2c10 0 14-7 14-14 0-1-1-2-2-2Z" />
          <path stroke={primary} d="M20 4c-7 0-14 4-14 14v2h2c10 0 14-7 14-14 0-1-1-2-2-2ZM4 22 12 14" />
        </svg>
      )
    case 'compass':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke={primary} />
          <path {...fillSec} d="m15 9-2 6-4 1 1-4 5-3Z" />
          <path stroke={primary} d="m15 9-2 6-4 1 1-4 5-3Z" />
        </svg>
      )
    case 'bolt':
      return (
        <svg {...common}>
          <path {...fillSec} d="M13 2 4.5 13H11l-1 9 8.5-11H12l1-9Z" />
          <path stroke={primary} d="M13 2 4.5 13H11l-1 9 8.5-11H12l1-9Z" />
        </svg>
      )
    case 'book-open':
      return (
        <svg {...common}>
          <path {...fillSec} d="M2 7h9v14H5a3 3 0 0 1-3-3V7ZM22 7H13v14h6a3 3 0 0 0 3-3V7Z" />
          <path stroke={primary} d="M2 7h9v14M22 7H13v14M12 7V3M2 7a5 5 0 0 1 5-5h5M22 7a5 5 0 0 0-5-5h-5" />
        </svg>
      )
    default:
      return null
  }
}
