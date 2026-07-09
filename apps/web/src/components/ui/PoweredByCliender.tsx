'use client'

import Link from 'next/link'

type Variant = 'inline' | 'footer'

interface PoweredByClienderProps {
  variant?: Variant
  className?: string
}

/**
 * Branding component: "Powered by Cliender Tech · Hecho en España"
 * - inline: muy sutil text-xs gris (ideal para sidebars o pie de tarjetas)
 * - footer: text-sm con logo y enlaces (para footer global del dashboard)
 */
export function PoweredByCliender({ variant = 'inline', className = '' }: PoweredByClienderProps) {
  if (variant === 'inline') {
    return (
      <p
        className={`text-[10.5px] tracking-wide ${className}`}
        style={{ color: 'var(--ink-quaternary, rgba(0,0,0,0.35))' }}
      >
        Powered by <span className="font-semibold" style={{ color: 'var(--ink-tertiary, rgba(0,0,0,0.55))' }}>Cliender Tech</span>
        {' · '}
        Hecho en España <span aria-hidden>🇪🇸</span>
      </p>
    )
  }

  // footer variant
  return (
    <footer
      className={`w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-5 mt-12 ${className}`}
      style={{ borderTop: '1px solid var(--hairline)', background: 'var(--surface, #fff)' }}
    >
      <div className="flex items-center gap-2.5">
        {/* Mini logo Cliender */}
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
            color: '#fff',
            letterSpacing: '-0.02em',
          }}
          aria-hidden
        >
          C
        </div>
        <p className="text-[12px]" style={{ color: 'var(--ink-secondary, rgba(0,0,0,0.65))' }}>
          Powered by{' '}
          <span className="font-semibold" style={{ color: 'var(--ink-primary, rgba(0,0,0,0.85))' }}>
            Cliender Tech
          </span>
          {' · '}
          Hecho en España <span aria-hidden>🇪🇸</span>
        </p>
      </div>

      <nav className="flex items-center gap-4 text-[11.5px]" style={{ color: 'var(--ink-tertiary, rgba(0,0,0,0.5))' }}>
        <Link href="/about" className="hover:underline">Acerca de</Link>
        <Link href="/privacy" className="hover:underline">Privacidad</Link>
        <Link href="/terms" className="hover:underline">Términos</Link>
        <Link href="/support" className="hover:underline">Soporte</Link>
      </nav>
    </footer>
  )
}

export default PoweredByCliender
