'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CONTRACT_TYPES = [
  { id: 'NDA', label: 'Acuerdo de Confidencialidad', desc: 'NDA entre empresas o personas', icon: '🔒' },
  { id: 'COMPRAVENTA', label: 'Compraventa', desc: 'Venta de bienes muebles o inmuebles', icon: '🏠' },
  { id: 'ARRENDAMIENTO', label: 'Arrendamiento de Local', desc: 'Alquiler comercial (LAU)', icon: '🏢' },
  { id: 'PRESTAMO', label: 'Contrato de Préstamo', desc: 'Préstamo entre particulares o empresas', icon: '💶' },
  { id: 'SERVICIOS', label: 'Prestación de Servicios', desc: 'Freelance, consultoría, servicios profesionales', icon: '📋' },
]

const CONTRACT_FIELDS: Record<string, Array<{ key: string; label: string; placeholder: string }>> = {
  NDA: [
    { key: 'parte_reveladora', label: 'Parte reveladora', placeholder: 'Empresa S.L. (NIF: B12345678)' },
    { key: 'parte_receptora', label: 'Parte receptora', placeholder: 'Consultor SA (NIF: A87654321)' },
    { key: 'objeto', label: 'Objeto de la confidencialidad', placeholder: 'Proyecto de software para gestión contable...' },
    { key: 'duracion', label: 'Duración', placeholder: '2 años desde la firma' },
  ],
  COMPRAVENTA: [
    { key: 'vendedor', label: 'Vendedor', placeholder: 'Nombre completo (DNI: 12345678A)' },
    { key: 'comprador', label: 'Comprador', placeholder: 'Nombre completo (DNI: 87654321B)' },
    { key: 'bien', label: 'Descripción del bien', placeholder: 'Vehículo marca Toyota, matrícula 1234ABC...' },
    { key: 'precio', label: 'Precio (€)', placeholder: '15.000 €' },
    { key: 'forma_pago', label: 'Forma de pago', placeholder: 'Transferencia bancaria en el momento de la firma' },
  ],
  ARRENDAMIENTO: [
    { key: 'arrendador', label: 'Arrendador', placeholder: 'Nombre / empresa (NIF)' },
    { key: 'arrendatario', label: 'Arrendatario', placeholder: 'Nombre / empresa (NIF)' },
    { key: 'local', label: 'Descripción del local', placeholder: 'Local comercial en Calle Mayor 5, Madrid, 80m²' },
    { key: 'renta', label: 'Renta mensual (€)', placeholder: '1.200 €/mes' },
    { key: 'duracion', label: 'Duración', placeholder: '3 años con prórrogas anuales' },
  ],
  PRESTAMO: [
    { key: 'prestamista', label: 'Prestamista', placeholder: 'Nombre completo (DNI)' },
    { key: 'prestatario', label: 'Prestatario', placeholder: 'Nombre completo (DNI)' },
    { key: 'capital', label: 'Capital prestado (€)', placeholder: '5.000 €' },
    { key: 'interes', label: 'Tipo de interés', placeholder: '0% (sin interés) o 3% anual' },
    { key: 'devolucion', label: 'Devolución', placeholder: '12 cuotas mensuales de 416,67 €' },
  ],
  SERVICIOS: [
    { key: 'prestador', label: 'Prestador del servicio', placeholder: 'Consultor / empresa (NIF)' },
    { key: 'cliente', label: 'Cliente', placeholder: 'Empresa S.L. (NIF)' },
    { key: 'servicio', label: 'Descripción del servicio', placeholder: 'Desarrollo de aplicación web...' },
    { key: 'honorarios', label: 'Honorarios', placeholder: '3.000 € + IVA' },
    { key: 'plazo', label: 'Plazo de entrega', placeholder: '30 días desde la firma' },
  ],
}

function CostBadge({ cents }: { cents: number }) {
  const display = cents < 1 ? '<0.01€' : `${(cents / 100).toFixed(2)}€`
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-medium">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Coste: {display}
    </span>
  )
}

