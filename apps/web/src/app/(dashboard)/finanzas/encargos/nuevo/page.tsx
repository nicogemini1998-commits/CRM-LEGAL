'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileCheck } from 'lucide-react'
import Link from 'next/link'

interface Client { id: string; name: string; email?: string }
interface Case { id: string; title: string; client_id: string; area?: string }

const LEGAL_AREAS = ['Civil', 'Laboral', 'Penal', 'Mercantil', 'Familia', 'Administrativo', 'Fiscal', 'Inmobiliario']

export default function NuevaHojaEncargo() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    client_id: '',
    case_id: '',
    area: 'Civil',
    object_of_engagement: '',
    fee_type: 'fixed' as 'fixed' | 'hourly' | 'success',
    fee_amount: '',
    fee_hourly_rate: '',
    success_percentage: '',
    expenses_included: false,
    notes: '',
  })

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.client_id) { setError('Selecciona un cliente'); return }
    if (!form.object_of_engagement.trim()) { setError('Describe el objeto del encargo'); return }
    setError(null)
    setSaving(true)
    try {
      const payload = {
        client_id: form.client_id,
        case_id: form.case_id || undefined,
        area: form.area,
        object_of_engagement: form.object_of_engagement,
        fee_type: form.fee_type,
        fee_amount_cents: form.fee_amount ? Math.round(parseFloat(form.fee_amount) * 100) : undefined,
        fee_hourly_rate_cents: form.fee_hourly_rate ? Math.round(parseFloat(form.fee_hourly_rate) * 100) : undefined,
        success_percentage: form.success_percentage ? parseFloat(form.success_percentage) : undefined,
        expenses_included: form.expenses_included,
        notes: form.notes || undefined,
      }
      const res = await fetch('/api/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Error al crear hoja de encargo')
      }
      router.push('/finanzas?tab=encargos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear hoja de encargo')
    } finally {
      setSaving(false)
    }
  }

  const selectedClient = clients.find(c => c.id === form.client_id)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/finanzas?tab=encargos" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-semibold text-slate-900">Nueva hoja de encargo</h1>
          <p className="text-sm text-slate-500 mt-0.5">Documento de formalización del encargo profesional (art. 22 Estatuto General de la Abogacía)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client & Case */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Datos del cliente</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente *</label>
              <select
                value={form.client_id}
                onChange={e => setForm({ ...form, client_id: e.target.value, case_id: '' })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9]"
              >
                <option value="">Selecciona cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Expediente vinculado</label>
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
          {selectedClient?.email && (
            <p className="text-xs text-slate-500">Notificación de firma se enviará a: <strong>{selectedClient.email}</strong></p>
          )}
        </div>

        {/* Object */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Objeto del encargo</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Área jurídica</label>
              <select
                value={form.area}
                onChange={e => setForm({ ...form, area: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9]"
              >
                {LEGAL_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción del objeto del encargo *</label>
            <textarea
              value={form.object_of_engagement}
              onChange={e => setForm({ ...form, object_of_engagement: e.target.value })}
              rows={4}
              required
              placeholder="Ej: Defensa jurídica en procedimiento de despido disciplinario tramitado ante el Juzgado de lo Social. Incluye fase prejudicial, conciliación y juicio oral."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9] resize-none"
            />
          </div>
        </div>

        {/* Fee */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Honorarios pactados</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Modalidad de honorarios</label>
            <div className="flex gap-2">
              {[
                { value: 'fixed', label: 'Cuota fija' },
                { value: 'hourly', label: 'Por horas' },
                { value: 'success', label: 'Cuota éxito' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, fee_type: opt.value as any })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.fee_type === opt.value
                      ? 'bg-[#8F7EE9] text-white border-[#8F7EE9]'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-[#8F7EE9]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {form.fee_type === 'fixed' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Importe total (€ + IVA)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.fee_amount}
                onChange={e => setForm({ ...form, fee_amount: e.target.value })}
                placeholder="1500,00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9]"
              />
            </div>
          )}

          {form.fee_type === 'hourly' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tarifa por hora (€/h + IVA)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.fee_hourly_rate}
                onChange={e => setForm({ ...form, fee_hourly_rate: e.target.value })}
                placeholder="150,00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9]"
              />
            </div>
          )}

          {form.fee_type === 'success' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Porcentaje sobre resultado (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.success_percentage}
                onChange={e => setForm({ ...form, success_percentage: e.target.value })}
                placeholder="15"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9]"
              />
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.expenses_included}
              onChange={e => setForm({ ...form, expenses_included: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-[#8F7EE9] focus:ring-[#8F7EE9]"
            />
            <span className="text-sm text-slate-700">Los gastos y suplidos están incluidos en los honorarios anteriores</span>
          </label>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Condiciones adicionales / cláusulas especiales</label>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={3}
            placeholder="Ej: Forma de pago, confidencialidad, archivo del expediente..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8F7EE9] resize-none"
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
          Esta hoja de encargo se creará en estado borrador. Una vez revisada, puedes enviarla al cliente para su firma digital.
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/finanzas?tab=encargos"
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
              <><FileCheck size={15} /> Crear hoja de encargo</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
