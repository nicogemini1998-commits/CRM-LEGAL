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
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Accede a tu despacho</h2>
        <p className="text-neutral-500 text-sm mt-1.5">Tu asistente jurídico te espera</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        <div>
          <label htmlFor="email" className="block text-[13px] font-medium text-neutral-400 mb-1.5">
            Email profesional
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="abogado@despacho.com"
            className="w-full px-4 py-[11px] bg-neutral-900 border border-neutral-700/60 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition"
            required
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-[13px] font-medium text-neutral-400">
              Contraseña
            </label>
            <button type="button" className="text-[12px] text-blue-500 hover:text-blue-400 transition">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-[11px] bg-neutral-900 border border-neutral-700/60 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition"
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-[11px] px-4 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2 shadow-lg shadow-blue-500/20"
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

        <p className="text-center text-[13px] text-neutral-600 pt-1">
          ¿Sin cuenta?{' '}
          <Link href="/register" className="text-blue-500 hover:text-blue-400 font-medium transition">
            Solicitar acceso
          </Link>
        </p>
      </form>

      <div className="mt-8 pt-6 border-t border-neutral-800/60">
        <p className="text-[11px] text-neutral-700 text-center leading-relaxed">
          Al acceder aceptas los <span className="text-neutral-600">Términos de Servicio</span> y la{' '}
          <span className="text-neutral-600">Política de Privacidad</span> de IURALEX.<br />
          Datos tratados conforme al <span className="text-neutral-600">RGPD (UE) 2016/679</span>.
        </p>
      </div>
    </motion.div>
  )
}
