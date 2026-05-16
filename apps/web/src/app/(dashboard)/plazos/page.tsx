'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'civil' | 'penal' | 'laboral' | 'administrativo' | 'mercantil'

interface DeadlineRule {
  id: string
  label: string
  category: Category
  law: string
  days: number
  type: 'calendar' | 'business'
  startFrom: string
  description: string
  warning?: string
}

// ─── Deadline Rules ───────────────────────────────────────────────────────────

const DEADLINE_RULES: DeadlineRule[] = [
  // CIVIL
  {
    id: 'civil-ejecucion-sentencia',
    label: 'Ejecución de sentencia',
    category: 'civil',
    law: 'LEC art. 518',
    days: 1825, // 5 years in calendar days (5*365)
    type: 'calendar',
    startFrom: 'Fecha en que la sentencia deviene firme',
    description: 'Plazo para solicitar la ejecución forzosa de una sentencia firme.',
    warning: 'Transcurridos 5 años desde la firmeza, caduca el derecho a ejecutar. Revisar posibles interrupciones de la prescripción.',
  },
  {
    id: 'civil-apelacion',
    label: 'Recurso de apelación',
    category: 'civil',
    law: 'LEC art. 458',
    days: 20,
    type: 'business',
    startFrom: 'Notificación de la sentencia de primera instancia',
    description: 'Plazo para interponer recurso de apelación ante la Audiencia Provincial.',
  },
  {
    id: 'civil-casacion',
    label: 'Recurso de casación',
    category: 'civil',
    law: 'LEC art. 479',
    days: 20,
    type: 'business',
    startFrom: 'Notificación de la sentencia de segunda instancia',
    description: 'Plazo para interponer recurso de casación ante el Tribunal Supremo.',
    warning: 'Verificar que la resolución es susceptible de casación por razón de la cuantía o materia.',
  },
  {
    id: 'civil-contestacion-demanda',
    label: 'Contestación a la demanda (ordinario)',
    category: 'civil',
    law: 'LEC art. 404',
    days: 20,
    type: 'business',
    startFrom: 'Notificación del auto de admisión de la demanda',
    description: 'Plazo para contestar a la demanda en el juicio ordinario.',
  },
  {
    id: 'civil-contestacion-verbal',
    label: 'Contestación demanda (verbal)',
    category: 'civil',
    law: 'LEC art. 438',
    days: 10,
    type: 'business',
    startFrom: 'Notificación de la citación para vista',
    description: 'Plazo para contestar por escrito en el juicio verbal con contestación escrita.',
  },
  {
    id: 'civil-monitorio-oposicion',
    label: 'Oposición proceso monitorio',
    category: 'civil',
    law: 'LEC art. 818',
    days: 20,
    type: 'business',
    startFrom: 'Notificación del requerimiento de pago',
    description: 'Plazo para que el deudor formule oposición en el proceso monitorio.',
    warning: 'Si no se formula oposición en plazo, se despachará ejecución automáticamente.',
  },
  {
    id: 'civil-rescisoria',
    label: 'Acción rescisoria',
    category: 'civil',
    law: 'CC art. 1299',
    days: 1460, // 4 years
    type: 'calendar',
    startFrom: 'Celebración del contrato o acto impugnable',
    description: 'Plazo para ejercitar la acción de rescisión de contratos.',
  },
  {
    id: 'civil-prescripcion-personal',
    label: 'Prescripción acción personal',
    category: 'civil',
    law: 'CC art. 1964',
    days: 1825, // 5 years
    type: 'calendar',
    startFrom: 'Fecha en que pudo ejercitarse la acción',
    description: 'Plazo general de prescripción para acciones personales sin plazo especial.',
    warning: 'La prescripción puede interrumpirse por reclamación extrajudicial, reconocimiento de deuda o acción judicial.',
  },
  {
    id: 'civil-prescripcion-real-inmueble',
    label: 'Prescripción acción real (inmueble)',
    category: 'civil',
    law: 'CC art. 1963',
    days: 10950, // 30 years
    type: 'calendar',
    startFrom: 'Pérdida de la posesión del inmueble',
    description: 'Plazo de prescripción para acciones reales sobre bienes inmuebles.',
  },
  // PENAL
  {
    id: 'penal-apelacion',
    label: 'Recurso de apelación penal',
    category: 'penal',
    law: 'LECrim art. 790',
    days: 10,
    type: 'business',
    startFrom: 'Notificación de la sentencia penal',
    description: 'Plazo para interponer recurso de apelación contra sentencias penales dictadas por el Juzgado de lo Penal.',
  },
  {
    id: 'penal-casacion',
    label: 'Recurso de casación penal',
    category: 'penal',
    law: 'LECrim art. 856',
    days: 5,
    type: 'business',
    startFrom: 'Notificación de la sentencia de la Audiencia Provincial',
    description: 'Plazo para preparar el recurso de casación penal ante el Tribunal Supremo.',
    warning: 'Plazo muy breve. Solo se prepara en este plazo; la interposición se realiza en 15 días hábiles posterior.',
  },
  {
    id: 'penal-habeas-corpus',
    label: 'Habeas corpus',
    category: 'penal',
    law: 'LO 6/1984',
    days: 1,
    type: 'calendar',
    startFrom: 'Momento de la detención o privación de libertad ilegal',
    description: 'Plazo máximo de 24 horas para que el juez resuelva sobre la legalidad de la detención.',
    warning: 'Procedimiento urgentísimo. El juez debe resolver en 24 horas desde la incoación.',
  },
  {
    id: 'penal-diligencias-previas',
    label: 'Diligencias previas (instrucción)',
    category: 'penal',
    law: 'LECrim art. 324',
    days: 180, // 6 months
    type: 'calendar',
    startFrom: 'Auto de incoación de diligencias previas',
    description: 'Plazo máximo para la instrucción de diligencias previas en causas no declaradas complejas.',
    warning: 'El plazo puede prorrogarse hasta 18 meses en causas complejas y 36 meses en causas de especial complejidad.',
  },
  {
    id: 'penal-juicio-rapido',
    label: 'Juicio rápido (celebración)',
    category: 'penal',
    law: 'LECrim art. 800',
    days: 15,
    type: 'calendar',
    startFrom: 'Fecha de las diligencias urgentes',
    description: 'Plazo para la celebración del juicio oral en el procedimiento de juicio rápido.',
  },
  {
    id: 'penal-prision-provisional',
    label: 'Prisión provisional (duración máxima)',
    category: 'penal',
    law: 'LECrim art. 504',
    days: 365, // 1 year
    type: 'calendar',
    startFrom: 'Auto que decreta la prisión provisional',
    description: 'Duración máxima de la prisión provisional en causas por delitos con pena inferior a 3 años.',
    warning: 'El plazo puede prorrogarse hasta 2 años si el delito tiene pena superior a 3 años, y hasta 4 años en casos excepcionales.',
  },
  // LABORAL
  {
    id: 'laboral-despido',
    label: 'Demanda por despido',
    category: 'laboral',
    law: 'LRJS art. 59',
    days: 20,
    type: 'business',
    startFrom: 'Fecha efectiva del despido',
    description: 'Plazo para presentar papeleta de conciliación previa y, posteriormente, demanda por despido.',
    warning: 'Plazo de caducidad, no de prescripción. No se interrumpe por reclamación previa al empresario salvo conciliación.',
  },
  {
    id: 'laboral-conciliacion',
    label: 'Conciliación previa laboral',
    category: 'laboral',
    law: 'LRJS art. 63',
    days: 15,
    type: 'business',
    startFrom: 'Presentación de la papeleta de conciliación',
    description: 'Plazo máximo para celebrar el acto de conciliación previa obligatoria.',
    warning: 'La presentación de la papeleta suspende el plazo de caducidad de la acción por despido.',
  },
  {
    id: 'laboral-suplicacion',
    label: 'Recurso de suplicación',
    category: 'laboral',
    law: 'LRJS art. 194',
    days: 10,
    type: 'business',
    startFrom: 'Notificación de la sentencia del Juzgado de lo Social',
    description: 'Plazo para anunciar el recurso de suplicación ante el Tribunal Superior de Justicia.',
  },
  // ADMINISTRATIVO
  {
    id: 'admin-alzada',
    label: 'Recurso de alzada',
    category: 'administrativo',
    law: 'LPAC art. 121',
    days: 30,
    type: 'calendar',
    startFrom: 'Notificación del acto administrativo impugnado',
    description: 'Plazo para interponer recurso de alzada ante el órgano superior jerárquico.',
    warning: 'Si el acto no es expreso, el plazo es de 3 meses desde la presunción de desestimación por silencio.',
  },
  {
    id: 'admin-reposicion',
    label: 'Recurso de reposición',
    category: 'administrativo',
    law: 'LPAC art. 124',
    days: 30,
    type: 'calendar',
    startFrom: 'Notificación del acto administrativo impugnado',
    description: 'Plazo para interponer recurso potestativo de reposición ante el mismo órgano que dictó el acto.',
  },
  {
    id: 'admin-contencioso',
    label: 'Recurso contencioso-administrativo',
    category: 'administrativo',
    law: 'LJCA art. 46',
    days: 60,
    type: 'calendar',
    startFrom: 'Notificación de la resolución administrativa que agota la vía administrativa',
    description: 'Plazo para interponer recurso contencioso-administrativo ante los Juzgados o Tribunales de lo Contencioso.',
    warning: 'Verificar que se ha agotado la vía administrativa previa. En actos de silencio negativo, el plazo es de 6 meses.',
  },
  {
    id: 'admin-silencio',
    label: 'Silencio administrativo',
    category: 'administrativo',
    law: 'LPAC art. 21',
    days: 90,
    type: 'calendar',
    startFrom: 'Presentación de la solicitud en el registro administrativo',
    description: 'Plazo general para que la Administración resuelva expresamente. Transcurrido sin resolución, opera el silencio.',
    warning: 'El silencio puede ser positivo o negativo según la materia. Verificar el régimen específico aplicable.',
  },
  // MERCANTIL
  {
    id: 'mercantil-responsabilidad-administradores',
    label: 'Acción responsabilidad administradores',
    category: 'mercantil',
    law: 'LSC art. 241 bis',
    days: 1460, // 4 years
    type: 'calendar',
    startFrom: 'Día en que el acreedor pudo ejercitar la acción',
    description: 'Plazo de prescripción para ejercitar la acción social e individual de responsabilidad contra administradores de sociedades.',
  },
  {
    id: 'mercantil-impugnar-acuerdo',
    label: 'Impugnación de acuerdos sociales',
    category: 'mercantil',
    law: 'LSC art. 205',
    days: 365, // 1 year general; note the 3-month variant for registered
    type: 'calendar',
    startFrom: 'Fecha de adopción del acuerdo social (o inscripción registral)',
    description: 'Plazo para impugnar acuerdos nulos o anulables de la Junta General o el Consejo de Administración.',
    warning: 'Si el acuerdo ha sido inscrito en el Registro Mercantil, el plazo se reduce a 3 meses desde la inscripción. Para socios ausentes o disidentes, desde la notificación.',
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const SPANISH_HOLIDAYS = [
  '01-01', // Año Nuevo
  '01-06', // Reyes
  '04-18', // Viernes Santo (approx)
  '04-19', // Sábado Santo (approx)
  '05-01', // Día del Trabajador
  '08-15', // Asunción
  '10-12', // Fiesta Nacional
  '11-01', // Todos los Santos
  '12-06', // Constitución
  '12-08', // Inmaculada
  '12-25', // Navidad
]

const CATEGORIES = [
  { key: 'all', label: 'Todos' },
  { key: 'civil', label: 'Civil' },
  { key: 'penal', label: 'Penal' },
  { key: 'laboral', label: 'Laboral' },
  { key: 'administrativo', label: 'Administrativo' },
  { key: 'mercantil', label: 'Mercantil' },
] as const

type CategoryKey = typeof CATEGORIES[number]['key']

const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  civil: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  penal: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  laboral: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  administrativo: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  mercantil: { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSpanishHoliday(date: Date): boolean {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return SPANISH_HOLIDAYS.includes(mmdd)
}

function isWorkingDay(date: Date): boolean {
  const dow = date.getDay()
  if (dow === 0 || dow === 6) return false
  return !isSpanishHoliday(date)
}

function addCalendarDays(start: Date, days: number): Date {
  const result = new Date(start)
  result.setDate(result.getDate() + days)
  return result
}

function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start)
  let remaining = days
  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    if (isWorkingDay(result)) remaining--
  }
  return result
}

