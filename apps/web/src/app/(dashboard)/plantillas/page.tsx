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

const CAT_CONFIG: Record<string, { color: string; light: string; emoji: string; desc: string }> = {
  Contratos:      { color: '#6366F1', light: 'rgba(99,102,241,0.12)',   emoji: '📄', desc: 'Compraventas, arrendamientos y servicios' },
  Laboral:        { color: '#F97316', light: 'rgba(249,115,22,0.12)',   emoji: '💼', desc: 'Contratos, cartas y finiquitos' },
  Mercantil:      { color: '#8B5CF6', light: 'rgba(139,92,246,0.12)',   emoji: '🏢', desc: 'Sociedades, pactos y poderes' },
  Civil:          { color: '#3B82F6', light: 'rgba(59,130,246,0.12)',   emoji: '⚖️', desc: 'Reclamaciones y documentos civiles' },
  Penal:          { color: '#EF4444', light: 'rgba(239,68,68,0.12)',    emoji: '🔒', desc: 'Denuncias, querellas y defensas' },
  Administrativo: { color: '#06B6D4', light: 'rgba(6,182,212,0.12)',    emoji: '🏛️', desc: 'Recursos y expedientes' },
  Inmobiliario:   { color: '#F59E0B', light: 'rgba(245,158,11,0.12)',   emoji: '🏠', desc: 'Arrendamientos, arras y desahucios' },
}

const COMPLEXITY_COLOR: Record<string, string> = {
  Básico:     '#22C55E',
  Intermedio: '#F59E0B',
  Avanzado:   '#EF4444',
}

// ─── Templates (20) ───────────────────────────────────────────────────────────

