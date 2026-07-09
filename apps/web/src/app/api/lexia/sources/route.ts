import { NextRequest, NextResponse } from 'next/server'
import { searchSpanishSources, type SearchFilters } from '@/lib/lexia/grounding'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = (searchParams.get('q') || '').trim()

  if (!query) {
    return NextResponse.json({ citations: [], query: '' })
  }

  const filters: SearchFilters = {
    scope: (searchParams.get('scope') as SearchFilters['scope']) || undefined,
    ccaa: searchParams.get('ccaa') || undefined,
    limit: Number(searchParams.get('limit')) || 5,
  }

  try {
    const citations = await searchSpanishSources(query, filters)
    return NextResponse.json({ citations, query })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error en búsqueda', citations: [] },
      { status: 500 },
    )
  }
}
