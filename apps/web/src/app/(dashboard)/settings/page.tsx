'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DuotoneIcon } from '@/components/ui/duotone-icon'
import { ease } from '@/lib/motion'

type Section = 'perfil' | 'conexiones' | 'seguridad' | 'ia' | 'notificaciones' | 'facturacion'

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  color: string
  connected: boolean
  category: 'storage' | 'calendar' | 'communication' | 'legal'
  badge?: string
}

const INTEGRATIONS: Integration[] = [
  // Storage
  { id: 'google_drive', name: 'Google Drive', description: 'Importa y sincroniza documentos directamente desde Drive', icon: '📁', color: '#4285F4', connected: false, category: 'storage' },
  { id: 'dropbox', name: 'Dropbox', description: 'Conecta tu Dropbox para gestionar expedientes en la nube', icon: '📦', color: '#0061FF', connected: true, category: 'storage' },
  { id: 'onedrive', name: 'OneDrive', description: 'Integración con Microsoft OneDrive y SharePoint', icon: '☁️', color: '#0078D4', connected: false, category: 'storage' },
  { id: 'imanage', name: 'iManage', description: 'Sistema DMS legaltech líder para despachos', icon: '🗂️', color: '#1B3A6B', connected: false, category: 'storage', badge: 'Enterprise' },
  // Calendar
  { id: 'google_calendar', name: 'Google Calendar', description: 'Sincroniza plazos procesales y reuniones automáticamente', icon: '📅', color: '#34A853', connected: true, category: 'calendar' },
  { id: 'outlook', name: 'Outlook / Microsoft 365', description: 'Calendarios y email integrados con expedientes', icon: '📧', color: '#0078D4', connected: false, category: 'calendar' },
  // Communication
  { id: 'slack', name: 'Slack', description: 'Notificaciones de plazos y alertas directamente en Slack', icon: '💬', color: '#4A154B', connected: false, category: 'communication' },
  { id: 'teams', name: 'Microsoft Teams', description: 'Recibe alertas y comparte documentos desde Teams', icon: '👥', color: '#5059C9', connected: false, category: 'communication' },
  // Legal
  { id: 'docusign', name: 'DocuSign', description: 'Firma electrónica certificada para contratos y escrituras', icon: '✍️', color: '#FFCC00', connected: false, category: 'legal', badge: 'Popular' },
  { id: 'lexisnexis', name: 'LexisNexis', description: 'Acceso a jurisprudencia y doctrina española actualizada', icon: '⚖️', color: '#D4132A', connected: false, category: 'legal', badge: 'Próximamente' },
]

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: 'perfil',        label: 'Perfil del despacho', icon: 'building' },
  { id: 'conexiones',    label: 'Conexiones',          icon: 'compass' },
  { id: 'seguridad',     label: 'Seguridad',           icon: 'shield' },
  { id: 'ia',            label: 'Inteligencia Artificial', icon: 'sparkles' },
  { id: 'notificaciones',label: 'Notificaciones',      icon: 'clock' },
  { id: 'facturacion',   label: 'Plan y facturación',  icon: 'arrow-up-right' },
]

function CategoryBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full"
      style={{ background: 'var(--lime-bg-soft)', color: 'var(--lime-text-soft)', letterSpacing: '0.03em' }}
    >
      {label}
    </span>
  )
}

function IntegrationCard({ integration, onToggle }: { integration: Integration; onToggle: (id: string) => void }) {
  const isComingSoon = integration.badge === 'Próximamente'

  return (
    <motion.div
      whileHover={isComingSoon ? {} : { y: -1 }}
      className="p-4 rounded-xl transition-all duration-150 group"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${integration.connected ? 'rgba(124,58,237,0.25)' : 'var(--hairline)'}`,
        opacity: isComingSoon ? 0.6 : 1,
      }}
      onMouseEnter={e => { if (!isComingSoon) (e.currentTarget as HTMLDivElement).style.borderColor = integration.connected ? 'rgba(124,58,237,0.4)' : 'var(--hairline-strong)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = integration.connected ? 'rgba(124,58,237,0.25)' : 'var(--hairline)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 mt-0.5"
          style={{ background: `${integration.color}12`, border: `1px solid ${integration.color}22` }}
        >
          {integration.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[13.5px] font-medium" style={{ color: 'var(--ink-primary)' }}>{integration.name}</span>
            {integration.badge && <CategoryBadge label={integration.badge} />}
            {integration.connected && (
              <span className="flex items-center gap-1 text-[10.5px]" style={{ color: 'var(--success)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
                Conectado
              </span>
            )}
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ink-tertiary)' }}>
            {integration.description}
          </p>
        </div>
        {!isComingSoon && (
          <button
            onClick={() => onToggle(integration.id)}
            className="flex-shrink-0 px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all duration-150 mt-0.5"
            style={integration.connected
              ? { background: 'var(--surface-elevated)', color: 'var(--ink-secondary)', border: '1px solid var(--hairline)' }
              : { background: 'var(--lime)', color: '#fff', border: '1px solid transparent' }
            }
            onMouseEnter={e => {
              if (integration.connected) { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)' }
              else { e.currentTarget.style.background = 'var(--lime-hover)' }
            }}
            onMouseLeave={e => {
              if (integration.connected) { e.currentTarget.style.background = 'var(--surface-elevated)'; e.currentTarget.style.color = 'var(--ink-secondary)' }
              else { e.currentTarget.style.background = 'var(--lime)' }
            }}
          >
            {integration.connected ? 'Desconectar' : 'Conectar'}
          </button>
        )}
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
          className="w-16 h-16 rounded-xl flex items-center justify-center font-display italic text-2xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--obsidian) 0%, var(--plum) 100%)', color: 'var(--lime)' }}
        >I</div>
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
  const [integrations, setIntegrations] = useState(INTEGRATIONS)

  const toggle = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !i.connected } : i))
  }

  const categories: { id: Integration['category']; label: string }[] = [
    { id: 'storage', label: 'Almacenamiento' },
    { id: 'calendar', label: 'Calendarios y Email' },
    { id: 'communication', label: 'Comunicación' },
    { id: 'legal', label: 'Herramientas jurídicas' },
  ]

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="font-display text-[26px]" style={{ color: 'var(--ink-primary)' }}>Conexiones e integraciones</h2>
        <p className="text-[13px] mt-1" style={{ color: 'var(--ink-secondary)' }}>
          Conecta IURALEX con tus herramientas de trabajo habituales
        </p>
      </div>

      {/* Connected count */}
      {integrations.filter(i => i.connected).length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'var(--lime-bg-soft)', border: '1px solid rgba(124,58,237,0.2)' }}
        >
          <DuotoneIcon name="check" size={16} primary="var(--lime)" />
          <span className="text-[13px]" style={{ color: 'var(--lime-text-soft)' }}>
            {integrations.filter(i => i.connected).length} integración{integrations.filter(i => i.connected).length > 1 ? 'es' : ''} activa{integrations.filter(i => i.connected).length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {categories.map(cat => {
        const items = integrations.filter(i => i.category === cat.id)
        return (
          <div key={cat.id}>
            <h3 className="label-micro mb-3">{cat.label}</h3>
            <div className="space-y-2.5">
              {items.map(i => <IntegrationCard key={i.id} integration={i} onToggle={toggle} />)}
            </div>
          </div>
        )
      })}
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
