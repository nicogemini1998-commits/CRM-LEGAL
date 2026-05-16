'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Data ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'CIVIL',
    label: 'Civil',
    icon: '⚖️',
    types: ['Reclamación de cantidad', 'Proceso monitorio', 'Oposición a demanda'],
  },
  {
    id: 'CONTRATOS',
    label: 'Contratos',
    icon: '📄',
    types: [
      'NDA', 'Compraventa inmueble', 'Arrendamiento vivienda', 'Arrendamiento local',
      'Prestación servicios', 'Contrato obra', 'Agencia', 'Distribución',
      'Franquicia', 'Préstamo', 'Permuta', 'Cesión de crédito', 'Mandato',
    ],
  },
  {
    id: 'LABORAL',
    label: 'Laboral',
    icon: '👷',
    types: [
      'Contrato indefinido', 'Contrato temporal', 'ERE', 'Modificación sustancial',
      'Carta despido disciplinario', 'Carta despido objetivo', 'Finiquito',
      'Acuerdo conciliación', 'Pacto no competencia', 'Acuerdo teletrabajo',
      'Subrogación empresarial',
    ],
  },
  {
    id: 'MERCANTIL',
    label: 'Mercantil',
    icon: '🏢',
    types: [
      'Estatutos SL', 'Pacto de socios', 'Acta junta', 'Poder notarial',
      'LOI', 'Joint venture', 'Acuerdo distribución', 'Compraventa empresa',
    ],
  },
  {
    id: 'FAMILIA',
    label: 'Familia',
    icon: '👨‍👩‍👧',
    types: ['Demanda divorcio', 'Convenio regulador', 'Modificación medidas', 'Capitulaciones matrimoniales'],
  },
  {
    id: 'PENAL',
    label: 'Penal',
    icon: '⚔️',
    types: ['Denuncia', 'Querella', 'Escrito defensa', 'Recurso apelación'],
  },
  {
    id: 'ADMINISTRATIVO',
    label: 'Administrativo',
    icon: '🏛️',
    types: [
      'Recurso alzada', 'Recurso reposición', 'Recurso contencioso',
      'Solicitud acceso info', 'Alegaciones sancionador', 'Reclamación responsabilidad patrimonial',
    ],
  },
  {
    id: 'INMOBILIARIO',
    label: 'Inmobiliario',
    icon: '🏠',
    types: [
      'Arras penitenciales', 'Desahucio impago', 'Desahucio expiración',
      'Acta comunidad', 'Reclamación comunidad',
    ],
  },
  {
    id: 'FISCAL',
    label: 'Fiscal',
    icon: '💰',
    types: ['Recurso AEAT', 'Aplazamiento deuda', 'Consulta vinculante'],
  },
  {
    id: 'IP',
    label: 'Propiedad Intelectual',
    icon: '💡',
    types: ['Carta cease & desist', 'Licencia marca', 'Cesión derechos autor'],
  },
  {
    id: 'INTERNACIONAL',
    label: 'Internacional',
    icon: '🌐',
    types: ['Distribución internacional', 'NDA internacional', 'Joint venture internacional'],
  },
]

type FieldDef = { key: string; label: string; placeholder: string; type?: string }

const COMMON_FIELDS: FieldDef[] = [
  { key: 'lugar_firma', label: 'Lugar de firma', placeholder: 'Madrid' },
  { key: 'fecha_firma', label: 'Fecha de firma', placeholder: '', type: 'date' },
  { key: 'jurisdiccion', label: 'Jurisdicción', placeholder: '', type: 'select' },
]

const JURISDICTION_OPTIONS = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Otra']

