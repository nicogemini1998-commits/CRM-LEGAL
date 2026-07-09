/**
 * RBAC — Sistema de roles y permisos.
 *
 * 5 roles del despacho legal español:
 *   Admin     — Owner técnico de la cuenta (tú/Cliender o socio fundador con poderes totales)
 *   Socio     — Socio del despacho, ve facturación, gestiona equipo
 *   Asociado  — Abogado senior, ve todos los expedientes pero NO facturación global
 *   Becario   — Abogado junior, solo ve expedientes asignados
 *   Asistente — Administrativo/paralegal, gestiona docs y agenda, NO redacta
 */

export type Role = 'Admin' | 'Socio' | 'Asociado' | 'Becario' | 'Asistente'

export interface Permissions {
  // Navegación
  viewDashboard: boolean
  viewCases: boolean       // Expedientes (filtrado por asignación si Becario)
  viewClients: boolean
  viewDocuments: boolean
  viewDeadlines: boolean
  viewTemplates: boolean
  viewChat: boolean        // LEXIA
  viewFinanzas: boolean    // /finanzas
  viewAdmin: boolean       // /admin/*
  viewSettings: boolean

  // Acciones
  createCase: boolean
  editCase: boolean
  deleteCase: boolean
  assignCase: boolean      // Asignar expediente a otro miembro

  createClient: boolean
  editClient: boolean
  deleteClient: boolean

  uploadDocument: boolean
  deleteDocument: boolean

  // Finanzas
  viewInvoices: boolean
  createInvoice: boolean
  emitInvoice: boolean
  viewBudgets: boolean
  createBudget: boolean
  acceptBudget: boolean
  viewEngagements: boolean
  signEngagement: boolean
  runFinancialAgents: boolean   // Ejecutar agentes IA financieros
  viewFinancialKPIs: boolean    // KPIs globales del despacho (facturado total, vencidas)

  // Equipo
  viewTeam: boolean
  inviteMember: boolean
  changeMemberRole: boolean
  suspendMember: boolean
  manageContracts: boolean      // Ver/editar sueldos, contratos

  // Workspace
  manageWorkspace: boolean      // Cambiar nombre/logo/plan del despacho
  manageBilling: boolean        // Suscripción IURALEX

  // Datos sensibles
  viewSalaries: boolean         // Ver sueldos del equipo
  viewAuditLog: boolean         // Log de accesos
}

