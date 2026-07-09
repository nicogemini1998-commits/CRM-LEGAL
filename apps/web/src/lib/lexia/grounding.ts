import { SPANISH_LEGAL_SOURCES, type SpanishLegalSource } from './spanish-sources'
import { searchLegalSources } from './search'

export interface LegalCitation {
  title: string
  source: string
  sourceId: string
  url: string
  snippet: string
  date: string
  reference: string
}

export interface SearchFilters {
  scope?: 'nacional' | 'autonomico' | 'local'
  ccaa?: string
  categories?: string[]
  limit?: number
}

/**
 * Busca citas jurídicas en fuentes oficiales españolas en tiempo real.
 * Usa Firecrawl Search con targeting a boe.es, poderjudicial.es y fuentes profesionales.
 */
export async function searchSpanishSources(
  query: string,
  filters: SearchFilters = {},
): Promise<LegalCitation[]> {
  const limit = filters.limit ?? 5

  const ctx = await searchLegalSources(query, { limit })

  return ctx.results.map(r => ({
    title: r.title,
    source: r.source,
    sourceId: r.source.toLowerCase().replace(/\s+/g, '-'),
    url: r.url,
    snippet: r.snippet,
    date: new Date().toISOString().slice(0, 10),
    reference: r.title.slice(0, 80),
  }))
}

export function listAvailableSources(): SpanishLegalSource[] {
  return SPANISH_LEGAL_SOURCES
}
