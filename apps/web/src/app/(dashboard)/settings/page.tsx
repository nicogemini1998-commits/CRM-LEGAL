'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DuotoneIcon } from '@/components/ui/duotone-icon'
import { ease } from '@/lib/motion'
import { PoweredByCliender } from '@/components/ui/PoweredByCliender'

type Section = 'perfil' | 'conexiones' | 'seguridad' | 'ia' | 'notificaciones' | 'facturacion' | 'acerca'

type Category = 'esenciales'

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  color: string
  connected: boolean
  category: Category
  badge?: string
}

const BRAND = '#8F7EE9'

// 5 conectores esenciales para abogados en España.
const INTEGRATIONS: Integration[] = [
  {
    id: 'lexnet',
    name: 'LexNET',
    description: 'Sistema oficial del Ministerio de Justicia para recibir notificaciones judiciales electrónicas, presentar escritos al juzgado y consultar el estado procesal de los expedientes. Imprescindible para todo despacho que litiga en España. Sincroniza automáticamente plazos críticos.',
    icon: '⚖️',
    color: '#003366',
    connected: false,
    category: 'esenciales',
    badge: 'Oficial',
  },
  {
    id: 'signaturit',
    name: 'Signaturit',
    description: 'Firma electrónica avanzada y cualificada conforme al Reglamento eIDAS y a la Ley 6/2020. Permite firmar contratos, poderes y documentos vinculantes con plena validez legal en España y la UE. Incluye certificados cualificados, evidencias forenses y trazabilidad probatoria.',
    icon: '✍️',
    color: '#00B5AD',
    connected: false,
    category: 'esenciales',
  },
  {
    id: 'vlex',
    name: 'vLex',
    description: 'La base de datos jurídica de referencia en España con IA Vincent integrada. Acceso a jurisprudencia del TS, TC, Audiencias Provinciales, doctrina, legislación consolidada y formularios. LEXIA puede consultar vLex directamente para fundamentar análisis con citas verificadas.',
    icon: '📚',
    color: '#0066CC',
    connected: false,
    category: 'esenciales',
    badge: 'Recomendado',
  },
  {
    id: 'aeat',
    name: 'AEAT — Agencia Tributaria',
    description: 'Acceso con Cl@ve PIN o certificado digital a la Sede Electrónica de la Agencia Tributaria para presentaciones telemáticas (modelos), notificaciones electrónicas y consulta de procedimientos. Esencial para los trámites fiscales que asume el despacho en representación del cliente.',
    icon: '🏦',
    color: '#C00000',
    connected: false,
    category: 'esenciales',
    badge: 'Oficial',
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    description: 'Drive + Gmail + Calendar en una sola integración. Sincroniza correos con cada expediente, importa documentos desde Drive, y centraliza las citas con clientes y vencimientos procesales en Calendar. La opción de productividad más usada por despachos modernos en España.',
    icon: '📁',
    color: '#4285F4',
    connected: false,
    category: 'esenciales',
  },
]

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: 'perfil',        label: 'Perfil del despacho', icon: 'building' },
  { id: 'conexiones',    label: 'Conexiones',          icon: 'compass' },
  { id: 'seguridad',     label: 'Seguridad',           icon: 'shield' },
  { id: 'ia',            label: 'Inteligencia Artificial', icon: 'sparkles' },
  { id: 'notificaciones',label: 'Notificaciones',      icon: 'clock' },
  { id: 'facturacion',   label: 'Plan y facturación',  icon: 'arrow-up-right' },
  { id: 'acerca',        label: 'Acerca de IURALEX',   icon: 'sparkles' },
]

function CategoryBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full"
      style={{ background: `${BRAND}18`, color: BRAND, letterSpacing: '0.03em' }}
    >
      {label}
    </span>
  )
}

