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
      const { DEMO_INVOICES, DEMO_CLIENTS, DEMO_CASES } = await import('@/lib/dev/demo-data')
      const inv = DEMO_INVOICES.find(i => i.id === id)
      if (!inv) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      return NextResponse.json({ invoice: { ...inv, client: DEMO_CLIENTS.find(c => c.id === inv.client_id), case: DEMO_CASES.find(c => c.id === inv.case_id) } })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data, error } = await supabase.from('invoices').select('*, client:clients(*), case:cases(id,title,case_number)').eq('id', id).eq('user_id', session.user.id).single()
    if (error || !data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ invoice: data })
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()
    const { id } = await params
    const body = await req.json()

    if (IS_DEV) {
      const { DEMO_INVOICES } = await import('@/lib/dev/demo-data')
      const idx = DEMO_INVOICES.findIndex(i => i.id === id)
      if (idx === -1) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      DEMO_INVOICES[idx] = { ...DEMO_INVOICES[idx], ...body } as typeof DEMO_INVOICES[0]
      return NextResponse.json({ invoice: DEMO_INVOICES[idx] })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data, error } = await supabase.from('invoices').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', session.user.id).select().single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ invoice: data })
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()
    const { id } = await params

    if (IS_DEV) {
      const { DEMO_INVOICES } = await import('@/lib/dev/demo-data')
      const idx = DEMO_INVOICES.findIndex(i => i.id === id)
      if (idx === -1) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      const inv = DEMO_INVOICES[idx]
      if (inv.status !== 'draft') return NextResponse.json({ error: 'Solo se pueden eliminar facturas en borrador' }, { status: 400 })
      DEMO_INVOICES.splice(idx, 1)
      return NextResponse.json({ ok: true })
    }

    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { error } = await supabase.from('invoices').delete().eq('id', id).eq('user_id', session.user.id).eq('status', 'draft')
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  })
}
