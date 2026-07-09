export type RoleType = 'Admin' | 'Socio' | 'Asociado' | 'Becario' | 'Asistente'
export type MemberStatus = 'active' | 'pending' | 'suspended'
export type ContractType = 'indefinido' | 'temporal' | 'freelance'
export type LegalSpecialty = 'Civil' | 'Penal' | 'Laboral' | 'Mercantil' | 'Familia' | 'Administrativo' | 'Fiscal' | 'Inmobiliario' | 'Gestión'

export interface MemberContract {
  id: string
  type: ContractType
  startDate: string // ISO
  endDate?: string | null
  salary: number // monthly EUR
  hoursPerWeek: number
  status: 'active' | 'expired' | 'draft'
}

export interface MemberPermissions {
  viewClients: boolean
  createCases: boolean
  generateContracts: boolean
  accessBilling: boolean
  manageTeam: boolean
}

export interface ActivityEvent {
  date: string // ISO
  action: string
  target: string
}

export interface MemberStats {
  activeCases: number
  documentsGenerated: number
  hoursThisMonth: number
  activeClients: number
}

export interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: RoleType
  status: MemberStatus
  lastActive: string // ISO date
  specialties: string[]
  // Extended profile
  dni: string
  address: string
  phone: string
  hireDate: string // ISO
  colegio: string
  colegioNumber: string
  specialty: LegalSpecialty
  contracts: MemberContract[]
  permissions: MemberPermissions
  activityLog: ActivityEvent[]
  stats: MemberStats
}

// Helper: build a realistic activityLog (15 events) for a member, last 30 days
function buildActivityLog(seed: string): ActivityEvent[] {
  const base = new Date('2026-05-21T10:00:00Z').getTime()
  const actions: Array<[string, string[]]> = [
    ['Creó expediente', ['EXP-2026-0142', 'EXP-2026-0388', 'EXP-2026-0421', 'EXP-2026-0334']],
    ['Subió documento', ['Demanda monitoria Edifor.pdf', 'NDA TechNova v3.pdf', 'Convenio regulador.docx']],
    ['Generó contrato', ['NDA estándar', 'Arrendamiento local', 'Prestación de servicios']],
    ['Actualizó cliente', ['Construcciones Mediterráneo S.L.', 'TechNova Innovations', 'María García Pérez']],
    ['Asistió a reunión', ['Negociación JV', 'Conciliación SMAC', 'Vista oral']],
    ['Cerró tarea', ['Revisión doc. legal', 'Llamada al cliente', 'Borrador contrato']],
    ['Comentó en expediente', ['EXP-2026-0198', 'EXP-2026-0267', 'EXP-2026-0301']],
  ]
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const events: ActivityEvent[] = []
  for (let i = 0; i < 15; i++) {
    h = (h * 1103515245 + 12345) >>> 0
    const [action, targets] = actions[h % actions.length]
    h = (h * 1103515245 + 12345) >>> 0
    const target = targets[h % targets.length]
    const daysBack = i * 2 + ((h >> 8) % 2)
    const eventDate = new Date(base - daysBack * 86400000 - ((h >> 16) % 8) * 3600000)
    events.push({
      date: eventDate.toISOString(),
      action,
      target,
    })
  }
  return events
}

