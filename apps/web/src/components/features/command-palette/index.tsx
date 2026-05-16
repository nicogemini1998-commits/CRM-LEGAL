'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: string
  action: () => void
  category: 'navigate' | 'action' | 'case' | 'client' | 'document'
  keywords?: string[]
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  cases?: Array<{ id: string; title: string; status: string }>
  clients?: Array<{ id: string; name: string; email?: string }>
}

export function CommandPalette({ isOpen, onClose, cases = [], clients = [] }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const navigate = useCallback(
    (href: string) => {
      router.push(href)
      onClose()
    },
    [router, onClose]
  )

  const STATIC_COMMANDS: CommandItem[] = [
    {
      id: 'nav-dashboard',
      label: 'Inicio',
      description: 'Volver al dashboard',
      icon: '🏠',
      action: () => navigate('/dashboard'),
      category: 'navigate',
      keywords: ['inicio', 'home', 'dashboard'],
    },
    {
      id: 'nav-cases',
      label: 'Expedientes',
      description: 'Ver todos los casos',
      icon: '📁',
      action: () => navigate('/cases'),
      category: 'navigate',
      keywords: ['casos', 'expedientes', 'cases'],
    },
    {
      id: 'nav-clients',
      label: 'Clientes',
      description: 'Ver todos los clientes',
      icon: '👥',
      action: () => navigate('/clients'),
      category: 'navigate',
      keywords: ['clientes', 'clients', 'crm'],
    },
    {
      id: 'nav-documents',
      label: 'Documentos',
      description: 'Gestión de documentos',
      icon: '📄',
      action: () => navigate('/documents'),
      category: 'navigate',
      keywords: ['documentos', 'archivos', 'files'],
    },
    {
      id: 'nav-generate',
      label: 'Generar Contrato',
      description: 'Crear contrato con IA',
      icon: '✍️',
      action: () => navigate('/generate'),
      category: 'navigate',
      keywords: ['generar', 'contrato', 'nda', 'generate', 'template'],
    },
    {
      id: 'nav-chat',
      label: 'Asistente LEXIA',
      description: 'Chat jurídico con IA',
      icon: '💬',
      action: () => navigate('/chat'),
      category: 'navigate',
      keywords: ['chat', 'ia', 'lexia', 'asistente', 'pregunta'],
    },
    {
      id: 'nav-admin',
      label: 'Administración',
      description: 'Panel de administración del equipo',
      icon: '⚙️',
      action: () => navigate('/admin'),
      category: 'navigate',
      keywords: ['admin', 'equipo', 'team', 'stats'],
    },
    {
      id: 'action-new-case',
      label: 'Nuevo Expediente',
      description: 'Crear un caso nuevo',
      icon: '➕',
      action: () => navigate('/cases?new=true'),
      category: 'action',
      keywords: ['nuevo', 'crear', 'new', 'case', 'expediente'],
    },
    {
      id: 'action-new-doc',
      label: 'Subir Documento',
      description: 'Añadir documento al sistema',
      icon: '📤',
      action: () => navigate('/documents?upload=true'),
      category: 'action',
      keywords: ['subir', 'upload', 'documento', 'archivo'],
    },
    {
      id: 'action-analyze',
      label: 'Analizar Documento con IA',
      description: 'Análisis jurídico automático',
      icon: '🔍',
      action: () => navigate('/documents'),
      category: 'action',
      keywords: ['analizar', 'analyze', 'ia', 'lexia'],
    },
    {
      id: 'action-generate-nda',
      label: 'Generar NDA',
      description: 'Acuerdo de confidencialidad',
      icon: '🔒',
      action: () => navigate('/generate?template=nda'),
      category: 'action',
      keywords: ['nda', 'confidencialidad', 'secreto'],
    },
    {
      id: 'action-generate-buysel',
      label: 'Generar Compraventa',
      description: 'Contrato de compraventa',
      icon: '🏠',
      action: () => navigate('/generate?template=compraventa'),
      category: 'action',
      keywords: ['compraventa', 'inmueble', 'venta', 'compra'],
    },
  ]

  const caseCommands: CommandItem[] = cases.map((c) => ({
    id: `case-${c.id}`,
    label: c.title,
    description: `Expediente • ${c.status === 'open' ? 'Activo' : c.status === 'closed' ? 'Cerrado' : 'Archivado'}`,
    icon: '📁',
    action: () => navigate(`/cases/${c.id}`),
    category: 'case' as const,
    keywords: [c.title.toLowerCase(), c.id],
  }))

  const clientCommands: CommandItem[] = clients.map((c) => ({
    id: `client-${c.id}`,
    label: c.name,
    description: `Cliente ${c.email ? `• ${c.email}` : ''}`,
    icon: '👤',
    action: () => navigate(`/clients/${c.id}`),
    category: 'client' as const,
    keywords: [c.name.toLowerCase(), c.email || ''],
  }))

  const allCommands = [...STATIC_COMMANDS, ...caseCommands, ...clientCommands]

  const filtered = query.trim()
    ? allCommands.filter((cmd) => {
        const q = query.toLowerCase()
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description?.toLowerCase().includes(q) ||
          cmd.keywords?.some((k) => k.includes(q))
        )
      })
    : allCommands.slice(0, 8)

  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filtered[selectedIdx]?.action()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const categoryLabels: Record<string, string> = {
    navigate: 'Navegación',
    action: 'Acciones Rápidas',
    case: 'Expedientes',
    client: 'Clientes',
    document: 'Documentos',
  }

  const groupedFiltered = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 shadow-2xl rounded-2xl overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="bg-white border-b border-slate-100 flex items-center gap-3 px-4 py-4">
              <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar casos, clientes, acciones..."
                className="flex-1 text-base text-slate-900 placeholder-slate-400 outline-none bg-transparent"
              />
              <kbd className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded font-mono">ESC</kbd>
            </div>

            {/* Results */}
            <div className="bg-white max-h-[400px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-medium">Sin resultados para "{query}"</p>
                  <p className="text-sm mt-1">Prueba con otro término</p>
                </div>
              ) : (
                Object.entries(groupedFiltered).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-4 py-2 bg-slate-50">
                      {categoryLabels[category] || category}
                    </p>
                    {items.map((item) => {
                      const globalIdx = filtered.indexOf(item)
                      return (
                        <motion.button
                          key={item.id}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIdx(globalIdx)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            globalIdx === selectedIdx
                              ? 'bg-indigo-50 text-indigo-900'
                              : 'hover:bg-slate-50 text-slate-900'
                          }`}
                          whileTap={{ scale: 0.99 }}
                        >
                          <span className="text-xl flex-shrink-0 w-8 text-center">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.label}</p>
                            {item.description && (
                              <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>
                            )}
                          </div>
                          {globalIdx === selectedIdx && (
                            <kbd className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded font-mono flex-shrink-0">
                              ↵
                            </kbd>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 flex items-center gap-4 text-xs text-slate-400">
              <span><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono">↑↓</kbd> navegar</span>
              <span><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono">↵</kbd> abrir</span>
              <span><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono">ESC</kbd> cerrar</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
