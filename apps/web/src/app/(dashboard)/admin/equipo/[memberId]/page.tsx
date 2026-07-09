'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Pencil, Briefcase, FileText, Clock, Users, Check } from 'lucide-react'
import {
  DEMO_MEMBERS,
  ROLE_BADGE_STYLES,
  avatarGradient,
  formatRelativeDate,
  type TeamMember,
  type MemberPermissions,
} from '@/components/features/equipo/data'

const BRAND = '#8F7EE9'
const BRAND_HOVER = '#7C6BD6'

type TabKey = 'personal' | 'historial' | 'contratos' | 'permisos'

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'personal', label: 'Datos personales' },
  { key: 'historial', label: 'Historial actividad' },
  { key: 'contratos', label: 'Contratos' },
  { key: 'permisos', label: 'Permisos y accesos' },
]

const PERMISSION_LABELS: Array<{ key: keyof MemberPermissions; label: string; description: string }> = [
  { key: 'viewClients', label: 'Ver clientes', description: 'Acceso de lectura al directorio completo de clientes del despacho.' },
  { key: 'createCases', label: 'Crear casos', description: 'Permite abrir nuevos expedientes y asignarlos a otros miembros.' },
  { key: 'generateContracts', label: 'Generar contratos', description: 'Genera contratos automáticos con IA desde plantillas.' },
  { key: 'accessBilling', label: 'Acceder a facturación', description: 'Acceso al módulo financiero, facturas e informes económicos.' },
  { key: 'manageTeam', label: 'Gestionar equipo', description: 'Invita miembros, edita roles y configura permisos.' },
]

