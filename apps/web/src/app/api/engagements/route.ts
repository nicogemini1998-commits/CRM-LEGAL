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

    if (IS_DEV) {
      const { DEMO_ENGAGEMENTS, DEMO_CLIENTS, DEMO_CASES } = await import('@/lib/dev/demo-data')
      let data = [...DEMO_ENGAGEMENTS]
      if (caseId) data = data.filter(e => e.case_id === caseId)
      if (clientId) data = data.filter(e => e.client_id === clientId)
      const enriched = data.map(e => ({
        ...e,
        client: DEMO_CLIENTS.find(c => c.id === e.client_id),
        case: DEMO_CASES.find(c => c.id === e.case_id),
      }))
      return NextResponse.json({ engagements: enriched })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    let q = supabase.from('engagements').select('*, client:clients(id,name), case:cases(id,title)').eq('user_id', session.user.id).order('created_at', { ascending: false })
    if (caseId) q = q.eq('case_id', caseId)
    if (clientId) q = q.eq('client_id', clientId)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return NextResponse.json({ engagements: data || [] })
  })
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()
    const body = await req.json()

    if (IS_DEV) {
      const { DEMO_ENGAGEMENTS } = await import('@/lib/dev/demo-data')
      const newEng = {
        id: `eng-${Date.now()}`,
        user_id: session.user.id,
        status: 'pending_sign' as const,
        signaturit_request_id: null,
        sign_url: null,
        signed_at: null,
        created_at: new Date().toISOString(),
        ...body,
      }
      DEMO_ENGAGEMENTS.push(newEng)
      return NextResponse.json({ engagement: newEng }, { status: 201 })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data, error } = await supabase.from('engagements').insert({ ...body, user_id: session.user.id, status: 'pending_sign' }).select().single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ engagement: data }, { status: 201 })
  })
}
