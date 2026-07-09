'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas. Verifica tu email y contraseña.')
        return
      }
      window.location.href = '/dashboard'
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="mb-8">
        <h2
          className="text-[34px] tracking-tight leading-[1.05]"
          style={{ fontFamily: 'var(--font-instrument), Georgia, serif', color: '#14181E' }}
        >
          Bienvenido
        </h2>
        <p className="text-[14.5px] mt-2" style={{ color: '#525252' }}>
          Accede a tu despacho
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-3.5 text-sm"
            style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)', color: '#B91C1C' }}
          >
            {error}
          </motion.div>
        )}

        <div>
          <label htmlFor="email" className="block text-[12.5px] font-medium mb-1.5" style={{ color: '#525252' }}>
            Email profesional
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="abogado@despacho.com"
            className="w-full px-4 py-[11px] rounded-xl text-sm transition outline-none"
            style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', color: '#14181E' }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#8F7EE9'
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(143,126,233,0.18)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E7E5E4'
              e.currentTarget.style.boxShadow = 'none'
            }}
            required
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-[12.5px] font-medium" style={{ color: '#525252' }}>
              Contraseña
            </label>
            <button type="button" className="text-[12px] transition" style={{ color: '#8F7EE9' }}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-[11px] rounded-xl text-sm transition outline-none"
            style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', color: '#14181E' }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#8F7EE9'
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(143,126,233,0.18)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E7E5E4'
              e.currentTarget.style.boxShadow = 'none'
            }}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white font-semibold py-[12px] px-4 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
          style={{ background: '#8F7EE9', boxShadow: '0 6px 18px -4px rgba(143,126,233,0.45)' }}
          onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = '#7C6BD6' }}
          onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = '#8F7EE9' }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Conectando...
            </span>
          ) : 'Acceder a IURALEX'}
        </button>

        <p className="text-center text-[13px] pt-1" style={{ color: '#525252' }}>
          ¿Sin cuenta?{' '}
          <Link href="/register" className="font-medium transition" style={{ color: '#8F7EE9' }}>
            Solicitar acceso
          </Link>
        </p>
      </form>

      <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E7E5E4' }}>
        <p className="text-[11px] text-center leading-relaxed" style={{ color: '#A3A3A3' }}>
          Al acceder aceptas los Términos de Servicio y la Política de Privacidad de IURALEX.
          <br />
          Datos tratados conforme al RGPD (UE) 2016/679.
        </p>
        <p className="text-[11px] text-center mt-2.5" style={{ color: '#A3A3A3' }}>
          Powered by <span style={{ color: '#8F7EE9', fontWeight: 600 }}>Cliender Tech</span> · Sagunto, Valencia 🇪🇸
        </p>
      </div>
    </motion.div>
  )
}
