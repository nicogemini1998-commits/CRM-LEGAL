'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'senior' | 'junior'
  cases_assigned: number
}

interface CaseAssignmentProps {
  caseId: string
  currentAssignee?: TeamMember
  onAssign?: (memberId: string) => void
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'María García López',
    email: 'maria@despacho.com',
    role: 'senior',
    cases_assigned: 8,
  },
  {
    id: 'tm-2',
    name: 'Juan Rodríguez Pérez',
    email: 'juan@despacho.com',
    role: 'senior',
    cases_assigned: 6,
  },
  {
    id: 'tm-3',
    name: 'Laura Martínez Silva',
    email: 'laura@despacho.com',
    role: 'junior',
    cases_assigned: 3,
  },
  {
    id: 'tm-4',
    name: 'Carlos Fernández López',
    email: 'carlos@despacho.com',
    role: 'junior',
    cases_assigned: 4,
  },
  {
    id: 'tm-5',
    name: 'Sofia Ruiz Álvarez',
    email: 'sofia@despacho.com',
    role: 'junior',
    cases_assigned: 2,
  },
]

export function CaseAssignment({ caseId, currentAssignee, onAssign }: CaseAssignmentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [assigned, setAssigned] = useState(currentAssignee)

  const handleAssign = (member: TeamMember) => {
    setAssigned(member)
    onAssign?.(member.id)
    setIsOpen(false)
  }

  const getRoleLabel = (role: string) => {
    return role === 'senior' ? 'Senior' : 'Junior'
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm flex items-center justify-between"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-slate-700">
          {assigned ? (
            <div className="flex items-center gap-2">
              <Avatar name={assigned.name} size="sm" type="user" />
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">{assigned.name}</p>
                <p className="text-xs text-slate-500">{getRoleLabel(assigned.role)}</p>
              </div>
            </div>
          ) : (
            'Asignar a abogado'
          )}
        </span>
        <motion.svg
          className="w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
          >
            <div className="p-2">
              <p className="text-xs font-semibold text-slate-500 uppercase px-3 py-2">Selecciona abogado</p>
              {TEAM_MEMBERS.map((member, idx) => (
                <motion.button
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleAssign(member)}
                  className={`w-full px-3 py-2 rounded-lg text-left transition-colors flex items-center gap-3 group ${
                    assigned?.id === member.id
                      ? 'bg-indigo-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <Avatar name={member.name} size="sm" type="user" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">
                      {getRoleLabel(member.role)} • {member.cases_assigned} casos
                    </p>
                  </div>
                  {assigned?.id === member.id && (
                    <motion.svg
                      className="w-5 h-5 text-indigo-600 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </motion.svg>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
