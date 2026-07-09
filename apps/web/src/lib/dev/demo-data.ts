// Datos demo para desarrollo sin Supabase
// Se usan automáticamente cuando NEXT_PUBLIC_SUPABASE_URL contiene "placeholder"
// Fechas relativas a hoy: 2026-05-21
//
// Importable desde las route handlers cuando IS_DEV_WITHOUT_DB === true
// (ver /api/cases, /api/clients, /api/documents)

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

// Helper interno: fecha ISO relativa a hoy (dinámica)
const NOW = Date.now()
const daysAgo = (n: number, hours = 10, mins = 0): string => {
  const d = new Date(NOW - n * 86400000)
  d.setUTCHours(hours, mins, 0, 0)
  return d.toISOString()
}

// ────────────────────────────────────────────────────────────────────
// CLIENTES (8 — mix individuos y empresas, geografía variada)
// ────────────────────────────────────────────────────────────────────
export const DEMO_CLIENTS = [
  {
    id: 'c9000000-0000-0000-0000-000000000009',
    user_id: DEMO_USER_ID,
    name: 'Rebel Profesional',
    email: null,
    phone: null,
    type: 'company',
    nif_cif: 'B44531564',
    address: 'Avd Jaime I, nº6, Vall De Uxó, Castellón',
    notes: 'Contrato Sistema CLICK (CLICKMI/NVMGN SLU, CIF B44543213). Fecha: 08/04/2026. Fee fijo: 499€/mes + IVA. Variable: 31,50€/lead cualificado + IVA (liquidación trimestral). Inv. publicitaria: 583,33€/mes (cargo cliente). Objetivo: 10 leads/mes. Duración: 3 meses, renovación automática con 15d preaviso. Garantía 30d: devolución fee fijo. Fuero: Madrid.',
    created_at: daysAgo(0),
  },
]

export const DEMO_CASES = [
  {
    id: 'e9000000-0000-0000-0000-000000000009',
    user_id: DEMO_USER_ID,
    client_id: 'c9000000-0000-0000-0000-000000000009',
    title: 'Revisión Contrato Sistema CLICK — CLICKMI / Rebel Profesional',
    description: 'Análisis y revisión del contrato de prestación de servicios de generación de leads cualificados suscrito con NVMGN SLU (CLICKMI). Fecha contrato: 08/04/2026. Fee fijo: 499€/mes + IVA. Variable: 31,50€/lead. Inversión publicitaria: 583,33€/mes. Objetivo: 10 leads/mes. Duración: 3 meses renovables.',
    status: 'open',
    case_number: 'EXP-2026-0001',
    area: 'Mercantil',
    amount: 499,
    created_at: daysAgo(55),
    clients: { name: 'Rebel Profesional', email: null },
  },
]

export const DEMO_DOCUMENTS = [
  {
    id: 'd9000000-0000-0000-0000-000000000009',
    user_id: DEMO_USER_ID,
    case_id: 'e9000000-0000-0000-0000-000000000009',
    client_id: 'c9000000-0000-0000-0000-000000000009',
    title: 'Contrato Sistema CLICK — CLICKMI vs Rebel Profesional.pdf',
    document_type: 'contract',
    doc_type: 'contrato_servicios',
    file_type: 'pdf',
    confidential: false,
    storage_path: null,
    file_hash: null,
    deleted_at: null,
    created_at: daysAgo(55),
    content_markdown: `# CONTRATO DE PRESTACIÓN DE SERVICIOS — SISTEMA CLICK

**NVMGN SLU (CLICKMI)** vs **Rebel Profesional (B44531564)**
Fecha: 08/04/2026

## Partes
- **CLICKMI**: NVMGN SLU, CIF B44543213, Paseo de la Castellana 194, 28046 Madrid
- **CLIENTE**: Rebel Profesional, CIF B44531564, Avd Jaime I nº6, Vall De Uxó, Castellón

## Objeto
Implantación y gestión del Sistema CLICK: captación y cualificación de oportunidades comerciales.

## Lead Cualificado
Prospecto que ha superado filtrado previo (perfil, necesidad, capacidad de compra) y ha agendado cita confirmada en el calendario del cliente.

## Modelo Económico
- Fee fijo mensual: 499 € + IVA (pagado por adelantado)
- Variable por lead cualificado: 31,50 € + IVA (liquidación trimestral)
- Inversión publicitaria: 583,33 €/mes (a cargo del cliente, no incluida en fee)

## Objetivo
10 leads cualificados/mes (referencia operativa, no garantía).

## Duración
3 meses naturales. Renovación automática por periodos iguales salvo comunicación con 15 días de antelación.

## Garantías
- 30 primeros días: devolución íntegra del fee fijo si el cliente resuelve (no se devuelve inversión publicitaria).
- < 50% objetivo: extensión 2 meses sin cobro del variable.
- 50-79% objetivo: extensión previa conversación entre partes.
- ≥ 80% objetivo: cumplimiento razonable.

## Limitación de Responsabilidad
Responsabilidad máxima de CLICKMI: importe del fee fijo del periodo afectado.

## Jurisdicción
Juzgados y Tribunales de Madrid.`,
  },
]

