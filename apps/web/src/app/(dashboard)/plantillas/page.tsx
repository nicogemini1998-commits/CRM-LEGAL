'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const BRAND = '#8F7EE9'
const BRAND_DARK = '#7C6BD6'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TemplateField {
  id: string
  label: string
  type: 'text' | 'date' | 'number' | 'select' | 'textarea'
  placeholder?: string
  options?: string[]
  required: boolean
}

interface Template {
  id: string
  title: string
  category: string
  description: string
  pages: number
  complexity: 'Básico' | 'Intermedio' | 'Avanzado'
  fields: TemplateField[]
  popular?: boolean
  isNew?: boolean
  isUser?: boolean
  law?: string
  durationMin?: number
}

// ─── Category config ──────────────────────────────────────────────────────────

const CAT: Record<string, { color: string; bg: string; emoji: string; desc: string }> = {
  Contratos:      { color: '#4338CA', bg: 'rgba(67,56,202,0.08)',   emoji: '📄', desc: 'Compraventas, arrendamientos y servicios' },
  Laboral:        { color: '#C2410C', bg: 'rgba(194,65,12,0.08)',   emoji: '💼', desc: 'Contratos, cartas y liquidaciones' },
  Mercantil:      { color: '#6D28D9', bg: 'rgba(109,40,217,0.08)', emoji: '🏢', desc: 'Sociedades, pactos y poderes' },
  Civil:          { color: '#1D4ED8', bg: 'rgba(29,78,216,0.08)',   emoji: '⚖️', desc: 'Reclamaciones y documentos civiles' },
  Penal:          { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',   emoji: '🔒', desc: 'Denuncias, querellas y defensas' },
  Administrativo: { color: '#0369A1', bg: 'rgba(3,105,161,0.08)',   emoji: '🏛️', desc: 'Recursos y expedientes' },
  Inmobiliario:   { color: '#B45309', bg: 'rgba(180,83,9,0.08)',    emoji: '🏠', desc: 'Arrendamientos, arras y desahucios' },
}

const COMPLEXITY_COLOR: Record<string, string> = {
  Básico: '#16A34A', Intermedio: '#D97706', Avanzado: '#DC2626',
}

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES: Template[] = [
  // CONTRATOS
  { id: 'nda', title: 'Acuerdo de confidencialidad (NDA)', category: 'Contratos', pages: 3, complexity: 'Básico', popular: true, law: 'CC art. 1255',
    description: 'NDA bilateral o unilateral con objeto, duración, obligaciones y penalizaciones por incumplimiento.',
    fields: [
      { id: 'parte_divulgante', label: 'Parte divulgante', type: 'text', placeholder: 'Empresa SA', required: true },
      { id: 'parte_receptora', label: 'Parte receptora', type: 'text', placeholder: 'Colaborador SL', required: true },
      { id: 'objeto', label: 'Información confidencial', type: 'textarea', placeholder: 'Tecnología, datos de clientes, procesos internos…', required: true },
      { id: 'duracion', label: 'Duración (años)', type: 'number', placeholder: '3', required: true },
      { id: 'jurisdiccion', label: 'Jurisdicción', type: 'select', options: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'], required: true },
    ],
  },
  { id: 'prestacion-servicios', title: 'Contrato de prestación de servicios', category: 'Contratos', pages: 5, complexity: 'Básico', popular: true,
    description: 'Contrato mercantil de servicios con precio, plazos, propiedad intelectual y cláusulas de penalización.',
    fields: [
      { id: 'proveedor', label: 'Proveedor del servicio', type: 'text', placeholder: 'Proveedor SL', required: true },
      { id: 'cliente', label: 'Cliente', type: 'text', placeholder: 'Cliente SA', required: true },
      { id: 'descripcion_servicio', label: 'Descripción del servicio', type: 'textarea', placeholder: 'Desarrollo de software, consultoría técnica…', required: true },
      { id: 'precio', label: 'Precio total (€)', type: 'number', placeholder: '5000', required: true },
      { id: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', required: true },
      { id: 'duracion_meses', label: 'Duración (meses)', type: 'number', placeholder: '6', required: true },
    ],
  },
  { id: 'compraventa-inmueble', title: 'Contrato de compraventa de inmueble', category: 'Contratos', pages: 8, complexity: 'Intermedio', popular: true, law: 'CC art. 1445',
    description: 'Compraventa de bien inmueble con precio, forma de pago, cargas y obligaciones de ambas partes.',
    fields: [
      { id: 'vendedor', label: 'Vendedor (nombre y NIF)', type: 'text', placeholder: 'Juan García López · 12345678A', required: true },
      { id: 'comprador', label: 'Comprador (nombre y NIF)', type: 'text', placeholder: 'María Pérez Ruiz · 87654321B', required: true },
      { id: 'descripcion_inmueble', label: 'Descripción del inmueble', type: 'textarea', placeholder: 'Piso 3º B, c/ Gran Vía 45, Madrid, ref. catastral…', required: true },
      { id: 'precio', label: 'Precio (€)', type: 'number', placeholder: '250000', required: true },
      { id: 'forma_pago', label: 'Forma de pago', type: 'select', options: ['Al contado', 'Con financiación hipotecaria', 'Pago aplazado'], required: true },
      { id: 'fecha_escritura', label: 'Fecha prevista escritura', type: 'date', required: true },
    ],
  },
  { id: 'arrendamiento-vivienda', title: 'Contrato de arrendamiento de vivienda', category: 'Contratos', pages: 6, complexity: 'Básico', popular: true, law: 'LAU art. 1',
    description: 'Contrato de alquiler residencial conforme a la LAU con fianza, inventario y cláusulas estándar.',
    fields: [
      { id: 'arrendador', label: 'Arrendador', type: 'text', placeholder: 'Nombre del propietario', required: true },
      { id: 'arrendatario', label: 'Arrendatario', type: 'text', placeholder: 'Nombre del inquilino', required: true },
      { id: 'direccion', label: 'Dirección del inmueble', type: 'text', placeholder: 'C/ Mayor 10, 2º A, Madrid', required: true },
      { id: 'renta', label: 'Renta mensual (€)', type: 'number', placeholder: '900', required: true },
      { id: 'duracion', label: 'Duración (meses)', type: 'number', placeholder: '12', required: true },
      { id: 'fianza', label: 'Fianza (mensualidades)', type: 'number', placeholder: '1', required: true },
      { id: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', required: true },
    ],
  },
  // LABORAL
  { id: 'carta-despido-disciplinario', title: 'Carta de despido disciplinario', category: 'Laboral', pages: 2, complexity: 'Básico', popular: true, law: 'ET art. 54',
    description: 'Carta de despido por causas disciplinarias con descripción detallada de hechos y fecha de efectos.',
    fields: [
      { id: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Empresa SA', required: true },
      { id: 'trabajador', label: 'Trabajador (nombre y NIF)', type: 'text', placeholder: 'Ana López · 12345678A', required: true },
      { id: 'categoria', label: 'Categoría profesional', type: 'text', placeholder: 'Técnico de ventas', required: true },
      { id: 'motivos', label: 'Hechos y motivos del despido', type: 'textarea', placeholder: 'Describa los incumplimientos contractuales…', required: true },
      { id: 'fecha_efectos', label: 'Fecha de efectos', type: 'date', required: true },
    ],
  },
  { id: 'contrato-indefinido', title: 'Contrato de trabajo indefinido', category: 'Laboral', pages: 4, complexity: 'Básico', popular: true, law: 'ET art. 15',
    description: 'Contrato indefinido ordinario con jornada, salario, categoría y cláusulas adicionales de confidencialidad.',
    fields: [
      { id: 'empresa', label: 'Empresa empleadora', type: 'text', required: true },
      { id: 'trabajador', label: 'Trabajador', type: 'text', required: true },
      { id: 'puesto', label: 'Puesto de trabajo', type: 'text', placeholder: 'Desarrollador Senior', required: true },
      { id: 'salario_anual', label: 'Salario bruto anual (€)', type: 'number', placeholder: '40000', required: true },
      { id: 'jornada', label: 'Jornada', type: 'select', options: ['Completa (40h/semana)', 'Parcial 20h', 'Parcial 30h'], required: true },
      { id: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', required: true },
    ],
  },
  { id: 'finiquito', title: 'Finiquito y liquidación de haberes', category: 'Laboral', pages: 2, complexity: 'Básico', law: 'ET art. 49',
    description: 'Documento de liquidación de haberes pendientes, vacaciones no disfrutadas y partes proporcionales.',
    fields: [
      { id: 'empresa', label: 'Empresa', type: 'text', required: true },
      { id: 'trabajador', label: 'Trabajador', type: 'text', required: true },
      { id: 'fecha_baja', label: 'Fecha de baja', type: 'date', required: true },
      { id: 'dias_vacaciones', label: 'Días vacaciones pendientes', type: 'number', placeholder: '5', required: true },
      { id: 'total_importe', label: 'Importe total bruto (€)', type: 'number', placeholder: '2500', required: true },
    ],
  },
  // MERCANTIL
  { id: 'estatutos-sl', title: 'Estatutos de sociedad limitada', category: 'Mercantil', pages: 12, complexity: 'Avanzado', law: 'LSC',
    description: 'Estatutos completos para constitución de SL con órganos, capital, transmisión de participaciones y disolución.',
    fields: [
      { id: 'denominacion', label: 'Denominación social', type: 'text', placeholder: 'Mi Empresa SL', required: true },
      { id: 'objeto_social', label: 'Objeto social', type: 'textarea', placeholder: 'Desarrollo de software, consultoría tecnológica…', required: true },
      { id: 'capital_social', label: 'Capital social (€)', type: 'number', placeholder: '3000', required: true },
      { id: 'domicilio', label: 'Domicilio social', type: 'text', placeholder: 'C/ Velázquez 10, Madrid', required: true },
    ],
  },
  { id: 'pacto-socios', title: 'Pacto de socios', category: 'Mercantil', pages: 10, complexity: 'Avanzado', popular: true,
    description: 'Pacto parasocial con lock-up, drag-along, tag-along, derechos de información y régimen de salida.',
    fields: [
      { id: 'empresa', label: 'Nombre de la sociedad', type: 'text', required: true },
      { id: 'socios', label: 'Socios y participaciones', type: 'textarea', placeholder: 'Socio A (40%), Socio B (60%)', required: true },
      { id: 'lock_up_meses', label: 'Período lock-up (meses)', type: 'number', placeholder: '24', required: false },
    ],
  },
  { id: 'poder-pleitos', title: 'Poder para pleitos', category: 'Mercantil', pages: 2, complexity: 'Básico',
    description: 'Poder notarial de representación procesal ante juzgados, tribunales y organismos públicos españoles.',
    fields: [
      { id: 'poderdante', label: 'Poderdante (nombre y NIF)', type: 'text', required: true },
      { id: 'apoderado', label: 'Abogado/Procurador apoderado', type: 'text', required: true },
      { id: 'objeto', label: 'Objeto del poder', type: 'textarea', placeholder: 'Representación en procedimiento sobre…', required: true },
    ],
  },
  // CIVIL
  { id: 'demanda-cantidad', title: 'Demanda de reclamación de cantidad', category: 'Civil', pages: 5, complexity: 'Intermedio', law: 'LEC art. 248',
    description: 'Demanda ordinaria o verbal para reclamar deuda dineraria con fundamentos jurídicos y petición de intereses.',
    fields: [
      { id: 'demandante', label: 'Demandante', type: 'text', required: true },
      { id: 'demandado', label: 'Demandado', type: 'text', required: true },
      { id: 'importe', label: 'Importe reclamado (€)', type: 'number', required: true },
      { id: 'origen_deuda', label: 'Origen de la deuda', type: 'textarea', placeholder: 'Facturas impagadas, préstamo, daños…', required: true },
    ],
  },
  { id: 'reconocimiento-deuda', title: 'Reconocimiento de deuda', category: 'Civil', pages: 2, complexity: 'Básico', law: 'CC art. 1217',
    description: 'Documento privado de reconocimiento de deuda con plan de pago, intereses y garantías.',
    fields: [
      { id: 'deudor', label: 'Deudor (nombre y NIF)', type: 'text', required: true },
      { id: 'acreedor', label: 'Acreedor (nombre y NIF)', type: 'text', required: true },
      { id: 'importe', label: 'Importe de la deuda (€)', type: 'number', required: true },
      { id: 'plan_pago', label: 'Plan de pago acordado', type: 'textarea', placeholder: '500 €/mes durante 12 meses a partir del…', required: true },
    ],
  },
  // PENAL
  { id: 'denuncia-penal', title: 'Denuncia penal', category: 'Penal', pages: 3, complexity: 'Básico', law: 'LECrim art. 265',
    description: 'Denuncia ante Juzgado o Fiscalía con narración de hechos, calificación y diligencias solicitadas.',
    fields: [
      { id: 'denunciante', label: 'Denunciante (nombre y NIF)', type: 'text', required: true },
      { id: 'denunciado', label: 'Denunciado (si se conoce)', type: 'text', placeholder: 'Desconocido / nombre', required: false },
      { id: 'hechos', label: 'Narración de los hechos', type: 'textarea', required: true },
      { id: 'delito', label: 'Tipo de delito', type: 'select', options: ['Estafa', 'Robo', 'Lesiones', 'Amenazas', 'Violencia de género', 'Otro'], required: true },
    ],
  },
  { id: 'querella', title: 'Querella por estafa', category: 'Penal', pages: 6, complexity: 'Avanzado', popular: true, law: 'CP art. 248',
    description: 'Querella con calificación jurídica completa, pruebas documentales y solicitud de medidas cautelares.',
    fields: [
      { id: 'querellante', label: 'Querellante', type: 'text', required: true },
      { id: 'querellado', label: 'Querellado', type: 'text', required: true },
      { id: 'hechos', label: 'Hechos constitutivos de estafa', type: 'textarea', required: true },
      { id: 'importe_defraudado', label: 'Importe defraudado (€)', type: 'number', required: true },
    ],
  },
  // ADMINISTRATIVO
  { id: 'recurso-alzada', title: 'Recurso de alzada', category: 'Administrativo', pages: 4, complexity: 'Intermedio', popular: true, law: 'LPAC art. 121',
    description: 'Recurso administrativo ante el órgano superior con motivos jurídicos y petición de nulidad o revocación.',
    fields: [
      { id: 'recurrente', label: 'Recurrente (nombre y NIF)', type: 'text', required: true },
      { id: 'organo', label: 'Órgano al que se dirige', type: 'text', placeholder: 'Dirección General de…', required: true },
      { id: 'acto_impugnado', label: 'Acto administrativo impugnado', type: 'textarea', placeholder: 'Resolución de fecha…', required: true },
      { id: 'fecha_notificacion', label: 'Fecha de notificación', type: 'date', required: true },
      { id: 'motivos', label: 'Motivos de impugnación', type: 'textarea', required: true },
    ],
  },
  { id: 'alegaciones-sancionador', title: 'Alegaciones a expediente sancionador', category: 'Administrativo', pages: 4, complexity: 'Intermedio', law: 'LPAC art. 82',
    description: 'Escrito de alegaciones con solicitud de prueba y argumentos de defensa en procedimiento sancionador.',
    fields: [
      { id: 'interesado', label: 'Interesado', type: 'text', required: true },
      { id: 'expediente', label: 'Nº de expediente', type: 'text', required: true },
      { id: 'organo', label: 'Órgano instructor', type: 'text', required: true },
      { id: 'alegaciones', label: 'Alegaciones', type: 'textarea', required: true },
    ],
  },
  { id: 'recurso-contencioso', title: 'Recurso contencioso-administrativo', category: 'Administrativo', pages: 8, complexity: 'Avanzado', law: 'LJCA art. 46',
    description: 'Demanda contencioso-administrativa ante el TSJA o la Audiencia Nacional con súplica de nulidad.',
    fields: [
      { id: 'recurrente', label: 'Recurrente', type: 'text', required: true },
      { id: 'administracion', label: 'Administración demandada', type: 'text', required: true },
      { id: 'acto_impugnado', label: 'Acto impugnado', type: 'textarea', required: true },
      { id: 'fecha_notificacion', label: 'Fecha de notificación', type: 'date', required: true },
      { id: 'pretension', label: 'Pretensión', type: 'textarea', placeholder: 'Nulidad del acto / Reconocimiento del derecho a…', required: true },
    ],
  },
  // INMOBILIARIO
  { id: 'contrato-arras', title: 'Contrato de arras penitenciales', category: 'Inmobiliario', pages: 4, complexity: 'Básico', popular: true, law: 'CC art. 1454',
    description: 'Arras con precio, plazo para escritura y consecuencias del desistimiento para vendedor y comprador.',
    fields: [
      { id: 'vendedor', label: 'Vendedor', type: 'text', required: true },
      { id: 'comprador', label: 'Comprador', type: 'text', required: true },
      { id: 'inmueble', label: 'Descripción del inmueble', type: 'textarea', required: true },
      { id: 'precio_total', label: 'Precio total de venta (€)', type: 'number', required: true },
      { id: 'importe_arras', label: 'Importe de las arras (€)', type: 'number', required: true },
      { id: 'plazo_escritura_dias', label: 'Plazo para escritura (días)', type: 'number', placeholder: '60', required: true },
    ],
  },
  { id: 'demanda-desahucio', title: 'Demanda de desahucio por impago', category: 'Inmobiliario', pages: 5, complexity: 'Intermedio', law: 'LEC art. 250.1.1',
    description: 'Demanda de desahucio con acumulación de reclamación de todas las rentas adeudadas e intereses.',
    fields: [
      { id: 'arrendador', label: 'Arrendador (demandante)', type: 'text', required: true },
      { id: 'arrendatario', label: 'Arrendatario (demandado)', type: 'text', required: true },
      { id: 'inmueble', label: 'Inmueble arrendado', type: 'text', required: true },
      { id: 'rentas_adeudadas', label: 'Rentas adeudadas (€)', type: 'number', required: true },
      { id: 'meses_impago', label: 'Meses de impago', type: 'number', required: true },
    ],
  },
  { id: 'acta-comunidad', title: 'Acta de reunión de comunidad de propietarios', category: 'Inmobiliario', pages: 3, complexity: 'Básico', law: 'LPH art. 19',
    description: 'Acta de junta ordinaria o extraordinaria con acuerdos adoptados, votaciones y quórum.',
    fields: [
      { id: 'comunidad', label: 'Nombre de la comunidad', type: 'text', required: true },
      { id: 'presidente', label: 'Presidente', type: 'text', required: true },
      { id: 'fecha', label: 'Fecha de la reunión', type: 'date', required: true },
      { id: 'orden_dia', label: 'Puntos del orden del día', type: 'textarea', required: true },
      { id: 'acuerdos', label: 'Acuerdos adoptados', type: 'textarea', required: true },
    ],
  },
]

// ─── Category icons (lucide-style inline SVG) ─────────────────────────────────

function CategoryIcon({ cat, color }: { cat: string; color: string }) {
  const p = { width: 22, height: 22, fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24' }
  switch (cat) {
    case 'Contratos':      return (<svg {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>)
    case 'Laboral':        return (<svg {...p}><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>)
    case 'Mercantil':      return (<svg {...p}><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/></svg>)
    case 'Civil':          return (<svg {...p}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>)
    case 'Penal':          return (<svg {...p}><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>)
    case 'Administrativo': return (<svg {...p}><path d="M3 21h18"/><path d="M6 21V8a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v13"/><path d="M9 9h6"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>)
    case 'Inmobiliario':   return (<svg {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>)
    default:               return (<svg {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/></svg>)
  }
}

// ─── TemplateCard (dashboard-style) ───────────────────────────────────────────

interface CardActions {
  onUse: () => void
  onEdit?: () => void
  onDuplicate: () => void
  onDelete?: () => void
}

function TemplateCard({ t, actions }: { t: Template; actions: CardActions }) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const c = CAT[t.category]
  const isUser = !!t.isUser
  const fieldCount = t.fields.length
  const estDuration = t.durationMin ?? Math.max(1, Math.round(t.pages * 0.7))

  useEffect(() => {
    if (!menuOpen) return
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onClick={() => actions.onUse()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group"
      style={{
        position: 'relative', cursor: 'pointer',
        borderRadius: 16,
        background: '#fff',
        border: `1px solid ${hovered ? `${BRAND}4D` : 'rgb(226 232 240)'}`, // border-slate-200 / brand 30%
        padding: 24,
        boxShadow: hovered
          ? '0 20px 40px -12px rgba(143,126,233,0.22), 0 4px 10px rgba(0,0,0,0.04)'
          : '0 1px 3px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s, border-color 0.3s',
      }}
    >
      {/* Header row: icon + 3-dot menu */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: `${BRAND}1A`, // brand 10%
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: BRAND,
        }}>
          <CategoryIcon cat={t.category} color={BRAND} />
        </div>

        {/* 3-dot menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            aria-label="Acciones de plantilla"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o) }}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: hovered || menuOpen ? 'rgb(241 245 249)' : 'transparent',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: hovered || menuOpen ? 1 : 0,
              transition: 'opacity 0.15s, background 0.15s',
              color: 'rgb(71 85 105)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </button>
          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                minWidth: 180, padding: 6,
                background: '#fff', borderRadius: 12,
                border: '1px solid rgb(226 232 240)',
                boxShadow: '0 12px 32px rgba(15,23,42,0.12)',
                zIndex: 10,
              }}
            >
              <MenuItem label="Usar plantilla" onClick={() => { setMenuOpen(false); actions.onUse() }} />
              {isUser && actions.onEdit && (
                <MenuItem label="Editar" onClick={() => { setMenuOpen(false); actions.onEdit!() }} />
              )}
              <MenuItem label="Duplicar" onClick={() => { setMenuOpen(false); actions.onDuplicate() }} />
              {isUser && actions.onDelete && (
                <MenuItem label="Eliminar" danger onClick={() => { setMenuOpen(false); actions.onDelete!() }} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title (Playfair / font-serif) */}
      <h3 className="font-serif" style={{
        fontSize: 20, lineHeight: 1.25, color: 'rgb(15 23 42)',
        fontWeight: 600, marginBottom: 8, letterSpacing: '-0.01em',
      }}>
        {t.title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: 14, color: 'rgb(71 85 105)', lineHeight: 1.55,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        minHeight: '2.85em',
      }}>
        {t.description}
      </p>

      {/* Footer divider + meta */}
      <div style={{
        marginTop: 18, paddingTop: 14,
        borderTop: '1px solid rgb(241 245 249)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          padding: '4px 10px', borderRadius: 999,
          fontSize: 11, fontWeight: 600,
          background: c.bg, color: c.color,
        }}>
          {t.category}
        </span>
        <span style={{ fontSize: 11.5, color: 'rgb(100 116 139)', fontWeight: 500 }}>
          {fieldCount} {fieldCount === 1 ? 'campo' : 'campos'} · ~{estDuration} min
        </span>
      </div>

      {/* Hover arrow */}
      <span style={{
        position: 'absolute', top: 24, right: 64,
        fontSize: 12, fontWeight: 600, color: BRAND,
        opacity: hovered && !menuOpen ? 1 : 0,
        transform: hovered ? 'translateX(0)' : 'translateX(-4px)',
        transition: 'all 0.18s', pointerEvents: 'none',
      }}>
        Usar →
      </span>
    </motion.div>
  )
}

function MenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', textAlign: 'left',
        padding: '8px 12px', borderRadius: 8,
        background: hov ? (danger ? 'rgba(220,38,38,0.08)' : 'rgb(248 250 252)') : 'transparent',
        border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: 500,
        color: danger ? '#B91C1C' : 'rgb(15 23 42)',
      }}
    >
      {label}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlantillasPage() {
  const router = useRouter()
  const [search, setSearch]             = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeComplexity, setActiveComplexity] = useState<string | null>(null)
  const [selected, setSelected]         = useState<Template | null>(null)
  const [formValues, setFormValues]     = useState<Record<string, string>>({})
  const [userTemplates, setUserTemplates] = useState<Template[]>([])

  // Fetch user-created templates (from /api/templates GET)
  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.ok ? r.json() : { user_templates: [] })
      .then(data => {
        type ApiTpl = { id: string; title: string; description: string; category: string; emoji?: string; fields: Array<{ id: string; label: string; type: 'text' | 'textarea' | 'select' | 'date' | 'number'; required: boolean; options?: string[] }> }
        const mapped: Template[] = (data.user_templates ?? []).map((t: ApiTpl) => ({
          id: t.id,
          title: t.title,
          category: CAT[t.category] ? t.category : 'Contratos',
          description: t.description,
          pages: 1,
          complexity: 'Básico' as const,
          fields: t.fields.map(f => ({
            id: f.id, label: f.label, type: f.type, required: f.required,
            options: f.options, placeholder: '',
          })),
          isNew: true,
          isUser: true,
        }))
        setUserTemplates(mapped)
      })
      .catch(() => setUserTemplates([]))
  }, [])

  const categories = Object.keys(CAT)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const all = [...userTemplates, ...TEMPLATES]
    return all.filter(t =>
      (!activeCategory   || t.category   === activeCategory) &&
      (!activeComplexity || t.complexity === activeComplexity) &&
      (!q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    )
  }, [search, activeCategory, activeComplexity, userTemplates])

  const grouped = categories
    .map(cat => ({ cat, items: filtered.filter(t => t.category === cat) }))
    .filter(g => g.items.length > 0)

  function openTemplate(t: Template) {
    setSelected(t)
    const init: Record<string, string> = {}
    t.fields.forEach(f => { init[f.id] = '' })
    setFormValues(init)
  }

  function handleGenerate() {
    if (!selected) return
    const params = new URLSearchParams({ templateId: selected.id, title: selected.title })
    selected.fields.forEach(f => { if (formValues[f.id]) params.set(f.id, formValues[f.id]) })
    router.push(`/generate?${params.toString()}`)
  }

  async function handleDuplicate(t: Template) {
    // Duplicate via POST /api/templates with copy
    const payload = {
      title: `${t.title} (copia)`,
      description: t.description,
      category: t.category,
      emoji: CAT[t.category]?.emoji ?? '📄',
      fields: t.fields.map(f => ({
        id: f.id, label: f.label, type: f.type, required: f.required,
        options: f.options,
      })),
      prompt: `Redacta un documento de tipo "${t.title}".`,
    }
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.template) {
          setUserTemplates(prev => [
            {
              id: data.template.id,
              title: data.template.title,
              category: CAT[data.template.category] ? data.template.category : 'Contratos',
              description: data.template.description,
              pages: 1,
              complexity: 'Básico',
              fields: data.template.fields,
              isNew: true,
              isUser: true,
            },
            ...prev,
          ])
        }
      }
    } catch {}
  }

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/templates/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (res.ok) {
        setUserTemplates(prev => prev.filter(t => t.id !== id))
      }
    } catch {}
    setConfirmDeleteId(null)
  }

  const selectedCat = selected ? CAT[selected.category] : null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ position: 'relative', paddingBottom: 40, borderBottom: '1px solid var(--hairline)', marginBottom: 36 }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999, marginBottom: 20,
          background: 'rgba(67,56,202,0.08)', border: '1px solid rgba(67,56,202,0.2)',
          fontSize: 11, fontWeight: 600, color: '#4338CA', letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          ✦ Documentos inteligentes · LEXIA
        </div>

        {/* + Crear plantilla CTA */}
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 10 }}>
          <button
            onClick={() => document.getElementById('plantilla-upload-input')?.click()}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F1EEFB'; e.currentTarget.style.borderColor = BRAND }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E1F0' }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
              fontSize: 14, fontWeight: 500, color: BRAND_DARK,
              background: '#FFFFFF',
              border: '1.5px solid #E2E1F0',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Subir plantilla
          </button>
          <input
            id="plantilla-upload-input"
            type="file"
            accept=".docx,.doc,.pdf,.odt,.rtf,.txt"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              if (files.length === 0) return
              const names = files.map(f => f.name).join(', ')
              const total = (files.reduce((s, f) => s + f.size, 0) / 1024).toFixed(0)
              alert(`✓ ${files.length} plantilla${files.length > 1 ? 's' : ''} recibida${files.length > 1 ? 's' : ''} (${total} KB)\n\n${names}\n\nLEXIA está procesando los archivos y detectando los campos variables. Aparecerán en tu biblioteca cuando termine el análisis (≈ 30 seg por documento).`)
              e.target.value = ''
            }}
          />
          <button
            onClick={() => router.push('/plantillas/crear')}
            onMouseEnter={(e) => { e.currentTarget.style.background = BRAND_DARK }}
            onMouseLeave={(e) => { e.currentTarget.style.background = BRAND }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500, color: '#fff',
              background: BRAND,
              boxShadow: '0 4px 14px rgba(143,126,233,0.32)',
              transition: 'background 0.15s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Crear plantilla
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }}>
          <div>
            <h1 className="font-serif" style={{
              fontSize: 36, fontWeight: 600, lineHeight: 1.15,
              color: 'rgb(15 23 42)', marginBottom: 14, letterSpacing: '-0.02em',
            }}>
              Plantillas legales
            </h1>
            <p style={{ fontSize: 16, color: 'rgb(71 85 105)', lineHeight: 1.65, maxWidth: 560 }}>
              Selecciona una plantilla, rellena los datos clave y LEXIA redacta el documento completo en segundos. Conforme al ordenamiento jurídico español vigente.
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 28 }}>
              {[
                { v: '20', l: 'plantillas' },
                { v: '7', l: 'áreas jurídicas' },
                { v: '< 30s', l: 'generación' },
              ].map(s => (
                <div key={s.l}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-primary)', lineHeight: 1 }}>{s.v}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
            {[
              { icon: '📋', title: '20 plantillas listas',    sub: 'Para los documentos más frecuentes' },
              { icon: '⚡', title: 'Generación en < 30s',     sub: 'LEXIA rellena y adapta cada cláusula' },
              { icon: '✅', title: 'Derecho español 2026',    sub: 'CC, LEC, ET, LAU, LSC actualizados' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.35 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--surface)', border: '1px solid var(--hairline)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: 16 }}>{f.icon}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)', lineHeight: 1.2 }}>{f.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 1 }}>{f.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Buscador ─────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-tertiary)' }}
          width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeWidth="2" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar plantilla jurídica…"
          style={{
            width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
            borderRadius: 10, fontSize: 13, color: 'var(--ink-primary)',
            background: 'var(--surface)', border: '1px solid var(--hairline)',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* ── Filtros ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <button onClick={() => setActiveCategory(null)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: !activeCategory ? 'var(--obsidian)' : 'var(--surface)', color: !activeCategory ? 'var(--lime)' : 'var(--ink-secondary)', border: !activeCategory ? '1px solid var(--obsidian)' : '1px solid var(--hairline)' }}>Todas</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: activeCategory === cat ? CAT[cat].bg : 'var(--surface)', color: activeCategory === cat ? CAT[cat].color : 'var(--ink-secondary)', border: activeCategory === cat ? `1px solid ${CAT[cat].color}40` : '1px solid var(--hairline)' }}>
            {CAT[cat].emoji} {cat}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 36 }}>
        {(['Básico', 'Intermedio', 'Avanzado'] as const).map(c => (
          <button key={c} onClick={() => setActiveComplexity(activeComplexity === c ? null : c)} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: activeComplexity === c ? COMPLEXITY_COLOR[c] + '15' : 'transparent', color: activeComplexity === c ? COMPLEXITY_COLOR[c] : 'var(--ink-tertiary)', border: activeComplexity === c ? `1px solid ${COMPLEXITY_COLOR[c]}40` : '1px solid var(--hairline-faint)' }}>
            {c}
          </button>
        ))}
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {grouped.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-tertiary)' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📂</p>
            <p style={{ fontSize: 14 }}>No hay plantillas para esos filtros.</p>
          </motion.div>
        ) : (
          grouped.map(({ cat: catName, items }) => (
            <motion.section key={catName} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: 44 }}>
              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: CAT[catName].bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {CAT[catName].emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-primary)', lineHeight: 1.2 }}>{catName}</p>
                  <p style={{ fontSize: 12, color: 'var(--ink-tertiary)' }}>{CAT[catName].desc}</p>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: CAT[catName].bg, color: CAT[catName].color }}>
                  {items.length} plantillas
                </span>
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {items.map(t => (
                  <TemplateCard
                    key={t.id}
                    t={t}
                    actions={{
                      onUse: () => openTemplate(t),
                      onEdit: t.isUser ? () => router.push(`/plantillas/editar/${encodeURIComponent(t.id)}`) : undefined,
                      onDuplicate: () => handleDuplicate(t),
                      onDelete: t.isUser ? () => setConfirmDeleteId(t.id) : undefined,
                    }}
                  />
                ))}
              </div>
            </motion.section>
          ))
        )}
      </AnimatePresence>

      {/* ── Modal centrado ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && selectedCat && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 50,
              }}
            />

            {/* Centered modal card */}
            <div
              style={{
                position: 'fixed', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 51,
                padding: '16px',
                pointerEvents: 'none',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                style={{
                  pointerEvents: 'auto',
                  width: '90%', maxWidth: 640,
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  borderRadius: 16,
                  background: 'var(--surface)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Top color stripe */}
                <div style={{ height: 4, background: selectedCat.color, borderRadius: '16px 16px 0 0', flexShrink: 0 }} />

                {/* Header */}
                <div style={{ padding: '24px 32px 20px', borderBottom: '1px solid var(--hairline)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: selectedCat.bg, color: selectedCat.color }}>
                          {selectedCat.emoji} {selected.category}
                        </span>
                        {selected.law && (
                          <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 500, background: 'var(--surface-elevated)', color: 'var(--ink-tertiary)', border: '1px solid var(--hairline)' }}>
                            {selected.law}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)', lineHeight: 1.3, marginBottom: 6 }}>
                        {selected.title}
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.55 }}>
                        {selected.description}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        border: '1px solid var(--hairline)',
                        background: 'var(--surface-elevated)',
                        cursor: 'pointer', fontSize: 20,
                        color: 'var(--ink-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Form */}
                <div style={{ padding: '24px 32px', flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>
                    Datos para rellenar
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {selected.fields.map(field => (
                      <div key={field.id}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)', marginBottom: 6 }}>
                          {field.label}
                          {field.required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={formValues[field.id] ?? ''}
                            onChange={e => setFormValues(p => ({ ...p, [field.id]: e.target.value }))}
                            placeholder={field.placeholder}
                            rows={3}
                            style={{
                              width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
                              color: 'var(--ink-primary)', background: 'var(--surface-elevated)',
                              border: '1px solid var(--hairline)', outline: 'none',
                              resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                            }}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            value={formValues[field.id] ?? ''}
                            onChange={e => setFormValues(p => ({ ...p, [field.id]: e.target.value }))}
                            style={{
                              width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
                              color: 'var(--ink-primary)', background: 'var(--surface-elevated)',
                              border: '1px solid var(--hairline)', outline: 'none', boxSizing: 'border-box',
                            }}
                          >
                            <option value=''>Seleccionar…</option>
                            {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={formValues[field.id] ?? ''}
                            onChange={e => setFormValues(p => ({ ...p, [field.id]: e.target.value }))}
                            placeholder={field.placeholder}
                            style={{
                              width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
                              color: 'var(--ink-primary)', background: 'var(--surface-elevated)',
                              border: '1px solid var(--hairline)', outline: 'none', boxSizing: 'border-box',
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA footer */}
                <div style={{ padding: '20px 32px 28px', borderTop: '1px solid var(--hairline)', flexShrink: 0 }}>
                  <button
                    onClick={handleGenerate}
                    onMouseEnter={e => { e.currentTarget.style.background = BRAND_DARK }}
                    onMouseLeave={e => { e.currentTarget.style.background = BRAND }}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 12,
                      border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                      color: '#fff', background: BRAND,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: '0 6px 18px rgba(143,126,233,0.35)',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span>✨</span> Generar con LEXIA
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 10 }}>
                    LEXIA generará el documento completo adaptado a tu caso
                  </p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,20,0.55)', zIndex: 70 }}
            />
            <div style={{
              position: 'fixed', inset: 0, zIndex: 71,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
              pointerEvents: 'none',
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  pointerEvents: 'auto',
                  background: '#fff', borderRadius: 16, padding: 28,
                  maxWidth: 440, width: '100%',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.20)',
                }}
              >
                <h3 className="font-serif" style={{ fontSize: 20, fontWeight: 600, color: 'rgb(15 23 42)', marginBottom: 8 }}>
                  ¿Eliminar plantilla?
                </h3>
                <p style={{ fontSize: 14, color: 'rgb(71 85 105)', lineHeight: 1.6, marginBottom: 20 }}>
                  Esta acción no se puede deshacer. La plantilla dejará de estar disponible para todo tu despacho.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    style={{
                      padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
                      background: 'transparent', color: 'rgb(71 85 105)',
                      border: '1px solid rgb(226 232 240)', fontSize: 13.5, fontWeight: 600,
                    }}
                  >Cancelar</button>
                  <button
                    onClick={() => handleDelete(confirmDeleteId)}
                    style={{
                      padding: '10px 18px', borderRadius: 10, cursor: 'pointer', border: 'none',
                      background: '#DC2626', color: '#fff', fontSize: 13.5, fontWeight: 700,
                      boxShadow: '0 6px 18px rgba(220,38,38,0.30)',
                    }}
                  >Eliminar</button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
