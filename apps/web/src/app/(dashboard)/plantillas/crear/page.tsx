'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'number'

interface BuilderField {
  id: string
  label: string
  type: FieldType
  required: boolean
  options?: string  // comma-separated for select
}

const CATEGORIES = [
  'Civil', 'Penal', 'Laboral', 'Contratos', 'Mercantil', 'Administrativo', 'Inmobiliario', 'Familia',
]

const EMOJIS = ['📄', '⚖️', '👷', '🏠', '🏢', '🔒', '🏛️', '👨‍👩‍👧', '📋', '💼', '🔐', '📌', '🛡️', '✍️']

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Info básica' },
    { n: 2, label: 'Campos del formulario' },
    { n: 3, label: 'Prompt IA' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
      {steps.map((s, i) => {
        const isActive = s.n === step
        const isDone = s.n < step
        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                background: isActive || isDone
                  ? 'linear-gradient(135deg, #7C3AED, #6366F1)'
                  : 'var(--surface-elevated)',
                color: isActive || isDone ? '#fff' : 'var(--ink-tertiary)',
                border: isActive || isDone ? 'none' : '1px solid var(--hairline)',
                boxShadow: isActive ? '0 4px 12px rgba(124,58,237,0.35)' : 'none',
              }}>{isDone ? '✓' : s.n}</div>
              <span style={{
                fontSize: 12.5, fontWeight: 600,
                color: isActive ? 'var(--ink-primary)' : 'var(--ink-tertiary)',
              }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 36, height: 2, borderRadius: 2,
                background: isDone ? '#7C3AED' : 'var(--hairline)',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CrearPlantillaPage() {
  const router = useRouter()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  // Step 1
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Contratos')
  const [emoji, setEmoji] = useState('📄')
  // Step 2
  const [fields, setFields] = useState<BuilderField[]>([
    { id: 'field_1', label: '', type: 'text', required: true },
  ])
  // Step 3
  const [prompt, setPrompt] = useState('Redacta un documento entre {parte_1} y {parte_2}.\n\nIncluye las siguientes cláusulas: {clausulas}.')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  function addField() {
    setFields(fs => [...fs, { id: `field_${fs.length + 1}`, label: '', type: 'text', required: false }])
  }
  function removeField(id: string) {
    setFields(fs => fs.filter(f => f.id !== id))
  }
  function updateField(id: string, patch: Partial<BuilderField>) {
    setFields(fs => fs.map(f => (f.id === id ? { ...f, ...patch } : f)))
  }

  const detectedVars = useMemo(() => {
    const matches = prompt.match(/\{([a-zA-Z0-9_\-]+)\}/g) ?? []
    return Array.from(new Set(matches.map(m => m.slice(1, -1))))
  }, [prompt])

  const promptPreview = useMemo(() => {
    return prompt.replace(/\{([a-zA-Z0-9_\-]+)\}/g, (_, v) => {
      const field = fields.find(f => f.id === v || f.label.toLowerCase().replace(/\s+/g, '_') === v)
      return field ? `[${field.label || 'Ejemplo'}]` : '[Ejemplo]'
    })
  }, [prompt, fields])

  const canGoStep2 = title.trim().length > 2 && description.trim().length > 5
  const canGoStep3 = fields.every(f => f.label.trim().length > 0)

  async function save() {
    setSaving(true); setSaveError('')
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, category, emoji,
          fields: fields.map(f => ({
            id: f.id, label: f.label, type: f.type, required: f.required,
            options: f.type === 'select' && f.options ? f.options.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          })),
          prompt,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      router.push('/plantillas')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar')
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', paddingBottom: 80 }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <button
          onClick={() => router.push('/plantillas')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--ink-tertiary)', fontSize: 12.5, fontWeight: 600, padding: 0, marginBottom: 12,
          }}
        >
          ← Volver a plantillas
        </button>
        <h1 className="font-display" style={{ fontSize: 36, lineHeight: 1.1, color: 'var(--ink-primary)', fontWeight: 500, letterSpacing: '-0.02em' }}>
          Crear plantilla
        </h1>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--ink-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
          Define la información, los campos del formulario y el prompt IA. La plantilla quedará disponible para todo tu despacho.
        </p>
      </motion.div>

      <Stepper step={step} />

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 18,
        padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 4 }}>
                Información básica
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-tertiary)', marginBottom: 22 }}>
                Título, descripción y categoría de la plantilla.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Título" required>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Ej. Contrato de prestación de servicios" style={input} />
                </Field>
                <Field label="Descripción" required>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                    placeholder="¿Qué documento genera esta plantilla y para quién?" style={{ ...input, resize: 'none', fontFamily: 'inherit' }} />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Categoría" required>
                    <select value={category} onChange={e => setCategory(e.target.value)} style={input}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Icono">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {EMOJIS.map(em => (
                        <button key={em} type="button" onClick={() => setEmoji(em)}
                          style={{
                            width: 36, height: 36, borderRadius: 10, fontSize: 18, cursor: 'pointer',
                            background: emoji === em ? 'rgba(124,58,237,0.10)' : 'var(--surface-elevated)',
                            border: `1px solid ${emoji === em ? '#7C3AED' : 'var(--hairline)'}`,
                          }}
                        >{em}</button>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 4 }}>
                Campos del formulario
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-tertiary)', marginBottom: 22 }}>
                Define qué datos pedirá la plantilla. Cada campo se podrá usar como variable en el prompt.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {fields.map((f, idx) => (
                  <div key={f.id} style={{
                    padding: 14, borderRadius: 12, background: 'var(--surface-elevated)',
                    border: '1px solid var(--hairline)',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 140px 90px 36px', gap: 10, alignItems: 'end' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-tertiary)', textAlign: 'center', paddingBottom: 9 }}>
                        #{idx + 1}
                      </span>
                      <Field label="Etiqueta" compact>
                        <input type="text" value={f.label}
                          onChange={e => {
                            const newLabel = e.target.value
                            const baseId = newLabel.toLowerCase()
                              .normalize('NFD').replace(/[̀-ͯ]/g, '')
                              .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
                            // Ensure unique id: append suffix if collision
                            let newId = baseId || f.id
                            if (newId !== f.id && fields.some(x => x.id === newId)) {
                              newId = `${baseId}_${idx + 1}`
                            }
                            updateField(f.id, { label: newLabel, id: newId })
                          }}
                          placeholder="Nombre del cliente" style={input} />
                      </Field>
                      <Field label="Tipo" compact>
                        <select value={f.type} onChange={e => updateField(f.id, { type: e.target.value as FieldType })} style={input}>
                          <option value="text">Texto</option>
                          <option value="textarea">Texto largo</option>
                          <option value="select">Lista</option>
                          <option value="date">Fecha</option>
                          <option value="number">Número</option>
                        </select>
                      </Field>
                      <Field label="Obligatorio" compact>
                        <button type="button" onClick={() => updateField(f.id, { required: !f.required })}
                          style={{
                            ...input, cursor: 'pointer', textAlign: 'center',
                            background: f.required ? 'rgba(124,58,237,0.10)' : 'var(--surface)',
                            color: f.required ? '#7C3AED' : 'var(--ink-tertiary)',
                            fontWeight: 600, height: 38,
                          }}
                        >{f.required ? 'Sí' : 'No'}</button>
                      </Field>
                      <button type="button" onClick={() => removeField(f.id)}
                        disabled={fields.length === 1}
                        style={{
                          width: 36, height: 38, borderRadius: 10, cursor: 'pointer',
                          background: 'transparent', border: '1px solid var(--hairline)',
                          color: 'var(--ink-tertiary)', opacity: fields.length === 1 ? 0.4 : 1,
                        }}
                      >×</button>
                    </div>
                    {f.type === 'select' && (
                      <div style={{ marginTop: 10 }}>
                        <Field label="Opciones (separadas por coma)" compact>
                          <input type="text" value={f.options ?? ''}
                            onChange={e => updateField(f.id, { options: e.target.value })}
                            placeholder="Opción A, Opción B, Opción C" style={input} />
                        </Field>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={addField} style={{
                marginTop: 14, padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                background: 'var(--surface-elevated)', border: '1px dashed var(--hairline-strong)',
                fontSize: 13, fontWeight: 600, color: 'var(--ink-secondary)', width: '100%',
              }}>+ Añadir campo</button>

              {/* Live preview */}
              <div style={{ marginTop: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  Preview del formulario
                </p>
                <div style={{
                  padding: 16, borderRadius: 12, background: 'var(--surface)',
                  border: '1px solid var(--hairline)',
                  display: 'flex', flexDirection: 'column', gap: 12,
                }}>
                  {fields.map(f => (
                    <div key={`prev_${f.id}`}>
                      <label style={labelStyle}>
                        {f.label || <span style={{ color: 'var(--ink-tertiary)' }}>Sin etiqueta</span>}
                        {f.required && <span style={{ color: '#DC2626', marginLeft: 4 }}>*</span>}
                      </label>
                      {f.type === 'textarea' ? (
                        <textarea rows={2} placeholder="—" style={input} disabled />
                      ) : f.type === 'select' ? (
                        <select style={input} disabled>
                          <option>{(f.options || 'Opción A, Opción B').split(',')[0]}</option>
                        </select>
                      ) : (
                        <input type={f.type} placeholder="—" style={input} disabled />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 4 }}>
                Prompt IA
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-tertiary)', marginBottom: 22 }}>
                Usa <code style={codeChip}>{'{nombre_campo}'}</code> para insertar variables. Detectamos variables automáticamente.
              </p>

              <Field label="Prompt template">
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={10}
                  style={{ ...input, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, resize: 'vertical' }}
                  spellCheck={false}
                />
              </Field>

              <div style={{ marginTop: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Variables detectadas
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {detectedVars.length === 0 && (
                    <span style={{ fontSize: 12, color: 'var(--ink-tertiary)' }}>Ninguna. Añade {'{variables}'} al prompt.</span>
                  )}
                  {detectedVars.map(v => (
                    <span key={v} style={codeChip}>{`{${v}}`}</span>
                  ))}
                </div>

                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Preview con ejemplos
                </p>
                <div style={{
                  padding: 16, borderRadius: 12,
                  background: 'var(--surface-elevated)', border: '1px solid var(--hairline)',
                  fontSize: 13, lineHeight: 1.6, color: 'var(--ink-primary)', whiteSpace: 'pre-wrap',
                }}>
                  {promptPreview}
                </div>
              </div>

              {saveError && (
                <div style={{
                  marginTop: 16, padding: 12, borderRadius: 10,
                  background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
                  fontSize: 12.5, color: '#B91C1C',
                }}>{saveError}</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--hairline)' }}>
          <button
            onClick={() => step > 1 && setStep((step - 1) as 1 | 2)}
            disabled={step === 1}
            style={{
              padding: '10px 16px', borderRadius: 10, cursor: step === 1 ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600,
              background: 'var(--surface-elevated)', color: 'var(--ink-secondary)',
              border: '1px solid var(--hairline)', opacity: step === 1 ? 0.5 : 1,
            }}
          >← Atrás</button>

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as 2 | 3)}
              disabled={(step === 1 && !canGoStep2) || (step === 2 && !canGoStep3)}
              style={{
                padding: '11px 22px', borderRadius: 12, cursor: 'pointer', border: 'none',
                fontSize: 13.5, fontWeight: 700, color: '#fff',
                background: '#8F7EE9',
                boxShadow: '0 6px 18px rgba(143,126,233,0.32)',
                opacity: ((step === 1 && !canGoStep2) || (step === 2 && !canGoStep3)) ? 0.55 : 1,
              }}
            >Siguiente →</button>
          ) : (
            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: '11px 22px', borderRadius: 12, cursor: 'pointer', border: 'none',
                fontSize: 13.5, fontWeight: 700, color: '#fff',
                background: '#8F7EE9',
                boxShadow: '0 6px 18px rgba(143,126,233,0.32)',
                opacity: saving ? 0.7 : 1,
              }}
            >{saving ? 'Guardando…' : 'Guardar plantilla'}</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)', marginBottom: 6,
}
const input: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 13,
  color: 'var(--ink-primary)', background: 'var(--surface)',
  border: '1px solid var(--hairline)', outline: 'none', boxSizing: 'border-box',
}
const codeChip: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px', borderRadius: 6, fontSize: 11.5,
  background: 'rgba(124,58,237,0.10)', color: '#7C3AED',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 600,
}

function Field({ label, required, compact, children }: { label: string; required?: boolean; compact?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ ...labelStyle, marginBottom: compact ? 4 : 6, fontSize: compact ? 11 : 12 }}>
        {label}{required && <span style={{ color: '#DC2626', marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  )
}
