/**
 * Fuentes oficiales jurídicas españolas que LEXIA puede consultar.
 * Cubre nivel estatal, autonómico (17 CCAA), local y profesional.
 */

export type SourceScope = 'nacional' | 'autonomico' | 'local'

export interface SpanishLegalSource {
  id: string
  name: string
  url: string
  categories: string[]
  scope: SourceScope
  ccaa?: string
  province?: string
}

export const SPANISH_LEGAL_SOURCES: SpanishLegalSource[] = [
  // ── Nivel estatal ──────────────────────────────────────────────────────────
  { id: 'boe',                    name: 'BOE — Boletín Oficial del Estado',                  url: 'https://www.boe.es',                          categories: ['leyes', 'reales-decretos', 'sentencias'], scope: 'nacional' },
  { id: 'cendoj',                 name: 'CENDOJ — Centro de Documentación Judicial',         url: 'https://www.poderjudicial.es/search',         categories: ['sentencias-ts', 'audiencias'],            scope: 'nacional' },
  { id: 'tribunalconstitucional', name: 'Tribunal Constitucional',                           url: 'https://www.tribunalconstitucional.es',       categories: ['sentencias-tc'],                          scope: 'nacional' },
  { id: 'aepd',                   name: 'AEPD — Agencia Española Protección Datos',          url: 'https://www.aepd.es',                         categories: ['rgpd', 'resoluciones'],                   scope: 'nacional' },
  { id: 'cnmc',                   name: 'CNMC — Competencia y Mercados',                     url: 'https://www.cnmc.es',                         categories: ['competencia', 'regulacion'],              scope: 'nacional' },
  { id: 'mjusticia',              name: 'Ministerio de Justicia',                            url: 'https://www.mjusticia.gob.es',                categories: ['ministerial'],                            scope: 'nacional' },
  { id: 'cgae',                   name: 'Consejo General de la Abogacía Española',           url: 'https://www.abogacia.es',                     categories: ['colegial', 'normativa-profesional'],      scope: 'nacional' },

  // ── Nivel autonómico (17 CCAA) ─────────────────────────────────────────────
  { id: 'boja',      name: 'BOJA — Andalucía',            url: 'https://www.juntadeandalucia.es/boja',         categories: ['autonomico'], scope: 'autonomico', ccaa: 'Andalucía' },
  { id: 'boa',       name: 'BOA — Aragón',                url: 'https://boa.aragon.es',                        categories: ['autonomico'], scope: 'autonomico', ccaa: 'Aragón' },
  { id: 'bopa',      name: 'BOPA — Asturias',             url: 'https://sede.asturias.es/bopa',                categories: ['autonomico'], scope: 'autonomico', ccaa: 'Asturias' },
  { id: 'boib',      name: 'BOIB — Illes Balears',        url: 'https://www.caib.es/eboibfront',               categories: ['autonomico'], scope: 'autonomico', ccaa: 'Illes Balears' },
  { id: 'boc',       name: 'BOC — Canarias',              url: 'https://www.gobiernodecanarias.org/boc',       categories: ['autonomico'], scope: 'autonomico', ccaa: 'Canarias' },
  { id: 'bocnt',     name: 'BOC — Cantabria',             url: 'https://boc.cantabria.es',                     categories: ['autonomico'], scope: 'autonomico', ccaa: 'Cantabria' },
  { id: 'docm',      name: 'DOCM — Castilla-La Mancha',   url: 'https://docm.castillalamancha.es',             categories: ['autonomico'], scope: 'autonomico', ccaa: 'Castilla-La Mancha' },
  { id: 'bocyl',     name: 'BOCYL — Castilla y León',     url: 'https://bocyl.jcyl.es',                        categories: ['autonomico'], scope: 'autonomico', ccaa: 'Castilla y León' },
  { id: 'dogc',      name: 'DOGC — Catalunya',            url: 'https://dogc.gencat.cat',                      categories: ['autonomico'], scope: 'autonomico', ccaa: 'Catalunya' },
  { id: 'doe',       name: 'DOE — Extremadura',           url: 'https://doe.juntaex.es',                       categories: ['autonomico'], scope: 'autonomico', ccaa: 'Extremadura' },
  { id: 'dog',       name: 'DOG — Galicia',               url: 'https://www.xunta.gal/diario-oficial-galicia', categories: ['autonomico'], scope: 'autonomico', ccaa: 'Galicia' },
  { id: 'bor',       name: 'BOR — La Rioja',              url: 'https://www.larioja.org/bor',                  categories: ['autonomico'], scope: 'autonomico', ccaa: 'La Rioja' },
  { id: 'bocm',      name: 'BOCM — Comunidad de Madrid',  url: 'https://www.bocm.es',                          categories: ['autonomico'], scope: 'autonomico', ccaa: 'Madrid' },
  { id: 'borm',      name: 'BORM — Región de Murcia',     url: 'https://www.borm.es',                          categories: ['autonomico'], scope: 'autonomico', ccaa: 'Murcia' },
  { id: 'bon',       name: 'BON — Navarra',               url: 'https://bon.navarra.es',                       categories: ['autonomico'], scope: 'autonomico', ccaa: 'Navarra' },
  { id: 'bopv',      name: 'BOPV — País Vasco',           url: 'https://www.euskadi.eus/bopv',                 categories: ['autonomico'], scope: 'autonomico', ccaa: 'País Vasco' },
  { id: 'dogv',      name: 'DOGV — Comunitat Valenciana', url: 'https://dogv.gva.es',                          categories: ['autonomico'], scope: 'autonomico', ccaa: 'Valencia' },

  // ── Nivel local ────────────────────────────────────────────────────────────
  { id: 'bopm',      name: 'BOP Madrid',     url: 'https://www.bocm.es',     categories: ['local'], scope: 'local', province: 'Madrid' },
  { id: 'bopb',      name: 'BOP Barcelona',  url: 'https://bop.diba.cat',    categories: ['local'], scope: 'local', province: 'Barcelona' },
  { id: 'bopv-prov', name: 'BOP Valencia',   url: 'https://bop.dival.es',    categories: ['local'], scope: 'local', province: 'Valencia' },

  // ── Bases de datos legales profesionales ──────────────────────────────────
  { id: 'noticiasjuridicas', name: 'Noticias Jurídicas',      url: 'https://noticias.juridicas.com',        categories: ['doctrina', 'legislacion', 'jurisprudencia'], scope: 'nacional' },
  { id: 'elderecho',         name: 'El Derecho',              url: 'https://elderecho.com',                 categories: ['doctrina', 'practica', 'formularios'],       scope: 'nacional' },
  { id: 'iberley',           name: 'Iberley',                 url: 'https://www.iberley.es',                categories: ['legislacion', 'jurisprudencia', 'fiscal'],    scope: 'nacional' },
  { id: 'conceptosjur',      name: 'Conceptos Jurídicos',     url: 'https://www.conceptosjuridicos.com',    categories: ['definiciones', 'articulos'],                  scope: 'nacional' },
  { id: 'vlex',              name: 'vLex España',             url: 'https://vlex.es',                       categories: ['legislacion', 'jurisprudencia', 'doctrina'],  scope: 'nacional' },
  { id: 'fiscalimpuestos',   name: 'Fiscal-Impuestos',        url: 'https://www.fiscal-impuestos.com',      categories: ['fiscal', 'tributario', 'irpf', 'iva'],        scope: 'nacional' },
  { id: 'abogado',           name: 'Abogado.es',              url: 'https://www.abogado.es',                categories: ['practica', 'formularios', 'modelos'],         scope: 'nacional' },
  { id: 'agenciatrib',       name: 'Agencia Tributaria',      url: 'https://www.agenciatributaria.es',      categories: ['fiscal', 'tributario', 'modelos'],            scope: 'nacional' },
  { id: 'segsocial',         name: 'Seguridad Social',        url: 'https://www.seg-social.es',             categories: ['laboral', 'seguridad-social', 'prestaciones'],scope: 'nacional' },
  { id: 'sepe',              name: 'SEPE',                    url: 'https://www.sepe.es',                   categories: ['laboral', 'desempleo', 'erte'],                scope: 'nacional' },
  { id: 'registromercantil', name: 'Registro Mercantil Central',url: 'https://www.rmc.es',                 categories: ['mercantil', 'sociedades', 'publicidad'],       scope: 'nacional' },
  { id: 'catastro',          name: 'Catastro Inmobiliario',   url: 'https://www.catastro.hacienda.gob.es',  categories: ['inmobiliario', 'urbanismo'],                   scope: 'nacional' },
  { id: 'infojus',           name: 'InfoJus Argentina (ref)', url: 'https://infojus.gob.ar',                categories: ['referencia-iberoamericana'],                   scope: 'nacional' },
]

export const SOURCE_BY_ID: Record<string, SpanishLegalSource> = Object.fromEntries(
  SPANISH_LEGAL_SOURCES.map(s => [s.id, s]),
)

export function getSourcesByScope(scope: SourceScope): SpanishLegalSource[] {
  return SPANISH_LEGAL_SOURCES.filter(s => s.scope === scope)
}

export function getSourcesByCcaa(ccaa: string): SpanishLegalSource[] {
  return SPANISH_LEGAL_SOURCES.filter(s => s.ccaa === ccaa)
}