export const PERMISSIONS_BY_ROLE: Record<Role, Permissions> = {
  Admin: {
    // Acceso total — owner técnico
    viewDashboard: true, viewCases: true, viewClients: true, viewDocuments: true,
    viewDeadlines: true, viewTemplates: true, viewChat: true, viewFinanzas: true,
    viewAdmin: true, viewSettings: true,
    createCase: true, editCase: true, deleteCase: true, assignCase: true,
    createClient: true, editClient: true, deleteClient: true,
    uploadDocument: true, deleteDocument: true,
    viewInvoices: true, createInvoice: true, emitInvoice: true,
    viewBudgets: true, createBudget: true, acceptBudget: true,
    viewEngagements: true, signEngagement: true,
    runFinancialAgents: true, viewFinancialKPIs: true,
    viewTeam: true, inviteMember: true, changeMemberRole: true, suspendMember: true, manageContracts: true,
    manageWorkspace: true, manageBilling: true,
    viewSalaries: true, viewAuditLog: true,
  },
  Socio: {
    // Socio: ve todo del despacho, gestiona equipo y facturación
    viewDashboard: true, viewCases: true, viewClients: true, viewDocuments: true,
    viewDeadlines: true, viewTemplates: true, viewChat: true, viewFinanzas: true,
    viewAdmin: true, viewSettings: true,
    createCase: true, editCase: true, deleteCase: true, assignCase: true,
    createClient: true, editClient: true, deleteClient: true,
    uploadDocument: true, deleteDocument: true,
    viewInvoices: true, createInvoice: true, emitInvoice: true,
    viewBudgets: true, createBudget: true, acceptBudget: true,
    viewEngagements: true, signEngagement: true,
    runFinancialAgents: true, viewFinancialKPIs: true,
    viewTeam: true, inviteMember: true, changeMemberRole: true, suspendMember: true, manageContracts: true,
    manageWorkspace: true, manageBilling: true,
    viewSalaries: true, viewAuditLog: true,
  },
  Asociado: {
    // Senior: trabaja en todos los expedientes pero NO ve facturación global ni gestiona equipo
    viewDashboard: true, viewCases: true, viewClients: true, viewDocuments: true,
    viewDeadlines: true, viewTemplates: true, viewChat: true, viewFinanzas: true,
    viewAdmin: false, viewSettings: true,
    createCase: true, editCase: true, deleteCase: false, assignCase: false,
    createClient: true, editClient: true, deleteClient: false,
    uploadDocument: true, deleteDocument: false,
    viewInvoices: true, createInvoice: true, emitInvoice: false,
    viewBudgets: true, createBudget: true, acceptBudget: false,
    viewEngagements: true, signEngagement: false,
    runFinancialAgents: false, viewFinancialKPIs: false,
    viewTeam: true, inviteMember: false, changeMemberRole: false, suspendMember: false, manageContracts: false,
    manageWorkspace: false, manageBilling: false,
    viewSalaries: false, viewAuditLog: false,
  },
  Becario: {
    // Junior: solo expedientes asignados, sin finanzas, sin equipo, sin admin
    viewDashboard: true, viewCases: true, viewClients: true, viewDocuments: true,
    viewDeadlines: true, viewTemplates: true, viewChat: true,
    viewFinanzas: false,
    viewAdmin: false, viewSettings: true,
    createCase: false, editCase: true, deleteCase: false, assignCase: false,
    createClient: false, editClient: false, deleteClient: false,
    uploadDocument: true, deleteDocument: false,
    viewInvoices: false, createInvoice: false, emitInvoice: false,
    viewBudgets: false, createBudget: false, acceptBudget: false,
    viewEngagements: false, signEngagement: false,
    runFinancialAgents: false, viewFinancialKPIs: false,
    viewTeam: true, inviteMember: false, changeMemberRole: false, suspendMember: false, manageContracts: false,
    manageWorkspace: false, manageBilling: false,
    viewSalaries: false, viewAuditLog: false,
  },
  Asistente: {
    // Administrativo: gestiona docs y agenda. SÍ ve facturación operativa (cobros) pero NO KPIs globales
    viewDashboard: true, viewCases: true, viewClients: true, viewDocuments: true,
    viewDeadlines: true, viewTemplates: false, viewChat: true,
    viewFinanzas: true,
    viewAdmin: false, viewSettings: true,
    createCase: false, editCase: false, deleteCase: false, assignCase: false,
    createClient: true, editClient: true, deleteClient: false,
    uploadDocument: true, deleteDocument: false,
    viewInvoices: true, createInvoice: true, emitInvoice: true,
    viewBudgets: true, createBudget: true, acceptBudget: false,
    viewEngagements: true, signEngagement: false,
    runFinancialAgents: true, viewFinancialKPIs: false,
    viewTeam: false, inviteMember: false, changeMemberRole: false, suspendMember: false, manageContracts: false,
    manageWorkspace: false, manageBilling: false,
    viewSalaries: false, viewAuditLog: false,
  },
}

export function hasPermission(role: Role | undefined, perm: keyof Permissions): boolean {
  if (!role) return false
  return PERMISSIONS_BY_ROLE[role]?.[perm] ?? false
}

export const ROLE_LABELS: Record<Role, { label: string; color: string; bg: string; description: string }> = {
  Admin:     { label: 'Admin',     color: '#7C3AED', bg: '#F3E8FF', description: 'Acceso total al sistema. Reservado al owner técnico.' },
  Socio:     { label: 'Socio',     color: '#0F172A', bg: '#E2E8F0', description: 'Socio del despacho. Ve facturación, gestiona equipo.' },
  Asociado:  { label: 'Asociado',  color: '#1D4ED8', bg: '#DBEAFE', description: 'Abogado senior. Trabaja en todos los expedientes.' },
  Becario:   { label: 'Becario',   color: '#16A34A', bg: '#DCFCE7', description: 'Abogado junior. Solo expedientes asignados.' },
  Asistente: { label: 'Asistente', color: '#EA580C', bg: '#FFEDD5', description: 'Administrativo/paralegal. Gestión documental.' },
}