export const DEMO_MEMBERS: TeamMember[] = [
  {
    id: 'm-1',
    firstName: 'María',
    lastName: 'González Ruiz',
    email: 'maria.gonzalez@iuralex.es',
    role: 'Socio',
    status: 'active',
    lastActive: '2026-05-21',
    specialties: ['Civil', 'Mercantil'],
    dni: '50.123.456-A',
    address: 'Calle Velázquez 78, 4º D, 28001 Madrid',
    phone: '+34 91 432 18 90',
    hireDate: '2014-03-15',
    colegio: 'ICAM (Madrid)',
    colegioNumber: '72.451',
    specialty: 'Mercantil',
    contracts: [
      { id: 'ct-1a', type: 'indefinido', startDate: '2014-03-15', endDate: null, salary: 8500, hoursPerWeek: 45, status: 'active' },
    ],
    permissions: { viewClients: true, createCases: true, generateContracts: true, accessBilling: true, manageTeam: true },
    activityLog: buildActivityLog('m-1'),
    stats: { activeCases: 34, documentsGenerated: 128, hoursThisMonth: 162, activeClients: 18 },
  },
  {
    id: 'm-2',
    firstName: 'Carlos',
    lastName: 'Martínez López',
    email: 'carlos.martinez@iuralex.es',
    role: 'Asociado',
    status: 'active',
    lastActive: '2026-05-20',
    specialties: ['Laboral'],
    dni: '47.892.034-K',
    address: 'Calle Atocha 112, 2º Izq., 28012 Madrid',
    phone: '+34 91 528 76 44',
    hireDate: '2019-09-02',
    colegio: 'ICAM (Madrid)',
    colegioNumber: '85.302',
    specialty: 'Laboral',
    contracts: [
      { id: 'ct-2a', type: 'indefinido', startDate: '2019-09-02', endDate: null, salary: 4200, hoursPerWeek: 40, status: 'active' },
    ],
    permissions: { viewClients: true, createCases: true, generateContracts: true, accessBilling: false, manageTeam: false },
    activityLog: buildActivityLog('m-2'),
    stats: { activeCases: 22, documentsGenerated: 94, hoursThisMonth: 158, activeClients: 14 },
  },
  {
    id: 'm-3',
    firstName: 'Ana',
    lastName: 'Fernández Castro',
    email: 'ana.fernandez@iuralex.es',
    role: 'Asociado',
    status: 'active',
    lastActive: '2026-05-21',
    specialties: ['Penal'],
    dni: '52.376.114-G',
    address: 'Calle Goya 45, 3º C, 28001 Madrid',
    phone: '+34 91 612 38 19',
    hireDate: '2020-01-20',
    colegio: 'ICAM (Madrid)',
    colegioNumber: '87.146',
    specialty: 'Penal',
    contracts: [
      { id: 'ct-3a', type: 'indefinido', startDate: '2020-01-20', endDate: null, salary: 4400, hoursPerWeek: 40, status: 'active' },
    ],
    permissions: { viewClients: true, createCases: true, generateContracts: true, accessBilling: false, manageTeam: false },
    activityLog: buildActivityLog('m-3'),
    stats: { activeCases: 19, documentsGenerated: 86, hoursThisMonth: 164, activeClients: 12 },
  },
  {
    id: 'm-4',
    firstName: 'Pedro',
    lastName: 'Sánchez Moreno',
    email: 'pedro.sanchez@iuralex.es',
    role: 'Asociado',
    status: 'active',
    lastActive: '2026-05-19',
    specialties: ['Inmobiliario'],
    dni: '49.012.778-P',
    address: 'Calle Princesa 56, 5º A, 28008 Madrid',
    phone: '+34 91 745 22 31',
    hireDate: '2021-06-14',
    colegio: 'ICAM (Madrid)',
    colegioNumber: '89.578',
    specialty: 'Civil',
    contracts: [
      { id: 'ct-4a', type: 'temporal', startDate: '2021-06-14', endDate: '2024-06-13', salary: 3800, hoursPerWeek: 40, status: 'expired' },
      { id: 'ct-4b', type: 'indefinido', startDate: '2024-06-14', endDate: null, salary: 4300, hoursPerWeek: 40, status: 'active' },
    ],
    permissions: { viewClients: true, createCases: true, generateContracts: true, accessBilling: false, manageTeam: false },
    activityLog: buildActivityLog('m-4'),
    stats: { activeCases: 16, documentsGenerated: 71, hoursThisMonth: 148, activeClients: 9 },
  },
  {
    id: 'm-5',
    firstName: 'Laura',
    lastName: 'Jiménez Vega',
    email: 'laura.jimenez@iuralex.es',
    role: 'Becario',
    status: 'active',
    lastActive: '2026-05-15',
    specialties: ['Familia'],
    dni: '54.821.339-D',
    address: 'Calle Hortaleza 28, 4º Dcha., 28004 Madrid',
    phone: '+34 91 198 04 56',
    hireDate: '2025-09-15',
    colegio: 'ICAM (Madrid) — en trámite',
    colegioNumber: 'Pdte.',
    specialty: 'Familia',
    contracts: [
      { id: 'ct-5a', type: 'temporal', startDate: '2025-09-15', endDate: '2026-09-14', salary: 1450, hoursPerWeek: 30, status: 'active' },
    ],
    permissions: { viewClients: true, createCases: false, generateContracts: false, accessBilling: false, manageTeam: false },
    activityLog: buildActivityLog('m-5'),
    stats: { activeCases: 8, documentsGenerated: 32, hoursThisMonth: 118, activeClients: 5 },
  },
  {
    id: 'm-6',
    firstName: 'Roberto',
    lastName: 'Navarro Gil',
    email: 'roberto.navarro@iuralex.es',
    role: 'Asistente',
    status: 'active',
    lastActive: '2026-05-21',
    specialties: ['Administrativo'],
    dni: '46.553.927-T',
    address: 'Calle Bravo Murillo 211, 1º B, 28020 Madrid',
    phone: '+34 91 305 87 22',
    hireDate: '2018-11-05',
    colegio: 'N/A',
    colegioNumber: 'N/A',
    specialty: 'Administrativo',
    contracts: [
      { id: 'ct-6a', type: 'indefinido', startDate: '2018-11-05', endDate: null, salary: 2100, hoursPerWeek: 40, status: 'active' },
    ],
    permissions: { viewClients: true, createCases: false, generateContracts: false, accessBilling: false, manageTeam: false },
    activityLog: buildActivityLog('m-6'),
    stats: { activeCases: 0, documentsGenerated: 54, hoursThisMonth: 160, activeClients: 0 },
  },
  {
    id: 'm-7',
    firstName: 'Elena',
    lastName: 'Torres Vidal',
    email: 'elena.torres@iuralex.es',
    role: 'Admin',
    status: 'active',
    lastActive: '2026-05-21',
    specialties: ['Gestión'],
    dni: '53.108.460-Q',
    address: 'Calle Serrano 102, 6º A, 28006 Madrid',
    phone: '+34 91 422 91 04',
    hireDate: '2016-04-18',
    colegio: 'N/A',
    colegioNumber: 'N/A',
    specialty: 'Gestión',
    contracts: [
      { id: 'ct-7a', type: 'indefinido', startDate: '2016-04-18', endDate: null, salary: 3600, hoursPerWeek: 40, status: 'active' },
    ],
    permissions: { viewClients: true, createCases: true, generateContracts: true, accessBilling: true, manageTeam: true },
    activityLog: buildActivityLog('m-7'),
    stats: { activeCases: 4, documentsGenerated: 47, hoursThisMonth: 156, activeClients: 22 },
  },
  {
    id: 'm-8',
    firstName: 'Javier',
    lastName: 'Romero Cano',
    email: 'javier.romero@iuralex.es',
    role: 'Becario',
    status: 'pending',
    lastActive: '2026-05-10',
    specialties: ['Fiscal'],
    dni: '55.624.018-N',
    address: 'Calle Fuencarral 134, 3º Izq., 28010 Madrid',
    phone: '+34 91 678 33 81',
    hireDate: '2026-05-15',
    colegio: 'ICAM (Madrid) — en trámite',
    colegioNumber: 'Pdte.',
    specialty: 'Fiscal',
    contracts: [
      { id: 'ct-8a', type: 'freelance', startDate: '2026-05-15', endDate: null, salary: 1200, hoursPerWeek: 20, status: 'draft' },
    ],
    permissions: { viewClients: false, createCases: false, generateContracts: false, accessBilling: false, manageTeam: false },
    activityLog: buildActivityLog('m-8'),
    stats: { activeCases: 0, documentsGenerated: 0, hoursThisMonth: 0, activeClients: 0 },
  },
]