function ComingSoonModal({ open, integrationName, onClose }: { open: boolean; integrationName: string | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(15,15,20,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: ease.outExpo }}
            className="w-full max-w-md rounded-2xl p-7"
            style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-lg)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--lime-bg-soft)' }}>
                <DuotoneIcon name="clock" size={18} primary="var(--lime)" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--ink-tertiary)' }}>Integración</p>
                <p className="text-[15px] font-medium" style={{ color: 'var(--ink-primary)' }}>{integrationName ?? 'Próximamente'}</p>
              </div>
            </div>
            <h3 className="font-display text-[22px] leading-tight mb-2" style={{ color: 'var(--ink-primary)' }}>
              Próximamente disponible
            </h3>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--ink-secondary)' }}>
              Esta integración estará activa muy pronto. Para activarla en tu despacho ahora, contacta con tu Account Manager de{' '}
              <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>Cliender</span>.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[13px] font-medium rounded-lg transition-colors duration-150"
                style={{ background: 'var(--surface-elevated)', color: 'var(--ink-secondary)', border: '1px solid var(--hairline)' }}
              >
                Cerrar
              </button>
              <a
                href="mailto:nicolas@cliender.com?subject=Activar%20integraci%C3%B3n%20IURALEX"
                className="px-4 py-2 text-[13px] font-medium rounded-lg transition-colors duration-150"
                style={{ background: 'var(--lime)', color: '#fff' }}
              >
                Contactar Account Manager
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function IntegrationCard({ integration, onToggle }: { integration: Integration; onToggle: (id: string) => void }) {
  const isComingSoon = integration.badge === 'Próximamente'

  return (
    <motion.div
      whileHover={isComingSoon ? {} : { y: -2 }}
      className="p-6 rounded-2xl transition-all duration-200 group"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${integration.connected ? `${BRAND}40` : 'var(--hairline)'}`,
        opacity: isComingSoon ? 0.6 : 1,
        boxShadow: integration.connected ? `0 4px 20px -8px ${BRAND}40` : 'var(--shadow-xs)',
      }}
      onMouseEnter={e => { if (!isComingSoon) (e.currentTarget as HTMLDivElement).style.borderColor = integration.connected ? BRAND : `${BRAND}55` }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = integration.connected ? `${BRAND}40` : 'var(--hairline)' }}
    >
      <div className="flex items-start gap-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: `${integration.color}15`, border: `1px solid ${integration.color}28` }}
        >
          {integration.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[16px] font-semibold" style={{ color: 'var(--ink-primary)' }}>{integration.name}</span>
            {integration.badge && <CategoryBadge label={integration.badge} />}
            {integration.connected && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--success)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
                Conectado
              </span>
            )}
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
            {integration.description}
          </p>
          {!isComingSoon && (
            <button
              onClick={() => onToggle(integration.id)}
              className="mt-4 px-5 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-150"
              style={integration.connected
                ? { background: 'var(--surface-elevated)', color: 'var(--ink-secondary)', border: '1px solid var(--hairline)' }
                : { background: BRAND, color: '#fff', border: '1px solid transparent' }
              }
              onMouseEnter={e => {
                if (integration.connected) { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)' }
                else { e.currentTarget.style.background = '#7C6BD6' }
              }}
              onMouseLeave={e => {
                if (integration.connected) { e.currentTarget.style.background = 'var(--surface-elevated)'; e.currentTarget.style.color = 'var(--ink-secondary)' }
                else { e.currentTarget.style.background = BRAND }
              }}
            >
              {integration.connected ? 'Desconectar' : 'Conectar'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function SectionPerfil() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-[26px]" style={{ color: 'var(--ink-primary)' }}>Perfil del despacho</h2>
        <p className="text-[13px] mt-1" style={{ color: 'var(--ink-secondary)' }}>Información básica de tu organización</p>
      </div>

      {/* Logo upload */}
      <div
        className="flex items-center gap-5 p-5 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}
      >
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#8F7EE9' }}
        >
          <svg viewBox="0 0 326 600" className="h-9 w-auto text-white" fill="currentColor" aria-label="Cliender">
            <path d="M257.17,600c-15.14,0-30.1-5.09-42.55-15.02L25.76,434.35C9.39,421.29,0,401.79,0,380.85s9.39-40.44,25.77-53.5l34.29-27.35-34.29-27.35C9.39,259.59,0,240.09,0,219.15s9.39-40.44,25.76-53.5L214.63,15.02c20.73-16.54,48.46-19.67,72.36-8.16,23.89,11.51,38.74,35.13,38.74,61.66v48.46c0,20.94-9.39,40.44-25.76,53.5l-162.4,129.52,162.4,129.52c16.37,13.06,25.77,32.56,25.77,53.5v48.46c0,26.52-14.85,50.15-38.75,61.66-9.56,4.6-19.72,6.86-29.81,6.86ZM55.9,396.57l188.86,150.63c8.92,7.11,17.83,4.04,21.26,2.4,3.42-1.65,11.38-6.71,11.38-18.11v-48.46c0-6.15-2.75-11.88-7.56-15.71L98.81,330.91l-42.91,34.22c-4.81,3.84-7.57,9.56-7.57,15.71s2.76,11.88,7.57,15.72h0ZM257.03,48.32c-3.68,0-7.97,1.06-12.27,4.49L55.9,203.43c-4.81,3.84-7.57,9.56-7.57,15.72s2.76,11.88,7.57,15.71l42.91,34.22,171.02-136.39c4.81-3.84,7.56-9.56,7.56-15.72v-48.46c0-11.4-7.96-16.46-11.38-18.11-1.77-.85-5.03-2.09-8.99-2.09Z" />
          </svg>
        </div>
        <div>
          <p className="text-[13.5px] font-medium" style={{ color: 'var(--ink-primary)' }}>Logo del despacho</p>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>PNG, SVG o JPG · máx. 2 MB · recomendado 256×256px</p>
          <button
            className="mt-2.5 px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors duration-150"
            style={{ background: 'var(--surface-elevated)', color: 'var(--ink-primary)', border: '1px solid var(--hairline)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--hairline-strong)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--hairline)'}
          >
            Subir logo
          </button>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {[
          { label: 'Nombre del despacho', placeholder: 'Ej. García & Asociados Abogados', value: 'IURALEX' },
          { label: 'NIF / CIF', placeholder: 'B12345678', value: '' },
          { label: 'Dirección', placeholder: 'Calle Mayor 1, 28001 Madrid', value: '' },
          { label: 'Teléfono', placeholder: '+34 91 234 56 78', value: '' },
          { label: 'Email de contacto', placeholder: 'info@despacho.es', value: '' },
          { label: 'Jurisdicción principal', placeholder: 'Madrid', value: 'Madrid, España' },
        ].map(field => (
          <div key={field.label}>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--ink-secondary)' }}>
              {field.label}
            </label>
            <input
              defaultValue={field.value}
              placeholder={field.placeholder}
              className="w-full px-3.5 py-2.5 text-[13.5px] rounded-xl transition-all duration-150 focus:outline-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                color: 'var(--ink-primary)',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--lime)'; e.target.style.boxShadow = 'var(--shadow-lime-glow)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--hairline)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        ))}
      </div>

      <button
        className="px-5 py-2.5 text-[13px] font-medium rounded-xl transition-colors duration-150"
        style={{ background: 'var(--lime)', color: '#fff' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--lime-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--lime)'}
      >
        Guardar cambios
      </button>
    </div>
  )
}

function SectionConexiones() {
  const [integrations] = useState(INTEGRATIONS)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIntegration, setModalIntegration] = useState<string | null>(null)

  // En demo mode todos los toggle muestran modal "Próximamente · contacta con tu Account Manager Cliender"
  const handleToggle = (id: string) => {
    const found = integrations.find(i => i.id === id)
    setModalIntegration(found?.name ?? null)
    setModalOpen(true)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="font-display text-[28px]" style={{ color: 'var(--ink-primary)' }}>Conexiones esenciales</h2>
        <p className="text-[14px] mt-2 leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
          IURALEX se integra con las 5 herramientas imprescindibles para un despacho que trabaja en España.
          Cada una está auditada, cumple la normativa y se conecta con tu cuenta en pocos clics.
        </p>
      </div>

      {/* Connected count */}
      {integrations.filter(i => i.connected).length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: `${BRAND}12`, border: `1px solid ${BRAND}33` }}
        >
          <DuotoneIcon name="check" size={16} primary={BRAND} />
          <span className="text-[13px]" style={{ color: BRAND }}>
            {integrations.filter(i => i.connected).length} de {integrations.length} integraciones activas
          </span>
        </div>
      )}

      <div className="space-y-4">
        {integrations.map(i => <IntegrationCard key={i.id} integration={i} onToggle={handleToggle} />)}
      </div>

      <ComingSoonModal
        open={modalOpen}
        integrationName={modalIntegration}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

function SectionAcerca() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-[26px]" style={{ color: 'var(--ink-primary)' }}>Acerca de IURALEX</h2>
        <p className="text-[13px] mt-1" style={{ color: 'var(--ink-secondary)' }}>Información sobre la plataforma y el equipo que la desarrolla</p>
      </div>

      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-display italic"
            style={{ background: 'linear-gradient(135deg, var(--obsidian) 0%, var(--plum) 100%)', color: 'var(--lime)', fontSize: 26, paddingBottom: 3 }}
          >I</div>
          <div>
            <p className="font-display text-[22px] leading-none" style={{ color: 'var(--ink-primary)' }}>IURALEX</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--ink-tertiary)' }}>v1.0.0 · LegalTech para España</p>
          </div>
        </div>

        <dl className="space-y-3 text-[13px]">
          <div className="flex justify-between gap-4">
            <dt style={{ color: 'var(--ink-tertiary)' }}>Versión</dt>
            <dd style={{ color: 'var(--ink-primary)' }}>1.0.0</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt style={{ color: 'var(--ink-tertiary)' }}>Desarrollado por</dt>
            <dd className="font-medium" style={{ color: 'var(--ink-primary)' }}>Cliender Tech (HBD Revolution SL)</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt style={{ color: 'var(--ink-tertiary)' }}>Ubicación</dt>
            <dd style={{ color: 'var(--ink-primary)' }}>Sagunto, Valencia · España</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt style={{ color: 'var(--ink-tertiary)' }}>Contacto</dt>
            <dd>
              <a href="mailto:nicolas@cliender.com" className="font-medium" style={{ color: 'var(--lime-text-soft)' }}>
                nicolas@cliender.com
              </a>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt style={{ color: 'var(--ink-tertiary)' }}>Modelo IA</dt>
            <dd style={{ color: 'var(--ink-primary)' }}>Claude Haiku 4.5 (Anthropic)</dd>
          </div>
        </dl>
      </div>

      <PoweredByCliender variant="inline" className="text-center" />
    </div>
  )
}

function SectionSeguridad() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-[26px]" style={{ color: 'var(--ink-primary)' }}>Seguridad</h2>
        <p className="text-[13px] mt-1" style={{ color: 'var(--ink-secondary)' }}>Protege tu cuenta y los datos de tus clientes</p>
      </div>

      {/* 2FA */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--hairline)' }}>
        <div className="p-5" style={{ borderBottom: '1px solid var(--hairline)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--success-bg)' }}>
                <DuotoneIcon name="shield" size={16} primary="var(--success)" />
              </div>
              <div>
                <p className="text-[13.5px] font-medium" style={{ color: 'var(--ink-primary)' }}>Autenticación en dos pasos (2FA)</p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>Protege el acceso con un código adicional al iniciar sesión</p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
              No activado
            </span>
          </div>
          <button
            className="mt-4 px-4 py-2 text-[12.5px] font-medium rounded-lg transition-colors duration-150"
            style={{ background: 'var(--lime)', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--lime-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--lime)'}
          >
            Activar 2FA
          </button>
        </div>

        {/* Password */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--hairline)' }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-elevated)' }}>
              <DuotoneIcon name="lock" size={16} primary="var(--ink-secondary)" />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-medium" style={{ color: 'var(--ink-primary)' }}>Contraseña</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>Actualizada hace 3 meses</p>
            </div>
            <button
              className="px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors duration-150"
              style={{ background: 'var(--surface-elevated)', color: 'var(--ink-secondary)', border: '1px solid var(--hairline)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--hairline-strong)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--hairline)'}
            >
              Cambiar
            </button>
          </div>
        </div>

        {/* Sessions */}
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-elevated)' }}>
              <DuotoneIcon name="user-circle" size={16} primary="var(--ink-secondary)" />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-medium" style={{ color: 'var(--ink-primary)' }}>Sesiones activas</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>1 dispositivo · MacBook Pro · Madrid, ES</p>
            </div>
            <button
              className="px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors duration-150"
              style={{ background: 'var(--surface-elevated)', color: 'var(--danger)', border: '1px solid var(--hairline)' }}
            >
              Cerrar todas
            </button>
          </div>
        </div>
      </div>

      {/* Audit log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13.5px] font-medium" style={{ color: 'var(--ink-primary)' }}>Registro de actividad</h3>
          <button className="text-[12px]" style={{ color: 'var(--lime-text-soft)' }}>Ver completo</button>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--hairline)' }}>
          {[
            { action: 'Inicio de sesión', device: 'MacBook Pro · Chrome', time: 'Hace 5 min', ip: '83.44.x.x' },
            { action: 'Documento analizado', device: 'MacBook Pro · Chrome', time: 'Hace 12 min', ip: '83.44.x.x' },
            { action: 'Nuevo expediente creado', device: 'MacBook Pro · Chrome', time: 'Hace 1 hora', ip: '83.44.x.x' },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: i < 2 ? '1px solid var(--hairline)' : 'none' }}>
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--ink-primary)' }}>{log.action}</p>
                <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>{log.device} · IP {log.ip}</p>
              </div>
              <span className="label-meta">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* GDPR */}
      <div
        className="p-5 rounded-xl"
        style={{ background: 'var(--info-bg)', border: '1px solid rgba(37, 99, 235, 0.2)' }}
      >
        <div className="flex items-start gap-3">
          <DuotoneIcon name="shield" size={16} primary="var(--info)" className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[13px] font-medium" style={{ color: 'var(--info)' }}>Cumplimiento RGPD / LOPDGDD</p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: '#1e40af' }}>
              IURALEX almacena datos con cifrado AES-256, con RLS por usuario, y cumple con el Reglamento General de Protección de Datos y la Ley Orgánica 3/2018.
            </p>
            <button className="mt-2.5 text-[12px] font-medium" style={{ color: 'var(--info)' }}>
              Ver política de privacidad →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionIA() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-[26px]" style={{ color: 'var(--ink-primary)' }}>Inteligencia Artificial</h2>
        <p className="text-[13px] mt-1" style={{ color: 'var(--ink-secondary)' }}>Configura cómo LEXIA analiza y genera documentos</p>
      </div>

      {/* Model */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--hairline)' }}>
        <div className="p-5" style={{ borderBottom: '1px solid var(--hairline)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13.5px] font-medium" style={{ color: 'var(--ink-primary)' }}>Modelo de IA activo</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>Claude Haiku 4.5 · Rápido y económico</p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--lime-bg-soft)', color: 'var(--lime-text-soft)' }}>
              Activo
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            {[
              { id: 'haiku', label: 'Haiku 4.5', note: 'Rápido', active: true },
              { id: 'sonnet', label: 'Sonnet 4.6', note: 'Preciso', active: false },
            ].map(m => (
              <button
                key={m.id}
                className="px-4 py-2 text-[12.5px] font-medium rounded-lg transition-all duration-150"
                style={m.active
                  ? { background: 'var(--lime)', color: '#fff' }
                  : { background: 'var(--surface-elevated)', color: 'var(--ink-secondary)', border: '1px solid var(--hairline)' }}
              >
                {m.label} <span className="opacity-60 text-[11px]">· {m.note}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Disclaimer settings */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--hairline)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13.5px] font-medium" style={{ color: 'var(--ink-primary)' }}>Disclaimers automáticos</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>Añadir aviso legal al final de cada análisis</p>
            </div>
            <div
              className="w-10 h-5.5 rounded-full relative cursor-pointer transition-colors duration-200"
              style={{ background: 'var(--lime)', width: 36, height: 20 }}
            >
              <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-white shadow-sm" style={{ width: 16, height: 16, top: 2, right: 2 }} />
            </div>
          </div>
        </div>

        {/* Prompt caching */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13.5px] font-medium" style={{ color: 'var(--ink-primary)' }}>Caché de prompts</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>Reduce coste hasta 90% reutilizando contexto jurídico</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>Activo</span>
          </div>
        </div>
      </div>

      {/* Skills activated */}
      <div>
        <h3 className="text-[13.5px] font-medium mb-3" style={{ color: 'var(--ink-primary)' }}>Skills de Claude for Legal activas</h3>
        <div className="grid grid-cols-2 gap-2">
          {['commercial-legal', 'employment-legal', 'privacy-legal', 'corporate-legal', 'litigation-legal', 'ip-legal'].map(plugin => (
            <div
              key={plugin}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--lime-bg-soft)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--success)' }} />
              <span className="text-[12px] font-mono" style={{ color: 'var(--ink-secondary)' }}>{plugin}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage stats */}
      <div
        className="p-5 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}
      >
        <h3 className="text-[13px] font-medium mb-4" style={{ color: 'var(--ink-primary)' }}>Uso este mes</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Análisis', value: '47', unit: 'docs' },
            { label: 'Tokens usados', value: '1.2M', unit: 'tokens' },
            { label: 'Coste estimado', value: '4.80', unit: '€' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-[24px] font-display" style={{ color: 'var(--ink-primary)' }}>{stat.value}</div>
              <div className="text-[10.5px] mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>{stat.unit} · {stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-lg pt-4">
      <h2 className="font-display text-[26px]" style={{ color: 'var(--ink-primary)' }}>{title}</h2>
      <p className="text-[13px] mt-1 mb-10" style={{ color: 'var(--ink-secondary)' }}>{description}</p>
      <div
        className="p-10 rounded-2xl text-center"
        style={{ background: 'var(--surface)', border: '1px dashed var(--hairline-strong)' }}
      >
        <DuotoneIcon name="clock" size={28} primary="var(--ink-quaternary)" secondary="var(--lime)" className="mx-auto mb-3 opacity-50" />
        <p className="text-[13px]" style={{ color: 'var(--ink-tertiary)' }}>Próximamente disponible</p>
      </div>
    </div>
  )
}

// ── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('perfil')

  const renderSection = () => {
    switch (activeSection) {
      case 'perfil':        return <SectionPerfil />
      case 'conexiones':    return <SectionConexiones />
      case 'seguridad':     return <SectionSeguridad />
      case 'ia':            return <SectionIA />
      case 'notificaciones': return <SectionPlaceholder title="Notificaciones" description="Configura alertas de plazos, expedientes y avisos del sistema" />
      case 'facturacion':   return <SectionPlaceholder title="Plan y facturación" description="Gestiona tu suscripción, facturas y método de pago" />
      case 'acerca':        return <SectionAcerca />
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-[42px] leading-none" style={{ color: 'var(--ink-primary)', letterSpacing: '-0.025em' }}>
            Configuración
          </h1>
          <p className="text-[14px] mt-2" style={{ color: 'var(--ink-secondary)' }}>
            Gestiona tu despacho, integraciones y preferencias
          </p>
        </div>

        <div className="flex gap-8">
          {/* Nav sidebar */}
          <nav className="w-[200px] flex-shrink-0">
            <div className="space-y-px">
              {SECTIONS.map(s => {
                const isActive = activeSection === s.id
                return (
                  <motion.button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-lg transition-colors duration-150 text-left"
                    style={{
                      background: isActive ? 'var(--surface)' : 'transparent',
                      color: isActive ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                      fontWeight: isActive ? 500 : 400,
                      boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--ink-primary)' } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-secondary)' } }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="settingsActive"
                        className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full"
                        style={{ background: 'var(--lime)' }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <DuotoneIcon
                      name={s.icon as Parameters<typeof DuotoneIcon>[0]['name']}
                      size={14}
                      primary={isActive ? 'var(--lime)' : 'var(--ink-tertiary)'}
                      secondary={isActive ? 'var(--lime)' : 'transparent'}
                    />
                    <span className="truncate">{s.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: ease.outExpo }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
