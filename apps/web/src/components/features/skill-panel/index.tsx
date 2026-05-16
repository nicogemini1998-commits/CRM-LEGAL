'use client'

/**
 * SkillPanel — Upload + Parse PDF/DOCX + Execute claude-for-legal skill
 *
 * Usage:
 *   <SkillPanel skillId="commercial-legal:review" documentMarkdown={...} />
 *   <SkillPanel skillId="employment-legal:termination-review" onResult={...} />
 */

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DuotoneIcon } from '@/components/ui/duotone-icon'
import { LEGAL_SKILLS } from '@/lib/legal-skills'
import { ease } from '@/lib/motion'

interface SkillPanelProps {
  skillId?: string
  documentMarkdown?: string
  filename?: string
  caseId?: string
  onResult?: (text: string, tokens: Record<string, number>) => void
  className?: string
}

interface ParsedDoc {
  markdown: string
  title?: string
  detectedType: string
  wordCount: number
  estimatedTokens: number
  pageCount?: number
}

type Phase = 'idle' | 'uploading' | 'parsed' | 'selecting-skill' | 'running' | 'done' | 'error'

export function SkillPanel({ skillId: initialSkillId, documentMarkdown: externalMarkdown, filename: externalFilename, caseId, onResult, className }: SkillPanelProps) {
  const [phase, setPhase] = useState<Phase>(externalMarkdown ? 'parsed' : 'idle')
  const [selectedSkillId, setSelectedSkillId] = useState(initialSkillId || '')
  const [parsed, setParsed] = useState<ParsedDoc | null>(externalMarkdown ? { markdown: externalMarkdown, detectedType: 'contract', wordCount: 0, estimatedTokens: 0 } : null)
  const [filename, setFilename] = useState(externalFilename || '')
  const [streamText, setStreamText] = useState('')
  const [tokens, setTokens] = useState<Record<string, number>>({})
  const [costEurCents, setCostEurCents] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<HTMLDivElement>(null)

  const skill = LEGAL_SKILLS.find(s => s.id === selectedSkillId)

  const uploadFile = useCallback(async (file: File) => {
    setPhase('uploading')
    setFilename(file.name)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/documents/parse', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar')
      setParsed(data)
      setPhase('parsed')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al procesar el documento')
      setPhase('error')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }, [uploadFile])

  const executeSkill = async () => {
    if (!parsed?.markdown || !selectedSkillId) return
    setPhase('running')
    setStreamText('')

    try {
      const res = await fetch('/api/skills/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: selectedSkillId,
          documentMarkdown: parsed.markdown,
          caseId,
        }),
      })

      if (!res.ok || !res.body) throw new Error('Error al ejecutar skill')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'text') {
              fullText += data.delta
              setStreamText(fullText)
              streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' })
            }
            if (data.type === 'done') {
              setTokens(data.tokens || {})
              setCostEurCents(data.cost_eur_cents || 0)
              setPhase('done')
              onResult?.(fullText, data.tokens || {})
            }
            if (data.type === 'error') throw new Error(data.message)
          } catch {}
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error inesperado')
      setPhase('error')
    }
  }

  const reset = () => {
    setPhase(externalMarkdown ? 'parsed' : 'idle')
    setStreamText('')
    setErrorMsg('')
    if (!externalMarkdown) { setParsed(null); setFilename('') }
  }

  // ── Upload Zone (idle) ──────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className={className}>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.doc,.txt"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f) }}
        />
        <motion.div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          animate={{ borderColor: isDragging ? 'var(--lime)' : 'var(--hairline-strong)' }}
          transition={{ duration: 0.15 }}
          className="flex flex-col items-center justify-center p-10 rounded-2xl cursor-pointer transition-colors duration-150 select-none"
          style={{
            border: '1.5px dashed var(--hairline-strong)',
            background: isDragging ? 'var(--lime-bg-soft)' : 'var(--surface)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-elevated)' }}
          onMouseLeave={e => { if (!isDragging) (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: isDragging ? 'var(--lime-bg-soft)' : 'var(--surface-elevated)', border: '1px solid var(--hairline)' }}
          >
            <DuotoneIcon name="document" size={22} primary="var(--ink-secondary)" secondary="var(--lime)" />
          </div>
          <p className="text-[14px] font-medium" style={{ color: 'var(--ink-primary)' }}>
            {isDragging ? 'Suelta el documento aquí' : 'Arrastra un documento'}
          </p>
          <p className="text-[12px] mt-1" style={{ color: 'var(--ink-tertiary)' }}>
            PDF, DOCX, TXT · hasta 25 MB
          </p>
          <button
            className="mt-5 px-4 py-2 text-[12.5px] font-medium rounded-lg transition-colors duration-150"
            style={{ background: 'var(--obsidian)', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--obsidian-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--obsidian)'}
          >
            Seleccionar archivo
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Uploading ───────────────────────────────────────────────────────────────
  if (phase === 'uploading') {
    return (
      <div className={`flex items-center gap-4 p-6 rounded-2xl ${className}`} style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--lime)' }} />
          <span className="text-[13px]" style={{ color: 'var(--ink-secondary)' }}>
            Procesando <strong style={{ color: 'var(--ink-primary)' }}>{filename}</strong>…
          </span>
        </div>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className={`p-5 rounded-xl ${className}`} style={{ background: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.2)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <DuotoneIcon name="shield" size={16} primary="var(--danger)" className="mt-0.5 flex-shrink-0" />
            <p className="text-[13px]" style={{ color: 'var(--danger)' }}>{errorMsg}</p>
          </div>
          <button onClick={reset} className="text-[12px] ml-4 flex-shrink-0" style={{ color: 'var(--danger)' }}>Reintentar</button>
        </div>
      </div>
    )
  }

  // ── Parsed → Select skill ──────────────────────────────────────────────────
  if (phase === 'parsed') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Document info */}
        {parsed && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}
          >
            <DuotoneIcon name="document" size={16} primary="var(--lime)" secondary="var(--lime)" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: 'var(--ink-primary)' }}>
                {parsed.title || filename}
              </p>
              <p className="text-[11px] mt-0.5 font-mono" style={{ color: 'var(--ink-tertiary)' }}>
                {parsed.wordCount.toLocaleString('es')} palabras
                {parsed.pageCount ? ` · ${parsed.pageCount} páginas` : ''}
                {' '}· ~{(parsed.estimatedTokens / 1000).toFixed(1)}k tokens
              </p>
            </div>
            <span
              className="text-[10.5px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ background: 'var(--lime-bg-soft)', color: 'var(--lime-text-soft)' }}
            >
              {parsed.detectedType}
            </span>
            {!externalMarkdown && (
              <button onClick={reset} className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity">
                <DuotoneIcon name="plus" size={12} primary="var(--ink-secondary)" className="rotate-45" />
              </button>
            )}
          </div>
        )}

        {/* Skill selector */}
        <div>
          <p className="text-[12px] font-medium mb-2.5" style={{ color: 'var(--ink-secondary)' }}>
            Selecciona la skill a ejecutar
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {LEGAL_SKILLS.filter(s => s.featured || (parsed?.detectedType && s.category === parsed.detectedType)).slice(0, 6).concat(
              LEGAL_SKILLS.filter(s => !s.featured && !(parsed?.detectedType && s.category === parsed.detectedType)).slice(0, 2)
            ).slice(0, 6).map(s => (
              <motion.button
                key={s.id}
                onClick={() => setSelectedSkillId(s.id)}
                whileTap={{ scale: 0.98 }}
                className="flex items-start gap-2.5 p-3 rounded-xl text-left transition-all duration-150"
                style={{
                  background: selectedSkillId === s.id ? 'var(--lime-bg-soft)' : 'var(--surface)',
                  border: `1px solid ${selectedSkillId === s.id ? 'rgba(124,58,237,0.3)' : 'var(--hairline)'}`,
                }}
                onMouseEnter={e => { if (selectedSkillId !== s.id) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--hairline-strong)' }}
                onMouseLeave={e => { if (selectedSkillId !== s.id) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--hairline)' }}
              >
                <DuotoneIcon name={s.icon as Parameters<typeof DuotoneIcon>[0]['name']} size={14} primary={selectedSkillId === s.id ? 'var(--lime)' : 'var(--ink-secondary)'} className="mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium truncate" style={{ color: selectedSkillId === s.id ? 'var(--lime-text-soft)' : 'var(--ink-primary)' }}>{s.label}</p>
                  <p className="text-[11px] mt-0.5 leading-tight" style={{ color: 'var(--ink-tertiary)' }}>{s.description.slice(0, 55)}…</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Execute button */}
        <motion.button
          onClick={executeSkill}
          disabled={!selectedSkillId}
          whileTap={selectedSkillId ? { scale: 0.98 } : {}}
          className="w-full flex items-center justify-center gap-2.5 py-3 text-[13.5px] font-medium rounded-xl transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: selectedSkillId ? 'var(--obsidian)' : 'var(--surface-elevated)', color: selectedSkillId ? '#fff' : 'var(--ink-tertiary)' }}
          onMouseEnter={e => { if (selectedSkillId) e.currentTarget.style.background = 'var(--obsidian-hover)' }}
          onMouseLeave={e => { if (selectedSkillId) e.currentTarget.style.background = 'var(--obsidian)' }}
        >
          <DuotoneIcon name="sparkles" size={15} primary={selectedSkillId ? 'var(--lime)' : 'var(--ink-quaternary)'} />
          {skill ? `Ejecutar "${skill.label}"` : 'Ejecutar análisis'}
        </motion.button>
      </div>
    )
  }

  // ── Running / Done ──────────────────────────────────────────────────────────
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {phase === 'running' && (
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--lime)' }} />
          )}
          {phase === 'done' && (
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
          )}
          <span className="text-[12.5px] font-medium" style={{ color: 'var(--ink-primary)' }}>
            {phase === 'running' ? `LEXIA analizando con ${skill?.label}…` : `Análisis completado — ${skill?.label}`}
          </span>
        </div>
        {phase === 'done' && (
          <div className="flex items-center gap-3">
            {costEurCents > 0 && (
              <span className="label-meta">
                {costEurCents < 1 ? '<0.01€' : `${(costEurCents / 100).toFixed(2)}€`}
              </span>
            )}
            <button onClick={reset} className="text-[12px] px-3 py-1 rounded-lg transition-colors duration-150" style={{ background: 'var(--surface-elevated)', color: 'var(--ink-secondary)', border: '1px solid var(--hairline)' }}>
              Nuevo análisis
            </button>
          </div>
        )}
      </div>

      {/* Stream output */}
      <div
        ref={streamRef}
        className="rounded-xl p-5 overflow-y-auto"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          maxHeight: 480,
          minHeight: 200,
        }}
      >
        <pre
          className="text-[13.5px] leading-[1.7] whitespace-pre-wrap"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-primary)' }}
        >
          {streamText}
          {phase === 'running' && <span className="stream-cursor" />}
        </pre>
      </div>

      {/* Token stats */}
      {phase === 'done' && tokens.input && (
        <div className="flex items-center gap-4 px-1">
          {[
            { label: 'Entrada', value: tokens.input?.toLocaleString('es') },
            { label: 'Salida', value: tokens.output?.toLocaleString('es') },
            { label: 'Caché', value: tokens.cache ? `${tokens.cache?.toLocaleString('es')} 💜` : '—' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-1.5">
              <span className="label-meta">{stat.label}</span>
              <span className="text-[11.5px] font-mono" style={{ color: 'var(--ink-secondary)' }}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
