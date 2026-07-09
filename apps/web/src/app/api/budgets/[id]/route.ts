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
      const { DEMO_BUDGETS, DEMO_CLIENTS, DEMO_CASES } = await import('@/lib/dev/demo-data')
      const budget = DEMO_BUDGETS.find(b => b.id === id)
      if (!budget) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      return NextResponse.json({ budget: { ...budget, client: DEMO_CLIENTS.find(c => c.id === budget.client_id), case: DEMO_CASES.find(c => c.id === budget.case_id) } })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data, error } = await supabase.from('budgets').select('*, client:clients(*), case:cases(id,title,case_number)').eq('id', id).eq('user_id', session.user.id).single()
    if (error || !data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ budget: data })
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()
    const { id } = await params
    const body = await req.json()

    if (IS_DEV) {
      const { DEMO_BUDGETS } = await import('@/lib/dev/demo-data')
      const idx = DEMO_BUDGETS.findIndex(b => b.id === id)
      if (idx === -1) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      DEMO_BUDGETS[idx] = { ...DEMO_BUDGETS[idx], ...body, updated_at: new Date().toISOString() } as typeof DEMO_BUDGETS[0]
      return NextResponse.json({ budget: DEMO_BUDGETS[idx] })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data, error } = await supabase.from('budgets').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', session.user.id).select().single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ budget: data })
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()
    const { id } = await params

    if (IS_DEV) {
      const { DEMO_BUDGETS } = await import('@/lib/dev/demo-data')
      const idx = DEMO_BUDGETS.findIndex(b => b.id === id)
      if (idx === -1) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      DEMO_BUDGETS.splice(idx, 1)
      return NextResponse.json({ ok: true })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { error } = await supabase.from('budgets').delete().eq('id', id).eq('user_id', session.user.id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  })
}