export default function GeneratePage() {
  const [step, setStep] = useState<'select' | 'fields' | 'generating' | 'result'>('select')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [streamText, setStreamText] = useState('')
  const [finalContract, setFinalContract] = useState<{ content: string; id: string } | null>(null)
  const [costCents, setCostCents] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Array<{ id: string; name: string; email: string | null; nif_cif: string | null }>>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []))
  }, [])

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId)
    const client = clients.find(c => c.id === clientId)
    if (!client || !selectedType) return
    const nif = client.nif_cif ? ` (NIF/CIF: ${client.nif_cif})` : ''
    const clientStr = `${client.name}${nif}`
    const prefillMap: Record<string, Record<string, string>> = {
      NDA: { parte_reveladora: clientStr },
      COMPRAVENTA: { vendedor: clientStr },
      ARRENDAMIENTO: { arrendador: clientStr },
      PRESTAMO: { prestamista: clientStr },
      SERVICIOS: { cliente: clientStr },
    }
    if (prefillMap[selectedType]) {
      setFields(prev => ({ ...prev, ...prefillMap[selectedType] }))
    }
  }

  const handleDownloadPDF = () => {
    if (!finalContract) return
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${selectedTypeMeta?.label || 'Contrato'}</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; margin: 3cm 2.5cm; color: #1a1a1a; }
  pre { white-space: pre-wrap; font-family: inherit; }
  @media print { body { margin: 2cm; } }
</style>
</head>
<body>
<pre>${finalContract.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
<script>window.onload = () => { window.print(); }</script>
</body>
</html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close() }
  }

  useEffect(() => {
    if (step === 'generating' && resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight
    }
  }, [streamText, step])

  const handleGenerate = async () => {
    if (!selectedType) return
    setStep('generating')
    setStreamText('')
    setError('')

    try {
      const res = await fetch('/api/claude/generate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractType: selectedType, fields, stream: true }),
      })

      if (!res.ok || !res.body) throw new Error('Error al generar contrato')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = JSON.parse(line.slice(6))
          if (data.type === 'delta') setStreamText(prev => prev + data.text)
          if (data.type === 'done') {
            setFinalContract({ content: data.contract?.content || streamText, id: data.contract?.id })
            setCostCents(data.cost_eur_cents)
            setStep('result')
          }
          if (data.type === 'error') throw new Error(data.message)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setStep('fields')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(finalContract?.content || '')
  }

  const selectedTypeMeta = CONTRACT_TYPES.find(t => t.id === selectedType)

  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="display-2" style={{ color: 'var(--ink-primary)' }}>
          Generar <span style={{ fontStyle: 'italic' }}>contrato</span>
        </h1>
        <p className="text-[13px] mt-2" style={{ color: 'var(--ink-tertiary)' }}>
          LEXIA redacta un contrato completo, válido en España, en segundos.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-12 gap-3">
              {CONTRACT_TYPES.map((type, idx) => {
                const isHero = idx === 0
                return (
                  <motion.button
                    key={type.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.32 }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedType(type.id); setFields({}); setStep('fields') }}
                    className={`relative p-6 text-left group overflow-hidden transition-colors duration-200 ${
                      isHero ? 'col-span-12 md:col-span-6' : idx === 1 ? 'col-span-12 md:col-span-6' : 'col-span-12 md:col-span-4'
                    }`}
                    style={{
                      background: isHero ? 'var(--obsidian)' : 'var(--surface)',
                      border: isHero ? '1px solid var(--obsidian-hover)' : '1px solid var(--hairline)',
                      borderRadius: 'var(--r-2xl)',
                      color: isHero ? '#fff' : 'var(--ink-primary)',
                    }}
                    onMouseEnter={(e) => { if (!isHero) e.currentTarget.style.borderColor = 'var(--lime-hover)' }}
                    onMouseLeave={(e) => { if (!isHero) e.currentTarget.style.borderColor = 'var(--hairline)' }}
                  >
                    {isHero && (
                      <div
                        aria-hidden
                        className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(199,242,132,0.25), transparent 70%)' }}
                      />
                    )}
                    <div className="relative">
                      <div className="flex items-start justify-between mb-8">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ background: isHero ? 'var(--lime)' : 'var(--surface-elevated)' }}
                        >
                          {type.icon}
                        </div>
                        {isHero && (
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--lime)', color: 'var(--lime-text-on)' }}
                          >
                            Más usado
                          </span>
                        )}
                      </div>
                      <p
                        className="font-display leading-tight"
                        style={{
                          fontSize: isHero ? 28 : 20,
                          color: isHero ? 'var(--lime)' : 'var(--ink-primary)',
                          fontStyle: isHero ? 'italic' : 'normal',
                        }}
                      >
                        {type.label}
                      </p>
                      <p
                        className="text-[12.5px] mt-2"
                        style={{ color: isHero ? 'rgba(255,255,255,0.6)' : 'var(--ink-secondary)' }}
                      >
                        {type.desc}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 'fields' && selectedType && (
          <motion.div key="fields" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-xl">{selectedTypeMeta?.icon}</span>
                <div>
                  <h2 className="font-semibold text-slate-900">{selectedTypeMeta?.label}</h2>
                  <p className="text-slate-400 text-sm">Rellena los datos — los campos vacíos usarán placeholders</p>
                </div>
              </div>

              {/* Pre-fill from client */}
              {clients.length > 0 && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">⚡ Pre-rellenar desde cliente</p>
                  <select
                    value={selectedClientId}
                    onChange={e => handleClientSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition text-slate-700"
                  >
                    <option value="">Selecciona un cliente para pre-rellenar...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}{c.nif_cif ? ` — ${c.nif_cif}` : ''}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-4">
                {(CONTRACT_FIELDS[selectedType] || []).map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                    <input
                      type="text"
                      value={fields[field.key] || ''}
                      onChange={e => setFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                    />
                  </div>
                ))}
              </div>

              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep('select')} className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition">
                  ← Atrás
                </button>
                <button onClick={handleGenerate} className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generar contrato
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {(step === 'generating' || step === 'result') && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{selectedTypeMeta?.icon}</span>
                  <h2 className="font-semibold text-slate-900">{selectedTypeMeta?.label}</h2>
                  {step === 'generating' && (
                    <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      Generando...
                    </span>
                  )}
                  {step === 'result' && costCents !== null && <CostBadge cents={costCents} />}
                </div>
                {step === 'result' && (
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="px-3 py-1.5 text-slate-600 border border-slate-200 rounded-lg text-xs hover:bg-slate-50 transition">
                      Copiar
                    </button>
                    <motion.button
                      onClick={handleDownloadPDF}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Descargar PDF
                    </motion.button>
                    <button onClick={() => { setStep('select'); setSelectedType(null); setFinalContract(null); setSelectedClientId('') }} className="px-3 py-1.5 text-slate-600 border border-slate-200 rounded-lg text-xs hover:bg-slate-50 transition">
                      Nuevo contrato
                    </button>
                  </div>
                )}
              </div>

              <div ref={resultRef} className="p-6 max-h-[600px] overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {step === 'generating' ? streamText : finalContract?.content}
                  {step === 'generating' && (
                    <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-middle" />
                  )}
                </pre>
              </div>

              {step === 'result' && (
                <div className="px-6 pb-5">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-xs">⚠️ Documento generado por IA. Revisa y adapta antes de firmar. No constituye asesoramiento jurídico.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
