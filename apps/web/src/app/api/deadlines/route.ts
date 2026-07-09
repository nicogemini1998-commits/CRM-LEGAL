import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { withErrorHandler, UnauthorizedError } from '@/lib/security/apiResponse'

const IS_DEV_WITHOUT_DB =
  process.env.NEXT_PUBLIC_DEMO_MODE === '1' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

/**
 * GET /api/deadlines?status=pending&days=7
 * Devuelve plazos del usuario ordenados por deadline_date asc.
 * Soporta filtros:
 *   - status: 'pending' | 'completed' | 'expired'
 *   - days:   ventana en días desde hoy (incluye también plazos ya vencidos)
 */
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const url = new URL(req.url)
    const statusParam = url.searchParams.get('status')
    const daysParam = url.searchParams.get('days')

    if (IS_DEV_WITHOUT_DB) {
      const { DEMO_DEADLINES } = await import('@/lib/dev/demo-data')
      const now = Date.now()

      const enriched = DEMO_DEADLINES.map(d => {
        const ts = new Date(d.deadline_date).getTime()
        const isExpired = d.status === 'pending' && ts < now
        return {
          ...d,
          status: isExpired ? ('expired' as const) : d.status,
          days_left: Math.ceil((ts - now) / 86400000),
        }
      })

      let filtered = enriched
      if (statusParam) {
        filtered = filtered.filter(d => d.status === statusParam)
      }
      if (daysParam) {
        const maxDays = Number(daysParam)
        if (Number.isFinite(maxDays)) {
          filtered = filtered.filter(d => d.days_left <= maxDays)
        }
      }

      filtered.sort((a, b) =>
        new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime()
      )

      return NextResponse.json({ deadlines: filtered })
    }

    const supabase = createServerClient()
    let q = supabase
      .from('deadlines')
      .select('*')
      .eq('user_id', session.user.id)
      .order('deadline_date', { ascending: true })
      .limit(200)

    if (statusParam) q = q.eq('status', statusParam)
    const { data, error } = await q
    if (error) throw new Error(error.message)

    return NextResponse.json({ deadlines: data || [] })
  })
}
