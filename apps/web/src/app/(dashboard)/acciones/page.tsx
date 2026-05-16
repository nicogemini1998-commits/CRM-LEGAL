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
  color: string       // hex
  bg: string          // rgba soft
  emoji: string
  areaDesc: string
  acciones: Accion[]
}

const GRUPOS: Grupo[] = [
  {
    area: 'Penal', color: '#DC2626', bg: 'rgba(220,38,38,0.08)', emoji: '⚖️',
    areaDesc: 'Defensa, acusación, recursos y medidas cautelares',
    acciones: [
      { id: 'penal:escrito-defensa',   label: 'Escrito de defensa',       desc: 'Redacta defensa penal con hechos, fundamentos jurídicos y petición absolutoria.',    icon: '🛡️', time: '5 min' },
      { id: 'penal:querella',          label: 'Querella',                 desc: 'Formula querella por delito con calificación jurídica y diligencias de investigación.',icon: '⚖️', time: '8 min' },
      { id: 'penal:recurso-apelacion', label: 'Recurso de apelación',     desc: 'Recurso contra sentencia penal con motivos de impugnación estructurados.',            icon: '📝', time: '6 min' },
    ],
  },
  {
    area: 'Familia', color: '#BE185D', bg: 'rgba(190,24,93,0.08)', emoji: '👨‍👩‍👧',
    areaDesc: 'Divorcios, medidas paterno-filiales, custodia y pensiones',
    acciones: [
      { id: 'familia:demanda-divorcio',    label: 'Demanda de divorcio',  desc: 'Divorcio contencioso o de mutuo acuerdo con medidas sobre hijos, pensiones y uso del hogar.', icon: '💔', time: '10 min' },
      { id: 'familia:convenio-regulador',  label: 'Convenio regulador',   desc: 'Acuerdo sobre custodia, régimen de visitas, pensión alimenticia y liquidación de bienes.',     icon: '📋', time: '12 min' },
    ],
  },
  {
    area: 'Laboral', color: '#C2410C', bg: 'rgba(194,65,12,0.08)', emoji: '💼',
    areaDesc: 'Despidos, contratos, reclamaciones y relaciones laborales',
    acciones: [
      { id: 'laboral:demanda-despido',    label: 'Demanda por despido',        desc: 'Demanda por despido improcedente o nulo ante el Juzgado de lo Social.',       icon: '💼', time: '8 min' },
      { id: 'laboral:carta-despido',      label: 'Carta de despido',           desc: 'Carta disciplinaria u objetiva con motivación legal sólida y efectos.',        icon: '📩', time: '4 min' },
      { id: 'laboral:revision-contrato',  label: 'Revisar contrato laboral',   desc: 'Detecta cláusulas abusivas, nulas o contrarias al ET y jurisprudencia.',       icon: '🔍', time: '3 min' },
    ],
  },
  {
    area: 'Civil', color: '#1D4ED8', bg: 'rgba(29,78,216,0.08)', emoji: '🏛️',
    areaDesc: 'Reclamaciones dinerarias, incumplimientos y procesos civiles',
    acciones: [
      { id: 'civil:demanda-cantidad',   label: 'Reclamación de cantidad', desc: 'Demanda ordinaria o monitoria para reclamar deuda dineraria con fundamentos.',     icon: '💰', time: '6 min' },
      { id: 'civil:demanda-monitorio',  label: 'Proceso monitorio',       desc: 'Petición monitoria con título ejecutivo, intereses y documentación soporte.',      icon: '📌', time: '4 min' },
    ],
  },
  {
    area: 'Contratos', color: '#4338CA', bg: 'rgba(67,56,202,0.08)', emoji: '📄',
    areaDesc: 'Revisión, redacción y análisis jurídico de contratos',
    acciones: [
      { id: 'commercial-legal:review', label: 'Revisar contrato',   desc: 'Análisis completo: riesgos, cláusulas abusivas, desequilibrios y recomendaciones.', icon: '🔎', time: '2 min' },
      { id: 'commercial-legal:nda',    label: 'Redactar NDA',       desc: 'Acuerdo de confidencialidad bilateral o unilateral con todas las cláusulas.', icon: '🔐', time: '3 min' },
      { id: 'commercial-legal:draft',  label: 'Redactar contrato',  desc: 'Genera contrato a medida desde cero con cláusulas adaptadas al caso.',              icon: '✍️', time: '5 min' },
    ],
  },
  {
    area: 'Administrativo', color: '#0369A1', bg: 'rgba(3,105,161,0.08)', emoji: '🏛️',
    areaDesc: 'Recursos, expedientes sancionadores y silencio administrativo',
    acciones: [
      { id: 'admin:recurso-alzada',       label: 'Recurso de alzada',              desc: 'Recurso ante el órgano superior con fundamentos de nulidad y motivos.',  icon: '🏛️', time: '7 min' },
      { id: 'admin:recurso-contencioso',  label: 'Recurso contencioso-adm.',       desc: 'Demanda contencioso-administrativa ante el TSJA o la Audiencia Nacional.', icon: '⚖️', time: '10 min' },
    ],
  },
  {
    area: 'Inmobiliario', color: '#B45309', bg: 'rgba(180,83,9,0.08)', emoji: '🏠',
    areaDesc: 'Arrendamientos, desahucios y reclamaciones de propietarios',
    acciones: [
      { id: 'inmobiliario:desahucio',      label: 'Demanda de desahucio',       desc: 'Desahucio por impago de renta o expiración del contrato de alquiler.',     icon: '🏠', time: '6 min' },
      { id: 'inmobiliario:arrendamiento',  label: 'Contrato de arrendamiento',  desc: 'Contrato de alquiler residencial o local conforme a la LAU vigente.',      icon: '🔑', time: '4 min' },
    ],
  },
]

