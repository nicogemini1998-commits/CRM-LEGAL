'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

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
  law?: string
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

// ─── TemplateCard ─────────────────────────────────────────────────────────────

function TemplateCard({ t, onClick }: { t: Template; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const c = CAT[t.category]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden', borderRadius: 12, cursor: 'pointer',
        background: 'var(--surface)',
        border: `1px solid ${hovered ? c.color + '50' : 'var(--hairline)'}`,
        boxShadow: hovered
          ? `0 4px 20px -4px ${c.color}28, 0 1px 3px rgba(0,0,0,0.06)`
          : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.2s',
      }}
    >
      {/* Top color stripe */}
      <div style={{ height: 3, background: c.color, opacity: hovered ? 1 : 0.6, transition: 'opacity 0.2s' }} />

      <div style={{ padding: '14px 16px 14px' }}>
        {/* Badges row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: c.bg, color: c.color }}>
            {c.emoji} {t.category}
          </span>
          <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: COMPLEXITY_COLOR[t.complexity] + '14', color: COMPLEXITY_COLOR[t.complexity] }}>
            {t.complexity}
          </span>
          {t.popular && (
            <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: 'rgba(217,119,6,0.1)', color: '#D97706' }}>
              Popular
            </span>
          )}
        </div>

        {/* Title */}
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-primary)', lineHeight: 1.3, marginBottom: 6 }}>
          {t.title}
        </p>
        <p style={{ fontSize: 11.5, color: 'var(--ink-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {t.description}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--hairline-faint)' }}>
          <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--ink-tertiary)' }}>
            <span>≈ {t.pages} págs.</span>
            {t.law && <span>· {t.law}</span>}
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: c.color, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
            Usar →
          </span>
        </div>
      </div>
    </motion.div>
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

  const categories = Object.keys(CAT)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return TEMPLATES.filter(t =>
      (!activeCategory   || t.category   === activeCategory) &&
      (!activeComplexity || t.complexity === activeComplexity) &&
      (!q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    )
  }, [search, activeCategory, activeComplexity])

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

  const selectedCat = selected ? CAT[selected.category] : null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ paddingBottom: 40, borderBottom: '1px solid var(--hairline)', marginBottom: 36 }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999, marginBottom: 20,
          background: 'rgba(67,56,202,0.08)', border: '1px solid rgba(67,56,202,0.2)',
          fontSize: 11, fontWeight: 600, color: '#4338CA', letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          ✦ Documentos inteligentes · LEXIA
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.15, color: 'var(--ink-primary)', marginBottom: 14 }}>
              Genera cualquier{' '}
              <span style={{ background: 'linear-gradient(135deg, #4338CA, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                documento legal
              </span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ink-secondary)', lineHeight: 1.65, maxWidth: 500 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {items.map(t => <TemplateCard key={t.id} t={t} onClick={() => openTemplate(t)} />)}
              </div>
            </motion.section>
          ))
        )}
      </AnimatePresence>

      {/* ── Panel lateral ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && selectedCat && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(3px)', zIndex: 40 }}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              style={{
                position: 'fixed', right: 0, top: 0, height: '100%', width: 440,
                background: 'var(--surface)', borderLeft: '1px solid var(--hairline)',
                boxShadow: '-8px 0 32px rgba(0,0,0,0.08)', zIndex: 50,
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}
            >
              {/* Color stripe */}
              <div style={{ height: 4, background: selectedCat.color, flexShrink: 0 }} />

              {/* Header */}
              <div style={{ padding: '20px 24px 18px', borderBottom: '1px solid var(--hairline)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: selectedCat.bg, color: selectedCat.color }}>{selectedCat.emoji} {selected.category}</span>
                      {selected.law && <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 500, background: 'var(--surface-elevated)', color: 'var(--ink-tertiary)', border: '1px solid var(--hairline)' }}>{selected.law}</span>}
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-primary)', lineHeight: 1.3 }}>{selected.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-secondary)', marginTop: 4, lineHeight: 1.5 }}>{selected.description}</p>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--surface-elevated)', cursor: 'pointer', fontSize: 18, color: 'var(--ink-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                </div>
              </div>

              {/* Form */}
              <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Datos para rellenar</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {selected.fields.map(field => (
                    <div key={field.id}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)', marginBottom: 6 }}>
                        {field.label}{field.required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea value={formValues[field.id] ?? ''} onChange={e => setFormValues(p => ({ ...p, [field.id]: e.target.value }))} placeholder={field.placeholder} rows={3}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'var(--ink-primary)', background: 'var(--surface-elevated)', border: '1px solid var(--hairline)', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                        />
                      ) : field.type === 'select' ? (
                        <select value={formValues[field.id] ?? ''} onChange={e => setFormValues(p => ({ ...p, [field.id]: e.target.value }))}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'var(--ink-primary)', background: 'var(--surface-elevated)', border: '1px solid var(--hairline)', outline: 'none', boxSizing: 'border-box' }}>
                          <option value=''>Seleccionar…</option>
                          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type={field.type} value={formValues[field.id] ?? ''} onChange={e => setFormValues(p => ({ ...p, [field.id]: e.target.value }))} placeholder={field.placeholder}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'var(--ink-primary)', background: 'var(--surface-elevated)', border: '1px solid var(--hairline)', outline: 'none', boxSizing: 'border-box' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--hairline)', flexShrink: 0 }}>
                <button onClick={handleGenerate} style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #7C3AED, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span>✨</span> Generar con LEXIA
                </button>
                <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--ink-tertiary)', marginTop: 8 }}>
                  LEXIA generará el documento completo adaptado a tu caso
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
