'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserPlus, Search, ChevronRight, Home } from 'lucide-react'
import { StatsRow } from '@/components/features/equipo/StatsRow'
import { MemberRow } from '@/components/features/equipo/MemberRow'
import { RoleCard } from '@/components/features/equipo/RoleCard'
import { InviteModal } from '@/components/features/equipo/InviteModal'
import {
  DEMO_MEMBERS,
  ROLE_DEFINITIONS,
  type TeamMember,
  type RoleType,
  type LegalSpecialty,
} from '@/components/features/equipo/data'

export default function EquipoPage() {
  const [members, setMembers] = useState<TeamMember[]>(DEMO_MEMBERS)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleType | 'all'>('all')

  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    pending: members.filter((m) => m.status === 'pending').length,
    roles: ROLE_DEFINITIONS.length,
  }), [members])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return members.filter((m) => {
      if (roleFilter !== 'all' && m.role !== roleFilter) return false
      if (!q) return true
      return (
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      )
    })
  }, [members, search, roleFilter])

  const handleInvite = (data: { email: string; role: RoleType; firstName: string; lastName: string }) => {
    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      status: 'pending',
      lastActive: new Date().toISOString().split('T')[0],
      specialties: [],
      dni: '',
      address: '',
      phone: '',
      hireDate: new Date().toISOString().split('T')[0],
      colegio: '',
      colegioNumber: '',
      specialty: 'Civil' as LegalSpecialty,
      contracts: [],
      permissions: { viewClients: true, createCases: false, generateContracts: false, accessBilling: false, manageTeam: false },
      activityLog: [],
      stats: { activeCases: 0, documentsGenerated: 0, hoursThisMonth: 0, activeClients: 0 },
    }
    setMembers((prev) => [...prev, newMember])
  }

  const handleSuspend = (m: TeamMember) => {
    setMembers((prev) =>
      prev.map((x) =>
        x.id === m.id ? { ...x, status: x.status === 'suspended' ? 'active' : 'suspended' } : x,
      ),
    )
  }

  const handleDelete = (m: TeamMember) => {
    if (!confirm(`¿Eliminar a ${m.firstName} ${m.lastName} del equipo?`)) return
    setMembers((prev) => prev.filter((x) => x.id !== m.id))
  }

  return (
    <div className="relative min-h-full">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-violet-50/60 via-violet-50/20 to-transparent -z-10"
      />

      <div className="space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 pt-2" aria-label="Breadcrumb">
          <Link href="/dashboard" className="flex items-center gap-1 hover:text-slate-700 transition-colors">
            <Home size={13} />
            <span>Inicio</span>
          </Link>
          <ChevronRight size={13} className="text-slate-300" />
          <span className="text-slate-700 font-medium">Equipo</span>
        </nav>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-900 leading-tight tracking-tight">
              Equipo
            </h1>
            <p className="mt-2 text-slate-500 text-base leading-relaxed">
              Gestiona miembros, roles y permisos de tu despacho.
            </p>
          </div>

          <button
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 bg-[#8F7EE9] hover:bg-[#7C6BD6] text-white px-5 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-colors self-start md:self-auto"
          >
            <UserPlus size={16} /> Invitar miembro
          </button>
        </motion.header>

        {/* Stats */}
        <StatsRow {...stats} />

        {/* Members table */}
        <section>
          {/* Section header with filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Miembros del despacho</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {filtered.length} {filtered.length === 1 ? 'miembro' : 'miembros'}
                {roleFilter !== 'all' ? ` · ${roleFilter}` : ''}
                {search ? ` · "${search}"` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar…"
                  className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 w-40"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleType | 'all')}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="all">Todos los roles</option>
                {ROLE_DEFINITIONS.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_120px_44px] items-center px-5 py-2.5 border-b border-slate-100 bg-slate-50/60">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Miembro</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Rol · Especialidad</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Actividad</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Expedientes</span>
              <span />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-14">
                <p className="text-slate-400 text-sm">Ningún miembro coincide con los filtros.</p>
                <button
                  onClick={() => { setSearch(''); setRoleFilter('all') }}
                  className="mt-2 text-xs text-[#8F7EE9] hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((m) => (
                  <MemberRow
                    key={m.id}
                    member={m}
                    onEdit={(mm) => alert(`Editar ${mm.firstName} ${mm.lastName} (próximamente)`)}
                    onSuspend={handleSuspend}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Roles & permissions */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Roles y permisos</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada rol define qué puede ver y hacer un miembro dentro del despacho.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {ROLE_DEFINITIONS.map((r, i) => (
              <RoleCard
                key={r.role}
                index={i}
                role={r.role}
                description={r.description}
                permissions={r.permissions}
                accent={r.accent}
              />
            ))}
          </div>
        </section>
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite} />
    </div>
  )
}
