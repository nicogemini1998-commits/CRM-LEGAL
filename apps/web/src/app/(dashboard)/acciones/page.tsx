'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Icon helpers (lucide-style inline SVG, no extra deps) ────────────────────

type IconProps = { size?: number; color?: string; strokeWidth?: number }

const Icon = {
  Scale: ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
      <path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
    </svg>
  ),
  Heart: ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  ),
  Briefcase: ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>
    </svg>
  ),
  FileText: ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
    </svg>
  ),
  FileSignature: ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 19.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L20 7.5"/><path d="M8 18h1"/>
      <path d="M16.42 12.61a2.1 2.1 0 1 1 2.97 2.97L14 21l-4 1 1-4Z"/>
    </svg>
  ),
  Building: ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>
  ),
  Home: ({ size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Search: ({ size = 16, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  Clock: ({ size = 11, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  X: ({ size = 18, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  ),
  Sparkles: ({ size = 15, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 18.5l1.9-5.9 5.8-1.9-5.8-1.9Z"/>
    </svg>
  ),
  Save: ({ size = 14, color = 'currentColor', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
}

// ─── Field schema per action ──────────────────────────────────────────────────

type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select'
interface ActionField {
  id: string
  label: string
  type: FieldType
  placeholder?: string
  options?: string[]
  required?: boolean
}

const ACTION_FIELDS: Record<string, ActionField[]> = {
  'penal:escrito-defensa': [
    { id: 'acusado', label: 'Acusado', type: 'text', placeholder: 'Nombre y NIF', required: true },
    { id: 'delito', label: 'Delito imputado', type: 'text', placeholder: 'Ej. Estafa (art. 248 CP)', required: true },
    { id: 'hechos', label: 'Hechos de descargo', type: 'textarea', required: true },
    { id: 'pruebas', label: 'Pruebas y testigos', type: 'textarea' },
  ],
  'penal:querella': [
    { id: 'querellante', label: 'Querellante', type: 'text', required: true },
    { id: 'querellado', label: 'Querellado', type: 'text', required: true },
    { id: 'hechos', label: 'Relato fáctico', type: 'textarea', required: true },
    { id: 'calificacion', label: 'Calificación jurídica provisional', type: 'text' },
  ],
  'penal:recurso-apelacion': [
    { id: 'sentencia', label: 'Sentencia recurrida (juzgado, nº y fecha)', type: 'text', required: true },
    { id: 'motivos', label: 'Motivos de impugnación', type: 'textarea', required: true },
  ],
  'familia:demanda-divorcio': [
    { id: 'tipo', label: 'Tipo', type: 'select', options: ['Contencioso', 'Mutuo acuerdo'], required: true },
    { id: 'conyuge1', label: 'Cónyuge 1 (nombre y NIF)', type: 'text', required: true },
    { id: 'conyuge2', label: 'Cónyuge 2 (nombre y NIF)', type: 'text', required: true },
    { id: 'hijos', label: 'Hijos menores', type: 'textarea', placeholder: 'Nombres y fechas de nacimiento' },
    { id: 'pension', label: 'Pensión alimenticia propuesta (€/mes)', type: 'number' },
  ],
  'familia:convenio-regulador': [
    { id: 'conyuge1', label: 'Cónyuge 1', type: 'text', required: true },
    { id: 'conyuge2', label: 'Cónyuge 2', type: 'text', required: true },
    { id: 'custodia', label: 'Régimen de custodia', type: 'select', options: ['Compartida', 'Exclusiva madre', 'Exclusiva padre'], required: true },
    { id: 'visitas', label: 'Régimen de visitas', type: 'textarea' },
    { id: 'pension', label: 'Pensión alimentos (€/mes)', type: 'number' },
  ],
  'laboral:demanda-despido': [
    { id: 'trabajador', label: 'Nombre del trabajador', type: 'text', required: true },
    { id: 'nif', label: 'NIF', type: 'text', required: true },
    { id: 'empresa', label: 'Empresa', type: 'text', required: true },
    { id: 'fecha_despido', label: 'Fecha del despido', type: 'date', required: true },
    { id: 'antiguedad', label: 'Antigüedad (años)', type: 'number', required: true },
    { id: 'salario', label: 'Salario bruto anual (€)', type: 'number', required: true },
    { id: 'motivo', label: 'Motivo invocado por la empresa', type: 'textarea', required: true },
    { id: 'calificacion', label: 'Calificación pretendida', type: 'select', options: ['Improcedente', 'Nulo'] },
  ],
  'laboral:carta-despido': [
    { id: 'empresa', label: 'Empresa', type: 'text', required: true },
    { id: 'trabajador', label: 'Trabajador', type: 'text', required: true },
    { id: 'tipo', label: 'Tipo', type: 'select', options: ['Disciplinario', 'Objetivo'], required: true },
    { id: 'motivos', label: 'Hechos y motivos', type: 'textarea', required: true },
    { id: 'efectos', label: 'Fecha de efectos', type: 'date', required: true },
  ],
  'laboral:revision-contrato': [
    { id: 'foco', label: 'Aspectos a revisar', type: 'textarea', placeholder: 'Cláusulas concretas o preocupaciones' },
  ],
  'civil:demanda-cantidad': [
    { id: 'demandante', label: 'Demandante', type: 'text', required: true },
    { id: 'demandado', label: 'Demandado', type: 'text', required: true },
    { id: 'importe', label: 'Importe reclamado (€)', type: 'number', required: true },
    { id: 'origen', label: 'Origen de la deuda', type: 'textarea', required: true },
  ],
  'civil:demanda-monitorio': [
    { id: 'acreedor', label: 'Acreedor', type: 'text', required: true },
    { id: 'deudor', label: 'Deudor', type: 'text', required: true },
    { id: 'importe', label: 'Importe (€)', type: 'number', required: true },
    { id: 'titulo', label: 'Título / documento soporte', type: 'textarea', required: true },
  ],
  'commercial-legal:review': [
    { id: 'foco', label: '¿Qué quieres analizar especialmente?', type: 'textarea', placeholder: 'Cláusulas de no competencia, penalizaciones, jurisdicción…' },
  ],
  'commercial-legal:nda': [
    { id: 'tipo', label: 'Tipo', type: 'select', options: ['Bilateral', 'Unilateral'], required: true },
    { id: 'parte_divulgante', label: 'Parte divulgante', type: 'text', required: true },
    { id: 'parte_receptora', label: 'Parte receptora', type: 'text', required: true },
    { id: 'objeto', label: 'Información confidencial', type: 'textarea', required: true },
    { id: 'duracion', label: 'Duración (años)', type: 'number', required: true },
  ],
  'commercial-legal:draft': [
    { id: 'tipo', label: 'Tipo de contrato', type: 'text', required: true, placeholder: 'Ej. Prestación de servicios, agencia…' },
    { id: 'partes', label: 'Partes', type: 'textarea', required: true },
    { id: 'objeto', label: 'Objeto y prestaciones', type: 'textarea', required: true },
    { id: 'precio', label: 'Precio / contraprestación (€)', type: 'number' },
  ],
  'admin:recurso-alzada': [
    { id: 'recurrente', label: 'Recurrente', type: 'text', required: true },
    { id: 'organo', label: 'Órgano superior al que se dirige', type: 'text', required: true },
    { id: 'acto', label: 'Acto impugnado (fecha y referencia)', type: 'textarea', required: true },
    { id: 'motivos', label: 'Motivos de impugnación', type: 'textarea', required: true },
  ],
  'admin:recurso-contencioso': [
    { id: 'recurrente', label: 'Recurrente', type: 'text', required: true },
    { id: 'administracion', label: 'Administración demandada', type: 'text', required: true },
    { id: 'acto', label: 'Acto recurrido', type: 'textarea', required: true },
    { id: 'pretension', label: 'Pretensión', type: 'textarea', required: true },
  ],
  'inmobiliario:desahucio': [
    { id: 'arrendador', label: 'Arrendador (demandante)', type: 'text', required: true },
    { id: 'arrendatario', label: 'Arrendatario (demandado)', type: 'text', required: true },
    { id: 'inmueble', label: 'Inmueble', type: 'text', required: true },
    { id: 'rentas', label: 'Rentas adeudadas (€)', type: 'number', required: true },
    { id: 'meses', label: 'Meses de impago', type: 'number', required: true },
  ],
  'inmobiliario:arrendamiento': [
    { id: 'arrendador', label: 'Arrendador', type: 'text', required: true },
    { id: 'arrendatario', label: 'Arrendatario', type: 'text', required: true },
    { id: 'inmueble', label: 'Dirección del inmueble', type: 'text', required: true },
    { id: 'renta', label: 'Renta mensual (€)', type: 'number', required: true },
    { id: 'duracion', label: 'Duración (meses)', type: 'number', required: true },
    { id: 'fianza', label: 'Fianza (mensualidades)', type: 'number', required: true },
  ],
}

const DEFAULT_FIELDS: ActionField[] = [
  { id: 'detalles', label: 'Detalles del caso', type: 'textarea', placeholder: 'Describe los hechos, partes y particularidades…', required: true },
]

// ─── Data ─────────────────────────────────────────────────────────────────────

type AreaKey = 'Penal' | 'Familia' | 'Laboral' | 'Civil' | 'Contratos' | 'Administrativo' | 'Inmobiliario'

interface AreaMeta {
  color: string
  bg: string
  IconCmp: (p: IconProps) => React.ReactElement
  desc: string
}

const AREAS: Record<AreaKey, AreaMeta> = {
  Penal:          { color: '#DC2626', bg: 'rgba(220,38,38,0.10)',  IconCmp: Icon.Scale,         desc: 'Defensa, acusación, recursos y medidas cautelares' },
  Familia:        { color: '#BE185D', bg: 'rgba(190,24,93,0.10)',  IconCmp: Icon.Heart,         desc: 'Divorcios, custodia, pensiones y medidas paterno-filiales' },
  Laboral:        { color: '#1D4ED8', bg: 'rgba(29,78,216,0.10)',  IconCmp: Icon.Briefcase,     desc: 'Despidos, contratos y relaciones laborales' },
  Civil:          { color: '#475569', bg: 'rgba(71,85,105,0.10)',  IconCmp: Icon.FileText,      desc: 'Reclamaciones dinerarias e incumplimientos' },
  Contratos:      { color: '#7C3AED', bg: 'rgba(124,58,237,0.10)', IconCmp: Icon.FileSignature, desc: 'Revisión, redacción y análisis de contratos' },
  Administrativo: { color: '#CA8A04', bg: 'rgba(202,138,4,0.10)',  IconCmp: Icon.Building,      desc: 'Recursos, expedientes y silencio administrativo' },
  Inmobiliario:   { color: '#16A34A', bg: 'rgba(22,163,74,0.10)',  IconCmp: Icon.Home,          desc: 'Arrendamientos, desahucios y propietarios' },
}

interface Accion {
  id: string
  area: AreaKey
  label: string
  desc: string
  time: string
}

const ACCIONES: Accion[] = [
  { id: 'penal:escrito-defensa',     area: 'Penal',          label: 'Escrito de defensa',        desc: 'Defensa penal con hechos, fundamentos jurídicos y petición absolutoria.',  time: '~5 min' },
  { id: 'penal:querella',            area: 'Penal',          label: 'Querella',                  desc: 'Querella con calificación jurídica y diligencias de investigación.',       time: '~8 min' },
  { id: 'penal:recurso-apelacion',   area: 'Penal',          label: 'Recurso de apelación',      desc: 'Recurso contra sentencia penal con motivos de impugnación.',               time: '~6 min' },
  { id: 'familia:demanda-divorcio',  area: 'Familia',        label: 'Demanda de divorcio',       desc: 'Divorcio contencioso o de mutuo acuerdo con medidas completas.',           time: '~10 min' },
  { id: 'familia:convenio-regulador',area: 'Familia',        label: 'Convenio regulador',        desc: 'Acuerdo sobre custodia, visitas, pensiones y liquidación de bienes.',      time: '~12 min' },
  { id: 'laboral:demanda-despido',   area: 'Laboral',        label: 'Demanda por despido',       desc: 'Demanda por despido improcedente o nulo ante el Juzgado de lo Social.',    time: '~8 min' },
  { id: 'laboral:carta-despido',     area: 'Laboral',        label: 'Carta de despido',          desc: 'Carta disciplinaria u objetiva con motivación legal sólida.',              time: '~4 min' },
  { id: 'laboral:revision-contrato', area: 'Laboral',        label: 'Revisar contrato laboral',  desc: 'Detecta cláusulas abusivas, nulas o contrarias al ET.',                    time: '~3 min' },
  { id: 'civil:demanda-cantidad',    area: 'Civil',          label: 'Reclamación de cantidad',   desc: 'Demanda ordinaria o monitoria para reclamar deuda dineraria.',             time: '~6 min' },
  { id: 'civil:demanda-monitorio',   area: 'Civil',          label: 'Proceso monitorio',         desc: 'Petición monitoria con título ejecutivo e intereses.',                     time: '~4 min' },
  { id: 'commercial-legal:review',   area: 'Contratos',      label: 'Revisar contrato',          desc: 'Análisis completo: riesgos, cláusulas abusivas y recomendaciones.',        time: '~2 min' },
  { id: 'commercial-legal:nda',      area: 'Contratos',      label: 'Redactar NDA',              desc: 'Acuerdo de confidencialidad con todas las cláusulas estándar.',            time: '~3 min' },
  { id: 'commercial-legal:draft',    area: 'Contratos',      label: 'Redactar contrato',         desc: 'Contrato a medida desde cero con cláusulas adaptadas.',                    time: '~5 min' },
  { id: 'admin:recurso-alzada',      area: 'Administrativo', label: 'Recurso de alzada',         desc: 'Recurso ante órgano superior con fundamentos de nulidad.',                 time: '~7 min' },
  { id: 'admin:recurso-contencioso', area: 'Administrativo', label: 'Recurso contencioso-adm.',  desc: 'Demanda contencioso-administrativa ante TSJ o Audiencia Nacional.',        time: '~10 min' },
  { id: 'inmobiliario:desahucio',    area: 'Inmobiliario',   label: 'Demanda de desahucio',      desc: 'Desahucio por impago de renta o expiración del contrato.',                 time: '~6 min' },
  { id: 'inmobiliario:arrendamiento',area: 'Inmobiliario',   label: 'Contrato de arrendamiento', desc: 'Contrato de alquiler residencial o local conforme a la LAU.',              time: '~4 min' },
]

const DEMO_CLIENTS_LITE = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'Construcciones Mediterráneo S.L.' },
  { id: 'c2000000-0000-0000-0000-000000000002', name: 'María García Pérez' },
  { id: 'c3000000-0000-0000-0000-000000000003', name: 'TechNova Innovations S.A.' },
  { id: 'c4000000-0000-0000-0000-000000000004', name: 'Carlos Ruiz Delgado' },
  { id: 'c5000000-0000-0000-0000-000000000005', name: 'Retail Boutique Levante S.L.' },
  { id: 'c6000000-0000-0000-0000-000000000006', name: 'Ana López Martín' },
]

// ─── ActionCard ───────────────────────────────────────────────────────────────

function ActionCard({ accion, onClick }: { accion: Accion; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const meta = AREAS[accion.area]
  const IconCmp = meta.IconCmp
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group text-left w-full rounded-2xl overflow-hidden"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered ? '#C4B5FD' : 'var(--hairline)'}`,
        boxShadow: hovered
          ? '0 10px 32px -8px rgba(124,58,237,0.28), 0 2px 6px rgba(0,0,0,0.05)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px) scale(1.015)' : 'none',
        transition: 'transform 220ms cubic-bezier(0.16,1,0.3,1), box-shadow 220ms, border-color 220ms',
      }}
    >
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: meta.bg, color: meta.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
          }}>
            <IconCmp size={22} color={meta.color} />
          </div>
          <span style={{
            fontSize: 10.5, fontWeight: 600, color: 'var(--ink-tertiary)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 999,
            background: 'var(--surface-elevated)', border: '1px solid var(--hairline-faint)',
          }}>
            <Icon.Clock size={10} /> {accion.time}
          </span>
        </div>

        <p style={{ marginTop: 14, fontSize: 14.5, fontWeight: 600, color: 'var(--ink-primary)', lineHeight: 1.3 }}>
          {accion.label}
        </p>
        <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--ink-secondary)', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {accion.desc}
        </p>

        <div style={{
          marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--hairline-faint)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: meta.color, letterSpacing: '0.02em' }}>
            {accion.area}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 600, color: '#7C3AED',
            opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(-4px)',
            transition: 'all 180ms',
          }}>
            Abrir →
          </span>
        </div>
      </div>
    </motion.button>
  )
}

