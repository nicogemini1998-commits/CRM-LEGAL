import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { withErrorHandler, UnauthorizedError } from '@/lib/security/apiResponse'

const IS_DEV = process.env.NEXT_PUBLIC_DEMO_MODE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    if (IS_DEV) {
      const { DEMO_FEE_SCHEDULES } = await import('@/lib/dev/demo-data')
      const url = new URL(req.url)
      const area = url.searchParams.get('area')
      const data = area ? DEMO_FEE_SCHEDULES.filter(f => f.case_area === area && f.active) : DEMO_FEE_SCHEDULES.filter(f => f.active)
      return NextResponse.json({ fee_schedules: data })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data, error } = await supabase.from('fee_schedules').select('*').eq('user_id', session.user.id).eq('active', true).order('case_area').order('label')
    if (error) throw new Error(error.message)
    return NextResponse.json({ fee_schedules: data || [] })
  })
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const body = await req.json()

    if (IS_DEV) {
      const { DEMO_FEE_SCHEDULES } = await import('@/lib/dev/demo-data')
      const newFs = { id: `fs-${Date.now()}`, user_id: session.user.id, ...body, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      DEMO_FEE_SCHEDULES.push(newFs)
      return NextResponse.json({ fee_schedule: newFs }, { status: 201 })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data, error } = await supabase.from('fee_schedules').insert({ ...body, user_id: session.user.id }).select().single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ fee_schedule: data }, { status: 201 })
  })
}
