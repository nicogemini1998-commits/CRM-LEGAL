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

const CATEGORY_COLORS: Record<Category, { color: string; bg: string }> = {
  civil:          { color: '#1D4ED8', bg: 'rgba(29,78,216,0.1)'   },
  penal:          { color: '#DC2626', bg: 'rgba(220,38,38,0.1)'   },
  laboral:        { color: '#C2410C', bg: 'rgba(194,65,12,0.1)'   },
  administrativo: { color: '#0369A1', bg: 'rgba(3,105,161,0.1)'   },
  mercantil:      { color: '#6D28D9', bg: 'rgba(109,40,217,0.1)'  },
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

const CAT_LABELS: Record<Category, string> = {
  civil: 'Civil', penal: 'Penal', laboral: 'Laboral',
  administrativo: 'Administrativo', mercantil: 'Mercantil',
}

function CategoryBadge({ category }: { category: Category }) {
  const c = CATEGORY_COLORS[category]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: c.bg, color: c.color }}>
      {CAT_LABELS[category]}
    </span>
  )
}

function LawBadge({ law }: { law: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontFamily: 'monospace', fontWeight: 600, background: 'rgba(124,58,237,0.08)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}>
      {law}
    </span>
  )
}

function RuleCard({ rule, selected, onClick }: { rule: DeadlineRule; selected: boolean; onClick: () => void }) {
  const c = CATEGORY_COLORS[rule.category]
  return (
    <motion.button
      layout onClick={onClick}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
      whileTap={{ scale: 0.99 }}
      style={{
        width: '100%', textAlign: 'left', padding: '12px', borderRadius: 10, cursor: 'pointer',
        transition: 'all 0.15s',
        background: selected ? 'rgba(124,58,237,0.06)' : 'var(--surface)',
        border: selected ? '1px solid rgba(124,58,237,0.35)' : '1px solid var(--hairline)',
        boxShadow: selected ? '0 0 0 1px rgba(124,58,237,0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = c.color + '40'; e.currentTarget.style.background = c.bg } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.background = 'var(--surface)' } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-primary)', lineHeight: 1.3 }}>{rule.label}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          <LawBadge law={rule.law} />
          <CategoryBadge category={rule.category} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 2 }}>
          {formatDays(rule)} · {rule.type === 'business' ? 'días hábiles' : 'días naturales'}
        </p>
      </div>
    </motion.button>
  )
}

function EmptyState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 16 }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
        📅
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-secondary)' }}>Selecciona un plazo</p>
        <p style={{ fontSize: 12, color: 'var(--ink-tertiary)', marginTop: 4 }}>Elige una norma de la lista para calcular la fecha límite</p>
      </div>
    </div>
  )
}

