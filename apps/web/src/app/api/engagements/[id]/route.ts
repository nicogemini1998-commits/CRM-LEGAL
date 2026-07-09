import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { withErrorHandler, UnauthorizedError } from '@/lib/security/apiResponse'

const IS_DEV = process.env.NEXT_PUBLIC_DEMO_MODE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()
    const { id } = await params

    if (IS_DEV) {
      const { DEMO_ENGAGEMENTS, DEMO_CLIENTS, DEMO_CASES, DEMO_BUDGETS } = await import('@/lib/dev/demo-data')
      const eng = DEMO_ENGAGEMENTS.find(e => e.id === id)
      if (!eng) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      return NextResponse.json({ engagement: { ...eng, client: DEMO_CLIENTS.find(c => c.id === eng.client_id), case: DEMO_CASES.find(c => c.id === eng.case_id), budget: DEMO_BUDGETS.find(b => b.id === eng.budget_id) } })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data, error } = await supabase.from('engagements').select('*, client:clients(*), case:cases(id,title), budget:budgets(id,budget_number,grand_total_cents)').eq('id', id).eq('user_id', session.user.id).single()
    if (error || !data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ engagement: data })
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()
    const { id } = await params
    const body = await req.json()

    if (IS_DEV) {
      const { DEMO_ENGAGEMENTS } = await import('@/lib/dev/demo-data')
      const idx = DEMO_ENGAGEMENTS.findIndex(e => e.id === id)
      if (idx === -1) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      DEMO_ENGAGEMENTS[idx] = { ...DEMO_ENGAGEMENTS[idx], ...body } as typeof DEMO_ENGAGEMENTS[0]
      return NextResponse.json({ engagement: DEMO_ENGAGEMENTS[idx] })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data, error } = await supabase.from('engagements').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', session.user.id).select().single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ engagement: data })
  })
}
