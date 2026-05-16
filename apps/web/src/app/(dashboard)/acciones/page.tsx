'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkillPanel } from '@/components/features/skill-panel'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Accion {
  id: string
  label: string
  desc: string
  icon: string
  time: string
}

interface Grupo {
  area: string
  color: string
  emoji: string
  desc: string
  acciones: Accion[]
}

const GRUPOS: Grupo[] = [
  {
    area: 'Penal',
    color: '#EF4444',
    emoji: '⚖️',
    desc: 'Defensa, acusación y recursos penales',
    acciones: [
      { id: 'penal:escrito-defensa', label: 'Escrito de defensa', desc: 'Redacta defensa penal con hechos, fundamentos y petición absolutoria.', icon: '🛡️', time: '5 min' },
      { id: 'penal:querella', label: 'Querella', desc: 'Formula querella por delito con calificación jurídica y diligencias.', icon: '⚖️', time: '8 min' },
      { id: 'penal:recurso-apelacion', label: 'Recurso de apelación penal', desc: 'Recurso contra sentencia con motivos de impugnación.', icon: '📝', time: '6 min' },
    ],
  },
  {
    area: 'Familia',
    color: '#EC4899',
    emoji: '👨‍👩‍👧',
    desc: 'Divorcios, custodia y violencia doméstica',
    acciones: [
      { id: 'familia:demanda-divorcio', label: 'Demanda de divorcio', desc: 'Divorcio contencioso o de mutuo acuerdo con medidas paterno-filiales.', icon: '💔', time: '10 min' },
      { id: 'familia:convenio-regulador', label: 'Convenio regulador', desc: 'Convenio con custodia, pensiones y reparto de bienes.', icon: '📋', time: '12 min' },
    ],
  },
  {
    area: 'Laboral',
    color: '#F97316',
    emoji: '💼',
    desc: 'Despidos, contratos y reclamaciones',
    acciones: [
      { id: 'laboral:demanda-despido', label: 'Demanda por despido', desc: 'Demanda por despido improcedente ante el Juzgado de lo Social.', icon: '💼', time: '8 min' },
      { id: 'laboral:carta-despido', label: 'Carta de despido', desc: 'Carta disciplinaria u objetiva con motivación legal sólida.', icon: '📩', time: '4 min' },
      { id: 'laboral:revision-contrato', label: 'Revisar contrato laboral', desc: 'Detecta cláusulas abusivas, nulas o ilegales.', icon: '🔍', time: '3 min' },
    ],
  },
  {
    area: 'Civil',
    color: '#3B82F6',
    emoji: '🏛️',
    desc: 'Reclamaciones dinerarias y procesos civiles',
    acciones: [
      { id: 'civil:demanda-cantidad', label: 'Reclamación de cantidad', desc: 'Demanda ordinaria o monitoria para reclamar deuda dineraria.', icon: '💰', time: '6 min' },
      { id: 'civil:demanda-monitorio', label: 'Proceso monitorio', desc: 'Petición monitoria con título ejecutivo y documentación.', icon: '📌', time: '4 min' },
    ],
  },
  {
    area: 'Contratos',
    color: '#6366F1',
    emoji: '📄',
    desc: 'Revisión, redacción y análisis de contratos',
    acciones: [
      { id: 'commercial-legal:review', label: 'Revisar contrato', desc: 'Análisis completo: riesgos, cláusulas abusivas y recomendaciones.', icon: '🔎', time: '2 min' },
      { id: 'commercial-legal:nda', label: 'Redactar NDA', desc: 'Acuerdo de confidencialidad bilateral o unilateral completo.', icon: '🔐', time: '3 min' },
      { id: 'commercial-legal:draft', label: 'Redactar contrato', desc: 'Genera contrato a medida con todas las cláusulas necesarias.', icon: '✍️', time: '5 min' },
    ],
  },
  {
    area: 'Administrativo',
    color: '#06B6D4',
    emoji: '🏛️',
    desc: 'Recursos, expedientes y sanciones',
    acciones: [
      { id: 'admin:recurso-alzada', label: 'Recurso de alzada', desc: 'Recurso ante el órgano superior con fundamentos de nulidad.', icon: '🏛️', time: '7 min' },
      { id: 'admin:recurso-contencioso', label: 'Recurso contencioso-adm.', desc: 'Demanda ante el TSJA o la Audiencia Nacional.', icon: '⚖️', time: '10 min' },
    ],
  },
  {
    area: 'Inmobiliario',
    color: '#F59E0B',
    emoji: '🏠',
    desc: 'Desahucios, arrendamientos y comunidades',
    acciones: [
      { id: 'inmobiliario:desahucio', label: 'Demanda de desahucio', desc: 'Desahucio por impago de renta o expiración del contrato.', icon: '🏠', time: '6 min' },
      { id: 'inmobiliario:arrendamiento', label: 'Contrato de arrendamiento', desc: 'Contrato de alquiler residencial conforme a la LAU.', icon: '🔑', time: '4 min' },
    ],
  },
]

const ALL_ACCIONES = GRUPOS.flatMap(g => g.acciones.map(a => ({ ...a, area: g.area, color: g.color })))

// ─── Stats ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '20', label: 'Acciones jurídicas' },
  { value: '7', label: 'Áreas del derecho' },
  { value: '< 5 min', label: 'Tiempo medio' },
  { value: '100%', label: 'Derecho español' },
]

