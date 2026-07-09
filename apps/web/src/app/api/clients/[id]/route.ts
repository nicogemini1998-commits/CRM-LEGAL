import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { withErrorHandler, UnauthorizedError, NotFoundError } from '@/lib/security/apiResponse'

const IS_DEV_WITHOUT_DB =
  process.env.NEXT_PUBLIC_DEMO_MODE === '1' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const { id } = await params

    if (IS_DEV_WITHOUT_DB) {
      const { DEMO_CLIENTS, DEMO_CASES, DEMO_DOCUMENTS } = await import('@/lib/dev/demo-data')
      const client = DEMO_CLIENTS.find(c => c.id === id)
      if (!client) throw new NotFoundError('Cliente no encontrado')

      const cases = DEMO_CASES.filter(k => k.client_id === id)
      const documents = DEMO_DOCUMENTS.filter(d => d.client_id === id)
      return NextResponse.json({ client, cases, documents })
    }

    const supabase = createServerClient()
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()
    if (error || !client) throw new NotFoundError('Cliente no encontrado')

    const { data: cases } = await supabase.from('cases').select('*').eq('client_id', id).limit(50)
    const { data: documents } = await supabase.from('documents').select('*').eq('client_id', id).limit(50)

    return NextResponse.json({ client, cases: cases || [], documents: documents || [] })
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const { id } = await params
    const body = await req.json()

    if (IS_DEV_WITHOUT_DB) {
      const { DEMO_CLIENTS } = await import('@/lib/dev/demo-data')
      const idx = DEMO_CLIENTS.findIndex(c => c.id === id)
      if (idx === -1) throw new NotFoundError('Cliente no encontrado')
      DEMO_CLIENTS[idx] = { ...DEMO_CLIENTS[idx], ...body }
      return NextResponse.json({ client: DEMO_CLIENTS[idx] })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('clients')
      .update(body)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()
    if (error || !data) throw new NotFoundError('Cliente no encontrado')
    return NextResponse.json({ client: data })
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    const { id } = await params

    if (IS_DEV_WITHOUT_DB) {
      const { DEMO_CLIENTS } = await import('@/lib/dev/demo-data')
      const idx = DEMO_CLIENTS.findIndex(c => c.id === id)
      if (idx === -1) throw new NotFoundError('Cliente no encontrado')
      DEMO_CLIENTS.splice(idx, 1)
      return NextResponse.json({ ok: true })
    }

    const supabase = createServerClient()
    const { error } = await supabase.from('clients').delete().eq('id', id).eq('user_id', session.user.id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  })
}