const TEMPLATES: Template[] = [
  // CONTRATOS
  {
    id: 'nda',
    title: 'Acuerdo de confidencialidad (NDA)',
    category: 'Contratos', pages: 3, complexity: 'Básico', popular: true, law: 'CC art. 1255',
    description: 'NDA bilateral o unilateral con objeto, duración, obligaciones y penalizaciones.',
    fields: [
      { id: 'parte_divulgante', label: 'Parte divulgante', type: 'text', placeholder: 'Empresa SA', required: true },
      { id: 'parte_receptora', label: 'Parte receptora', type: 'text', placeholder: 'Colaborador SL', required: true },
      { id: 'objeto', label: 'Información confidencial', type: 'textarea', placeholder: 'Tecnología, datos de clientes, procesos…', required: true },
      { id: 'duracion', label: 'Duración (años)', type: 'number', placeholder: '3', required: true },
      { id: 'jurisdiccion', label: 'Jurisdicción', type: 'select', options: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'], required: true },
    ],
  },
  {
    id: 'prestacion-servicios',
    title: 'Contrato de prestación de servicios',
    category: 'Contratos', pages: 5, complexity: 'Básico', popular: true,
    description: 'Contrato mercantil de servicios con precio, plazos, propiedad intelectual y penalizaciones.',
    fields: [
      { id: 'proveedor', label: 'Proveedor del servicio', type: 'text', placeholder: 'Proveedor SL', required: true },
      { id: 'cliente', label: 'Cliente', type: 'text', placeholder: 'Cliente SA', required: true },
      { id: 'descripcion_servicio', label: 'Descripción del servicio', type: 'textarea', placeholder: 'Desarrollo de software, consultoría…', required: true },
      { id: 'precio', label: 'Precio total (€)', type: 'number', placeholder: '5000', required: true },
      { id: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', required: true },
      { id: 'duracion_meses', label: 'Duración (meses)', type: 'number', placeholder: '6', required: true },
    ],
  },
  {
    id: 'compraventa-inmueble',
    title: 'Contrato de compraventa de inmueble',
    category: 'Contratos', pages: 8, complexity: 'Intermedio', popular: true, law: 'CC art. 1445',
    description: 'Compraventa de bien inmueble con precio, forma de pago y obligaciones de ambas partes.',
    fields: [
      { id: 'vendedor', label: 'Vendedor (nombre y NIF)', type: 'text', placeholder: 'Juan García López - 12345678A', required: true },
      { id: 'comprador', label: 'Comprador (nombre y NIF)', type: 'text', placeholder: 'María Pérez Ruiz - 87654321B', required: true },
      { id: 'descripcion_inmueble', label: 'Descripción del inmueble', type: 'textarea', placeholder: 'Piso 3º B, c/ Gran Vía 45, Madrid, ref. catastral…', required: true },
      { id: 'precio', label: 'Precio (€)', type: 'number', placeholder: '250000', required: true },
      { id: 'forma_pago', label: 'Forma de pago', type: 'select', options: ['Al contado', 'Con financiación hipotecaria', 'Pago aplazado'], required: true },
      { id: 'fecha_escritura', label: 'Fecha prevista escritura', type: 'date', required: true },
    ],
  },
  {
    id: 'arrendamiento-vivienda',
    title: 'Contrato de arrendamiento de vivienda',
    category: 'Contratos', pages: 6, complexity: 'Básico', popular: true, law: 'LAU art. 1',
    description: 'Contrato de alquiler residencial conforme a la LAU con fianza, inventario y cláusulas estándar.',
    fields: [
      { id: 'arrendador', label: 'Arrendador', type: 'text', placeholder: 'Propietario SA', required: true },
      { id: 'arrendatario', label: 'Arrendatario', type: 'text', placeholder: 'Inquilino Nombre', required: true },
      { id: 'direccion', label: 'Dirección del inmueble', type: 'text', placeholder: 'C/ Mayor 10, 2º A, Madrid', required: true },
      { id: 'renta', label: 'Renta mensual (€)', type: 'number', placeholder: '900', required: true },
      { id: 'duracion', label: 'Duración (meses)', type: 'number', placeholder: '12', required: true },
      { id: 'fianza', label: 'Fianza (mensualidades)', type: 'number', placeholder: '1', required: true },
      { id: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', required: true },
    ],
  },

  // LABORAL
  {
    id: 'carta-despido-disciplinario',
    title: 'Carta de despido disciplinario',
    category: 'Laboral', pages: 2, complexity: 'Básico', popular: true, law: 'ET art. 54',
    description: 'Carta de despido por causas disciplinarias con descripción de hechos y efectos.',
    fields: [
      { id: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Empresa SA', required: true },
      { id: 'trabajador', label: 'Trabajador (nombre y NIF)', type: 'text', placeholder: 'Ana López - 12345678A', required: true },
      { id: 'categoria', label: 'Categoría profesional', type: 'text', placeholder: 'Técnico de ventas', required: true },
      { id: 'motivos', label: 'Hechos y motivos del despido', type: 'textarea', placeholder: 'Describa los incumplimientos contractuales…', required: true },
      { id: 'fecha_efectos', label: 'Fecha de efectos', type: 'date', required: true },
    ],
  },
  {
    id: 'contrato-indefinido',
    title: 'Contrato de trabajo indefinido',
    category: 'Laboral', pages: 4, complexity: 'Básico', popular: true, law: 'ET art. 15',
    description: 'Contrato indefinido ordinario con jornada, salario, categoría y cláusulas adicionales.',
    fields: [
      { id: 'empresa', label: 'Empresa empleadora', type: 'text', required: true },
      { id: 'trabajador', label: 'Trabajador', type: 'text', required: true },
      { id: 'puesto', label: 'Puesto de trabajo', type: 'text', placeholder: 'Desarrollador Senior', required: true },
      { id: 'salario_anual', label: 'Salario bruto anual (€)', type: 'number', placeholder: '40000', required: true },
      { id: 'jornada', label: 'Jornada', type: 'select', options: ['Completa (40h)', 'Parcial 20h', 'Parcial 30h'], required: true },
      { id: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', required: true },
    ],
  },
  {
    id: 'finiquito',
    title: 'Finiquito / liquidación',
    category: 'Laboral', pages: 2, complexity: 'Básico', law: 'ET art. 49',
    description: 'Documento de liquidación de haberes pendientes, vacaciones y partes proporcionales.',
    fields: [
      { id: 'empresa', label: 'Empresa', type: 'text', required: true },
      { id: 'trabajador', label: 'Trabajador', type: 'text', required: true },
      { id: 'fecha_baja', label: 'Fecha de baja', type: 'date', required: true },
      { id: 'dias_vacaciones', label: 'Días vacaciones pendientes', type: 'number', placeholder: '5', required: true },
      { id: 'total_importe', label: 'Importe total bruto (€)', type: 'number', placeholder: '2500', required: true },
    ],
  },

  // MERCANTIL
  {
    id: 'estatutos-sl',
    title: 'Estatutos de sociedad limitada',
    category: 'Mercantil', pages: 12, complexity: 'Avanzado', law: 'LSC',
    description: 'Estatutos completos para constitución de SL con órganos, capital, transmisiones y disolución.',
    fields: [
      { id: 'denominacion', label: 'Denominación social', type: 'text', placeholder: 'Mi Empresa SL', required: true },
      { id: 'objeto_social', label: 'Objeto social', type: 'textarea', placeholder: 'Desarrollo de software, consultoría tecnológica…', required: true },
      { id: 'capital_social', label: 'Capital social (€)', type: 'number', placeholder: '3000', required: true },
      { id: 'domicilio', label: 'Domicilio social', type: 'text', placeholder: 'C/ Velázquez 10, Madrid', required: true },
    ],
  },
  {
    id: 'pacto-socios',
    title: 'Pacto de socios',
    category: 'Mercantil', pages: 10, complexity: 'Avanzado', popular: true,
    description: 'Pacto parasocial con lock-up, drag-along, tag-along, dividendos y salida de socios.',
    fields: [
      { id: 'empresa', label: 'Nombre de la sociedad', type: 'text', required: true },
      { id: 'socios', label: 'Nombres de los socios', type: 'textarea', placeholder: 'Socio A (40%), Socio B (60%)', required: true },
      { id: 'lock_up_meses', label: 'Período lock-up (meses)', type: 'number', placeholder: '24', required: false },
      { id: 'dividendo_minimo', label: 'Dividendo mínimo (%)', type: 'number', placeholder: '20', required: false },
    ],
  },
  {
    id: 'poder-pleitos',
    title: 'Poder para pleitos',
    category: 'Mercantil', pages: 2, complexity: 'Básico',
    description: 'Poder notarial para representación procesal ante juzgados y tribunales españoles.',
    fields: [
      { id: 'poderdante', label: 'Poderdante (nombre y NIF)', type: 'text', required: true },
      { id: 'apoderado', label: 'Abogado/Procurador apoderado', type: 'text', required: true },
      { id: 'objeto', label: 'Objeto del poder', type: 'textarea', placeholder: 'Representación en procedimiento sobre…', required: true },
      { id: 'juzgado', label: 'Juzgado o Tribunal', type: 'text', placeholder: 'Juzgado de lo Mercantil nº 1 de Madrid', required: false },
    ],
  },

  // CIVIL
  {
    id: 'demanda-cantidad',
    title: 'Demanda de reclamación de cantidad',
    category: 'Civil', pages: 5, complexity: 'Intermedio', law: 'LEC art. 248',
    description: 'Demanda ordinaria o verbal para reclamar deuda dineraria con fundamentos jurídicos.',
    fields: [
      { id: 'demandante', label: 'Demandante', type: 'text', required: true },
      { id: 'demandado', label: 'Demandado', type: 'text', required: true },
      { id: 'importe', label: 'Importe reclamado (€)', type: 'number', required: true },
      { id: 'origen_deuda', label: 'Origen de la deuda', type: 'textarea', placeholder: 'Facturas impagadas, préstamo, daños…', required: true },
      { id: 'juzgado', label: 'Juzgado', type: 'text', placeholder: 'Juzgado de Primera Instancia nº 5 de Madrid', required: true },
    ],
  },
  {
    id: 'reconocimiento-deuda',
    title: 'Reconocimiento de deuda',
    category: 'Civil', pages: 2, complexity: 'Básico', law: 'CC art. 1217',
    description: 'Documento de reconocimiento de deuda con plan de pago y garantías.',
    fields: [
      { id: 'deudor', label: 'Deudor (nombre y NIF)', type: 'text', required: true },
      { id: 'acreedor', label: 'Acreedor (nombre y NIF)', type: 'text', required: true },
      { id: 'importe', label: 'Importe de la deuda (€)', type: 'number', required: true },
      { id: 'plan_pago', label: 'Plan de pago', type: 'textarea', placeholder: '500€/mes durante 12 meses…', required: true },
    ],
  },

  // PENAL
  {
    id: 'denuncia-penal',
    title: 'Denuncia penal',
    category: 'Penal', pages: 3, complexity: 'Básico', law: 'LECrim art. 265',
    description: 'Denuncia ante Juzgado o Fiscalía con narración de hechos y diligencias solicitadas.',
    fields: [
      { id: 'denunciante', label: 'Denunciante (nombre y NIF)', type: 'text', required: true },
      { id: 'denunciado', label: 'Denunciado (si se conoce)', type: 'text', placeholder: 'Desconocido o nombre', required: false },
      { id: 'hechos', label: 'Narración de los hechos', type: 'textarea', required: true },
      { id: 'delito', label: 'Tipo de delito', type: 'select', options: ['Estafa', 'Robo', 'Lesiones', 'Amenazas', 'Violencia de género', 'Otro'], required: true },
    ],
  },
  {
    id: 'querella',
    title: 'Querella por estafa',
    category: 'Penal', pages: 6, complexity: 'Avanzado', law: 'CP art. 248', popular: true,
    description: 'Querella con calificación jurídica, pruebas documentales y medidas cautelares.',
    fields: [
      { id: 'querellante', label: 'Querellante', type: 'text', required: true },
      { id: 'querellado', label: 'Querellado', type: 'text', required: true },
      { id: 'hechos', label: 'Hechos constitutivos de estafa', type: 'textarea', required: true },
      { id: 'importe_defraudado', label: 'Importe defraudado (€)', type: 'number', required: true },
    ],
  },

  // ADMINISTRATIVO
  {
    id: 'recurso-alzada',
    title: 'Recurso de alzada',
    category: 'Administrativo', pages: 4, complexity: 'Intermedio', law: 'LPAC art. 121', popular: true,
    description: 'Recurso administrativo ante órgano superior con motivos jurídicos y petición de nulidad.',
    fields: [
      { id: 'recurrente', label: 'Recurrente (nombre y NIF)', type: 'text', required: true },
      { id: 'organo', label: 'Órgano al que se dirige', type: 'text', placeholder: 'Dirección General de…', required: true },
      { id: 'acto_impugnado', label: 'Acto administrativo impugnado', type: 'textarea', placeholder: 'Resolución de fecha…', required: true },
      { id: 'fecha_notificacion', label: 'Fecha de notificación', type: 'date', required: true },
      { id: 'motivos', label: 'Motivos de impugnación', type: 'textarea', required: true },
    ],
  },
  {
    id: 'alegaciones-sancionador',
    title: 'Alegaciones a expediente sancionador',
    category: 'Administrativo', pages: 4, complexity: 'Intermedio', law: 'LPAC art. 82',
    description: 'Escrito de alegaciones en procedimiento sancionador con solicitud de prueba.',
    fields: [
      { id: 'interesado', label: 'Interesado', type: 'text', required: true },
      { id: 'expediente', label: 'Nº de expediente', type: 'text', required: true },
      { id: 'organo', label: 'Órgano instructor', type: 'text', required: true },
      { id: 'alegaciones', label: 'Alegaciones', type: 'textarea', required: true },
    ],
  },
  {
    id: 'recurso-contencioso',
    title: 'Recurso contencioso-administrativo',
    category: 'Administrativo', pages: 7, complexity: 'Avanzado', law: 'LJCA art. 45',
    description: 'Recurso ante la jurisdicción contencioso-administrativa con suplico y fundamentos.',
    fields: [
      { id: 'recurrente', label: 'Recurrente', type: 'text', required: true },
      { id: 'administracion', label: 'Administración demandada', type: 'text', required: true },
      { id: 'acto_impugnado', label: 'Acto impugnado', type: 'textarea', required: true },
      { id: 'fecha_acto', label: 'Fecha del acto', type: 'date', required: true },
      { id: 'pretension', label: 'Pretensión / suplico', type: 'textarea', required: true },
    ],
  },

  // INMOBILIARIO
  {
    id: 'contrato-arras',
    title: 'Contrato de arras penitenciales',
    category: 'Inmobiliario', pages: 4, complexity: 'Básico', popular: true, law: 'CC art. 1454',
    description: 'Contrato de arras con precio, plazos para escritura y consecuencias del desistimiento.',
    fields: [
      { id: 'vendedor', label: 'Vendedor', type: 'text', required: true },
      { id: 'comprador', label: 'Comprador', type: 'text', required: true },
      { id: 'inmueble', label: 'Descripción del inmueble', type: 'textarea', required: true },
      { id: 'precio_total', label: 'Precio total de venta (€)', type: 'number', required: true },
      { id: 'importe_arras', label: 'Importe de las arras (€)', type: 'number', required: true },
      { id: 'plazo_escritura_dias', label: 'Plazo para escritura (días)', type: 'number', placeholder: '60', required: true },
    ],
  },
  {
    id: 'demanda-desahucio',
    title: 'Demanda de desahucio por impago',
    category: 'Inmobiliario', pages: 5, complexity: 'Intermedio', law: 'LEC art. 250.1.1',
    description: 'Demanda de desahucio con acumulación de reclamación de rentas adeudadas.',
    fields: [
      { id: 'arrendador', label: 'Arrendador (demandante)', type: 'text', required: true },
      { id: 'arrendatario', label: 'Arrendatario (demandado)', type: 'text', required: true },
      { id: 'inmueble', label: 'Inmueble arrendado', type: 'text', required: true },
      { id: 'rentas_adeudadas', label: 'Rentas adeudadas (€)', type: 'number', required: true },
      { id: 'meses_impago', label: 'Meses de impago', type: 'number', required: true },
    ],
  },
  {
    id: 'acta-comunidad',
    title: 'Acta de reunión de comunidad de propietarios',
    category: 'Inmobiliario', pages: 3, complexity: 'Básico', law: 'LPH art. 19',
    description: 'Acta de junta ordinaria o extraordinaria con acuerdos adoptados y votos.',
    fields: [
      { id: 'comunidad', label: 'Nombre de la comunidad', type: 'text', required: true },
      { id: 'presidente', label: 'Presidente', type: 'text', required: true },
      { id: 'fecha', label: 'Fecha de la reunión', type: 'date', required: true },
      { id: 'orden_dia', label: 'Puntos del orden del día', type: 'textarea', required: true },
      { id: 'acuerdos', label: 'Acuerdos adoptados', type: 'textarea', required: true },
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlantillasPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeComplexity, setActiveComplexity] = useState<string | null>(null)
  const [selected, setSelected] = useState<Template | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  const categories = Object.keys(CAT_CONFIG)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return TEMPLATES.filter(t =>
      (!activeCategory || t.category === activeCategory) &&
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
    selected.fields.forEach(f => {
      if (formValues[f.id]) params.set(f.id, formValues[f.id])
    })
    router.push(`/generate?${params.toString()}`)
  }

  const cat = selected ? CAT_CONFIG[selected.category] : null

  return (
    <div className="relative">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-12 px-0 pt-2 pb-10 overflow-hidden"
      >
        {/* Background radial glow */}
        <div
          className="pointer-events-none absolute -top-20 -left-32 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #6366F1 0%, transparent 70%)' }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          {/* Left */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 text-xs font-semibold tracking-wide"
              style={{
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.30)',
                color: '#818CF8',
              }}>
              <span style={{ color: '#6366F1' }}>✦</span>
              Documentos inteligentes
            </div>

            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-white mb-4">
              Genera cualquier
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                documento legal
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-zinc-400 text-base leading-relaxed max-w-md">
              Selecciona una plantilla, rellena los datos clave y LEXIA redacta el documento completo en segundos.
              Conforme al ordenamiento jurídico español vigente.
            </p>
          </div>

          {/* Right — feature chips */}
          <div className="flex flex-col gap-3 lg:min-w-[300px]">
            {[
              { icon: '📋', title: '20 plantillas listas', desc: 'Para los documentos más frecuentes' },
              { icon: '⚡', title: 'Generación en < 30s', desc: 'LEXIA rellena y adapta cada cláusula' },
              { icon: '✅', title: 'Derecho español 2026', desc: 'CC, LEC, ET, LAU, LSC actualizados' },
            ].map((chip, i) => (
              <motion.div
                key={chip.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span className="text-lg mt-0.5">{chip.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{chip.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{chip.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
      >
        {[
          { value: '20', label: 'Plantillas' },
          { value: '7', label: 'Áreas jurídicas' },
          { value: '100%', label: 'Normativa ES' },
          { value: 'Gratis', label: 'Con tu plan' },
        ].map(s => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center py-4 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span className="text-xl font-bold text-white tracking-tight">{s.value}</span>
            <span className="text-[11px] text-zinc-500 mt-0.5">{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* ── SEARCH + FILTERS ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, duration: 0.4 }}
        className="mb-8 space-y-4"
      >
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" strokeWidth="2" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar plantilla…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
            style={!activeCategory
              ? { background: 'rgba(255,255,255,0.12)', color: '#fff' }
              : { background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            Todas
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(activeCategory === c ? null : c)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
              style={activeCategory === c
                ? { background: CAT_CONFIG[c].light, color: CAT_CONFIG[c].color, border: `1px solid ${CAT_CONFIG[c].color}44` }
                : { background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {CAT_CONFIG[c].emoji} {c}
            </button>
          ))}
        </div>

        {/* Complexity pills */}
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] text-zinc-600 self-center mr-1 uppercase tracking-wider font-medium">Complejidad:</span>
          <button
            onClick={() => setActiveComplexity(null)}
            className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
            style={!activeComplexity
              ? { background: 'rgba(255,255,255,0.10)', color: '#fff' }
              : { background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }
            }
          >
            Todos
          </button>
          {(['Básico', 'Intermedio', 'Avanzado'] as const).map(cx => (
            <button
              key={cx}
              onClick={() => setActiveComplexity(activeComplexity === cx ? null : cx)}
              className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
              style={activeComplexity === cx
                ? { background: COMPLEXITY_COLOR[cx] + '22', color: COMPLEXITY_COLOR[cx], border: `1px solid ${COMPLEXITY_COLOR[cx]}44` }
                : { background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }
              }
            >
              {cx}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── TEMPLATE GRID ────────────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {grouped.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-24 text-zinc-500"
          >
            <p className="text-5xl mb-4">📂</p>
            <p className="text-sm">No hay plantillas para esos filtros.</p>
          </motion.div>
        ) : (
          grouped.map(({ cat: catName, items }) => {
            const cfg = CAT_CONFIG[catName]
            return (
              <motion.section
                key={catName}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="mb-12"
              >
                {/* Group header */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: cfg.light, border: `1px solid ${cfg.color}30` }}
                  >
                    {cfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-sm font-semibold text-white">{catName}</h2>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: cfg.light, color: cfg.color }}
                      >
                        {items.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{cfg.desc}</p>
                  </div>
                  <div className="flex-1 h-px ml-2" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {items.map((t, i) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      cfg={cfg}
                      index={i}
                      onOpen={openTemplate}
                    />
                  ))}
                </div>
              </motion.section>
            )
          })
        )}
      </AnimatePresence>

      {/* ── SLIDE-IN PANEL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && cat && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 h-full w-full max-w-[440px] z-50 flex flex-col overflow-hidden"
              style={{
                background: '#0d0d11',
                borderLeft: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '-24px 0 80px rgba(0,0,0,0.6)',
              }}
            >
              {/* Color stripe */}
              <div className="h-[4px] w-full flex-shrink-0" style={{ background: cat.color }} />

              {/* Header */}
              <div className="px-6 pt-5 pb-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background: cat.light, color: cat.color }}
                      >
                        {cat.emoji} {selected.category}
                      </span>
                      {selected.law && (
                        <span className="text-[10px] text-zinc-600 font-mono">{selected.law}</span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-white leading-snug">{selected.title}</h2>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{selected.description}</p>

                    <div className="flex items-center gap-2 mt-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{
                          background: COMPLEXITY_COLOR[selected.complexity] + '18',
                          color: COMPLEXITY_COLOR[selected.complexity],
                        }}
                      >
                        {selected.complexity}
                      </span>
                      <span className="text-[10px] text-zinc-600">≈ {selected.pages} páginas</span>
                      {selected.popular && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400">Popular</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white transition-colors text-xl leading-none"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">
                  Datos para el documento
                </p>
                <div className="space-y-4">
                  {selected.fields.map(field => (
                    <div key={field.id}>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        {field.label}
                        {field.required && <span className="text-rose-400 ml-1">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={formValues[field.id] ?? ''}
                          onChange={e => setFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-zinc-600 resize-none focus:outline-none transition-colors"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={formValues[field.id] ?? ''}
                          onChange={e => setFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-colors"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <option value="">Seleccionar…</option>
                          {field.options?.map(o => (
                            <option key={o} value={o} style={{ background: '#1a1a22' }}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={formValues[field.id] ?? ''}
                          onChange={e => setFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA footer */}
              <div className="flex-shrink-0 px-6 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={handleGenerate}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)' }}
                >
                  <span>✨</span>
                  Generar con LEXIA
                </button>
                <p className="text-center text-[10px] text-zinc-600 mt-2.5 leading-relaxed">
                  LEXIA generará el documento completo en segundos,<br />conforme al derecho español vigente.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── TemplateCard ──────────────────────────────────────────────────────────────

function TemplateCard({
  template: t,
  cfg,
  index,
  onOpen,
}: {
  template: Template
  cfg: { color: string; light: string; emoji: string; desc: string }
  index: number
  onOpen: (t: Template) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -2 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer pt-[3px] transition-shadow duration-300"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      onClick={() => onOpen(t)}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = cfg.color + '50'
        el.style.boxShadow = `0 8px 32px -8px ${cfg.color}40`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(255,255,255,0.06)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Top stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: cfg.color }}
      />

      {/* Hover blob */}
      <div
        className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${cfg.color}20 0%, transparent 70%)` }}
      />

      <div className="p-4 pt-5">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: COMPLEXITY_COLOR[t.complexity] + '1A', color: COMPLEXITY_COLOR[t.complexity] }}
          >
            {t.complexity}
          </span>
          {t.popular && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400">
              Popular
            </span>
          )}
          {t.isNew && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
              Nuevo
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-white leading-snug mb-1.5">{t.title}</p>

        {/* Description */}
        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{t.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 text-[10px] text-zinc-600">
            <span>≈ {t.pages} págs.</span>
            {t.law && (
              <>
                <span className="opacity-40">·</span>
                <span className="font-mono">{t.law}</span>
              </>
            )}
          </div>
          <span
            className="text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1"
            style={{ color: cfg.color }}
          >
            Usar plantilla
            <span className="group-hover:translate-x-0.5 transition-transform duration-200 inline-block">→</span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}