function calculateDeadline(startDate: Date, rule: DeadlineRule): Date {
  if (rule.type === 'calendar') {
    return addCalendarDays(startDate, rule.days)
  }
  return addBusinessDays(startDate, rule.days)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function daysFromToday(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDays(rule: DeadlineRule): string {
  if (rule.days >= 365) {
    const years = Math.round(rule.days / 365)
    return `${years} ${years === 1 ? 'año' : 'años'}`
  }
  if (rule.days >= 30) {
    const months = Math.round(rule.days / 30)
    return `${months} ${months === 1 ? 'mes' : 'meses'}`
  }
  return `${rule.days} días`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: Category }) {
  const colors = CATEGORY_COLORS[category]
  const labels: Record<Category, string> = {
    civil: 'Civil',
    penal: 'Penal',
    laboral: 'Laboral',
    administrativo: 'Administrativo',
    mercantil: 'Mercantil',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${colors.bg} ${colors.text} ${colors.border}`}>
      {labels[category]}
    </span>
  )
}

function LawBadge({ law }: { law: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-[#7C3AED]/10 text-purple-400 border border-purple-500/20">
      {law}
    </span>
  )
}

function RuleCard({
  rule,
  selected,
  onClick,
}: {
  rule: DeadlineRule
  selected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
        selected
          ? 'bg-[#7C3AED]/10 border-purple-500/50 shadow-[0_0_0_1px_rgba(124,58,237,0.3)]'
          : 'bg-[#141418] border-white/8 hover:border-white/16 hover:bg-[#18181c]'
      }`}
    >
      <div className="flex flex-col gap-1.5">
        <p className={`text-sm font-medium leading-snug ${selected ? 'text-white' : 'text-white/90'}`}>
          {rule.label}
        </p>
        <div className="flex flex-wrap gap-1.5 items-center">
          <LawBadge law={rule.law} />
          <CategoryBadge category={rule.category} />
        </div>
        <p className="text-xs text-white/40 mt-0.5">
          {formatDays(rule)} · {rule.type === 'business' ? 'hábiles' : 'naturales'}
        </p>
      </div>
    </motion.button>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
      <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 border border-purple-500/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-purple-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-white/50 text-sm font-medium">Selecciona un plazo</p>
        <p className="text-white/25 text-xs mt-1">Elige una norma del panel izquierdo para calcular la fecha límite</p>
      </div>
    </div>
  )
}