export const DEMO_ANALYSES = [
  {
    id: 'a9000000-0000-0000-0000-000000000009',
    document_id: 'd9000000-0000-0000-0000-000000000009',
    case_id: 'e9000000-0000-0000-0000-000000000009',
    user_id: DEMO_USER_ID,
    analysis_type: 'FULL',
    content: {
      risk_level: 'MEDIO',
      summary: 'Contrato de prestación de servicios de generación de leads. Estructura económica con fee fijo (499€/mes) + variable por lead (31,50€) + inversión publicitaria separada (583,33€/mes). Duración 3 meses con renovación automática. Se identifican riesgos en la limitación de responsabilidad, la cláusula de inversión publicitaria no reembolsable y el fuero pactado en Madrid.',
      clauses_risks: [
        'Cláusula 11 — Responsabilidad máxima limitada al fee fijo (499€), inferior al total de exposición mensual (~1.397€ incluyendo publicidad y variable).',
        'Cláusula 9.1 — Inversión publicitaria (583,33€/mes) no reembolsable aunque se resuelva en los 30 primeros días.',
        'Cláusula 8 — Renovación automática por 3 meses con solo 15 días de preaviso. Riesgo de renovación no deseada.',
        'Cláusula 13 — Fuero pactado en Madrid. Cliente tiene domicilio en Castellón (desplazamiento en litigio).',
        'Cláusula 9.2 — Tramo 50-79% del objetivo sin garantías automáticas. Ambigüedad en la interpretación.',
      ],
      recommendations: [
        'Negociar devolución prorrateada de inversión publicitaria en los primeros 30 días.',
        'Clarificar tramo 50-79%: incluir umbral concreto y extensión sin cargo automática.',
        'Modificar fuero a Valencia o domicilio del demandado.',
        'Añadir SLA: periodicidad de informes, tiempo de respuesta y penalizaciones por incumplimiento.',
        'Definir qué ocurre con citas canceladas post-confirmación.',
      ],
    },
    tokens_input: 8420,
    tokens_output: 1150,
    tokens_cache: 4800,
    cost_eur_cents: 12,
    created_at: daysAgo(55),
  },
]

// In-memory mutable store for demo-mode auto-analyses created on upload
type DemoAnalysisStatus = 'pending' | 'done' | 'error'
export interface DemoAnalysisRecord {
  id: string
  document_id: string
  case_id: string | null
  user_id: string
  analysis_type: string
  status?: DemoAnalysisStatus
  content: Record<string, unknown>
  tokens_input: number
  tokens_output: number
  tokens_cache: number
  cost_eur_cents: number
  created_at: string
}

export const DEMO_ANALYSES_STORE: DemoAnalysisRecord[] = (DEMO_ANALYSES as DemoAnalysisRecord[])
  .map(a => ({ ...a, status: 'done' as DemoAnalysisStatus }))

