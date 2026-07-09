'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, FileText } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

interface Client { id: string; name: string }
interface Case { id: string; title: string; client_id: string }
interface LineItem { concept: string; units: number; unit_price: string }

const IVA_OPTIONS = [
  { label: '21% (general)', value: 21 },
  { label: '10% (reducido)', value: 10 },
  { label: '4% (superreducido)', value: 4 },
  { label: '0% (exento)', value: 0 },
]

function NuevoPresupuestoInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillCaseId = searchParams.get('case_id') || ''

  const [clients, setClients] = useState<Client[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    client_id: '',
    case_id: prefillCaseId,
    iva_pct: 21,
    notes: '',
    expires_days: 30,
    title: '',
  })
  const [lines, setLines] = useState<LineItem[]>([
    { concept: 'Honorarios profesionales', units: 1, unit_price: '' },
  ])

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(d => setClients(d.clients || []))
  }, [])

  useEffect(() => {
    if (!form.client_id) { setCases([]); return }
    fetch('/api/cases?client_id=' + form.client_id)
      .then(r => r.json())
      .then(d => setCases((d.cases || []).filter((c: Case) => c.client_id === form.client_id)))
  }, [form.client_id])

  // If prefillCaseId, try to match client once clients load
  useEffect(() => {
    if (!prefillCaseId || !clients.length) return
    // Load all cases to find client for this case
    fetch('/api/cases')
      .then(r => r.json())
      .then(d => {
        const found = (d.cases || []).find((c: Case) => c.id === prefillCaseId)
        if (found?.client_id) setForm(f => ({ ...f, client_id: found.client_id, case_id: prefillCaseId }))
      })
  }, [prefillCaseId, clients])

  function addLine() {
    setLines(prev => [...prev, { concept: '', units: 1, unit_price: '' }])
  }

  function removeLine(i: number) {
    setLines(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateLine(i: number, field: keyof LineItem, value: string | number) {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l))
  }

  const subtotalCents = lines.reduce((sum, l) => {
    const price = parseFloat(l.unit_price) || 0
    return sum + Math.round(price * l.units * 100)
  }, 0)
  const ivaCents = Math.round(subtotalCents * form.iva_pct / 100)
  const grandTotalCents = subtotalCents + ivaCents

  function fmt(cents: number) {
    return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.client_id) { setError('Selecciona un cliente'); return }
    if (lines.every(l => !l.unit_price)) { setError('Añade al menos una línea con importe'); return }
    setError(null)
    setSaving(true)
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + form.expires_days)

      const payload = {
        client_id: form.client_id,
        case_id: form.case_id || undefined,
        title: form.title || undefined,
        iva_pct: form.iva_pct,
        notes: form.notes || undefined,
        expires_at: expiresAt.toISOString(),
        line_items: lines
          .filter(l => l.concept && l.unit_price)
          .map(l => ({
            concept: l.concept,
            units: l.units,
            unit_price_cents: Math.round((parseFloat(l.unit_price) || 0) * 100),
          })),
        subtotal_cents: subtotalCents,
        iva_cents: ivaCents,
        grand_total_cents: grandTotalCents,
      }
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Error al crear presupuesto')
      }
      router.push('/finanzas?tab=presupuestos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear presupuesto')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/finanzas?tab=presupuestos" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-semibold text-slate-900">Nuevo presupuesto</h1>
          <p className="text-sm text-slate-500 mt-0.5">Genera un presupuesto de honorarios para el cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client & Case */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Cliente y expediente</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Título del presupuesto (opcional)</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Presupuesto defensa laboral — despido improcedente"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9] focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente *</label>
              <select
                value={form.client_id}
                onChange={e => setForm({ ...form, client_id: e.target.value, case_id: '' })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9] focus:border-transparent"
              >
                <option value="">Selecciona cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Expediente (opcional)</label>
              <select
                value={form.case_id}
                onChange={e => setForm({ ...form, case_id: e.target.value })}
                disabled={!form.client_id}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9] disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Sin expediente</option>
                {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Validez del presupuesto</label>
            <select
              value={form.expires_days}
              onChange={e => setForm({ ...form, expires_days: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9]"
            >
              <option value={15}>15 días</option>
              <option value={30}>30 días</option>
              <option value={60}>60 días</option>
              <option value={90}>90 días</option>
            </select>
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Conceptos del presupuesto</h2>
            <button type="button" onClick={addLine}
              className="text-xs flex items-center gap-1 text-[#8F7EE9] hover:text-[#7C6BD6] font-medium">
              <Plus size={13} /> Añadir línea
            </button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">
              <div className="col-span-6">Concepto</div>
              <div className="col-span-2 text-center">Uds.</div>
              <div className="col-span-3 text-right">Precio/ud. (€)</div>
              <div className="col-span-1" />
            </div>
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={line.concept}
                  onChange={e => updateLine(i, 'concept', e.target.value)}
                  placeholder="Descripción del servicio"
                  className="col-span-6 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9]"
                />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={line.units}
                  onChange={e => updateLine(i, 'units', parseFloat(e.target.value) || 1)}
                  className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#8F7EE9]"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.unit_price}
                  onChange={e => updateLine(i, 'unit_price', e.target.value)}
                  placeholder="0,00"
                  className="col-span-3 px-3 py-2 border border-slate-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#8F7EE9]"
                />
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  disabled={lines.length === 1}
                  className="col-span-1 p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 flex justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* IVA / Totals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Impuestos y totales</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">IVA aplicable</label>
            <select
              value={form.iva_pct}
              onChange={e => setForm({ ...form, iva_pct: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9]"
            >
              {IVA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Base imponible</span>
              <span className="font-medium">{fmt(subtotalCents)}</span>
            </div>
            {form.iva_pct > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>IVA {form.iva_pct}%</span>
                <span>{fmt(ivaCents)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between text-slate-900 font-bold text-base">
              <span>Total presupuesto</span>
              <span className="text-[#5B4FB8]">{fmt(grandTotalCents)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas / condiciones (opcional)</label>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={3}
            placeholder="Ej: Incluye consultas ilimitadas durante el proceso. Excluye tasas judiciales."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9] resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
            <FileText size={14} /> {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/finanzas?tab=presupuestos"
            className="px-5 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors text-sm">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#8F7EE9] hover:bg-[#7C6BD6] disabled:opacity-60 text-white rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-2"
          >
            {saving ? (
              <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creando...</>
            ) : (
              <><FileText size={15} /> Crear presupuesto en borrador</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NuevoPresupuestoPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-500">Cargando...</div>}>
      <NuevoPresupuestoInner />
    </Suspense>
  )
}