function NoResults() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p className="text-white/40 text-sm">No se encontraron plazos</p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlazosPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [selectedRule, setSelectedRule] = useState<DeadlineRule | null>(null)
  const [startDate, setStartDate] = useState('')
  const [result, setResult] = useState<Date | null>(null)

  const filtered = useMemo(() => {
    return DEADLINE_RULES.filter((r) => {
      const matchesCategory = activeCategory === 'all' || r.category === activeCategory
      const matchesSearch =
        search.trim() === '' ||
        r.label.toLowerCase().includes(search.toLowerCase()) ||
        r.law.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  function handleSelectRule(rule: DeadlineRule) {
    setSelectedRule(rule)
    setResult(null)
    setStartDate('')
  }

  function handleCalculate() {
    if (!selectedRule || !startDate) return
    const date = new Date(startDate + 'T00:00:00')
    setResult(calculateDeadline(date, selectedRule))
  }

  const daysLeft = result ? daysFromToday(result) : null
  const isExpired = daysLeft !== null && daysLeft < 0
  const isToday = daysLeft === 0

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b border-white/8">
        <h1 className="text-2xl font-semibold tracking-tight">Calculadora de Plazos</h1>
        <p className="text-sm text-white/40 mt-1">
          Calcula plazos procesales según la normativa española vigente
        </p>
      </div>

      <div className="px-6 py-6 flex flex-col gap-4">
        {/* Search + Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre o artículo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#141418] border border-white/8 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
          </div>
          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeCategory === cat.key
                    ? 'bg-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                    : 'bg-[#141418] border border-white/8 text-white/50 hover:text-white/80 hover:border-white/16'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left panel — rule list */}
          <div className="lg:col-span-1 flex flex-col gap-2">
            <p className="text-xs text-white/30 font-medium uppercase tracking-wider px-0.5">
              {filtered.length} plazos
            </p>
            <div className="flex flex-col gap-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <NoResults />
                ) : (
                  filtered.map((rule) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      selected={selectedRule?.id === rule.id}
                      onClick={() => handleSelectRule(rule)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right panel — calculator */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-[#141418] border border-white/8 min-h-[480px] flex flex-col">
              <AnimatePresence mode="wait">
                {!selectedRule ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex items-center justify-center"
                  >
                    <EmptyState />
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedRule.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-5 p-6"
                  >
                    {/* Rule title */}
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <LawBadge law={selectedRule.law} />
                        <CategoryBadge category={selectedRule.category} />
                      </div>
                      <h2 className="text-lg font-semibold text-white">{selectedRule.label}</h2>
                      <p className="text-sm text-white/50">{selectedRule.description}</p>
                    </div>

                    {/* Start from info box */}
                    <div className="flex gap-3 items-start bg-[#2D6BE4]/10 border border-blue-500/20 rounded-xl p-4">
                      <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-0.5">El plazo comienza desde</p>
                        <p className="text-sm text-white/70">{selectedRule.startFrom}</p>
                      </div>
                    </div>

                    {/* Date input */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-white/70">
                        Fecha de inicio
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setResult(null) }}
                        className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-[#0D0D0F] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
                      />
                      <p className="text-xs text-white/30">
                        Tipo de cómputo: <span className="text-white/50 font-medium">{selectedRule.type === 'business' ? 'Días hábiles' : 'Días naturales'}</span>
                        {' · '}{formatDays(selectedRule)}
                      </p>
                    </div>

                    {/* Calculate button */}
                    <button
                      onClick={handleCalculate}
                      disabled={!startDate}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6d31d4] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-all duration-150 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_28px_rgba(124,58,237,0.5)] active:scale-[0.98]"
                    >
                      Calcular plazo
                    </button>

                    {/* Result */}
                    <AnimatePresence>
                      {result && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.25 }}
                          className="flex flex-col gap-3"
                        >
                          {/* Result card */}
                          <div className={`rounded-xl border p-5 flex flex-col gap-4 ${
                            isExpired
                              ? 'bg-red-500/8 border-red-500/25'
                              : 'bg-[#7C3AED]/8 border-purple-500/25'
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">Fecha límite</p>
                                <p className="text-xl font-semibold text-white capitalize">
                                  {formatDate(result)}
                                </p>
                              </div>
                              {/* Days badge */}
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold self-start ${
                                isExpired
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : isToday
                                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}>
                                {isExpired ? (
                                  <>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                    VENCIDO hace {Math.abs(daysLeft!)} días
                                  </>
                                ) : isToday ? (
                                  'Vence HOY'
                                ) : (
                                  `${daysLeft} días restantes`
                                )}
                              </div>
                            </div>

                            {/* Business day note */}
                            {selectedRule.type === 'business' && (
                              <p className="text-xs text-white/35 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Se excluyen sábados, domingos y festivos nacionales
                              </p>
                            )}

                            {/* Add to calendar (disabled) */}
                            <button
                              disabled
                              className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/30 cursor-not-allowed"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Añadir al calendario
                              <span className="text-[10px] bg-white/8 px-1.5 py-0.5 rounded font-medium">Próximamente</span>
                            </button>
                          </div>

                          {/* Warning */}
                          {selectedRule.warning && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="flex gap-3 items-start bg-amber-500/8 border border-amber-500/20 rounded-xl p-4"
                            >
                              <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                              </svg>
                              <div>
                                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-0.5">Advertencia</p>
                                <p className="text-sm text-white/60">{selectedRule.warning}</p>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.15);
        }
      `}</style>
    </div>
  )
}
