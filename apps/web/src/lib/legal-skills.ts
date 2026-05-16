/**
 * Legal Skills Registry — IURALEX
 *
 * Covers ALL practice areas for Spanish lawyers:
 * Penal · Familia · Laboral · Civil · Mercantil · Administrativo ·
 * Inmobiliario · Propiedad Intelectual · Fiscal · Internacional
 */

export type SkillCategory =
  | 'contratos'
  | 'laboral'
  | 'privacidad'
  | 'corporativo'
  | 'litigios'
  | 'ip'
  | 'regulatorio'
  | 'penal'
  | 'familia'
  | 'civil'
  | 'administrativo'
  | 'inmobiliario'
  | 'fiscal'
  | 'internacional'

export interface LegalSkill {
  id: string
  plugin: string
  skill: string
  label: string
  description: string
  category: SkillCategory
  icon: string
  argumentHint?: string
  featured?: boolean
  timeEstimate?: string          // e.g. "2 min"
  outputFormat?: 'markdown' | 'json' | 'docx'
}

export const LEGAL_SKILLS: LegalSkill[] = [

  // ══════════════════════════════════════════════════════════════
  // PENAL — Defensa, acusación, recursos, medidas
  // ══════════════════════════════════════════════════════════════
  {
    id: 'penal:escrito-defensa',
    plugin: 'litigation-legal', skill: 'brief-section-drafter',
    label: 'Escrito de defensa',
    description: 'Redacta escrito de defensa penal con hechos, fundamentos jurídicos y petición absolutoria',
    category: 'penal', icon: 'shield', featured: true, timeEstimate: '5 min',
    argumentHint: 'Hechos del caso, delito imputado, pruebas de descargo',
  },
  {
    id: 'penal:querella',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Querella criminal',
    description: 'Redacta querella ante juzgado de instrucción con todos los requisitos del art. 270 LECrim',
    category: 'penal', icon: 'gavel', timeEstimate: '4 min',
  },
  {
    id: 'penal:denuncia',
    plugin: 'litigation-legal', skill: 'demand-intake',
    label: 'Escrito de denuncia',
    description: 'Redacta denuncia ante comisaría o juzgado con descripción de hechos y petición de actuaciones',
    category: 'penal', icon: 'document', timeEstimate: '3 min',
  },
  {
    id: 'penal:recurso-apelacion',
    plugin: 'litigation-legal', skill: 'brief-section-drafter',
    label: 'Recurso de apelación penal',
    description: 'Recurso de apelación contra sentencia penal (art. 790 LECrim) con motivos y petición',
    category: 'penal', icon: 'arrow-up-right', timeEstimate: '6 min',
  },
  {
    id: 'penal:recurso-casacion',
    plugin: 'litigation-legal', skill: 'brief-section-drafter',
    label: 'Recurso de casación',
    description: 'Prepara recurso de casación ante Tribunal Supremo con infracción de ley o quebrantamiento de forma',
    category: 'penal', icon: 'scales', timeEstimate: '8 min',
  },
  {
    id: 'penal:habeas-corpus',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Habeas corpus',
    description: 'Solicitud de habeas corpus (LO 6/1984) ante privación ilegal de libertad',
    category: 'penal', icon: 'lock',
  },
  {
    id: 'penal:medidas-cautelares',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Medidas cautelares penales',
    description: 'Solicitud de prisión provisional, libertad con cargos o medidas alternativas',
    category: 'penal', icon: 'shield',
  },
  {
    id: 'penal:acusacion-particular',
    plugin: 'litigation-legal', skill: 'brief-section-drafter',
    label: 'Escrito de acusación particular',
    description: 'Escrito de acusación en fase oral con calificación provisional y proposición de prueba',
    category: 'penal', icon: 'gavel', timeEstimate: '5 min',
  },
  {
    id: 'penal:conformidad',
    plugin: 'litigation-legal', skill: 'matter-briefing',
    label: 'Análisis de conformidad',
    description: 'Evalúa si la conformidad es conveniente: penas, antecedentes, atenuantes aplicables',
    category: 'penal', icon: 'scales',
  },
  {
    id: 'penal:cronologia',
    plugin: 'litigation-legal', skill: 'chronology',
    label: 'Cronología penal del caso',
    description: 'Genera línea temporal del caso penal: hechos, diligencias, actuaciones, plazos',
    category: 'penal', icon: 'clock',
  },

  // ══════════════════════════════════════════════════════════════
  // FAMILIA — Divorcio, custodia, alimentos, herencias
  // ══════════════════════════════════════════════════════════════
  {
    id: 'familia:demanda-divorcio',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Demanda de divorcio',
    description: 'Demanda de divorcio contencioso (art. 86 CC + LEC) con medidas definitivas',
    category: 'familia', icon: 'users', featured: true, timeEstimate: '5 min',
  },
  {
    id: 'familia:convenio-regulador',
    plugin: 'commercial-legal', skill: 'review',
    label: 'Convenio regulador',
    description: 'Redacta o revisa convenio regulador: custodia, alimentos, uso vivienda, liquidación',
    category: 'familia', icon: 'document', timeEstimate: '6 min',
  },
  {
    id: 'familia:modificacion-medidas',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Modificación de medidas',
    description: 'Demanda de modificación de medidas definitivas por cambio sustancial de circunstancias',
    category: 'familia', icon: 'arrow-up-right',
  },
  {
    id: 'familia:custodia-compartida',
    plugin: 'litigation-legal', skill: 'brief-section-drafter',
    label: 'Escrito custodia compartida',
    description: 'Argumentación jurídica para solicitar custodia compartida con jurisprudencia TS',
    category: 'familia', icon: 'users', timeEstimate: '4 min',
  },
  {
    id: 'familia:alimentos',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Reclamación de alimentos',
    description: 'Demanda de alimentos para hijos o entre parientes (arts. 142-160 CC)',
    category: 'familia', icon: 'scales',
  },
  {
    id: 'familia:liquidacion-gananciales',
    plugin: 'corporate-legal', skill: 'tabular-review',
    label: 'Liquidación sociedad gananciales',
    description: 'Inventario y valoración de activos/pasivos del matrimonio para liquidación',
    category: 'familia', icon: 'building',
  },
  {
    id: 'familia:herencia-aceptacion',
    plugin: 'corporate-legal', skill: 'written-consent',
    label: 'Aceptación / repudiación herencia',
    description: 'Redacta escrito de aceptación pura, a beneficio de inventario o repudiación de herencia',
    category: 'familia', icon: 'document',
  },
  {
    id: 'familia:testamento',
    plugin: 'commercial-legal', skill: 'stakeholder-summary',
    label: 'Análisis de testamento',
    description: 'Analiza testamento: legítimas, mejoras, legados, posibles impugnaciones',
    category: 'familia', icon: 'feather',
  },
  {
    id: 'familia:violencia-domestica',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Orden de protección VG',
    description: 'Solicitud de orden de protección por violencia de género (LO 1/2004)',
    category: 'familia', icon: 'shield', featured: true,
  },
  {
    id: 'familia:adopcion',
    plugin: 'litigation-legal', skill: 'matter-briefing',
    label: 'Expediente de adopción',
    description: 'Resumen y checklist del proceso de adopción nacional o internacional',
    category: 'familia', icon: 'users',
  },

  // ══════════════════════════════════════════════════════════════
  // LABORAL — Despidos, ERE, accidentes, negociación colectiva
  // ══════════════════════════════════════════════════════════════
  {
    id: 'employment-legal:termination-review',
    plugin: 'employment-legal', skill: 'termination-review',
    label: 'Revisar despido',
    description: 'Analiza carta de despido: calificación (procedente/improcedente/nulo) y acciones recomendadas',
    category: 'laboral', icon: 'user-circle', featured: true, timeEstimate: '3 min',
  },
  {
    id: 'laboral:demanda-despido',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Demanda por despido',
    description: 'Demanda ante Juzgado de lo Social por despido improcedente, nulo u objetivo',
    category: 'laboral', icon: 'gavel', timeEstimate: '5 min',
  },
  {
    id: 'laboral:papeleta-conciliacion',
    plugin: 'litigation-legal', skill: 'demand-intake',
    label: 'Papeleta de conciliación',
    description: 'Redacta papeleta de conciliación previa obligatoria ante el SMAC/CEMAC',
    category: 'laboral', icon: 'scales', timeEstimate: '2 min',
  },
  {
    id: 'employment-legal:hiring-review',
    plugin: 'employment-legal', skill: 'hiring-review',
    label: 'Revisar contrato laboral',
    description: 'Revisa contrato de trabajo: tipo, jornada, salario, cláusulas abusivas',
    category: 'laboral', icon: 'document',
  },
  {
    id: 'laboral:ere-erte',
    plugin: 'employment-legal', skill: 'policy-drafting',
    label: 'Análisis ERE / ERTE',
    description: 'Evalúa causas (económicas, técnicas, organizativas), procedimiento y derechos trabajadores',
    category: 'laboral', icon: 'building',
  },
  {
    id: 'laboral:accidente-trabajo',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Reclamación accidente laboral',
    description: 'Demanda por accidente de trabajo: responsabilidad empresarial, recargo prestaciones',
    category: 'laboral', icon: 'shield',
  },
  {
    id: 'employment-legal:worker-classification',
    plugin: 'employment-legal', skill: 'worker-classification',
    label: 'Clasificación laboral (TRADE)',
    description: 'Determina si relación es laboral, TRADE o autónomo. Riesgo de falso autónomo',
    category: 'laboral', icon: 'search',
  },
  {
    id: 'laboral:acoso-laboral',
    plugin: 'employment-legal', skill: 'internal-investigation',
    label: 'Expediente acoso laboral',
    description: 'Gestiona denuncia de acoso laboral (mobbing): protocolo, pruebas, acciones legales',
    category: 'laboral', icon: 'shield',
  },
  {
    id: 'laboral:incapacidad',
    plugin: 'litigation-legal', skill: 'matter-briefing',
    label: 'Recurso incapacidad permanente',
    description: 'Recurso contra resolución del INSS sobre grado de incapacidad permanente',
    category: 'laboral', icon: 'user-circle',
  },
  {
    id: 'employment-legal:wage-hour-qa',
    plugin: 'employment-legal', skill: 'wage-hour-qa',
    label: 'Q&A salarios y jornada',
    description: 'Responde dudas: horas extra, descansos, vacaciones, complementos salariales',
    category: 'laboral', icon: 'clock',
  },

  // ══════════════════════════════════════════════════════════════
  // CIVIL — Contratos, reclamaciones, ejecuciones, propiedad
  // ══════════════════════════════════════════════════════════════
  {
    id: 'civil:demanda-cantidad',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Demanda reclamación de cantidad',
    description: 'Demanda civil por impago: procedimiento ordinario o verbal según cuantía',
    category: 'civil', icon: 'scales', featured: true, timeEstimate: '4 min',
  },
  {
    id: 'civil:demanda-monitorio',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Petición proceso monitorio',
    description: 'Petición inicial monitorio (art. 812 LEC) para reclamación de deuda documentada',
    category: 'civil', icon: 'document', timeEstimate: '2 min',
  },
  {
    id: 'civil:recurso-apelacion',
    plugin: 'litigation-legal', skill: 'brief-section-drafter',
    label: 'Recurso de apelación civil',
    description: 'Recurso de apelación (art. 458 LEC) contra sentencia de primera instancia',
    category: 'civil', icon: 'arrow-up-right',
  },
  {
    id: 'commercial-legal:review',
    plugin: 'commercial-legal', skill: 'review',
    label: 'Revisar contrato civil',
    description: 'Análisis completo de contrato: riesgos, cláusulas abusivas, recomendaciones',
    category: 'contratos', icon: 'document', featured: true, timeEstimate: '3 min',
  },
  {
    id: 'civil:resolucion-contrato',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Demanda resolución de contrato',
    description: 'Demanda de resolución contractual por incumplimiento (art. 1124 CC)',
    category: 'civil', icon: 'gavel',
  },
  {
    id: 'civil:responsabilidad-civil',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Responsabilidad civil extracontractual',
    description: 'Reclamación por daños y perjuicios (art. 1902 CC): accidentes, negligencias',
    category: 'civil', icon: 'shield',
  },
  {
    id: 'civil:ejecucion-sentencia',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Escrito de ejecución',
    description: 'Demanda ejecutiva de sentencia firme (art. 548 LEC) con embargo de bienes',
    category: 'civil', icon: 'lock',
  },
  {
    id: 'civil:comunidad-propietarios',
    plugin: 'litigation-legal', skill: 'matter-briefing',
    label: 'Conflicto comunidad de propietarios',
    description: 'Analiza conflicto en comunidad: impugnación acuerdos, morosidad, obras',
    category: 'civil', icon: 'building',
  },

  // ══════════════════════════════════════════════════════════════
  // CONTRATOS COMERCIALES — NDAs, MSA, SaaS, distribución
  // ══════════════════════════════════════════════════════════════
  {
    id: 'commercial-legal:nda-review',
    plugin: 'commercial-legal', skill: 'nda-review',
    label: 'Revisar NDA',
    description: 'Revisa acuerdo de confidencialidad: alcance, duración, penalizaciones',
    category: 'contratos', icon: 'lock', timeEstimate: '2 min',
  },
  {
    id: 'commercial-legal:vendor-agreement-review',
    plugin: 'commercial-legal', skill: 'vendor-agreement-review',
    label: 'Revisar contrato proveedor',
    description: 'MSA / contrato de servicios: SLAs, responsabilidades, cláusulas de salida',
    category: 'contratos', icon: 'building',
  },
  {
    id: 'commercial-legal:renewal-tracker',
    plugin: 'commercial-legal', skill: 'renewal-tracker',
    label: 'Tracker renovaciones contratos',
    description: 'Identifica fechas de vencimiento y plazos de cancelación en cartera de contratos',
    category: 'contratos', icon: 'clock',
  },
  {
    id: 'commercial-legal:stakeholder-summary',
    plugin: 'commercial-legal', skill: 'stakeholder-summary',
    label: 'Resumen ejecutivo contrato',
    description: 'Resumen en lenguaje claro para directivos: puntos clave, riesgos, próximos pasos',
    category: 'contratos', icon: 'arrow-up-right', featured: true,
  },
  {
    id: 'commercial-legal:amendment-history',
    plugin: 'commercial-legal', skill: 'amendment-history',
    label: 'Historial de enmiendas',
    description: 'Rastrea todos los cambios y adendas de un contrato a lo largo del tiempo',
    category: 'contratos', icon: 'clock',
  },

  // ══════════════════════════════════════════════════════════════
  // MERCANTIL / CORPORATIVO — Societario, M&A, concursal
  // ══════════════════════════════════════════════════════════════
  {
    id: 'corporate-legal:tabular-review',
    plugin: 'corporate-legal', skill: 'tabular-review',
    label: 'Due diligence tabular',
    description: 'Tabla de diligencia con citas exactas: contratos clave, riesgos, incidencias',
    category: 'corporativo', icon: 'document', featured: true, timeEstimate: '8 min',
  },
  {
    id: 'corporate-legal:board-minutes',
    plugin: 'corporate-legal', skill: 'board-minutes',
    label: 'Acta de junta / consejo',
    description: 'Redacta acta de Junta General de Socios o Consejo de Administración',
    category: 'corporativo', icon: 'building', timeEstimate: '4 min',
  },
  {
    id: 'corporate-legal:written-consent',
    plugin: 'corporate-legal', skill: 'written-consent',
    label: 'Acuerdo por escrito (socios)',
    description: 'Acuerdo unánime de socios sin convocatoria formal de junta (art. 189 LSC)',
    category: 'corporativo', icon: 'feather',
  },
  {
    id: 'corporate-legal:entity-compliance',
    plugin: 'corporate-legal', skill: 'entity-compliance',
    label: 'Compliance societario',
    description: 'Chequeo de obligaciones mercantiles: depósito cuentas, libros, registros',
    category: 'corporativo', icon: 'shield',
  },
  {
    id: 'corporativo:pacto-socios',
    plugin: 'commercial-legal', skill: 'review',
    label: 'Revisar pacto de socios',
    description: 'Análisis de shareholders agreement: tag-along, drag-along, preferencia liquidación',
    category: 'corporativo', icon: 'users',
  },
  {
    id: 'corporativo:concursal',
    plugin: 'litigation-legal', skill: 'matter-briefing',
    label: 'Análisis situación concursal',
    description: 'Evalúa insolvencia: deber de solicitar concurso, preconcurso, refinanciación',
    category: 'corporativo', icon: 'scales',
  },
  {
    id: 'corporate-legal:closing-checklist',
    plugin: 'corporate-legal', skill: 'closing-checklist',
    label: 'Checklist cierre M&A',
    description: 'Lista completa de condiciones precedentes y documentos para cierre de operación',
    category: 'corporativo', icon: 'check',
  },
  {
    id: 'corporate-legal:material-contract-schedule',
    plugin: 'corporate-legal', skill: 'material-contract-schedule',
    label: 'Inventario contratos materiales',
    description: 'Schedule de contratos relevantes para data room: identificación y resumen',
    category: 'corporativo', icon: 'document',
  },

  // ══════════════════════════════════════════════════════════════
  // ADMINISTRATIVO — Recursos, multas, licencias, Hacienda
  // ══════════════════════════════════════════════════════════════
  {
    id: 'admin:recurso-alzada',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Recurso de alzada',
    description: 'Recurso de alzada (art. 121-122 LPAC) contra resolución de órgano administrativo',
    category: 'administrativo', icon: 'arrow-up-right', featured: true, timeEstimate: '4 min',
  },
  {
    id: 'admin:recurso-reposicion',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Recurso de reposición',
    description: 'Recurso potestativo de reposición (art. 123-124 LPAC) previo al contencioso',
    category: 'administrativo', icon: 'scales', timeEstimate: '3 min',
  },
  {
    id: 'admin:recurso-contencioso',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Demanda contencioso-administrativa',
    description: 'Demanda ante Juzgado o Tribunal Superior de Justicia (LJCA)',
    category: 'administrativo', icon: 'gavel', timeEstimate: '6 min',
  },
  {
    id: 'admin:recurso-multa',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Recurso contra multa/sanción',
    description: 'Recurso de alzada o contencioso contra sanción administrativa: DGT, Hacienda, AEPD',
    category: 'administrativo', icon: 'shield', timeEstimate: '3 min',
  },
  {
    id: 'admin:reclamacion-aeat',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Reclamación TEAC/TEAR',
    description: 'Reclamación económico-administrativa ante Tribunal Económico-Administrativo',
    category: 'administrativo', icon: 'building',
  },
  {
    id: 'admin:silencio-administrativo',
    plugin: 'litigation-legal', skill: 'matter-briefing',
    label: 'Análisis silencio administrativo',
    description: 'Evalúa efectos del silencio: estimatorio vs desestimatorio, plazos para recurrir',
    category: 'administrativo', icon: 'clock',
  },
  {
    id: 'regulatory-legal:reg-gap-check',
    plugin: 'regulatory-legal', skill: 'reg-gap-check',
    label: 'Gap regulatorio sectorial',
    description: 'Analiza incumplimientos normativos en regulación sectorial (energía, farmacia, telecomunicaciones)',
    category: 'regulatorio', icon: 'compass',
  },

  // ══════════════════════════════════════════════════════════════
  // INMOBILIARIO — Compraventa, arrendamiento, hipotecas
  // ══════════════════════════════════════════════════════════════
  {
    id: 'inmobiliario:contrato-arrendamiento',
    plugin: 'commercial-legal', skill: 'review',
    label: 'Revisar contrato arrendamiento',
    description: 'Análisis contrato alquiler vivienda/local: LAU, cláusulas, garantías, renta',
    category: 'inmobiliario', icon: 'building', featured: true, timeEstimate: '3 min',
  },
  {
    id: 'inmobiliario:compraventa',
    plugin: 'commercial-legal', skill: 'vendor-agreement-review',
    label: 'Revisar contrato compraventa',
    description: 'Análisis contrato de compraventa inmobiliaria: cargas, condiciones, arras',
    category: 'inmobiliario', icon: 'document', timeEstimate: '4 min',
  },
  {
    id: 'inmobiliario:due-diligence',
    plugin: 'corporate-legal', skill: 'tabular-review',
    label: 'Due diligence inmobiliaria',
    description: 'Revisión jurídica de inmueble: cargas, servidumbres, licencias, IBI, comunidad',
    category: 'inmobiliario', icon: 'search',
  },
  {
    id: 'inmobiliario:desahucio',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Demanda de desahucio',
    description: 'Demanda de desahucio por falta de pago o expiración del plazo (arts. 250-252 LEC)',
    category: 'inmobiliario', icon: 'gavel', timeEstimate: '4 min',
  },
  {
    id: 'inmobiliario:clausula-suelo',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Reclamación cláusula suelo',
    description: 'Reclamación bancaria por cláusula suelo hipotecaria + intereses devengados',
    category: 'inmobiliario', icon: 'scales',
  },
  {
    id: 'inmobiliario:vph',
    plugin: 'litigation-legal', skill: 'matter-briefing',
    label: 'Análisis propiedad horizontal',
    description: 'Conflictos LPH: impugnación acuerdos, obras, morosidad, estatutos',
    category: 'inmobiliario', icon: 'building',
  },

  // ══════════════════════════════════════════════════════════════
  // PRIVACIDAD / RGPD — DSAR, DPA, EIPD
  // ══════════════════════════════════════════════════════════════
  {
    id: 'privacy-legal:dpa-review',
    plugin: 'privacy-legal', skill: 'dpa-review',
    label: 'Revisar DPA / RGPD',
    description: 'Revisión Data Processing Agreement + compliance RGPD y LOPDGDD',
    category: 'privacidad', icon: 'shield', featured: true,
  },
  {
    id: 'privacy-legal:dsar-response',
    plugin: 'privacy-legal', skill: 'dsar-response',
    label: 'Responder DSAR / derechos ARCO',
    description: 'Gestiona solicitud de derechos: acceso, rectificación, cancelación, oposición (art. 15-22 RGPD)',
    category: 'privacidad', icon: 'user-circle',
  },
  {
    id: 'privacy-legal:pia-generation',
    plugin: 'privacy-legal', skill: 'pia-generation',
    label: 'Generar EIPD (DPIA)',
    description: 'Evaluación de Impacto en Protección de Datos según art. 35 RGPD',
    category: 'privacidad', icon: 'compass',
  },
  {
    id: 'privacy-legal:reg-gap-analysis',
    plugin: 'privacy-legal', skill: 'reg-gap-analysis',
    label: 'Análisis de gaps RGPD',
    description: 'Identifica incumplimientos en tu organización: base legal, registros, brechas',
    category: 'privacidad', icon: 'scales',
  },

  // ══════════════════════════════════════════════════════════════
  // PROPIEDAD INTELECTUAL — Marcas, patentes, PI
  // ══════════════════════════════════════════════════════════════
  {
    id: 'ip-legal:trademark-clearance',
    plugin: 'ip-legal', skill: 'trademark-clearance',
    label: 'Búsqueda de marca',
    description: 'Evalúa viabilidad de registro de marca en OEPM/EUIPO: conflictos, clases Nice',
    category: 'ip', icon: 'compass',
  },
  {
    id: 'ip:carta-cease-desist',
    plugin: 'ip-legal', skill: 'ip-cease-desist',
    label: 'Carta cese y desista (C&D)',
    description: 'Carta de requerimiento por infracción de marca, copyright o patente',
    category: 'ip', icon: 'shield', timeEstimate: '3 min',
  },
  {
    id: 'ip:contrato-licencia',
    plugin: 'commercial-legal', skill: 'review',
    label: 'Revisar licencia PI',
    description: 'Análisis contrato de licencia: exclusividad, territorio, regalías, sublicencias',
    category: 'ip', icon: 'document',
  },
  {
    id: 'ip:informe-fto',
    plugin: 'ip-legal', skill: 'fto-search',
    label: 'Freedom to Operate',
    description: 'Informe FTO: evaluación de libertad de operación para producto o tecnología',
    category: 'ip', icon: 'search',
  },

  // ══════════════════════════════════════════════════════════════
  // FISCAL / TRIBUTARIO — AEAT, recursos, planificación
  // ══════════════════════════════════════════════════════════════
  {
    id: 'fiscal:recurso-aeat',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Recurso contra liquidación AEAT',
    description: 'Recurso de reposición o reclamación TEA contra liquidación tributaria (LGT)',
    category: 'fiscal', icon: 'scales', featured: true, timeEstimate: '4 min',
  },
  {
    id: 'fiscal:alegaciones-inspeccion',
    plugin: 'litigation-legal', skill: 'brief-section-drafter',
    label: 'Alegaciones acta inspección',
    description: 'Escrito de alegaciones en procedimiento de inspección tributaria',
    category: 'fiscal', icon: 'document', timeEstimate: '5 min',
  },
  {
    id: 'fiscal:analisis-contrato',
    plugin: 'commercial-legal', skill: 'review',
    label: 'Análisis fiscal de contrato',
    description: 'Revisión de implicaciones fiscales: IVA, IRPF, IS, ITP/AJD aplicables',
    category: 'fiscal', icon: 'arrow-up-right',
  },
  {
    id: 'fiscal:aplazamiento',
    plugin: 'litigation-legal', skill: 'demand-draft',
    label: 'Solicitud aplazamiento AEAT',
    description: 'Solicitud de aplazamiento o fraccionamiento de deuda tributaria (art. 65 LGT)',
    category: 'fiscal', icon: 'clock',
  },

  // ══════════════════════════════════════════════════════════════
  // INTERNACIONAL — Arbitraje, contratos, extradición
  // ══════════════════════════════════════════════════════════════
  {
    id: 'internacional:contrato-internacional',
    plugin: 'commercial-legal', skill: 'review',
    label: 'Revisar contrato internacional',
    description: 'Análisis contrato internacional: ley aplicable, jurisdicción, CISG, Incoterms',
    category: 'internacional', icon: 'compass',
  },
  {
    id: 'internacional:clausula-arbitraje',
    plugin: 'commercial-legal', skill: 'nda-review',
    label: 'Cláusula de arbitraje',
    description: 'Redacta o revisa cláusula arbitral: ICC, CIADI, CIMA, ad hoc',
    category: 'internacional', icon: 'scales',
  },
  {
    id: 'ai-governance-legal:ai-use-case-triage',
    plugin: 'ai-governance-legal', skill: 'ai-use-case-triage',
    label: 'Triage IA compliance',
    description: 'Evalúa riesgos legales de un caso de uso de IA: AI Act EU, RGPD, responsabilidad',
    category: 'regulatorio', icon: 'sparkles',
  },
]

