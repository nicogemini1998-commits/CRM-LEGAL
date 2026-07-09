'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ShareDocumentModalProps {
  documentTitle: string
  documentId: string
  onClose: () => void
}

export function ShareDocumentModal({ documentTitle, documentId, onClose }: ShareDocumentModalProps) {
  const [email, setEmail] = useState('')
  const [expiry, setExpiry] = useState('7')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)

  const generatedLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${documentId}?token=${btoa(documentId + ':' + Date.now())}`

  const handleShare = async () => {
    if (!email.trim()) return
    setSending(true)
    await new Promise(r => setTimeout(r, 1000))
    setShareLink(generatedLink)
    setSent(true)
    setSending(false)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Compartir documento</h2>
            <p className="text-sm text-slate-500 mt-0.5 truncate max-w-xs">{documentTitle}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!sent ? (
            <>
              {/* Link copy */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Enlace de acceso
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={generatedLink}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-mono truncate"
                  />
                  <motion.button
                    onClick={handleCopyLink}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copied ? '✓ Copiado' : 'Copiar'}
                  </motion.button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400">o enviar por email</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Email del destinatario
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="cliente@ejemplo.com"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Válido durante
                </label>
                <div className="flex gap-2">
                  {['1', '7', '30'].map(days => (
                    <button
                      key={days}
                      onClick={() => setExpiry(days)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        expiry === days
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {days === '1' ? '1 día' : days === '7' ? '7 días' : '30 días'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <span className="text-amber-500 flex-shrink-0 mt-0.5">🔒</span>
                <p className="text-xs text-amber-800">
                  El enlace expirará en {expiry} día{expiry !== '1' ? 's' : ''}. Solo podrá visualizarse, no descargarse.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="flex-1 px-4 py-2.5 text-slate-600 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition font-medium">
                  Cancelar
                </button>
                <motion.button
                  onClick={handleShare}
                  disabled={!email.trim() || sending}
                  className="flex-1 px-4 py-2.5 bg-[#8F7EE9] text-white rounded-xl text-sm font-medium hover:bg-[#7C6BD6] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {sending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Enviar enlace
                    </>
                  )}
                </motion.button>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-lg font-semibold text-slate-900">¡Enlace enviado!</h3>
              <p className="text-slate-500 text-sm mt-1">
                Se ha enviado el acceso a <strong>{email}</strong>
              </p>
              <p className="text-slate-400 text-xs mt-1">Válido durante {expiry} día{expiry !== '1' ? 's' : ''}</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
              >
                Cerrar
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