function NoResults() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 8 }}>
      <p style={{ fontSize: 24 }}>🔍</p>
      <p style={{ fontSize: 13, color: 'var(--ink-tertiary)' }}>No se encontraron plazos</p>
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
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ paddingBottom: 32, borderBottom: '1px solid var(--hairline)', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, marginBottom: 16, background: 'rgba(3,105,161,0.08)', border: '1px solid rgba(3,105,161,0.2)', fontSize: 11, fontWeight: 600, color: '#0369A1', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          ⏱ Plazos Procesales · Normativa Española
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 8, lineHeight: 1.2 }}>
          Calculadora de{' '}
          <span style={{ background: 'linear-gradient(135deg, #0369A1, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            plazos procesales
          </span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-secondary)', lineHeight: 1.6, maxWidth: 560 }}>
          Calcula fechas límite según LEC, LECrim, LRJS, LPAC y LSC. Distingue entre días hábiles y naturales, excluye festivos nacionales automáticamente.
        </p>
      </motion.div>

      {/* Search + Filters */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-tertiary)' }}
            width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeWidth="2" />
          </svg>
          <input type="text" placeholder="Buscar plazo por nombre o artículo…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10, borderRadius: 10, fontSize: 13, color: 'var(--ink-primary)', background: 'var(--surface)', border: '1px solid var(--hairline)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                background: activeCategory === cat.key ? 'var(--obsidian)' : 'var(--surface)',
                color: activeCategory === cat.key ? 'var(--lime)' : 'var(--ink-secondary)',
                border: activeCategory === cat.key ? '1px solid var(--obsidian)' : '1px solid var(--hairline)',
              }}>{cat.label}</button>
          ))}
        </div>
      </div>

      {/* Main 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

        {/* LEFT: rule list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {filtered.length} plazos disponibles
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 'calc(100vh - 320px)', overflowY: 'auto', paddingRight: 4 }}>
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? <NoResults /> : filtered.map(rule => (
                <RuleCard key={rule.id} rule={rule} selected={selectedRule?.id === rule.id} onClick={() => handleSelectRule(rule)} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: calculator */}
        <div style={{ borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--hairline)', minHeight: 480, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <AnimatePresence mode="wait">
            {!selectedRule ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 480 }}>
                <EmptyState />
              </motion.div>
            ) : (
              <motion.div key={selectedRule.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 28 }}>

                {/* Rule info */}
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    <LawBadge law={selectedRule.law} />
                    <CategoryBadge category={selectedRule.category} />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 6 }}>{selectedRule.label}</h2>
                  <p style={{ fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.6 }}>{selectedRule.description}</p>
                </div>

                {/* Start from */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', borderRadius: 10, background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.15)' }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>El plazo empieza desde</p>
                    <p style={{ fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.5 }}>{selectedRule.startFrom}</p>
                  </div>
                </div>

                {/* Date input */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)', marginBottom: 8 }}>Fecha de inicio del plazo</label>
                  <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setResult(null) }}
                    style={{ padding: '9px 14px', borderRadius: 10, fontSize: 13, color: 'var(--ink-primary)', background: 'var(--surface-elevated)', border: '1px solid var(--hairline)', outline: 'none' }}
                  />
                  <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 6 }}>
                    Cómputo: <strong style={{ color: 'var(--ink-secondary)' }}>{selectedRule.type === 'business' ? 'Días hábiles' : 'Días naturales'}</strong>
                    {' · '}{formatDays(selectedRule)}
                  </p>
                </div>

                {/* Button */}
                <button onClick={handleCalculate} disabled={!startDate}
                  style={{ alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 10, border: 'none', cursor: startDate ? 'pointer' : 'not-allowed', opacity: startDate ? 1 : 0.4, fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #7C3AED, #6366F1)', boxShadow: startDate ? '0 4px 16px rgba(124,58,237,0.3)' : 'none', transition: 'all 0.15s' }}>
                  Calcular fecha límite
                </button>

                {/* Result */}
                <AnimatePresence>
                  {result && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ borderRadius: 12, padding: '20px 24px', border: `1px solid ${isExpired ? 'rgba(220,38,38,0.2)' : 'rgba(124,58,237,0.2)'}`, background: isExpired ? 'rgba(220,38,38,0.05)' : 'rgba(124,58,237,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-tertiary)', marginBottom: 6 }}>Fecha límite</p>
                            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-primary)', textTransform: 'capitalize' }}>{formatDate(result)}</p>
                          </div>
                          <div style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: isExpired ? 'rgba(220,38,38,0.1)' : isToday ? 'rgba(217,119,6,0.1)' : 'rgba(22,163,74,0.1)', color: isExpired ? '#DC2626' : isToday ? '#D97706' : '#16A34A', border: `1px solid ${isExpired ? 'rgba(220,38,38,0.2)' : isToday ? 'rgba(217,119,6,0.2)' : 'rgba(22,163,74,0.2)'}` }}>
                            {isExpired ? `⚠️ VENCIDO hace ${Math.abs(daysLeft!)} días` : isToday ? '🔴 Vence HOY' : `✅ ${daysLeft} días restantes`}
                          </div>
                        </div>
                        {selectedRule.type === 'business' && (
                          <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
                            📅 Se excluyen sábados, domingos y festivos nacionales españoles
                          </p>
                        )}
                        <button disabled style={{ marginTop: 14, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--surface-elevated)', fontSize: 11, color: 'var(--ink-tertiary)', cursor: 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          📆 Añadir al calendario <span style={{ fontSize: 10, background: 'var(--surface-sunken)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>Próximamente</span>
                        </button>
                      </div>
                      {selectedRule.warning && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          style={{ display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)' }}>
                          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Advertencia</p>
                            <p style={{ fontSize: 12, color: 'var(--ink-secondary)', lineHeight: 1.6 }}>{selectedRule.warning}</p>
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
  )
}
