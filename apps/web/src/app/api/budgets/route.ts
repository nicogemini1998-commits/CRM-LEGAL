import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { withErrorHandler, UnauthorizedError } from '@/lib/security/apiResponse'

const IS_DEV = process.env.NEXT_PUBLIC_DEMO_MODE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const url = new URL(req.url)
    const caseId = url.searchParams.get('case_id')
    const clientId = url.searchParams.get('client_id')
    const status = url.searchParams.get('status')

    if (IS_DEV) {
      const { DEMO_BUDGETS, DEMO_CLIENTS, DEMO_CASES } = await import('@/lib/dev/demo-data')
      let data = [...DEMO_BUDGETS]
      if (caseId) data = data.filter(b => b.case_id === caseId)
      if (clientId) data = data.filter(b => b.client_id === clientId)
      if (status) data = data.filter(b => b.status === status)
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      const enriched = data.map(b => ({
        ...b,
        client: DEMO_CLIENTS.find(c => c.id === b.client_id),
        case: DEMO_CASES.find(c => c.id === b.case_id),
      }))
      return NextResponse.json({ budgets: enriched })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    let q = supabase.from('budgets').select('*, client:clients(id,name,nif_cif), case:cases(id,title,case_number)').eq('user_id', session.user.id).order('created_at', { ascending: false })
    if (caseId) q = q.eq('case_id', caseId)
    if (clientId) q = q.eq('client_id', clientId)
    if (status) q = q.eq('status', status)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return NextResponse.json({ budgets: data || [] })
  })
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const body = await req.json()

    if (IS_DEV) {
      const { DEMO_BUDGETS } = await import('@/lib/dev/demo-data')
      const seq = DEMO_BUDGETS.length + 1
      const budgetNumber = `P-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`
      const newBudget = {
        id: `bg-${Date.now()}`,
        user_id: session.user.id,
        budget_number: budgetNumber,
        status: 'draft' as const,
        sent_at: null,
        accepted_at: null,
        created_at: new Date().toISOString(),
        ...body,
      }
      DEMO_BUDGETS.push(newBudget)
      return NextResponse.json({ budget: newBudget }, { status: 201 })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const year = new Date().getFullYear()
    const { count } = await supabase.from('budgets').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id)
    const seq = (count || 0) + 1
    const budgetNumber = `P-${year}-${String(seq).padStart(4, '0')}`
    const { data, error } = await supabase.from('budgets').insert({ ...body, user_id: session.user.id, budget_number: budgetNumber, status: 'draft' }).select().single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ budget: data }, { status: 201 })
  })
}
