// ─── Legal Deadlines — Spanish procedural law ─────────────────────────────────
// 42 plazos: LEC, LECrim, LRJS, LPAC, LJCA, LSC, LGT, CC.

export type Category =
  | 'civil'
  | 'penal'
  | 'laboral'
  | 'administrativo'
  | 'mercantil'
  | 'fiscal'

export type DeadlineUnit = 'business' | 'calendar' | 'months' | 'years'

export interface DeadlineRule {
  id: string
  label: string
  category: Category
  law: string
  norm: string
  amount: number
  unit: DeadlineUnit
  startFrom: string
  description: string
  warning?: string
}

export const SPANISH_HOLIDAYS_2026 = [
  '2026-01-01', // Año Nuevo
  '2026-01-06', // Reyes
  '2026-03-28', // Viernes Santo
  '2026-05-01', // Trabajador
  '2026-08-15', // Asunción
  '2026-10-12', // Fiesta Nacional
  '2026-11-01', // Todos los Santos
  '2026-12-06', // Constitución
  '2026-12-08', // Inmaculada
  '2026-12-25', // Navidad
] as const

export const DEADLINE_RULES: DeadlineRule[] = [
  // CIVIL
  { id: 'civil-contestacion-ordinario', label: 'Contestación a la demanda (juicio ordinario)', category: 'civil', law: 'LEC art. 404', norm: 'LEC', amount: 20, unit: 'business', startFrom: 'Notificación del auto de admisión de la demanda', description: 'Plazo del demandado para contestar a la demanda en el juicio ordinario.' },
  { id: 'civil-contestacion-verbal', label: 'Contestación a la demanda (juicio verbal)', category: 'civil', law: 'LEC art. 438', norm: 'LEC', amount: 10, unit: 'business', startFrom: 'Notificación de la citación para vista', description: 'Plazo para contestar por escrito en el juicio verbal con contestación escrita.' },
  { id: 'civil-reposicion', label: 'Recurso de reposición civil', category: 'civil', law: 'LEC art. 451', norm: 'LEC', amount: 5, unit: 'business', startFrom: 'Notificación de la resolución recurrida', description: 'Recurso contra providencias y autos no definitivos del mismo órgano.' },
  { id: 'civil-apelacion', label: 'Recurso de apelación civil', category: 'civil', law: 'LEC art. 458', norm: 'LEC', amount: 20, unit: 'business', startFrom: 'Notificación de la sentencia de primera instancia', description: 'Plazo para interponer recurso de apelación ante la Audiencia Provincial.' },
  { id: 'civil-casacion', label: 'Recurso de casación civil', category: 'civil', law: 'LEC art. 479', norm: 'LEC', amount: 20, unit: 'business', startFrom: 'Notificación de la sentencia de segunda instancia', description: 'Plazo para interponer recurso de casación ante el Tribunal Supremo.', warning: 'Verificar que la resolución es susceptible de casación por razón de la cuantía o materia.' },
  { id: 'civil-revision', label: 'Recurso de revisión civil', category: 'civil', law: 'LEC art. 512', norm: 'LEC', amount: 3, unit: 'months', startFrom: 'Descubrimiento de los documentos o conocimiento de la causa', description: 'Recurso extraordinario contra sentencias firmes por hechos sobrevenidos.', warning: 'Plazo absoluto de 5 años desde la sentencia firme.' },
  { id: 'civil-ejecucion-sentencia', label: 'Ejecución de sentencia', category: 'civil', law: 'LEC art. 518', norm: 'LEC', amount: 5, unit: 'years', startFrom: 'Fecha en que la sentencia deviene firme', description: 'Plazo para solicitar la ejecución forzosa de una sentencia firme.', warning: 'Transcurridos 5 años desde la firmeza, caduca el derecho a ejecutar.' },
  { id: 'civil-monitorio-oposicion', label: 'Oposición proceso monitorio', category: 'civil', law: 'LEC art. 818', norm: 'LEC', amount: 20, unit: 'business', startFrom: 'Notificación del requerimiento de pago', description: 'Plazo del deudor para formular oposición en el proceso monitorio.', warning: 'Si no se formula oposición, se despachará ejecución automáticamente.' },
  { id: 'civil-rescisoria', label: 'Acción rescisoria', category: 'civil', law: 'CC art. 1299', norm: 'CC', amount: 4, unit: 'years', startFrom: 'Celebración del contrato o acto impugnable', description: 'Plazo para ejercitar la acción de rescisión de contratos.' },
  { id: 'civil-prescripcion-personal', label: 'Prescripción acción personal', category: 'civil', law: 'CC art. 1964', norm: 'CC', amount: 5, unit: 'years', startFrom: 'Fecha en que pudo ejercitarse la acción', description: 'Plazo general de prescripción para acciones personales sin plazo especial.', warning: 'La prescripción puede interrumpirse por reclamación extrajudicial.' },
  { id: 'civil-prescripcion-real-inmueble', label: 'Prescripción acción real (inmueble)', category: 'civil', law: 'CC art. 1963', norm: 'CC', amount: 30, unit: 'years', startFrom: 'Pérdida de la posesión del inmueble', description: 'Plazo de prescripción para acciones reales sobre bienes inmuebles.' },
  { id: 'civil-responsabilidad-extracontractual', label: 'Responsabilidad extracontractual', category: 'civil', law: 'CC art. 1968', norm: 'CC', amount: 1, unit: 'years', startFrom: 'Conocimiento del daño y del responsable', description: 'Acción de responsabilidad civil por culpa o negligencia (1902 CC).' },

  // PENAL
  { id: 'penal-reforma', label: 'Recurso de reforma', category: 'penal', law: 'LECrim art. 222', norm: 'LECrim', amount: 3, unit: 'business', startFrom: 'Notificación de la resolución del Juzgado de Instrucción', description: 'Recurso ante el mismo Juzgado de Instrucción contra autos.' },
  { id: 'penal-apelacion', label: 'Recurso de apelación penal', category: 'penal', law: 'LECrim art. 790', norm: 'LECrim', amount: 10, unit: 'business', startFrom: 'Notificación de la sentencia penal', description: 'Recurso contra sentencias del Juzgado de lo Penal.' },
  { id: 'penal-calificacion', label: 'Escrito de calificación', category: 'penal', law: 'LECrim art. 649', norm: 'LECrim', amount: 5, unit: 'business', startFrom: 'Traslado de la causa para calificación', description: 'Plazo para presentar conclusiones provisionales de acusación o defensa.' },
  { id: 'penal-proposicion-prueba', label: 'Proposición de prueba penal', category: 'penal', law: 'LECrim art. 656', norm: 'LECrim', amount: 10, unit: 'business', startFrom: 'Apertura del juicio oral', description: 'Plazo para proponer pruebas en sumario y procedimiento abreviado.' },
  { id: 'penal-casacion', label: 'Preparación recurso casación penal', category: 'penal', law: 'LECrim art. 856', norm: 'LECrim', amount: 5, unit: 'business', startFrom: 'Notificación de la sentencia de la Audiencia Provincial', description: 'Plazo para preparar el recurso de casación penal ante el TS.', warning: 'Plazo muy breve. La interposición se realiza posteriormente.' },
  { id: 'penal-habeas-corpus', label: 'Habeas corpus', category: 'penal', law: 'LO 6/1984', norm: 'LECrim', amount: 1, unit: 'calendar', startFrom: 'Momento de la detención o privación de libertad', description: 'Plazo máximo de 24 horas para resolver sobre la legalidad de la detención.', warning: 'Procedimiento urgentísimo. Resolución en 24 horas.' },
  { id: 'penal-diligencias-previas', label: 'Diligencias previas (instrucción)', category: 'penal', law: 'LECrim art. 324', norm: 'LECrim', amount: 6, unit: 'months', startFrom: 'Auto de incoación de diligencias previas', description: 'Plazo máximo para instrucción en causas no declaradas complejas.', warning: 'Prorrogable hasta 18 meses en causas complejas.' },
  { id: 'penal-juicio-rapido', label: 'Juicio rápido (celebración)', category: 'penal', law: 'LECrim art. 800', norm: 'LECrim', amount: 15, unit: 'calendar', startFrom: 'Fecha de las diligencias urgentes', description: 'Plazo para celebración del juicio oral en juicio rápido.' },
  { id: 'penal-prision-provisional', label: 'Prisión provisional (duración máxima)', category: 'penal', law: 'LECrim art. 504', norm: 'LECrim', amount: 1, unit: 'years', startFrom: 'Auto que decreta la prisión provisional', description: 'Duración máxima en causas con pena inferior a 3 años.', warning: 'Prorrogable hasta 2 años (pena > 3 años) y 4 años excepcionales.' },

  // LABORAL
  { id: 'laboral-papeleta-cmac', label: 'Papeleta conciliación CMAC/SMAC', category: 'laboral', law: 'LRJS art. 65', norm: 'LRJS', amount: 20, unit: 'business', startFrom: 'Fecha del hecho objeto de reclamación', description: 'Plazo para presentar papeleta de conciliación previa ante el CMAC/SMAC.', warning: 'La presentación suspende el plazo de caducidad.' },
  { id: 'laboral-despido', label: 'Demanda por despido', category: 'laboral', law: 'LRJS art. 59', norm: 'LRJS', amount: 20, unit: 'business', startFrom: 'Fecha efectiva del despido', description: 'Plazo de caducidad para presentar demanda por despido.', warning: 'Plazo de caducidad, no de prescripción.' },
  { id: 'laboral-salarios', label: 'Reclamación de salarios', category: 'laboral', law: 'ET art. 59', norm: 'LRJS', amount: 1, unit: 'years', startFrom: 'Fecha de vencimiento de la obligación de pago', description: 'Prescripción de la acción para reclamar cantidades salariales.' },
  { id: 'laboral-conciliacion-cmac', label: 'Celebración conciliación CMAC', category: 'laboral', law: 'LRJS art. 63', norm: 'LRJS', amount: 15, unit: 'business', startFrom: 'Presentación de la papeleta', description: 'Plazo máximo para celebrar la conciliación previa obligatoria.' },
  { id: 'laboral-suplicacion', label: 'Recurso de suplicación', category: 'laboral', law: 'LRJS art. 194', norm: 'LRJS', amount: 5, unit: 'business', startFrom: 'Notificación de la sentencia del Juzgado de lo Social', description: 'Plazo para anunciar el recurso ante el TSJ.' },
  { id: 'laboral-casacion-unificacion', label: 'Casación unificación de doctrina', category: 'laboral', law: 'LRJS art. 220', norm: 'LRJS', amount: 10, unit: 'business', startFrom: 'Notificación de la sentencia del TSJ', description: 'Casación para unificación de doctrina ante la Sala Social del TS.' },

  // ADMINISTRATIVO
  { id: 'admin-alzada', label: 'Recurso de alzada', category: 'administrativo', law: 'LPAC art. 122', norm: 'LPAC', amount: 1, unit: 'months', startFrom: 'Notificación del acto administrativo impugnado', description: 'Recurso ante el órgano superior jerárquico.', warning: 'Si el acto no es expreso, plazo de 3 meses por silencio.' },
  { id: 'admin-reposicion', label: 'Recurso de reposición administrativo', category: 'administrativo', law: 'LPAC art. 124', norm: 'LPAC', amount: 1, unit: 'months', startFrom: 'Notificación del acto administrativo', description: 'Recurso potestativo ante el mismo órgano que dictó el acto.' },
  { id: 'admin-contencioso', label: 'Recurso contencioso-administrativo', category: 'administrativo', law: 'LJCA art. 46', norm: 'LJCA', amount: 2, unit: 'months', startFrom: 'Notificación de la resolución que agota la vía administrativa', description: 'Recurso ante los Juzgados/Tribunales de lo Contencioso.', warning: 'En silencio negativo, el plazo es de 6 meses.' },
  { id: 'admin-revision-extraordinaria', label: 'Recurso extraordinario de revisión', category: 'administrativo', law: 'LPAC art. 125', norm: 'LPAC', amount: 4, unit: 'years', startFrom: 'Firmeza del acto administrativo', description: 'Recurso extraordinario por causas tasadas.' },
  { id: 'admin-silencio', label: 'Resolución por silencio administrativo', category: 'administrativo', law: 'LPAC art. 21', norm: 'LPAC', amount: 3, unit: 'months', startFrom: 'Presentación de la solicitud', description: 'Plazo general para que la Administración resuelva expresamente.', warning: 'El silencio puede ser positivo o negativo.' },

  // MERCANTIL
  { id: 'mercantil-impugnacion-acuerdo', label: 'Impugnación acuerdos sociales', category: 'mercantil', law: 'LSC art. 205', norm: 'LSC', amount: 1, unit: 'years', startFrom: 'Fecha de adopción del acuerdo social', description: 'Plazo general para impugnar acuerdos de la Junta o el Consejo.', warning: 'Si el acuerdo se inscribió en el Registro Mercantil, plazo se reduce a 3 meses.' },
  { id: 'mercantil-nulidad-acuerdo', label: 'Nulidad acuerdo contrario al orden público', category: 'mercantil', law: 'LSC art. 205.1', norm: 'LSC', amount: 1, unit: 'years', startFrom: 'Conocimiento del acuerdo nulo', description: 'Acuerdos contrarios al orden público.' },
  { id: 'mercantil-responsabilidad-admin', label: 'Acción responsabilidad administradores', category: 'mercantil', law: 'LSC art. 241 bis', norm: 'LSC', amount: 4, unit: 'years', startFrom: 'Día en que pudo ejercitarse la acción', description: 'Prescripción acción social e individual contra administradores.' },
  { id: 'mercantil-concurso-voluntario', label: 'Solicitud concurso voluntario', category: 'mercantil', law: 'TRLC art. 5', norm: 'LSC', amount: 2, unit: 'months', startFrom: 'Conocimiento del estado de insolvencia actual', description: 'Plazo para que el deudor solicite el concurso voluntario.', warning: 'Incumplir puede calificar el concurso como culpable.' },
  { id: 'mercantil-recurso-registral', label: 'Recurso resolución registral', category: 'mercantil', law: 'LSC / RRM', norm: 'LSC', amount: 2, unit: 'months', startFrom: 'Notificación de la calificación negativa del Registrador', description: 'Recurso ante la DGSJFP contra calificación del Registro Mercantil.' },

  // FISCAL
  { id: 'fiscal-reposicion-tributaria', label: 'Recurso de reposición tributaria', category: 'fiscal', law: 'LGT art. 223', norm: 'LGT', amount: 1, unit: 'months', startFrom: 'Notificación del acto tributario', description: 'Recurso potestativo ante el órgano que dictó el acto.' },
  { id: 'fiscal-economico-administrativa', label: 'Reclamación económico-administrativa', category: 'fiscal', law: 'LGT art. 235', norm: 'LGT', amount: 1, unit: 'months', startFrom: 'Notificación del acto o desestimación de la reposición', description: 'Vía económico-administrativa previa al contencioso (TEAR / TEAC).' },
  { id: 'fiscal-prescripcion-tributaria', label: 'Prescripción tributaria', category: 'fiscal', law: 'LGT art. 66', norm: 'LGT', amount: 4, unit: 'years', startFrom: 'Día siguiente al fin del plazo voluntario de declaración', description: 'Prescripción del derecho a liquidar y exigir el pago.', warning: 'Se interrumpe por cualquier actuación administrativa.' },
  { id: 'fiscal-aplazamiento', label: 'Solicitud aplazamiento deuda tributaria', category: 'fiscal', law: 'LGT art. 65', norm: 'LGT', amount: 1, unit: 'months', startFrom: 'Inicio del periodo voluntario o ejecutivo', description: 'Plazo de referencia para solicitud de aplazamiento/fraccionamiento.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function isSpanishHoliday(date: Date): boolean {
  return (SPANISH_HOLIDAYS_2026 as readonly string[]).includes(ymd(date))
}

export function isWorkingDay(date: Date): boolean {
  const dow = date.getDay()
  if (dow === 0 || dow === 6) return false
  return !isSpanishHoliday(date)
}

function addCalendarDays(start: Date, days: number): Date {
  const d = new Date(start)
  d.setDate(d.getDate() + days)
  return d
}

function addBusinessDays(start: Date, days: number): { end: Date; holidays: Date[] } {
  const d = new Date(start)
  const holidays: Date[] = []
  let remaining = days
  while (remaining > 0) {
    d.setDate(d.getDate() + 1)
    if (isWorkingDay(d)) {
      remaining--
    } else if (isSpanishHoliday(d)) {
      holidays.push(new Date(d))
    }
  }
  return { end: d, holidays }
}

function addMonths(start: Date, months: number): Date {
  const d = new Date(start)
  d.setMonth(d.getMonth() + months)
  return d
}

function addYears(start: Date, years: number): Date {
  const d = new Date(start)
  d.setFullYear(d.getFullYear() + years)
  return d
}

export interface DeadlineResult {
  rule: DeadlineRule
  startDate: Date
  deadlineDate: Date
  businessDays: number
  holidays: Date[]
  status: 'expired' | 'urgent' | 'ok'
  daysLeft: number
}

export function calculateDeadline(plazoId: string, startDate: Date): DeadlineResult | null {
  const rule = DEADLINE_RULES.find(r => r.id === plazoId)
  if (!rule) return null

  let deadlineDate: Date
  let holidays: Date[] = []

  switch (rule.unit) {
    case 'business': {
      const r = addBusinessDays(startDate, rule.amount)
      deadlineDate = r.end
      holidays = r.holidays
      break
    }
    case 'calendar':
      deadlineDate = addCalendarDays(startDate, rule.amount)
      break
    case 'months':
      deadlineDate = addMonths(startDate, rule.amount)
      break
    case 'years':
      deadlineDate = addYears(startDate, rule.amount)
      break
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dl = new Date(deadlineDate)
  dl.setHours(0, 0, 0, 0)
  const daysLeft = Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const status: DeadlineResult['status'] =
    daysLeft < 0 ? 'expired' : daysLeft <= 7 ? 'urgent' : 'ok'

  return {
    rule,
    startDate,
    deadlineDate,
    businessDays: rule.unit === 'business' ? rule.amount : 0,
    holidays,
    status,
    daysLeft,
  }
}

function icsDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export function buildICS(result: DeadlineResult): string {
  const uid = `${result.rule.id}-${Date.now()}@iuralex.app`
  const stamp = icsDate(new Date()) + 'T120000Z'
  const start = icsDate(result.deadlineDate)
  const summary = `IURALEX · ${result.rule.label}`
  const desc = `${result.rule.description}\\nNorma: ${result.rule.law}\\nInicio cómputo: ${result.rule.startFrom}`
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IURALEX//Plazos Procesales//ES',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${desc}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function formatAmount(rule: DeadlineRule): string {
  const { amount, unit } = rule
  if (unit === 'years') return `${amount} ${amount === 1 ? 'año' : 'años'}`
  if (unit === 'months') return `${amount} ${amount === 1 ? 'mes' : 'meses'}`
  if (unit === 'business') return `${amount} días hábiles`
  return `${amount} días naturales`
}

export const CATEGORY_LABELS: Record<Category, string> = {
  civil: 'Civil',
  penal: 'Penal',
  laboral: 'Laboral',
  administrativo: 'Administrativo',
  mercantil: 'Mercantil',
  fiscal: 'Fiscal',
}

export const CATEGORY_COLORS: Record<Category, { color: string; bg: string; border: string }> = {
  civil:          { color: '#1D4ED8', bg: 'rgba(29,78,216,0.10)',  border: 'rgba(29,78,216,0.25)' },
  penal:          { color: '#DC2626', bg: 'rgba(220,38,38,0.10)',  border: 'rgba(220,38,38,0.25)' },
  laboral:        { color: '#C2410C', bg: 'rgba(194,65,12,0.10)',  border: 'rgba(194,65,12,0.25)' },
  administrativo: { color: '#0369A1', bg: 'rgba(3,105,161,0.10)',  border: 'rgba(3,105,161,0.25)' },
  mercantil:      { color: '#6D28D9', bg: 'rgba(109,40,217,0.10)', border: 'rgba(109,40,217,0.25)' },
  fiscal:         { color: '#0F766E', bg: 'rgba(15,118,110,0.10)', border: 'rgba(15,118,110,0.25)' },
}
