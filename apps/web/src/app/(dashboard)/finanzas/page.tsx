'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Euro, FileText, FileCheck, TrendingUp, Plus, Clock, CheckCircle2, AlertCircle, Download, Send, CreditCard, X, ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRole } from '@/lib/rbac/useRole'

type Tab = 'facturas' | 'presupuestos' | 'encargos'

interface Budget {
  id: string
  budget_number: string
  status: string
  grand_total_cents: number
  created_at: string
  expires_at: string | null
  client?: { name: string }
  case?: { title: string }
}

interface Engagement {
  id: string
  status: string
  created_at: string
  signed_at: string | null
  client?: { name: string }
  case?: { title: string }
}

interface Invoice {
  id: string
  invoice_number: string
  status: string
  total_cents: number
  issue_date: string
  due_date: string | null
  client?: { name: string }
}

const BUDGET_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  draft:    { label: 'Borrador',   color: '#6B7280', bg: '#F3F4F6' },
  sent:     { label: 'Enviado',    color: '#2563EB', bg: '#EFF6FF' },
  accepted: { label: 'Aceptado',   color: '#16A34A', bg: '#F0FDF4' },
  rejected: { label: 'Rechazado',  color: '#DC2626', bg: '#FEF2F2' },
  expired:  { label: 'Vencido',    color: '#9CA3AF', bg: '#F9FAFB' },
}

const ENGAGEMENT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending_sign: { label: 'Pendiente firma', color: '#D97706', bg: '#FFFBEB' },
  sent:         { label: 'Enviado',         color: '#2563EB', bg: '#EFF6FF' },
  signed:       { label: 'Firmado',         color: '#16A34A', bg: '#F0FDF4' },
  cancelled:    { label: 'Cancelado',       color: '#9CA3AF', bg: '#F9FAFB' },
}

const INVOICE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Borrador',  color: '#6B7280', bg: '#F3F4F6' },
  issued:    { label: 'Emitida',   color: '#2563EB', bg: '#EFF6FF' },
  paid:      { label: 'Cobrada',   color: '#16A34A', bg: '#F0FDF4' },
  overdue:   { label: 'Vencida',   color: '#DC2626', bg: '#FEF2F2' },
  cancelled: { label: 'Anulada',   color: '#9CA3AF', bg: '#F9FAFB' },
}

function formatEuros(cents: number) {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}