const ALL_ACCIONES = GRUPOS.flatMap(g => g.acciones.map(a => ({ ...a, area: g.area, color: g.color })))

// ─── ActionCard ───────────────────────────────────────────────────────────────

function ActionCard({ accion, color, bg, onClick }: {
  accion: Accion; color: string; bg: string; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group text-left w-full rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered ? color + '50' : 'var(--hairline)'}`,
        boxShadow: hovered
          ? `0 4px 20px -4px ${color}30, 0 1px 3px rgba(0,0,0,0.06)`
          : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Accent top line */}
      <div style={{ height: 3, background: color, opacity: hovered ? 1 : 0.5, transition: 'opacity 0.2s' }} />

      <div style={{ padding: '16px 16px 14px' }}>
        {/* Icon + label row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, transition: 'transform 0.15s',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}>
            {accion.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-primary)', lineHeight: 1.3, marginBottom: 4 }}>
              {accion.label}
            </p>
            <p style={{ fontSize: 12, color: 'var(--ink-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {accion.desc}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--hairline-faint)' }}>
          <span style={{ fontSize: 11, color: 'var(--ink-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {accion.time}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: color, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
            Ejecutar →
          </span>
        </div>
      </div>
    </motion.button>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AccionesPage() {
  const [search, setSearch]       = useState('')
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
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ paddingBottom: 40, borderBottom: '1px solid var(--hairline)', marginBottom: 36 }}
      >
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999, marginBottom: 20,
          background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
          fontSize: 11, fontWeight: 600, color: '#7C3AED', letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          ✦ Inteligencia Jurídica · LEXIA
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }}>
          {/* Left: title + subtitle */}
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.15, color: 'var(--ink-primary)', marginBottom: 14 }}>
              Automatiza cualquier{' '}
              <span style={{ background: 'linear-gradient(135deg, #7C3AED, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                tarea jurídica
              </span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ink-secondary)', lineHeight: 1.65, maxWidth: 500 }}>
              Selecciona el tipo de acción, sube el documento y LEXIA lo analiza, redacta y genera en segundos. Sin plantillas vacías. Sin horas de búsqueda.
            </p>

            {/* Stats inline */}
            <div style={{ display: 'flex', gap: 24, marginTop: 28 }}>
              {[
                { v: '20', l: 'acciones jurídicas' },
                { v: '7', l: 'áreas del derecho' },
                { v: '< 5 min', l: 'tiempo medio' },
              ].map(s => (
                <div key={s.l}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-primary)', lineHeight: 1 }}>{s.v}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: how it works */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
            {[
              { num: '01', title: 'Sube el documento', sub: 'PDF, Word o texto plano' },
              { num: '02', title: 'Elige la acción',   sub: 'De las 20 más frecuentes' },
              { num: '03', title: 'LEXIA genera',      sub: 'Resultado en menos de 5 min' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.35 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--surface)', border: '1px solid var(--hairline)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--lime)', fontFamily: 'monospace', minWidth: 20 }}>{step.num}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)', lineHeight: 1.2 }}>{step.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 1 }}>{step.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Buscador ─────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-tertiary)' }}
          width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeWidth="2" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar acción jurídica…"
          style={{
            width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
            borderRadius: 10, fontSize: 13, color: 'var(--ink-primary)',
            background: 'var(--surface)', border: '1px solid var(--hairline)',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* ── Filtros de área ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
        <button
          onClick={() => setActiveArea(null)}
          style={{
            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.15s',
            background: !activeArea ? 'var(--obsidian)' : 'var(--surface)',
            color: !activeArea ? 'var(--lime)' : 'var(--ink-secondary)',
            border: !activeArea ? '1px solid var(--obsidian)' : '1px solid var(--hairline)',
          }}
        >
          Todas las áreas
        </button>
        {GRUPOS.map(g => (
          <button
            key={g.area}
            onClick={() => setActiveArea(activeArea === g.area ? null : g.area)}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s',
              background: activeArea === g.area ? g.bg : 'var(--surface)',
              color: activeArea === g.area ? g.color : 'var(--ink-secondary)',
              border: activeArea === g.area ? `1px solid ${g.color}40` : '1px solid var(--hairline)',
            }}
          >
            {g.emoji} {g.area}
          </button>
        ))}
      </div>

      {/* ── Grid por grupos ───────────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {filteredGrupos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-tertiary)' }}
          >
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 14 }}>No hay acciones para "<strong style={{ color: 'var(--ink-primary)' }}>{search}</strong>"</p>
          </motion.div>
        ) : (
          filteredGrupos.map(grupo => (
            <motion.section
              key={grupo.area}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginBottom: 44 }}
            >
              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: grupo.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                }}>
                  {grupo.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-primary)', lineHeight: 1.2 }}>{grupo.area}</p>
                  <p style={{ fontSize: 12, color: 'var(--ink-tertiary)', lineHeight: 1 }}>{grupo.areaDesc}</p>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                  background: grupo.bg, color: grupo.color,
                }}>
                  {grupo.acciones.length} acciones
                </span>
              </div>

              {/* Cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {grupo.acciones.map(accion => (
                  <ActionCard
                    key={accion.id}
                    accion={accion}
                    color={grupo.color}
                    bg={grupo.bg}
                    onClick={() => setSelectedId(accion.id)}
                  />
                ))}
              </div>
            </motion.section>
          ))
        )}
      </AnimatePresence>

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedId && selectedAccion && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', zIndex: 40 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
              }}
              onClick={e => e.target === e.currentTarget && setSelectedId(null)}
            >
              <div style={{
                width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto',
                borderRadius: 20, background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
              }}>
                {/* Modal header */}
                <div style={{
                  padding: '20px 24px 18px',
                  borderBottom: '1px solid var(--hairline)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{selectedAccion.icon}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-primary)' }}>{selectedAccion.label}</p>
                      <p style={{ fontSize: 12, color: 'var(--ink-tertiary)' }}>LEXIA analizará tu documento y ejecutará la acción</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    style={{
                      width: 28, height: 28, borderRadius: 8, border: '1px solid var(--hairline)',
                      background: 'var(--surface-elevated)', cursor: 'pointer',
                      fontSize: 16, color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
