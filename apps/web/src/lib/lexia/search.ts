/**
 * Motor de búsqueda jurídica en tiempo real para LEXIA
 * Fuentes: BOE, CENDOJ, TC, AEPD + 30 bases legales españolas
 * Motor: Firecrawl Search API con targeting por dominio
 */

export interface LegalSearchResult {
  title: string
  url: string
  snippet: string
  source: string
}

export interface SearchContext {
  results: LegalSearchResult[]
  query: string
  sourcesSearched: string[]
  durationMs: number
}

// Cache en memoria — TTL 30 minutos
const cache = new Map<string, { data: SearchContext; expiresAt: number }>()
const CACHE_TTL = 30 * 60 * 1000

// Triggers que activan búsqueda automática
const LEGAL_TRIGGERS = [
  /art[íi]culo?\s+\d+/i,
  /\b(ley|real decreto|decreto.ley|orden ministerial)\b/i,
  /\b(sts|stc|stsj|sap)\s+\d+/i,
  /\b(plazo|caducidad|prescripci[oó]n|recurso|demanda|contrato|arrendamiento|despido|herencia|divorcio|sancion)\b/i,
  /\b(c[oó]digo civil|estatuto|lec|lecrim|lau|lsc|trlc|rgpd|lgss|irpf|iva)\b/i,
]

export function shouldSearch(message: string): boolean {
  return LEGAL_TRIGGERS.some(re => re.test(message)) || message.length > 100
}

function buildQuery(message: string): string {
  const terms = message
    .replace(/[¿?¡!]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 4)
    .slice(0, 7)
    .join(' ')
  return `${terms} derecho español site:boe.es OR site:poderjudicial.es OR site:noticiasjuridicas.com OR site:elderecho.com OR site:iberley.es`
}

function detectSource(url: string): string {
  if (url.includes('boe.es')) return 'BOE'
  if (url.includes('poderjudicial.es')) return 'CENDOJ'
  if (url.includes('tribunalconstitucional.es')) return 'TC'
  if (url.includes('aepd.es')) return 'AEPD'
  if (url.includes('noticiasjuridicas.com')) return 'Noticias Jurídicas'
  if (url.includes('elderecho.com')) return 'El Derecho'
  if (url.includes('iberley.es')) return 'Iberley'
  if (url.includes('mjusticia.gob.es')) return 'Min. Justicia'
  if (url.includes('agenciatributaria.es')) return 'Agencia Tributaria'
  if (url.includes('seg-social.es')) return 'Seguridad Social'
  if (url.includes('sepe.es')) return 'SEPE'
  if (url.includes('cnmc.es')) return 'CNMC'
  if (url.includes('conceptosjuridicos.com')) return 'Conceptos Jurídicos'
  try { return new URL(url).hostname.replace('www.', '') } catch { return 'Web' }
}

export async function searchLegalSources(
  userMessage: string,
  options: { limit?: number; timeout?: number } = {}
): Promise<SearchContext> {
  const { limit = 5, timeout = 4000 } = options
  const start = Date.now()
  const apiKey = process.env.FIRECRAWL_API_KEY

  if (!apiKey) return { results: [], query: userMessage, sourcesSearched: [], durationMs: 0 }

  const query = buildQuery(userMessage)
  const cacheKey = query.slice(0, 120)
  const cached = cache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) return { ...cached.data, durationMs: Date.now() - start }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    const res = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`Firecrawl ${res.status}`)

    const data = await res.json() as { data?: Array<{ title?: string; url?: string; description?: string }> }
    const results: LegalSearchResult[] = (data.data ?? []).map(r => ({
      title: r.title ?? '',
      url: r.url ?? '',
      snippet: (r.description ?? '').slice(0, 350),
      source: r.url ? detectSource(r.url) : 'Web',
    }))

    const ctx: SearchContext = { results, query, sourcesSearched: [...new Set(results.map(r => r.source))], durationMs: Date.now() - start }
    cache.set(cacheKey, { data: ctx, expiresAt: Date.now() + CACHE_TTL })
    return ctx
  } catch {
    return { results: [], query, sourcesSearched: [], durationMs: Date.now() - start }
  }
}

export function formatForClaude(ctx: SearchContext): string {
  if (ctx.results.length === 0) return ''
  const lines = [
    '## BÚSQUEDA EN TIEMPO REAL — FUENTES LEGALES OFICIALES',
    `Fuentes consultadas: ${ctx.sourcesSearched.join(', ')} · ${ctx.durationMs}ms`,
    '',
  ]
  ctx.results.forEach((r, i) => {
    lines.push(`[${i + 1}] ${r.source} — ${r.title}`)
    lines.push(`URL: ${r.url}`)
    if (r.snippet) lines.push(`Contenido: ${r.snippet}`)
    lines.push('')
  })
  lines.push('INSTRUCCIÓN CRÍTICA: Usa estos resultados como contexto actualizado. Cita siempre el URL entre paréntesis cuando uses información de aquí. Si una fuente oficial reciente contradice tu base de conocimiento, prioriza la fuente oficial.')
  return lines.join('\n')
}