// ─── How it works steps ────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    num: '01',
    title: 'Sube tu documento',
    sub: 'PDF, Word o texto',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Elige la acción',
    sub: 'De las 20 más frecuentes',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'LEXIA genera',
    sub: 'Resultado listo en < 5 min',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AccionesPage() {
  const [search, setSearch] = useState('')
  const [activeArea, setActiveArea] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filteredGrupos = useMemo(() => {
    const q = search.toLowerCase()
    return GRUPOS.map(g => ({
      ...g,
      acciones: g.acciones.filter(a =>
        (!activeArea || g.area === activeArea) &&
        (!q || a.label.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q))
      ),
    })).filter(g => g.acciones.length > 0)
  }, [search, activeArea])

  const selectedAccion = ALL_ACCIONES.find(a => a.id === selectedId)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 0 80px' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'center', padding: '48px 0 56px' }}>

        {/* Left */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 999,
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.3)',
              marginBottom: 24,
            }}>
              <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, letterSpacing: '0.05em' }}>✦ Inteligencia Jurídica</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', margin: 0 }}
          >
            Automatiza cualquier
            <br />
            <span style={{ background: 'linear-gradient(135deg, #7C3AED, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              tarea jurídica
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            style={{ marginTop: 20, fontSize: 15.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.5)', maxWidth: 460 }}
          >
            Selecciona el tipo de acción, sube el documento y LEXIA lo analiza, redacta y genera en segundos. Sin plantillas vacías. Sin horas de búsqueda.
          </motion.p>
        </div>

        {/* Right — How it works */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {HOW_STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.28 + i * 0.09 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#a78bfa',
              }}>
                {step.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(124,58,237,0.7)', letterSpacing: '0.08em' }}>{step.num}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>{step.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: 11.5, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>{step.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 48 }}
      >
        {STATS.map((s, i) => (
          <div
            key={i}
            style={{
              padding: '18px 20px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 5, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Search + filters ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.5 }}
        style={{ marginBottom: 36 }}
      >
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <svg
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar acción jurídica…"
            style={{
              width: '100%', boxSizing: 'border-box',
              paddingLeft: 40, paddingRight: 16, paddingTop: 11, paddingBottom: 11,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: '#fff', fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveArea(null)}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
              background: !activeArea ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: !activeArea ? '#fff' : 'rgba(255,255,255,0.45)',
              border: !activeArea ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            Todas las áreas
          </button>
          {GRUPOS.map(g => (
            <button
              key={g.area}
              onClick={() => setActiveArea(activeArea === g.area ? null : g.area)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
                background: activeArea === g.area ? g.color + '22' : 'transparent',
                color: activeArea === g.area ? g.color : 'rgba(255,255,255,0.45)',
                border: activeArea === g.area ? `1px solid ${g.color}44` : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {g.area}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Actions grid ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {filteredGrupos.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)' }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 14 }}>No se encontraron acciones para "<span style={{ color: '#fff' }}>{search}</span>"</p>
          </motion.div>
        ) : (
          filteredGrupos.map(grupo => (
            <motion.section
              key={grupo.area}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              style={{ marginBottom: 48 }}
            >
              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: grupo.color + '20',
                    border: `1px solid ${grupo.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17,
                  }}>
                    {grupo.emoji}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{grupo.area}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{grupo.desc}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                  background: grupo.color + '18', color: grupo.color,
                  border: `1px solid ${grupo.color}30`,
                }}>
                  {grupo.acciones.length} acciones
                </span>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 16 }} />

              {/* Cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {grupo.acciones.map((accion, i) => (
                  <ActionCard
                    key={accion.id}
                    accion={accion}
                    color={grupo.color}
                    index={i}
                    onClick={() => setSelectedId(accion.id)}
                  />
                ))}
              </div>
            </motion.section>
          ))
        )}
      </AnimatePresence>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedId && selectedAccion && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(8px)',
                zIndex: 40,
              }}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16,
              }}
              onClick={e => e.target === e.currentTarget && setSelectedId(null)}
            >
              <div style={{
                width: '100%', maxWidth: 720,
                maxHeight: '90vh', overflowY: 'auto',
                borderRadius: 20,
                background: '#0f0f12',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: `0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)`,
              }}>
                {/* Modal header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '18px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: selectedAccion.color + '20',
                      border: `1px solid ${selectedAccion.color}35`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>
                      {selectedAccion.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{selectedAccion.label}</div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>
                        LEXIA analizará tu documento y ejecutará la acción
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: 18, lineHeight: 1, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ padding: 24 }}>
                  <SkillPanel skillId={selectedId} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Action Card component ─────────────────────────────────────────────────────

function ActionCard({
  accion,
  color,
  index,
  onClick,
}: {
  accion: Accion
  color: string
  index: number
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        textAlign: 'left',
        padding: '18px 18px 14px',
        borderRadius: 14,
        background: hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? color + '33' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: hovered ? `0 0 24px -8px ${color}44` : 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 16,
        width: 40, height: 3, borderRadius: '0 0 4px 4px',
        background: color,
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 0.2s',
      }} />

      {/* Hover glow blob */}
      <div style={{
        position: 'absolute', top: -8, right: -8,
        width: 64, height: 64,
        borderRadius: '50%',
        background: color,
        filter: 'blur(24px)',
        opacity: hovered ? 0.25 : 0,
        transition: 'opacity 0.3s',
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        fontSize: '1.8rem', lineHeight: 1,
        marginBottom: 12,
      }}>
        {accion.icon}
      </div>

      {/* Title */}
      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', lineHeight: 1.3, marginBottom: 6 }}>
        {accion.label}
      </div>

      {/* Description */}
      <p style={{
        margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)',
        lineHeight: 1.55,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {accion.desc}
      </p>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 14, paddingTop: 12,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
          ⏱ {accion.time}
        </span>
        <span style={{
          fontSize: 11.5, fontWeight: 600, color,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s',
        }}>
          Ejecutar →
        </span>
      </div>
    </motion.button>
  )
}