function ActionBtn({ onClick, loading, icon, label, variant = 'default' }: {
  onClick: () => void; loading: boolean; icon: React.ReactNode; label: string; variant?: 'default' | 'success' | 'danger'
}) {
  const colors = {
    default: 'hover:bg-[#8F7EE9]/10 text-slate-400 hover:text-[#8F7EE9]',
    success: 'hover:bg-green-50 text-slate-400 hover:text-green-600',
    danger:  'hover:bg-red-50 text-slate-400 hover:text-red-500',
  }
  return (
    <button onClick={onClick} disabled={loading} title={label}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${colors[variant]}`}>
      {loading
        ? <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : icon}
    </button>
  )
}

function FinanzasInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'facturas')
  const { role, can, loading: roleLoading } = useRole()

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [bRes, eRes, iRes, sRes] = await Promise.all([
        fetch('/api/budgets'),
        fetch('/api/engagements'),
        fetch('/api/invoices'),
        fetch('/api/finanzas/stats'),
      ])
      const [bData, eData, iData, sData] = await Promise.all([bRes.json(), eRes.json(), iRes.json(), sRes.json()])
      setBudgets(bData.budgets || [])
      setEngagements(eData.engagements || [])
      setInvoices(iData.invoices || [])
      setStats(sData)
    } catch { showToast('Error cargando datos', 'err') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function downloadPdf(type: 'budget' | 'invoice', id: string, name: string) {
    setActionLoading(`pdf-${id}`)
    try {
      const url = type === 'budget' ? `/api/budgets/${id}/pdf` : `/api/invoices/${id}/pdf`
      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${name}.pdf`
      a.click()
    } catch { showToast('Error generando PDF', 'err') }
    finally { setActionLoading(null) }
  }

  async function invoiceAction(id: string, action: 'issue' | 'pay') {
    setActionLoading(`${action}-${id}`)
    try {
      const res = await fetch(`/api/invoices/${id}/${action}`, { method: 'POST' })
      if (!res.ok) throw new Error()
      showToast(action === 'issue' ? 'Factura emitida correctamente' : 'Factura marcada como cobrada')
      await loadData()
    } catch { showToast('Error al realizar la acción', 'err') }
    finally { setActionLoading(null) }
  }

  async function budgetAction(id: string, status: 'sent' | 'accepted' | 'rejected') {
    setActionLoading(`budget-${id}-${status}`)
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      showToast({ sent: 'Presupuesto enviado', accepted: 'Presupuesto aceptado', rejected: 'Presupuesto rechazado' }[status])
      await loadData()
    } catch { showToast('Error al realizar la acción', 'err') }
    finally { setActionLoading(null) }
  }

  async function engagementAction(id: string, status: 'sent' | 'signed') {
    setActionLoading(`eng-${id}-${status}`)
    try {
      const res = await fetch(`/api/engagements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(status === 'signed' ? { signed_at: new Date().toISOString() } : {}) }),
      })
      if (!res.ok) throw new Error()
      showToast(status === 'sent' ? 'Hoja de encargo enviada' : 'Firma registrada correctamente')
      await loadData()
    } catch { showToast('Error al realizar la acción', 'err') }
    finally { setActionLoading(null) }
  }

  // KPIs calculados en backend (fuente única de verdad, /api/finanzas/stats)
  const totalInvoiced = stats?.kpis?.total_invoiced_cents ?? 0
  const totalPaid = stats?.kpis?.total_paid_cents ?? 0
  const pendingCollection = stats?.kpis?.pending_collection_cents ?? 0
  const overdueCount = stats?.kpis?.overdue_count ?? 0

  const TABS = [
    { id: 'facturas' as Tab, label: 'Facturas', icon: <Euro size={15} />, count: invoices.length },
    { id: 'presupuestos' as Tab, label: 'Presupuestos', icon: <FileText size={15} />, count: budgets.length },
    { id: 'encargos' as Tab, label: 'Hojas de encargo', icon: <FileCheck size={15} />, count: engagements.length },
  ]

  // RBAC GUARD: bloquea acceso si rol no tiene viewFinanzas
  if (!roleLoading && role && !can('viewFinanzas')) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
            <Lock size={24} className="text-amber-700" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-slate-900 mb-2">Acceso restringido</h2>
          <p className="text-sm text-slate-600 mb-1">Tu rol <strong>{role}</strong> no tiene acceso al módulo de finanzas.</p>
          <p className="text-xs text-slate-500">Solicita al Socio o Administrador del despacho que ajuste tus permisos.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-semibold text-slate-900">Finanzas</h1>
            <p className="text-sm text-slate-500 mt-1">Presupuestos, hojas de encargo y facturación del despacho</p>
          </div>
        </div>
        <div className="flex gap-2">
          {tab === 'facturas' && (
            <button onClick={() => router.push('/finanzas/facturas/nueva')}
              className="flex items-center gap-2 bg-[#8F7EE9] hover:bg-[#7C6BD6] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
              <Plus size={15} /> Nueva factura
            </button>
          )}
          {tab === 'presupuestos' && (
            <button onClick={() => router.push('/finanzas/presupuestos/nuevo')}
              className="flex items-center gap-2 bg-[#8F7EE9] hover:bg-[#7C6BD6] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
              <Plus size={15} /> Nuevo presupuesto
            </button>
          )}
          {tab === 'encargos' && (
            <button onClick={() => router.push('/finanzas/encargos/nuevo')}
              className="flex items-center gap-2 bg-[#8F7EE9] hover:bg-[#7C6BD6] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
              <Plus size={15} /> Nueva hoja de encargo
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total facturado', value: formatEuros(totalInvoiced), icon: <TrendingUp size={18} className="text-[#8F7EE9]" />, sub: 'facturas emitidas' },
          { label: 'Cobrado', value: formatEuros(totalPaid), icon: <CheckCircle2 size={18} className="text-green-500" />, sub: 'facturas pagadas' },
          { label: 'Por cobrar', value: formatEuros(pendingCollection), icon: <Clock size={18} className="text-blue-500" />, sub: 'emitidas pendientes' },
          { label: 'Vencidas', value: String(overdueCount), icon: <AlertCircle size={18} className="text-red-500" />, sub: overdueCount === 1 ? 'factura vencida' : 'facturas vencidas', alert: overdueCount > 0 },
        ].map((kpi, i) => (
          <div key={i} className={`rounded-2xl border bg-white p-4 hover:shadow-sm transition-shadow ${(kpi as any).alert ? 'border-red-200' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{kpi.label}</span>
              {kpi.icon}
            </div>
            <div className={`text-2xl font-bold ${(kpi as any).alert ? 'text-red-600' : 'text-slate-900'}`}>{kpi.value}</div>
            <div className="text-xs text-slate-400 mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-[#8F7EE9] text-[#5B4FB8]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t.icon}
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-[#8F7EE9]/10 text-[#5B4FB8]' : 'bg-slate-100 text-slate-500'}`}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}</div>
      ) : (
        <>
          {/* FACTURAS */}
          {tab === 'facturas' && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {invoices.length === 0 ? (
                <div className="p-12 text-center">
                  <Euro size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">No hay facturas aún.</p>
                  <button onClick={() => router.push('/finanzas/facturas/nueva')}
                    className="mt-4 inline-flex items-center gap-2 bg-[#8F7EE9] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7C6BD6] transition-colors">
                    <Plus size={14} /> Crear primera factura
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nº Factura</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha emisión</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vencimiento</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Importe</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, i) => {
                      const st = INVOICE_STATUS[inv.status] || INVOICE_STATUS.draft
                      return (
                        <tr key={inv.id} className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{inv.invoice_number}</td>
                          <td className="px-4 py-3 text-slate-700 font-medium">{inv.client?.name || '—'}</td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(inv.issue_date)}</td>
                          <td className="px-4 py-3 text-slate-500">{inv.due_date ? formatDate(inv.due_date) : '—'}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatEuros(inv.total_cents)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-0.5 justify-end">
                              {inv.status === 'draft' && (
                                <ActionBtn onClick={() => invoiceAction(inv.id, 'issue')} loading={actionLoading === `issue-${inv.id}`} icon={<Send size={13} />} label="Emitir factura" variant="success" />
                              )}
                              {(inv.status === 'issued' || inv.status === 'overdue') && (
                                <ActionBtn onClick={() => invoiceAction(inv.id, 'pay')} loading={actionLoading === `pay-${inv.id}`} icon={<CreditCard size={13} />} label="Marcar cobrada" variant="success" />
                              )}
                              <ActionBtn onClick={() => downloadPdf('invoice', inv.id, inv.invoice_number)} loading={actionLoading === `pdf-${inv.id}`} icon={<Download size={13} />} label="Descargar PDF" />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* PRESUPUESTOS */}
          {tab === 'presupuestos' && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {budgets.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">No hay presupuestos.</p>
                  <button onClick={() => router.push('/finanzas/presupuestos/nuevo')}
                    className="mt-4 inline-flex items-center gap-2 bg-[#8F7EE9] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7C6BD6] transition-colors">
                    <Plus size={14} /> Crear presupuesto
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nº</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Asunto</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Importe</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.map((b, i) => {
                      const st = BUDGET_STATUS[b.status] || BUDGET_STATUS.draft
                      const base = `budget-${b.id}`
                      return (
                        <tr key={b.id} className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{b.budget_number}</td>
                          <td className="px-4 py-3 text-slate-700 font-medium">{b.client?.name || '—'}</td>
                          <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{b.case?.title || '—'}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatEuros(b.grand_total_cents)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-0.5 justify-end">
                              {b.status === 'draft' && (
                                <ActionBtn onClick={() => budgetAction(b.id, 'sent')} loading={actionLoading === `${base}-sent`} icon={<Send size={13} />} label="Enviar al cliente" />
                              )}
                              {b.status === 'sent' && (<>
                                <ActionBtn onClick={() => budgetAction(b.id, 'accepted')} loading={actionLoading === `${base}-accepted`} icon={<CheckCircle2 size={13} />} label="Marcar aceptado" variant="success" />
                                <ActionBtn onClick={() => budgetAction(b.id, 'rejected')} loading={actionLoading === `${base}-rejected`} icon={<X size={13} />} label="Marcar rechazado" variant="danger" />
                              </>)}
                              <ActionBtn onClick={() => downloadPdf('budget', b.id, b.budget_number)} loading={actionLoading === `pdf-${b.id}`} icon={<Download size={13} />} label="Descargar PDF" />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ENCARGOS */}
          {tab === 'encargos' && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {engagements.length === 0 ? (
                <div className="p-12 text-center">
                  <FileCheck size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">No hay hojas de encargo.</p>
                  <button onClick={() => router.push('/finanzas/encargos/nuevo')}
                    className="mt-4 inline-flex items-center gap-2 bg-[#8F7EE9] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7C6BD6] transition-colors">
                    <Plus size={14} /> Crear hoja de encargo
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Asunto</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Creado</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Firmado</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engagements.map((e, i) => {
                      const st = ENGAGEMENT_STATUS[e.status] || ENGAGEMENT_STATUS.pending_sign
                      const base = `eng-${e.id}`
                      return (
                        <tr key={e.id} className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                          <td className="px-4 py-3 text-slate-700 font-medium">{e.client?.name || '—'}</td>
                          <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{e.case?.title || '—'}</td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(e.created_at)}</td>
                          <td className="px-4 py-3 text-slate-500">{e.signed_at ? formatDate(e.signed_at) : '—'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-0.5 justify-end">
                              {e.status === 'pending_sign' && (
                                <ActionBtn onClick={() => engagementAction(e.id, 'sent')} loading={actionLoading === `${base}-sent`} icon={<Send size={13} />} label="Enviar para firma" />
                              )}
                              {e.status === 'sent' && (
                                <ActionBtn onClick={() => engagementAction(e.id, 'signed')} loading={actionLoading === `${base}-signed`} icon={<CheckCircle2 size={13} />} label="Registrar firma" variant="success" />
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}


      <p className="text-xs text-slate-400 text-center">
        Los PDFs generados cumplen los requisitos del Real Decreto 1619/2012 de obligaciones de facturación.
      </p>
    </div>
  )
}

export default function FinanzasPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-500">Cargando...</div>}>
      <FinanzasInner />
    </Suspense>
  )
}