// ── Index & helpers ──────────────────────────────────────────────────────────

const SKILLS_BY_ID = new Map(LEGAL_SKILLS.map(s => [s.id, s]))

export function getSkill(id: string): LegalSkill | undefined {
  return SKILLS_BY_ID.get(id)
}

export function getSkillsByCategory(category: SkillCategory): LegalSkill[] {
  return LEGAL_SKILLS.filter(s => s.category === category)
}

export function getFeaturedSkills(): LegalSkill[] {
  return LEGAL_SKILLS.filter(s => s.featured)
}

export const SKILL_CATEGORIES: Record<SkillCategory, { label: string; icon: string; color: string }> = {
  penal:          { label: 'Derecho Penal',       icon: 'shield',      color: '#DC2626' },
  familia:        { label: 'Derecho de Familia',   icon: 'users',       color: '#9333EA' },
  laboral:        { label: 'Derecho Laboral',      icon: 'user-circle', color: '#2563EB' },
  civil:          { label: 'Derecho Civil',        icon: 'scales',      color: '#0891B2' },
  contratos:      { label: 'Contratos',            icon: 'document',    color: '#059669' },
  corporativo:    { label: 'Corporativo / M&A',    icon: 'building',    color: '#7C3AED' },
  administrativo: { label: 'Administrativo',       icon: 'gavel',       color: '#D97706' },
  inmobiliario:   { label: 'Inmobiliario',         icon: 'building',    color: '#0D9488' },
  privacidad:     { label: 'RGPD / Privacidad',    icon: 'lock',        color: '#7C3AED' },
  ip:             { label: 'Prop. Intelectual',    icon: 'compass',     color: '#DB2777' },
  fiscal:         { label: 'Fiscal / Tributario',  icon: 'arrow-up-right', color: '#B45309' },
  regulatorio:    { label: 'Regulatorio / IA',     icon: 'sparkles',    color: '#6366F1' },
  litigios:       { label: 'Litigios',             icon: 'gavel',       color: '#374151' },
  internacional:  { label: 'Internacional',        icon: 'compass',     color: '#0EA5E9' },
}