export function getMemberById(id: string): TeamMember | undefined {
  return DEMO_MEMBERS.find(m => m.id === id)
}

export const ROLE_DEFINITIONS: {
  role: RoleType
  description: string
  permissions: string[]
  accent: string
}[] = [
  {
    role: 'Admin',
    description: 'Acceso completo al sistema, configuración del despacho y gestión de miembros.',
    permissions: ['Gestionar equipo', 'Configurar despacho', 'Acceso a facturación', 'Auditoría'],
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    role: 'Socio',
    description: 'Visión global del despacho. Gestiona casos, clientes y supervisa al equipo.',
    permissions: ['Todos los casos', 'Todos los clientes', 'Reportes financieros', 'Asignar trabajo'],
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    role: 'Asociado',
    description: 'Letrado/a con cartera propia. Gestiona sus casos y clientes asignados.',
    permissions: ['Casos asignados', 'Clientes asignados', 'Crear documentos', 'Chat LEXIA'],
    accent: 'from-blue-500 to-indigo-500',
  },
  {
    role: 'Becario',
    description: 'Acceso de lectura a casos asignados. Soporte y aprendizaje supervisado.',
    permissions: ['Lectura casos asignados', 'Plantillas', 'Borradores documentos'],
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    role: 'Asistente',
    description: 'Soporte administrativo. Gestión documental y agenda.',
    permissions: ['Documentos', 'Calendario', 'Contactos clientes'],
    accent: 'from-amber-500 to-orange-500',
  },
]

export const ROLE_BADGE_STYLES: Record<RoleType, string> = {
  Admin: 'bg-violet-100 text-violet-700 border-violet-200',
  Socio: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Asociado: 'bg-blue-100 text-blue-700 border-blue-200',
  Becario: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Asistente: 'bg-amber-100 text-amber-700 border-amber-200',
}

export function avatarGradient(seed: string): string {
  const palettes = [
    'from-violet-500 to-fuchsia-500',
    'from-indigo-500 to-violet-500',
    'from-blue-500 to-indigo-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-cyan-500 to-blue-500',
    'from-fuchsia-500 to-pink-500',
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return palettes[hash % palettes.length]
}

export function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date('2026-05-21T10:00:00Z')
  const diffMs = now.getTime() - d.getTime()
  const days = Math.floor(diffMs / 86_400_000)
  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem`
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