const TYPE_FIELDS: Record<string, FieldDef[]> = {
  'NDA': [
    { key: 'parte_reveladora', label: 'Parte reveladora', placeholder: 'Empresa S.L. (NIF: B12345678)' },
    { key: 'parte_receptora', label: 'Parte receptora', placeholder: 'Consultor SA (NIF: A87654321)' },
    { key: 'objeto_confidencialidad', label: 'Objeto de la confidencialidad', placeholder: 'Proyecto de software para gestión contable...' },
    { key: 'duracion', label: 'Duración', placeholder: '2 años desde la firma' },
  ],
  'NDA internacional': [
    { key: 'parte_reveladora', label: 'Parte reveladora', placeholder: 'Empresa S.L. (NIF: B12345678)' },
    { key: 'parte_receptora', label: 'Parte receptora', placeholder: 'Company Ltd. (VAT: GB123456789)' },
    { key: 'objeto_confidencialidad', label: 'Objeto de la confidencialidad', placeholder: 'Proyecto de expansión internacional...' },
    { key: 'duracion', label: 'Duración', placeholder: '2 años desde la firma' },
    { key: 'ley_aplicable', label: 'Ley aplicable', placeholder: 'Derecho español / UNIDROIT' },
  ],
  'Compraventa inmueble': [
    { key: 'vendedor', label: 'Vendedor', placeholder: 'Nombre completo (DNI: 12345678A)' },
    { key: 'comprador', label: 'Comprador', placeholder: 'Nombre completo (DNI: 87654321B)' },
    { key: 'descripcion_bien', label: 'Descripción del bien', placeholder: 'Piso en Calle Mayor 5, 3ºB, Madrid. Ref. Catastral: ...' },
    { key: 'precio_euros', label: 'Precio (€)', placeholder: '250.000 €' },
    { key: 'forma_pago', label: 'Forma de pago', placeholder: 'Transferencia bancaria ante notario' },
  ],
  'Arrendamiento vivienda': [
    { key: 'arrendador', label: 'Arrendador', placeholder: 'Nombre completo (DNI)' },
    { key: 'arrendatario', label: 'Arrendatario', placeholder: 'Nombre completo (DNI)' },
    { key: 'direccion', label: 'Dirección del inmueble', placeholder: 'Calle Mayor 5, 3ºB, Madrid' },
    { key: 'renta_mensual', label: 'Renta mensual (€)', placeholder: '900 €/mes' },
    { key: 'duracion', label: 'Duración', placeholder: '1 año prorrogable (LAU)' },
  ],
  'Arrendamiento local': [
    { key: 'arrendador', label: 'Arrendador', placeholder: 'Nombre / empresa (NIF)' },
    { key: 'arrendatario', label: 'Arrendatario', placeholder: 'Nombre / empresa (NIF)' },
    { key: 'descripcion_local', label: 'Descripción del local', placeholder: 'Local comercial en Calle Mayor 5, Madrid, 80m²' },
    { key: 'renta_mensual', label: 'Renta mensual (€)', placeholder: '1.200 €/mes + IVA' },
    { key: 'duracion', label: 'Duración', placeholder: '3 años con prórrogas anuales' },
  ],
  'Prestación servicios': [
    { key: 'prestador', label: 'Prestador del servicio', placeholder: 'Consultor / empresa (NIF)' },
    { key: 'cliente', label: 'Cliente', placeholder: 'Empresa S.L. (NIF)' },
    { key: 'descripcion_servicio', label: 'Descripción del servicio', placeholder: 'Desarrollo de aplicación web...' },
    { key: 'honorarios', label: 'Honorarios', placeholder: '3.000 € + IVA' },
    { key: 'plazo', label: 'Plazo de entrega', placeholder: '30 días desde la firma' },
  ],
  'Préstamo': [
    { key: 'prestamista', label: 'Prestamista', placeholder: 'Nombre completo (DNI)' },
    { key: 'prestatario', label: 'Prestatario', placeholder: 'Nombre completo (DNI)' },
    { key: 'capital', label: 'Capital prestado (€)', placeholder: '5.000 €' },
    { key: 'interes', label: 'Tipo de interés', placeholder: '0% (sin interés) o 3% anual' },
    { key: 'devolucion', label: 'Devolución', placeholder: '12 cuotas mensuales de 416,67 €' },
  ],
  'Contrato indefinido': [
    { key: 'empresa', label: 'Empresa', placeholder: 'Empresa S.L. (NIF: B12345678)' },
    { key: 'trabajador', label: 'Trabajador', placeholder: 'Nombre completo (DNI)' },
    { key: 'cargo', label: 'Cargo / categoría', placeholder: 'Desarrollador Senior — Grupo III' },
    { key: 'salario_bruto', label: 'Salario bruto anual (€)', placeholder: '35.000 € brutos/año' },
    { key: 'jornada', label: 'Jornada', placeholder: '40h semanales, lunes a viernes' },
  ],
  'Contrato temporal': [
    { key: 'empresa', label: 'Empresa', placeholder: 'Empresa S.L. (NIF: B12345678)' },
    { key: 'trabajador', label: 'Trabajador', placeholder: 'Nombre completo (DNI)' },
    { key: 'cargo', label: 'Cargo / categoría', placeholder: 'Técnico de soporte' },
    { key: 'salario_bruto', label: 'Salario bruto anual (€)', placeholder: '22.000 € brutos/año' },
    { key: 'duracion', label: 'Duración del contrato', placeholder: '6 meses' },
    { key: 'causa', label: 'Causa de temporalidad', placeholder: 'Sustitución por IT de Ana García' },
  ],
  'Carta despido disciplinario': [
    { key: 'empresa', label: 'Empresa', placeholder: 'Empresa S.L. (NIF)' },
    { key: 'trabajador', label: 'Trabajador', placeholder: 'Nombre completo (DNI)' },
    { key: 'cargo', label: 'Cargo', placeholder: 'Comercial' },
    { key: 'hechos', label: 'Hechos imputados', placeholder: 'Describa los hechos constitutivos de falta grave o muy grave...' },
  ],
  'Carta despido objetivo': [
    { key: 'empresa', label: 'Empresa', placeholder: 'Empresa S.L. (NIF)' },
    { key: 'trabajador', label: 'Trabajador', placeholder: 'Nombre completo (DNI)' },
    { key: 'cargo', label: 'Cargo', placeholder: 'Administrativo' },
    { key: 'causa', label: 'Causa objetiva', placeholder: 'Causas económicas / organizativas (art. 52 ET)...' },
    { key: 'indemnizacion', label: 'Indemnización (€)', placeholder: '20 días por año trabajado' },
  ],
  'Estatutos SL': [
    { key: 'denominacion', label: 'Denominación social', placeholder: 'Nombre de la sociedad S.L.' },
    { key: 'objeto_social', label: 'Objeto social', placeholder: 'Desarrollo de software, consultoría tecnológica...' },
    { key: 'capital_social', label: 'Capital social (€)', placeholder: '3.000 € dividido en 3.000 participaciones de 1€' },
    { key: 'domicilio', label: 'Domicilio social', placeholder: 'Calle Mayor 5, 28001 Madrid' },
    { key: 'organo_administracion', label: 'Órgano de administración', placeholder: 'Administrador único / Consejo de Administración' },
  ],
  'Pacto de socios': [
    { key: 'sociedad', label: 'Sociedad', placeholder: 'Nombre S.L. (NIF)' },
    { key: 'socios', label: 'Socios firmantes', placeholder: 'Socio A (30%), Socio B (30%), Socio C (40%)' },
    { key: 'gobierno', label: 'Reglas de gobierno', placeholder: 'Mayorías, veto, board composition...' },
    { key: 'restricciones_transmision', label: 'Restricciones transmisión', placeholder: 'Lock-up 2 años, ROFR, drag-along, tag-along' },
    { key: 'salida', label: 'Mecanismos de salida', placeholder: 'Put/call options, liquidación preferente...' },
  ],
  'Demanda divorcio': [
    { key: 'demandante', label: 'Demandante', placeholder: 'Nombre completo (DNI)' },
    { key: 'demandado', label: 'Demandado/a', placeholder: 'Nombre completo (DNI)' },
    { key: 'fecha_matrimonio', label: 'Fecha del matrimonio', placeholder: '15/06/2010' },
    { key: 'hijos', label: 'Hijos menores', placeholder: 'Sin hijos / Nombre, edad...' },
    { key: 'causa', label: 'Causa / peticiones', placeholder: 'Cese de convivencia +3 meses, guarda compartida, pensión alimentos...' },
  ],
  'Convenio regulador': [
    { key: 'conyuge_a', label: 'Cónyuge A', placeholder: 'Nombre completo (DNI)' },
    { key: 'conyuge_b', label: 'Cónyuge B', placeholder: 'Nombre completo (DNI)' },
    { key: 'hijos', label: 'Hijos menores', placeholder: 'Nombre, fecha de nacimiento...' },
    { key: 'guarda', label: 'Guarda y custodia', placeholder: 'Compartida / Exclusiva madre / Exclusiva padre' },
    { key: 'pension_alimentos', label: 'Pensión alimentos (€/mes)', placeholder: '300 €/mes por hijo' },
    { key: 'uso_vivienda', label: 'Uso de la vivienda familiar', placeholder: 'Atribuida a la madre hasta mayoría de edad de los hijos' },
  ],
  'Denuncia': [
    { key: 'denunciante', label: 'Denunciante', placeholder: 'Nombre completo (DNI)' },
    { key: 'denunciado', label: 'Denunciado', placeholder: 'Nombre / descripción' },
    { key: 'hechos', label: 'Hechos denunciados', placeholder: 'Narración cronológica de los hechos...' },
    { key: 'pruebas', label: 'Pruebas disponibles', placeholder: 'Capturas de pantalla, testigos, grabaciones...' },
  ],
  'Recurso alzada': [
    { key: 'recurrente', label: 'Recurrente', placeholder: 'Nombre completo (NIF)' },
    { key: 'organo', label: 'Órgano al que se dirige', placeholder: 'Ministerio / Consejería competente' },
    { key: 'acto_recurrido', label: 'Acto recurrido', placeholder: 'Resolución de fecha XX/XX/XXXX, nº expediente...' },
    { key: 'motivos', label: 'Motivos del recurso', placeholder: 'Infracción del art. XX, falta de motivación...' },
  ],
  'Arras penitenciales': [
    { key: 'vendedor', label: 'Vendedor', placeholder: 'Nombre completo (DNI)' },
    { key: 'comprador', label: 'Comprador', placeholder: 'Nombre completo (DNI)' },
    { key: 'descripcion_inmueble', label: 'Descripción del inmueble', placeholder: 'Piso en Calle Mayor 5, 3ºB, Madrid...' },
    { key: 'precio_total', label: 'Precio total (€)', placeholder: '250.000 €' },
    { key: 'importe_arras', label: 'Importe de las arras (€)', placeholder: '10.000 € (4% del precio)' },
    { key: 'plazo_escritura', label: 'Plazo para escritura', placeholder: '3 meses desde la firma' },
  ],
  'Recurso AEAT': [
    { key: 'contribuyente', label: 'Contribuyente', placeholder: 'Nombre completo (NIF)' },
    { key: 'acto_recurrido', label: 'Acto recurrido', placeholder: 'Liquidación provisional IS ejercicio 2023, nº ref...' },
    { key: 'cuantia', label: 'Cuantía reclamada (€)', placeholder: '5.000 €' },
    { key: 'motivos', label: 'Motivos', placeholder: 'Indebida regularización de gastos deducibles...' },
  ],
  'Carta cease & desist': [
    { key: 'remitente', label: 'Remitente', placeholder: 'Empresa S.L. (NIF) — titular del derecho' },
    { key: 'destinatario', label: 'Destinatario', placeholder: 'Empresa infractora S.L.' },
    { key: 'derecho_infringido', label: 'Derecho infringido', placeholder: 'Marca registrada nº 123456 / Obra protegida por copyright...' },
    { key: 'conducta_infractora', label: 'Conducta infractora', placeholder: 'Uso no autorizado de la marca en su web comercial...' },
    { key: 'plazo_cese', label: 'Plazo para el cese', placeholder: '15 días hábiles desde recepción' },
  ],
  'Distribución internacional': [
    { key: 'principal', label: 'Empresa principal', placeholder: 'Empresa S.L. (NIF)' },
    { key: 'distribuidor', label: 'Distribuidor', placeholder: 'Company Ltd. (VAT/reg)' },
    { key: 'territorio', label: 'Territorio', placeholder: 'Francia, Bélgica, Países Bajos' },
    { key: 'productos', label: 'Productos', placeholder: 'Gama de productos XYZ...' },
    { key: 'duracion', label: 'Duración', placeholder: '3 años renovables' },
  ],
}