export function getDemoAnalysisForDoc(docId: string): DemoAnalysisRecord | null {
  const list = DEMO_ANALYSES_STORE.filter(a => a.document_id === docId)
  if (list.length === 0) return null
  return list.sort((x, y) => y.created_at.localeCompare(x.created_at))[0]
}

export function enqueueDemoAnalysis(opts: {
  documentId: string
  caseId?: string | null
  userId: string
  title: string
  documentType: string
}): DemoAnalysisRecord {
  const id = `auto-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const placeholder: DemoAnalysisRecord = {
    id,
    document_id: opts.documentId,
    case_id: opts.caseId ?? null,
    user_id: opts.userId,
    analysis_type: 'FULL',
    status: 'pending',
    content: { risk_level: 'PENDIENTE', summary: 'LEXIA está analizando el documento…', clauses_risks: [], recommendations: [] },
    tokens_input: 0,
    tokens_output: 0,
    tokens_cache: 0,
    cost_eur_cents: 0,
    created_at: new Date().toISOString(),
  }
  DEMO_ANALYSES_STORE.unshift(placeholder)
  setTimeout(() => {
    const idx = DEMO_ANALYSES_STORE.findIndex(a => a.id === id)
    if (idx === -1) return
    const risks: Array<'ALTO' | 'MEDIO' | 'BAJO'> = ['ALTO', 'MEDIO', 'BAJO']
    const pick = risks[Math.floor(Math.random() * risks.length)]
    DEMO_ANALYSES_STORE[idx] = {
      ...DEMO_ANALYSES_STORE[idx],
      status: 'done',
      content: {
        risk_level: pick,
        summary: `Análisis automático de "${opts.title}". LEXIA ha revisado el documento y detectado los puntos clave a continuación.`,
        clauses_risks: [
          'Revisar fechas y plazos legales aplicables al documento.',
          'Verificar identidad y capacidad de las partes intervinientes.',
          'Confirmar conformidad con la normativa vigente (BOE consolidado 2026).',
        ],
        recommendations: [
          'Validar con jurisprudencia reciente del TS / TJUE.',
          'Considerar añadir cláusula de resolución anticipada equilibrada.',
          'Documentar todas las modificaciones con control de versiones.',
        ],
      },
      tokens_input: 6500 + Math.floor(Math.random() * 4000),
      tokens_output: 900 + Math.floor(Math.random() * 600),
      tokens_cache: 3500 + Math.floor(Math.random() * 2500),
      cost_eur_cents: 8 + Math.floor(Math.random() * 8),
    }
  }, 3000)
  return placeholder
}

export const DEMO_GENERATED_CONTRACTS: unknown[] = []

// ────────────────────────────────────────────────────────────────────
// CONVERSACIONES LEXIA (in-memory, persiste en sesión de servidor)
// ────────────────────────────────────────────────────────────────────

export interface DemoMessage {
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface DemoConversation {
  id: string
  user_id: string
  title: string
  client_id: string | null
  created_at: string
  updated_at: string
  messages: DemoMessage[]
}

const g = globalThis as unknown as { __demoConversations?: DemoConversation[]; __demoConvsLoaded?: boolean }
if (!g.__demoConversations) {
  g.__demoConversations = []
  // Bootstrap: cargar conversaciones persistidas en disco al arrancar
  if (!g.__demoConvsLoaded) {
    g.__demoConvsLoaded = true
    try {
      // Dynamic require to avoid SSR issues — fire-and-forget sync read
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { readStore } = require('./persist') as { readStore: () => { conversations: DemoConversation[]; uploadedDocuments: unknown[] } }
      const stored = readStore()
      if (stored.conversations?.length) g.__demoConversations.push(...stored.conversations)
    } catch { /* no data yet — fresh start */ }
  }
}
export const DEMO_CONVERSATIONS: DemoConversation[] = g.__demoConversations

export function createDemoConversation(title: string, clientId?: string | null): DemoConversation {
  const conv: DemoConversation = {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user_id: DEMO_USER_ID,
    title: title.slice(0, 60),
    client_id: clientId ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: [],
  }
  DEMO_CONVERSATIONS.unshift(conv)
  return conv
}

export function addDemoMessage(convId: string, role: 'user' | 'assistant', content: string): void {
  const conv = DEMO_CONVERSATIONS.find(c => c.id === convId)
  if (!conv) return
  conv.messages.push({ role, content, created_at: new Date().toISOString() })
  conv.updated_at = new Date().toISOString()
}

export function deleteDemoConversation(convId: string): boolean {
  const idx = DEMO_CONVERSATIONS.findIndex(c => c.id === convId)
  if (idx === -1) return false
  DEMO_CONVERSATIONS.splice(idx, 1)
  return true
}

// ────────────────────────────────────────────────────────────────────
// STATS (computado dinámicamente)
// ────────────────────────────────────────────────────────────────────
export const DEMO_STATS = {
  cases: DEMO_CASES.filter(c => c.status === 'open').length,
  cases_total: DEMO_CASES.length,
  documents: DEMO_DOCUMENTS.length,
  clients: DEMO_CLIENTS.length,
  analyses: DEMO_ANALYSES.length,
  contracts_generated: DEMO_GENERATED_CONTRACTS.length,
}

// ────────────────────────────────────────────────────────────────────
// USER TEMPLATES (in-memory store for demo mode)
// Backed by /api/templates GET/POST/DELETE. In production, swap to Supabase.
// ────────────────────────────────────────────────────────────────────

export interface UserTemplateField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'number'
  required: boolean
  options?: string[]
}

export interface UserTemplate {
  id: string
  user_id: string | null
  title: string
  description: string
  category: string
  emoji: string
  fields: UserTemplateField[]
  prompt: string
  created_at: string  // ISO 8601
}

// Mutable in-memory list. The /api/templates route mutates this in place.
export const USER_TEMPLATES: UserTemplate[] = []

/**
 * Update a user template in memory. Returns true if the template was found and updated,
 * or false if not found / not owned by the user.
 * In production this should be replaced by a Supabase UPDATE.
 */
export function updateUserTemplate(
  id: string,
  userId: string,
  data: Pick<UserTemplate, 'title' | 'description' | 'category' | 'emoji' | 'fields' | 'prompt'>,
): boolean {
  const idx = USER_TEMPLATES.findIndex(
    t => t.id === id && (t.user_id === userId || t.user_id === null),
  )
  if (idx === -1) return false
  USER_TEMPLATES[idx] = { ...USER_TEMPLATES[idx], ...data }
  return true
}

/**
 * Delete a user template from memory by id (scoped to owner / public).
 * Returns true if removed, false if not found.
 */
export function deleteUserTemplate(id: string, userId: string): boolean {
  const idx = USER_TEMPLATES.findIndex(
    t => t.id === id && (t.user_id === userId || t.user_id === null),
  )
  if (idx === -1) return false
  USER_TEMPLATES.splice(idx, 1)
  return true
}

// ────────────────────────────────────────────────────────────────────
// PLAZOS ACTIVOS (12 — vinculados a DEMO_CASES, mix de estados temporales)
// ────────────────────────────────────────────────────────────────────

export interface DemoDeadline {
  id: string
  user_id: string
  case_id: string
  case_title: string
  client_name: string
  action: string
  law_ref: string
  deadline_date: string  // ISO
  status: 'pending' | 'completed' | 'expired'
  priority: 'critical' | 'high' | 'medium'
  created_at: string
}

// Helper: fecha futura/pasada relativa a TODAY (2026-05-21)
const dateAt = (daysFromToday: number, hours = 12, mins = 0): string => {
  const d = new Date(NOW + daysFromToday * 86400000)
  d.setUTCHours(hours, mins, 0, 0)
  return d.toISOString()
}

const DEMO_DEADLINES_INITIAL: DemoDeadline[] = [
  {
    id: 'p9000000-0000-0000-0000-000000000009',
    user_id: DEMO_USER_ID,
    case_id: 'e9000000-0000-0000-0000-000000000009',
    case_title: 'Revisión Contrato Sistema CLICK — CLICKMI / Rebel Profesional',
    client_name: 'Rebel Profesional',
    action: 'Verificar cumplimiento objetivo 10 leads/mes (fin periodo inicial)',
    law_ref: 'Contrato CLICK cláusula 9.2',
    deadline_date: dateAt(36, 12, 0),
    status: 'pending',
    priority: 'high',
    created_at: daysAgo(55),
  },
  {
    id: 'p9000000-0000-0000-0000-000000000010',
    user_id: DEMO_USER_ID,
    case_id: 'e9000000-0000-0000-0000-000000000009',
    case_title: 'Revisión Contrato Sistema CLICK — CLICKMI / Rebel Profesional',
    client_name: 'Rebel Profesional',
    action: 'Notificar no renovación si procede (15 días antes del vencimiento)',
    law_ref: 'Contrato CLICK cláusula 8',
    deadline_date: dateAt(21, 12, 0),
    status: 'pending',
    priority: 'critical',
    created_at: daysAgo(55),
  },
]

// Mutable store global (sobrevive HMR)
export const DEMO_DEADLINES: DemoDeadline[] = (() => {
  const g = globalThis as unknown as { __demoDeadlines?: DemoDeadline[] }
  if (!g.__demoDeadlines) g.__demoDeadlines = [...DEMO_DEADLINES_INITIAL]
  return g.__demoDeadlines
})()

export function updateDemoDeadline(id: string, patch: Partial<DemoDeadline>): DemoDeadline | null {
  const idx = DEMO_DEADLINES.findIndex(d => d.id === id)
  if (idx === -1) return null
  DEMO_DEADLINES[idx] = { ...DEMO_DEADLINES[idx], ...patch }
  return DEMO_DEADLINES[idx]
}

export function deleteDemoDeadline(id: string): boolean {
  const idx = DEMO_DEADLINES.findIndex(d => d.id === id)
  if (idx === -1) return false
  DEMO_DEADLINES.splice(idx, 1)
  return true
}



// ────────────────────────────────────────────────────────────────────
// DOCFLOW — Fee Schedules, Budgets, Engagements, Invoices
// ────────────────────────────────────────────────────────────────────

export interface DemoFeeSchedule {
  id: string
  user_id: string
  case_area: string
  case_type: string
  label: string
  base_amount_cents: number
  hourly_rate_cents: number
  success_fee_pct: number
  iva_pct: number
  active: boolean
  created_at: string
}

export const DEMO_FEE_SCHEDULES: DemoFeeSchedule[] = [
  { id: 'fs-001', user_id: DEMO_USER_ID, case_area: 'Civil', case_type: 'monitorio', label: 'Monitorio < 30.000€', base_amount_cents: 80000, hourly_rate_cents: 0, success_fee_pct: 0, iva_pct: 21, active: true, created_at: daysAgo(180) },
  { id: 'fs-002', user_id: DEMO_USER_ID, case_area: 'Civil', case_type: 'reclamacion_cantidad', label: 'Reclamación cantidad ordinario', base_amount_cents: 250000, hourly_rate_cents: 0, success_fee_pct: 0, iva_pct: 21, active: true, created_at: daysAgo(180) },
  { id: 'fs-003', user_id: DEMO_USER_ID, case_area: 'Laboral', case_type: 'despido_improc', label: 'Despido improcedente', base_amount_cents: 120000, hourly_rate_cents: 0, success_fee_pct: 10, iva_pct: 21, active: true, created_at: daysAgo(180) },
  { id: 'fs-004', user_id: DEMO_USER_ID, case_area: 'Familia', case_type: 'divorcio_cont', label: 'Divorcio contencioso', base_amount_cents: 200000, hourly_rate_cents: 0, success_fee_pct: 0, iva_pct: 21, active: true, created_at: daysAgo(180) },
  { id: 'fs-005', user_id: DEMO_USER_ID, case_area: 'Mercantil', case_type: 'constitucion_sl', label: 'Constitución SL completa', base_amount_cents: 90000, hourly_rate_cents: 0, success_fee_pct: 0, iva_pct: 21, active: true, created_at: daysAgo(180) },
  { id: 'fs-006', user_id: DEMO_USER_ID, case_area: 'Penal', case_type: 'defensa_penal', label: 'Defensa penal (primera instancia)', base_amount_cents: 300000, hourly_rate_cents: 0, success_fee_pct: 0, iva_pct: 21, active: true, created_at: daysAgo(180) },
  { id: 'fs-007', user_id: DEMO_USER_ID, case_area: 'Administrativo', case_type: 'recurso_admin', label: 'Recurso contencioso-administrativo', base_amount_cents: 180000, hourly_rate_cents: 0, success_fee_pct: 0, iva_pct: 21, active: true, created_at: daysAgo(180) },
  { id: 'fs-008', user_id: DEMO_USER_ID, case_area: 'Civil', case_type: 'herencia', label: 'Herencia y partición de bienes', base_amount_cents: 150000, hourly_rate_cents: 0, success_fee_pct: 1.5, iva_pct: 21, active: true, created_at: daysAgo(180) },
  { id: 'fs-009', user_id: DEMO_USER_ID, case_area: 'Civil', case_type: 'arrendamiento', label: 'Desahucio arrendamiento', base_amount_cents: 70000, hourly_rate_cents: 0, success_fee_pct: 0, iva_pct: 21, active: true, created_at: daysAgo(180) },
  { id: 'fs-010', user_id: DEMO_USER_ID, case_area: 'Laboral', case_type: 'accidente_trabajo', label: 'Accidente de trabajo — reclamación', base_amount_cents: 0, hourly_rate_cents: 15000, success_fee_pct: 15, iva_pct: 21, active: true, created_at: daysAgo(180) },
  { id: 'fs-011', user_id: DEMO_USER_ID, case_area: 'Mercantil', case_type: 'concurso_acreedores', label: 'Concurso de acreedores (administrador concursal)', base_amount_cents: 500000, hourly_rate_cents: 0, success_fee_pct: 0, iva_pct: 21, active: true, created_at: daysAgo(180) },
  { id: 'fs-012', user_id: DEMO_USER_ID, case_area: 'Civil', case_type: 'vicios_constructivos', label: 'Vicios constructivos — reclamación promotora', base_amount_cents: 350000, hourly_rate_cents: 0, success_fee_pct: 10, iva_pct: 21, active: true, created_at: daysAgo(180) },
]

export interface DemoLineItem {
  description: string
  quantity: number
  unit_price_cents: number
  total_cents: number
}

export interface DemoBudget {
  id: string
  user_id: string
  case_id: string | null
  client_id: string
  budget_number: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  total_cents: number
  iva_cents: number
  grand_total_cents: number
  line_items: DemoLineItem[]
  sent_at: string | null
  accepted_at: string | null
  expires_at: string | null
  created_at: string
}

export const DEMO_BUDGETS: DemoBudget[] = []

export interface DemoEngagement {
  id: string
  user_id: string
  case_id: string | null
  client_id: string
  budget_id: string | null
  status: 'pending_sign' | 'sent' | 'signed' | 'cancelled'
  content_markdown: string
  signaturit_request_id: string | null
  sign_url: string | null
  signed_at: string | null
  created_at: string
}

export const DEMO_ENGAGEMENTS: DemoEngagement[] = []

export interface DemoInvoice {
  id: string
  user_id: string
  case_id: string | null
  client_id: string
  invoice_number: string
  series: string
  status: 'draft' | 'issued' | 'paid' | 'cancelled' | 'overdue'
  issue_date: string
  due_date: string | null
  paid_date: string | null
  base_cents: number
  iva_cents: number
  irpf_cents: number
  total_cents: number
  line_items: DemoLineItem[]
  notes: string | null
  created_at: string
}

export const DEMO_INVOICES: DemoInvoice[] = []
