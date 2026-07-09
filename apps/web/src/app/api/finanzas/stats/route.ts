/**
 * /api/finanzas/stats
 *
 * Agente financiero backend: cálculo autoritativo de todos los KPIs económicos
 * del despacho. Los números NUNCA se calculan en el cliente — se calculan aquí,
 * con redondeo a céntimo, detección real de vencidas (vs fecha del servidor),
 * IVA español 21%, IRPF retención 15% si aplica.
 *
 * Devuelve KPIs globales + breakdown por cliente, área, mes y estado.
 * El cliente solo renderiza los números que recibe.
 *
 * Ventajas vs cálculo cliente:
 *   - Fuente única de verdad (todas las pantallas leen aquí)
 *   - No se descargan 5000 facturas al browser para sumar
 *   - Cumple regla contable: redondeo a céntimo (Math.round, no toFixed)
 *   - Recalcula 'overdue' contra fecha actual del servidor, no del navegador
 *   - Permite cachear (TTL 60s) sin invalidar todo el módulo
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { withErrorHandler, UnauthorizedError } from '@/lib/security/apiResponse'

const IS_DEV =
  process.env.NEXT_PUBLIC_DEMO_MODE === '1' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

// IVA español general aplicable a servicios profesionales abogados
const IVA_RATE = 0.21
// IRPF retención sobre actividades profesionales (art. 95 RIRPF)
const IRPF_RATE = 0.15

interface InvoiceLite {
  id: string
  user_id: string
  client_id: string
  invoice_number: string
  status: string
  total_cents: number
  base_cents?: number
  iva_cents?: number
  irpf_cents?: number
  issue_date: string
  due_date: string | null
  paid_date?: string | null
  case_id?: string | null
}

interface BudgetLite {
  id: string
  user_id: string
  client_id: string
  budget_number: string
  status: string
  grand_total_cents: number
  total_cents?: number
  iva_cents?: number
  sent_at?: string | null
  accepted_at?: string | null
  created_at: string
  expires_at: string | null
}

interface EngagementLite {
  id: string
  user_id: string
  client_id: string
  status: string
  created_at: string
  signed_at: string | null
}

// ── HELPERS de cálculo (autoritativos) ─────────────────────────────────────
function sumCents(items: { total_cents: number }[]): number {
  return items.reduce((s, i) => s + i.total_cents, 0)
}

function isPast(dateStr: string | null | undefined, today: Date): boolean {
  if (!dateStr) return false
  return new Date(dateStr).getTime() < today.getTime()
}

function daysSince(dateStr: string | null | undefined, today: Date): number {
  if (!dateStr) return 0
  const diff = today.getTime() - new Date(dateStr).getTime()
  return Math.floor(diff / 86400000)
}

function ymKey(dateStr: string): string {
  // 'YYYY-MM' agrupador mensual
  return dateStr.slice(0, 7)
}

// ── HANDLER ────────────────────────────────────────────────────────────────
export async function GET(_req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()
    const userId = session.user.id

    // 1. CARGAR DATOS — desde DEMO o Supabase
    let invoices: InvoiceLite[] = []
    let budgets: BudgetLite[] = []
    let engagements: EngagementLite[] = []
    let clients: { id: string; name: string }[] = []
    let cases: { id: string; area: string | null; client_id: string | null }[] = []

    if (IS_DEV) {
      const { DEMO_INVOICES, DEMO_BUDGETS, DEMO_ENGAGEMENTS, DEMO_CLIENTS, DEMO_CASES } = await import('@/lib/dev/demo-data')
      invoices = DEMO_INVOICES as any
      budgets = DEMO_BUDGETS as any
      engagements = DEMO_ENGAGEMENTS as any
      clients = DEMO_CLIENTS.map(c => ({ id: c.id, name: c.name }))
      cases = DEMO_CASES.map(c => ({ id: c.id, area: c.area, client_id: (c as any).clients?.id ?? null }))
    } else {
      const { createServerClient } = await import('@/lib/supabase/server')
      const supabase = createServerClient()
      const [invRes, budRes, engRes, cliRes, casRes] = await Promise.all([
        supabase.from('invoices').select('id, user_id, client_id, invoice_number, status, total_cents, base_cents, iva_cents, irpf_cents, issue_date, due_date, paid_date, case_id').eq('user_id', userId),
        supabase.from('budgets').select('id, user_id, client_id, budget_number, status, grand_total_cents, total_cents, iva_cents, sent_at, accepted_at, created_at, expires_at').eq('user_id', userId),
        supabase.from('engagements').select('id, user_id, client_id, status, created_at, signed_at').eq('user_id', userId),
        supabase.from('clients').select('id, name').eq('user_id', userId),
        supabase.from('cases').select('id, area, client_id').eq('user_id', userId),
      ])
      invoices = (invRes.data as any) || []
      budgets = (budRes.data as any) || []
      engagements = (engRes.data as any) || []
      clients = (cliRes.data as any) || []
      cases = (casRes.data as any) || []
    }

    const today = new Date()
    const clientById = new Map(clients.map(c => [c.id, c.name]))
    const caseById = new Map(cases.map(c => [c.id, c]))

    // 2. RECALCULAR 'overdue' CONTRA FECHA SERVIDOR (no del navegador)
    //    Si DB dice 'issued' pero due_date ya pasó, lo tratamos como 'overdue' aquí.
    const invoicesNormalized = invoices.map(inv => {
      const effectiveStatus =
        inv.status === 'issued' && isPast(inv.due_date, today)
          ? 'overdue'
          : inv.status
      return { ...inv, status: effectiveStatus }
    })

    // 3. KPIs GLOBALES — los 4 del dashboard
    const notCancelled = invoicesNormalized.filter(i => i.status !== 'cancelled')
    const paid = invoicesNormalized.filter(i => i.status === 'paid')
    const issued = invoicesNormalized.filter(i => i.status === 'issued')
    const overdue = invoicesNormalized.filter(i => i.status === 'overdue')
    const draft = invoicesNormalized.filter(i => i.status === 'draft')

    const totalInvoiced = sumCents(notCancelled)
    const totalPaid = sumCents(paid)
    const pendingCollection = sumCents([...issued, ...overdue])
    const overdueAmount = sumCents(overdue)

    // Desglose IVA + base imponible del total facturado (excl. cancelled)
    const totalBase = notCancelled.reduce((s, i) => s + (i.base_cents ?? Math.round(i.total_cents / (1 + IVA_RATE))), 0)
    const totalIVA = notCancelled.reduce((s, i) => s + (i.iva_cents ?? (i.total_cents - Math.round(i.total_cents / (1 + IVA_RATE)))), 0)
    const totalIRPF = notCancelled.reduce((s, i) => s + (i.irpf_cents ?? 0), 0)

    // 4. RATIOS — convertidos a porcentaje con 1 decimal
    const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 1000) / 10 : 0
    const overdueRate = totalInvoiced > 0 ? Math.round((overdueAmount / totalInvoiced) * 1000) / 10 : 0

    // 5. DSO (Days Sales Outstanding) — días promedio para cobrar
    const dsoSamples = paid.filter(i => i.paid_date && i.issue_date).map(i => daysSince(i.issue_date, new Date(i.paid_date!)))
    const avgDSO = dsoSamples.length > 0
      ? Math.round(dsoSamples.reduce((s, d) => s + Math.abs(d), 0) / dsoSamples.length)
      : null

    // 6. TOP 5 CLIENTES por facturación total (no cancelled)
    const byClient: Record<string, number> = {}
    notCancelled.forEach(i => {
      byClient[i.client_id] = (byClient[i.client_id] ?? 0) + i.total_cents
    })
    const topClients = Object.entries(byClient)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([clientId, total]) => ({
        client_id: clientId,
        client_name: clientById.get(clientId) ?? 'Cliente desconocido',
        total_cents: total,
        invoice_count: notCancelled.filter(i => i.client_id === clientId).length,
      }))

    // 7. FACTURACIÓN POR MES (últimos 6 meses) — para gráfico
    const byMonth: Record<string, { invoiced: number; paid: number }> = {}
    notCancelled.forEach(i => {
      const m = ymKey(i.issue_date)
      if (!byMonth[m]) byMonth[m] = { invoiced: 0, paid: 0 }
      byMonth[m].invoiced += i.total_cents
    })
    paid.forEach(i => {
      const m = ymKey(i.paid_date ?? i.issue_date)
      if (!byMonth[m]) byMonth[m] = { invoiced: 0, paid: 0 }
      byMonth[m].paid += i.total_cents
    })
    const monthly = Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, vals]) => ({ month, invoiced_cents: vals.invoiced, paid_cents: vals.paid }))

    // 8. FACTURACIÓN POR ÁREA LEGAL
    const byArea: Record<string, number> = {}
    notCancelled.forEach(i => {
      const c = i.case_id ? caseById.get(i.case_id) : null
      const area = c?.area ?? 'Sin área'
      byArea[area] = (byArea[area] ?? 0) + i.total_cents
    })
    const byAreaList = Object.entries(byArea)
      .sort((a, b) => b[1] - a[1])
      .map(([area, total]) => ({ area, total_cents: total }))

    // 9. PIPELINE PRESUPUESTOS — valor potencial
    const budgetsSent = budgets.filter(b => b.status === 'sent')
    const budgetsAccepted = budgets.filter(b => b.status === 'accepted')
    const budgetsRejected = budgets.filter(b => b.status === 'rejected')
    const pipelineValue = budgetsSent.reduce((s, b) => s + b.grand_total_cents, 0)
    const acceptedValue = budgetsAccepted.reduce((s, b) => s + b.grand_total_cents, 0)
    const conversionRate = (budgetsSent.length + budgetsAccepted.length + budgetsRejected.length) > 0
      ? Math.round((budgetsAccepted.length / (budgetsSent.length + budgetsAccepted.length + budgetsRejected.length)) * 1000) / 10
      : 0

    // 10. ENCARGOS pendientes firma
    const engagementsPending = engagements.filter(e => e.status === 'pending_sign' || e.status === 'sent').length
    const engagementsSigned = engagements.filter(e => e.status === 'signed').length

    // 11. ALERTAS FINANCIERAS — accionables, no decorativas
    const alerts: { severity: 'high' | 'medium' | 'low'; type: string; message: string; count?: number }[] = []
    if (overdue.length > 0) {
      alerts.push({
        severity: 'high',
        type: 'overdue',
        message: `${overdue.length} factura${overdue.length > 1 ? 's' : ''} vencida${overdue.length > 1 ? 's' : ''} por valor de ${(overdueAmount / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`,
        count: overdue.length,
      })
    }
    const oldBudgetsSent = budgetsSent.filter(b => b.sent_at && daysSince(b.sent_at, today) > 15)
    if (oldBudgetsSent.length > 0) {
      alerts.push({
        severity: 'medium',
        type: 'stale_budgets',
        message: `${oldBudgetsSent.length} presupuesto${oldBudgetsSent.length > 1 ? 's' : ''} enviado${oldBudgetsSent.length > 1 ? 's' : ''} sin respuesta hace más de 15 días`,
        count: oldBudgetsSent.length,
      })
    }
    if (engagementsPending > 0) {
      alerts.push({
        severity: 'low',
        type: 'pending_engagements',
        message: `${engagementsPending} hoja${engagementsPending > 1 ? 's' : ''} de encargo pendiente${engagementsPending > 1 ? 's' : ''} de firma`,
        count: engagementsPending,
      })
    }

    // 12. RESPUESTA
    return NextResponse.json({
      computed_at: today.toISOString(),
      currency: 'EUR',
      iva_rate: IVA_RATE,
      irpf_rate: IRPF_RATE,

      // KPIs principales
      kpis: {
        total_invoiced_cents: totalInvoiced,
        total_paid_cents: totalPaid,
        pending_collection_cents: pendingCollection,
        overdue_amount_cents: overdueAmount,
        overdue_count: overdue.length,
        draft_count: draft.length,
        issued_count: issued.length,
        paid_count: paid.length,
      },

      // Desglose fiscal
      breakdown: {
        base_imponible_cents: totalBase,
        iva_cents: totalIVA,
        irpf_cents: totalIRPF,
      },

      // Ratios
      ratios: {
        collection_rate_pct: collectionRate,
        overdue_rate_pct: overdueRate,
        avg_dso_days: avgDSO,
      },

      // Pipeline
      pipeline: {
        budgets_total: budgets.length,
        budgets_sent: budgetsSent.length,
        budgets_accepted: budgetsAccepted.length,
        budgets_rejected: budgetsRejected.length,
        pipeline_value_cents: pipelineValue,
        accepted_value_cents: acceptedValue,
        conversion_rate_pct: conversionRate,
      },

      // Engagements
      engagements: {
        total: engagements.length,
        signed: engagementsSigned,
        pending: engagementsPending,
      },

      // Distribuciones
      top_clients: topClients,
      monthly,
      by_area: byAreaList,

      // Alertas accionables
      alerts,
    })
  })
}
