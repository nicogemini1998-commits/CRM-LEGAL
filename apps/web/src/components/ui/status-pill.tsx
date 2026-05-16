type StatusKey =
  | 'active' | 'open' | 'closed' | 'archived'
  | 'confidential' | 'draft' | 'in-review' | 'completed'

interface StatusPillProps {
  status: StatusKey
  label?: string
  className?: string
}

const STATUS_MAP: Record<StatusKey, { label: string; dot: string; text: string; bg: string }> = {
  active:       { label: 'Activo',       dot: '#16A34A', text: '#166534', bg: '#DCFCE7' },
  open:         { label: 'Activo',       dot: '#16A34A', text: '#166534', bg: '#DCFCE7' },
  closed:       { label: 'Cerrado',      dot: '#737373', text: '#404040', bg: '#F5F5F4' },
  archived:     { label: 'Archivado',    dot: '#F59E0B', text: '#92400E', bg: '#FEF3C7' },
  confidential: { label: 'Confidencial', dot: '#831843', text: '#831843', bg: '#FCE7F3' },
  draft:        { label: 'Borrador',     dot: '#A3A3A3', text: '#525252', bg: '#F5F5F4' },
  'in-review':  { label: 'En revisión',  dot: '#2563EB', text: '#1E40AF', bg: '#DBEAFE' },
  completed:    { label: 'Completado',   dot: '#16A34A', text: '#166534', bg: '#DCFCE7' },
}

export function StatusPill({ status, label, className = '' }: StatusPillProps) {
  const s = STATUS_MAP[status] || STATUS_MAP.draft
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${className}`}
      style={{ background: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {label || s.label}
    </span>
  )
}
