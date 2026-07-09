'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Pencil, Pause, Trash2, Play, Briefcase, Users } from 'lucide-react'
import { type TeamMember, ROLE_BADGE_STYLES, avatarGradient, formatRelativeDate } from './data'

interface MemberRowProps {
  member: TeamMember
  onEdit?: (m: TeamMember) => void
  onSuspend?: (m: TeamMember) => void
  onDelete?: (m: TeamMember) => void
}

export function MemberRow({ member, onEdit, onSuspend, onDelete }: MemberRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const fullName = `${member.firstName} ${member.lastName}`
  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase()
  const gradient = avatarGradient(fullName)
  const isSuspended = member.status === 'suspended'
  const isPending = member.status === 'pending'

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors group ${isSuspended ? 'opacity-60' : ''}`}>
      {/* Col 1: Avatar + name + email */}
      <Link
        href={`/admin/equipo/${member.id}`}
        className="flex items-center gap-3 flex-[2] min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8F7EE9] rounded-lg"
      >
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}
        >
          {initials}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-semibold text-slate-800 truncate text-sm group-hover:text-[#8F7EE9] transition-colors leading-tight">
              {fullName}
            </p>
            {isPending && (
              <span className="text-[9px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                Pendiente
              </span>
            )}
            {isSuspended && (
              <span className="text-[9px] font-bold uppercase tracking-wide text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                Suspendido
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate mt-0.5">{member.email}</p>
        </div>
      </Link>

      {/* Col 2: Role + specialty — hidden on small screens */}
      <div className="hidden md:flex flex-col gap-1 flex-[1] min-w-0">
        <span
          className={`inline-flex w-fit items-center text-[11px] font-semibold border px-2 py-0.5 rounded-full ${ROLE_BADGE_STYLES[member.role]}`}
        >
          {member.role}
        </span>
        {member.specialties.length > 0 && (
          <span className="text-[11px] text-slate-500 truncate">
            {member.specialties.slice(0, 2).join(' · ')}
          </span>
        )}
      </div>

      {/* Col 3: Last active */}
      <div className="hidden md:block flex-[1] min-w-0">
        <p className="text-xs font-medium text-slate-700">{formatRelativeDate(member.lastActive)}</p>
        <p className="text-[11px] text-slate-400">Último acceso</p>
      </div>

      {/* Col 4: Stats mini */}
      <div className="hidden md:flex items-center gap-3 w-[120px] flex-shrink-0">
        <div className="flex items-center gap-1 text-slate-600" title="Expedientes activos">
          <Briefcase size={12} className="text-slate-400" />
          <span className="text-xs font-semibold tabular-nums">{member.stats.activeCases}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-600" title="Clientes activos">
          <Users size={12} className="text-slate-400" />
          <span className="text-xs font-semibold tabular-nums">{member.stats.activeClients}</span>
        </div>
      </div>

      {/* Actions menu */}
      <div className="relative flex-shrink-0 w-[44px] flex justify-center" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Acciones"
        >
          <MoreVertical size={15} />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20"
            >
              <Link
                href={`/admin/equipo/${member.id}`}
                className="w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left"
                onClick={() => setMenuOpen(false)}
              >
                <Pencil size={13} /> Ver perfil
              </Link>
              <button
                onClick={() => { setMenuOpen(false); onEdit?.(member) }}
                className="w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left"
              >
                <Pencil size={13} /> Editar
              </button>
              <button
                onClick={() => { setMenuOpen(false); onSuspend?.(member) }}
                className="w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left"
              >
                {isSuspended ? <Play size={13} /> : <Pause size={13} />}
                {isSuspended ? 'Reactivar' : 'Suspender'}
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button
                onClick={() => { setMenuOpen(false); onDelete?.(member) }}
                className="w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-left"
              >
                <Trash2 size={13} /> Eliminar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
