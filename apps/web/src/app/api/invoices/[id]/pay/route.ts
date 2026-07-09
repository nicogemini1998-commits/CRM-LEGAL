import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'

const IS_DEV = process.env.NEXT_PUBLIC_DEMO_MODE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params

  if (IS_DEV) {
    const { DEMO_INVOICES } = await import('@/lib/dev/demo-data')
    const idx = DEMO_INVOICES.findIndex(i => i.id === id)
    if (idx === -1) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    DEMO_INVOICES[idx] = { ...DEMO_INVOICES[idx], status: 'paid', paid_date: new Date().toISOString().slice(0, 10) }
    return NextResponse.json({ invoice: DEMO_INVOICES[idx] })
  }

  const { createServerClient } = await import('@/lib/supabase/server')
  const supabase = createServerClient()
  const { data, error } = await supabase.from('invoices').update({ status: 'paid', paid_date: new Date().toISOString().slice(0, 10) }).eq('id', id).eq('user_id', session.user.id).in('status', ['issued', 'overdue']).select().single()
  if (error || !data) return NextResponse.json({ error: 'No se pudo marcar como pagada' }, { status: 400 })
  return NextResponse.json({ invoice: data })
}
