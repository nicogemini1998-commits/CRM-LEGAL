'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptGDPR, setAcceptGDPR] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) { setError('La contraseña debe tener mínimo 8 caracteres'); return }
    if (!acceptTerms || !acceptGDPR) { setError('Debes aceptar los términos y el consentimiento RGPD'); return }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear cuenta')
      router.push('/login?registered=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
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
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-white tracking-tight">Solicitar acceso</h2>
        <p className="text-neutral-500 text-sm mt-1.5">Empieza tu prueba gratuita de 14 días</p>
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
          <label className="block text-[13px] font-medium text-neutral-400 mb-1.5">Nombre completo</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="María García López"
            className="w-full px-4 py-[11px] bg-neutral-900 border border-neutral-700/60 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition"
            required
            disabled={isLoading}
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-neutral-400 mb-1.5">Email profesional</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="abogada@despacho.com"
            className="w-full px-4 py-[11px] bg-neutral-900 border border-neutral-700/60 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition"
            required
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-neutral-400 mb-1.5">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="w-full px-4 py-[11px] bg-neutral-900 border border-neutral-700/60 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition"
            required
            disabled={isLoading}
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-2.5 pt-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={e => setAcceptTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-blue-600 focus:ring-blue-500/40"
              disabled={isLoading}
            />
            <span className="text-[12px] text-neutral-500 leading-relaxed">
              Acepto los <span className="text-neutral-400 underline cursor-pointer">Términos y Condiciones</span> de IURALEX
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptGDPR}
              onChange={e => setAcceptGDPR(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-blue-600 focus:ring-blue-500/40"
              disabled={isLoading}
            />
            <span className="text-[12px] text-neutral-500 leading-relaxed">
              Consiento el tratamiento de mis datos conforme al <span className="text-neutral-400">RGPD (UE) 2016/679</span> y la LOPD
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#8F7EE9] hover:bg-[#7C6BD6] active:bg-[#6A5BC1] text-white font-semibold py-[11px] px-4 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2 shadow-lg shadow-[#8F7EE9]/30"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creando cuenta...
            </span>
          ) : 'Empezar prueba gratuita — 14 días'}
        </button>

        <p className="text-center text-[13px] text-neutral-600 pt-1">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-400 font-medium transition">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </motion.div>
  )
}