const DEFAULT_FIELDS: FieldDef[] = [
  { key: 'parte_a', label: 'Parte A', placeholder: 'Nombre completo / empresa (NIF)' },
  { key: 'parte_b', label: 'Parte B', placeholder: 'Nombre completo / empresa (NIF)' },
  { key: 'objeto', label: 'Objeto', placeholder: 'Descripción del objeto del documento...' },
  { key: 'condiciones', label: 'Condiciones principales', placeholder: 'Detalla las condiciones más relevantes...' },
]

const TEXTAREA_KEYS = new Set(['hechos', 'objeto', 'condiciones', 'motivos', 'causa', 'objeto_social', 'gobierno', 'salida'])

function getFieldsForType(docType: string): FieldDef[] {
  return TYPE_FIELDS[docType] ?? DEFAULT_FIELDS
}

// ─── Step Bar ────────────────────────────────────────────────────────────────

function StepBar({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Categoría', 'Datos', 'Resultado']
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3
        const active = n === current
        const done = n < current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: active ? 'var(--obsidian)' : done ? '#7C3AED' : 'var(--hairline)',
                color: active || done ? '#fff' : 'var(--ink-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                transition: 'background 0.3s',
              }}>
                {done ? '✓' : n}
              </div>
              <span style={{
                fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? 'var(--ink-primary)' : 'var(--ink-tertiary)',
                whiteSpace: 'nowrap',
              }}>{label}</span>
            </div>
            {i < 2 && (
              <div style={{
                flex: 1, height: 1, margin: '0 12px',
                background: done ? '#7C3AED' : 'var(--hairline)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Client = { id: string; name: string; email: string | null; nif_cif: string | null }

export default function GeneratePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [finalContract, setFinalContract] = useState<{ content: string; id: string } | null>(null)
  const [costCents, setCostCents] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(d => setClients(d.clients || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (generating && resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight
    }
  }, [streamText, generating])

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId)
    const client = clients.find(c => c.id === clientId)
    if (!client || !selectedType) return
    const nif = client.nif_cif ? ` (NIF/CIF: ${client.nif_cif})` : ''
    const clientStr = `${client.name}${nif}`
    const typeFields = getFieldsForType(selectedType)
    const firstKey = typeFields[0]?.key
    if (firstKey) setFields(prev => ({ ...prev, [firstKey]: clientStr }))
  }

  const handleGenerate = async () => {
    if (!selectedType) return
    setGenerating(true)
    setStreamText('')
    setFinalContract(null)
    setCostCents(null)
    setError('')
    setStep(3)

    try {
      const res = await fetch('/api/claude/generate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractType: selectedType, fields, stream: true }),
      })
      if (!res.ok || !res.body) throw new Error('Error al generar el documento')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'delta') {
              accumulated += data.text
              setStreamText(accumulated)
            }
            if (data.type === 'done') {
              setFinalContract({ content: data.contract?.content || accumulated, id: data.contract?.id || '' })
              setCostCents(data.cost_eur_cents)
              setGenerating(false)
            }
            if (data.type === 'error') throw new Error(data.message)
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setGenerating(false)
      setStep(2)
    }
  }

  const handleCopy = () => navigator.clipboard.writeText(finalContract?.content || '')

  const handleDownloadTxt = () => {
    if (!finalContract) return
    const blob = new Blob([finalContract.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedType?.replace(/\s+/g, '_') || 'documento'}_LEXIA.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setStep(1)
    setSelectedCategory(null)
    setSelectedType(null)
    setFields({})
    setStreamText('')
    setFinalContract(null)
    setCostCents(null)
    setError('')
    setSelectedClientId('')
    setGenerating(false)
  }

  const activeCat = CATEGORIES.find(c => c.id === selectedCategory)

  // ── Step 1 ──────────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 24,
      }}>
        {CATEGORIES.map((cat, idx) => {
          const active = selectedCategory === cat.id
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.035, duration: 0.28 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCategory(active ? null : cat.id)}
              style={{
                padding: '20px 16px',
                textAlign: 'left',
                background: active ? 'var(--obsidian)' : 'var(--surface)',
                border: `1px solid ${active ? 'var(--obsidian)' : 'var(--hairline)'}`,
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 10 }}>{cat.icon}</div>
              <div style={{
                fontSize: 14, fontWeight: 600, marginBottom: 4,
                color: active ? '#fff' : 'var(--ink-primary)',
              }}>{cat.label}</div>
              <div style={{
                fontSize: 12,
                color: active ? 'rgba(255,255,255,0.5)' : 'var(--ink-tertiary)',
              }}>{cat.types.length} tipos disponibles</div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {activeCat && (
          <motion.div
            key="pills"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{
              padding: '20px 24px',
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: 12,
            }}>
              <p style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--ink-tertiary)', marginBottom: 14,
              }}>
                {activeCat.icon} {activeCat.label} — selecciona el tipo de documento
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {activeCat.types.map(type => (
                  <motion.button
                    key={type}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setSelectedType(type)
                      setFields({})
                      setSelectedClientId('')
                      setStep(2)
                    }}
                    style={{
                      padding: '7px 14px',
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 20,
                      fontSize: 13,
                      color: 'var(--ink-primary)',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--obsidian)'
                      e.currentTarget.style.color = '#fff'
                      e.currentTarget.style.borderColor = 'var(--obsidian)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--surface-elevated)'
                      e.currentTarget.style.color = 'var(--ink-primary)'
                      e.currentTarget.style.borderColor = 'var(--hairline)'
                    }}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  // ── Step 2 ──────────────────────────────────────────────────────────────────
  const renderStep2 = () => {
    if (!selectedType) return null
    const typeFields = getFieldsForType(selectedType)
    return (
      <motion.div
        key="step2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid var(--hairline)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-primary)' }}>{selectedType}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-tertiary)', marginTop: 2 }}>
                Rellena los datos — los campos vacíos usarán valores por defecto
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              style={{
                padding: '7px 16px', background: 'none',
                border: '1px solid var(--hairline)', borderRadius: 8,
                fontSize: 13, color: 'var(--ink-secondary)', cursor: 'pointer',
              }}
            >
              ← Atrás
            </button>
          </div>

          <div style={{ padding: 24 }}>
            {/* Client pre-fill */}
            {clients.length > 0 && (
              <div style={{
                padding: 16, background: 'var(--surface-elevated)',
                border: '1px solid var(--hairline)', borderRadius: 10, marginBottom: 24,
              }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.07em', color: 'var(--ink-tertiary)', marginBottom: 10,
                }}>⚡ Pre-rellenar desde cliente</p>
                <select
                  value={selectedClientId}
                  onChange={e => handleClientSelect(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px',
                    background: 'var(--surface)', border: '1px solid var(--hairline)',
                    borderRadius: 8, fontSize: 13, color: 'var(--ink-primary)', outline: 'none',
                  }}
                >
                  <option value="">Selecciona un cliente para pre-rellenar...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}{c.nif_cif ? ` — ${c.nif_cif}` : ''}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Common fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {COMMON_FIELDS.map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-secondary)' }}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={fields[field.key] || ''}
                      onChange={e => setFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{
                        padding: '9px 12px', background: 'var(--surface)',
                        border: '1px solid var(--hairline)', borderRadius: 8,
                        fontSize: 13, color: 'var(--ink-primary)', outline: 'none',
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      {JURISDICTION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={fields[field.key] || ''}
                      onChange={e => setFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{
                        padding: '9px 12px', background: 'var(--surface)',
                        border: '1px solid var(--hairline)', borderRadius: 8,
                        fontSize: 13, color: 'var(--ink-primary)', outline: 'none',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Type-specific fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {typeFields.map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-secondary)' }}>{field.label}</label>
                  {TEXTAREA_KEYS.has(field.key) ? (
                    <textarea
                      value={fields[field.key] || ''}
                      onChange={e => setFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      rows={3}
                      style={{
                        padding: '9px 12px', background: 'var(--surface)',
                        border: '1px solid var(--hairline)', borderRadius: 8,
                        fontSize: 13, color: 'var(--ink-primary)', outline: 'none',
                        resize: 'vertical', fontFamily: 'inherit',
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={fields[field.key] || ''}
                      onChange={e => setFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{
                        padding: '9px 12px', background: 'var(--surface)',
                        border: '1px solid var(--hairline)', borderRadius: 8,
                        fontSize: 13, color: 'var(--ink-primary)', outline: 'none',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div style={{
                padding: '12px 16px', background: '#FEF2F2',
                border: '1px solid #FECACA', borderRadius: 8, marginBottom: 16,
              }}>
                <p style={{ fontSize: 13, color: '#DC2626', margin: 0 }}>{error}</p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              style={{
                width: '100%', padding: '14px 24px',
                background: 'var(--obsidian)', color: '#fff',
                border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              ✨ Generar con LEXIA
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  // ── Step 3 ──────────────────────────────────────────────────────────────────
  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 16, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--hairline)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{activeCat?.icon}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-primary)' }}>{selectedType}</span>
            {generating && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#7C3AED', display: 'inline-block',
                  animation: 'lexia-pulse 1.2s ease-in-out infinite',
                }} />
                Generando...
              </span>
            )}
            {!generating && costCents !== null && (
              <span style={{
                padding: '3px 10px', background: '#F0FDF4',
                border: '1px solid #BBF7D0', borderRadius: 20,
                fontSize: 12, color: '#15803D', fontWeight: 600,
              }}>
                Coste: {costCents < 1 ? '<0.01€' : `${(costCents / 100).toFixed(2)}€`}
              </span>
            )}
          </div>
          {!generating && finalContract && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: '7px 14px', background: 'none',
                  border: '1px solid var(--hairline)', borderRadius: 8,
                  fontSize: 13, color: 'var(--ink-secondary)', cursor: 'pointer',
                }}
              >
                Copiar
              </button>
              <button
                onClick={handleDownloadTxt}
                style={{
                  padding: '7px 14px', background: 'var(--obsidian)',
                  border: '1px solid var(--obsidian)', borderRadius: 8,
                  fontSize: 13, color: '#fff', cursor: 'pointer', fontWeight: 600,
                }}
              >
                ↓ Descargar TXT
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div
          ref={resultRef}
          style={{ padding: 24, maxHeight: 560, overflowY: 'auto', background: 'var(--bg)' }}
        >
          <pre style={{
            fontSize: 13, lineHeight: 1.75, color: 'var(--ink-primary)',
            whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0,
          }}>
            {generating ? streamText : finalContract?.content}
            {generating && (
              <span style={{
                display: 'inline-block', width: 2, height: '1em',
                background: 'var(--obsidian)', marginLeft: 2, verticalAlign: 'middle',
                animation: 'lexia-blink 1s step-start infinite',
              }} />
            )}
          </pre>
        </div>

        {/* Footer */}
        {!generating && finalContract && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              padding: '12px 16px', background: '#FFFBEB',
              border: '1px solid #FDE68A', borderRadius: 10,
            }}>
              <p style={{ fontSize: 13, color: '#92400E', margin: 0 }}>
                ⚠️ Documento generado por IA. Revisa con tu abogado antes de firmar.
              </p>
            </div>
            <button
              onClick={handleReset}
              style={{
                alignSelf: 'flex-start', padding: '8px 16px', background: 'none',
                border: '1px solid var(--hairline)', borderRadius: 8,
                fontSize: 13, color: 'var(--ink-secondary)', cursor: 'pointer',
              }}
            >
              ← Nuevo documento
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes lexia-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes lexia-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>
    </motion.div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink-primary)', margin: 0, lineHeight: 1.2 }}>
          Generar <em style={{ fontStyle: 'italic' }}>documento</em>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-tertiary)', marginTop: 8, marginBottom: 0 }}>
          LEXIA redacta documentos legales completos, válidos en España, en segundos.
        </p>
      </motion.div>

      <StepBar current={step} />

      <AnimatePresence mode="wait">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </AnimatePresence>
    </div>
  )
}