export default function MemberDetailPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = use(params)
  const initial = DEMO_MEMBERS.find(m => m.id === memberId) || null
  const [member, setMember] = useState<TeamMember | null>(initial)
  const [activeTab, setActiveTab] = useState<TabKey>('personal')
  const [editing, setEditing] = useState(false)

  if (!member) {
    return (
      <div className="space-y-6">
        <Link href="/admin/equipo" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#8F7EE9] transition-colors">
          <ArrowLeft size={16} /> Volver al equipo
        </Link>
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
          <p className="text-slate-500">Miembro no encontrado.</p>
        </div>
      </div>
    )
  }

  const fullName = `${member.firstName} ${member.lastName}`
  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase()
  const gradient = avatarGradient(fullName)

  const updateField = <K extends keyof TeamMember>(key: K, value: TeamMember[K]) => {
    setMember(prev => (prev ? { ...prev, [key]: value } : prev))
  }

  const togglePermission = (key: keyof MemberPermissions) => {
    setMember(prev => {
      if (!prev) return prev
      return { ...prev, permissions: { ...prev.permissions, [key]: !prev.permissions[key] } }
    })
  }

  return (
    <div className="space-y-8">
      <Link
        href="/admin/equipo"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#8F7EE9] transition-colors"
      >
        <ArrowLeft size={16} /> Volver al equipo
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm"
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-6 min-w-0">
            <div
              className={`flex-shrink-0 h-24 w-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-bold shadow-md`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h1
                className="text-3xl font-bold text-slate-900 leading-tight truncate"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                {fullName}
              </h1>
              <p className="text-slate-500 mt-1 truncate">{member.email}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`inline-flex items-center text-xs font-semibold border px-2.5 py-1 rounded-full ${ROLE_BADGE_STYLES[member.role]}`}>
                  {member.role}
                </span>
                {member.status === 'active' && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Activo
                  </span>
                )}
                {member.status === 'pending' && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pendiente
                  </span>
                )}
                {member.status === 'suspended' && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Suspendido
                  </span>
                )}
                <span className="text-xs text-slate-400">· Último acceso {formatRelativeDate(member.lastActive)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setEditing(v => !v)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-colors"
            style={{ background: editing ? BRAND_HOVER : BRAND }}
            onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.background = editing ? BRAND_HOVER : BRAND)}
          >
            <Pencil size={14} /> {editing ? 'Cerrar edición' : 'Editar perfil'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <StatCard icon={<Briefcase size={16} />} label="Expedientes asignados" value={member.stats.activeCases} />
          <StatCard icon={<FileText size={16} />} label="Documentos generados" value={member.stats.documentsGenerated} />
          <StatCard icon={<Clock size={16} />} label="Horas registradas (mes)" value={`${member.stats.hoursThisMonth}h`} />
          <StatCard icon={<Users size={16} />} label="Clientes activos" value={member.stats.activeClients} />
        </div>
      </motion.section>

      <div className="border-b border-slate-200">
        <nav className="flex gap-1 overflow-x-auto -mb-px">
          {TABS.map(t => {
            const active = activeTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2"
                style={{
                  color: active ? BRAND : '#475569',
                  borderColor: active ? BRAND : 'transparent',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'personal' && (
            <PersonalDataTab member={member} editing={editing} onChange={updateField} onSave={() => setEditing(false)} />
          )}
          {activeTab === 'historial' && <ActivityTab events={member.activityLog} />}
          {activeTab === 'contratos' && <ContractsTab member={member} />}
          {activeTab === 'permisos' && <PermissionsTab permissions={member.permissions} onToggle={togglePermission} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide">
        <span style={{ color: BRAND }}>{icon}</span>
        {label}
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{children}</label>
}

function FieldInput({
  value, onChange, editing, type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  editing: boolean
  type?: string
}) {
  if (!editing) {
    return <p className="text-sm text-slate-900 py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg">{value || '—'}</p>
  }
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full text-sm text-slate-900 py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8F7EE9]/30 focus:border-[#8F7EE9] transition"
    />
  )
}

function PersonalDataTab({
  member, editing, onChange, onSave,
}: {
  member: TeamMember
  editing: boolean
  onChange: <K extends keyof TeamMember>(key: K, value: TeamMember[K]) => void
  onSave: () => void
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <FieldLabel>Nombre</FieldLabel>
          <FieldInput value={member.firstName} onChange={v => onChange('firstName', v)} editing={editing} />
        </div>
        <div>
          <FieldLabel>Apellidos</FieldLabel>
          <FieldInput value={member.lastName} onChange={v => onChange('lastName', v)} editing={editing} />
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <FieldInput value={member.email} onChange={v => onChange('email', v)} editing={editing} type="email" />
        </div>
        <div>
          <FieldLabel>Teléfono</FieldLabel>
          <FieldInput value={member.phone} onChange={v => onChange('phone', v)} editing={editing} />
        </div>
        <div>
          <FieldLabel>DNI</FieldLabel>
          <FieldInput value={member.dni} onChange={v => onChange('dni', v)} editing={editing} />
        </div>
        <div>
          <FieldLabel>Fecha de alta</FieldLabel>
          <FieldInput value={member.hireDate} onChange={v => onChange('hireDate', v)} editing={editing} type="date" />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Dirección</FieldLabel>
          <FieldInput value={member.address} onChange={v => onChange('address', v)} editing={editing} />
        </div>
        <div>
          <FieldLabel>Colegio profesional</FieldLabel>
          <FieldInput value={member.colegio} onChange={v => onChange('colegio', v)} editing={editing} />
        </div>
        <div>
          <FieldLabel>Nº colegiado</FieldLabel>
          <FieldInput value={member.colegioNumber} onChange={v => onChange('colegioNumber', v)} editing={editing} />
        </div>
        <div>
          <FieldLabel>Especialidad jurídica</FieldLabel>
          {editing ? (
            <select
              value={member.specialty}
              onChange={e => onChange('specialty', e.target.value as TeamMember['specialty'])}
              className="w-full text-sm text-slate-900 py-2 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8F7EE9]/30 focus:border-[#8F7EE9] transition"
            >
              {['Civil', 'Penal', 'Laboral', 'Mercantil', 'Familia', 'Administrativo', 'Fiscal', 'Inmobiliario', 'Gestión'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-slate-900 py-2 px-3 bg-slate-50 border border-slate-100 rounded-lg">{member.specialty}</p>
          )}
        </div>
      </div>

      {editing && (
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={onSave}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-colors"
            style={{ background: BRAND }}
            onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
          >
            Guardar cambios
          </button>
        </div>
      )}
    </div>
  )
}

function ActivityTab({ events }: { events: TeamMember['activityLog'] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-6">
        Últimos {events.length} eventos
      </h3>
      <ol className="relative border-l-2 border-slate-100 ml-3 space-y-6">
        {events.map((e, i) => (
          <li key={i} className="ml-6">
            <span
              className="absolute -left-[7px] flex items-center justify-center w-3 h-3 rounded-full border-2 border-white"
              style={{ background: BRAND, boxShadow: '0 0 0 2px #E5E7EB' }}
            />
            <div className="bg-slate-50/60 border border-slate-100 rounded-lg px-4 py-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-slate-900">
                  <span className="font-semibold">{e.action}</span>{' '}
                  <span className="text-slate-600">{e.target}</span>
                </p>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(e.date).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function ContractsTab({ member }: { member: TeamMember }) {
  const typeLabels: Record<TeamMember['contracts'][number]['type'], string> = {
    indefinido: 'Indefinido',
    temporal: 'Temporal',
    freelance: 'Freelance',
  }
  const statusStyles: Record<TeamMember['contracts'][number]['status'], string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    expired: 'bg-slate-100 text-slate-600 border-slate-200',
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {member.contracts.map(c => (
        <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h4 className="text-base font-bold text-slate-900">{typeLabels[c.type]}</h4>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[c.status]}`}>
              {c.status === 'active' ? 'En vigor' : c.status === 'expired' ? 'Finalizado' : 'Borrador'}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500 tracking-wide">Inicio</dt>
              <dd className="text-slate-900 mt-1">{new Date(c.startDate).toLocaleDateString('es-ES')}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500 tracking-wide">Fin</dt>
              <dd className="text-slate-900 mt-1">{c.endDate ? new Date(c.endDate).toLocaleDateString('es-ES') : 'Indefinido'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500 tracking-wide">Salario mensual</dt>
              <dd className="text-slate-900 mt-1 font-semibold">{c.salary.toLocaleString('es-ES')} €</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500 tracking-wide">Jornada</dt>
              <dd className="text-slate-900 mt-1">{c.hoursPerWeek} h/semana</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  )
}

function PermissionsTab({
  permissions, onToggle,
}: {
  permissions: MemberPermissions
  onToggle: (key: keyof MemberPermissions) => void
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm divide-y divide-slate-100">
      {PERMISSION_LABELS.map(p => {
        const on = permissions[p.key]
        return (
          <div key={p.key} className="flex items-start justify-between gap-6 px-6 py-5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">{p.label}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.description}</p>
            </div>
            <button
              role="switch"
              aria-checked={on}
              onClick={() => onToggle(p.key)}
              className="relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-colors"
              style={{ background: on ? BRAND : '#CBD5E1' }}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center"
                style={{ left: on ? 22 : 2 }}
              >
                {on && <Check size={12} style={{ color: BRAND }} />}
              </motion.span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