// ─── Centered Modal Panel ─────────────────────────────────────────────────────

const BRAND = '#8F7EE9'
const BRAND_DARK = '#7C6BD6'

const fieldLabelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)', marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13,
  color: 'var(--ink-primary)', background: 'var(--surface-elevated)',
  border: '1px solid var(--hairline)', outline: 'none', boxSizing: 'border-box',
}

function ActionPanel({ accion, onClose }: { accion: Accion; onClose: () => void }) {
  const meta = AREAS[accion.area]
  const IconCmp = meta.IconCmp
  const fields = ACTION_FIELDS[accion.id] ?? DEFAULT_FIELDS

  const [values, setValues] = useState<Record<string, string>>({})
  const [clientId, setClientId] = useState('')
  const [caseId, setCaseId] = useState('')
  const [phase, setPhase] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [stream, setStream] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const streamRef = useRef<HTMLDivElement>(null)

  // ESC + body scroll lock
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  function buildDocumentMarkdown(): string {
    const lines = [`# ${accion.label}`, `Área: ${accion.area}`, '']
    if (clientId) {
      const cl = DEMO_CLIENTS_LITE.find(c => c.id === clientId)
      if (cl) lines.push(`Cliente: ${cl.name}`)
    }
    if (caseId) lines.push(`Caso vinculado: ${caseId}`)
    lines.push('', '## Datos del caso')
    fields.forEach(f => {
      const v = values[f.id]
      if (v) lines.push(`- **${f.label}:** ${v}`)
    })
    return lines.join('\n')
  }

  async function execute() {
    setPhase('running'); setStream(''); setErrorMsg(''); setSaved(false)
    try {
      const res = await fetch('/api/skills/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: accion.id,
          documentMarkdown: buildDocumentMarkdown(),
          caseId: caseId || undefined,
        }),
      })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      let finished = false
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'text') {
              full += data.delta
              setStream(full)
              streamRef.current?.scrollTo({ top: 1e9 })
            }
            if (data.type === 'error') throw new Error(data.message)
            if (data.type === 'done') { setPhase('done'); finished = true }
          } catch {}
        }
      }
      if (!finished && full) setPhase('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error inesperado')
      setPhase('error')
    }
  }

  async function saveAsDocument() {
    if (!stream) return
    setSaving(true)
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: accion.label,
          content: stream,
          document_type: 'generated',
          client_id: clientId || undefined,
          case_id: caseId || undefined,
        }),
      }).catch(() => null)
      setSaved(true)
    } finally { setSaving(false) }
  }

  async function copyOutput() {
    if (!stream) return
    try {
      await navigator.clipboard.writeText(stream)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  function regenerate() {
    setPhase('idle'); setStream(''); setErrorMsg(''); setSaved(false); setCopied(false)
  }

  const isStreaming = phase === 'running' || phase === 'done' || (phase === 'error' && stream.length > 0)
  const docTypeLabel =
    accion.area === 'Contratos' ? 'Contrato' :
    accion.area === 'Familia' || accion.area === 'Civil' || accion.area === 'Inmobiliario' ? 'Demanda / escrito' :
    accion.area === 'Laboral' ? 'Escrito laboral' :
    accion.area === 'Penal' ? 'Escrito penal' :
    accion.area === 'Administrativo' ? 'Recurso administrativo' : 'Documento'

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,15,20,0.60)', backdropFilter: 'blur(6px)',
          zIndex: 60,
        }}
      />
      {/* Centered modal */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 61,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, pointerEvents: 'none',
        }}
      >
      <motion.div
        role="dialog" aria-modal="true"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={{
          pointerEvents: 'auto',
          width: '100%', maxWidth: isStreaming ? 980 : 768,
          maxHeight: '90vh',
          background: 'var(--surface)',
          borderRadius: 20,
          boxShadow: '0 32px 80px -12px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.10)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid var(--hairline)',
          transition: 'max-width 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 32px 20px',
          borderBottom: '1px solid var(--hairline)',
          display: 'flex', alignItems: 'flex-start', gap: 16,
          flexShrink: 0,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: meta.bg, color: meta.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconCmp size={26} color={meta.color} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {accion.area}
            </p>
            <h2 className="font-display" style={{
              fontSize: 24, fontWeight: 600, color: 'var(--ink-primary)',
              lineHeight: 1.2, marginTop: 4, letterSpacing: '-0.01em',
            }}>
              {accion.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              border: '1px solid var(--hairline)', background: 'var(--surface-elevated)',
              cursor: 'pointer', color: 'var(--ink-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon.X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflow: 'hidden',
          display: 'flex', flexDirection: isStreaming ? 'row' : 'column',
        }}>
          {/* Form side */}
          <div style={{
            flex: isStreaming ? '0 0 42%' : '1 1 auto',
            padding: '24px 32px', overflowY: 'auto',
            borderRight: isStreaming ? '1px solid var(--hairline)' : 'none',
          }}>
            {!isStreaming && (
              <>
                <p style={{ fontSize: 14, color: 'var(--ink-secondary)', lineHeight: 1.6, marginBottom: 18 }}>
                  {accion.desc}
                </p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                    background: meta.bg, color: meta.color,
                  }}>
                    <Icon.FileText size={12} color={meta.color} /> {docTypeLabel}
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                    background: 'var(--surface-elevated)', color: 'var(--ink-tertiary)',
                    border: '1px solid var(--hairline-faint)',
                  }}>
                    <Icon.Clock size={11} /> {accion.time}
                  </span>
                </div>
              </>
            )}

            <p style={{
              fontSize: 11, fontWeight: 700, color: 'var(--ink-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
            }}>Sobre quién</p>
            <div style={{ display: 'grid', gridTemplateColumns: isStreaming ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 22 }}>
              <div>
                <label style={fieldLabelStyle}>Cliente</label>
                <select value={clientId} onChange={e => setClientId(e.target.value)} style={inputStyle} disabled={isStreaming}>
                  <option value=''>Sin cliente</option>
                  {DEMO_CLIENTS_LITE.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={fieldLabelStyle}>Caso vinculado (opcional)</label>
                <input type="text" value={caseId} onChange={e => setCaseId(e.target.value)}
                  placeholder="ID o referencia" style={inputStyle} disabled={isStreaming} />
              </div>
            </div>

            <p style={{
              fontSize: 11, fontWeight: 700, color: 'var(--ink-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
            }}>Datos del documento</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {fields.map(f => (
                <div key={f.id}>
                  <label style={fieldLabelStyle}>
                    {f.label}{f.required && <span style={{ color: '#DC2626', marginLeft: 4 }}>*</span>}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      value={values[f.id] ?? ''} rows={3} disabled={isStreaming}
                      onChange={e => setValues(v => ({ ...v, [f.id]: e.target.value }))}
                      placeholder={f.placeholder} style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
                    />
                  ) : f.type === 'select' ? (
                    <select
                      value={values[f.id] ?? ''} disabled={isStreaming}
                      onChange={e => setValues(v => ({ ...v, [f.id]: e.target.value }))}
                      style={inputStyle}
                    >
                      <option value=''>Seleccionar…</option>
                      {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type} disabled={isStreaming}
                      value={values[f.id] ?? ''}
                      onChange={e => setValues(v => ({ ...v, [f.id]: e.target.value }))}
                      placeholder={f.placeholder} style={inputStyle}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stream side */}
          {isStreaming && (
            <div style={{
              flex: '1 1 auto', padding: '24px 32px',
              display: 'flex', flexDirection: 'column', minWidth: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{
                  width: 9, height: 9, borderRadius: 999,
                  background: phase === 'running' ? BRAND : phase === 'error' ? '#DC2626' : '#16A34A',
                  animation: phase === 'running' ? 'pulse 1.4s infinite' : 'none',
                }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-primary)' }}>
                  {phase === 'running' ? 'LEXIA generando…' : phase === 'error' ? 'Error en la generación' : 'Documento generado'}
                </p>
              </div>

              <div
                ref={streamRef}
                style={{
                  flex: 1, overflowY: 'auto',
                  borderRadius: 14, padding: '20px 22px',
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--hairline)',
                  fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink-primary)',
                  whiteSpace: 'pre-wrap', minHeight: 240,
                }}
              >
                {stream || (phase === 'running' ? <span style={{ color: 'var(--ink-tertiary)' }}>…</span> : '')}
                {phase === 'running' && stream && (
                  <span style={{
                    display: 'inline-block', width: 8, height: 16, marginLeft: 2,
                    background: BRAND, verticalAlign: 'middle',
                    animation: 'blink 1s steps(2) infinite',
                  }} />
                )}
              </div>

              {phase === 'error' && (
                <div style={{
                  marginTop: 12, padding: 12, borderRadius: 10,
                  background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
                  fontSize: 12.5, color: '#B91C1C',
                }}>{errorMsg}</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--hairline)',
          display: 'flex', gap: 10, background: 'var(--surface)',
          justifyContent: 'flex-end', alignItems: 'center', flexShrink: 0,
        }}>
          {phase !== 'done' ? (
            <>
              <button
                onClick={onClose}
                style={{
                  padding: '11px 18px', borderRadius: 12, cursor: 'pointer',
                  fontSize: 13.5, fontWeight: 600,
                  background: 'transparent', color: 'var(--ink-secondary)',
                  border: '1px solid var(--hairline)',
                }}
              >Cancelar</button>
              <button
                onClick={execute}
                disabled={phase === 'running'}
                style={{
                  padding: '11px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  fontSize: 13.5, fontWeight: 700, color: '#fff',
                  background: BRAND,
                  boxShadow: '0 6px 18px rgba(143,126,233,0.35)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  opacity: phase === 'running' ? 0.7 : 1,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (phase !== 'running') e.currentTarget.style.background = BRAND_DARK }}
                onMouseLeave={e => { if (phase !== 'running') e.currentTarget.style.background = BRAND }}
              >
                <Icon.Sparkles size={15} color="#fff" />
                {phase === 'running' ? 'Generando…' : 'Generar con LEXIA'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={regenerate}
                style={{
                  padding: '10px 16px', borderRadius: 12, cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: 'transparent', color: 'var(--ink-secondary)',
                  border: '1px solid var(--hairline)',
                }}
              >Generar otra vez</button>
              <button
                onClick={copyOutput}
                style={{
                  padding: '10px 16px', borderRadius: 12, cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: 'var(--surface-elevated)', color: 'var(--ink-primary)',
                  border: '1px solid var(--hairline)',
                }}
              >{copied ? 'Copiado ✓' : 'Copiar'}</button>
              <button
                onClick={saveAsDocument}
                disabled={saving || saved}
                style={{
                  padding: '10px 18px', borderRadius: 12, cursor: 'pointer', border: 'none',
                  fontSize: 13, fontWeight: 700, color: '#fff',
                  background: BRAND,
                  boxShadow: '0 6px 18px rgba(143,126,233,0.35)',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!saving && !saved) e.currentTarget.style.background = BRAND_DARK }}
                onMouseLeave={e => { if (!saving && !saved) e.currentTarget.style.background = BRAND }}
              >
                <Icon.Save size={14} color="#fff" />
                {saved ? 'Guardado' : saving ? 'Guardando…' : 'Guardar como documento'}
              </button>
            </>
          )}
        </div>
      </motion.div>
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccionesPage() {
  const [search, setSearch] = useState('')
  const [activeArea, setActiveArea] = useState<AreaKey | 'Todas'>('Todas')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return ACCIONES.filter(a =>
      (activeArea === 'Todas' || a.area === activeArea) &&
      (!q || a.label.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q))
    )
  }, [search, activeArea])

  const counts = useMemo(() => {
    const c: Record<string, number> = { Todas: ACCIONES.length }
    ACCIONES.forEach(a => { c[a.area] = (c[a.area] ?? 0) + 1 })
    return c
  }, [])

  const selected = ACCIONES.find(a => a.id === selectedId) ?? null

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80 }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999, marginBottom: 14,
          background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.20)',
          fontSize: 11, fontWeight: 600, color: '#7C3AED',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          <Icon.Sparkles size={11} /> Inteligencia jurídica · LEXIA
        </div>
        <h1 className="font-display" style={{ fontSize: 40, lineHeight: 1.1, color: 'var(--ink-primary)', fontWeight: 500, letterSpacing: '-0.02em' }}>
          Acciones jurídicas
        </h1>
        <p style={{ marginTop: 10, fontSize: 15, color: 'var(--ink-secondary)', maxWidth: 640, lineHeight: 1.6 }}>
          80+ plantillas IA listas para usar. Elige la acción, rellena los datos y LEXIA redacta el documento.
        </p>
      </motion.div>

      <div style={{ position: 'relative', marginBottom: 18 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-tertiary)' }}>
          <Icon.Search size={16} />
        </span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar acción por nombre o palabra clave…"
          style={{
            width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, fontSize: 14,
            color: 'var(--ink-primary)', background: 'var(--surface)',
            border: '1px solid var(--hairline)', outline: 'none', boxSizing: 'border-box',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        />
      </div>

      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28,
        padding: 8, borderRadius: 14,
        background: 'var(--surface)', border: '1px solid var(--hairline)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}>
        {(['Todas', ...Object.keys(AREAS)] as (AreaKey | 'Todas')[]).map(k => {
          const isActive = activeArea === k
          const meta = k === 'Todas' ? null : AREAS[k as AreaKey]
          return (
            <button
              key={k}
              onClick={() => setActiveArea(k)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                cursor: 'pointer', border: '1px solid transparent',
                background: isActive
                  ? (meta ? meta.bg : 'rgba(124,58,237,0.10)')
                  : 'transparent',
                color: isActive ? (meta ? meta.color : '#7C3AED') : 'var(--ink-secondary)',
                borderColor: isActive ? (meta ? `${meta.color}40` : 'rgba(124,58,237,0.25)') : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {k}
              <span style={{
                fontSize: 10.5, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
                background: isActive ? 'rgba(255,255,255,0.6)' : 'var(--surface-elevated)',
                color: isActive ? (meta ? meta.color : '#7C3AED') : 'var(--ink-tertiary)',
              }}>{counts[k] ?? 0}</span>
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-tertiary)' }}
          >
            <p style={{ fontSize: 30, marginBottom: 10 }}>🔍</p>
            <p style={{ fontSize: 14 }}>No hay acciones para «<strong style={{ color: 'var(--ink-primary)' }}>{search}</strong>».</p>
          </motion.div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}>
            {filtered.map(a => (
              <ActionCard key={a.id} accion={a} onClick={() => setSelectedId(a.id)} />
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && <ActionPanel accion={selected} onClose={() => setSelectedId(null)} />}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
      `}</style>
    </div>
  )
}
