'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

type Position = 'Socia' | 'Socio' | 'Senior' | 'Junior' | 'Paralegal' | 'Administrativo'
type StatusType = 'Disponible' | 'En juicio' | 'Vacaciones'
type TabId = 'info' | 'rendimiento' | 'casos' | 'clientes' | 'tareas'
type Priority = 'Alta' | 'Media' | 'Baja'
type TaskStatus = 'Pendiente' | 'En curso' | 'Completada'
type ContractType = 'Indefinido' | 'Temporal' | 'Asociado' | 'Autónomo'

interface Case {
  id: string
  title: string
  client: string
  status: 'Activo' | 'En revisión' | 'Urgente'
  deadline: string
}

interface ClientRecord {
  id: string
  name: string
  totalCases: number
  lastInteraction: string
}

interface Task {
  id: string
  title: string
  priority: Priority
  dueDate: string
  status: TaskStatus
}

interface MonthlyStats {
  month: string
  casosCerrados: number
  facturacion: number
}

interface Lawyer {
  id: string
  firstName: string
  lastName: string
  position: Position
  status: StatusType
  email: string
  phone: string
  colegioNum: string
  specialties: string[]
  startDate: string
  contractType: ContractType
  casosActivos: number
  facturadoMes: number
  tasaExito: number
  tiempoMedioResolucion: number
  satisfaccionCliente: number
  nps: number
  cases: Case[]
  clients: ClientRecord[]
  tasks: Task[]
  monthlyStats: MonthlyStats[]
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_LAWYERS: Lawyer[] = [
  {
    id: 'l-1',
    firstName: 'María',
    lastName: 'González Ruiz',
    position: 'Socia',
    status: 'Disponible',
    email: 'maria.gonzalez@lexia.es',
    phone: '+34 91 234 56 78',
    colegioNum: 'MAD-12453',
    specialties: ['Civil', 'Mercantil'],
    startDate: '2015-03-01',
    contractType: 'Indefinido',
    casosActivos: 12,
    facturadoMes: 18400,
    tasaExito: 87,
    tiempoMedioResolucion: 38,
    satisfaccionCliente: 4.8,
    nps: 72,
    cases: [
      { id: 'c-1', title: 'Reclamación contrato suministro', client: 'Inmogroup SL', status: 'Activo', deadline: '2026-06-15' },
      { id: 'c-2', title: 'Fusión empresarial Rodríguez & Hijos', client: 'Rodríguez & Hijos SA', status: 'En revisión', deadline: '2026-07-01' },
      { id: 'c-3', title: 'Disputa accionarial Tecnivest', client: 'Tecnivest Capital', status: 'Urgente', deadline: '2026-05-28' },
    ],
    clients: [
      { id: 'cl-1', name: 'Inmogroup SL', totalCases: 4, lastInteraction: '2026-05-10' },
      { id: 'cl-2', name: 'Rodríguez & Hijos SA', totalCases: 2, lastInteraction: '2026-05-12' },
      { id: 'cl-3', name: 'Tecnivest Capital', totalCases: 3, lastInteraction: '2026-05-14' },
    ],
    tasks: [
      { id: 't-1', title: 'Redactar demanda civil Inmogroup', priority: 'Alta', dueDate: '2026-05-20', status: 'En curso' },
      { id: 't-2', title: 'Revisión escrituras fusión', priority: 'Media', dueDate: '2026-05-25', status: 'Pendiente' },
      { id: 't-3', title: 'Reunión accionistas Tecnivest', priority: 'Alta', dueDate: '2026-05-18', status: 'Completada' },
    ],
    monthlyStats: [
      { month: 'Dic', casosCerrados: 5, facturacion: 14200 },
      { month: 'Ene', casosCerrados: 7, facturacion: 16800 },
      { month: 'Feb', casosCerrados: 4, facturacion: 12100 },
      { month: 'Mar', casosCerrados: 8, facturacion: 19500 },
      { month: 'Abr', casosCerrados: 6, facturacion: 17300 },
      { month: 'May', casosCerrados: 3, facturacion: 18400 },
    ],
  },
  {
    id: 'l-2',
    firstName: 'Carlos',
    lastName: 'Martínez López',
    position: 'Senior',
    status: 'En juicio',
    email: 'carlos.martinez@lexia.es',
    phone: '+34 91 234 56 79',
    colegioNum: 'MAD-09821',
    specialties: ['Laboral'],
    startDate: '2018-09-01',
    contractType: 'Indefinido',
    casosActivos: 9,
    facturadoMes: 11200,
    tasaExito: 81,
    tiempoMedioResolucion: 52,
    satisfaccionCliente: 4.5,
    nps: 61,
    cases: [
      { id: 'c-4', title: 'ERE Manufactura Ibérica', client: 'Manufactura Ibérica SA', status: 'Urgente', deadline: '2026-05-22' },
      { id: 'c-5', title: 'Despido improcedente Gómez', client: 'Jorge Gómez Pérez', status: 'Activo', deadline: '2026-06-10' },
      { id: 'c-6', title: 'Reclamación salarios atrasados', client: 'Cooperativa Sur', status: 'En revisión', deadline: '2026-06-30' },
    ],
    clients: [
      { id: 'cl-4', name: 'Manufactura Ibérica SA', totalCases: 5, lastInteraction: '2026-05-13' },
      { id: 'cl-5', name: 'Jorge Gómez Pérez', totalCases: 1, lastInteraction: '2026-05-08' },
      { id: 'cl-6', name: 'Cooperativa Sur', totalCases: 3, lastInteraction: '2026-04-30' },
    ],
    tasks: [
      { id: 't-4', title: 'Preparar alegaciones ERE', priority: 'Alta', dueDate: '2026-05-19', status: 'En curso' },
      { id: 't-5', title: 'Revisar convenio colectivo', priority: 'Media', dueDate: '2026-05-28', status: 'Pendiente' },
    ],
    monthlyStats: [
      { month: 'Dic', casosCerrados: 4, facturacion: 9800 },
      { month: 'Ene', casosCerrados: 5, facturacion: 10200 },
      { month: 'Feb', casosCerrados: 3, facturacion: 8700 },
      { month: 'Mar', casosCerrados: 6, facturacion: 12400 },
      { month: 'Abr', casosCerrados: 4, facturacion: 10900 },
      { month: 'May', casosCerrados: 2, facturacion: 11200 },
    ],
  },
  {
    id: 'l-3',
    firstName: 'Ana',
    lastName: 'Fernández Castro',
    position: 'Senior',
    status: 'Disponible',
    email: 'ana.fernandez@lexia.es',
    phone: '+34 91 234 56 80',
    colegioNum: 'MAD-14302',
    specialties: ['Penal'],
    startDate: '2019-01-15',
    contractType: 'Indefinido',
    casosActivos: 7,
    facturadoMes: 9800,
    tasaExito: 76,
    tiempoMedioResolucion: 65,
    satisfaccionCliente: 4.6,
    nps: 58,
    cases: [
      { id: 'c-7', title: 'Defensa penal caso Moreno', client: 'Rafael Moreno Díaz', status: 'Activo', deadline: '2026-07-15' },
      { id: 'c-8', title: 'Estafa inmobiliaria colectiva', client: 'Asociación Víctimas Promo-X', status: 'En revisión', deadline: '2026-08-01' },
      { id: 'c-9', title: 'Violencia económica Rueda', client: 'Silvia Rueda Lamas', status: 'Activo', deadline: '2026-06-20' },
    ],
    clients: [
      { id: 'cl-7', name: 'Rafael Moreno Díaz', totalCases: 1, lastInteraction: '2026-05-09' },
      { id: 'cl-8', name: 'Asociación Víctimas Promo-X', totalCases: 2, lastInteraction: '2026-05-05' },
      { id: 'cl-9', name: 'Silvia Rueda Lamas', totalCases: 1, lastInteraction: '2026-05-11' },
    ],
    tasks: [
      { id: 't-6', title: 'Lectura atestado policial Moreno', priority: 'Alta', dueDate: '2026-05-17', status: 'Completada' },
      { id: 't-7', title: 'Contacto peritos informáticos', priority: 'Media', dueDate: '2026-05-24', status: 'Pendiente' },
      { id: 't-8', title: 'Preparar escrito de defensa', priority: 'Alta', dueDate: '2026-05-30', status: 'En curso' },
    ],
    monthlyStats: [
      { month: 'Dic', casosCerrados: 2, facturacion: 7200 },
      { month: 'Ene', casosCerrados: 3, facturacion: 8100 },
      { month: 'Feb', casosCerrados: 2, facturacion: 7500 },
      { month: 'Mar', casosCerrados: 4, facturacion: 10200 },
      { month: 'Abr', casosCerrados: 3, facturacion: 9400 },
      { month: 'May', casosCerrados: 1, facturacion: 9800 },
    ],
  },
  {
    id: 'l-4',
    firstName: 'Pedro',
    lastName: 'Sánchez Moreno',
    position: 'Junior',
    status: 'Disponible',
    email: 'pedro.sanchez@lexia.es',
    phone: '+34 91 234 56 81',
    colegioNum: 'MAD-19876',
    specialties: ['Inmobiliario'],
    startDate: '2022-06-01',
    contractType: 'Indefinido',
    casosActivos: 5,
    facturadoMes: 5400,
    tasaExito: 70,
    tiempoMedioResolucion: 44,
    satisfaccionCliente: 4.3,
    nps: 48,
    cases: [
      { id: 'c-10', title: 'Compraventa piso c/ Serrano 45', client: 'Familia Herrera Torres', status: 'Activo', deadline: '2026-06-05' },
      { id: 'c-11', title: 'Arrendamiento local comercial', client: 'Tiendas Moda SL', status: 'En revisión', deadline: '2026-05-31' },
    ],
    clients: [
      { id: 'cl-10', name: 'Familia Herrera Torres', totalCases: 2, lastInteraction: '2026-05-07' },
      { id: 'cl-11', name: 'Tiendas Moda SL', totalCases: 1, lastInteraction: '2026-04-28' },
    ],
    tasks: [
      { id: 't-9', title: 'Revisar nota simple registro', priority: 'Media', dueDate: '2026-05-20', status: 'Pendiente' },
      { id: 't-10', title: 'Preparar contrato arrendamiento', priority: 'Baja', dueDate: '2026-05-27', status: 'Pendiente' },
    ],
    monthlyStats: [
      { month: 'Dic', casosCerrados: 2, facturacion: 4100 },
      { month: 'Ene', casosCerrados: 3, facturacion: 4800 },
      { month: 'Feb', casosCerrados: 2, facturacion: 3900 },
      { month: 'Mar', casosCerrados: 3, facturacion: 5200 },
      { month: 'Abr', casosCerrados: 2, facturacion: 5000 },
      { month: 'May', casosCerrados: 1, facturacion: 5400 },
    ],
  },
  {
    id: 'l-5',
    firstName: 'Laura',
    lastName: 'Jiménez Vega',
    position: 'Junior',
    status: 'Vacaciones',
    email: 'laura.jimenez@lexia.es',
    phone: '+34 91 234 56 82',
    colegioNum: 'MAD-21034',
    specialties: ['Familia'],
    startDate: '2023-02-01',
    contractType: 'Indefinido',
    casosActivos: 4,
    facturadoMes: 4100,
    tasaExito: 73,
    tiempoMedioResolucion: 57,
    satisfaccionCliente: 4.4,
    nps: 52,
    cases: [
      { id: 'c-12', title: 'Divorcio contencioso Pardo', client: 'Elena Pardo Ríos', status: 'Activo', deadline: '2026-07-10' },
      { id: 'c-13', title: 'Custodia compartida Vela', client: 'Antonio Vela Cruz', status: 'En revisión', deadline: '2026-06-25' },
    ],
    clients: [
      { id: 'cl-12', name: 'Elena Pardo Ríos', totalCases: 1, lastInteraction: '2026-05-02' },
      { id: 'cl-13', name: 'Antonio Vela Cruz', totalCases: 1, lastInteraction: '2026-04-25' },
    ],
    tasks: [
      { id: 't-11', title: 'Solicitar informe psicológico', priority: 'Alta', dueDate: '2026-05-22', status: 'Pendiente' },
      { id: 't-12', title: 'Preparar propuesta convenio', priority: 'Media', dueDate: '2026-06-01', status: 'Pendiente' },
    ],
    monthlyStats: [
      { month: 'Dic', casosCerrados: 1, facturacion: 3200 },
      { month: 'Ene', casosCerrados: 2, facturacion: 3800 },
      { month: 'Feb', casosCerrados: 1, facturacion: 2900 },
      { month: 'Mar', casosCerrados: 2, facturacion: 4100 },
      { month: 'Abr', casosCerrados: 2, facturacion: 4300 },
      { month: 'May', casosCerrados: 0, facturacion: 4100 },
    ],
  },
  {
    id: 'l-6',
    firstName: 'Roberto',
    lastName: 'Navarro Gil',
    position: 'Paralegal',
    status: 'Disponible',
    email: 'roberto.navarro@lexia.es',
    phone: '+34 91 234 56 83',
    colegioNum: 'N/A',
    specialties: ['Administrativo'],
    startDate: '2021-10-01',
    contractType: 'Indefinido',
    casosActivos: 6,
    facturadoMes: 3200,
    tasaExito: 78,
    tiempoMedioResolucion: 30,
    satisfaccionCliente: 4.2,
    nps: 44,
    cases: [
      { id: 'c-14', title: 'Recurso administrativo sanción tráfico', client: 'Distribuciones Norte SL', status: 'Activo', deadline: '2026-06-02' },
      { id: 'c-15', title: 'Licencia apertura negocio', client: 'Bar Restaurante Mirador', status: 'En revisión', deadline: '2026-05-29' },
    ],
    clients: [
      { id: 'cl-14', name: 'Distribuciones Norte SL', totalCases: 3, lastInteraction: '2026-05-06' },
      { id: 'cl-15', name: 'Bar Restaurante Mirador', totalCases: 1, lastInteraction: '2026-04-22' },
    ],
    tasks: [
      { id: 't-13', title: 'Recopilar documentación expediente', priority: 'Media', dueDate: '2026-05-19', status: 'En curso' },
      { id: 't-14', title: 'Enviar escrito Ayuntamiento', priority: 'Alta', dueDate: '2026-05-21', status: 'Pendiente' },
      { id: 't-15', title: 'Archivar resoluciones mes pasado', priority: 'Baja', dueDate: '2026-05-31', status: 'Completada' },
    ],
    monthlyStats: [
      { month: 'Dic', casosCerrados: 3, facturacion: 2800 },
      { month: 'Ene', casosCerrados: 4, facturacion: 3100 },
      { month: 'Feb', casosCerrados: 3, facturacion: 2600 },
      { month: 'Mar', casosCerrados: 5, facturacion: 3400 },
      { month: 'Abr', casosCerrados: 4, facturacion: 3200 },
      { month: 'May', casosCerrados: 2, facturacion: 3200 },
    ],
  },
]

// Team averages for comparison
const TEAM_AVG = {
  tasaExito: Math.round(DEMO_LAWYERS.reduce((s, l) => s + l.tasaExito, 0) / DEMO_LAWYERS.length),
  tiempoMedioResolucion: Math.round(DEMO_LAWYERS.reduce((s, l) => s + l.tiempoMedioResolucion, 0) / DEMO_LAWYERS.length),
  satisfaccionCliente: (DEMO_LAWYERS.reduce((s, l) => s + l.satisfaccionCliente, 0) / DEMO_LAWYERS.length).toFixed(1),
  nps: Math.round(DEMO_LAWYERS.reduce((s, l) => s + l.nps, 0) / DEMO_LAWYERS.length),
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nameHash(name: string): number {
  return name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

function avatarGradient(name: string): string {
  const hash = nameHash(name)
  const hue = (hash * 47) % 360
  return `linear-gradient(135deg, hsl(${hue},65%,55%) 0%, hsl(${(hue + 40) % 360},65%,38%) 100%)`
}

function initials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Color maps ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<StatusType, string> = {
  'Disponible': '#22c55e',
  'En juicio': '#f59e0b',
  'Vacaciones': '#6366f1',
}

const POSITION_COLORS: Record<Position, { bg: string; text: string }> = {
  'Socia': { bg: '#fdf4ff', text: '#9333ea' },
  'Socio': { bg: '#fdf4ff', text: '#9333ea' },
  'Senior': { bg: '#eff6ff', text: '#2563eb' },
  'Junior': { bg: '#f0fdf4', text: '#16a34a' },
  'Paralegal': { bg: '#fff7ed', text: '#c2410c' },
  'Administrativo': { bg: '#f8fafc', text: '#475569' },
}

const CASE_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  'Activo': { bg: '#f0fdf4', text: '#16a34a' },
  'En revisión': { bg: '#eff6ff', text: '#2563eb' },
  'Urgente': { bg: '#fff1f2', text: '#e11d48' },
}

const PRIORITY_STYLES: Record<Priority, { bg: string; text: string; dot: string }> = {
  'Alta': { bg: '#fff1f2', text: '#e11d48', dot: '#e11d48' },
  'Media': { bg: '#fff7ed', text: '#c2410c', dot: '#f59e0b' },
  'Baja': { bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e' },
}

const TASK_STATUS_STYLES: Record<TaskStatus, { bg: string; text: string }> = {
  'Pendiente': { bg: '#f8fafc', text: '#64748b' },
  'En curso': { bg: '#eff6ff', text: '#2563eb' },
  'Completada': { bg: '#f0fdf4', text: '#16a34a' },
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────

function BarChart({ data, metric }: { data: MonthlyStats[]; metric: 'casosCerrados' | 'facturacion' }) {
  const values = data.map(d => d[metric])
  const maxVal = Math.max(...values)
  const chartH = 120
  const chartW = 320
  const barW = 36
  const gap = (chartW - barW * data.length) / (data.length + 1)

  return (
    <svg width={chartW} height={chartH + 32} style={{ overflow: 'visible' }}>
      {values.map((val, i) => {
        const barH = maxVal > 0 ? (val / maxVal) * chartH : 0
        const x = gap + i * (barW + gap)
        const y = chartH - barH
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={barW} height={barH}
              rx={4}
              fill={`var(--lime, #7C3AED)`}
              opacity={0.85}
            />
            <text
              x={x + barW / 2} y={chartH + 16}
              textAnchor="middle"
              style={{ fontSize: 11, fill: 'var(--ink-tertiary)' }}
            >
              {data[i].month}
            </text>
            {val > 0 && (
              <text
                x={x + barW / 2} y={y - 4}
                textAnchor="middle"
                style={{ fontSize: 10, fill: 'var(--ink-secondary)', fontWeight: 600 }}
              >
                {metric === 'facturacion' ? `${(val / 1000).toFixed(1)}k` : val}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ─── Lawyer Card ──────────────────────────────────────────────────────────────

function LawyerCard({ lawyer, onView, onAssign }: { lawyer: Lawyer; onView: () => void; onAssign: () => void }) {
  const fullName = `${lawyer.firstName} ${lawyer.lastName}`
  const posStyle = POSITION_COLORS[lawyer.position]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: 'default',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      {/* Avatar + Name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: 14,
            background: avatarGradient(fullName),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0,
            letterSpacing: '0.02em',
          }}
        >
          {initials(lawyer.firstName, lawyer.lastName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {fullName}
          </div>
          <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 6,
              background: posStyle.bg, color: posStyle.text,
            }}>
              {lawyer.position}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: STATUS_COLORS[lawyer.status],
                display: 'inline-block',
              }} />
              <span style={{ fontSize: 11, color: 'var(--ink-secondary)' }}>{lawyer.status}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Specialty tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {lawyer.specialties.map(s => (
          <span key={s} style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 20,
            background: 'var(--surface-elevated)', color: 'var(--ink-secondary)',
            border: '1px solid var(--hairline)',
          }}>
            {s}
          </span>
        ))}
      </div>

      {/* Mini stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        padding: '10px 0',
        borderTop: '1px solid var(--hairline)',
        borderBottom: '1px solid var(--hairline)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)' }}>{lawyer.casosActivos}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-tertiary)', marginTop: 1 }}>Casos</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-primary)' }}>{fmtCurrency(lawyer.facturadoMes)}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-tertiary)', marginTop: 1 }}>Facturado</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)' }}>{lawyer.tasaExito}%</div>
          <div style={{ fontSize: 10, color: 'var(--ink-tertiary)', marginTop: 1 }}>Éxito</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onView}
          style={{
            flex: 1, padding: '8px 0',
            borderRadius: 9, border: '1px solid var(--hairline)',
            background: 'var(--surface-elevated)',
            color: 'var(--ink-primary)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Ver ficha
        </button>
        <button
          onClick={onAssign}
          style={{
            padding: '8px 14px',
            borderRadius: 9,
            border: 'none',
            background: 'var(--lime)',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Caso
        </button>
      </div>
    </motion.div>
  )
}

// ─── Tab: Información ─────────────────────────────────────────────────────────

function TabInfo({ lawyer }: { lawyer: Lawyer }) {
  const [form, setForm] = useState({
    email: lawyer.email,
    phone: lawyer.phone,
    colegioNum: lawyer.colegioNum,
    contractType: lawyer.contractType,
    startDate: lawyer.startDate,
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Avatar + identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: avatarGradient(`${lawyer.firstName} ${lawyer.lastName}`),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 24,
        }}>
          {initials(lawyer.firstName, lawyer.lastName)}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--ink-primary)' }}>
            {lawyer.firstName} {lawyer.lastName}
          </h2>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 8,
              background: POSITION_COLORS[lawyer.position].bg,
              color: POSITION_COLORS[lawyer.position].text,
            }}>
              {lawyer.position}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[lawyer.status], display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{lawyer.status}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Especialidades
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {lawyer.specialties.map(s => (
            <span key={s} style={{
              fontSize: 13, padding: '4px 12px', borderRadius: 20,
              background: 'var(--surface-elevated)', color: 'var(--ink-secondary)',
              border: '1px solid var(--hairline)',
            }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Form fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {([
          { label: 'Email', key: 'email', type: 'email' },
          { label: 'Teléfono', key: 'phone', type: 'tel' },
          { label: 'Nº Colegiado', key: 'colegioNum', type: 'text' },
          { label: 'Fecha incorporación', key: 'startDate', type: 'date' },
        ] as const).map(({ label, key, type }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 5 }}>
              {label}
            </label>
            <input
              type={type}
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              style={{
                width: '100%', padding: '9px 12px',
                border: '1px solid var(--hairline)',
                borderRadius: 9, background: 'var(--surface)',
                color: 'var(--ink-primary)', fontSize: 14,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
        ))}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 5 }}>
            Tipo de contrato
          </label>
          <select
            value={form.contractType}
            onChange={e => setForm(f => ({ ...f, contractType: e.target.value as ContractType }))}
            style={{
              width: '100%', padding: '9px 12px',
              border: '1px solid var(--hairline)',
              borderRadius: 9, background: 'var(--surface)',
              color: 'var(--ink-primary)', fontSize: 14,
              boxSizing: 'border-box', outline: 'none',
            }}
          >
            {(['Indefinido', 'Temporal', 'Asociado', 'Autónomo'] as ContractType[]).map(ct => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        style={{
          alignSelf: 'flex-start',
          padding: '10px 24px',
          borderRadius: 10, border: 'none',
          background: saved ? '#22c55e' : 'var(--lime)',
          color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', transition: 'background 0.2s',
        }}
      >
        {saved ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </div>
  )
}

// ─── Tab: Rendimiento ─────────────────────────────────────────────────────────

function TabRendimiento({ lawyer }: { lawyer: Lawyer }) {
  const [chartMetric, setChartMetric] = useState<'casosCerrados' | 'facturacion'>('casosCerrados')

  const kpis = [
    { label: 'Tasa éxito', value: `${lawyer.tasaExito}%`, avg: `${TEAM_AVG.tasaExito}%`, good: lawyer.tasaExito >= TEAM_AVG.tasaExito },
    { label: 'T. medio resolución', value: `${lawyer.tiempoMedioResolucion}d`, avg: `${TEAM_AVG.tiempoMedioResolucion}d`, good: lawyer.tiempoMedioResolucion <= TEAM_AVG.tiempoMedioResolucion },
    { label: 'Satisfacción cliente', value: `${lawyer.satisfaccionCliente}/5`, avg: `${TEAM_AVG.satisfaccionCliente}/5`, good: lawyer.satisfaccionCliente >= parseFloat(TEAM_AVG.satisfaccionCliente) },
    { label: 'NPS', value: lawyer.nps, avg: TEAM_AVG.nps, good: lawyer.nps >= TEAM_AVG.nps },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Chart toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['casosCerrados', 'facturacion'] as const).map(m => (
          <button
            key={m}
            onClick={() => setChartMetric(m)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid var(--hairline)',
              background: chartMetric === m ? 'var(--lime)' : 'var(--surface)',
              color: chartMetric === m ? '#fff' : 'var(--ink-secondary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {m === 'casosCerrados' ? 'Casos cerrados' : 'Facturación'}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{
        background: 'var(--surface-elevated)',
        borderRadius: 12, padding: '16px 20px',
        border: '1px solid var(--hairline)',
        overflowX: 'auto',
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Últimos 6 meses
        </div>
        <BarChart data={lawyer.monthlyStats} metric={chartMetric} />
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {kpis.map(kpi => (
          <div key={kpi.label} style={{
            padding: 14, borderRadius: 12,
            background: 'var(--surface-elevated)',
            border: '1px solid var(--hairline)',
          }}>
            <div style={{ fontSize: 11, color: 'var(--ink-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink-primary)', marginTop: 4 }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: kpi.good ? '#22c55e' : '#ef4444' }}>{kpi.good ? '▲' : '▼'}</span>
              <span style={{ color: 'var(--ink-tertiary)' }}>Media equipo: {kpi.avg}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Casos Activos ───────────────────────────────────────────────────────

function TabCasos({ lawyer }: { lawyer: Lawyer }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {lawyer.cases.map(c => {
        const st = CASE_STATUS_STYLES[c.status]
        return (
          <div key={c.id} style={{
            padding: '14px 16px',
            border: '1px solid var(--hairline)',
            borderRadius: 12,
            background: 'var(--surface)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-primary)' }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-secondary)', marginTop: 3 }}>
                {c.client} · Vence {fmtDate(c.deadline)}
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 7,
              background: st.bg, color: st.text,
            }}>
              {c.status}
            </span>
            <button style={{
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid var(--hairline)',
              background: 'var(--surface-elevated)',
              color: 'var(--ink-secondary)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
            }}>
              Reasignar
            </button>
          </div>
        )
      })}
      {lawyer.cases.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--ink-tertiary)' }}>
          Sin casos activos asignados
        </div>
      )}
    </div>
  )
}

// ─── Tab: Historial de Clientes ───────────────────────────────────────────────

function TabClientes({ lawyer }: { lawyer: Lawyer }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {lawyer.clients.map(cl => (
        <div key={cl.id} style={{
          padding: '14px 16px',
          border: '1px solid var(--hairline)',
          borderRadius: 12,
          background: 'var(--surface)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: avatarGradient(cl.name),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            {cl.name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-primary)' }}>{cl.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-secondary)', marginTop: 2 }}>
              {cl.totalCases} {cl.totalCases === 1 ? 'caso' : 'casos'} · Última interacción: {fmtDate(cl.lastInteraction)}
            </div>
          </div>
          <div style={{
            fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)',
            padding: '4px 12px', background: 'var(--surface-elevated)',
            borderRadius: 8, border: '1px solid var(--hairline)',
          }}>
            {cl.totalCases}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Tab: Tareas ──────────────────────────────────────────────────────────────

function TabTareas({ lawyer }: { lawyer: Lawyer }) {
  const [tasks, setTasks] = useState<Task[]>(lawyer.tasks)
  const [showNew, setShowNew] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', priority: 'Media' as Priority, dueDate: '' })

  const toggleDone = (id: string) => {
    setTasks(ts => ts.map(t => t.id === id
      ? { ...t, status: t.status === 'Completada' ? 'Pendiente' : 'Completada' }
      : t
    ))
  }

  const addTask = () => {
    if (!newTask.title.trim()) return
    setTasks(ts => [...ts, {
      id: `new-${Date.now()}`,
      title: newTask.title,
      priority: newTask.priority,
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
      status: 'Pendiente',
    }])
    setNewTask({ title: '', priority: 'Media', dueDate: '' })
    setShowNew(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {tasks.map(task => {
        const ps = PRIORITY_STYLES[task.priority]
        const ts = TASK_STATUS_STYLES[task.status]
        return (
          <div key={task.id} style={{
            padding: '12px 16px',
            border: '1px solid var(--hairline)',
            borderRadius: 12,
            background: task.status === 'Completada' ? 'var(--surface-elevated)' : 'var(--surface)',
            display: 'flex', alignItems: 'center', gap: 12,
            opacity: task.status === 'Completada' ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}>
            <input
              type="checkbox"
              checked={task.status === 'Completada'}
              onChange={() => toggleDone(task.id)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--lime)' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 14, fontWeight: 500, color: 'var(--ink-primary)',
                textDecoration: task.status === 'Completada' ? 'line-through' : 'none',
              }}>
                {task.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 2 }}>
                Vence {fmtDate(task.dueDate)}
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: ps.bg, color: ps.text }}>
              {task.priority}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: ts.bg, color: ts.text }}>
              {task.status}
            </span>
          </div>
        )
      })}

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: 14, border: '1px dashed var(--lime)',
              borderRadius: 12, background: 'var(--surface)',
              display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden',
            }}
          >
            <input
              placeholder="Título de la tarea..."
              value={newTask.title}
              onChange={e => setNewTask(n => ({ ...n, title: e.target.value }))}
              style={{
                padding: '8px 12px', border: '1px solid var(--hairline)',
                borderRadius: 8, fontSize: 14, color: 'var(--ink-primary)',
                background: 'var(--surface-elevated)', outline: 'none', boxSizing: 'border-box', width: '100%',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={newTask.priority}
                onChange={e => setNewTask(n => ({ ...n, priority: e.target.value as Priority }))}
                style={{
                  padding: '7px 10px', border: '1px solid var(--hairline)',
                  borderRadius: 8, fontSize: 13, color: 'var(--ink-primary)',
                  background: 'var(--surface-elevated)', outline: 'none',
                }}
              >
                {(['Alta', 'Media', 'Baja'] as Priority[]).map(p => <option key={p}>{p}</option>)}
              </select>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={e => setNewTask(n => ({ ...n, dueDate: e.target.value }))}
                style={{
                  padding: '7px 10px', border: '1px solid var(--hairline)',
                  borderRadius: 8, fontSize: 13, color: 'var(--ink-primary)',
                  background: 'var(--surface-elevated)', outline: 'none', flex: 1,
                }}
              />
              <button onClick={addTask} style={{
                padding: '7px 16px', borderRadius: 8, border: 'none',
                background: 'var(--lime)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}>
                Añadir
              </button>
              <button onClick={() => setShowNew(false)} style={{
                padding: '7px 12px', borderRadius: 8, border: '1px solid var(--hairline)',
                background: 'var(--surface)', color: 'var(--ink-secondary)', fontSize: 13, cursor: 'pointer',
              }}>
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showNew && (
        <button
          onClick={() => setShowNew(true)}
          style={{
            padding: '10px 0', borderRadius: 10,
            border: '1px dashed var(--hairline)',
            background: 'transparent',
            color: 'var(--ink-tertiary)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >
          + Nueva tarea
        </button>
      )}
    </div>
  )
}

// ─── Employee Profile Modal ───────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: 'info', label: 'Información' },
  { id: 'rendimiento', label: 'Rendimiento' },
  { id: 'casos', label: 'Casos activos' },
  { id: 'clientes', label: 'Historial clientes' },
  { id: 'tareas', label: 'Tareas' },
]

function ProfileModal({ lawyer, onClose }: { lawyer: Lawyer; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('info')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 20,
          width: '100%', maxWidth: 680,
          maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: '18px 24px 0',
          borderBottom: '1px solid var(--hairline)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)' }}>
              {lawyer.firstName} {lawyer.lastName}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 8, border: 'none',
                background: 'var(--surface-elevated)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ink-secondary)', fontSize: 16, fontWeight: 700,
              }}
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 16px', border: 'none',
                  background: 'transparent',
                  color: activeTab === tab.id ? 'var(--lime)' : 'var(--ink-secondary)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: 13, cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid var(--lime)' : '2px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'info' && <TabInfo lawyer={lawyer} />}
              {activeTab === 'rendimiento' && <TabRendimiento lawyer={lawyer} />}
              {activeTab === 'casos' && <TabCasos lawyer={lawyer} />}
              {activeTab === 'clientes' && <TabClientes lawyer={lawyer} />}
              {activeTab === 'tareas' && <TabTareas lawyer={lawyer} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Add Member Modal ─────────────────────────────────────────────────────────

const ALL_SPECIALTIES = ['Civil', 'Penal', 'Laboral', 'Mercantil', 'Administrativo', 'Inmobiliario', 'Familia', 'Fiscal', 'Constitucional', 'Internacional']

function AddMemberModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    position: 'Junior' as Position, specialties: [] as string[],
    colegioNum: '', startDate: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const toggleSpec = (s: string) => {
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter(x => x !== s)
        : [...f.specialties, s],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(onClose, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 20,
          width: '100%', maxWidth: 540,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-primary)' }}>Añadir miembro</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'var(--surface-elevated)', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: 'var(--ink-secondary)' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {([
              { label: 'Nombre', key: 'firstName', type: 'text' },
              { label: 'Apellidos', key: 'lastName', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Teléfono', key: 'phone', type: 'tel' },
              { label: 'Nº Colegiado', key: 'colegioNum', type: 'text' },
              { label: 'Fecha incorporación', key: 'startDate', type: 'date' },
            ] as const).map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 5 }}>{label}</label>
                <input
                  type={type}
                  required={['firstName', 'lastName', 'email'].includes(key)}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{
                    width: '100%', padding: '9px 12px',
                    border: '1px solid var(--hairline)', borderRadius: 9,
                    background: 'var(--surface)', color: 'var(--ink-primary)',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 5 }}>Puesto</label>
            <select
              value={form.position}
              onChange={e => setForm(f => ({ ...f, position: e.target.value as Position }))}
              style={{
                width: '100%', padding: '9px 12px',
                border: '1px solid var(--hairline)', borderRadius: 9,
                background: 'var(--surface)', color: 'var(--ink-primary)',
                fontSize: 14, outline: 'none',
              }}
            >
              {(['Socia', 'Socio', 'Senior', 'Junior', 'Paralegal', 'Administrativo'] as Position[]).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-tertiary)', marginBottom: 8 }}>Especialidades</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_SPECIALTIES.map(s => {
                const selected = form.specialties.includes(s)
                return (
                  <button
                    key={s} type="button"
                    onClick={() => toggleSpec(s)}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: selected ? '1px solid var(--lime)' : '1px solid var(--hairline)',
                      background: selected ? 'var(--lime)' : 'var(--surface)',
                      color: selected ? '#fff' : 'var(--ink-secondary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '11px 0', borderRadius: 10, border: 'none',
              background: submitted ? '#22c55e' : 'var(--lime)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              marginTop: 4, transition: 'background 0.2s',
            }}
          >
            {submitted ? '✓ Miembro añadido' : 'Crear miembro'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EquipoPage() {
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAssignAlert, setShowAssignAlert] = useState<string | null>(null)

  const stats = useMemo(() => ({
    total: DEMO_LAWYERS.length,
    activosHoy: DEMO_LAWYERS.filter(l => l.status === 'Disponible' || l.status === 'En juicio').length,
    casosActivos: DEMO_LAWYERS.reduce((s, l) => s + l.casosActivos, 0),
    eficiencia: Math.round(DEMO_LAWYERS.reduce((s, l) => s + l.tasaExito, 0) / DEMO_LAWYERS.length),
  }), [])

  const STAT_CARDS = [
    { label: 'Total abogados', value: stats.total, icon: '👥' },
    { label: 'Activos hoy', value: stats.activosHoy, icon: '🟢' },
    { label: 'Casos activos', value: stats.casosActivos, icon: '⚖️' },
    { label: 'Eficiencia media', value: `${stats.eficiencia}%`, icon: '📈' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: '32px 28px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--ink-primary)', letterSpacing: '-0.02em' }}>
              Equipo del Despacho
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-secondary)' }}>
              Gestión de profesionales y rendimiento
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '11px 20px', borderRadius: 12,
              border: 'none', background: 'var(--lime)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
            }}
          >
            + Añadir miembro
          </button>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12, marginTop: 24,
        }}>
          {STAT_CARDS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              style={{
                padding: '14px 16px',
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                borderRadius: 14,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink-primary)', marginTop: 6 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-tertiary)', marginTop: 2 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Assign alert */}
      <AnimatePresence>
        {showAssignAlert && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              marginBottom: 16, padding: '12px 16px',
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 10, color: '#16a34a', fontSize: 14, fontWeight: 500,
            }}
          >
            ✓ Solicitud de asignación de caso enviada para <strong>{showAssignAlert}</strong>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Grid */}
      <motion.div
        layout
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <AnimatePresence>
          {DEMO_LAWYERS.map(lawyer => (
            <LawyerCard
              key={lawyer.id}
              lawyer={lawyer}
              onView={() => setSelectedLawyer(lawyer)}
              onAssign={() => {
                setShowAssignAlert(`${lawyer.firstName} ${lawyer.lastName}`)
                setTimeout(() => setShowAssignAlert(null), 3000)
              }}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedLawyer && (
          <ProfileModal
            lawyer={selectedLawyer}
            onClose={() => setSelectedLawyer(null)}
          />
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddMemberModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
